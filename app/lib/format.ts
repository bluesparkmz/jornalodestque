import type { Article } from "./api";

export function authorName(article: Pick<Article, "author"> | { author?: Article["author"] } | null | undefined) {
  return article?.author?.display_name || article?.author?.username || "Redacção";
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-PT", options ?? { day: "2-digit", month: "long", year: "numeric" });
}

export function formatTopbarDate(date: Date) {
  const text = date.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function categoryName(article: Pick<Article, "categories"> | null | undefined) {
  return article?.categories?.[0]?.name ?? "Notícias";
}

export function articleHref(slug: string) {
  return `/noticias/${slug}`;
}

export function placeholderCover(seed: string | number) {
  const n = typeof seed === "number" ? seed : Math.abs([...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0));
  const hues = [0, 210, 160, 30, 280, 120];
  const hue = hues[n % hues.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 35% 28%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 40% 18%)"/></linearGradient></defs><rect width="800" height="520" fill="url(#g)"/><circle cx="620" cy="120" r="90" fill="hsl(${hue} 50% 40% / .35)"/><text x="40" y="470" fill="white" font-family="Montserrat,Arial,sans-serif" font-size="28" font-weight="700" opacity=".55">O Destaque</text></svg>`
  )}`;
}
