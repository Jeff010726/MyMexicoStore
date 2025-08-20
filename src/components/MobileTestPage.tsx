import React from 'react';
import MobileProductCard from './MobileProductCard';

const MobileTestPage: React.FC = () => {
  // 测试产品数据
  const testProducts = [
    {
      id: 1,
      name: "墨西哥手工艺品 - 彩色陶瓷花瓶",
      price: 45.99,
      image: "/placeholder.svg",
      description: "传统手工制作，独特的墨西哥风格设计",
      category: "家居装饰",
      stock: 15
    },
    {
      id: 2,
      name: "墨西哥辣椒酱套装",
      price: 24.99,
      image: "/placeholder.svg",
      description: "正宗墨西哥风味，3种不同辣度",
      category: "食品",
      stock: 3
    },
    {
      id: 3,
      name: "墨西哥银饰手镯",
      price: 89.99,
      image: "/placeholder.svg",
      description: "925纯银制作，传统图案设计",
      category: "珠宝",
      stock: 0
    },
    {
      id: 4,
      name: "墨西哥咖啡豆",
      price: 18.99,
      image: "/placeholder.svg",
      description: "高海拔种植，浓郁香醇",
      category: "饮品",
      stock: 25
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 移动端头部测试 */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-center text-gray-800">
          移动端适配测试
        </h1>
        <p className="text-sm text-gray-600 text-center mt-2">
          测试各种屏幕尺寸下的显示效果
        </p>
      </div>

      {/* 搜索框测试 */}
      <div className="px-4 mb-4">
        <div className="search-mobile">
          <input
            type="text"
            placeholder="搜索商品..."
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          />
        </div>
      </div>

      {/* 筛选按钮测试 */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button className="btn-mobile bg-blue-600 text-white rounded-lg whitespace-nowrap">
            全部商品
          </button>
          <button className="btn-mobile bg-gray-200 text-gray-700 rounded-lg whitespace-nowrap">
            家居装饰
          </button>
          <button className="btn-mobile bg-gray-200 text-gray-700 rounded-lg whitespace-nowrap">
            食品饮料
          </button>
          <button className="btn-mobile bg-gray-200 text-gray-700 rounded-lg whitespace-nowrap">
            珠宝首饰
          </button>
        </div>
      </div>

      {/* 产品网格测试 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">热门商品</h2>
        <div className="product-grid">
          {testProducts.map(product => (
            <MobileProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* 表单测试 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">表单测试</h2>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="form-mobile space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <input
                type="text"
                placeholder="请输入您的姓名"
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                type="email"
                placeholder="请输入邮箱地址"
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                留言
              </label>
              <textarea
                placeholder="请输入您的留言..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg text-base resize-none"
              />
            </div>
            <button className="btn-mobile btn-full-width bg-blue-600 text-white rounded-lg">
              提交
            </button>
          </div>
        </div>
      </div>

      {/* 购物车项目测试 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">购物车测试</h2>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="cart-item">
            <img
              src="/placeholder.svg"
              alt="商品"
              className="cart-item-image rounded"
            />
            <div className="cart-item-details">
              <h3 className="font-medium text-gray-900">墨西哥手工艺品</h3>
              <p className="text-sm text-gray-600">传统手工制作</p>
            </div>
            <div className="cart-item-actions">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 bg-gray-200 rounded text-gray-600">-</button>
                <span className="px-3 py-1 bg-gray-100 rounded">1</span>
                <button className="w-8 h-8 bg-gray-200 rounded text-gray-600">+</button>
              </div>
              <span className="font-bold text-blue-600">$45.99</span>
            </div>
          </div>
        </div>
      </div>

      {/* 响应式测试信息 */}
      <div className="px-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">响应式测试说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 小屏手机 (≤375px): 单列布局</li>
            <li>• 大屏手机 (375px-768px): 双列布局</li>
            <li>• 平板 (768px-1024px): 三列布局</li>
            <li>• 桌面 (≥1024px): 四列布局</li>
          </ul>
        </div>
      </div>

      {/* 触摸优化测试 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">触摸优化测试</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-mobile bg-green-600 text-white rounded-lg active:scale-95 transition-transform">
            触摸反馈
          </button>
          <button className="btn-mobile bg-orange-600 text-white rounded-lg active:scale-95 transition-transform">
            按压效果
          </button>
        </div>
      </div>

      {/* 加载状态测试 */}
      <div className="px-4 mb-6">
        <div className="loading-mobile">
          <div className="loading-spinner animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>

      {/* 空状态测试 */}
      <div className="px-4 mb-6">
        <div className="empty-state-mobile">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a1 1 0 011-1h1m-1 1v4h4V9a1 1 0 011-1h1m2 0h1a1 1 0 011 1v4h4V9a1 1 0 011-1h1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">暂无数据</h3>
          <p className="text-sm">当前没有可显示的内容</p>
        </div>
      </div>
    </div>
  );
};

export default MobileTestPage;