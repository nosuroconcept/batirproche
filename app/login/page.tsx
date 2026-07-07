"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Identifiants incorrects.");
      return;
    }
    router.push(params.get("redirect") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-2xl font-semibold mb-1">Connexion</h1>
      <p className="text-sm text-concrete mb-8">Accédez à votre espace client ou artisan.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
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
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-graphite/20 px-4 py-3 text-sm focus:outline-none focus:border-blueprint"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-graphite bg-graphite text-ivory py-3 text-sm font-medium hover:bg-graphite/90 disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="text-xs text-concrete mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-blueprint font-medium">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
