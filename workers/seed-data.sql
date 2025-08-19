-- 插入测试商品数据
INSERT INTO products (id, name, description, price, originalPrice, category, images, stock, status, tags, attributes, createdAt, updatedAt) VALUES
('prod-001', '北欧风格布艺沙发', '简约现代的北欧风格三人座布艺沙发，采用优质亚麻面料，舒适透气，适合现代家居装饰。', 2999.00, 3999.00, '家具', '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc"]', 15, 'active', '["沙发", "北欧", "布艺", "客厅"]', '{"color": ["米白色", "深灰色"], "material": "亚麻布", "size": "200x90x85cm"}', datetime('now'), datetime('now')),

('prod-002', '实木餐桌椅套装', '精选橡木制作的餐桌椅套装，一桌四椅，简约设计，坚固耐用，适合4-6人用餐。', 1899.00, 2299.00, '家具', '["https://images.unsplash.com/photo-1549497538-303791108f95", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7"]', 8, 'active', '["餐桌", "实木", "套装", "餐厅"]', '{"color": ["原木色", "胡桃色"], "material": "橡木", "size": "140x80x75cm"}', datetime('now'), datetime('now')),

('prod-003', '智能空气净化器', '高效HEPA滤网，智能空气质量监测，静音运行，适用于30-50平米空间，支持APP远程控制。', 899.00, 1199.00, '家电', '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64"]', 25, 'active', '["空气净化器", "智能", "家电", "健康"]', '{"color": ["白色", "黑色"], "coverage": "30-50㎡", "noise": "<35dB"}', datetime('now'), datetime('now')),

('prod-004', '有机棉床上四件套', '100%有机棉材质，柔软亲肤，透气吸湿，包含被套、床单、枕套，多种花色可选。', 299.00, 399.00, '家纺', '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"]', 50, 'active', '["床品", "有机棉", "四件套", "卧室"]', '{"color": ["纯白", "浅蓝", "粉色"], "material": "有机棉", "size": ["1.5m", "1.8m", "2.0m"]}', datetime('now'), datetime('now')),

('prod-005', '无线蓝牙音箱', '高保真音质，360度环绕立体声，防水设计，续航12小时，支持无线充电。', 199.00, 299.00, '数码', '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1"]', 100, 'active', '["音箱", "蓝牙", "无线", "音响"]', '{"color": ["黑色", "白色", "蓝色"], "battery": "12小时", "waterproof": "IPX7"}', datetime('now'), datetime('now'));

-- 插入测试用户数据
INSERT INTO users (id, email, name, phone, role, addresses, createdAt, updatedAt) VALUES
('user-001', 'admin@example.com', '管理员', '13800138000', 'admin', '[]', datetime('now'), datetime('now')),
('user-002', 'customer@example.com', '张三', '13900139000', 'customer', '[{"name": "张三", "phone": "13900139000", "province": "广东省", "city": "深圳市", "district": "南山区", "street": "科技园南区深南大道9999号"}]', datetime('now'), datetime('now'));

-- 插入测试订单数据
INSERT INTO orders (id, userId, items, totalAmount, status, paymentMethod, shippingAddress, createdAt, updatedAt) VALUES
('order-001', 'user-002', '[{"productId": "prod-001", "productName": "北欧风格布艺沙发", "price": 2999.00, "quantity": 1}]', 2999.00, 'pending', 'alipay', '{"name": "张三", "phone": "13900139000", "province": "广东省", "city": "深圳市", "district": "南山区", "street": "科技园南区深南大道9999号"}', datetime('now'), datetime('now'));

-- 插入测试页面配置数据
INSERT INTO pages (id, name, slug, type, config, status, createdAt, updatedAt) VALUES
('page-001', '首页', 'home', 'page', '{"components": [{"type": "hero", "props": {"title": "欢迎来到我们的商店", "subtitle": "发现优质生活用品", "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}}, {"type": "products", "props": {"title": "热门商品", "limit": 8}}]}', 'published', datetime('now'), datetime('now')),
('page-002', '关于我们', 'about', 'page', '{"components": [{"type": "text", "props": {"title": "关于我们", "content": "我们致力于为客户提供高品质的生活用品..."}}]}', 'published', datetime('now'), datetime('now'));

-- 插入示例模板数据
INSERT INTO templates (id, name, description, category, thumbnail, components, created_at, updated_at, is_default, usage_count) VALUES
('1', '经典首页模板', '适合日用品商城的经典首页布局，包含轮播图、热销商品、分类导航等模块', 'homepage', '/placeholder.svg?height=200&width=300', '[{"id":"1","type":"hero","props":{"title":"优质日用品，品质生活","subtitle":"精选好物，实惠价格，让生活更美好","buttonText":"立即购买","backgroundColor":"#1e40af","textColor":"#ffffff","textAlign":"center"}},{"id":"2","type":"categories","props":{"title":"商品分类","columns":4,"backgroundColor":"#f8fafc"}},{"id":"3","type":"products","props":{"title":"热销商品","limit":8,"columns":4,"showPrice":true,"showRating":true}},{"id":"4","type":"features","props":{"title":"我们的优势","columns":3,"showIcons":true}},{"id":"5","type":"testimonials","props":{"title":"客户评价","backgroundColor":"#f1f5f9","showStars":true}},{"id":"6","type":"newsletter","props":{"title":"订阅我们的优惠信息","subtitle":"第一时间获取最新优惠和产品信息","placeholder":"请输入您的邮箱","buttonText":"立即订阅","backgroundColor":"#1e293b","textColor":"#ffffff"}}]', datetime('now'), datetime('now'), 1, 25),

('2', '促销活动模板', '专门用于促销活动的页面模板，突出优惠信息和限时抢购', 'custom', '/placeholder.svg?height=200&width=300', '[{"id":"1","type":"countdown","props":{"title":"🔥 限时抢购 🔥","backgroundColor":"#dc2626","textColor":"#ffffff"}},{"id":"2","type":"banner","props":{"title":"全场8折起","subtitle":"精选商品，超值优惠，错过再等一年！","backgroundColor":"#ec4899","textColor":"#ffffff"}},{"id":"3","type":"products","props":{"title":"今日特价","limit":6,"columns":3,"showPrice":true,"showRating":true}}]', datetime('now'), datetime('now'), 0, 15),

('3', '商品展示模板', '专门用于商品详情页的模板，包含商品图片、详细信息、评价等', 'product', '/placeholder.svg?height=200&width=300', '[{"id":"1","type":"hero","props":{"title":"精选商品","subtitle":"高品质，超值价格","backgroundColor":"#059669","textColor":"#ffffff"}},{"id":"2","type":"products","props":{"title":"推荐商品","limit":4,"columns":2,"showPrice":true,"showRating":true}},{"id":"3","type":"features","props":{"title":"产品特色","columns":2,"showIcons":true}}]', datetime('now'), datetime('now'), 0, 18);
