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
    title: "ChatGPT周活用户突破9亿，OpenAI宣布GPT-5.5系列即将发布",
    summary: "2026年3月，ChatGPT周活跃用户正式突破9亿大关，标志着生成式AI正式进入主流应用阶段。OpenAI同时宣布将在本月推出GPT-5.5系列模型，进一步提升多模态能力和推理性能，预计将在编程、创意写作等领域实现重大突破。",
    category: "AI趋势",
    source: "The AI Track",
    date: today,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    url: "https://theaitrack.com/ai-news-march-2026-in-depth-and-concise/"
  },
  {
    id: Date.now() + 1,
    title: "中国量子AI取得重大突破，算力需求持续攀升",
    summary: "2026年3月，中国在量子AI领域取得重大技术突破。与此同时，AI产业全面提速，智能体产品商业化价值开始兑现。多款AI办公智能体产品已拥有数千家下游客户，2026年有望迎来更大规模的商业化落地。",
    category: "产业",
    source: "CCTV",
    date: today,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    url: "https://news.cctv.com/2026/03/01/ARTIOjYPeka8KWcSaXp3oHcM260301.shtml"
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
