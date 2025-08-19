import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Users,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import CustomerEditForm from '@/components/CustomerEditForm';
import { API_BASE_URL } from '@/config/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  registrationDate: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'vip';
  avatar?: string;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 获取客户列表
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('获取客户列表失败');
      const data = await response.json();
      
      // 转换API数据格式为组件需要的格式
      const formattedCustomers = (data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        registrationDate: user.createdAt,
        lastOrderDate: user.lastOrderDate || user.createdAt,
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0,
        status: user.status || 'active'
      }));
      
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('获取客户失败:', error);
      setError('获取客户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加客户
  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
          status: customerData.status
        })
      });

      if (!response.ok) throw new Error('添加客户失败');

      await fetchCustomers();
      return true;
    } catch (error) {
      console.error('添加客户失败:', error);
      setError('添加客户失败');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 更新客户
  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/users/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
          status: customerData.status
        })
      });

      if (!response.ok) throw new Error('更新客户失败');

      await fetchCustomers();
      return true;
    } catch (error) {
      console.error('更新客户失败:', error);
      setError('更新客户失败');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 删除客户
  const deleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${customerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('删除客户失败');

      await fetchCustomers();
      return true;
    } catch (error) {
      console.error('删除客户失败:', error);
      setError('删除客户失败');
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vip':
        return '👑 VIP客户';
      case 'active':
        return '✅ 活跃';
      case 'inactive':
        return '😴 不活跃';
      default:
        return status;
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsNewCustomer(false);
    setShowEditForm(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsNewCustomer(true);
    setShowEditForm(true);
  };

  const handleSaveCustomer = async (customer: Customer) => {
    let success = false;
    
    if (isNewCustomer) {
      success = await addCustomer(customer);
    } else if (selectedCustomer) {
      success = await updateCustomer(selectedCustomer.id, customer);
    }
    
    if (success) {
      setShowEditForm(false);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      const success = await deleteCustomer(customerToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setCustomerToDelete(null);
      }
    }
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

      {/* 页面标题和统计 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 客户管理</h1>
          <p className="text-gray-600 mt-1">管理和查看客户信息</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-blue-600">总客户数</div>
            <div className="text-xl font-bold text-blue-800">{customers.length}</div>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-purple-600">VIP客户</div>
            <div className="text-xl font-bold text-purple-800">
              {customers.filter(c => c.status === 'vip').length}
            </div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-green-600">活跃客户</div>
            <div className="text-xl font-bold text-green-800">
              {customers.filter(c => c.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="搜索客户姓名、邮箱或手机号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="vip">VIP客户</option>
              <option value="active">活跃客户</option>
              <option value="inactive">不活跃客户</option>
            </select>
            
            <Button 
              onClick={handleAddCustomer}
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
            >
              <UserPlus size={16} className="mr-2" />
              添加客户
            </Button>
          </div>
        </div>
      </Card>

      {/* 客户列表 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地址
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单统计
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          注册于 {new Date(customer.registrationDate).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.city || customer.address ? (
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2 text-gray-400" />
                          <div>
                            {customer.address && <div>{customer.address}</div>}
                            {(customer.city || customer.state) && (
                              <div>{customer.city}{customer.state && `, ${customer.state}`}</div>
                            )}
                            {customer.zipCode && <div className="text-gray-500">{customer.zipCode}</div>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">未填写</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <ShoppingBag size={14} className="mr-2 text-gray-400" />
                        {customer.totalOrders} 个订单
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        ${customer.totalSpent.toFixed(2)} MXN
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {getStatusLabel(customer.status)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                        title="编辑客户"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="删除客户"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500">没有找到匹配的客户</p>
          </div>
        )}
      </Card>

      {/* 客户详情弹窗 */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">客户详情</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedCustomer.status)}`}>
                      {getStatusLabel(selectedCustomer.status)}
                    </span>
                  </div>
                </div>
                
                {/* 联系信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">📧 联系信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {selectedCustomer.email}
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2 text-gray-400" />
                          {selectedCustomer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">📍 地址信息</h4>
                    <div className="text-sm text-gray-600">
                      {selectedCustomer.address && <div>{selectedCustomer.address}</div>}
                      {(selectedCustomer.city || selectedCustomer.state) && (
                        <div>{selectedCustomer.city}{selectedCustomer.state && `, ${selectedCustomer.state}`}</div>
                      )}
                      {selectedCustomer.zipCode && <div>{selectedCustomer.zipCode}</div>}
                      {!selectedCustomer.address && !selectedCustomer.city && (
                        <div className="text-gray-400">未填写地址信息</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 订单统计 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</div>
                    <div className="text-sm text-blue-800">总订单数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedCustomer.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-800">总消费金额</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${selectedCustomer.totalOrders > 0 ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-purple-800">平均订单金额</div>
                  </div>
                </div>
                
                {/* 时间信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">注册时间</div>
                      <div className="font-medium">
                        {new Date(selectedCustomer.registrationDate).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ShoppingBag size={16} className="mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">最后下单</div>
                      <div className="font-medium">
                        {selectedCustomer.lastOrderDate ? 
                          new Date(selectedCustomer.lastOrderDate).toLocaleDateString('zh-CN') : 
                          '暂无订单'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                >
                  关闭
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetails(false);
                    handleEditCustomer(selectedCustomer);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                >
                  编辑客户
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 客户编辑表单 */}
      <CustomerEditForm
        customer={selectedCustomer}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveCustomer}
        isNew={isNewCustomer}
        saving={saving}
      />

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                确认删除客户
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                您确定要删除客户 <span className="font-medium text-gray-900">{customerToDelete.name}</span> 吗？
                此操作无法撤销，将同时删除该客户的所有相关数据。
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                >
                  取消
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;