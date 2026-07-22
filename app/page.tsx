import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeCatalog } from "@/components/HomeCatalog";
import { ProductIcon } from "@/components/ProductIcon";
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
      <main className="home-page" data-catalog-build="20260722-11">
        <section className="home-hero" id="inicio">
          <div className="shell home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">CRMPlus+ para pequenas empresas</p>
              <h1>Encontre o sistema ideal <em>para o seu negócio.</em></h1>
              <p className="home-lead">Pesquise pelo seu segmento, filtre as opções e conheça somente os aplicativos que fazem sentido para a sua rotina.</p>
              <div className="home-actions">
                <a className="home-button home-button-primary" href="#sistemas">Encontrar meu sistema</a>
                <Link className="home-button home-button-secondary" href="/entrar">Entrar</Link>
              </div>
              <p className="home-note">Capas 1:1, prévias em vídeo e páginas comerciais próprias para cada aplicativo.</p>
            </div>

            <div className="home-product-preview" aria-label="Prévia do catálogo interativo CRMPlus+">
              <div className="home-preview-top">
                <span><ProductIcon slug="pandora" size={19} /> CRMPlus+ Store</span>
                <small>Descoberta por segmento</small>
              </div>
              <div className="home-preview-body">
                <div className="home-preview-heading"><div><small>Encontre sem perder tempo</small><strong>Pesquise. Filtre. Conheça.</strong></div><b>{products.length} apps</b></div>
                <div className="home-preview-numbers"><span><b>01</b>Escolha o segmento</span><span><b>02</b>Veja a prévia</span><span><b>03</b>Conheça os planos</span></div>
                <div className="home-preview-flow">
                  <PreviewLane title="Pesquisar" items={["Pet shop", "Oficina"]} />
                  <PreviewLane title="Filtrar" items={["Automotivo", "Serviços"]} />
                  <PreviewLane title="Descobrir" items={["Pegasus", "Atlas"]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeCatalog products={orderedProducts} />

        <section className="home-closing">
          <div className="shell home-closing-inner">
            <div><p className="home-kicker">Uma experiência para cada negócio</p><h2>Conheça o aplicativo antes de escolher o plano.</h2></div>
            <a className="home-button home-button-light" href="#sistemas">Explorar aplicativos</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PreviewLane({ title, items }: { title: string; items: string[] }) {
  return <div><small>{title}</small>{items.map((item) => <span key={item}>{item}<i /></span>)}</div>;
}
