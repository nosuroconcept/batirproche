export type NearestArtisan = {
  id: string;
  company_name: string;
  trade_label: string;
  city: string;
  lat: number;
  lng: number;
  distance_km: number;
  avg_rating: number;
  review_count: number;
  verified: boolean;
  is_online: boolean;
};

export type Trade = {
  id: number;
  slug: string;
  label_fr: string;
  icon: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client_id: string;
  profiles?: { full_name: string } | null;
};

export type ArtisanStatsSummary = {
  views_30d: number;
  contact_clicks_30d: number;
  phone_clicks_30d: number;
};
