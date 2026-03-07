const fs = require('fs');
const path = require('path');

// 读取文件
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

// 1. 更新download数据
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

// 基于搜索到的最新AI新闻 (2026-03-07)
const newArticles = [
  {
    id: Date.now(),
    title: "《政府工作报告》起草组：拓展规模化应用，努力使人工智能惠及更多企业",
    summary: "2026年3月5日，国务院新闻办公室举行吹风会解读《政府工作报告》。当前人工智能+正与生产生活加速融合，未来将拓展规模化应用，努力使人工智能惠及更多企业。",
    category: "AI产业",
    source: "腾讯新闻",
    date: "2026-03-07",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    url: "https://news.qq.com/rain/a/20260305A075OU00"
  },
  {
    id: Date.now() + 1,
    title: "MWC26首日：AI重构智能网络底座，厂商6G卡位抢跑",
    summary: "2026年世界移动通信大会（MWC）开幕，AI重构智能网络底座与6G成为焦点。中兴通讯首席战略官王翔表示人机共生，智启新程，具身智能正引领AI发展新范式。",
    category: "AI趋势",
    source: "新浪科技",
    date: "2026-03-07",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    url: "https://news.sina.cn/2026-03-03/detail-inhptein4611107.d.html"
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
