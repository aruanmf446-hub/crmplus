import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeCatalog } from "@/components/HomeCatalog";
import { HomeProductShowcase } from "@/components/HomeProductShowcase";
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
      <main className="home-page" data-catalog-build="20260722-14">
        <section className="home-hero" id="inicio">
          <div className="shell home-hero-grid">
            <div className="home-hero-copy">
              <h1>Sistemas simples para <em>rotinas específicas.</em></h1>
              <p className="home-lead">Escolha um aplicativo criado para o seu tipo de negócio, veja o produto por dentro e teste o protótipo antes de decidir.</p>
              <div className="home-actions">
                <a className="home-button home-button-primary" href="#sistemas">Explorar aplicativos</a>
                <Link className="home-button home-button-secondary" href="/entrar">Acessar aplicativo</Link>
              </div>
              <p className="home-note">Cada aplicativo possui identidade, fluxo, conta local e área interna próprios.</p>
            </div>
            <HomeProductShowcase />
          </div>
        </section>

        <HomeCatalog products={orderedProducts} />

        <section className="home-closing">
          <div className="shell home-closing-inner">
            <div><h2>Conheça o aplicativo antes de escolher o plano.</h2><p>Abra a demonstração, navegue pelas telas e avalie as funções do protótipo.</p></div>
            <a className="home-button home-button-light" href="#sistemas">Ver todos os aplicativos</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
