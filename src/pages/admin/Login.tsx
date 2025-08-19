import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 模拟管理员账户
  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 验证凭据
      if (formData.username === adminCredentials.username && 
          formData.password === adminCredentials.password) {
        
        // 保存登录状态
        const adminUser = {
          id: '1',
          username: 'admin',
          name: '管理员',
          role: 'admin',
          permissions: ['products', 'orders', 'customers', 'editor'],
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        localStorage.setItem('adminToken', 'admin-token-' + Date.now());
        
        // 跳转到管理后台
        navigate('/admin');
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
            爆款生活馆
          </h1>
          <p className="text-gray-600 mt-2">管理后台登录</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-lg shadow-lg border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                用户名
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                密码
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* 测试账户提示 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">🔑 测试账户</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>用户名: <code className="bg-blue-100 px-1 rounded">admin</code></p>
              <p>密码: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
            </div>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-pink-600 transition-colors"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;