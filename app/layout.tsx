import type { Metadata } from "next";
import { WorkspaceMenuToggle } from "@/components/WorkspaceMenuToggle";
import { ColorModeToggle } from "@/components/ColorModeToggle";
import "./globals.css";
import "./compact.css";
import "./singular-apps.css";
import "./catalog-media.css";
import "./storefront-polish.css";
import "./webdesign-upgrade.css";
import "./commercial-cover-fix.css";
import "./workspace-atlas.css";
import "./workspace-ares.css";
import "./workspace-artemis.css";
import "./workspace-pandora.css";
import "./workspace-poseidon.css";
import "./workspace-hercules.css";
import "./workspace-utilities.css";
import "./isolated-access.css";
import "./workspace-ux-audit.css";
import "./app-footer.css";
import "./sidebar-toggle.css";
import "./dark-mode.css";
import "./list-navigation.css";
import "./dark-mode-strict.css";
import "./dark-mode-final-overrides.css";

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
  return <html lang="pt-BR"><body data-build-sha={buildSha}>{children}<WorkspaceMenuToggle /><ColorModeToggle /></body></html>;
}
