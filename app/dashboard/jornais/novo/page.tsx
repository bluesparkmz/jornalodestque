"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { prepareImageUpload } from "../../../lib/image-upload";
import { useSession } from "../../../components/session";
import { formatDate } from "../../../lib/format";

type UploadUrl = { key: string; upload_url: string; headers: Record<string, string> };

function todayInputValue() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function NovoJornal() {
  const { token } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayInputValue);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : ""), [coverFile]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function resetPreview() {
    setTitle("");
    setPrice("");
    setDate(todayInputValue());
    setCoverFile(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const cover = data.get("cover_image") as File;
    const pdf = data.get("pdf") as File;
    if (!cover?.size || !pdf?.size) return setError("Seleccione a capa e o PDF.");
    setSending(true);
    try {
      setMessage("A preparar a capa…");
      const coverData = new FormData();
      coverData.append("image", await prepareImageUpload(cover));
      coverData.append("alt_text", `Capa: ${cover.name}`);
      const coverResult = await api<{ url: string | null }>("/media/upload", { method: "POST", body: coverData }, token);
      if (!coverResult.url) throw new Error("A capa não devolveu um endereço.");

      setMessage("A enviar PDF…");
      const target = await api<UploadUrl>("/newspapers/pdf-upload-url", { method: "POST" }, token);
      const upload = await fetch(target.upload_url, { method: "PUT", headers: target.headers, body: pdf });
      if (!upload.ok) throw new Error(`Não foi possível enviar o PDF (${upload.status}).`);

      setMessage("A criar o jornal…");
      await api(
        "/newspapers/direct",
        {
          method: "POST",
          body: JSON.stringify({
            title: data.get("title"),
            issue_number: data.get("issue_number") || null,
            description: data.get("description") || null,
            price: Number(data.get("price")),
            cover_url: coverResult.url,
            pdf_key: target.key,
            is_published: data.get("is_published") === "true",
          }),
        },
        token,
      );
      setMessage("Jornal publicado com sucesso.");
      form.reset();
      resetPreview();
      router.push("/dashboard/jornais");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Erro ao publicar jornal.");
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  if (!token) return null;

  return (
    <div>
      <div className="dash-page-head">
        <div>
          <h1>Publicar jornal</h1>
          <p className="muted">Envie capa, PDF e defina o preço.</p>
        </div>
        <Link href="/dashboard/jornais">← Voltar</Link>
      </div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="jornal-compose">
        <div className="jornal-compose__form">
          <div className="dash-form">
            <form onSubmit={submit}>
              <label>Título<input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
              <label>Edição<input name="issue_number" /></label>
              <label>Descrição<textarea name="description" /></label>
              <label>Preço (MZN)<input name="price" type="number" min="0" step="1" required value={price} onChange={(event) => setPrice(event.target.value)} /></label>
              <label>Data<input name="issue_date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <label>Capa<input name="cover_image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} /></label>
              <label>PDF<input name="pdf" type="file" accept="application/pdf" required /></label>
              <label><input name="is_published" type="checkbox" value="true" defaultChecked /> Publicar já</label>
              <button type="submit" disabled={sending}>{sending ? "A enviar…" : "Enviar jornal"}</button>
            </form>
          </div>
        </div>
        <aside className="jornal-compose__preview" aria-live="polite">
          <p className="jornal-preview__kicker">Pré-visualização</p>
          <article className="jornal-preview">
            {coverPreview ? (
              <img src={coverPreview} alt={`Capa de ${title || "jornal"}`} />
            ) : (
              <div className="jornal-preview__cover-empty">Capa</div>
            )}
            <div className="jornal-preview__body">
              <h2>{title.trim() || "Título do jornal"}</h2>
              <p className="jornal-preview__price">{price ? `${price} MZN` : "Preço"}</p>
              <p className="jornal-preview__date">{formatDate(date) || "Data"}</p>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
