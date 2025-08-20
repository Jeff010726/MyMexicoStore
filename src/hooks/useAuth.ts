import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
  loginTime: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const adminUser = localStorage.getItem('adminUser');
      const adminToken = localStorage.getItem('adminToken');

      if (adminUser && adminToken) {
        const userData = JSON.parse(adminUser);
        
        // 检查token是否过期（24小时）
        const tokenTime = parseInt(adminToken.split('-').pop() || '0');
        const now = Date.now();
        const isExpired = (now - tokenTime) > 24 * 60 * 60 * 1000;

        if (isExpired) {
          logout();
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: AdminUser) => {
    setUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    localStorage.setItem('adminToken', 'admin-token-' + Date.now());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  return {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    isLoggedIn: !!user,
    checkAuth
  };
};