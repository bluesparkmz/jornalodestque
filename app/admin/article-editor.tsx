"use client";
import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import { MarkdownEditor } from "../components/markdown-editor";
import { CoverUpload } from "../components/cover-upload";
import { CategorySelect } from "../components/category-select";
type Props = { token: string; onMessage: (x: string) => void; onError: (x: string) => void };
export function ArticleEditor({ token, onMessage, onError }: Props) {
  const [content, setContent] = useState(""); const [cover, setCover] = useState(""); const [categoryIds, setCategoryIds] = useState<number[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { await api("/articles", { method: "POST", body: JSON.stringify({ title: data.get("title"), excerpt: data.get("excerpt") || null, content, featured_image_url: cover || null, content_format: "html", status: data.get("status"), category_ids: categoryIds }) }, token); onMessage("Artigo guardado."); setContent(""); setCover(""); setCategoryIds([]); form.reset(); } catch (reason) { onError(reason instanceof Error ? reason.message : "Não foi possível guardar o artigo."); } }
  return <div><h2>Novo artigo</h2><form onSubmit={submit}><label>Título<input name="title" required /></label><label>Resumo<textarea name="excerpt" /></label><CategorySelect selected={categoryIds} onChange={setCategoryIds} /><CoverUpload token={token} value={cover} onChange={setCover} /><label>Conteúdo</label><MarkdownEditor value={content} onChange={setContent} token={token} /><label>Estado<select name="status"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label><button>Guardar artigo</button></form></div>;
}
