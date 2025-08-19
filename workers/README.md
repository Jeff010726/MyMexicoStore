# Ecommerce API - Cloudflare Workers

基于Cloudflare Workers的无服务器电商API后端。

## 功能特性

- 🛍️ 商品管理（增删改查）
- 📦 订单处理和状态管理
- 👥 用户管理和认证
- 💳 支付集成（支付宝/微信支付）
- 📁 图片上传到R2存储
- 🗄️ D1数据库存储
- ⚡ KV缓存优化

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono.js
- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **存储**: Cloudflare R2
- **语言**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置Cloudflare资源

运行设置脚本创建必要的Cloudflare资源：

```powershell
# Windows PowerShell
.\setup-cloudflare.ps1
```

或者手动执行：

```bash
# 创建KV命名空间
wrangler kv:namespace create "PRODUCTS_KV"
wrangler kv:namespace create "PRODUCTS_KV" --preview
wrangler kv:namespace create "ORDERS_KV"
wrangler kv:namespace create "ORDERS_KV" --preview
wrangler kv:namespace create "USERS_KV"
wrangler kv:namespace create "USERS_KV" --preview

# 创建D1数据库
wrangler d1 create ecommerce-db

# 创建R2存储桶
wrangler r2 bucket create ecommerce-images
```

### 3. 更新配置

将生成的资源ID更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "PRODUCTS_KV"
id = "your-actual-kv-id"
preview_id = "your-actual-preview-id"

[[d1_databases]]
binding = "DB"
database_name = "ecommerce-db"
database_id = "your-actual-database-id"
```

### 4. 初始化数据库

```bash
# 创建表结构
wrangler d1 execute ecommerce-db --file=./schema.sql

# 插入测试数据（可选）
wrangler d1 execute ecommerce-db --file=./seed-data.sql
```

### 5. 设置环境变量

```bash
# 支付宝配置
wrangler secret put ALIPAY_APP_ID
wrangler secret put ALIPAY_PRIVATE_KEY
wrangler secret put ALIPAY_PUBLIC_KEY

# 微信支付配置
wrangler secret put WECHAT_APP_ID
wrangler secret put WECHAT_MCH_ID
wrangler secret put WECHAT_API_KEY

# JWT密钥
wrangler secret put JWT_SECRET
```

### 6. 本地开发

```bash
npm run dev
```

### 7. 部署

```bash
# 部署到开发环境
npm run deploy

# 部署到生产环境
npm run deploy:production
```

## API文档

### 商品管理

- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取单个商品
- `POST /api/admin/products` - 创建商品（需要管理员权限）
- `PUT /api/admin/products/:id` - 更新商品（需要管理员权限）
- `DELETE /api/admin/products/:id` - 删除商品（需要管理员权限）

### 订单管理

- `GET /api/admin/orders` - 获取订单列表（需要管理员权限）
- `GET /api/admin/orders/:id` - 获取单个订单（需要管理员权限）
- `POST /api/orders` - 创建订单
- `PUT /api/admin/orders/:id/status` - 更新订单状态（需要管理员权限）

### 用户管理

- `POST /api/users/register` - 用户注册
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息

### 支付系统

- `POST /api/payment/create` - 创建支付订单
- `POST /api/payment/notify/:method` - 支付回调处理
- `GET /api/payment/status/:paymentId` - 查询支付状态

### 文件上传

- `POST /api/admin/upload/image` - 上传单个图片（需要管理员权限）
- `POST /api/admin/upload/images` - 批量上传图片（需要管理员权限）
- `DELETE /api/admin/upload/image/:path` - 删除图片（需要管理员权限）

## 数据模型

### 商品 (Product)
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### 订单 (Order)
```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'alipay' | 'wechat';
  paymentId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt: string;
}
```

### 用户 (User)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}
```

## 开发指南

### 添加新的API端点

1. 在 `src/routes/` 目录下创建或修改路由文件
2. 在 `src/index.ts` 中注册新路由
3. 更新类型定义（如需要）
4. 添加相应的数据库表结构（如需要）

### 缓存策略

- 商品信息缓存5分钟（300秒）
- 商品列表缓存5分钟（300秒）
- 支付记录缓存1小时（3600秒）

### 错误处理

所有API响应都遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 部署注意事项

1. 确保所有环境变量都已正确设置
2. 验证KV命名空间和D1数据库ID配置正确
3. 配置R2存储桶的自定义域名用于图片访问
4. 设置适当的CORS策略
5. 监控API使用情况和性能指标

## 故障排除

### 常见问题

1. **KV命名空间未找到**: 检查wrangler.toml中的KV配置
2. **数据库连接失败**: 验证D1数据库ID是否正确
3. **图片上传失败**: 确认R2存储桶权限配置
4. **支付回调失败**: 检查支付平台的回调URL配置

### 日志查看

```bash
# 查看实时日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since 1h