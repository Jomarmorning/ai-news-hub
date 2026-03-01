/**
 * AI Hub - Vercel Serverless API
 * 简化版本，移除定时任务
 */

const express = require('express');
const cors = require('cors');

// 数据服务
const dataService = require('./services/dataService');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 默认数据
const DEFAULT_DATA = {
    downloadRankings: [
        { name: 'ChatGPT', description: 'OpenAI开发的AI聊天助手', category: 'AI对话', downloads: 5200000, trend: 15 },
        { name: 'Midjourney', description: 'AI图像生成工具', category: 'AI绘画', downloads: 3800000, trend: 8 },
        { name: 'Claude', description: 'Anthropic AI助手', category: 'AI对话', downloads: 3200000, trend: 25 },
        { name: 'Runway', description: 'AI视频生成与编辑', category: 'AI视频', downloads: 2800000, trend: 12 },
        { name: 'Jasper', description: 'AI写作助手', category: 'AI写作', downloads: 2400000, trend: -3 },
        { name: 'Synthesia', description: 'AI视频生成平台', category: 'AI视频', downloads: 2100000, trend: 18 },
        { name: 'Copy.ai', description: '营销文案AI工具', category: 'AI写作', downloads: 1900000, trend: 5 },
        { name: 'Notion AI', description: '智能笔记与协作', category: '生产力', downloads: 1750000, trend: 22 },
        { name: 'Grammarly', description: 'AI写作辅助工具', category: 'AI写作', downloads: 1600000, trend: -5 },
        { name: 'DALL-E 3', description: 'OpenAI图像生成', category: 'AI绘画', downloads: 1450000, trend: 30 }
    ]
};

// API 路由
app.get('/api/rankings/download', async (req, res) => {
    try {
        const rankings = await dataService.getDownloadRankings();
        res.json(rankings);
    } catch (error) {
        console.error('获取下载排名失败:', error);
        res.json(DEFAULT_DATA.downloadRankings);
    }
});

app.get('/api/rankings/revenue', async (req, res) => {
    try {
        const rankings = await dataService.getRevenueRankings();
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: '获取数据失败' });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const news = await dataService.getNews();
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: '获取数据失败' });
    }
});

app.get('/api/rankings/new-apps', async (req, res) => {
    try {
        const rankings = await dataService.getNewAppsRankings();
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: '获取数据失败' });
    }
});

app.get('/api/all', async (req, res) => {
    try {
        const [downloads, revenue, news, newApps] = await Promise.all([
            dataService.getDownloadRankings(),
            dataService.getRevenueRankings(),
            dataService.getNews(),
            dataService.getNewAppsRankings()
        ]);
        res.json({ downloadRankings: downloads, revenueRankings: revenue, news, newAppsRankings: newApps });
    } catch (error) {
        res.json({ downloadRankings: DEFAULT_DATA.downloadRankings, revenueRankings: [], news: [], newAppsRankings: [] });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 首页
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Hub - AI应用排名与资讯</title>
    <style>
        :root { --primary: #6366f1; --bg-primary: #0a0a0f; --bg-card: #1a1a25; --text-primary: #fff; --text-secondary: #a1a1aa; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        .navbar { position: fixed; top: 0; left: 0; right: 0; padding: 16px 24px; background: rgba(10,10,15,0.9); border-bottom: 1px solid rgba(255,255,255,0.08); z-index: 1000; }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 1.5rem; font-weight: 700; }
        .main { padding: 100px 24px 40px; max-width: 1200px; margin: 0 auto; }
        .hero { text-align: center; padding: 40px 0; }
        .hero h1 { font-size: 2.5rem; margin-bottom: 16px; background: linear-gradient(135deg, #fff, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { color: var(--text-secondary); font-size: 1.1rem; }
        .section { margin: 60px 0; }
        .section h2 { text-align: center; font-size: 1.8rem; margin-bottom: 30px; }
        .ranking { background: var(--bg-card); border-radius: 16px; overflow: hidden; }
        .item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .rank { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: 700; border-radius: 8px; background: #222; }
        .rank.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; }
        .rank.silver { background: linear-gradient(135deg, #e5e7eb, #9ca3af); color: #000; }
        .rank.bronze { background: linear-gradient(135deg, #fdba74, #ea580c); color: #000; }
        .info { flex: 1; }
        .info h3 { font-size: 1rem; margin-bottom: 2px; }
        .info p { font-size: 0.8rem; color: var(--text-secondary); }
        .category { padding: 4px 10px; background: rgba(99,102,241,0.15); border-radius: 20px; font-size: 0.75rem; color: #818cf8; }
        .stats { text-align: right; }
        .stats .num { font-size: 1.1rem; font-weight: 600; }
        .stats .label { font-size: 0.75rem; color: var(--text-secondary); }
        .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
        .error { text-align: center; padding: 40px; color: #ef4444; }
    </style>
</head>
<body>
    <nav class="navbar"><div class="logo">◈ AI Hub</div></nav>
    <main class="main">
        <section class="hero">
            <h1>AI Hub</h1>
            <p>探索AI世界，洞察前沿趋势</p>
        </section>
        <section class="section">
            <h2>🔥 下载热度排行</h2>
            <div class="ranking" id="ranking"><div class="loading">加载中...</div></div>
        </section>
    </main>
    <script>
        async function load() {
            try {
                const res = await fetch('/api/rankings/download');
                const data = await res.json();
                document.getElementById('ranking').innerHTML = data.slice(0, 10).map((app, i) => \`
                    <div class="item">
                        <div class="rank \${i<3?['gold','silver','bronze'][i]:''}">${i+1}</div>
                        <div class="info">
                            <h3>${app.name}</h3>
                            <p>${app.description}</p>
                        </div>
                        <span class="category">${app.category}</span>
                        <div class="stats">
                            <div class="num">${(app.downloads/10000).toFixed(1)}万</div>
                            <div class="label">周下载</div>
                        </div>
                    </div>
                \`).join('');
            } catch(e) {
                document.getElementById('ranking').innerHTML = '<div class="error">加载失败，请刷新重试</div>';
            }
        }
        load();
    </script>
</body>
</html>`);
});

module.exports = app;
