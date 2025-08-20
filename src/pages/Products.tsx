import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Grid, List, Star } from 'lucide-react';
import { useStore } from '../store/useStore';

const Products = () => {
  const { addToCart } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 日用品爆款商品数据
  const mockProducts = [
    {
      id: '1',
      name: '多功能厨房收纳盒',
      description: '大容量分格设计，厨房整理神器，防潮防虫，让厨房井井有条',
      price: 299,
      originalPrice: 399,
      image: '/placeholder.svg?height=300&width=300',
      category: 'kitchen',
      stock: 150,
      rating: 4.9,
      reviews: 2341,
      isHot: true
    },
    {
      id: '2',
      name: '懒人拖鞋清洁套装',
      description: '边走边拖地，解放双手，居家清洁必备，轻松搞定地面清洁',
      price: 199,
      originalPrice: 249,
      image: '/placeholder.svg?height=300&width=300',
      category: 'cleaning',
      stock: 200,
      rating: 4.8,
      reviews: 1856,
      isHot: true
    },
    {
      id: '3',
      name: '便携式折叠购物车',
      description: '轻便耐用，大容量设计，购物出行好帮手，可折叠收纳',
      price: 399,
      originalPrice: 499,
      image: '/placeholder.svg?height=300&width=300',
      category: 'storage',
      stock: 80,
      rating: 4.7,
      reviews: 1234,
      isHot: false
    },
    {
      id: '4',
      name: '智能感应垃圾桶',
      description: '自动开盖，卫生便捷，大容量设计，厨房卫生间必备',
      price: 599,
      originalPrice: 799,
      image: '/placeholder.svg?height=300&width=300',
      category: 'kitchen',
      stock: 60,
      rating: 4.6,
      reviews: 987,
      isHot: true
    },
    {
      id: '5',
      name: '多层鞋架收纳架',
      description: '节省空间，多层设计，可调节高度，玄关收纳好帮手',
      price: 259,
      originalPrice: 329,
      image: '/placeholder.svg?height=300&width=300',
      category: 'storage',
      stock: 120,
      rating: 4.5,
      reviews: 1567,
      isHot: false
    },
    {
      id: '6',
      name: '浴室防滑吸盘置物架',
      description: '强力吸盘，免打孔安装，浴室收纳神器，防水防锈',
      price: 159,
      originalPrice: 199,
      image: '/placeholder.svg?height=300&width=300',
      category: 'bathroom',
      stock: 180,
      rating: 4.4,
      reviews: 892,
      isHot: false
    },
    {
      id: '7',
      name: '可伸缩晾衣架',
      description: '室内外通用，可伸缩调节，承重力强，阳台必备神器',
      price: 349,
      originalPrice: 429,
      image: '/placeholder.svg?height=300&width=300',
      category: 'laundry',
      stock: 90,
      rating: 4.7,
      reviews: 1456,
      isHot: true
    },
    {
      id: '8',
      name: '密封保鲜盒套装',
      description: '食品级材质，密封性好，冰箱收纳整理，保鲜效果佳',
      price: 229,
      originalPrice: 289,
      image: '/placeholder.svg?height=300&width=300',
      category: 'kitchen',
      stock: 220,
      rating: 4.8,
      reviews: 2103,
      isHot: true
    }
  ];

  const categories = [
    { id: 'all', name: '全部商品' },
    { id: 'kitchen', name: '厨房用品' },
    { id: 'cleaning', name: '清洁用品' },
    { id: 'storage', name: '收纳整理' },
    { id: 'bathroom', name: '浴室用品' },
    { id: 'laundry', name: '洗护用品' }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    addToCart(product);
    alert(`${product.name} 已添加到购物车！`);
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔥 爆款日用品</h1>
          <p className="text-gray-600">发现最受欢迎的生活好物，让生活更便利</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索生活好物..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

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
        </div>

        {/* 商品列表 */}
        <div className="mb-4">
          <p className="text-gray-600">
            找到 {filteredProducts.length} 个爆款商品
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">没有找到匹配的商品</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full object-cover ${viewMode === 'list' ? 'h-48' : 'h-64'}`}
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
                
                <div className="p-6 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* 评分 */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {product.rating} ({product.reviews}+)
                    </span>
                  </div>

                  {/* 价格 */}
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

                  {/* 库存状态 */}
                  <p className="text-sm text-gray-500 mb-4">
                    仅剩 {product.stock} 件
                  </p>

                  {/* 操作按钮 */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-col' : ''}`}>
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-center hover:bg-gray-200 transition-colors text-sm"
                    >
                      查看详情
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-colors flex items-center justify-center text-sm"
                    >
                      <ShoppingCart className="mr-1" size={16} />
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;