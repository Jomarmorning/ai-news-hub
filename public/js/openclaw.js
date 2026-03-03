/**
 * OpenClaw Hub - 主应用脚本
 * Skill排名、安装教程、Skill Lab交互
 */

// API 基础URL - 使用相对路径
const API_BASE = './api/openclaw';

// 当前筛选状态
let currentFilter = 'all';
let currentPlatform = 'docker';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('OpenClaw Hub 加载完成');
    checkAuthState();
    initApp();
});

async function initApp() {
    // 加载统计数据
    await loadStats();

    // 加载Skill排名
    await loadSkillRankings();

    // 加载精选Skill
    await loadFeaturedSkills();

    // 初始化筛选标签
    initFilterTabs();

    // 初始化平台切换
    initPlatformTabs();

    // 初始化代码复制功能
    initCopyButtons();

    // 初始化导航交互
    initNavigation();

    // 初始化订阅表单
    initSubscribeForm();

    // 启动实时时钟
    startLiveClock();

    // 设置免费技能列表自动更新
    setupAutoUpdate();

    // 初始化上次更新时间显示
    updateLastRefreshTime();
}

// 加载统计数据
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/skills.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 更新统计数字
        animateNumber('totalSkills', data.totalSkills);
        animateText('weeklyDownloads', data.weeklyDownloads);
        animateText('activeUsers', data.activeUsers);
        animateNumber('proSkills', data.proSkills);
    } catch (error) {
        console.error('加载统计数据失败:', error);
        // 使用默认数据
        animateNumber('totalSkills', 156);
        animateText('weeklyDownloads', '12.5K');
        animateText('activeUsers', '3.2K');
        animateNumber('proSkills', 28);
    }
}

// 数字动画
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000;
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);

        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// 文本动画
function animateText(elementId, targetText) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = targetText;
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';

    setTimeout(() => {
        element.style.transition = 'all 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 100);
}

// 加载Skill排名
async function loadSkillRankings() {
    const container = document.getElementById('skillRanking');
    if (!container) return;

    try {
        // 显示加载骨架屏 - 扩展到20个
        container.innerHTML = generateSkillSkeleton(20);

        // 获取数据
        const response = await fetch(`${API_BASE}/skills.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 根据当前筛选过滤
        let skills = data.skills;
        if (currentFilter !== 'all') {
            skills = skills.filter(skill => {
                if (currentFilter === 'pro') {
                    return skill.isPro;
                }
                return skill.category === currentFilter;
            });
        }

        // 渲染数据
        container.innerHTML = skills.map((skill, index) => createSkillItem(skill, index + 1)).join('');

        // 更新最后更新时间
        localStorage.setItem('openclaw_lastUpdate', Date.now());
        updateLastUpdateTime();
    } catch (error) {
        console.error('加载Skill排名失败:', error);
        // 使用默认数据渲染
        const defaultSkills = getDefaultSkills();
        let skills = defaultSkills;
        if (currentFilter !== 'all') {
            skills = skills.filter(skill => {
                if (currentFilter === 'pro') {
                    return skill.isPro;
                }
                return skill.category === currentFilter;
            });
        }
        container.innerHTML = skills.map((skill, index) => createSkillItem(skill, index + 1)).join('');

        // 更新最后更新时间
        localStorage.setItem('openclaw_lastUpdate', Date.now());
        updateLastUpdateTime();
    }
}

// 默认Skill数据（当JSON加载失败时使用）
function getDefaultSkills() {
    return [
        {
            id: "linkedin-automation",
            name: "LinkedIn Auto Connect",
            description: "自动发送LinkedIn好友请求，支持个性化消息模板，每日智能限额避免封号",
            category: "social",
            downloads: 4520,
            rating: 4.8,
            reviews: 128,
            author: "OpenClaw Team",
            version: "2.1.0",
            badges: ["hot"],
            isPro: false
        },
        {
            id: "invoice-processor",
            name: "Invoice Auto Processor",
            description: "智能识别发票信息，自动录入财务系统，支持PDF和图片格式",
            category: "productivity",
            downloads: 3890,
            rating: 4.9,
            reviews: 96,
            author: "AI Finance Lab",
            version: "1.5.2",
            badges: ["pro", "hot"],
            isPro: true,
            price: "$5"
        },
        {
            id: "polymarket-monitor",
            name: "Polymarket Odds Monitor",
            description: "实时监控Polymarket赔率变化，支持自定义阈值提醒和自动下注策略",
            category: "trading",
            downloads: 3210,
            rating: 4.7,
            reviews: 84,
            author: "CryptoBot Dev",
            version: "1.3.0",
            badges: ["pro", "new"],
            isPro: true,
            price: "$5"
        },
        {
            id: "ai-news-aggregator",
            name: "AI News Auto Publisher",
            description: "自动抓取AI新闻并发布到你的网站/公众号，支持多源聚合和智能摘要",
            category: "data",
            downloads: 2980,
            rating: 4.6,
            reviews: 72,
            author: "Content AI",
            version: "2.0.1",
            badges: ["hot"],
            isPro: false
        },
        {
            id: "crypto-whale-tracker",
            name: "Crypto Whale Tracker",
            description: "追踪加密货币巨鲸钱包动态，大额转账实时预警，支持ETH/BTC/SOL",
            category: "trading",
            downloads: 2650,
            rating: 4.8,
            reviews: 68,
            author: "ChainWatcher",
            version: "1.8.0",
            badges: ["pro"],
            isPro: true,
            price: "$5"
        },
        {
            id: "email-auto-reply",
            name: "Smart Email Auto-Reply",
            description: "基于AI的邮件自动回复，智能分类和优先级处理，支持Gmail/Outlook",
            category: "productivity",
            downloads: 2340,
            rating: 4.5,
            reviews: 56,
            author: "OpenClaw Team",
            version: "1.4.0",
            badges: [],
            isPro: false
        },
        {
            id: "xianyu-responder",
            name: "闲鱼自动回复助手",
            description: "自动回复闲鱼买家消息，智能议价和库存管理，支持多账号切换",
            category: "social",
            downloads: 2180,
            rating: 4.7,
            reviews: 92,
            author: "CN Automation",
            version: "1.2.5",
            badges: ["pro", "hot"],
            isPro: true,
            price: "$5"
        },
        {
            id: "file-organizer",
            name: "Intelligent File Organizer",
            description: "智能整理下载文件夹，按类型/日期自动分类，支持重复文件检测",
            category: "productivity",
            downloads: 1890,
            rating: 4.4,
            reviews: 45,
            author: "OpenClaw Team",
            version: "1.3.0",
            badges: [],
            isPro: false
        },
        {
            id: "rss-to-notion",
            name: "RSS to Notion Sync",
            description: "自动将RSS订阅同步到Notion数据库，支持标签分类和阅读状态追踪",
            category: "data",
            downloads: 1650,
            rating: 4.6,
            reviews: 38,
            author: "Notion Ninja",
            version: "1.1.0",
            badges: ["new"],
            isPro: false
        },
        {
            id: "weather-alert",
            name: "Weather Alert Pro",
            description: "精准天气预警，支持极端天气自动通知和出行建议，多城市监控",
            category: "productivity",
            downloads: 1420,
            rating: 4.3,
            reviews: 32,
            author: "Weather AI",
            version: "2.0.0",
            badges: [],
            isPro: false
        },
        {
            id: "github-issue-helper",
            name: "GitHub Issue Assistant",
            description: "自动分类和回复GitHub Issue，智能标签推荐和重复检测",
            category: "productivity",
            downloads: 1280,
            rating: 4.5,
            reviews: 28,
            author: "DevTools Pro",
            version: "1.2.0",
            badges: ["new"],
            isPro: false
        },
        {
            id: "twitter-growth",
            name: "Twitter Growth Booster",
            description: "Twitter自动涨粉工具，智能互动和内容排程，增长分析报告",
            category: "social",
            downloads: 1150,
            rating: 4.6,
            reviews: 42,
            author: "Social Growth Lab",
            version: "2.1.0",
            badges: ["pro"],
            isPro: true,
            price: "$5"
        },
        {
            id: "stock-screener",
            name: "Stock Screener AI",
            description: "AI股票筛选器，基于技术指标和基本面分析，自动生成选股报告",
            category: "trading",
            downloads: 980,
            rating: 4.4,
            reviews: 24,
            author: "Finance AI",
            version: "1.0.5",
            badges: ["new"],
            isPro: true,
            price: "$5"
        },
        {
            id: "meeting-transcriber",
            name: "Meeting Transcriber",
            description: "会议录音自动转录，生成摘要和待办事项，支持多语言",
            category: "productivity",
            downloads: 890,
            rating: 4.7,
            reviews: 36,
            author: "Productivity Hub",
            version: "1.5.0",
            badges: ["hot"],
            isPro: true,
            price: "$5"
        },
        {
            id: "reddit-monitor",
            name: "Reddit Keyword Monitor",
            description: "监控Reddit关键词提及，品牌舆情追踪，热门话题预警",
            category: "data",
            downloads: 760,
            rating: 4.3,
            reviews: 18,
            author: "Data Miner",
            version: "1.1.2",
            badges: [],
            isPro: false
        },
        {
            id: "calendar-sync",
            name: "Smart Calendar Sync",
            description: "多平台日历同步，智能冲突检测，会议自动安排",
            category: "productivity",
            downloads: 650,
            rating: 4.2,
            reviews: 15,
            author: "Time Manager",
            version: "1.0.8",
            badges: [],
            isPro: false
        },
        {
            id: "airbnb-pricing",
            name: "Airbnb Pricing Optimizer",
            description: "Airbnb动态定价优化，基于供需和竞品分析，收益最大化",
            category: "trading",
            downloads: 540,
            rating: 4.8,
            reviews: 22,
            author: "Rental AI",
            version: "1.3.0",
            badges: ["pro", "new"],
            isPro: true,
            price: "$5"
        },
        {
            id: "slack-summarizer",
            name: "Slack Channel Summarizer",
            description: "Slack频道消息自动摘要，关键信息提取，每日简报生成",
            category: "productivity",
            downloads: 480,
            rating: 4.4,
            reviews: 12,
            author: "Team Tools",
            version: "1.0.5",
            badges: [],
            isPro: false
        },
        {
            id: "etsy-listing",
            name: "Etsy Listing Optimizer",
            description: "Etsy商品列表优化，SEO关键词推荐，标题和描述生成",
            category: "social",
            downloads: 420,
            rating: 4.5,
            reviews: 16,
            author: "E-commerce AI",
            version: "1.2.0",
            badges: ["new"],
            isPro: true,
            price: "$5"
        }
    ];
}

// 创建Skill项HTML
function createSkillItem(skill, rank) {
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal';
    const topClass = rank <= 3 ? 'top-3' : '';

    const badgesHtml = skill.badges.map(badge => {
        const badgeClass = badge === 'pro' ? 'pro' : badge === 'new' ? 'new' : 'hot';
        const badgeText = badge === 'pro' ? 'PRO' : badge === 'new' ? 'NEW' : 'HOT';
        return `<span class="skill-badge ${badgeClass}">${badgeText}</span>`;
    }).join('');

    const priceHtml = skill.isPro
        ? `<div class="skill-downloads">${skill.price}</div><div class="skill-downloads-label">一次性购买</div>`
        : `<div class="skill-downloads">${formatNumber(skill.downloads)}</div><div class="skill-downloads-label">下载量</div>`;

    const installBtnText = skill.isPro ? '购买安装' : '免费安装';
    const installBtnClass = skill.isPro ? 'btn-install' : 'btn-install';

    return `
        <div class="skill-item ${topClass}" data-category="${skill.category}" data-pro="${skill.isPro}">
            <div class="skill-rank ${rankClass}">${rank}</div>
            <div class="skill-info">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <div class="skill-badges">${badgesHtml}</div>
                </div>
                <p class="skill-desc">${skill.description}</p>
                <div class="skill-meta">
                    <span>⭐ ${skill.rating}</span>
                    <span>💬 ${skill.reviews} 评价</span>
                    <span>👤 ${skill.author}</span>
                    <span>📦 v${skill.version}</span>
                </div>
            </div>
            <span class="skill-category">${getCategoryName(skill.category)}</span>
            <div class="skill-stats">
                ${priceHtml}
                <div class="skill-rating">⭐ ${skill.rating}</div>
            </div>
            <div class="skill-actions">
                <button class="${installBtnClass}" onclick="installSkill('${skill.id}', ${skill.isPro})">${installBtnText}</button>
                <button class="btn-details" onclick="showSkillDetails('${skill.id}')">详情</button>
            </div>
        </div>
    `;
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        'productivity': '效率办公',
        'social': '社媒运营',
        'data': '数据采集',
        'trading': '交易监控'
    };
    return names[category] || category;
}

// 生成Skill骨架屏
function generateSkillSkeleton(count) {
    return Array(count).fill(0).map(() => `
        <div class="skill-skeleton">
            <div class="skeleton-rank skeleton"></div>
            <div class="skeleton-content">
                <div class="skeleton-title skeleton"></div>
                <div class="skeleton-desc skeleton"></div>
            </div>
        </div>
    `).join('');
}

// 加载精选Skill
async function loadFeaturedSkills() {
    const container = document.getElementById('featuredSkills');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/skills.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        container.innerHTML = data.featured.map(skill => createFeaturedSkillCard(skill)).join('');
    } catch (error) {
        console.error('加载精选Skill失败:', error);
        // 使用默认数据
        const defaultFeatured = [
            {
                id: "linkedin-automation-pro",
                name: "LinkedIn Pro Suite",
                description: "企业级LinkedIn自动化套件，包含好友管理、消息群发、数据分析",
                category: "social",
                price: "$5",
                icon: "💼",
                downloads: 890
            },
            {
                id: "trading-bot-builder",
                name: "Trading Bot Builder",
                description: "可视化交易机器人构建器，支持多交易所API和策略回测",
                category: "trading",
                price: "$5",
                icon: "📈",
                downloads: 650
            },
            {
                id: "content-creator-suite",
                name: "Content Creator Suite",
                description: "AI内容创作套件，自动生成图文视频脚本，支持多平台发布",
                category: "productivity",
                price: "Free",
                icon: "✍️",
                downloads: 1200
            },
            {
                id: "data-scraper-pro",
                name: "Universal Data Scraper",
                description: "万能数据采集器，支持JS渲染页面和反爬虫绕过，可视化配置",
                category: "data",
                price: "$5",
                icon: "🔍",
                downloads: 780
            }
        ];
        container.innerHTML = defaultFeatured.map(skill => createFeaturedSkillCard(skill)).join('');
    }
}

// 创建精选Skill卡片
function createFeaturedSkillCard(skill) {
    const priceClass = skill.price === 'Free' ? 'free' : '';

    return `
        <div class="featured-skill-card">
            <div class="featured-skill-header">
                <div class="featured-skill-icon">${skill.icon}</div>
                <div class="featured-skill-info">
                    <h4>${skill.name}</h4>
                    <span>${getCategoryName(skill.category)} · ${formatNumber(skill.downloads)} 下载</span>
                </div>
            </div>
            <p class="featured-skill-desc">${skill.description}</p>
            <div class="featured-skill-footer">
                <span class="featured-skill-price ${priceClass}">${skill.price}</span>
                <button class="btn-details" onclick="showSkillDetails('${skill.id}')">查看详情</button>
            </div>
        </div>
    `;
}

// 初始化筛选标签
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 更新活动状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 更新筛选条件
            currentFilter = tab.dataset.category;

            // 重新加载Skill列表
            loadSkillRankings();
        });
    });
}

// 初始化平台切换
function initPlatformTabs() {
    const tabs = document.querySelectorAll('.platform-tab');
    const contents = document.querySelectorAll('.guide-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const platform = tab.dataset.platform;

            // 更新标签状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 更新内容显示
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.dataset.platform === platform) {
                    content.classList.add('active');
                }
            });

            currentPlatform = platform;
        });
    });
}

// 初始化代码复制功能
function initCopyButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const text = e.target.dataset.clipboard;

            navigator.clipboard.writeText(text).then(() => {
                const originalText = e.target.textContent;
                e.target.textContent = '已复制!';
                e.target.classList.add('copied');

                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        }
    });
}

// 检查用户登录状态
function checkAuthState() {
    const auth = localStorage.getItem('openclaw_auth');
    const loginBtn = document.getElementById('navLoginBtn');
    const userMenu = document.getElementById('userMenu');

    if (auth && loginBtn && userMenu) {
        const authData = JSON.parse(auth);
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userMenu.querySelector('.user-name').textContent = `👋 ${authData.user.username}`;
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('openclaw_auth');
    window.location.reload();
}

// 安装Skill
function installSkill(skillId, isPro) {
    // 检查是否已登录
    const auth = localStorage.getItem('openclaw_auth');

    if (isPro && !auth) {
        // 未登录，跳转到登录页
        showToast('🔒 请先登录以购买 Pro 技能');
        setTimeout(() => {
            window.location.href = `auth.html?redirect=${encodeURIComponent(window.location.href)}`;
        }, 1500);
        return;
    }

    if (isPro) {
        // 已登录，显示购买确认
        showPurchaseModal(skillId);
    } else {
        // 免费技能，直接复制安装命令
        const command = `openclaw skill install ${skillId}`;
        navigator.clipboard.writeText(command).then(() => {
            showToast('✅ 安装命令已复制到剪贴板');
        });
    }
}

// 显示Skill详情
function showSkillDetails(skillId) {
    // 这里可以扩展为打开详情弹窗或跳转到详情页
    showToast(`📖 正在加载 ${skillId} 的详细信息...`);
}

// 显示购买确认弹窗（已登录用户）
function showPurchaseModal(skillId) {
    // 获取技能信息
    const skill = getSkillById(skillId);
    if (!skill) return;

    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeLoginModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeLoginModal()">×</button>
            <div class="modal-header">
                <span class="modal-icon">🛒</span>
                <h3>确认购买</h3>
            </div>
            <div class="purchase-info">
                <h4>${skill.name}</h4>
                <p class="purchase-price">${skill.price}</p>
                <p class="purchase-desc">${skill.description}</p>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="processPurchase('${skillId}')">
                    <span>💳 确认购买</span>
                </button>
                <button class="btn-secondary" onclick="closeLoginModal()">取消</button>
            </div>
            <p class="modal-note">💡 购买后将获得永久使用权和后续更新</p>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

// 获取技能信息
function getSkillById(skillId) {
    // 从默认数据中查找
    const defaultSkills = getDefaultSkills();
    return defaultSkills.find(s => s.id === skillId);
}

// 处理购买
function processPurchase(skillId) {
    closeLoginModal();
    showToast('💳 正在处理支付...');

    // 模拟支付处理
    setTimeout(() => {
        showToast('✅ 购买成功！安装命令已复制');
        const command = `openclaw skill install ${skillId} --pro`;
        navigator.clipboard.writeText(command);
    }, 2000);
}

// 关闭弹窗
function closeLoginModal() {
    const modal = document.querySelector('.login-modal');
    if (modal) {
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        modal.querySelector('.modal-content').style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

// ========================================
// 免费技能列表弹窗
// ========================================

// 免费技能数据 - 扩展至50个常用技能
const freeSkillsData = [
    // 效率办公类 (Productivity)
    {
        id: "email-auto-reply",
        name: "Smart Email Auto-Reply",
        description: "基于AI的邮件自动回复，支持Gmail/Outlook",
        icon: "📧",
        downloads: 2340,
        rating: 4.5,
        category: "productivity"
    },
    {
        id: "file-organizer",
        name: "Intelligent File Organizer",
        description: "智能整理下载文件夹，按类型/日期自动分类",
        icon: "📁",
        downloads: 1890,
        rating: 4.4,
        category: "productivity"
    },
    {
        id: "weather-alert",
        name: "Weather Alert Pro",
        description: "精准天气预警，支持极端天气自动通知",
        icon: "🌤️",
        downloads: 1420,
        rating: 4.3,
        category: "productivity"
    },
    {
        id: "github-issue-helper",
        name: "GitHub Issue Assistant",
        description: "自动分类和回复GitHub Issue，智能标签推荐",
        icon: "🐙",
        downloads: 1280,
        rating: 4.5,
        category: "productivity"
    },
    {
        id: "calendar-sync",
        name: "Smart Calendar Sync",
        description: "多平台日历同步，智能冲突检测",
        icon: "📅",
        downloads: 650,
        rating: 4.2,
        category: "productivity"
    },
    {
        id: "slack-summarizer",
        name: "Slack Channel Summarizer",
        description: "Slack频道消息自动摘要，每日简报生成",
        icon: "💬",
        downloads: 480,
        rating: 4.4,
        category: "productivity"
    },
    {
        id: "todo-automation",
        name: "Smart Todo Manager",
        description: "智能待办事项管理，自动优先级排序",
        icon: "✅",
        downloads: 920,
        rating: 4.5,
        category: "productivity"
    },
    {
        id: "screenshot-organizer",
        name: "Screenshot Organizer",
        description: "自动整理截图，OCR识别文字并分类",
        icon: "📸",
        downloads: 1150,
        rating: 4.6,
        category: "productivity"
    },
    {
        id: "bookmark-manager",
        name: "Bookmark Manager",
        description: "智能书签管理，自动标签分类和失效检测",
        icon: "🔖",
        downloads: 680,
        rating: 4.3,
        category: "productivity"
    },
    {
        id: "expense-tracker",
        name: "Expense Tracker",
        description: "自动追踪消费记录，生成财务报表",
        icon: "💰",
        downloads: 540,
        rating: 4.4,
        category: "productivity"
    },
    {
        id: "habit-tracker",
        name: "Habit Tracker",
        description: "习惯养成追踪，智能提醒和数据分析",
        icon: "🎯",
        downloads: 890,
        rating: 4.5,
        category: "productivity"
    },
    {
        id: "note-sync",
        name: "Note Sync Pro",
        description: "跨平台笔记同步，支持Markdown和富文本",
        icon: "📝",
        downloads: 720,
        rating: 4.4,
        category: "productivity"
    },
    {
        id: "clipboard-manager",
        name: "Clipboard Manager",
        description: "剪贴板历史管理，支持搜索和分类",
        icon: "📋",
        downloads: 1560,
        rating: 4.7,
        category: "productivity"
    },
    {
        id: "password-generator",
        name: "Password Generator",
        description: "强密码生成器，支持自定义规则",
        icon: "🔐",
        downloads: 2100,
        rating: 4.6,
        category: "productivity"
    },
    {
        id: "time-tracker",
        name: "Time Tracker",
        description: "自动时间追踪，生成工作效率报告",
        icon: "⏱️",
        downloads: 430,
        rating: 4.3,
        category: "productivity"
    },
    {
        id: "pdf-merger",
        name: "PDF Merger",
        description: "PDF文件合并、拆分和压缩",
        icon: "📄",
        downloads: 1890,
        rating: 4.5,
        category: "productivity"
    },
    {
        id: "text-expander",
        name: "Text Expander",
        description: "文本快捷输入，支持自定义缩写",
        icon: "⌨️",
        downloads: 670,
        rating: 4.4,
        category: "productivity"
    },

    // 社媒运营类 (Social)
    {
        id: "linkedin-automation",
        name: "LinkedIn Auto Connect",
        description: "自动发送LinkedIn好友请求，支持个性化消息模板",
        icon: "💼",
        downloads: 4520,
        rating: 4.8,
        category: "social"
    },
    {
        id: "twitter-auto-post",
        name: "Twitter Auto Post",
        description: "Twitter定时发布，内容排程管理",
        icon: "🐦",
        downloads: 1230,
        rating: 4.4,
        category: "social"
    },
    {
        id: "instagram-downloader",
        name: "Instagram Downloader",
        description: "批量下载Instagram图片和视频",
        icon: "📷",
        downloads: 2890,
        rating: 4.6,
        category: "social"
    },
    {
        id: "youtube-transcript",
        name: "YouTube Transcript",
        description: "YouTube视频字幕提取和翻译",
        icon: "▶️",
        downloads: 1560,
        rating: 4.5,
        category: "social"
    },
    {
        id: "discord-bot-helper",
        name: "Discord Bot Helper",
        description: "Discord机器人消息自动回复和管理",
        icon: "🎮",
        downloads: 780,
        rating: 4.3,
        category: "social"
    },
    {
        id: "telegram-forwarder",
        name: "Telegram Forwarder",
        description: "Telegram消息自动转发和备份",
        icon: "✈️",
        downloads: 920,
        rating: 4.4,
        category: "social"
    },
    {
        id: "social-analytics",
        name: "Social Analytics",
        description: "社交媒体数据分析，生成互动报告",
        icon: "📊",
        downloads: 560,
        rating: 4.2,
        category: "social"
    },

    // 数据采集类 (Data)
    {
        id: "ai-news-aggregator",
        name: "AI News Auto Publisher",
        description: "自动抓取AI新闻并发布到网站/公众号",
        icon: "📰",
        downloads: 2980,
        rating: 4.6,
        category: "data"
    },
    {
        id: "rss-to-notion",
        name: "RSS to Notion Sync",
        description: "自动将RSS订阅同步到Notion数据库",
        icon: "🔄",
        downloads: 1650,
        rating: 4.6,
        category: "data"
    },
    {
        id: "reddit-monitor",
        name: "Reddit Keyword Monitor",
        description: "监控Reddit关键词提及，品牌舆情追踪",
        icon: "🔍",
        downloads: 760,
        rating: 4.3,
        category: "data"
    },
    {
        id: "web-scraper-lite",
        name: "Web Scraper Lite",
        description: "轻量级网页数据采集，支持JSON/CSV导出",
        icon: "🕷️",
        downloads: 1340,
        rating: 4.5,
        category: "data"
    },
    {
        id: "price-tracker",
        name: "Price Tracker",
        description: "商品价格监控，降价自动提醒",
        icon: "🏷️",
        downloads: 1890,
        rating: 4.7,
        category: "data"
    },
    {
        id: "news-summarizer",
        name: "News Summarizer",
        description: "新闻文章自动摘要，关键信息提取",
        icon: "📑",
        downloads: 1120,
        rating: 4.4,
        category: "data"
    },
    {
        id: "domain-monitor",
        name: "Domain Monitor",
        description: "域名到期监控，WHOIS信息追踪",
        icon: "🌐",
        downloads: 450,
        rating: 4.2,
        category: "data"
    },
    {
        id: "stock-price-alert",
        name: "Stock Price Alert",
        description: "股票价格预警，支持多交易所",
        icon: "📈",
        downloads: 780,
        rating: 4.3,
        category: "data"
    },

    // 开发工具类 (DevTools)
    {
        id: "git-commit-helper",
        name: "Git Commit Helper",
        description: "自动生成规范的Git提交信息",
        icon: "🌿",
        downloads: 2340,
        rating: 4.6,
        category: "devtools"
    },
    {
        id: "code-formatter",
        name: "Code Formatter",
        description: "代码自动格式化，支持多种语言",
        icon: "💻",
        downloads: 1560,
        rating: 4.5,
        category: "devtools"
    },
    {
        id: "api-tester",
        name: "API Tester",
        description: "API接口测试，自动生成测试报告",
        icon: "🔌",
        downloads: 890,
        rating: 4.4,
        category: "devtools"
    },
    {
        id: "log-analyzer",
        name: "Log Analyzer",
        description: "日志文件分析，错误自动归类",
        icon: "📜",
        downloads: 670,
        rating: 4.3,
        category: "devtools"
    },
    {
        id: "docker-cleanup",
        name: "Docker Cleanup",
        description: "自动清理Docker无用镜像和容器",
        icon: "🐳",
        downloads: 1120,
        rating: 4.5,
        category: "devtools"
    },
    {
        id: "env-manager",
        name: "Env Manager",
        description: "环境变量管理，支持多项目切换",
        icon: "⚙️",
        downloads: 560,
        rating: 4.2,
        category: "devtools"
    },

    // 生活助手类 (Lifestyle)
    {
        id: "water-reminder",
        name: "Water Reminder",
        description: "智能喝水提醒，健康习惯养成",
        icon: "💧",
        downloads: 890,
        rating: 4.4,
        category: "lifestyle"
    },
    {
        id: "meal-planner",
        name: "Meal Planner",
        description: "智能膳食规划，营养搭配建议",
        icon: "🍽️",
        downloads: 560,
        rating: 4.3,
        category: "lifestyle"
    },
    {
        id: "sleep-tracker",
        name: "Sleep Tracker",
        description: "睡眠质量追踪，智能闹钟",
        icon: "😴",
        downloads: 720,
        rating: 4.2,
        category: "lifestyle"
    },
    {
        id: "fitness-logger",
        name: "Fitness Logger",
        description: "运动数据记录，健身计划管理",
        icon: "💪",
        downloads: 450,
        rating: 4.1,
        category: "lifestyle"
    },
    {
        id: "reading-list",
        name: "Reading List",
        description: "阅读清单管理，阅读进度追踪",
        icon: "📚",
        downloads: 670,
        rating: 4.3,
        category: "lifestyle"
    },

    // 安全工具类 (Security)
    {
        id: "backup-automation",
        name: "Backup Automation",
        description: "文件自动备份，支持多云存储",
        icon: "💾",
        downloads: 1230,
        rating: 4.6,
        category: "security"
    },
    {
        id: "security-scanner",
        name: "Security Scanner",
        description: "系统安全扫描，漏洞检测提醒",
        icon: "🛡️",
        downloads: 780,
        rating: 4.4,
        category: "security"
    },
    {
        id: "privacy-cleaner",
        name: "Privacy Cleaner",
        description: "隐私数据清理，浏览痕迹删除",
        icon: "🧹",
        downloads: 1560,
        rating: 4.5,
        category: "security"
    }
];

// 免费技能分类
const freeSkillCategories = {
    productivity: "效率办公",
    social: "社媒运营",
    data: "数据采集",
    devtools: "开发工具",
    lifestyle: "生活助手",
    security: "安全工具"
};

// 显示免费技能弹窗
function showFreeSkillsModal() {
    const modal = document.getElementById('freeSkillsModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // 重置筛选状态
    currentCategoryFilter = 'all';
    currentSearchKeyword = '';

    // 重置搜索框
    const searchInput = document.getElementById('freeSkillsSearch');
    if (searchInput) searchInput.value = '';

    // 重置分类按钮
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    // 渲染免费技能列表
    renderFreeSkills(freeSkillsData);

    // 更新上次更新时间
    updateLastRefreshTime();
}

// 关闭免费技能弹窗
function closeFreeSkillsModal() {
    const modal = document.getElementById('freeSkillsModal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// 渲染免费技能列表
function renderFreeSkills(skills) {
    const container = document.getElementById('freeSkillsList');
    if (!container) return;

    if (skills.length === 0) {
        container.innerHTML = '<div class="no-results">未找到匹配的技能</div>';
        return;
    }

    container.innerHTML = skills.map(skill => `
        <div class="free-skill-item" data-id="${skill.id}" data-name="${skill.name.toLowerCase()}" data-category="${skill.category}">
            <div class="free-skill-icon">${skill.icon}</div>
            <div class="free-skill-info">
                <h4>${skill.name}</h4>
                <p>${skill.description}</p>
                <span class="skill-category-tag">${freeSkillCategories[skill.category] || skill.category}</span>
            </div>
            <div class="free-skill-meta">
                <div class="free-skill-stats">
                    <div class="downloads">${formatNumber(skill.downloads)}</div>
                    <div class="rating">⭐ ${skill.rating}</div>
                </div>
                <button class="btn-copy-install" onclick="copyInstallCommand('${skill.id}', this)"
                    data-command="openclaw skill install ${skill.id}">
                    📋 复制安装
                </button>
            </div>
        </div>
    `).join('');
}

// 当前筛选状态
let currentCategoryFilter = 'all';
let currentSearchKeyword = '';

// 筛选免费技能
function filterFreeSkills() {
    const searchInput = document.getElementById('freeSkillsSearch');
    if (!searchInput) return;

    currentSearchKeyword = searchInput.value.toLowerCase().trim();
    applyFilters();
}

// 按分类筛选
function filterByCategory(category) {
    currentCategoryFilter = category;

    // 更新按钮状态
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    applyFilters();
}

// 应用筛选条件
function applyFilters() {
    let filtered = freeSkillsData;

    // 应用分类筛选
    if (currentCategoryFilter !== 'all') {
        filtered = filtered.filter(skill => skill.category === currentCategoryFilter);
    }

    // 应用搜索筛选
    if (currentSearchKeyword) {
        filtered = filtered.filter(skill =>
            skill.name.toLowerCase().includes(currentSearchKeyword) ||
            skill.description.toLowerCase().includes(currentSearchKeyword)
        );
    }

    renderFreeSkills(filtered);
}

// 刷新免费技能列表
function refreshFreeSkills() {
    const btn = document.querySelector('.btn-refresh');
    if (btn) {
        btn.classList.add('loading');
        btn.textContent = '🔄 更新中...';
    }

    // 模拟从服务器获取最新数据
    setTimeout(() => {
        // 随机更新下载量，模拟实时数据
        freeSkillsData.forEach(skill => {
            const increment = Math.floor(Math.random() * 50);
            skill.downloads += increment;
        });

        // 按下载量重新排序
        freeSkillsData.sort((a, b) => b.downloads - a.downloads);

        // 更新上次更新时间
        updateLastRefreshTime();

        // 重新渲染
        applyFilters();

        if (btn) {
            btn.classList.remove('loading');
            btn.textContent = '🔄 立即更新';
        }

        showToast('✅ 技能列表已更新');
    }, 1000);
}

// 更新上次刷新时间显示
function updateLastRefreshTime() {
    const lastUpdateEl = document.getElementById('freeSkillsLastUpdate');
    if (lastUpdateEl) {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdateEl.textContent = `上次更新: ${timeStr}`;
    }
}

// 设置定期自动更新（每24小时）
function setupAutoUpdate() {
    // 检查是否需要自动更新
    const lastUpdate = localStorage.getItem('freeSkillsLastUpdate');
    const now = Date.now();

    if (lastUpdate) {
        const hoursSinceLastUpdate = (now - parseInt(lastUpdate)) / (1000 * 60 * 60);

        // 如果超过24小时，自动刷新
        if (hoursSinceLastUpdate >= 24) {
            console.log('免费技能列表已过期，自动刷新...');
            refreshFreeSkills();
        }
    }

    // 保存当前时间作为最后更新时间
    localStorage.setItem('freeSkillsLastUpdate', now.toString());

    // 设置定时器，每24小时检查一次
    setInterval(() => {
        refreshFreeSkills();
        localStorage.setItem('freeSkillsLastUpdate', Date.now().toString());
    }, 24 * 60 * 60 * 1000);
}

// 复制安装命令
function copyInstallCommand(skillId, button) {
    const command = `openclaw skill install ${skillId}`;

    navigator.clipboard.writeText(command).then(() => {
        // 更新按钮状态
        const originalText = button.textContent;
        button.textContent = '✅ 已复制';
        button.classList.add('copied');

        showToast(`✅ ${skillId} 安装命令已复制`);

        // 恢复按钮状态
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('❌ 复制失败，请手动复制');
    });
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    const freeSkillsModal = document.getElementById('freeSkillsModal');
    const pricingModal = document.getElementById('pricingModal');
    if (event.target === freeSkillsModal) {
        closeFreeSkillsModal();
    }
    if (event.target === pricingModal) {
        closePricingModal();
    }
}

// ========== Pro版定价弹窗功能 ==========

// 显示定价弹窗
function showPricingModal() {
    const modal = document.getElementById('pricingModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // 渲染Pro技能列表
    renderProSkillsList();
}

// 关闭定价弹窗
function closePricingModal() {
    const modal = document.getElementById('pricingModal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// 渲染Pro技能列表
function renderProSkillsList() {
    const container = document.getElementById('proSkillsList');
    if (!container) return;

    // 从skillsData中筛选出Pro技能（价格>0）
    const proSkills = skillsData.filter(skill => skill.price > 0);

    if (proSkills.length === 0) {
        container.innerHTML = '<div class="no-results">暂无Pro技能</div>';
        return;
    }

    container.innerHTML = proSkills.map(skill => `
        <div class="pro-skill-item" data-id="${skill.id}" data-name="${skill.name.toLowerCase()}">
            <div class="pro-skill-icon">${skill.icon}</div>
            <div class="pro-skill-info">
                <h4>${skill.name}</h4>
                <p>${skill.description}</p>
            </div>
            <div class="pro-skill-price">$${skill.price}</div>
            <div class="pro-skill-action">
                <button class="btn-buy-skill" onclick="handleBuySkill('${skill.id}', '${skill.name}', ${skill.price})">
                    购买
                </button>
            </div>
        </div>
    `).join('');
}

// 筛选Pro技能
function filterProSkills() {
    const searchInput = document.getElementById('proSkillsSearch');
    if (!searchInput) return;

    const keyword = searchInput.value.toLowerCase().trim();
    const proSkills = skillsData.filter(skill => skill.price > 0);

    if (!keyword) {
        renderProSkillsList();
        return;
    }

    const filtered = proSkills.filter(skill =>
        skill.name.toLowerCase().includes(keyword) ||
        skill.description.toLowerCase().includes(keyword)
    );

    const container = document.getElementById('proSkillsList');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-results">未找到匹配的Pro技能</div>';
        return;
    }

    container.innerHTML = filtered.map(skill => `
        <div class="pro-skill-item" data-id="${skill.id}" data-name="${skill.name.toLowerCase()}">
            <div class="pro-skill-icon">${skill.icon}</div>
            <div class="pro-skill-info">
                <h4>${skill.name}</h4>
                <p>${skill.description}</p>
            </div>
            <div class="pro-skill-price">$${skill.price}</div>
            <div class="pro-skill-action">
                <button class="btn-buy-skill" onclick="handleBuySkill('${skill.id}', '${skill.name}', ${skill.price})">
                    购买
                </button>
            </div>
        </div>
    `).join('');
}

// 处理购买技能
function handleBuySkill(skillId, skillName, price) {
    // 检查用户是否登录
    const isLoggedIn = localStorage.getItem('openclaw_user') !== null;

    if (!isLoggedIn) {
        showToast('🔑 请先登录后再购买');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1500);
        return;
    }

    // 已登录，显示购买确认
    if (confirm(`确认购买 "${skillName}"?\n价格: $${price}\n\n购买后将永久拥有该Skill的使用权。`)) {
        showToast(`🛒 ${skillName} 已加入购物车，正在跳转到支付...`);
        // 这里可以集成实际的支付流程
    }
}

// 显示Toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 0.9rem;
        z-index: 9999;
        animation: slideInUp 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 初始化导航
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // 点击导航
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // 如果是外部链接（不以#开头），允许默认跳转
            if (!href.startsWith('#')) {
                return;
            }

            e.preventDefault();
            const targetId = href.slice(1);
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

// 初始化订阅表单
function initSubscribeForm() {
    const form = document.getElementById('subscribeForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;

        // 模拟提交
        showToast(`感谢订阅! 确认邮件已发送至 ${email}`);
        form.reset();
    });
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

// 启动实时时钟和自动更新
function startLiveClock() {
    console.log('OpenClaw Hub 实时时钟已启动');

    // 初始化更新时间显示
    updateLastUpdateTime();

    // 每分钟更新倒计时
    setInterval(updateNextUpdateTime, 60000);

    // 每24小时自动刷新数据
    setInterval(() => {
        console.log('24小时自动更新触发');
        loadSkillRankings();
        updateLastUpdateTime();
    }, 24 * 60 * 60 * 1000); // 24小时
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('lastUpdateTime');
    const nextUpdateEl = document.getElementById('nextUpdate');

    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = now.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (nextUpdateEl) {
        updateNextUpdateTime();
    }
}

// 更新下次更新时间倒计时
function updateNextUpdateTime() {
    const nextUpdateEl = document.getElementById('nextUpdate');
    if (!nextUpdateEl) return;

    // 从 localStorage 获取上次更新时间
    let lastUpdate = localStorage.getItem('openclaw_lastUpdate');
    if (!lastUpdate) {
        lastUpdate = Date.now();
        localStorage.setItem('openclaw_lastUpdate', lastUpdate);
    }

    const nextUpdate = parseInt(lastUpdate) + (24 * 60 * 60 * 1000); // 24小时后
    const now = Date.now();
    const diff = nextUpdate - now;

    if (diff <= 0) {
        // 需要更新了
        nextUpdateEl.textContent = '即将更新...';
        localStorage.setItem('openclaw_lastUpdate', Date.now());
        loadSkillRankings();
    } else {
        // 显示倒计时
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        nextUpdateEl.textContent = `${hours}小时${minutes}分钟后`;
    }
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('OpenClaw Hub 全局错误:', e.error);
});

// 网络状态监听
window.addEventListener('online', () => {
    console.log('网络已连接');
    showToast('网络已恢复');
});

window.addEventListener('offline', () => {
    console.log('网络已断开');
    showToast('网络已断开，部分功能可能不可用');
});
