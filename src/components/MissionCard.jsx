import { ShoppingCart, Clock, AlertTriangle } from 'lucide-react';
import { getProductById } from '../data/products';
import { LoadingDots } from './LoadingDots';

/**
 * MissionCard — renders a single shopping mission.
 *
 * Props:
 *   mission     NamedMission  — the mission to display
 *   onRefill    fn            — called when "Refill Now" is tapped
 *   isLoading   boolean       — shows spinner while cart is building
 *   resolvedItems array       — pre-resolved cart items (for OOS check)
 */
export function MissionCard({ mission, onRefill, isLoading = false, resolvedItems = [] }) {
  const {
    name,
    emoji,
    productIds = [],
    lastOrderedDaysAgo,
    predictedDaysUntil,
    avgIntervalDays,
  } = mission;

  const productCount = productIds.length;
  const thumbnails = productIds.slice(0, 3);
  const isOOS = resolvedItems.length === 0 && productIds.length > 0;

  // Refill urgency
  const isDueNow = predictedDaysUntil === 0;
  const isDueSoon = predictedDaysUntil > 0 && predictedDaysUntil <= 3;

  // Format last ordered
  const lastOrderedLabel =
    lastOrderedDaysAgo === 0
      ? 'Today'
      : lastOrderedDaysAgo === 1
      ? 'Yesterday'
      : `${lastOrderedDaysAgo} days ago`;

  // Format refill prediction
  const refillLabel = isDueNow
    ? 'Due Now'
    : predictedDaysUntil === 1
    ? 'Tomorrow'
    : `In ${predictedDaysUntil} days`;

  const refillColor = isDueNow
    ? 'text-red-600'
    : isDueSoon
    ? 'text-amber-600'
    : 'text-gray-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Urgency nudge banner */}
      {isDueSoon && (
        <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-100 px-4 py-2">
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Your <span className="font-semibold">{name}</span> may be due soon.
          </p>
        </div>
      )}
      {isDueNow && (
        <div className="flex items-center gap-2 bg-red-50 border-b border-red-100 px-4 py-2">
          <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">
            <span className="font-semibold">{name}</span> is overdue for a refill!
          </p>
        </div>
      )}

      <div className="p-4">
        {/* Top row — name + badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{emoji}</span>
            <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
          </div>
          <span className="flex-shrink-0 bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {productCount} items
          </span>
        </div>

        {/* Meta row — last ordered + refill prediction */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            <p className="text-xs text-gray-500">
              Last ordered: <span className="font-medium text-gray-700">{lastOrderedLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Refill:</span>
            <span className={`text-xs font-semibold ${refillColor}`}>{refillLabel}</span>
          </div>
        </div>

        {/* Refill cycle info */}
        {avgIntervalDays && (
          <p className="text-[10px] text-gray-400 mb-3">
            Every ~{avgIntervalDays} days
          </p>
        )}

        {/* Product thumbnail strip */}
        {thumbnails.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {thumbnails.map((pid) => {
              const product = getProductById(pid);
              if (!product) return null;
              const isSubstituted = resolvedItems.find(
                (r) => r.isSubstitute && r.originalProductId === pid
              );
              return (
                <div key={pid} className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-10 h-10 rounded-xl object-cover bg-gray-50 border ${
                      isSubstituted ? 'border-amber-300' : 'border-gray-100'
                    }`}
                  />
                  {isSubstituted && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-[8px] font-bold px-0.5 rounded">
                      Alt
                    </span>
                  )}
                </div>
              );
            })}
            {productCount > 3 && (
              <span className="text-xs text-gray-400 font-medium">
                +{productCount - 3} more
              </span>
            )}
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={() => !isOOS && !isLoading && onRefill(mission)}
          disabled={isOOS || isLoading}
          className={`w-full rounded-full py-2.5 text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isOOS
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#FF9900] text-white'
          }`}
        >
          {isLoading ? (
            <LoadingDots message="" />
          ) : isOOS ? (
            'Products unavailable right now'
          ) : (
            <>
              <ShoppingCart size={15} />
              Refill Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
