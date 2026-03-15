// AI Hub数据更新脚本
const fs = require('fs');
const path = require('path');

// 读取现有数据
const downloadPath = path.join(__dirname, 'public/api/rankings/download.json');
const newsPath = path.join(__dirname, 'public/api/news.json');

const downloadData = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

// 1. 更新download数据 - 每个应用downloads增加随机值(500-2000)，trend更新为随机值(-10到40)
const updatedDownloadData = downloadData.map(app => {
  const downloadIncrease = Math.floor(Math.random() * 1501) + 500; // 500-2000
  const newTrend = Math.floor(Math.random() * 51) - 10; // -10 到 40
  return {
    ...app,
    downloads: app.downloads + downloadIncrease,
    trend: newTrend
  };
});

// 2. 添加新文章到news数据开头
const newArticles = [
  {
    id: Date.now(),
    title: "OpenAI发布GPT-5.4：支持原生计算机操作与百万Token上下文",
    summary: "OpenAI正式发布GPT-5.4模型，支持原生计算机操作能力，可自动执行复杂任务。新模型支持最高100万Token的上下文窗口，在专业知识基准测试中达到83%准确率，专为金融建模、法律文档起草等专业工作流优化。",
    category: "AI模型",
    source: "OpenAI",
    date: "2026-03-15",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    url: "https://openai.com/index/gpt-5-4-release/"
  },
  {
    id: Date.now() + 1,
    title: "Google Gemini深度集成Workspace：Docs、Sheets、Slides全面AI化",
    summary: "Google宣布Gemini AI能力全面接入Workspace办公套件，用户可在Docs中智能写作、在Sheets中自动生成表格和分析数据、在Slides中设计演示文稿。Gemini还能基于个人数据在Drive中智能搜索文件，大幅提升办公效率。",
    category: "产业",
    source: "Google",
    date: "2026-03-15",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    url: "https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/"
  },
  {
    id: Date.now() + 2,
    title: "Anthropic发布企业AI Agent构建指南：Claude引领智能体时代",
    summary: "Anthropic发布2026年企业AI Agent构建报告，揭示Claude模型如何驱动下一代自主系统。报告涵盖Haiku、Sonnet、Opus三个层级的工具使用能力、MCP协议集成、Claude Code等特性，展示企业如何利用Claude构建智能工作流自动化。",
    category: "AI趋势",
    source: "Anthropic",
    date: "2026-03-15",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    url: "https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026"
  }
];

// 合并新文章到开头，并限制最多20条
const updatedNewsData = [...newArticles, ...newsData].slice(0, 20);

// 保存更新后的文件
fs.writeFileSync(downloadPath, JSON.stringify(updatedDownloadData, null, 2));
fs.writeFileSync(newsPath, JSON.stringify(updatedNewsData, null, 2));

// 生成更新摘要
const totalDownloadIncrease = updatedDownloadData.reduce((sum, app, i) =>
  sum + (updatedDownloadData[i].downloads - downloadData[i].downloads), 0);

console.log('✅ AI Hub数据更新完成！');
console.log('\n📊 下载量统计更新:');
updatedDownloadData.forEach((app, i) => {
  const oldDownloads = downloadData[i].downloads;
  const increase = app.downloads - oldDownloads;
  console.log(`  - ${app.name}: ${oldDownloads.toLocaleString()} → ${app.downloads.toLocaleString()} (+${increase.toLocaleString()}), 趋势: ${app.trend > 0 ? '+' : ''}${app.trend}%`);
});
console.log(`\n📰 新闻更新: 添加 ${newArticles.length} 条新文章，当前共 ${updatedNewsData.length} 条`);
console.log('\n📝 新增文章:');
newArticles.forEach(article => {
  console.log(`  - ${article.title} (${article.source})`);
});
