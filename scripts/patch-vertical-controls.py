from pathlib import Path

path = Path("components/workspaces/phase-four/VerticalBusinessApp.tsx")
text = path.read_text(encoding="utf-8")
old = '''          <select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setSelectedId(""); }} aria-label="Filtrar por situação"><option value="Todos">Todas as situações</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <div className={vertical.scopeSwitch} aria-label="Tipo de registro"><button type="button" className={scope === "Em andamento" ? vertical.scopeActive : ""} onClick={() => { setScope("Em andamento"); setSelectedId(""); }}>Ativos</button><button type="button" className={scope === "Arquivados" ? vertical.scopeActive : ""} onClick={() => { setScope("Arquivados"); setSelectedId(""); }}>Arquivados{archivedCount ? ` (${archivedCount})` : ""}</button></div>
'''
new = '''          <select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setSelectedId(""); }} aria-label="Filtrar por situação"><option value="Todos">Todas as situações</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <select className={styles.compactSelect} value={recordSort} onChange={(event) => setRecordSort(event.target.value as typeof recordSort)} aria-label="Classificar registros"><option>Mais recentes</option><option>Nome</option><option>Responsável</option><option>Etapa</option></select>
          <div className={vertical.scopeSwitch} aria-label="Andamento dos registros"><button type="button" className={scope === "Em andamento" ? vertical.scopeActive : ""} onClick={() => { setScope("Em andamento"); setStatusFilter("Todos"); setSelectedId(""); }}>Em andamento ({openCount})</button><button type="button" className={scope === "Finalizados" ? vertical.scopeActive : ""} onClick={() => { setScope("Finalizados"); setStatusFilter("Todos"); setSelectedId(""); }}>Finalizados ({finalizedCount})</button><button type="button" className={scope === "Arquivados" ? vertical.scopeActive : ""} onClick={() => { setScope("Arquivados"); setStatusFilter("Todos"); setSelectedId(""); }}>Arquivados{archivedCount ? ` (${archivedCount})` : ""}</button></div>
'''
if old not in text:
    raise RuntimeError("Controles antigos não encontrados")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
