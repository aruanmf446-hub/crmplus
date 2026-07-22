"use client";

import type { CSSProperties } from "react";
import { UiIcon } from "../UiIcon";
import { ScreenProps, appConfigs, PageIntro, MetricCard, StatusPill, useSelectedRow, statusTone } from "./shared";

export function PandoraInsights({ actions }: ScreenProps) {
  const config = appConfigs.pandora;
  const responses = actions.records.respostas ?? [];
  const surveys = actions.records.pesquisas ?? [];
  const { selected, selectedId, setSelectedId } = useSelectedRow(responses);

  return (
    <main className="pw-content pandora-insights">
      <PageIntro config={config}>
        <button className="pandora-share" onClick={() => actions.setActiveView("compartilhar")}><UiIcon name="link" size={17} />Abrir links de pesquisa</button>
      </PageIntro>

      <section className="pandora-hero-grid">
        <article className="nps-orbit">
          <div className="orbit-ring" style={{ "--score": "76%" } as CSSProperties}><div><span>NPS</span><strong>68</strong><small>Excelente</small></div></div>
          <div className="orbit-copy"><span>EXPERIÊNCIA GERAL</span><h2>O cliente percebe evolução</h2><p>A nota subiu 7 pontos em 30 dias. Clareza no atendimento é o principal motivo positivo.</p><div><strong>+7</strong><span>vs. período anterior</span></div></div>
        </article>
        <article className="sentiment-panel">
          <header><span>DISTRIBUIÇÃO</span><strong>486 respostas</strong></header>
          <div className="sentiment-bar"><i className="positive" style={{ width: "72%" }} /><i className="neutral" style={{ width: "18%" }} /><i className="negative" style={{ width: "10%" }} /></div>
          <div className="sentiment-legend"><span><i className="positive" />Promotores <b>72%</b></span><span><i className="neutral" />Neutros <b>18%</b></span><span><i className="negative" />Detratores <b>10%</b></span></div>
          <div className="sentiment-alert"><UiIcon name="spark" size={18} /><span><strong>12 comentários pedem ação</strong><small>Tempo de espera e comunicação de prazo concentram 68% das críticas.</small></span></div>
        </article>
      </section>

      <div className="pandora-grid">
        <section className="theme-panel">
          <header className="section-heading"><div><span>TEMAS RECORRENTES</span><h2>O que está movendo a nota</h2></div></header>
          <div className="theme-list">
            {[{ name: "Clareza da explicação", value: 92, trend: "+8%", tone: "positive" }, { name: "Agilidade no atendimento", value: 81, trend: "+3%", tone: "positive" }, { name: "Cumprimento de prazo", value: 64, trend: "-6%", tone: "negative" }, { name: "Atualização durante o serviço", value: 58, trend: "-9%", tone: "negative" }].map((theme) => (
              <div key={theme.name}><header><strong>{theme.name}</strong><span className={theme.tone}>{theme.trend}</span></header><div><i style={{ width: `${theme.value}%` }} /></div><small>{theme.value}% de menções favoráveis</small></div>
            ))}
          </div>
        </section>

        <section className="response-stream">
          <header className="section-heading"><div><span>VOZ DO CLIENTE</span><h2>Respostas recentes</h2></div><button onClick={() => actions.setActiveView("respostas")}>Ver todas<UiIcon name="arrowRight" size={15} /></button></header>
          <div className="response-list">
            {responses.map((row) => (
              <button key={row.id} className={selectedId === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}>
                <span className={`response-score score-${statusTone(row.status)}`}>{row.value.split(" ")[0]}</span>
                <div><strong>{row.title}</strong><p>{row.meta}</p><StatusPill status={row.status} /></div>
                <UiIcon name="chevronRight" size={18} />
              </button>
            ))}
          </div>
        </section>

        <aside className="feedback-detail">
          {selected ? (
            <>
              <header><span>COMENTÁRIO SELECIONADO</span><button onClick={() => actions.openEdit("respostas", selected)}><UiIcon name="edit" size={17} /></button></header>
              <div className="feedback-score"><strong>{selected.value}</strong><StatusPill status={selected.status} /></div>
              <blockquote>{selected.title}</blockquote><p>{selected.meta}</p>
              <div className="feedback-tags"><span>Prazo</span><span>Comunicação</span><span>Atendimento</span></div>
              <div className="feedback-context"><h3>Contexto</h3><div><span>Pesquisa</span><strong>Pós-atendimento</strong></div><div><span>Canal</span><strong>Link compartilhado</strong></div><div><span>Recebida</span><strong>Hoje, 13:52</strong></div></div>
              <div className="feedback-actions"><button onClick={() => actions.updateStatus("respostas", selected.id, "Resolvido")}>Marcar resolvido</button><button className="primary" onClick={() => actions.updateStatus("respostas", selected.id, "Em ação")}><UiIcon name="flag" size={16} />Criar ação</button></div>
            </>
          ) : null}
        </aside>
      </div>

      <section className="active-surveys"><header className="section-heading"><div><span>PESQUISAS ATIVAS</span><h2>Coletas em andamento</h2></div><button onClick={() => actions.setActiveView("pesquisas")}>Gerenciar pesquisas</button></header><div>{surveys.slice(0, 3).map((row, index) => <article key={row.id}><span className="survey-icon"><UiIcon name="message" size={18} /></span><div><strong>{row.title}</strong><p>{row.meta}</p></div><div className="survey-progress"><span style={{ width: `${68 + index * 8}%` }} /><small>{row.value}</small></div><StatusPill status={row.status} /></article>)}</div></section>
    </main>
  );
}
