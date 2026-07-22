"use client";

import { useState, type ChangeEvent } from "react";
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
type ChecklistModel = { id: string; name: string; items: Array<{ label: string; helper: string }> };

const baseItems = [
  { label: "Condição geral da área", helper: "Verifique limpeza, organização e acesso." },
  { label: "Proteções e dispositivos de segurança", helper: "Confirme presença, fixação e funcionamento." },
  { label: "Cabos, conexões e alimentação", helper: "Procure desgaste, exposição ou aquecimento." },
  { label: "Sinalização e identificação", helper: "Confira placas, etiquetas e legibilidade." },
  { label: "Teste operacional", helper: "Realize o teste conforme o procedimento local." },
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
  const [currentInspectionId, setCurrentInspectionId] = useState(initialInspection.id);
  const [currentItemId, setCurrentItemId] = useState(initialInspection.items[0].id);
  const [modal, setModal] = useState<"schedule" | "deviation" | "model" | "instruction" | null>(null);
  const [toast, setToast] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({ title: initialModels[0].name, location: "", responsible: "Paulo", scheduledAt: "" });
  const [deviationDraft, setDeviationDraft] = useState({ description: "", priority: "Alta" as Deviation["priority"], responsible: "Paulo", due: "", action: "" });
  const [modelDraft, setModelDraft] = useState({ name: "", item: "" });
  const inspection = inspections.find((item) => item.id === currentInspectionId) ?? inspections[0];
  const currentItem = inspection?.items.find((item) => item.id === currentItemId) ?? inspection?.items[0];
  const nav: NavItem[] = [{ label: "Executar inspeção", icon: "check" }, { label: "Programadas", icon: "calendar" }, { label: "Desvios", icon: "warning" }, { label: "Modelos", icon: "clipboard" }];
  const readOnly = inspection?.status === "Concluída";

  function updateInspection(updater: (inspection: Inspection) => Inspection) {
    setInspections((current) => current.map((item) => item.id === inspection.id ? updater(item) : item));
  }

  function updateItem(patch: Partial<CheckItem>) {
    if (!currentItem || readOnly) return;
    updateInspection((current) => ({ ...current, items: current.items.map((item) => item.id === currentItem.id ? { ...item, ...patch } : item) }));
  }

  function answer(result: Result) {
    if (!currentItem || readOnly) { setToast("Inspeções concluídas ficam disponíveis somente para consulta"); return; }
    updateItem({ result });
    if (result === "Não conforme") {
      const exists = deviations.some((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === currentItem.id && deviation.status !== "Encerrado");
      if (!exists) {
        setDeviationDraft({ description: currentItem.label, priority: "Alta", responsible: inspection.responsible, due: "", action: currentItem.note });
        setModal("deviation");
      }
    } else {
      goNext();
    }
  }

  function goNext() {
    const index = inspection.items.findIndex((item) => item.id === currentItem?.id);
    const next = inspection.items[Math.min(index + 1, inspection.items.length - 1)];
    if (next) setCurrentItemId(next.id);
  }

  async function addEvidence(event: ChangeEvent<HTMLInputElement>) {
    if (!currentItem || !event.target.files?.length) return;
    const urls = await Promise.all(Array.from(event.target.files).slice(0, 3).map(fileToDataUrl));
    updateItem({ evidence: [...currentItem.evidence, ...urls] }); setToast("Evidência salva neste navegador");
  }

  function createDeviation() {
    if (!currentItem) return;
    const deviation: Deviation = { id: uid("NC"), inspectionId: inspection.id, itemId: currentItem.id, description: deviationDraft.description || currentItem.label, priority: deviationDraft.priority, responsible: deviationDraft.responsible, due: deviationDraft.due || "Sem prazo", status: "Aberto", action: deviationDraft.action, evidence: currentItem.evidence };
    setDeviations((current) => [deviation, ...current]);
    setDeviationDraft({ description: "", priority: "Alta", responsible: "Paulo", due: "", action: "" }); setModal(null); goNext(); setToast("Desvio criado e vinculado à inspeção");
  }

  function finishInspection() {
    const pending = inspection.items.filter((item) => !item.result).length;
    if (pending) { setToast(`Ainda existem ${pending} item(ns) pendente(s)`); return; }
    updateInspection((current) => ({ ...current, status: "Concluída", completedAt: todayLabel() })); setToast("Inspeção concluída");
  }

  function scheduleInspection() {
    const model = models.find((item) => item.name === scheduleDraft.title) ?? models[0];
    const next: Inspection = { id: uid("INS"), title: scheduleDraft.title, location: scheduleDraft.location, responsible: scheduleDraft.responsible, scheduledAt: scheduleDraft.scheduledAt || "Sem data", status: "Programada", items: createItems(model) };
    setInspections((current) => [...current, next]); setScheduleDraft({ title: models[0].name, location: "", responsible: "Paulo", scheduledAt: "" }); setModal(null); setToast("Inspeção programada");
  }

  function startInspection(item: Inspection) {
    setInspections((current) => current.map((inspectionItem) => inspectionItem.id === item.id ? { ...inspectionItem, status: "Em execução" } : inspectionItem));
    setCurrentInspectionId(item.id); setCurrentItemId(item.items[0].id); setActive("Executar inspeção");
  }

  function reviewInspection(item: Inspection) {
    setCurrentInspectionId(item.id); setCurrentItemId(item.items[0].id); setActive("Executar inspeção");
  }

  function advanceDeviation(deviation: Deviation) {
    const flow: DeviationStatus[] = ["Aberto", "Em correção", "Validar", "Encerrado"];
    const next = flow[Math.min(flow.indexOf(deviation.status) + 1, flow.length - 1)];
    setDeviations((current) => current.map((item) => item.id === deviation.id ? { ...item, status: next } : item)); setToast(`Desvio avançou para ${next}`);
  }

  function createModel() {
    if (!modelDraft.name.trim() || !modelDraft.item.trim()) return;
    setModels((current) => [...current, { id: uid("MOD"), name: modelDraft.name.trim(), items: [{ label: modelDraft.item.trim(), helper: "Instrução ainda não definida." }] }]);
    setModelDraft({ name: "", item: "" }); setModal(null); setToast("Modelo criado");
  }

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Execução guiada, evidência e tratamento de desvios no mesmo registro." action={active === "Executar inspeção" ? <button className={styles.primaryButton} disabled={readOnly} onClick={finishInspection}><Icon name="check" /> {readOnly ? "Inspeção concluída" : "Concluir inspeção"}</button> : <button className={styles.primaryButton} onClick={() => setModal(active === "Modelos" ? "model" : "schedule")}><Icon name="plus" /> {active === "Modelos" ? "Novo modelo" : "Programar"}</button>}>
    {active === "Executar inspeção" && inspection && currentItem ? <div className={styles.inspectionLayout}><aside className={styles.inspectionIndex}><div><span className={styles.eyebrow}>{inspection.id}</span><h2>{inspection.title}</h2><p>{inspection.location} · {inspection.responsible}</p><StatusPill status={inspection.status} /></div><div className={styles.progressBlock}><div><span>Progresso</span><strong>{inspection.items.filter((item) => item.result).length}/{inspection.items.length}</strong></div><i><b style={{ width: `${(inspection.items.filter((item) => item.result).length / inspection.items.length) * 100}%` }} /></i></div><div className={styles.checkIndex}>{inspection.items.map((item, index) => <button key={item.id} className={currentItem.id === item.id ? styles.checkCurrent : ""} onClick={() => setCurrentItemId(item.id)}><span>{item.result ? <Icon name={item.result === "Não conforme" ? "warning" : "check"} /> : index + 1}</span><div><strong>{item.label}</strong><small>{item.result ?? "Pendente"}</small></div></button>)}</div></aside><section className={styles.inspectionStage}><div className={styles.stageHeader}><span>Item {inspection.items.findIndex((item) => item.id === currentItem.id) + 1} de {inspection.items.length}</span><button onClick={() => setModal("instruction")}><Icon name="history" /> Ver instrução</button></div><div className={styles.questionBlock}><span className={styles.eyebrow}>VERIFICAÇÃO</span><h1>{currentItem.label}</h1><p>{currentItem.helper}</p></div><div className={styles.answerGrid}><button className={currentItem.result === "Conforme" ? styles.answerSelected : ""} onClick={() => answer("Conforme")}><Icon name="check" /><strong>Conforme</strong><span>O item atende ao requisito.</span></button><button className={currentItem.result === "Não conforme" ? styles.answerDanger : ""} onClick={() => answer("Não conforme")}><Icon name="warning" /><strong>Não conforme</strong><span>Abra um desvio e registre evidência.</span></button><button className={currentItem.result === "Não se aplica" ? styles.answerSelected : ""} onClick={() => answer("Não se aplica")}><Icon name="close" /><strong>Não se aplica</strong><span>O requisito não pertence ao local.</span></button></div><Field label="Observação do item"><textarea disabled={readOnly} value={currentItem.note} onChange={(event) => updateItem({ note: event.target.value })} placeholder="Descreva a condição encontrada" /></Field><div className={styles.evidenceBox}><div><Icon name="image" /><div><strong>Evidências</strong><span>{currentItem.evidence.length} arquivo(s) anexado(s)</span></div></div>{!readOnly ? <label className={styles.secondaryButton}>Selecionar foto<input hidden type="file" accept="image/*" multiple onChange={addEvidence} /></label> : <StatusPill status="Somente leitura" />}</div><div className={styles.photoStrip}>{currentItem.evidence.map((photo, index) => <figure key={`${photo.slice(0, 20)}-${index}`}><img src={photo} alt={`Evidência ${index + 1}`} /><button onClick={() => updateItem({ evidence: currentItem.evidence.filter((_, itemIndex) => itemIndex !== index) })}><Icon name="trash" /></button></figure>)}</div><div className={styles.stageFooter}><button className={styles.secondaryButton} disabled={inspection.items[0].id === currentItem.id} onClick={() => { const index = inspection.items.findIndex((item) => item.id === currentItem.id); setCurrentItemId(inspection.items[Math.max(0, index - 1)].id); }}>Anterior</button><button className={styles.primaryButton} onClick={goNext}>Próximo item <Icon name="arrow" /></button></div></section></div> : null}

    {active === "Programadas" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Programação local</span><h2>Inspeções agendadas</h2><p>Responsáveis, locais e modelos definidos.</p></div><button className={styles.primaryButton} onClick={() => setModal("schedule")}><Icon name="plus" /> Programar</button></div><div className={styles.inspectionRows}>{inspections.filter((item) => item.status === "Programada").map((item) => <article key={item.id}><div><span className={styles.eyebrow}>{item.id}</span><h3>{item.title}</h3><p>{item.location}</p><small>{item.scheduledAt} · {item.responsible}</small></div><button className={styles.primaryButton} onClick={() => startInspection(item)}>Iniciar inspeção</button></article>)}{!inspections.some((item) => item.status === "Programada") ? <EmptyState icon="calendar" title="Nenhuma inspeção programada" description="Crie uma programação para iniciar depois." /> : null}</div><div className={styles.pageSubsection}><h3>Concluídas</h3><div className={styles.directoryRows}>{inspections.filter((item) => item.status === "Concluída").map((item) => <button key={item.id} onClick={() => reviewInspection(item)}><span className={styles.companyAvatar}><Icon name="check" /></span><div><strong>{item.title}</strong><small>{item.location} · {item.completedAt}</small></div><StatusPill status="Concluída" /></button>)}</div></div></section> : null}

    {active === "Desvios" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Não conformidades</span><h2>Desvios em tratamento</h2><p>Responsável, prazo, evidência e próxima etapa.</p></div></div><div className={styles.deviationRows}>{deviations.map((item) => <article key={item.id}><div><span className={styles.eyebrow}>{item.id} · {item.inspectionId}</span><h3>{item.description}</h3><p>{item.action || "Ação ainda não informada"}</p><small>{item.responsible} · prazo: {item.due}</small></div><div><StatusPill status={item.priority} /><StatusPill status={item.status} /><button className={styles.primaryButton} disabled={item.status === "Encerrado"} onClick={() => advanceDeviation(item)}>{item.status === "Encerrado" ? "Encerrado" : "Avançar"}</button></div></article>)}{!deviations.length ? <EmptyState icon="check" title="Nenhum desvio aberto" description="Itens não conformes criarão desvios automaticamente." /> : null}</div></section> : null}

    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Biblioteca local</span><h2>Modelos de checklist</h2><p>Estruturas reutilizáveis para novas inspeções.</p></div><button className={styles.primaryButton} onClick={() => setModal("model")}><Icon name="plus" /> Novo modelo</button></div><div className={styles.templateGrid}>{models.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="clipboard" /></div><h3>{model.name}</h3><p>{model.items.length} item(ns) de verificação</p><div><button className={styles.secondaryButton} onClick={() => { setScheduleDraft((current) => ({ ...current, title: model.name })); setModal("schedule"); }}>Programar</button><button className={styles.iconButton} onClick={() => setModels((current) => current.filter((item) => item.id !== model.id))}><Icon name="trash" /></button></div></article>)}</div></section> : null}

    <Modal open={modal === "schedule"} title="Programar inspeção" onClose={() => setModal(null)}><Form onSubmit={scheduleInspection}><Field label="Modelo"><select value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))}>{models.map((model) => <option key={model.id}>{model.name}</option>)}</select></Field><Field label="Local ou ativo"><input required value={scheduleDraft.location} onChange={(event) => setScheduleDraft((current) => ({ ...current, location: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Responsável"><select value={scheduleDraft.responsible} onChange={(event) => setScheduleDraft((current) => ({ ...current, responsible: event.target.value }))}><option>Paulo</option><option>Marcos</option><option>Carlos</option></select></Field><Field label="Data e horário"><input type="datetime-local" value={scheduleDraft.scheduledAt} onChange={(event) => setScheduleDraft((current) => ({ ...current, scheduledAt: event.target.value }))} /></Field></div><div className={styles.modalActions}><button className={styles.primaryButton}>Programar inspeção</button></div></Form></Modal>
    <Modal open={modal === "deviation"} title="Abrir desvio" description="O item continuará marcado como não conforme." onClose={() => setModal(null)}><Form onSubmit={createDeviation}><Field label="Descrição"><input required value={deviationDraft.description} onChange={(event) => setDeviationDraft((current) => ({ ...current, description: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Prioridade"><select value={deviationDraft.priority} onChange={(event) => setDeviationDraft((current) => ({ ...current, priority: event.target.value as Deviation["priority"] }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field><Field label="Responsável"><input value={deviationDraft.responsible} onChange={(event) => setDeviationDraft((current) => ({ ...current, responsible: event.target.value }))} /></Field><Field label="Prazo"><input type="date" value={deviationDraft.due} onChange={(event) => setDeviationDraft((current) => ({ ...current, due: event.target.value }))} /></Field></div><Field label="Ação recomendada"><textarea value={deviationDraft.action} onChange={(event) => setDeviationDraft((current) => ({ ...current, action: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Criar desvio</button></div></Form></Modal>
    <Modal open={modal === "model"} title="Novo modelo" onClose={() => setModal(null)}><Form onSubmit={createModel}><Field label="Nome do modelo"><input required value={modelDraft.name} onChange={(event) => setModelDraft((current) => ({ ...current, name: event.target.value }))} /></Field><Field label="Primeiro item"><input required value={modelDraft.item} onChange={(event) => setModelDraft((current) => ({ ...current, item: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Criar modelo</button></div></Form></Modal>
    <Modal open={modal === "instruction"} title={currentItem?.label ?? "Instrução"} description="Orientação do modelo de checklist." onClose={() => setModal(null)}><div className={styles.instructionBox}><Icon name="clipboard" /><p>{currentItem?.helper}</p><small>Os textos dos modelos poderão ser refinados antes da fase de servidor.</small></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}
