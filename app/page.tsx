import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductScene } from "@/components/ProductScene";
import { ProductIcon } from "@/components/ProductIcon";
import { products, type Product } from "@/lib/apps";

const homeTitles: Record<string, string> = {
  atlas: "Sistema de oficina",
  ares: "Sistema de orçamento",
  artemis: "Sistema de restaurante",
  pandora: "Sistema de NPS",
  poseidon: "Sistema de funil de vendas",
  hercules: "Sistema de checklist de inspeção",
  zeus: "Sistema de gestão de frotas",
  alexandria: "Sistema de biblioteca",
  olympus: "Sistema de imobiliária",
  argus: "Sistema de patrimônio",
  hermes: "Sistema de eventos",
  athena: "Sistema de licitações",
  gaia: "Sistema de produção rural",
  pegasus: "Sistema para pet shop",
  titans: "Sistema para construtora",
};

function getHomeTitle(product: Product) {
  return homeTitles[product.slug] ?? `Sistema para ${product.category.toLowerCase()}`;
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="home-page">
        <section className="home-hero" id="inicio">
          <div className="shell home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">CRMPlus+ para pequenas empresas</p>
              <h1>Aplicativos simples para <em>operações que precisam de clareza.</em></h1>
              <p className="home-lead">Cada sistema resolve uma rotina específica. Sem módulos desnecessários e sem misturar negócios diferentes.</p>
              <div className="home-actions">
                <Link className="home-button home-button-primary" href="/criar-conta">Criar conta local</Link>
                <Link className="home-button home-button-secondary" href="/entrar">Entrar</Link>
              </div>
              <p className="home-note">Ambiente demonstrativo. Contas e registros ficam somente no navegador utilizado.</p>
            </div>

            <div className="home-product-preview" aria-label="Prévia do CRMPlus+ Atlas">
              <div className="home-preview-top">
                <span><ProductIcon slug="atlas" size={19} /> CRMPlus+ Atlas</span>
                <small>Central operacional</small>
              </div>
              <div className="home-preview-body">
                <div className="home-preview-heading"><div><small>Prioridades de hoje</small><strong>A oficina sem pontos cegos.</strong></div><b>Nova OS</b></div>
                <div className="home-preview-numbers"><span><b>05</b>Entradas</span><span><b>03</b>Em serviço</span><span><b>02</b>Para entrega</span></div>
                <div className="home-preview-flow">
                  <PreviewLane title="Avaliação" items={["Nivus · 28 min", "Onix · chegada"]} />
                  <PreviewLane title="Em serviço" items={["T-Cross · OS 1050", "Strada · OS 1048"]} />
                  <PreviewLane title="Entrega" items={["HB20 · conferência", "Saveiro · cliente avisado"]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-products" id="sistemas">
          <div className="shell">
            <div className="home-section-heading">
              <p className="home-kicker">{products.length} produtos independentes</p>
              <h2>Uma experiência própria para cada tipo de operação.</h2>
              <p>Abra as demonstrações e valide fluxos, identidade e usabilidade antes da integração com serviços externos.</p>
            </div>
            <div className="home-card-grid">
              {products.map((product) => {
                const title = getHomeTitle(product);
                return (
                  <article className="home-product-card" key={product.slug} style={{ "--product-color": product.color, "--product-soft": product.colorSoft } as React.CSSProperties}>
                    <ProductScene slug={product.slug} label={`Prévia do ${title}`} />
                    <div className="home-card-copy">
                      <div className="home-card-name"><span><ProductIcon slug={product.slug} size={20} /></span><small>CRMPlus+ {product.shortName}</small></div>
                      <h3>{title}</h3>
                      <p>{product.description}</p>
                      <Link href={`/sistemas/${product.slug}`}>Abrir demonstração <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-closing">
          <div className="shell home-closing-inner">
            <div><p className="home-kicker">Teste antes de integrar</p><h2>Dados fictícios, experiência real de produto.</h2></div>
            <Link className="home-button home-button-light" href="/criar-conta">Criar conta local</Link>
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
