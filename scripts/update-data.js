const fs = require('fs');
const path = require('path');

// 读取现有数据
const downloadPath = path.join(__dirname, '../public/api/rankings/download.json');
const newsPath = path.join(__dirname, '../public/api/news.json');

const downloads = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

// 更新downloads数据
const updatedDownloads = downloads.map(app => {
  const randomIncrease = Math.floor(Math.random() * 1500) + 500; // 500-2000
  const randomTrend = Math.floor(Math.random() * 51) - 10; // -10 to 40
  return {
    ...app,
    downloads: app.downloads + randomIncrease,
    trend: randomTrend
  };
});

// 新的AI资讯文章
const newArticles = [
  {
    "id": Date.now(),
    "title": "算力需求攀升、智能体价值兑现 2026年AI产业全面提速",
    "summary": "AI办公智能体产品一站式覆盖办公与开发，可以完成高质量数据分析，上线两年以来，已拥有数千家下游客户，2026年有望迎来更大规模的商业化兑现。",
    "category": "AI产业",
    "source": "央视新闻",
    "date": "2026-03-03",
    "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    "url": "https://news.cctv.cn/2026/03/01/ARTIOjYPeka8KWcSaXp3oHcM260301.shtml"
  },
  {
    "id": Date.now() + 1,
    "title": "2026 AI趋势预测：AI Agent成为核心趋势，向主动协作演进",
    "summary": "2026年AI将迈向规模化落地，AI Agent成为核心趋势，向主动协作、超长任务执行演进。全球科技巨头预测AI在医疗、制造、科研等垂直领域深度应用。",
    "category": "AI趋势",
    "source": "腾讯云",
    "date": "2026-03-02",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    "url": "https://cloud.tencent.com.cn/developer/article/2631820"
  }
];

// 合并新文章到开头，并限制最多20条
const updatedNews = [...newArticles, ...news].slice(0, 20);

// 保存更新后的文件
fs.writeFileSync(downloadPath, JSON.stringify(updatedDownloads, null, 2), 'utf8');
fs.writeFileSync(newsPath, JSON.stringify(updatedNews, null, 2), 'utf8');

// 输出更新摘要
console.log('=== 数据更新摘要 ===');
console.log('\n【下载量数据更新】');
updatedDownloads.forEach((app, i) => {
  const oldApp = downloads[i];
  console.log(`${app.name}: downloads ${oldApp.downloads} → ${app.downloads} (+${app.downloads - oldApp.downloads}), trend ${oldApp.trend} → ${app.trend}`);
});

console.log('\n【资讯数据更新】');
console.log(`新增文章: ${newArticles.length} 条`);
newArticles.forEach(article => {
  console.log(`- ${article.title}`);
});
console.log(`当前资讯总数: ${updatedNews.length} 条`);

// 生成飞书通知内容
const summary = {
  updateTime: new Date().toISOString(),
  downloadsUpdated: updatedDownloads.length,
  newsAdded: newArticles.length,
  totalNews: updatedNews.length,
  topTrending: updatedDownloads
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 3)
    .map(app => ({ name: app.name, trend: app.trend }))
};

fs.writeFileSync(
  path.join(__dirname, '../.update-summary.json'),
  JSON.stringify(summary, null, 2),
  'utf8'
);

console.log('\n更新完成！');
