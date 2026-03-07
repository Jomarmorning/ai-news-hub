# 自动翻译配置指南

## 概述

新发行AI应用排行榜现在支持自动翻译功能。当从 Product Hunt 获取新数据时，英文描述会自动翻译成中文。

## 配置有道翻译 API

### 1. 注册有道智云账号

访问 [有道智云](https://ai.youdao.com/) 注册账号并创建应用。

### 2. 获取 API 密钥

1. 登录有道智云控制台
2. 创建应用，选择"文本翻译"服务
3. 获取 **应用ID** (appKey) 和 **应用密钥** (appSecret)

### 3. 配置环境变量

#### 本地开发

在项目根目录创建 `.env` 文件：

```bash
YOUDAO_APP_KEY=你的应用ID
YOUDAO_APP_SECRET=你的应用密钥
```

#### GitHub Actions

在 GitHub 仓库设置中添加 Secrets：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 secrets：
   - `YOUDAO_APP_KEY`: 你的应用ID
   - `YOUDAO_APP_SECRET`: 你的应用密钥

### 4. 更新 GitHub Actions 工作流

编辑 `.github/workflows/main.yml`，添加翻译相关的环境变量：

```yaml
- name: Update data
  env:
    PRODUCT_HUNT_TOKEN: ${{ secrets.PRODUCT_HUNT_TOKEN }}
    YOUDAO_APP_KEY: ${{ secrets.YOUDAO_APP_KEY }}
    YOUDAO_APP_SECRET: ${{ secrets.YOUDAO_APP_SECRET }}
  run: node update-data.js
```

## 翻译缓存

翻译结果会被缓存到 `.translation-cache.json` 文件中，避免重复翻译相同的内容。

- 缓存文件已添加到 `.gitignore`，不会被提交到仓库
- 每次翻译前会先检查缓存，提高性能并节省 API 调用次数

## 免费额度

有道翻译 API 提供一定的免费调用额度，具体请参考 [有道智云官方文档](https://ai.youdao.com/doc.s)。

## 手动测试翻译功能

```bash
# 设置环境变量并运行脚本
export YOUDAO_APP_KEY=你的应用ID
export YOUDAO_APP_SECRET=你的应用密钥
node scripts/fetchNewApps.js
```

## 注意事项

1. 如果没有配置翻译 API，脚本会保持原始英文描述
2. 翻译 API 调用失败时会自动回退到原始文本
3. 只有纯英文的描述才会被翻译，已经是中文的会保持不变
