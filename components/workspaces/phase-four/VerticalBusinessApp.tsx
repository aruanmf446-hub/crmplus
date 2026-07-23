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

type RecordScope = "Em andamento" | "Finalizados" | "Arquivados";
type RecordView = "list" | "detail";
type ModalName = "record" | "operation" | "resource" | "transition" | "operationStatus" | "resourceStatus" | null;

type ItemTransition = {
  id: string;
  title: string;
  current: string;
  target: string;
};

export function VerticalBusinessApp({ product, config }: { product: Product; config: VerticalConfig }) {
  const [active, setActive] = useState(config.entityPlural);
  const [view, setView] = useState<RecordView>("list");
  const [scope, setScope] = useState<RecordScope>("Em andamento");
  const [records, setRecords] = useLocalState<MainRecord[]>(`crmplus.${config.slug}.records.v2`, config.seed);
  const [related, setRelated] = useLocalState<RelatedRecord[]>(`crmplus.${config.slug}.related.v2`, config.relatedSeed);
  const [resources, setResources] = useLocalState<ResourceRecord[]>(`crmplus.${config.slug}.resources.v2`, config.resourceSeed);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [recordSort, setRecordSort] = useState<"Mais recentes" | "Nome" | "Responsável" | "Etapa">("Mais recentes");
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [recordDraft, setRecordDraft] = useState({ title: "", subtitle: "", owner: "" });
  const [operationDraft, setOperationDraft] = useState({ title: "", description: "", date: "", status: config.operationStatuses[0] ?? "Aberto" });
  const [resourceDraft, setResourceDraft] = useState({ title: "", category: "", reference: "", due: "", status: config.resourceStatuses[0] ?? "Ativo" });
  const [transitionTarget, setTransitionTarget] = useState("");
  const [itemTransition, setItemTransition] = useState<ItemTransition>({ id: "", title: "", current: "", target: "" });

  const selected = records.find((record) => record.id === selectedId);
  const linearFlow = config.linearFlow !== false;
  const allowDuplicate = config.allowDuplicate !== false;
  const nav: NavItem[] = [
    { label: config.entityPlural, icon: config.icon },
    { label: config.operationPlural, icon: "activity" },
    { label: config.resourcePlural, icon: resourceIcon(config.slug) },
  ];

  const finalStatus = config.statuses.at(-1) ?? "";
  const visibleRecords = useMemo(() => {
    const value = query.trim().toLowerCase();
    const filtered = records.filter((record) => {
      const matchesScope = scope === "Arquivados"
        ? record.archived
        : !record.archived && (scope === "Finalizados" ? record.status === finalStatus : record.status !== finalStatus);
      return matchesScope && (statusFilter === "Todos" || record.status === statusFilter) && (!value || `${record.title} ${record.subtitle} ${record.owner} ${Object.values(record.data).join(" ")}`.toLowerCase().includes(value));
    });
    return [...filtered].sort((a, b) => {
      if (recordSort === "Nome") return a.title.localeCompare(b.title, "pt-BR");
      if (recordSort === "Responsável") return a.owner.localeCompare(b.owner, "pt-BR");
      if (recordSort === "Etapa") return config.statuses.indexOf(a.status) - config.statuses.indexOf(b.status);
      return records.indexOf(a) - records.indexOf(b);
    });
  }, [config.statuses, finalStatus, query, recordSort, records, scope, statusFilter]);

  const selectedOperations = selected ? related.filter((item) => item.parentId === selected.id) : [];
  const selectedResources = selected ? resources.filter((item) => item.parentId === selected.id) : [];
  const keyFacts = selected ? config.fields.filter((field) => selected.data[field.key]?.trim()).slice(0, 8) : [];
  const currentStatusIndex = selected ? config.statuses.indexOf(selected.status) : -1;
  const nextStatus = selected && linearFlow && currentStatusIndex >= 0 && selected.status !== finalStatus ? config.statuses[currentStatusIndex + 1] : "";
  const attentionResources = selectedResources.filter((item) => ["Pendente", "Vencendo", "Vencido", "Aguardando", "Aberto", "Atenção", "Solicitada"].some((term) => item.status.includes(term))).length;
  const archivedCount = records.filter((record) => record.archived).length;
  const finalizedCount = records.filter((record) => !record.archived && record.status === finalStatus).length;
  const openCount = records.filter((record) => !record.archived && record.status !== finalStatus).length;

  function changeArea(label: string) {
    setActive(label);
    setView("list");
    setSelectedId("");
    setQuery("");
  }

  function openRecord(record: MainRecord) {
    setSelectedId(record.id);
    setView("detail");
  }

  function returnToList() {
    setSelectedId("");
    setView("list");
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
    if (!recordDraft.owner.trim()) { setToast("Defina quem será responsável pelo registro"); return; }
    const data = Object.fromEntries(config.fields.map((field) => [field.key, config.newRecordDefaults?.[field.key] ?? ""]));
    const next: MainRecord = {
      id: uid(config.slug.slice(0, 3).toUpperCase()),
      title,
      subtitle: recordDraft.subtitle.trim() || config.entityLabel,
      status: config.statuses[0],
      owner: recordDraft.owner.trim(),
      updated: "agora",
      archived: false,
      data,
      history: [{ text: `${config.entityLabel} criado na etapa ${config.statuses[0]}`, date: todayLabel() }],
      attachments: [],
    };
    setRecords((current) => [next, ...current]);
    setRecordDraft({ title: "", subtitle: "", owner: "" });
    setModal(null);
    setActive(config.entityPlural);
    setScope("Em andamento");
    openRecord(next);
    setToast(`${config.entityLabel} criado`);
  }

  function transitionOptions() {
    if (!selected) return [];
    if (linearFlow) return nextStatus ? [nextStatus] : [];
    return config.statuses.filter((status) => status !== selected.status);
  }

  function openTransition() {
    if (!selected) return;
    if (selected.archived) { setToast("Restaure o registro antes de alterar sua etapa"); return; }
    const options = transitionOptions();
    if (!options.length) { setToast("Este registro já está na etapa final"); return; }
    setTransitionTarget(options[0]);
    setModal("transition");
  }

  function validateTransition(target: string) {
    if (!selected) return "Selecione um registro";
    if (!selected.owner.trim() || selected.owner === "Não atribuído") return "Defina um responsável antes de mudar a etapa";
    if (!selected.subtitle.trim()) return "Preencha a descrição do registro antes de continuar";
    if (currentStatusIndex === 0 && !keyFacts.length) return "Preencha ao menos uma informação principal antes de avançar";
    if (target === finalStatus && attentionResources > 0) return `Resolva ${attentionResources} item(ns) com atenção antes de concluir`;
    return "";
  }

  function confirmTransition() {
    if (!selected || !transitionTarget) return;
    const error = validateTransition(transitionTarget);
    if (error) { setModal(null); setToast(error); return; }
    const previous = selected.status;
    updateSelected({ status: transitionTarget }, `Etapa alterada de ${previous} para ${transitionTarget}`);
    setModal(null);
    setToast(`Etapa atualizada para ${transitionTarget}`);
  }

  function toggleArchive() {
    if (!selected) return;
    const willArchive = !selected.archived;
    if (willArchive && !window.confirm(`Arquivar “${selected.title}”? O registro sairá da lista ativa, mas o histórico será preservado.`)) return;
    updateSelected({ archived: willArchive }, willArchive ? "Registro arquivado" : "Registro restaurado");
    setScope(willArchive ? "Arquivados" : "Em andamento");
    returnToList();
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
      history: [{ text: `Registro criado a partir de ${selected.id}`, date: todayLabel() }],
    };
    setRecords((current) => [copy, ...current]);
    openRecord(copy);
    setToast(`${config.entityLabel} duplicado`);
  }

  function openOperationStatus(item: RelatedRecord) {
    const target = config.operationStatuses.find((status) => status !== item.status) ?? "";
    if (!target) return;
    setItemTransition({ id: item.id, title: item.title, current: item.status, target });
    setModal("operationStatus");
  }

  function openResourceStatus(item: ResourceRecord) {
    const target = config.resourceStatuses.find((status) => status !== item.status) ?? "";
    if (!target) return;
    setItemTransition({ id: item.id, title: item.title, current: item.status, target });
    setModal("resourceStatus");
  }

  function confirmItemTransition(kind: "operation" | "resource") {
    if (!itemTransition.id || !itemTransition.target) return;
    if (kind === "operation") {
      setRelated((current) => current.map((entry) => entry.id === itemTransition.id ? { ...entry, status: itemTransition.target } : entry));
      updateSelected({}, `${config.operationLabel} “${itemTransition.title}” alterado de ${itemTransition.current} para ${itemTransition.target}`);
    } else {
      setResources((current) => current.map((entry) => entry.id === itemTransition.id ? { ...entry, status: itemTransition.target } : entry));
      updateSelected({}, `${config.resourceLabel} “${itemTransition.title}” alterado de ${itemTransition.current} para ${itemTransition.target}`);
    }
    setModal(null);
    setToast("Situação atualizada");
  }

  function removeOperation(item: RelatedRecord) {
    if (!window.confirm(`Remover “${item.title}”? Esta ação não poderá ser desfeita.`)) return;
    setRelated((current) => current.filter((entry) => entry.id !== item.id));
    updateSelected({}, `${config.operationLabel} removido: ${item.title}`);
    setToast(`${config.operationLabel} removido`);
  }

  function removeResource(item: ResourceRecord) {
    if (!window.confirm(`Remover “${item.title}”? Esta ação não poderá ser desfeita.`)) return;
    setResources((current) => current.filter((entry) => entry.id !== item.id));
    updateSelected({}, `${config.resourceLabel} removido: ${item.title}`);
    setToast(`${config.resourceLabel} removido`);
  }

  function addNote() {
    if (!note.trim()) { setToast("Escreva uma observação antes de adicionar"); return; }
    updateSelected({}, note.trim());
    setNote("");
    setToast("Observação registrada");
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
    await copyText(`${product.name}\n${selected.id} · ${selected.title}\nEtapa atual: ${selected.status}\nResponsável: ${selected.owner}\nPróxima ação: ${nextStatus || "Revisar o registro"}`);
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
  const shellSubtitle = isDetail && selected ? `${selected.id} · etapa atual: ${selected.status}` : config.entityDescription;
  const headerAction = active === config.entityPlural && view === "list"
    ? <button className={styles.primaryButton} onClick={() => setModal("record")}><Icon name="plus" /> {config.primaryAction}</button>
    : isDetail && selected?.archived
      ? <button className={styles.primaryButton} onClick={toggleArchive}>Restaurar</button>
      : isDetail && selected && transitionOptions().length
        ? <button className={styles.primaryButton} onClick={openTransition}>{linearFlow ? `Continuar para ${nextStatus}` : "Alterar situação"}</button>
        : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={shellTitle} subtitle={shellSubtitle} action={headerAction}>
    {active === config.entityPlural && view === "list" ? <>
      <div className={vertical.metricsLine} aria-label="Resumo da área">
        {config.metrics.map((metric) => <div key={metric.label}><strong>{metricCount(metric)}</strong><span>{metric.label}</span></div>)}
      </div>
      <section className={vertical.listSurface}>
        <div className={vertical.listControls}>
          <label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${config.entityPlural.toLowerCase()}`} /></label>
          <select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setSelectedId(""); }} aria-label="Filtrar por situação"><option value="Todos">Todas as situações</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <select className={styles.compactSelect} value={recordSort} onChange={(event) => setRecordSort(event.target.value as typeof recordSort)} aria-label="Classificar registros"><option>Mais recentes</option><option>Nome</option><option>Responsável</option><option>Etapa</option></select>
          <div className={vertical.scopeSwitch} aria-label="Andamento dos registros"><button type="button" className={scope === "Em andamento" ? vertical.scopeActive : ""} onClick={() => { setScope("Em andamento"); setStatusFilter("Todos"); setSelectedId(""); }}>Em andamento ({openCount})</button><button type="button" className={scope === "Finalizados" ? vertical.scopeActive : ""} onClick={() => { setScope("Finalizados"); setStatusFilter("Todos"); setSelectedId(""); }}>Finalizados ({finalizedCount})</button><button type="button" className={scope === "Arquivados" ? vertical.scopeActive : ""} onClick={() => { setScope("Arquivados"); setStatusFilter("Todos"); setSelectedId(""); }}>Arquivados{archivedCount ? ` (${archivedCount})` : ""}</button></div>
        </div>
        <div className={vertical.entityList}>{visibleRecords.map((record) => <button type="button" key={record.id} className={vertical.entityRow} onClick={() => openRecord(record)}><span className={vertical.entityIcon}><Icon name={config.icon} /></span><div className={vertical.entityMain}><strong>{record.title}</strong><p>{record.subtitle}</p><small>Próxima ação: {record.status === finalStatus ? "Consultar conclusão" : linearFlow ? config.statuses[config.statuses.indexOf(record.status) + 1] || "Revisar" : "Abrir registro"}</small></div><div className={vertical.entityMeta}><StatusPill status={record.status} /><span>{record.updated}</span></div><Icon name="chevron" /></button>)}{!visibleRecords.length ? <EmptyState icon={scope === "Arquivados" || scope === "Finalizados" ? "history" : "search"} title={scope === "Arquivados" ? "Nenhum registro arquivado" : scope === "Finalizados" ? "Nenhum processo finalizado" : `Nenhum ${config.entityLabel.toLowerCase()} encontrado`} description={query || statusFilter !== "Todos" ? "Altere a busca ou o filtro." : `Crie o primeiro ${config.entityLabel.toLowerCase()} para começar.`} action={scope === "Em andamento" && !query && statusFilter === "Todos" ? <button className={styles.primaryButton} onClick={() => setModal("record")}>{config.primaryAction}</button> : undefined} /> : null}</div>
      </section>
    </> : null}

    {active === config.entityPlural && view === "list" && !selected ? null : null}

    {isDetail && selected ? <section className={vertical.detailPage}>
      <button type="button" className={vertical.backButton} onClick={returnToList}><Icon name="back" /> Voltar para {config.entityPlural.toLowerCase()}</button>
      <div className={vertical.detailContent}>
        {selected.archived ? <div className={vertical.archiveNotice}>Este registro está arquivado. Restaure para voltar a trabalhar nele.</div> : null}
        <section className={vertical.nextStepCard}>
          <div><span>Etapa atual</span><StatusPill status={selected.status} /></div>
          <div><span>Ação necessária</span><strong>{selected.archived ? "Restaurar o registro" : linearFlow ? nextStatus || "Processo concluído" : "Revisar e decidir a próxima situação"}</strong></div>
          <div><span>Atenções</span><strong>{attentionResources ? `${attentionResources} item(ns)` : "Nenhuma"}</strong></div>
        </section>

        <section className={vertical.summarySection}><div className={vertical.sectionTitle}><div><h2>Trabalho desta etapa</h2><p>Mostramos somente o necessário para decidir o próximo passo.</p></div></div><dl className={vertical.factsGrid}><div><dt>Responsável</dt><dd>{selected.owner}</dd></div><div><dt>Descrição</dt><dd>{selected.subtitle}</dd></div>{keyFacts.slice(0, 4).map((field) => <div key={field.key} className={field.wide ? vertical.factWide : ""}><dt>{field.label}</dt><dd>{selected.data[field.key]}</dd></div>)}</dl>{!keyFacts.length ? <p className={vertical.missingInfo}>Preencha os dados essenciais antes de mudar a etapa.</p> : null}{!selected.archived && transitionOptions().length ? <div className={vertical.inlineActions}><button className={styles.primaryButton} onClick={openTransition}>{linearFlow ? `Continuar para ${nextStatus}` : "Escolher próxima situação"}</button></div> : null}</section>

        <details className={vertical.disclosure}><summary><div><strong>Dados do cadastro</strong><span>Informações preservadas das etapas anteriores.</span></div><Icon name="chevron" /></summary><div className={vertical.disclosureBody}><fieldset className={vertical.editFieldset} disabled={selected.archived}><label>Título<input value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} /></label><label>Descrição curta<input value={selected.subtitle} onChange={(event) => updateSelected({ subtitle: event.target.value })} /></label><label>Responsável<input value={selected.owner} onChange={(event) => updateSelected({ owner: event.target.value })} /></label>{config.fields.map((field) => <label key={field.key} className={field.wide ? vertical.fullField : ""}>{field.label}{renderField(field, selected.data[field.key] ?? "", (value) => updateSelected({ data: { ...selected.data, [field.key]: value } }))}</label>)}</fieldset></div></details>

        <details className={vertical.disclosure}><summary><div><strong>{config.operationPlural}</strong><span>{selectedOperations.length} registro(s) ligados ao processo.</span></div><Icon name="chevron" /></summary><div className={vertical.disclosureBody}>{!selected.archived ? <button className={styles.primaryButton} onClick={() => setModal("operation")}><Icon name="plus" /> Adicionar {config.operationLabel.toLowerCase()}</button> : null}<div className={vertical.operationList}>{selectedOperations.map((item) => <div className={vertical.operationRow} key={item.id}><div><strong>{item.title}</strong><p>{item.description || "Sem observação"}</p><small>{item.date || "Sem data"}</small></div><div className={vertical.operationActions}><StatusPill status={item.status} /><button className={styles.secondaryButton} onClick={() => openOperationStatus(item)}>Atualizar situação</button><button className={styles.iconButton} aria-label={`Remover ${item.title}`} onClick={() => removeOperation(item)}><Icon name="trash" /></button></div></div>)}{!selectedOperations.length ? <EmptyState icon="activity" title={`Nenhum ${config.operationLabel.toLowerCase()} registrado`} description="Adicione somente quando houver uma ação real para acompanhar." /> : null}</div></div></details>

        <details className={vertical.disclosure}><summary><div><strong>{config.resourcePlural}</strong><span>{selectedResources.length + selected.attachments.length} item(ns) vinculados.</span></div><Icon name="chevron" /></summary><div className={vertical.disclosureBody}>{!selected.archived ? <button className={styles.primaryButton} onClick={() => setModal("resource")}><Icon name="plus" /> Adicionar {config.resourceLabel.toLowerCase()}</button> : null}<div className={vertical.resourceList}>{selectedResources.map((item) => <div className={vertical.resourceRow} key={item.id}><div><strong>{item.title}</strong><p>{item.category || `Sem categoria de ${config.resourceLabel.toLowerCase()}`}{item.reference ? ` · ${item.reference}` : ""}</p><small>{item.due ? `Data: ${item.due}` : "Sem data definida"}</small></div><div className={vertical.operationActions}><StatusPill status={item.status} /><button className={styles.secondaryButton} onClick={() => openResourceStatus(item)}>Atualizar situação</button><button className={styles.iconButton} aria-label={`Remover ${item.title}`} onClick={() => removeResource(item)}><Icon name="trash" /></button></div></div>)}{!selectedResources.length ? <EmptyState icon={resourceIcon(config.slug)} title={`Nenhum ${config.resourceLabel.toLowerCase()} adicionado`} description="Adicione somente itens úteis para esta etapa." /> : null}</div>{!selected.archived ? <label className={vertical.uploadButton}><Icon name="image" /> Anexar arquivo<input hidden type="file" onChange={addAttachment} /></label> : null}{selected.attachments.length ? <div className={vertical.resourceList}>{selected.attachments.map((file) => <div className={vertical.resourceRow} key={file.id}><div><strong>{file.name}</strong><p>Arquivo anexado</p></div><div className={vertical.operationActions}><a className={vertical.fileAction} href={file.data} download={file.name}><Icon name="download" /> Baixar</a><button className={styles.iconButton} aria-label={`Remover ${file.name}`} onClick={() => { if (window.confirm(`Remover “${file.name}”?`)) updateSelected({ attachments: selected.attachments.filter((item) => item.id !== file.id) }, `Arquivo removido: ${file.name}`); }}><Icon name="trash" /></button></div></div>)}</div> : null}</div></details>

        <details className={vertical.disclosure}><summary><div><strong>Histórico</strong><span>{selected.history.length} registro(s) preservados.</span></div><Icon name="chevron" /></summary><div className={vertical.disclosureBody}><Timeline items={selected.history} />{!selected.archived ? <div className={vertical.noteComposer}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registrar uma observação ou decisão" /><button className={styles.primaryButton} onClick={addNote}>Adicionar observação</button></div> : null}</div></details>

        <details className={vertical.disclosure}><summary><div><strong>Mais ações</strong><span>Compartilhar, imprimir, exportar ou arquivar.</span></div><Icon name="chevron" /></summary><div className={vertical.disclosureBody}><div className={vertical.inlineActions}><button className={styles.secondaryButton} onClick={shareSelected}><Icon name="message" /> Copiar resumo</button><button className={styles.secondaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir</button><button className={styles.secondaryButton} onClick={exportRecords}><Icon name="download" /> Exportar lista</button>{allowDuplicate && !selected.archived ? <button className={styles.secondaryButton} onClick={duplicateSelected}><Icon name="plus" /> Duplicar</button> : null}<button className={selected.archived ? styles.primaryButton : styles.dangerButton} onClick={toggleArchive}>{selected.archived ? "Restaurar" : "Arquivar"}</button></div></div></details>
      </div>
    </section> : null}

    {active === config.entityPlural && view === "list" && records.length > 0 ? null : null}
    {active === config.operationPlural ? <ListingPage title={config.operationPlural} description={`${config.operationLabel}s de todos os registros.`} icon="activity" statuses={config.operationStatuses} finalStatus={config.operationStatuses.at(-1) ?? ""} items={related.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.date || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent); } }} /> : null}
    {active === config.resourcePlural ? <ListingPage title={config.resourcePlural} description={`${config.resourceLabel}s de todos os registros.`} icon={resourceIcon(config.slug)} statuses={config.resourceStatuses} finalStatus={config.resourceStatuses.at(-1) ?? ""} items={resources.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.due || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent); } }} /> : null}

    <Modal open={modal === "record"} title={config.primaryAction} description="Comece com o essencial. O processo abrirá na primeira etapa." onClose={() => setModal(null)}><Form onSubmit={createRecord}><Field label={`Nome do ${config.entityLabel.toLowerCase()}`}><input autoFocus required value={recordDraft.title} onChange={(event) => setRecordDraft((current) => ({ ...current, title: event.target.value }))} /></Field><Field label="Descrição curta" hint="Use uma frase que ajude a reconhecer este registro."><input value={recordDraft.subtitle} onChange={(event) => setRecordDraft((current) => ({ ...current, subtitle: event.target.value }))} /></Field><Field label="Responsável"><input required value={recordDraft.owner} onChange={(event) => setRecordDraft((current) => ({ ...current, owner: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar na etapa {config.statuses[0]}</button></div></Form></Modal>

    <Modal open={modal === "transition"} title="Confirmar mudança de etapa" description={selected ? `${selected.id} · ${selected.title}` : undefined} onClose={() => setModal(null)}>{selected ? <><div className={styles.noteBox}><strong>{selected.status}</strong> → <strong>{transitionTarget}</strong><br />Esta mudança será registrada no histórico e definirá o trabalho que aparecerá como etapa atual.</div>{!linearFlow ? <Field label="Nova situação"><select value={transitionTarget} onChange={(event) => setTransitionTarget(event.target.value)}>{transitionOptions().map((status) => <option key={status}>{status}</option>)}</select></Field> : null}<div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmTransition}>Confirmar mudança</button></div></> : null}</Modal>

    <Modal open={modal === "operation"} title={`Novo ${config.operationLabel.toLowerCase()}`} description={selected ? `Em ${selected.title}` : undefined} onClose={() => setModal(null)}><Form onSubmit={createOperation}><Field label="Título"><input autoFocus required value={operationDraft.title} onChange={(event) => setOperationDraft((current) => ({ ...current, title: event.target.value }))} /></Field><Field label="Descrição"><textarea value={operationDraft.description} onChange={(event) => setOperationDraft((current) => ({ ...current, description: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Data"><input type="date" value={operationDraft.date} onChange={(event) => setOperationDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Situação inicial"><select value={operationDraft.status} onChange={(event) => setOperationDraft((current) => ({ ...current, status: event.target.value }))}>{config.operationStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Registrar</button></div></Form></Modal>

    <Modal open={modal === "resource"} title={`Adicionar ${config.resourceLabel.toLowerCase()}`} description={selected ? `Em ${selected.title}` : undefined} onClose={() => setModal(null)}><Form onSubmit={createResource}><Field label="Nome ou identificação"><input autoFocus required value={resourceDraft.title} onChange={(event) => setResourceDraft((current) => ({ ...current, title: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Categoria"><input value={resourceDraft.category} onChange={(event) => setResourceDraft((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Referência"><input value={resourceDraft.reference} onChange={(event) => setResourceDraft((current) => ({ ...current, reference: event.target.value }))} /></Field><Field label="Data ou validade"><input type="date" value={resourceDraft.due} onChange={(event) => setResourceDraft((current) => ({ ...current, due: event.target.value }))} /></Field><Field label="Situação inicial"><select value={resourceDraft.status} onChange={(event) => setResourceDraft((current) => ({ ...current, status: event.target.value }))}>{config.resourceStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Adicionar</button></div></Form></Modal>

    <Modal open={modal === "operationStatus"} title={`Atualizar ${config.operationLabel.toLowerCase()}`} description={itemTransition.title} onClose={() => setModal(null)}><Field label="Nova situação"><select value={itemTransition.target} onChange={(event) => setItemTransition((current) => ({ ...current, target: event.target.value }))}>{config.operationStatuses.filter((status) => status !== itemTransition.current).map((status) => <option key={status}>{status}</option>)}</select></Field><div className={styles.noteBox}><strong>{itemTransition.current}</strong> → <strong>{itemTransition.target}</strong><br />Confirme somente depois de realizar a ação correspondente.</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={() => confirmItemTransition("operation")}>Confirmar atualização</button></div></Modal>

    <Modal open={modal === "resourceStatus"} title={`Atualizar ${config.resourceLabel.toLowerCase()}`} description={itemTransition.title} onClose={() => setModal(null)}><Field label="Nova situação"><select value={itemTransition.target} onChange={(event) => setItemTransition((current) => ({ ...current, target: event.target.value }))}>{config.resourceStatuses.filter((status) => status !== itemTransition.current).map((status) => <option key={status}>{status}</option>)}</select></Field><div className={styles.noteBox}><strong>{itemTransition.current}</strong> → <strong>{itemTransition.target}</strong><br />Confirme somente depois de verificar a situação real deste item.</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={() => confirmItemTransition("resource")}>Confirmar atualização</button></div></Modal>

    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function renderField(field: FieldDefinition, value: string, onChange: (value: string) => void) {
  if (field.type === "textarea") return <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
  if (field.type === "select") return <select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Selecione</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>;
  return <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
}

type ListingItem = { id: string; title: string; subtitle: string; status: string; date: string; parentId: string };

function ListingPage({ title, description, icon, items, statuses, finalStatus, onRow }: { title: string; description: string; icon: IconName; items: ListingItem[]; statuses: string[]; finalStatus: string; onRow: (item: ListingItem) => void }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"Em andamento" | "Finalizados">("Em andamento");
  const [status, setStatus] = useState("Todos");
  const [sort, setSort] = useState<"Mais recentes" | "Nome" | "Data" | "Situação">("Mais recentes");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const scoped = items.filter((item) => (scope === "Finalizados" ? item.status === finalStatus : item.status !== finalStatus) && (status === "Todos" || item.status === status) && `${item.title} ${item.subtitle} ${item.status} ${item.date}`.toLowerCase().includes(value));
    return [...scoped].sort((a, b) => sort === "Nome" ? a.title.localeCompare(b.title, "pt-BR") : sort === "Data" ? a.date.localeCompare(b.date, "pt-BR") : sort === "Situação" ? statuses.indexOf(a.status) - statuses.indexOf(b.status) : items.indexOf(a) - items.indexOf(b));
  }, [finalStatus, items, query, scope, sort, status, statuses]);
  const openCount = items.filter((item) => item.status !== finalStatus).length;
  const finishedCount = items.filter((item) => item.status === finalStatus).length;
  return <section className={vertical.listSurface}><div className={vertical.consolidatedHeader}><div><h2>{title}</h2><p>{description}</p></div><strong>{filtered.length}</strong></div><div className={vertical.listControls}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${title.toLowerCase()}`} /></label><select className={styles.compactSelect} value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select className={styles.compactSelect} value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option>Mais recentes</option><option>Nome</option><option>Data</option><option>Situação</option></select><div className={vertical.scopeSwitch}><button className={scope === "Em andamento" ? vertical.scopeActive : ""} onClick={() => { setScope("Em andamento"); setStatus("Todos"); }}>Em andamento ({openCount})</button><button className={scope === "Finalizados" ? vertical.scopeActive : ""} onClick={() => { setScope("Finalizados"); setStatus("Todos"); }}>Finalizados ({finishedCount})</button></div></div><div className={vertical.entityList}>{filtered.map((item) => <button key={item.id} type="button" className={vertical.entityRow} onClick={() => onRow(item)}><span className={vertical.entityIcon}><Icon name={icon} /></span><div className={vertical.entityMain}><strong>{item.title}</strong><p>{item.subtitle}</p><small>{item.date}</small></div><div className={vertical.entityMeta}><StatusPill status={item.status} /></div><Icon name="chevron" /></button>)}{!filtered.length ? <EmptyState icon={scope === "Finalizados" ? "history" : "search"} title={scope === "Finalizados" ? "Nenhuma atividade finalizada" : "Nenhum registro em andamento"} description={items.length ? "Altere a busca, o filtro ou a classificação." : "Os registros aparecerão aqui quando forem criados."} /> : null}</div></section>;
}

function resourceIcon(slug: string): IconName {
  if (slug === "olympus" || slug === "hermes" || slug === "pegasus") return "people";
  if (slug === "gaia") return "spark";
  if (slug === "titans") return "clipboard";
  if (slug === "alexandria") return "document";
  if (slug === "argus") return "tag";
  return "document";
}
