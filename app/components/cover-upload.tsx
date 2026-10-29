"use client";
import { ChangeEvent, useState } from "react";
import { api } from "../lib/api";
import { prepareImageUpload } from "../lib/image-upload";

export function CoverUpload({ token, value, onChange, articleId }: { token: string; value: string; onChange: (url: string) => void; articleId?: number }) {
  const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true); setProgress(0);
    try { const optimized = await prepareImageUpload(file); const form = new FormData(); form.append("image", optimized); form.append("alt_text", `Capa: ${file.name}`); if (articleId) form.append("article_id", String(articleId)); const result = await api<{ url: string | null }>("/media/upload", { method: "POST", body: form, onUploadProgress: setProgress }, token); if (result.url) onChange(result.url); }
    catch (error) { window.alert(error instanceof Error ? error.message : "Não foi possível enviar a capa."); }
    finally { setBusy(false); event.target.value = ""; }
  }
  return <label>Imagem de capa<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}/>{busy && <span className="upload-status">A adicionar ao armazenamento… {progress}%<progress value={progress} max="100" /></span>}{value && <img className="cover-preview" src={value} alt="Prévia da capa"/>}</label>;
}
