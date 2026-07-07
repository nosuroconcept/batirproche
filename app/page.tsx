import { createClient } from "@/lib/supabase/server";
import { SearchPanel } from "@/components/SearchPanel";
import { Trade } from "@/lib/types";

export default async function HomePage() {
  const supabase = createClient();
  const { data: trades } = await supabase.from("trades").select("*").order("label_fr");

  return (
    <div>
      <section className="bg-graphite text-ivory bg-blueprintGrid bg-grid">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <p className="font-mono text-xs text-amber uppercase tracking-widest mb-4">
            Annuaire géolocalisé du bâtiment
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold max-w-2xl leading-tight">
            Trouvez l'artisan le plus proche de votre chantier
          </h1>
          <p className="text-concreteLight mt-4 max-w-xl">
            Maçons, électriciens, plombiers, carreleurs, menuisiers, peintres — recherchez par
            distance réelle, comparez les avis, contactez directement.
          </p>

          <div className="bg-ivory text-graphite p-6 mt-10 max-w-3xl">
            <SearchPanel trades={(trades as Trade[]) ?? []} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <i className="ti ti-map-pin text-amberDark" style={{ fontSize: 22 }} />
            <h3 className="font-display font-semibold mt-3 mb-1">Distance réelle</h3>
            <p className="text-concrete">
              Le classement se fait par distance GPS jusqu'à votre chantier, pas par ville
              approximative.
            </p>
          </div>
          <div>
            <i className="ti ti-star text-amberDark" style={{ fontSize: 22 }} />
            <h3 className="font-display font-semibold mt-3 mb-1">Avis vérifiés</h3>
            <p className="text-concrete">
              Chaque avis est laissé par un client identifié, un artisan ne peut pas noter sa
              propre fiche.
            </p>
          </div>
          <div>
            <i className="ti ti-message-circle text-amberDark" style={{ fontSize: 22 }} />
            <h3 className="font-display font-semibold mt-3 mb-1">Contact direct</h3>
            <p className="text-concrete">
              Messagerie intégrée pour échanger et fixer un rendez-vous sans quitter la
              plateforme.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
