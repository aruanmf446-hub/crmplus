import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer home-footer">
      <div className="shell home-footer-grid">
        <div className="home-footer-brand"><Brand /><p>Aplicativos independentes para pequenas empresas organizarem rotinas específicas com clareza.</p></div>
        <nav className="footer-mini-menus footer-document-links" aria-label="Informações institucionais">
          <Link href="/privacidade"><strong>Privacidade</strong><span>Como os dados locais são tratados</span></Link>
          <Link href="/termos"><strong>Termos de uso</strong><span>Limites e condições da demonstração</span></Link>
          <Link href="/#sistemas"><strong>Aplicativos</strong><span>Conheça os sistemas CRMPlus+</span></Link>
        </nav>
      </div>
      <div className="shell home-footer-bottom"><span>Desenvolvido por CRM Plus · © 2026</span></div>
    </footer>
  );
}
