import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, Repeat, CalendarDays, Trash2 } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const TODAY = new Date(2026, 5, 14); // June 14 2026 (matches app's date context)
TODAY.setHours(0, 0, 0, 0);

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function isPast(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < TODAY;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['S','M','T','W','T','F','S'];

// ── Event type options ────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: 'birthday',    label: 'Birthday',        emoji: '🎂', color: 'bg-pink-100 text-pink-700',    ring: 'ring-pink-400' },
  { id: 'anniversary', label: 'Anniversary',     emoji: '💍', color: 'bg-red-100 text-red-700',     ring: 'ring-red-400' },
  { id: 'festival',    label: 'Festival',         emoji: '🎉', color: 'bg-orange-100 text-orange-700', ring: 'ring-orange-400' },
  { id: 'dinner',      label: 'Dinner Party',     emoji: '🍽️', color: 'bg-amber-100 text-amber-700',  ring: 'ring-amber-400' },
  { id: 'travel',      label: 'Trip / Travel',    emoji: '✈️', color: 'bg-blue-100 text-blue-700',   ring: 'ring-blue-400' },
  { id: 'school',      label: 'School / Work',    emoji: '📚', color: 'bg-indigo-100 text-indigo-700', ring: 'ring-indigo-400' },
  { id: 'health',      label: 'Health / Doctor',  emoji: '🏥', color: 'bg-green-100 text-green-700', ring: 'ring-green-400' },
  { id: 'other',       label: 'Other',            emoji: '📌', color: 'bg-gray-100 text-gray-700',   ring: 'ring-gray-400' },
];

// Recurrence options — clear friendly names
const RECURRENCE = [
  {
    id: 'annual',
    label: 'Recurring annually',
    sublabel: 'Perfect for birthdays & anniversaries',
    icon: <Repeat size={16} />,
  },
  {
    id: 'once',
    label: 'Just this time',
    sublabel: 'One-off events like trips, parties',
    icon: <CalendarDays size={16} />,
  },
];

// ── Dot strip for a calendar cell ─────────────────────────────────────────────
function EventDots({ events }) {
  if (!events || events.length === 0) return null;
  return (
    <div className="flex gap-0.5 justify-center mt-0.5">
      {events.slice(0, 3).map((ev, i) => {
        const type = EVENT_TYPES.find(t => t.id === ev.type) ?? EVENT_TYPES[7];
        return (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: dotColor(type.id) }}
          />
        );
      })}
    </div>
  );
}

function dotColor(typeId) {
  const map = {
    birthday: '#f472b6', anniversary: '#ef4444', festival: '#f97316',
    dinner: '#f59e0b', travel: '#3b82f6', school: '#6366f1',
    health: '#22c55e', other: '#9ca3af',
  };
  return map[typeId] ?? '#9ca3af';
}

// ── ADD OCCASION MODAL ────────────────────────────────────────────────────────
function AddOccasionModal({ date, onClose, onSave }) {
  const [title, setTitle]           = useState('');
  const [type, setType]             = useState('birthday');
  const [recurrence, setRecurrence] = useState('annual');

  const selectedType = EVENT_TYPES.find(t => t.id === type);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), type, recurrence, emoji: selectedType.emoji });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="max-w-sm w-full bg-white rounded-t-3xl animate-slide-up overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 60px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="px-5 pt-3 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Add Occasion</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Event name */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Occasion name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Rohan's Birthday, Mom's Anniversary..."
              className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#FF9900] rounded-2xl px-4 py-3 text-sm focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Event type */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-2xl border-2 transition-all active:scale-95 ${
                    type === t.id
                      ? 'border-[#FF9900] bg-orange-50'
                      : 'border-transparent bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-[9px] font-semibold text-gray-600 text-center leading-tight">{t.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">How often?</label>
            <div className="space-y-2">
              {RECURRENCE.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRecurrence(r.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${
                    recurrence === r.id
                      ? 'border-[#FF9900] bg-orange-50'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    recurrence === r.id ? 'bg-[#FF9900] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{r.label}</p>
                    <p className="text-[10px] text-gray-400">{r.sublabel}</p>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    recurrence === r.id ? 'border-[#FF9900] bg-[#FF9900]' : 'border-gray-300'
                  }`}>
                    {recurrence === r.id && <span className="w-2 h-2 rounded-full bg-white block" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full bg-[#FF9900] disabled:opacity-40 text-white rounded-full py-3.5 font-bold text-sm active:scale-95 transition-all"
          >
            Save Occasion
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DAY DETAIL PANEL ─────────────────────────────────────────────────────────
function DayPanel({ date, events, onClose, onAdd, onDelete, onShop, past }) {
  const isToday = sameDay(date, TODAY);
  const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="max-w-sm w-full bg-white rounded-t-3xl animate-slide-up overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 56px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

        <div className="px-5 pt-3 pb-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900">{dateStr.split(',')[0]}</h2>
              {isToday && <span className="text-[10px] bg-[#FF9900] text-white font-bold px-2 py-0.5 rounded-full">Today</span>}
              {past && <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">Past</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{dateStr.split(', ').slice(1).join(', ')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 flex-shrink-0 mt-0.5">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* All content in one scrollable flow — no inner div with fixed height */}
        <div className="px-5 pb-10">
          {/* Events on this day */}
          {events.length > 0 ? (
            <div className="space-y-2 mb-4">
              {events.map((ev, i) => {
                const type = EVENT_TYPES.find(t => t.id === ev.type) ?? EVENT_TYPES[7];
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${type.color}`}>
                    <span className="text-2xl flex-shrink-0">{ev.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium">{type.label}</span>
                        {ev.recurrence === 'annual' && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                            <Repeat size={9} /> Yearly
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!past && (
                        <button
                          onClick={() => onShop(ev, date)}
                          className="text-[10px] font-bold bg-white/70 px-2.5 py-1 rounded-full active:scale-95 text-gray-700"
                        >
                          Shop →
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(i)}
                        className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center active:scale-95"
                      >
                        <Trash2 size={12} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm text-gray-500">No occasions on this day</p>
            </div>
          )}

          {/* Add button — only for today and future */}
          {!past ? (
            <button
              onClick={onAdd}
              className="w-full flex items-center justify-center gap-2 border-2 border-[#FF9900] bg-orange-50 rounded-2xl py-4 text-sm font-bold text-[#FF9900] active:bg-orange-100 transition-all mt-2 shadow-sm"
            >
              <Plus size={18} />
              Add an occasion
            </button>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-gray-400">Cannot add occasions to past dates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — CalendarScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarScreen() {
  const navigate = useNavigate();

  // Calendar navigation state
  const [viewYear,  setViewYear]  = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());

  // Events map: dateKey → [ { title, type, recurrence, emoji } ]
  const [eventsMap, setEventsMap] = useState(() => {
    // Pre-load the hardcoded calendar events
    const map = {};
    const seeds = [
      { date: '2026-06-15', title: "Rohan's Birthday",   type: 'birthday',    recurrence: 'annual', emoji: '🎂' },
      { date: '2026-06-16', title: 'Dinner Party',        type: 'dinner',      recurrence: 'once',   emoji: '🍽️' },
      { date: '2026-06-17', title: 'Kids School Project', type: 'school',      recurrence: 'once',   emoji: '📚' },
      { date: '2026-06-18', title: 'Diwali Celebration',  type: 'festival',    recurrence: 'annual', emoji: '🎉' },
      { date: '2026-06-19', title: 'Trip to Coorg',       type: 'travel',      recurrence: 'once',   emoji: '✈️' },
    ];
    seeds.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push({ title: s.title, type: s.type, recurrence: s.recurrence, emoji: s.emoji });
    });
    return map;
  });

  // UI state
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calendar grid computation
  const { days, firstDow } = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const first = new Date(viewYear, viewMonth, 1).getDay();
    return { days: daysInMonth, firstDow: first };
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Get events for a given date (including annual repeats)
  const getEventsForDate = (date) => {
    const key = dateKey(date);
    const direct = eventsMap[key] ?? [];

    // Check annual events from other years on same month+day
    const annualFromOtherYears = [];
    Object.entries(eventsMap).forEach(([k, evs]) => {
      if (k === key) return;
      const d = parseKey(k);
      if (d.getMonth() === date.getMonth() && d.getDate() === date.getDate()) {
        evs.filter(e => e.recurrence === 'annual').forEach(e => annualFromOtherYears.push(e));
      }
    });
    return [...direct, ...annualFromOtherYears];
  };

  const addEvent = (eventData) => {
    if (!selectedDate) return;
    const key = dateKey(selectedDate);
    setEventsMap(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []), eventData],
    }));
    setShowAddModal(false);
  };

  const deleteEvent = (idx) => {
    if (!selectedDate) return;
    const key = dateKey(selectedDate);
    setEventsMap(prev => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== idx),
    }));
  };

  const handleShop = (ev) => {
    // Find or synthesise an event ID to use the existing CalendarShopping screen
    const matchId = ['ev1','ev2','ev3','ev4','ev5'].find(id => {
      const hardcoded = { ev1: 'birthday', ev2: 'dinner', ev3: 'school', ev4: 'festival', ev5: 'travel' };
      return hardcoded[id] === ev.type;
    }) ?? 'ev1';
    setSelectedDate(null);
    navigate(`/calendar/${matchId}`);
  };

  // Upcoming events (next 30 days)
  const upcoming = useMemo(() => {
    const list = [];
    for (let i = 0; i <= 30; i++) {
      const d = new Date(TODAY);
      d.setDate(d.getDate() + i);
      const evs = getEventsForDate(d);
      if (evs.length) list.push({ date: d, events: evs });
    }
    return list.slice(0, 5);
  }, [eventsMap, viewYear, viewMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedPast   = selectedDate ? isPast(selectedDate) : false;

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-24 animate-fade-in" style={{ backgroundColor: '#F7F8FC' }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div
        className="px-4 pt-10 pb-5 sticky top-0 z-30"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-white">My Calendar</h1>
            <p className="text-white/50 text-[11px]">Occasions & shopping prep</p>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-2.5">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center active:scale-95">
            <ChevronLeft size={16} className="text-white" />
          </button>
          <p className="text-white font-extrabold text-sm">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center active:scale-95">
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── CALENDAR GRID ──────────────────────────────────── */}
      <div className="mx-4 mt-4 bg-white rounded-3xl shadow-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className={`text-center py-2.5 text-[11px] font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: days }, (_, i) => {
            const day     = i + 1;
            const date    = new Date(viewYear, viewMonth, day);
            const events  = getEventsForDate(date);
            const isToday = sameDay(date, TODAY);
            const past    = isPast(date);
            const col     = (firstDow + i) % 7;
            const isSun   = col === 0;
            const isSat   = col === 6;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-start pt-1.5 pb-1 aspect-square transition-all active:scale-90 relative ${
                  past ? 'opacity-35' : ''
                } ${isToday ? 'bg-[#FF9900]/10' : ''}`}
              >
                {/* Today ring */}
                {isToday && (
                  <span className="absolute inset-1 rounded-xl border-2 border-[#FF9900] pointer-events-none" />
                )}
                <span className={`text-[12px] font-bold leading-none ${
                  isToday ? 'text-[#FF9900]'
                  : isSun  ? 'text-red-400'
                  : isSat  ? 'text-blue-500'
                  : 'text-gray-900'
                }`}>
                  {day}
                </span>
                <EventDots events={events} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LEGEND ─────────────────────────────────────────── */}
      <div className="mx-4 mt-3 flex gap-3 flex-wrap">
        {EVENT_TYPES.filter(t => ['birthday','anniversary','festival','dinner','travel'].includes(t.id)).map(t => (
          <div key={t.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor(t.id) }} />
            <span className="text-[10px] text-gray-500 font-medium">{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── UPCOMING OCCASIONS ─────────────────────────────── */}
      {upcoming.length > 0 && (
        <div className="mx-4 mt-5">
          <p className="text-sm font-bold text-gray-900 mb-3">Coming Up</p>
          <div className="space-y-2">
            {upcoming.map(({ date, events }, i) => {
              const isToday = sameDay(date, TODAY);
              const daysLeft = Math.round((date - TODAY) / 86400000);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                >
                  <span className="text-2xl flex-shrink-0">{events[0].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{events[0].title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {events.length > 1 && ` · +${events.length - 1} more`}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    isToday ? 'bg-[#FF9900] text-white' :
                    daysLeft <= 3 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isToday ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft}d`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DAY DETAIL PANEL ───────────────────────────────── */}
      {selectedDate && !showAddModal && (
        <DayPanel
          date={selectedDate}
          events={selectedEvents}
          past={selectedPast}
          onClose={() => setSelectedDate(null)}
          onAdd={() => setShowAddModal(true)}
          onDelete={deleteEvent}
          onShop={handleShop}
        />
      )}

      {/* ── ADD OCCASION MODAL ─────────────────────────────── */}
      {showAddModal && selectedDate && (
        <AddOccasionModal
          date={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSave={addEvent}
        />
      )}
    </div>
  );
}
