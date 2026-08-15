import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  User as UserIcon,
  Phone,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, showToast } = useStore();
  const { customerLogin, register, loginAsDemoCustomer } = useAuth();

  // Customer mode: login vs signup
  const [customerMode, setCustomerMode] = useState<'login' | 'signup'>('login');

  // Customer form inputs
  const [custEmail, setCustEmail] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (customerMode === 'login') {
        const u = await customerLogin(custEmail);
        showToast(`Welcome back, ${u.name}! Customer ID: ${u.customerId || 'CUST'}`, 'success');
      } else {
        const u = await register({ email: custEmail, name: custName, phone: custPhone });
        showToast(`Account registered! Your unique Customer ID is ${u.customerId}`, 'success');
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Customer authentication failed');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoCustomerClick = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const u = await loginAsDemoCustomer();
      showToast(`Signed in as Customer (${u.name} • ${u.customerId})`, 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative bg-slate-900/95 backdrop-blur-2xl w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 border border-white/10 z-10 space-y-5 text-slate-100 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Customer Portal Header */}
          <div className="text-center space-y-1 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Markoaz Customer Portal
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {customerMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {customerMode === 'login'
                ? 'Sign in to access your orders, Cash on Delivery receipts, and customer account.'
                : 'Join Markoaz Store. An official Customer ID is generated automatically upon registration.'}
            </p>
          </div>

          {/* Customer 1-Click Demo Shortcut */}
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-extrabold text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Demo Customer Account
              </div>
              <div className="text-[11px] text-slate-400">David Miller • ID: <span className="font-mono text-cyan-200 font-bold">CUST-84920</span></div>
            </div>
            <button
              type="button"
              onClick={handleDemoCustomerClick}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow transition-colors shrink-0"
            >
              Quick Sign In
            </button>
          </div>

          {/* Customer Mode Switcher (Sign In vs Sign Up) */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setCustomerMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                customerMode === 'login' ? 'bg-cyan-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                customerMode === 'signup' ? 'bg-cyan-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register New Account
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Customer Form */}
          <form onSubmit={handleCustomerSubmit} className="space-y-3">
            {customerMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  />
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {customerMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (for COD confirmations)</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2831"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {customerMode === 'signup' && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1 text-left">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Auto-Generated Customer ID
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Your unique Customer ID (<span className="font-mono text-cyan-300">CUST-XXXXX</span>) will be assigned automatically for order verification and COD tracking.
                </div>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : customerMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4 text-slate-950" /> Customer Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-slate-950" /> Register Customer ID
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="text-center pt-1 border-t border-white/10">
            <p className="text-[10px] text-slate-500">
              Safe & secure customer checkout • Cash on Delivery supported across all orders.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
