"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function StatsTab({ artisanId }: { artisanId: string }) {
  const [stats, setStats] = useState<{ views: number; contacts: number; phone: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    supabase
      .from("artisan_stats_events")
      .select("event_type")
      .eq("artisan_id", artisanId)
      .gte("created_at", since.toISOString())
      .then(({ data }) => {
        const events = data ?? [];
        setStats({
          views: events.filter((e) => e.event_type === "view").length,
          contacts: events.filter((e) => e.event_type === "contact_click").length,
          phone: events.filter((e) => e.event_type === "phone_click").length,
        });
      });
  }, [artisanId]);

  if (!stats) return <p className="text-sm text-concrete font-mono">Chargement…</p>;

  const cards = [
    { label: "Vues de fiche", value: stats.views, icon: "ti-eye" },
    { label: "Clics de contact", value: stats.contacts, icon: "ti-message-circle" },
    { label: "Clics téléphone", value: stats.phone, icon: "ti-phone" },
  ];
  const max = Math.max(1, ...cards.map((c) => c.value));

  return (
    <div className="max-w-lg">
      <p className="text-xs text-concrete font-mono uppercase mb-4">30 derniers jours</p>
      <div className="space-y-4">
        {cards.map((c) => (
          <div key={c.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <i className={`ti ${c.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                {c.label}
              </span>
              <span className="font-mono font-medium">{c.value}</span>
            </div>
            <div className="h-2 bg-concreteLight">
              <div className="h-2 bg-amber" style={{ width: `${(c.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
