"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
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

    if (mode === "signup") {
      if (!draft.name.trim() || !draft.company.trim()) {
        setError("Informe seu nome e o nome da empresa.");
        return;
      }
      const account: Account = { name: draft.name.trim(), company: draft.company.trim(), email, password: draft.password };
      window.localStorage.setItem(accountKey, JSON.stringify(account));
      window.localStorage.setItem(sessionKey, "active");
      window.localStorage.setItem(`crmplus.preferences.${product.slug}`, JSON.stringify({ company: account.company, compact: false, logo: "" }));
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
    return <>{children}<div className={styles.sessionBar}><span>{storedAccount?.name || "Usuário local"}</span><button type="button" onClick={signOut}>Sair</button></div></>;
  }

  const pageStyle = { "--accent": product.color } as CSSProperties;
  return (
    <main className={styles.page} style={pageStyle}>
      <section className={styles.shell}>
        <div className={styles.brand}>
          <div>
            <div className={styles.brandMark}>{product.shortName.slice(0, 1)}</div>
            <h1>{product.name}</h1>
            <p>{product.tagline}</p>
          </div>
          <p className={styles.privacy}>Ambiente de rascunho. Conta e dados ficam somente neste navegador.</p>
        </div>

        <div className={styles.formSide}>
          <h2>{mode === "login" ? "Entrar" : "Criar conta"}</h2>
          <p>{mode === "login" ? `Acesse sua área do ${product.shortName}.` : `Crie uma conta exclusiva para o ${product.shortName}.`}</p>
          <div className={styles.tabs}>
            <button type="button" className={mode === "login" ? styles.active : ""} onClick={() => { setMode("login"); setError(""); }}>Entrar</button>
            <button type="button" className={mode === "signup" ? styles.active : ""} onClick={() => { setMode("signup"); setError(""); }}>Criar conta</button>
          </div>
          <form className={styles.form} onSubmit={submit}>
            {mode === "signup" ? <>
              <label className={styles.field}><span>Seu nome</span><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className={styles.field}><span>Empresa</span><input value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></label>
            </> : null}
            <label className={styles.field}><span>E-mail</span><input type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /></label>
            <label className={styles.field}><span>Senha</span><input type="password" value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} /></label>
            {error ? <div className={styles.error}>{error}</div> : null}
            <button className={styles.submit} type="submit">{mode === "login" ? "Entrar no aplicativo" : "Criar conta e entrar"}</button>
          </form>
          <p className={styles.note}>Esta conta não dá acesso a nenhum outro aplicativo.</p>
        </div>
      </section>
    </main>
  );
}
