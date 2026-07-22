"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, ScoreBadge, StatusPill, Toast, type NavItem } from "./shared";
import { copyText, downloadCsv, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type FeedbackStatus = "Novo" | "Em análise" | "Tratado";
type Feedback = { id: string; customer: string; score: number; channel: string; date: string; comment: string; theme: string; status: FeedbackStatus; priority: boolean; treatment: string };
type Survey = { id: string; name: string; question: string; active: boolean; responses: number; createdAt: string; link: string };

const initialFeedbacks: Feedback[] = [
  { id: "R-884", customer: "Marina Costa", score: 3, channel: "Pós-atendimento", date: "Hoje, 08:42", comment: "O atendimento foi bom, mas esperei muito para receber uma atualização.", theme: "Tempo de resposta", status: "Novo", priority: true, treatment: "" },
  { id: "R-883", customer: "Ricardo Souza", score: 10, channel: "Entrega", date: "Ontem, 17:10", comment: "Equipe muito atenciosa e serviço concluído antes do prazo.", theme: "Atendimento", status: "Novo", priority: false, treatment: "" },
  { id: "R-882", customer: "Ana Paula", score: 6, channel: "Pós-venda", date: "Ontem, 14:22", comment: "Faltou explicar melhor o que estava incluído no serviço.", theme: "Comunicação", status: "Em análise", priority: false, treatment: "Responsável acionado para revisar o texto de entrega." },
  { id: "R-881", customer: "Carlos Mendes", score: 9, channel: "Entrega", date: "21 jul, 11:05", comment: "Gostei da facilidade e da rapidez para resolver tudo.", theme: "Agilidade", status: "Tratado", priority: false, treatment: "Elogio compartilhado com a equipe." },
];
const initialSurveys: Survey[] = [
  { id: "PESQ-01", name: "Pós-atendimento", question: "De 0 a 10, quanto você recomendaria nosso atendimento?", active: true, responses: 124, createdAt: "10 jul 2026", link: "crmplus.store/pesquisa/PESQ-01" },
  { id: "PESQ-02", name: "Entrega de serviço", question: "Como foi sua experiência na entrega?", active: true, responses: 86, createdAt: "12 jul 2026", link: "crmplus.store/pesquisa/PESQ-02" },
];

export function PandoraApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Respostas");
  const [feedbacks, setFeedbacks] = useLocalState<Feedback[]>("crmplus.pandora.feedbacks", initialFeedbacks);
  const [surveys, setSurveys] = useLocalState<Survey[]>("crmplus.pandora.surveys", initialSurveys);
  const [selectedId, setSelectedId] = useState(feedbacks[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"Todas" | "Detratores" | "Neutros" | "Promotores">("Todas");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "Todas">("Todas");
  const [modal, setModal] = useState<"survey" | "theme" | "response" | "poster" | null>(null);
  const [toast, setToast] = useState("");
  const [surveyDraft, setSurveyDraft] = useState({ id: "", name: "", question: "De 0 a 10, quanto você recomendaria nossa empresa?" });
  const [themeDraft, setThemeDraft] = useState("");
  const [posterSurvey, setPosterSurvey] = useState<Survey | null>(null);
  const [responseSurvey, setResponseSurvey] = useState<Survey | null>(null);
  const [responseDraft, setResponseDraft] = useState({ customer: "", score: 8, comment: "", theme: "Atendimento" });

  const selected = feedbacks.find((item) => item.id === selectedId) ?? feedbacks[0];
  const nav: NavItem[] = [{ label: "Respostas", icon: "inbox" }, { label: "Pesquisas", icon: "clipboard" }, { label: "Distribuição", icon: "arrow" }, { label: "Temas", icon: "tag" }];

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return feedbacks.filter((feedback) => {
      const scoreGroup = feedback.score <= 6 ? "Detratores" : feedback.score <= 8 ? "Neutros" : "Promotores";
      return (group === "Todas" || group === scoreGroup) && (statusFilter === "Todas" || feedback.status === statusFilter) && (!value || `${feedback.customer} ${feedback.comment} ${feedback.theme} ${feedback.channel}`.toLowerCase().includes(value));
    });
  }, [feedbacks, group, query, statusFilter]);

  const themeStats = useMemo(() => {
    const counts = new Map<string, { count: number; score: number; pending: number }>();
    feedbacks.forEach((feedback) => {
      const current = counts.get(feedback.theme) ?? { count: 0, score: 0, pending: 0 };
      counts.set(feedback.theme, { count: current.count + 1, score: current.score + feedback.score, pending: current.pending + (feedback.status === "Tratado" ? 0 : 1) });
    });
    return Array.from(counts.entries()).map(([name, data]) => ({ name, count: data.count, pending: data.pending, average: data.score / data.count })).sort((a, b) => b.count - a.count);
  }, [feedbacks]);

  const promoters = feedbacks.filter((item) => item.score >= 9).length;
  const detractors = feedbacks.filter((item) => item.score <= 6).length;
  const nps = feedbacks.length ? Math.round(((promoters - detractors) / feedbacks.length) * 100) : 0;
  const pendingCount = feedbacks.filter((item) => item.status !== "Tratado").length;
  const priorityCount = feedbacks.filter((item) => item.priority && item.status !== "Tratado").length;

  function updateSelected(patch: Partial<Feedback>) {
    if (!selected) return;
    setFeedbacks((current) => current.map((feedback) => feedback.id === selected.id ? { ...feedback, ...patch } : feedback));
  }

  function concludeTreatment() {
    if (!selected?.treatment.trim()) { setToast("Descreva o tratamento antes de concluir"); return; }
    updateSelected({ status: "Tratado", priority: false });
    setToast("Feedback concluído como tratado");
  }

  function reopenTreatment() {
    updateSelected({ status: "Em análise" });
    setToast("Feedback reaberto para análise");
  }

  function openTheme() {
    if (!selected) return;
    setThemeDraft(selected.theme);
    setModal("theme");
  }

  function addTheme() {
    if (!themeDraft.trim()) return;
    updateSelected({ theme: themeDraft.trim(), status: selected?.status === "Novo" ? "Em análise" : selected?.status });
    setThemeDraft("");
    setModal(null);
    setToast("Tema atualizado");
  }

  function openNewSurvey() {
    setSurveyDraft({ id: "", name: "", question: "De 0 a 10, quanto você recomendaria nossa empresa?" });
    setModal("survey");
  }

  function openEditSurvey(survey: Survey) {
    setSurveyDraft({ id: survey.id, name: survey.name, question: survey.question });
    setModal("survey");
  }

  function saveSurvey() {
    const name = surveyDraft.name.trim();
    const question = surveyDraft.question.trim();
    if (!name || !question) { setToast("Informe nome e pergunta da pesquisa"); return; }
    if (surveyDraft.id) {
      setSurveys((current) => current.map((survey) => survey.id === surveyDraft.id ? { ...survey, name, question } : survey));
      setToast("Pesquisa atualizada");
    } else {
      const id = uid("PESQ");
      const survey: Survey = { id, name, question, active: true, responses: 0, createdAt: todayLabel(), link: `crmplus.store/pesquisa/${id}` };
      setSurveys((current) => [survey, ...current]);
      setToast("Pesquisa criada");
    }
    setSurveyDraft({ id: "", name: "", question: "De 0 a 10, quanto você recomendaria nossa empresa?" });
    setModal(null);
    setActive("Pesquisas");
  }

  function removeSurvey(survey: Survey) {
    if (!window.confirm(`Remover a pesquisa “${survey.name}”? As respostas já recebidas continuarão preservadas.`)) return;
    setSurveys((current) => current.filter((item) => item.id !== survey.id));
    setToast("Pesquisa removida");
  }

  async function copySurveyLink(survey: Survey) {
    await copyText(survey.link);
    setToast("Link copiado");
  }

  async function prepareMessage(survey: Survey) {
    await copyText(`Olá! Queremos ouvir você. Responda nossa pesquisa: ${survey.link}`);
    setToast("Mensagem copiada");
  }

  function exportResponses() {
    downloadCsv("respostas-pandora.csv", [["Código", "Cliente", "Nota", "Canal", "Tema", "Situação", "Comentário", "Tratamento"], ...feedbacks.map((item) => [item.id, item.customer, item.score, item.channel, item.theme, item.status, item.comment, item.treatment])]);
    setToast("Planilha de respostas gerada");
  }

  function openResponse(survey: Survey) {
    if (!survey.active) { setToast("Ative a pesquisa antes de receber novas respostas"); return; }
    setResponseSurvey(survey);
    setResponseDraft({ customer: "", score: 8, comment: "", theme: "Atendimento" });
    setModal("response");
  }

  function saveResponse() {
    if (!responseSurvey || !responseSurvey.active) { setToast("Esta pesquisa está pausada"); return; }
    if (!responseDraft.comment.trim()) { setToast("Informe o comentário da resposta"); return; }
    const feedback: Feedback = { id: uid("R"), customer: responseDraft.customer.trim() || "Cliente não identificado", score: responseDraft.score, channel: responseSurvey.name, date: todayLabel(), comment: responseDraft.comment.trim(), theme: responseDraft.theme, status: "Novo", priority: responseDraft.score <= 6, treatment: "" };
    setFeedbacks((current) => [feedback, ...current]);
    setSurveys((current) => current.map((survey) => survey.id === responseSurvey.id ? { ...survey, responses: survey.responses + 1 } : survey));
    setSelectedId(feedback.id);
    setResponseSurvey(null);
    setModal(null);
    setActive("Respostas");
    setToast("Resposta adicionada à caixa de entrada");
  }

  function openPoster(survey: Survey) {
    setPosterSurvey(survey);
    setModal("poster");
  }

  const headerAction = active === "Pesquisas"
    ? <button className={styles.primaryButton} onClick={openNewSurvey}><Icon name="plus" /> Nova pesquisa</button>
    : active === "Respostas"
      ? <button className={styles.secondaryButton} disabled={!feedbacks.length} onClick={exportResponses}><Icon name="download" /> Exportar</button>
      : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Feedback organizado para classificar, tratar e transformar em melhoria." action={headerAction}>
    {active === "Respostas" ? <>
      <div className={styles.summaryGrid}><div><span>NPS atual</span><strong>{nps}</strong></div><div><span>Respostas</span><strong>{feedbacks.length}</strong></div><div><span>Aguardando tratamento</span><strong>{pendingCount}</strong></div><div><span>Prioridades abertas</span><strong>{priorityCount}</strong></div></div>
      <div className={styles.feedbackLayout}><section className={styles.feedbackInbox}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar resposta ou cliente" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as FeedbackStatus | "Todas")}><option>Todas</option><option>Novo</option><option>Em análise</option><option>Tratado</option></select></div><div className={styles.feedbackFilter}>{(["Todas", "Detratores", "Neutros", "Promotores"] as const).map((item) => <button key={item} className={group === item ? styles.segmentActive : ""} onClick={() => setGroup(item)}>{item}</button>)}</div>{filtered.map((feedback) => <button key={feedback.id} className={`${styles.feedbackRow} ${selected?.id === feedback.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(feedback.id)}><ScoreBadge score={feedback.score} /><div><div><strong>{feedback.customer}</strong><span>{feedback.priority ? "Prioridade · " : ""}{feedback.date}</span></div><p>{feedback.comment}</p><small>{feedback.channel} · {feedback.theme}</small></div><StatusPill status={feedback.status} /></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma resposta" description="Altere os filtros para visualizar outros comentários." /> : null}</section>{selected ? <section className={styles.feedbackDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id} · {selected.channel}</span><h2>{selected.customer}</h2><p>{selected.date}</p></div><ScoreBadge score={selected.score} large /></div><blockquote>“{selected.comment}”</blockquote><div className={styles.feedbackMeta}><div><span>Tema identificado</span><strong>{selected.theme}</strong></div><div><span>Situação</span><StatusPill status={selected.status} /></div></div><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Classificação</h3><p>Organize o assunto e a prioridade desta resposta.</p></div><button onClick={openTheme}>Alterar tema</button></div><div className={styles.classification}><StatusPill status={selected.theme} /><button className={selected.priority ? styles.classificationActive : ""} onClick={() => updateSelected({ priority: !selected.priority })}>{selected.priority ? "Prioridade ativa" : "Marcar prioridade"}</button></div></section><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Tratamento</h3><p>Registre a ação tomada antes de concluir.</p></div></div><textarea className={styles.responseArea} value={selected.treatment} onChange={(event) => updateSelected({ treatment: event.target.value, status: event.target.value && selected.status === "Novo" ? "Em análise" : selected.status })} placeholder="Descreva a ação tomada ou encaminhamento" /><div className={styles.alignRight}>{selected.status === "Tratado" ? <button className={styles.secondaryButton} onClick={reopenTreatment}>Reabrir análise</button> : <button className={styles.primaryButton} onClick={concludeTreatment}>Concluir tratamento</button>}</div></section></section> : <EmptyState icon="inbox" title="Nenhuma resposta selecionada" description="Escolha uma resposta para iniciar o tratamento." />}</div>
    </> : null}

    {active === "Pesquisas" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Pesquisas</span><h2>Coletas e formulários</h2><p>Crie, edite, pause e acompanhe suas pesquisas.</p></div></div><div className={styles.surveyRows}>{surveys.map((survey) => <article key={survey.id}><div><StatusPill status={survey.active ? "Ativa" : "Pausada"} /><h3>{survey.name}</h3><p>{survey.question}</p><small>{survey.responses} respostas · criada em {survey.createdAt}</small></div><div><button className={styles.primaryButton} disabled={!survey.active} onClick={() => openResponse(survey)}>{survey.active ? "Responder" : "Pesquisa pausada"}</button><button className={styles.secondaryButton} onClick={() => openEditSurvey(survey)}>Editar</button><button className={styles.secondaryButton} onClick={() => setSurveys((current) => current.map((item) => item.id === survey.id ? { ...item, active: !item.active } : item))}>{survey.active ? "Pausar" : "Ativar"}</button><button className={styles.iconButton} aria-label={`Remover ${survey.name}`} onClick={() => removeSurvey(survey)}><Icon name="trash" /></button></div></article>)}{!surveys.length ? <EmptyState icon="clipboard" title="Nenhuma pesquisa criada" description="Crie uma pesquisa para começar a receber respostas." action={<button className={styles.primaryButton} onClick={openNewSurvey}>Criar pesquisa</button>} /> : null}</div></section> : null}

    {active === "Distribuição" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Compartilhamento</span><h2>Links e materiais</h2><p>Prepare a mensagem, copie o endereço ou imprima um cartaz com o link.</p></div></div><div className={styles.distributionGrid}>{surveys.filter((survey) => survey.active).map((survey) => <article key={survey.id}><div><StatusPill status="Ativa" /><h3>{survey.name}</h3><code>{survey.link}</code></div><div className={styles.linkRows}><button onClick={() => prepareMessage(survey)}><Icon name="message" /><span><strong>WhatsApp</strong><small>Copiar mensagem</small></span><Icon name="chevron" /></button><button onClick={() => copySurveyLink(survey)}><Icon name="document" /><span><strong>Link</strong><small>Copiar endereço</small></span><Icon name="chevron" /></button><button onClick={() => openPoster(survey)}><Icon name="print" /><span><strong>Cartaz</strong><small>Preparar para impressão</small></span><Icon name="chevron" /></button></div></article>)}{!surveys.some((survey) => survey.active) ? <EmptyState icon="arrow" title="Nenhuma pesquisa ativa" description="Ative uma pesquisa para liberar os materiais de compartilhamento." /> : null}</div></section> : null}

    {active === "Temas" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Classificação</span><h2>Assuntos mais citados</h2><p>Volume, média das notas e pendências por tema.</p></div></div><div className={styles.themeRows}>{themeStats.map((theme) => <div key={theme.name}><div><strong>{theme.name}</strong><span>{theme.count} resposta(s) · {theme.pending} pendente(s)</span></div><StatusPill status={theme.average >= 9 ? "Positivo" : theme.average <= 6 ? "Atenção" : "Neutro"} /><button onClick={() => { setQuery(theme.name); setGroup("Todas"); setStatusFilter("Todas"); setActive("Respostas"); }}>Abrir respostas <Icon name="chevron" /></button></div>)}{!themeStats.length ? <EmptyState icon="tag" title="Nenhum tema identificado" description="Os temas aparecerão quando as respostas forem classificadas." /> : null}</div></section> : null}

    <Modal open={modal === "response"} title={`Responder · ${responseSurvey?.name ?? "Pesquisa"}`} description={responseSurvey?.question} onClose={() => { setModal(null); setResponseSurvey(null); }}><Form onSubmit={saveResponse}><Field label="Cliente"><input value={responseDraft.customer} onChange={(event) => setResponseDraft((current) => ({ ...current, customer: event.target.value }))} placeholder="Opcional" /></Field><Field label="Nota de 0 a 10"><input type="number" min="0" max="10" value={responseDraft.score} onChange={(event) => setResponseDraft((current) => ({ ...current, score: Math.min(10, Math.max(0, Number(event.target.value) || 0)) }))} /></Field><Field label="Comentário"><textarea required value={responseDraft.comment} onChange={(event) => setResponseDraft((current) => ({ ...current, comment: event.target.value }))} /></Field><Field label="Tema"><select value={responseDraft.theme} onChange={(event) => setResponseDraft((current) => ({ ...current, theme: event.target.value }))}><option>Atendimento</option><option>Tempo de resposta</option><option>Comunicação</option><option>Agilidade</option><option>Qualidade</option></select></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Enviar resposta</button></div></Form></Modal>
    <Modal open={modal === "survey"} title={surveyDraft.id ? "Editar pesquisa" : "Nova pesquisa"} description="Defina uma pergunta curta e clara para o cliente." onClose={() => setModal(null)}><Form onSubmit={saveSurvey}><Field label="Nome da pesquisa"><input required value={surveyDraft.name} onChange={(event) => setSurveyDraft((current) => ({ ...current, name: event.target.value }))} /></Field><Field label="Pergunta principal"><textarea required value={surveyDraft.question} onChange={(event) => setSurveyDraft((current) => ({ ...current, question: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>{surveyDraft.id ? "Salvar alterações" : "Criar pesquisa"}</button></div></Form></Modal>
    <Modal open={modal === "theme"} title="Alterar tema" description={selected?.id} onClose={() => setModal(null)}><Form onSubmit={addTheme}><Field label="Tema"><input required value={themeDraft} onChange={(event) => setThemeDraft(event.target.value)} placeholder="Ex.: Prazo de entrega" /></Field><div className={styles.suggestionChips}>{["Atendimento", "Tempo de resposta", "Comunicação", "Agilidade", "Qualidade"].map((theme) => <button type="button" key={theme} onClick={() => setThemeDraft(theme)}>{theme}</button>)}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar tema</button></div></Form></Modal>
    <Modal open={modal === "poster"} title={`Cartaz · ${posterSurvey?.name ?? "Pesquisa"}`} description="Imprima ou salve esta página para expor o endereço da pesquisa." onClose={() => { setModal(null); setPosterSurvey(null); }}><div className={styles.qrPreview}><Icon name="message" /><h2>{posterSurvey?.name}</h2><p>{posterSurvey?.question}</p><strong>{posterSurvey?.link}</strong><button className={styles.primaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir cartaz</button></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}
