-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  originalPrice REAL,
  category TEXT NOT NULL,
  images TEXT, -- JSON数组
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- active, inactive, draft
  tags TEXT, -- JSON数组
  attributes TEXT, -- JSON对象
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON数组
  totalAmount REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  paymentMethod TEXT, -- alipay, wechat
  paymentId TEXT,
  shippingAddress TEXT NOT NULL, -- JSON对象
  billingAddress TEXT, -- JSON对象
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer', -- customer, admin
  addresses TEXT, -- JSON数组
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 页面配置表（用于可视化编辑器）
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'page', -- page, template
  config TEXT NOT NULL, -- JSON对象，存储页面配置
  status TEXT DEFAULT 'draft', -- draft, published
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 页面模板表
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail TEXT,
  components TEXT NOT NULL, -- JSON数组，存储组件配置
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_type ON pages(type);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_default ON templates(is_default);
