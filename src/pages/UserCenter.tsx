import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  MapPin, 
  Bell, 
  Star,
  LogOut,
  Edit,
  Eye,
  Calendar,
  Award
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiRequest, API_CONFIG } from '../config/api';

const UserCenter = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取用户完整信息
  const fetchUserProfile = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 获取用户订单
  const fetchUserOrders = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    }
  };

  // 获取收藏商品
  const fetchFavorites = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/favorites`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.success) {
        setFavorites(response.data.favorites || []);
      }
    } catch (error) {
      console.error('获取收藏失败:', error);
    }
  };

  // 获取地址列表
  const fetchAddresses = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/addresses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error('获取地址失败:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchUserOrders(),
        fetchFavorites(),
        fetchAddresses()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'shipped': return '已发货';
      case 'delivered': return '已送达';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载用户信息...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'orders', label: '我的订单', icon: Package },
    { id: 'favorites', label: '我的收藏', icon: Heart },
    { id: 'addresses', label: '地址管理', icon: MapPin },
    { id: 'security', label: '账户安全', icon: Settings },
    { id: 'notifications', label: '消息通知', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 用户信息头部 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  欢迎回来，{user?.name || '用户'}！
                </h1>
                <p className="text-gray-600">
                  {user?.email}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="w-4 h-4 mr-1" />
                    会员等级：普通会员
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    注册时间：{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '未知'}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏菜单 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-pink-50 text-pink-600 border-l-4 border-pink-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* 个人资料 */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">个人资料</h2>
                    <button className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                      <Edit className="w-4 h-4 mr-2" />
                      编辑资料
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user?.name || '未设置'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user?.email || '未设置'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile?.phone || '未设置'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">生日</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile?.birthday || '未设置'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 我的订单 */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">我的订单</h2>
                    <div className="text-sm text-gray-600">
                      共 {orders.length} 个订单
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-4">暂无订单</p>
                      <Link
                        to="/products"
                        className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        去购物
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                订单号：{order.id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                下单时间：{new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                              </span>
                              <p className="text-lg font-bold text-gray-900 mt-1">
                                ${order.totalAmount.toFixed(2)} MXN
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              共 {order.items?.length || 0} 件商品
                            </div>
                            <div className="flex space-x-2">
                              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                <Eye className="w-4 h-4 mr-1" />
                                查看详情
                              </button>
                              {order.status === 'delivered' && (
                                <button className="flex items-center px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors">
                                  <Star className="w-4 h-4 mr-1" />
                                  评价
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 我的收藏 */}
              {activeTab === 'favorites' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">我的收藏</h2>
                    <div className="text-sm text-gray-600">
                      共 {favorites.length} 个商品
                    </div>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-4">暂无收藏商品</p>
                      <Link
                        to="/products"
                        className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        去逛逛
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <img
                            src={item.product?.images?.[0] || '/placeholder.svg'}
                            alt={item.product?.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {item.product?.name}
                          </h3>
                          <p className="text-pink-600 font-bold mb-3">
                            ${item.product?.price.toFixed(2)} MXN
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              to={`/products/${item.productId}`}
                              className="flex-1 bg-gray-100 text-gray-900 py-2 px-3 rounded text-center text-sm hover:bg-gray-200 transition-colors"
                            >
                              查看
                            </Link>
                            <button className="flex-1 bg-pink-600 text-white py-2 px-3 rounded text-sm hover:bg-pink-700 transition-colors">
                              加入购物车
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 地址管理 */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">地址管理</h2>
                    <button className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                      <MapPin className="w-4 h-4 mr-2" />
                      添加新地址
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-4">暂无收货地址</p>
                      <button className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                        添加地址
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <h3 className="font-semibold text-gray-900 mr-2">
                                  {address.name}
                                </h3>
                                <span className="text-sm text-gray-600">
                                  {address.phone}
                                </span>
                                {address.isDefault && (
                                  <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded">
                                    默认
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">
                                {address.address}
                              </p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-sm text-pink-600 hover:text-pink-700">
                                编辑
                              </button>
                              <button className="text-sm text-red-600 hover:text-red-700">
                                删除
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 账户安全 */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">账户安全</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">登录密码</h3>
                          <p className="text-sm text-gray-600">定期更换密码可以提高账户安全性</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          修改密码
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">手机号验证</h3>
                          <p className="text-sm text-gray-600">
                            {userProfile?.phone ? `已绑定：${userProfile.phone}` : '未绑定手机号'}
                          </p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          {userProfile?.phone ? '更换手机' : '绑定手机'}
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">登录记录</h3>
                          <p className="text-sm text-gray-600">查看最近的登录活动</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          查看记录
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 消息通知 */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">消息通知</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">通知设置</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">订单状态通知</h4>
                            <p className="text-sm text-gray-600">订单状态变更时发送通知</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">促销活动通知</h4>
                            <p className="text-sm text-gray-600">接收优惠活动和新品推荐</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">邮件通知</h4>
                            <p className="text-sm text-gray-600">通过邮件接收重要通知</p>
                          </div>
                          <input type="checkbox" className="rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">最近消息</h3>
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">暂无新消息</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenter;