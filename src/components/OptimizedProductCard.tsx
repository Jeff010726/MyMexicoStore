import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { performanceMonitor } from '../utils/performance';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  description?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  isHot?: boolean;
  originalPrice?: number;
}

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// 使用React.memo优化重渲染
const OptimizedProductCard = memo<OptimizedProductCardProps>(({ 
  product, 
  onAddToCart
}) => {
  const handleCardClick = () => {
    // 记录用户交互性能
    const startTime = performance.now();
    
    // 预加载商品详情页面
    import('../pages/ProductDetail').then(() => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric('PRODUCT_DETAIL_PRELOAD', loadTime);
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // 图片加载失败时的处理
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-64 object-cover rounded-t-lg"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        
        {product.isHot && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            🔥 爆款
          </div>
        )}
        
        {product.originalPrice && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            省${(product.originalPrice - product.price).toFixed(0)}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-pink-600">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-gray-500">MXN</span>
          </div>
        </div>

        {product.stock !== undefined && (
          <p className="text-sm text-gray-500 mb-4">
            {product.stock > 0 ? `仅剩 ${product.stock} 件` : '暂时缺货'}
          </p>
        )}

        <div className="flex gap-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-center hover:bg-gray-200 transition-colors text-sm"
          >
            查看详情
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? '暂时缺货' : '立即购买'}
          </button>
        </div>
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;