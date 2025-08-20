import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Package, 
  ShoppingCart, 
  Users,
  DollarSign,
  Eye,
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { apiRequest, API_CONFIG } from '../../config/api';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard = ({ title, value, change, changeType, icon, loading }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mt-2"></div>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <p className={`text-sm mt-2 flex items-center ${
                changeType === 'increase' ? 'text-green-600' : 
                changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {changeType === 'increase' ? <TrendingUp size={16} className="mr-1" /> :
                 changeType === 'decrease' ? <TrendingDown size={16} className="mr-1" /> : null}
                {change}
              </p>
            )}
          </>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // 获取仪表板数据
  const fetchDashboardData = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.BASE_URL}/analytics/dashboard`);
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    }
  };

  // 获取销售数据
  const fetchSalesData = async (period: string) => {
    try {
      const response = await apiRequest(`${API_CONFIG.BASE_URL}/analytics/sales?period=${period}`);
      if (response.success) {
        setSalesData(response.data);
      }
    } catch (error) {
      console.error('获取销售数据失败:', error);
    }
  };

  // 获取商品数据
  const fetchProductData = async () => {
    try {
      const response = await apiRequest(`${API_CONFIG.BASE_URL}/analytics/products`);
      if (response.success) {
        setProductData(response.data);
      }
    } catch (error) {
      console.error('获取商品数据失败:', error);
    }
  };

  // 获取用户数据
  const fetchUserData = async (period: string) => {
    try {
      const response = await apiRequest(`${API_CONFIG.BASE_URL}/analytics/users?period=${period}`);
      if (response.success) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    }
  };

  // 刷新所有数据
  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchSalesData(selectedPeriod),
      fetchProductData(),
      fetchUserData(selectedPeriod)
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshAllData();
      setLoading(false);
    };
    loadData();
  }, [selectedPeriod]);

  // 计算变化百分比
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // 导出数据
  const exportData = async (type: string, format: string = 'csv') => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/export/${type}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('导出数据失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'paid': return '已支付';
      case 'shipped': return '已发货';
      case 'delivered': return '已送达';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
          <p className="text-gray-600 mt-1">实时监控业务关键指标</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* 时间周期选择 */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">今日</option>
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
            <option value="90d">近90天</option>
          </select>

          {/* 刷新按钮 */}
          <button
            onClick={refreshAllData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新数据
          </button>

          {/* 导出按钮 */}
          <div className="relative group">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={16} className="mr-2" />
              导出数据
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <button
                  onClick={() => exportData('sales', 'csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  销售数据 (CSV)
                </button>
                <button
                  onClick={() => exportData('products', 'csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  商品数据 (CSV)
                </button>
                <button
                  onClick={() => exportData('customers', 'csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  客户数据 (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总销售额"
          value={salesData?.summary?.totalRevenue ? `$${salesData.summary.totalRevenue.toFixed(2)}` : '$0.00'}
          change={dashboardData?.today && dashboardData?.yesterday ? 
            calculateChange(dashboardData.today.todayRevenue || 0, dashboardData.yesterday.yesterdayRevenue || 0) : undefined}
          changeType={dashboardData?.today?.todayRevenue >= dashboardData?.yesterday?.yesterdayRevenue ? 'increase' : 'decrease'}
          icon={<DollarSign className="text-green-600" size={24} />}
          loading={loading}
        />
        
        <StatCard
          title="订单数量"
          value={salesData?.summary?.totalOrders || 0}
          change={dashboardData?.today && dashboardData?.yesterday ? 
            calculateChange(dashboardData.today.todayOrders || 0, dashboardData.yesterday.yesterdayOrders || 0) : undefined}
          changeType={dashboardData?.today?.todayOrders >= dashboardData?.yesterday?.yesterdayOrders ? 'increase' : 'decrease'}
          icon={<ShoppingCart className="text-blue-600" size={24} />}
          loading={loading}
        />
        
        <StatCard
          title="商品数量"
          value={productData?.summary?.totalProducts || 0}
          change={`${productData?.summary?.activeProducts || 0} 个在售`}
          changeType="neutral"
          icon={<Package className="text-purple-600" size={24} />}
          loading={loading}
        />
        
        <StatCard
          title="客户数量"
          value={userData?.summary?.totalUsers || 0}
          change={`${userData?.summary?.newUsers || 0} 新增`}
          changeType="increase"
          icon={<Users className="text-orange-600" size={24} />}
          loading={loading}
        />
      </div>

      {/* 待处理事项 */}
      {dashboardData?.pending && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" size={20} />
            待处理事项
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.pending.pendingOrders > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">待处理订单</p>
                    <p className="text-2xl font-bold text-yellow-900">{dashboardData.pending.pendingOrders}</p>
                  </div>
                  <ShoppingCart className="text-yellow-600" size={24} />
                </div>
              </div>
            )}
            
            {dashboardData.pending.lowStockProducts > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">库存预警</p>
                    <p className="text-2xl font-bold text-orange-900">{dashboardData.pending.lowStockProducts}</p>
                  </div>
                  <Package className="text-orange-600" size={24} />
                </div>
              </div>
            )}
            
            {dashboardData.pending.outOfStockProducts > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">缺货商品</p>
                    <p className="text-2xl font-bold text-red-900">{dashboardData.pending.outOfStockProducts}</p>
                  </div>
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近订单 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">最近订单</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <Eye size={16} className="mr-1" />
                查看全部
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{order.id}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">用户ID: {order.userId}</span>
                        <span className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">暂无订单数据</p>
              </div>
            )}
          </div>
        </div>

        {/* 热销商品 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">热销商品</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <BarChart3 size={16} className="mr-1" />
                商品分析
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : productData?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {productData.topProducts.slice(0, 5).map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          销量: {product.totalSold || product.orderCount} 件 | 库存: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">暂无商品数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 商品分类统计 */}
      {productData?.categories?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">商品分类统计</h3>
            <PieChart className="text-gray-400" size={20} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productData.categories.map((category: any) => (
              <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {category.category === 'kitchen' ? '厨房用品' :
                     category.category === 'cleaning' ? '清洁用品' :
                     category.category === 'storage' ? '收纳整理' :
                     category.category === 'bathroom' ? '浴室用品' :
                     category.category === 'laundry' ? '洗护用品' : category.category}
                  </h4>
                  <span className="text-sm font-bold text-blue-600">{category.productCount}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>平均价格</span>
                    <span>${category.avgPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>总库存</span>
                    <span>{category.totalStock || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 库存预警 */}
      {productData?.stockAlerts?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="text-orange-500 mr-2" size={20} />
              库存预警
            </h3>
            <span className="text-sm text-gray-600">{productData.stockAlerts.length} 个商品需要补货</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productData.stockAlerts.slice(0, 6).map((product: any) => (
              <div key={product.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {product.stock === 0 ? '缺货' : `仅剩${product.stock}`}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>分类</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>价格</span>
                    <span>${product.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Package className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium text-gray-700">添加新商品</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ShoppingCart className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium text-gray-700">处理订单</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Users className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium text-gray-700">客户管理</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Activity className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium text-gray-700">数据分析</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;