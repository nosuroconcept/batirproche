"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ArtisanProfile = {
  id: string;
  company_name: string;
  description: string | null;
  city: string;
  service_radius_km: number;
  price_range: string | null;
};

export function ProfileTab({ artisan }: { artisan: ArtisanProfile }) {
  const [companyName, setCompanyName] = useState(artisan.company_name);
  const [description, setDescription] = useState(artisan.description ?? "");
  const [radius, setRadius] = useState(artisan.service_radius_km);
  const [priceRange, setPriceRange] = useState(artisan.price_range ?? "€€");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("artisans")
      .update({
        company_name: companyName,
        description,
        service_radius_km: radius,
        price_range: priceRange,
      })
      .eq("id", artisan.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label className="text-xs font-mono text-concrete uppercase">Nom de l'entreprise</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full border border-graphite/20 px-4 py-3 text-sm mt-1 focus:outline-none focus:border-blueprint"
        />
      </div>
      <div>
        <label className="text-xs font-mono text-concrete uppercase">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Présentez votre savoir-faire, vos spécialités, votre expérience…"
          className="w-full border border-graphite/20 px-4 py-3 text-sm mt-1 focus:outline-none focus:border-blueprint resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-mono text-concrete uppercase">
          Rayon d'intervention : {radius} km
        </label>
        <input
          type="range"
          min={5}
          max={80}
          step={5}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-mono text-concrete uppercase">Gamme de prix</label>
        <div className="flex gap-2 mt-1">
          {["€", "€€", "€€€"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriceRange(p)}
              className={`px-4 py-2 text-sm border ${
                priceRange === p ? "border-blueprint text-blueprint" : "border-graphite/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="border border-graphite bg-graphite text-ivory px-5 py-2.5 text-sm font-medium hover:bg-graphite/90 disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </div>
  );
}
