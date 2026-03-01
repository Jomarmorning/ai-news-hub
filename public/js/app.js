/**
 * AI Hub - 主应用脚本
 * 负责数据获取、渲染和交互
 */

// API 基础URL
const API_BASE = '';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 加载完成，开始初始化应用...');
    initApp();
});

async function initApp() {
    console.log('initApp 开始执行...');
    // 加载所有数据
    await Promise.all([
        loadNewAppsRanking(),
        loadDownloadRanking(),
        loadRevenueRanking(),
        loadNews()
    ]);
    console.log('所有数据加载完成');

    // 更新统计信息
    updateStats();

    // 设置最后更新时间
    updateLastUpdateTime();

    // 初始化导航交互
    initNavigation();

    // 启动实时时钟
    startLiveClock();
}

// 加载新发行AI应用排名
async function loadNewAppsRanking() {
    const container = document.getElementById('newAppsRanking');
    if (!container) {
        console.error('找不到 newAppsRanking 容器');
        return;
    }

    try {
        console.log('开始加载新应用排名...');
        // 显示加载状态
        container.innerHTML = generateRankingSkeleton(10);

        // 获取数据
        const response = await fetch(`${API_BASE}/api/rankings/new-apps`);
        console.log('API 响应状态:', response.status);
        const data = await response.json();
        console.log('获取到新应用数据:', data.length, '条');

        // 渲染数据
        container.innerHTML = data.map((app, index) => createNewAppItem(app, index + 1)).join('');
        console.log('新应用排名渲染完成');
    } catch (error) {
        console.error('加载新应用排名失败:', error);
        container.innerHTML = '<div class="error-message">数据加载失败，请稍后重试</div>';
    }
}

// 加载下载热度排名
async function loadDownloadRanking() {
    const container = document.getElementById('downloadRanking');
    if (!container) return;

    try {
        // 显示加载状态
        container.innerHTML = generateRankingSkeleton(10);

        // 获取数据
        const response = await fetch(`${API_BASE}/api/rankings/download`);
        const data = await response.json();

        // 渲染数据
        container.innerHTML = data.map((app, index) => createRankingItem(app, index + 1)).join('');
    } catch (error) {
        console.error('加载下载排名失败:', error);
        container.innerHTML = '<div class="error-message">数据加载失败，请稍后重试</div>';
    }
}

// 加载盈利能力排名
async function loadRevenueRanking() {
    const container = document.getElementById('revenueRanking');
    if (!container) return;

    try {
        // 显示加载状态
        container.innerHTML = generateRevenueSkeleton(6);

        // 获取数据
        const response = await fetch(`${API_BASE}/api/rankings/revenue`);
        const data = await response.json();

        // 渲染数据
        container.innerHTML = data.map((app, index) => createRevenueCard(app, index + 1)).join('');
    } catch (error) {
        console.error('加载盈利排名失败:', error);
        container.innerHTML = '<div class="error-message">数据加载失败，请稍后重试</div>';
    }
}

// 加载热点资讯
async function loadNews() {
    const container = document.getElementById('newsGrid');
    if (!container) return;

    try {
        // 显示加载状态
        container.innerHTML = generateNewsSkeleton(6);

        // 获取数据
        const response = await fetch(`${API_BASE}/api/news`);
        const data = await response.json();

        // 渲染数据
        container.innerHTML = data.map(news => createNewsCard(news)).join('');
    } catch (error) {
        console.error('加载资讯失败:', error);
        container.innerHTML = '<div class="error-message">数据加载失败，请稍后重试</div>';
    }
}

// 创建排名项HTML
function createRankingItem(app, rank) {
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal';
    const topClass = rank <= 3 ? 'top-3' : '';
    const trendIcon = app.trend > 0 ? '↑' : app.trend < 0 ? '↓' : '→';
    const trendClass = app.trend > 0 ? 'up' : app.trend < 0 ? 'down' : '';

    // 使用本地备用图标 - base64编码的SVG
    const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCBmaWxsPSIjNjM2NmYxIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIi8+PHRleHQgZmlsbD0id2hpdGUiIHg9IjUwIiB5PSI2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFJPC90ZXh0Pjwvc3ZnPg==';

    // 验证图标URL
    const iconUrl = app.icon && app.icon.startsWith('http') ? app.icon : fallbackIcon;

    return `
        <div class="ranking-item ${topClass}">
            <div class="rank-number ${rankClass}">${rank}</div>
            <div class="app-info">
                <img src="${iconUrl}" alt="${app.name}" class="app-icon" onerror="this.onerror=null; this.src='${fallbackIcon}'">
                <div class="app-details">
                    <h3>${app.name}</h3>
                    <p>${app.description || 'AI应用'}</p>
                </div>
            </div>
            <span class="app-category">${app.category}</span>
            <div class="app-stats">
                <div class="download-count">${formatNumber(app.downloads)}</div>
                <div class="download-label">周下载</div>
                <span class="trend ${trendClass}">${trendIcon} ${Math.abs(app.trend || 0)}%</span>
            </div>
        </div>
    `;
}

// 创建新应用排名项HTML
function createNewAppItem(app, rank) {
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal';
    const topClass = rank <= 3 ? 'top-3' : '';
    const trendIcon = app.trend > 0 ? '↑' : app.trend < 0 ? '↓' : '→';
    const trendClass = app.trend > 0 ? 'up' : app.trend < 0 ? 'down' : '';
    const daysAgo = getDaysAgo(app.releasedAt);

    // 使用本地备用图标 - base64编码的SVG
    const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCBmaWxsPSIjNjM2NmYxIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIi8+PHRleHQgZmlsbD0id2hpdGUiIHg9IjUwIiB5PSI2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFJPC90ZXh0Pjwvc3ZnPg==';

    // 验证图标URL
    const iconUrl = app.icon && app.icon.startsWith('http') ? app.icon : fallbackIcon;

    return `
        <div class="ranking-item new-app-item ${topClass}">
            <div class="rank-number ${rankClass}">${rank}</div>
            <div class="app-info">
                <img src="${iconUrl}" alt="${app.name}" class="app-icon" onerror="this.onerror=null; this.src='${fallbackIcon}'">
                <div class="app-details">
                    <h3>${app.name} <span class="new-badge">NEW</span></h3>
                    <p>${app.description || 'AI应用'}</p>
                </div>
            </div>
            <span class="app-category">${app.category}</span>
            <div class="app-stats">
                <div class="download-count">${formatNumber(app.downloads)}</div>
                <div class="download-label">总下载 · ${daysAgo}前发布</div>
                <span class="trend ${trendClass}">${trendIcon} ${Math.abs(app.trend || 0)}%</span>
            </div>
        </div>
    `;
}

// 获取天数差
function getDaysAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    return `${diffDays}天`;
}

// 创建盈利卡片HTML
function createRevenueCard(app, rank) {
    const featuredClass = rank <= 3 ? 'featured' : '';

    return `
        <div class="revenue-card ${featuredClass}">
            <div class="revenue-header">
                <div class="revenue-rank">${rank}</div>
                <div class="revenue-app-info">
                    <h3>${app.name}</h3>
                    <span>${app.category}</span>
                </div>
            </div>
            <div class="revenue-amount">
                <div class="amount">${app.revenue}</div>
                <div class="period">月收入</div>
            </div>
            <div class="revenue-metrics">
                <div class="metric">
                    <div class="metric-value">${app.arpu || '-'}</div>
                    <div class="metric-label">ARPU</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${app.conversion || '-'}</div>
                    <div class="metric-label">付费转化率</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${app.growth || '-'}</div>
                    <div class="metric-label">增长率</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${app.subscribers || '-'}</div>
                    <div class="metric-label">付费用户</div>
                </div>
            </div>
        </div>
    `;
}

// 创建资讯卡片HTML
function createNewsCard(news) {
    const timeAgo = getTimeAgo(news.publishedAt);

    return `
        <article class="news-card">
            <img src="${news.image}" alt="${news.title}" class="news-image" onerror="this.style.display='none'">
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-tag">${news.tag}</span>
                    <span class="news-time">${timeAgo}</span>
                </div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <div class="news-footer">
                    <div class="news-source">
                        <span class="source-icon" style="background-image: url('${news.sourceIcon}')"></span>
                        <span>${news.source}</span>
                    </div>
                    <a href="${news.url}" target="_blank" class="read-more">阅读更多 →</a>
                </div>
            </div>
        </article>
    `;
}

// 生成排名骨架屏
function generateRankingSkeleton(count) {
    return Array(count).fill(0).map(() => `
        <div class="ranking-item">
            <div class="rank-number normal skeleton" style="width: 48px; height: 48px;"></div>
            <div class="app-info" style="flex: 1;">
                <div class="skeleton" style="width: 56px; height: 56px; border-radius: 14px;"></div>
                <div style="flex: 1;">
                    <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="width: 40%; height: 14px;"></div>
                </div>
            </div>
            <div class="skeleton" style="width: 80px; height: 28px; border-radius: 100px;"></div>
            <div class="skeleton" style="width: 100px; height: 40px;"></div>
        </div>
    `).join('');
}

// 生成盈利骨架屏
function generateRevenueSkeleton(count) {
    return Array(count).fill(0).map(() => `
        <div class="revenue-card">
            <div class="revenue-header">
                <div class="skeleton" style="width: 40px; height: 40px; border-radius: 10px;"></div>
                <div style="flex: 1;">
                    <div class="skeleton" style="width: 70%; height: 20px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="width: 50%; height: 14px;"></div>
                </div>
            </div>
            <div class="skeleton" style="width: 100%; height: 80px; border-radius: 16px; margin-bottom: 20px;"></div>
            <div class="revenue-metrics">
                ${Array(4).fill(0).map(() => `
                    <div class="skeleton" style="height: 60px; border-radius: 12px;"></div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// 生成资讯骨架屏
function generateNewsSkeleton(count) {
    return Array(count).fill(0).map(() => `
        <article class="news-card">
            <div class="skeleton" style="width: 100%; height: 200px;"></div>
            <div class="news-content" style="padding: 24px;">
                <div class="skeleton" style="width: 40%; height: 20px; margin-bottom: 12px;"></div>
                <div class="skeleton" style="width: 100%; height: 24px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 90%; height: 24px; margin-bottom: 12px;"></div>
                <div class="skeleton" style="width: 100%; height: 60px;"></div>
            </div>
        </article>
    `).join('');
}

// 格式化数字
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 获取相对时间
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
}

// 更新统计数据
function updateStats() {
    // 从页面元素中统计
    const rankingItems = document.querySelectorAll('.ranking-item');
    const newsCards = document.querySelectorAll('.news-card');

    const totalAppsEl = document.getElementById('totalApps');
    const totalNewsEl = document.getElementById('totalNews');

    if (totalAppsEl) totalAppsEl.textContent = rankingItems.length || '50+';
    if (totalNewsEl) totalNewsEl.textContent = newsCards.length || '20+';
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = now.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 初始化导航
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // 点击导航
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }

            // 更新活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 滚动监听
    const observerOptions = {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// 启动实时时钟
function startLiveClock() {
    setInterval(() => {
        updateLastUpdateTime();
    }, 60000); // 每分钟更新
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
});

// 网络状态监听
window.addEventListener('online', () => {
    console.log('网络已连接');
    initApp(); // 重新加载数据
});

window.addEventListener('offline', () => {
    console.log('网络已断开');
});
