import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLoginPage: React.FC = () => {
  const { user, isAdmin, adminLogin, logout } = useAuth();
  const { setActiveView, showToast } = useStore();

  const [credential, setCredential] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already verified as Admin, direct them to the Admin Panel
  if (isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Administrator Active
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight pt-3">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Your administrator session is verified with full access to Markoaz management console.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveView('admin')}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Open Admin Console
            </button>
            <button
              onClick={() => setActiveView('home')}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
            >
              Back to Storefront
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim() || !pin.trim()) {
      setErrorMsg('Please enter both Admin Email/ID and Security PIN.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const u = await adminLogin(credential.trim(), pin.trim());
      showToast(`Administrator verified. Welcome, ${u.name}!`, 'success');
      setActiveView('admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrator authentication failed. Please verify credentials.');
      showToast(err.message || 'Access Denied: Invalid Admin Credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/80 relative overflow-hidden"
      >
        {/* Top Decorative Amber Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Markoaz Executive Portal
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Secure Admin Login
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Authorized administrative access. Verification requires registered Admin Email and Security PIN.
          </p>
        </div>

        {/* Warning if a customer is currently logged in */}
        {user && !isAdmin && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Customer Account Connected</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Logged in as <strong className="text-white">{user.name}</strong> ({user.customerId || user.email}). Customer accounts cannot access administrative features. Sign in below with your admin credentials to elevate access.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Authorized Administrator Email or ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                placeholder="Enter authorized administrator email or ID"
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Security PIN / Master Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter administrator security PIN"
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-mono transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !credential.trim() || !pin.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Access Admin Panel</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Disclaimers & Return Link */}
        <div className="space-y-4 pt-2 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <Lock className="w-3 h-3 text-amber-400/70" />
            <span>256-Bit SSL Encrypted Admin Gateway</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('home')}
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Markoaz Storefront
          </button>
        </div>
      </motion.div>
    </div>
  );
};
