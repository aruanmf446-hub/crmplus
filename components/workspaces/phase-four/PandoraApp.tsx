"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, ScoreBadge, StatusPill, Toast, type NavItem } from "./shared";
import { copyText, downloadCsv, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type FeedbackStatus = "Novo" | "Em análise" | "Aguardando retorno" | "Tratado";
type Feedback = { id: string; customer: string; score: number; channel: string; date: string; comment: string; theme: string; status: FeedbackStatus; priority: boolean; treatment: string; owner: string; dueDate: string; customerReturn: string };
type Survey = { id: string; name: string; question: string; active: boolean; createdAt: string };

const initialFeedbacks: Feedback[] = [
  { id: "R-884", customer: "Marina Costa", score: 3, channel: "Pós-atendimento", date: "Hoje, 08:42", comment: "O atendimento foi bom, mas esperei muito para receber uma atualização.", theme: "Tempo de resposta", status: "Em análise", priority: true, treatment: "Revisar o padrão de atualização durante atendimentos demorados.", owner: "Juliana", dueDate: "2026-07-23", customerReturn: "" },
  { id: "R-883", customer: "Ricardo Souza", score: 10, channel: "Entrega de serviço", date: "Ontem, 17:10", comment: "Equipe muito atenciosa e serviço concluído antes do prazo.", theme: "Atendimento", status: "Novo", priority: false, treatment: "", owner: "", dueDate: "", customerReturn: "" },
  { id: "R-882", customer: "Ana Paula", score: 6, channel: "Pós-venda", date: "Ontem, 14:22", comment: "Faltou explicar melhor o que estava incluído no serviço.", theme: "Comunicação", status: "Aguardando retorno", priority: true, treatment: "Texto de entrega revisado e equipe orientada.", owner: "Marcos", dueDate: "2026-07-22", customerReturn: "Retornar para explicar novamente o escopo." },
  { id: "R-881", customer: "Carlos Mendes", score: 9, channel: "Entrega de serviço", date: "21 jul, 11:05", comment: "Gostei da facilidade e da rapidez para resolver tudo.", theme: "Agilidade", status: "Tratado", priority: false, treatment: "Elogio compartilhado com a equipe.", owner: "Juliana", dueDate: "2026-07-21", customerReturn: "Agradecimento enviado ao cliente." },
];
const initialSurveys: Survey[] = [
  { id: "PESQ-01", name: "Pós-atendimento", question: "De 0 a 10, quanto você recomendaria nosso atendimento?", active: true, createdAt: "10 jul 2026" },
  { id: "PESQ-02", name: "Entrega de serviço", question: "Como foi sua experiência na entrega?", active: true, createdAt: "12 jul 2026" },
];

export function PandoraApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Respostas");
  const [feedbacks, setFeedbacks] = useLocalState<Feedback[]>("crmplus.pandora.feedbacks.v2", initialFeedbacks);
  const [surveys, setSurveys] = useLocalState<Survey[]>("crmplus.pandora.surveys.v2", initialSurveys);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"Todas" | "Detratores" | "Neutros" | "Promotores">("Todas");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "Todas">("Todas");
  const [modal, setModal] = useState<"survey" | "theme" | "response" | "poster" | "transition" | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<FeedbackStatus>("Em análise");
  const [toast, setToast] = useState("");
  const [surveyDraft, setSurveyDraft] = useState({ id: "", name: "", question: "De 0 a 10, quanto você recomendaria nossa empresa?" });
  const [themeDraft, setThemeDraft] = useState("");
  const [posterSurvey, setPosterSurvey] = useState<Survey | null>(null);
  const [responseSurvey, setResponseSurvey] = useState<Survey | null>(null);
  const [responseDraft, setResponseDraft] = useState({ customer: "", score: 8, comment: "", theme: "Atendimento" });

  const selected = feedbacks.find((item) => item.id === selectedId);
  const nav: NavItem[] = [{ label: "Respostas", icon: "inbox" }, { label: "Pesquisas", icon: "clipboard" }, { label: "Compartilhar", icon: "arrow" }, { label: "Temas", icon: "tag" }];
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return feedbacks.filter((feedback) => {
      const scoreGroup = feedback.score <= 6 ? "Detratores" : feedback.score <= 8 ? "Neutros" : "Promotores";
      return (group === "Todas" || group === scoreGroup) && (statusFilter === "Todas" || feedback.status === statusFilter) && (!value || `${feedback.customer} ${feedback.comment} ${feedback.theme} ${feedback.channel} ${feedback.owner}`.toLowerCase().includes(value));
    });
  }, [feedbacks, group, query, statusFilter]);
  const themeStats = useMemo(() => {
    const counts = new Map<string, { count: number; score: number; pending: number }>();
    feedbacks.forEach((feedback) => { const current = counts.get(feedback.theme) ?? { count: 0, score: 0, pending: 0 }; counts.set(feedback.theme, { count: current.count + 1, score: current.score + feedback.score, pending: current.pending + (feedback.status === "Tratado" ? 0 : 1) }); });
    return Array.from(counts.entries()).map(([name, data]) => ({ name, count: data.count, pending: data.pending, average: data.score / data.count })).sort((a, b) => b.count - a.count);
  }, [feedbacks]);
  const promoters = feedbacks.filter((item) => item.score >= 9).length;
  const detractors = feedbacks.filter((item) => item.score <= 6).length;
  const nps = feedbacks.length ? Math.round(((promoters - detractors) / feedbacks.length) * 100) : 0;
  const pendingCount = feedbacks.filter((item) => item.status !== "Tratado").length;
  const priorityCount = feedbacks.filter((item) => item.priority && item.status !== "Tratado").length;
  const overdueCount = feedbacks.filter((item) => item.status !== "Tratado" && item.dueDate && isPast(item.dueDate)).length;

  function updateSelected(patch: Partial<Feedback>) { if (selected) setFeedbacks((current) => current.map((feedback) => feedback.id === selected.id ? { ...feedback, ...patch } : feedback)); }
  function changeArea(value: string) { setActive(value); setSelectedId(""); }
  function surveyResponseCount(survey: Survey) { return feedbacks.filter((feedback) => feedback.channel === survey.name).length; }

  function allowedTargets(feedback: Feedback): FeedbackStatus[] {
    if (feedback.status === "Novo") return ["Em análise"];
    if (feedback.status === "Em análise") return ["Aguardando retorno", "Tratado"];
    if (feedback.status === "Aguardando retorno") return ["Tratado", "Em análise"];
    return ["Em análise"];
  }

  function openTransition(target?: FeedbackStatus) {
    if (!selected) return;
    const options = allowedTargets(selected);
    setTransitionTarget(target && options.includes(target) ? target : options[0]);
    setModal("transition");
  }

  function confirmTransition() {
    if (!selected) return;
    if (transitionTarget === "Em análise" && (!selected.owner.trim() || !selected.dueDate)) { setModal(null); setToast("Defina responsável e prazo antes de iniciar ou reabrir a análise"); return; }
    if (["Aguardando retorno", "Tratado"].includes(transitionTarget) && !selected.treatment.trim()) { setModal(null); setToast("Descreva a ação realizada ou planejada antes de continuar"); return; }
    if (["Aguardando retorno", "Tratado"].includes(transitionTarget) && (!selected.owner.trim() || !selected.dueDate)) { setModal(null); setToast("Defina responsável e prazo antes de continuar"); return; }
    if (transitionTarget === "Tratado" && selected.score <= 6 && !selected.customerReturn.trim()) { setModal(null); setToast("Registre o retorno dado ou planejado ao cliente"); return; }
    const previous = selected.status;
    updateSelected({ status: transitionTarget, priority: transitionTarget === "Tratado" ? false : selected.priority });
    setModal(null); setToast(`${previous} → ${transitionTarget} confirmado`);
  }

  function openTheme() { if (selected) { setThemeDraft(selected.theme); setModal("theme"); } }
  function saveTheme() { if (!themeDraft.trim()) return; updateSelected({ theme: themeDraft.trim() }); setModal(null); setToast("Tema atualizado"); }
  function openNewSurvey() { setSurveyDraft({ id: "", name: "", question: "De 0 a 10, quanto você recomendaria nossa empresa?" }); setModal("survey"); }
  function openEditSurvey(survey: Survey) { setSurveyDraft({ id: survey.id, name: survey.name, question: survey.question }); setModal("survey"); }
  function saveSurvey() {
    const name = surveyDraft.name.trim(); const question = surveyDraft.question.trim();
    if (!name || !question) { setToast("Informe nome e pergunta da pesquisa"); return; }
    if (surveyDraft.id) {
      const previousName = surveys.find((survey) => survey.id === surveyDraft.id)?.name;
      setSurveys((current) => current.map((survey) => survey.id === surveyDraft.id ? { ...survey, name, question } : survey));
      if (previousName && previousName !== name) setFeedbacks((current) => current.map((feedback) => feedback.channel === previousName ? { ...feedback, channel: name } : feedback));
    } else setSurveys((current) => [{ id: uid("PESQ"), name, question, active: true, createdAt: todayLabel() }, ...current]);
    setModal(null); setActive("Pesquisas"); setToast(surveyDraft.id ? "Pesquisa atualizada" : "Pesquisa criada");
  }
  function toggleSurvey(survey: Survey) { const action = survey.active ? "Pausar" : "Ativar"; if (!window.confirm(`${action} a pesquisa “${survey.name}”?`)) return; setSurveys((current) => current.map((item) => item.id === survey.id ? { ...item, active: !item.active } : item)); }
  function removeSurvey(survey: Survey) { if (!window.confirm(`Remover a pesquisa “${survey.name}”? As respostas continuarão preservadas.`)) return; setSurveys((current) => current.filter((item) => item.id !== survey.id)); }
  async function copyInvite(survey: Survey) { await copyText(`Olá! Queremos ouvir você. ${survey.question} Envie uma nota de 0 a 10 e, se desejar, um comentário.`); setToast("Convite copiado"); }
  async function copyQuestion(survey: Survey) { await copyText(survey.question); setToast("Pergunta copiada"); }
  function exportResponses() { downloadCsv("respostas-pandora.csv", [["Código", "Cliente", "Nota", "Pesquisa", "Tema", "Situação", "Prioridade", "Responsável", "Prazo", "Comentário", "Ação", "Retorno ao cliente"], ...feedbacks.map((item) => [item.id, item.customer, item.score, item.channel, item.theme, item.status, item.priority ? "Sim" : "Não", item.owner, item.dueDate, item.comment, item.treatment, item.customerReturn])]); setToast("Planilha de respostas gerada"); }
  function openResponse(survey: Survey) { if (!survey.active) { setToast("Ative a pesquisa antes de receber respostas"); return; } setResponseSurvey(survey); setResponseDraft({ customer: "", score: 8, comment: "", theme: "Atendimento" }); setModal("response"); }
  function saveResponse() {
    if (!responseSurvey?.active || !responseDraft.comment.trim()) { setToast("Informe o comentário da resposta"); return; }
    const feedback: Feedback = { id: uid("R"), customer: responseDraft.customer.trim() || "Cliente não identificado", score: responseDraft.score, channel: responseSurvey.name, date: todayLabel(), comment: responseDraft.comment.trim(), theme: responseDraft.theme, status: "Novo", priority: responseDraft.score <= 6, treatment: "", owner: "", dueDate: "", customerReturn: "" };
    setFeedbacks((current) => [feedback, ...current]); setSelectedId(feedback.id); setModal(null); setActive("Respostas"); setToast("Resposta adicionada na etapa Novo");
  }

  const headerAction = active === "Pesquisas" ? <button className={styles.primaryButton} onClick={openNewSurvey}><Icon name="plus" /> Nova pesquisa</button> : active === "Respostas" ? <button className={styles.secondaryButton} disabled={!feedbacks.length} onClick={exportResponses}><Icon name="download" /> Exportar</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={active} subtitle="Uma resposta por vez: analisar, agir, retornar e concluir." action={headerAction}>
    {active === "Respostas" ? <><div className={styles.summaryGrid}><div><span>NPS atual</span><strong>{nps}</strong></div><div><span>Aguardando ação</span><strong>{pendingCount}</strong></div><div><span>Prioridades abertas</span><strong>{priorityCount}</strong></div><div><span>Prazos vencidos</span><strong>{overdueCount}</strong></div></div><div className={styles.feedbackLayout}><section className={styles.feedbackInbox}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente, tema ou responsável" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as FeedbackStatus | "Todas"); setSelectedId(""); }}><option>Todas</option><option>Novo</option><option>Em análise</option><option>Aguardando retorno</option><option>Tratado</option></select></div><div className={styles.feedbackFilter}>{(["Todas", "Detratores", "Neutros", "Promotores"] as const).map((item) => <button key={item} className={group === item ? styles.segmentActive : ""} onClick={() => { setGroup(item); setSelectedId(""); }}>{item}</button>)}</div>{filtered.map((feedback) => <button key={feedback.id} className={`${styles.feedbackRow} ${selected?.id === feedback.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(feedback.id)}><ScoreBadge score={feedback.score} /><div><div><strong>{feedback.customer}</strong><span>{feedback.date}</span></div><p>{feedback.comment}</p><small>Próxima ação: {feedbackNext(feedback)}</small></div><StatusPill status={feedback.status} /></button>)}</section>{selected ? <section className={styles.feedbackDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id} · etapa atual</span><h2>{selected.customer}</h2><p>{selected.channel}</p></div><StatusPill status={selected.status} /></div><blockquote>“{selected.comment}”</blockquote><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Trabalho desta etapa</h3><p>{feedbackGuidance(selected)}</p></div></div><div className={styles.formGrid}><Field label="Responsável"><input value={selected.owner} onChange={(event) => updateSelected({ owner: event.target.value })} /></Field><Field label="Prazo"><input type="date" value={selected.dueDate} onChange={(event) => updateSelected({ dueDate: event.target.value })} /></Field></div>{selected.status !== "Novo" ? <Field label="Ação realizada ou planejada"><textarea value={selected.treatment} onChange={(event) => updateSelected({ treatment: event.target.value })} /></Field> : null}{selected.status === "Aguardando retorno" || selected.status === "Tratado" ? <Field label="Retorno ao cliente"><textarea value={selected.customerReturn} onChange={(event) => updateSelected({ customerReturn: event.target.value })} /></Field> : null}<div className={styles.alignRight}>{allowedTargets(selected).map((target) => <button key={target} className={target === "Tratado" ? styles.primaryButton : styles.secondaryButton} onClick={() => openTransition(target)}>{feedbackAction(target)}</button>)}</div></section><details><summary>Classificação e dados originais</summary><section className={styles.infoSection}><div className={styles.feedbackMeta}><div><span>Tema</span><strong>{selected.theme}</strong></div><div><span>Nota</span><ScoreBadge score={selected.score} /></div></div><button className={styles.secondaryButton} onClick={openTheme}>Alterar tema</button><button className={styles.secondaryButton} onClick={() => updateSelected({ priority: !selected.priority })}>{selected.priority ? "Remover prioridade" : "Marcar prioridade"}</button></section></details></section> : <EmptyState icon="inbox" title="Nenhuma resposta selecionada" description="Escolha uma resposta para visualizar somente a etapa atual." />}</div></> : null}

    {active === "Pesquisas" ? <section className={styles.pageSheet}><div className={styles.surveyRows}>{surveys.map((survey) => <article key={survey.id}><div><StatusPill status={survey.active ? "Ativa" : "Pausada"} /><h3>{survey.name}</h3><p>{survey.question}</p><small>{surveyResponseCount(survey)} resposta(s)</small></div><div><button className={styles.primaryButton} disabled={!survey.active} onClick={() => openResponse(survey)}>Registrar resposta</button><button className={styles.secondaryButton} onClick={() => openEditSurvey(survey)}>Editar</button><button className={styles.secondaryButton} onClick={() => toggleSurvey(survey)}>{survey.active ? "Pausar" : "Ativar"}</button><button className={styles.iconButton} onClick={() => removeSurvey(survey)}><Icon name="trash" /></button></div></article>)}</div></section> : null}
    {active === "Compartilhar" ? <section className={styles.pageSheet}><div className={styles.distributionGrid}>{surveys.filter((survey) => survey.active).map((survey) => <article key={survey.id}><div><h3>{survey.name}</h3><p>{survey.question}</p></div><div className={styles.linkRows}><button onClick={() => copyInvite(survey)}><Icon name="message" /><span><strong>Convite</strong></span></button><button onClick={() => copyQuestion(survey)}><Icon name="document" /><span><strong>Pergunta</strong></span></button><button onClick={() => { setPosterSurvey(survey); setModal("poster"); }}><Icon name="print" /><span><strong>Cartaz</strong></span></button></div></article>)}</div></section> : null}
    {active === "Temas" ? <section className={styles.pageSheet}><div className={styles.themeRows}>{themeStats.map((theme) => <div key={theme.name}><div><strong>{theme.name}</strong><span>{theme.count} resposta(s) · {theme.pending} aberta(s)</span></div><StatusPill status={theme.average >= 9 ? "Positivo" : theme.average <= 6 ? "Atenção" : "Neutro"} /><button onClick={() => { setQuery(theme.name); setActive("Respostas"); setSelectedId(""); }}>Abrir respostas</button></div>)}</div></section> : null}

    <Modal open={modal === "transition"} title="Confirmar mudança de etapa" description={selected?.customer} onClose={() => setModal(null)}>{selected ? <><div className={styles.noteBox}><strong>{selected.status}</strong> → <strong>{transitionTarget}</strong><br />{feedbackConsequence(transitionTarget)}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmTransition}>Confirmar mudança</button></div></> : null}</Modal>
    <Modal open={modal === "response"} title={`Registrar resposta · ${responseSurvey?.name ?? "Pesquisa"}`} onClose={() => setModal(null)}><Form onSubmit={saveResponse}><Field label="Cliente"><input value={responseDraft.customer} onChange={(event) => setResponseDraft((current) => ({ ...current, customer: event.target.value }))} /></Field><Field label="Nota"><input type="number" min="0" max="10" value={responseDraft.score} onChange={(event) => setResponseDraft((current) => ({ ...current, score: Math.min(10, Math.max(0, Number(event.target.value) || 0)) }))} /></Field><Field label="Comentário"><textarea required value={responseDraft.comment} onChange={(event) => setResponseDraft((current) => ({ ...current, comment: event.target.value }))} /></Field><Field label="Tema"><select value={responseDraft.theme} onChange={(event) => setResponseDraft((current) => ({ ...current, theme: event.target.value }))}><option>Atendimento</option><option>Tempo de resposta</option><option>Comunicação</option><option>Agilidade</option><option>Qualidade</option><option>Preço</option><option>Prazo</option></select></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Registrar em Novo</button></div></Form></Modal>
    <Modal open={modal === "survey"} title={surveyDraft.id ? "Editar pesquisa" : "Nova pesquisa"} onClose={() => setModal(null)}><Form onSubmit={saveSurvey}><Field label="Nome"><input required value={surveyDraft.name} onChange={(event) => setSurveyDraft((current) => ({ ...current, name: event.target.value }))} /></Field><Field label="Pergunta"><textarea required value={surveyDraft.question} onChange={(event) => setSurveyDraft((current) => ({ ...current, question: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar</button></div></Form></Modal>
    <Modal open={modal === "theme"} title="Alterar tema" onClose={() => setModal(null)}><Form onSubmit={saveTheme}><Field label="Tema"><input required value={themeDraft} onChange={(event) => setThemeDraft(event.target.value)} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar tema</button></div></Form></Modal>
    <Modal open={modal === "poster"} title={`Cartaz · ${posterSurvey?.name ?? "Pesquisa"}`} onClose={() => setModal(null)}><div className={styles.qrPreview}><h2>{posterSurvey?.name}</h2><p>{posterSurvey?.question}</p><button className={styles.primaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir cartaz</button></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function isPast(value: string) { if (!value) return false; return new Date(`${value}T23:59:59`).getTime() < Date.now(); }
function feedbackNext(item: Feedback) { if (item.status === "Novo") return "Definir responsável e iniciar análise"; if (item.status === "Em análise") return "Registrar ação e preparar retorno"; if (item.status === "Aguardando retorno") return "Retornar ao cliente e concluir"; return "Consultar tratamento"; }
function feedbackGuidance(item: Feedback) { if (item.status === "Novo") return "Classifique o tema, defina responsável e prazo antes de iniciar."; if (item.status === "Em análise") return "Registre a ação que será feita antes de avançar."; if (item.status === "Aguardando retorno") return item.score <= 6 ? "Registre o retorno ao cliente antes de concluir." : "Confirme o retorno ou a ação final antes de concluir."; return "O tratamento foi concluído. Reabra somente quando houver nova ação necessária."; }
function feedbackAction(target: FeedbackStatus) { if (target === "Em análise") return "Iniciar ou reabrir análise"; if (target === "Aguardando retorno") return "Enviar para retorno"; return "Concluir tratamento"; }
function feedbackConsequence(target: FeedbackStatus) { if (target === "Em análise") return "A resposta ficará sob responsabilidade e prazo definidos."; if (target === "Aguardando retorno") return "A ação ficará registrada e o próximo trabalho será retornar ao cliente."; return "A resposta será encerrada como tratada e sairá das pendências."; }
