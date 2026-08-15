import express, { Request, Response, NextFunction } from 'express';
import { db } from './db';

export function createExpressApp() {
  const app = express();

  // Middleware
  app.use(express.json());

  // CORS Middleware for broad cross-origin and Vercel serverless preview support
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // --- API Routes ---

  // Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Products API ---
  app.get('/api/products', (req: Request, res: Response) => {
    try {
      const { category, search, minPrice, maxPrice, minRating, sort, featured, flashDeal } = req.query;
      const products = db.getProducts({
        category: category as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        sort: sort as string,
        featured: featured === 'true',
        flashDeal: flashDeal === 'true'
      });
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    try {
      const newProduct = db.addProduct(req.body);
      res.status(201).json(newProduct);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  });

  // --- Categories API ---
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    try {
      const newCat = db.addCategory(req.body);
      res.status(201).json(newCat);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  });

  // --- Reviews API ---
  app.get('/api/reviews/all', (req: Request, res: Response) => {
    res.json(db.getAllReviews());
  });

  app.get('/api/products/:id/reviews', (req: Request, res: Response) => {
    const reviews = db.getProductReviews(req.params.id);
    res.json(reviews);
  });

  app.post('/api/products/:id/reviews', (req: Request, res: Response) => {
    try {
      const { userId, userName, rating, title, comment } = req.body;
      if (!rating || !comment || !title) {
        return res.status(400).json({ error: 'Missing rating, title, or comment' });
      }
      const newReview = db.addReview(req.params.id, {
        userId: userId || 'anonymous',
        userName: userName || 'Valued Customer',
        rating: Number(rating),
        title,
        comment
      });
      res.status(201).json(newReview);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/reviews/:id', (req: Request, res: Response) => {
    const success = db.deleteReview(req.params.id);
    if (!success) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  });

  // --- Store Settings API ---
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.getStoreSettings());
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    try {
      const updated = db.updateStoreSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Auth API ---
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { email, name, phone, address, role } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      const user = db.registerUser({ email, name, phone, address, role });
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Customer Login (Strictly for customers, rejects admin access)
  app.post('/api/auth/customer-login', (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }
      const user = db.customerLogin(email);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Dedicated Admin Login (Requires administrator credentials & secret PIN)
  app.post('/api/auth/admin-login', (req: Request, res: Response) => {
    try {
      const { credential, secretKey } = req.body;
      if (!credential || typeof credential !== 'string' || !credential.trim()) {
        return res.status(400).json({ error: 'Admin Email or Admin ID is required' });
      }
      if (!secretKey || typeof secretKey !== 'string' || !secretKey.trim()) {
        return res.status(400).json({ error: 'Administrator Security PIN / Password is required' });
      }
      const user = db.adminLogin(credential.trim(), secretKey.trim());
      res.json(user);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // Generic Login (legacy / fallback)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User account not found. Please sign up.' });
    }
    res.json(user);
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // --- Cart API ---
  app.get('/api/cart', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    res.json(db.getCart(userId));
  });

  app.post('/api/cart', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const { productId, quantity = 1, selectedColor, selectedSize } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });
    const cart = db.addToCart(userId, productId, quantity, selectedColor, selectedSize);
    res.json(cart);
  });

  app.put('/api/cart/:id', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const { quantity } = req.body;
    const cart = db.updateCartItemQuantity(userId, req.params.id, Number(quantity));
    res.json(cart);
  });

  app.delete('/api/cart/:id', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const cart = db.removeFromCart(userId, req.params.id);
    res.json(cart);
  });

  app.delete('/api/cart', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    db.clearCart(userId);
    res.json([]);
  });

  // --- Wishlist API ---
  app.get('/api/wishlist', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    res.json(db.getWishlist(userId));
  });

  app.post('/api/wishlist/toggle', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });
    const result = db.toggleWishlist(userId, productId);
    res.json(result);
  });

  // --- Orders API ---
  app.get('/api/orders', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const user = userId ? db.getUserById(userId) : undefined;

    // If user is admin, they can view all orders. Otherwise, show user's orders
    if (user?.role === 'admin' && !req.query.myOnly) {
      res.json(db.getOrders());
    } else if (userId) {
      res.json(db.getOrders(userId));
    } else {
      res.json([]);
    }
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const order = db.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/products/:id/restock', (req: Request, res: Response) => {
    const { amount = 10 } = req.body;
    const prod = db.restockProduct(req.params.id, Number(amount));
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const order = db.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.put('/api/orders/:id/payment-status', (req: Request, res: Response) => {
    const { paymentStatus } = req.body;
    if (!paymentStatus) return res.status(400).json({ error: 'Payment status is required' });
    const order = db.updatePaymentStatus(req.params.id, paymentStatus);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.delete('/api/orders/:id', (req: Request, res: Response) => {
    const success = db.deleteOrder(req.params.id);
    if (!success) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  });

  // --- Users API (Admin) ---
  app.get('/api/users', (req: Request, res: Response) => {
    res.json(db.getUsers());
  });

  app.post('/api/users', (req: Request, res: Response) => {
    try {
      const user = db.registerUser(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', (req: Request, res: Response) => {
    const user = db.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const success = db.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });

  app.put('/api/users/:id/role', (req: Request, res: Response) => {
    const { role } = req.body;
    if (role !== 'customer' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = db.updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // --- Admin Stats ---
  app.get('/api/admin/stats', (req: Request, res: Response) => {
    res.json(db.getAdminStats());
  });

  return app;
}

const app = createExpressApp();
export default app;
