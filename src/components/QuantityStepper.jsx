import { Minus, Plus } from 'lucide-react';

/**
 * Shared QuantityStepper component.
 * Used everywhere the user can adjust item quantity before adding to cart.
 *
 * Props:
 *   qty      number   — current quantity
 *   onChange fn(n)    — called with the new quantity (can be 0 to signal "remove")
 *   min      number   — minimum value (default 1; set to 0 to allow remove via stepper)
 *   size     'sm'|'md'— visual size (default 'md')
 */
export function QuantityStepper({ qty, onChange, min = 1, size = 'md' }) {
  const btnSm  = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const iconSz = size === 'sm' ? 10 : 12;
  const textSz = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, qty - 1))}
        className={`${btnSm} rounded-full border border-gray-200 bg-white flex items-center justify-center active:scale-90 transition-all`}
      >
        <Minus size={iconSz} className="text-gray-600" />
      </button>
      <span className={`${textSz} font-bold text-gray-900 w-5 text-center tabular-nums`}>{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className={`${btnSm} rounded-full bg-[#FF9900] flex items-center justify-center active:scale-90 transition-all`}
      >
        <Plus size={iconSz} className="text-white" />
      </button>
    </div>
  );
}
