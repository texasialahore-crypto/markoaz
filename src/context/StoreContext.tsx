import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, WishlistItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type ViewState = 'home' | 'products' | 'product-detail' | 'wishlist' | 'checkout' | 'order-tracking' | 'user-profile' | 'admin' | 'admin-login';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  selectedOrderForTracking: string | null;
  trackOrder: (orderId: string) => void;
  categories: Category[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, color?: string, size?: string) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  wishlist: WishlistItem[];
  wishlistProductIds: Set<string>;
  toggleWishlist: (productId: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  refreshCategories: () => Promise<void>;
  refreshCartAndWishlist: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const refreshCartAndWishlist = async () => {
    try {
      const [c, w] = await Promise.all([api.getCart(), api.getWishlist()]);
      setCart(c);
      setWishlist(w);
    } catch (err) {
      console.error('Failed to load cart/wishlist', err);
    }
  };

  useEffect(() => {
    refreshCategories();
    refreshCartAndWishlist();
  }, [user]);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trackOrder = (orderId: string) => {
    setSelectedOrderForTracking(orderId);
    setActiveView('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = async (productId: string, quantity = 1, color?: string, size?: string) => {
    try {
      const updatedCart = await api.addToCart(productId, quantity, color, size);
      setCart(updatedCart);
      showToast('Item added to shopping cart!', 'success');
      setIsCartOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Could not add to cart', 'error');
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await api.updateCartQuantity(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      showToast('Failed to update cart', 'error');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = await api.removeFromCart(itemId);
      setCart(updatedCart);
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      showToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart([]);
    } catch (err: any) {
      console.error('Clear cart error', err);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(res.items);
      if (res.inWishlist) {
        showToast('Saved to your wishlist!', 'success');
      } else {
        showToast('Removed from wishlist', 'info');
      }
    } catch (err: any) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
  const wishlistProductIds = new Set(wishlist.map(w => w.productId));

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        openProductDetail,
        selectedOrderForTracking,
        trackOrder,
        categories,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        wishlistProductIds,
        toggleWishlist,
        isAuthModalOpen,
        setIsAuthModalOpen,
        toasts,
        showToast,
        removeToast,
        refreshCategories,
        refreshCartAndWishlist
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
