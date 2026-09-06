import { Order, OrderStatus } from '../types';

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

export function generateWhatsAppMessage(order: Order, step: OrderStatus | 'placed'): { title: string; text: string } {
  const itemsList = order.items
    .map((item) => `• ${item.product.name} (${item.product.unit}) × ${item.quantity} = ₹${item.product.price * item.quantity}`)
    .join('\n');

  switch (step) {
    case 'placed':
      return {
        title: 'Order Placed Confirmation',
        text: `🛍️ *BLINKGROCER STORE PICKUP CONFIRMATION*

Hi *${order.customerName}*,
Your order *${order.id}* has been received for *Store Pickup*!

🎫 *Pickup Token:* *${order.pickupToken}*
🔑 *Pickup Verification PIN:* *${order.pickupPin}*
📍 *Pickup Counter:* ${order.pickupCounter}
💰 *Total Payable at Store:* *₹${order.totalAmount}*
💳 *Payment Choice:* ${order.paymentMethodAtStore} (Pay via UPI QR / Card at store counter)

📦 *Items Ordered (${order.items.length}):*
${itemsList}

⚡ *All further order progress (acceptance, packing & ready-for-pickup) will be updated directly here on WhatsApp!*`,
      };

    case 'confirmed':
      return {
        title: 'Step 1: Order Accepted by Store',
        text: `✅ *BLINKGROCER ORDER UPDATE: ACCEPTED*

Hi *${order.customerName}*,
Your store pickup order *${order.id}* (Token: *${order.pickupToken}*) has been *ACCEPTED* by our store team at ${order.pickupCounter}!

📦 *Items (${order.items.length}):*
${itemsList}

💰 *Amount Due at Store:* *₹${order.totalAmount}*
💳 *Payment:* ${order.paymentMethodAtStore} at Counter

Store staff is now reviewing items and queuing your bag for fast packing. Stay tuned here on WhatsApp!`,
      };

    case 'packing':
      return {
        title: 'Step 2: Packing Groceries in Progress',
        text: `📦 *BLINKGROCER ORDER UPDATE: PACKING IN PROGRESS*

Hi *${order.customerName}*,
Great news! Our store team is now *PACKING* your fresh groceries for order *${order.id}*.

⏱️ *Estimated Ready Time:* ~5 to 10 minutes
📍 *Pickup Counter:* ${order.pickupCounter}
🎫 *Token:* *${order.pickupToken}*
🔑 *Your 4-Digit Pickup PIN:* *${order.pickupPin}*

Please make your way towards the store counter. We will notify you the instant your bag is ready!`,
      };

    case 'ready':
      return {
        title: 'Step 3: Order Packed & Ready at Counter',
        text: `🎉 *ORDER READY FOR PICKUP!*

Hi *${order.customerName}*,
Your fresh groceries for order *${order.id}* are *PACKED & READY* for collection!

📍 *Collection Point:* *${order.pickupCounter}*
🎫 *Token Number:* *${order.pickupToken}*
🔑 *Your Pickup PIN:* *${order.pickupPin}*
💰 *Bill Amount to Pay:* *₹${order.totalAmount}*
💳 *Payment Mode:* Please pay via ${order.paymentMethodAtStore} (UPI QR / Card) directly at counter.

👉 *Action:* Walk up to ${order.pickupCounter}, share your PIN *${order.pickupPin}*, inspect your items, and complete payment to take your bag!`,
      };

    case 'completed':
      return {
        title: 'Step 4: Pickup & Payment Completed',
        text: `✨ *ORDER PICKUP COMPLETED*

Hi *${order.customerName}*,
Thank you for shopping with BlinkGrocer! Your order *${order.id}* has been successfully handed over.

💰 *Amount Paid:* ₹${order.totalAmount}
💳 *Paid Via:* ${order.paymentMethodAtStore} at Store Counter
🎫 *Token:* ${order.pickupToken}

We hope you enjoy your fresh farm produce & groceries! Have a wonderful day, and see you again soon at BlinkGrocer!`,
      };

    case 'cancelled':
      return {
        title: 'Order Cancelled',
        text: `⚠️ *BLINKGROCER ORDER UPDATE: CANCELLED*

Hi *${order.customerName}*,
Your order *${order.id}* has been cancelled. No payment was charged.
For any queries, please visit ${order.pickupCounter} or call store support.`,
      };

    default:
      return {
        title: 'Order Status Update',
        text: `ℹ️ *BlinkGrocer Order Update for ${order.id}*: Status updated to ${step}.`,
      };
  }
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phone: string, message: string): void {
  const url = getWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}
