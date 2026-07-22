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

export function VerticalBusinessApp({ product, config }: { product: Product; config: VerticalConfig }) {
  const [active, setActive] = useState(config.entityPlural);
  const [records, setRecords] = useLocalState<MainRecord[]>(`crmplus.${config.slug}.records`, config.seed);
  const [related, setRelated] = useLocalState<RelatedRecord[]>(`crmplus.${config.slug}.related`, config.relatedSeed);
  const [resources, setResources] = useLocalState<ResourceRecord[]>(`crmplus.${config.slug}.resources`, config.resourceSeed);
  const [selectedId, setSelectedId] = useState(config.seed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [detailTab, setDetailTab] = useState("Resumo");
  const [modal, setModal] = useState<"record" | "operation" | "resource" | null>(null);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [recordDraft, setRecordDraft] = useState<Record<string, string>>(() => ({ title: "", subtitle: "", owner: "", ...(config.newRecordDefaults ?? {}) }));
  const [operationDraft, setOperationDraft] = useState({ title: "", description: "", date: "", status: config.operationStatuses[0] ?? "Aberto" });
  const [resourceDraft, setResourceDraft] = useState({ title: "", category: "", reference: "", due: "", status: config.resourceStatuses[0] ?? "Ativo" });

  const selected = records.find((record) => record.id === selectedId) ?? records.find((record) => !record.archived) ?? records[0];
  const linearFlow = config.linearFlow !== false;
  const allowDuplicate = config.allowDuplicate !== false;
  const nav: NavItem[] = [
    { label: config.entityPlural, icon: config.icon },
    { label: config.operationPlural, icon: "activity" },
    { label: config.resourcePlural, icon: "document" },
    { label: "Arquivados", icon: "history" },
  ];

  const visibleRecords = useMemo(() => {
    const value = query.trim().toLowerCase();
    return records.filter((record) => !record.archived && (statusFilter === "Todos" || record.status === statusFilter) && (!value || `${record.title} ${record.subtitle} ${record.owner} ${Object.values(record.data).join(" ")}`.toLowerCase().includes(value)));
  }, [query, records, statusFilter]);

  const selectedOperations = selected ? related.filter((item) => item.parentId === selected.id) : [];
  const selectedResources = selected ? resources.filter((item) => item.parentId === selected.id) : [];
  const finalStatus = config.statuses.at(-1) ?? "";
  const isFinalStatus = Boolean(selected && selected.status === finalStatus);
  const nextStatus = selected && linearFlow && !isFinalStatus ? config.statuses[config.statuses.indexOf(selected.status) + 1] : selected?.status ?? "";
  const attentionResources = selectedResources.filter((item) => ["Pendente", "Vencendo", "Vencido", "Aguardando", "Aberto", "Revisar", "Próximo do vencimento"].some((term) => item.status.includes(term))).length;

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
    const title = recordDraft.title?.trim();
    if (!title) { setToast(`Informe o nome do ${config.entityLabel.toLowerCase()}`); return; }
    const data = Object.fromEntries(config.fields.map((field) => [field.key, recordDraft[field.key] ?? ""]));
    const next: MainRecord = {
      id: uid(config.slug.slice(0, 3).toUpperCase()),
      title,
      subtitle: recordDraft.subtitle?.trim() || config.entityLabel,
      status: config.statuses[0],
      owner: recordDraft.owner?.trim() || "Não atribuído",
      updated: "agora",
      archived: false,
      data,
      history: [{ text: `${config.entityLabel} criado`, date: todayLabel() }],
      attachments: [],
    };
    setRecords((current) => [next, ...current]);
    setSelectedId(next.id);
    setRecordDraft({ title: "", subtitle: "", owner: "", ...(config.newRecordDefaults ?? {}) });
    setModal(null);
    setActive(config.entityPlural);
    setDetailTab("Resumo");
    setToast(`${config.entityLabel} criado`);
  }

  function advanceStatus() {
    if (!selected || !linearFlow) return;
    if (selected.archived) { setToast("Restaure o registro antes de alterar sua etapa"); return; }
    const index = config.statuses.indexOf(selected.status);
    if (index < 0 || index >= config.statuses.length - 1) { setToast("Este registro já está na etapa final"); return; }
    const next = config.statuses[index + 1];
    updateSelected({ status: next }, `Situação alterada para ${next}`);
    setToast(`Registro avançou para ${next}`);
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
    setToast(`${config.entityLabel} duplicado sem copiar anexos`);
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
    if (!note.trim()) return;
    updateSelected({}, note.trim());
    setNote("");
    setToast("Comentário registrado");
  }

  async function addAttachment(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const file = event.target.files[0];
    if (file.size > 700 * 1024) { setToast("O arquivo é muito grande. Escolha um de até 700 KB"); event.target.value = ""; return; }
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
    if (!selected || selected.archived) { setToast("Selecione um registro ativo"); return; }
    if (!operationDraft.title.trim()) { setToast(`Informe o título de ${config.operationLabel.toLowerCase()}`); return; }
    const item: RelatedRecord = { id: uid("MOV"), parentId: selected.id, ...operationDraft, title: operationDraft.title.trim(), description: operationDraft.description.trim() };
    setRelated((current) => [item, ...current]);
    updateSelected({}, `${config.operationLabel} registrado: ${item.title}`);
    setOperationDraft({ title: "", description: "", date: "", status: config.operationStatuses[0] ?? "Aberto" });
    setModal(null);
    setToast(`${config.operationLabel} registrado`);
  }

  function createResource() {
    if (!selected || selected.archived) { setToast("Selecione um registro ativo"); return; }
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
    setToast("Planilha gerada");
  }

  async function shareSelected() {
    if (!selected) return;
    await copyText(`${product.name}\n${selected.id} · ${selected.title}\nSituação: ${selected.status}\nResponsável: ${selected.owner}\n${config.operationPlural}: ${selectedOperations.length}\n${config.resourcePlural}: ${selectedResources.length}`);
    setToast("Resumo copiado para compartilhamento");
  }

  function metricCount(metric: MetricDefinition) {
    const values = metric.source === "records" ? records.filter((record) => !record.archived) : metric.source === "operations" ? related : resources;
    return values.filter((item) => {
      const status = item.status;
      if (metric.statuses?.length && !metric.statuses.includes(status)) return false;
      if (metric.excludeStatuses?.includes(status)) return false;
      return true;
    }).length;
  }

  const headerAction = active === config.entityPlural
    ? <button className={styles.primaryButton} onClick={() => setModal("record")}><Icon name="plus" /> {config.primaryAction}</button>
    : active === config.operationPlural && selected && !selected.archived
      ? <button className={styles.primaryButton} onClick={() => setModal("operation")}><Icon name="plus" /> Novo {config.operationLabel.toLowerCase()}</button>
      : active === config.resourcePlural && selected && !selected.archived
        ? <button className={styles.primaryButton} onClick={() => setModal("resource")}><Icon name="plus" /> Vincular {config.resourceLabel.toLowerCase()}</button>
        : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle={config.entityDescription} action={headerAction}>
    {active === config.entityPlural ? <>
      <div className={vertical.overviewStrip}>
        {config.metrics.map((metric) => <div className={vertical.overviewItem} key={metric.label}><span>{metric.label}</span><strong>{metricCount(metric)}</strong><small>{metric.helper}</small></div>)}
      </div>
      <div className={styles.masterDetail}>
        <section className={styles.listPane}>
          <div className={styles.listToolbar}>
            <label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${config.entityPlural.toLowerCase()}`} /></label>
            <select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Todos</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          </div>
          <div className={vertical.entityList}>{visibleRecords.map((record) => <button type="button" key={record.id} className={`${vertical.entityRow} ${selected?.id === record.id ? vertical.entitySelected : ""}`} onClick={() => { setSelectedId(record.id); setDetailTab("Resumo"); }}><span className={vertical.entityIcon}><Icon name={config.icon} /></span><div className={vertical.entityMain}><strong>{record.title}</strong><p>{record.subtitle} · {record.owner}</p></div><div className={vertical.entityMeta}><StatusPill status={record.status} /><small>{record.updated}</small></div></button>)}{!visibleRecords.length ? <EmptyState icon="search" title={`Nenhum ${config.entityLabel.toLowerCase()} encontrado`} description="Altere os filtros ou crie um novo registro." /> : null}</div>
        </section>

        {selected ? <section className={styles.detailPane}>
          <div className={vertical.resultBanner}><Icon name="chevron" /> Registro selecionado</div>
          <div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.title}</h2><p>{selected.subtitle} · {selected.owner}</p></div><div className={styles.headerButtons}><button className={styles.secondaryButton} onClick={shareSelected}><Icon name="message" /> Compartilhar</button><button className={styles.secondaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir</button>{linearFlow ? <button className={styles.primaryButton} disabled={selected.archived || isFinalStatus} onClick={advanceStatus}>{selected.archived ? "Arquivado" : isFinalStatus ? "Etapa final" : `Avançar para ${nextStatus}`}</button> : null}</div></div>
          <div className={styles.detailTabs}>{[
            { label: "Resumo", count: 0 },
            { label: config.operationPlural, count: selectedOperations.length },
            { label: config.resourcePlural, count: selectedResources.length + selected.attachments.length },
            { label: "Histórico", count: selected.history.length },
          ].map((tab) => <button key={tab.label} className={detailTab === tab.label ? styles.tabActive : ""} onClick={() => setDetailTab(tab.label)}>{tab.label}{tab.count ? <span className={vertical.tabCount}>{tab.count}</span> : null}</button>)}</div>
          <div className={vertical.detailCanvas}>
            {detailTab === "Resumo" ? <>
              {selected.archived ? <div className={vertical.archiveNotice}>Este registro está arquivado. Restaure para voltar a editar.</div> : null}
              <section className={`${vertical.dataCard} ${vertical.focusCard}`}><div className={vertical.focusHeader}><div><span>{linearFlow ? "Fluxo atual" : "Situação atual"}</span><strong>{selected.status}</strong></div><StatusPill status={selected.status} /></div><div className={vertical.focusGrid}><div><span>{linearFlow ? "Próxima etapa" : "Controle de situação"}</span><strong>{selected.archived ? "Restaurar registro" : linearFlow ? isFinalStatus ? "Fluxo concluído" : nextStatus : "Altere a situação nos dados principais"}</strong></div><div><span>{config.operationPlural}</span><strong>{selectedOperations.length}</strong></div><div><span>{config.resourcePlural}</span><strong>{selectedResources.length}</strong></div><div><span>Atenções</span><strong>{attentionResources}</strong></div></div></section>
              <section className={vertical.dataCard}><div className={styles.sectionHeading}><div><h3>Dados principais</h3><p>Informações específicas deste {config.entityLabel.toLowerCase()}.</p></div></div><fieldset className={vertical.editFieldset} disabled={selected.archived}>
                <label>Título<input value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} /></label>
                <label>Descrição curta<input value={selected.subtitle} onChange={(event) => updateSelected({ subtitle: event.target.value })} /></label>
                <label>Situação<select value={selected.status} onChange={(event) => updateSelected({ status: event.target.value }, `Situação alterada para ${event.target.value}`)}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label>Responsável<input value={selected.owner} onChange={(event) => updateSelected({ owner: event.target.value })} /></label>
                {config.fields.map((field) => <label key={field.key} className={field.wide ? vertical.fullField : ""}>{field.label}{renderField(field, selected.data[field.key] ?? "", (value) => updateSelected({ data: { ...selected.data, [field.key]: value } }))}</label>)}
              </fieldset></section>
              <section className={vertical.dataCard}><div className={styles.sectionHeading}><div><h3>Ações do registro</h3><p>Organize sem excluir o histórico.</p></div></div><div className={vertical.inlineActions}>{allowDuplicate ? <button className={styles.secondaryButton} onClick={duplicateSelected}><Icon name="plus" /> Duplicar</button> : null}<button className={styles.secondaryButton} onClick={exportRecords}><Icon name="download" /> Exportar lista</button><button className={selected.archived ? styles.primaryButton : styles.dangerButton} onClick={() => updateSelected({ archived: !selected.archived }, selected.archived ? "Registro restaurado" : "Registro arquivado")}>{selected.archived ? "Restaurar registro" : "Arquivar registro"}</button></div></section>
            </> : null}

            {detailTab === config.operationPlural ? <section className={vertical.dataCard}><div className={styles.sectionHeading}><div><h3>{config.operationPlural}</h3><p>Atividades e movimentações vinculadas ao registro selecionado.</p></div><button onClick={() => setModal("operation")}><Icon name="plus" /> Adicionar</button></div><div className={vertical.operationList}>{selectedOperations.map((item) => <div className={vertical.operationRow} key={item.id}><div><strong>{item.title}</strong><p>{item.description || "Sem observação"}</p><small>{item.date || "Sem data"}</small></div><div className={vertical.operationActions}><select value={item.status} onChange={(event) => changeOperationStatus(item, event.target.value)}>{config.operationStatuses.map((status) => <option key={status}>{status}</option>)}</select><button className={styles.iconButton} aria-label={`Remover ${item.title}`} onClick={() => removeOperation(item)}><Icon name="trash" /></button></div></div>)}{!selectedOperations.length ? <div className={vertical.emptyCompact}>Nenhum {config.operationLabel.toLowerCase()} vinculado.</div> : null}</div></section> : null}

            {detailTab === config.resourcePlural ? <section className={vertical.dataCard}><div className={styles.sectionHeading}><div><h3>{config.resourcePlural}</h3><p>Documentos, referências e cadastros vinculados.</p></div><button onClick={() => setModal("resource")}><Icon name="plus" /> Vincular</button></div><div className={vertical.resourceList}>{selectedResources.map((item) => <div className={vertical.resourceRow} key={item.id}><div><strong>{item.title}</strong><p>{item.category || "Sem categoria"} · {item.reference || "Sem referência"}</p><small>{item.due ? `Data: ${item.due}` : "Sem data definida"}</small></div><div className={vertical.operationActions}><select value={item.status} onChange={(event) => changeResourceStatus(item, event.target.value)}>{config.resourceStatuses.map((status) => <option key={status}>{status}</option>)}</select><button className={styles.iconButton} aria-label={`Remover ${item.title}`} onClick={() => removeResource(item)}><Icon name="trash" /></button></div></div>)}{!selectedResources.length ? <div className={vertical.emptyCompact}>Nenhum {config.resourceLabel.toLowerCase()} vinculado.</div> : null}</div><div style={{ marginTop: 12 }}><label className={styles.secondaryButton}><Icon name="image" /> Anexar arquivo<input hidden type="file" onChange={addAttachment} /></label></div>{selected.attachments.length ? <div className={vertical.resourceList} style={{ marginTop: 10 }}>{selected.attachments.map((file) => <div className={vertical.resourceRow} key={file.id}><div><strong>{file.name}</strong><p>Arquivo anexado ao registro</p></div><div className={vertical.operationActions}><a className={vertical.fileAction} href={file.data} download={file.name}><Icon name="download" /> Baixar</a><button className={styles.iconButton} aria-label={`Remover ${file.name}`} onClick={() => { if (window.confirm(`Remover “${file.name}”?`)) updateSelected({ attachments: selected.attachments.filter((item) => item.id !== file.id) }, `Arquivo removido: ${file.name}`); }}><Icon name="trash" /></button></div></div>)}</div> : null}</section> : null}

            {detailTab === "Histórico" ? <><section className={vertical.dataCard}><div className={styles.sectionHeading}><div><h3>Histórico de alterações</h3><p>Registros preservados em ordem cronológica.</p></div></div><Timeline items={selected.history} /></section><section className={vertical.dataCard}><div className={vertical.noteComposer}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registrar comentário interno ou decisão" /><button className={styles.primaryButton} onClick={addNote}>Adicionar comentário</button></div></section></> : null}
          </div>
        </section> : <EmptyState icon={config.icon} title={`Nenhum ${config.entityLabel.toLowerCase()} selecionado`} description="Crie ou escolha um registro para continuar." />}
      </div>
    </> : null}

    {active === config.operationPlural ? <ListingPage title={config.operationPlural} description={`Acompanhe todos os registros de ${config.operationLabel.toLowerCase()}.`} columns={[config.operationLabel, config.entityLabel, "Situação", "Data"]} rows={related.map((item) => [item.title, records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", item.status, item.date || "Sem data"])} onRow={(index) => { const item = related[index]; if (item) { setSelectedId(item.parentId); setActive(config.entityPlural); setDetailTab(config.operationPlural); } }} /> : null}
    {active === config.resourcePlural ? <ListingPage title={config.resourcePlural} description={`Consulte todos os cadastros de ${config.resourceLabel.toLowerCase()}.`} columns={[config.resourceLabel, "Vínculo", "Situação", "Data"]} rows={resources.map((item) => [item.title, records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", item.status, item.due || "Sem data"])} onRow={(index) => { const item = resources[index]; if (item) { setSelectedId(item.parentId); setActive(config.entityPlural); setDetailTab(config.resourcePlural); } }} /> : null}
    {active === "Arquivados" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Histórico preservado</span><h2>Registros arquivados</h2><p>Itens retirados da rotina sem exclusão definitiva.</p></div></div><div className={styles.directoryRows}>{records.filter((record) => record.archived).map((record) => <button key={record.id} onClick={() => { setSelectedId(record.id); setActive(config.entityPlural); setDetailTab("Resumo"); }}><span className={styles.companyAvatar}><Icon name={config.icon} /></span><div><strong>{record.title}</strong><small>{record.subtitle} · {record.id}</small></div><StatusPill status={record.status} /></button>)}{!records.some((record) => record.archived) ? <EmptyState icon="history" title="Nenhum registro arquivado" description="Os registros arquivados continuarão disponíveis aqui." /> : null}</div></section> : null}

    <Modal open={modal === "record"} title={config.primaryAction} description={`Cadastre os dados necessários para iniciar o registro de ${config.entityLabel.toLowerCase()}.`} onClose={() => setModal(null)} wide><Form onSubmit={createRecord}><div className={styles.formGrid}><Field label="Título"><input required value={recordDraft.title ?? ""} onChange={(event) => setRecordDraft((current) => ({ ...current, title: event.target.value }))} /></Field><Field label="Descrição curta"><input value={recordDraft.subtitle ?? ""} onChange={(event) => setRecordDraft((current) => ({ ...current, subtitle: event.target.value }))} /></Field><Field label="Responsável"><input value={recordDraft.owner ?? ""} onChange={(event) => setRecordDraft((current) => ({ ...current, owner: event.target.value }))} /></Field>{config.fields.map((field) => <Field key={field.key} label={field.label}>{renderField(field, recordDraft[field.key] ?? "", (value) => setRecordDraft((current) => ({ ...current, [field.key]: value })))}</Field>)}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar {config.entityLabel.toLowerCase()}</button></div></Form></Modal>
    <Modal open={modal === "operation"} title={`Novo ${config.operationLabel.toLowerCase()}`} description={selected ? `Vinculado a ${selected.title}` : "Selecione um registro"} onClose={() => setModal(null)}><Form onSubmit={createOperation}><Field label="Título"><input required value={operationDraft.title} onChange={(event) => setOperationDraft((current) => ({ ...current, title: event.target.value }))} /></Field><Field label="Descrição"><textarea value={operationDraft.description} onChange={(event) => setOperationDraft((current) => ({ ...current, description: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Data"><input type="date" value={operationDraft.date} onChange={(event) => setOperationDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Situação"><select value={operationDraft.status} onChange={(event) => setOperationDraft((current) => ({ ...current, status: event.target.value }))}>{config.operationStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Registrar</button></div></Form></Modal>
    <Modal open={modal === "resource"} title={`Vincular ${config.resourceLabel.toLowerCase()}`} description={selected ? `Vinculado a ${selected.title}` : "Selecione um registro"} onClose={() => setModal(null)}><Form onSubmit={createResource}><Field label="Nome ou identificação"><input required value={resourceDraft.title} onChange={(event) => setResourceDraft((current) => ({ ...current, title: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Categoria"><input value={resourceDraft.category} onChange={(event) => setResourceDraft((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Referência"><input value={resourceDraft.reference} onChange={(event) => setResourceDraft((current) => ({ ...current, reference: event.target.value }))} /></Field><Field label="Data ou validade"><input type="date" value={resourceDraft.due} onChange={(event) => setResourceDraft((current) => ({ ...current, due: event.target.value }))} /></Field><Field label="Situação"><select value={resourceDraft.status} onChange={(event) => setResourceDraft((current) => ({ ...current, status: event.target.value }))}>{config.resourceStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Vincular</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function renderField(field: FieldDefinition, value: string, onChange: (value: string) => void) {
  if (field.type === "textarea") return <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
  if (field.type === "select") return <select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Selecione</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>;
  return <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
}

function ListingPage({ title, description, columns, rows, onRow }: { title: string; description: string; columns: string[]; rows: string[][]; onRow: (index: number) => void }) {
  const [query, setQuery] = useState("");
  const indexedRows = rows.map((row, index) => ({ row, index }));
  const filtered = indexedRows.filter(({ row }) => row.join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Visão consolidada</span><h2>{title}</h2><p>{description}</p></div></div><div className={styles.directoryToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${title.toLowerCase()}`} /></label></div><div className={vertical.primaryTable}><div className={vertical.tableHeader}>{columns.map((column) => <span key={column}>{column}</span>)}<span /></div>{filtered.map(({ row, index }) => <button key={`${row[0]}-${index}`} className={vertical.tableRow} onClick={() => onRow(index)}>{row.map((cell, cellIndex) => cellIndex === 0 ? <strong key={`${cell}-${cellIndex}`}>{cell}</strong> : <span key={`${cell}-${cellIndex}`}>{cell}</span>)}<Icon name="chevron" /></button>)}</div>{!filtered.length ? <EmptyState icon="search" title="Nenhum registro encontrado" description={rows.length ? "Altere a busca para encontrar outros itens." : "Os itens criados aparecerão nesta visão."} /> : null}</section>;
}
