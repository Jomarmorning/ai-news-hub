#!/bin/bash
# AI Hub 部署脚本

echo "🚀 开始部署 AI Hub 到 Vercel..."

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm i -g vercel
fi

# 设置环境变量
echo "🔧 配置环境变量..."
export UPSTASH_REDIS_REST_URL="https://fresh-hound-42880.upstash.io"
export UPSTASH_REDIS_REST_TOKEN="AaeAAAIncDJlNTk3NzYxNjNhY2U0ZDQ1OGIwMTE2ZTY4ZmYyZDNhN3AyNDI4ODA"

# 部署
echo "🚀 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "请访问 Vercel Dashboard 查看部署状态"
