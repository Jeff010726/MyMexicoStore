/**
 * 分析与监控系统
 * 
 * 提供用户行为跟踪、性能监控和错误报告功能
 */

import { ErrorDetails } from './errorHandling';

// 事件类型
export enum EventType {
  PAGE_VIEW = 'page_view',
  CLICK = 'click',
  FORM_SUBMIT = 'form_submit',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  SEARCH = 'search',
  FILTER = 'filter',
  LOGIN = 'login',
  SIGNUP = 'signup',
  ERROR = 'error',
  PERFORMANCE = 'performance'
}

// 事件属性接口
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// 用户属性接口
export interface UserProperties {
  userId?: string;
  userType?: 'guest' | 'registered' | 'admin';
  email?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// 会话信息接口
export interface SessionInfo {
  sessionId: string;
  startTime: number;
  referrer: string;
  landingPage: string;
  userAgent: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browserName: string;
  osName: string;
}

// 分析配置接口
export interface AnalyticsConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackClicks: boolean;
  trackForms: boolean;
  trackErrors: boolean;
  sampleRate: number;
  apiEndpoint: string;
  batchSize: number;
  batchInterval: number;
}

// 默认配置
const defaultConfig: AnalyticsConfig = {
  enabled: true,
  trackPageViews: true,
  trackClicks: false,
  trackForms: true,
  trackErrors: true,
  sampleRate: 1.0, // 100%的用户
  apiEndpoint: 'https://ecommerce-api.jeff010726bd.workers.dev/analytics',
  batchSize: 10,
  batchInterval: 30000 // 30秒
};

// 分析服务类
export class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private eventQueue: Array<{
    type: EventType;
    properties: EventProperties;
    timestamp: number;
  }> = [];
  private sessionInfo: SessionInfo | null = null;
  private userProperties: UserProperties = {};
  private flushIntervalId: number | null = null;
  private isInitialized = false;
  
  private constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  // 获取单例实例
  public static getInstance(config: Partial<AnalyticsConfig> = {}): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService(config);
    }
    return AnalyticsService.instance;
  }
  
  // 初始化分析服务
  public init(): void {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }
    
    // 初始化会话
    this.initSession();
    
    // 设置自动事件跟踪
    this.setupAutoTracking();
    
    // 设置定期发送数据
    this.setupBatchProcessing();
    
    this.isInitialized = true;
    console.log('Analytics service initialized');
  }
  
  // 更新配置
  public updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 如果禁用了分析，清除定时器
    if (!this.config.enabled && this.flushIntervalId !== null) {
      window.clearInterval(this.flushIntervalId);
      this.flushIntervalId = null;
    } else if (this.config.enabled && this.flushIntervalId === null) {
      // 如果启用了分析，重新设置定时器
      this.setupBatchProcessing();
    }
  }
  
  // 设置用户属性
  public setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }
  
  // 清除用户属性
  public clearUserProperties(): void {
    this.userProperties = {};
  }
  
  // 跟踪事件
  public trackEvent(type: EventType, properties: EventProperties = {}): void {
    if (!this.config.enabled) {
      return;
    }
    
    // 应用采样率
    if (Math.random() > this.config.sampleRate) {
      return;
    }
    
    // 添加事件到队列
    this.eventQueue.push({
      type,
      properties,
      timestamp: Date.now()
    });
    
    // 如果队列达到批处理大小，立即发送
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }
  
  // 跟踪页面浏览
  public trackPageView(path: string, title: string, referrer: string = document.referrer): void {
    this.trackEvent(EventType.PAGE_VIEW, {
      path,
      title,
      referrer
    });
  }
  
  // 跟踪点击
  public trackClick(elementId: string, elementText: string, elementType: string): void {
    this.trackEvent(EventType.CLICK, {
      elementId,
      elementText,
      elementType
    });
  }
  
  // 跟踪表单提交
  public trackFormSubmit(formId: string, formName: string, formFields: string[]): void {
    this.trackEvent(EventType.FORM_SUBMIT, {
      formId,
      formName,
      formFields: formFields.join(',')
    });
  }
  
  // 跟踪产品浏览
  public trackProductView(productId: string, productName: string, price: number, category: string): void {
    this.trackEvent(EventType.PRODUCT_VIEW, {
      productId,
      productName,
      price,
      category
    });
  }
  
  // 跟踪添加到购物车
  public trackAddToCart(productId: string, productName: string, price: number, quantity: number): void {
    this.trackEvent(EventType.ADD_TO_CART, {
      productId,
      productName,
      price,
      quantity
    });
  }
  
  // 跟踪从购物车移除
  public trackRemoveFromCart(productId: string, productName: string, price: number, quantity: number): void {
    this.trackEvent(EventType.REMOVE_FROM_CART, {
      productId,
      productName,
      price,
      quantity
    });
  }
  
  // 跟踪开始结账
  public trackCheckoutStart(cartValue: number, itemCount: number): void {
    this.trackEvent(EventType.CHECKOUT_START, {
      cartValue,
      itemCount
    });
  }
  
  // 跟踪完成结账
  public trackCheckoutComplete(orderId: string, orderValue: number, paymentMethod: string): void {
    this.trackEvent(EventType.CHECKOUT_COMPLETE, {
      orderId,
      orderValue,
      paymentMethod
    });
  }
  
  // 跟踪搜索
  public trackSearch(query: string, resultsCount: number): void {
    this.trackEvent(EventType.SEARCH, {
      query,
      resultsCount
    });
  }
  
  // 跟踪筛选
  public trackFilter(filterType: string, filterValue: string): void {
    this.trackEvent(EventType.FILTER, {
      filterType,
      filterValue
    });
  }
  
  // 跟踪登录
  public trackLogin(userId: string, method: string): void {
    this.trackEvent(EventType.LOGIN, {
      userId,
      method
    });
  }
  
  // 跟踪注册
  public trackSignup(userId: string, method: string): void {
    this.trackEvent(EventType.SIGNUP, {
      userId,
      method
    });
  }
  
  // 捕获异常
  public captureException(errorDetails: ErrorDetails): void {
    if (!this.config.enabled || !this.config.trackErrors) {
      return;
    }
    
    this.trackEvent(EventType.ERROR, {
      errorType: errorDetails.type,
      errorMessage: errorDetails.message,
      errorSeverity: errorDetails.severity,
      stack: errorDetails.stack || '',
      component: errorDetails.context?.component || '',
      path: errorDetails.context?.path || window.location.pathname
    });
  }
  
  // 立即发送所有事件
  public flush(): void {
    if (this.eventQueue.length === 0) {
      return;
    }
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    this.sendEvents(events);
  }
  
  // 初始化会话
  private initSession(): void {
    // 生成会话ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 获取设备和浏览器信息
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    
    // 获取浏览器名称
    let browserName = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1) browserName = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) browserName = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1) browserName = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) browserName = 'Edge';
    else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) browserName = 'Internet Explorer';
    
    // 获取操作系统名称
    let osName = 'Unknown';
    if (userAgent.indexOf('Windows') !== -1) osName = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) osName = 'MacOS';
    else if (userAgent.indexOf('Linux') !== -1) osName = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) osName = 'Android';
    else if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) osName = 'iOS';
    
    // 创建会话信息
    this.sessionInfo = {
      sessionId,
      startTime: Date.now(),
      referrer: document.referrer,
      landingPage: window.location.pathname,
      userAgent,
      deviceType,
      browserName,
      osName
    };
  }
  
  // 设置自动事件跟踪
  private setupAutoTracking(): void {
    if (this.config.trackPageViews) {
      // 跟踪初始页面浏览
      this.trackPageView(
        window.location.pathname,
        document.title
      );
      
      // 监听路由变化（适用于SPA）
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.handleRouteChange();
      };
      
      history.replaceState = (...args) => {
        originalReplaceState.apply(history, args);
        this.handleRouteChange();
      };
      
      window.addEventListener('popstate', () => {
        this.handleRouteChange();
      });
    }
    
    if (this.config.trackClicks) {
      // 监听点击事件
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target) return;
        
        const elementId = target.id || '';
        const elementText = target.textContent?.trim() || '';
        const elementType = target.tagName.toLowerCase();
        
        this.trackClick(elementId, elementText, elementType);
      });
    }
    
    if (this.config.trackForms) {
      // 监听表单提交
      document.addEventListener('submit', (event) => {
        const form = event.target as HTMLFormElement;
        if (!form) return;
        
        const formId = form.id || '';
        const formName = form.name || formId || 'unknown_form';
        const formFields = Array.from(form.elements)
          .filter((element) => {
            const el = element as HTMLInputElement;
            return el.name && el.type !== 'password';
          })
          .map((element) => (element as HTMLInputElement).name);
        
        this.trackFormSubmit(formId, formName, formFields);
      });
    }
  }
  
  // 处理路由变化
  private handleRouteChange(): void {
    setTimeout(() => {
      this.trackPageView(
        window.location.pathname,
        document.title
      );
    }, 0);
  }
  
  // 设置批处理
  private setupBatchProcessing(): void {
    if (this.flushIntervalId !== null) {
      window.clearInterval(this.flushIntervalId);
    }
    
    this.flushIntervalId = window.setInterval(() => {
      this.flush();
    }, this.config.batchInterval);
    
    // 在页面卸载前发送剩余事件
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }
  
  // 发送事件到服务器
  private async sendEvents(events: Array<{
    type: EventType;
    properties: EventProperties;
    timestamp: number;
  }>): Promise<void> {
    if (!this.config.enabled || !this.sessionInfo) {
      return;
    }
    
    try {
      const payload = {
        session: this.sessionInfo,
        user: this.userProperties,
        events: events.map(event => ({
          type: event.type,
          properties: event.properties,
          timestamp: event.timestamp
        }))
      };
      
      // 使用信标API发送数据（不阻塞页面）
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const success = navigator.sendBeacon(this.config.apiEndpoint, blob);
        
        if (success) {
          return;
        }
      }
      
      // 如果信标API不可用或失败，使用fetch API
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        // 使用keep-alive以允许在页面卸载时完成请求
        keepalive: true
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      
      // 如果发送失败，将事件放回队列
      this.eventQueue = [...events, ...this.eventQueue];
      
      // 限制队列大小，防止无限增长
      if (this.eventQueue.length > 100) {
        this.eventQueue = this.eventQueue.slice(-100);
      }
    }
  }
  
  // 获取性能指标
  public getPerformanceMetrics(): Record<string, number> {
    if (!window.performance) {
      return {};
    }
    
    const metrics: Record<string, number> = {};
    
    // 基本导航计时
    if (window.performance.timing) {
      const timing = window.performance.timing;
      
      metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      metrics.domReadyTime = timing.domComplete - timing.domLoading;
      metrics.networkLatency = timing.responseEnd - timing.fetchStart;
      metrics.serverResponseTime = timing.responseEnd - timing.requestStart;
      metrics.redirectTime = timing.redirectEnd - timing.redirectStart;
      metrics.domInteractiveTime = timing.domInteractive - timing.navigationStart;
      metrics.domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    }
    
    // 性能条目
    if (window.performance.getEntriesByType) {
      // 资源加载时间
      const resources = window.performance.getEntriesByType('resource');
      let totalResourceLoadTime = 0;
      
      resources.forEach((resource: any) => {
        totalResourceLoadTime += resource.duration;
      });
      
      metrics.resourceCount = resources.length;
      metrics.averageResourceLoadTime = resources.length > 0 ? totalResourceLoadTime / resources.length : 0;
      
      // 首次绘制和首次内容绘制
      const paintEntries = window.performance.getEntriesByType('paint');
      
      paintEntries.forEach((entry: any) => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
    
    return metrics;
  }
  
  // 跟踪性能指标
  public trackPerformance(): void {
    if (!this.config.enabled) {
      return;
    }
    
    // 等待页面完全加载
    window.addEventListener('load', () => {
      // 延迟一点以确保所有指标都已可用
      setTimeout(() => {
        const metrics = this.getPerformanceMetrics();
        
        this.trackEvent(EventType.PERFORMANCE, metrics);
      }, 0);
    });
  }
}

// 导出捕获异常函数
export function captureException(errorDetails: ErrorDetails): void {
  AnalyticsService.getInstance().captureException(errorDetails);
}

// 导出默认实例
export default AnalyticsService.getInstance();