import Link from "next/link";
import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link href="/#solucoes">Soluções</Link>
          <Link href="/#proposta">Como funciona</Link>
          <Link className="header-cta" href="/#solucoes">Conhecer os apps</Link>
        </nav>
      </div>
    </header>
  );
}
