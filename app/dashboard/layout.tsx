import type { Metadata } from "next";
import { DashboardShell } from "../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Painel | O Destaque",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
