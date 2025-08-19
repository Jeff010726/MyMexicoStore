import React from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  DollarSign,
  Eye
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType, icon }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-2 flex items-center ${
          changeType === 'increase' ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp size={16} className="mr-1" />
          {change}
        </p>
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const stats = [
    {
      title: '总销售额',
      value: '¥128,450',
      change: '+12.5% 较上月',
      changeType: 'increase' as const,
      icon: <DollarSign className="text-blue-600" size={24} />
    },
    {
      title: '订单数量',
      value: '1,234',
      change: '+8.2% 较上月',
      changeType: 'increase' as const,
      icon: <ShoppingCart className="text-green-600" size={24} />
    },
    {
      title: '商品数量',
      value: '456',
      change: '+15 新增',
      changeType: 'increase' as const,
      icon: <Package className="text-purple-600" size={24} />
    },
    {
      title: '客户数量',
      value: '2,890',
      change: '+23.1% 较上月',
      changeType: 'increase' as const,
      icon: <Users className="text-orange-600" size={24} />
    }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: '张三', amount: '¥299.00', status: '已支付', time: '2小时前' },
    { id: 'ORD-002', customer: '李四', amount: '¥1,299.00', status: '待发货', time: '4小时前' },
    { id: 'ORD-003', customer: '王五', amount: '¥599.00', status: '已发货', time: '6小时前' },
    { id: 'ORD-004', customer: '赵六', amount: '¥899.00', status: '已完成', time: '1天前' },
  ];

  const topProducts = [
    { name: '北欧风格布艺沙发', sales: 156, revenue: '¥467,844' },
    { name: '实木餐桌椅套装', sales: 89, revenue: '¥169,011' },
    { name: '智能空气净化器', sales: 234, revenue: '¥210,366' },
    { name: '有机棉床上四件套', sales: 445, revenue: '¥133,055' },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近订单 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">最近订单</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <span className="text-sm text-gray-500">{order.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">{order.customer}</span>
                      <span className="font-medium text-gray-900">{order.amount}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === '已支付' ? 'bg-blue-100 text-blue-800' :
                      order.status === '待发货' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === '已发货' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <Eye size={16} className="mr-1" />
                查看所有订单
              </button>
            </div>
          </div>
        </div>

        {/* 热销商品 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">热销商品</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">销量: {product.sales} 件</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <Eye size={16} className="mr-1" />
                查看商品分析
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;