"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Article, Category } from "../lib/api";
import { GridPost, SectionTitle } from "../components/ui";
import { CategoriasSkeleton } from "../components/skeletons";

type CategoryBlock = {
  category: Category;
  articles: Article[];
};

export default function Categories() {
  const [blocks, setBlocks] = useState<CategoryBlock[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const categories = await api<Category[]>("/categories");
        const results = await Promise.all(
          categories.map(async (category) => {
            try {
              const result = await api<{ items: Article[] }>(
                `/articles?category=${encodeURIComponent(category.slug)}&per_page=4&sort=published_at&order=desc`,
              );
              return { category, articles: result.items };
            } catch {
              return { category, articles: [] as Article[] };
            }
          }),
        );
        if (!cancelled) setBlocks(results);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Não foi possível carregar as categorias.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <CategoriasSkeleton />;

  return (
    <div className="container page-shell">
      <SectionTitle title="Categorias" />
      <p className="page-intro">Últimas notícias de cada secção do Jornal O Destaque.</p>
      {error && <p className="error">{error}</p>}

      {blocks.map(({ category, articles }) => (
        <section key={category.id} className="category-band">
          <SectionTitle
            title={category.name}
            actions={
              <Link href={`/categorias/${encodeURIComponent(category.slug)}`} className="category-more">
                Ver todas ›
              </Link>
            }
          />
          {category.description && <p className="page-intro" style={{ marginTop: -8 }}>{category.description}</p>}
          {articles.length > 0 ? (
            <div className="category-grid-4">
              {articles.map((article) => (
                <GridPost key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="muted">Ainda não há notícias nesta categoria.</p>
          )}
        </section>
      ))}

      {!error && !blocks.length && <div className="empty-state">Ainda não há categorias.</div>}
    </div>
  );
}
