export function AvatarPill({ user, showName = true }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: user.color }}
      >
        {user.initials}
      </div>
      {showName && (
        <span className="text-xs text-gray-500 font-medium">{user.name}</span>
      )}
    </div>
  );
}
