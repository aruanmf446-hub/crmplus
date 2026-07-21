"use client";

import { useMemo, useState } from "react";
import styles from "./hercules.module.css";

type View = "inicio" | "inspecao" | "nao-conformidades" | "acoes" | "relatorios";
type Result = "pendente" | "conforme" | "nao-conforme";

type ChecklistItem = {
  id: number;
  area: string;
  title: string;
  result: Result;
};

type NonConformity = {
  id: number;
  checklistId: number;
  title: string;
  severity: "Baixa" | "Média" | "Alta";
  note: string;
};

type ActionPlan = {
  id: number;
  nonConformityId: number;
  title: string;
  owner: string;
  due: string;
  done: boolean;
};

const initialChecklist: ChecklistItem[] = [
  { id: 1, area: "Recepção", title: "Rotas de circulação livres e sinalizadas", result: "conforme" },
  { id: 2, area: "Equipamentos", title: "Proteções e travas em condições de uso", result: "pendente" },
  { id: 3, area: "Documentação", title: "Registros da rotina preenchidos no turno", result: "pendente" },
  { id: 4, area: "Segurança", title: "Extintores acessíveis e dentro da validade", result: "conforme" },
  { id: 5, area: "Organização", title: "Materiais identificados e armazenados corretamente", result: "pendente" },
];

const navItems: Array<{ id: View; label: string; icon: IconName }> = [
  { id: "inicio", label: "Visão geral", icon: "home" },
  { id: "inspecao", label: "Inspeção atual", icon: "checklist" },
  { id: "nao-conformidades", label: "Não conformidades", icon: "warning" },
  { id: "acoes", label: "Planos de ação", icon: "target" },
  { id: "relatorios", label: "Relatórios", icon: "document" },
];

export function HerculesWorkspace() {
  const [view, setView] = useState<View>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [actions, setActions] = useState<ActionPlan[]>([]);
  const [toast, setToast] = useState("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState("");

  const completed = checklist.filter((item) => item.result !== "pendente").length;
  const progress = Math.round((completed / checklist.length) * 100);
  const openActions = actions.filter((action) => !action.done).length;

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function setResult(item: ChecklistItem, result: Result) {
    setChecklist((current) => current.map((entry) => (entry.id === item.id ? { ...entry, result } : entry)));

    if (result === "nao-conforme") {
      setNonConformities((current) => {
        if (current.some((entry) => entry.checklistId === item.id)) return current;
        return [
          ...current,
          {
            id: Date.now(),
            checklistId: item.id,
            title: item.title,
            severity: "Média",
            note: "Registrar evidência e causa observada.",
          },
        ];
      });
      showToast("Não conformidade registrada");
    } else {
      setNonConformities((current) => current.filter((entry) => entry.checklistId !== item.id));
      setActions((current) => current.filter((entry) => {
        const nonConformity = nonConformities.find((itemEntry) => itemEntry.id === entry.nonConformityId);
        return nonConformity?.checklistId !== item.id;
      }));
    }
  }

  function createAction(nonConformity: NonConformity) {
    setActions((current) => {
      if (current.some((entry) => entry.nonConformityId === nonConformity.id)) return current;
      return [
        ...current,
        {
          id: Date.now(),
          nonConformityId: nonConformity.id,
          title: `Corrigir: ${nonConformity.title}`,
          owner: "Marina Alves",
          due: "24/07/2026",
          done: false,
        },
      ];
    });
    navigate("acoes");
    showToast("Plano de ação criado");
  }

  function generateReport() {
    setReportGeneratedAt("21/07/2026 às 16:40");
    showToast("Relatório preparado para visualização");
  }

  return (
    <div className={styles.workspace}>
      <button
        className={`${styles.scrim} ${menuOpen ? styles.scrimOpen : ""}`}
        aria-label="Fechar menu"
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`} aria-label="Navegação do Hercules">
        <div className={styles.productMark}>
          <span className={styles.logo}><Icon name="shield" size={21} /></span>
          <span><strong>Hercules</strong><small>Inspeções e rotinas</small></span>
        </div>
        <div className={styles.company}>
          <small>Unidade atual</small>
          <strong>Operação Parauapebas</strong>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? styles.active : ""}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
              {item.id === "nao-conformidades" && nonConformities.length > 0 ? <b>{nonConformities.length}</b> : null}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          <span className={styles.avatar}>MA</span>
          <span><strong>Marina Alves</strong><small>Inspetora</small></span>
        </div>
      </aside>

      <div className={styles.page}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} type="button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" size={21} />
          </button>
          <div className={styles.context}><span>Inspeção semanal</span><strong>Áreas operacionais</strong></div>
          <div className={styles.sync}><span aria-hidden="true" />Dados desta sessão</div>
        </header>

        <main className={styles.main}>
          {view === "inicio" ? (
            <Overview
              progress={progress}
              nonConformities={nonConformities}
              openActions={openActions}
              onNavigate={navigate}
            />
          ) : null}
          {view === "inspecao" ? (
            <InspectionView
              checklist={checklist}
              progress={progress}
              onResult={setResult}
              onFinish={() => {
                if (completed < checklist.length) return;
                navigate("nao-conformidades");
                showToast("Inspeção concluída");
              }}
            />
          ) : null}
          {view === "nao-conformidades" ? (
            <NonConformitiesView
              items={nonConformities}
              onChange={setNonConformities}
              onCreateAction={createAction}
              onReturn={() => navigate("inspecao")}
            />
          ) : null}
          {view === "acoes" ? (
            <ActionsView
              actions={actions}
              onChange={setActions}
              onReturn={() => navigate("nao-conformidades")}
            />
          ) : null}
          {view === "relatorios" ? (
            <ReportsView
              checklist={checklist}
              nonConformities={nonConformities}
              actions={actions}
              generatedAt={reportGeneratedAt}
              onGenerate={generateReport}
            />
          ) : null}
        </main>
      </div>

      {toast ? <div className={styles.toast} role="status"><Icon name="check" size={17} />{toast}</div> : null}
    </div>
  );
}

function Overview({ progress, nonConformities, openActions, onNavigate }: {
  progress: number;
  nonConformities: NonConformity[];
  openActions: number;
  onNavigate: (view: View) => void;
}) {
  return (
    <>
      <section className={styles.heading}>
        <div><p>Visão de hoje</p><h1>Rotinas sob controle.</h1><span>Acompanhe o que foi verificado e resolva os pontos que precisam de atenção.</span></div>
        <button className={styles.primary} type="button" onClick={() => onNavigate("inspecao")}><Icon name="play" size={17} />Continuar inspeção</button>
      </section>

      <section className={styles.metrics} aria-label="Resumo da operação">
        <article><small>Inspeção atual</small><strong>{progress}%</strong><span>{progress === 100 ? "Concluída" : "Em andamento"}</span></article>
        <article><small>Não conformidades</small><strong>{nonConformities.length}</strong><span>{nonConformities.length ? "Precisam de tratamento" : "Nenhuma registrada"}</span></article>
        <article><small>Ações abertas</small><strong>{openActions}</strong><span>{openActions ? "Dentro do prazo" : "Nenhuma pendência"}</span></article>
      </section>

      <div className={styles.overviewGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><p>Inspeção semanal</p><h2>Áreas operacionais</h2></div><span>5 itens</span></div>
          <div className={styles.progressTrack} aria-label={`${progress}% concluído`}><span style={{ width: `${progress}%` }} /></div>
          <div className={styles.progressMeta}><span>{progress}% verificado</span><span>Periodicidade: semanal</span></div>
          <div className={styles.flowList}>
            <button type="button" onClick={() => onNavigate("inspecao")}><span>01</span><div><strong>Verificar checklist</strong><small>Registre conforme ou não conforme</small></div><Icon name="chevron" /></button>
            <button type="button" onClick={() => onNavigate("nao-conformidades")}><span>02</span><div><strong>Tratar ocorrências</strong><small>{nonConformities.length} registro(s) nesta inspeção</small></div><Icon name="chevron" /></button>
            <button type="button" onClick={() => onNavigate("acoes")}><span>03</span><div><strong>Acompanhar ações</strong><small>Responsáveis e prazos definidos</small></div><Icon name="chevron" /></button>
          </div>
        </section>

        <aside className={styles.sidePanel}>
          <p>Próxima rotina</p>
          <strong>Inspeção de segurança</strong>
          <time>24 jul · 08:00</time>
          <div><Icon name="repeat" size={17} /><span><small>Periodicidade</small>Semanal</span></div>
          <div><Icon name="user" size={17} /><span><small>Responsável</small>Marina Alves</span></div>
          <button type="button" onClick={() => onNavigate("relatorios")}>Configurar rotina <Icon name="chevron" size={16} /></button>
        </aside>
      </div>
    </>
  );
}

function InspectionView({ checklist, progress, onResult, onFinish }: {
  checklist: ChecklistItem[];
  progress: number;
  onResult: (item: ChecklistItem, result: Result) => void;
  onFinish: () => void;
}) {
  const pending = checklist.filter((item) => item.result === "pendente").length;
  return (
    <>
      <section className={styles.heading}>
        <div><p>Inspeção em andamento</p><h1>Áreas operacionais</h1><span>Marque o resultado observado em cada item.</span></div>
        <div className={styles.progressBadge}><strong>{progress}%</strong><span>{pending} pendente(s)</span></div>
      </section>
      <section className={styles.checklistPanel}>
        <div className={styles.checklistHeader}>
          <span>Item verificado</span><span>Resultado</span>
        </div>
        {checklist.map((item, index) => (
          <article className={styles.checkRow} key={item.id}>
            <div className={styles.checkCopy}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.area}</small><strong>{item.title}</strong></div>
            </div>
            <div className={styles.resultGroup} role="group" aria-label={`Resultado: ${item.title}`}>
              <button type="button" className={item.result === "conforme" ? styles.conformActive : ""} aria-pressed={item.result === "conforme"} onClick={() => onResult(item, "conforme")}><Icon name="check" size={15} />Conforme</button>
              <button type="button" className={item.result === "nao-conforme" ? styles.nonConformActive : ""} aria-pressed={item.result === "nao-conforme"} onClick={() => onResult(item, "nao-conforme")}><Icon name="close" size={15} />Não conforme</button>
            </div>
          </article>
        ))}
        <footer className={styles.checklistFooter}>
          <span>{pending ? `Verifique os ${pending} itens restantes.` : "Todos os itens foram verificados."}</span>
          <button className={styles.primary} type="button" disabled={pending > 0} onClick={onFinish}>Concluir inspeção <Icon name="chevron" size={16} /></button>
        </footer>
      </section>
    </>
  );
}

function NonConformitiesView({ items, onChange, onCreateAction, onReturn }: {
  items: NonConformity[];
  onChange: (items: NonConformity[]) => void;
  onCreateAction: (item: NonConformity) => void;
  onReturn: () => void;
}) {
  return (
    <>
      <section className={styles.heading}>
        <div><p>Tratamento</p><h1>Não conformidades</h1><span>Complete o registro antes de definir a correção.</span></div>
      </section>
      {items.length === 0 ? (
        <section className={styles.emptyState}><Icon name="shield" size={28} /><h2>Nenhuma ocorrência registrada</h2><p>Marque um item como não conforme durante a inspeção para iniciar o tratamento.</p><button className={styles.secondary} type="button" onClick={onReturn}>Voltar à inspeção</button></section>
      ) : (
        <div className={styles.issueList}>
          {items.map((item, index) => (
            <article key={item.id} className={styles.issueCard}>
              <header><span>NC-{String(index + 1).padStart(3, "0")}</span><strong>{item.title}</strong></header>
              <div className={styles.formGrid}>
                <label>Criticidade<select value={item.severity} onChange={(event) => onChange(items.map((entry) => entry.id === item.id ? { ...entry, severity: event.target.value as NonConformity["severity"] } : entry))}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
                <label className={styles.wideField}>Evidência ou observação<input value={item.note} onChange={(event) => onChange(items.map((entry) => entry.id === item.id ? { ...entry, note: event.target.value } : entry))} /></label>
              </div>
              <footer><span><Icon name="clock" size={15} />Registrada nesta inspeção</span><button className={styles.primary} type="button" onClick={() => onCreateAction(item)}>Criar plano de ação <Icon name="chevron" size={16} /></button></footer>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function ActionsView({ actions, onChange, onReturn }: {
  actions: ActionPlan[];
  onChange: (items: ActionPlan[]) => void;
  onReturn: () => void;
}) {
  return (
    <>
      <section className={styles.heading}>
        <div><p>Acompanhamento</p><h1>Planos de ação</h1><span>Responsáveis, prazos e conclusão em uma única visão.</span></div>
      </section>
      {actions.length === 0 ? (
        <section className={styles.emptyState}><Icon name="target" size={28} /><h2>Nenhum plano criado</h2><p>Transforme uma não conformidade em uma ação com responsável e prazo.</p><button className={styles.secondary} type="button" onClick={onReturn}>Ver não conformidades</button></section>
      ) : (
        <section className={styles.actionPanel}>
          <div className={styles.actionHeader}><span>Ação</span><span>Responsável</span><span>Prazo</span><span>Situação</span></div>
          {actions.map((action) => (
            <article key={action.id} className={styles.actionRow}>
              <div><small>NC vinculada</small><strong>{action.title}</strong></div>
              <label><span className={styles.mobileLabel}>Responsável</span><input value={action.owner} onChange={(event) => onChange(actions.map((entry) => entry.id === action.id ? { ...entry, owner: event.target.value } : entry))} /></label>
              <label><span className={styles.mobileLabel}>Prazo</span><input value={action.due} onChange={(event) => onChange(actions.map((entry) => entry.id === action.id ? { ...entry, due: event.target.value } : entry))} /></label>
              <button type="button" className={action.done ? styles.doneButton : styles.openButton} onClick={() => onChange(actions.map((entry) => entry.id === action.id ? { ...entry, done: !entry.done } : entry))}>{action.done ? <><Icon name="check" size={15} />Concluída</> : "Marcar concluída"}</button>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

function ReportsView({ checklist, nonConformities, actions, generatedAt, onGenerate }: {
  checklist: ChecklistItem[];
  nonConformities: NonConformity[];
  actions: ActionPlan[];
  generatedAt: string;
  onGenerate: () => void;
}) {
  const conform = checklist.filter((item) => item.result === "conforme").length;
  return (
    <>
      <section className={styles.heading}>
        <div><p>Relatórios e recorrência</p><h1>Feche o ciclo da inspeção.</h1><span>Defina a próxima rotina e prepare o registro desta execução.</span></div>
      </section>
      <div className={styles.reportGrid}>
        <section className={styles.reportConfig}>
          <h2>Periodicidade da rotina</h2>
          <p>O próximo registro será criado com esta configuração.</p>
          <label>Frequência<select defaultValue="Semanal"><option>Diária</option><option>Semanal</option><option>Quinzenal</option><option>Mensal</option></select></label>
          <label>Próxima execução<input type="date" defaultValue="2026-07-24" /></label>
          <label>Inspetor responsável<select defaultValue="Marina Alves"><option>Marina Alves</option><option>Paulo Souza</option><option>Carla Reis</option></select></label>
          <label className={styles.checkbox}><input type="checkbox" defaultChecked /><span>Incluir evidências no relatório</span></label>
        </section>
        <section className={styles.reportPreview}>
          <header><span className={styles.miniLogo}><Icon name="shield" size={18} /></span><div><strong>Relatório de inspeção</strong><small>Áreas operacionais · 21/07/2026</small></div></header>
          <div className={styles.reportNumbers}><span><small>Itens verificados</small><strong>{checklist.length}</strong></span><span><small>Conformes</small><strong>{conform}</strong></span><span><small>Não conformidades</small><strong>{nonConformities.length}</strong></span></div>
          <div className={styles.reportLine}><span>Planos de ação</span><strong>{actions.length}</strong></div>
          <div className={styles.reportLine}><span>Situação</span><strong>{checklist.some((item) => item.result === "pendente") ? "Em andamento" : "Concluída"}</strong></div>
          <button className={styles.primary} type="button" onClick={onGenerate}><Icon name="document" size={17} />Gerar relatório</button>
          {generatedAt ? <p className={styles.generated}><Icon name="check" size={15} />Prévia gerada em {generatedAt}</p> : null}
        </section>
      </div>
    </>
  );
}

type IconName = "home" | "checklist" | "warning" | "target" | "document" | "shield" | "menu" | "check" | "close" | "play" | "chevron" | "repeat" | "user" | "clock";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></svg>;
  if (name === "checklist") return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8M14 9h3M8 15l1.5 1.5L12 14M14 15h3"/></svg>;
  if (name === "warning") return <svg {...common}><path d="M10.3 3.6 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>;
  if (name === "target") return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m15 9 5-5M16 4h4v4"/></svg>;
  if (name === "document") return <svg {...common}><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h5"/></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-5"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
  if (name === "close") return <svg {...common}><path d="m7 7 10 10M17 7 7 17"/></svg>;
  if (name === "play") return <svg {...common}><path d="m8 5 11 7-11 7z"/></svg>;
  if (name === "chevron") return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
  if (name === "repeat") return <svg {...common}><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
  return null;
}
