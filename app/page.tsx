import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeCatalog } from "@/components/HomeCatalog";
import { products } from "@/lib/apps";
import { getProductMedia } from "@/lib/storefront";

export default function Home() {
  const orderedProducts = [...products].sort((first, second) => {
    const firstHasCover = getProductMedia(first.slug).hasCover ? 1 : 0;
    const secondHasCover = getProductMedia(second.slug).hasCover ? 1 : 0;
    return secondHasCover - firstHasCover;
  });

  return (
    <>
      <Header />
      <main className="home-page" data-catalog-build="20260722-13">
        <section className="home-hero" id="inicio">
          <div className="shell home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">CRMPlus+ para pequenas empresas</p>
              <h1>Sistemas simples para <em>rotinas específicas.</em></h1>
              <p className="home-lead">Escolha um aplicativo criado para o seu tipo de negócio, conheça o design e teste as funções do protótipo antes de decidir.</p>
              <div className="home-actions">
                <a className="home-button home-button-primary" href="#sistemas">Explorar aplicativos</a>
                <Link className="home-button home-button-secondary" href="/entrar">Entrar</Link>
              </div>
              <p className="home-note">Cada aplicativo possui identidade, fluxo e área interna próprios.</p>
            </div>

            <div className="home-product-showcase" aria-label="Exemplos de aplicativos CRMPlus+">
              <article className="home-showcase-card"><span>Oficinas</span><strong>Atlas</strong><small>Veículos, ordens de serviço e histórico de atendimento.</small></article>
              <article className="home-showcase-card"><span>Orçamentos</span><strong>Ares</strong><small>Propostas profissionais com validade e decisão do cliente.</small></article>
              <article className="home-showcase-card"><span>Pet shops</span><strong>Pegasus</strong><small>Agenda, cuidados, alertas e histórico de cada pet.</small></article>
              <article className="home-showcase-card"><span>Vendas</span><strong>Poseidon</strong><small>Oportunidades, contatos e próximas ações comerciais.</small></article>
            </div>
          </div>
        </section>

        <HomeCatalog products={orderedProducts} />

        <section className="home-closing">
          <div className="shell home-closing-inner">
            <div><p className="home-kicker">Um produto para cada rotina</p><h2>Conheça o aplicativo antes de escolher o plano.</h2></div>
            <a className="home-button home-button-light" href="#sistemas">Explorar aplicativos</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
