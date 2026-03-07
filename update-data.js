const fs = require('fs');
const path = require('path');
const { updateNewApps } = require('./scripts/fetchNewApps');

async function main() {
  // 读取文件
  const downloadPath = path.join(__dirname, 'public/api/rankings/download.json');
  const newsPath = path.join(__dirname, 'public/api/news.json');

  const downloadData = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

  // 记录更新摘要
  const updateSummary = {
    downloads: [],
    newApps: [],
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
      title: "OpenAI发布GPT-5.4模型，原生支持电脑操控",
      summary: "OpenAI深夜发布GPT-5.4系列模型，新增原生电脑操控能力，可直接操作桌面应用、浏览器和文件系统，标志着AI Agent能力重大突破。",
      category: "AI模型",
      source: "AI资讯",
      date: "2026-03-07",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
      url: "https://openai.com/blog/gpt-5-4"
    },
    {
      id: Date.now() + 1,
      title: "GPT-5.4 vs Claude Opus 4.6 vs Gemini 3.1 Pro：最强AI模型之争白热化",
      summary: "随着GPT-5.4、Claude Opus 4.6和Gemini 3.1 Pro相继发布，顶级AI模型竞争进入白热化阶段。各模型在推理能力、代码生成和多模态处理方面各有千秋。",
      category: "AI模型",
      source: "EvoLink.AI",
      date: "2026-03-07",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      url: "https://evolink.ai/zh/blog/gpt-5-4-vs-claude-opus-4-6-vs-gemini-3-1-pro-2026"
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

  // 3. 更新新发行应用数据
  console.log('\n=== 更新新发行应用数据 ===');
  let newAppsResult = [];
  try {
    newAppsResult = await updateNewApps();
    updateSummary.newApps = newAppsResult.map(app => app.name);
  } catch (e) {
    console.log('新发行应用更新失败:', e.message);
  }

  // 保存更新后的文件
  fs.writeFileSync(downloadPath, JSON.stringify(downloadData, null, 2));
  fs.writeFileSync(newsPath, JSON.stringify(newsData, null, 2));

  // 保存更新摘要
  const summaryPath = path.join(__dirname, 'update-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(updateSummary, null, 2));

  console.log('\n=== 更新完成 ===');
  console.log(`下载数据已更新: ${downloadData.length}个应用`);
  console.log(`新闻数据已更新: 添加${newArticles.length}条，删除${updateSummary.news.removed.length}条，共${newsData.length}条`);
  console.log(`新发行应用已更新: ${newAppsResult.length}个应用`);
  console.log(`更新摘要已保存到: ${summaryPath}`);
}

main().catch(console.error);
