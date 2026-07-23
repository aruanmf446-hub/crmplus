from pathlib import Path

changes = 0

hercules = Path("components/workspaces/phase-four/HerculesApp.tsx")
text = hercules.read_text(encoding="utf-8")
old_type = 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation: string; evidence: string[] };'
new_type = 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation?: string; evidence: string[] };'
old_guard = 'if (next === "Encerrado" && !deviation.validation.trim())'
new_guard = 'if (next === "Encerrado" && !(deviation.validation ?? "").trim())'
if old_type in text:
    text = text.replace(old_type, new_type, 1)
    changes += 1
if old_guard in text:
    text = text.replace(old_guard, new_guard, 1)
    changes += 1
hercules.write_text(text, encoding="utf-8")

vertical = Path("components/workspaces/phase-four/VerticalBusinessApp.tsx")
text = vertical.read_text(encoding="utf-8")
old_transition = '''    if (isFinalRecord(selected)) return [];
    const configured = config.transitions?.[selected.status];
    if (configured) return configured.filter((status) => config.statuses.includes(status));
'''
new_transition = '''    const configured = config.transitions?.[selected.status];
    if (configured) return configured.filter((status) => config.statuses.includes(status));
    if (isFinalRecord(selected)) return [];
'''
if old_transition in text:
    text = text.replace(old_transition, new_transition, 1)
    changes += 1
elif new_transition not in text:
    raise RuntimeError("Fluxo de reativação vertical não reconhecido")
vertical.write_text(text, encoding="utf-8")

zeus = Path("components/workspaces/phase-four/ZeusApp.tsx")
text = zeus.read_text(encoding="utf-8")
old_state = '  const [maintenanceDraft, setMaintenanceDraft] = useState({ type: "Revisão preventiva", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "", verified: false });'
new_state = '  const [maintenanceDraft, setMaintenanceDraft] = useState({ type: "", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "", verified: false, nextDate: "" });'
if old_state in text:
    text = text.replace(old_state, new_state, 1)
    changes += 1
elif new_state not in text:
    raise RuntimeError("Estado de manutenção do Zeus não reconhecido")
old_function = '''  function addMaintenance() {
    if (!selected || !maintenanceDraft.type.trim() || !maintenanceDraft.date) { setToast("Informe serviço e data"); return; }
    const odometer = Math.max(selected.odometer, Number(maintenanceDraft.odometer) || selected.odometer);
    const record: MaintenanceRecord = { id: uid("MAN"), type: maintenanceDraft.type.trim(), date: maintenanceDraft.date, odometer, cost: Math.max(0, Number(maintenanceDraft.cost.replace(",", ".")) || 0), note: maintenanceDraft.note.trim(), verified: maintenanceDraft.verified };
    updateSelected({ maintenance: [record, ...selected.maintenance], odometer, nextMaintenanceKm: odometer + 10000 }, `Manutenção registrada: ${record.type}`);
    setModal(null); setToast(selected.status === "Manutenção" ? "Manutenção registrada; a liberação ainda exige confirmação" : "Manutenção registrada");
  }
'''
new_function = '''  function openMaintenance() {
    if (!selected) return;
    setMaintenanceDraft({ type: "", date: new Date().toISOString().slice(0, 10), odometer: String(selected.odometer), cost: "", note: "", verified: false, nextDate: "" });
    setModal("maintenance");
  }

  function addMaintenance() {
    if (!selected || !maintenanceDraft.type.trim() || !maintenanceDraft.date) { setToast("Informe serviço e data"); return; }
    if (maintenanceDraft.verified && !maintenanceDraft.note.trim()) { setToast("Descreva o serviço e a conferência antes de marcar como concluído"); return; }
    const odometer = Math.max(selected.odometer, Number(maintenanceDraft.odometer) || selected.odometer);
    const record: MaintenanceRecord = { id: uid("MAN"), type: maintenanceDraft.type.trim(), date: maintenanceDraft.date, odometer, cost: Math.max(0, Number(maintenanceDraft.cost.replace(",", ".")) || 0), note: maintenanceDraft.note.trim(), verified: maintenanceDraft.verified };
    updateSelected({ maintenance: [record, ...selected.maintenance], odometer, nextMaintenanceKm: odometer + 10000, nextMaintenanceDate: maintenanceDraft.nextDate }, `Manutenção registrada: ${record.type}`);
    setMaintenanceDraft({ type: "", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "", verified: false, nextDate: "" });
    setModal(null); setToast(selected.status === "Manutenção" ? "Manutenção registrada; a liberação ainda exige confirmação" : "Manutenção registrada");
  }
'''
if old_function in text:
    text = text.replace(old_function, new_function, 1)
    changes += 1
elif new_function not in text:
    raise RuntimeError("Função de manutenção do Zeus não reconhecida")
old_button = '<button className={styles.primaryButton} onClick={() => setModal("maintenance")}>Registrar manutenção</button>'
new_button = '<button className={styles.primaryButton} onClick={openMaintenance}>Registrar manutenção</button>'
if old_button in text:
    text = text.replace(old_button, new_button, 1)
    changes += 1
old_modal = '<Field label="Conferência e observação"><textarea value={maintenanceDraft.note} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Registre o serviço executado e o resultado da conferência" /></Field><label className={styles.toggleRow}>'
new_modal = '<Field label="Próxima manutenção por data" hint="Opcional; deixe vazio quando o controle for somente por quilometragem"><input type="date" value={maintenanceDraft.nextDate} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, nextDate: event.target.value }))} /></Field><Field label="Conferência e observação"><textarea value={maintenanceDraft.note} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Registre o serviço executado e o resultado da conferência" /></Field><label className={styles.toggleRow}>'
if old_modal in text:
    text = text.replace(old_modal, new_modal, 1)
    changes += 1
elif new_modal not in text:
    raise RuntimeError("Modal de manutenção do Zeus não reconhecido")
zeus.write_text(text, encoding="utf-8")

print(f"Correções complementares aplicadas: {changes}.")
