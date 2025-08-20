import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/mobile.css';

interface MobileNavProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isLoggedIn, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="mobile-nav md:hidden">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600" onClick={closeMenu}>
            MexicoShop
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative" onClick={closeMenu}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <button
              className={`hamburger ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div className={`mobile-nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-nav-item" onClick={closeMenu}>
            首页
          </Link>
          <Link to="/products" className="mobile-nav-item" onClick={closeMenu}>
            商品
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/user-center" className="mobile-nav-item" onClick={closeMenu}>
                个人中心
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  closeMenu();
                }}
                className="mobile-nav-item text-left w-full"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-item" onClick={closeMenu}>
                登录
              </Link>
              <Link to="/register" className="mobile-nav-item" onClick={closeMenu}>
                注册
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 遮罩层 */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}
    </>
  );
};

export default MobileNav;