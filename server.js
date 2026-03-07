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
app.use(express.static('public'));

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

// 测试 Product Hunt API 连接
app.get('/api/test-producthunt', async (req, res) => {
    const https = require('https');
    const PRODUCT_HUNT_TOKEN = process.env.PRODUCT_HUNT_TOKEN;

    if (!PRODUCT_HUNT_TOKEN) {
        return res.json({
            status: 'error',
            message: 'PRODUCT_HUNT_TOKEN not configured',
            env: Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('HUNT'))
        });
    }

    const query = JSON.stringify({
        query: `query {
            posts(first: 3, order: NEWEST) {
                edges {
                    node {
                        id
                        name
                        tagline
                        createdAt
                        website
                    }
                }
            }
        }`
    });

    const options = {
        hostname: 'api.producthunt.com',
        path: '/v2/api/graphql',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PRODUCT_HUNT_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 10000
    };

    const requestPromise = new Promise((resolve, reject) => {
        const req = https.request(options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch(e) {
                    reject(new Error('Parse error: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.write(query);
        req.end();
    });

    try {
        const result = await requestPromise;
        if (result.errors) {
            res.json({
                status: 'error',
                message: 'Product Hunt API error',
                errors: result.errors
            });
        } else {
            res.json({
                status: 'ok',
                message: 'Product Hunt API connected successfully',
                tokenConfigured: true,
                products: result.data.posts.edges.map(e => ({
                    name: e.node.name,
                    tagline: e.node.tagline,
                    createdAt: e.node.createdAt
                }))
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            message: error.message,
            tokenConfigured: true
        });
    }
});

// 首页路由 - 直接发送HTML内容
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Hub - AI应用排名与资讯</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #6366f1; --primary-light: #818cf8; --bg-primary: #0a0a0f; --bg-card: #1a1a25; --text-primary: #ffffff; --text-secondary: #a1a1aa; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Noto Sans SC', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        .navbar { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: rgba(10,10,15,0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); z-index: 1000; }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 1.5rem; font-weight: 700; }
        .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), #06b6d4); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .main-container { padding-top: 80px; max-width: 1400px; margin: 0 auto; padding: 100px 24px 40px; }
        .hero { text-align: center; padding: 60px 0; }
        .hero h1 { font-size: 3rem; margin-bottom: 16px; background: linear-gradient(135deg, var(--text-primary), var(--primary-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
        .section { margin: 80px 0; }
        .section-header { text-align: center; margin-bottom: 40px; }
        .section h2 { font-size: 2rem; margin-bottom: 8px; }
        .ranking-container { background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; }
        .ranking-item { display: flex; align-items: center; gap: 20px; padding: 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .rank-number { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; border-radius: 12px; background: #222230; }
        .rank-number.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; }
        .rank-number.silver { background: linear-gradient(135deg, #e5e7eb, #9ca3af); color: #000; }
        .rank-number.bronze { background: linear-gradient(135deg, #fdba74, #ea580c); color: #000; }
        .app-info { flex: 1; display: flex; align-items: center; gap: 16px; }
        .app-icon { width: 56px; height: 56px; border-radius: 14px; background: #222230; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .app-details h3 { font-size: 1.1rem; margin-bottom: 4px; }
        .app-details p { font-size: 0.85rem; color: var(--text-secondary); }
        .app-category { padding: 6px 14px; background: rgba(99,102,241,0.1); border-radius: 100px; font-size: 0.8rem; color: var(--primary-light); }
        .app-stats { text-align: right; }
        .download-count { font-size: 1.25rem; font-weight: 600; }
        .download-label { font-size: 0.8rem; color: var(--text-secondary); }
        .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo">
            <div class="logo-icon">◈</div>
            <span>AI Hub</span>
        </div>
    </nav>
    <main class="main-container">
        <section class="hero">
            <h1>AI Hub</h1>
            <p>探索AI世界，洞察前沿趋势。聚合全球AI应用下载热度、盈利能力与最新资讯。</p>
        </section>
        <section class="section" id="rankings">
            <div class="section-header">
                <h2>🔥 下载热度排行</h2>
            </div>
            <div class="ranking-container" id="downloadRanking">
                <div class="loading">加载中...</div>
            </div>
        </section>
    </main>
    <script>
        async function loadData() {
            try {
                const res = await fetch('/api/rankings/download');
                const data = await res.json();
                const container = document.getElementById('downloadRanking');
                container.innerHTML = data.slice(0, 10).map((app, i) => \`
                    <div class="ranking-item">
                        <div class="rank-number \${i===0?'gold':i===1?'silver':i===2?'bronze':''}">\${i+1}</div>
                        <div class="app-info">
                            <div class="app-icon">🤖</div>
                            <div class="app-details">
                                <h3>\${app.name}</h3>
                                <p>\${app.description}</p>
                            </div>
                        </div>
                        <span class="app-category">\${app.category}</span>
                        <div class="app-stats">
                            <div class="download-count">\${(app.downloads/10000).toFixed(1)}万</div>
                            <div class="download-label">周下载</div>
                        </div>
                    </div>
                \`).join('');
            } catch(e) {
                document.getElementById('downloadRanking').innerHTML = '<div class="loading">加载失败，请刷新重试</div>';
            }
        }
        loadData();
    </script>
</body>
</html>`);
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
