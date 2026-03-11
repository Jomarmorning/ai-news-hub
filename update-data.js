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

// 基于最新AI新闻 (2026-03-12)
const today = new Date().toISOString().split('T')[0];
const newArticles = [
  {
    id: Date.now(),
    title: "OpenAI发布GPT-5.4：专业工作模型首次超越人类表现",
    summary: "OpenAI正式发布GPT-5.4及Pro版本，主打智能体编程和专业工作场景。在OSWorld测试中首次超越人类表现，事实陈述错误率降低33%，GDPval测试中达到83%准确率，标志着AI在专业领域应用进入新阶段。",
    category: "AI模型",
    source: "OpenAI",
    date: today,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    url: "https://openai.com/gpt-5-4"
  },
  {
    id: Date.now() + 1,
    title: "2026全国两会：政府工作报告首提智能经济新形态",
    summary: "2026年全国两会期间，人工智能再次成为高频热词。政府工作报告首次明确提出打造智能经济新形态，深化拓展人工智能+应用，推动AI与产业发展、文化建设、民生保障、社会治理相结合，全方位赋能千行百业。",
    category: "产业",
    source: "新华社",
    date: today,
    image: "https://images.unsplash.com/photo-1555664424-778a69022365?w=800&q=80",
    url: "https://news.cn/2026-lianghui-ai"
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
