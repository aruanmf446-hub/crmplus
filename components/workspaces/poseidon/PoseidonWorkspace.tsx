"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "./PoseidonWorkspace.module.css";

type Stage = "lead" | "qualified" | "proposal" | "decision";
type View = "overview" | "pipeline" | "returns" | "clients" | "insights";

type Opportunity = {
  id: number;
  company: string;
  contact: string;
  value: number;
  stage: Stage;
  next: string;
  source: string;
};

const stages: { id: Stage; label: string }[] = [
  { id: "lead", label: "Novos leads" },
  { id: "qualified", label: "Em conversa" },
  { id: "proposal", label: "Proposta" },
  { id: "decision", label: "Decisão" },
];

const initialOpportunities: Opportunity[] = [
  { id: 1, company: "Casa Nativa", contact: "Marina Lopes", value: 6800, stage: "lead", next: "Hoje, 15:30", source: "Indicação" },
  { id: 2, company: "Oficina Dois Irmãos", contact: "Rafael Alves", value: 4200, stage: "lead", next: "Amanhã, 09:00", source: "Site" },
  { id: 3, company: "Clínica Vitta", contact: "Paula Reis", value: 9600, stage: "qualified", next: "Hoje, 17:00", source: "Instagram" },
  { id: 4, company: "Studio Norte", contact: "André Silva", value: 7300, stage: "qualified", next: "23 jul, 10:00", source: "Carteira" },
  { id: 5, company: "Empório Grão", contact: "Lívia Souza", value: 11800, stage: "proposal", next: "Hoje, 16:15", source: "Indicação" },
  { id: 6, company: "Vértice Engenharia", contact: "Caio Melo", value: 15600, stage: "decision", next: "24 jul, 14:00", source: "Evento" },
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function PoseidonWorkspace() {
  const [view, setView] = useState<View>("overview");
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return opportunities;
    return opportunities.filter((item) => `${item.company} ${item.contact} ${item.source}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [opportunities, query]);

  const total = opportunities.reduce((sum, item) => sum + item.value, 0);
  const proposals = opportunities.filter((item) => item.stage === "proposal" || item.stage === "decision");

  function move(id: number, direction: -1 | 1) {
    setOpportunities((items) => items.map((item) => {
      if (item.id !== id) return item;
      const index = stages.findIndex((stage) => stage.id === item.stage);
      return { ...item, stage: stages[Math.max(0, Math.min(stages.length - 1, index + direction))].id };
    }));
    showNotice("Etapa atualizada.");
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function addOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setOpportunities((items) => [{
      id: Date.now(),
      company: String(form.get("company")),
      contact: String(form.get("contact")),
      value: Number(form.get("value")),
      stage: "lead",
      next: "Retorno a definir",
      source: String(form.get("source")),
    }, ...items]);
    setModalOpen(false);
    setView("pipeline");
    showNotice("Lead adicionado ao funil.");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span>P</span><div><strong>Poseidon</strong><small>CRM Plus</small></div></div>
        <div className={styles.workspace}><small>Espaço de trabalho</small><b>CRM Plus Comercial</b></div>
        <nav aria-label="Navegação do Poseidon">
          <NavButton label="Visão geral" icon="⌂" active={view === "overview"} onClick={() => setView("overview")} />
          <NavButton label="Funil" icon="◇" active={view === "pipeline"} onClick={() => setView("pipeline")} />
          <NavButton label="Retornos" icon="↗" active={view === "returns"} onClick={() => setView("returns")} />
          <NavButton label="Clientes" icon="○" active={view === "clients"} onClick={() => setView("clients")} />
          <NavButton label="Insights" icon="⌁" active={view === "insights"} onClick={() => setView("insights")} />
        </nav>
        <p className={styles.offline}>Demonstração local<br />Dados fictícios</p>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <label className={styles.search}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa ou contato" /></label>
          <span className={styles.today}>Visão de hoje</span>
          <button className={styles.avatar} onClick={() => showNotice("Perfil demonstrativo.")} aria-label="Abrir perfil">AM</button>
        </header>

        <main className={styles.main}>
          {view === "overview" && <Overview opportunities={visible} total={total} onNew={() => setModalOpen(true)} onMove={move} onNavigate={setView} />}
          {view === "pipeline" && <Pipeline opportunities={visible} onNew={() => setModalOpen(true)} onMove={move} />}
          {view === "returns" && <Returns opportunities={visible} onDone={() => showNotice("Retorno registrado.")} />}
          {view === "clients" && <Clients opportunities={visible} />}
          {view === "insights" && <Insights opportunities={opportunities} total={total} proposals={proposals} />}
        </main>
      </div>

      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} onSubmit={addOpportunity} />}
      {notice && <div className={styles.toast} role="status">✓ {notice}</div>}
    </div>
  );
}

function NavButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return <button className={active ? styles.active : ""} onClick={onClick}><span aria-hidden="true">{icon}</span>{label}</button>;
}

function PageHeading({ eyebrow, title, description, action, onAction }: { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className={styles.heading}><div><small>{eyebrow}</small><h1>{title}</h1><p>{description}</p></div>{action && <button className={styles.primary} onClick={onAction}>＋ {action}</button>}</div>;
}

function Overview({ opportunities, total, onNew, onMove, onNavigate }: { opportunities: Opportunity[]; total: number; onNew: () => void; onMove: (id: number, direction: -1 | 1) => void; onNavigate: (view: View) => void }) {
  const dueToday = opportunities.filter((item) => item.next.startsWith("Hoje"));
  return <>
    <PageHeading eyebrow="Resumo comercial" title="Negociações no ritmo certo." description="Acompanhe cada conversa e saiba qual é o próximo passo." action="Novo lead" onAction={onNew} />
    <section className={styles.metrics} aria-label="Resumo do funil">
      <Metric label="Funil aberto" value={money.format(total)} detail={`${opportunities.length} oportunidades`} />
      <Metric label="Retornos hoje" value={String(dueToday.length).padStart(2, "0")} detail="conversas agendadas" />
      <Metric label="Em proposta" value={String(opportunities.filter((item) => item.stage === "proposal").length).padStart(2, "0")} detail="aguardando resposta" />
    </section>
    <div className={styles.overviewGrid}>
      <section className={styles.panel}>
        <div className={styles.panelTitle}><div><h2>Funil em andamento</h2><p>Movimente uma oportunidade conforme a conversa avança.</p></div><button onClick={() => onNavigate("pipeline")}>Ver funil</button></div>
        <div className={styles.compactPipeline}>{stages.map((stage) => <StageColumn key={stage.id} stage={stage} items={opportunities.filter((item) => item.stage === stage.id).slice(0, 2)} onMove={onMove} />)}</div>
      </section>
      <aside className={styles.panel}>
        <div className={styles.panelTitle}><div><h2>Próximos retornos</h2><p>Prioridades do dia.</p></div></div>
        <div className={styles.returnList}>{dueToday.length ? dueToday.map((item) => <article key={item.id}><span>{item.next.replace("Hoje, ", "")}</span><div><strong>{item.company}</strong><small>{item.contact}</small></div></article>) : <p className={styles.empty}>Nenhum retorno para hoje.</p>}</div>
      </aside>
    </div>
  </>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article><small>{label}</small><strong>{value}</strong><p>{detail}</p></article>;
}

function Pipeline({ opportunities, onNew, onMove }: { opportunities: Opportunity[]; onNew: () => void; onMove: (id: number, direction: -1 | 1) => void }) {
  return <><PageHeading eyebrow="Funil" title="Oportunidades" description="Da primeira conversa até a decisão do cliente." action="Novo lead" onAction={onNew} /><section className={styles.pipeline}>{stages.map((stage) => <StageColumn key={stage.id} stage={stage} items={opportunities.filter((item) => item.stage === stage.id)} onMove={onMove} />)}</section></>;
}

function StageColumn({ stage, items, onMove }: { stage: (typeof stages)[number]; items: Opportunity[]; onMove: (id: number, direction: -1 | 1) => void }) {
  const stageIndex = stages.findIndex((item) => item.id === stage.id);
  return <div className={styles.stage}><header><b>{stage.label}</b><span>{items.length}</span></header><div>{items.map((item) => <article className={styles.deal} key={item.id}><small>{item.source}</small><h3>{item.company}</h3><p>{item.contact}</p><strong>{money.format(item.value)}</strong><footer><span>{item.next}</span><div><button disabled={stageIndex === 0} onClick={() => onMove(item.id, -1)} aria-label={`Voltar ${item.company} uma etapa`}>‹</button><button disabled={stageIndex === stages.length - 1} onClick={() => onMove(item.id, 1)} aria-label={`Avançar ${item.company} uma etapa`}>›</button></div></footer></article>)}</div>{!items.length && <p className={styles.empty}>Nenhuma oportunidade</p>}</div>;
}

function Returns({ opportunities, onDone }: { opportunities: Opportunity[]; onDone: () => void }) {
  const ordered = [...opportunities].sort((a, b) => a.next.localeCompare(b.next));
  return <><PageHeading eyebrow="Agenda comercial" title="Retornos" description="Conversas que precisam continuar." /><section className={styles.listPanel}>{ordered.map((item) => <article key={item.id}><time>{item.next}</time><div><strong>{item.company}</strong><p>{item.contact} · {stages.find((stage) => stage.id === item.stage)?.label}</p></div><button onClick={onDone}>Registrar contato</button></article>)}</section></>;
}

function Clients({ opportunities }: { opportunities: Opportunity[] }) {
  return <><PageHeading eyebrow="Relacionamento" title="Contatos" description="Pessoas e empresas que fazem parte do seu funil." /><section className={styles.listPanel}>{opportunities.map((item) => <article key={item.id}><span className={styles.clientInitial}>{item.company.charAt(0)}</span><div><strong>{item.company}</strong><p>{item.contact} · Origem: {item.source}</p></div><span className={styles.value}>{money.format(item.value)}</span></article>)}</section></>;
}

function Insights({ opportunities, total, proposals }: { opportunities: Opportunity[]; total: number; proposals: Opportunity[] }) {
  const sourceCounts = opportunities.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.source]: (acc[item.source] ?? 0) + 1 }), {});
  const max = Math.max(...Object.values(sourceCounts), 1);
  return <><PageHeading eyebrow="Leitura do funil" title="Insights" description="Sinais simples para orientar a próxima ação." /><section className={styles.insightGrid}><article className={styles.insightMain}><small>Valor mais próximo da decisão</small><strong>{money.format(proposals.reduce((sum, item) => sum + item.value, 0))}</strong><p>{proposals.length} oportunidades estão em proposta ou decisão. Priorize os retornos desse grupo.</p></article><article><small>Ticket médio</small><strong>{money.format(total / Math.max(opportunities.length, 1))}</strong><p>Valor médio das oportunidades abertas.</p></article><article><small>Origem dos leads</small><div className={styles.bars}>{Object.entries(sourceCounts).map(([source, count]) => <div key={source}><span>{source}</span><i><b style={{ width: `${(count / max) * 100}%` }} /></i><em>{count}</em></div>)}</div></article></section></>;
}

function LeadModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="poseidon-modal-title"><header><div><small>Novo contato</small><h2 id="poseidon-modal-title">Adicionar lead</h2></div><button onClick={onClose} aria-label="Fechar">×</button></header><form onSubmit={onSubmit}><label>Empresa<input name="company" autoFocus required placeholder="Nome da empresa" /></label><label>Contato<input name="contact" required placeholder="Nome da pessoa" /></label><div className={styles.formRow}><label>Valor estimado<input name="value" min="0" type="number" required placeholder="0" /></label><label>Origem<select name="source" defaultValue="Indicação"><option>Indicação</option><option>Site</option><option>Instagram</option><option>Carteira</option><option>Evento</option></select></label></div><footer><button type="button" onClick={onClose}>Cancelar</button><button className={styles.primary}>Adicionar ao funil</button></footer></form></section></div>;
}
