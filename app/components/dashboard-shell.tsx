"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useSession } from "./session";
import { AdminHomeSkeleton } from "./skeletons";

type NavItem = {
  href: string;
  label: string;
  match: (p: string) => boolean;
  roles?: string[];
  icon: "home" | "news" | "tags" | "paper" | "users" | "site" | "logout";
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: "home", match: (p) => p === "/dashboard" },
  { href: "/dashboard/noticias", label: "Notícias", icon: "news", match: (p) => p.startsWith("/dashboard/noticias"), roles: ["admin", "editor", "author"] },
  { href: "/dashboard/categorias", label: "Categorias", icon: "tags", match: (p) => p.startsWith("/dashboard/categorias"), roles: ["admin", "editor"] },
  { href: "/dashboard/jornais", label: "Jornais", icon: "paper", match: (p) => p.startsWith("/dashboard/jornais"), roles: ["admin", "editor"] },
  { href: "/dashboard/utilizadores", label: "Utilizadores", icon: "users", match: (p) => p.startsWith("/dashboard/utilizadores"), roles: ["admin"] },
];

function NavIcon({ name }: { name: NavItem["icon"] }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "home":
      return <svg {...props}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></svg>;
    case "news":
      return <svg {...props}><path d="M5 5h11a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2z" /><path d="M8 9h7M8 13h7M8 17h4" /><path d="M18 7h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3" /></svg>;
    case "tags":
      return <svg {...props}><path d="M20 12.5 12.5 20a2 2 0 0 1-2.8 0L4 14.3V4h10.3z" /><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" /></svg>;
    case "paper":
      return <svg {...props}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>;
    case "users":
      return <svg {...props}><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3" /><path d="M20 20v-1.2a3 3 0 0 0-2.2-2.9" /><path d="M16.5 5.2a3 3 0 0 1 0 5.6" /></svg>;
    case "site":
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
    case "logout":
      return <svg {...props}><path d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" /><path d="M14 16l5-4-5-4M19 12H10" /></svg>;
  }
}

function isEditorPath(pathname: string) {
  return pathname === "/dashboard/noticias/novo" || /^\/dashboard\/noticias\/\d+\/?$/.test(pathname);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user && !["admin", "editor", "author"].includes(user.role)) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || !user) return <AdminHomeSkeleton />;

  const links = NAV.filter((item) => !item.roles || item.roles.includes(user.role));
  const isEditor = isEditorPath(pathname);
  const initials = (user.display_name || user.username || "A").slice(0, 1).toUpperCase();

  if (isEditor) {
    return <div className="dash-editor-only">{children}</div>;
  }

  return (
    <div className={`dash${open ? " is-open" : ""}`}>
      <aside className="dash-sidebar">
        <div className="dash-sidebar__brand">
          <Logo compact href="/dashboard" />
          <span className="dash-sidebar__badge">Painel admin</span>
        </div>

        <p className="dash-nav__section">Menu</p>
        <nav className="dash-nav">
          {links.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav__link${active ? " is-active" : ""}`}
              >
                <span className="dash-nav__icon"><NavIcon name={item.icon} /></span>
                <span className="dash-nav__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="dash-sidebar__foot">
          <p className="dash-nav__section">Conta</p>
          <Link href="/" className="dash-nav__link">
            <span className="dash-nav__icon"><NavIcon name="site" /></span>
            <span className="dash-nav__label">Ver site</span>
          </Link>
          <button type="button" className="dash-nav__link dash-nav__logout" onClick={logout}>
            <span className="dash-nav__icon"><NavIcon name="logout" /></span>
            <span className="dash-nav__label">Sair</span>
          </button>

          <div className="dash-user-card">
            <span className="dash-user-card__avatar">{initials}</span>
            <div className="dash-user-card__meta">
              <strong>{user.display_name || user.username}</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <button type="button" className="dash-menu" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            <span /><span /><span />
          </button>
          <div className="dash-topbar__title">Painel de controlo</div>
          <div className="dash-topbar__user">
            <strong>{user.display_name || user.username}</strong>
          </div>
        </header>
        <div className="dash-content">{children}</div>
      </div>
      {open && <button type="button" className="dash-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
    </div>
  );
}
