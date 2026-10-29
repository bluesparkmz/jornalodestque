"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, Category } from "../../lib/api";
import { useSession } from "../../components/session";
import { AdminFormSkeleton } from "../../components/skeletons";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DashboardCategorias() {
  const { token, user } = useSession();
  const [items, setItems] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    api<Category[]>("/categories")
      .then(setItems)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    try {
      await api<Category>(
        "/categories",
        { method: "POST", body: JSON.stringify({ name, slug: slugify(name), description: data.get("description") || null, parent_id: null }) },
        token,
      );
      form.reset();
      setMessage("Categoria criada.");
      setError("");
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar a categoria.");
    }
  }

  async function remove(id: number) {
    if (!token || !window.confirm("Eliminar esta categoria?")) return;
    try {
      await api<void>(`/categories/${id}`, { method: "DELETE" }, token);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível eliminar.");
    }
  }

  if (loading || !token || !user) return <AdminFormSkeleton />;

  return (
    <div>
      <div className="dash-page-head">
        <div>
          <h1>Categorias</h1>
          <p className="muted">Organize as secções do jornal.</p>
        </div>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="dash-panels">
        <div className="dash-form">
          <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 17 }}>Nova categoria</h2>
          <form onSubmit={submit}>
            <label>Nome<input name="name" required /></label>
            <label>Descrição<textarea name="description" /></label>
            <button type="submit">Criar categoria</button>
          </form>
        </div>

        <div className="dash-card">
          <h2>Existentes ({items.length})</h2>
          {items.length ? (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      {category.description && <div className="muted">{category.description}</div>}
                    </td>
                    <td className="muted">{category.slug}</td>
                    <td>
                      <button type="button" className="link-button" onClick={() => remove(category.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="dash-empty">Ainda não há categorias.</div>
          )}
        </div>
      </div>
    </div>
  );
}
