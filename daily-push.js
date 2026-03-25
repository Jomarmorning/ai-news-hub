/**
 * AI热点资讯每日推送
 * 整理并推送最新AI工具和产品信息到飞书
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 飞书Webhook配置
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK;

// 读取AI数据
function loadAIData() {
    const dataPath = path.join(__dirname, 'data', 'aiData.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
}

// 整理资讯内容
function formatNewsContent(data) {
    const items = [];

    // 1. 最新AI新闻（按时间排序）
    const sortedNews = data.news?.sort((a, b) =>
        new Date(b.publishedAt) - new Date(a.publishedAt)
    ) || [];

    sortedNews.slice(0, 3).forEach(news => {
        items.push({
            title: news.title,
            description: news.excerpt?.substring(0, 60) + '...' || 'AI领域最新动态'
        });
    });

    // 2. 热门新产品（按trend排序）
    const sortedNewApps = data.newAppsRankings?.sort((a, b) => b.trend - a.trend) || [];

    sortedNewApps.slice(0, 3).forEach(app => {
        items.push({
            title: app.name,
            description: app.description
        });
    });

    // 3. 热门下载应用（按downloads排序）
    const sortedDownloads = data.downloadRankings?.sort((a, b) => b.downloads - a.downloads) || [];

    sortedDownloads.slice(0, 2).forEach(app => {
        items.push({
            title: app.name,
            description: app.description
        });
    });

    return items.slice(0, 8); // 最多8条
}

// 构建飞书消息
function buildFeishuMessage(items) {
    const lines = items.map((item, index) => {
        return `${index + 1}. ${item.title} - ${item.description}`;
    });

    return {
        msg_type: 'text',
        content: {
            text: `🔥 AI热点资讯推送 (${new Date().toLocaleDateString('zh-CN')})\n\n${lines.join('\n')}\n\n📎 更多详情访问: http://localhost:3000`
        }
    };
}

// 推送到飞书
async function pushToFeishu(message) {
    if (!FEISHU_WEBHOOK) {
        console.log('⚠️ 未配置FEISHU_WEBHOOK环境变量，跳过推送');
        console.log('消息内容预览:');
        console.log(message.content.text);
        return false;
    }

    try {
        const response = await axios.post(FEISHU_WEBHOOK, message, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (response.data.code === 0) {
            console.log('✅ 飞书推送成功');
            return true;
        } else {
            console.error('❌ 飞书推送失败:', response.data.msg);
            return false;
        }
    } catch (error) {
        console.error('❌ 推送错误:', error.message);
        return false;
    }
}

// 主函数
async function main() {
    try {
        console.log('📊 加载AI数据...');
        const data = loadAIData();

        console.log('📝 整理资讯内容...');
        const items = formatNewsContent(data);

        console.log(`📋 共整理 ${items.length} 条资讯`);

        const message = buildFeishuMessage(items);

        console.log('\n📤 推送到飞书...');
        await pushToFeishu(message);

    } catch (error) {
        console.error('❌ 执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { formatNewsContent, buildFeishuMessage, pushToFeishu };
