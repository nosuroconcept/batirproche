// Élément signature : une réglette de cotation type "plan de chantier"
// qui matérialise visuellement la distance jusqu'à l'artisan.
export function DistanceRuler({ km }: { km: number }) {
  const filled = Math.max(2, Math.min(10, Math.round(10 - km / 3)));
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[3px] h-4" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={i < filled ? "bg-amber" : "bg-concreteLight"}
            style={{ width: 2, height: i % 3 === 0 ? 16 : 10 }}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-graphite">{km} km</span>
    </div>
  );
}
