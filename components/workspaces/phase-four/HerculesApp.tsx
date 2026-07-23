"use client";

import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";
import { fileToDataUrl, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type Result = "Conforme" | "Não conforme" | "Não se aplica";
type CheckItem = { id: string; label: string; helper: string; result?: Result; note: string; evidence: string[] };
type InspectionStatus = "Em execução" | "Concluída" | "Programada";
type Inspection = { id: string; title: string; location: string; responsible: string; scheduledAt: string; status: InspectionStatus; items: CheckItem[]; completedAt?: string };
type DeviationStatus = "Aberto" | "Em correção" | "Validar" | "Encerrado";
type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; evidence: string[] };
type ModelItem = { id: string; label: string; helper: string };
type ChecklistModel = { id: string; name: string; items: Array<{ label: string; helper: string }> };
type DeviationDraft = { id: string; description: string; priority: Deviation["priority"]; responsible: string; due: string; action: string };
type ConfirmAction = { kind: "start" | "finish" | "deviation"; title: string; from: string; to: string; consequence: string; inspectionId?: string; deviationId?: string };

const baseItems = [
  { label: "Condição geral da área", helper: "Verifique limpeza, organização e acesso." },
  { label: "Proteções e dispositivos de segurança", helper: "Confirme presença, fixação e funcionamento." },
  { label: "Cabos, conexões e alimentação", helper: "Procure desgaste, exposição ou aquecimento." },
  { label: "Sinalização e identificação", helper: "Confira placas, etiquetas e legibilidade." },
  { label: "Teste operacional", helper: "Realize o teste conforme o procedimento definido." },
];
const initialModels: ChecklistModel[] = [
  { id: "MOD-SEG", name: "Segurança da oficina", items: baseItems },
  { id: "MOD-VEI", name: "Inspeção de veículo", items: [{ label: "Documentação e identificação", helper: "Confira placa, chassi e documentos." }, { label: "Condição externa", helper: "Registre avarias e fotos de entrada." }, { label: "Teste funcional", helper: "Verifique itens acordados com o cliente." }] },
];
function createItems(model: ChecklistModel): CheckItem[] { return model.items.map((item) => ({ id: uid("CHK"), ...item, note: "", evidence: [] })); }
const initialInspection: Inspection = { id: "INS-2048", title: "Inspeção de segurança", location: "Oficina principal · Área de serviço", responsible: "Paulo", scheduledAt: "Hoje, 14:00", status: "Em execução", items: createItems(initialModels[0]) };
const initialScheduled: Inspection[] = [
  { id: "INS-2050", title: "Inspeção de veículo", location: "Veículo TCJ9I23", responsible: "Paulo", scheduledAt: "Hoje, 16:00", status: "Programada", items: createItems(initialModels[1]) },
  { id: "INS-2051", title: "Inspeção de segurança", location: "Área de lavagem", responsible: "Marcos", scheduledAt: "Amanhã, 08:00", status: "Programada", items: createItems(initialModels[0]) },
];

export function HerculesApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Executar inspeção");
  const [inspections, setInspections] = useLocalState<Inspection[]>("crmplus.hercules.inspections", [initialInspection, ...initialScheduled]);
  const [deviations, setDeviations] = useLocalState<Deviation[]>("crmplus.hercules.deviations", []);
  const [models, setModels] = useLocalState<ChecklistModel[]>("crmplus.hercules.models", initialModels);
  const [currentInspectionId, setCurrentInspectionId] = useState("");
  const [currentItemId, setCurrentItemId] = useState("");
  const [modal, setModal] = useState<"schedule" | "deviation" | "editDeviation" | "model" | "instruction" | "confirm" | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [toast, setToast] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({ title: initialModels[0].name, location: "", responsible: "", scheduledAt: "" });
  const [deviationDraft, setDeviationDraft] = useState<DeviationDraft>({ id: "", description: "", priority: "Alta", responsible: "", due: "", action: "" });
  const [modelDraft, setModelDraft] = useState<{ id: string; name: string; items: ModelItem[] }>({ id: "", name: "", items: [{ id: uid("MDI"), label: "", helper: "" }] });

  const inspection = inspections.find((item) => item.id === currentInspectionId);
  const currentItem = inspection?.items.find((item) => item.id === currentItemId);
  const nav: NavItem[] = [{ label: "Executar inspeção", icon: "check" }, { label: "Programadas", icon: "calendar" }, { label: "Desvios", icon: "warning" }, { label: "Modelos", icon: "clipboard" }];
  const readOnly = inspection?.status === "Concluída";
  const isLastItem = Boolean(inspection && currentItem && inspection.items.at(-1)?.id === currentItem.id);

  function changeArea(value: string) { setActive(value); setCurrentInspectionId(""); setCurrentItemId(""); }
  function updateInspection(id: string, updater: (inspection: Inspection) => Inspection) { setInspections((current) => current.map((item) => item.id === id ? updater(item) : item)); }
  function updateItem(patch: Partial<CheckItem>) {
    if (!inspection || !currentItem || readOnly) return;
    updateInspection(inspection.id, (current) => ({ ...current, items: current.items.map((item) => item.id === currentItem.id ? { ...item, ...patch } : item) }));
  }

  function selectInspection(item: Inspection) {
    if (!item.items.length) { setToast("Esta inspeção não possui itens"); return; }
    setCurrentInspectionId(item.id); setCurrentItemId(item.items.find((entry) => !entry.result)?.id ?? item.items[0].id); setActive("Executar inspeção");
  }

  function requestStart(item: Inspection) {
    if (!item.responsible.trim() || item.responsible === "Não atribuído") { setToast("Defina o responsável antes de iniciar"); return; }
    setConfirmAction({ kind: "start", inspectionId: item.id, title: "Confirmar início da inspeção", from: "Programada", to: "Em execução", consequence: "A inspeção ficará ativa e os itens passarão a exigir resposta sequencial." }); setModal("confirm");
  }

  function answer(result: Result) {
    if (!currentItem || !inspection || readOnly) return;
    updateItem({ result });
    if (result === "Não conforme") {
      const existing = deviations.find((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === currentItem.id && deviation.status !== "Encerrado");
      if (!existing) { setDeviationDraft({ id: "", description: currentItem.label, priority: "Alta", responsible: inspection.responsible, due: "", action: currentItem.note }); setModal("deviation"); }
    }
  }

  function goNext() {
    if (!inspection || !currentItem) return;
    if (!currentItem.result) { setToast("Responda o item atual antes de continuar"); return; }
    if (currentItem.result === "Não conforme" && !deviations.some((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === currentItem.id)) { setToast("Crie o desvio deste item antes de continuar"); return; }
    const index = inspection.items.findIndex((item) => item.id === currentItem.id);
    const next = inspection.items[index + 1];
    if (next) setCurrentItemId(next.id); else requestFinishInspection();
  }

  async function addEvidence(event: ChangeEvent<HTMLInputElement>) {
    if (!currentItem || !event.target.files?.length || readOnly) return;
    const files = Array.from(event.target.files).slice(0, 3);
    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha imagens menores, com até 700 KB cada"); event.target.value = ""; return; }
    const urls = await Promise.all(files.map(fileToDataUrl)); updateItem({ evidence: [...currentItem.evidence, ...urls] }); setToast("Evidências adicionadas"); event.target.value = "";
  }

  function validateDeviationDraft() {
    if (!deviationDraft.description.trim()) { setToast("Informe a descrição do desvio"); return false; }
    if (!deviationDraft.responsible.trim()) { setToast("Defina o responsável pela correção"); return false; }
    if (!deviationDraft.due) { setToast("Defina o prazo da correção"); return false; }
    return true;
  }

  function createDeviation() {
    if (!currentItem || !inspection || !validateDeviationDraft()) return;
    const deviation: Deviation = { id: uid("NC"), inspectionId: inspection.id, itemId: currentItem.id, description: deviationDraft.description.trim(), priority: deviationDraft.priority, responsible: deviationDraft.responsible.trim(), due: deviationDraft.due, status: "Aberto", action: deviationDraft.action.trim(), evidence: currentItem.evidence };
    setDeviations((current) => [deviation, ...current]); setModal(null); setToast("Desvio criado na etapa Aberto");
  }

  function openDeviation(deviation: Deviation) { setDeviationDraft({ id: deviation.id, description: deviation.description, priority: deviation.priority, responsible: deviation.responsible, due: deviation.due, action: deviation.action }); setModal("editDeviation"); }
  function saveDeviation() { if (!deviationDraft.id || !validateDeviationDraft()) return; setDeviations((current) => current.map((item) => item.id === deviationDraft.id ? { ...item, description: deviationDraft.description.trim(), priority: deviationDraft.priority, responsible: deviationDraft.responsible.trim(), due: deviationDraft.due, action: deviationDraft.action.trim() } : item)); setModal(null); setToast("Desvio atualizado"); }

  function requestDeviationAdvance(deviation: Deviation) {
    const flow: DeviationStatus[] = ["Aberto", "Em correção", "Validar", "Encerrado"];
    const index = flow.indexOf(deviation.status); const next = flow[index + 1];
    if (!next) return;
    if ((next === "Validar" || next === "Encerrado") && !deviation.action.trim()) { openDeviation(deviation); setToast("Registre a ação corretiva antes de avançar"); return; }
    setConfirmAction({ kind: "deviation", deviationId: deviation.id, title: "Confirmar etapa do desvio", from: deviation.status, to: next, consequence: next === "Em correção" ? "O responsável assumirá a execução da ação corretiva." : next === "Validar" ? "A correção ficará aguardando verificação antes do encerramento." : "O desvio será encerrado como verificado." }); setModal("confirm");
  }

  function requestFinishInspection() {
    if (!inspection) return;
    const pending = inspection.items.filter((item) => !item.result).length;
    if (pending) { setToast(`Ainda existem ${pending} item(ns) pendente(s)`); return; }
    const missingDeviation = inspection.items.some((item) => item.result === "Não conforme" && !deviations.some((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === item.id));
    if (missingDeviation) { setToast("Abra um desvio para cada item não conforme"); return; }
    setConfirmAction({ kind: "finish", inspectionId: inspection.id, title: "Concluir inspeção", from: "Em execução", to: "Concluída", consequence: "As respostas ficarão somente para consulta e os desvios continuarão sendo acompanhados separadamente." }); setModal("confirm");
  }

  function confirmProcessAction() {
    if (!confirmAction) return;
    if (confirmAction.kind === "start" && confirmAction.inspectionId) {
      const target = inspections.find((item) => item.id === confirmAction.inspectionId);
      if (target) { updateInspection(target.id, (item) => ({ ...item, status: "Em execução" })); selectInspection({ ...target, status: "Em execução" }); }
    }
    if (confirmAction.kind === "finish" && confirmAction.inspectionId) updateInspection(confirmAction.inspectionId, (item) => ({ ...item, status: "Concluída", completedAt: todayLabel() }));
    if (confirmAction.kind === "deviation" && confirmAction.deviationId) setDeviations((current) => current.map((item) => item.id === confirmAction.deviationId ? { ...item, status: confirmAction.to as DeviationStatus } : item));
    setModal(null); setToast(`${confirmAction.from} → ${confirmAction.to} confirmado`); setConfirmAction(null);
  }

  function scheduleInspection() {
    const model = models.find((item) => item.name === scheduleDraft.title) ?? models[0];
    if (!model) { setToast("Crie um modelo antes de programar"); return; }
    if (!scheduleDraft.location.trim() || !scheduleDraft.responsible.trim() || !scheduleDraft.scheduledAt) { setToast("Informe local, responsável e data"); return; }
    const next: Inspection = { id: uid("INS"), title: model.name, location: scheduleDraft.location.trim(), responsible: scheduleDraft.responsible.trim(), scheduledAt: scheduleDraft.scheduledAt, status: "Programada", items: createItems(model) };
    setInspections((current) => [...current, next]); setModal(null); setActive("Programadas"); setToast("Inspeção programada");
  }

  function openNewModel() { setModelDraft({ id: "", name: "", items: [{ id: uid("MDI"), label: "", helper: "" }] }); setModal("model"); }
  function openEditModel(model: ChecklistModel) { setModelDraft({ id: model.id, name: model.name, items: model.items.map((item) => ({ id: uid("MDI"), ...item })) }); setModal("model"); }
  function patchModelItem(id: string, patch: Partial<ModelItem>) { setModelDraft((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item) })); }
  function saveModel() {
    const name = modelDraft.name.trim(); const items = modelDraft.items.map((item) => ({ label: item.label.trim(), helper: item.helper.trim() })).filter((item) => item.label);
    if (!name || !items.length) { setToast("Informe o nome e ao menos um item"); return; }
    if (modelDraft.id) setModels((current) => current.map((model) => model.id === modelDraft.id ? { ...model, name, items } : model)); else setModels((current) => [...current, { id: uid("MOD"), name, items }]);
    setModal(null); setToast(modelDraft.id ? "Modelo atualizado" : "Modelo criado");
  }
  function removeModel(model: ChecklistModel) { if (window.confirm(`Remover o modelo “${model.name}”?`)) setModels((current) => current.filter((item) => item.id !== model.id)); }

  const headerAction = active === "Programadas" ? <button className={styles.primaryButton} onClick={() => setModal("schedule")}><Icon name="plus" /> Programar inspeção</button> : active === "Modelos" ? <button className={styles.primaryButton} onClick={openNewModel}><Icon name="plus" /> Novo modelo</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={active} subtitle="Uma inspeção escolhida, um item atual e uma decisão confirmada por vez." action={headerAction}>
    {active === "Executar inspeção" && inspection && currentItem ? <div className={styles.inspectionLayout}><aside className={styles.inspectionIndex}><div><span className={styles.eyebrow}>{inspection.id}</span><h2>{inspection.title}</h2><p>{inspection.location} · {inspection.responsible}</p><StatusPill status={inspection.status} /></div><div className={styles.progressBlock}><div><span>Progresso</span><strong>{inspection.items.filter((item) => item.result).length}/{inspection.items.length}</strong></div></div><div className={styles.checkIndex}>{inspection.items.map((item, index) => <button key={item.id} className={currentItem.id === item.id ? styles.checkCurrent : ""} onClick={() => setCurrentItemId(item.id)}><span>{item.result ? <Icon name={item.result === "Não conforme" ? "warning" : "check"} /> : index + 1}</span><div><strong>{item.label}</strong><small>{item.id === currentItem.id ? "Item atual" : item.result ?? "Pendente"}</small></div></button>)}</div></aside><section className={styles.inspectionStage}><div className={styles.stageHeader}><span>Item atual · {inspection.items.findIndex((item) => item.id === currentItem.id) + 1} de {inspection.items.length}</span><button onClick={() => setModal("instruction")}>Ver instrução</button></div><div className={styles.questionBlock}><h1>{currentItem.label}</h1><p>{currentItem.helper}</p></div><div className={styles.answerGrid}><button disabled={readOnly} className={currentItem.result === "Conforme" ? styles.answerSelected : ""} onClick={() => answer("Conforme")}><Icon name="check" /><strong>Conforme</strong></button><button disabled={readOnly} className={currentItem.result === "Não conforme" ? styles.answerDanger : ""} onClick={() => answer("Não conforme")}><Icon name="warning" /><strong>Não conforme</strong></button><button disabled={readOnly} className={currentItem.result === "Não se aplica" ? styles.answerSelected : ""} onClick={() => answer("Não se aplica")}><Icon name="close" /><strong>Não se aplica</strong></button></div><Field label="Observação do item"><textarea disabled={readOnly} value={currentItem.note} onChange={(event) => updateItem({ note: event.target.value })} /></Field><div className={styles.evidenceBox}><div><Icon name="image" /><div><strong>Evidências</strong><span>{currentItem.evidence.length} arquivo(s)</span></div></div>{!readOnly ? <label className={styles.secondaryButton}>Selecionar foto<input hidden type="file" accept="image/*" multiple onChange={addEvidence} /></label> : null}</div><div className={styles.stageFooter}><button className={styles.secondaryButton} disabled={inspection.items[0].id === currentItem.id} onClick={() => { const index = inspection.items.findIndex((item) => item.id === currentItem.id); setCurrentItemId(inspection.items[Math.max(0, index - 1)].id); }}>Anterior</button><button className={styles.primaryButton} disabled={readOnly} onClick={goNext}>{isLastItem ? "Revisar e concluir" : "Confirmar item e continuar"}</button></div></section></div> : active === "Executar inspeção" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Escolha consciente</span><h2>Selecione uma inspeção</h2><p>Nenhuma inspeção é aberta automaticamente.</p></div></div><div className={styles.directoryRows}>{inspections.filter((item) => item.status !== "Programada").map((item) => <button key={item.id} onClick={() => selectInspection(item)}><span className={styles.companyAvatar}><Icon name={item.status === "Concluída" ? "check" : "activity"} /></span><div><strong>{item.title}</strong><small>{item.location} · {item.responsible}</small></div><StatusPill status={item.status} /></button>)}</div></section> : null}

    {active === "Programadas" ? <section className={styles.pageSheet}><div className={styles.inspectionRows}>{inspections.filter((item) => item.status === "Programada").map((item) => <article key={item.id}><div><span className={styles.eyebrow}>{item.id}</span><h3>{item.title}</h3><p>{item.location}</p><small>{item.scheduledAt} · {item.responsible}</small></div><button className={styles.primaryButton} onClick={() => requestStart(item)}>Confirmar início</button></article>)}</div></section> : null}

    {active === "Desvios" ? <section className={styles.pageSheet}><div className={styles.deviationRows}>{deviations.map((item) => <article key={item.id}><div><span className={styles.eyebrow}>{item.id} · etapa atual</span><h3>{item.description}</h3><p>{item.action || "Ação corretiva ainda não informada"}</p><small>{item.responsible} · prazo: {item.due}</small></div><div><StatusPill status={item.status} /><button className={styles.secondaryButton} onClick={() => openDeviation(item)}>Editar ação</button><button className={styles.primaryButton} disabled={item.status === "Encerrado"} onClick={() => requestDeviationAdvance(item)}>{deviationAction(item.status)}</button></div></article>)}</div></section> : null}

    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.templateGrid}>{models.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="clipboard" /></div><h3>{model.name}</h3><p>{model.items.length} item(ns)</p><div><button className={styles.secondaryButton} onClick={() => openEditModel(model)}>Editar</button><button className={styles.iconButton} onClick={() => removeModel(model)}><Icon name="trash" /></button></div></article>)}</div></section> : null}

    <Modal open={modal === "confirm"} title={confirmAction?.title ?? "Confirmar etapa"} onClose={() => setModal(null)}>{confirmAction ? <><div className={styles.noteBox}><strong>{confirmAction.from}</strong> → <strong>{confirmAction.to}</strong><br />{confirmAction.consequence}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmProcessAction}>Confirmar mudança</button></div></> : null}</Modal>
    <Modal open={modal === "schedule"} title="Programar inspeção" onClose={() => setModal(null)}><Form onSubmit={scheduleInspection}><Field label="Modelo"><select required value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))}>{models.map((model) => <option key={model.id}>{model.name}</option>)}</select></Field><Field label="Local ou ativo"><input required value={scheduleDraft.location} onChange={(event) => setScheduleDraft((current) => ({ ...current, location: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Responsável"><input required value={scheduleDraft.responsible} onChange={(event) => setScheduleDraft((current) => ({ ...current, responsible: event.target.value }))} /></Field><Field label="Data e horário"><input required type="datetime-local" value={scheduleDraft.scheduledAt} onChange={(event) => setScheduleDraft((current) => ({ ...current, scheduledAt: event.target.value }))} /></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Programar</button></div></Form></Modal>
    <Modal open={modal === "deviation"} title="Abrir desvio" description="O item continuará não conforme até a correção ser validada." onClose={() => setModal(null)}><Form onSubmit={createDeviation}><DeviationFields draft={deviationDraft} setDraft={setDeviationDraft} /><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar em Aberto</button></div></Form></Modal>
    <Modal open={modal === "editDeviation"} title="Editar desvio" onClose={() => setModal(null)}><Form onSubmit={saveDeviation}><DeviationFields draft={deviationDraft} setDraft={setDeviationDraft} /><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar</button></div></Form></Modal>
    <Modal open={modal === "model"} title={modelDraft.id ? "Editar modelo" : "Novo modelo"} onClose={() => setModal(null)} wide><Form onSubmit={saveModel}><Field label="Nome"><input required value={modelDraft.name} onChange={(event) => setModelDraft((current) => ({ ...current, name: event.target.value }))} /></Field><div className={styles.builderItems}>{modelDraft.items.map((item, index) => <div className={styles.builderLineAdvanced} key={item.id}><span>{index + 1}</span><input required value={item.label} onChange={(event) => patchModelItem(item.id, { label: event.target.value })} placeholder="Item" /><input value={item.helper} onChange={(event) => patchModelItem(item.id, { helper: event.target.value })} placeholder="Orientação" /><button type="button" className={styles.iconButton} disabled={modelDraft.items.length === 1} onClick={() => setModelDraft((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id) }))}><Icon name="trash" /></button></div>)}</div><button type="button" className={styles.secondaryButton} onClick={() => setModelDraft((current) => ({ ...current, items: [...current.items, { id: uid("MDI"), label: "", helper: "" }] }))}>Adicionar item</button><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar modelo</button></div></Form></Modal>
    <Modal open={modal === "instruction"} title={currentItem?.label ?? "Instrução"} onClose={() => setModal(null)}><div className={styles.instructionBox}><p>{currentItem?.helper}</p></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function DeviationFields({ draft, setDraft }: { draft: DeviationDraft; setDraft: Dispatch<SetStateAction<DeviationDraft>> }) {
  return <><Field label="Descrição"><input required value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Prioridade"><select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Deviation["priority"] }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field><Field label="Responsável"><input required value={draft.responsible} onChange={(event) => setDraft((current) => ({ ...current, responsible: event.target.value }))} /></Field><Field label="Prazo"><input required type="date" value={draft.due} onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))} /></Field></div><Field label="Ação corretiva"><textarea value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))} /></Field></>;
}
function deviationAction(status: DeviationStatus) { if (status === "Aberto") return "Confirmar início da correção"; if (status === "Em correção") return "Enviar para validação"; if (status === "Validar") return "Confirmar encerramento"; return "Encerrado"; }
