import type { Metadata } from "next";
import "./globals.css";
import "./compact.css";
import "./singular-apps.css";
import "./catalog-media.css";
import "./storefront-polish.css";
import "./workspace-atlas.css";
import "./workspace-ares.css";
import "./workspace-artemis.css";
import "./workspace-pandora.css";
import "./workspace-poseidon.css";
import "./workspace-hercules.css";
import "./workspace-utilities.css";
import "./isolated-access.css";

export const metadata: Metadata = {
  title: { default: "CRMPlus+ | Sistemas para pequenas empresas", template: "%s | CRMPlus+" },
  description: "Encontre aplicativos de gestão criados para oficinas, restaurantes, pet shops, imobiliárias, bibliotecas, eventos, construtoras e outros segmentos.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "CRMPlus+ | Encontre o sistema ideal para o seu negócio",
    description: "Pesquise por segmento, veja prévias e conheça aplicativos criados para rotinas específicas.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
