# Cloudflare 手动设置指南

由于自动设置需要Cloudflare认证，请按以下步骤手动创建资源：

## 1. 登录Cloudflare

```bash
cd workers
wrangler login
```

按照提示在浏览器中完成登录。

## 2. 创建KV命名空间

```bash
# 创建生产环境KV命名空间
wrangler kv namespace create "PRODUCTS_KV"
wrangler kv namespace create "ORDERS_KV" 
wrangler kv namespace create "USERS_KV"

# 创建预览环境KV命名空间
wrangler kv namespace create "PRODUCTS_KV" --preview
wrangler kv namespace create "ORDERS_KV" --preview
wrangler kv namespace create "USERS_KV" --preview
```

## 3. 创建D1数据库

```bash
wrangler d1 create ecommerce-db
```

## 4. 创建R2存储桶

```bash
wrangler r2 bucket create ecommerce-images
```

## 5. 更新wrangler.toml配置

将上述命令返回的ID复制到 `wrangler.toml` 文件中对应位置：

```toml
[[kv_namespaces]]
binding = "PRODUCTS_KV"
id = "你的实际KV-ID"
preview_id = "你的实际预览KV-ID"

[[d1_databases]]
binding = "DB"
database_name = "ecommerce-db"
database_id = "你的实际数据库ID"
```

## 6. 初始化数据库

```bash
# 创建表结构
wrangler d1 execute ecommerce-db --file=./schema.sql

# 插入测试数据（可选）
wrangler d1 execute ecommerce-db --file=./seed-data.sql
```

## 7. 设置环境变量

```bash
# Airwallex支付配置（墨西哥市场）
wrangler secret put AIRWALLEX_API_KEY
# 输入: 2b3acbe995e89f538f763ef1513a61da3e04f8842e1628513309978d821b593e254c62a81c2bb2f6c6ebee1e5c130444

wrangler secret put AIRWALLEX_WEBHOOK_SECRET
# 输入您的Airwallex Webhook密钥

# 其他支付相关密钥（可选）
wrangler secret put ALIPAY_APP_ID
wrangler secret put ALIPAY_PRIVATE_KEY
wrangler secret put ALIPAY_PUBLIC_KEY
wrangler secret put WECHAT_APP_ID
wrangler secret put WECHAT_MCH_ID
wrangler secret put WECHAT_API_KEY

# JWT密钥
wrangler secret put JWT_SECRET
```

### Airwallex配置说明

- **Client ID**: BKEAudMyRCWVlwQ-TbhtOg (已在代码中配置)
- **API Key**: 2b3acbe995e89f538f763ef1513a61da3e04f8842e1628513309978d821b593e254c62a81c2bb2f6c6ebee1e5c130444
- **目标市场**: 墨西哥 (MXN货币)
- **支持的支付方式**: 信用卡、OXXO便利店、SPEI银行转账
- **API文档**: https://www.airwallex.com/docs/api?v=2024-08-07#/Introduction

## 8. 测试部署

```bash
# 本地开发测试
npm run dev

# 部署到Cloudflare
npm run deploy
```

完成以上步骤后，Cloudflare Workers后端就配置完成了！