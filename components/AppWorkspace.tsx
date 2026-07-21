"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { products } from "@/lib/apps";
import { ProductIcon } from "./ProductIcon";
import { UiIcon } from "./UiIcon";

const navIcons = ["calendar", "document", "users", "box"] as const;

export function AppWorkspace({ product, workspace }: { product: Product; workspace: Workspace }) {
  const [activeView, setActiveView] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  const currentView = workspace.views.find((view) => view.id === activeView);
  const filteredRows = useMemo(() => {
    if (!currentView) return [];
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return currentView.rows;
    return currentView.rows.filter((row) => `${row.title} ${row.meta} ${row.value} ${row.status}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [currentView, search]);

  function changeView(view: string) {
    setActiveView(view);
    setSearch("");
    setMenuOpen(false);
  }

  function saveDemo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalOpen(false);
    setToast("Item criado na demonstração.");
    window.setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className={`workspace workspace-${product.slug}`} data-product={product.slug} style={{ "--app-accent": product.color, "--app-soft": product.colorSoft } as React.CSSProperties}>
      <button className={`workspace-scrim ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
      <aside className={`workspace-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="workspace-product">
          <span><ProductIcon slug={product.slug} size={23} /></span>
          <div><b>{product.shortName}</b><small>CRM Plus</small></div>
          <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Fechar navegação"><UiIcon name="close" /></button>
        </div>

        <div className="workspace-company">
          <small>Espaço de trabalho</small>
          <strong>{workspace.business}</strong>
        </div>

        <nav className="workspace-nav" aria-label={`Navegação do ${product.name}`}>
          <button className={activeView === "overview" ? "active" : ""} onClick={() => changeView("overview")}><UiIcon name="home" /><span>Visão geral</span></button>
          {workspace.views.map((view, index) => (
            <button key={view.id} className={activeView === view.id ? "active" : ""} onClick={() => changeView(view.id)}>
              <UiIcon name={navIcons[index] ?? "document"} /><span>{view.label}</span>
            </button>
          ))}
        </nav>

        <div className="workspace-sidebar-bottom">
          <button onClick={() => setToast("Configurações ficarão para a etapa final.")}><UiIcon name="settings" /><span>Configurações</span></button>
          <Link href="/"><UiIcon name="arrow" /><span>Voltar à Store</span></Link>
          <p>Ambiente demonstrativo<br />Dados fictícios</p>
        </div>
      </aside>

      <div className="workspace-body">
        <header className="workspace-topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir navegação"><UiIcon name="menu" /></button>
          <div className="mobile-product"><ProductIcon slug={product.slug} size={19} /><b>{product.shortName}</b></div>
          <label className="workspace-search">
            <UiIcon name="search" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={workspace.searchPlaceholder} aria-label={workspace.searchPlaceholder} />
          </label>
          <span className="demo-label">Demonstração</span>
          <button className="topbar-icon" onClick={() => setToast("Você não tem novas notificações.")} aria-label="Notificações"><UiIcon name="bell" size={19} /></button>
          <button className="user-avatar" onClick={() => setToast("Perfil demonstrativo do administrador.")} aria-label="Abrir perfil">AM</button>
        </header>

        <main className="workspace-main">
          {activeView === "overview" ? (
            <Overview product={product} workspace={workspace} onCreate={() => setModalOpen(true)} />
          ) : currentView ? (
            <DataView key={currentView.id} view={currentView} rows={filteredRows} search={search} action={workspace.primaryAction} onCreate={() => setModalOpen(true)} />
          ) : null}
        </main>
      </div>

      {modalOpen ? <DemoModal title={workspace.primaryAction} product={product} onClose={() => setModalOpen(false)} onSave={saveDemo} /> : null}
      {toast ? <div className="workspace-toast"><UiIcon name="check" size={17} />{toast}</div> : null}
    </div>
  );
}

function Overview({ product, workspace, onCreate }: { product: Product; workspace: Workspace; onCreate: () => void }) {
  return (
    <>
      <section className="workspace-heading">
        <div><p>Visão do dia</p><h1>{workspace.greeting}</h1><span>O que precisa da sua atenção hoje.</span></div>
        <button className="workspace-primary" onClick={onCreate}><UiIcon name="plus" size={18} />{workspace.primaryAction}</button>
      </section>

      <section className="metric-grid" aria-label="Resumo do dia">
        {workspace.metrics.map((metric) => <article key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.detail}</p></article>)}
      </section>

      <section className="workspace-overview-grid">
        <div className="focus-panel">
          <div className="panel-heading"><div><h2>{workspace.focusTitle}</h2><p>{workspace.focusDescription}</p></div></div>
          <div className="focus-columns">
            {workspace.focusColumns.map((column) => (
              <div className="focus-column" key={column.label}>
                <div><b>{column.label}</b><span>{column.count}</span></div>
                {column.items.map((item) => <article key={item.title}><strong>{item.title}</strong><small>{item.meta}</small></article>)}
              </div>
            ))}
          </div>
        </div>

        <aside className="activity-panel">
          <div className="panel-heading"><div><h2>Atividade recente</h2><p>Atualizações da operação</p></div></div>
          <ol>
            {workspace.activity.map((item) => <li key={item.title}><span className="activity-dot" /><div><strong>{item.title}</strong><small>{item.time}</small><em>{item.status}</em></div></li>)}
          </ol>
          <Link href={`/apps/${product.slug}`}>Sobre o {product.shortName} <UiIcon name="arrow" size={16} /></Link>
        </aside>
      </section>
    </>
  );
}

function DataView({ view, rows, search, action, onCreate }: { view: Workspace["views"][number]; rows: Workspace["views"][number]["rows"]; search: string; action: string; onCreate: () => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [selected, setSelected] = useState<string>("");
  const finishedStatuses = ["concluído", "conforme", "aprovado", "recebido", "pronto", "disponível", "encerrada", "cliente"];
  const visibleRows = rows.filter((row) => {
    const isFinished = finishedStatuses.some((status) => row.status.toLocaleLowerCase("pt-BR").includes(status));
    return filter === "all" || (filter === "done" ? isFinished : !isFinished);
  });
  return (
    <>
      <section className="workspace-heading data-heading">
        <div><p>Operação</p><h1>{view.label}</h1><span>{view.description}</span></div>
        <button className="workspace-primary" onClick={onCreate}><UiIcon name="plus" size={18} />{action}</button>
      </section>
      <section className="data-panel">
        <div className="data-toolbar"><div><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button><button className={filter === "open" ? "active" : ""} onClick={() => setFilter("open")}>Em aberto</button><button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>Finalizados</button></div><span>{visibleRows.length} registros</span></div>
        <div className="data-table" role="table" aria-label={view.label}>
          {visibleRows.length ? visibleRows.map((row) => (
            <button className={`data-row ${selected === row.title ? "is-selected" : ""}`} key={`${row.title}-${row.value}`} role="row" onClick={() => setSelected(row.title)}>
              <span className="data-row-icon"><UiIcon name="document" size={18} /></span>
              <span className="data-row-main"><strong>{row.title}</strong><small>{row.meta}</small></span>
              <b>{row.value}</b>
              <em>{row.status}</em>
              <UiIcon name="arrow" size={16} />
            </button>
          )) : <div className="empty-state"><UiIcon name="search" size={26} /><h2>Nenhum resultado encontrado</h2><p>{search ? `Não encontramos registros para “${search}”.` : "Não há registros nesta situação."}</p></div>}
        </div>
        {selected ? <div className="selected-row-note"><span><UiIcon name="check" size={15} />{selected}</span><button onClick={() => setSelected("")}>Fechar seleção</button></div> : null}
      </section>
    </>
  );
}

function DemoModal({ title, product, onClose, onSave }: { title: string; product: Product; onClose: () => void; onSave: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><span><ProductIcon slug={product.slug} size={21} /></span><div><small>{product.name}</small><h2 id="modal-title">{title}</h2></div><button onClick={onClose} aria-label="Fechar"><UiIcon name="close" /></button></div>
        <form onSubmit={onSave}>
          <label><span>Título ou cliente</span><input required autoFocus placeholder="Digite para identificar" /></label>
          <label><span>Descrição</span><textarea placeholder="Adicione as informações principais" rows={4} /></label>
          <div className="form-grid"><label><span>Responsável</span><select defaultValue="Alisson"><option>Alisson</option><option>Equipe</option></select></label><label><span>Prazo</span><input type="date" defaultValue="2026-07-22" /></label></div>
          <div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="workspace-primary">Salvar demonstração</button></div>
        </form>
      </section>
    </div>
  );
}
