# Cloudflare Workers 自动配置脚本
param(
    [switch]$SkipResourceCreation,
    [switch]$OnlyDeploy
)

Write-Host "🚀 开始配置Cloudflare Workers..." -ForegroundColor Green

# 检查是否在workers目录
if (!(Test-Path "wrangler.toml")) {
    Write-Host "❌ 请在workers目录下运行此脚本" -ForegroundColor Red
    exit 1
}

if (!$OnlyDeploy -and !$SkipResourceCreation) {
    Write-Host "📦 创建Cloudflare资源..." -ForegroundColor Yellow
    
    # 创建KV命名空间
    Write-Host "创建KV命名空间..." -ForegroundColor Cyan
    npx wrangler kv:namespace create "PRODUCTS_KV"
    npx wrangler kv:namespace create "PRODUCTS_KV" --preview
    npx wrangler kv:namespace create "ORDERS_KV"
    npx wrangler kv:namespace create "ORDERS_KV" --preview
    npx wrangler kv:namespace create "USERS_KV"
    npx wrangler kv:namespace create "USERS_KV" --preview
    
    # 创建D1数据库
    Write-Host "创建D1数据库..." -ForegroundColor Cyan
    npx wrangler d1 create ecommerce-db
    
    # 创建R2存储桶
    Write-Host "创建R2存储桶..." -ForegroundColor Cyan
    npx wrangler r2 bucket create ecommerce-images
    
    Write-Host "⚠️  请手动更新wrangler.toml中的资源ID" -ForegroundColor Yellow
    Write-Host "然后运行: .\auto-setup.ps1 -SkipResourceCreation" -ForegroundColor Yellow
    exit 0
}

if (!$OnlyDeploy) {
    Write-Host "🗄️  初始化数据库..." -ForegroundColor Yellow
    
    # 执行数据库架构
    npx wrangler d1 execute ecommerce-db --file=./schema.sql
    
    # 插入初始数据
    npx wrangler d1 execute ecommerce-db --file=./seed-data.sql
    
    Write-Host "✅ 数据库初始化完成" -ForegroundColor Green
}

Write-Host "🚀 部署Workers..." -ForegroundColor Yellow
npm run deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host "🌐 API地址: https://ecommerce-api.your-subdomain.workers.dev" -ForegroundColor Cyan
    Write-Host "🔍 健康检查: https://ecommerce-api.your-subdomain.workers.dev/health" -ForegroundColor Cyan
} else {
    Write-Host "❌ 部署失败，请检查配置" -ForegroundColor Red
}