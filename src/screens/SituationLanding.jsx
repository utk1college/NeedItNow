import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const QUICK_SITUATIONS = [
  { label: 'My kid has fever 🤒', category: 'Health' },
  { label: 'Guests coming in 1 hr 🏠', category: 'Hosting' },
  { label: 'Power cut essentials ⚡', category: 'Emergency' },
  { label: 'Baby supplies running low 👶', category: 'Baby' },
  { label: 'Cooking something special 🍳', category: 'Cooking' },
  { label: 'Need a quick breakfast 🥐', category: 'Food' },
  { label: 'Midnight snack run 🌙', category: 'Snacks' },
  { label: 'Office party supplies 🎉', category: 'Party' },
  { label: 'Gym session prep 💪', category: 'Fitness' },
  { label: 'Sick and need medicine 🤧', category: 'Health' },
  { label: 'Movie night setup 🍿', category: 'Snacks' },
  { label: 'Weekend grocery refill 🛒', category: 'Grocery' },
];

export default function SituationLanding() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate('/situation-checkout', { state: { situation: value.trim() } });
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen animate-fade-in flex flex-col" style={{ backgroundColor: '#F7F8FC' }}>

      {/* Hero header */}
      <div
        className="px-4 pt-10 pb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#FF9900]/10" />
        <div className="absolute right-4 top-12 w-20 h-20 rounded-full bg-white/5" />

        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-6 active:scale-95 transition-all"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
               style={{ background: 'linear-gradient(135deg,#FF9900,#FF6B00)', boxShadow: '0 4px 16px rgba(255,153,0,0.4)' }}>
            <Sparkles size={19} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-[#FF9900] font-bold uppercase tracking-widest mb-1">AI-Powered</p>
            <h1 className="font-display text-2xl font-extrabold text-white leading-tight">
              What's happening?
            </h1>
          </div>
        </div>

        {/* Input inside hero */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. my kid has fever..."
              autoFocus
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-2xl px-5 py-3.5 pr-14 text-sm focus:outline-none focus:border-[#FF9900] transition-colors backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg,#FF9900,#FF6B00)' }}
            >
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
        </form>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-4 mt-5 mb-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">or pick a situation</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Situation chips */}
      <div className="px-4 pb-24 space-y-2">
        {QUICK_SITUATIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate('/situation-checkout', { state: { situation: s.label } })}
            className="w-full flex items-center justify-between bg-white px-4 py-3.5 rounded-2xl border border-gray-100 shadow-card text-left active:scale-[0.98] transition-all hover:border-orange-200 hover:shadow-card-md"
          >
            <span className="text-sm font-semibold text-gray-900">{s.label}</span>
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ml-2">
              <ArrowRight size={12} className="text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
