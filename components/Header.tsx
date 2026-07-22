import Link from "next/link";
import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="site-header home-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link href="/#sistemas">Aplicativos</Link>
          <Link className="header-cta" href="/entrar">Acessar aplicativo</Link>
        </nav>
      </div>
    </header>
  );
}
