import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductScene } from "@/components/ProductScene";
import { ProductIcon } from "@/components/ProductIcon";
import { products } from "@/lib/apps";

const homeContent: Record<string, { title: string; detail: string }> = {
  atlas: {
    title: "Sistema de oficina",
    detail: "Acesse o histórico dos atendimentos e compartilhe orçamentos pelo WhatsApp.",
  },
  ares: {
    title: "Sistema de orçamento",
    detail: "Gere orçamentos personalizados em PDF, compartilhe e acompanhe a aprovação ou reprovação on-line.",
  },
  artemis: {
    title: "Sistema de restaurante",
    detail: "Cadastre o cardápio, abra comandas e conecte atendimento, cozinha e caixa.",
  },
  pandora: {
    title: "Sistema de NPS",
    detail: "Crie links de pesquisa, acompanhe respostas e identifique oportunidades para melhorar produtos e serviços.",
  },
  poseidon: {
    title: "Sistema de funil de vendas",
    detail: "Acompanhe oportunidades, leads, carteira de clientes e os próximos passos de cada negociação.",
  },
  hercules: {
    title: "Sistema de checklist de inspeção",
    detail: "Crie inspeções e rotinas, registre não conformidades, acompanhe planos de ação e emita relatórios periódicos.",
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
              <h1>O controle do seu negócio <em>na palma da sua mão.</em></h1>
              <p className="home-lead">Sistemas intuitivos sem complicação que cabem no seu bolso.</p>
              <div className="home-actions">
                <Link className="home-button home-button-primary" href="/criar-conta">Criar conta</Link>
                <Link className="home-button home-button-secondary" href="/entrar">Entrar</Link>
              </div>
              <p className="home-note">Escolha os sistemas que combinam com a sua rotina. Você pode começar por um e ativar outros depois.</p>
            </div>

            <div className="home-product-preview" aria-label="Prévia do CRMPlus+ Atlas">
              <div className="home-preview-top">
                <span><ProductIcon slug="atlas" size={19} /> CRMPlus+ Atlas</span>
                <small>Ambiente interno</small>
              </div>
              <div className="home-preview-body">
                <div className="home-preview-heading"><div><small>Visão de hoje</small><strong>A oficina está em movimento.</strong></div><b>Nova OS</b></div>
                <div className="home-preview-numbers"><span><b>08</b>Agendados</span><span><b>06</b>Em serviço</span><span><b>03</b>Para entrega</span></div>
                <div className="home-preview-flow">
                  <PreviewLane title="Recepção" items={["Nivus · 09:00", "Onix · 10:30"]} />
                  <PreviewLane title="Em serviço" items={["Saveiro · OS 1048", "HB20 · OS 1046"]} />
                  <PreviewLane title="Entrega" items={["T-Cross · Conferência", "Strada · Pronto"]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-products" id="sistemas">
          <div className="shell">
            <div className="home-section-heading">
              <p className="home-kicker">Sistemas CRMPlus+</p>
              <h2>Um sistema para cada parte do seu negócio.</h2>
              <p>Abra a demonstração e veja como cada rotina funciona antes de criar sua conta.</p>
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
                      <Link href={`/sistemas/${product.slug}`}>Ver demonstração <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-closing">
          <div className="shell home-closing-inner">
            <div><p className="home-kicker">Comece por onde faz sentido</p><h2>Seu negócio, organizado do seu jeito.</h2></div>
            <Link className="home-button home-button-light" href="/criar-conta">Criar minha conta</Link>
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
