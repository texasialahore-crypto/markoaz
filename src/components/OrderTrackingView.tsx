import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import {
  PackageCheck,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Banknote,
  AlertCircle,
  ChevronLeft,
  Calendar
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { selectedOrderForTracking, setActiveView, showToast } = useStore();

  const [searchInput, setSearchInput] = useState(selectedOrderForTracking || 'ORD-98231');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    try {
      const data = await api.getOrderById(id.trim());
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      showToast('Order not found. Please check your Order ID.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrderForTracking) {
      setSearchInput(selectedOrderForTracking);
      fetchOrder(selectedOrderForTracking);
    } else {
      fetchOrder('ORD-98231');
    }
  }, [selectedOrderForTracking]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchInput);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
      case 'out_for_delivery':
        return 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30';
      case 'processing':
        return 'text-amber-300 bg-amber-500/20 border-amber-500/30';
      default:
        return 'text-slate-300 bg-white/10 border-white/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <button
          onClick={() => setActiveView('products')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" /> Back to Store
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-cyan-400" /> Live Order Tracking
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Enter your Order ID, Tracking Code, or Customer ID to see real-time delivery status updates.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. ORD-98231, CUST-84920, or TRK-AURA-882194"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 text-white font-mono text-sm px-4 py-3 pl-11 rounded-2xl focus:outline-hidden focus:border-cyan-500/50 shadow-inner"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          Track
        </button>
      </form>

      {/* Order Status Display */}
      {isLoading ? (
        <div className="p-12 text-center bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
          <span className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block" />
          <p className="text-xs text-slate-400 font-semibold mt-2">Fetching live tracking information...</p>
        </div>
      ) : !order ? (
        <div className="p-12 text-center bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-white text-base">Order Not Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for demo order <strong className="font-mono text-cyan-300">ORD-98231</strong>, customer <strong className="font-mono text-cyan-300">CUST-84920</strong>, or check your order confirmation email.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <span>Order <strong className="font-mono text-cyan-300">{order.id}</strong></span>
                {order.customerId && (
                  <span className="bg-slate-950/80 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 border border-white/10">
                    Customer ID: <strong className="text-cyan-400">{order.customerId}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Estimated Delivery: {order.estimatedDelivery}
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="font-mono">Tracking: {order.trackingNumber}</span>
              </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Stepper Visual Timeline */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-6">
              Delivery Progress
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md z-10 ${
                    step.completed
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 ring-4 ring-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 border border-white/10'
                  }`}>
                    {step.completed ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : idx + 1}
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Shipping Destination
              </div>
              <div className="font-semibold text-slate-200">{order.customerName}</div>
              <div className="text-slate-400">{order.shippingAddress.street}</div>
              <div className="text-slate-400">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
              <div className="text-slate-500 pt-1">Phone: {order.customerPhone}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5 mb-2">
                <Banknote className="w-4 h-4 text-cyan-400" /> Payment & Total
              </div>
              <div className="text-slate-300">Method: <strong className="uppercase text-white">{order.paymentMethod}</strong> (Cash on Delivery)</div>
              <div className="text-slate-300">Status: <strong className="capitalize text-white">{order.paymentStatus.replace(/_/g, ' ')}</strong></div>
              <div className="text-sm font-black text-cyan-400 pt-1">Total: ${order.total.toFixed(2)}</div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Package Contents</h4>
            <div className="divide-y divide-white/10">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-white/10 bg-slate-950" />
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">Qty: {item.quantity} {item.selectedColor && `| ${item.selectedColor}`}</div>
                    </div>
                  </div>
                  <div className="font-bold text-cyan-300">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
