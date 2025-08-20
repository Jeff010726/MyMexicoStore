import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './hooks/useAuth';

// 懒加载页面组件 - 代码分割优化
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserCenter = lazy(() => import('./pages/UserCenter'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const FAQ = lazy(() => import('./pages/FAQ'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));

// 管理后台组件懒加载
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement'));
const CustomerManagement = lazy(() => import('./pages/admin/CustomerManagement'));
const TemplateManagement = lazy(() => import('./pages/admin/TemplateManagement'));
const PageEditor = lazy(() => import('./pages/admin/PageEditor'));

// 性能优化的加载中组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

// 导入错误边界组件
import ErrorBoundary from './components/ErrorBoundary';

// 错误回退组件
const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">页面加载失败</h2>
        <p className="text-gray-600 mb-4">请刷新页面重试</p>
        <button 
          onClick={() => {
            resetError();
            window.location.reload();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          刷新页面
        </button>
      </div>
    </div>
  );
};

function App() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <CartProvider>
          <ErrorBoundary fallbackComponent={ErrorFallback}>
            <div className="min-h-screen flex flex-col">
              {/* 桌面端导航 */}
              <Header />
              
              {/* 移动端导航 */}
              <MobileNav isLoggedIn={isLoggedIn} onLogout={logout} />
              
              <main className="flex-1 main-content">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/pages/:slug" element={<DynamicPage />} />
                  
                  {/* 受保护的用户路由 */}
                  <Route 
                    path="/user-center" 
                    element={
                      <ProtectedRoute>
                        <UserCenter />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 管理员路由 */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="customers" element={<CustomerManagement />} />
                    <Route path="templates" element={<TemplateManagement />} />
                    <Route path="pages/edit/:id" element={<PageEditor />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <Footer />
            
            {/* 移动端底部导航 */}
            <BottomNav />
          </div>
        </ErrorBoundary>
        </CartProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;