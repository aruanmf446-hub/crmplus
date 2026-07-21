import Link from "next/link";
import { AuthForm } from "./AuthForm";
import { Brand } from "./Brand";
import { ProductIcon } from "./ProductIcon";

export function AuthPage({ mode }: { mode: "signup" | "login" | "forgot" }) {
  return (
    <main className="auth-page">
      <div className="auth-nav"><Brand /><Link href="/">Voltar ao início</Link></div>
      <div className="auth-layout">
        <aside className="auth-context">
          <p>Um ecossistema, seis rotinas.</p>
          <h2>Escolha o que sua empresa precisa agora.</h2>
          <div className="auth-apps">
            {["atlas", "artemis", "poseidon", "hercules", "pandora", "ares"].map((slug) => <span key={slug}><ProductIcon slug={slug} size={19} /></span>)}
          </div>
          <blockquote>Oficina, orçamento, restaurante, NPS, vendas e inspeções com a mesma experiência de uso.</blockquote>
        </aside>
        <AuthForm mode={mode} />
      </div>
    </main>
  );
}
