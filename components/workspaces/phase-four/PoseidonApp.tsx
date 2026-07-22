"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { currency, fileToDataUrl, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type Stage = "Novo contato" | "Qualificado" | "Proposta enviada" | "Negociação" | "Ganha" | "Perdida";
type Heat = "Alta" | "Média" | "Baixa";
type Activity = { id: string; opportunityId?: string; date: string; time: string; type: string; company: string; person: string; done: boolean; result?: string };
type Opportunity = { id: string; company: string; contact: string; phone: string; value: number; stage: Stage; owner: string; next: string; heat: Heat; notes: Array<{ text: string; date: string }>; files: string[] };

const initialOpportunities: Opportunity[] = [
  { id: "OP-301", company: "Solar Norte", contact: "Camila Rocha", phone: "(94) 99999-1001", value: 18000, stage: "Negociação", owner: "Alisson", next: "Ligar hoje, 15:00", heat: "Alta", notes: [{ text: "Proposta comercial visualizada", date: "Hoje, 09:10" }, { text: "Contato qualificado pela equipe", date: "Ontem" }], files: [] },
  { id: "OP-300", company: "Academia Elite", contact: "Bruno Alves", phone: "(94) 99999-1002", value: 7500, stage: "Proposta enviada", owner: "Alisson", next: "Retorno amanhã", heat: "Média", notes: [{ text: "Proposta enviada pelo WhatsApp", date: "Ontem" }], files: [] },
  { id: "OP-299", company: "Clínica Mais", contact: "Sara Lima", phone: "(94) 99999-1003", value: 12600, stage: "Qualificado", owner: "Marina", next: "Reunião hoje, 11:30", heat: "Alta", notes: [{ text: "Necessidades iniciais registradas", date: "Hoje, 08:30" }], files: [] },
  { id: "OP-298", company: "Auto Peças Pará", contact: "Rafael Melo", phone: "(94) 99999-1004", value: 4900, stage: "Novo contato", owner: "Marina", next: "Enviar apresentação", heat: "Baixa", notes: [], files: [] },
];
const initialActivities: Activity[] = [
  { id: "AT-1", opportunityId: "OP-300", date: "2026-07-22", time: "09:00", type: "Retorno", company: "Academia Elite", person: "Bruno Alves", done: false },
  { id: "AT-2", opportunityId: "OP-299", date: "2026-07-22", time: "11:30", type: "Reunião", company: "Clínica Mais", person: "Sara Lima", done: false },
  { id: "AT-3", opportunityId: "OP-301", date: "2026-07-22", time: "15:00", type: "Ligação", company: "Solar Norte", person: "Camila Rocha", done: false },
];

export function PoseidonApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Oportunidades");
  const [opportunities, setOpportunities] = useLocalState<Opportunity[]>("crmplus.poseidon.opportunities", initialOpportunities);
  const [activities, setActivities] = useLocalState<Activity[]>("crmplus.poseidon.activities", initialActivities);
  const [selectedId, setSelectedId] = useState(opportunities[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "Todas">("Todas");
  const [detailTab, setDetailTab] = useState("Atividade");
  const [activityMode, setActivityMode] = useState<"Pendentes" | "Concluídas">("Pendentes");
  const [modal, setModal] = useState<"new" | "activity" | "result" | null>(null);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState({ company: "", contact: "", phone: "", value: "", owner: "", next: "", heat: "Média" as Heat });
  const [activityDraft, setActivityDraft] = useState({ opportunityId: "", date: new Date().toISOString().slice(0, 10), time: "09:00", type: "Ligação" });
  const [resultDraft, setResultDraft] = useState({ id: "", result: "" });

  const selected = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const nav: NavItem[] = [{ label: "Oportunidades", icon: "spark" }, { label: "Atividades", icon: "activity" }, { label: "Contatos", icon: "people" }, { label: "Histórico", icon: "history" }];

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return opportunities.filter((item) => {
      const closed = ["Ganha", "Perdida"].includes(item.stage);
      const keepSelectedClosed = closed && item.id === selectedId;
      return (!closed || keepSelectedClosed) && (stageFilter === "Todas" || item.stage === stageFilter || keepSelectedClosed) && (!value || `${item.company} ${item.contact} ${item.owner} ${item.next}`.toLowerCase().includes(value));
    });
  }, [opportunities, query, selectedId, stageFilter]);

  const displayedActivities = useMemo(() => activities.filter((item) => activityMode === "Pendentes" ? !item.done : item.done).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [activities, activityMode]);
  const contacts = useMemo(() => {
    const map = new Map<string, { contact: string; company: string; phone: string; opportunityId: string; count: number }>();
    opportunities.forEach((item) => {
      const key = `${item.contact.toLowerCase()}|${item.phone}`;
      const current = map.get(key);
      map.set(key, { contact: item.contact, company: item.company, phone: item.phone, opportunityId: item.id, count: (current?.count ?? 0) + 1 });
    });
    return Array.from(map.values());
  }, [opportunities]);

  function updateOpportunity(id: string, patch: Partial<Opportunity>, noteText?: string) {
    setOpportunities((current) => current.map((item) => item.id === id ? { ...item, ...patch, notes: noteText ? [{ text: noteText, date: todayLabel() }, ...item.notes] : item.notes } : item));
  }

  function updateSelected(patch: Partial<Opportunity>, noteText?: string) {
    if (!selected) return;
    updateOpportunity(selected.id, patch, noteText);
  }

  function createOpportunity() {
    if (!draft.company.trim() || !draft.contact.trim()) { setToast("Informe empresa e contato"); return; }
    const next: Opportunity = { id: uid("OP"), company: draft.company.trim(), contact: draft.contact.trim(), phone: draft.phone.trim(), value: Number(draft.value.replace(",", ".")) || 0, stage: "Novo contato", owner: draft.owner.trim() || "Não atribuído", next: draft.next.trim() || "Definir próximo contato", heat: draft.heat, notes: [{ text: "Oportunidade criada", date: todayLabel() }], files: [] };
    setOpportunities((current) => [next, ...current]);
    setSelectedId(next.id);
    setDraft({ company: "", contact: "", phone: "", value: "", owner: "", next: "", heat: "Média" });
    setModal(null);
    setActive("Oportunidades");
    setDetailTab("Atividade");
    setToast("Oportunidade criada");
  }

  function addNote() {
    if (!note.trim()) return;
    updateSelected({}, note.trim());
    setNote("");
    setToast("Registro adicionado ao histórico");
  }

  function openActivity(opportunity?: Opportunity) {
    const target = opportunity ?? selected ?? opportunities[0];
    setActivityDraft({ opportunityId: target?.id ?? "", date: new Date().toISOString().slice(0, 10), time: "09:00", type: "Ligação" });
    setModal("activity");
  }

  function createActivity() {
    const opportunity = opportunities.find((item) => item.id === activityDraft.opportunityId);
    if (!opportunity) { setToast("Selecione uma oportunidade"); return; }
    if (!activityDraft.date || !activityDraft.time) { setToast("Informe data e horário"); return; }
    const item: Activity = { id: uid("AT"), opportunityId: opportunity.id, date: activityDraft.date, time: activityDraft.time, type: activityDraft.type.trim() || "Contato", company: opportunity.company, person: opportunity.contact, done: false };
    setActivities((current) => [...current, item]);
    updateOpportunity(opportunity.id, { next: `${item.type} em ${formatDate(item.date)}, ${item.time}` }, `${item.type} agendado para ${formatDate(item.date)} às ${item.time}`);
    setActivityDraft({ opportunityId: "", date: new Date().toISOString().slice(0, 10), time: "09:00", type: "Ligação" });
    setModal(null);
    setActive("Atividades");
    setActivityMode("Pendentes");
    setToast("Atividade agendada");
  }

  function finishActivity() {
    if (!resultDraft.id) return;
    if (!resultDraft.result.trim()) { setToast("Registre o resultado da atividade"); return; }
    const activity = activities.find((item) => item.id === resultDraft.id);
    if (!activity) return;
    setActivities((current) => current.map((item) => item.id === resultDraft.id ? { ...item, done: true, result: resultDraft.result.trim() } : item));
    const opportunity = opportunities.find((item) => item.id === activity.opportunityId) ?? opportunities.find((item) => item.company === activity.company && item.contact === activity.person);
    if (opportunity) updateOpportunity(opportunity.id, { next: "Definir próxima ação" }, `${activity.type}: ${resultDraft.result.trim()}`);
    setResultDraft({ id: "", result: "" });
    setModal(null);
    setToast("Resultado registrado");
  }

  function closeOpportunity(stage: "Ganha" | "Perdida") {
    if (!selected) return;
    if (stage === "Perdida" && !window.confirm("Marcar esta oportunidade como perdida?")) return;
    updateSelected({ stage, next: "Negociação encerrada" }, `Negociação encerrada como ${stage}`);
    setToast(`Oportunidade marcada como ${stage}`);
  }

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 3);
    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha arquivos menores, com até 700 KB cada"); event.target.value = ""; return; }
    const urls = await Promise.all(files.map(fileToDataUrl));
    updateSelected({ files: [...selected.files, ...urls] }, `${urls.length} arquivo(s) anexado(s)`);
    setToast("Arquivos adicionados");
    event.target.value = "";
  }

  function openOpportunity(id: string, tab = "Atividade") {
    setSelectedId(id);
    setDetailTab(tab);
    setActive("Oportunidades");
    setStageFilter("Todas");
    setQuery("");
  }

  const headerAction = active === "Oportunidades"
    ? <button className={styles.primaryButton} onClick={() => setModal("new")}><Icon name="plus" /> Nova oportunidade</button>
    : active === "Atividades"
      ? <button className={styles.primaryButton} disabled={!opportunities.length} onClick={() => openActivity()}><Icon name="plus" /> Nova atividade</button>
      : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Carteira comercial com contexto, agenda e uma próxima ação clara." action={headerAction}>
    {active === "Oportunidades" ? <div className={styles.salesLayout}><section className={styles.salesTablePane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Empresa, contato ou responsável" /></label><select className={styles.compactSelect} value={stageFilter} onChange={(event) => setStageFilter(event.target.value as Stage | "Todas")}><option>Todas</option><option>Novo contato</option><option>Qualificado</option><option>Proposta enviada</option><option>Negociação</option></select></div><div className={styles.salesHeader}><span>Empresa</span><span>Etapa</span><span>Valor</span><span>Próxima ação</span><span>Responsável</span></div>{filtered.map((item) => <button key={item.id} className={`${styles.salesRow} ${selected?.id === item.id ? styles.salesSelected : ""}`} onClick={() => { setSelectedId(item.id); setDetailTab("Atividade"); }}><div><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{item.contact}</small></div></div><StatusPill status={item.stage} /><b>{currency(item.value)}</b><span>{item.next}</span><span>{item.owner}</span></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma oportunidade" description="Altere os filtros ou cadastre uma nova negociação." /> : null}</section>{selected ? <aside className={styles.salesDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.company}</h2><p>{selected.contact} · {selected.phone || "Telefone não informado"}</p></div><StatusPill status={selected.heat} /></div><div className={styles.opportunityValue}><span>Valor estimado</span><strong>{currency(selected.value)}</strong><select value={selected.stage} onChange={(event) => updateSelected({ stage: event.target.value as Stage }, `Etapa alterada para ${event.target.value}`)}><option>Novo contato</option><option>Qualificado</option><option>Proposta enviada</option><option>Negociação</option><option>Ganha</option><option>Perdida</option></select></div><div className={styles.detailTabs}>{["Atividade", "Dados", "Arquivos"].map((tab) => <button key={tab} className={detailTab === tab ? styles.tabActive : ""} onClick={() => setDetailTab(tab)}>{tab}</button>)}</div>{detailTab === "Atividade" ? <><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Próxima ação</h3><p>Agende o contato necessário para esta negociação.</p></div></div><div className={styles.nextAction}><Icon name="calendar" /><div><strong>{selected.next}</strong><span>Responsável: {selected.owner}</span></div>{!["Ganha", "Perdida"].includes(selected.stage) ? <button onClick={() => openActivity(selected)}>Agendar ação</button> : <StatusPill status="Encerrada" />}</div></section><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Histórico</h3><p>Contatos e decisões em ordem cronológica.</p></div></div><Timeline items={selected.notes} /></section><div className={styles.quickComposer}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registrar nota ou resultado do contato" /><button className={styles.primaryButton} onClick={addNote}>Adicionar registro</button></div></> : null}{detailTab === "Dados" ? <section className={styles.infoSection}><div className={styles.formGrid}><Field label="Empresa"><input value={selected.company} onChange={(event) => updateSelected({ company: event.target.value })} /></Field><Field label="Contato"><input value={selected.contact} onChange={(event) => updateSelected({ contact: event.target.value })} /></Field><Field label="Telefone"><input inputMode="tel" value={selected.phone} onChange={(event) => updateSelected({ phone: event.target.value })} /></Field><Field label="Responsável"><input value={selected.owner} onChange={(event) => updateSelected({ owner: event.target.value })} /></Field><Field label="Valor estimado"><input type="number" value={selected.value} onChange={(event) => updateSelected({ value: Number(event.target.value) || 0 })} /></Field><Field label="Temperatura"><select value={selected.heat} onChange={(event) => updateSelected({ heat: event.target.value as Heat })}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field></div><Field label="Próxima ação"><input value={selected.next} onChange={(event) => updateSelected({ next: event.target.value })} /></Field>{!["Ganha", "Perdida"].includes(selected.stage) ? <div className={styles.closingActions}><button className={styles.secondaryButton} onClick={() => closeOpportunity("Perdida")}>Marcar como perdida</button><button className={styles.primaryButton} onClick={() => closeOpportunity("Ganha")}>Marcar como ganha</button></div> : <div className={styles.noteBox}>Negociação encerrada como {selected.stage}. O histórico permanece disponível para consulta.</div>}</section> : null}{detailTab === "Arquivos" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Arquivos da oportunidade</h3><p>Propostas, imagens e documentos vinculados à negociação.</p></div><label className={styles.secondaryButton}><Icon name="plus" /> Anexar<input hidden type="file" multiple onChange={addFiles} /></label></div><div className={styles.fileRows}>{selected.files.map((file, index) => <div key={`${file.slice(0, 24)}-${index}`}><Icon name="document" /><div><strong>Arquivo {index + 1}</strong><small>Documento vinculado</small></div><button className={styles.iconButton} aria-label={`Remover arquivo ${index + 1}`} onClick={() => updateSelected({ files: selected.files.filter((_, fileIndex) => fileIndex !== index) }, `Arquivo ${index + 1} removido`)}><Icon name="trash" /></button></div>)}</div>{!selected.files.length ? <EmptyState icon="document" title="Sem arquivos anexados" description="Adicione propostas, imagens ou documentos relacionados à oportunidade." action={<label className={styles.primaryButton}>Selecionar arquivos<input hidden type="file" multiple onChange={addFiles} /></label>} /> : null}</section> : null}</aside> : null}</div> : null}

    {active === "Atividades" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Agenda comercial</span><h2>Atividades e retornos</h2><p>Cada atividade permanece ligada à oportunidade correta.</p></div></div><div className={styles.segmented}><button className={activityMode === "Pendentes" ? styles.segmentActive : ""} onClick={() => setActivityMode("Pendentes")}>Pendentes <span>{activities.filter((item) => !item.done).length}</span></button><button className={activityMode === "Concluídas" ? styles.segmentActive : ""} onClick={() => setActivityMode("Concluídas")}>Concluídas <span>{activities.filter((item) => item.done).length}</span></button></div><div className={styles.scheduleList}>{displayedActivities.map((item) => <div key={item.id} className={`${styles.scheduleRow} ${item.done ? styles.completedRow : ""}`}><strong>{item.time}</strong><button type="button" onClick={() => { const opportunity = opportunities.find((entry) => entry.id === item.opportunityId) ?? opportunities.find((entry) => entry.company === item.company); if (opportunity) openOpportunity(opportunity.id); }}><span>{item.type} · {formatDate(item.date)}</span><h3>{item.company}</h3><p>{item.person}{item.result ? ` · ${item.result}` : ""}</p></button>{item.done ? <StatusPill status="Concluída" /> : <button onClick={() => { setResultDraft({ id: item.id, result: "" }); setModal("result"); }}>Registrar resultado <Icon name="chevron" /></button>}</div>)}{!displayedActivities.length ? <EmptyState icon="calendar" title={`Nenhuma atividade ${activityMode.toLowerCase()}`} description={activityMode === "Pendentes" ? "Agende a próxima ação de uma oportunidade." : "As atividades concluídas aparecerão aqui."} /> : null}</div></section> : null}

    {active === "Contatos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Contatos vinculados</span><h2>Carteira de contatos</h2><p>Pessoas reunidas sem repetir o mesmo contato.</p></div></div><div className={styles.directoryRows}>{contacts.map((item) => <button key={`${item.contact}-${item.phone}`} onClick={() => openOpportunity(item.opportunityId)}><span className={styles.companyAvatar}>{item.contact.slice(0, 2).toUpperCase()}</span><div><strong>{item.contact}</strong><small>{item.company} · {item.phone || "Sem telefone"}{item.count > 1 ? ` · ${item.count} oportunidades` : ""}</small></div><Icon name="chevron" /></button>)}{!contacts.length ? <EmptyState icon="people" title="Nenhum contato cadastrado" description="Os contatos aparecerão a partir das oportunidades." /> : null}</div></section> : null}

    {active === "Histórico" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Negociações encerradas</span><h2>Ganhos e perdas</h2><p>Decisões registradas com histórico preservado.</p></div></div><div className={styles.directoryRows}>{opportunities.filter((item) => ["Ganha", "Perdida"].includes(item.stage)).map((item) => <button key={item.id} onClick={() => openOpportunity(item.id)}><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{currency(item.value)} · {item.owner}</small></div><StatusPill status={item.stage} /></button>)}{!opportunities.some((item) => ["Ganha", "Perdida"].includes(item.stage)) ? <EmptyState icon="history" title="Nenhuma negociação encerrada" description="O histórico aparecerá quando uma oportunidade for ganha ou perdida." /> : null}</div></section> : null}

    <Modal open={modal === "new"} title="Nova oportunidade" description="Cadastre o contato e já defina o próximo passo." onClose={() => setModal(null)}><Form onSubmit={createOpportunity}><div className={styles.formGrid}><Field label="Empresa"><input required value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} /></Field><Field label="Contato"><input required value={draft.contact} onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))} /></Field><Field label="Telefone"><input inputMode="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Valor estimado"><input inputMode="decimal" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} /></Field><Field label="Responsável"><input value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))} /></Field><Field label="Temperatura"><select value={draft.heat} onChange={(event) => setDraft((current) => ({ ...current, heat: event.target.value as Heat }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></Field></div><Field label="Próxima ação"><input value={draft.next} onChange={(event) => setDraft((current) => ({ ...current, next: event.target.value }))} placeholder="Ex.: Ligar amanhã às 10:00" /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar oportunidade</button></div></Form></Modal>
    <Modal open={modal === "activity"} title="Nova atividade" description="A atividade será vinculada à oportunidade selecionada." onClose={() => setModal(null)}><Form onSubmit={createActivity}><Field label="Oportunidade"><select required value={activityDraft.opportunityId} onChange={(event) => setActivityDraft((current) => ({ ...current, opportunityId: event.target.value }))}><option value="">Selecione</option>{opportunities.filter((item) => !["Ganha", "Perdida"].includes(item.stage)).map((item) => <option key={item.id} value={item.id}>{item.company} · {item.contact}</option>)}</select></Field><div className={styles.formGrid}><Field label="Data"><input required type="date" value={activityDraft.date} onChange={(event) => setActivityDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Horário"><input required type="time" value={activityDraft.time} onChange={(event) => setActivityDraft((current) => ({ ...current, time: event.target.value }))} /></Field><Field label="Tipo"><select value={activityDraft.type} onChange={(event) => setActivityDraft((current) => ({ ...current, type: event.target.value }))}><option>Ligação</option><option>Retorno</option><option>Reunião</option><option>Visita</option><option>Enviar proposta</option></select></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Agendar atividade</button></div></Form></Modal>
    <Modal open={modal === "result"} title="Registrar resultado" onClose={() => setModal(null)}><Form onSubmit={finishActivity}><Field label="Resultado da atividade"><textarea required value={resultDraft.result} onChange={(event) => setResultDraft((current) => ({ ...current, result: event.target.value }))} placeholder="Ex.: Cliente pediu retorno na sexta-feira" /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Concluir atividade</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)); }
