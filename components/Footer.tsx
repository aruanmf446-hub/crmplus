import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer home-footer">
      <div className="shell home-footer-grid">
        <div className="home-footer-brand"><Brand /><p>Ferramentas diretas para acompanhar a rotina da sua empresa.</p></div>
        <div className="footer-mini-menus" aria-label="Informações institucionais">
          <details><summary>Privacidade <span>+</span></summary><p>Seus dados pertencem à sua empresa. Nesta versão interna, nenhum formulário envia ou armazena informações em servidores.</p></details>
          <details><summary>Termos <span>+</span></summary><p>O ambiente atual é um protótipo de desenvolvimento com dados fictícios, criado para avaliação dos fluxos e do design.</p></details>
          <details><summary>Sobre nós <span>+</span></summary><p>O CRMPlus+ cria sistemas objetivos para pequenas empresas acompanharem tarefas essenciais em um só ecossistema.</p></details>
        </div>
      </div>
      <div className="shell home-footer-bottom"><span>Copyright © 2026 CRMPlus+</span><Link href="/entrar">Acesso interno</Link></div>
    </footer>
  );
}
