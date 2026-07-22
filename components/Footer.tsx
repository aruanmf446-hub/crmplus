import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer home-footer">
      <div className="shell home-footer-grid">
        <div className="home-footer-brand"><Brand /><p>Aplicativos independentes para pequenas empresas organizarem rotinas específicas com clareza.</p></div>
        <div className="footer-mini-menus" aria-label="Informações institucionais">
          <details><summary>Privacidade <span>+</span></summary><p>Neste protótipo, contas e registros ficam somente no navegador usado para testar cada aplicativo.</p></details>
          <details><summary>Termos <span>+</span></summary><p>O ambiente atual é um rascunho de design e funções, criado para avaliação dos fluxos antes da infraestrutura definitiva.</p></details>
          <details><summary>Sobre o CRMPlus+ <span>+</span></summary><p>O CRMPlus+ reúne uma vitrine de produtos singulares. Cada aplicativo possui propósito, entrada e área operacional próprios.</p></details>
        </div>
      </div>
      <div className="shell home-footer-bottom"><span>Copyright © 2026 CRMPlus+</span><Link href="/entrar">Acessar aplicativo</Link></div>
    </footer>
  );
}
