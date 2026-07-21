"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import type { Workspace, WorkspaceRow } from "@/lib/workspaces";
import { ProductIcon } from "./ProductIcon";
import { UiIcon } from "./UiIcon";

const navIcons = ["calendar", "document", "users", "box"] as const;
type LocalRow = WorkspaceRow & { id: string };
type RecordMap = Record<string, LocalRow[]>;
type ModalState = { viewId: string; row?: LocalRow } | null;

type Soul = {
  tag: string;
  support: string;
  ambient: string;
  manifesto: string;
  rituals: [string, string, string];
  hiddenViews?: string[];
  fieldLabels: { title: string; meta: string; value: string; status: string };
  placeholders: { title: string; meta: string; value: string };
  statuses: string[];
  filters: [string, string, string];
  actionDone: string;
  actionOpen: string;
  activityTitle: string;
  activityDescription: string;
  metricOverride?: { label: string; value: string; detail: string }[];
  focusTitle?: string;
  focusDescription?: string;
};

const souls: Record<string, Soul> = {
  atlas: {
    tag: "Pátio em movimento",
    support: "Cada veículo com contexto, próxima ação e histórico na mesma tela.",
    ambient: "Central da oficina",
    manifesto: "Aqui, nenhuma OS vira papel perdido e nenhum cliente precisa perguntar duas vezes.",
    rituals: ["Receber e fotografar", "Diagnosticar com clareza", "Entregar com histórico"],
    fieldLabels: { title: "Cliente, veículo ou OS", meta: "Defeito informado e diagnóstico", value: "Estimativa ou referência", status: "Etapa do atendimento" },
    placeholders: { title: "Ex.: OS 1052 · Hilux branca", meta: "Ruído ao esterçar; verificar suspensão dianteira", value: "Ex.: R$ 850 estimados" },
    statuses: ["Aguardando avaliação", "Orçamento enviado", "Aprovado", "Em serviço", "Finalizado", "Entregue"],
    filters: ["Todos", "Na oficina", "Entregues"],
    actionDone: "Entregar",
    actionOpen: "Reabrir OS",
    activityTitle: "Pulso da oficina",
    activityDescription: "O que mudou no pátio e nos atendimentos",
  },
  ares: {
    tag: "Propostas que se explicam",
    support: "Organize escopo, validade e decisão do cliente sem transformar orçamento em pedido.",
    ambient: "Mesa de propostas",
    manifesto: "Um bom orçamento não pressiona: ele deixa claro o que será feito, quanto custa e até quando vale.",
    rituals: ["Montar escopo", "Enviar para decisão", "Registrar aprovação"],
    hiddenViews: ["pedidos"],
    fieldLabels: { title: "Cliente ou identificação", meta: "Escopo e condições", value: "Valor estimado", status: "Situação da proposta" },
    placeholders: { title: "Ex.: OR-131 · Studio Aurora", meta: "Identidade visual, 3 entregas, validade de 10 dias", value: "Ex.: R$ 2.900" },
    statuses: ["Rascunho", "Enviado", "Visualizado", "Aprovado", "Reprovado", "Vencido"],
    filters: ["Todos", "Em decisão", "Encerrados"],
    actionDone: "Encerrar",
    actionOpen: "Retomar",
    activityTitle: "Sinais do cliente",
    activityDescription: "Visualizações, respostas e decisões recentes",
    focusTitle: "Orçamentos em decisão",
    focusDescription: "Da primeira versão à aprovação ou reprovação, sem gerar pedidos.",
  },
  artemis: {
    tag: "Salão e cozinha no mesmo compasso",
    support: "Comandas simples, cardápio vivo e preparo visível — sem caixa e sem controle de estoque.",
    ambient: "Passe da cozinha",
    manifesto: "O pedido certo, na hora certa, para a mesa certa. O resto é ruído.",
    rituals: ["Abrir comanda", "Enviar à cozinha", "Marcar como servido"],
    hiddenViews: ["caixa"],
    fieldLabels: { title: "Mesa, comanda ou item", meta: "Itens e observações", value: "Quantidade ou referência", status: "Etapa do preparo" },
    placeholders: { title: "Ex.: Mesa 06 · Comanda 412", meta: "2 burgers sem cebola, 1 suco sem gelo", value: "Ex.: 3 itens" },
    statuses: ["Recebido", "Em preparo", "Pronto", "Servido", "Pausado"],
    filters: ["Todos", "Na cozinha", "Servidos"],
    actionDone: "Servir",
    actionOpen: "Voltar à cozinha",
    activityTitle: "Ritmo do atendimento",
    activityDescription: "Pedidos que entraram, ficaram prontos ou foram servidos",
    metricOverride: [
      { label: "Comandas abertas", value: "12", detail: "4 em preparo" },
      { label: "Tempo médio", value: "18 min", detail: "3 min abaixo de ontem" },
      { label: "Mesas atendidas", value: "28", detail: "6 aguardando pedido" },
    ],
  },
  pandora: {
    tag: "A voz do cliente, sem planilha fria",
    support: "Transforme respostas curtas em temas, alertas e ações que a equipe entende.",
    ambient: "Sala de escuta",
    manifesto: "Nota sem contexto é só número. Aqui, cada comentário aponta uma decisão.",
    rituals: ["Criar pergunta curta", "Compartilhar o link", "Transformar resposta em ação"],
    fieldLabels: { title: "Pesquisa, comentário ou tema", meta: "Pergunta, contexto ou observação", value: "Nota, respostas ou indicador", status: "Leitura do feedback" },
    placeholders: { title: "Ex.: Pós-atendimento oficina", meta: "Como você avalia a clareza das explicações?", value: "Ex.: 4,7 de 5" },
    statuses: ["Rascunho", "Ativa", "Positivo", "Atenção", "Revisar", "Encerrada"],
    filters: ["Todos", "Para analisar", "Resolvidos"],
    actionDone: "Resolver",
    actionOpen: "Revisar novamente",
    activityTitle: "Vozes recentes",
    activityDescription: "Respostas e temas que merecem atenção",
  },
  poseidon: {
    tag: "Venda é próximo passo, não pressão",
    support: "Deixe claro quem contatar, por quê e quando — sem transformar o funil em burocracia.",
    ambient: "Sala comercial",
    manifesto: "Toda oportunidade deve terminar com uma próxima ação concreta, mesmo quando a resposta é não.",
    rituals: ["Entender a necessidade", "Combinar o retorno", "Registrar a decisão"],
    fieldLabels: { title: "Cliente ou oportunidade", meta: "Necessidade e próximo passo", value: "Potencial ou referência", status: "Etapa da conversa" },
    placeholders: { title: "Ex.: Oficina Horizonte", meta: "Retornar quinta-feira com proposta ajustada", value: "Ex.: R$ 6.500 potencial" },
    statuses: ["Novo lead", "Qualificação", "Proposta", "Decisão", "Ganho", "Perdido"],
    filters: ["Todos", "Em conversa", "Decididos"],
    actionDone: "Registrar decisão",
    actionOpen: "Reabrir conversa",
    activityTitle: "Movimentos do funil",
    activityDescription: "Novos contatos, retornos e decisões",
  },
  hercules: {
    tag: "Inspeção que deixa evidência",
    support: "Checklists objetivos, desvios visíveis e histórico para provar o que foi conferido.",
    ambient: "Posto de inspeção",
    manifesto: "Conformidade não é marcar caixinha: é saber o que falhou, quem corrige e qual evidência ficou.",
    rituals: ["Conferir item a item", "Registrar foto ou observação", "Tratar o desvio"],
    fieldLabels: { title: "Inspeção, item ou desvio", meta: "Local, evidência e observação", value: "Prazo, progresso ou referência", status: "Resultado da inspeção" },
    placeholders: { title: "Ex.: Inspeção do veículo 07", meta: "Pneu dianteiro com desgaste irregular; foto registrada", value: "Ex.: Corrigir até 17:00" },
    statuses: ["A iniciar", "Em execução", "Conforme", "Não conforme", "Atenção", "Corrigido"],
    filters: ["Todos", "Com pendência", "Conformes"],
    actionDone: "Validar",
    actionOpen: "Reabrir inspeção",
    activityTitle: "Evidências recentes",
    activityDescription: "Execuções, desvios e correções registradas",
  },
};

function seedRecords(workspace: Workspace): RecordMap {
  return Object.fromEntries(workspace.views.map((view) => [view.id, view.rows.map((row, index) => ({ ...row, id: `${view.id}-${index + 1}` }))]));
}

export function AppWorkspace({ product, workspace }: { product: Product; workspace: Workspace }) {
  const soul = souls[product.slug] ?? souls.atlas;
  const visibleViews = workspace.views.filter((view) => !soul.hiddenViews?.includes(view.id));
  const [activeView, setActiveView] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState("");
  const [records, setRecords] = useState<RecordMap>(() => seedRecords(workspace));
  const [hydrated, setHydrated] = useState(false);
  const storageKey = `crmplus:${product.slug}:records:v1`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setRecords(JSON.parse(saved) as RecordMap);
    } catch {
      setToast("Não foi possível carregar os dados locais.");
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }, [hydrated, records, storageKey]);

  const currentView = visibleViews.find((view) => view.id === activeView);
  const currentRows = currentView ? records[currentView.id] ?? [] : [];
  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return currentRows;
    return currentRows.filter((row) => `${row.title} ${row.meta} ${row.value} ${row.status}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [currentRows, search]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function changeView(view: string) {
    setActiveView(view);
    setSearch("");
    setMenuOpen(false);
  }

  function openCreate() {
    const viewId = activeView === "overview" ? visibleViews[0]?.id : activeView;
    if (viewId) setModal({ viewId });
  }

  function saveRecord(payload: Omit<LocalRow, "id">) {
    if (!modal) return;
    setRecords((current) => {
      const rows = current[modal.viewId] ?? [];
      const nextRows = modal.row ? rows.map((row) => (row.id === modal.row?.id ? { ...payload, id: row.id } : row)) : [{ ...payload, id: `${modal.viewId}-${Date.now()}` }, ...rows];
      return { ...current, [modal.viewId]: nextRows };
    });
    setModal(null);
    showToast(modal.row ? "Registro atualizado." : `Novo registro salvo no ${product.shortName}.`);
  }

  function deleteRecord(viewId: string, id: string) {
    setRecords((current) => ({ ...current, [viewId]: (current[viewId] ?? []).filter((row) => row.id !== id) }));
    showToast("Registro excluído deste navegador.");
  }

  function toggleRecord(viewId: string, row: LocalRow) {
    const finished = /concluído|finalizado|entregue|aprovado|conforme|pronto|servido|resolvido|ganho|perdido|corrigido/i.test(row.status);
    setRecords((current) => ({ ...current, [viewId]: (current[viewId] ?? []).map((item) => item.id === row.id ? { ...item, status: finished ? soul.statuses[0] : soul.statuses.at(-1) ?? "Concluído" } : item) }));
    showToast(finished ? soul.actionOpen : soul.actionDone);
  }

  return (
    <div className={`workspace workspace-${product.slug} soul-workspace soul-${product.slug}`} data-product={product.slug} style={{ "--app-accent": product.color, "--app-soft": product.colorSoft } as React.CSSProperties}>
      <button className={`workspace-scrim ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
      <aside className={`workspace-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="workspace-product"><span><ProductIcon slug={product.slug} size={23} /></span><div><b>{product.shortName}</b><small>{soul.ambient}</small></div><button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Fechar navegação"><UiIcon name="close" /></button></div>
        <div className="workspace-company"><small>{soul.tag}</small><strong>{workspace.business}</strong></div>
        <nav className="workspace-nav" aria-label={`Navegação do ${product.name}`}>
          <button className={activeView === "overview" ? "active" : ""} onClick={() => changeView("overview")}><UiIcon name="home" /><span>Visão geral</span></button>
          {visibleViews.map((view, index) => <button key={view.id} className={activeView === view.id ? "active" : ""} onClick={() => changeView(view.id)}><UiIcon name={navIcons[index] ?? "document"} /><span>{view.label}</span></button>)}
        </nav>
        <div className="workspace-sidebar-bottom"><div className="soul-whisper">“{soul.manifesto}”</div><button onClick={() => showToast("Tudo deste app fica somente neste navegador.")}><UiIcon name="settings" /><span>Dados locais</span></button><Link href="/"><UiIcon name="arrow" /><span>Voltar à Store</span></Link></div>
      </aside>

      <div className="workspace-body">
        <header className="workspace-topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir navegação"><UiIcon name="menu" /></button><div className="mobile-product"><ProductIcon slug={product.slug} size={19} /><b>{product.shortName}</b></div><label className="workspace-search"><UiIcon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={workspace.searchPlaceholder} aria-label={workspace.searchPlaceholder} /></label><span className="demo-label">{soul.ambient}</span><button className="topbar-icon" onClick={() => showToast("Nada urgente por aqui.")} aria-label="Notificações"><UiIcon name="bell" size={19} /></button><button className="user-avatar" onClick={() => showToast(`Administrador local do ${product.shortName}.`)} aria-label="Abrir perfil">AM</button></header>
        <main className="workspace-main">
          {activeView === "overview" ? <Overview product={product} workspace={workspace} soul={soul} onCreate={openCreate} /> : currentView ? <DataView key={currentView.id} view={currentView} rows={filteredRows} search={search} action={workspace.primaryAction} soul={soul} onCreate={openCreate} onEdit={(row) => setModal({ viewId: currentView.id, row })} onDelete={(row) => deleteRecord(currentView.id, row.id)} onToggle={(row) => toggleRecord(currentView.id, row)} /> : null}
        </main>
      </div>

      {modal ? <RecordModal title={modal.row ? "Editar registro" : workspace.primaryAction} product={product} soul={soul} row={modal.row} onClose={() => setModal(null)} onSave={saveRecord} /> : null}
      {toast ? <div className="workspace-toast"><UiIcon name="check" size={17} />{toast}</div> : null}
    </div>
  );
}

function Overview({ product, workspace, soul, onCreate }: { product: Product; workspace: Workspace; soul: Soul; onCreate: () => void }) {
  const metrics = soul.metricOverride ?? workspace.metrics;
  return <>
    <section className="workspace-heading soul-heading"><div><p>{soul.tag}</p><h1>{workspace.greeting}</h1><span>{soul.support}</span></div><button className="workspace-primary" onClick={onCreate}><UiIcon name="plus" size={18} />{workspace.primaryAction}</button></section>
    <section className="soul-rituals" aria-label="Fluxo principal">{soul.rituals.map((ritual, index) => <article key={ritual}><span>0{index + 1}</span><strong>{ritual}</strong></article>)}</section>
    <section className="metric-grid" aria-label="Resumo do dia">{metrics.map((metric) => <article key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.detail}</p></article>)}</section>
    <section className="workspace-overview-grid"><div className="focus-panel"><div className="panel-heading"><div><h2>{soul.focusTitle ?? workspace.focusTitle}</h2><p>{soul.focusDescription ?? workspace.focusDescription}</p></div></div><div className="focus-columns">{workspace.focusColumns.map((column) => <div className="focus-column" key={column.label}><div><b>{column.label}</b><span>{column.count}</span></div>{column.items.map((item) => <article key={item.title}><strong>{item.title}</strong><small>{item.meta}</small></article>)}</div>)}</div></div><aside className="activity-panel"><div className="panel-heading"><div><h2>{soul.activityTitle}</h2><p>{soul.activityDescription}</p></div></div><ol>{workspace.activity.map((item) => <li key={item.title}><span className="activity-dot" /><div><strong>{item.title}</strong><small>{item.time}</small><em>{item.status}</em></div></li>)}</ol><Link href={`/apps/${product.slug}`}>Conhecer a proposta do {product.shortName} <UiIcon name="arrow" size={16} /></Link></aside></section>
  </>;
}

function DataView({ view, rows, search, action, soul, onCreate, onEdit, onDelete, onToggle }: { view: Workspace["views"][number]; rows: LocalRow[]; search: string; action: string; soul: Soul; onCreate: () => void; onEdit: (row: LocalRow) => void; onDelete: (row: LocalRow) => void; onToggle: (row: LocalRow) => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [selected, setSelected] = useState<LocalRow | null>(null);
  const isDone = (status: string) => /concluído|finalizado|entregue|aprovado|conforme|pronto|disponível|encerrada|servido|resolvido|ganho|perdido|corrigido/i.test(status);
  const visibleRows = rows.filter((row) => filter === "all" || (filter === "done" ? isDone(row.status) : !isDone(row.status)));
  return <><section className="workspace-heading data-heading"><div><p>{soul.ambient}</p><h1>{view.label}</h1><span>{view.description}</span></div><button className="workspace-primary" onClick={onCreate}><UiIcon name="plus" size={18} />{action}</button></section><section className="data-panel"><div className="data-toolbar"><div><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{soul.filters[0]}</button><button className={filter === "open" ? "active" : ""} onClick={() => setFilter("open")}>{soul.filters[1]}</button><button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>{soul.filters[2]}</button></div><span>{visibleRows.length} registros</span></div><div className="data-table" role="table" aria-label={view.label}>{visibleRows.length ? visibleRows.map((row) => <button className={`data-row ${selected?.id === row.id ? "is-selected" : ""}`} key={row.id} role="row" onClick={() => setSelected(row)}><span className="data-row-icon"><UiIcon name="document" size={18} /></span><span className="data-row-main"><strong>{row.title}</strong><small>{row.meta}</small></span><b>{row.value}</b><em>{row.status}</em><UiIcon name="arrow" size={16} /></button>) : <div className="empty-state"><UiIcon name="search" size={26} /><h2>Nada por aqui</h2><p>{search ? `Não encontramos “${search}”.` : `Nenhum registro em “${filter === "open" ? soul.filters[1] : soul.filters[2]}”.`}</p></div>}</div>{selected ? <div className="selected-row-note record-actions"><span><UiIcon name="check" size={15} />{selected.title}</span><div><button onClick={() => onToggle(selected)}>{isDone(selected.status) ? soul.actionOpen : soul.actionDone}</button><button onClick={() => onEdit(selected)}>Editar</button><button className="danger-action" onClick={() => { onDelete(selected); setSelected(null); }}>Excluir</button><button onClick={() => setSelected(null)}>Fechar</button></div></div> : null}</section></>;
}

function RecordModal({ title, product, soul, row, onClose, onSave }: { title: string; product: Product; soul: Soul; row?: LocalRow; onClose: () => void; onSave: (payload: Omit<LocalRow, "id">) => void }) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({ title: String(data.get("title") ?? ""), meta: String(data.get("meta") ?? ""), value: String(data.get("value") ?? ""), status: String(data.get("status") ?? soul.statuses[0]) });
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="demo-modal soul-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><span><ProductIcon slug={product.slug} size={21} /></span><div><small>{soul.ambient}</small><h2 id="modal-title">{title}</h2></div><button onClick={onClose} aria-label="Fechar"><UiIcon name="close" /></button></div><div className="modal-manifesto">{soul.manifesto}</div><form onSubmit={submit}><label><span>{soul.fieldLabels.title}</span><input name="title" required autoFocus defaultValue={row?.title} placeholder={soul.placeholders.title} /></label><label><span>{soul.fieldLabels.meta}</span><textarea name="meta" defaultValue={row?.meta} placeholder={soul.placeholders.meta} rows={3} /></label><div className="form-grid"><label><span>{soul.fieldLabels.value}</span><input name="value" defaultValue={row?.value} placeholder={soul.placeholders.value} /></label><label><span>{soul.fieldLabels.status}</span><select name="status" defaultValue={row?.status ?? soul.statuses[0]}>{soul.statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="workspace-primary">Salvar no {product.shortName}</button></div></form></section></div>;
}
