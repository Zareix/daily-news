# AGENTS.md — Daily News

Site statique Astro : le briefing d'actualités quotidien de **news.raphael-catarino.fr**.
Référence complète : [README.md](README.md).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Runtime de référence : **Bun** (`bun run <script>`), Node ≥ 22.12 requis.

```bash
bun run dev       # http://localhost:4321
bun run build     # astro build + pagefind --site dist (index de recherche)
bun run check     # astro check && tsc --noEmit — à lancer avant de terminer
bun run deploy    # wrangler deploy (déploiement manuel ; le push sur main suffit sinon)
```

La recherche (`/search/`) s'appuie sur l'index **Pagefind** généré au build : elle ne marche
pas en dev sans un `bun run build` préalable.

## Contenu

Un briefing = `src/content/news/<YYYY-MM-DD>.md` (date ISO = source de vérité pour l'URL
`/briefing/<date>/` et le tri). Schéma Zod dans `src/content.config.ts` : `date` (requis),
`title` (optionnel), `tlDr` (3–5 points), `tags` (kebab-case). Pas de `# H1` dans le corps ;
le format complet est documenté dans le README.

## Conventions

- Tout le projet (code, commentaires, doc) est en français.
- Tailwind v4 : le mode sombre suit uniquement `prefers-color-scheme` (variant `dark:` global),
  sans classe `.dark` ni script. La couleur d'accent est `accent-*` (`src/styles/global.css`).
- Polices via la Fonts API d'Astro (`<Font />` dans le layout), auto-hébergées — ne pas
  réintroduire Google Fonts ni `@fontsource`.
- Le site est volontairement non indexé (robots.txt, `_headers`, meta robots) : ne rien ajouter
  qui réintroduise l'indexation (sitemap, etc.).
- **Pas de commentaires dans le code** : n'en ajouter que si vraiment indispensable
  (piège non déductible du code lui-même), jamais pour décrire ce que fait le code —
  le code dit le « comment », la doc dit le « pourquoi ».

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Déploiement

Cloudflare Workers Builds : chaque push sur `main` déclenche build + déploiement (bun 1.4.2 et
Node 22.23.2 épinglés côté dashboard — voir README). Ne pas toucher à `wrangler.jsonc` sans
raison : `routes[].custom_domain` rattache `news.raphael-catarino.fr`.
