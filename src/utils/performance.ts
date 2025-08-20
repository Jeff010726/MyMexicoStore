// 此文件已被禁用
export const performanceMonitor = {
  init: () => {},
  cleanup: () => {},
  recordMetric: () => {},
  getMetrics: () => ({}),
  getPerformanceReport: () => ({})
};

export const usePerformanceMonitoring = () => ({
  recordMetric: () => {},
  getMetrics: () => ({}),
  getReport: () => ({})
});

export function withPerformanceTracking(fn: any) {
  return fn;
}

export function analyzePagePerformance() {
  return null;
}

export default performanceMonitor;