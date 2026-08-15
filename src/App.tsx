import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailsView } from './components/ProductDetailsView';
import { WishlistView } from './components/WishlistView';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { UserProfileView } from './components/UserProfileView';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginPage } from './components/AdminLoginPage';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { ProductCard } from './components/ProductCard';
import { api } from './services/api';
import { Product } from './types';
import { Zap, Sparkles, ArrowRight, ShieldCheck, Banknote, RefreshCw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, setSelectedCategory } = useStore();
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts({ flashDeal: true })
      .then(res => setFlashDeals(res))
      .catch(err => console.error(err));

    // Handle direct hash navigation like #admin or #admin-login
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setActiveView('admin');
      } else if (window.location.hash === '#admin-login') {
        setActiveView('admin-login');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Glow Circles */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-10 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <Header />

      <main className="flex-1 relative z-10">
        {activeView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Hero Carousel */}
            <HeroBanner />

            {/* Category Navigation */}
            <CategoryBar />

            {/* Flash Deals Section */}
            {flashDeals.length > 0 && (
              <section className="bg-slate-900/60 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl shadow-md">
                      <Zap className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        Flash Sale Deals <span className="text-xs bg-rose-500/90 text-white font-bold px-2.5 py-0.5 rounded-full border border-rose-400/30">LIMITED TIME</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Special discounts on top rated tech and gear</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('products')}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View All Products <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {flashDeals.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Product Grid */}
            <section className="pt-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Trending & Popular</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Top picks & customer favorites with Cash on Delivery</p>
                </div>
              </div>

              <ProductGrid />
            </section>
          </div>
        )}

        {activeView === 'products' && <ProductGrid />}
        {activeView === 'product-detail' && <ProductDetailsView />}
        {activeView === 'wishlist' && <WishlistView />}
        {activeView === 'checkout' && <CheckoutModal />}
        {activeView === 'order-tracking' && <OrderTrackingView />}
        {activeView === 'user-profile' && <UserProfileView />}
        {activeView === 'admin-login' && <AdminLoginPage />}
        {activeView === 'admin' && <AdminPanel />}
      </main>

      <Footer />

      {/* Global Overlays */}
      <CartDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainContent />
      </StoreProvider>
    </AuthProvider>
  );
}
