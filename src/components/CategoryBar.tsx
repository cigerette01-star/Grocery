import React from 'react';
import { 
  ShoppingBag, 
  Apple, 
  Milk, 
  Cookie, 
  CupSoda, 
  Flame, 
  Coffee, 
  Sparkles,
  Wheat,
  Fish,
  Beef,
  Cake,
  Salad,
  Package,
  Boxes,
  Store,
  Utensils
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products } = useStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple':
        return <Apple className="w-4 h-4" />;
      case 'Milk':
        return <Milk className="w-4 h-4" />;
      case 'Cookie':
        return <Cookie className="w-4 h-4" />;
      case 'CupSoda':
        return <CupSoda className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Wheat':
        return <Wheat className="w-4 h-4" />;
      case 'Fish':
        return <Fish className="w-4 h-4" />;
      case 'Beef':
        return <Beef className="w-4 h-4" />;
      case 'Cake':
        return <Cake className="w-4 h-4" />;
      case 'Salad':
        return <Salad className="w-4 h-4" />;
      case 'Package':
        return <Package className="w-4 h-4" />;
      case 'Boxes':
        return <Boxes className="w-4 h-4" />;
      case 'Store':
        return <Store className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getItemCount = (categoryId: string) => {
    if (categoryId === 'all') return products.length;
    return products.filter((p) => p.category === categoryId).length;
  };

  const getIconBackground = (iconName: string, isSelected: boolean) => {
    if (isSelected) return 'bg-white/20 text-white';
    switch (iconName) {
      case 'Apple':
        return 'bg-amber-100 text-amber-700';
      case 'Milk':
        return 'bg-blue-100 text-blue-700';
      case 'Cookie':
        return 'bg-orange-100 text-orange-700';
      case 'CupSoda':
        return 'bg-rose-100 text-rose-700';
      case 'Flame':
        return 'bg-red-100 text-red-700';
      case 'Coffee':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sparkles':
        return 'bg-purple-100 text-purple-700';
      case 'Wheat':
        return 'bg-amber-100 text-amber-800';
      case 'Fish':
        return 'bg-cyan-100 text-cyan-700';
      case 'Beef':
        return 'bg-rose-100 text-rose-800';
      case 'Cake':
        return 'bg-pink-100 text-pink-700';
      case 'Salad':
        return 'bg-lime-100 text-lime-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  return (
    <div id="category-selector-container" className="mx-auto max-w-7xl px-4 sm:px-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          Trending Categories
        </h3>
        <button
          onClick={() => setSelectedCategory('all')}
          className="text-xs sm:text-sm text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer transition-colors"
        >
          View All ({products.length})
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getItemCount(cat.id);
          return (
            <button
              key={cat.id}
              id={`category-btn-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer whitespace-nowrap flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                isSelected
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center ${getIconBackground(cat.iconName, isSelected)}`}>
                {getIcon(cat.iconName)}
              </span>
              <span>{cat.name}</span>
              {cat.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md uppercase tracking-wider font-extrabold ${
                  isSelected ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {cat.badge}
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
