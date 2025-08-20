// 性能监控初始化
import { performanceMonitor } from './performance';
import { cacheManager } from './cache';

// 初始化性能监控
export function initPerformanceMonitoring() {
  // 启动性能监控
  performanceMonitor.init();
  
  // 监控页面加载性能
  window.addEventListener('load', () => {
    setTimeout(() => {
      // 记录页面加载完成时间
      const loadTime = performance.now();
      performanceMonitor.recordMetric('PAGE_LOAD_COMPLETE', loadTime);
      
      // 记录DOM节点数量
      const domNodes = document.querySelectorAll('*').length;
      performanceMonitor.recordMetric('DOM_NODES_COUNT', domNodes);
      
      // 记录缓存统计
      const cacheStats = cacheManager.getStats();
      performanceMonitor.recordMetric('CACHE_SIZE', cacheStats.memorySize);
      
      // Performance monitoring initialized (仅在开发环境输出)
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('Performance monitoring initialized');
      }
    }, 1000);
  });
  
  // 监控页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      performanceMonitor.recordMetric('PAGE_VISIBLE', performance.now());
    } else {
      performanceMonitor.recordMetric('PAGE_HIDDEN', performance.now());
    }
  });
  
  // 监控网络状态变化
  window.addEventListener('online', () => {
    performanceMonitor.recordMetric('NETWORK_ONLINE', performance.now());
  });
  
  window.addEventListener('offline', () => {
    performanceMonitor.recordMetric('NETWORK_OFFLINE', performance.now());
  });
  
  // 定期清理过期缓存
  setInterval(() => {
    // 这里可以添加缓存清理逻辑
    // Cache cleanup check (仅在开发环境输出)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Cache cleanup check');
    }
  }, 5 * 60 * 1000); // 每5分钟检查一次
}

// 页面卸载时的清理
export function cleanupPerformanceMonitoring() {
  performanceMonitor.cleanup();
  cacheManager.clear();
}

// 获取性能报告
export function getPerformanceReport() {
  return performanceMonitor.getPerformanceReport();
}
