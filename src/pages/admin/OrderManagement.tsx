import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  MoreHorizontal,
  Download,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/api';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentId?: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const statuses = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['all', 'airwallex', 'alipay', 'wechat'];

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (!response.ok) throw new Error('获取订单列表失败');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('获取订单失败:', error);
      setError('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新订单状态
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('更新订单状态失败');

      await fetchOrders();
    } catch (error) {
      console.error('更新订单状态失败:', error);
      setError('更新订单状态失败');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // 导出订单数据
  const exportOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/export`);
      if (!response.ok) throw new Error('导出订单失败');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出订单失败:', error);
      setError('导出订单失败');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'paid':
        return <CheckCircle className="text-blue-600" size={16} />;
      case 'shipped':
        return <Truck className="text-purple-600" size={16} />;
      case 'delivered':
        return <Package className="text-green-600" size={16} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待支付';
      case 'paid':
        return '已支付';
      case 'shipped':
        return '已发货';
      case 'delivered':
        return '已送达';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'airwallex':
        return 'Airwallex';
      case 'alipay':
        return '支付宝';
      case 'wechat':
        return '微信支付';
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPayment = selectedPayment === 'all' || order.paymentMethod === selectedPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-600 mt-1">管理和跟踪所有订单状态</p>
        </div>
        <Button 
          onClick={exportOrders}
          className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
        >
          <Download size={20} className="mr-2" />
          导出订单
        </Button>
      </div>

      {/* 订单统计 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            <p className="text-sm text-gray-600">总订单</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            <p className="text-sm text-gray-600">待支付</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.paid}</p>
            <p className="text-sm text-gray-600">已支付</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            <p className="text-sm text-gray-600">已发货</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            <p className="text-sm text-gray-600">已送达</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
            <p className="text-sm text-gray-600">已取消</p>
          </div>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="搜索订单号、客户姓名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">所有状态</option>
                {statuses.slice(1).map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">所有支付方式</option>
              {paymentMethods.slice(1).map(method => (
                <option key={method} value={method}>{getPaymentMethodText(method)}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 订单列表 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">订单信息</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">客户</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">商品</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">金额</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">支付方式</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">状态</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">创建时间</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <h3 className="font-medium text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        更新: {new Date(order.updatedAt).toLocaleString()}
                      </p>
                      {order.paymentId && (
                        <p className="text-xs text-gray-400">
                          支付ID: {order.paymentId}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                        {order.shippingAddress}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1 max-w-xs">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-gray-900 truncate block">{item.productName}</span>
                          <span className="text-gray-500">×{item.quantity} ¥{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">¥{order.totalAmount}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {getPaymentMethodText(order.paymentMethod)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingOrder === order.id}
                        className={`px-2 py-1 text-sm rounded-full border-0 ${getStatusColor(order.status)} ${
                          updatingOrder === order.id ? 'opacity-50' : 'cursor-pointer hover:opacity-80'
                        }`}
                      >
                        {statuses.slice(1).map(status => (
                          <option key={status} value={status}>{getStatusText(status)}</option>
                        ))}
                      </select>
                      {updatingOrder === order.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到订单</h3>
            <p className="text-gray-600">尝试调整搜索条件或等待新订单</p>
          </div>
        )}
      </Card>

      {/* 分页 */}
      {filteredOrders.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              显示 1-{filteredOrders.length} 条，共 {filteredOrders.length} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-400">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrderManagement;