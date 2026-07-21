import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p>Sistemas diretos para pequenas empresas organizarem o trabalho.</p>
        </div>
        <div className="footer-products">
          <span>Soluções</span>
          <Link href="/apps/atlas">Atlas</Link>
          <Link href="/apps/artemis">Artemis</Link>
          <Link href="/apps/poseidon">Poseidon</Link>
          <Link href="/apps/hercules">Hercules</Link>
          <Link href="/apps/pandora">Pandora</Link>
          <Link href="/apps/ares">Ares</Link>
        </div>
      </div>
      <div className="shell footer-bottom">© 2026 CRM Plus Store. Estrutura inicial do produto.</div>
    </footer>
  );
}
