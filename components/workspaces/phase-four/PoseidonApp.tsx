"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { currency, fileToDataUrl, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type Stage = "Novo contato" | "Qualificado" | "Proposta enviada" | "Negociação" | "Ganha" | "Perdida";
type OpenStage = Exclude<Stage, "Ganha" | "Perdida">;
type Heat = "Alta" | "Média" | "Baixa";
type Activity = { id: string; opportunityId: string; date: string; time: string; type: string; company: string; person: string; done: boolean; cancelled?: boolean; result?: string };
type Opportunity = { id: string; company: string; contact: string; phone: string; source: string; value: number; stage: Stage; owner: string; next: string; heat: Heat; lossReason?: string; closureNote?: string; notes: Array<{ text: string; date: string }>; files: string[] };

const initialOpportunities: Opportunity[] = [
  { id: "OP-301", company: "Solar Norte", contact: "Camila Rocha", phone: "(94) 99999-1001", source: "Indicação", value: 18000, stage: "Negociação", owner: "Alisson", next: "Ligar hoje, 15:00", heat: "Alta", notes: [{ text: "Proposta comercial visualizada", date: "Hoje, 09:10" }, { text: "Contato qualificado pela equipe", date: "Ontem" }], files: [] },
  { id: "OP-300", company: "Academia Elite", contact: "Bruno Alves", phone: "(94) 99999-1002", source: "WhatsApp", value: 7500, stage: "Proposta enviada", owner: "Alisson", next: "Retorno amanhã, 09:00", heat: "Média", notes: [{ text: "Proposta enviada pelo WhatsApp", date: "Ontem" }], files: [] },
  { id: "OP-299", company: "Clínica Mais", contact: "Sara Lima", phone: "(94) 99999-1003", source: "Site", value: 12600, stage: "Qualificado", owner: "Marina", next: "Reunião hoje, 11:30", heat: "Alta", notes: [{ text: "Necessidades iniciais registradas", date: "Hoje, 08:30" }], files: [] },
  { id: "OP-298", company: "Auto Peças Pará", contact: "Rafael Melo", phone: "(94) 99999-1004", source: "Prospecção", value: 4900, stage: "Novo contato", owner: "Marina", next: "Enviar apresentação hoje", heat: "Baixa", notes: [], files: [] },
];
const initialActivities: Activity[] = [
  { id: "AT-1", opportunityId: "OP-300", date: "2026-07-22", time: "09:00", type: "Retorno", company: "Academia Elite", person: "Bruno Alves", done: false },
  { id: "AT-2", opportunityId: "OP-299", date: "2026-07-22", time: "11:30", type: "Reunião", company: "Clínica Mais", person: "Sara Lima", done: false },
  { id: "AT-3", opportunityId: "OP-301", date: "2026-07-22", time: "15:00", type: "Ligação", company: "Solar Norte", person: "Camila Rocha", done: false },
];

const openStages: OpenStage[] = ["Novo contato", "Qualificado", "Proposta enviada", "Negociação"];
const lossReasons = ["Preço", "Prazo", "Escolheu concorrente", "Sem resposta", "Fora do perfil", "Adiou a decisão", "Outro"];

export function PoseidonApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Oportunidades");
  const [opportunities, setOpportunities] = useLocalState<Opportunity[]>("crmplus.poseidon.opportunities.v2", initialOpportunities);
  const [activities, setActivities] = useLocalState<Activity[]>("crmplus.poseidon.activities.v2", initialActivities);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<OpenStage | "Todas">("Todas");
  const [activityMode, setActivityMode] = useState<"Pendentes" | "Concluídas">("Pendentes");
  const [opportunitySort, setOpportunitySort] = useState<"Mais recentes" | "Maior valor" | "Empresa" | "Etapa">("Mais recentes");
  const [activityQuery, setActivityQuery] = useState("");
  const [activityType, setActivityType] = useState("Todos");
  const [activitySort, setActivitySort] = useState<"Mais próximas" | "Mais recentes" | "Empresa">("Mais próximas");
  const [contactQuery, setContactQuery] = useState("");
  const [contactSort, setContactSort] = useState<"Nome" | "Empresa" | "Mais oportunidades">("Nome");
  const [closedQuery, setClosedQuery] = useState("");
  const [closedStage, setClosedStage] = useState<"Todas" | "Ganha" | "Perdida">("Todas");
  const [closedSort, setClosedSort] = useState<"Mais recentes" | "Maior valor" | "Empresa">("Mais recentes");
  const [modal, setModal] = useState<"new" | "activity" | "result" | "transition" | null>(null);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState({ company: "", contact: "", phone: "", source: "", value: "", owner: "", next: "", heat: "Média" as Heat });
  const [activityDraft, setActivityDraft] = useState({ opportunityId: "", date: new Date().toISOString().slice(0, 10), time: "09:00", type: "Ligação" });
  const [resultDraft, setResultDraft] = useState({ id: "", result: "", next: "" });
  const [transitionDraft, setTransitionDraft] = useState({ target: "Qualificado" as Stage, reason: "", note: "", next: "" });

  const selected = opportunities.find((item) => item.id === selectedId);
  const nav: NavItem[] = [{ label: "Oportunidades", icon: "spark" }, { label: "Atividades", icon: "activity" }, { label: "Contatos", icon: "people" }, { label: "Encerradas", icon: "history" }];
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const scoped = opportunities.filter((item) => !["Ganha", "Perdida"].includes(item.stage) && (stageFilter === "Todas" || item.stage === stageFilter) && (!value || `${item.company} ${item.contact} ${item.owner} ${item.next} ${item.source}`.toLowerCase().includes(value)));
    return [...scoped].sort((a, b) => opportunitySort === "Maior valor" ? b.value - a.value : opportunitySort === "Empresa" ? a.company.localeCompare(b.company, "pt-BR") : opportunitySort === "Etapa" ? openStages.indexOf(a.stage as OpenStage) - openStages.indexOf(b.stage as OpenStage) : opportunities.indexOf(a) - opportunities.indexOf(b));
  }, [opportunities, opportunitySort, query, stageFilter]);
  const activityTypes = useMemo(() => ["Todos", ...Array.from(new Set(activities.map((item) => item.type))).sort()], [activities]);
  const displayedActivities = useMemo(() => { const value = activityQuery.trim().toLowerCase(); const scoped = activities.filter((item) => (activityMode === "Pendentes" ? !item.done && !item.cancelled : item.done || item.cancelled) && (activityType === "Todos" || item.type === activityType) && (!value || `${item.company} ${item.person} ${item.type} ${item.result ?? ""}`.toLowerCase().includes(value))); return [...scoped].sort((a, b) => activitySort === "Empresa" ? a.company.localeCompare(b.company, "pt-BR") : activitySort === "Mais recentes" ? `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`) : `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)); }, [activities, activityMode, activityQuery, activitySort, activityType]);
  const contacts = useMemo(() => {
    const map = new Map<string, { contact: string; company: string; phone: string; opportunityId: string; count: number }>();
    opportunities.forEach((item) => {
      const key = `${item.contact.toLowerCase()}|${item.phone}`;
      const current = map.get(key);
      map.set(key, { contact: item.contact, company: item.company, phone: item.phone, opportunityId: item.id, count: (current?.count ?? 0) + 1 });
    });
    return Array.from(map.values());
  }, [opportunities]);
  const visibleContacts = useMemo(() => contacts.filter((item) => `${item.contact} ${item.company} ${item.phone}`.toLowerCase().includes(contactQuery.trim().toLowerCase())).sort((a, b) => contactSort === "Empresa" ? a.company.localeCompare(b.company, "pt-BR") : contactSort === "Mais oportunidades" ? b.count - a.count : a.contact.localeCompare(b.contact, "pt-BR")), [contactQuery, contactSort, contacts]);
  const closedOpportunities = useMemo(() => { const value = closedQuery.trim().toLowerCase(); const scoped = opportunities.filter((item) => ["Ganha", "Perdida"].includes(item.stage) && (closedStage === "Todas" || item.stage === closedStage) && (!value || `${item.company} ${item.contact} ${item.lossReason ?? ""} ${item.closureNote ?? ""}`.toLowerCase().includes(value))); return [...scoped].sort((a, b) => closedSort === "Maior valor" ? b.value - a.value : closedSort === "Empresa" ? a.company.localeCompare(b.company, "pt-BR") : opportunities.indexOf(a) - opportunities.indexOf(b)); }, [closedQuery, closedSort, closedStage, opportunities]);

  function updateOpportunity(id: string, patch: Partial<Opportunity>, noteText?: string) {
    setOpportunities((current) => current.map((item) => item.id === id ? { ...item, ...patch, notes: noteText ? [{ text: noteText, date: todayLabel() }, ...item.notes] : item.notes } : item));
  }

  function createOpportunity() {
    if (!draft.company.trim() || !draft.contact.trim()) { setToast("Informe empresa e contato"); return; }
    if (!draft.owner.trim()) { setToast("Defina o responsável pela oportunidade"); return; }
    if (!draft.next.trim()) { setToast("Defina a primeira ação antes de criar a oportunidade"); return; }
    const next: Opportunity = { id: uid("OP"), company: draft.company.trim(), contact: draft.contact.trim(), phone: draft.phone.trim(), source: draft.source.trim() || "Não informada", value: Number(draft.value.replace(",", ".")) || 0, stage: "Novo contato", owner: draft.owner.trim(), next: draft.next.trim(), heat: draft.heat, notes: [{ text: `Oportunidade criada; próxima ação: ${draft.next.trim()}`, date: todayLabel() }], files: [] };
    setOpportunities((current) => [next, ...current]);
    setSelectedId(next.id);
    setDraft({ company: "", contact: "", phone: "", source: "", value: "", owner: "", next: "", heat: "Média" });
    setModal(null); setActive("Oportunidades"); setToast("Oportunidade criada na etapa Novo contato");
  }

  function addNote() {
    if (!selected || !note.trim()) return;
    updateOpportunity(selected.id, {}, note.trim()); setNote(""); setToast("Registro adicionado ao histórico");
  }

  function openActivity(opportunity?: Opportunity) {
    const target = opportunity ?? selected;
    setActivityDraft({ opportunityId: target?.id ?? "", date: new Date().toISOString().slice(0, 10), time: "09:00", type: "Ligação" });
    setModal("activity");
  }

  function createActivity() {
    const opportunity = opportunities.find((item) => item.id === activityDraft.opportunityId);
    if (!opportunity) { setToast("Selecione uma oportunidade"); return; }
    if (!activityDraft.date || !activityDraft.time) { setToast("Informe data e horário"); return; }
    const item: Activity = { id: uid("AT"), opportunityId: opportunity.id, date: activityDraft.date, time: activityDraft.time, type: activityDraft.type, company: opportunity.company, person: opportunity.contact, done: false };
    setActivities((current) => [...current, item]);
    updateOpportunity(opportunity.id, { next: `${item.type} em ${formatDate(item.date)}, ${item.time}` }, `${item.type} agendado para ${formatDate(item.date)} às ${item.time}`);
    setModal(null); setActive("Atividades"); setActivityMode("Pendentes"); setToast("Atividade agendada");
  }

  function finishActivity() {
    if (!resultDraft.id || !resultDraft.result.trim()) { setToast("Registre o resultado da atividade"); return; }
    if (!resultDraft.next.trim()) { setToast("Defina a próxima ação da negociação"); return; }
    const activity = activities.find((item) => item.id === resultDraft.id);
    if (!activity) return;
    setActivities((current) => current.map((item) => item.id === resultDraft.id ? { ...item, done: true, result: resultDraft.result.trim() } : item));
    updateOpportunity(activity.opportunityId, { next: resultDraft.next.trim() }, `${activity.type}: ${resultDraft.result.trim()}. Próxima ação: ${resultDraft.next.trim()}`);
    setModal(null); setToast("Resultado e próxima ação registrados");
  }

  function allowedTargets(opportunity: Opportunity): Stage[] {
    if (opportunity.stage === "Novo contato") return ["Qualificado", "Perdida"];
    if (opportunity.stage === "Qualificado") return ["Proposta enviada", "Perdida"];
    if (opportunity.stage === "Proposta enviada") return ["Negociação", "Ganha", "Perdida"];
    if (opportunity.stage === "Negociação") return ["Ganha", "Perdida"];
    return [];
  }

  function openTransition(target?: Stage) {
    if (!selected) return;
    const options = allowedTargets(selected);
    if (!options.length) { setToast("Esta negociação já está encerrada"); return; }
    const chosen = target && options.includes(target) ? target : options[0];
    setTransitionDraft({ target: chosen, reason: "", note: "", next: selected.next });
    setModal("transition");
  }

  function confirmTransition() {
    if (!selected) return;
    const { target, reason, note: closureNote, next } = transitionDraft;
    if (target === "Qualificado" && (!selected.phone.trim() || !selected.source.trim())) { setModal(null); setToast("Informe telefone e origem antes de qualificar"); return; }
    if (target === "Proposta enviada" && selected.value <= 0) { setModal(null); setToast("Informe o valor estimado antes de registrar o envio da proposta"); return; }
    if (!["Ganha", "Perdida"].includes(target) && !next.trim()) { setToast("Defina a próxima ação antes de mudar a etapa"); return; }
    if (target === "Perdida" && !reason) { setToast("Informe o motivo da perda"); return; }
    if (target === "Perdida" && reason === "Outro" && !closureNote.trim()) { setToast("Descreva o motivo da perda"); return; }
    const detail = target === "Perdida" ? reason === "Outro" ? closureNote.trim() : closureNote.trim() ? `${reason}: ${closureNote.trim()}` : reason : closureNote.trim();
    const previous = selected.stage;
    updateOpportunity(selected.id, { stage: target, next: ["Ganha", "Perdida"].includes(target) ? "Negociação encerrada" : next.trim(), lossReason: target === "Perdida" ? detail : undefined, closureNote: target === "Ganha" ? detail : undefined }, detail ? `${previous} → ${target}: ${detail}` : `${previous} → ${target}`);
    if (["Ganha", "Perdida"].includes(target)) setActivities((current) => current.map((activity) => activity.opportunityId === selected.id && !activity.done ? { ...activity, cancelled: true, result: "Cancelada após encerramento da negociação" } : activity));
    setModal(null); setToast(`Etapa atualizada para ${target}`);
  }

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 3);
    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha arquivos menores, com até 700 KB cada"); event.target.value = ""; return; }
    const urls = await Promise.all(files.map(fileToDataUrl));
    updateOpportunity(selected.id, { files: [...selected.files, ...urls] }, `${urls.length} arquivo(s) anexado(s)`);
    setToast("Arquivos adicionados"); event.target.value = "";
  }

  function openOpportunity(id: string) { setSelectedId(id); setActive("Oportunidades"); setStageFilter("Todas"); setQuery(""); }
  function changeArea(value: string) { setActive(value); setSelectedId(""); }

  const headerAction = active === "Oportunidades" ? <button className={styles.primaryButton} onClick={() => setModal("new")}><Icon name="plus" /> Nova oportunidade</button> : active === "Atividades" ? <button className={styles.primaryButton} onClick={() => openActivity()}><Icon name="plus" /> Nova atividade</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={active} subtitle="Uma etapa atual, um responsável e uma próxima ação clara." action={headerAction}>
    {active === "Oportunidades" ? <div className={styles.salesLayout}><section className={styles.salesTablePane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Empresa, contato, origem ou responsável" /></label><select className={styles.compactSelect} value={stageFilter} onChange={(event) => { setStageFilter(event.target.value as OpenStage | "Todas"); setSelectedId(""); }}><option>Todas</option>{openStages.map((stage) => <option key={stage}>{stage}</option>)}</select><select className={styles.compactSelect} value={opportunitySort} onChange={(event) => setOpportunitySort(event.target.value as typeof opportunitySort)}><option>Mais recentes</option><option>Maior valor</option><option>Empresa</option><option>Etapa</option></select></div><div className={styles.salesHeader}><span>Empresa</span><span>Etapa atual</span><span>Valor</span><span>Próxima ação</span><span>Responsável</span></div>{filtered.map((item) => <button key={item.id} className={`${styles.salesRow} ${selected?.id === item.id ? styles.salesSelected : ""}`} onClick={() => setSelectedId(item.id)}><div><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{item.contact}</small></div></div><StatusPill status={item.stage} /><b>{currency(item.value)}</b><span>{item.next}</span><span>{item.owner}</span></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma oportunidade aberta" description="Altere os filtros ou cadastre uma nova negociação." /> : null}</section>{selected && !["Ganha", "Perdida"].includes(selected.stage) ? <aside className={styles.salesDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.company}</h2><p>{selected.contact} · {selected.phone || "Telefone não informado"}</p></div><StatusPill status={selected.stage} /></div><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Trabalho desta etapa</h3><p>{stageGuidance(selected.stage)}</p></div></div><div className={styles.nextAction}><Icon name="calendar" /><div><strong>{selected.next}</strong><span>Responsável: {selected.owner}</span></div><button onClick={() => openActivity(selected)}>Agendar ação</button></div><div className={styles.closingActions}>{allowedTargets(selected).map((target) => <button key={target} className={target === "Perdida" ? styles.secondaryButton : styles.primaryButton} onClick={() => openTransition(target)}>{transitionLabel(target)}</button>)}</div></section><details><summary>Dados da oportunidade</summary><section className={styles.infoSection}><div className={styles.formGrid}><Field label="Empresa"><input value={selected.company} onChange={(event) => updateOpportunity(selected.id, { company: event.target.value })} /></Field><Field label="Contato"><input value={selected.contact} onChange={(event) => updateOpportunity(selected.id, { contact: event.target.value })} /></Field><Field label="Telefone"><input inputMode="tel" value={selected.phone} onChange={(event) => updateOpportunity(selected.id, { phone: event.target.value })} /></Field><Field label="Origem"><input value={selected.source} onChange={(event) => updateOpportunity(selected.id, { source: event.target.value })} /></Field><Field label="Responsável"><input value={selected.owner} onChange={(event) => updateOpportunity(selected.id, { owner: event.target.value })} /></Field><Field label="Valor estimado"><input type="number" value={selected.value} onChange={(event) => updateOpportunity(selected.id, { value: Number(event.target.value) || 0 })} /></Field><Field label="Temperatura"><select value={selected.heat} onChange={(event) => updateOpportunity(selected.id, { heat: event.target.value as Heat })}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field></div></section></details><details><summary>Histórico e arquivos</summary><section className={styles.infoSection}><Timeline items={selected.notes} /><div className={styles.quickComposer}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registrar nota ou decisão" /><button className={styles.primaryButton} onClick={addNote}>Adicionar registro</button></div><label className={styles.secondaryButton}><Icon name="plus" /> Anexar arquivos<input hidden type="file" multiple onChange={addFiles} /></label>{selected.files.length ? <p>{selected.files.length} arquivo(s) vinculado(s)</p> : null}</section></details></aside> : <EmptyState icon="spark" title="Nenhuma oportunidade selecionada" description="Escolha uma negociação para visualizar somente a etapa atual." />}</div> : null}

    {active === "Atividades" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Agenda comercial</span><h2>Atividades e retornos</h2><p>Concluir uma atividade exige resultado e próxima ação.</p></div></div><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={activityQuery} onChange={(event) => setActivityQuery(event.target.value)} placeholder="Empresa, contato ou resultado" /></label><select className={styles.compactSelect} value={activityType} onChange={(event) => setActivityType(event.target.value)}>{activityTypes.map((type) => <option key={type}>{type}</option>)}</select><select className={styles.compactSelect} value={activitySort} onChange={(event) => setActivitySort(event.target.value as typeof activitySort)}><option>Mais próximas</option><option>Mais recentes</option><option>Empresa</option></select></div><div className={styles.segmented}><button className={activityMode === "Pendentes" ? styles.segmentActive : ""} onClick={() => setActivityMode("Pendentes")}>Pendentes <span>{activities.filter((item) => !item.done && !item.cancelled).length}</span></button><button className={activityMode === "Concluídas" ? styles.segmentActive : ""} onClick={() => setActivityMode("Concluídas")}>Histórico <span>{activities.filter((item) => item.done || item.cancelled).length}</span></button></div><div className={styles.scheduleList}>{displayedActivities.map((item) => <div key={item.id} className={`${styles.scheduleRow} ${item.done || item.cancelled ? styles.completedRow : ""}`}><strong>{item.time}</strong><button type="button" onClick={() => openOpportunity(item.opportunityId)}><span>{item.type} · {formatDate(item.date)}</span><h3>{item.company}</h3><p>{item.person}{item.result ? ` · ${item.result}` : ""}</p></button>{item.cancelled ? <StatusPill status="Cancelada" /> : item.done ? <StatusPill status="Concluída" /> : <button onClick={() => { setResultDraft({ id: item.id, result: "", next: "" }); setModal("result"); }}>Registrar resultado <Icon name="chevron" /></button>}</div>)}{!displayedActivities.length ? <EmptyState icon="calendar" title={`Nenhuma atividade ${activityMode.toLowerCase()}`} description="As atividades aparecerão aqui conforme forem agendadas." /> : null}</div></section> : null}

    {active === "Contatos" ? <section className={styles.pageSheet}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Contato, empresa ou telefone" /></label><select className={styles.compactSelect} value={contactSort} onChange={(event) => setContactSort(event.target.value as typeof contactSort)}><option>Nome</option><option>Empresa</option><option>Mais oportunidades</option></select></div><div className={styles.directoryRows}>{visibleContacts.map((item) => <button key={`${item.contact}-${item.phone}`} onClick={() => openOpportunity(item.opportunityId)}><span className={styles.companyAvatar}>{item.contact.slice(0, 2).toUpperCase()}</span><div><strong>{item.contact}</strong><small>{item.company} · {item.phone || "Sem telefone"}</small></div><Icon name="chevron" /></button>)}</div></section> : null}

    {active === "Encerradas" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Decisões registradas</span><h2>Ganhos e perdas</h2><p>Clique para consultar a etapa final e o histórico.</p></div></div><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={closedQuery} onChange={(event) => setClosedQuery(event.target.value)} placeholder="Empresa, contato ou motivo" /></label><select className={styles.compactSelect} value={closedStage} onChange={(event) => setClosedStage(event.target.value as typeof closedStage)}><option>Todas</option><option>Ganha</option><option>Perdida</option></select><select className={styles.compactSelect} value={closedSort} onChange={(event) => setClosedSort(event.target.value as typeof closedSort)}><option>Mais recentes</option><option>Maior valor</option><option>Empresa</option></select></div><div className={styles.directoryRows}>{closedOpportunities.map((item) => <button key={item.id} onClick={() => { setSelectedId(item.id); setActive("Oportunidades"); }}><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{currency(item.value)} · {item.lossReason || item.closureNote || "Sem observação final"}</small></div><StatusPill status={item.stage} /></button>)}</div></section> : null}

    {active === "Oportunidades" && selected && ["Ganha", "Perdida"].includes(selected.stage) ? <section className={styles.pageSheet}><button className={styles.secondaryButton} onClick={() => { setSelectedId(""); setActive("Encerradas"); }}><Icon name="back" /> Voltar</button><div className={styles.pageHeading}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.company}</h2><p>Negociação encerrada</p></div><StatusPill status={selected.stage} /></div><div className={styles.noteBox}>{selected.lossReason || selected.closureNote || "Sem observação final"}</div><details><summary>Histórico completo</summary><Timeline items={selected.notes} /></details></section> : null}

    <Modal open={modal === "new"} title="Nova oportunidade" description="Comece com responsável e primeira ação definidos." onClose={() => setModal(null)}><Form onSubmit={createOpportunity}><div className={styles.formGrid}><Field label="Empresa"><input required value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></Field><Field label="Contato"><input required value={draft.contact} onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))} /></Field><Field label="Telefone"><input inputMode="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Origem"><input value={draft.source} onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))} /></Field><Field label="Valor estimado"><input inputMode="decimal" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} /></Field><Field label="Responsável"><input required value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))} /></Field><Field label="Temperatura"><select value={draft.heat} onChange={(event) => setDraft((current) => ({ ...current, heat: event.target.value as Heat }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field></div><Field label="Primeira ação"><input required value={draft.next} onChange={(event) => setDraft((current) => ({ ...current, next: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar em Novo contato</button></div></Form></Modal>

    <Modal open={modal === "activity"} title="Nova atividade" onClose={() => setModal(null)}><Form onSubmit={createActivity}><Field label="Oportunidade"><select required value={activityDraft.opportunityId} onChange={(event) => setActivityDraft((current) => ({ ...current, opportunityId: event.target.value }))}><option value="">Selecione</option>{opportunities.filter((item) => !["Ganha", "Perdida"].includes(item.stage)).map((item) => <option key={item.id} value={item.id}>{item.company} · {item.contact}</option>)}</select></Field><div className={styles.formGrid}><Field label="Data"><input required type="date" value={activityDraft.date} onChange={(event) => setActivityDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Horário"><input required type="time" value={activityDraft.time} onChange={(event) => setActivityDraft((current) => ({ ...current, time: event.target.value }))} /></Field><Field label="Tipo"><select value={activityDraft.type} onChange={(event) => setActivityDraft((current) => ({ ...current, type: event.target.value }))}><option>Ligação</option><option>Retorno</option><option>Reunião</option><option>Visita</option><option>Enviar proposta</option></select></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Agendar atividade</button></div></Form></Modal>

    <Modal open={modal === "result"} title="Registrar resultado" onClose={() => setModal(null)}><Form onSubmit={finishActivity}><Field label="Resultado"><textarea required value={resultDraft.result} onChange={(event) => setResultDraft((current) => ({ ...current, result: event.target.value }))} /></Field><Field label="Próxima ação"><input required value={resultDraft.next} onChange={(event) => setResultDraft((current) => ({ ...current, next: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Concluir e atualizar</button></div></Form></Modal>

    <Modal open={modal === "transition"} title="Confirmar mudança de etapa" description={selected?.company} onClose={() => setModal(null)}>{selected ? <><div className={styles.noteBox}><strong>{selected.stage}</strong> → <strong>{transitionDraft.target}</strong><br />{transitionConsequence(transitionDraft.target)}</div>{!["Ganha", "Perdida"].includes(transitionDraft.target) ? <Field label="Próxima ação"><input required value={transitionDraft.next} onChange={(event) => setTransitionDraft((current) => ({ ...current, next: event.target.value }))} /></Field> : null}{transitionDraft.target === "Perdida" ? <Field label="Motivo da perda"><select required value={transitionDraft.reason} onChange={(event) => setTransitionDraft((current) => ({ ...current, reason: event.target.value }))}><option value="">Selecione</option>{lossReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></Field> : null}<Field label={transitionDraft.target === "Ganha" ? "Observação final" : transitionDraft.target === "Perdida" ? "Detalhes" : "Observação da mudança"}><textarea value={transitionDraft.note} onChange={(event) => setTransitionDraft((current) => ({ ...current, note: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmTransition}>Confirmar mudança</button></div></> : null}</Modal>

    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)); }
function stageGuidance(stage: Stage) { if (stage === "Novo contato") return "Confirme dados e origem antes de qualificar."; if (stage === "Qualificado") return "Entenda a necessidade e informe valor antes de registrar a proposta."; if (stage === "Proposta enviada") return "Registre o retorno real do cliente antes de negociar ou encerrar."; if (stage === "Negociação") return "Mantenha a próxima ação clara até a decisão final."; return "Processo encerrado."; }
function transitionLabel(target: Stage) { if (target === "Qualificado") return "Confirmar qualificação"; if (target === "Proposta enviada") return "Registrar envio da proposta"; if (target === "Negociação") return "Iniciar negociação"; if (target === "Ganha") return "Marcar como ganha"; return "Marcar como perdida"; }
function transitionConsequence(target: Stage) { if (target === "Qualificado") return "A oportunidade sairá de Novo contato e passará a exigir preparação da proposta."; if (target === "Proposta enviada") return "O sistema registrará que uma proposta real foi enviada ao cliente."; if (target === "Negociação") return "A oportunidade passará a acompanhar ajustes e decisão do cliente."; if (target === "Ganha") return "A negociação será encerrada como ganha e sairá da lista aberta."; return "A negociação será encerrada como perdida e o motivo ficará registrado."; }
