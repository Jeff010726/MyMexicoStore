// 扩展性能接口
interface ExtendedPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
}

interface ExtendedPerformanceNavigationTiming extends PerformanceNavigationTiming {
  domLoading?: number;
}

// 性能指标类型
interface PerformanceMetrics {
  [key: string]: number;
}

// 性能监控工具类
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 初始化性能监控
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.initCoreWebVitals();
      this.initNavigationTiming();
      this.initResourceTiming();
      this.isInitialized = true;
      // 性能监控已初始化 (仅在开发环境输出)
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('性能监控已初始化');
      }
    } catch (error) {
      console.warn('性能监控初始化失败:', error);
    }
  }

  // 初始化核心Web指标
  private initCoreWebVitals() {
    // First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP监控初始化失败:', error);
      }

      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.recordMetric('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP监控初始化失败:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as ExtendedPerformanceEntry[];
          entries.forEach((entry) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              this.recordMetric('FID', fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID监控初始化失败:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as ExtendedPerformanceEntry[];
          entries.forEach((entry) => {
            if (entry.hadRecentInput !== true && entry.value) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS监控初始化失败:', error);
      }
    }
  }

  // 初始化导航时间监控
  private initNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as ExtendedPerformanceNavigationTiming;
        if (navigation) {
          // DNS查询时间
          this.recordMetric('DNS_LOOKUP', navigation.domainLookupEnd - navigation.domainLookupStart);
          
          // TCP连接时间
          this.recordMetric('TCP_CONNECT', navigation.connectEnd - navigation.connectStart);
          
          // 请求响应时间
          this.recordMetric('REQUEST_RESPONSE', navigation.responseEnd - navigation.requestStart);
          
          // DOM处理时间
          if (navigation.domInteractive && navigation.domComplete) {
            this.recordMetric('DOM_PROCESSING', navigation.domComplete - navigation.domInteractive);
          }
          
          // 页面加载完成时间
          this.recordMetric('LOAD_COMPLETE', navigation.loadEventEnd - navigation.loadEventStart);
        }
      } catch (error) {
        console.warn('导航时间监控失败:', error);
      }
    }
  }

  // 初始化资源时间监控
  private initResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const navEntry = entry as PerformanceNavigationTiming;
            const duration = navEntry.responseEnd - navEntry.startTime;
            this.recordMetric(`RESOURCE_${entry.name.split('/').pop() || 'unknown'}`, duration);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('资源时间监控失败:', error);
      }
    }
  }

  // 记录性能指标
  recordMetric(name: string, value: number) {
    this.metrics[name] = value;
    
    // 在开发环境下输出性能指标
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log(`性能指标 ${name}: ${value.toFixed(2)}ms`);
    }
    
    // 在生产环境下发送到分析服务，但不在GitHub Pages环境下发送
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        !window.location.hostname.includes('github.io')) {
      this.sendToAnalytics(name, value);
    }
  }

  // 发送数据到分析服务
  private sendToAnalytics(name: string, value: number) {
    // 这里可以集成Google Analytics、百度统计等
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        !window.location.hostname.includes('github.io')) {
      // 示例：发送到自定义分析端点
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: name,
          value,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // 静默处理错误，不影响用户体验
      });
    }
  }

  // 获取所有性能指标
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 获取性能报告
  getPerformanceReport() {
    const metrics = this.getMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      metrics,
      summary: {
        loadTime: metrics.LOAD_COMPLETE || 0,
        fcp: metrics.FCP || 0,
        lcp: metrics.LCP || 0,
        fid: metrics.FID || 0,
        cls: metrics.CLS || 0
      }
    };
    
    return report;
  }

  // 清理监控器
  cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('清理性能监控器失败:', error);
      }
    });
    this.observers = [];
    this.isInitialized = false;
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// React Hook for performance monitoring
export function usePerformanceMonitoring() {
  const { useEffect } = require('react');
  
  useEffect(() => {
    performanceMonitor.init();
    
    return () => {
      performanceMonitor.cleanup();
    };
  }, []);

  return {
    recordMetric: (name: string, value: number) => performanceMonitor.recordMetric(name, value),
    getMetrics: () => performanceMonitor.getMetrics(),
    getReport: () => performanceMonitor.getPerformanceReport()
  };
}

// 性能装饰器
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      
      // 如果是Promise，等待完成后记录时间
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now();
          performanceMonitor.recordMetric(name, endTime - startTime);
        });
      } else {
        const endTime = performance.now();
        performanceMonitor.recordMetric(name, endTime - startTime);
        return result;
      }
    } catch (error) {
      const endTime = performance.now();
      performanceMonitor.recordMetric(`${name}_ERROR`, endTime - startTime);
      throw error;
    }
  }) as T;
}

// 页面性能分析
export function analyzePagePerformance() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    // 导航时间
    navigationStart: navigation.fetchStart,
    loadEventEnd: navigation.loadEventEnd,
    domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
    
    // 网络时间
    dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcpConnect: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    
    // 处理时间
    domProcessing: navigation.domComplete - navigation.domInteractive,
    
    // 绘制时间
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // 总时间
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
  };
}

export default performanceMonitor;