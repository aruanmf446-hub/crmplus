import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductIcon } from "@/components/ProductIcon";
import { products } from "@/lib/apps";

export default function Home() {
  return (
    <>
      <Header />
      <main className="store-redesign">
        <section className="store-hero" id="inicio">
          <div className="shell store-hero-grid">
            <div className="store-hero-copy">
              <p className="store-kicker">Operação organizada, sem complicação</p>
              <h1>Coloque sua empresa em <em>movimento.</em></h1>
              <p className="store-lead">Seis sistemas focados nas rotinas que mais tomam tempo de uma pequena empresa. Comece pelo que precisa, sem transformar o negócio em um projeto de ERP.</p>
              <div className="store-actions">
                <a className="store-button store-button-primary" href="#sistemas">Encontrar meu sistema <span>→</span></a>
                <Link className="store-button store-button-quiet" href="/sistemas/atlas">Ver uma demonstração</Link>
              </div>
              <div className="store-promises"><span>Implantação enxuta</span><span>Uso fácil no celular</span><span>Sem módulos desnecessários</span></div>
            </div>

            <div className="product-stage" aria-label="Prévia do CRM Plus Atlas">
              <div className="product-window">
                <div className="product-window-top"><span className="window-dots"><i /><i /><i /></span><strong>CRM Plus Atlas</strong><small>Demonstração</small></div>
                <div className="product-preview">
                  <aside className="preview-sidebar">
                    <div className="preview-logo"><ProductIcon slug="atlas" size={18} /> Atlas</div>
                    {['Visão do dia', 'Agenda', 'Ordens de serviço', 'Clientes e veículos'].map((item, index) => <span className={index === 0 ? 'active' : ''} key={item}>{item}</span>)}
                  </aside>
                  <div className="preview-main">
                    <div className="preview-heading"><div><small>Terça-feira, 21 de julho</small><h2>A oficina está em dia.</h2></div><b>+ Nova OS</b></div>
                    <div className="preview-metrics"><div><strong>08</strong><span>Agendados</span></div><div><strong>06</strong><span>Em serviço</span></div><div><strong>03</strong><span>Para entrega</span></div></div>
                    <div className="preview-flow-title"><b>Fluxo da oficina</b><span>Hoje · 17 itens</span></div>
                    <div className="preview-flow">
                      <PreviewLane title="Recepção" count="2" jobs={['Nivus · QVE 4A21', 'Onix · RTH 8F32']} />
                      <PreviewLane title="Em serviço" count="3" jobs={['Saveiro · TCJ 9I23', 'HB20 · QDB 7J10']} />
                      <PreviewLane title="Finalização" count="2" jobs={['T-Cross · OSM 2D11', 'Strada · RXA 3E05']} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="product-stage-note"><b>Veja antes de escolher</b><span>As demonstrações mostram a rotina funcionando.</span></div>
            </div>
          </div>
        </section>

        <section className="store-statement" id="proposta">
          <div className="shell statement-grid-new">
            <p className="store-kicker">A ideia do CRM Plus</p>
            <div><h2>Pequeno no esforço.<br />Grande na clareza.</h2><p>Não queremos substituir tudo da empresa. Cada sistema resolve uma rotina específica com começo, meio e fim — fácil de aprender e valioso desde o primeiro dia.</p><div className="statement-tags"><span>Sem cara de planilha</span><span>Sem linguagem de ERP</span><span>Sem tela poluída</span><span>Responsivo de verdade</span></div></div>
          </div>
        </section>

        <section className="store-products shell" id="sistemas">
          <div className="store-section-head"><div><p className="store-kicker">Ecossistema CRM Plus</p><h2>Uma ferramenta para cada rotina.</h2></div><p>Os aplicativos compartilham a mesma lógica de uso, mas cada um ganha personalidade a partir do trabalho que ajuda a realizar.</p></div>
          <div className="store-product-list">
            {products.map((product, index) => (
              <Link className="store-product-row" href={`/apps/${product.slug}`} key={product.slug} style={{ "--product-color": product.color, "--product-soft": product.colorSoft } as React.CSSProperties}>
                <span className="store-product-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="store-product-name"><span><ProductIcon slug={product.slug} size={22} /></span><div><h3>{product.shortName}</h3><small>{product.category}</small></div></div>
                <p>{product.description}</p><i aria-hidden="true">↗</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="store-method shell">
          <div><p className="store-kicker">Uma lógica em comum</p><h2>Escolha. Configure. Trabalhe.</h2><p>Você aprende uma vez e reconhece o jeito de usar em todo o ecossistema.</p></div>
          <ol><li><b>01</b><strong>Escolha</strong><span>A ferramenta da rotina que mais precisa de organização.</span></li><li><b>02</b><strong>Configure</strong><span>Somente os dados essenciais para sua empresa começar.</span></li><li><b>03</b><strong>Trabalhe</strong><span>Execute a operação com clareza no computador ou celular.</span></li></ol>
        </section>

        <section className="store-final"><div className="shell"><h2>Comece pela rotina que mais atrasa sua empresa.</h2><a className="store-button" href="#sistemas">Explorar os sistemas →</a></div></section>
      </main>
      <Footer />
    </>
  );
}

function PreviewLane({ title, count, jobs }: { title: string; count: string; jobs: string[] }) {
  return <div className="preview-lane"><div><b>{title}</b><span>{count}</span></div>{jobs.map((job, index) => <article key={job}><strong>{job}</strong><small>{index ? 'Atualizado há 20 min' : 'Atualizado agora'}</small></article>)}</div>;
}
