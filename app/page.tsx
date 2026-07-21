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
              <p className="store-kicker">Seis apps. Uma experiência conectada.</p>
              <h1>Organize o trabalho. <em>Acompanhe o que importa.</em></h1>
              <p className="store-lead">O CRM Plus reúne aplicativos para oficinas, restaurantes, vendas, rotinas, pesquisas e orçamentos. Escolha por onde começar e conduza o dia em um ambiente claro, no computador ou celular.</p>
              <div className="store-actions">
                <a className="store-button store-button-primary" href="#sistemas">Conhecer os apps <span>→</span></a>
                <Link className="store-button store-button-quiet" href="/sistemas/atlas">Explorar uma demonstração</Link>
              </div>
              <div className="store-promises"><span>Apps independentes</span><span>Navegação consistente</span><span>Computador e celular</span></div>
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
              <div className="product-stage-note"><b>Explore por dentro</b><span>Veja como cada app acompanha a rotina.</span></div>
            </div>
          </div>
        </section>

        <section className="store-statement" id="proposta">
          <div className="shell statement-grid-new">
            <p className="store-kicker">Feito para a rotina</p>
            <div><h2>Tudo no lugar.<br />O trabalho segue.</h2><p>Cada app acompanha uma operação específica e mostra o que precisa acontecer agora, o que está em andamento e o que já foi concluído. A navegação continua familiar de um produto para o outro.</p><div className="statement-tags"><span>Visão do dia</span><span>Próximas ações</span><span>Histórico organizado</span><span>Acesso em qualquer tela</span></div></div>
          </div>
        </section>

        <section className="store-products shell" id="sistemas">
          <div className="store-section-head"><div><p className="store-kicker">Apps CRM Plus</p><h2>Escolha o app que acompanha seu trabalho.</h2></div><p>Cada produto tem recursos e identidade próprios. A navegação segue o mesmo padrão para que a troca entre apps seja natural.</p></div>
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
          <div><p className="store-kicker">Do primeiro acesso ao dia a dia</p><h2>Escolha. Ajuste. Acompanhe.</h2><p>O jeito de usar permanece familiar em todos os produtos.</p></div>
          <ol><li><b>01</b><strong>Escolha a rotina</strong><span>Encontre o app que corresponde ao trabalho da sua equipe.</span></li><li><b>02</b><strong>Ajuste ao negócio</strong><span>Organize clientes, serviços e etapas do seu processo.</span></li><li><b>03</b><strong>Acompanhe o dia</strong><span>Veja atividades, pendências e resultados em uma única visão.</span></li></ol>
        </section>

        <section className="store-final"><div className="shell"><h2>Qual rotina você quer organizar primeiro?</h2><a className="store-button" href="#sistemas">Explorar os apps →</a></div></section>
      </main>
      <Footer />
    </>
  );
}

function PreviewLane({ title, count, jobs }: { title: string; count: string; jobs: string[] }) {
  return <div className="preview-lane"><div><b>{title}</b><span>{count}</span></div>{jobs.map((job, index) => <article key={job}><strong>{job}</strong><small>{index ? 'Atualizado há 20 min' : 'Atualizado agora'}</small></article>)}</div>;
}
