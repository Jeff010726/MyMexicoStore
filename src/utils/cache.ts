import React from 'react';

// 缓存策略工具类

interface CacheConfig {
  key: string;
  ttl: number; // 缓存时间（毫秒）
  version?: string;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultVersion = '1.0.0';

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // 设置缓存
  set<T>(config: CacheConfig, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      version: config.version || this.defaultVersion
    };

    // 内存缓存
    this.cache.set(config.key, item);

    // localStorage缓存（用于持久化）
    try {
      localStorage.setItem(`cache_${config.key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('localStorage缓存失败:', error);
    }
  }

  // 获取缓存
  get<T>(config: CacheConfig): T | null {
    // 先检查内存缓存
    let item = this.cache.get(config.key);

    // 如果内存中没有，尝试从localStorage获取
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${config.key}`);
        if (stored) {
          item = JSON.parse(stored);
          // 恢复到内存缓存
          if (item) {
            this.cache.set(config.key, item);
          }
        }
      } catch (error) {
        console.warn('localStorage读取失败:', error);
        return null;
      }
    }

    if (!item) return null;

    // 检查版本
    const itemVersion = item.version || this.defaultVersion;
    const configVersion = config.version || this.defaultVersion;
    if (itemVersion !== configVersion) {
      this.delete(config.key);
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(config.key);
      return null;
    }

    return item.data;
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('localStorage删除失败:', error);
    }
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('localStorage清空失败:', error);
    }
  }

  // 获取缓存统计信息
  getStats() {
    return {
      memorySize: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 预定义的缓存配置
export const CacheConfigs = {
  // 商品列表缓存5分钟
  PRODUCTS_LIST: {
    key: 'products_list',
    ttl: 5 * 60 * 1000,
    version: '1.0.0'
  },
  // 商品详情缓存10分钟
  PRODUCT_DETAIL: (id: string) => ({
    key: `product_detail_${id}`,
    ttl: 10 * 60 * 1000,
    version: '1.0.0'
  }),
  // 用户信息缓存1分钟
  USER_PROFILE: {
    key: 'user_profile',
    ttl: 1 * 60 * 1000,
    version: '1.0.0'
  },
  // 购物车缓存30分钟
  SHOPPING_CART: {
    key: 'shopping_cart',
    ttl: 30 * 60 * 1000,
    version: '1.0.0'
  },
  // 统计数据缓存1小时
  ANALYTICS_DATA: {
    key: 'analytics_data',
    ttl: 60 * 60 * 1000,
    version: '1.0.0'
  }
};

// 导出缓存管理器实例
export const cacheManager = CacheManager.getInstance();

// API缓存装饰器
export function withCache<T>(
  config: CacheConfig,
  fetcher: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // 尝试从缓存获取
      const cached = cacheManager.get<T>(config);
      if (cached !== null) {
        resolve(cached);
        return;
      }

      // 缓存未命中，执行原始请求
      const data = await fetcher();
      
      // 存储到缓存
      cacheManager.set(config, data);
      
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

// React Hook for cache
export function useCache<T>(
  config: CacheConfig,
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await withCache(config, fetcher);
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error };
}