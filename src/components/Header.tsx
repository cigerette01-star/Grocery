import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Lock, 
  Store, 
  Package, 
  Zap, 
  X,
  Volume2,
  VolumeX,
  Ticket,
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const {
    storeConfig,
    searchQuery,
    setSearchQuery,
    cartItemCount,
    cartTotalAmount,
    setCartDrawerOpen,
    setAdminModalOpen,
    setCustomerOrdersModalOpen,
    orders,
    setActiveTrackingOrderId,
    isAdminUnlocked,
    soundEnabled,
    setSoundEnabled,
  } = useStore();

  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Look for active in-progress order for the customer
  const activeOrder = orders.find(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'packing' || o.status === 'ready'
  );

  const handleTrackByToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      setTokenError('Please enter your pickup token number');
      return;
    }

    // Try finding order by exact token, stripped number, or order ID
    const foundOrder = orders.find((o) => {
      const oToken = o.pickupToken.toUpperCase();
      const oId = o.id.toUpperCase();
      const numOnlyInput = cleanToken.replace(/[^0-9]/g, '');
      const numOnlyToken = oToken.replace(/[^0-9]/g, '');

      return (
        oToken === cleanToken ||
        oId === cleanToken ||
        oToken === `TK-${cleanToken}` ||
        `TK-${oToken}` === cleanToken ||
        (numOnlyInput.length > 0 && numOnlyInput === numOnlyToken)
      );
    });

    if (foundOrder) {
      setTokenError('');
      setActiveTrackingOrderId(foundOrder.id);
    } else {
      setTokenError(`No order found with token "${tokenInput.trim()}". Check your receipt or WhatsApp.`);
      setTimeout(() => setTokenError(''), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm w-full max-w-full overflow-x-clip">
      {/* Top micro bar for store pickup info */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-3 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white tracking-wide shrink-0">STORE PICKUP ONLY</span>
            <span className="text-slate-600 shrink-0">•</span>
            <span className="text-slate-300 truncate">{storeConfig.pickupCounter}</span>
            <span className="hidden sm:inline text-slate-600 shrink-0">•</span>
            <span className="hidden sm:inline text-slate-400 shrink-0">Pay at Counter via UPI / Cards</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
              className="cursor-pointer text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden md:inline text-[11px]">{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              id="header-my-orders-btn"
              onClick={() => setCustomerOrdersModalOpen(true)}
              className="cursor-pointer text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Store Timings - 2-line layout: Line 1 heading in centre, Line 2 indicates timings */}
      <div 
        id="header-store-timings-strip"
        className="bg-amber-50 border-b border-amber-200/80 py-1.5 px-3 sm:px-8 text-amber-950"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
          {/* 1st line: Store Timings as heading in centre */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950 tracking-tight">
            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="uppercase text-[11px] sm:text-xs font-extrabold tracking-wider text-amber-950">
              Store Timings
            </span>
          </div>
          {/* 2nd line: indicate the timings */}
          <div className="text-[11px] sm:text-xs font-semibold text-amber-900 mt-0.5 tracking-tight">
            <span>09:00AM - 02:00PM &amp; 04:30PM - 07:30PM</span>{' '}
            <span className="text-amber-800 font-bold">(Except Monday - Maint day)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
          {/* Logo & Store Pickup Location */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div 
              id="brand-logo"
              className="cursor-pointer flex items-center gap-2 sm:gap-3 group select-none"
              onClick={() => {
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-sm shadow-red-600/25 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-5 h-5 border-2 sm:border-3 border-white rounded-full flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
                </div>
              </div>
              <div className="flex flex-col text-left">
                {/* RED EAGLE ONLINE GROCERY directly above BlinkGrocer heading */}
                <span className="text-[8px] sm:text-[10.5px] font-black uppercase tracking-[0.14em] sm:tracking-[0.19em] text-red-600 leading-none whitespace-nowrap block select-none">
                  RED EAGLE ONLINE GROCERY
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                  <span className="text-lg sm:text-2xl font-black tracking-tighter leading-none">
                    <span className="text-red-600">BLINK</span><span className="text-slate-800">GROCER</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase px-1 sm:px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full shrink-0">
                    STORE
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-wide mt-0.5">
                  ⚡ 10-MIN PICKUP
                </span>
              </div>
            </div>

            {/* Store Location tag (desktop only) */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-800 leading-tight">Indiranagar Station</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
                  {storeConfig.pickupCounter}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search bar (hidden on mobile, visible on sm and up) */}
          <div className="hidden sm:block flex-1 max-w-md mx-2 relative min-w-0">
            <div className="relative">
              <input
                id="search-groceries-input"
                type="text"
                placeholder="Search fresh groceries, fruits, dairy, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-full px-5 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-inner"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons: Admin and Cart ALWAYS inside screen */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live active order tracker pill (desktop) */}
            {activeOrder && (
              <button
                id="live-order-pill-btn"
                onClick={() => setActiveTrackingOrderId(activeOrder.id)}
                className="cursor-pointer hidden md:flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 transition-all shadow-xs shrink-0"
                title="Open Live On-Screen Order Tracking Popup"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="truncate max-w-[110px]">
                  {activeOrder.status === 'ready'
                    ? '🎉 Ready!'
                    : activeOrder.status === 'packing'
                    ? '📦 Packing...'
                    : activeOrder.status === 'confirmed'
                    ? '✅ Confirmed'
                    : '⚡ Placed'}
                </span>
                <span className="text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono font-bold">
                  {activeOrder.pickupToken}
                </span>
              </button>
            )}

            {/* Admin Portal Toggle Button */}
            <button
              id="admin-portal-modal-btn"
              onClick={() => setAdminModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm shrink-0"
              title="Open Staff & Admin Management Portal"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
              <span className="hidden xs:inline">{isAdminUnlocked ? 'Admin Hub' : 'Admin'}</span>
            </button>

            {/* Cart Drawer Trigger - Strictly inside visible screen */}
            <button
              id="cart-drawer-trigger-btn"
              onClick={() => setCartDrawerOpen(true)}
              className="cursor-pointer relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all duration-150 shrink-0"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="hidden md:inline">Pickup Bag</span>
                {cartItemCount > 0 ? (
                  <span className="font-black bg-white/25 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] leading-tight">
                    {cartItemCount}
                  </span>
                ) : (
                  <span className="md:hidden text-[11px]">Bag</span>
                )}
                {cartTotalAmount > 0 && (
                  <span className="border-l border-white/30 pl-1 sm:pl-1.5 font-black text-white text-[11px] sm:text-xs">
                    ₹{cartTotalAmount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (strictly on its own line below row 1 on compact screens) */}
        <div className="mt-2.5 sm:hidden relative w-full">
          <input
            id="search-groceries-input-mobile"
            type="text"
            placeholder="Search groceries, fruits, snacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-full px-4 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-inner"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dedicated mobile tracking banner directly beneath search bar on compact screens */}
        <div className="mt-2.5 sm:hidden" id="mobile-token-tracking-banner">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 tracking-tight">
                  Enter Token Number to Track Live Status
                </span>
              </div>
              {activeOrder && (
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput(activeOrder.pickupToken);
                    setActiveTrackingOrderId(activeOrder.id);
                  }}
                  className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 px-2 py-0.5 rounded-full transition-colors shrink-0"
                  title="Quick fill current active order token"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active: {activeOrder.pickupToken}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleTrackByToken} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  id="mobile-token-tracking-input"
                  type="text"
                  placeholder="Enter Token # (e.g. TK-101)"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (tokenError) setTokenError('');
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono uppercase placeholder:text-slate-400 placeholder:normal-case focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs"
                />
                {tokenInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setTokenInput('');
                      setTokenError('');
                    }}
                    aria-label="Clear token input"
                    className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                id="mobile-token-tracking-submit-btn"
                type="submit"
                className="cursor-pointer px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all shrink-0"
              >
                <span>Live Status</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </form>

            {tokenError && (
              <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-1.5 font-medium px-0.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{tokenError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
