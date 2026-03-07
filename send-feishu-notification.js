const axios = require('axios');
const fs = require('fs');

// 读取更新摘要
const summary = JSON.parse(fs.readFileSync('./update-summary.json', 'utf8'));

// 构建下载数据更新摘要
const downloadUpdates = summary.downloads.map(d => {
  const trendIcon = d.trend.new > d.trend.old ? '📈' : d.trend.new < d.trend.old ? '📉' : '➡️';
  return `• ${d.name}: +${d.downloads.increase}下载, 趋势 ${d.trend.old}→${d.trend.new} ${trendIcon}`;
}).join('\n');

// 构建新闻更新摘要
const newArticles = summary.news.added.map((title, i) => `${i + 1}. ${title}`).join('\n');

// 构建飞书消息
const message = {
  msg_type: 'post',
  content: {
    post: {
      zh_cn: {
        title: '🤖 AI Hub 数据更新通知',
        content: [
          [
            { tag: 'text', text: '📊 下载数据更新 (10个应用)\n' },
            { tag: 'text', text: downloadUpdates },
            { tag: 'text', text: '\n\n📰 资讯更新\n' },
            { tag: 'text', text: `新增 ${summary.news.added.length} 条:\n${newArticles}\n` },
            { tag: 'text', text: `删除 ${summary.news.removed.length} 条旧资讯\n` },
            { tag: 'text', text: `当前共 ${summary.totalNews || 20} 条资讯\n\n` },
            { tag: 'text', text: `⏰ 更新时间: ${new Date().toLocaleString('zh-CN')}` }
          ]
        ]
      }
    }
  }
};

// 发送通知
async function sendNotification() {
  // 从环境变量获取webhook，或使用默认值（需要用户替换）
  const webhook = process.env.FEISHU_WEBHOOK;

  if (!webhook || webhook.includes('xxxxxxxx')) {
    console.log('⚠️ 飞书Webhook未配置，跳过通知发送');
    console.log('请设置环境变量 FEISHU_WEBHOOK 或修改脚本中的webhook地址');
    console.log('\n消息内容预览:');
    console.log(JSON.stringify(message, null, 2));
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
