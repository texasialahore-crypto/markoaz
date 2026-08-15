import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { api } from '../services/api';
import { Product, Category, Order, User, Review, AdminStats, OrderStatus, PaymentStatus, StoreSettings } from '../types';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Search,
  X,
  AlertCircle,
  Banknote,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  CreditCard,
  Phone,
  Mail,
  ExternalLink,
  Eye,
  Filter,
  Settings,
  Star,
  RefreshCw,
  Edit2,
  Lock,
  Save,
  CheckCircle2,
  Truck,
  Sparkles,
  UserPlus
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { showToast, refreshCategories, setActiveView } = useStore();
  const { user, isAdmin, adminLogin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'categories' | 'orders' | 'customers' | 'reviews' | 'settings'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter state
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');

  // Customer Dossier Modal
  const [selectedCustomerForDossier, setSelectedCustomerForDossier] = useState<User | null>(null);

  // Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustId, setEditCustId] = useState('');
  const [editCustRole, setEditCustRole] = useState<'customer' | 'admin'>('customer');

  // Create User Modal
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'admin'>('customer');
  const [newCustomerId, setNewCustomerId] = useState('');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodPrice, setProdPrice] = useState('99.99');
  const [prodOrigPrice, setProdOrigPrice] = useState('129.99');
  const [prodStock, setProdStock] = useState('20');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80');
  const [prodDesc, setProdDesc] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsFlashDeal, setProdIsFlashDeal] = useState(false);

  // Category Add / Edit Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    announcementBanner: 'Cash on Delivery Available • Free Express Shipping on Orders Over $50',
    freeShippingThreshold: 50,
    codEnabled: true,
    flashSaleActive: true,
    flashSaleDiscountPercentage: 15,
    supportEmail: 'support@auramarket.com',
    supportPhone: '+1 (800) 555-0199',
    storeName: 'Aura Market'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [st, pr, ct, ord, us, sett] = await Promise.all([
        api.getAdminStats(),
        api.getProducts(),
        api.getCategories(),
        api.getOrders(),
        api.getUsers(),
        api.getSettings().catch(() => null)
      ]);
      setStats(st);
      setProducts(pr);
      setCategories(ct);
      setOrders(ord);
      setUsers(us);
      if (sett) {
        setSettings(sett);
        setSettingsForm(sett);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast(`${label} (${text}) copied!`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // PRODUCT CRUD
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Electronics');
    setProdPrice('99.99');
    setProdOrigPrice('129.99');
    setProdStock('25');
    setProdImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80');
    setProdDesc('');
    setProdIsFeatured(false);
    setProdIsFlashDeal(false);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price.toString());
    setProdOrigPrice(p.originalPrice?.toString() || (p.price * 1.2).toFixed(2));
    setProdStock(p.stock.toString());
    setProdImage(p.images[0] || '');
    setProdDesc(p.description);
    setProdIsFeatured(p.isFeatured || false);
    setProdIsFlashDeal(p.isFlashDeal || false);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodDesc.trim()) {
      showToast('Please enter product title and description', 'error');
      return;
    }

    try {
      const priceNum = Number(prodPrice);
      const origPriceNum = Number(prodOrigPrice);
      const discount = Math.max(0, Math.round(((origPriceNum - priceNum) / origPriceNum) * 100));

      const payload = {
        name: prodName,
        category: prodCategory,
        price: priceNum,
        originalPrice: origPriceNum,
        discountPercentage: discount,
        stock: Number(prodStock),
        description: prodDesc,
        images: [prodImage],
        featured: prodIsFeatured,
        isFlashDeal: prodIsFlashDeal,
        specifications: { 'Warranty': '1 Year Official Warranty' },
        tags: [prodCategory.toLowerCase(), prodIsFlashDeal ? 'flash-deal' : 'standard']
      };

      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(payload);
        showToast('New product added to store catalog!', 'success');
      }

      setIsProductModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product removed from catalog', 'info');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleQuickRestock = async (productId: string, amount: number) => {
    try {
      await api.restockProduct(productId, amount);
      showToast(`Restocked +${amount} units`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to restock product', 'error');
    }
  };

  // CATEGORY CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await api.createCategory({
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDesc,
        image: catImage,
        iconName: 'Layers',
        productCount: 0
      });
      showToast('Category created!', 'success');
      setIsCategoryModalOpen(false);
      setCatName('');
      setCatDesc('');
      refreshCategories();
      loadAllData();
    } catch (err: any) {
      showToast('Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category and unassign associated products?')) return;
    try {
      await api.deleteCategory(id);
      showToast('Category deleted', 'info');
      refreshCategories();
      loadAllData();
    } catch (err: any) {
      showToast('Failed to delete category', 'error');
    }
  };

  // ORDER MANAGEMENT
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status.replace(/_/g, ' ')}`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    try {
      await api.updateOrderPaymentStatus(orderId, status);
      showToast(`Payment status updated to ${status}`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to update payment status', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Delete order ${orderId}? This cannot be undone.`)) return;
    try {
      await api.deleteOrder(orderId);
      showToast('Order record deleted', 'info');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to delete order', 'error');
    }
  };

  // CUSTOMER MANAGEMENT
  const handleOpenEditCustomer = (u: User) => {
    setEditingCustomer(u);
    setEditCustName(u.name);
    setEditCustEmail(u.email);
    setEditCustPhone(u.phone || '');
    setEditCustId(u.customerId || '');
    setEditCustRole(u.role);
  };

  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await api.updateUser(editingCustomer.id, {
        name: editCustName,
        email: editCustEmail,
        phone: editCustPhone,
        customerId: editCustId,
        role: editCustRole
      });
      showToast('Customer record updated successfully', 'success');
      setEditingCustomer(null);
      loadAllData();
    } catch (err: any) {
      showToast('Failed to update customer', 'error');
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserName.trim()) {
      showToast('Email and name are required', 'error');
      return;
    }
    try {
      await api.createUser({
        email: newUserEmail,
        name: newUserName,
        phone: newUserPhone,
        role: newUserRole,
        customerId: newCustomerId || undefined
      });
      showToast('Customer account created with unique Customer ID!', 'success');
      setIsCreateUserModalOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPhone('');
      setNewCustomerId('');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to create customer', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer account for "${name}"?`)) return;
    try {
      await api.deleteUser(id);
      showToast(`User ${name} removed`, 'info');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'customer' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await api.updateUserRole(userId, newRole);
      showToast(`User role changed to ${newRole}`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to change role', 'error');
    }
  };

  // REVIEWS MANAGEMENT
  const allReviewsWithProduct = useMemo(() => {
    const list: Array<{ product: Product; review: Review }> = [];
    products.forEach(p => {
      (p.reviews || []).forEach(r => {
        list.push({ product: p, review: r });
      });
    });
    return list;
  }, [products]);

  const filteredReviews = useMemo(() => {
    if (!reviewSearch.trim()) return allReviewsWithProduct;
    const q = reviewSearch.toLowerCase();
    return allReviewsWithProduct.filter(item =>
      item.review.userName.toLowerCase().includes(q) ||
      item.review.comment.toLowerCase().includes(q) ||
      item.product.name.toLowerCase().includes(q) ||
      (item.review.customerId && item.review.customerId.toLowerCase().includes(q))
    );
  }, [allReviewsWithProduct, reviewSearch]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this customer review?')) return;
    try {
      await api.deleteReview(reviewId);
      showToast('Review removed from product', 'info');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to delete review', 'error');
    }
  };

  // STORE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings(settingsForm);
      setSettings(updated);
      showToast('Global store settings saved successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!customerSearch.trim()) return users;
    const q = customerSearch.toLowerCase();
    return users.filter(u =>
      (u.customerId && u.customerId.toLowerCase().includes(q)) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      u.id.toLowerCase().includes(q)
    );
  }, [users, customerSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = !orderSearch.trim() ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customerId && o.customerId.toLowerCase().includes(orderSearch.toLowerCase())) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase());

      const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Customer Dossier Orders
  const customerDossierOrders = useMemo(() => {
    if (!selectedCustomerForDossier) return [];
    return orders.filter(o =>
      (o.customerId && o.customerId === selectedCustomerForDossier.customerId) ||
      o.userId === selectedCustomerForDossier.id ||
      o.customerEmail === selectedCustomerForDossier.email
    );
  }, [orders, selectedCustomerForDossier]);

  // SECURITY GATE: STRICT ADMINISTRATOR ENFORCEMENT
  if (!isAdmin) {
    return <AdminLoginPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 p-4 sm:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Markoaz Store Admin Console
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Full Master Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Operator: <strong className="text-white">{user?.name}</strong> • Admin ID: <span className="font-mono text-amber-300 font-bold">{user?.customerId || 'ADMIN-001'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleOpenNewProduct}
            className="flex-1 md:flex-none px-3.5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-950" /> Add Product
          </button>
          <button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex-1 md:flex-none px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-cyan-400" /> New Customer
          </button>
          <button
            onClick={() => setActiveView('home')}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Storefront
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-2 pb-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'stats' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'customers' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" /> Customer Directory & IDs ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'orders' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Orders & COD ({orders.length})
          {stats?.pendingOrdersCount ? (
            <span className="w-5 h-5 bg-cyan-400 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center">
              {stats.pendingOrdersCount}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'products' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4" /> Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'categories' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" /> Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'reviews' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Star className="w-4 h-4" /> Customer Reviews ({allReviewsWithProduct.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeTab === 'settings' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" /> Store Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Store Sales</span>
                <DollarSign className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">${stats.totalRevenue.toFixed(2)}</div>
              <div className="text-[11px] text-cyan-400 font-semibold">Includes Cash on Delivery orders</div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Registered Customers</span>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{users.length}</div>
              <div className="text-[11px] text-slate-400">Tracked with unique Customer IDs</div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Orders</span>
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{stats.totalOrders}</div>
              <div className="text-[11px] text-amber-300 font-semibold">{stats.pendingOrdersCount} awaiting dispatch</div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Catalog Items</span>
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{stats.totalProducts}</div>
              <div className="text-[11px] text-slate-400">Across {categories.length} store categories</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Category Performance
              </h3>
              <div className="space-y-3 pt-2">
                {stats.categoryBreakdown.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{cat.category}</span>
                      <span className="text-white">${cat.sales.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (cat.sales / Math.max(1, stats.totalRevenue)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" /> Recent Store Dispatches
                </span>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  Manage All Orders →
                </button>
              </h3>
              <div className="space-y-2.5 max-h-72 overflow-y-auto divide-y divide-white/10">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="pt-2.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">{o.id}</span>
                        <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-white/10">
                          {o.customerId || 'CUST'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{o.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white">${o.total.toFixed(2)}</div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMERS DIRECTORY & IDs */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" /> Customer ID & Account Directory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete database of registered customers with assigned unique Customer IDs and order histories.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by Customer ID, name, email..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Customer ID</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Email & Contact</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Total Orders</th>
                    <th className="py-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => {
                    const userOrders = orders.filter(o => o.customerId === u.customerId || o.userId === u.id || o.customerEmail === u.email);
                    const userSpend = userOrders.reduce((sum, o) => sum + o.total, 0);

                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleCopy(u.customerId || `CUST-${u.id.slice(-5).toUpperCase()}`, 'Customer ID')}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-xs bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                            title="Click to copy Customer ID"
                          >
                            <span>{u.customerId || `CUST-${u.id.slice(-5).toUpperCase()}`}</span>
                            {copiedId === (u.customerId || `CUST-${u.id.slice(-5).toUpperCase()}`) ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-cyan-400 opacity-60" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-[10px] text-slate-400">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-300 font-medium">{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.phone || 'No phone recorded'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            }`}
                            title="Click to toggle role"
                          >
                            {u.role}
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{userOrders.length} orders</div>
                          <div className="text-[11px] text-emerald-400 font-semibold">${userSpend.toFixed(2)} spent</div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCustomerForDossier(u)}
                              className="p-1.5 bg-white/5 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-white/10 transition-colors"
                              title="View Customer Dossier & Order History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditCustomer(u)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-colors"
                              title="Edit Customer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(u.id, u.name)}
                              className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-white/10 transition-colors"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & COD FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-white text-base">Store Orders & Cash on Delivery Processing</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage live order dispatch status, COD payments, and tracking numbers.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Order ID & Tracking</th>
                    <th className="py-3 px-3">Customer ID / Name</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Fulfillment Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-black text-cyan-300">{o.id}</div>
                        <div className="font-mono text-[10px] text-slate-400">Track: {o.trackingNumber}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] bg-slate-950 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-white/10">
                            {o.customerId || 'CUST'}
                          </span>
                          <span className="font-bold text-white">{o.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{o.shippingAddress?.street}, {o.shippingAddress?.city}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-bold text-slate-200">
                          {o.paymentMethod === 'cod' ? (
                            <span className="text-amber-400 flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> Cash on Delivery</span>
                          ) : (
                            <span className="text-cyan-400 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Card</span>
                          )}
                        </div>
                        <select
                          value={o.paymentStatus || (o.paymentMethod === 'cod' ? 'pending' : 'paid')}
                          onChange={e => handleUpdatePaymentStatus(o.id, e.target.value as PaymentStatus)}
                          className="mt-1 bg-slate-950 text-[10px] font-bold border border-white/10 rounded px-1.5 py-0.5 text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid_on_delivery">Paid on Delivery</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 font-black text-white text-sm">
                        ${o.total.toFixed(2)}
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={o.orderStatus}
                          onChange={e => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-hidden"
                        >
                          <option value="placed">Placed</option>
                          <option value="processing">Processing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-white/10 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-white text-base">Store Products & Inventory Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Control pricing, original price strike-throughs, stock counts, and flash sales.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="bg-slate-950/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={handleOpenNewProduct}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3 relative">
                  <div className="flex gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded-xl shrink-0 border border-white/10 bg-slate-950" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{p.category}</span>
                        {p.isFlashDeal && (
                          <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            ⚡ Flash Deal
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm truncate mt-0.5">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-black text-white text-sm">${p.price.toFixed(2)}</span>
                        {p.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">${p.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock & Restock Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-400' : p.stock > 0 ? 'bg-amber-400' : 'bg-rose-500'}`} />
                      <span className="font-bold text-slate-300">Stock: {p.stock} units</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickRestock(p.id, 10)}
                        className="px-2 py-1 bg-white/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-black rounded border border-white/10 transition-colors"
                        title="Restock +10 units"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleQuickRestock(p.id, 50)}
                        className="px-2 py-1 bg-white/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-black rounded border border-white/10 transition-colors"
                        title="Restock +50 units"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded border border-white/10 transition-colors ml-1"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 bg-white/10 hover:bg-rose-500/20 text-rose-400 rounded border border-white/10 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">Category Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Organize store collections, navigation tags, and category imagery.</p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-slate-950" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={c.image} alt={c.name} className="w-12 h-12 object-cover rounded-xl shrink-0 border border-white/10 bg-slate-950" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-400">{c.productCount} products assigned</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMER REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Customer Ratings & Reviews Moderation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Audit and moderate feedback across all products in the catalog.</p>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Filter reviews..."
                  value={reviewSearch}
                  onChange={e => setReviewSearch(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">
                No customer reviews match your search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map(({ product, review }) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold text-cyan-400 truncate max-w-xs">{product.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-white text-xs">{review.userName}</span>
                          <span className="font-mono text-[10px] bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded border border-white/10">
                            {review.customerId || 'CUST'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-400" /> {review.rating}.0
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      "{review.comment}"
                    </p>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Posted on {new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.verifiedPurchase && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: STORE GLOBAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" /> Global Store Settings & Policies
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Control live storefront banners, payment toggles, and customer support channels.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Free Shipping Order Threshold ($)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={e => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Top Announcement Header Banner</label>
                <input
                  type="text"
                  value={settingsForm.announcementBanner}
                  onChange={e => setSettingsForm({ ...settingsForm, announcementBanner: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Customer Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail}
                    onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.supportPhone}
                    onChange={e => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-slate-400">Allow customers to pay cash when order is delivered</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.codEnabled}
                    onChange={e => setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })}
                    className="w-5 h-5 accent-cyan-500"
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Global Flash Sale Active</div>
                    <div className="text-[11px] text-slate-400">Show flash deal badges and discount timers</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.flashSaleActive}
                    onChange={e => setSettingsForm({ ...settingsForm, flashSaleActive: e.target.checked })}
                    className="w-5 h-5 accent-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Global Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER DOSSIER MODAL */}
      {selectedCustomerForDossier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomerForDossier(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
                {selectedCustomerForDossier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-xl">{selectedCustomerForDossier.name}</h3>
                  <span className="font-mono font-bold text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    {selectedCustomerForDossier.customerId || `CUST-${selectedCustomerForDossier.id.slice(-5).toUpperCase()}`}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedCustomerForDossier.email} • {selectedCustomerForDossier.phone || 'No phone recorded'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Order History for Customer ID ({customerDossierOrders.length} Orders)
              </h4>

              {customerDossierOrders.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No orders placed under this Customer ID yet.</p>
              ) : (
                <div className="space-y-3">
                  {customerDossierOrders.map(o => (
                    <div key={o.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-black text-cyan-300">{o.id}</span>
                          <span className="text-slate-400 ml-2">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-white">${o.total.toFixed(2)}</span>
                          <span className="ml-2 text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded uppercase">
                            {o.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {o.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl relative text-slate-100">
            <button onClick={() => setEditingCustomer(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-white text-lg">Edit Customer Record</h3>

            <form onSubmit={handleSaveCustomerEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Customer ID</label>
                <input
                  type="text"
                  required
                  value={editCustId}
                  onChange={e => setEditCustId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 font-mono text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editCustName}
                  onChange={e => setEditCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editCustEmail}
                  onChange={e => setEditCustEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editCustPhone}
                  onChange={e => setEditCustPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Account Role</label>
                <select
                  value={editCustRole}
                  onChange={e => setEditCustRole(e.target.value as 'customer' | 'admin')}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="customer">Customer (Storefront Access)</option>
                  <option value="admin">Administrator (Master Control Access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOMER / USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl relative text-slate-100">
            <button onClick={() => setIsCreateUserModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-white text-lg">Create New Customer Account</h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Walker"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Custom Customer ID (Optional, auto-generated if blank)</label>
                <input
                  type="text"
                  placeholder="e.g. CUST-99210"
                  value={newCustomerId}
                  onChange={e => setNewCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as 'customer' | 'admin')}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsProductModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-white text-lg">
              {editingProductId ? 'Edit Product Catalog Item' : 'Add New Product to Store'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Active Noise Canceling Headphones"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodOrigPrice}
                    onChange={e => setProdOrigPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={e => setProdImage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={e => setProdIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="font-bold text-slate-200">Featured Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFlashDeal}
                    onChange={e => setProdIsFlashDeal(e.target.checked)}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="font-bold text-amber-300">⚡ Flash Deal Badge</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                {editingProductId ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl relative text-slate-100">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-white text-lg">Add New Category</h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Wearables"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={e => setCatImage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={e => setCatDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
