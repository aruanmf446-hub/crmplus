"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "./PandoraWorkspace.module.css";

type View = "overview" | "surveys" | "responses" | "insights";
type Survey = { id: number; title: string; question: string; status: "Ativa" | "Rascunho" | "Encerrada"; responses: number; link: string };
type Response = { id: number; surveyId: number; customer: string; score: number; comment: string; date: string; tag: string };

const initialSurveys: Survey[] = [
  { id: 1, title: "Atendimento após a compra", question: "De 0 a 10, o quanto você recomendaria nosso atendimento?", status: "Ativa", responses: 42, link: "crm.plus/p/atendimento" },
  { id: 2, title: "Entrega do pedido", question: "Como foi sua experiência com a entrega?", status: "Ativa", responses: 27, link: "crm.plus/p/entrega" },
  { id: 3, title: "Qualidade do serviço", question: "O serviço atendeu sua expectativa?", status: "Rascunho", responses: 0, link: "crm.plus/p/qualidade" },
  { id: 4, title: "Experiência de março", question: "Como podemos melhorar sua experiência?", status: "Encerrada", responses: 65, link: "crm.plus/p/marco" },
];

const initialResponses: Response[] = [
  { id: 1, surveyId: 1, customer: "Ana Costa", score: 10, comment: "Atendimento rápido e muito atencioso.", date: "Hoje, 11:42", tag: "Atendimento" },
  { id: 2, surveyId: 2, customer: "Carlos Lima", score: 7, comment: "Chegou certo, mas poderia avisar melhor o horário.", date: "Hoje, 10:18", tag: "Comunicação" },
  { id: 3, surveyId: 1, customer: "Resposta anônima", score: 9, comment: "Resolveram minha dúvida sem demora.", date: "Ontem, 18:06", tag: "Agilidade" },
  { id: 4, surveyId: 2, customer: "Beatriz Melo", score: 4, comment: "O pedido atrasou e não recebi atualização.", date: "Ontem, 15:21", tag: "Prazo" },
  { id: 5, surveyId: 1, customer: "João Reis", score: 8, comment: "Experiência boa e equipe educada.", date: "20 jul, 09:34", tag: "Atendimento" },
  { id: 6, surveyId: 4, customer: "Marta Silva", score: 10, comment: "Tudo ocorreu como esperado.", date: "18 jul, 14:50", tag: "Qualidade" },
  { id: 7, surveyId: 4, customer: "Lucas Alves", score: 6, comment: "Faltou retorno depois do serviço.", date: "18 jul, 11:12", tag: "Comunicação" },
];

export function PandoraWorkspace() {
  const [view, setView] = useState<View>("overview");
  const [surveys, setSurveys] = useState(initialSurveys);
  const [responses, setResponses] = useState(initialResponses);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const visibleResponses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return responses;
    return responses.filter((response) => `${response.customer} ${response.comment} ${response.tag}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [query, responses]);

  const nps = calculateNps(responses);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function createSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    const slug = title.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "pesquisa";
    setSurveys((items) => [{ id: Date.now(), title, question: String(form.get("question")), status: "Ativa", responses: 0, link: `crm.plus/p/${slug}` }, ...items]);
    setModalOpen(false);
    setView("surveys");
    showNotice("Pesquisa criada e link gerado.");
  }

  function addDemoResponse(survey: Survey) {
    const score = 9;
    setResponses((items) => [{ id: Date.now(), surveyId: survey.id, customer: "Nova resposta", score, comment: "Foi fácil responder à pesquisa.", date: "Agora", tag: "Experiência" }, ...items]);
    setSurveys((items) => items.map((item) => item.id === survey.id ? { ...item, responses: item.responses + 1 } : item));
    showNotice("Resposta de demonstração recebida.");
  }

  async function copyLink(link: string) {
    try { await navigator.clipboard.writeText(`https://${link}`); showNotice("Link copiado."); }
    catch { showNotice(`Link local: ${link}`); }
  }

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span>P</span><div><strong>Pandora</strong><small>CRM Plus</small></div></div>
      <div className={styles.workspace}><small>Espaço de trabalho</small><b>Experiência do cliente</b></div>
      <nav aria-label="Navegação do Pandora">
        <NavButton label="Visão geral" icon="⌂" active={view === "overview"} onClick={() => setView("overview")} />
        <NavButton label="Pesquisas" icon="□" active={view === "surveys"} onClick={() => setView("surveys")} />
        <NavButton label="Respostas" icon="≡" active={view === "responses"} onClick={() => setView("responses")} />
        <NavButton label="Insights" icon="⌁" active={view === "insights"} onClick={() => setView("insights")} />
      </nav>
      <p className={styles.offline}>Demonstração local<br />Dados fictícios</p>
    </aside>
    <div className={styles.content}>
      <header className={styles.topbar}>
        <label className={styles.search}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar respostas e comentários" /></label>
        <span className={styles.today}>Visão de hoje</span><button className={styles.avatar} onClick={() => showNotice("Perfil demonstrativo.")} aria-label="Abrir perfil">AM</button>
      </header>
      <main className={styles.main}>
        {view === "overview" && <Overview surveys={surveys} responses={visibleResponses} nps={nps} onNew={() => setModalOpen(true)} onNavigate={setView} />}
        {view === "surveys" && <Surveys surveys={surveys} onNew={() => setModalOpen(true)} onCopy={copyLink} onResponse={addDemoResponse} />}
        {view === "responses" && <Responses responses={visibleResponses} surveys={surveys} />}
        {view === "insights" && <Insights responses={responses} nps={nps} />}
      </main>
    </div>
    {modalOpen && <SurveyModal onClose={() => setModalOpen(false)} onSubmit={createSurvey} />}
    {notice && <div className={styles.toast} role="status">✓ {notice}</div>}
  </div>;
}

function calculateNps(responses: Response[]) {
  if (!responses.length) return 0;
  const promoters = responses.filter((item) => item.score >= 9).length;
  const detractors = responses.filter((item) => item.score <= 6).length;
  return Math.round(((promoters - detractors) / responses.length) * 100);
}

function NavButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) { return <button className={active ? styles.active : ""} onClick={onClick}><span aria-hidden="true">{icon}</span>{label}</button>; }
function Heading({ eyebrow, title, description, action, onAction }: { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void }) { return <div className={styles.heading}><div><small>{eyebrow}</small><h1>{title}</h1><p>{description}</p></div>{action && <button className={styles.primary} onClick={onAction}>＋ {action}</button>}</div>; }

function Overview({ surveys, responses, nps, onNew, onNavigate }: { surveys: Survey[]; responses: Response[]; nps: number; onNew: () => void; onNavigate: (view: View) => void }) {
  return <><Heading eyebrow="Experiência do cliente" title="Ouça. Entenda. Melhore." description="Acompanhe o que seus clientes estão dizendo." action="Nova pesquisa" onAction={onNew} />
    <section className={styles.metrics} aria-label="Resumo das pesquisas"><Metric label="NPS atual" value={nps > 0 ? `+${nps}` : String(nps)} detail="resultado das respostas" tone /><Metric label="Respostas" value={String(surveys.reduce((sum,item) => sum + item.responses,0))} detail="em todas as pesquisas" /><Metric label="Pesquisas ativas" value={String(surveys.filter((item) => item.status === "Ativa").length).padStart(2,"0")} detail="recebendo respostas" /></section>
    <div className={styles.overviewGrid}><section className={styles.panel}><div className={styles.panelTitle}><div><h2>Respostas recentes</h2><p>O que chegou por último.</p></div><button onClick={() => onNavigate("responses")}>Ver respostas</button></div><ResponseList responses={responses.slice(0,4)} /></section><aside className={styles.panel}><div className={styles.panelTitle}><div><h2>Leitura rápida</h2><p>Distribuição das notas.</p></div></div><ScoreSummary responses={responses} /><button className={styles.textAction} onClick={() => onNavigate("insights")}>Abrir insights →</button></aside></div>
  </>;
}

function Metric({ label, value, detail, tone = false }: { label: string; value: string; detail: string; tone?: boolean }) { return <article><small>{label}</small><strong className={tone ? styles.tone : ""}>{value}</strong><p>{detail}</p></article>; }

function Surveys({ surveys, onNew, onCopy, onResponse }: { surveys: Survey[]; onNew: () => void; onCopy: (link: string) => void; onResponse: (survey: Survey) => void }) {
  return <><Heading eyebrow="Coleta" title="Pesquisas" description="Crie um link e envie pelo canal que já usa com seus clientes." action="Nova pesquisa" onAction={onNew} /><section className={styles.surveyGrid}>{surveys.map((survey) => <article key={survey.id} className={styles.surveyCard}><header><span className={`${styles.status} ${survey.status === "Ativa" ? styles.live : ""}`}>{survey.status}</span><b>{survey.responses} respostas</b></header><h2>{survey.title}</h2><p>{survey.question}</p><div className={styles.linkBox}><span>{survey.link}</span><button onClick={() => onCopy(survey.link)} aria-label={`Copiar link de ${survey.title}`}>Copiar</button></div>{survey.status === "Ativa" && <button className={styles.demoAction} onClick={() => onResponse(survey)}>Simular uma resposta</button>}</article>)}</section></>;
}

function Responses({ responses, surveys }: { responses: Response[]; surveys: Survey[] }) {
  return <><Heading eyebrow="Escuta" title="Respostas" description="Notas e comentários reunidos em um só lugar." /><section className={styles.responsePanel}>{responses.length ? <ResponseList responses={responses} surveys={surveys} expanded /> : <div className={styles.empty}><strong>Nenhuma resposta encontrada</strong><p>Tente outro termo na busca.</p></div>}</section></>;
}

function ResponseList({ responses, surveys = initialSurveys, expanded = false }: { responses: Response[]; surveys?: Survey[]; expanded?: boolean }) {
  return <div className={styles.responses}>{responses.map((response) => <article key={response.id}><Score score={response.score} /><div><header><strong>{response.customer}</strong><time>{response.date}</time></header><p>“{response.comment}”</p>{expanded && <footer><span>{surveys.find((survey) => survey.id === response.surveyId)?.title}</span><em>{response.tag}</em></footer>}</div></article>)}</div>;
}

function Score({ score }: { score: number }) { const group = score >= 9 ? "promoter" : score <= 6 ? "detractor" : "neutral"; return <span className={`${styles.score} ${styles[group]}`} aria-label={`Nota ${score}`}>{score}</span>; }

function ScoreSummary({ responses }: { responses: Response[] }) {
  const groups = [{ label: "Promotores", test: (n: number) => n >= 9 }, { label: "Neutros", test: (n: number) => n >= 7 && n <= 8 }, { label: "Detratores", test: (n: number) => n <= 6 }];
  return <div className={styles.scoreSummary}>{groups.map((group) => { const count = responses.filter((item) => group.test(item.score)).length; const percent = Math.round((count / Math.max(responses.length,1)) * 100); return <div key={group.label}><header><span>{group.label}</span><b>{percent}%</b></header><i><b style={{ width: `${percent}%` }} /></i></div>; })}</div>;
}

function Insights({ responses, nps }: { responses: Response[]; nps: number }) {
  const tags = responses.reduce<Record<string,number>>((acc,item) => ({ ...acc, [item.tag]: (acc[item.tag] ?? 0) + 1 }), {});
  const sortedTags = Object.entries(tags).sort((a,b) => b[1] - a[1]);
  return <><Heading eyebrow="Leitura das respostas" title="Insights" description="Veja padrões sem perder o contexto dos comentários." /><section className={styles.insights}><article className={styles.npsCard}><small>NPS atual</small><strong>{nps > 0 ? `+${nps}` : nps}</strong><p>{nps >= 50 ? "A percepção é positiva. Continue acompanhando os pontos de atrito." : "Há espaço para recuperar clientes insatisfeitos."}</p><ScoreSummary responses={responses} /></article><article><small>Assuntos mais citados</small><div className={styles.tags}>{sortedTags.map(([tag,count]) => <div key={tag}><span>{tag}</span><i><b style={{ width: `${(count / sortedTags[0][1]) * 100}%` }} /></i><em>{count}</em></div>)}</div></article><article className={styles.signal}><small>Ponto de atenção</small><h2>Comunicação durante o atendimento</h2><p>Dois comentários mencionam falta de atualização. Vale revisar quando e como o cliente recebe os retornos.</p></article></section></>;
}

function SurveyModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pandora-modal-title"><header><div><small>Nova coleta</small><h2 id="pandora-modal-title">Criar pesquisa</h2></div><button onClick={onClose} aria-label="Fechar">×</button></header><form onSubmit={onSubmit}><label>Nome da pesquisa<input name="title" required autoFocus placeholder="Ex.: Atendimento após a compra" /></label><label>Pergunta principal<textarea name="question" required rows={3} defaultValue="De 0 a 10, o quanto você recomendaria nosso atendimento?" /></label><p className={styles.formHint}>O link será criado localmente assim que a pesquisa for salva.</p><footer><button type="button" onClick={onClose}>Cancelar</button><button className={styles.primary}>Criar e gerar link</button></footer></form></section></div>;
}
