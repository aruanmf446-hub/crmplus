"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Product } from "@/lib/apps";
import type { Workspace, WorkspaceRow, WorkspaceView } from "@/lib/workspaces";
import { ProductIcon } from "../ProductIcon";
import { UiIcon } from "../UiIcon";

export type LocalRow = WorkspaceRow & { id: string };
export type RecordMap = Record<string, LocalRow[]>;
export type ModalState = { viewId: string; row?: LocalRow } | null;

export type WorkspaceActions = {
  records: RecordMap;
  activeView: string;
  setActiveView: (viewId: string) => void;
  openCreate: (viewId?: string) => void;
  openEdit: (viewId: string, row: LocalRow) => void;
  deleteRecord: (viewId: string, id: string) => void;
  duplicateRecord: (viewId: string, row: LocalRow) => void;
  updateStatus: (viewId: string, id: string, status: string) => void;
  showToast: (message: string) => void;
};

export type ScreenProps = {
  product: Product;
  workspace: Workspace;
  views: WorkspaceView[];
  actions: WorkspaceActions;
};

export type AppConfig = {
  primaryView: string;
  actionLabel: string;
  localLabel: string;
  eyebrow: string;
  headline: string;
  support: string;
  statuses: string[];
  fieldLabels: { title: string; meta: string; value: string; status: string };
  placeholders: { title: string; meta: string; value: string };
};

export const appConfigs: Record<string, AppConfig> = {
  atlas: {
    primaryView: "ordens",
    actionLabel: "Nova OS",
    localLabel: "Operação local",
    eyebrow: "CENTRAL OPERACIONAL",
    headline: "A oficina em tempo real",
    support: "Priorize atrasos, aprovações e entregas sem abrir tela por tela.",
    statuses: ["Aguardando avaliação", "Orçamento enviado", "Aprovado", "Em serviço", "Finalizado", "Entregue"],
    fieldLabels: { title: "OS, veículo e placa", meta: "Cliente, responsável e contexto", value: "Estimativa", status: "Etapa" },
    placeholders: { title: "OS #1052 · Hilux · QAB-2D45", meta: "Marcos Silva · responsável João · revisão completa", value: "R$ 1.850" },
  },
  ares: {
    primaryView: "orcamentos",
    actionLabel: "Novo orçamento",
    localLabel: "Propostas locais",
    eyebrow: "PROPOSAL STUDIO",
    headline: "Propostas que facilitam a decisão",
    support: "Escopo, versão, validade e aceite em um documento que se explica sozinho.",
    statuses: ["Rascunho", "Enviado", "Visualizado", "Ajustes solicitados", "Aprovado", "Reprovado", "Vencido"],
    fieldLabels: { title: "Código e cliente", meta: "Escopo e validade", value: "Valor estimado", status: "Decisão" },
    placeholders: { title: "OR-132 · Studio Aurora", meta: "Identidade visual · validade de 10 dias", value: "R$ 4.900" },
  },
  artemis: {
    primaryView: "pedidos",
    actionLabel: "Nova comanda",
    localLabel: "Serviço local",
    eyebrow: "SERVICE PULSE",
    headline: "Salão e cozinha no mesmo ritmo",
    support: "Pedidos, mesas e preparo visíveis sem caixa, cobrança ou controle de estoque.",
    statuses: ["Recebido", "Em preparo", "Pronto", "Servido", "Pausado"],
    fieldLabels: { title: "Mesa ou comanda", meta: "Itens e observações", value: "Quantidade", status: "Etapa do preparo" },
    placeholders: { title: "Mesa 08 · Comanda 412", meta: "2 burgers sem cebola · 1 suco sem gelo", value: "3 itens" },
  },
  pandora: {
    primaryView: "resultados",
    actionLabel: "Nova pesquisa",
    localLabel: "Escuta local",
    eyebrow: "INSIGHT STUDIO",
    headline: "Feedback que vira prioridade",
    support: "Notas, comentários e temas organizados para mostrar o que manter e o que corrigir.",
    statuses: ["Rascunho", "Ativa", "Positivo", "Atenção", "Em ação", "Resolvido", "Encerrada"],
    fieldLabels: { title: "Pesquisa, comentário ou tema", meta: "Contexto", value: "Nota ou volume", status: "Leitura" },
    placeholders: { title: "Pós-atendimento", meta: "Como você avalia a clareza das explicações?", value: "4,7 de 5" },
  },
  poseidon: {
    primaryView: "funil",
    actionLabel: "Nova oportunidade",
    localLabel: "CRM local",
    eyebrow: "REVENUE ROOM",
    headline: "Toda negociação com próximo passo",
    support: "Veja quem contatar, por que agir agora e o que está travando cada oportunidade.",
    statuses: ["Novo lead", "Qualificação", "Proposta", "Decisão", "Ganho", "Perdido"],
    fieldLabels: { title: "Cliente ou oportunidade", meta: "Necessidade e próximo passo", value: "Potencial", status: "Etapa" },
    placeholders: { title: "Grupo Horizonte", meta: "Retornar quinta com proposta revisada", value: "R$ 12.800" },
  },
  hercules: {
    primaryView: "execucoes",
    actionLabel: "Nova inspeção",
    localLabel: "Evidências locais",
    eyebrow: "EVIDENCE CONTROL",
    headline: "Inspeção com prova, responsável e correção",
    support: "Checklist útil não é caixinha marcada: é evidência, desvio e tratamento rastreável.",
    statuses: ["A iniciar", "Em execução", "Conforme", "Não conforme", "Atenção", "Corrigido"],
    fieldLabels: { title: "Inspeção ou desvio", meta: "Local, responsável e evidência", value: "Progresso ou prazo", status: "Resultado" },
    placeholders: { title: "Inspeção do veículo 07", meta: "Pneu dianteiro com desgaste irregular · foto registrada", value: "12/15 itens" },
  },
};

export const viewIcon: Record<string, Parameters<typeof UiIcon>[0]["name"]> = {
  agenda: "calendar",
  ordens: "document",
  clientes: "users",
  servicos: "tool",
  orcamentos: "document",
  itens: "grid",
  pedidos: "receipt",
  cardapio: "menuBook",
  mesas: "table",
  pesquisas: "message",
  respostas: "chat",
  resultados: "trend",
  compartilhar: "link",
  funil: "columns",
  tarefas: "clock",
  rotinas: "checklist",
  execucoes: "checkCircle",
  pendencias: "alert",
  auditorias: "shield",
};

export function seedRecords(workspace: Workspace): RecordMap {
  return Object.fromEntries(
    workspace.views.map((view) => [
      view.id,
      view.rows.map((row, index) => ({ ...row, id: `${view.id}-${index + 1}` })),
    ]),
  );
}

export function statusTone(status: string) {
  const value = status.toLocaleLowerCase("pt-BR");
  if (/atrasado|não conforme|reprovado|perdido|vencido|alta/.test(value)) return "danger";
  if (/atenção|aguardando|pendente|ajustes|pausado|média|decisão/.test(value)) return "warning";
  if (/aprovado|conforme|pronto|servido|entregue|ganho|resolvido|corrigido|positivo|ativo|disponível/.test(value)) return "success";
  if (/em serviço|em preparo|em execução|enviado|visualizado|proposta|qualificação/.test(value)) return "info";
  return "neutral";
}

export function titleParts(title: string) {
  const parts = title.split("·").map((part) => part.trim()).filter(Boolean);
  return { code: parts[0] ?? title, name: parts.slice(1).join(" · ") || parts[0] || title };
}

export function useSelectedRow(rows: LocalRow[]) {
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    if (!rows.length) {
      setSelectedId("");
      return;
    }
    if (!rows.some((row) => row.id === selectedId)) setSelectedId(rows[0].id);
  }, [rows, selectedId]);
  return { selectedId, setSelectedId, selected: rows.find((row) => row.id === selectedId) ?? rows[0] };
}
export function ProductRail({ product, workspace, views, actions, config }: {
  product: Product;
  workspace: Workspace;
  views: WorkspaceView[];
  actions: WorkspaceActions;
  config: AppConfig;
}) {
  return (
    <aside className="pw-rail">
      <div className="pw-brand">
        <span className="pw-brand-mark"><ProductIcon slug={product.slug} size={22} /></span>
        <div><strong>{product.shortName}</strong><small>CRM PLUS</small></div>
      </div>

      <div className="pw-workspace-name">
        <span>{workspace.business}</span>
        <small>{product.category}</small>
      </div>

      <nav aria-label={`Navegação do ${product.shortName}`}>
        {views.map((view) => (
          <button
            key={view.id}
            className={actions.activeView === view.id ? "active" : ""}
            onClick={() => actions.setActiveView(view.id)}
          >
            <UiIcon name={viewIcon[view.id] ?? "document"} size={18} />
            <span>{view.label}</span>
            <small>{actions.records[view.id]?.length ?? 0}</small>
          </button>
        ))}
      </nav>

      <div className="pw-rail-bottom">
        <div className="pw-local-card"><UiIcon name="lock" size={17} /><div><strong>{config.localLabel}</strong><small>Nada é enviado ao GitHub ou a serviços externos.</small></div></div>
        <Link href="/"><UiIcon name="arrowLeft" size={17} />Voltar aos aplicativos</Link>
      </div>
    </aside>
  );
}

export function ProductTopbar({ product, workspace, actions, config }: {
  product: Product;
  workspace: Workspace;
  actions: WorkspaceActions;
  config: AppConfig;
}) {
  const currentView = workspace.views.find((view) => view.id === actions.activeView);
  return (
    <header className="pw-topbar">
      <div>
        <span className="pw-breadcrumb">{workspace.business} / {currentView?.label ?? product.category}</span>
        <strong>{currentView?.label ?? product.shortName}</strong>
      </div>
      <div className="pw-topbar-actions">
        <span className="pw-live"><i />Dados locais ativos</span>
        <button className="pw-icon-button" aria-label="Notificações"><UiIcon name="bell" size={18} /></button>
        <button className="pw-primary" onClick={() => actions.openCreate(actions.activeView)}><UiIcon name="plus" size={17} />{config.actionLabel}</button>
        <span className="pw-avatar" aria-label="Usuário de demonstração">AM</span>
      </div>
    </header>
  );
}

export function PageIntro({ config, children }: { config: AppConfig; children?: ReactNode }) {
  return (
    <section className="pw-intro">
      <div><span>{config.eyebrow}</span><h1>{config.headline}</h1><p>{config.support}</p></div>
      {children}
    </section>
  );
}

export function MetricCard({ icon, label, value, detail, tone = "default" }: {
  icon: Parameters<typeof UiIcon>[0]["name"];
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  return (
    <article className={`pw-metric tone-${tone}`}>
      <span><UiIcon name={icon} size={18} /></span>
      <div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div>
    </article>
  );
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`pw-status status-${statusTone(status)}`}><i />{status}</span>;
}

export function RecordLibrary({ product, workspace, views, actions }: ScreenProps) {
  const view = views.find((item) => item.id === actions.activeView) ?? views[0];
  const rows = actions.records[view.id] ?? [];
  const [query, setQuery] = useState("");
  const filtered = rows.filter((row) => `${row.title} ${row.meta} ${row.value} ${row.status}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));

  return (
    <main className="pw-content record-library">
      <section className="library-intro"><div><span>{product.shortName.toUpperCase()} · {view.label.toUpperCase()}</span><h1>{view.label}</h1><p>{view.description}</p></div><button className="pw-primary" onClick={() => actions.openCreate(view.id)}><UiIcon name="plus" size={17} />Novo registro</button></section>
      <section className="library-toolbar"><label className="pw-search"><UiIcon name="search" size={18} /><input value={query} onChange={(event: any) => setQuery(event.target.value)} placeholder={workspace.searchPlaceholder} /></label><div><button className="active"><UiIcon name="list" size={16} />Lista</button><button><UiIcon name="grid" size={16} />Cards</button><button><UiIcon name="filter" size={16} />Filtrar</button></div></section>
      <section className="library-table">
        <header><span>Registro</span><span>Contexto</span><span>Referência</span><span>Situação</span><span>Ações</span></header>
        <div>{filtered.map((row) => <article key={row.id}><div className="record-title"><span className="record-icon"><UiIcon name={viewIcon[view.id] ?? "document"} size={17} /></span><strong>{row.title}</strong></div><p>{row.meta}</p><b>{row.value}</b><StatusPill status={row.status} /><div className="row-actions"><button onClick={() => actions.openEdit(view.id, row)} aria-label="Editar"><UiIcon name="edit" size={16} /></button><button onClick={() => actions.duplicateRecord(view.id, row)} aria-label="Duplicar"><UiIcon name="copy" size={16} /></button><button onClick={() => actions.deleteRecord(view.id, row.id)} aria-label="Excluir"><UiIcon name="trash" size={16} /></button></div></article>)}</div>
        {!filtered.length ? <EmptyState icon={viewIcon[view.id] ?? "document"} title="Nenhum registro encontrado" description="Ajuste a busca ou crie um novo registro." /> : null}
      </section>
    </main>
  );
}

export function RecordModal({ config, workspace, viewId, row, onClose, onSave }: {
  config: AppConfig;
  workspace: Workspace;
  viewId: string;
  row?: LocalRow;
  onClose: () => void;
  onSave: (payload: Omit<LocalRow, "id">) => void;
}) {
  const view = workspace.views.find((item) => item.id === viewId);
  const [title, setTitle] = useState(row?.title ?? "");
  const [meta, setMeta] = useState(row?.meta ?? "");
  const [value, setValue] = useState(row?.value ?? "");
  const [status, setStatus] = useState(row?.status ?? config.statuses[0]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !meta.trim()) return;
    onSave({ title: title.trim(), meta: meta.trim(), value: value.trim() || "Não informado", status });
  }

  return (
    <div className="pw-modal-backdrop" role="presentation" onMouseDown={(event: any) => { if (event.currentTarget === event.target) onClose(); }}>
      <form className="pw-modal" onSubmit={submit}>
        <header><div><span>{row ? "EDITAR REGISTRO" : "NOVO REGISTRO"}</span><h2>{view?.label ?? "Registro"}</h2><p>Os dados ficam somente neste navegador.</p></div><button type="button" onClick={onClose} aria-label="Fechar"><UiIcon name="close" size={19} /></button></header>
        <div className="pw-modal-fields">
          <label><span>{config.fieldLabels.title}</span><input value={title} onChange={(event: any) => setTitle(event.target.value)} placeholder={config.placeholders.title} autoFocus required /></label>
          <label><span>{config.fieldLabels.meta}</span><textarea value={meta} onChange={(event: any) => setMeta(event.target.value)} placeholder={config.placeholders.meta} rows={4} required /></label>
          <div><label><span>{config.fieldLabels.value}</span><input value={value} onChange={(event: any) => setValue(event.target.value)} placeholder={config.placeholders.value} /></label><label><span>{config.fieldLabels.status}</span><select value={status} onChange={(event: any) => setStatus(event.target.value)}>{config.statuses.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        </div>
        <aside><UiIcon name="lock" size={16} /><span><strong>Ambiente demonstrativo local</strong><small>Contas, registros, fotos e alterações não são enviados ao GitHub nem a serviços externos.</small></span></aside>
        <footer><button type="button" onClick={onClose}>Cancelar</button><button className="save" type="submit"><UiIcon name="check" size={16} />{row ? "Salvar alterações" : "Criar registro"}</button></footer>
      </form>
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: Parameters<typeof UiIcon>[0]["name"]; title: string; description: string }) {
  return <div className="pw-empty"><span><UiIcon name={icon} size={24} /></span><strong>{title}</strong><p>{description}</p></div>;
}
