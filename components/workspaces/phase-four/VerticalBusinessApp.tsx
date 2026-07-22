"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type IconName, type NavItem } from "./shared";
import { copyText, downloadCsv, fileToDataUrl, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";
import vertical from "./VerticalBusinessApp.module.css";

export type FieldDefinition = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
  wide?: boolean;
};

export type MainRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  owner: string;
  updated: string;
  archived: boolean;
  data: Record<string, string>;
  history: Array<{ text: string; date: string }>;
  attachments: Array<{ id: string; name: string; data: string }>;
};

export type RelatedRecord = {
  id: string;
  parentId: string;
  title: string;
  description: string;
  status: string;
  date: string;
};

export type ResourceRecord = {
  id: string;
  parentId: string;
  title: string;
  category: string;
  reference: string;
  status: string;
  due: string;
};

export type MetricDefinition = {
  label: string;
  helper: string;
  source: "records" | "operations" | "resources";
  statuses?: string[];
  excludeStatuses?: string[];
};

export type VerticalConfig = {
  slug: string;
  icon: IconName;
  entityLabel: string;
  entityPlural: string;
  entityDescription: string;
  operationLabel: string;
  operationPlural: string;
  resourceLabel: string;
  resourcePlural: string;
  statuses: string[];
  operationStatuses: string[];
  resourceStatuses: string[];
  fields: FieldDefinition[];
  seed: MainRecord[];
  relatedSeed: RelatedRecord[];
  resourceSeed: ResourceRecord[];
  newRecordDefaults?: Record<string, string>;
  metrics: [MetricDefinition, MetricDefinition, MetricDefinition];
  primaryAction: string;
  linearFlow?: boolean;
  allowDuplicate?: boolean;
};

type RecordScope = "Ativos" | "Arquivados";
type RecordView = "list" | "detail";

export function VerticalBusinessApp({ product, config }: { product: Product; config: VerticalConfig }) {
  const [active, setActive] = useState(config.entityPlural);
  const [view, setView] = useState<RecordView>("list");
  const [scope, setScope] = useState<RecordScope>("Ativos");
  const [records, setRecords] = useLocalState<MainRecord[]>(`crmplus.${config.slug}.records`, config.seed);
  const [related, setRelated] = useLocalState<RelatedRecord[]>(`crmplus.${config.slug}.related`, config.relatedSeed);
  const [resources, setResources] = useLocalState<ResourceRecord[]>(`crmplus.${config.slug}.resources`, config.resourceSeed);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [detailTab, setDetailTab] = useState("Resumo");
  const [modal, setModal] = useState<"record" | "operation" | "resource" | null>(null);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [recordDraft, setRecordDraft] = useState({ title: "", subtitle: "", owner: "" });
  const [operationDraft, setOperationDraft] = useState({ title: "", description: "", date: "", status: config.operationStatuses[0] ?? "Aberto" });
  const [resourceDraft, setResourceDraft] = useState({ title: "", category: "", reference: "", due: "", status: config.resourceStatuses[0] ?? "Ativo" });

  const selected = records.find((record) => record.id === selectedId);
  const linearFlow = config.linearFlow !== false;
  const allowDuplicate = config.allowDuplicate !== false;
  const nav: NavItem[] = [
    { label: config.entityPlural, icon: config.icon },
    { label: config.operationPlural, icon: "activity" },
    { label: config.resourcePlural, icon: "document" },
  ];

  const visibleRecords = useMemo(() => {
    const value = query.trim().toLowerCase();
    const archived = scope === "Arquivados";
    return records.filter((record) => record.archived === archived && (statusFilter === "Todos" || record.status === statusFilter) && (!value || `${record.title} ${record.subtitle} ${record.owner} ${Object.values(record.data).join(" ")}`.toLowerCase().includes(value)));
  }, [query, records, scope, statusFilter]);

  const selectedOperations = selected ? related.filter((item) => item.parentId === selected.id) : [];
  const selectedResources = selected ? resources.filter((item) => item.parentId === selected.id) : [];
  const keyFacts = selected ? config.fields.filter((field) => selected.data[field.key]?.trim()).slice(0, 6) : [];
  const finalStatus = config.statuses.at(-1) ?? "";
  const currentStatusIndex = selected ? config.statuses.indexOf(selected.status) : -1;
  const isFinalStatus = Boolean(selected && selected.status === finalStatus);
  const nextStatus = selected && linearFlow && currentStatusIndex >= 0 && !isFinalStatus ? config.statuses[currentStatusIndex + 1] : "";
  const attentionResources = selectedResources.filter((item) => ["Pendente", "Vencendo", "Vencido", "Aguardando", "Aberto", "Revisar", "Próximo do vencimento"].some((term) => item.status.includes(term))).length;
  const archivedCount = records.filter((record) => record.archived).length;

  function changeArea(label: string) {
    setActive(label);
    setView("list");
    setQuery("");
  }

  function openRecord(record: MainRecord, tab = "Resumo") {
    setSelectedId(record.id);
    setDetailTab(tab);
    setView("detail");
  }

  function updateSelected(patch: Partial<MainRecord>, historyText?: string) {
    if (!selected) return;
    setRecords((current) => current.map((record) => record.id === selected.id ? {
      ...record,
      ...patch,
      updated: "agora",
      history: historyText ? [{ text: historyText, date: todayLabel() }, ...record.history] : record.history,
    } : record));
  }

  function createRecord() {
    const title = recordDraft.title.trim();
    if (!title) { setToast(`Informe o nome do ${config.entityLabel.toLowerCase()}`); return; }
    const data = Object.fromEntries(config.fields.map((field) => [field.key, config.newRecordDefaults?.[field.key] ?? ""]));
    const next: MainRecord = {
      id: uid(config.slug.slice(0, 3).toUpperCase()),
      title,
      subtitle: recordDraft.subtitle.trim() || config.entityLabel,
      status: config.statuses[0],
      owner: recordDraft.owner.trim() || "Não atribuído",
      updated: "agora",
      archived: false,
      data,
      history: [{ text: `${config.entityLabel} criado`, date: todayLabel() }],
      attachments: [],
    };
    setRecords((current) => [next, ...current]);
    setSelectedId(next.id);
    setRecordDraft({ title: "", subtitle: "", owner: "" });
    setModal(null);
    setActive(config.entityPlural);
    setScope("Ativos");
    setDetailTab("Resumo");
    setView("detail");
    setToast(`${config.entityLabel} criado`);
  }

  function advanceStatus() {
    if (!selected || !linearFlow) return;
    if (selected.archived) { setToast("Restaure o registro antes de alterar sua etapa"); return; }
    if (!nextStatus) { setToast("Este registro já está na etapa final"); return; }
    updateSelected({ status: nextStatus }, `Situação alterada para ${nextStatus}`);
    setToast(`Situação alterada para ${nextStatus}`);
  }

  function toggleArchive() {
    if (!selected) return;
    const willArchive = !selected.archived;
    updateSelected({ archived: willArchive }, willArchive ? "Registro arquivado" : "Registro restaurado");
    setScope(willArchive ? "Arquivados" : "Ativos");
    setView("list");
    setToast(willArchive ? "Registro arquivado" : "Registro restaurado");
  }

  function duplicateSelected() {
    if (!selected || !allowDuplicate) return;
    const copy: MainRecord = {
      ...selected,
      id: uid(config.slug.slice(0, 3).toUpperCase()),
      title: `Cópia de ${selected.title}`,
      status: config.statuses[0],
      updated: "agora",
      archived: false,
      attachments: [],
      history: [{ text: `Registro duplicado a partir de ${selected.id}`, date: todayLabel() }],
    };
    setRecords((current) => [copy, ...current]);
    setSelectedId(copy.id);
    setDetailTab("Resumo");
    setView("detail");
    setToast(`${config.entityLabel} duplicado`);
  }

  function changeOperationStatus(item: RelatedRecord, status: string) {
    setRelated((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    updateSelected({}, `${config.operationLabel} “${item.title}” alterado para ${status}`);
    setToast(`${config.operationLabel} atualizado`);
  }

  function removeOperation(item: RelatedRecord) {
    if (!window.confirm(`Remover “${item.title}”?`)) return;
    setRelated((current) => current.filter((entry) => entry.id !== item.id));
    updateSelected({}, `${config.operationLabel} removido: ${item.title}`);
    setToast(`${config.operationLabel} removido`);
  }

  function changeResourceStatus(item: ResourceRecord, status: string) {
    setResources((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    updateSelected({}, `${config.resourceLabel} “${item.title}” alterado para ${status}`);
    setToast(`${config.resourceLabel} atualizado`);
  }

  function removeResource(item: ResourceRecord) {
    if (!window.confirm(`Remover “${item.title}”?`)) return;
    setResources((current) => current.filter((entry) => entry.id !== item.id));
    updateSelected({}, `${config.resourceLabel} removido: ${item.title}`);
    setToast(`${config.resourceLabel} removido`);
  }

  function addNote() {
    if (!note.trim()) { setToast("Escreva um comentário antes de adicionar"); return; }
    updateSelected({}, note.trim());
    setNote("");
    setToast("Comentário registrado");
  }

  async function addAttachment(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const file = event.target.files[0];
    if (file.size > 700 * 1024) { setToast("Escolha um arquivo de até 700 KB"); event.target.value = ""; return; }
    try {
      const data = await fileToDataUrl(file);
      updateSelected({ attachments: [...selected.attachments, { id: uid("ARQ"), name: file.name, data }] }, `Arquivo anexado: ${file.name}`);
      setToast("Arquivo adicionado");
    } catch {
      setToast("Não foi possível ler este arquivo");
    }
    event.target.value = "";
  }

  function createOperation() {
    if (!selected || selected.archived) { setToast("Abra um registro ativo"); return; }
    if (!operationDraft.title.trim()) { setToast(`Informe o título de ${config.operationLabel.toLowerCase()}`); return; }
    const item: RelatedRecord = { id: uid("MOV"), parentId: selected.id, ...operationDraft, title: operationDraft.title.trim(), description: operationDraft.description.trim() };
    setRelated((current) => [item, ...current]);
    updateSelected({}, `${config.operationLabel} registrado: ${item.title}`);
    setOperationDraft({ title: "", description: "", date: "", status: config.operationStatuses[0] ?? "Aberto" });
    setModal(null);
    setToast(`${config.operationLabel} registrado`);
  }

  function createResource() {
    if (!selected || selected.archived) { setToast("Abra um registro ativo"); return; }
    if (!resourceDraft.title.trim()) { setToast(`Informe o nome de ${config.resourceLabel.toLowerCase()}`); return; }
    const item: ResourceRecord = { id: uid("REC"), parentId: selected.id, ...resourceDraft, title: resourceDraft.title.trim(), category: resourceDraft.category.trim(), reference: resourceDraft.reference.trim() };
    setResources((current) => [item, ...current]);
    updateSelected({}, `${config.resourceLabel} vinculado: ${item.title}`);
    setResourceDraft({ title: "", category: "", reference: "", due: "", status: config.resourceStatuses[0] ?? "Ativo" });
    setModal(null);
    setToast(`${config.resourceLabel} vinculado`);
  }

  function exportRecords() {
    const customHeaders = config.fields.map((field) => field.label);
    downloadCsv(`${config.slug}-registros.csv`, [
      ["Código", config.entityLabel, "Descrição", "Situação", "Responsável", "Arquivado", ...customHeaders],
      ...records.map((record) => [record.id, record.title, record.subtitle, record.status, record.owner, record.archived ? "Sim" : "Não", ...config.fields.map((field) => record.data[field.key] ?? "")]),
    ]);
    setToast("Lista exportada");
  }

  async function shareSelected() {
    if (!selected) return;
    await copyText(`${product.name}\n${selected.id} · ${selected.title}\nSituação: ${selected.status}\nResponsável: ${selected.owner}\n${config.operationPlural}: ${selectedOperations.length}\n${config.resourcePlural}: ${selectedResources.length}`);
    setToast("Resumo copiado");
  }

  function metricCount(metric: MetricDefinition) {
    const values = metric.source === "records" ? records.filter((record) => !record.archived) : metric.source === "operations" ? related : resources;
    return values.filter((item) => {
      if (metric.statuses?.length && !metric.statuses.includes(item.status)) return false;
      if (metric.excludeStatuses?.includes(item.status)) return false;
      return true;
    }).length;
  }

  const isDetail = active === config.entityPlural && view === "detail" && Boolean(selected);
  const shellTitle = isDetail && selected ? selected.title : active;
  const shellSubtitle = isDetail && selected ? `${selected.id} · ${selected.subtitle}` : config.entityDescription;
  const headerAction = active === config.entityPlural && view === "list"
    ? <button className={styles.primaryButton} onClick={() => setModal("record")}><Icon name="plus" /> {config.primaryAction}</button>
    : isDetail && selected?.archived
      ? <button className={styles.primaryButton} onClick={toggleArchive}>Restaurar</button>
      : isDetail && linearFlow && nextStatus
        ? <button className={styles.primaryButton} onClick={advanceStatus}>Avançar para {nextStatus}</button>
        : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={shellTitle} subtitle={shellSubtitle} action={headerAction}>
    {active === config.entityPlural && view === "list" ? <>
      <div className={vertical.metricsLine} aria-label="Resumo da área">
        {config.metrics.map((metric) => <div key={metric.label}><strong>{metricCount(metric)}</strong><span>{metric.label}</span></div>)}
      </div>
      <section className={vertical.listSurface}>
        <div className={vertical.listControls}>
          <label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${config.entityPlural.toLowerCase()}`} /></label>
          <select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por situação"><option value="Todos">Todas as situações</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <div className={vertical.scopeSwitch} aria-label="Tipo de registro">
            <button type="button" className={scope === "Ativos" ? vertical.scopeActive : ""} onClick={() => setScope("Ativos")}>Ativos</button>
            <button type="button" className={scope === "Arquivados" ? vertical.scopeActive : ""} onClick={() => setScope("Arquivados")}>Arquivados{archivedCount ? ` (${archivedCount})` : ""}</button>
          </div>
        </div>
        <div className={vertical.entityList}>
          {visibleRecords.map((record) => <button type="button" key={record.id} className={vertical.entityRow} onClick={() => openRecord(record)}>
            <span className={vertical.entityIcon}><Icon name={config.icon} /></span>
            <div className={vertical.entityMain}><strong>{record.title}</strong><p>{record.subtitle}</p><small>{record.owner}</small></div>
            <div className={vertical.entityMeta}><StatusPill status={record.status} /><span>{record.updated}</span></div>
            <Icon name="chevron" />
          </button>)}
          {!visibleRecords.length ? <EmptyState icon={scope === "Arquivados" ? "history" : "search"} title={scope === "Arquivados" ? "Nenhum registro arquivado" : `Nenhum ${config.entityLabel.toLowerCase()} encontrado`} description={query || statusFilter !== "Todos" ? "Altere a busca ou o filtro." : `Crie o primeiro ${config.entityLabel.toLowerCase()} para começar.`} action={scope === "Ativos" && !query && statusFilter === "Todos" ? <button className={styles.primaryButton} onClick={() => setModal("record")}>{config.primaryAction}</button> : undefined} /> : null}
        </div>
      </section>
    </> : null}

    {isDetail && selected ? <section className={vertical.detailPage}>
      <button type="button" className={vertical.backButton} onClick={() => setView("list")}><Icon name="back" /> Voltar para {config.entityPlural.toLowerCase()}</button>
      <div className={vertical.detailTabs}>{[
        { label: "Resumo", count: 0 },
        { label: config.operationPlural, count: selectedOperations.length },
        { label: config.resourcePlural, count: selectedResources.length + selected.attachments.length },
        { label: "Histórico", count: selected.history.length },
      ].map((tab) => <button key={tab.label} className={detailTab === tab.label ? vertical.tabActive : ""} onClick={() => setDetailTab(tab.label)}>{tab.label}{tab.count ? <span>{tab.count}</span> : null}</button>)}</div>

      {detailTab === "Resumo" ? <div className={vertical.detailContent}>
        {selected.archived ? <div className={vertical.archiveNotice}>Este registro está arquivado. Restaure para voltar a trabalhar nele.</div> : null}
        <section className={vertical.nextStepCard}>
          <div><span>Situação atual</span><StatusPill status={selected.status} /></div>
          <div><span>Próximo passo</span><strong>{selected.archived ? "Restaurar o registro" : linearFlow ? isFinalStatus ? "Fluxo concluído" : nextStatus : "Atualizar a situação quando necessário"}</strong></div>
          <div><span>Atenções</span><strong>{attentionResources ? `${attentionResources} item(ns)` : "Nenhuma"}</strong></div>
        </section>

        <section className={vertical.summarySection}>
          <div className={vertical.sectionTitle}><div><h2>Informações principais</h2><p>O necessário para entender este registro.</p></div></div>
          <dl className={vertical.factsGrid}>
            <div><dt>Responsável</dt><dd>{selected.owner}</dd></div>
            <div><dt>Descrição</dt><dd>{selected.subtitle}</dd></div>
            {keyFacts.map((field) => <div key={field.key} className={field.wide ? vertical.factWide : ""}><dt>{field.label}</dt><dd>{selected.data[field.key]}</dd></div>)}
          </dl>
          {!keyFacts.length ? <p className={vertical.missingInfo}>Os detalhes específicos ainda não foram preenchidos.</p> : null}
        </section>

        <details className={vertical.disclosure}>
          <summary><div><strong>Editar informações</strong><span>Abra somente quando precisar alterar a ficha.</span></div><Icon name="chevron" /></summary>
          <div className={vertical.disclosureBody}>
            <fieldset className={vertical.editFieldset} disabled={selected.archived}>
              <label>Título<input value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} /></label>
              <label>Descrição curta<input value={selected.subtitle} onChange={(event) => updateSelected({ subtitle: event.target.value })} /></label>
              <label>Situação<select value={selected.status} onChange={(event) => updateSelected({ status: event.target.value }, `Situação alterada para ${event.target.value}`)}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label>Responsável<input value={selected.owner} onChange={(event) => updateSelected({ owner: event.target.value })} /></label>
              {config.fields.map((field) => <label key={field.key} className={field.wide ? vertical.fullField : ""}>{field.label}{renderField(field, selected.data[field.key] ?? "", (value) => updateSelected({ data: { ...selected.data, [field.key]: value } }))}</label>)}
            </fieldset>
          </div>
        </details>

        <details className={vertical.disclosure}>
          <summary><div><strong>Mais ações</strong><span>Compartilhar, imprimir, exportar ou arquivar.</span></div><Icon name="chevron" /></summary>
          <div className={vertical.disclosureBody}><div className={vertical.inlineActions}>
            <button className={styles.secondaryButton} onClick={shareSelected}><Icon name="message" /> Copiar resumo</button>
            <button className={styles.secondaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir</button>
            <button className={styles.secondaryButton} onClick={exportRecords}><Icon name="download" /> Exportar lista</button>
            {allowDuplicate && !selected.archived ? <button className={styles.secondaryButton} onClick={duplicateSelected}><Icon name="plus" /> Duplicar</button> : null}
            <button className={selected.archived ? styles.primaryButton : styles.dangerButton} onClick={toggleArchive}>{selected.archived ? "Restaurar" : "Arquivar"}</button>
          </div></div>
        </details>
      </div> : null}

      {detailTab === config.operationPlural ? <div className={vertical.detailContent}><section className={vertical.summarySection}>
        <div className={vertical.sectionTitle}><div><h2>{config.operationPlural}</h2><p>Registros ligados a {selected.title}.</p></div>{!selected.archived ? <button className={styles.primaryButton} onClick={() => setModal("operation")}><Icon name="plus" /> Adicionar</button> : null}</div>
        <div className={vertical.operationList}>{selectedOperations.map((item) => <div className={vertical.operationRow} key={item.id}><div><strong>{item.title}</strong><p>{item.description || "Sem observação"}</p><small>{item.date || "Sem data"}</small></div><div className={vertical.operationActions}><select value={item.status} onChange={(event) => changeOperationStatus(item, event.target.value)}>{config.operationStatuses.map((status) => <option key={status}>{status}</option>)}</select><button className={styles.iconButton} aria-label={`Remover ${item.title}`} onClick={() => removeOperation(item)}><Icon name="trash" /></button></div></div>)}{!selectedOperations.length ? <EmptyState icon="activity" title={`Nenhum ${config.operationLabel.toLowerCase()} registrado`} description="Adicione somente quando houver uma atividade real para acompanhar." /> : null}</div>
      </section></div> : null}

      {detailTab === config.resourcePlural ? <div className={vertical.detailContent}><section className={vertical.summarySection}>
        <div className={vertical.sectionTitle}><div><h2>{config.resourcePlural}</h2><p>Documentos e referências ligados a {selected.title}.</p></div>{!selected.archived ? <button className={styles.primaryButton} onClick={() => setModal("resource")}><Icon name="plus" /> Vincular</button> : null}</div>
        <div className={vertical.resourceList}>{selectedResources.map((item) => <div className={vertical.resourceRow} key={item.id}><div><strong>{item.title}</strong><p>{item.category || "Sem categoria"}{item.reference ? ` · ${item.reference}` : ""}</p><small>{item.due ? `Data: ${item.due}` : "Sem data definida"}</small></div><div className={vertical.operationActions}><select value={item.status} onChange={(event) => changeResourceStatus(item, event.target.value)}>{config.resourceStatuses.map((status) => <option key={status}>{status}</option>)}</select><button className={styles.iconButton} aria-label={`Remover ${item.title}`} onClick={() => removeResource(item)}><Icon name="trash" /></button></div></div>)}{!selectedResources.length ? <EmptyState icon="document" title={`Nenhum ${config.resourceLabel.toLowerCase()} vinculado`} description="Vincule apenas documentos ou referências úteis para esta ficha." /> : null}</div>
        {!selected.archived ? <label className={vertical.uploadButton}><Icon name="image" /> Anexar arquivo<input hidden type="file" onChange={addAttachment} /></label> : null}
        {selected.attachments.length ? <div className={vertical.resourceList}>{selected.attachments.map((file) => <div className={vertical.resourceRow} key={file.id}><div><strong>{file.name}</strong><p>Arquivo anexado</p></div><div className={vertical.operationActions}><a className={vertical.fileAction} href={file.data} download={file.name}><Icon name="download" /> Baixar</a><button className={styles.iconButton} aria-label={`Remover ${file.name}`} onClick={() => { if (window.confirm(`Remover “${file.name}”?`)) updateSelected({ attachments: selected.attachments.filter((item) => item.id !== file.id) }, `Arquivo removido: ${file.name}`); }}><Icon name="trash" /></button></div></div>)}</div> : null}
      </section></div> : null}

      {detailTab === "Histórico" ? <div className={vertical.detailContent}><section className={vertical.summarySection}>
        <div className={vertical.sectionTitle}><div><h2>Histórico</h2><p>Alterações e decisões em ordem cronológica.</p></div></div>
        <Timeline items={selected.history} />
        {!selected.archived ? <div className={vertical.noteComposer}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registrar uma observação ou decisão" /><button className={styles.primaryButton} onClick={addNote}>Adicionar comentário</button></div> : null}
      </section></div> : null}
    </section> : null}

    {active === config.operationPlural ? <ListingPage title={config.operationPlural} description={`Consulte ${config.operationLabel.toLowerCase()}s de todos os registros.`} items={related.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.date || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent, config.operationPlural); } }} /> : null}
    {active === config.resourcePlural ? <ListingPage title={config.resourcePlural} description={`Consulte ${config.resourceLabel.toLowerCase()}s de todos os registros.`} items={resources.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.due || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent, config.resourcePlural); } }} /> : null}

    <Modal open={modal === "record"} title={config.primaryAction} description="Comece com o essencial. Os detalhes podem ser preenchidos depois." onClose={() => setModal(null)}><Form onSubmit={createRecord}>
      <Field label={`Nome do ${config.entityLabel.toLowerCase()}`}><input autoFocus value={recordDraft.title} onChange={(event) => setRecordDraft((current) => ({ ...current, title: event.target.value }))} /></Field>
      <Field label="Descrição curta" hint="Use uma frase que ajude a reconhecer este registro."><input value={recordDraft.subtitle} onChange={(event) => setRecordDraft((current) => ({ ...current, subtitle: event.target.value }))} /></Field>
      <Field label="Responsável"><input value={recordDraft.owner} onChange={(event) => setRecordDraft((current) => ({ ...current, owner: event.target.value }))} /></Field>
      <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar e abrir</button></div>
    </Form></Modal>

    <Modal open={modal === "operation"} title={`Novo ${config.operationLabel.toLowerCase()}`} description={selected ? `Em ${selected.title}` : undefined} onClose={() => setModal(null)}><Form onSubmit={createOperation}>
      <Field label="Título"><input autoFocus value={operationDraft.title} onChange={(event) => setOperationDraft((current) => ({ ...current, title: event.target.value }))} /></Field>
      <Field label="Descrição"><textarea value={operationDraft.description} onChange={(event) => setOperationDraft((current) => ({ ...current, description: event.target.value }))} /></Field>
      <div className={styles.formGrid}><Field label="Data"><input type="date" value={operationDraft.date} onChange={(event) => setOperationDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Situação"><select value={operationDraft.status} onChange={(event) => setOperationDraft((current) => ({ ...current, status: event.target.value }))}>{config.operationStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div>
      <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Registrar</button></div>
    </Form></Modal>

    <Modal open={modal === "resource"} title={`Vincular ${config.resourceLabel.toLowerCase()}`} description={selected ? `Em ${selected.title}` : undefined} onClose={() => setModal(null)}><Form onSubmit={createResource}>
      <Field label="Nome ou identificação"><input autoFocus value={resourceDraft.title} onChange={(event) => setResourceDraft((current) => ({ ...current, title: event.target.value }))} /></Field>
      <div className={styles.formGrid}><Field label="Categoria"><input value={resourceDraft.category} onChange={(event) => setResourceDraft((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Referência"><input value={resourceDraft.reference} onChange={(event) => setResourceDraft((current) => ({ ...current, reference: event.target.value }))} /></Field><Field label="Data ou validade"><input type="date" value={resourceDraft.due} onChange={(event) => setResourceDraft((current) => ({ ...current, due: event.target.value }))} /></Field><Field label="Situação"><select value={resourceDraft.status} onChange={(event) => setResourceDraft((current) => ({ ...current, status: event.target.value }))}>{config.resourceStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div>
      <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Vincular</button></div>
    </Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function renderField(field: FieldDefinition, value: string, onChange: (value: string) => void) {
  if (field.type === "textarea") return <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
  if (field.type === "select") return <select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Selecione</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>;
  return <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
}

type ListingItem = { id: string; title: string; subtitle: string; status: string; date: string; parentId: string };

function ListingPage({ title, description, items, onRow }: { title: string; description: string; items: ListingItem[]; onRow: (item: ListingItem) => void }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => `${item.title} ${item.subtitle} ${item.status} ${item.date}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className={vertical.listSurface}>
    <div className={vertical.consolidatedHeader}><div><h2>{title}</h2><p>{description}</p></div><strong>{filtered.length}</strong></div>
    <div className={vertical.listControls}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${title.toLowerCase()}`} /></label></div>
    <div className={vertical.entityList}>{filtered.map((item) => <button key={item.id} type="button" className={vertical.entityRow} onClick={() => onRow(item)}><span className={vertical.entityIcon}><Icon name="document" /></span><div className={vertical.entityMain}><strong>{item.title}</strong><p>{item.subtitle}</p><small>{item.date}</small></div><div className={vertical.entityMeta}><StatusPill status={item.status} /></div><Icon name="chevron" /></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhum registro encontrado" description={items.length ? "Altere a busca." : "Os registros aparecerão aqui quando forem criados."} /> : null}</div>
  </section>;
}
