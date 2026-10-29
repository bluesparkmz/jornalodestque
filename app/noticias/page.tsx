"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, Article } from "../lib/api";
import { FeatureCard, GridPost, SectionTitle } from "../components/ui";
import { NoticiasSkeleton } from "../components/skeletons";

function NoticiasInner() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    const path =
      q.length >= 2
        ? `/articles/search?q=${encodeURIComponent(q)}&per_page=24`
        : "/articles?per_page=24";
    api<{ items: Article[] }>(path)
      .then((result) => setArticles(result.items))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [q]);

  if (loading) return <NoticiasSkeleton />;

  const isSearch = q.length >= 2;
  const featured = isSearch ? [] : articles.slice(0, 2);
  const rest = isSearch ? articles : articles.slice(2);
  const title = isSearch ? `Resultados para “${q}”` : "Últimas notícias";

  return (
    <div className="container page-shell">
      <SectionTitle title={title} />
      {q.length === 1 && <p className="page-intro">Escreva pelo menos 2 caracteres para pesquisar.</p>}
      {isSearch && !error && (
        <p className="page-intro">
          {articles.length
            ? `${articles.length} ${articles.length === 1 ? "notícia encontrada" : "notícias encontradas"}.`
            : "Não foram encontradas notícias com este termo."}
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {featured.length > 0 && (
        <div className="recent-featured" style={{ marginBottom: 28 }}>
          {featured.map((article) => (
            <FeatureCard key={article.id} article={article} size="md" />
          ))}
        </div>
      )}
      <div className="news-list-grid">
        {rest.map((article) => (
          <GridPost key={article.id} article={article} />
        ))}
      </div>
      {!error && !articles.length && !isSearch && <div className="empty-state">Ainda não há notícias publicadas.</div>}
    </div>
  );
}

export default function NoticiasPage() {
  return (
    <Suspense fallback={<NoticiasSkeleton />}>
      <NoticiasInner />
    </Suspense>
  );
}
