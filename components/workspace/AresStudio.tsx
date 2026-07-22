"use client";

import { useState } from "react";
import { UiIcon } from "../UiIcon";
import { ScreenProps, appConfigs, useSelectedRow, PageIntro, MetricCard, StatusPill, titleParts, EmptyState } from "./shared";

export function AresStudio({ workspace, actions }: ScreenProps) {
  const config = appConfigs.ares;
  const proposals = actions.records.orcamentos ?? [];
  const { selected, selectedId, setSelectedId } = useSelectedRow(proposals);
  const [query, setQuery] = useState("");
  const visible = proposals.filter((row) => `${row.title} ${row.meta} ${row.status}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  const proposalItems = [
    ["Diagnóstico e planejamento", "1", "R$ 950"],
    ["Execução do serviço principal", "1", selected?.value ?? "R$ 3.900"],
    ["Entrega e revisão final", "1", "Incluso"],
  ];

  return (
    <main className="pw-content ares-studio">
      <PageIntro config={config}>
        <div className="ares-score"><span>Taxa de aprovação</span><strong>48%</strong><small>+6 p.p. nos últimos 30 dias</small></div>
      </PageIntro>

      <section className="ares-signal-row">
        <article><span className="signal-icon"><UiIcon name="eye" size={18} /></span><div><small>VISUALIZADOS HOJE</small><strong>6 propostas</strong><p>2 ainda sem resposta</p></div></article>
        <article><span className="signal-icon"><UiIcon name="clock" size={18} /></span><div><small>VALIDADE PRÓXIMA</small><strong>3 vencem esta semana</strong><p>Uma vence em menos de 24 horas</p></div></article>
        <article><span className="signal-icon"><UiIcon name="refresh" size={18} /></span><div><small>AJUSTES SOLICITADOS</small><strong>2 versões pendentes</strong><p>Revise escopo antes de reenviar</p></div></article>
      </section>

      <div className="ares-layout">
        <aside className="ares-list">
          <header><div><span>PROPOSTAS</span><strong>{proposals.length} documentos</strong></div><button onClick={() => actions.openCreate("orcamentos")}><UiIcon name="plus" size={17} /></button></header>
          <label className="pw-search compact"><UiIcon name="search" size={17} /><input value={query} onChange={(event: any) => setQuery(event.target.value)} placeholder="Buscar cliente ou código" /></label>
          <div className="ares-list-body">
            {visible.map((row) => {
              const parts = titleParts(row.title);
              return (
                <button key={row.id} className={selectedId === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}>
                  <div><span>{parts.code}</span><StatusPill status={row.status} /></div>
                  <strong>{parts.name}</strong>
                  <p>{row.meta}</p>
                  <footer><b>{row.value}</b><small>{/visualizado/i.test(row.status) ? "aberto há 38 min" : /enviado/i.test(row.status) ? "enviado ontem" : "editado hoje"}</small></footer>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="ares-document-wrap">
          {selected ? (
            <article className="ares-document">
              <header>
                <div className="document-brand"><span>M</span><div><strong>{workspace.business}</strong><small>PROPOSTA COMERCIAL</small></div></div>
                <div className="document-code"><small>DOCUMENTO</small><strong>{titleParts(selected.title).code}</strong><span>Válido por 10 dias</span></div>
              </header>
              <div className="document-hero"><span>PREPARADO PARA</span><h2>{titleParts(selected.title).name}</h2><p>Uma proposta clara, com entregas, prazos e condições organizadas para facilitar a decisão.</p></div>
              <section className="document-section"><span>01 · CONTEXTO</span><h3>O que será entregue</h3><p>{selected.meta}. O escopo foi organizado em etapas para que o cliente saiba exatamente o que recebe e em qual prazo.</p></section>
              <section className="document-section"><span>02 · INVESTIMENTO</span><h3>Composição da proposta</h3><div className="document-table">
                {proposalItems.map(([label, quantity, value]) => <div key={label}><span>{label}</span><small>{quantity}</small><strong>{value}</strong></div>)}
              </div></section>
              <footer className="document-total"><div><span>VALOR ESTIMADO</span><small>Sem cobrança, pagamento ou faturamento pelo sistema.</small></div><strong>{selected.value}</strong></footer>
              <div className="document-signature"><span>Validade da proposta: 10 dias</span><span>Versão 03 · atualizada hoje</span></div>
            </article>
          ) : <EmptyState icon="document" title="Selecione uma proposta" description="O documento aparecerá aqui." />}
        </section>

        <aside className="ares-decision">
          {selected ? (
            <>
              <header><span>DECISÃO DO CLIENTE</span><button onClick={() => actions.openEdit("orcamentos", selected)}><UiIcon name="edit" size={17} /></button></header>
              <div className="decision-status"><StatusPill status={selected.status} /><p>Último sinal: documento visualizado hoje às 13:42.</p></div>
              <div className="decision-timeline">
                <div className="done"><i><UiIcon name="check" size={12} /></i><span><strong>Criado</strong><small>Hoje, 09:18</small></span></div>
                <div className="done"><i><UiIcon name="check" size={12} /></i><span><strong>Enviado</strong><small>Hoje, 09:34</small></span></div>
                <div className="current"><i><UiIcon name="eye" size={12} /></i><span><strong>Visualizado</strong><small>Hoje, 13:42</small></span></div>
                <div><i /><span><strong>Decisão</strong><small>Aguardando cliente</small></span></div>
              </div>
              <div className="decision-insights"><h3>Sinais úteis</h3><div><UiIcon name="eye" size={16} /><span><strong>3 visualizações</strong><small>Cliente retornou ao documento</small></span></div><div><UiIcon name="clock" size={16} /><span><strong>8 dias restantes</strong><small>Validade ainda confortável</small></span></div></div>
              <div className="decision-actions"><button onClick={() => actions.updateStatus("orcamentos", selected.id, "Reprovado")} className="decline">Registrar reprovação</button><button onClick={() => actions.updateStatus("orcamentos", selected.id, "Aprovado")} className="approve"><UiIcon name="check" size={16} />Registrar aprovação</button></div>
              <button className="duplicate-action" onClick={() => actions.duplicateRecord("orcamentos", selected)}><UiIcon name="copy" size={16} />Criar nova versão</button>
            </>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
