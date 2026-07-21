import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CRM Plus Store | Apps para organizar sua operação",
    template: "%s | CRM Plus Store",
  },
  description:
    "Aplicativos para oficinas, restaurantes, vendas, rotinas, pesquisas e orçamentos em uma experiência clara e conectada.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
