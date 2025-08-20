# 墨西哥电商独立站项目总结

## 项目概述
这是一个基于GitHub Pages + Cloudflare Workers的无服务器电商独立站，专门面向墨西哥市场，集成了Airwallex支付系统。

### 核心架构
- **前端**: React + TypeScript + Vite + Shadcn/ui + Tailwind CSS
- **后端**: Cloudflare Workers + Hono框架
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare KV + R2
- **支付**: Airwallex API (支持墨西哥本地支付)
- **部署**: GitHub Pages + GitHub Actions

## 重要的线上地址
- **网站地址**: https://jeff010726.github.io/MyMexicoStore/#/
- **GitHub仓库**: https://github.com/Jeff010726/MyMexicoStore
- **API地址**: https://ecommerce-api.jeff010726bd.workers.dev
- **Cloudflare Dashboard**: 需要登录jeff010726bd账户

## 关键技术决策与解决方案

### 1. SPA路由问题解决
**问题**: GitHub Pages不支持SPA路由，会出现404错误
**解决方案**: 使用HashRouter替代BrowserRouter
```typescript
// src/App.tsx - 不能修改这个路由配置
import { HashRouter as Router } from 'react-router-dom';
```

### 2. CORS跨域问题解决
**配置位置**: `workers/src/index.ts`
```typescript
// 关键CORS配置 - 不能删除
app.use('*', cors({
  origin: ['https://jeff010726.github.io', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### 3. 环境变量配置
**位置**: `workers/wrangler.toml`
```toml
[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://jeff010726.github.io"
JWT_SECRET = "your-super-secret-jwt-key-2024-ecommerce-api-secure"
AIRWALLEX_API_KEY = "test-api-key"
AIRWALLEX_WEBHOOK_SECRET = "test-webhook-secret"
```

## 数据库架构

### 已创建的表结构
1. **products** - 商品表
2. **orders** - 订单表  
3. **users** - 用户表
4. **pages** - 动态页面表
5. **templates** - 页面模板表

### 数据库操作命令
```bash
# 远程数据库初始化（已完成）
cd workers && npx wrangler d1 execute ecommerce-db --remote --file schema.sql

# 添加测试数据（已完成）
cd workers && npx wrangler d1 execute ecommerce-db --remote --file seed-data.sql

# 查看表结构
npx wrangler d1 execute ecommerce-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

## API路由结构

### 公开API（无需认证）
- `GET /products` - 获取商品列表
- `GET /products/:id` - 获取单个商品
- `POST /users/register` - 用户注册
- `POST /users/login` - 用户登录
- `POST /payment/*` - 支付相关
- `POST /airwallex/*` - Airwallex支付

### 管理员API（需要JWT认证）
- `POST /admin/products` - 创建商品
- `PUT /admin/products/:id` - 更新商品
- `DELETE /admin/products/:id` - 删除商品
- `GET /admin/orders` - 订单管理
- `POST /admin/upload` - 文件上传

## 关键文件说明

### 不能修改的核心文件
1. **`src/App.tsx`** - 主应用组件，包含HashRouter配置
2. **`workers/wrangler.toml`** - Cloudflare Workers配置
3. **`workers/src/index.ts`** - Workers主入口，包含CORS配置
4. **`.github/workflows/deploy.yml`** - GitHub Actions部署配置

### 可以安全修改的文件
1. **`src/pages/*`** - 页面组件
2. **`src/components/*`** - UI组件
3. **`workers/src/routes/*`** - API路由处理
4. **`src/store/useStore.ts`** - 状态管理

## 部署流程

### 前端部署（自动）
1. 推送代码到GitHub
2. GitHub Actions自动构建并部署到GitHub Pages
3. 访问 https://jeff010726.github.io/MyMexicoStore/#/

### 后端部署（手动）
```bash
cd workers
npx wrangler deploy
```

## 已解决的关键问题

### 1. Workers 500错误
**原因**: 环境变量未配置、数据库未初始化
**解决**: 配置环境变量 + 远程数据库初始化

### 2. 商品页面空白
**原因**: API路由配置错误（/api/products vs /products）
**解决**: 统一使用无前缀路由

### 3. 占位图片404
**原因**: 使用了不存在的本地图片路径
**解决**: 使用 `/placeholder.svg?height=300&width=300` 格式

## 支付系统集成

### Airwallex配置
- **测试环境**: 使用test-api-key
- **支持币种**: MXN (墨西哥比索)
- **支付方式**: 信用卡、借记卡、本地支付方式

### 支付流程
1. 用户选择商品加入购物车
2. 填写收货信息
3. 选择支付方式
4. 调用Airwallex API创建支付
5. 跳转到支付页面
6. 支付成功后回调处理

## 开发调试

### 本地开发
```bash
# 前端开发服务器
npm run dev

# Workers本地开发
cd workers
npx wrangler dev
```

### 日志查看
```bash
# 查看Workers实时日志
cd workers
npx wrangler tail
```

## 性能优化要点

1. **KV缓存**: 商品数据缓存5分钟，减少数据库查询
2. **图片优化**: 使用占位符图片，避免大文件加载
3. **代码分割**: React路由懒加载
4. **CDN加速**: 通过Cloudflare全球CDN加速

## 安全考虑

1. **JWT认证**: 管理员功能需要JWT token
2. **CORS限制**: 只允许指定域名访问API
3. **输入验证**: 所有API输入都进行验证
4. **环境变量**: 敏感信息通过环境变量管理

## 故障排查指南

### API返回500错误
1. 检查环境变量是否正确配置
2. 确认数据库是否初始化
3. 查看Workers日志: `npx wrangler tail`

### 前端页面空白
1. 检查API是否正常响应
2. 确认路由配置是否正确
3. 查看浏览器控制台错误

### 支付功能异常
1. 确认Airwallex API密钥是否有效
2. 检查支付回调URL配置
3. 验证币种和金额格式

## 下一步开发计划

1. **真实支付集成**: 替换测试API密钥为生产密钥
2. **用户系统完善**: 用户注册、登录、个人中心
3. **订单管理**: 完善订单状态跟踪
4. **库存管理**: 实时库存更新
5. **多语言支持**: 西班牙语本地化
6. **移动端优化**: 响应式设计改进

## 重要提醒

1. **不要修改HashRouter配置**，否则会导致GitHub Pages路由失效
2. **不要删除CORS配置**，否则前端无法访问API
3. **数据库操作需要使用--remote标志**，确保操作生产数据库
4. **环境变量修改后需要重新部署Workers**
5. **GitHub Pages有缓存**，更新可能需要等待几分钟生效

## 联系信息
- GitHub: Jeff010726
- 项目仓库: https://github.com/Jeff010726/MyMexicoStore
- 部署时间: 2025年8月20日

---
*此文档包含了项目的所有关键信息，请在新会话中首先阅读此文档以了解项目现状。*