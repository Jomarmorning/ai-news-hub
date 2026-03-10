const fs = require('fs');
const path = require('path');

// 读取现有数据
const downloadPath = path.join(__dirname, 'public/api/rankings/download.json');
const newsPath = path.join(__dirname, 'public/api/news.json');

const downloadData = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

// 记录更新摘要
const updateSummary = {
  downloads: [],
  news: {
    added: [],
    removed: []
  }
};

// 1. 更新download数据：每个应用downloads增加随机值(500-2000)，trend更新为随机值(-10到40)
console.log('=== 更新下载数据 ===');
downloadData.forEach(app => {
  const oldDownloads = app.downloads;
  const oldTrend = app.trend;

  // 增加随机下载量 (500-2000)
  const downloadIncrease = Math.floor(Math.random() * 1500) + 500;
  app.downloads += downloadIncrease;

  // 更新trend为随机值 (-10到40)
  app.trend = Math.floor(Math.random() * 51) - 10;

  updateSummary.downloads.push({
    name: app.name,
    downloads: { old: oldDownloads, new: app.downloads, increase: downloadIncrease },
    trend: { old: oldTrend, new: app.trend }
  });

  console.log(`${app.name}: downloads ${oldDownloads} -> ${app.downloads} (+${downloadIncrease}), trend ${oldTrend} -> ${app.trend}`);
});

// 2. 添加新新闻
console.log('\n=== 更新新闻数据 ===');

// 基于最新AI新闻 (2026-03-10)
const newArticles = [
  {
    id: Date.now(),
    title: "xAI Grok 3正式发布：马斯克称已超越GPT-5.4",
    summary: "马斯克旗下xAI正式发布Grok 3大模型，声称在多项基准测试中超越GPT-5.4和Gemini 2.5 Pro。新模型具备更强的推理能力和实时信息获取功能，已面向X Premium+用户开放。",
    category: "AI模型",
    source: "xAI",
    date: "2026-03-10",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    url: "https://x.ai/grok-3"
  },
  {
    id: Date.now() + 1,
    title: "Meta发布Llama 4系列：开源多模态大模型新标杆",
    summary: "Meta正式发布Llama 4系列模型，包括Llama 4 Scout、Llama 4 Maverick和Llama 4 Behemoth。新系列支持文本、图像、视频多模态理解，在保持开源的同时性能逼近闭源商业模型。",
    category: "AI模型",
    source: "Meta AI",
    date: "2026-03-10",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    url: "https://ai.meta.com/llama/"
  }
];

// 添加新文章到开头
newArticles.forEach(article => {
  newsData.unshift(article);
  updateSummary.news.added.push(article.title);
  console.log(`添加新文章: ${article.title}`);
});

// 删除旧文章，保持最多20条
const maxNewsCount = 20;
if (newsData.length > maxNewsCount) {
  const removed = newsData.splice(maxNewsCount);
  removed.forEach(article => {
    updateSummary.news.removed.push(article.title || 'Untitled');
    console.log(`删除旧文章: ${article.title || 'Untitled'}`);
  });
}

console.log(`\n新闻总数: ${newsData.length}条`);

// 保存更新后的文件
fs.writeFileSync(downloadPath, JSON.stringify(downloadData, null, 2));
fs.writeFileSync(newsPath, JSON.stringify(newsData, null, 2));

// 保存更新摘要
const summaryPath = path.join(__dirname, 'update-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(updateSummary, null, 2));

console.log('\n=== 更新完成 ===');
console.log(`下载数据已更新: ${downloadData.length}个应用`);
console.log(`新闻数据已更新: 添加${newArticles.length}条，删除${updateSummary.news.removed.length}条，共${newsData.length}条`);
console.log(`更新摘要已保存到: ${summaryPath}`);
