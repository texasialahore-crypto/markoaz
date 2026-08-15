import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, setActiveView } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <div>
          <button
            onClick={() => setActiveView('products')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" /> Continue Shopping
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Saved Wishlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            You have <strong className="text-cyan-300">{wishlist.length}</strong> items saved for later
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
          <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Save your favorite products while browsing so you can easily find them later or add them to your cart!
          </p>
          <button
            onClick={() => setActiveView('products')}
            className="mt-5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-md hover:from-cyan-400 hover:to-blue-500 transition-colors"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
};
