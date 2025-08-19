# Cloudflare Workers 资源配置指南

## 1. 创建必要的Cloudflare资源

### 步骤1: 创建KV命名空间
```bash
# 进入workers目录
cd workers

# 创建生产环境KV命名空间
npx wrangler kv:namespace create "PRODUCTS_KV"
npx wrangler kv:namespace create "ORDERS_KV" 
npx wrangler kv:namespace create "USERS_KV"

# 创建预览环境KV命名空间
npx wrangler kv:namespace create "PRODUCTS_KV" --preview
npx wrangler kv:namespace create "ORDERS_KV" --preview
npx wrangler kv:namespace create "USERS_KV" --preview
```

### 步骤2: 创建D1数据库
```bash
npx wrangler d1 create ecommerce-db
```

### 步骤3: 创建R2存储桶
```bash
npx wrangler r2 bucket create ecommerce-images
```

## 2. 更新wrangler.toml配置

执行上述命令后，会得到类似以下的输出，需要将ID复制到wrangler.toml中：

```toml
# 示例输出格式
[[kv_namespaces]]
binding = "PRODUCTS_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
```

## 3. 初始化数据库

```bash
# 执行数据库架构
npx wrangler d1 execute ecommerce-db --file=./schema.sql

# 插入初始数据
npx wrangler d1 execute ecommerce-db --file=./seed-data.sql
```

## 4. 设置环境变量

```bash
# 设置JWT密钥
npx wrangler secret put JWT_SECRET

# 设置Airwallex API密钥
npx wrangler secret put AIRWALLEX_API_KEY
npx wrangler secret put AIRWALLEX_CLIENT_ID
```

## 5. 部署Workers

```bash
npm run deploy
```

## 6. 测试API

部署成功后，可以通过以下URL测试API：
- 健康检查: https://your-worker.your-subdomain.workers.dev/health
- 模板列表: https://your-worker.your-subdomain.workers.dev/api/templates