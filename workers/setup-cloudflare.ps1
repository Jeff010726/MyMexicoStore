# PowerShell script for setting up Cloudflare resources

Write-Host "🚀 Setting up Cloudflare resources for ecommerce API..." -ForegroundColor Green

# 创建KV命名空间
Write-Host "📦 Creating KV namespaces..." -ForegroundColor Yellow
wrangler kv:namespace create "PRODUCTS_KV"
wrangler kv:namespace create "PRODUCTS_KV" --preview
wrangler kv:namespace create "ORDERS_KV"
wrangler kv:namespace create "ORDERS_KV" --preview
wrangler kv:namespace create "USERS_KV"
wrangler kv:namespace create "USERS_KV" --preview

Write-Host "✅ KV namespaces created. Please update the IDs in wrangler.toml" -ForegroundColor Green

# 创建D1数据库
Write-Host "🗄️ Creating D1 database..." -ForegroundColor Yellow
wrangler d1 create ecommerce-db

Write-Host "✅ D1 database created. Please update the database_id in wrangler.toml" -ForegroundColor Green

# 创建R2存储桶
Write-Host "🪣 Creating R2 bucket..." -ForegroundColor Yellow
wrangler r2 bucket create ecommerce-images

Write-Host "✅ R2 bucket created" -ForegroundColor Green

# 初始化数据库表结构
Write-Host "🔧 Initializing database schema..." -ForegroundColor Yellow
wrangler d1 execute ecommerce-db --file=./schema.sql

Write-Host "✅ Database schema initialized" -ForegroundColor Green

Write-Host "🎉 Cloudflare resources setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update wrangler.toml with the generated KV namespace IDs and D1 database ID" -ForegroundColor White
Write-Host "2. Set up environment secrets using: wrangler secret put <SECRET_NAME>" -ForegroundColor White
Write-Host "3. Configure R2 custom domain for image access" -ForegroundColor White