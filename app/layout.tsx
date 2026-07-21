import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CRM Plus Store | Sistemas simples para pequenas empresas",
    template: "%s | CRM Plus Store",
  },
  description:
    "Aplicativos de gestão simples para oficinas, restaurantes, vendas, checklists, pesquisas e orçamentos.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
