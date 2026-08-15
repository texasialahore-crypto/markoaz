import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Banknote,
  Check,
  ChevronLeft,
  MessageSquare,
  ThumbsUp,
  Send,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetailsView: React.FC = () => {
  const { selectedProduct, setActiveView, addToCart, wishlistProductIds, toggleWishlist, showToast, setIsAuthModalOpen } = useStore();
  const { user } = useAuth();

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 text-sm">Product details unavailable.</p>
        <button onClick={() => setActiveView('products')} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
          Back to Store
        </button>
      </div>
    );
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(selectedProduct.variants?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(selectedProduct.variants?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isWishlisted = wishlistProductIds.has(selectedProduct.id);

  useEffect(() => {
    api.getProductReviews(selectedProduct.id)
      .then(res => setReviews(res))
      .catch(err => console.error(err));
  }, [selectedProduct.id]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await addToCart(selectedProduct.id, quantity, selectedColor, selectedSize);
    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await addToCart(selectedProduct.id, quantity, selectedColor, selectedSize);
    setActiveView('checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      showToast('Please fill out review title and comment', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const rev = await api.addReview(selectedProduct.id, {
        rating: newRating,
        title: newTitle,
        comment: newComment
      });
      setReviews(prev => [rev, ...prev]);
      setNewTitle('');
      setNewComment('');
      showToast('Thank you for your review!', 'success');
    } catch (err: any) {
      showToast('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Back Button */}
      <button
        onClick={() => setActiveView('products')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-cyan-400" /> Back to Products
      </button>

      {/* Main Grid: Gallery + Purchasing Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square sm:aspect-4/3 bg-slate-950/80 rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
            <img
              src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            {selectedProduct.discountPercentage && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white font-black text-xs rounded-lg shadow-md border border-rose-400/30">
                -{selectedProduct.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {selectedProduct.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-950 ${
                    activeImageIndex === idx ? 'border-cyan-400 ring-2 ring-cyan-500/20' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Form */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                {selectedProduct.category}
              </span>
              {selectedProduct.stock > 0 ? (
                <span className="text-xs font-semibold text-slate-400">In Stock ({selectedProduct.stock} available)</span>
              ) : (
                <span className="text-xs font-bold text-rose-400">Out of Stock</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {selectedProduct.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(selectedProduct.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">{selectedProduct.rating.toFixed(1)}</span>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-slate-400 hover:text-cyan-300 font-semibold underline"
              >
                {selectedProduct.reviewCount} Reviews
              </button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-cyan-400">${selectedProduct.price.toFixed(2)}</span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">${selectedProduct.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Taxes included. Free shipping available.</p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30">
                <Banknote className="w-4 h-4 text-cyan-400" /> Cash on Delivery
              </span>
            </div>
          </div>

          {/* Variant Selector: Color */}
          {selectedProduct.variants?.colors && selectedProduct.variants.colors.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Color Variant: <span className="text-cyan-400 font-normal">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedColor === color
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/40 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selector: Size */}
          {selectedProduct.variants?.sizes && selectedProduct.variants.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Size: <span className="text-cyan-400 font-normal">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-xl text-xs font-bold border flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/40 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-white/10 rounded-xl bg-white/5 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 font-bold text-slate-300 hover:bg-white/10 rounded-lg flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-black text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 font-bold text-slate-300 hover:bg-white/10 rounded-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || selectedProduct.stock <= 0}
                className="flex-1 py-3.5 px-4 bg-white/10 hover:bg-white/15 text-white font-extrabold text-sm rounded-2xl border border-white/15 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400" /> Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  isWishlisted
                    ? 'bg-rose-500 border-rose-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-slate-950/80 hover:text-rose-400'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={selectedProduct.stock <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              Buy Now with Cash on Delivery
            </button>
          </div>

          {/* Guarantees List */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-cyan-400 shrink-0" /> Cash on Delivery Available
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400 shrink-0" /> Express 2-3 Day Shipping
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" /> 100% Original Guarantee
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> 30 Days Free Return
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description / Specifications / Reviews */}
      <div className="border-t border-white/10 pt-10">
        <div className="flex border-b border-white/10 gap-8 mb-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-sm font-extrabold transition-colors border-b-2 -mb-px ${
              activeTab === 'description'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-4 text-sm font-extrabold transition-colors border-b-2 -mb-px ${
              activeTab === 'specifications'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-extrabold transition-colors border-b-2 -mb-px ${
              activeTab === 'reviews'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Description Tab Content */}
        {activeTab === 'description' && (
          <div className="max-w-3xl text-slate-300 leading-relaxed text-sm space-y-4">
            <p>{selectedProduct.description}</p>
            {selectedProduct.tags && (
              <div className="pt-4 flex flex-wrap gap-2">
                {selectedProduct.tags.map(t => (
                  <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-xs font-semibold">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab Content */}
        {activeTab === 'specifications' && (
          <div className="max-w-xl bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="divide-y divide-white/10 text-sm">
              {Object.entries(selectedProduct.specifications || {}).map(([key, val]) => (
                <div key={key} className="py-2.5 flex justify-between">
                  <span className="font-semibold text-slate-400">{key}</span>
                  <span className="font-bold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-6">
              {reviews.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No reviews yet. Be the first to leave a review!</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {rev.userName}
                            {rev.verifiedBuyer && (
                              <span className="text-[10px] font-bold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-md">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-sm pt-1">{rev.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Box */}
            <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" /> Write a Review
              </h3>

              {!user && (
                <div className="p-3 bg-amber-500/10 text-amber-300 text-xs rounded-xl flex items-center gap-2 border border-amber-500/30">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Reviewing as Guest. <button onClick={() => setIsAuthModalOpen(true)} className="underline font-bold text-amber-300">Sign in</button> to link to your account.</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Star Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent sound quality & fast delivery!"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    placeholder="What did you like or dislike about this product?"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" /> Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
