from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Trecho não encontrado: {label}")
    return text.replace(old, new, 1)


path = Path("components/workspaces/phase-four/VerticalBusinessApp.tsx")
text = path.read_text(encoding="utf-8")

if 'type RecordScope = "Em andamento" | "Finalizados" | "Arquivados";' not in text:
    text = replace_once(text, 'type RecordScope = "Ativos" | "Arquivados";', 'type RecordScope = "Em andamento" | "Finalizados" | "Arquivados";', "escopos principais")
    text = replace_once(text, 'const [scope, setScope] = useState<RecordScope>("Ativos");', 'const [scope, setScope] = useState<RecordScope>("Em andamento");', "escopo inicial")
    text = replace_once(text, '  const [statusFilter, setStatusFilter] = useState("Todos");\n', '  const [statusFilter, setStatusFilter] = useState("Todos");\n  const [recordSort, setRecordSort] = useState<"Mais recentes" | "Nome" | "Responsável" | "Etapa">("Mais recentes");\n', "ordenação principal")

    old_visible = '''  const visibleRecords = useMemo(() => {
    const value = query.trim().toLowerCase();
    const archived = scope === "Arquivados";
    return records.filter((record) => record.archived === archived && (statusFilter === "Todos" || record.status === statusFilter) && (!value || `${record.title} ${record.subtitle} ${record.owner} ${Object.values(record.data).join(" ")}`.toLowerCase().includes(value)));
  }, [query, records, scope, statusFilter]);
'''
    new_visible = '''  const finalStatus = config.statuses.at(-1) ?? "";
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
'''
    text = replace_once(text, old_visible, new_visible, "lista principal")
    text = replace_once(text, '  const finalStatus = config.statuses.at(-1) ?? "";\n  const currentStatusIndex', '  const currentStatusIndex', "finalStatus duplicado")
    text = replace_once(text, '  const archivedCount = records.filter((record) => record.archived).length;\n', '  const archivedCount = records.filter((record) => record.archived).length;\n  const finalizedCount = records.filter((record) => !record.archived && record.status === finalStatus).length;\n  const openCount = records.filter((record) => !record.archived && record.status !== finalStatus).length;\n', "contadores de escopo")
    text = text.replace('setScope("Ativos");', 'setScope("Em andamento");')
    text = text.replace('setScope(willArchive ? "Arquivados" : "Ativos");', 'setScope(willArchive ? "Arquivados" : "Em andamento");')

    old_controls = '''          <select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setSelectedId(""); }} aria-label="Filtrar por situação"><option value="Todos">Todas as situações</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <div className={vertical.scopeSwitch} aria-label="Tipo de registro"><button type="button" className={scope === "Ativos" ? vertical.scopeActive : ""} onClick={() => { setScope("Ativos"); setSelectedId(""); }}>Ativos</button><button type="button" className={scope === "Arquivados" ? vertical.scopeActive : ""} onClick={() => { setScope("Arquivados"); setSelectedId(""); }}>Arquivados{archivedCount ? ` (${archivedCount})` : ""}</button></div>
'''
    new_controls = '''          <select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setSelectedId(""); }} aria-label="Filtrar por situação"><option value="Todos">Todas as situações</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <select className={styles.compactSelect} value={recordSort} onChange={(event) => setRecordSort(event.target.value as typeof recordSort)} aria-label="Classificar registros"><option>Mais recentes</option><option>Nome</option><option>Responsável</option><option>Etapa</option></select>
          <div className={vertical.scopeSwitch} aria-label="Andamento dos registros"><button type="button" className={scope === "Em andamento" ? vertical.scopeActive : ""} onClick={() => { setScope("Em andamento"); setStatusFilter("Todos"); setSelectedId(""); }}>Em andamento ({openCount})</button><button type="button" className={scope === "Finalizados" ? vertical.scopeActive : ""} onClick={() => { setScope("Finalizados"); setStatusFilter("Todos"); setSelectedId(""); }}>Finalizados ({finalizedCount})</button><button type="button" className={scope === "Arquivados" ? vertical.scopeActive : ""} onClick={() => { setScope("Arquivados"); setStatusFilter("Todos"); setSelectedId(""); }}>Arquivados{archivedCount ? ` (${archivedCount})` : ""}</button></div>
'''
    text = replace_once(text, old_controls, new_controls, "controles principais")
    text = text.replace('icon={scope === "Arquivados" ? "history" : "search"}', 'icon={scope === "Arquivados" || scope === "Finalizados" ? "history" : "search"}')
    text = text.replace('title={scope === "Arquivados" ? "Nenhum registro arquivado" : `Nenhum ${config.entityLabel.toLowerCase()} encontrado`}', 'title={scope === "Arquivados" ? "Nenhum registro arquivado" : scope === "Finalizados" ? "Nenhum processo finalizado" : `Nenhum ${config.entityLabel.toLowerCase()} encontrado`}')
    text = text.replace('action={scope === "Ativos" && !query && statusFilter === "Todos"', 'action={scope === "Em andamento" && !query && statusFilter === "Todos"')

    old_operation = '''{active === config.operationPlural ? <ListingPage title={config.operationPlural} description={`${config.operationLabel}s de todos os registros.`} icon="activity" items={related.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.date || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent); } }} /> : null}'''
    new_operation = '''{active === config.operationPlural ? <ListingPage title={config.operationPlural} description={`${config.operationLabel}s de todos os registros.`} icon="activity" statuses={config.operationStatuses} finalStatus={config.operationStatuses.at(-1) ?? ""} items={related.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.date || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent); } }} /> : null}'''
    text = replace_once(text, old_operation, new_operation, "listagem de operações")

    old_resource = '''{active === config.resourcePlural ? <ListingPage title={config.resourcePlural} description={`${config.resourceLabel}s de todos os registros.`} icon={resourceIcon(config.slug)} items={resources.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.due || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent); } }} /> : null}'''
    new_resource = '''{active === config.resourcePlural ? <ListingPage title={config.resourcePlural} description={`${config.resourceLabel}s de todos os registros.`} icon={resourceIcon(config.slug)} statuses={config.resourceStatuses} finalStatus={config.resourceStatuses.at(-1) ?? ""} items={resources.map((item) => ({ id: item.id, title: item.title, subtitle: records.find((record) => record.id === item.parentId)?.title ?? "Sem vínculo", status: item.status, date: item.due || "Sem data", parentId: item.parentId }))} onRow={(item) => { const parent = records.find((record) => record.id === item.parentId); if (parent) { setActive(config.entityPlural); openRecord(parent); } }} /> : null}'''
    text = replace_once(text, old_resource, new_resource, "listagem de recursos")

    old_listing = '''function ListingPage({ title, description, icon, items, onRow }: { title: string; description: string; icon: IconName; items: ListingItem[]; onRow: (item: ListingItem) => void }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => `${item.title} ${item.subtitle} ${item.status} ${item.date}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className={vertical.listSurface}><div className={vertical.consolidatedHeader}><div><h2>{title}</h2><p>{description}</p></div><strong>{filtered.length}</strong></div><div className={vertical.listControls}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${title.toLowerCase()}`} /></label></div><div className={vertical.entityList}>{filtered.map((item) => <button key={item.id} type="button" className={vertical.entityRow} onClick={() => onRow(item)}><span className={vertical.entityIcon}><Icon name={icon} /></span><div className={vertical.entityMain}><strong>{item.title}</strong><p>{item.subtitle}</p><small>{item.date}</small></div><div className={vertical.entityMeta}><StatusPill status={item.status} /></div><Icon name="chevron" /></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhum registro encontrado" description={items.length ? "Altere a busca." : "Os registros aparecerão aqui quando forem criados."} /> : null}</div></section>;
}'''
    new_listing = '''function ListingPage({ title, description, icon, items, statuses, finalStatus, onRow }: { title: string; description: string; icon: IconName; items: ListingItem[]; statuses: string[]; finalStatus: string; onRow: (item: ListingItem) => void }) {
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
}'''
    text = replace_once(text, old_listing, new_listing, "componente de listagem")

    path.write_text(text, encoding="utf-8")

css = Path("app/list-navigation.css")
css.write_text('''/* Controles de listas e históricos em todos os aplicativos */
body[data-crmplus-app="true"] [class*="listToolbar"],
body[data-crmplus-app="true"] [class*="listControls"] {
  flex-wrap: wrap;
}

body[data-crmplus-app="true"] [class*="listToolbar"] > select,
body[data-crmplus-app="true"] [class*="listControls"] > select {
  min-height: 40px;
}

body[data-crmplus-app="true"] [class*="scopeSwitch"] {
  max-width: 100%;
  overflow-x: auto;
}

@media (max-width: 760px) {
  body[data-crmplus-app="true"] [class*="listToolbar"] > label,
  body[data-crmplus-app="true"] [class*="listControls"] > label {
    flex-basis: 100%;
  }

  body[data-crmplus-app="true"] [class*="listToolbar"] > select,
  body[data-crmplus-app="true"] [class*="listControls"] > select {
    flex: 1 1 140px;
    min-width: 0;
  }
}
''', encoding="utf-8")

layout = Path("app/layout.tsx")
layout_text = layout.read_text(encoding="utf-8")
if 'import "./list-navigation.css";' not in layout_text:
    layout_text = layout_text.replace('import "./dark-mode.css";\n', 'import "./dark-mode.css";\nimport "./list-navigation.css";\n')
    layout.write_text(layout_text, encoding="utf-8")
