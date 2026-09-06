import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Store, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Send,
  ExternalLink,
  ShoppingBag,
  Activity,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { PaymentMethodAtStore, Order } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    cartTotalAmount,
    cartTotalSavings,
    storeConfig,
    placeOrder,
    setActiveTrackingOrderId,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodAtStore>('QR');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!checkoutModalOpen) return null;

  const handleClose = () => {
    setCheckoutModalOpen(false);
    setPlacedOrder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Please enter your full name for order pickup.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for WhatsApp updates.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const order = placeOrder({
        customerName: customerName.trim(),
        customerPhone: `+91 ${cleanPhone.slice(-10)}`,
        paymentMethodAtStore: paymentMethod,
        notes: notes.trim(),
      });

      // Launch cheerful celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setPlacedOrder(order);
    } catch {
      setFormError('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was just placed, display the streamlined dual-channel confirmation screen (WhatsApp + Screen Popup)
  if (placedOrder) {
    const { text } = generateWhatsAppMessage(placedOrder, 'placed');

    const handleOpenScreenTracker = () => {
      setCheckoutModalOpen(false);
      setActiveTrackingOrderId(placedOrder.id);
      setPlacedOrder(null);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div 
          id="checkout-success-whatsapp-card"
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200 text-left"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-[#075E54] to-teal-800 text-white p-5 sm:p-6 relative">
            <button
              onClick={handleClose}
              aria-label="Close"
              className="cursor-pointer absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-md font-bold">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
                  ⚡ Order Placed & Confirmed
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                  Order #{placedOrder.id}
                </h2>
              </div>
            </div>

            <p className="text-emerald-100 text-xs mt-1">
              Pickup Counter: <span className="font-bold text-white underline">{placedOrder.pickupCounter}</span> • Zero advance fee
            </p>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4 bg-slate-50">
            {/* Token & PIN badge */}
            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-r border-slate-100 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Pickup Token
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {placedOrder.pickupToken}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  4-Digit Counter PIN
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono tracking-wider">
                  {placedOrder.pickupPin}
                </span>
              </div>
            </div>

            {/* DUAL CHANNEL 1: WhatsApp Notifications Spotlight */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-black">1. WhatsApp Notification Updates</span>
                </div>
                <span className="text-[10px] font-bold bg-[#25D366]/20 text-[#075E54] px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>

              <p className="text-slate-700 text-xs leading-relaxed">
                Step-by-step order alerts will be dispatched directly to your WhatsApp at <strong className="text-slate-900 font-mono">{placedOrder.customerPhone}</strong>:
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span className="truncate">Store Accepted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span className="truncate">Groceries Packing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span className="truncate">Ready at Counter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
                  <span className="truncate">Handover & Paid</span>
                </div>
              </div>
            </div>

            {/* DUAL CHANNEL 2: Screen Popup Live Tracking Spotlight */}
            <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-indigo-950">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-black">2. Live Screen Tracker Popup</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  Interactive
                </span>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                Prefer watching live progress on screen? Open the animated screen popup tracker with step timer, token barcode, and counter handover details anytime.
              </p>
            </div>

            {/* Order summary info */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Payable at Counter:</span>
                <span className="font-extrabold text-base text-slate-900">₹{placedOrder.totalAmount}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Payment Mode:</span>
                <span className="font-bold text-slate-800">
                  {placedOrder.paymentMethodAtStore === 'Card'
                    ? 'Debit / Credit Card'
                    : placedOrder.paymentMethodAtStore === 'QR'
                    ? 'QR Code Scan'
                    : 'UPI'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons with dual focus */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {/* WhatsApp Button */}
              <button
                id="post-checkout-open-whatsapp-btn"
                onClick={() => openWhatsApp(placedOrder.customerPhone, text)}
                className="cursor-pointer w-full sm:flex-1 px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-all group"
              >
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span>Open WhatsApp Notifications</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Screen Popup Tracking Button */}
              <button
                id="post-checkout-open-screen-tracker-btn"
                onClick={handleOpenScreenTracker}
                className="cursor-pointer w-full sm:flex-1 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all group"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Open Screen Tracker Popup</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={handleClose}
                className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Done & Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="checkout-modal-content"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 text-left"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 sm:p-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5" />
              Store Pickup Order
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Confirm Store Pickup</h2>
            <p className="text-emerald-100 text-xs mt-1">
              Zero advance payment • Track progress on WhatsApp • Pay at counter
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="cursor-pointer p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Location & Pickup Details */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Pickup Counter</span>
              <span className="text-slate-600 font-medium">{storeConfig.pickupCounter}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{storeConfig.address}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Ready In</span>
              <span className="text-emerald-600 font-extrabold text-sm">~10 - 15 Minutes</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Quick store bag packing</span>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-left">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Details
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                id="checkout-customer-name"
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  WhatsApp Mobile Number *
                </label>
                <span className="text-[11px] text-emerald-700 font-bold">
                  📲 Live Updates Sent Here
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  +91
                </span>
                <input
                  id="checkout-customer-phone"
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                All order progress updates (Accepted, Packing, Ready to Pickup) are sent directly to your WhatsApp!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Packing Instructions (Optional)
              </label>
              <input
                id="checkout-packing-notes"
                type="text"
                placeholder="e.g. Keep bananas in separate pouch, ripe mangoes only"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Payment Method at Store (Cashless Counter) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Choice at Store Counter *
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Cashless Counter
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. QR Code */}
              <button
                type="button"
                id="payment-choice-qr"
                onClick={() => setPaymentMethod('QR')}
                className={`cursor-pointer p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'QR'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <QrCode className={`w-4 h-4 ${paymentMethod === 'QR' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {paymentMethod === 'QR' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">QR Code</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Scan &amp; pay via any app</span>
                </div>
              </button>

              {/* 2. UPI */}
              <button
                type="button"
                id="payment-choice-upi"
                onClick={() => setPaymentMethod('UPI')}
                className={`cursor-pointer p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Smartphone className={`w-4 h-4 ${paymentMethod === 'UPI' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {paymentMethod === 'UPI' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">UPI</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">GPay, PhonePe, Paytm, BHIM</span>
                </div>
              </button>

              {/* 3. Debit / Credit Card */}
              <button
                type="button"
                id="payment-choice-card"
                onClick={() => setPaymentMethod('Card')}
                className={`cursor-pointer p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <CreditCard className={`w-4 h-4 ${paymentMethod === 'Card' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {paymentMethod === 'Card' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Debit / Credit Card</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Tap / Chip &amp; PIN POS</span>
                </div>
              </button>
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pay Only At The Store Counter: </span>
              No online payment now. You will receive WhatsApp updates at each step and your 4-digit pickup PIN. Pay when you collect!
            </div>
          </div>

          {/* Amount summary & Submit */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Total Amount to Pay</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-slate-900">₹{cartTotalAmount}</span>
                {cartTotalSavings > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    Saved ₹{cartTotalSavings}
                  </span>
                )}
              </div>
            </div>

            <button
              id="confirm-pickup-order-submit-btn"
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="cursor-pointer px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isSubmitting ? 'Placing Order...' : 'Place Store Pickup Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
