"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, mediaUrl } from "../lib/api";
import { SectionTitle } from "../components/ui";
import { JornaisSkeleton } from "../components/skeletons";

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

export default function Newspapers() {
  const [items, setItems] = useState<Newspaper[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Newspaper[]>("/newspapers")
      .then(setItems)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <JornaisSkeleton />;

  return (
    <div className="container page-shell">
      <SectionTitle title="Jornais digitais" />
      <p className="page-intro">Compre edições digitais e descarregue o PDF completo.</p>
      {error && <p className="error">{error}</p>}
      <div className="newspaper-grid">
        {items.map((newspaper) => (
          <article key={newspaper.id} className="newspaper-card">
            {newspaper.cover_url && (
              <img src={mediaUrl(newspaper.cover_url) ?? ""} alt={`Capa de ${newspaper.title}`} />
            )}
            <div className="newspaper-card__body">
              <h2>{newspaper.title}</h2>
              {newspaper.issue_number && <p>{newspaper.issue_number}</p>}
              <p><strong>{newspaper.price} {newspaper.currency}</strong></p>
              <Link className="button" href={`/jornais/${newspaper.slug}`}>Comprar</Link>
            </div>
          </article>
        ))}
      </div>
      {!error && !items.length && <div className="empty-state">Ainda não há jornais publicados.</div>}
    </div>
  );
}
