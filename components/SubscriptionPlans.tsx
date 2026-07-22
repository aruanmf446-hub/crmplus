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
  const selectedPrice = useMemo(() => getBillingPrice(info.monthlyPrice, selected), [info.monthlyPrice, selected]);
  const pageStyle = { "--accent": product.color, "--accent-soft": product.colorSoft } as CSSProperties;

  return (
    <div className={styles.page} style={pageStyle}>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className="shell">
            <Link className={styles.back} href={`/aplicativos/${product.slug}`}>← Voltar</Link>
            <div className={styles.identity}><span><ProductIcon slug={product.slug} size={27} /></span><strong>{product.name}</strong></div>
            <h1>Escolha o período que combina com a sua empresa.</h1>
            <p>Compare os valores mensal, semestral e anual para encontrar a melhor opção para a sua rotina.</p>
          </div>
        </section>

        <section className={styles.plansSection}>
          <div className="shell">
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
                    <span className={styles.radio}>{active ? "✓" : ""}</span>
                    <small>{plan.note}</small>
                    <h2>{plan.name}</h2>
                    <strong>{formatCurrency(monthlyEquivalent)}<em>/mês</em></strong>
                    <p>{price.months === 1 ? "Período de 1 mês" : `${formatCurrency(price.total)} pelo período de ${price.months} meses`}</p>
                    {price.discount ? <b>Economize {price.discount}%</b> : <b>Maior flexibilidade</b>}
                  </button>
                );
              })}
            </div>

            <aside className={styles.summary}>
              <div>
                <h2>Plano selecionado</h2>
                <p className="plan-prototype-note">{product.shortName} · {plans.find((plan) => plan.id === selected)?.name}</p>
                <dl>
                  <div><dt>Plano</dt><dd>{plans.find((plan) => plan.id === selected)?.name}</dd></div>
                  <div><dt>Período</dt><dd>{selectedPrice.months} {selectedPrice.months === 1 ? "mês" : "meses"}</dd></div>
                  <div><dt>Economia</dt><dd>{selectedPrice.discount ? `${selectedPrice.discount}%` : "—"}</dd></div>
                  <div className={styles.total}><dt>Total do período</dt><dd>{formatCurrency(selectedPrice.total)}</dd></div>
                </dl>
              </div>
              <div className="plan-summary-actions">
                <Link href={`/sistemas/${product.slug}`} style={{ color: "#fff", background: "var(--accent)", border: 0 }}>Abrir demonstração</Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
