# AI Hub - Vercel + Upstash Redis 部署指南

## 方案说明

使用 **Vercel** 托管网站 + **Upstash Redis** 实现数据持久化

## 部署步骤

### 1. 注册 Upstash 账号
- 访问 https://console.upstash.com/
- 用 GitHub 账号登录
- 创建新的 Redis 数据库
- 复制 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

### 2. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 3. 登录 Vercel
```bash
vercel login
```

### 4. 部署项目
```bash
cd ai-news-hub
vercel
```

### 5. 配置环境变量
在 Vercel Dashboard -> Settings -> Environment Variables 中添加：

| 变量名 | 说明 |
|--------|------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |
| `FEISHU_WEBHOOK` | 飞书机器人 Webhook 地址（可选） |

### 6. 重新部署
```bash
vercel --prod
```

### 7. 绑定自定义域名（可选）
在 Vercel Dashboard -> Settings -> Domains 中添加你的域名

## 部署后访问地址

- Vercel 地址：`https://ai-news-hub-xxx.vercel.app`

## 数据持久化说明

- **Redis 免费额度**：每天 10,000 次请求
- **数据存储**：所有数据自动同步到 Upstash Redis
- **多实例共享**：所有 Vercel 实例共享同一份数据

## 定时任务（可选）

由于 Vercel Serverless 不支持后台定时任务，可以使用：

1. **GitHub Actions** - 免费，每12小时触发一次数据更新
2. **Vercel Cron Jobs** - 付费功能
3. **外部定时服务** - 如 cron-job.org

## 费用

- **Vercel**：免费（每月 100GB 带宽）
- **Upstash Redis**：免费（每天 10,000 请求）
- **总计**：$0/月

## 监控

- Vercel Dashboard：查看访问日志和性能
- Upstash Console：查看 Redis 使用情况和命中率
