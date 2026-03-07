# Vercel 环境变量配置

## 需要在 Vercel Dashboard 配置的环境变量

登录 https://vercel.com/dashboard → 选择项目 → Settings → Environment Variables

添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `PRODUCT_HUNT_TOKEN` | `aJhzr8DbV72g1pxSwdGEhQ8qPW8KXVW7kFtxm8wDH08` | Production |
| `PRODUCT_HUNT_TOKEN` | `aJhzr8DbV72g1pxSwdGEhQ8qPW8KXVW7kFtxm8wDH08` | Preview |

## 或者使用 Vercel CLI 配置

```bash
vercel env add PRODUCT_HUNT_TOKEN
# 输入 token: aJhzr8DbV72g1pxSwdGEhQ8qPW8KXVW7kFtxm8wDH08
# 选择环境: Production

vercel env add PRODUCT_HUNT_TOKEN
# 输入 token: aJhzr8DbV72g1pxSwdGEhQ8qPW8KXVW7kFtxm8wDH08
# 选择环境: Preview
```

## 配置完成后

重新部署项目：
```bash
vercel --prod
```

## 功能说明

配置后，新发行AI应用数据将：
1. 每12小时自动从 Product Hunt 抓取最新AI产品
2. 筛选AI相关产品并更新到 new-apps.json
3. 自动更新下载量和趋势数据
