"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("CRMPlus page error", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="global-state-page" role="alert">
          <section className="global-state-card global-state-error">
            <span className="global-state-mark" aria-hidden="true"><i /><i /><i /></span>
            <p>Não foi possível abrir esta área</p>
            <h1>Seus dados locais não foram apagados.</h1>
            <p className="global-state-description">Tente carregar novamente. Se o problema continuar, exporte um backup assim que o aplicativo voltar a abrir.</p>
            <div className="global-state-actions">
              <button type="button" onClick={reset}>Tentar novamente</button>
              <a href="/">Voltar para a loja</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
