# batirproche

Annuaire géolocalisé des artisans du bâtiment. Recherche du plus proche par GPS,
espace personnel artisan (profil, photos, avis, messagerie, statistiques, statut en
ligne).

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** : base de données Postgres, authentification, stockage des photos
- **Tailwind CSS** pour le style
- Géocodage d'adresse via l'API publique et gratuite `api-adresse.data.gouv.fr`

## Mise en route

### 1. Créer le projet Supabase

1. Créez un compte sur [supabase.com](https://supabase.com) et un nouveau projet.
2. Dans l'éditeur SQL du projet, exécutez le contenu de
   `supabase/migrations/0001_init.sql`. Cela crée toutes les tables, la fonction de
   recherche géographique `nearest_artisans`, et les règles de sécurité (RLS).
3. Dans **Storage**, créez un bucket public nommé `artisan-photos`.
4. Dans **Project Settings → API**, récupérez l'URL du projet et la clé `anon public`.

### 2. Configurer le projet local

```bash
cp .env.example .env.local
# renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Le site est disponible sur `http://localhost:3000`.

### 3. Déployer

Le plus simple : connectez le dépôt à [Vercel](https://vercel.com), renseignez les
deux variables d'environnement dans les réglages du projet, et déployez. Aucune
configuration serveur supplémentaire n'est nécessaire.

## Comment ça marche

- **Recherche du plus proche** : la page d'accueil géolocalise le visiteur (ou
  géocode l'adresse tapée), puis appelle la fonction SQL `nearest_artisans` qui
  calcule la distance réelle en kilomètres via l'extension Postgres
  `earthdistance`, filtre par rayon d'intervention de chaque artisan, et trie par
  proximité.
- **Espace artisan** (`/dashboard`) : profil et description, upload de photos de
  réalisations (Supabase Storage), avis reçus, messagerie avec les clients, bascule
  en ligne / hors ligne, statistiques de vues et de contacts sur 30 jours.
- **Sécurité** : chaque table est protégée par des règles RLS — un artisan ne peut
  modifier que sa propre fiche, un client ne peut publier un avis qu'en son nom, et
  les messages ne sont visibles que par les deux participants de la conversation.

## Prochaines étapes suggérées

- Vérification d'identité des artisans (SIRET via l'API INSEE Sirene)
- Paiement de mise en avant (fiche sponsorisée dans les résultats)
- Notifications par email/SMS à la réception d'un message
- Application mobile (le schéma Supabase est directement réutilisable)
