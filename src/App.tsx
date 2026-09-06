import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { MovingBanners } from './components/MovingBanners';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminPortal } from './components/AdminPortal';
import { 
  Zap, 
  Store, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  SlidersHorizontal,
  Package,
  Search,
  Sparkles
} from 'lucide-react';
const MainCatalog: React.FC = () => {
  const { products, categories, selectedCategory, searchQuery, setSearchQuery, storeConfig, orders, setActiveTrackingOrderId } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'discount') {
      const discA = a.mrp - a.price;
      const discB = b.mrp - b.price;
      return discB - discA;
    }
    return 0; // featured default
  });

  const categoryObj = categories.find((c) => c.id === selectedCategory);
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'packing' || o.status === 'ready'
  ).length;

  return (
    <main className="min-h-screen pb-20 w-full max-w-full overflow-x-hidden">
      {/* Moving Banners Section */}
      <MovingBanners />

      {/* Categories Horizontal Scroller */}
      <div className="mt-6 mb-6">
        <CategoryBar />
      </div>

      {/* Main Grocery Catalog Container */}
      <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : categoryObj
                  ? categoryObj.name
                  : 'All Groceries'}
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {sortedProducts.length} items
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fresh farm produce & household staples • Packed in ~10 mins for pickup
            </p>
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Sort by:</span>
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'discount')}
              className="cursor-pointer bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 shadow-2xs"
            >
              <option value="featured">Featured Deals</option>
              <option value="discount">Biggest Savings</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No items matched your search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for common essentials like bananas, milk, bread, maggi, chips, or mangoes.
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Store Pickup Guarantee Highlights */}
        <section className="mt-14 pt-10 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Why In-Store Pickup?
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Fastest Way To Get Your Groceries
            </h3>
            <p className="text-xs text-slate-500">
              Zero delivery markup • Zero waiting in long supermarket checkout queues
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ready in ~10 Mins</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Store staff picks and bags your fresh groceries within 10 minutes of ordering.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Pay at Store Counter</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Pay directly when picking up using UPI QR (GPay, PhonePe) or debit/credit cards.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Inspect Before Paying</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Check every fruit, vegetable, and packet at the counter before completing payment.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Express Pickup Counter</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Skip the main supermarket line! Dedicated express counter exclusively for app pickups.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer matching Vibrant Palette design */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-[11px]">
              ⚡
            </div>
            <span className="font-extrabold text-slate-800">Freshness Guaranteed • Pay at Store</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 normal-case tracking-normal">
            <span>Pickup Point: {storeConfig.pickupCounter}</span>
            <span>•</span>
            <span>Support: {storeConfig.phone}</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
        {/* Navigation & Header */}
        <Header />

        {/* Catalog and storefront */}
        <MainCatalog />

        {/* Customer Modals & Drawers */}
        <CartDrawer />
        <CheckoutModal />
        <OrderTrackingModal />
        <CustomerOrdersModal />

        {/* Admin Modals (Password Protected) */}
        <AdminAuthModal />
        <AdminPortal />
      </div>
    </StoreProvider>
  );
}
