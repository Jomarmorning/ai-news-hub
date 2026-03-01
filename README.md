# AI Hub - AI资讯聚合平台

一个现代化的AI资讯网站，聚合全球AI应用下载热度、盈利能力与最新热点资讯。

## 功能特性

- **下载热度排行**: 近一周全球AI应用下载量Top 10
- **盈利能力榜单**: AI应用收入与付费能力排名
- **热点资讯**: 最新人工智能行业动态与突破
- **实时更新**: 每6小时自动抓取最新数据
- **响应式设计**: 完美适配桌面和移动设备

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (原生)
- **后端**: Node.js, Express
- **数据抓取**: Axios, Cheerio
- **定时任务**: node-cron

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问网站

打开浏览器访问 http://localhost:3000

## 项目结构

```
ai-news-hub/
├── public/           # 静态文件
│   ├── index.html   # 主页面
│   ├── css/         # 样式文件
│   └── js/          # 前端脚本
├── services/        # 后端服务
│   └── dataService.js
├── data/            # 数据存储
├── server.js        # 主服务器
└── package.json
```

## API 接口

| 接口 | 描述 |
|------|------|
| GET /api/rankings/download | 下载热度排名 |
| GET /api/rankings/revenue | 盈利能力排名 |
| GET /api/news | 热点资讯 |
| GET /api/all | 所有数据 |
| POST /api/refresh | 手动刷新数据 |

## 数据更新

- **自动更新**: 每6小时自动抓取最新数据
- **手动更新**: 访问 `POST /api/refresh` 触发更新

## 自定义配置

编辑 `.env` 文件修改配置:

```env
PORT=3000
UPDATE_INTERVAL=6h
```

## License

MIT
