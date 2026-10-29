"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, mediaUrl } from "../../lib/api";
import { useSession } from "../../components/session";
import { AdminListSkeleton } from "../../components/skeletons";

type Newspaper = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  issue_number: string | null;
  cover_url: string | null;
  price: number;
  currency: string;
};

export default function DashboardJornais() {
  const { token } = useSession();
  const [items, setItems] = useState<Newspaper[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Newspaper[]>("/newspapers")
      .then(setItems)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <AdminListSkeleton />;

  return (
    <div>
      <div className="dash-page-head">
        <div>
          <h1>Jornais digitais</h1>
          <p className="muted">Edições PDF com capa e pagamento M-Pesa.</p>
        </div>
        <div className="dash-actions">
          <Link className="button" href="/dashboard/jornais/novo">Publicar jornal</Link>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {items.length ? (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Capa</th>
              <th>Título</th>
              <th>Edição</th>
              <th>Preço</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((newspaper) => (
              <tr key={newspaper.id}>
                <td>
                  {newspaper.cover_url ? (
                    <img src={mediaUrl(newspaper.cover_url) ?? ""} alt="" />
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  <strong>{newspaper.title}</strong>
                  {newspaper.description && <div className="muted">{newspaper.description}</div>}
                </td>
                <td>{newspaper.issue_number || "—"}</td>
                <td>{newspaper.price} {newspaper.currency}</td>
                <td><Link href={`/jornais/${newspaper.slug}`} target="_blank">Ver no site</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="dash-empty">
          Ainda não há jornais. <Link href="/dashboard/jornais/novo">Publicar o primeiro</Link>
        </div>
      )}
    </div>
  );
}
