"use client";

import { useState } from "react";
import { UiIcon } from "../UiIcon";
import { ScreenProps, appConfigs, useSelectedRow, PageIntro, MetricCard, StatusPill, titleParts } from "./shared";

export function PoseidonRoom({ actions }: ScreenProps) {
  const config = appConfigs.poseidon;
  const opportunities = actions.records.funil ?? [];
  const tasks = actions.records.tarefas ?? [];
  const { selected, selectedId, setSelectedId } = useSelectedRow(opportunities);
  const stages = ["Novo lead", "Qualificação", "Proposta", "Decisão"];

  return (
    <main className="pw-content poseidon-room">
      <PageIntro config={config}>
        <div className="poseidon-target"><span>META DE ATIVIDADE</span><div><strong>18</strong><small>de 24 contatos feitos</small></div><i><b style={{ width: "75%" }} /></i></div>
      </PageIntro>

      <section className="pw-metrics poseidon-metrics">
        <MetricCard icon="columns" label="Oportunidades abertas" value={String(opportunities.filter((row) => !/ganho|perdido/i.test(row.status)).length).padStart(2, "0")} detail="R$ 86 mil em potencial" />
        <MetricCard icon="clock" label="Retornos para hoje" value="07" detail="2 estão atrasados" tone="warning" />
        <MetricCard icon="trend" label="Conversão do mês" value="31%" detail="+4,2 p.p. sobre junho" tone="success" />
        <MetricCard icon="spark" label="Sem próximo passo" value="03" detail="Oportunidades exigem definição" tone="danger" />
      </section>

      <div className="poseidon-layout">
        <section className="pipeline-panel">
          <header className="section-heading"><div><span>PIPELINE OPERACIONAL</span><h2>Negociações por próxima etapa</h2></div><div className="pipeline-filters"><button className="active">Minha carteira</button><button>Equipe</button><button><UiIcon name="filter" size={16} /></button></div></header>
          <div className="pipeline-board">
            {stages.map((stage) => {
              const rows = opportunities.filter((row) => row.status === stage);
              return (
                <div className="pipeline-column" key={stage}>
                  <header><div><span>{stage}</span><b>{rows.length}</b></div><small>{rows.reduce((sum, row) => sum + Number(row.value.replace(/\D/g, "") || 0), 0) > 0 ? "Potencial ativo" : "Sem valor"}</small></header>
                  {rows.map((row, index) => (
                    <button key={row.id} className={`deal-card ${selectedId === row.id ? "selected" : ""}`} onClick={() => setSelectedId(row.id)}>
                      <div className="deal-head"><span className="deal-logo">{titleParts(row.title).code.slice(0, 2).toUpperCase()}</span><StatusPill status={row.status} /></div>
                      <strong>{row.title}</strong><p>{row.meta}</p><b>{row.value}</b>
                      <footer><span><UiIcon name="clock" size={14} />{index % 2 === 0 ? "Retorno hoje" : "Amanhã, 09:00"}</span><span className="owner-avatar">{["CM", "LC", "AR"][index % 3]}</span></footer>
                    </button>
                  ))}
                  <button className="add-deal" onClick={() => actions.openCreate("funil")}><UiIcon name="plus" size={15} />Adicionar oportunidade</button>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="next-actions-panel">
          <header><div><span>PRÓXIMAS AÇÕES</span><h2>Agenda comercial</h2></div><span className="today-chip">Hoje</span></header>
          <div className="next-action-list">
            {tasks.map((row, index) => <button key={row.id} onClick={() => actions.setActiveView("tarefas")}><span className={`action-time ${/atrasado/i.test(row.status) ? "late" : ""}`}>{["09:00", "11:30", "15:00", "16:30"][index] ?? "Hoje"}</span><div><strong>{row.title}</strong><p>{row.meta}</p><small>{row.value}</small></div><UiIcon name="chevronRight" size={17} /></button>)}
          </div>
        </aside>

        <aside className="deal-detail">
          {selected ? (
            <>
              <header><div><span>OPORTUNIDADE</span><h2>{selected.title}</h2></div><button onClick={() => actions.openEdit("funil", selected)}><UiIcon name="edit" size={17} /></button></header>
              <StatusPill status={selected.status} />
              <div className="deal-value"><small>Potencial informado</small><strong>{selected.value}</strong><span>Referência comercial, sem cobrança pelo sistema</span></div>
              <div className="deal-next"><span>PRÓXIMO PASSO</span><strong>Retornar com proposta revisada</strong><p>Hoje, 15:00 · responsável Camila</p><button onClick={() => actions.showToast("Atividade marcada como concluída.")}><UiIcon name="check" size={15} />Concluir atividade</button></div>
              <div className="deal-history"><h3>Histórico recente</h3><div><i className="message" /><span><strong>Mensagem enviada</strong><small>Ontem, 17:42</small></span></div><div><i className="document" /><span><strong>Proposta compartilhada</strong><small>20 jul, 11:18</small></span></div><div><i className="phone" /><span><strong>Conversa registrada</strong><small>19 jul, 15:06</small></span></div></div>
              <div className="deal-actions"><button onClick={() => actions.updateStatus("funil", selected.id, "Perdido")}>Registrar perda</button><button className="won" onClick={() => actions.updateStatus("funil", selected.id, "Ganho")}><UiIcon name="trophy" size={16} />Registrar ganho</button></div>
            </>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
