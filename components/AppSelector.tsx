"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { products } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { normalizeSearch } from "@/lib/storefront";
import { Brand } from "./Brand";
import { ProductIcon } from "./ProductIcon";

type Mode = "signup" | "login" | "forgot";

export function AppSelector({ mode }: { mode: Mode }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return products;
    return products.filter((product) => normalizeSearch(`${product.name} ${product.shortName} ${product.category} ${product.description}`).includes(normalized));
  }, [query]);

  const heading = mode === "signup"
    ? "Em qual aplicativo você deseja criar sua conta?"
    : mode === "forgot"
      ? "De qual aplicativo você precisa recuperar a senha?"
      : "Qual aplicativo você deseja acessar?";

  const description = mode === "signup"
    ? "Escolha o produto que corresponde à rotina da sua empresa."
    : mode === "forgot"
      ? "Escolha o aplicativo. A senha será redefinida somente na conta salva neste navegador."
      : "Selecione o aplicativo para entrar em sua área exclusiva.";

  function appHref(slug: string) {
    if (mode === "signup") return `/sistemas/${slug}?modo=criar-conta`;
    if (mode === "forgot") return `/sistemas/${slug}?modo=recuperar-senha`;
    return `/sistemas/${slug}`;
  }

  return (
    <main className="app-selector-page">
      <header className="app-selector-header"><Brand /><Link href="/">Voltar para a CRMPlus Store</Link></header>
      <section className="app-selector-intro">
        <h1>{heading}</h1>
        <p>{description}</p>
        <label className="app-selector-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar oficina, orçamento, pet shop..." aria-label="Pesquisar aplicativo" />
        </label>
      </section>
      <section className="app-selector-grid" aria-label="Aplicativos disponíveis">
        {filtered.map((product) => {
          const presentation = getProductPresentation(product.slug);
          const cardStyle = { "--selector-accent": product.color, "--selector-soft": product.colorSoft } as CSSProperties;
          return (
            <Link key={product.slug} href={appHref(product.slug)} style={cardStyle}>
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
