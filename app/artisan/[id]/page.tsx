import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/StarRating";
import { OnlineBadge } from "@/components/OnlineBadge";
import { ContactBox } from "@/components/ContactBox";

export default async function ArtisanProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: artisan } = await supabase
    .from("artisans")
    .select("*, trades(label_fr, icon), profiles(full_name, avatar_url)")
    .eq("id", params.id)
    .single();

  if (!artisan) notFound();

  await supabase.from("artisan_stats_events").insert({
    artisan_id: params.id,
    event_type: "view",
  });

  const { data: photos } = await supabase
    .from("artisan_photos")
    .select("*")
    .eq("artisan_id", params.id)
    .order("position");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("artisan_id", params.id)
    .order("created_at", { ascending: false });

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-amberDark uppercase tracking-wide">
                {artisan.trades?.label_fr}
              </p>
              <h1 className="font-display text-3xl font-semibold mt-1 flex items-center gap-2">
                {artisan.company_name}
                {artisan.verified && (
                  <i className="ti ti-rosette-discount-check text-blueprint" style={{ fontSize: 22 }} />
                )}
              </h1>
              <p className="text-concrete mt-1">
                {artisan.city} · intervient dans un rayon de {artisan.service_radius_km} km
              </p>
            </div>
            <OnlineBadge isOnline={artisan.is_online} />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <StarRating rating={avgRating} size={18} />
            <span className="text-sm text-concrete font-mono">
              {avgRating > 0 ? avgRating.toFixed(1) : "Pas encore noté"} ({reviews?.length ?? 0} avis)
            </span>
          </div>

          {artisan.description && (
            <p className="text-sm leading-relaxed mt-6 max-w-xl">{artisan.description}</p>
          )}

          {photos && photos.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-semibold text-lg mb-3">Réalisations</h2>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.url}
                    alt={p.caption ?? "Réalisation"}
                    className="aspect-square object-cover w-full"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display font-semibold text-lg mb-4">
              Avis clients ({reviews?.length ?? 0})
            </h2>
            {!reviews || reviews.length === 0 ? (
              <p className="text-sm text-concrete">Aucun avis pour le moment.</p>
            ) : (
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
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-24 space-y-4">
            <ContactBox artisanId={artisan.id} />
            <div className="border border-graphite/15 p-4 text-xs text-concrete font-mono">
              <p>{artisan.address}</p>
              <p>{artisan.postal_code} {artisan.city}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
