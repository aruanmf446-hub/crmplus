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
type ModelItem = { id: string; label: string; helper: string };
type ChecklistModel = { id: string; name: string; items: Array<{ label: string; helper: string }> };

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
  const [currentInspectionId, setCurrentInspectionId] = useState(initialInspection.id);
  const [currentItemId, setCurrentItemId] = useState(initialInspection.items[0].id);
  const [modal, setModal] = useState<"schedule" | "deviation" | "editDeviation" | "model" | "instruction" | null>(null);
  const [toast, setToast] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({ title: initialModels[0].name, location: "", responsible: "", scheduledAt: "" });
  const [deviationDraft, setDeviationDraft] = useState({ id: "", description: "", priority: "Alta" as Deviation["priority"], responsible: "", due: "", action: "" });
  const [modelDraft, setModelDraft] = useState<{ id: string; name: string; items: ModelItem[] }>({ id: "", name: "", items: [{ id: uid("MDI"), label: "", helper: "" }] });

  const inspection = inspections.find((item) => item.id === currentInspectionId) ?? inspections.find((item) => item.status === "Em execução") ?? inspections[0];
  const currentItem = inspection?.items.find((item) => item.id === currentItemId) ?? inspection?.items[0];
  const nav: NavItem[] = [{ label: "Executar inspeção", icon: "check" }, { label: "Programadas", icon: "calendar" }, { label: "Desvios", icon: "warning" }, { label: "Modelos", icon: "clipboard" }];
  const readOnly = inspection?.status === "Concluída";
  const isLastItem = Boolean(inspection && currentItem && inspection.items.at(-1)?.id === currentItem.id);

  function updateInspection(updater: (inspection: Inspection) => Inspection) {
    if (!inspection) return;
    setInspections((current) => current.map((item) => item.id === inspection.id ? updater(item) : item));
  }

  function updateItem(patch: Partial<CheckItem>) {
    if (!currentItem || readOnly) return;
    updateInspection((current) => ({ ...current, items: current.items.map((item) => item.id === currentItem.id ? { ...item, ...patch } : item) }));
  }

  function answer(result: Result) {
    if (!currentItem || !inspection || readOnly) { setToast("Inspeções concluídas ficam disponíveis somente para consulta"); return; }
    updateItem({ result });
    if (result === "Não conforme") {
      const existing = deviations.find((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === currentItem.id && deviation.status !== "Encerrado");
      if (existing) {
        setToast("Este item já possui um desvio aberto");
        goNext();
        return;
      }
      setDeviationDraft({ id: "", description: currentItem.label, priority: "Alta", responsible: inspection.responsible, due: "", action: currentItem.note });
      setModal("deviation");
    } else {
      goNext();
    }
  }

  function goNext() {
    if (!inspection || !currentItem) return;
    const index = inspection.items.findIndex((item) => item.id === currentItem.id);
    const next = inspection.items[index + 1];
    if (next) setCurrentItemId(next.id);
  }

  async function addEvidence(event: ChangeEvent<HTMLInputElement>) {
    if (!currentItem || !event.target.files?.length || readOnly) return;
    const files = Array.from(event.target.files).slice(0, 3);
    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha imagens menores, com até 700 KB cada"); event.target.value = ""; return; }
    const urls = await Promise.all(files.map(fileToDataUrl));
    updateItem({ evidence: [...currentItem.evidence, ...urls] });
    setToast("Evidências adicionadas");
    event.target.value = "";
  }

  function createDeviation() {
    if (!currentItem || !inspection) return;
    if (!deviationDraft.description.trim()) { setToast("Informe a descrição do desvio"); return; }
    const deviation: Deviation = { id: uid("NC"), inspectionId: inspection.id, itemId: currentItem.id, description: deviationDraft.description.trim(), priority: deviationDraft.priority, responsible: deviationDraft.responsible.trim() || inspection.responsible || "Não atribuído", due: deviationDraft.due || "Sem prazo", status: "Aberto", action: deviationDraft.action.trim(), evidence: currentItem.evidence };
    setDeviations((current) => [deviation, ...current]);
    setDeviationDraft({ id: "", description: "", priority: "Alta", responsible: "", due: "", action: "" });
    setModal(null);
    goNext();
    setToast("Desvio criado e vinculado à inspeção");
  }

  function openDeviation(deviation: Deviation) {
    setDeviationDraft({ id: deviation.id, description: deviation.description, priority: deviation.priority, responsible: deviation.responsible, due: deviation.due === "Sem prazo" ? "" : deviation.due, action: deviation.action });
    setModal("editDeviation");
  }

  function saveDeviation() {
    if (!deviationDraft.id || !deviationDraft.description.trim()) return;
    setDeviations((current) => current.map((item) => item.id === deviationDraft.id ? { ...item, description: deviationDraft.description.trim(), priority: deviationDraft.priority, responsible: deviationDraft.responsible.trim() || "Não atribuído", due: deviationDraft.due || "Sem prazo", action: deviationDraft.action.trim() } : item));
    setModal(null);
    setToast("Desvio atualizado");
  }

  function advanceDeviation(deviation: Deviation) {
    const flow: DeviationStatus[] = ["Aberto", "Em correção", "Validar", "Encerrado"];
    const currentIndex = flow.indexOf(deviation.status);
    if (currentIndex < 0 || currentIndex === flow.length - 1) return;
    const next = flow[currentIndex + 1];
    if ((next === "Validar" || next === "Encerrado") && !deviation.action.trim()) {
      openDeviation(deviation);
      setToast("Registre a ação corretiva antes de avançar");
      return;
    }
    setDeviations((current) => current.map((item) => item.id === deviation.id ? { ...item, status: next } : item));
    setToast(`Desvio avançou para ${next}`);
  }

  function finishInspection() {
    if (!inspection) return;
    const pending = inspection.items.filter((item) => !item.result).length;
    if (pending) { setToast(`Ainda existem ${pending} item(ns) pendente(s)`); return; }
    const missingDeviation = inspection.items.some((item) => item.result === "Não conforme" && !deviations.some((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === item.id));
    if (missingDeviation) { setToast("Abra um desvio para cada item não conforme"); return; }
    updateInspection((current) => ({ ...current, status: "Concluída", completedAt: todayLabel() }));
    setToast("Inspeção concluída");
  }

  function scheduleInspection() {
    const model = models.find((item) => item.name === scheduleDraft.title) ?? models[0];
    if (!model) { setToast("Crie um modelo antes de programar a inspeção"); return; }
    if (!scheduleDraft.location.trim()) { setToast("Informe o local ou ativo da inspeção"); return; }
    const next: Inspection = { id: uid("INS"), title: model.name, location: scheduleDraft.location.trim(), responsible: scheduleDraft.responsible.trim() || "Não atribuído", scheduledAt: scheduleDraft.scheduledAt || "Sem data", status: "Programada", items: createItems(model) };
    setInspections((current) => [...current, next]);
    setScheduleDraft({ title: models[0]?.name ?? "", location: "", responsible: "", scheduledAt: "" });
    setModal(null);
    setActive("Programadas");
    setToast("Inspeção programada");
  }

  function startInspection(item: Inspection) {
    if (!item.items.length) { setToast("Esta inspeção não possui itens de verificação"); return; }
    setInspections((current) => current.map((inspectionItem) => inspectionItem.id === item.id ? { ...inspectionItem, status: "Em execução" } : inspectionItem));
    setCurrentInspectionId(item.id);
    setCurrentItemId(item.items[0].id);
    setActive("Executar inspeção");
  }

  function reviewInspection(item: Inspection) {
    if (!item.items.length) return;
    setCurrentInspectionId(item.id);
    setCurrentItemId(item.items[0].id);
    setActive("Executar inspeção");
  }

  function openNewModel() {
    setModelDraft({ id: "", name: "", items: [{ id: uid("MDI"), label: "", helper: "" }] });
    setModal("model");
  }

  function openEditModel(model: ChecklistModel) {
    setModelDraft({ id: model.id, name: model.name, items: model.items.map((item) => ({ id: uid("MDI"), ...item })) });
    setModal("model");
  }

  function patchModelItem(id: string, patch: Partial<ModelItem>) {
    setModelDraft((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  }

  function saveModel() {
    const name = modelDraft.name.trim();
    const items = modelDraft.items.map((item) => ({ label: item.label.trim(), helper: item.helper.trim() })).filter((item) => item.label);
    if (!name) { setToast("Informe o nome do modelo"); return; }
    if (!items.length) { setToast("Adicione ao menos um item de verificação"); return; }
    if (modelDraft.id) {
      setModels((current) => current.map((model) => model.id === modelDraft.id ? { ...model, name, items } : model));
      setScheduleDraft((current) => current.title === models.find((item) => item.id === modelDraft.id)?.name ? { ...current, title: name } : current);
      setToast("Modelo atualizado");
    } else {
      const model: ChecklistModel = { id: uid("MOD"), name, items };
      setModels((current) => [...current, model]);
      setScheduleDraft((current) => ({ ...current, title: model.name }));
      setToast("Modelo criado");
    }
    setModal(null);
  }

  function removeModel(model: ChecklistModel) {
    if (models.length <= 1) { setToast("Mantenha pelo menos um modelo disponível"); return; }
    if (!window.confirm(`Remover o modelo “${model.name}”?`)) return;
    const remaining = models.filter((item) => item.id !== model.id);
    setModels(remaining);
    if (scheduleDraft.title === model.name) setScheduleDraft((current) => ({ ...current, title: remaining[0]?.name ?? "" }));
    setToast("Modelo removido");
  }

  const headerAction = active === "Executar inspeção"
    ? <><button className={styles.secondaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir</button><button className={styles.primaryButton} disabled={readOnly} onClick={finishInspection}><Icon name="check" /> {readOnly ? "Inspeção concluída" : "Concluir inspeção"}</button></>
    : active === "Programadas"
      ? <button className={styles.primaryButton} disabled={!models.length} onClick={() => setModal("schedule")}><Icon name="plus" /> Programar inspeção</button>
      : active === "Modelos"
        ? <button className={styles.primaryButton} onClick={openNewModel}><Icon name="plus" /> Novo modelo</button>
        : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Execução guiada, evidência e tratamento de desvios no mesmo registro." action={headerAction}>
    {active === "Executar inspeção" && inspection && currentItem ? <div className={styles.inspectionLayout}><aside className={styles.inspectionIndex}><div><span className={styles.eyebrow}>{inspection.id}</span><h2>{inspection.title}</h2><p>{inspection.location} · {inspection.responsible}</p><StatusPill status={inspection.status} /></div><div className={styles.progressBlock}><div><span>Progresso</span><strong>{inspection.items.filter((item) => item.result).length}/{inspection.items.length}</strong></div><i><b style={{ width: `${inspection.items.length ? (inspection.items.filter((item) => item.result).length / inspection.items.length) * 100 : 0}%` }} /></i></div><div className={styles.checkIndex}>{inspection.items.map((item, index) => <button key={item.id} className={currentItem.id === item.id ? styles.checkCurrent : ""} onClick={() => setCurrentItemId(item.id)}><span>{item.result ? <Icon name={item.result === "Não conforme" ? "warning" : "check"} /> : index + 1}</span><div><strong>{item.label}</strong><small>{item.result ?? "Pendente"}</small></div></button>)}</div></aside><section className={styles.inspectionStage}><div className={styles.stageHeader}><span>Item {inspection.items.findIndex((item) => item.id === currentItem.id) + 1} de {inspection.items.length}</span><button onClick={() => setModal("instruction")}><Icon name="history" /> Ver instrução</button></div><div className={styles.questionBlock}><span className={styles.eyebrow}>VERIFICAÇÃO</span><h1>{currentItem.label}</h1><p>{currentItem.helper}</p></div><div className={styles.answerGrid}><button disabled={readOnly} className={currentItem.result === "Conforme" ? styles.answerSelected : ""} onClick={() => answer("Conforme")}><Icon name="check" /><strong>Conforme</strong><span>O item atende ao requisito.</span></button><button disabled={readOnly} className={currentItem.result === "Não conforme" ? styles.answerDanger : ""} onClick={() => answer("Não conforme")}><Icon name="warning" /><strong>Não conforme</strong><span>Abra um desvio e registre evidência.</span></button><button disabled={readOnly} className={currentItem.result === "Não se aplica" ? styles.answerSelected : ""} onClick={() => answer("Não se aplica")}><Icon name="close" /><strong>Não se aplica</strong><span>O requisito não pertence ao local.</span></button></div><Field label="Observação do item"><textarea disabled={readOnly} value={currentItem.note} onChange={(event) => updateItem({ note: event.target.value })} placeholder="Descreva a condição encontrada" /></Field><div className={styles.evidenceBox}><div><Icon name="image" /><div><strong>Evidências</strong><span>{currentItem.evidence.length} arquivo(s) anexado(s)</span></div></div>{!readOnly ? <label className={styles.secondaryButton}>Selecionar foto<input hidden type="file" accept="image/*" multiple onChange={addEvidence} /></label> : <StatusPill status="Somente leitura" />}</div><div className={styles.photoStrip}>{currentItem.evidence.map((photo, index) => <figure key={`${photo.slice(0, 20)}-${index}`}><img src={photo} alt={`Evidência ${index + 1}`} />{!readOnly ? <button aria-label={`Remover evidência ${index + 1}`} onClick={() => updateItem({ evidence: currentItem.evidence.filter((_, itemIndex) => itemIndex !== index) })}><Icon name="trash" /></button> : null}</figure>)}</div><div className={styles.stageFooter}><button className={styles.secondaryButton} disabled={inspection.items[0].id === currentItem.id} onClick={() => { const index = inspection.items.findIndex((item) => item.id === currentItem.id); setCurrentItemId(inspection.items[Math.max(0, index - 1)].id); }}>Anterior</button><button className={styles.primaryButton} disabled={readOnly} onClick={isLastItem ? finishInspection : goNext}>{isLastItem ? "Concluir inspeção" : "Próximo item"} <Icon name={isLastItem ? "check" : "arrow"} /></button></div></section></div> : active === "Executar inspeção" ? <EmptyState icon="clipboard" title="Nenhuma inspeção disponível" description="Programe uma inspeção para iniciar a execução." /> : null}

    {active === "Programadas" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Agenda de inspeções</span><h2>Inspeções programadas</h2><p>Responsáveis, locais e modelos definidos.</p></div></div><div className={styles.inspectionRows}>{inspections.filter((item) => item.status === "Programada").map((item) => <article key={item.id}><div><span className={styles.eyebrow}>{item.id}</span><h3>{item.title}</h3><p>{item.location}</p><small>{item.scheduledAt} · {item.responsible}</small></div><button className={styles.primaryButton} onClick={() => startInspection(item)}>Iniciar inspeção</button></article>)}{!inspections.some((item) => item.status === "Programada") ? <EmptyState icon="calendar" title="Nenhuma inspeção programada" description="Crie uma programação para iniciar depois." /> : null}</div><div className={styles.pageSubsection}><h3>Em execução</h3><div className={styles.directoryRows}>{inspections.filter((item) => item.status === "Em execução").map((item) => <button key={item.id} onClick={() => reviewInspection(item)}><span className={styles.companyAvatar}><Icon name="activity" /></span><div><strong>{item.title}</strong><small>{item.location} · {item.responsible}</small></div><StatusPill status="Em execução" /></button>)}</div></div><div className={styles.pageSubsection}><h3>Concluídas</h3><div className={styles.directoryRows}>{inspections.filter((item) => item.status === "Concluída").map((item) => <button key={item.id} onClick={() => reviewInspection(item)}><span className={styles.companyAvatar}><Icon name="check" /></span><div><strong>{item.title}</strong><small>{item.location} · {item.completedAt}</small></div><StatusPill status="Concluída" /></button>)}{!inspections.some((item) => item.status === "Concluída") ? <EmptyState icon="history" title="Nenhuma inspeção concluída" description="As inspeções finalizadas aparecerão aqui." /> : null}</div></div></section> : null}

    {active === "Desvios" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Não conformidades</span><h2>Desvios em tratamento</h2><p>Responsável, prazo, ação corretiva e próxima etapa.</p></div></div><div className={styles.deviationRows}>{deviations.map((item) => <article key={item.id}><div><span className={styles.eyebrow}>{item.id} · {item.inspectionId}</span><h3>{item.description}</h3><p>{item.action || "Ação corretiva ainda não informada"}</p><small>{item.responsible} · prazo: {item.due}</small></div><div><StatusPill status={item.priority} /><StatusPill status={item.status} /><button className={styles.secondaryButton} onClick={() => openDeviation(item)}>Editar ação</button><button className={styles.primaryButton} disabled={item.status === "Encerrado"} onClick={() => advanceDeviation(item)}>{item.status === "Aberto" ? "Iniciar correção" : item.status === "Em correção" ? "Enviar para validação" : item.status === "Validar" ? "Encerrar" : "Encerrado"}</button></div></article>)}{!deviations.length ? <EmptyState icon="check" title="Nenhum desvio aberto" description="Itens não conformes criarão desvios vinculados à inspeção." /> : null}</div></section> : null}

    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Modelos</span><h2>Modelos de checklist</h2><p>Estruturas completas e reutilizáveis para novas inspeções.</p></div></div><div className={styles.templateGrid}>{models.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="clipboard" /></div><h3>{model.name}</h3><p>{model.items.length} item(ns) de verificação</p><div><button className={styles.secondaryButton} onClick={() => openEditModel(model)}>Editar</button><button className={styles.secondaryButton} onClick={() => { setScheduleDraft((current) => ({ ...current, title: model.name })); setModal("schedule"); }}>Programar</button><button className={styles.iconButton} aria-label={`Remover modelo ${model.name}`} onClick={() => removeModel(model)}><Icon name="trash" /></button></div></article>)}{!models.length ? <EmptyState icon="clipboard" title="Nenhum modelo disponível" description="Crie um modelo com os itens que precisam ser verificados." /> : null}</div></section> : null}

    <Modal open={modal === "schedule"} title="Programar inspeção" onClose={() => setModal(null)}><Form onSubmit={scheduleInspection}><Field label="Modelo"><select required value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))}><option value="">Selecione</option>{models.map((model) => <option key={model.id}>{model.name}</option>)}</select></Field><Field label="Local ou ativo"><input required value={scheduleDraft.location} onChange={(event) => setScheduleDraft((current) => ({ ...current, location: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Responsável"><input value={scheduleDraft.responsible} onChange={(event) => setScheduleDraft((current) => ({ ...current, responsible: event.target.value }))} /></Field><Field label="Data e horário"><input type="datetime-local" value={scheduleDraft.scheduledAt} onChange={(event) => setScheduleDraft((current) => ({ ...current, scheduledAt: event.target.value }))} /></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Programar inspeção</button></div></Form></Modal>
    <Modal open={modal === "deviation"} title="Abrir desvio" description="O item continuará marcado como não conforme." onClose={() => setModal(null)}><Form onSubmit={createDeviation}><DeviationFields draft={deviationDraft} setDraft={setDeviationDraft} /><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar desvio</button></div></Form></Modal>
    <Modal open={modal === "editDeviation"} title="Editar desvio" description={deviationDraft.id} onClose={() => setModal(null)}><Form onSubmit={saveDeviation}><DeviationFields draft={deviationDraft} setDraft={setDeviationDraft} /><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar desvio</button></div></Form></Modal>
    <Modal open={modal === "model"} title={modelDraft.id ? "Editar modelo" : "Novo modelo"} description="Monte todos os itens e orientações do checklist." onClose={() => setModal(null)} wide><Form onSubmit={saveModel}><Field label="Nome do modelo"><input required value={modelDraft.name} onChange={(event) => setModelDraft((current) => ({ ...current, name: event.target.value }))} /></Field><div className={styles.builderItems}><div className={styles.sectionHeading}><div><h3>Itens de verificação</h3><p>Cada item deve dizer o que verificar e como avaliar.</p></div><button type="button" onClick={() => setModelDraft((current) => ({ ...current, items: [...current.items, { id: uid("MDI"), label: "", helper: "" }] }))}><Icon name="plus" /> Adicionar item</button></div>{modelDraft.items.map((item, index) => <div className={styles.builderLineAdvanced} key={item.id}><span>{index + 1}</span><input required value={item.label} onChange={(event) => patchModelItem(item.id, { label: event.target.value })} placeholder="Item de verificação" /><input value={item.helper} onChange={(event) => patchModelItem(item.id, { helper: event.target.value })} placeholder="Orientação para executar" /><button type="button" className={styles.iconButton} disabled={modelDraft.items.length === 1} onClick={() => setModelDraft((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id) }))}><Icon name="trash" /></button></div>)}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>{modelDraft.id ? "Salvar alterações" : "Criar modelo"}</button></div></Form></Modal>
    <Modal open={modal === "instruction"} title={currentItem?.label ?? "Instrução"} description="Orientação do modelo de checklist." onClose={() => setModal(null)}><div className={styles.instructionBox}><Icon name="clipboard" /><p>{currentItem?.helper || "Nenhuma orientação adicional foi definida para este item."}</p></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function DeviationFields({ draft, setDraft }: { draft: { id: string; description: string; priority: Deviation["priority"]; responsible: string; due: string; action: string }; setDraft: React.Dispatch<React.SetStateAction<{ id: string; description: string; priority: Deviation["priority"]; responsible: string; due: string; action: string }>> }) {
  return <><Field label="Descrição"><input required value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Prioridade"><select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Deviation["priority"] }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field><Field label="Responsável"><input value={draft.responsible} onChange={(event) => setDraft((current) => ({ ...current, responsible: event.target.value }))} /></Field><Field label="Prazo"><input type="date" value={draft.due} onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))} /></Field></div><Field label="Ação corretiva"><textarea value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))} placeholder="Descreva o que será feito para corrigir o desvio" /></Field></>;
}
