"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { getProductMedia } from "@/lib/storefront";
import { ProductIcon } from "@/components/ProductIcon";
import { ProductMediaImage } from "@/components/ProductMediaImage";
import styles from "./AppAccessGate.module.css";

type Account = { name: string; company: string; email: string; password: string };
type Mode = "login" | "signup";

export function AppAccessGate({ product, children }: { product: Product; children: ReactNode }) {
  const accountKey = `crmplus.${product.slug}.account`;
  const sessionKey = `crmplus.${product.slug}.session`;
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ name: "", company: "", email: "", password: "" });
  const presentation = getProductPresentation(product.slug);
  const media = getProductMedia(product.slug);

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(sessionKey) === "active");
    setReady(true);
  }, [sessionKey]);

  const storedAccount = useMemo<Account | null>(() => {
    if (!ready) return null;
    try {
      const value = window.localStorage.getItem(accountKey);
      return value ? JSON.parse(value) as Account : null;
    } catch {
      return null;
    }
  }, [accountKey, ready, signedIn]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const email = draft.email.trim().toLowerCase();
    if (!email || !draft.password) {
      setError("Informe e-mail e senha.");
      return;
    }
    if (draft.password.length < 6) {
      setError("Use uma senha com pelo menos 6 caracteres.");
      return;
    }

    if (mode === "signup") {
      if (!draft.name.trim() || !draft.company.trim()) {
        setError("Informe seu nome e o nome da empresa.");
        return;
      }
      const account: Account = { name: draft.name.trim(), company: draft.company.trim(), email, password: draft.password };
      window.localStorage.setItem(accountKey, JSON.stringify(account));
      window.localStorage.setItem(sessionKey, "active");
      window.localStorage.setItem(`crmplus.preferences.${product.slug}`, JSON.stringify({ version: 1, value: { company: account.company, compact: false, logo: "" } }));
      setSignedIn(true);
      return;
    }

    if (!storedAccount || storedAccount.email !== email || storedAccount.password !== draft.password) {
      setError("E-mail ou senha não conferem para este aplicativo.");
      return;
    }
    window.localStorage.setItem(sessionKey, "active");
    setSignedIn(true);
  }

  function signOut() {
    window.localStorage.removeItem(sessionKey);
    setSignedIn(false);
    setDraft({ name: "", company: "", email: "", password: "" });
  }

  if (!ready) return null;

  if (signedIn) {
    return (
      <div className={styles.signedInShell}>
        <div className={styles.sessionHeader}>
          <div><span className={styles.sessionIcon}><ProductIcon slug={product.slug} size={17} /></span><p><strong>{storedAccount?.name || "Usuário"}</strong><small>{storedAccount?.company || product.shortName}</small></p></div>
          <button type="button" onClick={signOut}>Sair do {product.shortName}</button>
        </div>
        {children}
      </div>
    );
  }

  const pageStyle = { "--accent": product.color, "--accent-soft": product.colorSoft } as CSSProperties;
  const previewCandidates = [...media.galleryCandidates[1], ...media.coverCandidates];

  return (
    <main className={styles.page} style={pageStyle}>
      <section className={styles.shell}>
        <div className={styles.brand}>
          <div>
            <Link className={styles.storeLink} href="/">CRMPlus Store</Link>
            <div className={styles.brandIdentity}><span><ProductIcon slug={product.slug} size={29} /></span><div><small>{presentation.label}</small><h1>{product.shortName}</h1></div></div>
            <p className={styles.tagline}>{product.tagline}</p>
            <ul>{product.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
          <div className={styles.preview}>
            <ProductMediaImage candidates={previewCandidates} alt={`Prévia do ${product.name}`} className={styles.previewImage} fallback={<div className={styles.previewFallback}><ProductIcon slug={product.slug} size={48} /><span>{presentation.screens[0].title}</span></div>} />
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.formHeading}><small>{product.name}</small><h2>{mode === "login" ? "Entrar no aplicativo" : "Criar conta"}</h2><p>{mode === "login" ? `Acesse sua área exclusiva do ${product.shortName}.` : `Prepare o acesso da sua empresa ao ${product.shortName}.`}</p></div>
          <div className={styles.tabs}>
            <button type="button" className={mode === "login" ? styles.active : ""} onClick={() => { setMode("login"); setError(""); }}>Entrar</button>
            <button type="button" className={mode === "signup" ? styles.active : ""} onClick={() => { setMode("signup"); setError(""); }}>Criar conta</button>
          </div>
          <form className={styles.form} onSubmit={submit}>
            {mode === "signup" ? <>
              <label className={styles.field}><span>Seu nome</span><input autoComplete="name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className={styles.field}><span>Empresa</span><input autoComplete="organization" value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></label>
            </> : null}
            <label className={styles.field}><span>E-mail</span><input autoComplete="email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /></label>
            <label className={styles.field}><span>Senha</span><input autoComplete={mode === "signup" ? "new-password" : "current-password"} type="password" minLength={6} value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} /></label>
            {error ? <div className={styles.error}>{error}</div> : null}
            <button className={styles.submit} type="submit">{mode === "login" ? `Entrar no ${product.shortName}` : "Criar conta e entrar"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
