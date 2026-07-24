import type { Metadata } from "next";
import "./globals.css";
import "./singular-apps.css";
import "./catalog-media.css";
import "./storefront-polish.css";
import "./webdesign-upgrade.css";
import "./commercial-cover-fix.css";
import "./isolated-access.css";
import "./app-footer.css";
import "./list-navigation.css";
import "./workspace-ux-audit.css";
import "./theme-system.css";
import "./system-states.css";
import "./legal-pages.css";
import "./showcase-controls.css";
import "./workspace-viewport.css";
import "./workspace-art-direction.css";

const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA || "local";

export const metadata: Metadata = {
  title: { default: "CRMPlus+ | Sistemas para pequenas empresas", template: "%s | CRMPlus+" },
  description: "Encontre aplicativos de gestão criados para oficinas, restaurantes, pet shops, imobiliárias, bibliotecas, eventos, construtoras e outros segmentos.",
  robots: { index: true, follow: true },
  other: { "crmplus-build": buildSha },
  openGraph: {
    title: "CRMPlus+ | Encontre o sistema ideal para o seu negócio",
    description: "Pesquise por segmento, veja prévias e conheça aplicativos criados para rotinas específicas.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body data-build-sha={buildSha}>{children}</body></html>;
}
