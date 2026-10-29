import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.scss";
import "./dashboard.scss";
import "./gutenberg.scss";
import "./editor.scss";
import "./cover.scss";
import { SiteShell } from "./components/site-shell";
import { SessionProvider } from "./components/session";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "O Destaque",
  description: "Jornal O Destaque — notícias, magazine e actualidade",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>
        <SessionProvider>
          <Suspense fallback={<main>{children}</main>}>
            <SiteShell>{children}</SiteShell>
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
