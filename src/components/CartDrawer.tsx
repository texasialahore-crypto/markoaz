import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Banknote, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    setActiveView,
    showToast
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscountPercent(10);
      showToast('10% Promo Code Applied!', 'success');
    } else {
      showToast('Invalid promo code. Try "WELCOME10"', 'error');
    }
  };

  const freeShippingThreshold = 50;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 5.99;
  const finalTotal = cartSubtotal - discountAmount + shippingFee;

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 text-slate-100 h-full shadow-2xl flex flex-col z-10"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="font-extrabold text-white text-base">Your Cart ({cartCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-cyan-950/40 border-b border-cyan-500/20 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-400" />
                {amountToFreeShipping > 0
                  ? `Add $${amountToFreeShipping.toFixed(2)} for FREE Shipping`
                  : '🎉 You earned FREE Express Shipping!'}
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-white/10">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Explore our catalog and find something great to add!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('products');
                  }}
                  className="mt-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0 bg-slate-950"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{item.product.name}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.selectedColor && <span>Color: {item.selectedColor} </span>}
                      {item.selectedSize && <span>| Size: {item.selectedSize}</span>}
                    </div>
                    <div className="font-black text-cyan-400 text-sm mt-1">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-white/10 rounded-lg bg-white/5">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 font-bold text-xs hover:bg-white/10 text-slate-300 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 font-bold text-xs hover:bg-white/10 text-slate-300 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-white/5 backdrop-blur-xl space-y-4">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 text-xs px-3 py-2 rounded-xl focus:outline-hidden focus:border-cyan-500/50 uppercase font-semibold text-white placeholder-slate-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10"
                >
                  Apply
                </button>
              </form>

              {/* Summary Numbers */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-cyan-400 font-semibold">
                    <span>Discount (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="font-bold text-white">
                    {shippingFee === 0 ? <strong className="text-cyan-400">FREE</strong> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black text-white">
                  <span>Total</span>
                  <span className="text-base text-cyan-400">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveView('checkout');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                Checkout with Cash on Delivery <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <div className="text-[11px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-cyan-400" /> Pay cash safely at doorstep
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
