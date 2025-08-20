import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import PageEditor from './pages/admin/PageEditor';
import CustomerManagement from './pages/admin/CustomerManagement';
import TemplateManagement from './pages/admin/TemplateManagement';
import DynamicPage from './pages/DynamicPage';
import Login from './pages/admin/Login';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Routes>
            {/* 管理后台登录路由 */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* 管理后台路由 */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="templates" element={<TemplateManagement />} />
              <Route path="editor" element={<PageEditor />} />
            </Route>

            {/* 动态页面路由 - 独立布局，不显示Header/Footer */}
            <Route path="/page/:templateId" element={<DynamicPage />} />

            {/* 前台路由 - 带Header和Footer */}
            <Route path="/*" element={
              <>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;