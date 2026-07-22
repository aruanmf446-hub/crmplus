import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductScene } from "@/components/ProductScene";
import { ProductIcon } from "@/components/ProductIcon";
import { products } from "@/lib/apps";

const homeContent: Record<string, { title: string; detail: string }> = {
  atlas: {
    title: "Sistema de oficina",
    detail: "Acompanhe veículos, diagnósticos, aprovações, evidências e entregas em uma central operacional.",
  },
  ares: {
    title: "Sistema de orçamento",
    detail: "Monte propostas profissionais, controle versões e registre aprovação ou reprovação do cliente.",
  },
  artemis: {
    title: "Sistema de restaurante",
    detail: "Organize cardápio, mesas, comandas e fila de preparo sem caixa, cobrança ou controle de estoque.",
  },
  pandora: {
    title: "Sistema de NPS",
    detail: "Crie pesquisas, acompanhe notas e transforme comentários recorrentes em prioridades de melhoria.",
  },
  poseidon: {
    title: "Sistema de funil de vendas",
    detail: "Acompanhe oportunidades, retornos e o próximo passo concreto de cada negociação.",
  },
  hercules: {
    title: "Sistema de checklist de inspeção",
    detail: "Execute inspeções, registre evidências e trate não conformidades com responsável e prazo.",
  },
};

const productOrder = ["atlas", "ares", "artemis", "pandora", "poseidon", "hercules"];

export default function Home() {
  const orderedProducts = productOrder.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean) as typeof products;

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
              <p className="home-kicker">Seis produtos independentes</p>
              <h2>Uma experiência própria para cada tipo de operação.</h2>
              <p>Abra as demonstrações e valide fluxos, identidade e usabilidade antes da integração com serviços externos.</p>
            </div>
            <div className="home-card-grid">
              {orderedProducts.map((product) => {
                const content = homeContent[product.slug];
                return (
                  <article className="home-product-card" key={product.slug} style={{ "--product-color": product.color, "--product-soft": product.colorSoft } as React.CSSProperties}>
                    <ProductScene slug={product.slug} label={`Prévia do ${content.title}`} />
                    <div className="home-card-copy">
                      <div className="home-card-name"><span><ProductIcon slug={product.slug} size={20} /></span><small>CRMPlus+ {product.shortName}</small></div>
                      <h3>{content.title}</h3>
                      <p>{content.detail}</p>
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
