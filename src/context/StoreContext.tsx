import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Order, CartItem, StoreConfig, OrderStatus, PaymentMethodAtStore, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STORE_CONFIG, INITIAL_CATEGORIES } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  storeConfig: StoreConfig;
  activeTrackingOrderId: string | null;
  isAdminUnlocked: boolean;
  adminModalOpen: boolean;
  customerOrdersModalOpen: boolean;
  checkoutModalOpen: boolean;
  cartDrawerOpen: boolean;
  selectedCategory: string;
  searchQuery: string;
  soundEnabled: boolean;
  
  // Setters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setActiveTrackingOrderId: (id: string | null) => void;
  setAdminModalOpen: (open: boolean) => void;
  setCustomerOrdersModalOpen: (open: boolean) => void;
  setCheckoutModalOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;

  // Cart methods
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalAmount: number;
  cartTotalSavings: number;
  cartItemCount: number;

  // Order methods
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    paymentMethodAtStore: PaymentMethodAtStore;
    notes?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  verifyAndCollectPayment: (orderId: string, paymentMethod: PaymentMethodAtStore, enteredPin?: string) => { success: boolean; error?: string };
  cancelOrder: (orderId: string, reason?: string) => void;
  
  // Inventory methods
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, stockCount: number) => void;
  toggleStockStatus: (id: string) => void;

  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => Category;
  deleteCategory: (categoryId: string) => void;
  
  // Settings & Utilities
  updateStoreConfig: (config: Partial<StoreConfig>) => void;
  playChime: (type?: 'order' | 'ready' | 'success') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Web Audio synthesizer for crisp, instant notification chimes
function playNotificationChime(type: 'order' | 'ready' | 'success' = 'order') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'order') {
      // Urgent high-pitched friendly two-tone store bell
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.12); // A5
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.start(now);
      osc1.stop(now + 0.4);
    } else if (type === 'ready') {
      // Pleasant 3-tone arpeggio for "Ready for Pickup!"
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.start(now);
      osc1.stop(now + 0.5);
    } else {
      // Soft success chime
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.setValueAtTime(1046.5, now + 0.15);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.start(now);
      osc1.stop(now + 0.45);
    }
  } catch {
    // Audio context may be restricted by browser policy before user interaction
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('blinkgrocer_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('blinkgrocer_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('blinkgrocer_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem('blinkgrocer_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.timings || parsed.timings.includes('7:00 AM') || parsed.timings.includes('All 7 Days')) {
          parsed.timings = INITIAL_STORE_CONFIG.timings;
        }
        return { ...INITIAL_STORE_CONFIG, ...parsed };
      }
      return INITIAL_STORE_CONFIG;
    } catch {
      return INITIAL_STORE_CONFIG;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('blinkgrocer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('blinkgrocer_admin_auth') === 'true';
  });

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [customerOrdersModalOpen, setCustomerOrdersModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('blinkgrocer_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('blinkgrocer_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('blinkgrocer_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('blinkgrocer_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('blinkgrocer_config', JSON.stringify(storeConfig));
  }, [storeConfig]);

  useEffect(() => {
    if (isAdminUnlocked) {
      sessionStorage.setItem('blinkgrocer_admin_auth', 'true');
    } else {
      sessionStorage.removeItem('blinkgrocer_admin_auth');
    }
  }, [isAdminUnlocked]);

  // Real-time synchronization channel between tabs / portals
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('blinkgrocer_realtime');
        channel.onmessage = (event) => {
          const { type, payload } = event.data;
          if (type === 'ORDERS_UPDATED') {
            setOrders(payload.orders);
            if (payload.action === 'NEW_ORDER' && soundEnabled) {
              playNotificationChime('order');
            } else if (payload.action === 'READY_FOR_PICKUP' && soundEnabled) {
              playNotificationChime('ready');
            }
          } else if (type === 'PRODUCTS_UPDATED') {
            setProducts(payload.products);
          } else if (type === 'CATEGORIES_UPDATED') {
            setCategories(payload.categories);
          } else if (type === 'CONFIG_UPDATED') {
            setStoreConfig(payload.config);
          }
        };
      }
    } catch {
      // Channel fallback
    }

    // Fallback: storage event listener for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blinkgrocer_orders' && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === 'blinkgrocer_products' && e.newValue) {
        try {
          setProducts(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === 'blinkgrocer_categories' && e.newValue) {
        try {
          setCategories(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [soundEnabled]);

  const broadcastOrders = useCallback((updatedOrders: Order[], action?: string) => {
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('blinkgrocer_realtime');
        channel.postMessage({ type: 'ORDERS_UPDATED', payload: { orders: updatedOrders, action } });
        channel.close();
      }
    } catch {}
  }, []);

  const broadcastProducts = useCallback((updatedProducts: Product[]) => {
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('blinkgrocer_realtime');
        channel.postMessage({ type: 'PRODUCTS_UPDATED', payload: { products: updatedProducts } });
        channel.close();
      }
    } catch {}
  }, []);

  const broadcastCategories = useCallback((updatedCategories: Category[]) => {
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('blinkgrocer_realtime');
        channel.postMessage({ type: 'CATEGORIES_UPDATED', payload: { categories: updatedCategories } });
        channel.close();
      }
    } catch {}
  }, []);

  const playChime = useCallback((type: 'order' | 'ready' | 'success' = 'order') => {
    if (soundEnabled) {
      playNotificationChime(type);
    }
  }, [soundEnabled]);

  // Cart operations with stock limit checks
  const addToCart = useCallback((product: Product) => {
    if (!product.inStock || product.stockCount <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockCount) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = item.product.stockCount;
          const cappedQty = Math.min(quantity, maxAllowed);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotalSavings = cart.reduce(
    (sum, item) => sum + Math.max(0, item.product.mrp - item.product.price) * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Place new order
  const placeOrder = useCallback(
    ({
      customerName,
      customerPhone,
      paymentMethodAtStore,
      notes,
    }: {
      customerName: string;
      customerPhone: string;
      paymentMethodAtStore: PaymentMethodAtStore;
      notes?: string;
    }): Order => {
      const randomTokenNum = Math.floor(10 + Math.random() * 90);
      const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();

      const newOrder: Order = {
        id: `BG-${randomOrderNum}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupToken: `TK-${randomTokenNum}`,
        pickupPin: randomPin,
        items: [...cart],
        totalAmount: cartTotalAmount,
        savingsAmount: cartTotalSavings,
        paymentMethodAtStore,
        paymentStatus: 'pending_at_store',
        status: 'placed',
        createdAt: new Date().toISOString(),
        pickupCounter: storeConfig.pickupCounter,
        notes: notes?.trim() || undefined,
        inventoryDeducted: false, // Item quantity will automatically reduce when order is accepted!
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date().toISOString(),
            note: 'Order placed for store pickup. Waiting for store acceptance.',
          },
        ],
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      broadcastOrders(updatedOrders, 'NEW_ORDER');

      clearCart();
      playChime('order');

      return newOrder;
    },
    [cart, cartTotalAmount, cartTotalSavings, orders, storeConfig.pickupCounter, broadcastOrders, clearCart, playChime]
  );

  // Update order status (by admin / staff)
  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus, note?: string) => {
      let actionType = '';
      if (newStatus === 'ready') actionType = 'READY_FOR_PICKUP';

      const targetOrder = orders.find((o) => o.id === orderId);
      const isAcceptedState = ['confirmed', 'packing', 'ready', 'completed'].includes(newStatus);

      // Automatically reduce inventory when order is accepted
      if (targetOrder) {
        if (isAcceptedState && !targetOrder.inventoryDeducted) {
          setProducts((prevProducts) => {
            const updated = prevProducts.map((p) => {
              const itemMatch = targetOrder.items.find((item) => item.product.id === p.id);
              if (itemMatch) {
                const newCount = Math.max(0, p.stockCount - itemMatch.quantity);
                return {
                  ...p,
                  stockCount: newCount,
                  inStock: newCount > 0,
                };
              }
              return p;
            });
            broadcastProducts(updated);
            return updated;
          });
        } else if (newStatus === 'cancelled' && targetOrder.inventoryDeducted) {
          // Restore inventory if cancelled after acceptance
          setProducts((prevProducts) => {
            const updated = prevProducts.map((p) => {
              const itemMatch = targetOrder.items.find((item) => item.product.id === p.id);
              if (itemMatch) {
                const newCount = p.stockCount + itemMatch.quantity;
                return {
                  ...p,
                  stockCount: newCount,
                  inStock: newCount > 0,
                };
              }
              return p;
            });
            broadcastProducts(updated);
            return updated;
          });
        }
      }

      const updatedOrders = orders.map((order) => {
        if (order.id !== orderId) return order;

        let noteText = note;
        if (!noteText) {
          switch (newStatus) {
            case 'confirmed':
              noteText = 'Store staff verified inventory and accepted order. Item quantity reduced from inventory.';
              break;
            case 'packing':
              noteText = 'Grocery items are currently being picked and packed into bags.';
              break;
            case 'ready':
              noteText = `Order bag packed & staged at ${order.pickupCounter}. Ready for customer pickup!`;
              break;
            case 'completed':
              noteText = `Order handed over. Payment collected via ${order.paymentMethodAtStore} at counter.`;
              break;
            case 'cancelled':
              noteText = 'Order cancelled. Reserved inventory returned to stock.';
              break;
            default:
              noteText = `Status updated to ${newStatus}`;
          }
        }

        const now = new Date().toISOString();
        const updatedHistory = [
          ...order.statusHistory,
          { status: newStatus, timestamp: now, note: noteText },
        ];

        const isDeductedNow = isAcceptedState && !order.inventoryDeducted;
        const finalInventoryDeducted =
          newStatus === 'cancelled' ? false : (order.inventoryDeducted || isDeductedNow);

        return {
          ...order,
          status: newStatus,
          inventoryDeducted: finalInventoryDeducted,
          readyAt: newStatus === 'ready' ? now : order.readyAt,
          completedAt: newStatus === 'completed' ? now : order.completedAt,
          paymentStatus: newStatus === 'completed' ? 'paid_at_counter' : order.paymentStatus,
          statusHistory: updatedHistory,
        };
      });

      setOrders(updatedOrders);
      broadcastOrders(updatedOrders, actionType);

      if (newStatus === 'ready') {
        playChime('ready');
      } else if (newStatus === 'completed') {
        playChime('success');
      }
    },
    [orders, broadcastOrders, broadcastProducts, playChime]
  );

  // Verify pickup PIN and collect payment at counter
  const verifyAndCollectPayment = useCallback(
    (orderId: string, paymentMethod: PaymentMethodAtStore, enteredPin?: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { success: false, error: 'Order not found' };

      if (enteredPin && enteredPin.trim() !== order.pickupPin) {
        return { success: false, error: 'Invalid 4-digit pickup PIN entered by customer.' };
      }

      const now = new Date().toISOString();
      const updatedOrders = orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'completed' as OrderStatus,
          paymentMethodAtStore: paymentMethod,
          paymentStatus: 'paid_at_counter' as const,
          completedAt: now,
          statusHistory: [
            ...o.statusHistory,
            {
              status: 'completed' as OrderStatus,
              timestamp: now,
              note: `Pickup PIN verified. ₹${o.totalAmount} collected via ${paymentMethod} at store counter. Handover complete.`,
            },
          ],
        };
      });

      setOrders(updatedOrders);
      broadcastOrders(updatedOrders, 'ORDER_COMPLETED');
      playChime('success');
      return { success: true };
    },
    [orders, broadcastOrders, playChime]
  );

  // Cancel order & restore inventory if previously deducted
  const cancelOrder = useCallback(
    (orderId: string, reason = 'Cancelled by store staff or customer') => {
      const orderToCancel = orders.find((o) => o.id === orderId);
      if (!orderToCancel) return;

      if (orderToCancel.inventoryDeducted) {
        setProducts((prev) => {
          const restoredProducts = prev.map((p) => {
            const item = orderToCancel.items.find((i) => i.product.id === p.id);
            if (item) {
              const newCount = p.stockCount + item.quantity;
              return { ...p, stockCount: newCount, inStock: true };
            }
            return p;
          });
          broadcastProducts(restoredProducts);
          return restoredProducts;
        });
      }

      const now = new Date().toISOString();
      const updatedOrders = orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'cancelled' as OrderStatus,
          inventoryDeducted: false,
          statusHistory: [
            ...o.statusHistory,
            { status: 'cancelled' as OrderStatus, timestamp: now, note: reason },
          ],
        };
      });

      setOrders(updatedOrders);
      broadcastOrders(updatedOrders, 'ORDER_CANCELLED');
    },
    [orders, broadcastOrders, broadcastProducts]
  );

  // Category management
  const addCategory = useCallback(
    (catData: Omit<Category, 'id'>) => {
      const slug = catData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const id = slug || `cat_${Date.now()}`;
      const newCategory: Category = {
        id,
        name: catData.name.trim(),
        iconName: catData.iconName || 'ShoppingBag',
        badge: catData.badge?.trim() || undefined,
      };
      setCategories((prev) => {
        if (prev.some((c) => c.id === id)) {
          return prev.map((c) => (c.id === id ? newCategory : c));
        }
        const updated = [...prev, newCategory];
        broadcastCategories(updated);
        return updated;
      });
      return newCategory;
    },
    [broadcastCategories]
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      if (categoryId === 'all') return;
      setCategories((prev) => {
        const updated = prev.filter((c) => c.id !== categoryId);
        broadcastCategories(updated);
        return updated;
      });
    },
    [broadcastCategories]
  );

  // Inventory modifications
  const addProduct = useCallback(
    (newProdData: Omit<Product, 'id'>) => {
      const newProduct: Product = {
        ...newProdData,
        id: `prod_${Date.now()}`,
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      broadcastProducts(updated);
    },
    [products, broadcastProducts]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setProducts(updated);
      broadcastProducts(updated);
    },
    [products, broadcastProducts]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      broadcastProducts(updated);
    },
    [products, broadcastProducts]
  );

  const updateStock = useCallback(
    (id: string, stockCount: number) => {
      const count = Math.max(0, stockCount);
      const updated = products.map((p) =>
        p.id === id ? { ...p, stockCount: count, inStock: count > 0 } : p
      );
      setProducts(updated);
      broadcastProducts(updated);
    },
    [products, broadcastProducts]
  );

  const toggleStockStatus = useCallback(
    (id: string) => {
      const updated = products.map((p) => {
        if (p.id === id) {
          const newInStock = !p.inStock;
          return {
            ...p,
            inStock: newInStock,
            stockCount: newInStock && p.stockCount === 0 ? 10 : p.stockCount,
          };
        }
        return p;
      });
      setProducts(updated);
      broadcastProducts(updated);
    },
    [products, broadcastProducts]
  );

  const updateStoreConfig = useCallback(
    (updates: Partial<StoreConfig>) => {
      setStoreConfig((prev) => {
        const next = { ...prev, ...updates };
        if ('BroadcastChannel' in window) {
          try {
            const ch = new BroadcastChannel('blinkgrocer_realtime');
            ch.postMessage({ type: 'CONFIG_UPDATED', payload: { config: next } });
            ch.close();
          } catch {}
        }
        return next;
      });
    },
    []
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        cart,
        storeConfig,
        activeTrackingOrderId,
        isAdminUnlocked,
        adminModalOpen,
        customerOrdersModalOpen,
        checkoutModalOpen,
        cartDrawerOpen,
        selectedCategory,
        searchQuery,
        soundEnabled,
        setSearchQuery,
        setSelectedCategory,
        setActiveTrackingOrderId,
        setAdminModalOpen,
        setCustomerOrdersModalOpen,
        setCheckoutModalOpen,
        setCartDrawerOpen,
        setIsAdminUnlocked,
        setSoundEnabled,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalAmount,
        cartTotalSavings,
        cartItemCount,
        placeOrder,
        updateOrderStatus,
        verifyAndCollectPayment,
        cancelOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        toggleStockStatus,
        addCategory,
        deleteCategory,
        updateStoreConfig,
        playChime,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
