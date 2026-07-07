export function OnlineBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-concrete"}`}
        aria-hidden="true"
      />
      {isOnline ? "En ligne" : "Hors ligne"}
    </span>
  );
}
