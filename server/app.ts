import express, { Request, Response, NextFunction, Router } from 'express';
import { db } from './db';

export function createExpressApp() {
  const app = express();

  // 1. Body Parser with pre-parsed fallback safety for Vercel/Serverless
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // Leave as string if not valid JSON
      }
    }
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 2. CORS & Preflight headers for cross-origin and Vercel preview domains
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // 3. Define all API endpoints on an Express Router
  const apiRouter = Router();

  // Health check
  apiRouter.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Markoaz API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // --- Products API ---
  apiRouter.get('/products', (req: Request, res: Response) => {
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

  apiRouter.get('/products/:id', (req: Request, res: Response) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  apiRouter.post('/products', (req: Request, res: Response) => {
    try {
      const newProduct = db.addProduct(req.body);
      res.status(201).json(newProduct);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  apiRouter.put('/products/:id', (req: Request, res: Response) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  });

  apiRouter.delete('/products/:id', (req: Request, res: Response) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  });

  apiRouter.post('/products/:id/restock', (req: Request, res: Response) => {
    const { amount = 10 } = req.body;
    const prod = db.restockProduct(req.params.id, Number(amount));
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  // --- Categories API ---
  apiRouter.get('/categories', (req: Request, res: Response) => {
    res.json(db.getCategories());
  });

  apiRouter.post('/categories', (req: Request, res: Response) => {
    try {
      const newCat = db.addCategory(req.body);
      res.status(201).json(newCat);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  apiRouter.put('/categories/:id', (req: Request, res: Response) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  });

  apiRouter.delete('/categories/:id', (req: Request, res: Response) => {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  });

  // --- Reviews API ---
  apiRouter.get('/reviews/all', (req: Request, res: Response) => {
    res.json(db.getAllReviews());
  });

  apiRouter.get('/products/:id/reviews', (req: Request, res: Response) => {
    const reviews = db.getProductReviews(req.params.id);
    res.json(reviews);
  });

  apiRouter.post('/products/:id/reviews', (req: Request, res: Response) => {
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

  apiRouter.delete('/reviews/:id', (req: Request, res: Response) => {
    const success = db.deleteReview(req.params.id);
    if (!success) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  });

  // --- Store Settings API ---
  apiRouter.get('/settings', (req: Request, res: Response) => {
    res.json(db.getStoreSettings());
  });

  apiRouter.put('/settings', (req: Request, res: Response) => {
    try {
      const updated = db.updateStoreSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Auth API ---
  apiRouter.post('/auth/register', (req: Request, res: Response) => {
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

  // Customer Login (Strictly for customers, auto-registers new customers)
  apiRouter.post('/auth/customer-login', (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Email address is required' });
      }
      const user = db.customerLogin(email.trim());
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Dedicated Admin Login (Requires administrator credentials & secret PIN)
  apiRouter.post('/auth/admin-login', (req: Request, res: Response) => {
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

  // Generic Login (legacy fallback)
  apiRouter.post('/auth/login', (req: Request, res: Response) => {
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

  apiRouter.get('/auth/me', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // --- Cart API ---
  apiRouter.get('/cart', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    res.json(db.getCart(userId));
  });

  apiRouter.post('/cart', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const { productId, quantity = 1, selectedColor, selectedSize } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });
    const cart = db.addToCart(userId, productId, quantity, selectedColor, selectedSize);
    res.json(cart);
  });

  apiRouter.put('/cart/:id', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const { quantity } = req.body;
    const cart = db.updateCartItemQuantity(userId, req.params.id, Number(quantity));
    res.json(cart);
  });

  apiRouter.delete('/cart/:id', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const cart = db.removeFromCart(userId, req.params.id);
    res.json(cart);
  });

  apiRouter.delete('/cart', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    db.clearCart(userId);
    res.json([]);
  });

  // --- Wishlist API ---
  apiRouter.get('/wishlist', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    res.json(db.getWishlist(userId));
  });

  apiRouter.post('/wishlist/toggle', (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest-session';
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });
    const result = db.toggleWishlist(userId, productId);
    res.json(result);
  });

  // --- Orders API ---
  apiRouter.get('/orders', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const user = userId ? db.getUserById(userId) : undefined;

    if (user?.role === 'admin' && !req.query.myOnly) {
      res.json(db.getOrders());
    } else if (userId) {
      res.json(db.getOrders(userId));
    } else {
      res.json([]);
    }
  });

  apiRouter.get('/orders/:id', (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  apiRouter.post('/orders', (req: Request, res: Response) => {
    try {
      const order = db.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  apiRouter.put('/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const order = db.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  apiRouter.put('/orders/:id/payment-status', (req: Request, res: Response) => {
    const { paymentStatus } = req.body;
    if (!paymentStatus) return res.status(400).json({ error: 'Payment status is required' });
    const order = db.updatePaymentStatus(req.params.id, paymentStatus);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  apiRouter.delete('/orders/:id', (req: Request, res: Response) => {
    const success = db.deleteOrder(req.params.id);
    if (!success) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  });

  // --- Users API (Admin) ---
  apiRouter.get('/users', (req: Request, res: Response) => {
    res.json(db.getUsers());
  });

  apiRouter.post('/users', (req: Request, res: Response) => {
    try {
      const user = db.registerUser(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  apiRouter.put('/users/:id', (req: Request, res: Response) => {
    const user = db.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  apiRouter.delete('/users/:id', (req: Request, res: Response) => {
    const success = db.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });

  apiRouter.put('/users/:id/role', (req: Request, res: Response) => {
    const { role } = req.body;
    if (role !== 'customer' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = db.updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // --- Admin Stats ---
  apiRouter.get('/admin/stats', (req: Request, res: Response) => {
    res.json(db.getAdminStats());
  });

  // 4. Mount apiRouter on BOTH '/api' AND '/' to ensure 100% path compatibility across all environments
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

const app = createExpressApp();
export default app;
