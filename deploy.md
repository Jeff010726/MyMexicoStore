# GitHub Pages 部署指南

## 🚀 自动部署配置

本项目已配置GitHub Actions自动部署到GitHub Pages。

### 部署步骤

1. **推送代码到GitHub仓库**
   ```bash
   git add .
   git commit -m "feat: 完成电商系统开发，配置GitHub Pages部署"
   git push origin main
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库设置页面
   - 找到 "Pages" 选项
   - Source 选择 "GitHub Actions"
   - 保存设置

3. **配置仓库权限**
   - 进入 Settings > Actions > General
   - 在 "Workflow permissions" 中选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

### 环境变量配置

项目使用以下环境变量：

- `VITE_API_BASE_URL`: Cloudflare Workers API地址
  - 生产环境: `https://ecommerce-api.jeff010726bd.workers.dev`
  - 开发环境: `http://localhost:8787`

### 部署后访问地址

部署成功后，网站将在以下地址可用：
- **GitHub Pages**: `https://jeff010726.github.io/MyMexicoStore/`

### 自动部署触发条件

- 推送到 `main` 或 `master` 分支
- 创建Pull Request到 `main` 或 `master` 分支

### 部署状态检查

1. 查看Actions页面: `https://github.com/Jeff010726/MyMexicoStore/actions`
2. 检查部署状态和日志
3. 确认GitHub Pages设置正确

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
MyMexicoStore/
├── .github/workflows/deploy.yml  # GitHub Actions配置
├── src/                          # 前端源码
├── workers/                      # Cloudflare Workers后端
├── dist/                         # 构建输出目录
└── deploy.md                     # 部署指南
```

## 🌐 相关链接

- **GitHub仓库**: https://github.com/Jeff010726/MyMexicoStore
- **Cloudflare Workers API**: https://ecommerce-api.jeff010726bd.workers.dev
- **GitHub Pages**: https://jeff010726.github.io/MyMexicoStore/

## 🛠️ 故障排除

### 常见问题

1. **部署失败**
   - 检查GitHub Actions日志
   - 确认仓库权限设置正确
   - 验证package.json中的scripts配置

2. **页面无法访问**
   - 确认GitHub Pages已启用
   - 检查base路径配置是否正确
   - 验证构建输出目录结构

3. **API请求失败**
   - 确认Cloudflare Workers API正常运行
   - 检查CORS配置
   - 验证API_BASE_URL环境变量

### 手动部署

如果自动部署失败，可以手动构建和部署：

```bash
# 构建项目
npm run build

# 部署到GitHub Pages (需要安装gh-pages)
npm install -g gh-pages
gh-pages -d dist