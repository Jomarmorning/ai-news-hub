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

// 最新AI资讯（2026年3月8日更新）
const newArticles = [
  {
    "id": Date.now(),
    "title": "Claude 4系列模型正式发布，推理能力大幅提升",
    "summary": "Anthropic发布Claude 4系列模型，包括Claude Opus 4和Claude Sonnet 4。新模型在复杂推理、代码生成和多步骤任务执行方面表现卓越，支持更长的上下文窗口和更精准的工具调用。",
    "category": "AI模型",
    "source": "Anthropic",
    "date": today,
    "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    "url": "https://www.anthropic.com/news/claude-4-family"
  },
  {
    "id": Date.now() + 1,
    "title": "Google Gemini 2.5 Pro发布，多模态能力再突破",
    "summary": "谷歌发布Gemini 2.5 Pro模型，在图像理解、视频分析和跨模态推理方面实现重大突破。新模型支持原生多模态输入输出，可处理长达100万token的上下文。",
    "category": "AI模型",
    "source": "Google DeepMind",
    "date": today,
    "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    "url": "https://deepmind.google/gemini-2-5-pro"
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
