export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Note ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < full ? "ti ti-star-filled" : "ti ti-star"}
          style={{ fontSize: size, color: i < full ? "#E8A23D" : "#D8D6CE" }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
