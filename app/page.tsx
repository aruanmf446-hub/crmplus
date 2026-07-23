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
      <main className="home-page" data-catalog-build="20260722-29">
        <section className="home-hero" id="inicio">
          <div className="shell home-hero-grid">
            <div className="home-hero-copy">
              <h1>Sistemas simples para <em>rotinas específicas.</em></h1>
              <p className="home-lead">Escolha um aplicativo criado para o seu tipo de negócio, veja o produto por dentro e conheça as funções antes de decidir.</p>
              <div className="home-actions">
                <a className="home-button home-button-primary" href="#sistemas">Explorar aplicativos</a>
              </div>
              <p className="home-note">Cada aplicativo possui identidade, fluxo e área de acesso próprios.</p>
            </div>
            <HomeProductShowcase />
          </div>
        </section>

        <HomeCatalog products={orderedProducts} />
      </main>
      <Footer />
    </>
  );
}
