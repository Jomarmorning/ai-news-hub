const fs = require('fs');
const { updateNewApps } = require('./scripts/fetchNewApps');

async function main() {
  // 1. 更新 download.json
  const downloadData = JSON.parse(fs.readFileSync('./public/api/rankings/download.json', 'utf8'));

  const updatedDownloads = downloadData.map(app => {
    const downloadIncrease = Math.floor(Math.random() * 1501) + 500; // 500-2000
    const newTrend = Math.floor(Math.random() * 51) - 10; // -10 to 40
    return {
      ...app,
      downloads: app.downloads + downloadIncrease,
      trend: newTrend
    };
  });

  fs.writeFileSync('./public/api/rankings/download.json', JSON.stringify(updatedDownloads, null, 2));

  // 计算统计数据
  let totalDownloadIncrease = 0;
  for (let i = 0; i < updatedDownloads.length; i++) {
    totalDownloadIncrease += (updatedDownloads[i].downloads - downloadData[i].downloads);
  }
  console.log('Download data updated:');
  console.log('- Total download increase: ' + totalDownloadIncrease.toLocaleString());
  console.log('- Apps updated: ' + updatedDownloads.length);

  // 2. 更新 news.json
  const newsData = JSON.parse(fs.readFileSync('./public/api/news.json', 'utf8'));

  // 生成新的新闻条目
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const newArticles = [
    {
      "id": now,
      "title": "Anthropic升级Claude插件：实现Excel与PPT跨应用自动化办公",
      "summary": "Anthropic近日对Claude的Excel和PowerPoint加载项进行重大升级，推出'共享上下文'功能。用户可以在Excel中分析数据后，直接让Claude生成对应的PowerPoint演示文稿，无需重复解释数据集。这一功能将大幅提升企业办公效率，直接挑战微软Copilot的市场地位。",
      "category": "AI趋势",
      "source": "36氪/Anthropic",
      "date": today,
      "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      "url": "https://www.36kr.com/p/3719688044148355"
    },
    {
      "id": now + 1,
      "title": "2026年消费创新案例揭晓：AI助手一句话下单超1.2亿次",
      "summary": "2026年消费创新案例正式揭晓，AI技术正在深度融入日常生活。从'AI助手一句话下单超1.2亿次'到'具身智能机器人持证上岗智慧药房'，从'AI眼镜实现实时翻译'到'智能客服解决率突破95%'，AI正在从概念走向大规模商业应用。",
      "category": "产业",
      "source": "每日经济新闻",
      "date": today,
      "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
      "url": "https://www.nbd.com.cn/"
    },
    {
      "id": now + 2,
      "title": "金华人工智能大会：AI产业化加速，2026将是AI大爆发之年",
      "summary": "3月14日，'金华·金漪湖'2026人工智能产业融合大会成功举办。与会专家表示，最近的OpenClaw等创新让所有人看到，人工智能不但离我们越来越近，而且就在我们身边。2026年将会是人工智能大爆发的一年，AI产业化进程正在全面加速。",
      "category": "产业",
      "source": "上海证券报",
      "date": today,
      "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
      "url": "https://paper.cnstock.com/"
    }
  ];

  // 添加新文章到开头，并限制最多20条
  const updatedNews = [...newArticles, ...newsData].slice(0, 20);

  fs.writeFileSync('./public/api/news.json', JSON.stringify(updatedNews, null, 2));

  console.log('\nNews data updated:');
  console.log('- New articles added: ' + newArticles.length);
  console.log('- Total articles: ' + updatedNews.length);
  console.log('- Old articles removed: ' + Math.max(0, newsData.length + newArticles.length - 20));

  // 3. 更新新发行AI应用数据
  console.log('\n=== 更新新发行AI应用数据 ===');
  try {
    await updateNewApps();
  } catch (e) {
    console.log('更新新发行应用数据失败:', e.message);
  }
}

main().catch(console.error);
