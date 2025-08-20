import { cacheManager, CacheConfigs, withCache } from '../utils/cache';

const API_BASE_URL = 'https://ecommerce-api.jeff010726bd.workers.dev';

// HTTP客户端配置
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 移除认证token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = false,
    cacheConfig?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // 如果启用缓存且是GET请求
    if (useCache && cacheConfig && (!options.method || options.method === 'GET')) {
      return withCache(cacheConfig, () => this.fetchData<T>(url, config));
    }

    return this.fetchData<T>(url, config);
  }

  // 实际的数据获取方法
  private async fetchData<T>(url: string, config: RequestInit): Promise<T> {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 商品相关API（带缓存）
  async getProducts(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request(
      endpoint,
      { method: 'GET' },
      true,
      CacheConfigs.PRODUCTS_LIST
    );
  }

  async getProduct(id: string) {
    return this.request(
      `/products/${id}`,
      { method: 'GET' },
      true,
      CacheConfigs.PRODUCT_DETAIL(id)
    );
  }

  // 用户相关API
  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // 登录成功后设置token
    if ((response as any).success && (response as any).data?.token) {
      this.setAuthToken((response as any).data.token);
      localStorage.setItem('authToken', (response as any).data.token);
    }
    
    return response;
  }

  async register(userData: any) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile() {
    return this.request(
      '/users/profile',
      { method: 'GET' },
      true,
      CacheConfigs.USER_PROFILE
    );
  }

  // 订单相关API
  async createOrder(orderData: any) {
    // 创建订单后清除相关缓存
    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    // 清除购物车缓存
    cacheManager.delete(CacheConfigs.SHOPPING_CART.key);
    
    return response;
  }

  async getUserOrders(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders/user${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, { method: 'GET' });
  }

  // 支付相关API
  async createPaymentIntent(paymentData: any) {
    return this.request('/airwallex/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // 统计数据API（带缓存）
  async getDashboardData() {
    return this.request(
      '/analytics/dashboard',
      { method: 'GET' },
      true,
      CacheConfigs.ANALYTICS_DATA
    );
  }

  // 管理员API
  async getAllOrders(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, { method: 'GET' });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // 初始化方法
  init() {
    // 从localStorage恢复token
    const token = localStorage.getItem('authToken');
    if (token) {
      this.setAuthToken(token);
    }
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 初始化API客户端
apiClient.init();

// 导出便捷方法
export const api = {
  // 商品
  getProducts: (params?: any) => apiClient.getProducts(params),
  getProduct: (id: string) => apiClient.getProduct(id),
  
  // 用户
  login: (credentials: { email: string; password: string }) => apiClient.login(credentials),
  register: (userData: any) => apiClient.register(userData),
  getUserProfile: () => apiClient.getUserProfile(),
  
  // 订单
  createOrder: (orderData: any) => apiClient.createOrder(orderData),
  getUserOrders: (params?: any) => apiClient.getUserOrders(params),
  
  // 支付
  createPaymentIntent: (paymentData: any) => apiClient.createPaymentIntent(paymentData),
  
  // 统计
  getDashboardData: () => apiClient.getDashboardData(),
  
  // 管理员
  getAllOrders: (params?: any) => apiClient.getAllOrders(params),
  updateOrderStatus: (orderId: string, status: string) => apiClient.updateOrderStatus(orderId, status),
};

export default api;