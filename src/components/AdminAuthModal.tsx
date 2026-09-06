import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AdminAuthModal: React.FC = () => {
  const {
    adminModalOpen,
    setAdminModalOpen,
    isAdminUnlocked,
    setIsAdminUnlocked,
  } = useStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Default admin passcode
  const DEFAULT_ADMIN_PIN = '1111';

  if (!adminModalOpen || isAdminUnlocked) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEFAULT_ADMIN_PIN) {
      setError('');
      setIsAdminUnlocked(true);
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="admin-auth-card"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header with Dark theme for Admin security */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            onClick={() => setAdminModalOpen(false)}
            aria-label="Close"
            className="cursor-pointer absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Staff & Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Protected area for order processing, inventory control, and customer WhatsApp dispatch.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Admin Security PIN
              </label>
            </div>

            <div className="relative">
              <input
                id="admin-passcode-input"
                type={showPassword ? 'text' : 'password'}
                required
                maxLength={8}
                placeholder="Enter admin PIN"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none pr-10 transition-all font-mono tracking-wider font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="admin-login-submit-btn"
              type="submit"
              className="cursor-pointer w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Controls</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
