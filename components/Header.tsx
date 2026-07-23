import Link from "next/link";
import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="site-header home-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link href="/#sistemas">Aplicativos</Link>
          <Link className="home-login-link" href="/entrar">Entrar</Link>
          <Link className="header-cta" href="/criar-conta">Criar conta</Link>
        </nav>
      </div>
    </header>
  );
}
