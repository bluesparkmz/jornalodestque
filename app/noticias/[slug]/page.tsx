import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { GridPost, ThumbPost } from "../../components/ui";
import type { Article as ApiArticle } from "../../lib/api";

export const instant = false;

type Article = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  views_count: number;
  featured_image_url: string | null;
  published_at?: string | null;
  author?: { display_name: string | null; username: string } | null;
  categories?: { id?: number; name: string; slug: string; description?: string | null }[];
};

function asCard(item: Article): ApiArticle {
  return {
    id: item.id ?? 0,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content ?? "",
    content_format: "html",
    status: "published",
    views_count: item.views_count,
    featured_image_url: item.featured_image_url,
    published_at: item.published_at ?? null,
    author: item.author ?? null,
    categories: item.categories?.map((category, index) => ({
      id: category.id ?? index,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
    })),
  };
}

function uniqueArticles(items: Article[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

type PageProps = { params: Promise<{ slug: string }> };
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const audio = /\.(mp3|ogg|wav|flac|m4a)(\?.*)?$/i;
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "audio"],
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), "style"],
    audio: ["src", "controls"],
  },
};

const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const response = await fetch(`${API_URL}/articles/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Não foi possível carregar a notícia.");
  return response.json();
});

async function getSuggestions(slug: string): Promise<Article[]> {
  const response = await fetch(`${API_URL}/articles?per_page=16`, { cache: "no-store" });
  if (!response.ok) return [];
  const result: { items: Article[] } = await response.json();
  return result.items.filter((article) => article.slug !== slug);
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

function Suggestions({ items }: { items: Article[] }) {
  if (!items.length) return null;
  return (
    <div className="suggestions">
      {items.map((item) => (
        <ThumbPost key={item.slug} article={asCard(item)} />
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return { title: "Notícia não encontrada | O Destaque" };
  return {
    title: `${article.title} | O Destaque`,
    description: article.excerpt ?? article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? article.title,
      images: article.featured_image_url ? [article.featured_image_url] : [],
    },
  };
}

export default async function News({ params }: PageProps) {
  const slug = (await params).slug;
  const [article, suggestions] = await Promise.all([getArticle(slug), getSuggestions(slug)]);
  if (!article) notFound();

  const author = article.author?.display_name || article.author?.username || "Redacção";
  const category = article.categories?.[0];
  const related = uniqueArticles(suggestions);
  const moreNews = related.slice(0, 3);
  const sidebarNews = related.slice(0, 6);

  return (
    <div className="container page-shell">
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <span>/</span>
        {category ? (
          <>
            <Link href={`/categorias/${encodeURIComponent(category.slug)}`}>{category.name}</Link>
            <span>/</span>
          </>
        ) : null}
        <span>{article.title}</span>
      </div>

      <div className="article-layout">
        <div>
          <article className="reading">
            {category && <span className="cat-badge">{category.name}</span>}
            <h1>{article.title}</h1>
            <p className="article-meta">
              <span className="article-meta__by">Por {author}</span>
              {article.published_at && <span className="article-meta__date">{formatDate(article.published_at)}</span>}
              <span className="article-meta__date">{article.views_count} visitas</span>
            </p>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
              components={{
                a: ({ href, children }) =>
                  href && audio.test(href) ? (
                    <audio controls src={href}>Áudio não suportado.</audio>
                  ) : (
                    <a href={href}>{children}</a>
                  ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>

          {moreNews.length > 0 && (
            <section className="more-news">
              <div className="section-title"><h2 className="section-title__text">Continue a ler</h2></div>
              <div className="more-news-grid">
                {moreNews.map((item) => (
                  <GridPost key={item.slug} article={asCard(item)} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="article-sidebar">
          <aside className="ad-card">
            <span>Publicidade</span>
            <p>Espaço reservado para anúncio.</p>
          </aside>
          {sidebarNews.length > 0 && (
            <section className="sidebar-news-list">
              <div className="section-title"><h2 className="section-title__text">Últimas notícias</h2></div>
              <Suggestions items={sidebarNews} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
