// API配置
export const API_BASE_URL = 'https://ecommerce-api.jeff010726bd.workers.dev';

export const API_CONFIG = {
  // Cloudflare Workers API地址
  BASE_URL: API_BASE_URL,
  
  // API端点
  ENDPOINTS: {
    // 健康检查
    HEALTH: '/health',
    
    // 模板相关
    TEMPLATES: '/api/templates',
    TEMPLATE_BY_ID: (id: string) => `/api/templates/${id}`,
    
    // 商品相关
    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
    
    // 订单相关
    ORDERS: '/api/orders',
    ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
    
    // 用户相关
    USERS: '/api/users',
    USER_BY_ID: (id: string) => `/api/users/${id}`,
    
    // 支付相关
    PAYMENT: '/api/payment',
    AIRWALLEX_PAYMENT: '/api/payment/airwallex',
    
    // 管理后台
    ADMIN_PRODUCTS: '/api/admin/products',
    ADMIN_ORDERS: '/api/admin/orders',
    ADMIN_UPLOAD: '/api/admin/upload'
  }
};

// API请求工具函数
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 带认证的API请求
export const authenticatedApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};