import React from 'react';
import { useStore } from '../context/StoreContext';
import { Headphones, Shirt, Home, Sparkles, Activity, Layers } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Electronics': <Headphones className="w-5 h-5" />,
  'Fashion & Apparel': <Shirt className="w-5 h-5" />,
  'Home & Living': <Home className="w-5 h-5" />,
  'Beauty & Health': <Sparkles className="w-5 h-5" />,
  'Sports & Fitness': <Activity className="w-5 h-5" />
};

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, setActiveView } = useStore();

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Browse Categories</h2>
          <p className="text-xs text-slate-400">Explore curated collections for every lifestyle</p>
        </div>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setActiveView('products');
            }}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setActiveView('products');
          }}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border font-semibold text-sm transition-all shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/40 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 backdrop-blur-md'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${selectedCategory === 'All' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-cyan-400'}`}>
            <Layers className="w-4 h-4" />
          </div>
          <span>All Products</span>
        </button>

        {categories.map(cat => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setActiveView('products');
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border font-semibold text-sm transition-all shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/40 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 backdrop-blur-md'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-cyan-400'}`}>
                {categoryIcons[cat.name] || <Layers className="w-4 h-4" />}
              </div>
              <span>{cat.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-white/10 text-slate-400'
              }`}>
                {cat.productCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
