import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Award, Users, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiRequest, API_CONFIG } from '../config/api';
import SEOHead from '../components/SEOHead';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // 从API获取商品详情
  const fetchProductDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id));
      
      if (response.success && response.data) {
        const apiProduct = response.data;
        
        // 转换API数据格式以匹配前端需求
        const formattedProduct = {
          id: apiProduct.id,
          name: apiProduct.name,
          description: apiProduct.description,
          price: apiProduct.price,
          originalPrice: apiProduct.originalPrice,
          images: apiProduct.images && apiProduct.images.length > 0 
            ? apiProduct.images 
            : ['/placeholder.svg?height=600&width=600'],
          category: apiProduct.category,
          stock: apiProduct.stock,
          rating: 4.5 + Math.random() * 0.5, // 临时评分
          reviews: Math.floor(Math.random() * 2000) + 500, // 临时评价数
          isHot: Math.random() > 0.5, // 临时热门标记
          features: [
            '🔥 爆款推荐商品',
            '✅ 品质保证',
            '🚚 快速配送',
            '🛡️ 正品保障',
            '🔄 7天退换',
            '💰 价格优惠'
          ],
          specifications: {
            '商品名称': apiProduct.name,
            '商品分类': apiProduct.category,
            '库存数量': `${apiProduct.stock} 件`,
            '商品状态': apiProduct.status === 'active' ? '正常销售' : '暂停销售',
            '更新时间': new Date(apiProduct.updatedAt || Date.now()).toLocaleDateString()
          },
          benefits: [
            '💰 优惠价格',
            '🚚 快速配送',
            '📦 精美包装',
            '🔄 无忧退换'
          ]
        };
        
        setProduct(formattedProduct);
      } else {
        console.error('获取商品详情失败:', response);
        setProduct(null);
      }
    } catch (error) {
      console.error('API调用失败:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      alert(`🎉 ${product.name} x${quantity} 已添加到购物车！`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载爆款商品详情...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">商品未找到</h2>
          <Link to="/products" className="text-pink-600 hover:text-pink-700">
            返回商品列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={product ? `${product.name} - 商品详情` : '商品详情'}
        description={product ? `${product.description} 现价 $${product.price}，原价 $${product.originalPrice}，立即购买享受优惠！` : '查看商品详情，享受优质购物体验'}
        keywords={product ? `${product.name},${product.category},墨西哥商品,在线购物` : '商品详情,在线购物'}
        type="product"
        price={product?.price}
        currency="MXN"
        availability={product?.stock > 0 ? 'in_stock' : 'out_of_stock'}
        brand="MyMexico Store"
        category={product?.category}
        image={product?.images?.[0]}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link
              to="/products"
              className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              返回商品列表
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* 商品图片 */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.isHot && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      🔥 爆款
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    省${(product.originalPrice - product.price).toFixed(0)}
                  </div>
                </div>
                
                {/* 缩略图 */}
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-pink-600' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 商品信息 */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* 评分和销量 */}
                <div className="flex items-center mb-4 space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews}+ 好评)
                  </span>
                  <div className="flex items-center text-sm text-orange-600">
                    <Users size={16} className="mr-1" />
                    <span>已售 {Math.floor(product.reviews * 0.8)}+ 件</span>
                  </div>
                </div>

                {/* 价格 */}
                <div className="mb-6 bg-pink-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-3xl font-bold text-pink-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">MXN</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      💰 节省 ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                    <span className="text-orange-600">
                      <Clock size={14} className="inline mr-1" />
                      限时优惠
                    </span>
                  </div>
                </div>

                {/* 商品描述 */}
                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

                {/* 主要特性 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ 产品特色</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 购买优势 */}
                <div className="mb-6 bg-gradient-to-r from-pink-50 to-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🎁 购买优势</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="text-sm text-gray-700">
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 数量选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    购买数量
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    📦 库存充足: {product.stock} 件
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="mr-2" size={20} />
                    立即购买
                  </button>
                  <button className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>

                {/* 服务保障 */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center">
                      <Truck className="text-green-600 mr-3" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">🚚 免费配送</p>
                        <p className="text-sm text-gray-600">订单满 $500 免费配送</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Shield className="text-blue-600 mr-3" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">🛡️ 正品保障</p>
                        <p className="text-sm text-gray-600">100% 正品，假一赔十</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <RotateCcw className="text-purple-600 mr-3" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">🔄 7天无理由退货</p>
                        <p className="text-sm text-gray-600">支持7天无理由退换货</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Award className="text-orange-600 mr-3" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">🏆 品质保证</p>
                        <p className="text-sm text-gray-600">严选优质商品，品质有保障</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 详细规格 */}
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📋 详细规格</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="w-24 text-sm font-medium text-gray-500">{key}:</span>
                    <span className="text-sm text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;