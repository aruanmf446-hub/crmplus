import type { Metadata } from "next";
import "./globals.css";
import "./compact.css";
import "./singular-apps.css";

export const metadata: Metadata = {
  title: {
    default: "CRMPlus+ | O controle do seu negócio",
    template: "%s | CRMPlus+",
  },
  description:
    "Sistemas para oficinas, orçamentos, restaurantes, pesquisas NPS, vendas e checklists de inspeção.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
