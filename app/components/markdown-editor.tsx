"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { api } from "../lib/api";
import { prepareImageUpload } from "../lib/image-upload";

type Props = { value: string; onChange: (value: string) => void; token: string; articleId?: number; variant?: "default" | "clean" };
type Upload = { url: string | null };

const Audio = Node.create({
  name: "audio", group: "block", atom: true,
  addAttributes() { return { src: { default: null } }; },
  parseHTML() { return [{ tag: "audio[src]" }]; },
  renderHTML({ HTMLAttributes }) { return ["audio", mergeAttributes(HTMLAttributes, { controls: "controls" })]; },
});

export function MarkdownEditor({ value, onChange, token, articleId, variant = "default" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<"image" | "audio" | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, Image.configure({ inline: false, allowBase64: false }), Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }), TextStyle, Color, Highlight.configure({ multicolor: true }), Audio],
    content: value,
    editorProps: {
      attributes: {
        class: variant === "clean" ? "visual-editor-content is-clean" : "visual-editor-content",
        "aria-label": "Conteúdo do artigo",
        "data-placeholder": "Comece a escrever…",
      },
    },
    onUpdate: ({ editor: next }) => onChange(next.getHTML()),
    onSelectionUpdate: ({ editor: next }) => {
      const node = next.state.selection instanceof NodeSelection ? next.state.selection.node.type.name : null;
      const media = node === "image" || node === "audio" ? node : null;
      setSelectedMedia(media); setHasSelection(!next.state.selection.empty && !media);
    },
  });

  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);

  async function upload(event: ChangeEvent<HTMLInputElement>, kind: "image" | "audio") {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true); setProgress(0);
    try {
      const uploadFile = kind === "image" ? await prepareImageUpload(file) : file;
      const form = new FormData(); form.append(kind === "image" ? "image" : "audio", uploadFile);
      if (articleId) form.append("article_id", String(articleId));
      if (kind === "image") form.append("alt_text", file.name);
      const result = await api<Upload>(kind === "image" ? "/media/upload" : "/media/upload-audio", { method: "POST", body: form, onUploadProgress: setProgress }, token);
      if (!result.url) throw new Error("A API não devolveu o endereço do ficheiro.");
      if (kind === "image") editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      else editor.chain().focus().insertContent({ type: "audio", attrs: { src: result.url } }).run();
    } catch (error) { window.alert(error instanceof Error ? error.message : "Não foi possível enviar o ficheiro."); }
    finally { setUploading(false); event.target.value = ""; }
  }

  function setLink() {
    if (!editor) return;
    const href = window.prompt("Endereço do link", editor.getAttributes("link").href || "https://");
    if (href === null) return;
    if (!href) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }
  if (!editor) return <p className="muted">A carregar editor…</p>;
  const clean = variant === "clean";
  return <div className={`visual-editor${clean ? " is-clean" : ""}`}>
    <div className={`toolbar${clean ? " is-clean" : ""}`} role="toolbar" aria-label="Ferramentas do editor">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Título</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>Subtítulo</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numeração</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Citação</button>
      <button type="button" onClick={() => imageInput.current?.click()}>Imagem</button>
      <button type="button" onClick={() => audioInput.current?.click()}>Áudio</button>
      <input ref={imageInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, "image")} />
      <input ref={audioInput} hidden type="file" accept="audio/mpeg,audio/ogg,audio/wav,audio/flac,audio/mp4,.mp3,.ogg,.wav,.flac,.m4a" onChange={(event) => upload(event, "audio")} />
    </div>
    {hasSelection && <div className="bubble-menu" role="toolbar" aria-label="Formatação do texto seleccionado">
      <button type="button" className={editor.isActive("bold") ? "active" : ""} onClick={() => editor.chain().focus().toggleBold().run()}><b>N</b></button>
      <button type="button" className={editor.isActive("italic") ? "active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" className={editor.isActive("underline") ? "active" : ""} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>S</u></button>
      <button type="button" onClick={setLink}>Link</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: "#fff3a3" }).run()}>Marca</button>
      <button type="button" className="red" onClick={() => editor.chain().focus().setColor("#b32424").run()}>A</button>
      <button type="button" onClick={() => editor.chain().focus().unsetColor().run()}>Normal</button>
    </div>}
    {selectedMedia && <div className="media-actions" role="toolbar"><span>{selectedMedia === "image" ? "Imagem seleccionada" : "Áudio seleccionado"}</span><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { editor.chain().focus().deleteSelection().run(); setSelectedMedia(null); }}>Remover do artigo</button></div>}
    <EditorContent editor={editor} />
    {uploading && <p className="upload-status">A adicionar ao armazenamento… {progress}%<progress value={progress} max="100" /></p>}
  </div>;
}
