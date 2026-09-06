import React from 'react';
import { 
  X, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  MapPin, 
  Store,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

export const CustomerOrdersModal: React.FC = () => {
  const {
    customerOrdersModalOpen,
    setCustomerOrdersModalOpen,
    orders,
    setActiveTrackingOrderId,
  } = useStore();

  if (!customerOrdersModalOpen) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            Ready for Pickup
          </span>
        );
      case 'packing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-3 h-3 animate-spin" />
            Packing in Bag
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Confirmed by Store
          </span>
        );
      case 'placed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-300">
            Order Placed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Picked Up & Paid
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="customer-orders-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-6 max-h-[85vh]"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                My Store Pickup Orders
              </h2>
              <p className="text-stone-400 text-xs mt-0.5">
                Status updates are sent directly to your WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={() => setCustomerOrdersModalOpen(false)}
            className="cursor-pointer p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No orders placed yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Add items to your bag and order for 10-minute store pickup with WhatsApp tracking.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const msg = generateWhatsAppMessage(order, order.status);
              return (
                <div
                  key={order.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 hover:border-emerald-500/50 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-stone-900 text-sm">
                        {order.id}
                      </span>
                      <span className="text-xs text-stone-600 font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        Token: {order.pickupToken}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Items & details */}
                  <div className="bg-white p-3 rounded-xl border border-stone-200/80 text-xs space-y-2">
                    <div className="text-stone-700 font-medium">
                      {order.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-3 text-stone-600">
                        <span className="flex items-center gap-1 font-semibold text-stone-800">
                          {order.paymentMethodAtStore === 'Card' ? (
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          ) : order.paymentMethodAtStore === 'QR' ? (
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                          )}
                          {order.paymentMethodAtStore === 'Card'
                            ? 'Card'
                            : order.paymentMethodAtStore === 'QR'
                            ? 'QR Code'
                            : order.paymentMethodAtStore === 'Cash'
                            ? 'Cash'
                            : 'UPI'}{' '}
                          at Counter
                        </span>
                        <span>•</span>
                        <span>PIN: <strong className="font-mono text-emerald-700">{order.pickupPin}</strong></span>
                      </div>
                      <span className="font-extrabold text-sm text-stone-900">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {order.pickupCounter}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCustomerOrdersModalOpen(false);
                          setActiveTrackingOrderId(order.id);
                        }}
                        className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                      >
                        <span>Screen Popup</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openWhatsApp(order.customerPhone, msg.text)}
                        className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
