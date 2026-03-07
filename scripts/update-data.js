const fs = require('fs');
const path = require('path');

// 读取文件
const downloadPath = path.join(__dirname, '../public/api/rankings/download.json');
const newsPath = path.join(__dirname, '../public/api/news.json');

const downloads = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

// 更新downloads数据
const updatedDownloads = downloads.map(app => {
  const randomDownload = Math.floor(Math.random() * 1500) + 500; // 500-2000
  const randomTrend = Math.floor(Math.random() * 51) - 10; // -10 to 40
  return {
    ...app,
    downloads: app.downloads + randomDownload,
    trend: randomTrend
  };
});

// 获取当前日期
const today = new Date().toISOString().split('T')[0];

// 最新AI资讯（基于机器之心等来源）
const newArticles = [
  {
    "id": Date.now(),
    "title": "Anthropic收购视觉AI创企Vercept，强化多模态能力",
    "summary": "Anthropic宣布收购视觉AI创业公司Vercept，旨在增强Claude模型的视觉理解和多模态交互能力，进一步与OpenAI和Google竞争。",
    "category": "AI产业",
    "source": "机器之心",
    "date": today,
    "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800",
    "url": "https://www.jiqizhixin.com/articles/anthropic-vercept-acquisition"
  },
  {
    "id": Date.now() + 1,
    "title": "谷歌Gemini大模型升级至3.1 Pro版本，性能大幅提升",
    "summary": "Google DeepMind发布Gemini 3.1 Pro版本，在推理能力、代码生成和多语言支持方面实现显著提升，上下文窗口扩展至200万token。",
    "category": "AI模型",
    "source": "机器之心",
    "date": today,
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    "url": "https://www.jiqizhixin.com/articles/gemini-3-1-pro-release"
  }
];

// 添加新文章到开头
const allNews = [...newArticles, ...news];

// 根据URL去重，保留最新的
const seenUrls = new Set();
const uniqueNews = allNews.filter(article => {
  if (seenUrls.has(article.url)) {
    return false;
  }
  seenUrls.add(article.url);
  return true;
});

// 过滤掉两天前的文章，只保留两天内的
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
twoDaysAgo.setHours(0, 0, 0, 0);

const updatedNews = uniqueNews.filter(article => {
  const articleDate = new Date(article.date);
  return articleDate >= twoDaysAgo;
});

// 保存更新后的文件
fs.writeFileSync(downloadPath, JSON.stringify(updatedDownloads, null, 2));
fs.writeFileSync(newsPath, JSON.stringify(updatedNews, null, 2));

// 输出更新摘要
console.log('=== 更新摘要 ===');
console.log('\n1. Download数据更新:');
updatedDownloads.forEach(app => {
  const oldApp = downloads.find(a => a.name === app.name);
  const downloadDiff = app.downloads - oldApp.downloads;
  console.log(`   - ${app.name}: downloads +${downloadDiff} (trend: ${app.trend})`);
});

console.log('\n2. News数据更新:');
console.log('   - 新增文章:');
newArticles.forEach(article => {
  console.log(`     * ${article.title}`);
});
const removedCount = uniqueNews.length - updatedNews.length;
const duplicateCount = allNews.length - uniqueNews.length;
if (duplicateCount > 0) {
  console.log(`   - 删除重复文章: ${duplicateCount} 条`);
}
if (removedCount > 0) {
  console.log(`   - 删除两天前文章: ${removedCount} 条`);
}
console.log(`   - 当前文章总数: ${updatedNews.length} (仅保留两天内)`);

console.log('\n✅ 数据更新完成!');
