const fs = require('fs');
const path = require('path');

// 读取现有数据
const downloadPath = path.join(__dirname, 'public/api/rankings/download.json');
const newsPath = path.join(__dirname, 'public/api/news.json');

const downloadData = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

console.log('=== 更新前数据 ===');
console.log('Download数据条数:', downloadData.length);
console.log('News数据条数:', newsData.length);

// 1. 更新download数据：每个应用downloads增加随机数值(500-2000)，trend更新为随机值(-10到40)
const updatedDownloadData = downloadData.map(app => {
  const downloadIncrease = Math.floor(Math.random() * 1501) + 500; // 500-2000
  const newTrend = Math.floor(Math.random() * 51) - 10; // -10到40
  return {
    ...app,
    downloads: app.downloads + downloadIncrease,
    trend: newTrend
  };
});

console.log('\n=== Download数据更新摘要 ===');
updatedDownloadData.forEach((app, i) => {
  const oldApp = downloadData[i];
  console.log(`${app.name}: downloads ${oldApp.downloads} -> ${app.downloads} (+${app.downloads - oldApp.downloads}), trend ${oldApp.trend} -> ${app.trend}`);
});

// 2. 添加新AI资讯到news列表开头
const newArticles = [
  {
    id: Date.now(),
    title: "Claude Sonnet 4.6正式发布：Anthropic最强编程模型",
    summary: "2026年3月11日，Anthropic正式发布Claude Sonnet 4.6，这是其迄今最强的Sonnet模型。新版本在代码编写、计算机操作、长上下文推理和智能体规划等维度实现全面跃升，支持更复杂的开发任务和自动化工作流。",
    category: "AI模型",
    source: "Anthropic/知乎",
    date: "2026-03-25",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    url: "https://www.anthropic.com/news/claude-opus-4-6"
  },
  {
    id: Date.now() + 1,
    title: "2026年3月AI模型大爆发：12+新模型密集发布",
    summary: "2026年3月被称为'改变AI的一周'，OpenAI GPT-5.4、Anthropic Claude 4.6、Google Gemini 3.1等12+款大模型密集发布。行业分析指出，AI平台正从增长模式转向货币化策略，企业级应用成为竞争焦点。",
    category: "AI趋势",
    source: "BuildFastWithAI",
    date: "2026-03-25",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    url: "https://www.buildfastwithai.com/blogs/ai-models-march-2026-releases"
  }
];

// 添加新文章到开头，删除旧文章保持最多20条
let updatedNewsData = [...newArticles, ...newsData];
if (updatedNewsData.length > 20) {
  updatedNewsData = updatedNewsData.slice(0, 20);
}

console.log('\n=== News数据更新摘要 ===');
console.log('新增文章:', newArticles.length);
console.log('删除旧文章:', newsData.length + newArticles.length - updatedNewsData.length);
console.log('更新后总数:', updatedNewsData.length);
newArticles.forEach(article => {
  console.log(`- ${article.title}`);
});

// 保存更新后的文件
fs.writeFileSync(downloadPath, JSON.stringify(updatedDownloadData, null, 2));
fs.writeFileSync(newsPath, JSON.stringify(updatedNewsData, null, 2));

console.log('\n=== 文件已保存 ===');
console.log('✓', downloadPath);
console.log('✓', newsPath);

// 生成更新报告
const report = {
  updateTime: new Date().toISOString(),
  downloadUpdates: updatedDownloadData.map((app, i) => ({
    name: app.name,
    downloadsChange: app.downloads - downloadData[i].downloads,
    trendChange: app.trend - downloadData[i].trend
  })),
  newsUpdates: {
    added: newArticles.length,
    removed: newsData.length + newArticles.length - updatedNewsData.length,
    newArticles: newArticles.map(a => ({ title: a.title, category: a.category }))
  }
};

console.log('\n=== 更新报告 ===');
console.log(JSON.stringify(report, null, 2));
