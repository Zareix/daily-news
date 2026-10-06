/**
 * Formatage de date déterministe : on n'utilise jamais le fuseau de la machine
 * de build (CI en UTC) mais explicitement Europe/Paris.
 */
const PARIS = "Europe/Paris"

const longFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: PARIS,
})

const shortFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: PARIS,
})

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: PARIS,
})

/** `2026-07-09` → objet Date à midi UTC (jamais décalé d'un jour par le fuseau). */
function toDate(isoDay: string): Date {
  return new Date(`${isoDay}T12:00:00Z`)
}

/** « jeudi 9 juillet 2026 » */
export function formatLong(isoDay: string): string {
  return longFormatter.format(toDate(isoDay))
}

/** « 09 juil. 2026 » */
export function formatShort(isoDay: string): string {
  return shortFormatter.format(toDate(isoDay))
}

/** « juillet 2026 » */
export function formatMonth(isoDay: string): string {
  return monthFormatter.format(toDate(isoDay))
}

/** Clé de regroupement `2026-07`. */
export function monthKey(isoDay: string): string {
  return isoDay.slice(0, 7)
}

/** Sens de tri décroissant sur des jours ISO `YYYY-MM-DD`. */
export function byDateDesc(a: string, b: string): number {
  return b.localeCompare(a)
}

/** Temps de lecture estimé, arrondi à la minute supérieure. */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/u).length
  return Math.max(1, Math.round(words / 220))
}
