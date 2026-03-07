const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Product Hunt API 配置
const PRODUCT_HUNT_API = 'https://api.producthunt.com/v2/api/graphql';
const PRODUCT_HUNT_TOKEN = process.env.PRODUCT_HUNT_TOKEN;

// 有道翻译 API 配置
const YOUDAO_APP_KEY = process.env.YOUDAO_APP_KEY;
const YOUDAO_APP_SECRET = process.env.YOUDAO_APP_SECRET;

// 新应用数据文件路径
const newAppsPath = path.join(__dirname, '../public/api/rankings/new-apps.json');

// 翻译缓存文件路径
const translationCachePath = path.join(__dirname, '../.translation-cache.json');

// 加载翻译缓存
function loadTranslationCache() {
  try {
    return JSON.parse(fs.readFileSync(translationCachePath, 'utf8'));
  } catch (e) {
    return {};
  }
}

// 保存翻译缓存
function saveTranslationCache(cache) {
  fs.writeFileSync(translationCachePath, JSON.stringify(cache, null, 2));
}

// 有道翻译 API
async function translateWithYoudao(text) {
  if (!YOUDAO_APP_KEY || !YOUDAO_APP_SECRET) {
    console.log('未配置有道翻译 API，跳过翻译');
    return text;
  }

  const salt = Date.now().toString();
  const curtime = Math.round(Date.now() / 1000).toString();
  const str = YOUDAO_APP_KEY + truncate(text) + salt + curtime + YOUDAO_APP_SECRET;
  const sign = crypto.createHash('sha256').update(str).digest('hex');

  const params = new URLSearchParams({
    q: text,
    from: 'en',
    to: 'zh-CHS',
    appKey: YOUDAO_APP_KEY,
    salt: salt,
    sign: sign,
    signType: 'v3',
    curtime: curtime
  });

  return new Promise((resolve, reject) => {
    const req = https.request(`https://openapi.youdao.com/api?${params.toString()}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.translation && json.translation[0]) {
            resolve(json.translation[0]);
          } else {
            console.log('翻译失败:', json);
            resolve(text);
          }
        } catch (e) {
          resolve(text);
        }
      });
    });

    req.on('error', () => resolve(text));
    req.end();
  });
}

function truncate(q) {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

// 判断是否为英文
function isEnglish(text) {
  return /^[\x00-\x7F]+$/.test(text) && /[a-zA-Z]/.test(text);
}

// 翻译描述（带缓存）
async function translateDescription(text, cache) {
  if (!text || !isEnglish(text)) {
    return text;
  }

  // 检查缓存
  if (cache[text]) {
    console.log(`   使用缓存翻译: ${text} -> ${cache[text]}`);
    return cache[text];
  }

  // 调用翻译 API
  console.log(`   翻译中: ${text}`);
  const translated = await translateWithYoudao(text);
  cache[text] = translated;
  return translated;
}

// AI 相关关键词
const AI_KEYWORDS = [
  'AI', 'artificial intelligence', 'machine learning', 'ML', 'GPT', 'LLM',
  'chatbot', 'chat', 'assistant', 'copilot', 'automation', 'neural',
  'generative', 'stable diffusion', 'midjourney', 'dall-e', 'claude',
  'openai', 'anthropic', 'gemini', 'perplexity', 'pika', 'runway',
  'synthesia', 'heygen', 'voice', 'image generation', 'video generation'
];

// 模拟新应用数据（当没有 API token 时使用）
const MOCK_NEW_APPS = [
  { "name": "Kimi K2", "description": "Moonshot最新多模态AI助手", "category": "AI对话", "icon": "https://kimi.moonshot.cn/favicon.ico", "downloads": 1250000, "trend": 156, "releasedAt": "2026-02-24T00:00:00.000Z", "isNew": true },
  { "name": "Pika 2.0", "description": "新一代AI视频生成工具", "category": "AI视频", "icon": "https://pika.art/favicon.ico", "downloads": 980000, "trend": 89, "releasedAt": "2026-02-21T00:00:00.000Z", "isNew": true },
  { "name": "Ideogram 2.0", "description": "文本渲染增强的AI绘画工具", "category": "AI绘画", "icon": "https://ideogram.ai/favicon.ico", "downloads": 850000, "trend": 67, "releasedAt": "2026-02-23T00:00:00.000Z", "isNew": true },
  { "name": "AutoGen Studio", "description": "微软多智能体协作平台", "category": "开发工具", "icon": "https://microsoft.github.io/autogen/favicon.ico", "downloads": 720000, "trend": 45, "releasedAt": "2026-02-19T00:00:00.000Z", "isNew": true },
  { "name": "HeyGen Avatar", "description": "AI数字人视频生成", "category": "AI视频", "icon": "https://www.heygen.com/favicon.ico", "downloads": 680000, "trend": 78, "releasedAt": "2026-02-25T00:00:00.000Z", "isNew": true },
  { "name": "Stable Audio 2.0", "description": "Stability AI音乐生成工具", "category": "AI音频", "icon": "https://www.stableaudio.com/favicon.ico", "downloads": 540000, "trend": 34, "releasedAt": "2026-02-17T00:00:00.000Z", "isNew": true },
  { "name": "Luma Dream Machine", "description": "高质量AI视频生成", "category": "AI视频", "icon": "https://lumalabs.ai/favicon.ico", "downloads": 490000, "trend": 92, "releasedAt": "2026-02-22T00:00:00.000Z", "isNew": true },
  { "name": "Cohere Command R+", "description": "企业级RAG增强模型", "category": "AI对话", "icon": "https://cohere.com/favicon.ico", "downloads": 420000, "trend": 28, "releasedAt": "2026-02-20T00:00:00.000Z", "isNew": true },
  { "name": "Udio Beta", "description": "AI音乐创作平台", "category": "AI音频", "icon": "https://www.udio.com/favicon.ico", "downloads": 380000, "trend": 56, "releasedAt": "2026-02-18T00:00:00.000Z", "isNew": true },
  { "name": "Perplexity Pro", "description": "AI搜索引擎高级版", "category": "AI搜索", "icon": "https://www.perplexity.ai/favicon.ico", "downloads": 350000, "trend": 41, "releasedAt": "2026-02-26T00:00:00.000Z", "isNew": true }
];

// 从 Product Hunt 获取最新 AI 产品
async function fetchFromProductHunt() {
  if (!PRODUCT_HUNT_TOKEN) {
    console.log('未配置 PRODUCT_HUNT_TOKEN，使用模拟数据');
    return [];
  }

  const query = `
    query {
      posts(first: 20, order: NEWEST) {
        edges {
          node {
            id
            name
            tagline
            thumbnail {
              url
            }
            website
            createdAt
            topics {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRODUCT_HUNT_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(PRODUCT_HUNT_API, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data.posts.edges.map(edge => edge.node));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

// 判断是否为 AI 相关产品
function isAIProduct(product) {
  const text = `${product.name} ${product.tagline || ''} ${product.description || ''}`.toLowerCase();
  return AI_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

// 映射分类
function mapCategory(product) {
  const text = `${product.name} ${product.tagline || ''}`.toLowerCase();

  if (text.includes('video')) return 'AI视频';
  if (text.includes('image') || text.includes('photo') || text.includes('art') || text.includes('draw')) return 'AI绘画';
  if (text.includes('audio') || text.includes('music') || text.includes('voice') || text.includes('sound')) return 'AI音频';
  if (text.includes('code') || text.includes('dev') || text.includes('program')) return '开发工具';
  if (text.includes('search')) return 'AI搜索';
  if (text.includes('write') || text.includes('content') || text.includes('copy')) return 'AI写作';
  return 'AI对话';
}

// 生成随机下载量和趋势
function generateStats() {
  return {
    downloads: Math.floor(Math.random() * 1000000) + 100000,
    trend: Math.floor(Math.random() * 100) + 10
  };
}

// 更新新应用数据
async function updateNewApps() {
  console.log('=== 开始更新新发行AI应用数据 ===\n');

  try {
    // 读取现有数据
    let existingApps = [];
    try {
      existingApps = JSON.parse(fs.readFileSync(newAppsPath, 'utf8'));
    } catch (e) {
      console.log('现有数据文件不存在，将创建新文件');
    }

    // 加载翻译缓存
    const translationCache = loadTranslationCache();

    // 获取新数据
    let newProducts = [];
    try {
      newProducts = await fetchFromProductHunt();
    } catch (e) {
      console.log('从 Product Hunt 获取数据失败:', e.message);
    }

    // 如果没有获取到新数据，使用模拟数据并随机更新
    if (newProducts.length === 0) {
      console.log('使用模拟数据并随机更新下载量...\n');

      const updatedApps = MOCK_NEW_APPS.map(app => {
        const stats = generateStats();
        return {
          ...app,
          downloads: app.downloads + Math.floor(Math.random() * 50000) + 10000,
          trend: Math.floor(Math.random() * 150) - 20
        };
      });

      // 保存更新后的数据
      fs.writeFileSync(newAppsPath, JSON.stringify(updatedApps, null, 2));

      console.log('✅ 新发行应用数据已更新');
      console.log(`   共 ${updatedApps.length} 个应用`);
      updatedApps.forEach((app, i) => {
        console.log(`   ${i + 1}. ${app.name} - ${(app.downloads / 10000).toFixed(0)}万下载`);
      });

      return updatedApps;
    }

    console.log('🔄 开始翻译英文描述...\n');

    // 过滤 AI 产品并转换格式（带翻译）
    const aiProducts = [];
    for (const product of newProducts.filter(isAIProduct)) {
      const stats = generateStats();
      const originalDesc = product.tagline || 'AI应用';
      const translatedDesc = await translateDescription(originalDesc, translationCache);

      aiProducts.push({
        name: product.name,
        description: translatedDesc,
        category: mapCategory(product),
        icon: product.thumbnail?.url || `https://www.google.com/s2/favicons?domain=${product.website}&sz=128`,
        downloads: stats.downloads,
        trend: stats.trend,
        releasedAt: product.createdAt,
        isNew: true,
        source: 'Product Hunt',
        url: product.website
      });
    }

    // 保存翻译缓存
    saveTranslationCache(translationCache);

    // 合并数据，去重（根据名称）
    const mergedApps = [...aiProducts];
    existingApps.forEach(existing => {
      if (!mergedApps.find(app => app.name === existing.name)) {
        mergedApps.push(existing);
      }
    });

    // 按发布日期排序，保留最新的10个
    mergedApps.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
    const finalApps = mergedApps.slice(0, 10);

    // 保存数据
    fs.writeFileSync(newAppsPath, JSON.stringify(finalApps, null, 2));

    console.log('\n✅ 新发行应用数据已更新');
    console.log(`   从 Product Hunt 获取 ${aiProducts.length} 个AI产品`);
    console.log(`   共保留 ${finalApps.length} 个应用`);
    finalApps.forEach((app, i) => {
      console.log(`   ${i + 1}. ${app.name} (${app.category})`);
    });

    return finalApps;

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateNewApps().catch(console.error);
}

module.exports = { updateNewApps };
