"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, Article, mediaUrl } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useSession } from "../../components/session";
import { AdminListSkeleton } from "../../components/skeletons";

const PAGE_SIZE = 20;

export default function DashboardNoticias() {
  const { token } = useSession();
  const [items, setItems] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    api<{ items: Article[] }>("/articles/admin/list?per_page=100", {}, token)
      .then((result) => setItems(result.items))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    const q = applied.trim().toLowerCase();
    if (!q) return items;
    return items.filter((article) => {
      const haystack = [
        article.title,
        article.excerpt ?? "",
        article.slug,
        article.status,
        article.author?.display_name ?? "",
        article.author?.username ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setApplied(query);
    setPage(1);
  }

  if (loading) return <AdminListSkeleton />;

  return (
    <div>
      <div className="dash-page-head">
        <div>
          <h1>Notícias</h1>
          <p className="muted">Criar, editar e publicar artigos do jornal.</p>
        </div>
        <div className="dash-actions">
          <Link className="button" href="/dashboard/noticias/novo">Nova notícia</Link>
        </div>
      </div>

      <form className="dash-search" onSubmit={onSearch}>
        <div className="dash-search__group">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar…"
            aria-label="Pesquisar notícias"
          />
          <button type="submit">Buscar</button>
        </div>
        {applied && (
          <button
            type="button"
            className="dash-search__clear"
            onClick={() => {
              setQuery("");
              setApplied("");
              setPage(1);
            }}
          >
            Limpar
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {pageItems.length ? (
        <>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Capa</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Data de lançamento</th>
                <th>Visitas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((article) => {
                const cover = mediaUrl(article.featured_image_url);
                const launchDate = formatDate(article.published_at, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr key={article.id}>
                    <td>{cover ? <img src={cover} alt="" /> : <span className="muted">—</span>}</td>
                    <td>
                      <strong>{article.title}</strong>
                      {article.excerpt && <div className="muted" style={{ marginTop: 4, maxWidth: 420 }}>{article.excerpt}</div>}
                    </td>
                    <td><span className={`dash-status is-${article.status}`}>{article.status}</span></td>
                    <td className="muted">{launchDate || "—"}</td>
                    <td>{article.views_count}</td>
                    <td className="dash-row-actions">
                      <Link href={`/dashboard/noticias/${article.id}`}>Editar</Link>
                      <Link href={`/noticias/${article.slug}`} target="_blank">Ver</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="dash-pagination">
            <p className="muted">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <nav className="pagination" aria-label="Paginação">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const n = index + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    className={n === currentPage ? "is-active" : undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                »
              </button>
            </nav>
          </div>
        </>
      ) : (
        <div className="dash-empty">
          {applied
            ? <>Nenhuma notícia encontrada para “{applied}”.</>
            : <>Ainda não há notícias. <Link href="/dashboard/noticias/novo">Criar a primeira</Link></>}
        </div>
      )}
    </div>
  );
}
