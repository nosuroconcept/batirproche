"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function OnlineToggle({ artisanId, initialOnline }: { artisanId: string; initialOnline: boolean }) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const supabase = createClient();
    const next = !isOnline;
    const { error } = await supabase
      .from("artisans")
      .update({ is_online: next, last_seen_at: new Date().toISOString() })
      .eq("id", artisanId);
    setSaving(false);
    if (!error) setIsOnline(next);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${
        isOnline ? "border-success text-success" : "border-graphite/20 text-concrete"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-concrete"}`} aria-hidden="true" />
      {isOnline ? "Visible par les clients" : "Masqué des résultats"}
    </button>
  );
}
