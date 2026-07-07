import Link from "next/link";
import { NearestArtisan } from "@/lib/types";
import { StarRating } from "./StarRating";
import { OnlineBadge } from "./OnlineBadge";
import { DistanceRuler } from "./DistanceRuler";

export function ArtisanCard({ artisan }: { artisan: NearestArtisan }) {
  return (
    <Link
      href={`/artisan/${artisan.id}`}
      className="corner-frame block border border-graphite/15 bg-white p-5 hover:border-amber transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base">{artisan.company_name}</h3>
            {artisan.verified && (
              <i className="ti ti-rosette-discount-check text-blueprint" style={{ fontSize: 16 }} title="Vérifié" />
            )}
          </div>
          <p className="text-sm text-concrete mt-0.5">
            {artisan.trade_label} · {artisan.city}
          </p>
        </div>
        <OnlineBadge isOnline={artisan.is_online} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating rating={artisan.avg_rating} />
          <span className="text-xs text-concrete font-mono">
            {artisan.avg_rating > 0 ? artisan.avg_rating : "—"} ({artisan.review_count})
          </span>
        </div>
        <DistanceRuler km={artisan.distance_km} />
      </div>
    </Link>
  );
}
