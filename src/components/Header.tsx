import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Truck,
  Menu,
  X,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cartCount,
    wishlistProductIds,
    setIsCartOpen,
    setIsAuthModalOpen,
    openProductDetail,
    trackOrder
  } = useStore();

  const { user, logout, isAdmin, loginAsDemoCustomer } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.getProducts({ search: searchQuery });
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('products');
      setSearchResults([]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-950 to-indigo-950/80 border-b border-white/10 text-slate-300 py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Truck className="w-3.5 h-3.5 text-cyan-400" /> Cash on Delivery Available
            </span>
            <span className="hidden sm:inline border-l border-white/10 pl-4 text-slate-400">
              Free Express Shipping on Orders Over $50
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loginAsDemoCustomer}
                  className="hover:text-cyan-300 transition-colors text-slate-300 flex items-center gap-1"
                  title="Quick Demo Customer Login"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Demo Customer
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  Welcome, <strong className="text-white">{user.name.split(' ')[0]}</strong>
                </span>
                {user.customerId && (
                  <span className="font-mono text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    {user.customerId}
                  </span>
                )}
                {isAdmin && (
                  <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    ADMIN
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => {
            setActiveView('home');
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              MARKOAZ <span className="text-cyan-300 font-bold text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">STORE</span>
            </div>
            <div className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">Premium Shopping & COD</div>
          </div>
        </button>

        {/* Live Product Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 pl-11 pr-10 py-2.5 rounded-2xl focus:outline-hidden focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 text-sm transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 border-b border-white/10">
                Matching Products
              </div>
              <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      openProductDetail(p);
                      setSearchResults([]);
                    }}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.category}</div>
                    </div>
                    <div className="text-sm font-bold text-cyan-400">${p.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full p-2.5 bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-semibold text-center border-t border-white/10 flex items-center justify-center gap-1"
              >
                View all results for "{searchQuery}" <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Order Tracking Quick Link */}
          <button
            onClick={() => setActiveView('order-tracking')}
            className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border ${
              activeView === 'order-tracking' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-cyan-400" /> Track Order
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setActiveView('wishlist')}
            className="relative p-2.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistProductIds.size > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[10px] flex items-center justify-center rounded-full border border-slate-950">
                {wishlistProductIds.size}
              </span>
            )}
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl sm:px-3.5 sm:py-2 flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-slate-950" />
            <span className="hidden sm:inline text-xs font-bold text-slate-950">
              Cart {cartCount > 0 && `(${cartCount})`}
            </span>
            {cartCount > 0 && (
              <span className="sm:hidden absolute -top-1 -right-1 w-5 h-5 bg-slate-950 text-cyan-300 font-extrabold text-[10px] flex items-center justify-center rounded-full border border-cyan-400/40">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Account Menu */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-white/10">
                      <div className="font-semibold text-white truncate">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        <span>ID: {user.customerId || `CUST-${user.id.slice(-5).toUpperCase()}`}</span>
                      </div>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                          Admin Account
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveView('user-profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2.5 text-slate-300 hover:text-white font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-cyan-400" /> My Account & Orders
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('order-tracking');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2.5 text-slate-300 hover:text-white font-medium"
                    >
                      <PackageCheck className="w-4 h-4 text-cyan-400" /> Track Live Order
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-500/10 text-amber-300 font-bold flex items-center gap-2.5"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-400" /> Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-400 font-medium flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-2xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-cyan-400" /> Sign In
              </button>
            )}
          </div>

          {/* Admin Toggle button (Only shown to authenticated Administrators) */}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-2xl transition-colors text-xs font-bold flex items-center gap-1 border border-amber-500/30 shadow-sm"
              title="Open Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Admin Panel</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:bg-white/10 rounded-xl md:hidden"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-sm border border-white/10 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <nav className="flex flex-col gap-1 text-sm font-medium text-slate-300">
            <button
              onClick={() => {
                setActiveView('home');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left hover:bg-white/5"
            >
              Home Page
            </button>
            <button
              onClick={() => {
                setActiveView('products');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left hover:bg-white/5"
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveView('order-tracking');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left hover:bg-white/5 flex items-center justify-between"
            >
              <span>Order Tracking</span>
              <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">COD</span>
            </button>
            <button
              onClick={() => {
                setActiveView('wishlist');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left hover:bg-white/5 flex items-center justify-between"
            >
              <span>My Wishlist</span>
              {wishlistProductIds.size > 0 && (
                <span className="text-xs font-bold text-rose-400">{wishlistProductIds.size} saved</span>
              )}
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-left hover:bg-amber-500/10 text-amber-300 font-bold flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" /> Admin Control Panel
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
