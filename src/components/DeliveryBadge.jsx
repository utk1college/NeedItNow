export function DeliveryBadge({ mins = 14 }) {
  return (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      {mins} min delivery
    </span>
  );
}
