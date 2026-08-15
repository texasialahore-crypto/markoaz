import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PaymentMethod, Order } from '../types';
import confetti from 'canvas-confetti';
import {
  Banknote,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  PackageCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { cart, cartSubtotal, setActiveView, trackOrder, showToast, refreshCartAndWishlist } = useStore();
  const { user } = useAuth();

  const freeShippingThreshold = 50;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 5.99;
  const tax = cartSubtotal * 0.08; // 8% tax
  const total = cartSubtotal + shippingFee + tax;

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '100 Main St');
  const [city, setCity] = useState(user?.address?.city || 'San Francisco');
  const [state, setState] = useState(user?.address?.state || 'CA');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '94105');
  const [country, setCountry] = useState(user?.address?.country || 'United States');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !street || !city || !zipCode) {
      showToast('Please fill out all required shipping fields', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0],
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      }));

      const customerId = user?.customerId || (user ? `CUST-${user.id.slice(-5).toUpperCase()}` : `CUST-GUEST-${Math.floor(10000 + Math.random() * 90000)}`);

      const newOrder = await api.createOrder({
        userId: user?.id || 'guest-' + Date.now(),
        customerId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: { street, city, state, zipCode, country },
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee,
        discount: 0,
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
      });

      setCompletedOrder(newOrder);
      refreshCartAndWishlist();

      // Launch Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast('Order placed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 text-slate-100">
        <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed!
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">
            Thank you for your order, {completedOrder.customerName.split(' ')[0]}!
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-slate-300 mt-2 font-mono">
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
              Customer ID: <strong className="text-cyan-400">{completedOrder.customerId}</strong>
            </span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
              Order ID: <strong className="text-cyan-400">{completedOrder.id}</strong>
            </span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
              Tracking: <strong className="text-cyan-400">{completedOrder.trackingNumber}</strong>
            </span>
          </div>
        </div>

        {/* COD Notice */}
        {completedOrder.paymentMethod === 'cod' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left max-w-md mx-auto text-xs text-amber-300 space-y-1 backdrop-blur-md">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <Banknote className="w-4 h-4 text-cyan-400" /> Cash on Delivery Confirmed
            </div>
            <p>
              Please keep <strong className="text-white">${completedOrder.total.toFixed(2)}</strong> cash ready upon delivery on {completedOrder.estimatedDelivery}.
            </p>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => trackOrder(completedOrder.id)}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <PackageCheck className="w-4 h-4 text-slate-950" /> Track Live Delivery
          </button>
          <button
            onClick={() => setActiveView('products')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      <button
        onClick={() => setActiveView('products')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-cyan-400" /> Back to Store
      </button>

      <h1 className="text-2xl font-black text-white tracking-tight mb-8">
        Secure Order Checkout
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Address & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address Box */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" /> 1. Shipping & Contact Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Phone Number (For COD Delivery Call) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ZIP / Postal Code *</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Banknote className="w-5 h-5 text-cyan-400" /> 2. Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* Cash On Delivery (Highlighted) */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/20'
                    : 'border-white/10 bg-slate-950/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'cod' ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-sm flex items-center gap-2">
                      Cash on Delivery (COD)
                      <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-md">
                        MOST POPULAR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Pay in cash directly to the courier agent when your parcel arrives.</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>

              {/* Card Simulator */}
              <label
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/20'
                    : 'border-white/10 bg-slate-950/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'card' ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-sm">Credit / Debit Card</div>
                    <p className="text-xs text-slate-400 mt-0.5">Instant online card authorization.</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Box */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6 sticky top-24 h-fit">
          <h3 className="font-extrabold text-white text-base">Order Summary</h3>

          <div className="divide-y divide-white/10 max-h-60 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="py-3 flex items-center gap-3">
                <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-slate-950 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.product.name}</div>
                  <div className="text-[10px] text-slate-400">Qty: {item.quantity}</div>
                </div>
                <div className="text-xs font-bold text-cyan-300">${(item.product.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-t border-white/10 pt-4">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal</span>
              <span className="font-bold text-white">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Shipping</span>
              <span className="font-bold text-white">
                {shippingFee === 0 ? <strong className="text-cyan-400">FREE</strong> : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between text-base font-black text-white">
              <span>Total Payable</span>
              <span className="text-xl text-cyan-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                Confirm Order ({paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay Online'}) <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>

          <div className="text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> 100% Encrypted & Safe Checkout
          </div>
        </div>
      </form>
    </div>
  );
};
