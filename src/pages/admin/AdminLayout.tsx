import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Edit3,
  LogOut,
  Menu,
  X,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/ProtectedRoute';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: '仪表盘',
      permission: 'dashboard'
    },
    {
      path: '/admin/products',
      icon: Package,
      label: '商品管理',
      permission: 'products'
    },
    {
      path: '/admin/orders',
      icon: ShoppingCart,
      label: '订单管理',
      permission: 'orders'
    },
    {
      path: '/admin/customers',
      icon: Users,
      label: '客户管理',
      permission: 'customers'
    },
    {
      path: '/admin/editor',
      icon: Edit3,
      label: '页面编辑器',
      permission: 'editor'
    }
  ];

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* 侧边栏 */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🛒</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                管理后台
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* 用户信息 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">管理员</p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 底部操作 */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              退出登录
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 lg:ml-0">
          {/* 顶部导航栏 */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <Menu size={20} />
                </button>
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
                  {menuItems.find(item => item.path === location.pathname)?.label || '管理后台'}
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* 通知 */}
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* 返回前台 */}
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                >
                  返回前台
                </button>

                {/* 用户菜单 */}
                <div className="relative">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                      <User className="text-white" size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* 页面内容 */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>

        {/* 移动端遮罩 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;