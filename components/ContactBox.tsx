"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ContactBox({ artisanId }: { artisanId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login?redirect=/artisan/" + artisanId);
      return;
    }

    await supabase.from("artisan_stats_events").insert({
      artisan_id: artisanId,
      event_type: "contact_click",
    });

    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .upsert(
        { artisan_id: artisanId, client_id: userData.user.id },
        { onConflict: "artisan_id,client_id" }
      )
      .select()
      .single();

    if (convError || !conv) {
      setError("Impossible d'envoyer le message. Réessayez.");
      setSending(false);
      return;
    }

    await supabase.from("messages").insert({
      conversation_id: conv.id,
      sender_id: userData.user.id,
      content: message,
    });

    setSending(false);
    router.push("/dashboard?tab=messages");
  }

  return (
    <div className="corner-frame border border-graphite/15 bg-white p-5">
      <h3 className="font-display font-semibold text-sm mb-3">Contacter cet artisan</h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Décrivez votre projet en quelques mots…"
        rows={4}
        className="w-full border border-graphite/20 p-3 text-sm focus:outline-none focus:border-blueprint resize-none"
      />
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
      <button
        onClick={handleSend}
        disabled={sending}
        className="mt-3 w-full border border-graphite bg-graphite text-ivory py-2.5 text-sm font-medium hover:bg-graphite/90 disabled:opacity-50"
      >
        {sending ? "Envoi…" : "Envoyer le message"}
      </button>
    </div>
  );
}
