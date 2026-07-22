"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { normalizeSearch } from "@/lib/storefront";
import { Brand } from "./Brand";
import { ProductIcon } from "./ProductIcon";

export function AppSelector({ mode }: { mode: "signup" | "login" | "forgot" }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return products;
    return products.filter((product) => normalizeSearch(`${product.name} ${product.shortName} ${product.category} ${product.description}`).includes(normalized));
  }, [query]);

  const heading = mode === "signup" ? "Escolha onde criar sua conta local." : "Qual aplicativo você deseja acessar?";
  const description = mode === "signup"
    ? "Cada aplicativo possui cadastro, sessão e dados próprios neste navegador."
    : "Selecione o produto para entrar na área exclusiva dele. Nenhum aplicativo compartilha conta ou dados com outro.";

  return (
    <main className="app-selector-page">
      <header className="app-selector-header"><Brand /><Link href="/">Voltar para a vitrine</Link></header>
      <section className="app-selector-intro">
        <h1>{heading}</h1>
        <p>{description}</p>
        <label className="app-selector-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar oficina, orçamento, pet shop..." />
        </label>
      </section>
      <section className="app-selector-grid" aria-label="Aplicativos disponíveis">
        {filtered.map((product) => {
          const presentation = getProductPresentation(product.slug);
          return (
            <Link key={product.slug} href={`/sistemas/${product.slug}`} style={{ "--selector-accent": product.color, "--selector-soft": product.colorSoft } as React.CSSProperties}>
              <span className="app-selector-icon"><ProductIcon slug={product.slug} size={25} /></span>
              <div><small>{presentation.label}</small><h2>{product.shortName}</h2><p>{presentation.benefit}</p></div>
              <svg className="app-selector-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          );
        })}
      </section>
      {!filtered.length ? <div className="app-selector-empty"><h2>Nenhum aplicativo encontrado</h2><button type="button" onClick={() => setQuery("")}>Mostrar todos</button></div> : null}
    </main>
  );
}
