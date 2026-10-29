"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api, Category } from "../lib/api";
import { prepareImageUpload } from "../lib/image-upload";
import { MarkdownEditor } from "./markdown-editor";

type Props = {
  token: string;
  mode: "create" | "edit";
  initial?: {
    id?: number;
    title?: string;
    excerpt?: string | null;
    content?: string;
    featured_image_url?: string | null;
    status?: string;
    category_ids?: number[];
    slug?: string;
  };
  onSaved?: (message: string) => void;
  onError?: (message: string) => void;
};

export function ArticleWorkspace({ token, mode, initial, onSaved, onError }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [cover, setCover] = useState(initial?.featured_image_url ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [categoryIds, setCategoryIds] = useState<number[]>(initial?.category_ids ?? []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q));
  }, [categories, categoryQuery]);

  function toggleCategory(id: number) {
    setCategoryIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function uploadCover(file: File) {
    setCoverBusy(true);
    try {
      const optimized = await prepareImageUpload(file);
      const form = new FormData();
      form.append("image", optimized);
      form.append("alt_text", `Capa: ${file.name}`);
      if (initial?.id) form.append("article_id", String(initial.id));
      const result = await api<{ url: string | null }>("/media/upload", { method: "POST", body: form }, token);
      if (result.url) setCover(result.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a capa.");
    } finally {
      setCoverBusy(false);
    }
  }

  async function save(nextStatus?: string) {
    setBusy(true);
    setError("");
    setMessage("");
    const finalStatus = nextStatus ?? status;
    const payload = {
      title: title.trim() || "Sem título",
      excerpt: excerpt.trim() || null,
      content,
      featured_image_url: cover || null,
      content_format: "html" as const,
      status: finalStatus,
      category_ids: categoryIds,
    };
    try {
      if (mode === "edit" && initial?.id) {
        await api(`/articles/${initial.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        setStatus(finalStatus);
        const text = finalStatus === "published" ? "Notícia publicada." : "Alterações guardadas.";
        setMessage(text);
        onSaved?.(text);
      } else {
        await api("/articles", { method: "POST", body: JSON.stringify(payload) }, token);
        setTitle("");
        setExcerpt("");
        setContent("");
        setCover("");
        setCategoryIds([]);
        setStatus("draft");
        const text = finalStatus === "published" ? "Notícia publicada." : "Rascunho guardado.";
        setMessage(text);
        onSaved?.(text);
      }
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : "Não foi possível guardar.";
      setError(text);
      onError?.(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gutenberg">
      <header className="gutenberg-topbar">
        <div className="gutenberg-topbar__left">
          <Link href="/dashboard/noticias" className="gutenberg-back">← Notícias</Link>
          <span className="gutenberg-doc-title">
            {title.trim() || "Sem título"} · Artigo
          </span>
        </div>
        <div className="gutenberg-topbar__right">
          {message && <span className="gutenberg-flash is-ok">{message}</span>}
          {error && <span className="gutenberg-flash is-err">{error}</span>}
          <button type="button" className="gutenberg-btn" disabled={busy} onClick={() => void save("draft")}>
            Guardar rascunho
          </button>
          {initial?.slug && (
            <Link href={`/noticias/${initial.slug}`} target="_blank" className="gutenberg-btn">
              Pré-visualizar
            </Link>
          )}
          <button type="button" className="gutenberg-btn is-primary" disabled={busy} onClick={() => void save("published")}>
            {busy ? "A guardar…" : "Publicar"}
          </button>
        </div>
      </header>

      <div className="gutenberg-body">
        <div className="gutenberg-canvas">
          <div className="gutenberg-canvas-inner">
            <input
              className="gutenberg-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Adicionar título"
              aria-label="Título"
              autoFocus
            />
            <MarkdownEditor value={content} onChange={setContent} token={token} articleId={initial?.id} variant="clean" />
          </div>
        </div>

        <aside className="gutenberg-sidebar">
          <div className="gutenberg-panel">
            <h3>Artigo</h3>

            <div className="gutenberg-field">
              <span className="gutenberg-label">Imagem de destaque</span>
              {cover ? (
                <div className="gutenberg-cover">
                  <img src={cover} alt="Capa" />
                  <div className="gutenberg-cover__actions">
                    <button type="button" className="gutenberg-btn" onClick={() => coverInput.current?.click()}>
                      Substituir
                    </button>
                    <button type="button" className="link-button" onClick={() => setCover("")}>
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="gutenberg-cover-btn" onClick={() => coverInput.current?.click()} disabled={coverBusy}>
                  {coverBusy ? "A enviar…" : "Definir imagem de destaque"}
                </button>
              )}
              <input
                ref={coverInput}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadCover(file);
                  event.target.value = "";
                }}
              />
            </div>

            <div className="gutenberg-field">
              <span className="gutenberg-label">Excerto</span>
              <textarea
                className="gutenberg-textarea"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder="Adicione um excerto…"
                rows={4}
              />
            </div>

            <div className="gutenberg-meta">
              <div><span>Estado</span><strong>{status === "published" ? "Publicado" : status === "draft" ? "Rascunho" : status}</strong></div>
              <div>
                <span>Publicar como</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="draft">Rascunho</option>
                  <option value="pending">Pendente</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="gutenberg-panel">
            <h3>Categorias</h3>
            <div className="gutenberg-search">
              <input
                type="search"
                placeholder="Pesquisar categorias"
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
              />
            </div>
            <div className="gutenberg-cats">
              {filteredCategories.map((category) => (
                <label key={category.id} className="gutenberg-cat">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
              {!filteredCategories.length && (
                <p className="muted">
                  {categories.length ? "Nenhuma categoria encontrada." : "Ainda não há categorias. Crie em Categorias."}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
