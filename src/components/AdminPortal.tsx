import React, { useState, useRef } from 'react';
import { 
  X, 
  Lock, 
  Package, 
  Boxes, 
  TrendingUp, 
  Settings, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Play, 
  ChevronRight, 
  AlertCircle, 
  Volume2, 
  VolumeX,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Check,
  MessageSquare,
  Send,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  FolderPlus,
  Flame,
  Filter
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, PaymentMethodAtStore, Product } from '../types';
import { WhatsAppDispatchModal } from './WhatsAppDispatchModal';
import { generateWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

export const AdminPortal: React.FC = () => {
  const {
    adminModalOpen,
    setAdminModalOpen,
    isAdminUnlocked,
    setIsAdminUnlocked,
    orders,
    products,
    categories,
    addCategory,
    deleteCategory,
    updateOrderStatus,
    verifyAndCollectPayment,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleStockStatus,
    storeConfig,
    updateStoreConfig,
    soundEnabled,
    setSoundEnabled,
    playChime,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'analytics' | 'settings'>('orders');

  // Order processing filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Handover modal state
  const [handoverOrder, setHandoverOrder] = useState<Order | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodAtStore>('UPI');
  const [pinError, setPinError] = useState('');

  // Print slip state
  const [slipOrder, setSlipOrder] = useState<Order | null>(null);

  // WhatsApp step completion notification modal state
  const [whatsappModalState, setWhatsappModalState] = useState<{
    isOpen: boolean;
    order: Order | null;
    step: OrderStatus | 'placed';
  }>({
    isOpen: false,
    order: null,
    step: 'confirmed',
  });

  // Inventory states
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');
  const [newCatBadge, setNewCatBadge] = useState('');
  const [catError, setCatError] = useState('');

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form for Add/Edit product
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'fruits-veg',
    price: 50,
    mrp: 60,
    unit: '1 kg',
    stockCount: 20,
    image: '',
    tag: '',
    description: '',
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState(storeConfig);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Packing checked items state per order
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});

  if (!adminModalOpen || !isAdminUnlocked) return null;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.pickupToken.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerPhone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  // Counts for status tabs
  const countPending = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;
  const countPacking = orders.filter((o) => o.status === 'packing').length;
  const countReady = orders.filter((o) => o.status === 'ready').length;
  const countCompleted = orders.filter((o) => o.status === 'completed').length;

  // Analytics calculation
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const completedOrdersList = orders.filter((o) => o.status === 'completed');
  const qrOrders = completedOrdersList.filter((o) => o.paymentMethodAtStore === 'QR');
  const upiOrders = completedOrdersList.filter((o) => o.paymentMethodAtStore === 'UPI');
  const cardOrders = completedOrdersList.filter((o) => o.paymentMethodAtStore === 'Card');
  const cashOrders = completedOrdersList.filter((o) => o.paymentMethodAtStore === 'Cash');

  const qrPercent = completedOrdersList.length ? Math.round((qrOrders.length / completedOrdersList.length) * 100) : 0;
  const upiPercent = completedOrdersList.length ? Math.round((upiOrders.length / completedOrdersList.length) * 100) : 0;
  const cardPercent = completedOrdersList.length ? Math.round((cardOrders.length / completedOrdersList.length) * 100) : 0;
  const cashPercent = completedOrdersList.length ? Math.round((cashOrders.length / completedOrdersList.length) * 100) : 0;

  // Item packing checkbox toggle
  const toggleItemChecked = (orderId: string, productId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [productId]: !prev[orderId]?.[productId],
      },
    }));
  };

  // Step transition with automatic WhatsApp message notification
  const handleStepTransitionWithWhatsApp = (order: Order, nextStatus: OrderStatus) => {
    updateOrderStatus(order.id, nextStatus);
    const updatedOrder: Order = { ...order, status: nextStatus };
    setWhatsappModalState({
      isOpen: true,
      order: updatedOrder,
      step: nextStatus,
    });
  };

  // Open Handover & Payment modal
  const openHandoverModal = (order: Order) => {
    setHandoverOrder(order);
    setEnteredPin(order.pickupPin); // Pre-fill with customer PIN for quick testing
    setSelectedPayment(order.paymentMethodAtStore === 'Cash' ? 'QR' : order.paymentMethodAtStore);
    setPinError('');
  };

  // Process Handover & Collect Payment
  const handleCompleteHandover = () => {
    if (!handoverOrder) return;
    const currentOrder = handoverOrder;
    const result = verifyAndCollectPayment(currentOrder.id, selectedPayment, enteredPin);
    if (!result.success) {
      setPinError(result.error || 'Invalid PIN');
      return;
    }
    setHandoverOrder(null);

    // Prompt WhatsApp completion message to customer
    const completedOrder: Order = {
      ...currentOrder,
      status: 'completed',
      paymentMethodAtStore: selectedPayment,
      paymentStatus: 'paid_at_counter',
    };
    setWhatsappModalState({
      isOpen: true,
      order: completedOrder,
      step: 'completed',
    });
  };

  // Process and compress product image file to base64 Data URL for multi-device sync
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setProdForm((prev) => ({ ...prev, image: compressedDataUrl }));
        } else {
          setProdForm((prev) => ({ ...prev, image: event.target?.result as string }));
        }
        setUploadingImage(false);
      };
      img.onerror = () => {
        setUploadingImage(false);
        alert('Could not process this image.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadingImage(false);
      alert('Error reading image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCatError('Category name is required');
      return;
    }
    const created = addCategory({
      name: newCatName.trim(),
      iconName: newCatIcon,
      badge: newCatBadge.trim() || undefined,
    });
    setNewCatName('');
    setNewCatBadge('');
    setCatError('');
    // Automatically select the new category for active product form
    setProdForm((prev) => ({ ...prev, category: created.id }));
    setIsCategoryModalOpen(false);
  };

  // Handle Product Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: prodForm.name.trim(),
        category: prodForm.category,
        price: Number(prodForm.price),
        mrp: Number(prodForm.mrp),
        unit: prodForm.unit.trim(),
        stockCount: Number(prodForm.stockCount),
        inStock: Number(prodForm.stockCount) > 0,
        image: prodForm.image.trim() || editingProduct.image,
        tag: prodForm.tag.trim() || undefined,
        description: prodForm.description.trim(),
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: prodForm.name.trim(),
        category: prodForm.category,
        price: Number(prodForm.price),
        mrp: Number(prodForm.mrp),
        unit: prodForm.unit.trim(),
        stockCount: Number(prodForm.stockCount),
        inStock: Number(prodForm.stockCount) > 0,
        image: prodForm.image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
        tag: prodForm.tag.trim() || undefined,
        description: prodForm.description.trim(),
      });
      setIsAddProductOpen(false);
    }

    setProdForm({
      name: '',
      category: 'fruits-veg',
      price: 50,
      mrp: 60,
      unit: '1 kg',
      stockCount: 20,
      image: '',
      tag: '',
      description: '',
    });
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      stockCount: p.stockCount,
      image: p.image,
      tag: p.tag || '',
      description: p.description || '',
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreConfig(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div 
        id="admin-portal-modal"
        className="relative w-full max-w-6xl bg-stone-50 rounded-3xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col my-4 max-h-[95vh] text-left"
      >
        {/* Top Dark Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/40">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">Admin & Staff Control Hub</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  LIVE STORE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Overseeing daily order processing, inventory & payment at store counter
              </p>
            </div>
          </div>

          {/* Top Quick Stats & Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 bg-stone-800/80 px-4 py-1.5 rounded-xl border border-stone-700 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Today's Revenue</span>
                <span className="font-extrabold text-emerald-400 text-sm">₹{totalRevenue}</span>
              </div>
              <div className="w-px h-6 bg-stone-700" />
              <div>
                <span className="text-stone-400 block text-[10px]">Active Orders</span>
                <span className="font-extrabold text-amber-400 text-sm">
                  {countPending + countPacking + countReady}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Chime sound active' : 'Sound muted'}
              className="cursor-pointer p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>

            <button
              onClick={() => setIsAdminUnlocked(false)}
              className="cursor-pointer px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>

            <button
              id="close-admin-portal-btn"
              onClick={() => setAdminModalOpen(false)}
              aria-label="Close Admin Modal"
              className="cursor-pointer p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-stone-200 px-6 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="admin-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`cursor-pointer py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Daily Order Processing</span>
              {(countPending + countPacking + countReady) > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-full">
                  {countPending + countPacking + countReady}
                </span>
              )}
            </button>

            <button
              id="admin-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`cursor-pointer py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'inventory'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Manage Inventory</span>
              <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-1.5 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            <button
              id="admin-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`cursor-pointer py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Analytics</span>
            </button>

            <button
              id="admin-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`cursor-pointer py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: ORDER PROCESSING */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
                {/* Status sub-tabs */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setOrderStatusFilter('all')}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('placed')}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === 'placed'
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    New Placed ({orders.filter((o) => o.status === 'placed').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('packing')}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === 'packing'
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    In Packing ({countPacking})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('ready')}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === 'ready'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Ready at Counter ({countReady})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('completed')}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === 'completed'
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Completed ({countCompleted})
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ID, Token, Phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Orders Grid */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-stone-800">No matching orders found</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Try switching filters or place a new test order from the customer view.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrders.map((order) => {
                    const isOrderReady = order.status === 'ready';
                    const isOrderPacking = order.status === 'packing';
                    const isOrderPlaced = order.status === 'placed';
                    const isOrderConfirmed = order.status === 'confirmed';
                    const isOrderCompleted = order.status === 'completed';

                    return (
                      <div
                        key={order.id}
                        id={`admin-order-card-${order.id}`}
                        className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all space-y-3 ${
                          isOrderReady
                            ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm'
                            : isOrderPacking
                            ? 'border-blue-300 shadow-xs'
                            : isOrderPlaced
                            ? 'border-amber-300 shadow-xs'
                            : 'border-stone-200'
                        }`}
                      >
                        {/* Top row */}
                        <div>
                          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-sm text-stone-900">
                                {order.id}
                              </span>
                              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-stone-900 text-white font-mono">
                                {order.pickupToken}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isOrderReady
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isOrderPacking
                                    ? 'bg-blue-100 text-blue-800'
                                    : isOrderPlaced
                                    ? 'bg-amber-100 text-amber-800'
                                    : isOrderCompleted
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {order.status}
                              </span>

                              <button
                                onClick={() => setSlipOrder(order)}
                                title="Print Receipt Slip"
                                className="cursor-pointer p-1 text-stone-400 hover:text-stone-700"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Customer & Payment row */}
                          <div className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-stone-900">{order.customerName}</span>
                              <span className="text-stone-500 ml-1.5">{order.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                              {order.paymentMethodAtStore === 'Card' ? (
                                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              ) : order.paymentMethodAtStore === 'QR' ? (
                                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                              )}
                              <span>
                                {order.paymentMethodAtStore === 'Card'
                                  ? 'Card'
                                  : order.paymentMethodAtStore === 'QR'
                                  ? 'QR Code'
                                  : order.paymentMethodAtStore === 'Cash'
                                  ? 'Cash'
                                  : 'UPI'}{' '}
                                at Counter
                              </span>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900 mb-2">
                              <span className="font-bold">Customer Note: </span>
                              {order.notes}
                            </div>
                          )}

                          {/* Staff Packing Checklist */}
                          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 space-y-1.5 my-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                              <span>Packing Checklist ({order.items.length} items)</span>
                              <span className="text-stone-700 font-mono">PIN: {order.pickupPin}</span>
                            </div>

                            {order.items.map((item) => {
                              const isChecked = !!checkedItems[order.id]?.[item.product.id];
                              return (
                                <label
                                  key={item.product.id}
                                  className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg cursor-pointer transition-colors ${
                                    isChecked ? 'bg-emerald-50/80 text-emerald-900' : 'hover:bg-stone-100 text-stone-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleItemChecked(order.id, item.product.id)}
                                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className={isChecked ? 'line-through text-stone-500' : 'font-medium'}>
                                      {item.product.name}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-stone-600">
                                    {item.product.unit} × {item.quantity}
                                  </span>
                                </label>
                              );
                            })}

                            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                              <span className="font-bold text-stone-700">Total Bill Payable</span>
                              <span className="font-extrabold text-sm text-stone-900">
                                ₹{order.totalAmount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Action Buttons with WhatsApp Notifications */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                          <span className="text-[10px] text-stone-500">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* WhatsApp Direct Action Button */}
                            <button
                              type="button"
                              onClick={() => setWhatsappModalState({ isOpen: true, order, step: order.status })}
                              className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] font-bold text-xs border border-[#25D366]/30 flex items-center gap-1.5 transition-all"
                              title="Send WhatsApp update to customer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>WhatsApp</span>
                            </button>

                            {isOrderPlaced && (
                              <button
                                onClick={() => handleStepTransitionWithWhatsApp(order, 'confirmed')}
                                className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                              >
                                <span>Accept Order</span>
                                <span className="text-[10px] opacity-80">(WhatsApp)</span>
                              </button>
                            )}

                            {(isOrderPlaced || isOrderConfirmed) && (
                              <button
                                onClick={() => handleStepTransitionWithWhatsApp(order, 'packing')}
                                className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                              >
                                <span>Start Packing</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isOrderPacking && (
                              <button
                                onClick={() => handleStepTransitionWithWhatsApp(order, 'ready')}
                                className="cursor-pointer px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Mark Ready at Counter</span>
                              </button>
                            )}

                            {isOrderReady && (
                              <button
                                onClick={() => openHandoverModal(order)}
                                className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 animate-pulse"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify PIN & Handover</span>
                              </button>
                            )}

                            {isOrderCompleted && (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-xl">
                                <Check className="w-3.5 h-3.5" />
                                <span>Completed & Paid</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Inventory Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  onClick={() => setStockFilter('all')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    stockFilter === 'all' ? 'bg-white border-emerald-500 shadow-sm' : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <span className="text-[11px] font-bold text-stone-500 block">Total Grocery SKUs</span>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">{products.length}</div>
                  <span className="text-[10px] text-stone-400 font-medium">All registered items</span>
                </div>

                <div 
                  onClick={() => setStockFilter('all')}
                  className="cursor-pointer p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 shadow-2xs transition-all"
                >
                  <span className="text-[11px] font-bold text-emerald-700 block">In Stock</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                    {products.filter((p) => p.inStock && p.stockCount > 0).length}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Available for order</span>
                </div>

                {/* Reflected Low Stock (< 5) Metric Card */}
                <div 
                  id="admin-low-stock-filter-card"
                  onClick={() => setStockFilter((prev) => prev === 'low_stock' ? 'all' : 'low_stock')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    stockFilter === 'low_stock'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/30 shadow-sm'
                      : 'bg-gradient-to-br from-amber-50/60 to-orange-50/40 border-amber-200/90 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-900 block flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      Low Stock (&lt; 5 Qty)
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                      Alert
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
                    {products.filter((p) => p.stockCount <= 5 && p.stockCount > 0).length}
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold block">
                    {products.filter((p) => p.stockCount <= 5 && p.stockCount > 0).length > 0
                      ? 'Click to filter low stock'
                      : 'All stock healthy (≥5)'}
                  </span>
                </div>

                <div 
                  onClick={() => setStockFilter((prev) => prev === 'out_of_stock' ? 'all' : 'out_of_stock')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    stockFilter === 'out_of_stock'
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400/30 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <span className="text-[11px] font-bold text-rose-700 block">Out of Stock (0)</span>
                  <div className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">
                    {products.filter((p) => !p.inStock || p.stockCount === 0).length}
                  </div>
                  <span className="text-[10px] text-rose-600 font-medium">Needs replenishment</span>
                </div>
              </div>

              {/* Low Stock Warning Banner */}
              {products.filter((p) => p.stockCount <= 5 && p.stockCount > 0).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-amber-900">
                        Low Stock Alert: {products.filter((p) => p.stockCount <= 5 && p.stockCount > 0).length} items have less than 5 units left!
                      </h4>
                      <p className="text-[11px] text-amber-700">
                        Storefront is showing prompts ('Only X left...') to customers for these items.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStockFilter('low_stock')}
                    className="cursor-pointer text-xs font-black text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    View Low Stock ({products.filter((p) => p.stockCount <= 5 && p.stockCount > 0).length})
                  </button>
                </div>
              )}

              {/* Inventory Header Controls */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-60 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search items, tags..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={inventoryCategory}
                    onChange={(e) => setInventoryCategory(e.target.value)}
                    className="cursor-pointer px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Stock Level Filter */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="cursor-pointer px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
                  >
                    <option value="all">All Stock Status</option>
                    <option value="low_stock">⚠️ Low Stock (&lt; 5 left)</option>
                    <option value="out_of_stock">❌ Out of Stock (0)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  {/* Category Management Button */}
                  <button
                    id="admin-manage-categories-btn"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="cursor-pointer px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-stone-600" />
                    <span>+ Add Category</span>
                  </button>

                  {/* Add Product Button */}
                  <button
                    id="admin-add-product-btn"
                    onClick={() => {
                      setEditingProduct(null);
                      setProdForm({
                        name: '',
                        category: categories.find((c) => c.id !== 'all')?.id || 'fruits-veg',
                        price: 40,
                        mrp: 50,
                        unit: '1 kg',
                        stockCount: 25,
                        image: '',
                        tag: 'FRESH',
                        description: '',
                      });
                      setIsAddProductOpen(true);
                    }}
                    className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Grocery Item</span>
                  </button>
                </div>
              </div>

              {/* Products Table/Cards */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Item Details</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price / MRP</th>
                        <th className="py-3 px-3">Store Stock Qty</th>
                        <th className="py-3 px-3">Stock Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter((p) => {
                          const matchCat = inventoryCategory === 'all' || p.category === inventoryCategory;
                          const matchQuery =
                            p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            (p.tag && p.tag.toLowerCase().includes(inventorySearch.toLowerCase()));
                          let matchStock = true;
                          if (stockFilter === 'low_stock') {
                            matchStock = p.stockCount <= 5 && p.stockCount > 0;
                          } else if (stockFilter === 'out_of_stock') {
                            matchStock = !p.inStock || p.stockCount === 0;
                          }
                          return matchCat && matchQuery && matchStock;
                        })
                        .map((product) => {
                          const isLowStock = product.stockCount <= 5 && product.stockCount > 0;
                          const isZeroStock = !product.inStock || product.stockCount === 0;
                          return (
                            <tr
                              key={product.id}
                              className={`transition-colors ${
                                isLowStock
                                  ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                  : isZeroStock
                                  ? 'bg-rose-50/30 hover:bg-rose-50/60'
                                  : 'hover:bg-stone-50/70'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/80 shadow-2xs"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <span className="font-bold text-stone-900 block">
                                      {product.name}
                                    </span>
                                    <span className="text-[11px] text-stone-500">
                                      {product.unit} {product.tag ? `• ${product.tag}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-700 text-[11px] capitalize">
                                  {categories.find((c) => c.id === product.category)?.name || product.category}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <div>
                                  <span className="font-extrabold text-stone-900">₹{product.price}</span>
                                  <span className="text-stone-400 line-through text-[10px] ml-1.5">
                                    ₹{product.mrp}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => updateStock(product.id, product.stockCount - 1)}
                                      className="cursor-pointer w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm"
                                    >
                                      -
                                    </button>
                                    <span
                                      className={`w-9 text-center font-bold font-mono text-sm ${
                                        isLowStock ? 'text-amber-700' : isZeroStock ? 'text-rose-600' : 'text-stone-800'
                                      }`}
                                    >
                                      {product.stockCount}
                                    </span>
                                    <button
                                      onClick={() => updateStock(product.id, product.stockCount + 1)}
                                      className="cursor-pointer w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm"
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Low stock indication in Admin Portal */}
                                  {isLowStock && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md self-start">
                                      <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                                      Only {product.stockCount} left (Low Qty)
                                    </span>
                                  )}
                                  {isZeroStock && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded-md self-start">
                                      <AlertCircle className="w-3 h-3 text-rose-600" />
                                      Out of Stock (0)
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <button
                                  onClick={() => toggleStockStatus(product.id)}
                                  className={`cursor-pointer px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                                    product.inStock && product.stockCount > 0
                                      ? isLowStock
                                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                >
                                  {product.inStock && product.stockCount > 0
                                    ? isLowStock
                                      ? `Low (${product.stockCount})`
                                      : 'In Stock'
                                    : 'Out of Stock'}
                                </button>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditProductClick(product)}
                                    className="cursor-pointer p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(product.id)}
                                    className="cursor-pointer p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALES ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-xs text-stone-500 font-semibold block">Total Revenue Today</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">₹{totalRevenue}</div>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    From in-store pickup orders
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-xs text-stone-500 font-semibold block">Completed Pickups</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">{completedOrdersList.length}</div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    {orders.length} total orders received
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-xs text-stone-500 font-semibold block">Avg Fulfillment Turnaround</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">8.4 mins</div>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                    ⚡ 10-minute SLA met
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-xs text-stone-500 font-semibold block">Payment Split (Store Counter)</span>
                  <div className="text-sm font-extrabold text-stone-900 mt-1">
                    QR: {qrPercent}% • UPI: {upiPercent}% • Card: {cardPercent}%
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                    100% Cashless Storefront
                  </span>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Payment Method Breakdown at Pickup Counter
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-stone-800">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        QR Code Scan at Desk
                      </span>
                      <span>{qrOrders.length} orders ({qrPercent}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${qrPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-stone-800">
                        <Smartphone className="w-4 h-4 text-purple-600" />
                        UPI App Payment (GPay, PhonePe, Paytm)
                      </span>
                      <span>{upiOrders.length} orders ({upiPercent}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${upiPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-stone-800">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Debit / Credit Card POS Terminal Tap
                      </span>
                      <span>{cardOrders.length} orders ({cardPercent}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${cardPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Selling Groceries */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                  Top High-Demand Grocery Items
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {products.slice(0, 6).map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          ₹{item.price} • Stock: {item.stockCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900 mb-4">Store Pickup Configuration</h3>

              {settingsSaved && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Store settings updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Store Pickup Counter Label</label>
                  <input
                    type="text"
                    value={settingsForm.pickupCounter}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pickupCounter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Store Address</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Store Phone</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Store Counter UPI ID</label>
                    <input
                      type="text"
                      value={settingsForm.upiId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Top Moving Banner Announcement Ticker
                  </label>
                  <input
                    type="text"
                    value={settingsForm.announcementTicker}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, announcementTicker: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="cursor-pointer px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* MODAL: VERIFY PIN & COMPLETE HANDOVER */}
        {handoverOrder && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    Pickup Verification
                  </div>
                  <h3 className="text-lg font-black text-stone-900">
                    Verify Customer PIN & Collect Payment
                  </h3>
                  <p className="text-xs text-stone-500">
                    Order {handoverOrder.id} • Token: <strong className="text-stone-800">{handoverOrder.pickupToken}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setHandoverOrder(null)}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* PIN Verification input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Customer 4-Digit Pickup PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="e.g. 4291"
                  className="w-full text-center tracking-widest text-2xl font-mono font-black py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                />
                <p className="text-[11px] text-stone-500 mt-1 text-center">
                  Order PIN for this customer is: <strong className="font-mono text-emerald-700">{handoverOrder.pickupPin}</strong>
                </p>
              </div>

              {/* Payment collected method */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Confirm Payment Collected at Store Counter
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('QR')}
                    className={`cursor-pointer p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedPayment === 'QR'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment('UPI')}
                    className={`cursor-pointer p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedPayment === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>UPI App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment('Card')}
                    className={`cursor-pointer p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedPayment === 'Card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Card POS</span>
                  </button>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-baseline text-xs">
                <span className="font-bold text-stone-600">Amount Collected:</span>
                <span className="text-base font-black text-stone-900">₹{handoverOrder.totalAmount}</span>
              </div>

              <button
                onClick={handleCompleteHandover}
                className="cursor-pointer w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Handover & Payment</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {(isAddProductOpen || editingProduct) && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">
                  {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farm Fresh Alphonso Mangoes"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700">Category *</label>
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        New Category
                      </button>
                    </div>
                    <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none text-xs font-semibold capitalize"
                    >
                      {categories.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.badge ? `(${c.badge})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Unit / Weight *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500 g, 1 Litre, 1 Pack"
                      value={prodForm.unit}
                      onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      value={prodForm.mrp}
                      onChange={(e) => setProdForm({ ...prodForm, mrp: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Store Stock Qty *</label>
                    <input
                      type="number"
                      required
                      value={prodForm.stockCount}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, stockCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                    />
                    {prodForm.stockCount <= 5 && prodForm.stockCount > 0 && (
                      <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                        ⚠️ Will display prompt &apos;Only {prodForm.stockCount} left...&apos;
                      </span>
                    )}
                  </div>
                </div>

                {/* Photo Upload & Sync */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    Product Photo (Upload & Sync to all users)
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative rounded-2xl border-2 border-dashed p-3.5 transition-all text-center ${
                      isDraggingImage
                        ? 'border-emerald-500 bg-emerald-50/60'
                        : prodForm.image
                        ? 'border-emerald-300 bg-stone-50/70'
                        : 'border-stone-300 hover:border-emerald-400 bg-stone-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0]);
                        }
                      }}
                    />

                    {uploadingImage ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-1.5 text-stone-500">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-bold">Compressing & optimizing image...</span>
                      </div>
                    ) : prodForm.image ? (
                      <div className="flex items-center gap-3 text-left">
                        <img
                          src={prodForm.image}
                          alt="Product preview"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-2xs bg-white shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Photo Ready &amp; Live Sync Enabled</span>
                          </div>
                          <p className="text-[10px] text-stone-500 truncate mb-2">
                            Compressed and ready to broadcast live to all customer devices.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Change Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => setProdForm((prev) => ({ ...prev, image: '' }))}
                              className="cursor-pointer px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="py-3 flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-0.5">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-stone-800">
                          Click to upload photo or drag &amp; drop
                        </span>
                        <span className="text-[10px] text-stone-400">
                          JPG, PNG, WebP • Auto-compressed &amp; synced to all viewers
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Or image URL input */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={prodForm.image.startsWith('data:') ? '' : prodForm.image}
                        onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] focus:border-emerald-500 outline-none text-stone-700"
                      />
                      {prodForm.image.startsWith('data:') && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                          Uploaded File Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. ⚡ FAST PICKUP, 20% OFF"
                    value={prodForm.tag}
                    onChange={(e) => setProdForm({ ...prodForm, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddProductOpen(false);
                      setEditingProduct(null);
                    }}
                    className="cursor-pointer px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                  >
                    {editingProduct ? 'Save Updates' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PRINT PICKUP SLIP */}
        {slipOrder && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-left font-mono text-xs border border-stone-300">
              <div className="flex justify-between items-start border-b border-dashed border-stone-400 pb-3">
                <div>
                  <h4 className="text-sm font-black text-stone-900 uppercase">
                    {storeConfig.name}
                  </h4>
                  <p className="text-[10px] text-stone-600">{storeConfig.pickupCounter}</p>
                  <p className="text-[10px] text-stone-600">{storeConfig.phone}</p>
                </div>
                <button
                  onClick={() => setSlipOrder(null)}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-bold">{slipOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup Token:</span>
                  <span className="font-bold text-sm">{slipOrder.pickupToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup PIN:</span>
                  <span className="font-bold">{slipOrder.pickupPin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{slipOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-bold">{slipOrder.paymentMethodAtStore} at Store</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-stone-400 py-2 space-y-1">
                {slipOrder.items.map((i) => (
                  <div key={i.product.id} className="flex justify-between">
                    <span className="truncate max-w-[170px]">{i.product.name} x{i.quantity}</span>
                    <span>₹{i.product.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL AMOUNT:</span>
                <span>₹{slipOrder.totalAmount}</span>
              </div>

              <div className="pt-2 text-center text-[10px] text-stone-500">
                Inspect items before payment • Thank you!
              </div>

              <button
                onClick={() => window.print()}
                className="cursor-pointer w-full py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Print Slip
              </button>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE & ADD CATEGORIES */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-bold uppercase mb-1">
                    <FolderPlus className="w-3 h-3 text-emerald-600" />
                    Categories Management
                  </div>
                  <h3 className="text-base font-black text-stone-900">
                    Add &amp; Manage Store Categories
                  </h3>
                  <p className="text-xs text-stone-500">
                    Categories sync live across the storefront and navigation bar for all customers.
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  Create New Category
                </h4>

                {catError && (
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{catError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Spices &amp; Seasonings, Bakery"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-emerald-500 outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Icon Style</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-emerald-500 outline-none bg-white font-medium"
                    >
                      <option value="ShoppingBag">🛍️ Shopping Bag</option>
                      <option value="Apple">🍎 Fresh Produce / Fruits</option>
                      <option value="Milk">🥛 Dairy &amp; Milk</option>
                      <option value="Cookie">🍪 Snacks &amp; Cookies</option>
                      <option value="CupSoda">🥤 Beverages &amp; Cold Drinks</option>
                      <option value="Coffee">☕ Coffee &amp; Tea</option>
                      <option value="Flame">🔥 Hot / Trending</option>
                      <option value="Sparkles">✨ Instant / Gourmet</option>
                      <option value="Wheat">🌾 Grains &amp; Flour</option>
                      <option value="Fish">🐟 Seafood</option>
                      <option value="Beef">🥩 Meat &amp; Poultry</option>
                      <option value="Salad">🥗 Greens &amp; Organic</option>
                      <option value="Package">📦 Essentials / Staples</option>
                      <option value="Utensils">🍴 Kitchen / Gourmet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Badge / Tag (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. HOT, FRESH, NEW"
                      value={newCatBadge}
                      onChange={(e) => setNewCatBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-emerald-500 outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save &amp; Activate Category</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div>
                <h4 className="text-xs font-black text-stone-700 mb-2">
                  Active Storefront Categories ({categories.length - 1})
                </h4>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-100">
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((cat) => {
                      const itemCount = products.filter((p) => p.category === cat.id).length;
                      const isDefaultCategory = [
                        'fruits-veg',
                        'dairy-bread',
                        'snacks-munchies',
                        'cold-drinks',
                        'instant-food',
                        'cleaning-essentials',
                        'tea-coffee',
                      ].includes(cat.id);

                      return (
                        <div
                          key={cat.id}
                          className="pt-1.5 first:pt-0 flex items-center justify-between py-1.5 px-2 hover:bg-stone-50 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
                              🏷️
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-stone-900">{cat.name}</span>
                                {cat.badge && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                    {cat.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-500 font-medium">
                                {itemCount} product{itemCount === 1 ? '' : 's'} assigned • ID: {cat.id}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!isDefaultCategory ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete category "${cat.name}"? Products in this category will remain in inventory.`
                                    )
                                  ) {
                                    deleteCategory(cat.id);
                                  }
                                }}
                                className="cursor-pointer p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Custom Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 font-semibold px-2 py-0.5 rounded bg-stone-100">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: WHATSAPP STEP DISPATCH */}
        <WhatsAppDispatchModal
          isOpen={whatsappModalState.isOpen}
          order={whatsappModalState.order}
          step={whatsappModalState.step}
          onClose={() => setWhatsappModalState((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
};
