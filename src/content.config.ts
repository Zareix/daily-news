import { glob } from "astro/loaders"
import { z } from "astro/zod"
import { defineCollection } from "astro:content"

/**
 * Un briefing = un fichier markdown `src/content/news/<YYYY-MM-DD>.md`.
 *
 * Le frontmatter est écrit par le cron Hermes (skill `daily-news-briefing`).
 * `date` est la source de vérité pour l'URL (`/briefing/<date>/`) et le tri ;
 * le nom de fichier doit donc être `<date>.md`.
 */
const newsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    // Le parseur YAML transforme `2026-07-09` en objet Date, mais un agent peut
    // aussi écrire `"2026-07-09"` entre guillemets : on normalise les deux en jour ISO.
    date: z
      .union([z.string(), z.date()])
      .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
      .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: "date attendue au format YYYY-MM-DD",
      }),
    /** Titre optionnel ; par défaut « Briefing du <date> ». */
    title: z.string().optional(),
    /** Résumé court, 3 à 5 points. Affiché en encart et dans la notification Bark. */
    tlDr: z.array(z.string()).default([]),
    /** Étiquettes libres, kebab-case (ex. `ransomware`, `linux-kernel`). */
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = {
  news: newsCollection,
}
