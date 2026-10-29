"use client";
import { useEffect, useState } from "react";
import { api, Category } from "../lib/api";

export function CategorySelect({ selected, onChange }: { selected: number[]; onChange: (ids: number[]) => void }) {
  const [items, setItems] = useState<Category[]>([]);
  useEffect(() => { api<Category[]>("/categories").then(setItems).catch(() => setItems([])); }, []);
  const chosen = items.filter((item) => selected.includes(item.id));
  return <label>Categorias<select value="" onChange={(event) => { const id = Number(event.target.value); if (id && !selected.includes(id)) onChange([...selected, id]); }}><option value="">Seleccionar categoria…</option>{items.filter((item) => !selected.includes(item.id)).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{chosen.length > 0 && <span className="selected-categories">{chosen.map((category) => <button type="button" key={category.id} onClick={() => onChange(selected.filter((id) => id !== category.id))}>{category.name} ×</button>)}</span>}{!items.length && <small className="muted">Crie categorias em Administração → Categorias.</small>}</label>;
}
