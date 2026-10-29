import type { MetadataRoute } from "next";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
type Article = { slug: string; updated_at?: string; published_at?: string };
type Category = { slug: string };

async function allArticles(): Promise<Article[]> {
  const first = await fetch(`${apiUrl}/articles?page=1&per_page=100`, { cache: "no-store" });
  if (!first.ok) return [];
  const data: { items: Article[]; total: number } = await first.json();
  const pages = Math.ceil(data.total / 100);
  if (pages <= 1) return data.items;
  const other = await Promise.all(Array.from({ length: pages - 1 }, (_, index) => fetch(`${apiUrl}/articles?page=${index + 2}&per_page=100`, { cache: "no-store" }).then(async (response) => response.ok ? (await response.json()).items as Article[] : [])));
  return [...data.items, ...other.flat()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categoriesResponse] = await Promise.all([allArticles(), fetch(`${apiUrl}/categories`, { cache: "no-store" })]);
  const categories: Category[] = categoriesResponse.ok ? await categoriesResponse.json() : [];
  return [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/categorias`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/jornais`, changeFrequency: "daily", priority: 0.8 },
    ...categories.map((category) => ({ url: `${siteUrl}/categorias/${encodeURIComponent(category.slug)}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${siteUrl}/noticias/${encodeURIComponent(article.slug)}`, lastModified: article.updated_at ?? article.published_at, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
