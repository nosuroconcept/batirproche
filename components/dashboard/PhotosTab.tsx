"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Photo = { id: string; url: string; caption: string | null };

export function PhotosTab({ artisanId, initialPhotos }: { artisanId: string; initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    const path = `${artisanId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("artisan-photos")
      .upload(path, file);

    if (uploadError) {
      setError("Échec de l'envoi. Vérifiez le format (JPG/PNG, max 5 Mo).");
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("artisan-photos").getPublicUrl(path);
    const { data: newPhoto } = await supabase
      .from("artisan_photos")
      .insert({ artisan_id: artisanId, url: publicUrl.publicUrl, position: photos.length })
      .select()
      .single();

    if (newPhoto) setPhotos([...photos, newPhoto]);
    setUploading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("artisan_photos").delete().eq("id", id);
    setPhotos(photos.filter((p) => p.id !== id));
  }

  return (
    <div>
      <label className="inline-flex items-center gap-2 border border-graphite px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-graphite hover:text-ivory transition-colors">
        <i className="ti ti-upload" style={{ fontSize: 16 }} aria-hidden="true" />
        {uploading ? "Envoi…" : "Ajouter une photo"}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
      </label>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-concrete mt-6">
          Aucune photo pour l'instant. Ajoutez vos réalisations pour rassurer les clients.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-6">
          {photos.map((p) => (
            <div key={p.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? "Réalisation"} className="aspect-square object-cover w-full" />
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute top-1 right-1 bg-graphite/80 text-ivory w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer la photo"
              >
                <i className="ti ti-x" style={{ fontSize: 14 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
