// Cloudflare Workers 缓存工具类

interface CacheOptions {
  ttl?: number; // 缓存时间（秒）
  key?: string; // 自定义缓存键
  vary?: string[]; // 缓存变化因子
  browser?: number; // 浏览器缓存时间
}

export class WorkerCache {
  private static instance: WorkerCache;
  
  static getInstance(): WorkerCache {
    if (!WorkerCache.instance) {
      WorkerCache.instance = new WorkerCache();
    }
    return WorkerCache.instance;
  }

  // 生成缓存键
  private generateCacheKey(request: Request, customKey?: string): string {
    if (customKey) {
      return `cache:${customKey}`;
    }
    
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    const search = url.search;
    
    return `cache:${method}:${pathname}${search}`;
  }

  // 从缓存获取响应
  async get(request: Request, options: CacheOptions = {}): Promise<Response | null> {
    try {
      const cacheKey = this.generateCacheKey(request, options.key);
      
      // 尝试从Cloudflare缓存获取
      const cache = caches.default;
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        // 检查缓存是否过期
        const cacheTime = cachedResponse.headers.get('cf-cache-time');
        if (cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          const ttl = (options.ttl || 300) * 1000; // 转换为毫秒
          
          if (age < ttl) {
            console.log(`Cache hit: ${cacheKey}`);
            return cachedResponse;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // 设置缓存响应
  async set(
    request: Request, 
    response: Response, 
    options: CacheOptions = {}
  ): Promise<Response> {
    try {
      const cacheKey = this.generateCacheKey(request, options.key);
      const ttl = options.ttl || 300; // 默认5分钟
      const browserTtl = options.browser || ttl;
      
      // 克隆响应以避免流被消费
      const responseToCache = response.clone();
      
      // 设置缓存头
      const headers = new Headers(responseToCache.headers);
      headers.set('Cache-Control', `public, max-age=${browserTtl}, s-maxage=${ttl}`);
      headers.set('cf-cache-time', Date.now().toString());
      
      // 添加Vary头
      if (options.vary) {
        headers.set('Vary', options.vary.join(', '));
      }
      
      // 创建带缓存头的响应
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      // 存储到Cloudflare缓存
      const cache = caches.default;
      await cache.put(cacheKey, cachedResponse.clone());
      
      console.log(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
      
      return cachedResponse;
    } catch (error) {
      console.error('Cache set error:', error);
      return response;
    }
  }

  // 删除缓存
  async delete(request: Request, customKey?: string): Promise<boolean> {
    try {
      const cacheKey = this.generateCacheKey(request, customKey);
      const cache = caches.default;
      const deleted = await cache.delete(cacheKey);
      
      if (deleted) {
        console.log(`Cache deleted: ${cacheKey}`);
      }
      
      return deleted;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // 清空指定模式的缓存
  async purgePattern(pattern: string): Promise<void> {
    try {
      // 注意：Cloudflare Workers 环境中无法直接枚举缓存键
      // 这里提供一个概念性实现，实际使用时需要通过Cloudflare API
      console.log(`Cache purge pattern: ${pattern}`);
    } catch (error) {
      console.error('Cache purge error:', error);
    }
  }
}

// 缓存装饰器函数
export function withCache(options: CacheOptions = {}) {
  return function(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    
    descriptor.value = async function(request: Request, ...args: any[]) {
      const cache = WorkerCache.getInstance();
      
      // 尝试从缓存获取
      const cachedResponse = await cache.get(request, options);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 执行原方法
      const response = await method.apply(this, [request, ...args]);
      
      // 缓存响应（仅对成功响应缓存）
      if (response.ok) {
        return await cache.set(request, response, options);
      }
      
      return response;
    };
  };
}

// 预定义缓存配置
export const CacheConfigs = {
  // 商品列表 - 5分钟缓存
  PRODUCTS_LIST: {
    ttl: 300,
    browser: 300,
    vary: ['Accept-Language']
  },
  
  // 商品详情 - 10分钟缓存
  PRODUCT_DETAIL: {
    ttl: 600,
    browser: 600,
    vary: ['Accept-Language']
  },
  
  // 静态资源 - 1小时缓存
  STATIC_ASSETS: {
    ttl: 3600,
    browser: 3600
  },
  
  // API响应 - 1分钟缓存
  API_RESPONSE: {
    ttl: 60,
    browser: 60
  },
  
  // 统计数据 - 5分钟缓存
  ANALYTICS: {
    ttl: 300,
    browser: 300
  }
};

// 导出缓存实例
export const workerCache = WorkerCache.getInstance();

// 缓存中间件
export async function cacheMiddleware(
  request: Request,
  handler: (request: Request) => Promise<Response>,
  options: CacheOptions = {}
): Promise<Response> {
  const cache = WorkerCache.getInstance();
  
  // 只对GET请求启用缓存
  if (request.method !== 'GET') {
    return handler(request);
  }
  
  // 尝试从缓存获取
  const cachedResponse = await cache.get(request, options);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 执行处理器
  const response = await handler(request);
  
  // 缓存成功响应
  if (response.ok) {
    return await cache.set(request, response, options);
  }
  
  return response;
}

// KV存储缓存（用于更复杂的缓存需求）
export class KVCache {
  private namespace: KVNamespace;
  
  constructor(namespace: KVNamespace) {
    this.namespace = namespace;
  }
  
  // 设置KV缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify({
      value,
      timestamp: Date.now(),
      ttl: ttl ? ttl * 1000 : undefined
    });
    
    await this.namespace.put(key, data, {
      expirationTtl: ttl
    });
  }
  
  // 获取KV缓存
  async get<T>(key: string): Promise<T | null> {
    const data = await this.namespace.get(key);
    if (!data) return null;
    
    try {
      const parsed = JSON.parse(data);
      
      // 检查TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        await this.namespace.delete(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('KV cache parse error:', error);
      return null;
    }
  }
  
  // 删除KV缓存
  async delete(key: string): Promise<void> {
    await this.namespace.delete(key);
  }
  
  // 批量删除
  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.namespace.delete(key)));
  }
}

export default WorkerCache;