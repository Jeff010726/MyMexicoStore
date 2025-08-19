# Cloudflare资源自动创建脚本
Write-Host "开始创建Cloudflare资源..." -ForegroundColor Green

# 创建KV命名空间
Write-Host "创建KV命名空间..." -ForegroundColor Yellow
$productsKV = npx wrangler kv:namespace create "PRODUCTS_KV" --preview
$ordersKV = npx wrangler kv:namespace create "ORDERS_KV" --preview
$usersKV = npx wrangler kv:namespace create "USERS_KV" --preview

# 创建D1数据库
Write-Host "创建D1数据库..." -ForegroundColor Yellow
$d1Result = npx wrangler d1 create ecommerce-db

# 创建R2存储桶
Write-Host "创建R2存储桶..." -ForegroundColor Yellow
$r2Result = npx wrangler r2 bucket create ecommerce-images

Write-Host "资源创建完成！" -ForegroundColor Green
Write-Host "请手动更新wrangler.toml中的ID配置" -ForegroundColor Cyan
Write-Host "然后运行: npm run deploy" -ForegroundColor Cyan