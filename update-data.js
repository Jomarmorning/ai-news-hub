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

// 基于最新AI新闻 (2026-03-11)
const today = new Date().toISOString().split('T')[0];
const newArticles = [
  {
    id: Date.now(),
    title: "OpenAI与Google员工联合声援Anthropic，反对五角大楼制裁",
    summary: "超过30名OpenAI和Google DeepMind员工签署声明，支持Anthropic对国防部的诉讼。此前五角大楼将Anthropic列为供应链风险企业，引发AI行业对军事化应用的激烈辩论。",
    category: "AI趋势",
    source: "TechCrunch",
    date: today,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    url: "https://techcrunch.com/2026/03/09/openai-and-google-employees-rush-to-anthropics-defense-in-dod-lawsuit/"
  },
  {
    id: Date.now() + 1,
    title: "2026年3月科技行业裁员4.5万人，AI自动化成主因",
    summary: "2026年3月科技行业裁员人数高达4.5万，其中超过9200人归因于AI和自动化技术的进步。亚马逊、谷歌、微软等科技巨头正在重组人力资源，AI替代效应开始显现。",
    category: "产业",
    source: "OpenTools AI",
    date: today,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    url: "https://opentools.ai/news/2026-tech-layoffs-hit-45000-in-march-ai-and-automation-take-the-lead"
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
