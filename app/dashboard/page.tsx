import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  const { data: artisan } = await supabase.from("artisans").select("*").eq("id", user.id).single();

  if (!artisan) {
    redirect("/register");
  }

  const { data: photos } = await supabase
    .from("artisan_photos")
    .select("*")
    .eq("artisan_id", user.id)
    .order("position");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("artisan_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <DashboardShell
        artisan={artisan}
        photos={photos ?? []}
        reviews={reviews ?? []}
        initialTab={searchParams.tab}
      />
    </div>
  );
}
