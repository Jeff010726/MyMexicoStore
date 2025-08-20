import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import { apiRequest, API_CONFIG } from '../config/api';
import SEOHead from '../components/SEOHead';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取精选商品
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}?limit=3`);
      
      if (response.success && response.data) {
        const apiProducts = response.data.products || [];
        
        // 转换API数据格式
        const formattedProducts = apiProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '/placeholder.svg?height=300&width=300',
          description: product.description
        }));
        
        setFeaturedProducts(formattedProducts);
      } else {
        console.error('获取精选商品失败:', response);
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('API调用失败:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="MyMexico Store - 墨西哥优质商品在线购物平台"
        description="发现墨西哥最优质的商品！MyMexico Store提供家具、家电、装饰品等多种商品，支持安全支付，快速配送到您家门口。立即开始购物，享受优质服务！"
        keywords="墨西哥商品,在线购物,家具,家电,装饰品,安全支付,快速配送,优质服务,电商平台,爆款商品"
        type="website"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              爆款日用品商城
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100">
              墨西哥最受欢迎的生活用品在线商城
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-white text-pink-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="mr-2" size={24} />
              立即抢购
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们？</h2>
            <p className="text-lg text-gray-600">精选爆款，品质保证，让生活更美好</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">快速配送</h3>
              <p className="text-gray-600">全墨西哥范围内快速配送，订单满$500免费配送</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">品质保证</h3>
              <p className="text-gray-600">精选优质商品，7天无理由退换，品质有保障</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">贴心服务</h3>
              <p className="text-gray-600">专业客服团队，随时为您解答疑问和处理售后</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🔥 今日爆款</h2>
            <p className="text-lg text-gray-600">精选最受欢迎的生活好物</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-transparent hover:border-pink-200">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                    爆款
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-pink-600">
                        ${product.price.toFixed(2)} MXN
                      </span>
                      <div className="text-sm text-gray-500">
                        ⭐⭐⭐⭐⭐ (1000+ 好评)
                      </div>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-colors font-medium"
                    >
                      立即购买
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无精选商品</p>
              <Link
                to="/products"
                className="inline-block mt-4 text-pink-600 hover:text-pink-700"
              >
                查看所有商品
              </Link>
            </div>
          )}
          
          {!loading && featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center bg-gradient-to-r from-pink-500 to-orange-400 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-orange-500 transition-colors"
              >
                查看更多爆款
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">发现更多生活好物</h2>
          <p className="text-xl mb-8 text-pink-100">
            每日上新，爆款不断，让您的生活更加便利美好
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-white text-pink-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            开始购物
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;