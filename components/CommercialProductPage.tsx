import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductIcon } from "@/components/ProductIcon";
import { ProductInsideGallery } from "@/components/ProductInsideGallery";
import type { Product } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { formatMonthlyPrice, getProductMedia, getStorefrontInfo } from "@/lib/storefront";
import styles from "./CommercialProductPage.module.css";

type Props = { product: Product };

export function CommercialProductPage({ product }: Props) {
  const info = getStorefrontInfo(product.slug);
  const media = getProductMedia(product.slug);
  const presentation = getProductPresentation(product.slug);
  const pageStyle = {
    "--accent": product.color,
    "--accent-soft": product.colorSoft,
    "--cover-image": `url("${media.cover}")`,
  } as CSSProperties;

  return (
    <div className={`${styles.page} commercial-product-page`} style={pageStyle}>
      <Header />
      <main>
        <section className={`${styles.hero} commercial-product-hero`}>
          <div className="shell">
            <nav className={styles.crumb} aria-label="Navegação estrutural">
              <Link href="/">Início</Link><span>/</span><span>{product.shortName}</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <div className={styles.productName}><span><ProductIcon slug={product.slug} size={25} /></span><div><small>{presentation.label}</small><strong>{product.name}</strong></div></div>
                <h1>{product.tagline}</h1>
                <p className={styles.lead}>{presentation.benefit}</p>
                <div className="commercial-feature-chips">{product.features.slice(0, 3).map((feature) => <span key={feature}>{feature}</span>)}</div>
                <div className={styles.priceRow}>
                  <strong>{formatMonthlyPrice(info.monthlyPrice)}</strong>
                  <span>Planos mensal, semestral e anual</span>
                </div>
                <div className={styles.actions}>
                  <Link className={styles.primary} href={`/sistemas/${product.slug}`}>Ver demonstração</Link>
                  <Link className={styles.secondary} href={`/assinar/${product.slug}`}>Conhecer planos</Link>
                </div>
              </div>

              <div className="commercial-visual-stack">
                <div className={styles.cover} role="img" aria-label={`Capa oficial do ${product.name}`} />
                <div className="commercial-screen-card"><ProductIcon slug={product.slug} size={22} /><div><small>Tela em destaque</small><strong>{presentation.screens[0].title}</strong><span>{presentation.screens[0].description}</span></div></div>
              </div>
            </div>
          </div>
        </section>

        <ProductInsideGallery product={product} />

        <section className={styles.features}>
          <div className="shell">
            <div className={styles.sectionHead}>
              <div><h2>O que você consegue fazer com o {product.shortName}</h2></div>
              <p>Funções apresentadas com a linguagem e a prioridade próprias deste aplicativo.</p>
            </div>
            <div className={styles.featureGrid}>
              {product.features.map((feature, index) => (
                <article key={feature}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{feature}</h3>
                  <p>{presentation.featureDescriptions[index] ?? presentation.featureDescriptions.at(-1)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.workflow}>
          <div className="shell">
            <div className={styles.sectionHead}>
              <div><h2>Uma jornada clara, do primeiro registro até a conclusão.</h2></div>
              <p>{product.audience}</p>
            </div>
            <ol>
              {product.workflow.map((step, index) => (
                <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.closing}>
          <div className="shell">
            <div><h2>Abra o {product.shortName} e avalie o design e as funções do protótipo.</h2></div>
            <div className={styles.actions}>
              <Link className={styles.primary} href={`/sistemas/${product.slug}`}>Abrir demonstração</Link>
              <Link className={styles.light} href={`/assinar/${product.slug}`}>Ver planos</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
