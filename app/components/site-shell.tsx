"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { BackToTop } from "./back-to-top";

function HeaderFallback() {
  return <div className="nav-wrap" style={{ minHeight: 84 }} aria-hidden="true" />;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <div className="dashboard-root">{children}</div>;
  }

  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
