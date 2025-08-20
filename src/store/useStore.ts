import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  addresses: any[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  
  addToCart: (product: Product) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({
        cart: [...cart, { ...product, quantity: 1 }]
      });
    }
  },
  
  removeFromCart: (productId: string) => {
    const { cart } = get();
    set({
      cart: cart.filter(item => item.id !== productId)
    });
  },
  
  updateCartItem: (productId: string, quantity: number) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({
        cart: cart.filter(item => item.id !== productId)
      });
    } else {
      set({
        cart: cart.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      });
    }
  },
  
  clearCart: () => {
    set({ cart: [] });
  },
  
  products: [],
  setProducts: (products: Product[]) => {
    set({ products });
  },
  
  user: null,
  setUser: (user: User | null) => {
    set({ user });
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_data');
    }
  },
  
  logout: () => {
    set({ user: null, cart: [] });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
  
  isAuthenticated: () => {
    const { user } = get();
    const token = localStorage.getItem('auth_token');
    return !!(user && token);
  },
}));

// 初始化时从localStorage恢复用户状态
const initializeStore = () => {
  const userData = localStorage.getItem('user_data');
  const token = localStorage.getItem('auth_token');
  
  if (userData && token) {
    try {
      const user = JSON.parse(userData);
      useStore.getState().setUser(user);
    } catch (error) {
      console.error('Failed to restore user data:', error);
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
    }
  }
};

// 在应用启动时初始化
if (typeof window !== 'undefined') {
  initializeStore();
}
