import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

const Header = () => {
  const { cart, user, logout } = useStore();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🛒</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
              爆款生活馆
            </span>
          </Link>

          {/* 搜索栏 */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜索爆款好物..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
              首页
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
              爆款商品
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                分类
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link to="/products?category=kitchen" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                    🍳 厨房用品
                  </Link>
                  <Link to="/products?category=cleaning" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                    🧽 清洁用品
                  </Link>
                  <Link to="/products?category=storage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                    📦 收纳整理
                  </Link>
                  <Link to="/products?category=bathroom" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                    🚿 浴室用品
                  </Link>
                  <Link to="/products?category=laundry" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                    👕 洗护用品
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* 用户操作 */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link to="/user?tab=favorites" className="p-2 text-gray-700 hover:text-pink-600 transition-colors relative">
                <Heart size={20} />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  0
                </span>
              </Link>
            )}
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 text-gray-700 hover:text-pink-600 transition-colors">
                  <User size={20} />
                  <span className="hidden md:block text-sm">{user.name}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link to="/user" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      个人中心
                    </Link>
                    <Link to="/user?tab=orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      我的订单
                    </Link>
                    <Link to="/user?tab=favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      我的收藏
                    </Link>
                    <Link to="/user?tab=addresses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      地址管理
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={logout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={16} className="mr-2" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-gray-700 hover:text-pink-600 transition-colors">
                <User size={20} />
              </Link>
            )}
            
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* 移动端导航 */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link to="/" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-pink-600">
            <span className="text-xs">首页</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-pink-600">
            <span className="text-xs">商品</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-pink-600 relative">
            <ShoppingCart size={16} />
            <span className="text-xs">购物车</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {cartItemsCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link to="/user" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-pink-600">
              <User size={16} />
              <span className="text-xs">我的</span>
            </Link>
          ) : (
            <Link to="/login" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-pink-600">
              <User size={16} />
              <span className="text-xs">登录</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;