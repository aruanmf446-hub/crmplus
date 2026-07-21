import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductIcon } from "@/components/ProductIcon";
import { getProduct, products } from "@/lib/apps";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: `${product.name} — Sistema para ${product.category.toLowerCase()}`, description: product.seoDescription, openGraph: { title: product.name, description: product.seoDescription, type: "website", locale: "pt_BR" } };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return (
    <div style={{ "--accent": product.color, "--accent-soft": product.colorSoft } as React.CSSProperties}>
      <Header />
      <main>
        <section className="detail-hero shell">
          <div className="detail-crumb"><Link href="/">CRM Plus Store</Link><span>/</span>{product.shortName}</div>
          <div className="detail-hero-grid">
            <div><span className="detail-icon"><ProductIcon slug={product.slug} size={30} /></span><p className="eyebrow">Sistema para {product.category.toLowerCase()}</p><h1>{product.name}</h1><h2>{product.tagline}</h2><p className="detail-lead">{product.description}</p><div className="detail-actions"><Link className="button detail-button" href={`/sistemas/${product.slug}`}>Abrir demonstração</Link><a className="text-link" href="#recursos">Conhecer os recursos <span aria-hidden="true">↓</span></a></div></div>
            <div className="workflow-panel" aria-label={`Fluxo principal do ${product.name}`}><p>Como a rotina avança</p><ol>{product.workflow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></li>)}</ol></div>
          </div>
        </section>
        <section className="detail-summary"><div className="shell summary-grid"><div><small>Para quem é</small><p>{product.audience}</p></div><div><small>O que melhora</small><p>{product.outcome}</p></div></div></section>
        <section className="features shell" id="recursos"><div className="section-intro compact"><p className="eyebrow">O que você encontra</p><h2>Recursos que acompanham cada etapa do trabalho.</h2></div><div className="feature-list">{product.features.map((feature, index) => <div key={feature}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature}</h3><p>Informações e ações reunidas no ponto certo da rotina.</p></div>)}</div></section>
        <section className="product-next shell"><div><p className="eyebrow">Veja funcionando</p><h2>Conheça a experiência do {product.shortName} em uma demonstração.</h2></div><Link href={`/sistemas/${product.slug}`}>Abrir demonstração <span aria-hidden="true">→</span></Link></section>
      </main>
      <Footer />
    </div>
  );
}
