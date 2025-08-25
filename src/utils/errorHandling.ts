/**
 * 错误处理与日志系统
 * 
 * 提供全局错误捕获、日志记录和错误报告功能
 */

import { captureException } from './analytics';

// 错误类型定义
export enum ErrorType {
  API = 'API_ERROR',
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  RENDERING = 'RENDERING_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 错误上下文接口
export interface ErrorContext {
  userId?: string;
  path?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

// 错误详情接口
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  context?: ErrorContext;
  originalError?: Error;
  stack?: string;
}

// 全局错误处理类
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Array<(error: ErrorDetails) => void> = [];
  private isInitialized = false;
  
  private constructor() {
    // 私有构造函数，防止直接实例化
  }
  
  // 获取单例实例
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  // 初始化全局错误处理
  public init(): void {
    if (this.isInitialized) {
      return;
    }
    
    console.log('Initializing ErrorHandler...');
    
    try {
      // 设置全局未捕获异常处理器
      window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.message);
        
        this.handleError({
          type: ErrorType.UNKNOWN,
          message: event.message || 'Unknown error',
          severity: ErrorSeverity.HIGH,
          timestamp: new Date().toISOString(),
          stack: event.error?.stack,
          originalError: event.error
        });
        
        // 不阻止默认处理，让错误显示在控制台
        // event.preventDefault();
      });
      
      // 设置Promise未捕获异常处理器
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        console.error('Unhandled promise rejection caught:', error);
        
        this.handleError({
          type: ErrorType.UNKNOWN,
          message: error?.message || 'Unhandled promise rejection',
          severity: ErrorSeverity.HIGH,
          timestamp: new Date().toISOString(),
          stack: error?.stack,
          originalError: error
        });
        
        // 不阻止默认处理，让错误显示在控制台
        // event.preventDefault();
      });
      
      this.isInitialized = true;
      console.log('Global error handler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize error handler:', error);
    }
  }
  
  // 捕获并处理错误
  public captureError(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    const errorDetails: ErrorDetails = {
      type,
      message: errorMessage,
      severity,
      timestamp: new Date().toISOString(),
      context,
      stack: errorStack,
      originalError: typeof error === 'string' ? undefined : error
    };
    
    this.handleError(errorDetails);
  }
  
  // 捕获API错误
  public captureApiError(
    error: Error | string,
    endpoint: string,
    method: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const apiContext: ErrorContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        endpoint,
        method
      }
    };
    
    this.captureError(error, ErrorType.API, severity, apiContext);
  }
  
  // 捕获网络错误
  public captureNetworkError(
    error: Error | string,
    url: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const networkContext: ErrorContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        url
      }
    };
    
    this.captureError(error, ErrorType.NETWORK, severity, networkContext);
  }
  
  // 捕获验证错误
  public captureValidationError(
    error: Error | string,
    fieldName: string,
    value: any,
    severity: ErrorSeverity = ErrorSeverity.LOW,
    context?: ErrorContext
  ): void {
    const validationContext: ErrorContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        fieldName,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      }
    };
    
    this.captureError(error, ErrorType.VALIDATION, severity, validationContext);
  }
  
  // 捕获认证错误
  public captureAuthError(
    error: Error | string,
    action: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    context?: ErrorContext
  ): void {
    const authContext: ErrorContext = {
      ...context,
      action
    };
    
    this.captureError(error, ErrorType.AUTHENTICATION, severity, authContext);
  }
  
  // 捕获支付错误
  public capturePaymentError(
    error: Error | string,
    paymentMethod: string,
    orderId: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    context?: ErrorContext
  ): void {
    const paymentContext: ErrorContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        paymentMethod,
        orderId
      }
    };
    
    this.captureError(error, ErrorType.PAYMENT, severity, paymentContext);
  }
  
  // 捕获渲染错误
  public captureRenderingError(
    error: Error | string,
    component: string,
    props: any,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const renderingContext: ErrorContext = {
      ...context,
      component,
      additionalData: {
        ...context?.additionalData,
        props: typeof props === 'object' ? JSON.stringify(props) : props
      }
    };
    
    this.captureError(error, ErrorType.RENDERING, severity, renderingContext);
  }
  
  // 添加错误监听器
  public addErrorListener(listener: (error: ErrorDetails) => void): void {
    this.errorListeners.push(listener);
  }
  
  // 移除错误监听器
  public removeErrorListener(listener: (error: ErrorDetails) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index !== -1) {
      this.errorListeners.splice(index, 1);
    }
  }
  
  // 处理错误
  private handleError(errorDetails: ErrorDetails): void {
    // 记录到控制台
    this.logToConsole(errorDetails);
    
    // 发送到分析服务
    this.sendToAnalytics(errorDetails);
    
    // 存储到本地存储
    this.storeLocally(errorDetails);
    
    // 通知所有监听器
    this.notifyListeners(errorDetails);
    
    // 对于严重错误，显示用户友好的错误消息
    if (errorDetails.severity === ErrorSeverity.HIGH || errorDetails.severity === ErrorSeverity.CRITICAL) {
      this.showUserFriendlyError(errorDetails);
    }
  }
  
  // 记录到控制台
  private logToConsole(errorDetails: ErrorDetails): void {
    const { type, message, severity, timestamp, context, stack } = errorDetails;
    
    console.group(`[${severity.toUpperCase()}] ${type}: ${message}`);
    console.log(`Time: ${timestamp}`);
    
    if (context) {
      console.log('Context:', context);
    }
    
    if (stack) {
      console.log('Stack trace:', stack);
    }
    
    console.groupEnd();
  }
  
  // 发送到分析服务
  private sendToAnalytics(errorDetails: ErrorDetails): void {
    try {
      captureException(errorDetails);
    } catch (error) {
      console.error('Failed to send error to analytics:', error);
    }
  }
  
  // 存储到本地存储
  private storeLocally(errorDetails: ErrorDetails): void {
    try {
      // 获取现有错误日志
      const storedErrors = localStorage.getItem('error_log');
      let errorLog: ErrorDetails[] = [];
      
      if (storedErrors) {
        errorLog = JSON.parse(storedErrors);
      }
      
      // 添加新错误
      errorLog.push(errorDetails);
      
      // 限制存储的错误数量
      if (errorLog.length > 50) {
        errorLog = errorLog.slice(-50);
      }
      
      // 保存回本地存储
      localStorage.setItem('error_log', JSON.stringify(errorLog));
    } catch (error) {
      console.error('Failed to store error locally:', error);
    }
  }
  
  // 通知所有监听器
  private notifyListeners(errorDetails: ErrorDetails): void {
    for (const listener of this.errorListeners) {
      try {
        listener(errorDetails);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    }
  }
  
  // 显示用户友好的错误消息
  private showUserFriendlyError(errorDetails: ErrorDetails): void {
    // 开发环境下显示详细错误信息
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'))) {
      console.error('=== 详细错误信息 ===');
      console.error('错误类型:', errorDetails.type);
      console.error('错误消息:', errorDetails.message);
      console.error('错误严重程度:', errorDetails.severity);
      console.error('错误时间:', errorDetails.timestamp);
      console.error('错误上下文:', errorDetails.context);
      console.error('错误堆栈:', errorDetails.stack);
      console.error('原始错误:', errorDetails.originalError);
      console.error('===================');
      
      // 开发环境下不显示toast，让原始错误显示
      return;
    }
    
    // 根据错误类型和严重程度选择适当的消息
    let userMessage = '抱歉，发生了一个错误。请稍后再试。';
    
    switch (errorDetails.type) {
      case ErrorType.NETWORK:
        userMessage = '网络连接出现问题，请检查您的网络连接并重试。';
        break;
      case ErrorType.API:
        userMessage = '服务器暂时无法响应，请稍后再试。';
        break;
      case ErrorType.AUTHENTICATION:
        userMessage = '您的登录会话可能已过期，请重新登录。';
        break;
      case ErrorType.PAYMENT:
        userMessage = '支付处理过程中出现问题，请稍后重试或使用其他支付方式。';
        break;
      case ErrorType.VALIDATION:
        userMessage = '提交的数据有误，请检查并重试。';
        break;
    }
    
    // 在这里可以实现自定义的错误提示UI
    // 例如使用toast通知、模态框等
    
    // 简单实现：创建一个toast通知
    this.showToast(userMessage, errorDetails.severity);
  }
  
  // 显示toast通知
  private showToast(message: string, severity: ErrorSeverity): void {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast-${severity}`;
    toast.textContent = message;
    
    // 设置样式
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      background: severity === ErrorSeverity.CRITICAL ? '#d32f2f' : '#f44336',
      color: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      zIndex: '9999',
      maxWidth: '80%',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out'
    });
    
    // 添加到文档
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }
  
  // 获取错误日志
  public getErrorLog(): ErrorDetails[] {
    try {
      const storedErrors = localStorage.getItem('error_log');
      
      if (storedErrors) {
        return JSON.parse(storedErrors);
      }
    } catch (error) {
      console.error('Failed to retrieve error log:', error);
    }
    
    return [];
  }
  
  // 清除错误日志
  public clearErrorLog(): void {
    try {
      localStorage.removeItem('error_log');
    } catch (error) {
      console.error('Failed to clear error log:', error);
    }
  }
}

// 导出默认实例
export default ErrorHandler.getInstance();