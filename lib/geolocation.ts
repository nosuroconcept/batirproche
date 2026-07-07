export function getBrowserPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error("Position refusée. Entrez votre ville manuellement.")),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

// Géocodage d'une ville/code postal via l'API publique adresse.data.gouv.fr
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;
  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng, label: feature.properties.label };
}
