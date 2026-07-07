"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { geocodeAddress } from "@/lib/geolocation";
import { Trade } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "artisan">("client");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tradeId, setTradeId] = useState<number | "">("");
  const [address, setAddress] = useState("");
  const [siret, setSiret] = useState("");
  const [radius, setRadius] = useState(20);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("trades")
      .select("*")
      .order("label_fr")
      .then(({ data }) => setTrades((data as Trade[]) ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError || !signUpData.user) {
      setLoading(false);
      setError(signUpError?.message ?? "Inscription impossible.");
      return;
    }

    const userId = signUpData.user.id;

    await supabase.from("profiles").insert({
      id: userId,
      role,
      full_name: fullName,
    });

    if (role === "artisan") {
      if (!tradeId || !address.trim()) {
        setError("Complétez le métier et l'adresse d'intervention.");
        setLoading(false);
        return;
      }
      const geo = await geocodeAddress(address);
      if (!geo) {
        setError("Adresse introuvable, précisez la ville ou le code postal.");
        setLoading(false);
        return;
      }
      const parts = geo.label.split(" ");
      await supabase.from("artisans").insert({
        id: userId,
        company_name: companyName || fullName,
        trade_id: tradeId,
        siret: siret || null,
        address: geo.label,
        city: parts.slice(-1)[0],
        postal_code: "",
        lat: geo.lat,
        lng: geo.lng,
        service_radius_km: radius,
      });
    }

    setLoading(false);
    router.push(role === "artisan" ? "/dashboard" : "/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-1">Créer un compte</h1>
      <p className="text-sm text-concrete mb-6">
        Trouvez un artisan ou proposez vos services sur batirproche.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex-1 py-2.5 text-sm font-medium border ${
            role === "client" ? "border-blueprint text-blueprint" : "border-graphite/20"
          }`}
        >
          Je cherche un artisan
        </button>
        <button
          type="button"
          onClick={() => setRole("artisan")}
          className={`flex-1 py-2.5 text-sm font-medium border ${
            role === "artisan" ? "border-blueprint text-blueprint" : "border-graphite/20"
          }`}
        >
          Je suis artisan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
        />
        <input
          type="email"
          required
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe (6 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
        />

        {role === "artisan" && (
          <>
            <input
              type="text"
              placeholder="Nom de l'entreprise"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
            />
            <select
              required
              value={tradeId}
              onChange={(e) => setTradeId(Number(e.target.value))}
              className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
            >
              <option value="">Métier</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label_fr}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Adresse d'intervention (ville, code postal)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
            />
            <input
              type="text"
              placeholder="Numéro SIRET (optionnel)"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
            />
            <label className="block text-xs text-concrete font-mono">
              Rayon d'intervention : {radius} km
              <input
                type="range"
                min={5}
                max={80}
                step={5}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-graphite bg-graphite text-ivory py-3 text-sm font-medium hover:bg-graphite/90 disabled:opacity-50"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
