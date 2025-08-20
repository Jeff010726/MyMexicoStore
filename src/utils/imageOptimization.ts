
/**
 * 图片优化工具类
 * 提供图片压缩、格式转换、懒加载等功能
 */

// 图片优化配置
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: boolean;
}

// 默认配置
const DEFAULT_CONFIG: ImageOptimizationConfig = {
  quality: 80,
  format: 'auto',
  lazy: true,
  placeholder: true
};

/**
 * 检测浏览器是否支持WebP格式
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * 检测浏览器是否支持AVIF格式
 */
export const supportsAVIF = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * 获取优化后的图片URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  config: ImageOptimizationConfig = {}
): string => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // 如果是本地图片或已经是优化过的URL，直接返回
  if (originalUrl.startsWith('/') || originalUrl.includes('?')) {
    return originalUrl;
  }
  
  // 构建优化参数
  const params = new URLSearchParams();
  
  if (finalConfig.width) {
    params.append('w', finalConfig.width.toString());
  }
  
  if (finalConfig.height) {
    params.append('h', finalConfig.height.toString());
  }
  
  if (finalConfig.quality) {
    params.append('q', finalConfig.quality.toString());
  }
  
  if (finalConfig.format && finalConfig.format !== 'auto') {
    params.append('f', finalConfig.format);
  }
  
  // 如果有参数，添加到URL
  if (params.toString()) {
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }
  
  return originalUrl;
};

/**
 * 生成响应式图片的srcset
 */
export const generateSrcSet = (
  originalUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920],
  config: ImageOptimizationConfig = {}
): string => {
  return widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(originalUrl, {
        ...config,
        width
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * 预加载关键图片
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * 批量预加载图片
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.all(promises);
};

/**
 * 图片懒加载观察器
 */
export class LazyImageObserver {
  private observer: IntersectionObserver;
  private images: Set<HTMLImageElement> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcset) {
      img.srcset = srcset;
    }
    
    img.classList.remove('lazy');
    img.classList.add('loaded');
  }

  observe(img: HTMLImageElement) {
    this.images.add(img);
    this.observer.observe(img);
  }

  unobserve(img: HTMLImageElement) {
    this.images.delete(img);
    this.observer.unobserve(img);
  }

  disconnect() {
    this.observer.disconnect();
    this.images.clear();
  }
}

/**
 * 全局懒加载观察器实例
 */
export const globalLazyObserver = new LazyImageObserver();

/**
 * 图片压缩工具
 */
export const compressImage = (
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 获取图片主色调
 */
export const getImageDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('无法获取图片数据'));
          return;
        }
        
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        
        // 采样计算平均颜色
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        const pixelCount = data.length / 4;
        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);
        
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageUrl;
  });
};

/**
 * 图片格式检测
 */
export const getImageFormat = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
};

/**
 * 图片尺寸获取
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => reject(new Error('无法获取图片尺寸'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 创建图片缩略图
 */
export const createThumbnail = (
  file: File,
  size: number = 150,
  quality: number = 0.8
): Promise<Blob> => {
  return compressImage(file, quality, size, size);
};

/**
 * 图片优化统计
 */
export interface ImageOptimizationStats {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
}

/**
 * 获取图片优化统计信息
 */
export const getOptimizationStats = async (
  originalFile: File,
  optimizedBlob: Blob
): Promise<ImageOptimizationStats> => {
  const dimensions = await getImageDimensions(originalFile);
  const compressionRatio = ((originalFile.size - optimizedBlob.size) / originalFile.size) * 100;
  
  return {
    originalSize: originalFile.size,
    optimizedSize: optimizedBlob.size,
    compressionRatio: Math.round(compressionRatio * 100) / 100,
    format: getImageFormat(originalFile),
    dimensions
  };
};