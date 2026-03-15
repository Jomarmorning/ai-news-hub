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

  // 基于最新AI新闻 (2026-03-15)
  const today = new Date().toISOString().split('T')[0];
  const newArticles = [
    {
      id: Date.now(),
      title: "阿里巴巴发布Page-Agent：用自然语言控制网页界面的GUI代理",
      summary: "阿里巴巴在GitHub Trending上发布了名为Page-Agent的开源项目，这是一个基于JavaScript的GUI代理，允许用户通过自然语言指令控制网页界面。该项目支持自动化网页操作、表单填写、数据抓取等功能，为AI Agent应用开辟了新方向。",
      category: "AI趋势",
      source: "阿里巴巴",
      date: today,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      url: "https://github.com/alibaba/page-agent"
    },
    {
      id: Date.now() + 1,
      title: "工信部：人工智能正成为经济高质量发展核心引擎",
      summary: "工业和信息化部部长李乐成在两会期间表示，中国AI模型走向世界，过去一年我国开源模型下载量全球居首。政府工作报告提出深化拓展「人工智能+」，到「十五五」末，人工智能相关产业规模将增长到10万亿元。",
      category: "产业",
      source: "工信部/央视",
      date: today,
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
      url: "https://news.cctv.com/2026/03/05/ARTIoHrL6Xu907YW73AfKhow260305.shtml"
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
