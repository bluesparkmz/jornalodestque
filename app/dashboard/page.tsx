"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Article, Category, User } from "../lib/api";
import { useSession } from "../components/session";
import { AdminHomeSkeleton } from "../components/skeletons";

type Newspaper = { id: number; title: string; slug: string; issue_number: string | null; price: number; currency: string };

export default function DashboardHome() {
  const { user, token } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !user) return;
    const tasks: Promise<unknown>[] = [
      api<{ items: Article[] }>("/articles/admin/list?per_page=100", {}, token).then((r) => setArticles(r.items)),
      api<Category[]>("/categories").then(setCategories),
      api<Newspaper[]>("/newspapers").then(setNewspapers),
    ];
    if (user.role === "admin") {
      tasks.push(api<User[]>("/admin/users", {}, token).then(setUsers));
    }
    Promise.all(tasks)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [token, user]);

  if (loading) return <AdminHomeSkeleton />;

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;
  const recent = [...articles].slice(0, 6);
  const canManage = ["admin", "editor"].includes(user?.role ?? "");

  return (
    <div>
      <div className="dash-page-head">
        <div>
          <h1>Visão geral</h1>
          <p className="muted">Controlo de notícias, jornais e conteúdos do O Destaque.</p>
        </div>
        <div className="dash-actions">
          <Link className="button" href="/dashboard/noticias/novo">Nova notícia</Link>
          {canManage && <Link className="button" href="/dashboard/jornais/novo">Novo jornal</Link>}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__label">Notícias</div>
          <div className="dash-stat__value">{articles.length}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Publicadas</div>
          <div className="dash-stat__value">{published}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Rascunhos</div>
          <div className="dash-stat__value">{drafts}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__label">Jornais</div>
          <div className="dash-stat__value">{newspapers.length}</div>
        </div>
      </div>

      <div className="dash-panels">
        <section className="dash-card">
          <h2>Atalhos rápidos</h2>
          <div className="dash-quick">
            <Link href="/dashboard/noticias/novo">
              <strong>Criar notícia</strong>
              <span>Título, capa, categorias e conteúdo</span>
            </Link>
            <Link href="/dashboard/noticias">
              <strong>Gerir notícias</strong>
              <span>Editar, publicar e rever visitas</span>
            </Link>
            {canManage && (
              <>
                <Link href="/dashboard/categorias">
                  <strong>Categorias</strong>
                  <span>{categories.length} secções activas</span>
                </Link>
                <Link href="/dashboard/jornais/novo">
                  <strong>Publicar jornal</strong>
                  <span>Capa, PDF e preço M-Pesa</span>
                </Link>
              </>
            )}
            {user?.role === "admin" && (
              <Link href="/dashboard/utilizadores">
                <strong>Utilizadores</strong>
                <span>{users.length} contas registadas</span>
              </Link>
            )}
            <Link href="/">
              <strong>Ver site público</strong>
              <span>Abrir a homepage do jornal</span>
            </Link>
          </div>
        </section>

        <section className="dash-card">
          <h2>Resumo</h2>
          <p className="muted">Categorias: <strong>{categories.length}</strong></p>
          <p className="muted">Jornais digitais: <strong>{newspapers.length}</strong></p>
          {user?.role === "admin" && <p className="muted">Utilizadores: <strong>{users.length}</strong></p>}
          <p className="muted" style={{ marginTop: 16 }}>
            Sessão: <strong>{user?.display_name || user?.username}</strong> ({user?.role})
          </p>
        </section>
      </div>

      <section className="dash-card">
        <div className="dash-page-head" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Notícias recentes</h2>
          <Link href="/dashboard/noticias">Ver todas</Link>
        </div>
        {recent.length ? (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Visitas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((article) => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td><span className={`dash-status is-${article.status}`}>{article.status}</span></td>
                  <td>{article.views_count}</td>
                  <td><Link href={`/dashboard/noticias/${article.id}`}>Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="dash-empty">Ainda não há notícias. Crie a primeira.</div>
        )}
      </section>
    </div>
  );
}
