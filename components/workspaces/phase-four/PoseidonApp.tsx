"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { currency, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type Stage = "Novo contato" | "Qualificado" | "Proposta enviada" | "Negociação" | "Ganha" | "Perdida";
type Heat = "Alta" | "Média" | "Baixa";
type Activity = { id: string; date: string; time: string; type: string; company: string; person: string; done: boolean; result?: string };
type Opportunity = { id: string; company: string; contact: string; phone: string; value: number; stage: Stage; owner: string; next: string; heat: Heat; notes: Array<{ text: string; date: string }>; files: string[] };

const initialOpportunities: Opportunity[] = [
  { id: "OP-301", company: "Solar Norte", contact: "Camila Rocha", phone: "(94) 99999-1001", value: 18000, stage: "Negociação", owner: "Alisson", next: "Ligar hoje, 15:00", heat: "Alta", notes: [{ text: "Proposta comercial visualizada", date: "Hoje, 09:10" }, { text: "Contato qualificado pela equipe", date: "Ontem" }], files: [] },
  { id: "OP-300", company: "Academia Elite", contact: "Bruno Alves", phone: "(94) 99999-1002", value: 7500, stage: "Proposta enviada", owner: "Alisson", next: "Retorno amanhã", heat: "Média", notes: [{ text: "Proposta enviada pelo WhatsApp", date: "Ontem" }], files: [] },
  { id: "OP-299", company: "Clínica Mais", contact: "Sara Lima", phone: "(94) 99999-1003", value: 12600, stage: "Qualificado", owner: "Marina", next: "Reunião hoje, 11:30", heat: "Alta", notes: [{ text: "Necessidades iniciais registradas", date: "Hoje, 08:30" }], files: [] },
  { id: "OP-298", company: "Auto Peças Pará", contact: "Rafael Melo", phone: "(94) 99999-1004", value: 4900, stage: "Novo contato", owner: "Marina", next: "Enviar apresentação", heat: "Baixa", notes: [], files: [] },
];
const initialActivities: Activity[] = [
  { id: "AT-1", date: "2026-07-22", time: "09:00", type: "Retorno", company: "Academia Elite", person: "Bruno Alves", done: false },
  { id: "AT-2", date: "2026-07-22", time: "11:30", type: "Reunião", company: "Clínica Mais", person: "Sara Lima", done: false },
  { id: "AT-3", date: "2026-07-22", time: "15:00", type: "Ligação", company: "Solar Norte", person: "Camila Rocha", done: false },
];

export function PoseidonApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Oportunidades");
  const [opportunities, setOpportunities] = useLocalState<Opportunity[]>("crmplus.poseidon.opportunities", initialOpportunities);
  const [activities, setActivities] = useLocalState<Activity[]>("crmplus.poseidon.activities", initialActivities);
  const [selectedId, setSelectedId] = useState(opportunities[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "Todas">("Todas");
  const [detailTab, setDetailTab] = useState("Atividade");
  const [modal, setModal] = useState<"new" | "activity" | "result" | null>(null);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState({ company: "", contact: "", phone: "", value: "", owner: "Alisson", next: "", heat: "Média" as Heat });
  const [activityDraft, setActivityDraft] = useState({ date: "2026-07-22", time: "09:00", type: "Ligação", company: "", person: "" });
  const [resultDraft, setResultDraft] = useState({ id: "", result: "" });
  const selected = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const nav: NavItem[] = [{ label: "Oportunidades", icon: "spark" }, { label: "Atividades", icon: "activity" }, { label: "Contatos", icon: "people" }, { label: "Histórico", icon: "history" }];

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return opportunities.filter((item) => (stageFilter === "Todas" || item.stage === stageFilter) && (!value || `${item.company} ${item.contact} ${item.owner} ${item.next}`.toLowerCase().includes(value)) && !["Ganha", "Perdida"].includes(item.stage));
  }, [opportunities, query, stageFilter]);

  function updateSelected(patch: Partial<Opportunity>, noteText?: string) {
    if (!selected) return;
    setOpportunities((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch, notes: noteText ? [{ text: noteText, date: todayLabel() }, ...item.notes] : item.notes } : item));
  }

  function createOpportunity() {
    const next: Opportunity = { id: uid("OP"), company: draft.company, contact: draft.contact, phone: draft.phone, value: Number(draft.value.replace(",", ".")) || 0, stage: "Novo contato", owner: draft.owner, next: draft.next || "Definir próximo contato", heat: draft.heat, notes: [{ text: "Oportunidade criada", date: todayLabel() }], files: [] };
    setOpportunities((current) => [next, ...current]); setSelectedId(next.id); setDraft({ company: "", contact: "", phone: "", value: "", owner: "Alisson", next: "", heat: "Média" }); setModal(null); setActive("Oportunidades"); setToast("Oportunidade criada");
  }

  function addNote() {
    if (!note.trim()) return;
    updateSelected({}, note.trim()); setNote(""); setToast("Registro adicionado ao histórico");
  }

  function createActivity() {
    const item: Activity = { id: uid("AT"), ...activityDraft, done: false };
    setActivities((current) => [...current, item].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
    setActivityDraft({ date: "2026-07-22", time: "09:00", type: "Ligação", company: "", person: "" }); setModal(null); setToast("Atividade agendada");
  }

  function finishActivity() {
    setActivities((current) => current.map((item) => item.id === resultDraft.id ? { ...item, done: true, result: resultDraft.result || "Concluída" } : item));
    const activity = activities.find((item) => item.id === resultDraft.id);
    if (activity) {
      const opportunity = opportunities.find((item) => item.company === activity.company);
      if (opportunity) setOpportunities((current) => current.map((item) => item.id === opportunity.id ? { ...item, notes: [{ text: `${activity.type}: ${resultDraft.result || "Concluída"}`, date: todayLabel() }, ...item.notes] } : item));
    }
    setResultDraft({ id: "", result: "" }); setModal(null); setToast("Resultado registrado");
  }

  function closeOpportunity(stage: "Ganha" | "Perdida") {
    updateSelected({ stage }, `Negociação encerrada como ${stage}`); setToast(`Oportunidade marcada como ${stage}`);
  }

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Carteira comercial com contexto, agenda e próxima ação — sem Kanban." action={<button className={styles.primaryButton} onClick={() => setModal("new")}><Icon name="plus" /> Nova oportunidade</button>}>
    {active === "Oportunidades" ? <div className={styles.salesLayout}><section className={styles.salesTablePane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Empresa, contato ou responsável" /></label><select className={styles.compactSelect} value={stageFilter} onChange={(event) => setStageFilter(event.target.value as Stage | "Todas")}><option>Todas</option><option>Novo contato</option><option>Qualificado</option><option>Proposta enviada</option><option>Negociação</option></select></div><div className={styles.salesHeader}><span>Empresa</span><span>Etapa</span><span>Valor</span><span>Próxima ação</span><span>Responsável</span></div>{filtered.map((item) => <button key={item.id} className={`${styles.salesRow} ${selected?.id === item.id ? styles.salesSelected : ""}`} onClick={() => { setSelectedId(item.id); setDetailTab("Atividade"); }}><div><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{item.contact}</small></div></div><StatusPill status={item.stage} /><b>{currency(item.value)}</b><span>{item.next}</span><span>{item.owner}</span></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma oportunidade" description="Altere os filtros ou cadastre uma nova negociação." /> : null}</section>{selected ? <aside className={styles.salesDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.company}</h2><p>{selected.contact} · {selected.phone}</p></div><StatusPill status={selected.heat} /></div><div className={styles.opportunityValue}><span>Valor estimado</span><strong>{currency(selected.value)}</strong><select value={selected.stage} onChange={(event) => updateSelected({ stage: event.target.value as Stage }, `Etapa alterada para ${event.target.value}`)}><option>Novo contato</option><option>Qualificado</option><option>Proposta enviada</option><option>Negociação</option><option>Ganha</option><option>Perdida</option></select></div><div className={styles.detailTabs}>{["Atividade", "Dados", "Arquivos"].map((tab) => <button key={tab} className={detailTab === tab ? styles.tabActive : ""} onClick={() => setDetailTab(tab)}>{tab}</button>)}</div>{detailTab === "Atividade" ? <><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Próxima ação</h3><p>Oportunidades sem ação ficam visivelmente incompletas.</p></div></div><div className={styles.nextAction}><Icon name="calendar" /><div><strong>{selected.next}</strong><span>Responsável: {selected.owner}</span></div><button onClick={() => updateSelected({ next: "Definir próxima ação" }, "Próxima ação concluída")}>Concluir</button></div></section><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Histórico</h3><p>Contatos e decisões em ordem cronológica.</p></div></div><Timeline items={selected.notes} /></section><div className={styles.quickComposer}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registrar nota ou resultado do contato" /><button className={styles.primaryButton} onClick={addNote}>Adicionar registro</button></div></> : null}{detailTab === "Dados" ? <section className={styles.infoSection}><div className={styles.formGrid}><Field label="Empresa"><input value={selected.company} onChange={(event) => updateSelected({ company: event.target.value })} /></Field><Field label="Contato"><input value={selected.contact} onChange={(event) => updateSelected({ contact: event.target.value })} /></Field><Field label="Telefone"><input value={selected.phone} onChange={(event) => updateSelected({ phone: event.target.value })} /></Field><Field label="Responsável"><select value={selected.owner} onChange={(event) => updateSelected({ owner: event.target.value })}><option>Alisson</option><option>Marina</option></select></Field><Field label="Valor estimado"><input type="number" value={selected.value} onChange={(event) => updateSelected({ value: Number(event.target.value) || 0 })} /></Field><Field label="Temperatura"><select value={selected.heat} onChange={(event) => updateSelected({ heat: event.target.value as Heat })}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field></div><Field label="Próxima ação"><input value={selected.next} onChange={(event) => updateSelected({ next: event.target.value })} /></Field><div className={styles.closingActions}><button className={styles.secondaryButton} onClick={() => closeOpportunity("Perdida")}>Marcar como perdida</button><button className={styles.primaryButton} onClick={() => closeOpportunity("Ganha")}>Marcar como ganha</button></div></section> : null}{detailTab === "Arquivos" ? <EmptyState icon="document" title="Sem arquivos anexados" description="Nesta fase, o protótipo mantém somente registros textuais locais." /> : null}</aside> : null}</div> : null}

    {active === "Atividades" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Agenda comercial</span><h2>Atividades e retornos</h2><p>Organizados por horário e situação.</p></div><button className={styles.primaryButton} onClick={() => setModal("activity")}><Icon name="plus" /> Nova atividade</button></div><div className={styles.scheduleList}>{activities.map((item) => <div key={item.id} className={`${styles.scheduleRow} ${item.done ? styles.completedRow : ""}`}><strong>{item.time}</strong><div><span>{item.type} · {formatDate(item.date)}</span><h3>{item.company}</h3><p>{item.person}{item.result ? ` · ${item.result}` : ""}</p></div>{item.done ? <StatusPill status="Concluída" /> : <button onClick={() => { setResultDraft({ id: item.id, result: "" }); setModal("result"); }}>Registrar resultado <Icon name="chevron" /></button>}</div>)}</div></section> : null}

    {active === "Contatos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Contatos vinculados</span><h2>Carteira de contatos</h2><p>Gerada a partir das oportunidades.</p></div></div><div className={styles.directoryRows}>{opportunities.map((item) => <button key={item.id} onClick={() => { setSelectedId(item.id); setActive("Oportunidades"); }}><span className={styles.companyAvatar}>{item.contact.slice(0, 2).toUpperCase()}</span><div><strong>{item.contact}</strong><small>{item.company} · {item.phone}</small></div><StatusPill status={item.stage} /></button>)}</div></section> : null}

    {active === "Histórico" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Negociações encerradas</span><h2>Ganhos e perdas</h2><p>Decisões registradas com histórico preservado.</p></div></div><div className={styles.directoryRows}>{opportunities.filter((item) => ["Ganha", "Perdida"].includes(item.stage)).map((item) => <button key={item.id}><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{currency(item.value)} · {item.owner}</small></div><StatusPill status={item.stage} /></button>)}{!opportunities.some((item) => ["Ganha", "Perdida"].includes(item.stage)) ? <EmptyState icon="history" title="Nenhuma negociação encerrada" description="O histórico aparecerá quando uma oportunidade for ganha ou perdida." /> : null}</div></section> : null}

    <Modal open={modal === "new"} title="Nova oportunidade" description="Cadastre o contato e já defina o próximo passo." onClose={() => setModal(null)}><Form onSubmit={createOpportunity}><div className={styles.formGrid}><Field label="Empresa"><input required value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></Field><Field label="Contato"><input required value={draft.contact} onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))} /></Field><Field label="Telefone"><input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Valor estimado"><input inputMode="decimal" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} /></Field><Field label="Responsável"><select value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))}><option>Alisson</option><option>Marina</option></select></Field><Field label="Temperatura"><select value={draft.heat} onChange={(event) => setDraft((current) => ({ ...current, heat: event.target.value as Heat }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field></div><Field label="Próxima ação"><input value={draft.next} onChange={(event) => setDraft((current) => ({ ...current, next: event.target.value }))} placeholder="Ex.: Ligar amanhã às 10:00" /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Criar oportunidade</button></div></Form></Modal>
    <Modal open={modal === "activity"} title="Nova atividade" onClose={() => setModal(null)}><Form onSubmit={createActivity}><div className={styles.formGrid}><Field label="Data"><input type="date" value={activityDraft.date} onChange={(event) => setActivityDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Horário"><input type="time" value={activityDraft.time} onChange={(event) => setActivityDraft((current) => ({ ...current, time: event.target.value }))} /></Field><Field label="Tipo"><input value={activityDraft.type} onChange={(event) => setActivityDraft((current) => ({ ...current, type: event.target.value }))} /></Field><Field label="Empresa"><input required value={activityDraft.company} onChange={(event) => setActivityDraft((current) => ({ ...current, company: event.target.value }))} /></Field></div><Field label="Pessoa"><input value={activityDraft.person} onChange={(event) => setActivityDraft((current) => ({ ...current, person: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Agendar atividade</button></div></Form></Modal>
    <Modal open={modal === "result"} title="Registrar resultado" onClose={() => setModal(null)}><Form onSubmit={finishActivity}><Field label="Resultado da atividade"><textarea value={resultDraft.result} onChange={(event) => setResultDraft((current) => ({ ...current, result: event.target.value }))} placeholder="Ex.: Cliente pediu retorno na sexta-feira" /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Concluir atividade</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)); }
