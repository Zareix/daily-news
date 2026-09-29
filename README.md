# Daily News

Le briefing d'actualités quotidien, en site statique : **https://news.raphael-catarino.fr**

France · code &amp; informatique · cybersécurité · international, un briefing par jour, chaque
info sourcée par un lien direct.

## Comment ça marche

```
cron Hermes (09:00 Europe/Paris)
   └─ skill `daily-news-briefing` : lecture des flux RSS → rédaction du markdown
        └─ ~/.hermes/scripts/publish-briefing.mjs : commit src/content/news/<date>.md
             └─ GitHub Actions : bun install → astro build + pagefind → wrangler deploy
                  └─ Cloudflare Workers (assets statiques) → news.raphael-catarino.fr
```

Le cron poste ensuite un résumé court (le `tlDr` du frontmatter) avec le lien du jour sur Telegram.

## Structure

```
src/
  content.config.ts        schéma Zod du frontmatter (date, title, tlDr, tags, important)
  content/news/*.md        un briefing par jour, nommé <YYYY-MM-DD>.md
  layouts/Layout.astro     coquille HTML : thème clair/sombre, SEO, RSS, liens sortants
  components/BriefingCard.astro
  lib/dates.ts             formatage déterministe en Europe/Paris
  pages/
    index.astro            dernier briefing + archive groupée par mois
    briefing/[date].astro  briefing complet : sommaire, TL;DR, navigation précédent/suivant
    tags/{index,[tag]}.astro
    search.astro           recherche plein texte (index Pagefind généré au build)
    about.astro            404.astro
    rss.xml.ts
```

## Format d'un briefing

```markdown
---
date: 2026-09-29
tlDr:
  - '🇫🇷 Un point France.'
  - '💻 Un point code/tech.'
  - '🔒 Un point cybersécu, actionnable si possible.'
  - '🌍 Un point international.'
tags:
  - cybersecurite
  - cve
important: false
---

## 🇫🇷 FRANCE

### 🗳️ Titre de l'actu

Deux ou trois phrases maximum.

- **Source** : [Le Monde](https://www.lemonde.fr/...)
```

Le corps n'inclut **pas** de `# H1` : le titre est dérivé du frontmatter. Le `tlDr` alimente à la
fois la carte de la page d'accueil, l'encart « En bref » et le message Telegram.

## Commandes

```bash
bun install
bun run dev       # http://localhost:4321
bun run build     # dist/ + index Pagefind
bun run check     # astro check + tsc
bun run deploy    # wrangler deploy (nécessite d'être authentifié)
```

Node ≥ 22.12 requis (astro 7) ; le runtime de référence est Bun.

## Déploiement

Poussé sur `main` → GitHub Actions construit et déploie sur Cloudflare Workers (assets statiques,
config dans `wrangler.jsonc`). Secrets à définir dans **Settings → Secrets and variables → Actions** :

| Secret | Contenu |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | token avec la permission *Workers Scripts: Edit* sur le compte |
| `CLOUDFLARE_ACCOUNT_ID` | ID du compte Cloudflare |

Le domaine `news.raphael-catarino.fr` est rattaché au Worker via `routes[].custom_domain`, la zone
`raphael-catarino.fr` étant déjà hébergée chez Cloudflare.

## Ajouter un briefing à la main

```bash
cp src/content/news/2026-07-09.md src/content/news/2026-09-29.md
# éditer, puis commit + push
```
