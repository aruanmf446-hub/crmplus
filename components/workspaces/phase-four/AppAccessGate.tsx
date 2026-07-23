"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { getProductMedia } from "@/lib/storefront";
import { ProductIcon } from "@/components/ProductIcon";
import { ProductMediaImage } from "@/components/ProductMediaImage";
import styles from "./AppAccessGate.module.css";
import shellUi from "./AppShellEnhancements.module.css";

type Account = {
  name: string;
  company: string;
  email: string;
  passwordHash?: string;
  pinHash?: string;
  password?: string;
  pin?: string;
  createdAt?: string;
};
type Mode = "login" | "signup" | "forgot";

const globalAccountKey = "crmplus.access.account";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const pinPattern = /^\d{4}$/;

async function hashSecret(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function secretMatches(value: string, hash?: string, legacy?: string) {
  if (hash) return hash === await hashSecret(value);
  return Boolean(legacy && legacy === value);
}

export function AppAccessGate({ product, children }: { product: Product; children: ReactNode }) {
  const sessionKey = `crmplus.access.${product.slug}.session`;
  const legacyScopedAccountKey = `crmplus.access.${product.slug}.account`;
  const legacyOriginalAccountKey = `crmplus.${product.slug}.account`;
  const legacySessionKey = `crmplus.${product.slug}.session`;
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [storedAccount, setStoredAccount] = useState<Account | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ name: "", company: "", email: "", password: "", confirmPassword: "", pin: "" });
  const presentation = getProductPresentation(product.slug);
  const media = getProductMedia(product.slug);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const probeKey = `crmplus.storage.probe.${product.slug}`;
        window.localStorage.setItem(probeKey, "ok");
        window.localStorage.removeItem(probeKey);

        const existingGlobal = window.localStorage.getItem(globalAccountKey);
        if (!existingGlobal) {
          const legacyAccount = window.localStorage.getItem(legacyScopedAccountKey) ?? window.localStorage.getItem(legacyOriginalAccountKey);
          if (legacyAccount) window.localStorage.setItem(globalAccountKey, legacyAccount);
        }
        window.localStorage.removeItem(legacyScopedAccountKey);
        window.localStorage.removeItem(legacyOriginalAccountKey);

        const legacySession = window.localStorage.getItem(legacySessionKey);
        if (!window.localStorage.getItem(sessionKey) && legacySession) window.localStorage.setItem(sessionKey, legacySession);
        if (legacySession) window.localStorage.removeItem(legacySessionKey);

        const accountRaw = window.localStorage.getItem(globalAccountKey);
        const requestedMode = new URLSearchParams(window.location.search).get("modo");
        if (!active) return;
        setStoredAccount(accountRaw ? JSON.parse(accountRaw) as Account : null);
        setMode(requestedMode === "criar-conta" ? "signup" : requestedMode === "recuperar-senha" ? "forgot" : "login");
        setSignedIn(window.localStorage.getItem(sessionKey) === "active");
      } catch {
        if (!active) return;
        setStorageAvailable(false);
        setError("Este navegador bloqueou o armazenamento local. Libere os dados do site para criar uma conta e salvar registros.");
      } finally {
        if (active) setReady(true);
      }
    });
    return () => { active = false; };
  }, [legacyOriginalAccountKey, legacyScopedAccountKey, legacySessionKey, product.slug, sessionKey]);

  const passwordRules = [
    { label: "8 ou mais caracteres", passed: draft.password.length >= 8 },
    { label: "uma letra maiúscula", passed: /[A-Z]/.test(draft.password) },
    { label: "um número", passed: /\d/.test(draft.password) },
  ];
  const passwordIsValid = passwordRules.every((rule) => rule.passed);
  const confirmationStarted = draft.confirmPassword.length > 0;
  const passwordsMatch = confirmationStarted && draft.password === draft.confirmPassword;
  const emailIsValid = emailPattern.test(draft.email.trim());
  const pinIsValid = pinPattern.test(draft.pin);
  const needsPinSetup = Boolean(storedAccount && !storedAccount.pinHash && !storedAccount.pin);
  const signupReady = Boolean(draft.name.trim() && draft.company.trim()) && emailIsValid && passwordIsValid && passwordsMatch && pinIsValid;
  const recoveryReady = emailIsValid && passwordIsValid && passwordsMatch && pinIsValid;

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setDraft((current) => ({ ...current, password: "", confirmPassword: "", pin: "" }));
    const nextUrl = nextMode === "signup" ? `${window.location.pathname}?modo=criar-conta` : nextMode === "forgot" ? `${window.location.pathname}?modo=recuperar-senha` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }

  async function saveProtectedAccount(account: Account, password: string, pin: string) {
    const protectedAccount: Account = {
      name: account.name,
      company: account.company,
      email: account.email,
      passwordHash: await hashSecret(password),
      pinHash: await hashSecret(pin),
      createdAt: account.createdAt ?? new Date().toISOString(),
    };
    window.localStorage.setItem(globalAccountKey, JSON.stringify(protectedAccount));
    setStoredAccount(protectedAccount);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!storageAvailable) {
      setError("O armazenamento local está indisponível neste navegador.");
      return;
    }

    const email = draft.email.trim().toLowerCase();
    if (!emailIsValid) {
      setError("Informe um endereço de e-mail válido.");
      return;
    }
    if (!draft.password) {
      setError(mode === "forgot" ? "Informe a nova senha." : "Informe a senha.");
      return;
    }

    if (mode === "signup") {
      if (storedAccount) {
        setError("Já existe uma conta CRMPlus+ neste navegador. Use a opção Entrar.");
        return;
      }
      if (!draft.name.trim() || !draft.company.trim()) {
        setError("Informe seu nome e o nome da empresa.");
        return;
      }
      if (!passwordIsValid || !passwordsMatch) {
        setError("Crie e confirme uma senha que atenda aos três requisitos.");
        return;
      }
      if (!pinIsValid) {
        setError("Crie um PIN local com exatamente 4 números.");
        return;
      }

      try {
        await saveProtectedAccount({ name: draft.name.trim(), company: draft.company.trim(), email, createdAt: new Date().toISOString() }, draft.password, draft.pin);
        window.localStorage.setItem(sessionKey, "active");
        window.localStorage.setItem(`crmplus.preferences.${product.slug}`, JSON.stringify({ version: 2, value: { company: draft.company.trim(), logo: "" } }));
        window.history.replaceState({}, "", window.location.pathname);
        setSignedIn(true);
      } catch {
        setError("Não foi possível salvar a conta neste navegador.");
      }
      return;
    }

    if (mode === "forgot") {
      if (!storedAccount) {
        setError("Não existe uma conta CRMPlus+ salva neste navegador.");
        return;
      }
      if (storedAccount.email !== email) {
        setError("Este e-mail não corresponde à conta salva neste navegador.");
        return;
      }
      if (!storedAccount.pinHash && !storedAccount.pin) {
        setError("Esta conta antiga ainda não possui PIN. Entre com a senha atual para criar o PIN local.");
        return;
      }
      if (!pinIsValid || !(await secretMatches(draft.pin, storedAccount.pinHash, storedAccount.pin))) {
        setError("O PIN local não confere.");
        return;
      }
      if (!passwordIsValid || !passwordsMatch) {
        setError("Crie e confirme uma nova senha que atenda aos três requisitos.");
        return;
      }

      try {
        await saveProtectedAccount(storedAccount, draft.password, draft.pin);
        window.localStorage.setItem(sessionKey, "active");
        window.history.replaceState({}, "", window.location.pathname);
        setSignedIn(true);
      } catch {
        setError("Não foi possível redefinir a senha neste navegador.");
      }
      return;
    }

    if (!storedAccount || storedAccount.email !== email || !(await secretMatches(draft.password, storedAccount.passwordHash, storedAccount.password))) {
      setError("E-mail ou senha não conferem para esta conta CRMPlus+.");
      return;
    }
    if (needsPinSetup && !pinIsValid) {
      setError("Esta conta antiga precisa de um PIN local com exatamente 4 números.");
      return;
    }

    try {
      if (!storedAccount.passwordHash || needsPinSetup) {
        await saveProtectedAccount(storedAccount, draft.password, needsPinSetup ? draft.pin : storedAccount.pin ?? draft.pin);
      }
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
      setDraft({ name: "", company: "", email: "", password: "", confirmPassword: "", pin: "" });
    }
  }

  if (!ready) {
    return <main className={shellUi.loadingPage} aria-label="Carregando acesso"><section className={shellUi.loadingCard}><div className={shellUi.loadingBrand}><i className={shellUi.loadingLine} /><i className={shellUi.loadingLine} /><i className={shellUi.loadingLine} /></div><div className={shellUi.loadingForm}><i className={shellUi.loadingLine} /><i className={shellUi.loadingLine} /><i className={shellUi.loadingLine} /><i className={shellUi.loadingLine} /></div></section></main>;
  }

  if (signedIn) {
    return (
      <div className={styles.signedInShell}>
        <div className={styles.sessionHeader}>
          <div><span className={styles.sessionIcon}><ProductIcon slug={product.slug} size={17} /></span><p><strong>{storedAccount?.name || "Usuário"}</strong><small>{storedAccount?.company || product.shortName}</small></p></div>
          <div className={styles.sessionActions}>
            <span className={styles.storageBadge}>Conta CRMPlus+ · dados locais</span>
            <Link href="/">Voltar à loja</Link>
            <button type="button" onClick={signOut}>Sair deste app</button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  const pageStyle = { "--accent": product.color, "--accent-soft": product.colorSoft } as CSSProperties;
  const previewCandidates = [...media.galleryCandidates[1], ...media.coverCandidates];
  const heading = mode === "login" ? "Entrar no aplicativo" : mode === "signup" ? "Criar conta CRMPlus+" : "Redefinir senha";
  const description = mode === "login"
    ? `Use a mesma conta local para acessar o ${product.shortName} e os demais aplicativos.`
    : mode === "signup"
      ? "Crie uma única identidade local para testar todos os aplicativos CRMPlus+."
      : "Confirme o e-mail e o PIN local para criar uma nova senha.";
  const requiresNewPassword = mode !== "login";
  const submitDisabled = !storageAvailable || (mode === "signup" && (Boolean(storedAccount) || !signupReady)) || (mode === "forgot" && !recoveryReady);

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
          <div className={styles.formHeading}><small>{product.name}</small><h2>{heading}</h2><p>{description}</p></div>
          <div className={styles.tabs} role="tablist" aria-label="Modo de acesso">
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? styles.active : ""} onClick={() => changeMode("login")}>Entrar</button>
            <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? styles.active : ""} onClick={() => changeMode("signup")}>Criar conta</button>
          </div>
          {mode === "signup" && storedAccount ? <div className={styles.notice}>Já existe uma conta CRMPlus+ neste navegador. <button type="button" onClick={() => changeMode("login")}>Entrar com ela</button></div> : null}
          {mode === "forgot" ? <div className={styles.notice}>A recuperação funciona somente neste dispositivo e exige o PIN local. <button type="button" onClick={() => changeMode("login")}>Voltar para entrar</button></div> : null}
          {needsPinSetup && mode === "login" ? <div className={styles.notice}>Conta antiga detectada. Após confirmar a senha, crie um PIN de 4 números para proteger a recuperação local.</div> : null}
          <form className={styles.form} onSubmit={submit}>
            {mode === "signup" ? <>
              <label className={styles.field}><span>Seu nome</span><input required autoComplete="name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className={styles.field}><span>Empresa</span><input required autoComplete="organization" value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></label>
            </> : null}
            <label className={styles.field}><span>E-mail</span><input required autoComplete="email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} aria-invalid={draft.email.length > 0 && !emailIsValid} /></label>
            <label className={styles.field}><span>{mode === "forgot" ? "Nova senha" : "Senha"}</span><input required aria-describedby={requiresNewPassword ? `password-rules-${product.slug}` : undefined} autoComplete={requiresNewPassword ? "new-password" : "current-password"} type="password" minLength={requiresNewPassword ? 8 : 1} value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} /></label>
            {mode === "login" ? <button className={styles.recoveryLink} type="button" onClick={() => changeMode("forgot")}>Esqueci minha senha</button> : null}
            {requiresNewPassword ? <>
              <div id={`password-rules-${product.slug}`} className={styles.passwordRules} aria-live="polite">{passwordRules.map((rule) => <span key={rule.label} className={rule.passed ? styles.ruleOk : ""}>{rule.passed ? "✓" : "○"} {rule.label}</span>)}</div>
              <label className={styles.field}>
                <span>{mode === "forgot" ? "Confirmar nova senha" : "Confirmar senha"}</span>
                <input required aria-invalid={confirmationStarted && !passwordsMatch} aria-describedby={`password-confirmation-${product.slug}`} autoComplete="new-password" type="password" minLength={8} value={draft.confirmPassword} onChange={(event) => setDraft((current) => ({ ...current, confirmPassword: event.target.value }))} />
                <small id={`password-confirmation-${product.slug}`} className={`${styles.confirmStatus} ${confirmationStarted ? (passwordsMatch ? styles.confirmOk : styles.confirmError) : ""}`} aria-live="polite">{!confirmationStarted ? "Repita a senha para confirmar." : passwordsMatch ? "✓ As senhas conferem." : "As senhas não conferem."}</small>
              </label>
            </> : null}
            {(mode !== "login" || needsPinSetup) ? <label className={styles.field}><span>{needsPinSetup && mode === "login" ? "Criar PIN local" : "PIN local"}</span><input required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="off" value={draft.pin} onChange={(event) => setDraft((current) => ({ ...current, pin: event.target.value.replace(/\D/g, "").slice(0, 4) }))} /><small>Use exatamente 4 números. Ele será solicitado somente para recuperar a senha neste dispositivo.</small></label> : null}
            {error ? <div className={styles.error} role="alert">{error}</div> : null}
            <button className={styles.submit} type="submit" disabled={submitDisabled}>{mode === "login" ? `Entrar no ${product.shortName}` : mode === "signup" ? "Criar conta e entrar" : "Redefinir senha e entrar"}</button>
            <p className={styles.storageNote}><strong>Demonstração local.</strong> Não use uma senha utilizada em outros serviços. A senha e o PIN são protegidos por hash; conta, sessão e registros permanecem somente neste navegador.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
