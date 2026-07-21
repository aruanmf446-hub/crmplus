import Link from "next/link";
import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link href="/#sistemas">Apps</Link>
          <Link href="/#proposta">Experiência</Link>
          <Link className="header-cta" href="/sistemas/atlas">Ver demonstração</Link>
        </nav>
      </div>
    </header>
  );
}
