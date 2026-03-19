const axios = require('axios');
const fs = require('fs');

// 读取更新后的数据
const downloadData = JSON.parse(fs.readFileSync('./public/api/rankings/download.json', 'utf8'));
const newsData = JSON.parse(fs.readFileSync('./public/api/news.json', 'utf8'));

// 构建下载数据更新摘要
const downloadUpdates = downloadData.map(app => {
  return `• ${app.name}: ${app.downloads.toLocaleString()}下载, 趋势 ${app.trend > 0 ? '+' : ''}${app.trend}`;
}).join('\n');

// 获取新增的文章（今天添加的）
const today = new Date().toISOString().split('T')[0];
const newArticles = newsData.filter(n => n.date === today).map(n => n.title);

// 构建飞书消息
const message = {
  msg_type: 'post',
  content: {
    post: {
      zh_cn: {
        title: '🤖 AI Hub 数据更新通知 - 2026-03-19',
        content: [
          [
            { tag: 'text', text: '📊 下载排行榜更新 (10个应用)\n\n' },
            { tag: 'text', text: downloadUpdates },
            { tag: 'text', text: '\n\n📰 最新资讯更新\n\n' },
            { tag: 'text', text: `新增 ${newArticles.length} 条热门资讯:\n` },
            ...newArticles.map((title, i) => ({ tag: 'text', text: `${i + 1}. ${title}\n` })),
            { tag: 'text', text: `\n当前资讯总数: ${newsData.length} 条\n\n` },
            { tag: 'text', text: `⏰ 更新时间: ${new Date().toLocaleString('zh-CN')}` }
          ]
        ]
      }
    }
  }
};

// 发送通知
async function sendNotification() {
  // 从环境变量获取webhook
  const webhook = process.env.FEISHU_WEBHOOK;

  if (!webhook || webhook.includes('xxxxxxxx')) {
    console.log('⚠️ 飞书Webhook未配置，显示消息内容预览:\n');
    console.log('========== 飞书消息内容 ==========\n');
    console.log(`🤖 AI Hub 数据更新通知 - 2026-03-19\n`);
    console.log(`📊 下载排行榜更新 (10个应用)\n`);
    console.log(downloadUpdates);
    console.log(`\n📰 最新资讯更新\n`);
    console.log(`新增 ${newArticles.length} 条热门资讯:`);
    newArticles.forEach((title, i) => console.log(`${i + 1}. ${title}`));
    console.log(`\n当前资讯总数: ${newsData.length} 条`);
    console.log(`\n⏰ 更新时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('\n===================================');
    console.log('\n提示: 请设置环境变量 FEISHU_WEBHOOK 来启用推送');
    return;
  }

  try {
    const response = await axios.post(webhook, message, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.data.code === 0) {
      console.log('✅ 飞书通知发送成功');
    } else {
      console.error('❌ 飞书通知发送失败:', response.data.msg);
    }
  } catch (error) {
    console.error('❌ 飞书通知发送错误:', error.message);
  }
}

sendNotification();
