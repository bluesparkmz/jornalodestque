"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "../../lib/api";
import { useSession } from "../../components/session";
import { AdminFormSkeleton } from "../../components/skeletons";

export default function DashboardUtilizadores() {
  const { user, token, loading } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && user && user.role !== "admin") router.replace("/dashboard");
    if (user?.role === "admin" && token) {
      api<User[]>("/admin/users", {}, token)
        .then(setUsers)
        .catch((reason: Error) => setError(reason.message))
        .finally(() => setReady(true));
    }
  }, [user, token, loading, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const created = await api<User>(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            username: data.get("username"),
            email: data.get("email"),
            password: data.get("password"),
            display_name: data.get("display_name") || null,
            role: data.get("role"),
          }),
        },
        token,
      );
      setUsers([created, ...users]);
      form.reset();
      setMessage("Utilizador criado.");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Erro ao criar utilizador.");
    }
  }

  if (loading || !user || !token || !ready) return <AdminFormSkeleton />;

  return (
    <div>
      <div className="dash-page-head">
        <div>
          <h1>Utilizadores</h1>
          <p className="muted">Admins, editores, autores e leitores.</p>
        </div>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="dash-panels">
        <div className="dash-form">
          <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 17 }}>Novo utilizador</h2>
          <form onSubmit={submit}>
            <label>Nome de utilizador<input name="username" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Senha<input name="password" type="password" minLength={10} required /></label>
            <label>Nome visível<input name="display_name" /></label>
            <label>
              Papel
              <select name="role" defaultValue="author">
                <option value="reader">Leitor</option>
                <option value="author">Autor</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit">Criar utilizador</button>
          </form>
        </div>

        <div className="dash-card">
          <h2>Registados ({users.length})</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Email</th>
                <th>Papel</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.display_name || item.username}</strong>
                    <div className="muted">@{item.username}</div>
                  </td>
                  <td className="muted">{item.email}</td>
                  <td><span className="dash-status is-published">{item.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
