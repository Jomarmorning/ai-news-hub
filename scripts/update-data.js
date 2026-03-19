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

// 最新AI资讯（2026年3月19日更新）
const newArticles = [
  {
    "id": Date.now(),
    "title": "阿里云AI算力涨价34%：全球AI需求爆发引发供应链涨价潮",
    "summary": "3月18日，阿里云官网发布公告，因全球AI需求爆发、供应链涨价导致行业核心硬件采购成本显著上涨，将于2026年4月18日起对AI算力、CPFS智算版等产品进行价格调整，最高涨幅达34%。百度智能云也同步上调价格，算力租赁概念午后爆发。",
    "category": "产业",
    "source": "阿里云/澎湃新闻",
    "date": today,
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "url": "https://www.thepaper.cn/newsDetail_forward_32787960"
  },
  {
    "id": Date.now() + 1,
    "title": "OpenAI发布GPT-5.4轻量模型：性能逼近旗舰版，价格降至1/3",
    "summary": "OpenAI正式发布GPT-5.4 mini和nano两款轻量模型，在保持接近旗舰版性能的同时，价格降至原版的1/3。GPT-5.4将OpenAI近期在推理、编程和Agent工作流方面的最佳进展整合进一个前沿模型，同时纳入了GPT-5.3-Codex的顶级编程能力。",
    "category": "AI模型",
    "source": "OpenAI/IT之家",
    "date": today,
    "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    "url": "https://www.ithome.com/0/926/344.htm"
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
