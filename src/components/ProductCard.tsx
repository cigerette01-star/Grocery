import React from 'react';
import { Plus, Minus, Zap, AlertCircle, Flame } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateCartQuantity } = useStore();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = !product.inStock || product.stockCount === 0;
  const isLowStock = product.stockCount <= 5 && product.stockCount > 0 && !isOutOfStock;
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col justify-between bg-white rounded-3xl border ${
        isLowStock ? 'border-amber-200/80 shadow-2xs' : 'border-slate-100 shadow-sm'
      } hover:border-emerald-200 hover:shadow-md transition-all duration-200 p-3.5 sm:p-4 overflow-hidden ${
        isOutOfStock ? 'opacity-75 bg-slate-50/80' : ''
      }`}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-yellow-600 text-yellow-600" />
            10 MIN
          </span>
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {isLowStock && (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            <span>Only {product.stockCount} left...</span>
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'grayscale contrast-75' : ''
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
            <AlertCircle className="w-5 h-5 text-rose-400 mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <span className="text-[10px] text-slate-200">Restocking soon</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="inline-block text-[11px] font-bold text-slate-400 mb-0.5">
            {product.unit}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          {/* Prominent stock prompt on storefront display for items whose stock reduces less than 5 */}
          {isLowStock && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-[10.5px] font-extrabold text-amber-900">
              <Flame className="w-3 h-3 text-amber-600 shrink-0 fill-amber-500" />
              <span>Only {product.stockCount} left...</span>
            </div>
          )}

          {product.description && !isLowStock && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart action */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-[11px] text-slate-400 line-through font-semibold">
                  ₹{product.mrp}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold text-emerald-600">
              Save ₹{product.mrp - product.price}
            </span>
          </div>

          {/* Quantity Controls */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : quantity === 0 ? (
              <button
                id={`add-to-cart-${product.id}`}
                onClick={() => addToCart(product)}
                className="cursor-pointer px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs sm:text-sm font-black shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ADD</span>
              </button>
            ) : (
              <div 
                id={`qty-controller-${product.id}`}
                className="flex items-center rounded-xl bg-emerald-500 text-white font-black text-xs shadow-sm overflow-hidden"
              >
                <button
                  id={`qty-minus-${product.id}`}
                  onClick={() => updateCartQuantity(product.id, quantity - 1)}
                  aria-label="Decrease quantity"
                  className="cursor-pointer px-2.5 py-1.5 hover:bg-emerald-600 active:bg-emerald-700 transition-colors"
                >
                  <Minus className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="px-2 py-1 min-w-[20px] text-center text-xs font-black">
                  {quantity}
                </span>
                <button
                  id={`qty-plus-${product.id}`}
                  onClick={() => {
                    if (quantity < product.stockCount) {
                      updateCartQuantity(product.id, quantity + 1);
                    }
                  }}
                  disabled={quantity >= product.stockCount}
                  aria-label="Increase quantity"
                  className={`cursor-pointer px-2.5 py-1.5 hover:bg-emerald-600 active:bg-emerald-700 transition-colors ${
                    quantity >= product.stockCount ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
