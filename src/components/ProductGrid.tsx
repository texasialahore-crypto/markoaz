import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, X, RefreshCw, Search } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const fetchFilteredProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({
        category: selectedCategory,
        search: searchQuery,
        minPrice,
        maxPrice,
        minRating: minRating > 0 ? minRating : undefined,
        sort: sortBy
      });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, minRating, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(500);
    setMinRating(0);
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <strong className="text-cyan-300">{products.length}</strong> available items
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-900/80 border border-white/10 text-white text-xs font-bold px-3 py-2 rounded-xl focus:outline-hidden focus:border-cyan-500/50 cursor-pointer shadow-lg backdrop-blur-md"
            >
              <option value="newest" className="bg-slate-900 text-white">Sort by: Newest First</option>
              <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
              <option value="rating_desc" className="bg-slate-900 text-white">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-6 p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 sticky top-24 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" /> Filter Options
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" /> Reset
            </button>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Max Price (${maxPrice})
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-xs font-medium text-slate-400 mt-1">
              <span>$10</span>
              <span>${maxPrice}</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    minRating === rating
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/40 text-slate-950 font-black'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+ ★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end lg:hidden">
            <div className="bg-slate-900 border-l border-white/10 w-full max-w-xs h-full p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-bold text-white text-base">Filter Products</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Max Price (${maxPrice})
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-slate-900/40 border border-white/10 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
              <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                We couldn't find any items matching your selected filter criteria. Try resetting filters or changing your search terms.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-md hover:from-cyan-400 hover:to-blue-500 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
