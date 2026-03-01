/**
 * AI Hub - 主服务器
 * Express + 数据抓取服务
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

// 数据服务
const dataService = require('./services/dataService');
const feishuBot = require('./services/feishuBot');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// API 路由
// ========================================

// 获取下载热度排名
app.get('/api/rankings/download', async (req, res) => {
    try {
        const rankings = await dataService.getDownloadRankings();
        res.json(rankings);
    } catch (error) {
        console.error('获取下载排名失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取盈利能力排名
app.get('/api/rankings/revenue', async (req, res) => {
    try {
        const rankings = await dataService.getRevenueRankings();
        res.json(rankings);
    } catch (error) {
        console.error('获取盈利排名失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取热点资讯
app.get('/api/news', async (req, res) => {
    try {
        const news = await dataService.getNews();
        res.json(news);
    } catch (error) {
        console.error('获取资讯失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取新发行AI应用排名
app.get('/api/rankings/new-apps', async (req, res) => {
    try {
        const rankings = await dataService.getNewAppsRankings();
        res.json(rankings);
    } catch (error) {
        console.error('获取新应用排名失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取所有数据（用于初始化）
app.get('/api/all', async (req, res) => {
    try {
        const [downloads, revenue, news, newApps] = await Promise.all([
            dataService.getDownloadRankings(),
            dataService.getRevenueRankings(),
            dataService.getNews(),
            dataService.getNewAppsRankings()
        ]);

        res.json({
            downloadRankings: downloads,
            revenueRankings: revenue,
            news: news,
            newAppsRankings: newApps,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('获取所有数据失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 手动触发数据更新
app.post('/api/refresh', async (req, res) => {
    try {
        await dataService.refreshAllData();
        res.json({ message: '数据刷新成功', timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('刷新数据失败:', error);
        res.status(500).json({ error: '刷新数据失败' });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 测试飞书推送
app.post('/api/test-feishu', async (req, res) => {
    try {
        const news = await dataService.getNews();
        await feishuBot.pushNewsToFeishu(news);
        res.json({ message: '飞书推送测试成功', timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('飞书测试推送失败:', error);
        res.status(500).json({ error: '推送失败' });
    }
});

// ========================================
// 定时任务 (仅在非Serverless环境运行)
// ========================================

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    // 每6小时自动更新数据
    cron.schedule('0 */6 * * *', async () => {
        console.log('[' + new Date().toISOString() + '] 开始定时数据更新...');
        try {
            await dataService.refreshAllData();
            console.log('[' + new Date().toISOString() + '] 数据更新完成');
        } catch (error) {
            console.error('定时更新失败:', error);
        }
    });

    // 每12小时推送AI热点资讯到飞书
    cron.schedule('0 */12 * * *', async () => {
        console.log('[' + new Date().toISOString() + '] 开始飞书资讯推送...');
        try {
            const news = await dataService.getNews();
            await feishuBot.pushNewsToFeishu(news);
            console.log('[' + new Date().toISOString() + '] 飞书推送完成');
        } catch (error) {
            console.error('飞书推送失败:', error);
        }
    });
}

// Vercel Serverless 适配 - 导出app供Serverless使用
module.exports = app;

// 本地开发时启动服务器
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
╔════════════════════════════════════════╗
║           AI Hub 服务器已启动          ║
╠════════════════════════════════════════╣
║  本地: http://localhost:${PORT}           ║
║  网络: http://0.0.0.0:${PORT}             ║
║  环境: ${process.env.NODE_ENV || 'development'}                    ║
╚════════════════════════════════════════╝
        `);

        // 启动时初始化数据
        dataService.refreshAllData().catch(err => {
            console.error('初始化数据失败:', err);
        });
    });
}
