import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  ExternalLink, 
  PhoneCall, 
  CheckCheck
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { generateWhatsAppMessage, openWhatsApp, formatPhoneForWhatsApp } from '../utils/whatsapp';

interface WhatsAppDispatchModalProps {
  order: Order | null;
  step: OrderStatus | 'placed';
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppDispatchModal: React.FC<WhatsAppDispatchModalProps> = ({
  order,
  step,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const { title, text } = generateWhatsAppMessage(order, step);
  const formattedPhone = formatPhoneForWhatsApp(order.customerPhone);

  const handleSendWhatsApp = () => {
    openWhatsApp(order.customerPhone, text);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="whatsapp-dispatch-card"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 text-left"
      >
        {/* Top Header with WhatsApp green branding */}
        <div className="bg-[#075E54] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider text-emerald-100 mb-1">
                WhatsApp Order Notification
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                {title}
              </h2>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-100 block text-[11px]">Customer:</span>
              <span className="font-bold text-white text-sm">{order.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-100 block text-[11px]">WhatsApp Phone:</span>
              <span className="font-mono font-bold text-white text-sm">+{formattedPhone}</span>
            </div>
          </div>
        </div>

        {/* Message preview area styled like WhatsApp chat */}
        <div className="p-4 sm:p-5 bg-[#EFEAE2] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              WhatsApp Message Preview
            </span>
            <button
              onClick={handleCopyMessage}
              className="cursor-pointer text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
          </div>

          {/* WhatsApp Message Bubble */}
          <div className="bg-white rounded-2xl rounded-tl-xs p-4 shadow-sm border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans relative">
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 select-all">
              {text}
            </pre>
            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-2">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Customer tracks order progress directly on WhatsApp. Clicking below will open WhatsApp Web or Desktop/Mobile app.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors text-center"
          >
            Skip for Now
          </button>

          <button
            id="whatsapp-dispatch-send-btn"
            onClick={handleSendWhatsApp}
            className="cursor-pointer w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-all group"
          >
            <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>Send WhatsApp Message to Customer</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
