"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { Product } from "@/lib/apps";
import type { Workspace, WorkspaceRow } from "@/lib/workspaces";
import { ProductIcon } from "./ProductIcon";
import { UiIcon } from "./UiIcon";

type LocalRow = WorkspaceRow & { id: string };
type RecordMap = Record<string, LocalRow[]>;
type ModalState = { viewId: string; row?: LocalRow } | null;

type WorkspaceActions = {
  records: RecordMap;
  activeView: string;
  setActiveView: (view: string) => void;
  openCreate: (viewId?: string) => void;
  openEdit: (viewId: string, row: LocalRow) => void;
  deleteRecord: (viewId: string, id: string) => void;
  updateStatus: (viewId: string, id: string, status: string) => void;
  duplicateRecord: (viewId: string, row: LocalRow) => void;
  showToast: (message: string) => void;
};

type ScreenProps = {
  product: Product;
  workspace: Workspace;
  views: Workspace["views"];
  actions: WorkspaceActions;
};

const defaultViews: Record<string, string> = {
  atlas: "ordens",
  ares: "orcamentos",
  artemis: "mesas",
  pandora: "pesquisas",
  poseidon: "funil",
  hercules: "execucoes",
};

const hiddenViews: Record<string, string[]> = {
  ares: ["pedidos"],
  artemis: ["caixa"],
};

const donePattern = /concluído|finalizado|entregue|aprovado|conforme|pronto|servido|resolvido|ganho|perdido|corrigido|encerrada/i;

function seedRecords(workspace: Workspace): RecordMap {
  return Object.fromEntries(
    workspace.views.map((view) => [
      view.id,
      view.rows.map((row, index) => ({ ...row, id: `${view.id}-${index + 1}` })),
    ]),
  );
}

export function AppWorkspace({ product, workspace }: { product: Product; workspace: Workspace }) {
  const views = workspace.views.filter((view) => !hiddenViews[product.slug]?.includes(view.id));
  const [activeView, setActiveView] = useState(defaultViews[product.slug] ?? views[0]?.id ?? "overview");
  const [records, setRecords] = useState<RecordMap>(() => seedRecords(workspace));
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const storageKey = `crmplus:${product.slug}:records:v2`;

  useEffect(() => {
    try {
      const current = window.localStorage.getItem(storageKey);
      const legacy = window.localStorage.getItem(`crmplus:${product.slug}:records:v1`);
      const saved = current ?? legacy;
      if (saved) setRecords(JSON.parse(saved) as RecordMap);
    } catch {
      setToast("Não foi possível abrir os dados locais.");
    } finally {
      setHydrated(true);
    }
  }, [product.slug, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }, [hydrated, records, storageKey]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function openCreate(viewId?: string) {
    setModal({ viewId: viewId ?? activeView });
  }

  function openEdit(viewId: string, row: LocalRow) {
    setModal({ viewId, row });
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
    showToast(modal.row ? "Alterações salvas." : "Novo registro criado.");
    setModal(null);
  }

  function deleteRecord(viewId: string, id: string) {
    setRecords((current) => ({
      ...current,
      [viewId]: (current[viewId] ?? []).filter((row) => row.id !== id),
    }));
    showToast("Registro removido deste navegador.");
  }

  function updateStatus(viewId: string, id: string, status: string) {
    setRecords((current) => ({
      ...current,
      [viewId]: (current[viewId] ?? []).map((row) => (row.id === id ? { ...row, status } : row)),
    }));
    showToast(`Situação alterada para ${status}.`);
  }

  function duplicateRecord(viewId: string, row: LocalRow) {
    setRecords((current) => ({
      ...current,
      [viewId]: [{ ...row, id: `${viewId}-${Date.now()}`, title: `${row.title} · cópia`, status: "Rascunho" }, ...(current[viewId] ?? [])],
    }));
    showToast("Uma cópia foi criada.");
  }

  const actions: WorkspaceActions = {
    records,
    activeView,
    setActiveView,
    openCreate,
    openEdit,
    deleteRecord,
    updateStatus,
    duplicateRecord,
    showToast,
  };

  const screenProps = { product, workspace, views, actions };
  const screen = {
    atlas: <AtlasWorkspace {...screenProps} />,
    ares: <AresWorkspace {...screenProps} />,
    artemis: <ArtemisWorkspace {...screenProps} />,
    pandora: <PandoraWorkspace {...screenProps} />,
    poseidon: <PoseidonWorkspace {...screenProps} />,
    hercules: <HerculesWorkspace {...screenProps} />,
  }[product.slug] ?? <AtlasWorkspace {...screenProps} />;

  return (
    <div className={`singular-app singular-${product.slug}`} style={{ "--app-accent": product.color, "--app-soft": product.colorSoft } as CSSProperties}>
      {screen}
      {modal ? (
        <SingularModal
          product={product}
          workspace={workspace}
          viewId={modal.viewId}
          row={modal.row}
          onClose={() => setModal(null)}
          onSave={saveRecord}
        />
      ) : null}
      {toast ? <div className="singular-toast"><UiIcon name="check" size={17} />{toast}</div> : null}
    </div>
  );
}

function AppBrand({ product, business }: { product: Product; business: string }) {
  return (
    <div className="singular-brand">
      <span><ProductIcon slug={product.slug} size={22} /></span>
      <div><strong>{product.shortName}</strong><small>{business}</small></div>
    </div>
  );
}

function LocalBadge() {
  return <span className="local-badge">Somente neste navegador</span>;
}

function AtlasWorkspace({ product, workspace, views, actions }: ScreenProps) {
  const orders = actions.records.ordens ?? [];
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? "");
  const selected = orders.find((row) => row.id === selectedId) ?? orders[0];
  const stages = ["Aguardando avaliação", "Orçamento enviado", "Em serviço", "Finalizado"];

  return (
    <div className="atlas-shell">
      <header className="atlas-header">
        <AppBrand product={product} business={workspace.business} />
        <nav>{views.map((view) => <button key={view.id} className={actions.activeView === view.id ? "active" : ""} onClick={() => actions.setActiveView(view.id)}>{view.label}</button>)}</nav>
        <div className="app-header-actions"><LocalBadge /><button className="primary-action" onClick={() => actions.openCreate("ordens")}><UiIcon name="plus" size={17} />Nova OS</button><Link href="/">Sair</Link></div>
      </header>

      <main className="atlas-main">
        <section className="atlas-titlebar">
          <div><h1>Pátio da oficina</h1><p>Veículos organizados pela próxima ação, não por gráficos.</p></div>
          <div className="atlas-summary"><span><b>{orders.length}</b> atendimentos</span><span><b>{orders.filter((row) => /serviço/i.test(row.status)).length}</b> em serviço</span><span><b>{orders.filter((row) => /finalizado|pronto/i.test(row.status)).length}</b> para entrega</span></div>
        </section>

        {actions.activeView === "ordens" ? (
          <div className="atlas-workbench">
            <section className="atlas-board">
              {stages.map((stage) => {
                const stageRows = orders.filter((row) => row.status.toLowerCase().includes(stage.split(" ")[0].toLowerCase()) || (stage === "Aguardando avaliação" && !donePattern.test(row.status) && !/orçamento|serviço/i.test(row.status)));
                return <div className="atlas-lane" key={stage}><header><strong>{stage}</strong><span>{stageRows.length}</span></header>{stageRows.map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><small>{row.title.split("·")[0]}</small><strong>{row.title.split("·").slice(1).join("·") || row.title}</strong><p>{row.meta}</p><footer><b>{row.value}</b><span>{row.status}</span></footer></button>)}</div>;
              })}
            </section>
            <aside className="atlas-inspector">
              {selected ? <>
                <div className="inspector-kicker">Ficha do atendimento</div>
                <h2>{selected.title}</h2>
                <p>{selected.meta}</p>
                <dl><div><dt>Estimativa</dt><dd>{selected.value}</dd></div><div><dt>Situação</dt><dd>{selected.status}</dd></div><div><dt>Próxima ação</dt><dd>{/orçamento/i.test(selected.status) ? "Aguardar aprovação" : /serviço/i.test(selected.status) ? "Atualizar diagnóstico" : "Avaliar veículo"}</dd></div></dl>
                <div className="atlas-note"><strong>Diagnóstico da oficina</strong><p>Registre o que foi encontrado, fotos e observações no histórico da OS.</p></div>
                <div className="inspector-actions"><button onClick={() => actions.openEdit("ordens", selected)}>Editar OS</button><button onClick={() => actions.updateStatus("ordens", selected.id, selected.status === "Entregue" ? "Aguardando avaliação" : "Entregue")}>{selected.status === "Entregue" ? "Reabrir" : "Marcar entregue"}</button><button className="danger" onClick={() => actions.deleteRecord("ordens", selected.id)}>Excluir</button></div>
              </> : <EmptyMessage title="Nenhuma OS selecionada" />}
            </aside>
          </div>
        ) : <SimpleOperationalList view={views.find((view) => view.id === actions.activeView)} rows={actions.records[actions.activeView] ?? []} onCreate={() => actions.openCreate()} onEdit={(row) => actions.openEdit(actions.activeView, row)} />}
      </main>
    </div>
  );
}

function AresWorkspace({ product, workspace, views, actions }: ScreenProps) {
  const proposals = actions.records.orcamentos ?? [];
  const [selectedId, setSelectedId] = useState(proposals[0]?.id ?? "");
  const selected = proposals.find((row) => row.id === selectedId) ?? proposals[0];
  const activeRows = actions.records[actions.activeView] ?? [];

  function shareProposal() {
    if (!selected) return;
    const text = encodeURIComponent(`Olá! Segue o orçamento ${selected.title}. Valor estimado: ${selected.value}. Situação: ${selected.status}.`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="ares-shell">
      <header className="ares-header"><AppBrand product={product} business={workspace.business} /><nav>{views.map((view) => <button key={view.id} className={actions.activeView === view.id ? "active" : ""} onClick={() => actions.setActiveView(view.id)}>{view.label}</button>)}</nav><div className="app-header-actions"><LocalBadge /><Link href="/">Fechar</Link></div></header>
      {actions.activeView === "orcamentos" ? (
        <main className="ares-editor">
          <aside className="proposal-list"><div className="proposal-list-head"><div><strong>Orçamentos</strong><small>{proposals.length} documentos</small></div><button onClick={() => actions.openCreate("orcamentos")}><UiIcon name="plus" size={17} /></button></div><label><UiIcon name="search" size={16} /><input placeholder="Buscar cliente ou número" /></label>{proposals.map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><div><strong>{row.title}</strong><small>{row.meta}</small></div><span>{row.status}</span><b>{row.value}</b></button>)}</aside>
          <section className="proposal-canvas">
            {selected ? <article className="proposal-paper"><header><div><span>CRMPlus+ Orçamentos</span><strong>{workspace.business}</strong></div><div><small>ORÇAMENTO</small><b>{selected.title.split("·")[0]}</b></div></header><section><small>Preparado para</small><h1>{selected.title.split("·").slice(1).join("·") || selected.title}</h1><p>{selected.meta}</p></section><div className="proposal-scope"><div><span>01</span><div><strong>Escopo do serviço</strong><p>{selected.meta}</p></div></div><div><span>02</span><div><strong>Prazo e validade</strong><p>Validade de 10 dias. Prazo definido após aprovação.</p></div></div></div><footer><div><small>Valor estimado</small><strong>{selected.value}</strong></div><span>{selected.status}</span></footer></article> : <EmptyMessage title="Crie seu primeiro orçamento" />}
          </section>
          <aside className="proposal-tools"><h2>Documento</h2><p>A proposta é editada aqui e permanece apenas no seu navegador.</p>{selected ? <><label><span>Situação</span><select value={selected.status} onChange={(event) => actions.updateStatus("orcamentos", selected.id, event.target.value)}><option>Rascunho</option><option>Enviado</option><option>Visualizado</option><option>Aprovado</option><option>Reprovado</option><option>Vencido</option></select></label><button className="primary-action" onClick={() => actions.openEdit("orcamentos", selected)}>Editar conteúdo</button><button onClick={() => window.print()}>Gerar PDF / imprimir</button><button onClick={shareProposal}>Compartilhar no WhatsApp</button><button onClick={() => actions.duplicateRecord("orcamentos", selected)}>Duplicar proposta</button><button className="danger" onClick={() => actions.deleteRecord("orcamentos", selected.id)}>Excluir</button></> : null}</aside>
        </main>
      ) : <main className="ares-library"><div className="library-heading"><div><h1>{views.find((view) => view.id === actions.activeView)?.label}</h1><p>{views.find((view) => view.id === actions.activeView)?.description}</p></div><button className="primary-action" onClick={() => actions.openCreate()}><UiIcon name="plus" size={17} />Adicionar</button></div><SimpleOperationalList view={views.find((view) => view.id === actions.activeView)} rows={activeRows} onCreate={() => actions.openCreate()} onEdit={(row) => actions.openEdit(actions.activeView, row)} /></main>}
    </div>
  );
}

function ArtemisWorkspace({ product, workspace, views, actions }: ScreenProps) {
  const tables = actions.records.mesas ?? [];
  const orders = actions.records.pedidos ?? [];
  const [selectedTable, setSelectedTable] = useState(tables[0]?.id ?? "");
  const selected = tables.find((row) => row.id === selectedTable) ?? tables[0];

  return (
    <div className="artemis-shell">
      <header className="artemis-header"><AppBrand product={product} business={workspace.business} /><nav>{views.map((view) => <button key={view.id} className={actions.activeView === view.id ? "active" : ""} onClick={() => actions.setActiveView(view.id)}>{view.label}</button>)}</nav><div className="service-indicator"><i />Atendimento aberto</div><button className="primary-action" onClick={() => actions.openCreate(actions.activeView === "cardapio" ? "cardapio" : "pedidos")}><UiIcon name="plus" size={17} />{actions.activeView === "cardapio" ? "Novo item" : "Nova comanda"}</button><Link href="/">Sair</Link></header>
      <main className="artemis-main">
        {actions.activeView === "mesas" ? <div className="restaurant-floor"><section className="floor-map"><div className="floor-title"><div><h1>Salão</h1><p>Clique em uma mesa para abrir a comanda.</p></div><span>{tables.filter((row) => /ocupada|conta/i.test(row.status)).length} ocupadas</span></div><div className="table-grid">{tables.map((row, index) => <button key={row.id} className={`${selected?.id === row.id ? "selected" : ""} ${/disponível/i.test(row.status) ? "free" : "busy"}`} onClick={() => setSelectedTable(row.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{row.title}</strong><small>{row.meta}</small><em>{row.status}</em></button>)}</div></section><aside className="table-ticket">{selected ? <><small>COMANDA DA MESA</small><h2>{selected.title}</h2><p>{selected.meta}</p><div className="ticket-lines"><div><span>Itens registrados</span><b>{selected.value}</b></div><div><span>Situação</span><b>{selected.status}</b></div></div><button className="primary-action" onClick={() => actions.openCreate("pedidos")}>Adicionar pedido</button><button onClick={() => actions.openEdit("mesas", selected)}>Editar mesa</button><button onClick={() => actions.updateStatus("mesas", selected.id, /disponível/i.test(selected.status) ? "Ocupada" : "Disponível")}>{/disponível/i.test(selected.status) ? "Abrir mesa" : "Liberar mesa"}</button></> : <EmptyMessage title="Selecione uma mesa" />}</aside></div> : actions.activeView === "pedidos" ? <KitchenBoard orders={orders} actions={actions} /> : <MenuStudio rows={actions.records.cardapio ?? []} actions={actions} />}
      </main>
    </div>
  );
}

function KitchenBoard({ orders, actions }: { orders: LocalRow[]; actions: WorkspaceActions }) {
  const lanes = ["Recebido", "Em preparo", "Pronto"];
  return <div className="kitchen-screen"><header><div><h1>Passe da cozinha</h1><p>Comandas na ordem em que precisam sair.</p></div><button className="primary-action" onClick={() => actions.openCreate("pedidos")}><UiIcon name="plus" size={17} />Nova comanda</button></header><section>{lanes.map((lane) => <div className="kitchen-lane" key={lane}><div><strong>{lane}</strong><span>{orders.filter((row) => row.status === lane).length}</span></div>{orders.filter((row) => row.status === lane).map((row) => <article key={row.id}><small>{row.title}</small><h2>{row.meta}</h2><footer><b>{row.value}</b><button onClick={() => actions.updateStatus("pedidos", row.id, lane === "Recebido" ? "Em preparo" : lane === "Em preparo" ? "Pronto" : "Servido")}>{lane === "Pronto" ? "Servir" : "Avançar"}</button></footer></article>)}</div>)}</section></div>;
}

function MenuStudio({ rows, actions }: { rows: LocalRow[]; actions: WorkspaceActions }) {
  return <div className="menu-studio"><header><div><h1>Cardápio</h1><p>Pratos, categorias e disponibilidade. Sem estoque.</p></div><button className="primary-action" onClick={() => actions.openCreate("cardapio")}><UiIcon name="plus" size={17} />Novo item</button></header><div className="menu-list">{rows.map((row) => <article key={row.id}><div className="dish-placeholder"><ProductIcon slug="artemis" size={24} /></div><div><small>{row.meta}</small><h2>{row.title}</h2><p>{row.status}</p></div><strong>{row.value}</strong><button onClick={() => actions.openEdit("cardapio", row)}>Editar</button></article>)}</div></div>;
}

function PandoraWorkspace({ product, workspace, views, actions }: ScreenProps) {
  const surveys = actions.records.pesquisas ?? [];
  const responses = actions.records.respostas ?? [];
  const [selectedId, setSelectedId] = useState(surveys[0]?.id ?? "");
  const selected = surveys.find((row) => row.id === selectedId) ?? surveys[0];

  return (
    <div className="pandora-shell">
      <header className="pandora-header"><AppBrand product={product} business={workspace.business} /><nav>{views.map((view) => <button key={view.id} className={actions.activeView === view.id ? "active" : ""} onClick={() => actions.setActiveView(view.id)}>{view.label}</button>)}</nav><div className="app-header-actions"><LocalBadge /><button className="primary-action" onClick={() => actions.openCreate("pesquisas")}><UiIcon name="plus" size={17} />Nova pesquisa</button><Link href="/">Sair</Link></div></header>
      <main className="pandora-main">
        {actions.activeView === "pesquisas" ? <div className="survey-studio"><aside className="survey-list"><header><strong>Pesquisas</strong><span>{surveys.length}</span></header>{surveys.map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><strong>{row.title}</strong><small>{row.meta}</small><span>{row.status}</span></button>)}</aside><section className="survey-builder">{selected ? <><div className="builder-top"><div><small>CONSTRUTOR</small><h1>{selected.title}</h1><p>{selected.meta}</p></div><button onClick={() => actions.openEdit("pesquisas", selected)}>Editar pesquisa</button></div><div className="question-block"><span>01</span><div><small>Pergunta principal</small><h2>Como você avalia sua experiência?</h2><div className="rating-scale">{[1,2,3,4,5].map((n) => <button key={n}>{n}</button>)}</div></div></div><div className="question-block"><span>02</span><div><small>Comentário opcional</small><h2>O que poderíamos melhorar?</h2><textarea disabled placeholder="O cliente escreve aqui" /></div></div><button className="add-question">+ Adicionar pergunta</button></> : <EmptyMessage title="Selecione uma pesquisa" />}</section><aside className="survey-publish"><h2>Compartilhar</h2><p>Use o link da pesquisa no WhatsApp, balcão ou após o atendimento.</p><div className="share-link"><span>crmplus.local/p/{selected?.id.slice(-5) ?? "nova"}</span><button onClick={() => actions.showToast("Link copiado para demonstração.")}>Copiar</button></div><dl><div><dt>Respostas</dt><dd>{selected?.value ?? "0"}</dd></div><div><dt>Situação</dt><dd>{selected?.status ?? "Rascunho"}</dd></div></dl><button className="primary-action" onClick={() => selected && actions.updateStatus("pesquisas", selected.id, selected.status === "Ativa" ? "Encerrada" : "Ativa")}>{selected?.status === "Ativa" ? "Encerrar coleta" : "Publicar pesquisa"}</button></aside></div> : actions.activeView === "respostas" ? <ResponseInbox responses={responses} /> : <InsightCanvas title={views.find((view) => view.id === actions.activeView)?.label ?? "Resultados"} rows={actions.records[actions.activeView] ?? []} />}
      </main>
    </div>
  );
}

function ResponseInbox({ responses }: { responses: LocalRow[] }) {
  const [selectedId, setSelectedId] = useState(responses[0]?.id ?? "");
  const selected = responses.find((row) => row.id === selectedId) ?? responses[0];
  return <div className="response-inbox"><aside><header><h1>Respostas</h1><p>Comentários recentes</p></header>{responses.map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><strong>{row.title}</strong><small>{row.meta}</small><span>{row.value}</span></button>)}</aside><section>{selected ? <><small>LEITURA DO CLIENTE</small><blockquote>{selected.title}</blockquote><dl><div><dt>Pesquisa</dt><dd>{selected.meta}</dd></div><div><dt>Nota</dt><dd>{selected.value}</dd></div><div><dt>Leitura</dt><dd>{selected.status}</dd></div></dl><div className="response-action"><strong>Próxima ação</strong><p>Transforme o comentário em uma ação simples para a equipe responsável.</p><button>Criar ação de melhoria</button></div></> : <EmptyMessage title="Nenhuma resposta" />}</section></div>;
}

function InsightCanvas({ title, rows }: { title: string; rows: LocalRow[] }) {
  return <div className="insight-canvas"><header><h1>{title}</h1><p>Uma leitura simples dos temas que aparecem nas respostas.</p></header><section>{rows.map((row) => <article key={row.id}><div><small>{row.status}</small><h2>{row.title}</h2><p>{row.meta}</p></div><strong>{row.value}</strong></article>)}</section></div>;
}

function PoseidonWorkspace({ product, workspace, views, actions }: ScreenProps) {
  const deals = actions.records.funil ?? [];
  const tasks = actions.records.tarefas ?? [];
  const [selectedId, setSelectedId] = useState(deals[0]?.id ?? "");
  const selected = deals.find((row) => row.id === selectedId) ?? deals[0];
  const stages = ["Novo lead", "Qualificação", "Proposta", "Decisão"];

  return (
    <div className="poseidon-shell">
      <header className="poseidon-header"><AppBrand product={product} business={workspace.business} /><nav>{views.map((view) => <button key={view.id} className={actions.activeView === view.id ? "active" : ""} onClick={() => actions.setActiveView(view.id)}>{view.label}</button>)}</nav><div className="app-header-actions"><LocalBadge /><button className="primary-action" onClick={() => actions.openCreate(actions.activeView)}><UiIcon name="plus" size={17} />Nova oportunidade</button><Link href="/">Sair</Link></div></header>
      <main className="poseidon-main">
        {actions.activeView === "funil" ? <><section className="followup-strip"><div><strong>Retornos de hoje</strong><span>{tasks.filter((row) => /hoje|atrasado/i.test(row.status)).length} contatos precisam de ação</span></div>{tasks.slice(0,3).map((row) => <button key={row.id}><span>{row.value}</span><strong>{row.title}</strong><small>{row.meta}</small></button>)}</section><div className="sales-workspace"><section className="sales-board">{stages.map((stage) => <div className="sales-lane" key={stage}><header><strong>{stage}</strong><span>{deals.filter((row) => row.meta.toLowerCase().includes(stage.toLowerCase()) || row.status.toLowerCase().includes(stage.toLowerCase())).length}</span></header>{deals.filter((row) => row.meta.toLowerCase().includes(stage.toLowerCase()) || row.status.toLowerCase().includes(stage.toLowerCase()) || (stage === "Novo lead" && /novo/i.test(row.status))).map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><strong>{row.title}</strong><p>{row.meta}</p><footer><b>{row.value}</b><span>{row.status}</span></footer></button>)}</div>)}</section><aside className="deal-drawer">{selected ? <><small>OPORTUNIDADE</small><h2>{selected.title}</h2><strong>{selected.value}</strong><p>{selected.meta}</p><div className="next-step"><span>Próximo passo</span><b>{/amanhã|hoje/i.test(selected.status) ? selected.status : "Combinar retorno com o cliente"}</b></div><label><span>Etapa</span><select value={selected.status} onChange={(event) => actions.updateStatus("funil", selected.id, event.target.value)}>{["Novo lead","Qualificação","Proposta","Decisão","Ganho","Perdido"].map((stage) => <option key={stage}>{stage}</option>)}</select></label><button className="primary-action" onClick={() => actions.openEdit("funil", selected)}>Registrar conversa</button><button onClick={() => actions.openCreate("tarefas")}>Agendar retorno</button><button className="danger" onClick={() => actions.deleteRecord("funil", selected.id)}>Excluir</button></> : <EmptyMessage title="Selecione uma oportunidade" />}</aside></div></> : <SimpleOperationalList view={views.find((view) => view.id === actions.activeView)} rows={actions.records[actions.activeView] ?? []} onCreate={() => actions.openCreate()} onEdit={(row) => actions.openEdit(actions.activeView, row)} />}
      </main>
    </div>
  );
}

function HerculesWorkspace({ product, workspace, views, actions }: ScreenProps) {
  const executions = actions.records.execucoes ?? [];
  const [selectedId, setSelectedId] = useState(executions[0]?.id ?? "");
  const selected = executions.find((row) => row.id === selectedId) ?? executions[0];
  const [checks, setChecks] = useState([true, true, false, false, false]);
  const checkItems = ["Identificação e local conferidos", "Condição geral registrada", "Item crítico fotografado", "Desvio atribuído a um responsável", "Evidência final anexada"];
  const progress = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <div className="hercules-shell">
      <header className="hercules-header"><AppBrand product={product} business={workspace.business} /><nav>{views.map((view) => <button key={view.id} className={actions.activeView === view.id ? "active" : ""} onClick={() => actions.setActiveView(view.id)}>{view.label}</button>)}</nav><div className="app-header-actions"><LocalBadge /><button className="primary-action" onClick={() => actions.openCreate(actions.activeView)}><UiIcon name="plus" size={17} />Nova inspeção</button><Link href="/">Sair</Link></div></header>
      <main className="hercules-main">
        {actions.activeView === "execucoes" ? <div className="inspection-workspace"><aside className="inspection-list"><header><h1>Execuções</h1><span>{executions.length}</span></header>{executions.map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><strong>{row.title}</strong><small>{row.meta}</small><span>{row.status}</span></button>)}</aside><section className="checklist-runner">{selected ? <><header><div><small>CHECKLIST EM EXECUÇÃO</small><h1>{selected.title}</h1><p>{selected.meta}</p></div><div className="progress-ring"><strong>{progress}%</strong><span>concluído</span></div></header><ol>{checkItems.map((item, index) => <li key={item} className={checks[index] ? "done" : ""}><button onClick={() => setChecks((current) => current.map((value, currentIndex) => currentIndex === index ? !value : value))}><UiIcon name="check" size={16} /></button><div><strong>{item}</strong><small>{checks[index] ? "Conferido" : "Aguardando conferência"}</small></div>{index === 2 ? <span>Foto obrigatória</span> : null}</li>)}</ol><footer><button onClick={() => actions.openEdit("execucoes", selected)}>Adicionar observação</button><button className="primary-action" onClick={() => actions.updateStatus("execucoes", selected.id, progress === 100 ? "Conforme" : "Em execução")}>Salvar execução</button></footer></> : <EmptyMessage title="Selecione uma execução" />}</section><aside className="evidence-panel"><h2>Evidências</h2><p>Fotos e observações ficam associadas a esta inspeção.</p><label className="evidence-upload"><UiIcon name="plus" size={22} /><strong>Adicionar foto</strong><small>Imagem mantida localmente</small><input type="file" accept="image/*" onChange={(event) => actions.showToast(event.target.files?.[0]?.name ? `Foto selecionada: ${event.target.files[0].name}` : "Nenhuma foto selecionada.")} /></label><div className="evidence-note"><strong>Observação</strong><textarea placeholder="Descreva o que foi encontrado" /></div><div className="evidence-status"><span>Resultado</span><b>{selected?.status ?? "A iniciar"}</b></div></aside></div> : <SimpleOperationalList view={views.find((view) => view.id === actions.activeView)} rows={actions.records[actions.activeView] ?? []} onCreate={() => actions.openCreate()} onEdit={(row) => actions.openEdit(actions.activeView, row)} />}
      </main>
    </div>
  );
}

function SimpleOperationalList({ view, rows, onCreate, onEdit }: { view?: Workspace["views"][number]; rows: LocalRow[]; onCreate: () => void; onEdit: (row: LocalRow) => void }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? rows.filter((row) => `${row.title} ${row.meta} ${row.status}`.toLowerCase().includes(normalized)) : rows;
  }, [query, rows]);
  return <section className="simple-list"><header><div><h1>{view?.label ?? "Registros"}</h1><p>{view?.description}</p></div><button className="primary-action" onClick={onCreate}><UiIcon name="plus" size={17} />Adicionar</button></header><label className="list-search"><UiIcon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nesta área" /></label><div>{filtered.map((row) => <button key={row.id} onClick={() => onEdit(row)}><span><strong>{row.title}</strong><small>{row.meta}</small></span><b>{row.value}</b><em>{row.status}</em><UiIcon name="arrow" size={16} /></button>)}</div></section>;
}

function EmptyMessage({ title }: { title: string }) {
  return <div className="singular-empty"><UiIcon name="document" size={26} /><strong>{title}</strong><p>Crie um registro para começar.</p></div>;
}

const formConfig: Record<string, { title: string; titlePlaceholder: string; meta: string; metaPlaceholder: string; value: string; valuePlaceholder: string; statuses: string[] }> = {
  atlas: { title: "Cliente, veículo ou OS", titlePlaceholder: "Ex.: OS 1052 · Hilux branca", meta: "Defeito informado, diagnóstico e serviço", metaPlaceholder: "Descreva o relato do cliente e o que foi encontrado", value: "Valor estimado", valuePlaceholder: "Ex.: R$ 850", statuses: ["Aguardando avaliação", "Orçamento enviado", "Aprovado", "Em serviço", "Finalizado", "Entregue"] },
  ares: { title: "Cliente ou número do orçamento", titlePlaceholder: "Ex.: OR-131 · Studio Aurora", meta: "Escopo, condições e validade", metaPlaceholder: "Descreva o que será entregue e em quais condições", value: "Valor estimado", valuePlaceholder: "Ex.: R$ 2.900", statuses: ["Rascunho", "Enviado", "Visualizado", "Aprovado", "Reprovado", "Vencido"] },
  artemis: { title: "Mesa, comanda ou item", titlePlaceholder: "Ex.: Mesa 06 · Comanda 412", meta: "Itens e observações", metaPlaceholder: "Ex.: 2 burgers sem cebola, 1 suco sem gelo", value: "Quantidade ou preço", valuePlaceholder: "Ex.: 3 itens ou R$ 48", statuses: ["Recebido", "Em preparo", "Pronto", "Servido", "Disponível", "Pausado"] },
  pandora: { title: "Pesquisa, comentário ou tema", titlePlaceholder: "Ex.: Pós-atendimento", meta: "Pergunta ou contexto", metaPlaceholder: "Ex.: Como você avalia a clareza do atendimento?", value: "Respostas ou nota", valuePlaceholder: "Ex.: 4,7 de 5", statuses: ["Rascunho", "Ativa", "Positivo", "Atenção", "Revisar", "Encerrada"] },
  poseidon: { title: "Cliente ou oportunidade", titlePlaceholder: "Ex.: Oficina Horizonte", meta: "Necessidade e próximo passo", metaPlaceholder: "Ex.: Retornar quinta com proposta ajustada", value: "Potencial", valuePlaceholder: "Ex.: R$ 6.500", statuses: ["Novo lead", "Qualificação", "Proposta", "Decisão", "Ganho", "Perdido"] },
  hercules: { title: "Inspeção, item ou desvio", titlePlaceholder: "Ex.: Inspeção do veículo 07", meta: "Local, evidência e observação", metaPlaceholder: "Ex.: Pneu dianteiro com desgaste irregular", value: "Prazo ou progresso", valuePlaceholder: "Ex.: 3/5 itens ou hoje 17:00", statuses: ["A iniciar", "Em execução", "Conforme", "Não conforme", "Atenção", "Corrigido"] },
};

function SingularModal({ product, workspace, viewId, row, onClose, onSave }: { product: Product; workspace: Workspace; viewId: string; row?: LocalRow; onClose: () => void; onSave: (payload: Omit<LocalRow, "id">) => void }) {
  const config = formConfig[product.slug] ?? formConfig.atlas;
  const view = workspace.views.find((item) => item.id === viewId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      title: String(data.get("title") ?? ""),
      meta: String(data.get("meta") ?? ""),
      value: String(data.get("value") ?? ""),
      status: String(data.get("status") ?? config.statuses[0]),
    });
  }

  return <div className="singular-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="singular-modal" role="dialog" aria-modal="true"><header><div><span><ProductIcon slug={product.slug} size={21} /></span><div><small>{view?.label ?? product.name}</small><h2>{row ? "Editar registro" : `Novo em ${view?.label ?? product.shortName}`}</h2></div></div><button onClick={onClose}><UiIcon name="close" size={19} /></button></header><form onSubmit={submit}><label><span>{config.title}</span><input name="title" required autoFocus defaultValue={row?.title} placeholder={config.titlePlaceholder} /></label><label><span>{config.meta}</span><textarea name="meta" rows={4} defaultValue={row?.meta} placeholder={config.metaPlaceholder} /></label><div className="modal-grid"><label><span>{config.value}</span><input name="value" defaultValue={row?.value} placeholder={config.valuePlaceholder} /></label><label><span>Situação</span><select name="status" defaultValue={row?.status ?? config.statuses[0]}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><footer><button type="button" onClick={onClose}>Cancelar</button><button className="primary-action" type="submit">Salvar</button></footer></form></section></div>;
}
