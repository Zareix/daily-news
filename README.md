# Daily News

Le briefing d'actualités quotidien, en site statique : **https://news.raphael-catarino.fr**

France · code &amp; informatique · cybersécurité · international, un briefing par jour, chaque
info sourcée par un lien direct.

## Comment ça marche

```
cron Hermes (09:00 Europe/Paris)
   └─ skill `daily-news-briefing` : lecture des flux RSS → rédaction du markdown
        └─ ~/.hermes/scripts/publish-briefing.mjs : commit src/content/news/<date>.md
             └─ Cloudflare Workers Builds (git) : install → astro build + pagefind → wrangler deploy
                  └─ Cloudflare Workers (assets statiques) → news.raphael-catarino.fr
```

Le cron poste ensuite un résumé court (le `tlDr` du frontmatter) avec le lien du jour sur Telegram.

## Non-indexation

Le site est volontairement absent des moteurs de recherche, via trois verrous complémentaires :

- `public/robots.txt` → `User-agent: *` / `Disallow: /`
- `public/_headers` → `X-Robots-Tag: noindex, nofollow` sur toutes les réponses (appliqué par
  Cloudflare Workers static assets ; le fichier n'est pas servi comme asset)
- `<meta name="robots" content="noindex, nofollow">` dans le layout

L'intégration `@astrojs/sitemap` a été retirée : un sitemap est un signal d'indexation, et son lien
avait été enlevé du pied de page. Le flux RSS reste exposé (un lecteur RSS n'est pas un moteur de
recherche) — à retirer aussi si tu veux zéro diffusion.

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

Le déploiement est branché directement sur ce dépôt depuis le **dashboard Cloudflare**
(Workers & Pages → Create → Import a repository). Cloudflare clone le repo, build et déploie à
chaque push sur `main` : aucun secret GitHub à maintenir.

Réglages à saisir à la connexion :

| Réglage | Valeur |
| --- | --- |
| Project name | `daily-news` (doit correspondre à `name` dans `wrangler.jsonc`) |
| Build command | `bun run build` |
| Deploy command | `npx wrangler deploy` |
| Variable de build | `BUN_VERSION` = `1.4.2` — **indispensable** |
| Variable de build | `NODE_VERSION` = `22.23.2` |

Pourquoi ces deux variables :

- **`BUN_VERSION`** : l'image de build par défaut embarque **bun 1.2.15**, qui ne sait pas lire le
  `bun.lock` (« version 2 ») écrit par bun 1.4. Sans ce pin, l'installation automatique des
  dépendances échoue avec `error: Unknown lockfile version` puis
  `error: lockfile had changes, but lockfile is frozen`. Bun n'accepte qu'une variable
  d'environnement pour ça (pas de fichier équivalent à `.node-version`), donc c'est à régler dans
  **Settings → Build → Build Variables and Secrets** du projet.
- **`NODE_VERSION`** : `22.23.2` est préinstallé dans l'image (pas de téléchargement). Astro 7 exige
  Node ≥ 22.12 ; le fichier `.node-version` du dépôt couvre déjà ce point.

⚠️ Si tu montes Bun en local, aligne `BUN_VERSION` : un `bun.lock` écrit par une version plus récente
que celle du build fait échouer l'install.

`package.json` déclare aussi `"packageManager": "bun@1.4.2"` (comme sur `raphael-catarino-website`) :
c'est la version de référence du dépôt, lisible par Renovate et l'outillage local. La doc Cloudflare
ne documente toutefois que `BUN_VERSION` pour Bun — rien ne garantit que l'image lise `packageManager`,
d'où les deux.

Pour savoir lequel suffit : après un push, **Deployments → View build history** et regarder la ligne
`Detected the following tools from environment: …`. Si elle affiche `bun@1.4.2`, la variable du
dashboard est redondante ; si elle affiche `bun@1.2.15`, elle est nécessaire.

Plan B si tu veux retirer Bun du build : générer un `package-lock.json`, puis `SKIP_DEPENDENCY_INSTALL=1`
et build command `npm ci --include=dev && npm run build`.

Le domaine `news.raphael-catarino.fr` est rattaché au Worker via `routes[].custom_domain` dans
`wrangler.jsonc` (la zone `raphael-catarino.fr` est déjà hébergée chez Cloudflare) : Cloudflare crée
l'enregistrement DNS et le certificat automatiquement.

`bun run deploy` (wrangler en local) reste possible pour déployer à la main.

## Ajouter un briefing à la main

```bash
cp src/content/news/2026-07-09.md src/content/news/2026-09-29.md
# éditer, puis commit + push
```
