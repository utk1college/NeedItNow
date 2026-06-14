export function LoadingDots({ message = 'Thinking...' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 animate-fade-in">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#FF9900] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}
