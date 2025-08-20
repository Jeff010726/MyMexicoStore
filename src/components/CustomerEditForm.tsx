import React, { useState } from 'react';
import { X, Save, User, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
}

interface CustomerEditFormProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  isNew?: boolean;
  saving?: boolean;
}

const CustomerEditForm: React.FC<CustomerEditFormProps> = ({
  customer,
  isOpen,
  onClose,
  onSave,
  isNew = false,
  saving = false
}) => {
  const [formData, setFormData] = useState<Customer>(
    customer || {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      registrationDate: new Date().toISOString().split('T')[0],
      lastOrderDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      status: 'active'
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else if (isNew) {
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        registrationDate: new Date().toISOString().split('T')[0],
        lastOrderDate: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0,
        status: 'active'
      });
    }
  }, [customer, isNew]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '客户姓名不能为空';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '手机号不能为空';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确';
    }

    if (!formData.address.trim()) {
      newErrors.address = '地址不能为空';
    }

    if (!formData.city.trim()) {
      newErrors.city = '城市不能为空';
    }

    if (!formData.state.trim()) {
      newErrors.state = '州/省不能为空';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = '邮编不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const customerToSave = {
      ...formData,
      id: formData.id || Date.now().toString()
    };
    
    onSave(customerToSave);
  };

  const handleInputChange = (field: keyof Customer, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <User className="mr-2" size={20} />
              {isNew ? '添加新客户' : '编辑客户信息'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              disabled={saving}
            >
              <X size={20} />
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <User className="mr-2" size={16} />
                基本信息
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    客户姓名 *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="请输入客户姓名"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    客户状态 *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'vip')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="active">✅ 活跃客户</option>
                    <option value="inactive">😴 不活跃客户</option>
                    <option value="vip">👑 VIP客户</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* 联系信息 */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Mail className="mr-2" size={16} />
                联系信息
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱地址 *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="请输入邮箱地址"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手机号码 *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="请输入手机号码"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* 地址信息 */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2" size={16} />
                地址信息
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    详细地址 *
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="请输入详细地址"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      城市 *
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="请输入城市"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      州/省 *
                    </label>
                    <Input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="请输入州/省"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮编 *
                    </label>
                    <Input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="请输入邮编"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* 统计信息（仅编辑时显示） */}
            {!isNew && (
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">📊 统计信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      总订单数
                    </label>
                    <Input
                      type="number"
                      value={formData.totalOrders}
                      onChange={(e) => handleInputChange('totalOrders', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      总消费金额 (MXN)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.totalSpent}
                      onChange={(e) => handleInputChange('totalSpent', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* 按钮组 */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={saving}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save size={16} className="mr-2" />
                    {isNew ? '添加客户' : '保存修改'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerEditForm;