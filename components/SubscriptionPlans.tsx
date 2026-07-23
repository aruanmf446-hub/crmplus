"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductIcon } from "@/components/ProductIcon";
import type { Product } from "@/lib/apps";
import {
  formatCurrency,
  getBillingPrice,
  getStorefrontInfo,
  type BillingPeriod,
} from "@/lib/storefront";
import styles from "./SubscriptionPlans.module.css";

type Props = { product: Product };

const plans: { id: BillingPeriod; name: string; note: string }[] = [
  { id: "monthly", name: "Mensal", note: "Flexibilidade para começar" },
  { id: "semiannual", name: "Semestral", note: "Economia para manter a rotina" },
  { id: "annual", name: "Anual", note: "Melhor valor para uso contínuo" },
];

export function SubscriptionPlans({ product }: Props) {
  const [selected, setSelected] = useState<BillingPeriod>("annual");
  const info = getStorefrontInfo(product.slug);
  const selectedPlan = plans.find((plan) => plan.id === selected) ?? plans[2];
  const selectedPrice = useMemo(() => getBillingPrice(info.monthlyPrice, selected), [info.monthlyPrice, selected]);
  const pageStyle = { "--accent": product.color, "--accent-soft": product.colorSoft } as CSSProperties;

  return (
    <div className={styles.page} style={pageStyle} data-product={product.slug}>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className="shell">
            <Link className={styles.back} href={`/aplicativos/${product.slug}`}>← Voltar para {product.shortName}</Link>
            <div className={styles.heroGrid}>
              <div>
                <div className={styles.identity}><span><ProductIcon slug={product.slug} size={27} /></span><strong>{product.name}</strong></div>
                <h1>Escolha o período do {product.shortName}.</h1>
                <p>Veja o valor equivalente por mês e o total de cada período antes de decidir.</p>
              </div>
              <aside className={styles.prototypeNotice}>
                <strong>Demonstração comercial</strong>
                <p>Esta página não realiza cobrança. Nenhum cartão ou dado de pagamento será solicitado.</p>
                <span>Conta, sessão e registros continuam salvos somente neste navegador.</span>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.plansSection}>
          <div className="shell">
            <div className={styles.planArea}>
              <header className={styles.sectionHeading}>
                <div><h2>Compare os períodos</h2><p>Selecione uma opção para atualizar o resumo.</p></div>
                <span>A partir de {formatCurrency(info.monthlyPrice)}/mês</span>
              </header>
              <div className={styles.planGrid}>
                {plans.map((plan) => {
                  const price = getBillingPrice(info.monthlyPrice, plan.id);
                  const monthlyEquivalent = price.total / price.months;
                  const active = selected === plan.id;
                  return (
                    <button
                      type="button"
                      key={plan.id}
                      className={active ? styles.planActive : undefined}
                      onClick={() => setSelected(plan.id)}
                      aria-pressed={active}
                    >
                      <span className={styles.radio} aria-hidden="true">{active ? "✓" : ""}</span>
                      <small>{plan.note}</small>
                      <h3>{plan.name}</h3>
                      <strong>{formatCurrency(monthlyEquivalent)}<em>/mês</em></strong>
                      <p>{price.months === 1 ? "Período de 1 mês" : `${formatCurrency(price.total)} pelo período de ${price.months} meses`}</p>
                      {price.discount ? <b>Economize {price.discount}%</b> : <b>Maior flexibilidade</b>}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className={styles.summary} aria-live="polite">
              <div className={styles.summaryIdentity}><span><ProductIcon slug={product.slug} size={22} /></span><div><small>Plano selecionado</small><h2>{product.shortName} · {selectedPlan.name}</h2></div></div>
              <dl>
                <div><dt>Período</dt><dd>{selectedPrice.months} {selectedPrice.months === 1 ? "mês" : "meses"}</dd></div>
                <div><dt>Equivalente mensal</dt><dd>{formatCurrency(selectedPrice.total / selectedPrice.months)}</dd></div>
                <div><dt>Economia</dt><dd>{selectedPrice.discount ? `${selectedPrice.discount}%` : "Sem desconto"}</dd></div>
                <div className={styles.total}><dt>Total do período</dt><dd>{formatCurrency(selectedPrice.total)}</dd></div>
              </dl>
              <div className={styles.summaryNotice}><strong>Sem cobrança nesta fase</strong><span>Use a demonstração para validar o produto e o fluxo.</span></div>
              <div className={styles.summaryActions}>
                <Link className={styles.demoAction} href={`/sistemas/${product.slug}`}>Abrir demonstração</Link>
                <Link className={styles.backAction} href={`/aplicativos/${product.slug}`}>Rever funções</Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
