# Digital Filter System (彩票九层精筛系统 - 纯前端版)

这是一个重构后的纯前端彩票开奖数据分析和预测平台，无需后端服务器或数据库即可直接运行。

## 🌟 核心功能

- **纯前端运行**: 所有的筛选算法和逻辑均在浏览器中执行。
- **九层精筛算法**: 包含从 L9 到 L1 的完整筛选逻辑。
- **AI 四维评分**: 结合和值、跨度、冷热码等维度的综合评估。
- **数据本地化**: 使用 `localStorage` 保存您的筛选历史和 L6 命中统计。
- **赛博朋克 UI**: 现代化的玻璃拟态风格仪表盘。

## 🛠 技术栈

- **框架**: React, TypeScript, Vite
- **样式**: TailwindCSS, Radix UI, Lucide Icons
- **算法**: 自研九层筛选与四维评分逻辑
- **部署**: GitHub Pages (静态托管)

## 🚀 快速开始

### 安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/xigoodone-netizen/digital-filter-system.git
   cd digital-filter-system
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   pnpm dev
   ```

## 📂 部署到 GitHub Pages

项目已配置 GitHub Actions 自动部署。每次推送到 `main` 分支时，都会自动构建并发布。

## ⚖️ License

MIT


# Deployment Triggered
