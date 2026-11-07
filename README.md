# Les Pieds dans l'eau

Site vitrine (Next.js 16, App Router) pour "Les Pieds dans l'eau", gîtes touristiques
en bord de mer à Sainte-Anne, Guadeloupe. FR (par défaut) / EN via `app/[locale]`.

## Prérequis

- Node.js ≥ 22.12 (voir `.nvmrc`) — requis par la chaîne d'outils (vitest/vite).
- pnpm (voir `packageManager` dans `package.json`).

## Développement

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Vérifications

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm test       # tests unitaires (vitest)
pnpm test:e2e   # parcours critiques (playwright)
```

## Contenu et données

- `content/business.ts`, `content/units.ts`, `content/pricing.ts`, `content/reviews.ts` —
  données réelles extraites du site actuel (gites-sainte-anne.com). Plusieurs champs
  sont marqués `TODO` (SIRET, politique d'annulation, horaires d'arrivée/départ,
  réseaux sociaux) : à compléter avant mise en ligne.
- `content/dictionaries/{fr,en}.ts` — textes d'interface, avec quelques touches de
  créole guadeloupéen (non traduit intégralement, juste une touche de couleur locale).
- `public/images/gallery/` — photos fournies par le client, compressées sous 100 Ko
  chacune.

## Formulaire de contact

Le formulaire envoie un e-mail via Gmail SMTP (nodemailer). Variables requises en
production (voir `.env.example`) :

```
SMTP_USER=...
SMTP_APP_PASSWORD=...   # mot de passe d'application Gmail (2FA requis)
```

## Déploiement

Pas encore configuré — à faire une fois le contenu validé (voir README du dépôt
pour le choix d'hébergeur).
