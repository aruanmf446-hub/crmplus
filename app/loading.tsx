export default function Loading() {
  return (
    <main className="global-state-page" aria-busy="true" aria-label="Carregando página">
      <section className="global-state-card">
        <span className="global-state-mark" aria-hidden="true"><i /><i /><i /></span>
        <p>CRMPlus+</p>
        <h1>Preparando a sua experiência.</h1>
        <div className="global-state-progress" aria-hidden="true"><i /></div>
      </section>
    </main>
  );
}
