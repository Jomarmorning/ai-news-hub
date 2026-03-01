/**
 * AI Hub - 数据服务
 * 负责数据获取、存储和更新
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const redisService = require('./redisService');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'aiData.json');

// 默认数据 - 当抓取失败时使用
const DEFAULT_DATA = {
    downloadRankings: [
        {
            name: 'ChatGPT',
            description: 'OpenAI开发的AI聊天助手',
            category: 'AI对话',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
            downloads: 5200000,
            trend: 15
        },
        {
            name: 'Midjourney',
            description: 'AI图像生成工具',
            category: 'AI绘画',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg',
            downloads: 3800000,
            trend: 8
        },
        {
            name: 'Claude',
            description: 'Anthropic AI助手',
            category: 'AI对话',
            icon: 'https://www.anthropic.com/images/icons/apple-touch-icon.png',
            downloads: 3200000,
            trend: 25
        },
        {
            name: 'Runway',
            description: 'AI视频生成与编辑',
            category: 'AI视频',
            icon: 'https://runwayml.com/favicon.ico',
            downloads: 2800000,
            trend: 12
        },
        {
            name: 'Jasper',
            description: 'AI写作助手',
            category: 'AI写作',
            icon: 'https://www.jasper.ai/favicon.ico',
            downloads: 2400000,
            trend: -3
        },
        {
            name: 'Synthesia',
            description: 'AI视频生成平台',
            category: 'AI视频',
            icon: 'https://www.synthesia.io/favicon.ico',
            downloads: 2100000,
            trend: 18
        },
        {
            name: 'Copy.ai',
            description: '营销文案AI工具',
            category: 'AI写作',
            icon: 'https://www.copy.ai/favicon.ico',
            downloads: 1900000,
            trend: 5
        },
        {
            name: 'Notion AI',
            description: '智能笔记与协作',
            category: '生产力',
            icon: 'https://www.notion.so/images/favicon.ico',
            downloads: 1750000,
            trend: 22
        },
        {
            name: 'Grammarly',
            description: 'AI写作辅助工具',
            category: 'AI写作',
            icon: 'https://www.grammarly.com/favicon.ico',
            downloads: 1600000,
            trend: -5
        },
        {
            name: 'DALL-E 3',
            description: 'OpenAI图像生成',
            category: 'AI绘画',
            icon: 'https://openai.com/favicon.ico',
            downloads: 1450000,
            trend: 30
        }
    ],
    revenueRankings: [
        {
            name: 'ChatGPT Plus',
            category: 'AI对话',
            revenue: '$180M',
            arpu: '$20',
            conversion: '5.2%',
            growth: '+28%',
            subscribers: '9M+'
        },
        {
            name: 'Midjourney Pro',
            category: 'AI绘画',
            revenue: '$85M',
            arpu: '$30',
            conversion: '8.5%',
            growth: '+15%',
            subscribers: '2.8M'
        },
        {
            name: 'Jasper',
            category: 'AI写作',
            revenue: '$42M',
            arpu: '$49',
            conversion: '12%',
            growth: '+8%',
            subscribers: '850K'
        },
        {
            name: 'Grammarly Premium',
            category: 'AI写作',
            revenue: '$38M',
            arpu: '$12',
            conversion: '3.8%',
            growth: '+5%',
            subscribers: '3.2M'
        },
        {
            name: 'Runway',
            category: 'AI视频',
            revenue: '$32M',
            arpu: '$35',
            conversion: '6.2%',
            growth: '+45%',
            subscribers: '900K'
        },
        {
            name: 'Claude Pro',
            category: 'AI对话',
            revenue: '$28M',
            arpu: '$20',
            conversion: '4.5%',
            growth: '+55%',
            subscribers: '1.4M'
        }
    ],
    news: [
        {
            title: 'OpenAI发布GPT-5预览版，推理能力大幅提升',
            excerpt: 'OpenAI今日发布了GPT-5的预览版本，新模型在逻辑推理、代码生成和多模态理解方面均有显著改进。据内部测试，数学推理准确率提升了40%。',
            url: 'https://openai.com/blog',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            source: 'OpenAI Blog',
            sourceIcon: 'https://openai.com/favicon.ico',
            tag: '大模型',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            title: 'Google Gemini 2.0支持实时视频理解',
            excerpt: 'Google DeepMind宣布Gemini 2.0将支持实时视频流分析，可同时进行视觉理解和自然语言交互，为AR/VR应用开辟新可能。',
            url: 'https://deepmind.google/',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
            source: 'DeepMind',
            sourceIcon: 'https://deepmind.google/favicon.ico',
            tag: '多模态',
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
            title: 'Midjourney V7发布：图像生成质量再创新高',
            excerpt: 'Midjourney发布V7版本，引入新的神经网络架构，生成图像的细节表现力和文本理解能力大幅提升，同时支持更复杂的风格控制。',
            url: 'https://www.midjourney.com/',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            source: 'Midjourney',
            sourceIcon: 'https://www.midjourney.com/favicon.ico',
            tag: 'AI绘画',
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
            title: 'Anthropic发布Claude 4，支持100万token上下文',
            excerpt: 'Claude 4系列模型正式发布，最大上下文窗口扩展至100万token，可一次性处理整本书籍或大型代码库，企业级应用能力显著增强。',
            url: 'https://www.anthropic.com/news',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
            source: 'Anthropic',
            sourceIcon: 'https://www.anthropic.com/favicon.ico',
            tag: '大模型',
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        },
        {
            title: 'Meta开源Llama 4：最强开源大模型',
            excerpt: 'Meta发布Llama 4系列，包含8B、70B和405B三个版本。其中405B版本在多项基准测试中超越GPT-4，且完全开源可商用。',
            url: 'https://ai.meta.com/',
            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
            source: 'Meta AI',
            sourceIcon: 'https://ai.meta.com/favicon.ico',
            tag: '开源模型',
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
            title: 'Sora正式开放：OpenAI视频生成工具上线',
            excerpt: '经过数月测试，OpenAI的Sora视频生成模型正式向公众开放。支持最长60秒1080p视频生成，月付20美元起。',
            url: 'https://openai.com/sora',
            image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800',
            source: 'OpenAI',
            sourceIcon: 'https://openai.com/favicon.ico',
            tag: 'AI视频',
            publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
        }
    ],
    newAppsRankings: [
        {
            name: 'Kimi K2',
            description: 'Moonshot最新多模态AI助手',
            category: 'AI对话',
            icon: 'https://kimi.moonshot.cn/favicon.ico',
            downloads: 1250000,
            trend: 156,
            releasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Pika 2.0',
            description: '新一代AI视频生成工具',
            category: 'AI视频',
            icon: 'https://pika.art/favicon.ico',
            downloads: 980000,
            trend: 89,
            releasedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Ideogram 2.0',
            description: '文本渲染增强的AI绘画工具',
            category: 'AI绘画',
            icon: 'https://ideogram.ai/favicon.ico',
            downloads: 850000,
            trend: 67,
            releasedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'AutoGen Studio',
            description: '微软多智能体协作平台',
            category: '开发工具',
            icon: 'https://microsoft.github.io/autogen/favicon.ico',
            downloads: 720000,
            trend: 45,
            releasedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'HeyGen Avatar',
            description: 'AI数字人视频生成',
            category: 'AI视频',
            icon: 'https://www.heygen.com/favicon.ico',
            downloads: 680000,
            trend: 78,
            releasedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Stable Audio 2.0',
            description: 'Stability AI音乐生成工具',
            category: 'AI音频',
            icon: 'https://www.stableaudio.com/favicon.ico',
            downloads: 540000,
            trend: 34,
            releasedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Luma Dream Machine',
            description: '高质量AI视频生成',
            category: 'AI视频',
            icon: 'https://lumalabs.ai/favicon.ico',
            downloads: 490000,
            trend: 92,
            releasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Cohere Command R+',
            description: '企业级RAG增强模型',
            category: 'AI对话',
            icon: 'https://cohere.com/favicon.ico',
            downloads: 420000,
            trend: 28,
            releasedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Udio Beta',
            description: 'AI音乐创作平台',
            category: 'AI音频',
            icon: 'https://www.udio.com/favicon.ico',
            downloads: 380000,
            trend: 56,
            releasedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        },
        {
            name: 'Perplexity Pro',
            description: 'AI搜索引擎高级版',
            category: 'AI搜索',
            icon: 'https://www.perplexity.ai/favicon.ico',
            downloads: 350000,
            trend: 41,
            releasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isNew: true
        }
    ],
    lastUpdate: new Date().toISOString()
};

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('创建数据目录失败:', error);
    }
}

// 读取数据（优先从Redis，其次本地文件）
async function readLocalData() {
    // 首先尝试从Redis读取
    const redisData = await redisService.readFromRedis();
    if (redisData) {
        console.log('从Redis读取数据成功');
        return redisData;
    }

    // 尝试从本地文件读取
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // 文件不存在或读取失败，返回默认数据
        return DEFAULT_DATA;
    }
}

// 保存数据（同时保存到Redis和本地文件）
async function saveLocalData(data) {
    // 保存到Redis（如果配置了）
    await redisService.saveToRedis(data);

    // 保存到本地文件
    try {
        await ensureDataDir();
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('保存数据到文件失败:', error);
    }
}

// 抓取AI应用排名数据
async function fetchDownloadRankings() {
    // 这里可以实现真实的抓取逻辑
    // 目前使用模拟数据并添加随机波动
    const baseData = DEFAULT_DATA.downloadRankings;

    return baseData.map(app => ({
        ...app,
        downloads: app.downloads + Math.floor(Math.random() * 100000 - 50000),
        trend: app.trend + Math.floor(Math.random() * 6 - 3)
    })).sort((a, b) => b.downloads - a.downloads);
}

// 抓取盈利排名数据
async function fetchRevenueRankings() {
    const baseData = DEFAULT_DATA.revenueRankings;

    return baseData.map(app => ({
        ...app,
        growth: app.growth // 保持原有增长率
    }));
}

// 抓取热点资讯
async function fetchNews() {
    const newsSources = [
        {
            name: '机器之心',
            url: 'https://www.jiqizhixin.com/',
            selector: '.article-item'
        },
        {
            name: '量子位',
            url: 'https://www.qbitai.com/',
            selector: '.article-card'
        }
    ];

    const allNews = [];

    // 尝试从多个源抓取
    for (const source of newsSources) {
        try {
            const response = await axios.get(source.url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            // 这里可以实现具体的抓取逻辑
            // 由于网站结构可能变化，这里使用默认数据

        } catch (error) {
            console.log(`抓取 ${source.name} 失败:`, error.message);
        }
    }

    // 返回默认数据（实际项目中可以替换为抓取的数据）
    return DEFAULT_DATA.news.map(news => ({
        ...news,
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));
}

// 抓取新发行AI应用排名
async function fetchNewAppsRankings() {
    const baseData = DEFAULT_DATA.newAppsRankings;

    return baseData.map(app => ({
        ...app,
        downloads: app.downloads + Math.floor(Math.random() * 50000 - 25000),
        trend: app.trend + Math.floor(Math.random() * 10 - 5)
    })).sort((a, b) => b.downloads - a.downloads);
}

// 获取下载排名
async function getDownloadRankings() {
    const data = await readLocalData();
    return data.downloadRankings || DEFAULT_DATA.downloadRankings;
}

// 获取盈利排名
async function getRevenueRankings() {
    const data = await readLocalData();
    return data.revenueRankings || DEFAULT_DATA.revenueRankings;
}

// 获取热点资讯
async function getNews() {
    const data = await readLocalData();
    return data.news || DEFAULT_DATA.news;
}

// 获取新发行AI应用排名
async function getNewAppsRankings() {
    const data = await readLocalData();
    return data.newAppsRankings || DEFAULT_DATA.newAppsRankings;
}

// 刷新所有数据
async function refreshAllData() {
    console.log('[' + new Date().toISOString() + '] 开始刷新数据...');

    try {
        const [downloadRankings, revenueRankings, news, newAppsRankings] = await Promise.all([
            fetchDownloadRankings(),
            fetchRevenueRankings(),
            fetchNews(),
            fetchNewAppsRankings()
        ]);

        const newData = {
            downloadRankings,
            revenueRankings,
            news,
            newAppsRankings,
            lastUpdate: new Date().toISOString()
        };

        await saveLocalData(newData);
        console.log('[' + new Date().toISOString() + '] 数据刷新完成');

        return newData;
    } catch (error) {
        console.error('刷新数据失败:', error);
        // 如果刷新失败，确保有默认数据可用
        await saveLocalData(DEFAULT_DATA);
        return DEFAULT_DATA;
    }
}

module.exports = {
    getDownloadRankings,
    getRevenueRankings,
    getNews,
    getNewAppsRankings,
    refreshAllData
};
