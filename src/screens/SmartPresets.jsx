import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders, Plus, Trash2, ChevronRight, Star, DollarSign, TrendingUp } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

// Hardcoded Smart Presets with filter configurations
const DEFAULT_PRESETS = [
  {
    id: 'sp_001',
    name: 'My Monthly Atta',
    emoji: '🌾',
    description: '5kg Atta, gluten-free, 4★+',
    filters: {
      category: 'grocery',
      priceRange: { min: 200, max: 300 },
      rating: 4,
      tags: ['wheat', 'staple'],
      sort: 'price_low_to_high',
    },
    lastUsed: '2 days ago',
    matchingProducts: 2,
  },
  {
    id: 'sp_002',
    name: 'Budget Essentials',
    emoji: '💰',
    description: 'Under ₹100, must-haves, 4★+',
    filters: {
      priceRange: { min: 0, max: 100 },
      rating: 4,
      tags: ['staple', 'daily'],
      sort: 'price_low_to_high',
    },
    lastUsed: '5 days ago',
    matchingProducts: 8,
  },
  {
    id: 'sp_003',
    name: 'Healthy Snacks',
    emoji: '🥗',
    description: '₹30–80, organic, high rating',
    filters: {
      category: 'grocery',
      priceRange: { min: 30, max: 80 },
      rating: 4.5,
      tags: ['snacks', 'healthy'],
      sort: 'rating_high_to_low',
    },
    lastUsed: '1 week ago',
    matchingProducts: 5,
  },
  {
    id: 'sp_004',
    name: 'Premium Skincare',
    emoji: '✨',
    description: '₹150+, dermatologist approved',
    filters: {
      category: 'personal_care',
      priceRange: { min: 150, max: 1000 },
      rating: 4.5,
      tags: ['skincare', 'premium'],
      sort: 'rating_high_to_low',
    },
    lastUsed: '3 days ago',
    matchingProducts: 4,
  },
  {
    id: 'sp_005',
    name: 'Baby Essentials',
    emoji: '👶',
    description: 'Safe, tested, 4.5★+',
    filters: {
      category: 'baby',
      priceRange: { min: 0, max: 2000 },
      rating: 4.5,
      sort: 'rating_high_to_low',
    },
    lastUsed: '1 day ago',
    matchingProducts: 4,
  },
];

export default function SmartPresets() {
  const navigate = useNavigate();
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newPresetData, setNewPresetData] = useState({
    name: '',
    emoji: '📋',
    priceMin: 0,
    priceMax: 1000,
    rating: 3,
  });

  const handleDeletePreset = (presetId) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    setShowDeleteConfirm(null);
    if (selectedPreset?.id === presetId) setSelectedPreset(null);
  };

  const handleCreatePreset = () => {
    if (!newPresetData.name.trim()) return;
    const preset = {
      id: `sp_${Date.now()}`,
      name: newPresetData.name.trim(),
      emoji: newPresetData.emoji,
      description: `₹${newPresetData.priceMin}–${newPresetData.priceMax}, ${newPresetData.rating}★+`,
      filters: {
        priceRange: { min: newPresetData.priceMin, max: newPresetData.priceMax },
        rating: newPresetData.rating,
        sort: 'relevance',
      },
      lastUsed: 'Just now',
      matchingProducts: Math.floor(Math.random() * 10) + 1,
    };
    setPresets(prev => [preset, ...prev]);
    setNewPresetData({ name: '', emoji: '📋', priceMin: 0, priceMax: 1000, rating: 3 });
    setShowCreateModal(false);
  };

  // Detail view
  if (selectedPreset) {
    const preset = presets.find(p => p.id === selectedPreset.id);
    if (!preset) {
      setSelectedPreset(null);
      return null;
    }

    return (
      <div className="max-w-sm mx-auto min-h-screen bg-[#F3F3F3] pb-24 animate-fade-in">
        <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedPreset(null)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-all">
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-gray-900">
                {preset.emoji} {preset.name}
              </h1>
              <p className="text-xs text-gray-400">{preset.matchingProducts} products match</p>
            </div>
            <button
              onClick={() => { setShowDeleteConfirm(preset.id); setSelectedPreset(null); }}
              className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center active:scale-95 transition-all"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-3">
          {/* Filter Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Active Filters</p>
            
            {preset.filters.priceRange && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <DollarSign size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Price</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatPrice(preset.filters.priceRange.min)} – {formatPrice(preset.filters.priceRange.max)}
                </span>
              </div>
            )}

            {preset.filters.rating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Star size={14} className="text-yellow-600 fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Rating</span>
                </div>
                <span className="text-sm text-gray-600">{preset.filters.rating}★ and above</span>
              </div>
            )}

            {preset.filters.sort && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp size={14} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Sort</span>
                </div>
                <span className="text-sm text-gray-600 capitalize">{preset.filters.sort.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-sm text-green-800 font-semibold">✓ Preset ready to use</p>
            <p className="text-xs text-green-700 mt-1">Apply this preset while browsing any category to filter products instantly.</p>
          </div>
        </div>

        <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-white border-t border-gray-100 pt-3">
          <div className="max-w-sm mx-auto">
            <button
              onClick={() => setSelectedPreset(null)}
              className="w-full bg-[#FF9900] text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Sliders size={18} />
              Apply This Filter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="max-w-sm mx-auto min-h-screen bg-[#F3F3F3] pb-24 animate-fade-in">
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-all">
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Presets</h1>
              <p className="text-xs text-gray-400">Personalized filter combinations</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-9 h-9 rounded-xl bg-[#FF9900] flex items-center justify-center active:scale-95 transition-all"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset(preset)}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left hover:border-orange-200"
          >
            <div className="text-3xl flex-shrink-0">{preset.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{preset.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{preset.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                  {preset.matchingProducts} matches
                </span>
                <span className="text-[10px] text-gray-400">Last used: {preset.lastUsed}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="max-w-sm w-full bg-white rounded-t-3xl p-6 space-y-4 animate-slide-up">
            <h3 className="text-base font-bold text-gray-900">Create Smart Preset</h3>
            
            <div>
              <label className="text-xs text-gray-400 font-semibold">Preset Name</label>
              <input
                type="text"
                value={newPresetData.name}
                onChange={e => setNewPresetData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Budget Milk, Organic Veggies"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-[#FF9900]"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold">Emoji</label>
              <div className="flex gap-2 mt-1">
                {['📋', '💰', '🥗', '✨', '👶', '🏪', '🎁', '⭐'].map(e => (
                  <button
                    key={e}
                    onClick={() => setNewPresetData(prev => ({ ...prev, emoji: e }))}
                    className={`w-10 h-10 rounded-lg text-xl active:scale-95 transition-all ${
                      newPresetData.emoji === e ? 'bg-[#FF9900]/20 border-2 border-[#FF9900]' : 'bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-semibold">Min Price</label>
                <input
                  type="number"
                  value={newPresetData.priceMin}
                  onChange={e => setNewPresetData(prev => ({ ...prev, priceMin: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-[#FF9900]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold">Max Price</label>
                <input
                  type="number"
                  value={newPresetData.priceMax}
                  onChange={e => setNewPresetData(prev => ({ ...prev, priceMax: parseInt(e.target.value) || 1000 }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-[#FF9900]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold">Min Rating</label>
              <div className="flex gap-1 mt-1">
                {[3, 3.5, 4, 4.5, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setNewPresetData(prev => ({ ...prev, rating: r }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      newPresetData.rating === r ? 'bg-[#FF9900] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r}★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowCreateModal(false); setNewPresetData({ name: '', emoji: '📋', priceMin: 0, priceMax: 1000, rating: 3 }); }}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePreset}
                disabled={!newPresetData.name.trim()}
                className="flex-1 py-3 rounded-full bg-[#FF9900] text-white text-sm font-semibold active:scale-95 transition-all disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-xs mx-4 space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-gray-900">Delete Preset?</h3>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePreset(showDeleteConfirm)}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
