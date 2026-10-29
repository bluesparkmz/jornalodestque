import Link from "next/link";
import { notFound } from "next/navigation";

export const instant = false;

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
type Props = { params: Promise<{ slug: string }> };
type Category = { name: string; description: string | null };
type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  views_count: number;
  featured_image_url: string | null;
  published_at: string | null;
  author: { display_name: string | null; username: string } | null;
  categories?: { name: string; slug: string }[];
};

function mediaUrl(url: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function CategoryPage({ params }: Props) {
  const slug = (await params).slug;
  const [categoryResponse, articlesResponse] = await Promise.all([
    fetch(`${API_URL}/categories/${encodeURIComponent(slug)}`, { cache: "no-store" }),
    fetch(`${API_URL}/articles?category=${encodeURIComponent(slug)}&per_page=30`, { cache: "no-store" }),
  ]);
  if (categoryResponse.status === 404) notFound();
  if (!categoryResponse.ok || !articlesResponse.ok) throw new Error("Não foi possível carregar esta categoria.");
  const category: Category = await categoryResponse.json();
  const result: { items: Article[] } = await articlesResponse.json();

  return (
    <div className="container page-shell">
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href="/categorias">Categorias</Link>
        <span>/</span>
        <span>{category.name}</span>
      </div>

      <div className="section-title"><h1 className="section-title__text">{category.name}</h1></div>
      {category.description && <p className="page-intro">{category.description}</p>}

      <div className="news-list-grid">
        {result.items.map((article) => {
          const cover = mediaUrl(article.featured_image_url);
          const author = article.author?.display_name || article.author?.username || "Redacção";
          return (
            <article key={article.id} className="grid-post">
              <Link href={`/noticias/${article.slug}`} className="grid-post__media">
                {cover ? <img src={cover} alt="" /> : <span style={{ display: "block", height: "100%", background: "#ddd" }} />}
              </Link>
              <p className="article-meta">
                <span className="article-meta__by">Por {author}</span>
                {article.published_at && <span className="article-meta__date">{formatDate(article.published_at)}</span>}
              </p>
              <h3 className="grid-post__title">
                <Link href={`/noticias/${article.slug}`}>{article.title}</Link>
              </h3>
              {article.excerpt && <p className="muted">{article.excerpt}</p>}
            </article>
          );
        })}
      </div>
      {!result.items.length && <div className="empty-state">Ainda não há notícias nesta categoria.</div>}
    </div>
  );
}
