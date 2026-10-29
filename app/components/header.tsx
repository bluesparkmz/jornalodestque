"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api, Category } from "../lib/api";
import { formatTopbarDate } from "../lib/format";
import { Logo } from "./logo";
import { useSession } from "./session";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="nav-chevron" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" /></svg>;
}
function TwitterIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.2 1.7-2.1-.8.5-1.6.8-2.5 1A4 4 0 0 0 12 8.9c0 .3 0 .6.1.9-3.3-.2-6.3-1.8-8.3-4.2-.4.6-.5 1.2-.5 2 0 1.4.7 2.6 1.8 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.4 3.5 3.2 3.9-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.6 2 2.7 3.7 2.7A8 8 0 0 1 2 18.6 11.3 11.3 0 0 0 8.1 20c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.5 1.4-1.2 2-2z" /></svg>;
}
function InstagramIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5z" /></svg>;
}

export function Header() {
  const { user, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [today, setToday] = useState("");
  const isAdmin = user?.role === "admin";
  const canDashboard = ["admin", "editor", "author"].includes(user?.role ?? "");

  useEffect(() => {
    setToday(formatTopbarDate(new Date()));
    api<Category[]>("/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (current) setQuery(current);
  }, [searchParams]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setSearchOpen(true);
      searchInput.current?.focus();
      return;
    }
    setOpen(false);
    setSearchOpen(false);
    router.push(`/noticias?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__date">{today || "\u00a0"}</div>
          <div className="topbar__right">
            <ul className="topbar__links">
              <li><Link href="/categorias">Carreira</Link></li>
              <li><Link href="/categorias">Contacto</Link></li>
              <li>
                {user ? (
                  <span className="topbar__user">
                    <span>{user.display_name || user.username}</span>
                    <button type="button" className="link-button topbar__auth" onClick={logout}>Sair</button>
                  </span>
                ) : (
                  <Link href="/login">Entrar / Registar</Link>
                )}
              </li>
            </ul>
            <ul className="topbar__social">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon /></a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><TwitterIcon /></a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="nav-wrap">
        <div className="container nav-wrap__inner">
          <Logo />
          <button
            type="button"
            className={`nav-toggle${open ? " is-open" : ""}`}
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span /><span /><span />
          </button>

          <nav className={`main-nav${open ? " is-open" : ""}${searchOpen ? " is-searching" : ""}`}>
            <ul className="main-nav__list">
              <li className="has-dropdown">
                <Link href="/" className={pathname === "/" ? "is-active" : undefined}>Início <Chevron /></Link>
                <ul className="dropdown">
                  <li><Link href="/">Página inicial</Link></li>
                  <li><Link href="/noticias">Últimas notícias</Link></li>
                </ul>
              </li>
              <li className="has-dropdown">
                <Link href="/noticias" className={pathname.startsWith("/noticias") ? "is-active" : undefined}>Notícias <Chevron /></Link>
                <ul className="dropdown">
                  <li><Link href="/">Destaques</Link></li>
                  <li><Link href="/categorias">Por categoria</Link></li>
                </ul>
              </li>
              <li className="has-dropdown">
                <Link href="/categorias" className={pathname.startsWith("/categorias") ? "is-active" : undefined}>Categorias <Chevron /></Link>
                <ul className="dropdown">
                  {categories.slice(0, 8).map((category) => (
                    <li key={category.id}>
                      <Link href={`/categorias/${encodeURIComponent(category.slug)}`}>{category.name}</Link>
                    </li>
                  ))}
                  {!categories.length && <li><Link href="/categorias">Ver todas</Link></li>}
                </ul>
              </li>
              <li>
                <Link href="/jornais" className={pathname.startsWith("/jornais") ? "is-active" : undefined}>Jornais</Link>
              </li>
              <li>
                <Link href="/categorias">Contacto</Link>
              </li>
            </ul>
            {isAdmin && (
              <Link
                href="/dashboard"
                className={`nav-admin-btn${pathname.startsWith("/dashboard") ? " is-active" : ""}`}
              >
                Painel de admin
              </Link>
            )}
            {!isAdmin && canDashboard && user && (
              <Link href="/dashboard" className="nav-admin-btn">
                Painel
              </Link>
            )}
            <form className={`nav-search-form${searchOpen ? " is-open" : ""}`} onSubmit={submitSearch} role="search">
              <div className="nav-search-group">
                <input
                  ref={searchInput}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Pesquisar…"
                  aria-label="Pesquisar notícias"
                  minLength={2}
                />
                <button type="submit">Buscar</button>
              </div>
              <button
                type="button"
                className="nav-search-toggle"
                aria-label="Abrir pesquisa"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon />
              </button>
            </form>
          </nav>
        </div>
      </div>
    </header>
  );
}
