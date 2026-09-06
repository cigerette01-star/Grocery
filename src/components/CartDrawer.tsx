import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Store, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotalAmount,
    cartTotalSavings,
    setCheckoutModalOpen,
    storeConfig,
  } = useStore();

  if (!cartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-drawer-backdrop"
        onClick={() => setCartDrawerOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="bg-white p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">Your Pickup Bag</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cart.length} unique item{cart.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Empty Cart"
                  className="cursor-pointer text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={() => setCartDrawerOpen(false)}
                className="cursor-pointer p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Store Pickup Notice Banner */}
          <div className="bg-yellow-50 border-b border-yellow-200/80 px-4 py-3 flex items-start gap-2.5">
            <Store className="w-4 h-4 text-yellow-800 mt-0.5 shrink-0" />
            <div className="text-xs text-yellow-900 leading-relaxed font-medium">
              <span className="font-bold">Store Pickup Only: </span>
              Your groceries will be packed and waiting at{' '}
              <span className="font-bold underline">{storeConfig.pickupCounter}</span>. Ready in ~10 mins!
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] font-medium">
                    Browse fresh groceries, snacks, and daily essentials for lightning 10-minute store pickup.
                  </p>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="cursor-pointer px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold">{item.product.unit}</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-black text-slate-900">
                          ₹{item.product.price * item.quantity}
                        </span>
                        {item.product.mrp > item.product.price && (
                          <span className="text-[10px] text-slate-400 line-through font-medium">
                            ₹{item.product.mrp * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="cursor-pointer px-2.5 py-1.5 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="px-2 py-0.5 text-xs font-black min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="cursor-pointer px-2.5 py-1.5 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Savings Banner */}
                {cartTotalSavings > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Total Savings
                    </span>
                    <span className="font-black text-emerald-700">₹{cartTotalSavings} OFF</span>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 text-xs">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                    Bill Summary
                  </h4>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Items Total</span>
                    <span className="font-bold text-slate-900">₹{cartTotalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Store Pickup Service</span>
                    <span className="text-emerald-600 font-extrabold">FREE (₹0)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Eco Packaging</span>
                    <span className="text-emerald-600 font-extrabold">FREE (₹0)</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-slate-900">Total Payable at Store</span>
                    <span className="font-black text-lg text-emerald-600">
                      ₹{cartTotalAmount}
                    </span>
                  </div>
                </div>

                {/* In-Store Payment methods reminder */}
                <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pay at Counter when collecting:</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      UPI QR (GPay / PhonePe / Paytm)
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      Cards
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
              <button
                id="proceed-to-checkout-btn"
                onClick={handleProceedToCheckout}
                className="cursor-pointer w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-sm shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Pay at Counter</span>
                  <span className="text-base font-black">₹{cartTotalAmount}</span>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold">
                  <span>Proceed to Pickup</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
