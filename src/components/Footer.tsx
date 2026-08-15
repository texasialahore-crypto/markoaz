import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones, CreditCard, Banknote, Heart, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, setIsAuthModalOpen } = useStore();
  const { isAdmin } = useAuth();

  return (
    <footer className="bg-slate-950/80 backdrop-blur-xl text-slate-300 pt-16 pb-8 border-t border-white/10 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl shrink-0 border border-cyan-500/30">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Cash on Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Pay comfortably at your doorstep upon receiving your package.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 border border-blue-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Free nationwide shipping on all orders over $50 with real-time tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl shrink-0 border border-purple-500/30">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-1">Hassle-free 100% money-back guarantee with doorstep pickup.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 border border-amber-500/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-1">Expert customer support team available via chat and email anytime.</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-white/10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/20">
                M
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">MARKOAZ</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Curated premium lifestyle, fashion, electronics, and home essentials delivered right to your door. Built for seamless online shopping with Cash on Delivery support.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Accepted Payment Methods:</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-cyan-500/20 text-xs font-bold text-cyan-300 rounded-md border border-cyan-500/30">COD</span>
                <span className="px-2 py-1 bg-white/5 text-xs font-semibold text-slate-300 rounded-md border border-white/10">Visa</span>
                <span className="px-2 py-1 bg-white/5 text-xs font-semibold text-slate-300 rounded-md border border-white/10">Mastercard</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Shop Categories</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => { setSelectedCategory('Electronics'); setActiveView('products'); }} className="hover:text-cyan-300 transition-colors">
                  Electronics & Tech
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Fashion & Apparel'); setActiveView('products'); }} className="hover:text-cyan-300 transition-colors">
                  Fashion & Apparel
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Home & Living'); setActiveView('products'); }} className="hover:text-cyan-300 transition-colors">
                  Home & Living
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Beauty & Health'); setActiveView('products'); }} className="hover:text-cyan-300 transition-colors">
                  Beauty & Skincare
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Sports & Fitness'); setActiveView('products'); }} className="hover:text-cyan-300 transition-colors">
                  Sports & Fitness
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Customer & Staff</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => setActiveView('order-tracking')} className="hover:text-cyan-300 transition-colors">
                  Track Order Status (COD)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('wishlist')} className="hover:text-cyan-300 transition-colors">
                  My Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('user-profile')} className="hover:text-cyan-300 transition-colors">
                  My Customer Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView(isAdmin ? 'admin' : 'admin-login')}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5 pt-1"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Panel</span>
                  {isAdmin && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Active
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm mb-4">Newsletter</h5>
            <p className="text-xs text-slate-400 mb-3">Subscribe for exclusive flash deal alerts & secret promo codes.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 text-white placeholder-slate-500 px-3.5 py-2 rounded-xl text-xs border border-white/10 focus:outline-hidden focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs py-2 rounded-xl transition-all shadow-md shadow-cyan-500/20"
              >
                Get 10% Off Code
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Markoaz, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Shipping & COD FAQ</span>
            <button
              onClick={() => setActiveView(isAdmin ? 'admin' : 'admin-login')}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              title="Store Executive Administration Portal"
            >
              <Lock className="w-3 h-3 text-amber-400/80" /> Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
