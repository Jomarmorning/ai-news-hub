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

// 最新AI资讯（2026年3月16日更新）
const newArticles = [
  {
    "id": Date.now(),
    "title": "2026年3月AI模型大战：GPT-5.4、Claude 4.6与Gemini 3.1正面对决",
    "summary": "2026年3月成为人工智能历史上最爆炸性的月份之一。OpenAI、Anthropic、Google DeepMind和DeepSeek在两周内相继发布旗舰模型。GPT-5.4在多模态推理方面表现卓越，Claude 4.6在代码生成和逻辑推理上领先，Gemini 3.1则在长文本处理和生态系统整合上展现优势。",
    "category": "AI模型",
    "source": "Tech Insider",
    "date": today,
    "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    "url": "https://tech-insider.org/chatgpt-vs-claude-vs-deepseek-vs-gemini-2026/"
  },
  {
    "id": Date.now() + 1,
    "title": "腾讯超90%工程师借助AI编码，CodeBuddy助力企业智能化",
    "summary": "腾讯相关负责人表示，腾讯有超过90%的工程师正在借助AI进行编码，并基于自身实践推出支持多种形态的专业工具CodeBuddy（云代码助手），面向企业及程序员提供服务。AI辅助让工程师专注于更具创造性的工作，大幅提升开发效率。",
    "category": "产业",
    "source": "新华网",
    "date": today,
    "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    "url": "https://www.news.cn/20260128/3b2f11906fd74ca397fef9996c805a60/c.html"
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
