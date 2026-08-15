import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Heart, ShoppingBag, Check, Zap, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail, addToCart, wishlistProductIds, toggleWishlist } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  const isWishlisted = wishlistProductIds.has(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product.id, 1, product.variants?.colors?.[0], product.variants?.sizes?.[0]);
    setIsAdding(false);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => openProductDetail(product)}
      className="group bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/25 overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-950/80 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="px-2.5 py-1 bg-rose-500/90 text-white font-black text-[11px] rounded-lg shadow-md border border-rose-400/30 backdrop-blur-md tracking-wide">
              -{product.discountPercentage}% OFF
            </span>
          )}

          {product.isFlashDeal && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] rounded-md shadow-md flex items-center gap-1 uppercase">
              <Zap className="w-3 h-3 fill-slate-950" /> Flash Deal
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all z-10 border ${
            isWishlisted
              ? 'bg-rose-500 border-rose-400 text-white'
              : 'bg-slate-950/60 border-white/10 text-slate-300 hover:text-rose-400 hover:bg-slate-950/80'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Hover Hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Quick View
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-bold text-slate-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-500 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-cyan-400">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
              <Check className="w-3 h-3 text-cyan-400" /> Cash on Delivery
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock <= 0}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 shrink-0 disabled:opacity-50"
            title="Add to Cart"
          >
            {isAdding ? (
              <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-slate-950" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
