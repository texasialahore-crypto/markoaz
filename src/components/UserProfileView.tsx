import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order } from '../types';
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  Banknote,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  LayoutDashboard,
  QrCode,
  Sparkles
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { setActiveView, trackOrder, showToast } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user) {
      api.getOrders(true)
        .then(res => setOrders(res))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleCopyCustomerId = () => {
    if (!user) return;
    const cid = user.customerId || `CUST-${user.id.slice(-5).toUpperCase()}`;
    navigator.clipboard.writeText(cid);
    setCopiedId(true);
    showToast(`Customer ID (${cid}) copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(false), 2500);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-lg">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign in to view your Customer Profile</h2>
        <p className="text-xs text-slate-400">Access your Customer ID, order history, Cash on Delivery receipts, and saved address book.</p>
        <button
          onClick={() => setActiveView('home')}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const customerId = user.customerId || `CUST-${user.id.slice(-5).toUpperCase()}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Profile & Customer ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Identity Info */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email} • {user.phone || 'No phone provided'}</p>
                <div className="text-[11px] text-slate-500 mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isAdmin && (
                <button
                  onClick={() => setActiveView('admin')}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-amber-500/40 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Admin Panel
                </button>
              )}
              <button
                onClick={logout}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Verified Customer Account
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Banknote className="w-4 h-4 text-cyan-400" /> Cash on Delivery Eligible
            </span>
          </div>
        </div>

        {/* Right: Digital Customer ID Card */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/40 backdrop-blur-xl p-6 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
                Markoaz Customer Pass
              </span>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
              ACTIVE
            </span>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Official Customer ID
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider mt-0.5">
              {customerId}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyCustomerId}
              className="w-full py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Customer ID Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Customer ID</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
              Use your Customer ID for courier COD delivery verification & customer support.
            </p>
          </div>
        </div>
      </div>

      {/* Orders History Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" /> My Orders ({orders.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All orders registered under Customer ID <strong className="text-cyan-400 font-mono">{customerId}</strong>
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading order history...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-xs text-slate-400 font-medium">You haven't placed any orders yet.</p>
            <button
              onClick={() => setActiveView('products')}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div
                key={o.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-cyan-400 text-sm">{o.id}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="hidden sm:inline text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-white/10">
                      ID: {o.customerId || customerId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Placed on {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} Items • <strong className="text-white">${o.total.toFixed(2)}</strong>
                  </p>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Payment: <strong className="uppercase text-slate-300">{o.paymentMethod}</strong> ({o.paymentStatus}) • Tracking: <span className="font-mono text-slate-400">{o.trackingNumber}</span>
                  </p>
                </div>

                <button
                  onClick={() => trackOrder(o.id)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1 shrink-0 transition-colors"
                >
                  Track Order <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Book */}
      {user.address && (
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-3">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Primary Shipping Address
          </h2>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white">{user.name}</div>
            <div>{user.address.street}</div>
            <div>{user.address.city}, {user.address.state} {user.address.zipCode}</div>
            <div>{user.address.country}</div>
          </div>
        </div>
      )}
    </div>
  );
};

