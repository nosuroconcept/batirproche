"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getBrowserPosition, geocodeAddress } from "@/lib/geolocation";
import { NearestArtisan, Trade } from "@/lib/types";
import { ArtisanCard } from "./ArtisanCard";

export function SearchPanel({ trades }: { trades: Trade[] }) {
  const [address, setAddress] = useState("");
  const [tradeSlug, setTradeSlug] = useState<string | null>(null);
  const [results, setResults] = useState<NearestArtisan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  async function runSearch(lat: number, lng: number) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("nearest_artisans", {
      search_lat: lat,
      search_lng: lng,
      trade_slug: tradeSlug,
      max_results: 30,
    });
    setLoading(false);
    if (rpcError) {
      setError("La recherche a échoué. Réessayez.");
      return;
    }
    setResults(data as NearestArtisan[]);
  }

  async function handleUseLocation() {
    setError(null);
    try {
      const pos = await getBrowserPosition();
      setLocationLabel("Votre position actuelle");
      await runSearch(pos.lat, pos.lng);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Position indisponible.");
    }
  }

  async function handleAddressSearch() {
    if (!address.trim()) return;
    setError(null);
    setLoading(true);
    const geo = await geocodeAddress(address);
    setLoading(false);
    if (!geo) {
      setError("Adresse introuvable. Précisez une ville ou un code postal.");
      return;
    }
    setLocationLabel(geo.label);
    await runSearch(geo.lat, geo.lng);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
            placeholder="Ville ou code postal"
            className="flex-1 border border-graphite/20 px-4 py-3 bg-white text-sm focus:outline-none focus:border-blueprint"
          />
          <button
            onClick={handleAddressSearch}
            className="border border-graphite px-4 py-3 text-sm font-medium hover:bg-graphite hover:text-ivory transition-colors"
          >
            Rechercher
          </button>
        </div>
        <button
          onClick={handleUseLocation}
          className="flex items-center justify-center gap-2 border border-amberDark text-amberDark px-4 py-3 text-sm font-medium hover:bg-amber hover:text-graphite hover:border-amber transition-colors"
        >
          <i className="ti ti-locate" style={{ fontSize: 16 }} aria-hidden="true" />
          Me géolocaliser
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => setTradeSlug(null)}
          className={`px-3 py-1.5 text-xs font-medium border ${
            tradeSlug === null ? "border-blueprint text-blueprint" : "border-graphite/20 text-graphite"
          }`}
        >
          Tous les métiers
        </button>
        {trades.map((t) => (
          <button
            key={t.slug}
            onClick={() => setTradeSlug(t.slug)}
            className={`px-3 py-1.5 text-xs font-medium border ${
              tradeSlug === t.slug ? "border-blueprint text-blueprint" : "border-graphite/20 text-graphite"
            }`}
          >
            {t.label_fr}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      {loading && <p className="mt-6 text-sm text-concrete font-mono">Recherche en cours…</p>}

      {results && !loading && (
        <div className="mt-8">
          <p className="text-xs text-concrete font-mono mb-4 uppercase tracking-wide">
            {results.length} artisan{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
            {locationLabel ? ` autour de ${locationLabel}` : ""}
          </p>
          {results.length === 0 ? (
            <p className="text-sm text-concrete">
              Aucun artisan disponible dans cette zone pour le moment. Élargissez la recherche ou changez de métier.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {results.map((a) => (
                <ArtisanCard key={a.id} artisan={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
