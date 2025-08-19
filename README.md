# 🛒 MyMexicoStore - 无服务器电商独立站

基于GitHub Pages和Cloudflare搭建的无需租用服务器的电商独立站，专为墨西哥市场设计的日用品爆款商城。

## 🌟 项目特色

- 🚀 **无服务器架构** - 使用Cloudflare Workers + GitHub Pages，零服务器成本
- 💳 **Airwallex支付集成** - 专为墨西哥市场优化的支付解决方案
- 🎨 **可视化页面编辑器** - 类似Shopify的拖拽式页面编辑功能
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔧 **完整后台管理** - 商品管理、订单管理、客户管理
- 🎯 **日用品爆款风格** - 温馨生活化界面，突出性价比

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS** - 原子化CSS框架
- **Shadcn/ui** - 高质量UI组件库
- **React Router** - 客户端路由
- **Lucide React** - 精美图标库

### 后端
- **Cloudflare Workers** - 边缘计算平台
- **Cloudflare KV** - 键值存储
- **Cloudflare D1** - SQLite数据库
- **Cloudflare R2** - 对象存储

### 支付系统
- **Airwallex API** - 国际支付解决方案
- 支持墨西哥本地支付方式

### 部署
- **GitHub Pages** - 静态网站托管
- **GitHub Actions** - 自动化CI/CD
- **Cloudflare CDN** - 全球加速

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Git

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/Jeff010726/MyMexicoStore.git
   cd MyMexicoStore
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   - 前台页面: http://localhost:5173
   - 管理后台: http://localhost:5173/admin

### 部署到生产环境

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "部署到生产环境"
   git push origin main
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库设置
   - 找到"Pages"选项
   - Source选择"GitHub Actions"

3. **访问生产环境**
   - 网站地址: https://jeff010726.github.io/MyMexicoStore/

## 📁 项目结构

```
MyMexicoStore/
├── 📁 .github/workflows/     # GitHub Actions配置
├── 📁 src/                   # 前端源码
│   ├── 📁 components/        # React组件
│   ├── 📁 pages/            # 页面组件
│   ├── 📁 hooks/            # 自定义Hooks
│   ├── 📁 store/            # 状态管理
│   └── 📁 config/           # 配置文件
├── 📁 workers/              # Cloudflare Workers后端
│   ├── 📁 src/              # Workers源码
│   └── 📄 wrangler.toml     # Workers配置
├── 📄 package.json          # 项目依赖
├── 📄 vite.config.ts        # Vite配置
└── 📄 README.md             # 项目文档
```

## 🎯 核心功能

### 🛍️ 前台功能
- **商品展示** - 精美的商品列表和详情页
- **购物车** - 完整的购物车和结算流程
- **支付系统** - Airwallex支付集成
- **响应式设计** - 完美适配各种设备

### 🔧 管理后台
- **商品管理** - 商品的增删改查，支持图片上传
- **订单管理** - 订单查看、状态更新、导出功能
- **客户管理** - 客户信息管理和订单历史
- **页面编辑器** - 可视化拖拽编辑页面

### 🎨 页面编辑器
- **拖拽组件** - 文本、图片、按钮等基础组件
- **属性编辑** - 实时编辑组件样式和内容
- **模板系统** - 保存和应用页面模板
- **动态渲染** - 前台实时展示编辑结果

## 🌐 API接口

### Cloudflare Workers API
- **基础地址**: https://ecommerce-api.jeff010726bd.workers.dev
- **健康检查**: GET /health
- **商品接口**: /api/products
- **订单接口**: /api/orders
- **用户接口**: /api/users
- **支付接口**: /api/payment
- **上传接口**: /api/upload

## 🎨 设计风格

### 色彩方案
- **主色调**: 粉橙色渐变 (from-pink-500 to-orange-400)
- **辅助色**: 蓝色、绿色、灰色系
- **背景色**: 白色为主，浅色点缀

### 设计理念
- **温馨生活化** - 突出家庭日用品的实用性
- **性价比导向** - 强调优惠价格和实用价值
- **简洁易用** - 清晰的导航和操作流程

## 🔐 环境变量

```bash
# Cloudflare Workers API地址
VITE_API_BASE_URL=https://ecommerce-api.jeff010726bd.workers.dev

# Airwallex配置
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_API_KEY=your_api_key
```

## 📊 性能优化

- **代码分割** - 按路由和组件分割代码
- **图片优化** - 使用Cloudflare R2存储和CDN
- **缓存策略** - 合理的浏览器和CDN缓存
- **懒加载** - 组件和图片懒加载

## 🛡️ 安全特性

- **HTTPS** - 全站HTTPS加密
- **CORS配置** - 严格的跨域访问控制
- **输入验证** - 前后端双重数据验证
- **权限控制** - 管理后台访问权限

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- **GitHub仓库**: https://github.com/Jeff010726/MyMexicoStore
- **在线演示**: https://jeff010726.github.io/MyMexicoStore/
- **API文档**: https://ecommerce-api.jeff010726bd.workers.dev/health
- **Cloudflare Workers**: https://workers.cloudflare.com/
- **Airwallex**: https://www.airwallex.com/

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- **GitHub Issues**: https://github.com/Jeff010726/MyMexicoStore/issues
- **Email**: jeff010726@example.com

---

⭐ 如果这个项目对您有帮助，请给它一个星标！