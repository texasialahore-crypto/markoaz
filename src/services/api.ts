import { Product, Category, Review, User, CartItem, WishlistItem, Order, OrderStatus, AdminStats, StoreSettings, PaymentStatus } from '../types';

const getHeaders = (userId?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const activeUserId = userId || localStorage.getItem('aura_user_id') || 'guest-session';
  headers['x-user-id'] = activeUserId;
  return headers;
};

async function parseResponse<T>(res: Response, defaultError = 'Request failed'): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let errorMessage = defaultError;
    if (isJson) {
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || defaultError;
      } catch {
        errorMessage = `${defaultError} (HTTP ${res.status})`;
      }
    } else {
      try {
        const text = await res.text();
        if (text && text.length < 250 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
          errorMessage = text;
        } else {
          errorMessage = `${defaultError} (HTTP ${res.status})`;
        }
      } catch {
        errorMessage = `${defaultError} (HTTP ${res.status})`;
      }
    }
    throw new Error(errorMessage);
  }

  if (isJson) {
    return (await res.json()) as T;
  }

  try {
    return (await res.json()) as T;
  } catch {
    const text = await res.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error('API server returned unexpected HTML response. Please verify the endpoint.');
    }
    throw new Error(`Unexpected server response: ${text.slice(0, 100)}`);
  }
}

export const api = {
  // Products
  getProducts: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: string;
    featured?: boolean;
    flashDeal?: boolean;
  }): Promise<Product[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params?.minRating !== undefined) query.append('minRating', params.minRating.toString());
    if (params?.sort) query.append('sort', params.sort);
    if (params?.featured) query.append('featured', 'true');
    if (params?.flashDeal) query.append('flashDeal', 'true');

    const res = await fetch(`/api/products?${query.toString()}`, {
      headers: getHeaders()
    });
    return parseResponse<Product[]>(res, 'Failed to fetch products');
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`, {
      headers: getHeaders()
    });
    return parseResponse<Product>(res, 'Product not found');
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return parseResponse<Product>(res, 'Failed to create product');
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return parseResponse<Product>(res, 'Failed to update product');
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      await parseResponse(res, 'Failed to delete product');
    }
  },

  restockProduct: async (id: string, amount = 10): Promise<Product> => {
    const res = await fetch(`/api/products/${id}/restock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    return parseResponse<Product>(res, 'Failed to restock product');
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch('/api/categories', {
      headers: getHeaders()
    });
    return parseResponse<Category[]>(res, 'Failed to fetch categories');
  },

  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    return parseResponse<Category>(res, 'Failed to create category');
  },

  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    return parseResponse<Category>(res, 'Failed to update category');
  },

  deleteCategory: async (id: string): Promise<void> => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      await parseResponse(res, 'Failed to delete category');
    }
  },

  // Reviews
  getAllReviews: async (): Promise<(Review & { productName?: string; productImage?: string })[]> => {
    const res = await fetch('/api/reviews/all', {
      headers: getHeaders()
    });
    return parseResponse(res, 'Failed to fetch reviews');
  },

  getProductReviews: async (productId: string): Promise<Review[]> => {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      headers: getHeaders()
    });
    return parseResponse<Review[]>(res, 'Failed to fetch reviews');
  },

  addReview: async (productId: string, review: { rating: number; title: string; comment: string }): Promise<Review> => {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(review)
    });
    return parseResponse<Review>(res, 'Failed to submit review');
  },

  deleteReview: async (id: string): Promise<void> => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      await parseResponse(res, 'Failed to delete review');
    }
  },

  // Store Settings
  getSettings: async (): Promise<StoreSettings> => {
    const res = await fetch('/api/settings', {
      headers: getHeaders()
    });
    return parseResponse<StoreSettings>(res, 'Failed to fetch settings');
  },

  updateSettings: async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return parseResponse<StoreSettings>(res, 'Failed to update settings');
  },

  // Auth
  register: async (userData: { email: string; name: string; phone?: string; address?: User['address'] }): Promise<User> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return parseResponse<User>(res, 'Registration failed');
  },

  customerLogin: async (email: string): Promise<User> => {
    const res = await fetch('/api/auth/customer-login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email })
    });
    return parseResponse<User>(res, 'Customer sign in failed');
  },

  adminLogin: async (credential: string, secretKey: string): Promise<User> => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ credential, secretKey })
    });
    return parseResponse<User>(res, 'Admin authentication failed');
  },

  login: async (email: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email })
    });
    return parseResponse<User>(res, 'Login failed');
  },

  getMe: async (): Promise<User> => {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders()
    });
    return parseResponse<User>(res, 'Not authenticated');
  },

  // Cart
  getCart: async (): Promise<CartItem[]> => {
    const res = await fetch('/api/cart', {
      headers: getHeaders()
    });
    return parseResponse<CartItem[]>(res, 'Failed to fetch cart');
  },

  addToCart: async (productId: string, quantity = 1, selectedColor?: string, selectedSize?: string): Promise<CartItem[]> => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity, selectedColor, selectedSize })
    });
    return parseResponse<CartItem[]>(res, 'Failed to add to cart');
  },

  updateCartQuantity: async (itemId: string, quantity: number): Promise<CartItem[]> => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ quantity })
    });
    return parseResponse<CartItem[]>(res, 'Failed to update cart');
  },

  removeFromCart: async (itemId: string): Promise<CartItem[]> => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return parseResponse<CartItem[]>(res, 'Failed to remove item');
  },

  clearCart: async (): Promise<void> => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      await parseResponse(res, 'Failed to clear cart');
    }
  },

  // Wishlist
  getWishlist: async (): Promise<WishlistItem[]> => {
    const res = await fetch('/api/wishlist', {
      headers: getHeaders()
    });
    return parseResponse<WishlistItem[]>(res, 'Failed to fetch wishlist');
  },

  toggleWishlist: async (productId: string): Promise<{ inWishlist: boolean; items: WishlistItem[] }> => {
    const res = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId })
    });
    return parseResponse<{ inWishlist: boolean; items: WishlistItem[] }>(res, 'Failed to update wishlist');
  },

  // Orders
  getOrders: async (myOnly = false): Promise<Order[]> => {
    const query = myOnly ? '?myOnly=true' : '';
    const res = await fetch(`/api/orders${query}`, {
      headers: getHeaders()
    });
    return parseResponse<Order[]>(res, 'Failed to fetch orders');
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await fetch(`/api/orders/${id}`, {
      headers: getHeaders()
    });
    return parseResponse<Order>(res, 'Order not found');
  },

  createOrder: async (orderData: Omit<Order, 'id' | 'trackingNumber' | 'createdAt' | 'orderStatus' | 'timeline' | 'estimatedDelivery'>): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return parseResponse<Order>(res, 'Failed to place order');
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return parseResponse<Order>(res, 'Failed to update order status');
  },

  updateOrderPaymentStatus: async (orderId: string, paymentStatus: PaymentStatus): Promise<Order> => {
    const res = await fetch(`/api/orders/${orderId}/payment-status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ paymentStatus })
    });
    return parseResponse<Order>(res, 'Failed to update payment status');
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      await parseResponse(res, 'Failed to delete order');
    }
  },

  // Users (Admin)
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/users', {
      headers: getHeaders()
    });
    return parseResponse<User[]>(res, 'Failed to fetch users');
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return parseResponse<User>(res, 'Failed to create user');
  },

  updateUser: async (userId: string, updateData: Partial<User>): Promise<User> => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    return parseResponse<User>(res, 'Failed to update user');
  },

  deleteUser: async (userId: string): Promise<void> => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      await parseResponse(res, 'Failed to delete user');
    }
  },

  updateUserRole: async (userId: string, role: 'customer' | 'admin'): Promise<User> => {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    return parseResponse<User>(res, 'Failed to update user role');
  },

  // Admin Stats
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await fetch('/api/admin/stats', {
      headers: getHeaders()
    });
    return parseResponse<AdminStats>(res, 'Failed to fetch admin statistics');
  }
};
