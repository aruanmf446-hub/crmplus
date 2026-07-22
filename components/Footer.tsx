import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer home-footer">
      <div className="shell home-footer-grid">
        <div className="home-footer-brand"><Brand /><p>Aplicativos independentes para pequenas empresas organizarem rotinas específicas com clareza.</p></div>
        <div className="footer-mini-menus" aria-label="Informações institucionais">
          <details><summary>Privacidade <span>+</span></summary><p>Cada aplicativo possui uma área exclusiva para a rotina da empresa.</p></details>
          <details><summary>Termos <span>+</span></summary><p>As condições de uso e contratação serão apresentadas de forma clara em cada produto.</p></details>
          <details><summary>Sobre o CRMPlus+ <span>+</span></summary><p>A CRMPlus Store reúne sistemas singulares para diferentes tipos de negócio.</p></details>
        </div>
      </div>
      <div className="shell home-footer-bottom"><span>Copyright © 2026 CRMPlus+</span></div>
    </footer>
  );
}
