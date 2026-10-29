"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { useSession } from "../components/session";
import { SectionTitle } from "../components/ui";

export default function Login() {
  const { login } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identity: form.get("identity"), password: form.get("password") }),
      });
      await login(data.access_token);
      router.push("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Erro ao entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page-shell">
      <div className="narrow">
        <SectionTitle title="Entrar" />
        <p className="page-intro">Aceda ao painel de controlo do Jornal O Destaque.</p>
        <form method="post" action="/login" onSubmit={submit}>
          <label>
            Email ou utilizador
            <input name="identity" autoComplete="username" required />
          </label>
          <label>
            Palavra-passe
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? "A entrar…" : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}
