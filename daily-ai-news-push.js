const axios = require('axios');

// 从aiData.json提取的最新AI工具和产品信息
const aiNews = [
  { name: 'Kimi K2', desc: 'Moonshot最新多模态AI助手' },
  { name: 'Pika 2.0', desc: '新一代AI视频生成工具' },
  { name: 'Ideogram 2.0', desc: '文本渲染增强的AI绘画工具' },
  { name: 'HeyGen Avatar', desc: 'AI数字人视频生成' },
  { name: 'Luma Dream Machine', desc: '高质量AI视频生成' },
  { name: 'GPT-5预览版', desc: 'OpenAI发布，推理能力大幅提升，数学推理准确率提升40%' },
  { name: 'Claude 4', desc: '支持100万token上下文，可一次性处理整本书籍或大型代码库' },
  { name: 'Gemini 2.0', desc: 'Google发布，支持实时视频流分析与AR/VR应用' }
];

// 构建消息内容
const contentLines = aiNews.map((news, index) => {
  return `${index + 1}. ${news.name} - ${news.desc}`;
});

const message = {
  msg_type: 'text',
  content: {
    text: `🤖 AI工具与产品资讯推送\n\n📅 ${new Date().toLocaleDateString('zh-CN')}\n\n${contentLines.join('\n')}\n\n数据来源：aiData.json`
  }
};

// 发送通知
async function sendNotification() {
  const webhook = process.env.FEISHU_WEBHOOK;

  if (!webhook || webhook.includes('xxxxxxxx')) {
    console.log('⚠️ 飞书Webhook未配置，显示消息内容预览:\n');
    console.log('========== 消息内容 ==========');
    console.log(message.content.text);
    console.log('\n=============================');
    console.log('\n提示: 请设置环境变量 FEISHU_WEBHOOK 来启用推送');
    return;
  }

  try {
    const response = await axios.post(webhook, message, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.data.code === 0) {
      console.log('✅ 飞书推送成功');
    } else {
      console.error('❌ 飞书推送失败:', response.data.msg);
    }
  } catch (error) {
    console.error('❌ 飞书推送错误:', error.message);
  }
}

sendNotification();
