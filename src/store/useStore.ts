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

export interface StoreState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  user: any;
  setUser: (user: any) => void;
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
  setUser: (user: any) => {
    set({ user });
  },
}));