import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

// Hardcoded smart lists with pre-populated items
const DEFAULT_LISTS = [
  {
    id: 'list_reorder',
    name: 'Frequently Ordered',
    emoji: '🔄',
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Items you buy most often',
    items: [
      { id: 'sl_01', name: 'Amul Taaza Milk 1L', brand: 'Amul', price: 68, image: '/products/p010.jpg', qty: 2 },
      { id: 'sl_02', name: 'Britannia Good Day Cookies', brand: 'Britannia', price: 45, image: '/products/p013.jpg', qty: 1 },
      { id: 'sl_03', name: 'Tata Salt 1kg', brand: 'Tata', price: 22, image: '/products/p015.jpg', qty: 1 },
      { id: 'sl_04', name: 'Aashirvaad Atta 5kg', brand: 'Aashirvaad', price: 235, image: '/products/p009.jpg', qty: 1 },
    ],
  },
  {
    id: 'list_summer',
    name: 'Summer Essentials',
    emoji: '☀️',
    color: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    description: 'Beat the heat with these',
    items: [
      { id: 'sl_05', name: 'Glucose-D Orange 500g', brand: 'Dabur', price: 95, image: '/products/p007.jpg', qty: 1 },
      { id: 'sl_06', name: 'Thums Up 2L Bottle', brand: 'Thums Up', price: 95, image: '/products/p012.jpg', qty: 2 },
      { id: 'sl_07', name: 'Electral ORS Sachets', brand: 'Electral', price: 65, image: '/products/p004.jpg', qty: 1 },
      { id: 'sl_08', name: "Lay's Classic Salted Chips 90g", brand: "Lay's", price: 35, image: '/products/p011.jpg', qty: 2 },
      { id: 'sl_09', name: 'Dove Body Wash 250ml', brand: 'Dove', price: 199, image: '/products/p030.jpg', qty: 1 },
    ],
  },
  {
    id: 'list_diwali',
    name: 'Diwali Shopping',
    emoji: '🪔',
    color: 'bg-orange-50',
    textColor: 'text-orange-600',
    description: 'Festival of lights essentials',
    items: [
      { id: 'sl_10', name: 'Decorative Balloons Pack (30 pcs)', brand: 'Funcart', price: 149, image: '/products/p026.jpg', qty: 2 },
      { id: 'sl_11', name: "Lay's Party Pack Assorted", brand: "Lay's", price: 175, image: '/products/p028.jpg', qty: 2 },
      { id: 'sl_12', name: 'Birthday Cake Candles (24 pcs)', brand: 'Camlin', price: 45, image: '/products/p027.jpg', qty: 1 },
      { id: 'sl_13', name: 'Paper Plates (50 pcs)', brand: 'Areca', price: 120, image: '/products/p025.jpg', qty: 2 },
      { id: 'sl_14', name: 'Britannia Good Day Cookies 200g', brand: 'Britannia', price: 45, image: '/products/p013.jpg', qty: 3 },
    ],
  },
  {
    id: 'list_weekly',
    name: 'Weekly Groceries',
    emoji: '🛒',
    color: 'bg-green-50',
    textColor: 'text-green-600',
    description: 'Your weekly grocery run',
    items: [
      { id: 'sl_15', name: 'Aashirvaad Atta 5kg', brand: 'Aashirvaad', price: 235, image: '/products/p009.jpg', qty: 1 },
      { id: 'sl_16', name: 'Fortune Sunflower Oil 1L', brand: 'Fortune', price: 142, image: '/products/p014.jpg', qty: 1 },
      { id: 'sl_17', name: 'Tata Salt 1kg', brand: 'Tata', price: 22, image: '/products/p015.jpg', qty: 1 },
      { id: 'sl_18', name: 'Maggi Masala Noodles (12 pack)', brand: 'Maggi', price: 168, image: '/products/p016.jpg', qty: 1 },
      { id: 'sl_19', name: 'Amul Taaza Milk 1L', brand: 'Amul', price: 68, image: '/products/p010.jpg', qty: 2 },
    ],
  },
];

export default function SmartLists() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [lists, setLists] = useState(DEFAULT_LISTS);
  const [selectedList, setSelectedList] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleAddAllToCart = (listItems) => {
    addItems(listItems);
    navigate('/cart');
  };

  const handleRemoveItem = (listId, itemId) => {
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
    ));
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: `list_${Date.now()}`,
      name: newListName.trim(),
      emoji: '📋',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Custom list',
      items: [],
    };
    setLists(prev => [...prev, newList]);
    setNewListName('');
    setShowCreateModal(false);
  };

  const handleDeleteList = (listId) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    if (selectedList?.id === listId) setSelectedList(null);
  };

  const listTotal = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Detail view for a selected list
  if (selectedList) {
    const list = lists.find(l => l.id === selectedList.id);
    if (!list) { setSelectedList(null); return null; }

    return (
      <div className="max-w-sm mx-auto min-h-screen bg-[#F7F8FC] pb-40 animate-fade-in">
        <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedList(null)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-all">
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-gray-900">{list.emoji} {list.name}</h1>
              <p className="text-xs text-gray-400">{list.items.length} items · {formatPrice(listTotal(list.items))}</p>
            </div>
            <button
              onClick={() => handleDeleteList(list.id)}
              className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center active:scale-95 transition-all"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-2">
          {list.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No items in this list yet</p>
              <p className="text-gray-300 text-xs mt-1">Items will appear here as you shop</p>
            </div>
          ) : (
            list.items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.brand} · Qty: {item.qty}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{formatPrice(item.price * item.qty)}</p>
                </div>
                <button
                  onClick={() => handleRemoveItem(list.id, item.id)}
                  className="text-gray-300 hover:text-red-400 p-1 active:scale-95 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {list.items.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-white border-t border-gray-100 pt-3">
            <div className="max-w-sm mx-auto">
              <button
                onClick={() => handleAddAllToCart(list.items)}
                className="w-full bg-[#FF9900] text-white rounded-full py-4 font-bold text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add All to Cart · {formatPrice(listTotal(list.items))}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main list overview
  return (
    <div className="max-w-sm mx-auto min-h-screen bg-[#F7F8FC] pb-28 animate-fade-in">
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-all">
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Lists</h1>
              <p className="text-xs text-gray-400">Your saved carts for every occasion</p>
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
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setSelectedList(list)}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          >
            <div className={`w-12 h-12 rounded-2xl ${list.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{list.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{list.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{list.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-500 font-medium">{list.items.length} items</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs font-semibold text-gray-700">{formatPrice(listTotal(list.items))}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="max-w-sm w-full bg-white rounded-t-3xl p-6 space-y-4 animate-slide-up" style={{ paddingBottom: 'calc(1.5rem + 56px)' }}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-2 mb-2" />
            <h3 className="text-base font-bold text-gray-900">Create New List</h3>
            <input
              type="text"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="e.g., Holi Supplies, Exam Snacks..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9900]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowCreateModal(false); setNewListName(''); }}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="flex-1 py-3 rounded-full bg-[#FF9900] text-white text-sm font-semibold active:scale-95 transition-all disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


