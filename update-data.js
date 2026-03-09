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

// 基于搜索到的最新AI新闻 (2026-03-09)
const newArticles = [
  {
    id: Date.now(),
    title: "OpenAI发布GPT-5.4系列模型，原生电脑操控能力震撼业界",
    summary: "2026年3月5日，OpenAI正式发布GPT-5.4系列模型，包括GPT-5.4 Pro、GPT-5.4 Thinking等版本。新模型首次实现原生电脑操控能力，可直接操作桌面应用、浏览器和文件系统，OSWorld测试首次超越人类表现。",
    category: "AI模型",
    source: "36氪",
    date: "2026-03-09",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    url: "https://www.36kr.com/p/3710669511094400"
  },
  {
    id: Date.now() + 1,
    title: "Google Gemini 2.5 Pro正式版发布，多模态能力全面升级",
    summary: "谷歌正式发布Gemini 2.5 Pro正式版，在图像理解、视频分析和跨模态推理方面实现重大突破。新模型支持原生多模态输入输出，可处理长达100万token的上下文，与GPT-5.4展开激烈竞争。",
    category: "AI模型",
    source: "AI资讯",
    date: "2026-03-09",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    url: "https://deepmind.google/gemini-2-5-pro"
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
