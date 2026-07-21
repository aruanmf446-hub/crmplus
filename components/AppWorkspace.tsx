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

function seedRecords(workspace: Workspace): RecordMap {
  return Object.fromEntries(
    workspace.views.map((view) => [
      view.id,
      view.rows.map((row, index) => ({ ...row, id: `${view.id}-${index + 1}` })),
    ]),
  );
}

export function AppWorkspace({ product, workspace }: { product: Product; workspace: Workspace }) {
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

  const currentView = workspace.views.find((view) => view.id === activeView);
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
    const viewId = activeView === "overview" ? workspace.views[0]?.id : activeView;
    if (viewId) setModal({ viewId });
  }

  function saveRecord(payload: Omit<LocalRow, "id">) {
    if (!modal) return;
    setRecords((current) => {
      const rows = current[modal.viewId] ?? [];
      const nextRows = modal.row
        ? rows.map((row) => (row.id === modal.row?.id ? { ...payload, id: row.id } : row))
        : [{ ...payload, id: `${modal.viewId}-${Date.now()}` }, ...rows];
      return { ...current, [modal.viewId]: nextRows };
    });
    setModal(null);
    showToast(modal.row ? "Registro atualizado." : "Registro salvo neste navegador.");
  }

  function deleteRecord(viewId: string, id: string) {
    setRecords((current) => ({ ...current, [viewId]: (current[viewId] ?? []).filter((row) => row.id !== id) }));
    showToast("Registro excluído.");
  }

  function toggleRecord(viewId: string, row: LocalRow) {
    const finished = /concluído|finalizado|entregue|aprovado|conforme|pronto/i.test(row.status);
    setRecords((current) => ({
      ...current,
      [viewId]: (current[viewId] ?? []).map((item) => item.id === row.id ? { ...item, status: finished ? "Em aberto" : "Concluído" } : item),
    }));
    showToast(finished ? "Registro reaberto." : "Registro concluído.");
  }

  return (
    <div className={`workspace workspace-${product.slug}`} data-product={product.slug} style={{ "--app-accent": product.color, "--app-soft": product.colorSoft } as React.CSSProperties}>
      <button className={`workspace-scrim ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
      <aside className={`workspace-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="workspace-product"><span><ProductIcon slug={product.slug} size={23} /></span><div><b>{product.shortName}</b><small>CRM Plus</small></div><button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Fechar navegação"><UiIcon name="close" /></button></div>
        <div className="workspace-company"><small>Espaço de trabalho</small><strong>{workspace.business}</strong></div>
        <nav className="workspace-nav" aria-label={`Navegação do ${product.name}`}>
          <button className={activeView === "overview" ? "active" : ""} onClick={() => changeView("overview")}><UiIcon name="home" /><span>Visão geral</span></button>
          {workspace.views.map((view, index) => <button key={view.id} className={activeView === view.id ? "active" : ""} onClick={() => changeView(view.id)}><UiIcon name={navIcons[index] ?? "document"} /><span>{view.label}</span></button>)}
        </nav>
        <div className="workspace-sidebar-bottom"><button onClick={() => showToast("Os dados deste app ficam somente neste navegador.")}><UiIcon name="settings" /><span>Armazenamento local</span></button><Link href="/"><UiIcon name="arrow" /><span>Voltar à Store</span></Link><p>Ambiente local<br />Sem envio externo</p></div>
      </aside>

      <div className="workspace-body">
        <header className="workspace-topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir navegação"><UiIcon name="menu" /></button><div className="mobile-product"><ProductIcon slug={product.slug} size={19} /><b>{product.shortName}</b></div><label className="workspace-search"><UiIcon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={workspace.searchPlaceholder} aria-label={workspace.searchPlaceholder} /></label><span className="demo-label">Dados locais</span><button className="topbar-icon" onClick={() => showToast("Você não tem novas notificações.")} aria-label="Notificações"><UiIcon name="bell" size={19} /></button><button className="user-avatar" onClick={() => showToast("Perfil local do administrador.")} aria-label="Abrir perfil">AM</button></header>
        <main className="workspace-main">
          {activeView === "overview" ? <Overview product={product} workspace={workspace} onCreate={openCreate} /> : currentView ? <DataView key={currentView.id} view={currentView} rows={filteredRows} search={search} action={workspace.primaryAction} onCreate={openCreate} onEdit={(row) => setModal({ viewId: currentView.id, row })} onDelete={(row) => deleteRecord(currentView.id, row.id)} onToggle={(row) => toggleRecord(currentView.id, row)} /> : null}
        </main>
      </div>

      {modal ? <RecordModal title={modal.row ? "Editar registro" : workspace.primaryAction} product={product} row={modal.row} onClose={() => setModal(null)} onSave={saveRecord} /> : null}
      {toast ? <div className="workspace-toast"><UiIcon name="check" size={17} />{toast}</div> : null}
    </div>
  );
}

function Overview({ product, workspace, onCreate }: { product: Product; workspace: Workspace; onCreate: () => void }) {
  return <><section className="workspace-heading"><div><p>Visão do dia</p><h1>{workspace.greeting}</h1><span>O que precisa da sua atenção hoje.</span></div><button className="workspace-primary" onClick={onCreate}><UiIcon name="plus" size={18} />{workspace.primaryAction}</button></section><section className="metric-grid" aria-label="Resumo do dia">{workspace.metrics.map((metric) => <article key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.detail}</p></article>)}</section><section className="workspace-overview-grid"><div className="focus-panel"><div className="panel-heading"><div><h2>{workspace.focusTitle}</h2><p>{workspace.focusDescription}</p></div></div><div className="focus-columns">{workspace.focusColumns.map((column) => <div className="focus-column" key={column.label}><div><b>{column.label}</b><span>{column.count}</span></div>{column.items.map((item) => <article key={item.title}><strong>{item.title}</strong><small>{item.meta}</small></article>)}</div>)}</div></div><aside className="activity-panel"><div className="panel-heading"><div><h2>Atividade recente</h2><p>Atualizações da operação</p></div></div><ol>{workspace.activity.map((item) => <li key={item.title}><span className="activity-dot" /><div><strong>{item.title}</strong><small>{item.time}</small><em>{item.status}</em></div></li>)}</ol><Link href={`/apps/${product.slug}`}>Sobre o {product.shortName} <UiIcon name="arrow" size={16} /></Link></aside></section></>;
}

function DataView({ view, rows, search, action, onCreate, onEdit, onDelete, onToggle }: { view: Workspace["views"][number]; rows: LocalRow[]; search: string; action: string; onCreate: () => void; onEdit: (row: LocalRow) => void; onDelete: (row: LocalRow) => void; onToggle: (row: LocalRow) => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [selected, setSelected] = useState<LocalRow | null>(null);
  const isDone = (status: string) => /concluído|conforme|aprovado|recebido|pronto|disponível|encerrada|entregue|finalizado/i.test(status);
  const visibleRows = rows.filter((row) => filter === "all" || (filter === "done" ? isDone(row.status) : !isDone(row.status)));
  return <><section className="workspace-heading data-heading"><div><p>Operação</p><h1>{view.label}</h1><span>{view.description}</span></div><button className="workspace-primary" onClick={onCreate}><UiIcon name="plus" size={18} />{action}</button></section><section className="data-panel"><div className="data-toolbar"><div><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button><button className={filter === "open" ? "active" : ""} onClick={() => setFilter("open")}>Em aberto</button><button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>Finalizados</button></div><span>{visibleRows.length} registros</span></div><div className="data-table" role="table" aria-label={view.label}>{visibleRows.length ? visibleRows.map((row) => <button className={`data-row ${selected?.id === row.id ? "is-selected" : ""}`} key={row.id} role="row" onClick={() => setSelected(row)}><span className="data-row-icon"><UiIcon name="document" size={18} /></span><span className="data-row-main"><strong>{row.title}</strong><small>{row.meta}</small></span><b>{row.value}</b><em>{row.status}</em><UiIcon name="arrow" size={16} /></button>) : <div className="empty-state"><UiIcon name="search" size={26} /><h2>Nenhum resultado encontrado</h2><p>{search ? `Não encontramos registros para “${search}”.` : "Não há registros nesta situação."}</p></div>}</div>{selected ? <div className="selected-row-note record-actions"><span><UiIcon name="check" size={15} />{selected.title}</span><div><button onClick={() => onToggle(selected)}>{isDone(selected.status) ? "Reabrir" : "Concluir"}</button><button onClick={() => onEdit(selected)}>Editar</button><button className="danger-action" onClick={() => { onDelete(selected); setSelected(null); }}>Excluir</button><button onClick={() => setSelected(null)}>Fechar</button></div></div> : null}</section></>;
}

function RecordModal({ title, product, row, onClose, onSave }: { title: string; product: Product; row?: LocalRow; onClose: () => void; onSave: (payload: Omit<LocalRow, "id">) => void }) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({ title: String(data.get("title") ?? ""), meta: String(data.get("meta") ?? ""), value: String(data.get("value") ?? ""), status: String(data.get("status") ?? "Em aberto") });
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><span><ProductIcon slug={product.slug} size={21} /></span><div><small>{product.name}</small><h2 id="modal-title">{title}</h2></div><button onClick={onClose} aria-label="Fechar"><UiIcon name="close" /></button></div><form onSubmit={submit}><label><span>Título ou cliente</span><input name="title" required autoFocus defaultValue={row?.title} placeholder="Digite para identificar" /></label><label><span>Detalhes</span><textarea name="meta" defaultValue={row?.meta} placeholder="Adicione as informações principais" rows={3} /></label><div className="form-grid"><label><span>Valor ou referência</span><input name="value" defaultValue={row?.value} placeholder="Ex.: R$ 450 ou 3 itens" /></label><label><span>Situação</span><input name="status" defaultValue={row?.status ?? "Em aberto"} placeholder="Em aberto" /></label></div><div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="workspace-primary">Salvar</button></div></form></section></div>;
}
