/**
 * 飞书Bot推送服务
 * 定时推送AI热点资讯到飞书群
 */

const axios = require('axios');

// 飞书Webhook配置 - 请替换为实际的Webhook地址
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK || 'https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

/**
 * 推送AI热点资讯到飞书
 * @param {Array} newsList - 热点资讯列表
 */
async function pushNewsToFeishu(newsList) {
    if (!newsList || newsList.length === 0) {
        console.log('没有资讯需要推送');
        return;
    }

    // 只取前6条资讯
    const topNews = newsList.slice(0, 6);

    // 构建消息内容 - 按照序号1. 2. 3.排列
    const contentLines = topNews.map((news, index) => {
        return `${index + 1}. ${news.title}`;
    });

    const message = {
        msg_type: 'text',
        content: {
            text: `🔥 AI热点资讯推送\n\n${contentLines.join('\n')}\n\n📎 详情访问: http://localhost:3000`
        }
    };

    try {
        const response = await axios.post(FEISHU_WEBHOOK, message, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data.code === 0) {
            console.log(`[${new Date().toISOString()}] 飞书推送成功`);
        } else {
            console.error('飞书推送失败:', response.data.msg);
        }
    } catch (error) {
        console.error('飞书推送错误:', error.message);
        // 如果Webhook未配置，只记录日志不报错
        if (error.response && error.response.status === 404) {
            console.log('提示: 请配置FEISHU_WEBHOOK环境变量');
        }
    }
}

/**
 * 测试飞书推送
 */
async function testFeishuPush() {
    const testNews = [
        { title: 'OpenAI发布GPT-5预览版，推理能力大幅提升' },
        { title: 'Google Gemini 2.0支持实时视频理解' },
        { title: 'Midjourney V7发布：图像生成质量再创新高' }
    ];

    console.log('测试飞书推送...');
    await pushNewsToFeishu(testNews);
}

module.exports = {
    pushNewsToFeishu,
    testFeishuPush
};
