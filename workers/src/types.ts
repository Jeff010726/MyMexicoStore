export interface Env {
  // KV命名空间
  PRODUCTS_KV: KVNamespace;
  ORDERS_KV: KVNamespace;
  USERS_KV: KVNamespace;
  
  // D1数据库
  DB: D1Database;
  
  // R2存储
  IMAGES: R2Bucket;
  
  // 环境变量
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
  ALIPAY_APP_ID: string;
  ALIPAY_PRIVATE_KEY: string;
  ALIPAY_PUBLIC_KEY: string;
  WECHAT_APP_ID: string;
  WECHAT_MCH_ID: string;
  WECHAT_API_KEY: string;
  AIRWALLEX_API_KEY: string;
  AIRWALLEX_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
}

// 商品数据模型
export interface Product {
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

// 订单数据模型
export interface Order {
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

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  attributes?: Record<string, any>;
}

export interface Address {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  postalCode?: string;
}

// 用户数据模型
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password?: string; // 可选，因为返回时不包含密码
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 支付相关
export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: 'alipay' | 'wechat';
  returnUrl: string;
  notifyUrl: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl?: string;
  qrCode?: string;
  status: 'created' | 'pending' | 'success' | 'failed';
}