import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { getCollection } from "astro:content"

import { byDateDesc, formatLong } from "../lib/dates"

/**
 * Nombre de briefings exposés dans le flux. Le flux transporte désormais le texte complet :
 * sans plafond il enflerait indéfiniment (un item par jour) et deviendrait pénible à
 * télécharger pour les lecteurs. 20 items ≈ trois semaines d'archive.
 */
const MAX_ITEMS = 20

export async function GET(context: APIContext) {
  const site = (context.site ?? "https://news.raphael-catarino.fr").toString().replace(/\/$/, "")

  const entries = (await getCollection("news"))
    .sort((a, b) => byDateDesc(a.data.date, b.data.date))
    .slice(0, MAX_ITEMS)

  return rss({
    title: "Daily News",
    description:
      "Briefing quotidien : France, code & informatique, cybersécurité, international. Chaque info sourcée.",
    site: context.site ?? "https://news.raphael-catarino.fr",
    trailingSlash: true,
    // `@astrojs/rss` n'expose pas d'option `image` : on l'injecte dans <channel>, à l'endroit
    // attendu par la DTD (après <language>, avant <item>). 144x144 est la taille maximale prévue
    // par la spécification RSS 2.0 ; au-delà, le validateur râle.
    customData:
      "<language>fr-fr</language>" +
      `<image><url>${site}/icon-144.png</url><title>Daily News</title>` +
      `<link>${site}/</link><width>144</width><height>144</height></image>`,
    items: entries.map((entry) => {
      const lien = `${site}/briefing/${entry.data.date}/`
      const resume =
        entry.data.tlDr.length > 0
          ? entry.data.tlDr.join(" ")
          : `Le briefing du ${formatLong(entry.data.date)}.`

      // `description` reste le résumé : c'est ce qu'affichent les aperçus de liste, les
      // notifications des lecteurs, et le corps de la notification Bark. Le briefing complet
      // part dans <content:encoded> pour que le lecteur n'ait pas à ouvrir le site.
      const corps = entry.rendered?.html?.trim() ?? ""
      const contenu = corps
        ? [
            entry.data.tlDr.length > 0
              ? `<p><strong>En bref</strong></p>\n<ul>${entry.data.tlDr.map((p) => `<li>${p}</li>`).join("")}</ul>`
              : "",
            corps,
            `<hr>\n<p><a href="${lien}">Lire sur le site</a>${
              entry.data.tags.length > 0 ? ` · ${entry.data.tags.join(", ")}` : ""
            }</p>`,
          ]
            .filter(Boolean)
            .join("\n")
        : ""

      return {
        title: entry.data.title ?? `Briefing du ${formatLong(entry.data.date)}`,
        // 9 h heure de Paris : l'heure de publication du cron.
        pubDate: new Date(`${entry.data.date}T09:00:00+02:00`),
        link: `/briefing/${entry.data.date}/`,
        description: resume,
        categories: entry.data.tags,
        ...(contenu ? { content: contenu } : {}),
      }
    }),
  })
}
