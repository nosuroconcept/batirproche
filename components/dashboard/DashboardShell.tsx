"use client";

import { useState } from "react";
import { OnlineToggle } from "@/components/OnlineToggle";
import { ProfileTab } from "./ProfileTab";
import { PhotosTab } from "./PhotosTab";
import { ReviewsTab } from "./ReviewsTab";
import { MessagesTab } from "./MessagesTab";
import { StatsTab } from "./StatsTab";

const TABS = [
  { id: "profile", label: "Profil", icon: "ti-id" },
  { id: "photos", label: "Photos", icon: "ti-photo" },
  { id: "reviews", label: "Avis", icon: "ti-star" },
  { id: "messages", label: "Messages", icon: "ti-message-circle" },
  { id: "stats", label: "Statistiques", icon: "ti-chart-bar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DashboardShell({
  artisan,
  photos,
  reviews,
  initialTab,
}: {
  artisan: any;
  photos: any[];
  reviews: any[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<TabId>((initialTab as TabId) ?? "profile");

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <p className="font-mono text-xs text-amberDark uppercase tracking-wide">Espace artisan</p>
          <h1 className="font-display text-2xl font-semibold mt-1">{artisan.company_name}</h1>
        </div>
        <OnlineToggle artisanId={artisan.id} initialOnline={artisan.is_online} />
      </div>

      <div className="flex gap-1 border-b border-graphite/15 mb-8 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-amber text-graphite" : "border-transparent text-concrete"
            }`}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab artisan={artisan} />}
      {tab === "photos" && <PhotosTab artisanId={artisan.id} initialPhotos={photos} />}
      {tab === "reviews" && <ReviewsTab reviews={reviews} />}
      {tab === "messages" && <MessagesTab artisanId={artisan.id} />}
      {tab === "stats" && <StatsTab artisanId={artisan.id} />}
    </div>
  );
}
