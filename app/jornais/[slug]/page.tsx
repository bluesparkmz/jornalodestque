"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_URL, api, mediaUrl } from "../../lib/api";
import { useSession } from "../../components/session";
import { SectionTitle } from "../../components/ui";
import { CheckoutSkeleton } from "../../components/skeletons";

type Newspaper = {
  id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  currency: string;
};
type Purchase = { id: number; status: string; checkout_token: string | null };

function CheckoutInner() {
  const { slug } = useParams<{ slug: string }>();
  const { user, token } = useSession();
  const [newspaper, setNewspaper] = useState<Newspaper | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    api<Newspaper>(`/newspapers/${slug}`).then(setNewspaper).catch((reason: Error) => setError(reason.message));
  }, [slug]);

  const checkStatus = useCallback(async () => {
    if (!purchase) return;
    const checkoutToken = purchase.checkout_token ?? localStorage.getItem(`purchase-${purchase.id}`);
    try {
      const item = await api<Purchase>(
        `/newspapers/purchases/${purchase.id}?token=${encodeURIComponent(checkoutToken ?? "")}`,
        {},
        token ?? undefined,
      );
      setPurchase(item);
      if (item.status === "paid") setMessage("Pagamento confirmado. Já pode descarregar.");
      if (item.status === "failed") setMessage("O pagamento não foi confirmado.");
    } catch {
      /* A próxima consulta automática tenta novamente. */
    }
  }, [purchase, token]);

  useEffect(() => {
    if (!purchase || purchase.status !== "pending") return;
    const polling = window.setInterval(() => { void checkStatus(); }, 4000);
    return () => window.clearInterval(polling);
  }, [purchase, checkStatus]);

  useEffect(() => {
    if (!purchase || purchase.status !== "pending") return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [purchase?.id, purchase?.status]);

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newspaper) return;
    const data = new FormData(event.currentTarget);
    setError("");
    try {
      const item = await api<Purchase>(
        `/newspapers/${newspaper.id}/purchase`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.get("name") || null,
            email: data.get("email") || null,
            msisdn: data.get("msisdn") || null,
          }),
        },
        token ?? undefined,
      );
      setPurchase(item);
      setSeconds(0);
      if (item.checkout_token) localStorage.setItem(`purchase-${item.id}`, item.checkout_token);
      setMessage(item.status === "paid" ? "Compra confirmada." : "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível iniciar a compra.");
    }
  }

  if (!newspaper && !error) return <CheckoutSkeleton />;

  if (!newspaper) {
    return <div className="container page-shell"><p className="error">{error}</p></div>;
  }

  const checkoutToken = purchase?.checkout_token ?? (purchase ? localStorage.getItem(`purchase-${purchase.id}`) : null);
  const waiting = purchase?.status === "pending";

  return (
    <div className="container page-shell checkout">
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href="/jornais">Jornais</Link>
        <span>/</span>
        <span>{newspaper.title}</span>
      </div>
      <SectionTitle title={newspaper.title} />
      <div className="checkout-layout">
        {newspaper.cover_url && (
          <img className="checkout-cover" src={mediaUrl(newspaper.cover_url) ?? ""} alt={`Capa de ${newspaper.title}`} />
        )}
        <div className="checkout-details">
          <p>{newspaper.description}</p>
          <p><strong>{newspaper.price} {newspaper.currency}</strong></p>
          {message && <p className={purchase?.status === "failed" ? "error" : "success"}>{message}</p>}
          {error && <p className="error">{error}</p>}
          {(!purchase || purchase.status === "failed") && (
            <form onSubmit={start}>
              {!user && (
                <>
                  <label>Nome<input name="name" required /></label>
                  <label>E-mail<input name="email" type="email" required /></label>
                </>
              )}
              <label>Número M-Pesa<input name="msisdn" inputMode="numeric" placeholder="84xxxxxxxx" required /></label>
              <button type="submit">{purchase?.status === "failed" ? "Tentar pagamento novamente" : "Comprar e pedir pagamento"}</button>
            </form>
          )}
          {waiting && <p className="success">Aguardando a sua confirmação. {seconds}s</p>}
          {purchase?.status === "paid" && (
            <a
              className="button"
              href={`${API_URL}/newspapers/purchases/${purchase.id}/download?token=${encodeURIComponent(checkoutToken ?? "")}`}
            >
              Descarregar jornal
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutInner />
    </Suspense>
  );
}
