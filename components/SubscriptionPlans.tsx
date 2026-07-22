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
            <Link className={styles.back} href={`/aplicativos/${product.slug}`}>← Voltar para {product.shortName}</Link>
            <div className={styles.identity}><span><ProductIcon slug={product.slug} size={27} /></span><strong>{product.name}</strong></div>
            <p className={styles.kicker}>Escolha como deseja assinar</p>
            <h1>Um plano simples para colocar sua operação em ordem.</h1>
            <p>Selecione mensal, semestral ou anual. A integração de pagamento será adicionada depois; nenhuma cobrança é realizada nesta etapa.</p>
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
                    <p>{price.months === 1 ? "Cobrança mensal" : `${formatCurrency(price.total)} por ${price.months} meses`}</p>
                    {price.discount ? <b>Economize {price.discount}%</b> : <b>Sem fidelidade longa</b>}
                  </button>
                );
              })}
            </div>

            <aside className={styles.summary}>
              <div>
                <p className={styles.kicker}>Resumo da escolha</p>
                <h2>{product.name}</h2>
                <dl>
                  <div><dt>Plano</dt><dd>{plans.find((plan) => plan.id === selected)?.name}</dd></div>
                  <div><dt>Período</dt><dd>{selectedPrice.months} {selectedPrice.months === 1 ? "mês" : "meses"}</dd></div>
                  <div><dt>Desconto</dt><dd>{selectedPrice.discount ? `${selectedPrice.discount}%` : "—"}</dd></div>
                  <div className={styles.total}><dt>Total</dt><dd>{formatCurrency(selectedPrice.total)}</dd></div>
                </dl>
              </div>
              <button type="button" disabled>Pagamento com Stripe em breve</button>
              <small>Esta tela já deixa a seleção de plano pronta, mas não solicita cartão, não gera cobrança e não envia dados para serviços externos.</small>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
