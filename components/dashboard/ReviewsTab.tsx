import { StarRating } from "@/components/StarRating";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
};

export function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-concrete">
        Vous n'avez pas encore reçu d'avis. Ils apparaîtront ici dès qu'un client aura noté une
        prestation.
      </p>
    );
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-graphite/10">
        <span className="font-display text-3xl font-semibold">{avg.toFixed(1)}</span>
        <div>
          <StarRating rating={avg} size={16} />
          <p className="text-xs text-concrete font-mono mt-0.5">{reviews.length} avis au total</p>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-graphite/10 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{r.profiles?.full_name ?? "Client"}</span>
              <StarRating rating={r.rating} />
            </div>
            {r.comment && <p className="text-sm text-concrete mt-1">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
