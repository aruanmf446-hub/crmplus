import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductIcon } from "@/components/ProductIcon";
import { products } from "@/lib/apps";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <h1>Sistemas simples para <em>sua empresa avançar.</em></h1>
            <p className="hero-lead">Organize sua operação com soluções acessíveis e focadas no que sua empresa realmente precisa — sem a complexidade de um ERP.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#solucoes">Explorar soluções</a>
              <a className="text-link" href="#proposta">Entender a proposta <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="product-index" aria-label="Aplicativos CRM Plus disponíveis">
            <div className="index-heading"><span>CRM Plus Store</span><small>6 soluções especializadas</small></div>
            {products.map((product) => (
              <a key={product.slug} href={`/apps/${product.slug}`} style={{ "--product-color": product.color } as React.CSSProperties}>
                <span className="index-icon"><ProductIcon slug={product.slug} size={20} /></span>
                <b>{product.shortName}</b>
                <small>{product.category}</small>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </section>

        <section className="principle-band" id="proposta">
          <div className="shell principle-grid">
            <h2>O essencial para organizar hoje. Espaço para evoluir amanhã.</h2>
            <div>
              <p>O CRM Plus não tenta ser um SAP menor. Cada aplicativo resolve uma rotina específica, com menos etapas, linguagem clara e implantação acessível.</p>
              <span>Sem módulos fiscais complexos · Sem telas carregadas · Sem treinamento demorado</span>
            </div>
          </div>
        </section>

        <section className="solutions shell" id="solucoes">
          <div className="section-intro">
            <h2>Escolha o sistema que resolve o seu próximo passo.</h2>
            <p>Aplicativos independentes, cada um com sua própria personalidade e todos com a mesma lógica simples de uso.</p>
          </div>
          <div className="product-grid">
            {products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}
          </div>
        </section>

        <section className="closing shell">
          <h2>Software profissional não precisa ser pesado para fazer diferença.</h2>
          <a className="button button-primary" href="#solucoes">Encontrar minha solução</a>
        </section>
      </main>
      <Footer />
    </>
  );
}
