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

// 模拟最新AI资讯
const newArticles = [
  {
    "id": Date.now(),
    "title": "OpenAI发布GPT-4.5正式版：推理能力大幅提升",
    "summary": "OpenAI正式发布GPT-4.5版本，在数学推理、代码生成和多模态理解方面实现重大突破。新模型支持128K上下文窗口，在多项基准测试中超越前代产品。",
    "category": "AI模型",
    "source": "OpenAI Blog",
    "date": "2026-03-04",
    "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    "url": "https://openai.com/blog/gpt-4-5"
  },
  {
    "id": Date.now() + 1,
    "title": "Google Gemini 2.5 Pro发布：多模态能力再升级",
    "summary": "Google DeepMind发布Gemini 2.5 Pro，新增实时视频流理解和音频分析功能。该模型在复杂推理任务上表现优异，企业级API已开放申请。",
    "category": "AI模型",
    "source": "Google DeepMind",
    "date": "2026-03-04",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    "url": "https://deepmind.google/gemini-2-5"
  }
];

// 添加新文章到开头，保持最多20条
const updatedNews = [...newArticles, ...news].slice(0, 20);

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
console.log(`   - 当前文章总数: ${updatedNews.length}`);

console.log('\n✅ 数据更新完成!');
