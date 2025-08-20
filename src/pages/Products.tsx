import React, { useState, useEffect, useCallback } from 'react';
import { Search, Grid, List, Filter, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiRequest, API_CONFIG } from '../config/api';
import OptimizedProductCard from '../components/OptimizedProductCard';
import SEOHead from '../components/SEOHead';

const Products = () => {
  const { addToCart } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // 从API获取商品数据（支持高级搜索）
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // 构建查询参数
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: 'active'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (inStockOnly) params.append('inStock', 'true');
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}?${params.toString()}`);
      
      if (response.success && response.data) {
        const apiProducts = response.data.products || [];
        setTotalProducts(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        
        // 转换API数据格式以匹配前端需求
        const formattedProducts = apiProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || '/placeholder.svg?height=300&width=300',
          category: product.category,
          stock: product.stock,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 2000) + 500,
          isHot: Math.random() > 0.5
        }));
        
        setProducts(formattedProducts);
      } else {
        console.error('API返回格式错误:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('获取商品数据失败:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, priceRange, sortBy, sortOrder, inStockOnly]);

  // 获取搜索建议
  const fetchSearchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.success && response.data) {
        setSearchSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('获取搜索建议失败:', error);
    }
  };

  // 获取商品分类
  const fetchCategories = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/categories`);
      if (response.success && response.data) {
        setCategories(['all', ...response.data.categories.map((cat: any) => cat.category)]);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      setCategories(['all', 'kitchen', 'cleaning', 'storage', 'bathroom', 'laundry']);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 搜索输入处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    
    if (value.length >= 2) {
      fetchSearchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // 选择搜索建议
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  // 价格范围处理
  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

  // 清除筛选
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('created_at');
    setSortOrder('desc');
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    alert(`${product.name} 已添加到购物车！`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载爆款商品...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="商品列表 - 墨西哥优质日用品在线购物"
        description="浏览我们精选的墨西哥优质日用品，包括厨房用品、清洁用品、收纳整理等多种商品，享受安全支付和快速配送服务。"
        keywords="墨西哥商品,日用品,厨房用品,清洁用品,收纳整理,在线购物"
        type="website"
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔥 爆款日用品</h1>
            <p className="text-gray-600">发现最受欢迎的生活好物，让生活更便利</p>
          </div>

          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col gap-4">
              {/* 第一行：搜索框和基本控制 */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* 搜索框 */}
                <div className="flex-1 max-w-md relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="搜索生活好物..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* 搜索建议 */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter size={16} className="mr-2" />
                    高级筛选
                    <ChevronDown size={16} className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 视图切换 */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 高级筛选面板 */}
              {showFilters && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 分类筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">商品分类</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="all">全部分类</option>
                        {categories.filter(cat => cat !== 'all').map(category => (
                          <option key={category} value={category}>
                            {category === 'kitchen' ? '厨房用品' :
                             category === 'cleaning' ? '清洁用品' :
                             category === 'storage' ? '收纳整理' :
                             category === 'bathroom' ? '浴室用品' :
                             category === 'laundry' ? '洗护用品' : category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 价格范围 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">价格范围 (MXN)</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="最低价"
                          value={priceRange.min}
                          onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="最高价"
                          value={priceRange.max}
                          onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* 排序方式 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="created_at-desc">最新上架</option>
                        <option value="price-asc">价格从低到高</option>
                        <option value="price-desc">价格从高到低</option>
                        <option value="name-asc">名称A-Z</option>
                        <option value="name-desc">名称Z-A</option>
                      </select>
                    </div>

                    {/* 库存筛选 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">库存状态</label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => {
                            setInStockOnly(e.target.checked);
                            setCurrentPage(1);
                          }}
                          className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-700">仅显示有库存商品</span>
                      </label>
                    </div>
                  </div>

                  {/* 清除筛选按钮 */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={clearFilters}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <X size={16} className="mr-1" />
                      清除筛选
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 商品统计和分页信息 */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              找到 {totalProducts} 个爆款商品 {currentPage > 1 && `(第 ${currentPage} 页)`}
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>

          {/* 商品列表 */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">没有找到匹配的商品</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                清除筛选条件
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {products.map((product) => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {/* 加载更多 */}
          {loading && products.length > 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;