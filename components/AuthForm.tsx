"use client";

import Link from "next/link";
import { useState } from "react";

type AuthMode = "signup" | "login" | "forgot";

const copy = {
  signup: { eyebrow: "Nova conta", title: "Crie seu espaço no CRMPlus+.", description: "Preencha os dados para visualizar a experiência de cadastro." },
  login: { eyebrow: "Acesso", title: "Entre na sua conta.", description: "Use seus dados para acessar o ambiente da sua empresa." },
  forgot: { eyebrow: "Recuperar acesso", title: "Vamos redefinir sua senha.", description: "Informe seu e-mail e enviaremos as instruções quando o serviço estiver conectado." },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [submitted, setSubmitted] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const content = copy[mode];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signup") {
      const data = new FormData(event.currentTarget);
      if (data.get("password") !== data.get("confirmPassword")) {
        setError("As senhas precisam ser iguais.");
        return;
      }
    }
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="auth-panel auth-success" aria-live="polite">
        <span className="auth-success-icon">✓</span>
        <p>{content.eyebrow}</p>
        <h1>{mode === "forgot" ? "Solicitação preparada." : mode === "signup" ? "Cadastro simulado com sucesso." : "Entrada simulada com sucesso."}</h1>
        <span>Esta etapa ainda funciona somente no navegador. Nenhum dado foi enviado ou armazenado.</span>
        <Link className="auth-submit" href={mode === "forgot" ? "/entrar" : "/sistemas/atlas"}>{mode === "forgot" ? "Voltar para entrar" : "Abrir ambiente interno"}</Link>
      </section>
    );
  }

  return (
    <section className="auth-panel">
      <div className="auth-heading"><p>{content.eyebrow}</p><h1>{content.title}</h1><span>{content.description}</span></div>
      <form className="auth-form" onSubmit={submit}>
        {mode === "signup" ? (
          <>
            <label><span>Empresa</span><input name="company" required autoComplete="organization" placeholder="Nome da empresa" /></label>
            <label><span>Nome do perfil</span><input name="name" required autoComplete="name" placeholder="Como devemos chamar você?" /></label>
          </>
        ) : null}
        <label><span>E-mail</span><input name="email" required type="email" autoComplete="email" placeholder="nome@example.com" /></label>
        {mode !== "forgot" ? <label><span>Senha</span><input name="password" required minLength={6} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="Mínimo de 6 caracteres" /></label> : null}
        {mode === "signup" ? (
          <>
            <label><span>Confirmar senha</span><input name="confirmPassword" required minLength={6} type="password" autoComplete="new-password" placeholder="Repita a senha" /></label>
            <label><span>PIN de segurança</span><span className="auth-pin"><input name="pin" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} type={showPin ? "text" : "password"} placeholder="4 números" /><button type="button" onClick={() => setShowPin((value) => !value)}>{showPin ? "Ocultar" : "Mostrar"}</button></span><small>Usado para confirmar ações importantes.</small></label>
          </>
        ) : null}
        {mode === "login" ? <Link className="forgot-link" href="/recuperar-senha">Esqueci a senha</Link> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        <button className="auth-submit" type="submit">{mode === "signup" ? "Criar conta" : mode === "login" ? "Entrar" : "Continuar"}</button>
      </form>
      <p className="auth-switch">
        {mode === "signup" ? <>Já tem uma conta? <Link href="/entrar">Entrar</Link></> : mode === "login" ? <>Ainda não tem uma conta? <Link href="/criar-conta">Criar conta</Link></> : <>Lembrou a senha? <Link href="/entrar">Entrar</Link></>}
      </p>
      <small className="auth-disclaimer">Ambiente interno de desenvolvimento. Os dados deste formulário não são enviados.</small>
    </section>
  );
}
