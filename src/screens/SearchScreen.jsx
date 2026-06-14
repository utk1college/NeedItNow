import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, X, Plus, Check, EyeOff } from 'lucide-react';
import { products } from '../data/products';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// ── Smart Presets ────────────────────────────────────────────────────────────
const SMART_PRESETS = [
  { id: 'sp1', name: 'Budget Buys', emoji: '💰', filters: { maxPrice: 100, minRating: 4 } },
  { id: 'sp2', name: 'Baby Care', emoji: '👶', filters: { category: 'baby', minRating: 4 } },
  { id: 'sp3', name: 'Healthy Picks', emoji: '🥗', filters: { maxPrice: 100, tags: ['snacks'] } },
  { id: 'sp4', name: 'Premium', emoji: '✨', filters: { minPrice: 150, minRating: 4.5 } },
  { id: 'sp5', name: 'Cleaning', emoji: '🧹', filters: { category: 'cleaning' } },
  { id: 'sp6', name: 'Quick Meals', emoji: '🍜', filters: { tags: ['instant', 'quick meal', 'noodles'] } },
];

// ── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_asc', label: 'Price: Low → High' },
  { id: 'price_desc', label: 'Price: High → Low' },
  { id: 'delivery', label: 'Fastest Delivery' },
];

// ── Category pills ───────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'health', label: 'Health' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'baby', label: 'Baby' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'party', label: 'Party' },
  { id: 'personal_care', label: 'Personal Care' },
];

export default function SearchScreen() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [query, setQuery] = useState('');
  const [activePreset, setActivePreset] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [addedIds, setAddedIds] = useState(new Set());
  const [incognito, setIncognito] = useState(false);

  // Apply a smart preset
  const handlePreset = (preset) => {
    if (activePreset?.id === preset.id) {
      // Deselect
      setActivePreset(null);
      setCategory('all');
      setMaxPrice(1000);
      return;
    }
    setActivePreset(preset);
    const f = preset.filters;
    if (f.category) setCategory(f.category);
    else setCategory('all');
    if (f.maxPrice) setMaxPrice(f.maxPrice);
    else setMaxPrice(1000);
    setShowFilters(false);
  };

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }

    // Category
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Max price
    if (maxPrice < 1000) {
      result = result.filter(p => p.price <= maxPrice);
    }

    // Min price from preset
    if (activePreset?.filters.minPrice) {
      result = result.filter(p => p.price >= activePreset.filters.minPrice);
    }

    // Tags from preset
    if (activePreset?.filters.tags) {
      const tags = activePreset.filters.tags;
      result = result.filter(p => p.tags.some(t => tags.includes(t)));
    }

    // Rating (simulated — all products shown if minRating > 0, assume all are 4+)
    // In a real app this would filter on actual rating

    // Sort
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'delivery') result.sort((a, b) => a.deliveryMins - b.deliveryMins);

    return result;
  }, [query, category, maxPrice, sort, activePreset]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    setAddedIds(prev => new Set([...prev, product.id]));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 1500);
  };

  const activeFilterCount = (category !== 'all' ? 1 : 0) + (maxPrice < 1000 ? 1 : 0) + (sort !== 'relevance' ? 1 : 0);

  return (
    <div className={`max-w-sm mx-auto min-h-screen pb-24 animate-fade-in transition-colors duration-300 ${
      incognito ? 'bg-[#1A1A2E]' : 'bg-white'
    }`}>
      {/* ── SEARCH HEADER ─────────────────────────────── */}
      <div className={`px-4 pt-10 pb-3 sticky top-0 z-50 border-b transition-colors duration-300 ${
        incognito
          ? 'bg-[#1A1A2E] border-white/10'
          : 'bg-white border-gray-100'
      }`}>
        {/* Row 1: back + search bar + filter + incognito */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all flex-shrink-0 ${
              incognito ? 'bg-white/10' : 'bg-gray-50'
            }`}
          >
            <ArrowLeft size={18} className={incognito ? 'text-white' : 'text-gray-600'} />
          </button>

          <div className={`flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${
            incognito
              ? 'bg-white/10 border-white/15'
              : 'bg-gray-50 border-gray-200'
          }`}>
            {incognito
              ? <EyeOff size={15} className="text-purple-400 flex-shrink-0" />
              : <Search size={15} className="text-gray-400 flex-shrink-0" />
            }
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={incognito ? 'Incognito search...' : 'Search products...'}
              className={`flex-1 bg-transparent text-sm focus:outline-none placeholder-opacity-60 ${
                incognito ? 'text-white placeholder-white/40' : 'text-gray-700 placeholder-gray-400'
              }`}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5">
                <X size={14} className={incognito ? 'text-white/60' : 'text-gray-400'} />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all flex-shrink-0 relative ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#FF9900]'
                : incognito
                ? 'bg-white/10 border border-white/15'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <SlidersHorizontal size={16} className={
              showFilters || activeFilterCount > 0
                ? 'text-white'
                : incognito ? 'text-white/70' : 'text-gray-500'
            } />
            {activeFilterCount > 0 && !showFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Incognito toggle */}
          <button
            onClick={() => setIncognito(v => !v)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all flex-shrink-0 ${
              incognito
                ? 'bg-purple-500 shadow-lg shadow-purple-900/40'
                : 'bg-gray-50 border border-gray-200'
            }`}
            title={incognito ? 'Exit incognito' : 'Incognito mode'}
          >
            {incognito
              ? <EyeOff size={16} className="text-white" />
              : <EyeOff size={16} className="text-gray-400" />
            }
          </button>
        </div>

        {/* Incognito banner */}
        {incognito && (
          <div className="flex items-center gap-2 mt-3 bg-purple-500/20 border border-purple-500/30 rounded-xl px-3 py-2">
            <EyeOff size={13} className="text-purple-300 flex-shrink-0" />
            <p className="text-[11px] text-purple-300 font-semibold">
              Incognito — your search isn't saved to history
            </p>
            <button
              onClick={() => setIncognito(false)}
              className="ml-auto text-[10px] text-purple-400 font-bold active:opacity-70"
            >
              Exit
            </button>
          </div>
        )}

        {/* Smart Presets chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-0.5">
          {SMART_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all active:scale-95 ${
                activePreset?.id === preset.id
                  ? 'bg-[#FF9900] text-white shadow-sm'
                  : incognito
                  ? 'bg-white/10 text-white/70 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{preset.emoji}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter panel (collapsible) */}
      {showFilters && (
        <div className={`px-4 py-4 border-b space-y-4 ${incognito ? 'bg-[#16213E] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          {/* Category */}
          <div>
            <p className={`text-xs font-semibold mb-2 ${incognito ? 'text-white/50' : 'text-gray-500'}`}>Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    category === cat.id
                      ? 'bg-[#FF9900] text-white'
                      : incognito
                      ? 'bg-white/10 text-white/70 border border-white/10'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className={`text-xs font-semibold mb-2 ${incognito ? 'text-white/50' : 'text-gray-500'}`}>Max Price: {formatPrice(maxPrice)}</p>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={e => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-[#FF9900]"
            />
            <div className={`flex justify-between text-[10px] ${incognito ? 'text-white/40' : 'text-gray-400'}`}>
              <span>₹20</span>
              <span>₹1000</span>
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className={`text-xs font-semibold mb-2 ${incognito ? 'text-white/50' : 'text-gray-500'}`}>Sort by</p>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSort(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    sort === opt.id
                      ? 'bg-[#FF9900] text-white'
                      : incognito
                      ? 'bg-white/10 text-white/70 border border-white/10'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setCategory('all'); setMaxPrice(1000); setSort('relevance'); setActivePreset(null); }}
            className="text-xs text-[#FF9900] font-semibold active:opacity-70"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <p className={`text-xs ${incognito ? 'text-white/50' : 'text-gray-500'}`}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {activePreset && <span className="text-[#FF9900] font-semibold ml-1">• {activePreset.name}</span>}
          {incognito && <span className="text-purple-400 font-semibold ml-1">• Incognito</span>}
        </p>
        {activePreset && (
          <button onClick={() => { setActivePreset(null); setCategory('all'); setMaxPrice(1000); }} className={`text-[10px] active:opacity-70 ${incognito ? 'text-white/40' : 'text-gray-400'}`}>
            Clear preset
          </button>
        )}
      </div>

      {/* Product grid */}
      <div className="px-4 grid grid-cols-2 gap-2.5">
        {filteredProducts.map(product => {
          const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
          const isAdded  = addedIds.has(product.id);
          return (
            <div key={product.id} className={`rounded-2xl p-2.5 flex flex-col border ${
              incognito
                ? 'bg-white/8 border-white/10'
                : 'bg-white border-gray-100'
            }`} style={incognito ? { backgroundColor: 'rgba(255,255,255,0.06)' } : {}}>
              <div className="relative mb-2">
                <img src={product.image} alt={product.name} className="w-full h-20 rounded-xl object-cover bg-gray-50" />
                {discount > 0 && (
                  <span className="absolute top-1 left-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {discount}% off
                  </span>
                )}
                {incognito && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-purple-500/80 rounded-full flex items-center justify-center">
                    <EyeOff size={10} className="text-white" />
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-semibold leading-tight line-clamp-2 min-h-[28px] ${incognito ? 'text-white/90' : 'text-gray-900'}`}>{product.name}</p>
              <p className={`text-[10px] mt-0.5 ${incognito ? 'text-white/40' : 'text-gray-400'}`}>{product.brand}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-sm font-bold ${incognito ? 'text-white' : 'text-gray-900'}`}>{formatPrice(product.price)}</span>
                <span className={`text-[10px] line-through ${incognito ? 'text-white/30' : 'text-gray-400'}`}>{formatPrice(product.mrp)}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-green-500 font-medium">{product.deliveryMins} min</span>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className={`mt-auto pt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold active:scale-95 transition-all flex items-center justify-center gap-1 ${
                  isAdded
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : incognito
                    ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/20'
                    : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
                }`}
              >
                {isAdded ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-4xl mb-3">🔍</p>
          <p className={`text-sm font-semibold ${incognito ? 'text-white/70' : 'text-gray-700'}`}>No products found</p>
          <p className={`text-xs text-center mt-1 ${incognito ? 'text-white/40' : 'text-gray-400'}`}>Try a different search or adjust your filters</p>
        </div>
      )}
    </div>
  );
}
