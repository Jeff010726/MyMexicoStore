import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

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

// 错误回退组件
const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  // 使用error参数，避免TypeScript警告
  console.error("捕获到错误:", error.message);
  
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
  try {
    const { isLoggedIn, logout } = useAuth();

    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
            <ErrorBoundary fallbackComponent={ErrorFallback}>
              <div className="min-h-screen flex flex-col">
                {/* 桌面端导航 */}
                <ErrorBoundary fallbackComponent={ErrorFallback}>
                  <Header />
                </ErrorBoundary>
                
                {/* 移动端导航 */}
                <ErrorBoundary fallbackComponent={ErrorFallback}>
                  <MobileNav isLoggedIn={isLoggedIn} onLogout={logout} />
                </ErrorBoundary>
                
                <main className="flex-1 main-content">
                  <ErrorBoundary fallbackComponent={ErrorFallback}>
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
                  </ErrorBoundary>
                </main>
                
                <ErrorBoundary fallbackComponent={ErrorFallback}>
                  <Footer />
                </ErrorBoundary>
                
                {/* 移动端底部导航 */}
                <ErrorBoundary fallbackComponent={ErrorFallback}>
                  <BottomNav />
                </ErrorBoundary>
              </div>
            </ErrorBoundary>
        </Router>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('App 组件渲染错误:', error);
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>应用组件错误</h1>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            应用主组件在渲染过程中遇到了问题。
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            刷新页面
          </button>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            错误详情: {error instanceof Error ? error.message : String(error)}
          </div>
        </div>
      </div>
    );
  }
}

export default App;