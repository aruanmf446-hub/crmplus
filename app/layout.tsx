import type { Metadata } from "next";
import "./globals.css";
import "./compact.css";
import "./singular-apps.css";

export const metadata: Metadata = {
  title: { default: "CRMPlus+ | Ambiente demonstrativo", template: "%s | CRMPlus+" },
  description: "Demonstração local de seis aplicativos independentes do CRMPlus+.",
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
