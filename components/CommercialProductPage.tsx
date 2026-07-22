import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductIcon } from "@/components/ProductIcon";
import type { Product } from "@/lib/apps";
import { formatMonthlyPrice, getProductMedia, getStorefrontInfo } from "@/lib/storefront";
import styles from "./CommercialProductPage.module.css";

type Props = { product: Product };

const featureIntros = [
  "Centralize as informações essenciais e encontre tudo sem depender de controles espalhados.",
  "Acompanhe o andamento da rotina com etapas claras, responsáveis e próximos passos.",
  "Registre decisões, observações e evidências para preservar o contexto de cada atendimento.",
  "Consulte o histórico quando precisar e mantenha a operação organizada do início ao fim.",
];

export function CommercialProductPage({ product }: Props) {
  const info = getStorefrontInfo(product.slug);
  const media = getProductMedia(product.slug);
  const pageStyle = {
    "--accent": product.color,
    "--accent-soft": product.colorSoft,
    "--cover-image": `url("${media.cover}")`,
  } as CSSProperties;

  return (
    <div className={styles.page} style={pageStyle}>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className="shell">
            <nav className={styles.crumb} aria-label="Navegação estrutural">
              <Link href="/">Início</Link><span>/</span><span>{product.shortName}</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <div className={styles.productName}><span><ProductIcon slug={product.slug} size={25} /></span>{product.name}</div>
                <p className={styles.kicker}>Sistema criado para uma rotina específica</p>
                <h1>{product.tagline}</h1>
                <p className={styles.lead}>{product.description}</p>
                <div className={styles.priceRow}>
                  <strong>{formatMonthlyPrice(info.monthlyPrice)}</strong>
                  <span>Planos mensal, semestral e anual</span>
                </div>
                <div className={styles.actions}>
                  <Link className={styles.primary} href={`/assinar/${product.slug}`}>Assinar agora</Link>
                  <Link className={styles.secondary} href={`/sistemas/${product.slug}`}>Ver demonstração</Link>
                </div>
              </div>

              <div className={styles.cover} role="img" aria-label={`Capa oficial do ${product.name}`} />
            </div>
          </div>
        </section>

        <section className={styles.promise}>
          <div className="shell">
            <p className={styles.kicker}>Resultado esperado</p>
            <h2>{product.outcome}</h2>
          </div>
        </section>

        <section className={styles.features}>
          <div className="shell">
            <div className={styles.sectionHead}>
              <div><p className={styles.kicker}>Funcionalidades principais</p><h2>O que você consegue fazer com o {product.shortName}</h2></div>
              <p>Uma visão comercial e objetiva das funções do aplicativo, sem termos técnicos e sem informações de programação.</p>
            </div>
            <div className={styles.featureGrid}>
              {product.features.map((feature, index) => (
                <article key={feature}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{feature}</h3>
                  <p>{featureIntros[index % featureIntros.length]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.workflow}>
          <div className="shell">
            <div className={styles.sectionHead}>
              <div><p className={styles.kicker}>Como funciona na prática</p><h2>Uma jornada clara, do primeiro registro até a conclusão.</h2></div>
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
            <div>
              <p className={styles.kicker}>Conheça antes de decidir</p>
              <h2>Veja o {product.shortName} funcionando e escolha o plano adequado ao seu negócio.</h2>
            </div>
            <div className={styles.actions}>
              <Link className={styles.primary} href={`/assinar/${product.slug}`}>Ver planos</Link>
              <Link className={styles.light} href={`/sistemas/${product.slug}`}>Abrir demonstração</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
