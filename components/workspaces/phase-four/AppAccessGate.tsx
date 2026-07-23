"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { getProductMedia } from "@/lib/storefront";
import { ProductIcon } from "@/components/ProductIcon";
import { ProductMediaImage } from "@/components/ProductMediaImage";
import styles from "./AppAccessGate.module.css";

type Account = { name: string; company: string; email: string; password: string; createdAt?: string };
type Mode = "login" | "signup";

export function AppAccessGate({ product, children }: { product: Product; children: ReactNode }) {
  const accountKey = `crmplus.access.${product.slug}.account`;
  const sessionKey = `crmplus.access.${product.slug}.session`;
  const legacyAccountKey = `crmplus.${product.slug}.account`;
  const legacySessionKey = `crmplus.${product.slug}.session`;
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ name: "", company: "", email: "", password: "", confirmPassword: "" });
  const presentation = getProductPresentation(product.slug);
  const media = getProductMedia(product.slug);

  useEffect(() => {
    try {
      const probeKey = `crmplus.storage.probe.${product.slug}`;
      window.localStorage.setItem(probeKey, "ok");
      window.localStorage.removeItem(probeKey);

      const legacyAccount = window.localStorage.getItem(legacyAccountKey);
      const legacySession = window.localStorage.getItem(legacySessionKey);
      if (!window.localStorage.getItem(accountKey) && legacyAccount) window.localStorage.setItem(accountKey, legacyAccount);
      if (!window.localStorage.getItem(sessionKey) && legacySession) window.localStorage.setItem(sessionKey, legacySession);
      if (legacyAccount) window.localStorage.removeItem(legacyAccountKey);
      if (legacySession) window.localStorage.removeItem(legacySessionKey);

      const requestedMode = new URLSearchParams(window.location.search).get("modo");
      setMode(requestedMode === "criar-conta" ? "signup" : "login");
      setSignedIn(window.localStorage.getItem(sessionKey) === "active");
    } catch {
      setStorageAvailable(false);
      setError("Este navegador bloqueou o armazenamento local. Libere os dados do site para criar uma conta e salvar registros.");
    } finally {
      setReady(true);
    }
  }, [accountKey, legacyAccountKey, legacySessionKey, product.slug, sessionKey]);

  const storedAccount = useMemo<Account | null>(() => {
    if (!ready || !storageAvailable) return null;
    try {
      const value = window.localStorage.getItem(accountKey);
      return value ? JSON.parse(value) as Account : null;
    } catch {
      return null;
    }
  }, [accountKey, ready, signedIn, storageAvailable]);

  const passwordRules = [
    { label: "8 ou mais caracteres", passed: draft.password.length >= 8 },
    { label: "uma letra maiúscula", passed: /[A-Z]/.test(draft.password) },
    { label: "um número", passed: /\d/.test(draft.password) },
  ];
  const passwordIsValid = passwordRules.every((rule) => rule.passed);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setDraft((current) => ({ ...current, password: "", confirmPassword: "" }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!storageAvailable) {
      setError("O armazenamento local está indisponível neste navegador.");
      return;
    }

    const email = draft.email.trim().toLowerCase();
    if (!email || !draft.password) {
      setError("Informe e-mail e senha.");
      return;
    }

    if (mode === "signup") {
      if (storedAccount) {
        setError("Já existe uma conta deste aplicativo neste navegador. Use a opção Entrar.");
        return;
      }
      if (!draft.name.trim() || !draft.company.trim()) {
        setError("Informe seu nome e o nome da empresa.");
        return;
      }
      if (!passwordIsValid) {
        setError("Crie uma senha que atenda aos três requisitos.");
        return;
      }
      if (draft.password !== draft.confirmPassword) {
        setError("A confirmação da senha não confere.");
        return;
      }

      const account: Account = {
        name: draft.name.trim(),
        company: draft.company.trim(),
        email,
        password: draft.password,
        createdAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem(accountKey, JSON.stringify(account));
        window.localStorage.setItem(sessionKey, "active");
        window.localStorage.setItem(`crmplus.preferences.${product.slug}`, JSON.stringify({ version: 1, value: { company: account.company, compact: false, logo: "" } }));
        window.history.replaceState({}, "", window.location.pathname);
        setSignedIn(true);
      } catch {
        setError("Não foi possível salvar a conta neste navegador.");
      }
      return;
    }

    if (!storedAccount || storedAccount.email !== email || storedAccount.password !== draft.password) {
      setError("E-mail ou senha não conferem para este aplicativo.");
      return;
    }

    try {
      window.localStorage.setItem(sessionKey, "active");
      setSignedIn(true);
    } catch {
      setError("Não foi possível iniciar a sessão neste navegador.");
    }
  }

  function signOut() {
    try {
      window.localStorage.removeItem(sessionKey);
    } finally {
      setSignedIn(false);
      setMode("login");
      setDraft({ name: "", company: "", email: "", password: "", confirmPassword: "" });
    }
  }

  if (!ready) return null;

  if (signedIn) {
    return (
      <div className={styles.signedInShell}>
        <div className={styles.sessionHeader}>
          <div><span className={styles.sessionIcon}><ProductIcon slug={product.slug} size={17} /></span><p><strong>{storedAccount?.name || "Usuário"}</strong><small>{storedAccount?.company || product.shortName}</small></p></div>
          <div className={styles.sessionActions}>
            <span className={styles.storageBadge}>Salvo neste navegador</span>
            <Link href="/">Voltar à loja</Link>
            <button type="button" onClick={signOut}>Sair</button>
          </div>
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
            <button type="button" className={mode === "login" ? styles.active : ""} onClick={() => changeMode("login")}>Entrar</button>
            <button type="button" className={mode === "signup" ? styles.active : ""} onClick={() => changeMode("signup")}>Criar conta</button>
          </div>
          {mode === "signup" && storedAccount ? <div className={styles.notice}>Já existe uma conta deste aplicativo neste navegador. <button type="button" onClick={() => changeMode("login")}>Entrar com ela</button></div> : null}
          <form className={styles.form} onSubmit={submit} noValidate>
            {mode === "signup" ? <>
              <label className={styles.field}><span>Seu nome</span><input required autoComplete="name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className={styles.field}><span>Empresa</span><input required autoComplete="organization" value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></label>
            </> : null}
            <label className={styles.field}><span>E-mail</span><input required autoComplete="email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /></label>
            <label className={styles.field}><span>Senha</span><input required aria-describedby={mode === "signup" ? `password-rules-${product.slug}` : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} type="password" minLength={mode === "signup" ? 8 : 1} value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} /></label>
            {mode === "signup" ? <>
              <div id={`password-rules-${product.slug}`} className={styles.passwordRules} aria-live="polite">{passwordRules.map((rule) => <span key={rule.label} className={rule.passed ? styles.ruleOk : ""}>{rule.passed ? "✓" : "○"} {rule.label}</span>)}</div>
              <label className={styles.field}><span>Confirmar senha</span><input required autoComplete="new-password" type="password" minLength={8} value={draft.confirmPassword} onChange={(event) => setDraft((current) => ({ ...current, confirmPassword: event.target.value }))} /></label>
            </> : null}
            {error ? <div className={styles.error} role="alert">{error}</div> : null}
            <button className={styles.submit} type="submit" disabled={!storageAvailable || (mode === "signup" && Boolean(storedAccount))}>{mode === "login" ? `Entrar no ${product.shortName}` : "Criar conta e entrar"}</button>
            <p className={styles.storageNote}>Conta, sessão e registros ficam somente neste navegador. Nenhum dado é enviado ao GitHub.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
