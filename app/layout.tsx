import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BatirProche — Trouvez l'artisan le plus proche",
  description:
    "L'annuaire géolocalisé des artisans du bâtiment : maçons, électriciens, plombiers, carreleurs et plus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>
        <header className="border-b border-graphite/10 bg-ivory sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight">
              <span className="inline-block w-2.5 h-2.5 bg-amber" aria-hidden="true" />
              batirproche
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blueprint transition-colors">
                Trouver un artisan
              </Link>
              <Link href="/register" className="hover:text-blueprint transition-colors">
                Devenir artisan
              </Link>
              <Link
                href="/login"
                className="border border-graphite px-4 py-2 hover:bg-graphite hover:text-ivory transition-colors"
              >
                Connexion
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-graphite/10 mt-24">
          <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-concrete flex items-center justify-between">
            <span>batirproche — l'annuaire géolocalisé du bâtiment</span>
            <span className="font-mono text-xs">v0.1</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
