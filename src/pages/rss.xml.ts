import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { byDateDesc, formatLong } from '../lib/dates';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const entries = (await getCollection('news')).sort((a, b) =>
    byDateDesc(a.data.date, b.data.date),
  );

  return rss({
    title: 'Daily News',
    description:
      'Briefing quotidien : France, code & informatique, cybersécurité, international. Chaque info sourcée.',
    site: context.site ?? 'https://news.raphael-catarino.fr',
    trailingSlash: true,
    customData: '<language>fr-fr</language>',
    items: entries.map((entry) => ({
      title: entry.data.title ?? `Briefing du ${formatLong(entry.data.date)}`,
      // 9 h heure de Paris : l'heure de publication du cron.
      pubDate: new Date(`${entry.data.date}T09:00:00+02:00`),
      link: `/briefing/${entry.data.date}/`,
      description:
        entry.data.tlDr.length > 0
          ? entry.data.tlDr.join(' ')
          : `Le briefing du ${formatLong(entry.data.date)}.`,
      categories: entry.data.tags,
    })),
  });
}
