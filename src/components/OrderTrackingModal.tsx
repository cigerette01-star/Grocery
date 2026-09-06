import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Store, 
  CreditCard, 
  QrCode, 
  Phone, 
  Copy, 
  Check, 
  AlertTriangle,
  Play,
  Share2,
  PackageCheck,
  ShoppingBag,
  Send
} from 'lucide-react';
import { OrderStatus } from '../types';
import { useStore } from '../context/StoreContext';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeTrackingOrderId,
    setActiveTrackingOrderId,
    orders,
    updateOrderStatus,
    cancelOrder,
    storeConfig,
  } = useStore();

  const [copiedPin, setCopiedPin] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!activeTrackingOrderId) return null;

  const order = orders.find((o) => o.id === activeTrackingOrderId);
  if (!order) return null;

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'placed', label: 'Order Placed', desc: 'Received at store desk' },
    { status: 'confirmed', label: 'Confirmed', desc: 'Inventory allocated' },
    { status: 'packing', label: 'Bagging & Packing', desc: 'Staff gathering items' },
    { status: 'ready', label: 'Ready for Pickup', desc: `Waiting at ${order.pickupCounter}` },
    { status: 'completed', label: 'Handed Over & Paid', desc: `Paid via ${order.paymentMethodAtStore === 'Card' ? 'Debit/Credit Card' : order.paymentMethodAtStore === 'QR' ? 'QR Code' : 'UPI'} at counter` },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'packing':
        return 2;
      case 'ready':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isReady = order.status === 'ready';
  const isCompleted = order.status === 'completed';

  const handleCopyPin = () => {
    navigator.clipboard.writeText(order.pickupPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Helper for quick simulation of staff actions from tracking modal
  const handleSimulateNextStep = () => {
    if (order.status === 'placed') {
      updateOrderStatus(order.id, 'confirmed');
    } else if (order.status === 'confirmed') {
      updateOrderStatus(order.id, 'packing');
    } else if (order.status === 'packing') {
      updateOrderStatus(order.id, 'ready');
    } else if (order.status === 'ready') {
      updateOrderStatus(order.id, 'completed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="order-tracking-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-6 max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Real-Time Order Tracking
                </h2>
                <span className="text-[10px] font-mono bg-stone-800 border border-stone-700 text-stone-300 px-2 py-0.5 rounded-full">
                  {order.id}
                </span>
              </div>
              <p className="text-stone-400 text-xs mt-0.5">
                Customer: <span className="text-stone-200 font-semibold">{order.customerName}</span> ({order.customerPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openWhatsApp(order.customerPhone, generateWhatsAppMessage(order, order.status).text)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
              title="Open WhatsApp order status update"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              id="close-tracking-modal-btn"
              onClick={() => setActiveTrackingOrderId(null)}
              className="cursor-pointer p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        {isCancelled ? (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-rose-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">This order was cancelled</h4>
              <p className="text-xs text-rose-700">Inventory has been restored. No payment was charged.</p>
            </div>
          </div>
        ) : isReady ? (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 sm:p-5 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-emerald-900">
                    Your Order is READY for Pickup!
                  </h4>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Bag is waiting at <span className="font-bold underline">{order.pickupCounter}</span>. Show your PIN and pay with {order.paymentMethodAtStore}.
                </p>
              </div>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="bg-blue-50 border-b border-blue-200 p-4 text-blue-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Order Completed & Handed Over!</h4>
              <p className="text-xs text-blue-700">
                Payment of ₹{order.totalAmount} collected via {order.paymentMethodAtStore} at counter. Thank you!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold">
                  {order.status === 'packing' ? 'Staff is Packing Your Groceries...' : 'Order Accepted & Queued for Packing'}
                </h4>
                <p className="text-[11px] text-amber-800">
                  Estimated pickup ready in <span className="font-bold">~5-8 minutes</span> at {order.pickupCounter}.
                </p>
              </div>
            </div>

            {/* Quick Demo Simulator button for evaluation */}
            <button
              onClick={handleSimulateNextStep}
              className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-all shadow-xs"
              title="Fast-forward next staff progress step"
            >
              <Play className="w-3.5 h-3.5 fill-amber-900" />
              <span>Staff Next Step</span>
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-left">
          {/* Pickup Verification Token & PIN Card */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-5 shadow-lg border border-stone-700 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Store Pickup Verification Token
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {order.pickupToken}
                  </span>
                  <div className="h-8 w-px bg-stone-700" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Pickup PIN</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 tracking-wider">
                        {order.pickupPin}
                      </span>
                      <button
                        onClick={handleCopyPin}
                        title="Copy PIN"
                        className="cursor-pointer p-1 text-stone-400 hover:text-white transition-colors"
                      >
                        {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-stone-300 text-xs mt-1">
                  Show this PIN to staff at <span className="text-white font-semibold">{order.pickupCounter}</span>
                </p>
              </div>

              {/* QR Code Graphic representation */}
              <div className="bg-white p-2.5 rounded-xl shadow-md flex flex-col items-center shrink-0">
                <svg
                  className="w-24 h-24 text-stone-900"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  {/* Stylized QR Code SVG */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="13" width="12" height="12" fill="currentColor" />
                  <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="75" y="13" width="12" height="12" fill="currentColor" />
                  <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="75" width="12" height="12" fill="currentColor" />
                  <rect x="42" y="10" width="8" height="18" fill="currentColor" />
                  <rect x="10" y="42" width="18" height="8" fill="currentColor" />
                  <rect x="42" y="42" width="16" height="16" fill="currentColor" />
                  <rect x="68" y="42" width="14" height="8" fill="currentColor" />
                  <rect x="42" y="72" width="8" height="18" fill="currentColor" />
                  <rect x="62" y="62" width="10" height="10" fill="currentColor" />
                  <rect x="80" y="72" width="12" height="12" fill="currentColor" />
                  <rect x="62" y="82" width="10" height="8" fill="currentColor" />
                </svg>
                <span className="text-[9px] font-mono font-bold text-stone-700 mt-1">
                  SCAN AT DESK
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          {!isCancelled && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Live Fulfillment Progress
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {steps.map((step, idx) => {
                  const isPassed = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  const isPending = currentStepIdx < idx;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Step node */}
                      <div
                        className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isPassed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Step content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-amber-900'
                                : isPassed
                                ? 'text-stone-900'
                                : 'text-stone-600'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Store Location & Pickup Counter Details */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Store Pickup Address
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {storeConfig.name} • {storeConfig.address}
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    {order.pickupCounter}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${storeConfig.phone}`}
                className="cursor-pointer shrink-0 p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Call Store</span>
              </a>
            </div>

            {/* In Store Payment Reminder */}
            <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>
                  Payment Method:{' '}
                  <strong className="text-stone-900">
                    {order.paymentMethodAtStore === 'Card'
                      ? 'Debit / Credit Card POS'
                      : order.paymentMethodAtStore === 'QR'
                      ? 'QR Code Scan at Counter'
                      : order.paymentMethodAtStore === 'Cash'
                      ? 'Cash at Desk'
                      : 'UPI (GPay, PhonePe, Paytm)'}
                  </strong>
                </span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                order.paymentStatus === 'paid_at_counter'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.paymentStatus === 'paid_at_counter' ? 'PAID AT STORE' : 'PAYABLE AT COUNTER'}
              </span>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Items in this bag ({order.items.length})
            </h3>
            <div className="space-y-2 border border-stone-200 rounded-xl p-3 bg-white">
              {order.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-8 h-8 rounded-md object-cover bg-stone-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block truncate max-w-[220px] sm:max-w-xs">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {item.product.unit} × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-xs">
                <span className="font-bold text-stone-800">Total Amount</span>
                <span className="text-sm font-black text-stone-900">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between gap-3">
          {order.status === 'placed' || order.status === 'confirmed' ? (
            showCancelConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 font-semibold">Cancel this pickup order?</span>
                <button
                  onClick={() => {
                    cancelOrder(order.id, 'Cancelled by customer');
                    setShowCancelConfirm(false);
                  }}
                  className="cursor-pointer px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="cursor-pointer px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-300"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="cursor-pointer text-xs text-rose-600 hover:text-rose-800 font-semibold transition-colors"
              >
                Cancel Order
              </button>
            )
          ) : (
            <div className="text-xs text-stone-500">
              Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          <button
            onClick={() => setActiveTrackingOrderId(null)}
            className="cursor-pointer px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-bold transition-all"
          >
            Close & Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
