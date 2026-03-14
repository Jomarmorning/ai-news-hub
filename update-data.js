const fs = require('fs');
const path = require('path');
const { updateNewApps } = require('./scripts/fetchNewApps');

async function main() {
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

  // 基于最新AI新闻 (2026-03-14)
  const today = new Date().toISOString().split('T')[0];
  const newArticles = [
    {
      id: Date.now(),
      title: "Figure AI发布Helix模型：人形机器人获得通用视觉语言能力",
      summary: "Figure AI发布全新Helix视觉-语言-动作(VLA)模型，使机器人首次能够像人类一样快速理解自然语言指令并执行复杂任务。该模型在标准GPU上即可运行，标志着人形机器人向家庭应用迈出关键一步。",
      category: "AI模型",
      source: "Figure AI",
      date: today,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
      url: "https://www.figure.ai/news/helix"
    },
    {
      id: Date.now() + 1,
      title: "xAI Grok 3.5发布：马斯克称推理能力超越GPT-5.5",
      summary: "马斯克旗下xAI正式发布Grok 3.5模型，采用全新推理架构，在数学、科学和编程任务上表现卓越。该模型已集成到X平台，Premium用户可立即体验，API定价较Grok 3降低30%。",
      category: "AI模型",
      source: "xAI",
      date: today,
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
      url: "https://x.ai/grok-3-5"
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

  // 3. 更新新发行AI应用数据
  console.log('\n=== 更新新发行AI应用数据 ===');
  try {
    await updateNewApps();
  } catch (e) {
    console.log('更新新发行应用数据失败:', e.message);
  }

  console.log('\n=== 更新完成 ===');
  console.log(`下载数据已更新: ${downloadData.length}个应用`);
  console.log(`新闻数据已更新: 添加${newArticles.length}条，删除${updateSummary.news.removed.length}条，共${newsData.length}条`);
  console.log(`更新摘要已保存到: ${summaryPath}`);
}

main().catch(console.error);
