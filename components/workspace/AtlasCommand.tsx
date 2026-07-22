"use client";

import { useMemo, useState } from "react";
import { UiIcon } from "../UiIcon";
import { ScreenProps, appConfigs, useSelectedRow, PageIntro, MetricCard, StatusPill, titleParts, statusTone, EmptyState } from "./shared";

export function AtlasCommand({ product, workspace, actions }: ScreenProps) {
  const config = appConfigs.atlas;
  const orders = actions.records.ordens ?? [];
  const { selected, selectedId, setSelectedId } = useSelectedRow(orders);
  const [query, setQuery] = useState("");
  const stages = ["Aguardando avaliação", "Orçamento enviado", "Aprovado", "Em serviço", "Finalizado"];
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("pt-BR");
    if (!value) return orders;
    return orders.filter((row) => `${row.title} ${row.meta} ${row.status}`.toLocaleLowerCase("pt-BR").includes(value));
  }, [orders, query]);

  const counts = {
    approval: orders.filter((row) => /orçamento enviado/i.test(row.status)).length,
    service: orders.filter((row) => /em serviço/i.test(row.status)).length,
    delivery: orders.filter((row) => /finalizado/i.test(row.status)).length,
  };

  function stageRows(stage: string) {
    return filtered.filter((row) => row.status.toLocaleLowerCase("pt-BR") === stage.toLocaleLowerCase("pt-BR"));
  }

  function nextStatus(status: string) {
    const index = config.statuses.indexOf(status);
    return config.statuses[Math.min(index + 1, config.statuses.length - 1)] ?? status;
  }

  return (
    <main className="pw-content atlas-command">
      <PageIntro config={config}>
        <label className="pw-search"><UiIcon name="search" size={18} /><input value={query} onChange={(event: any) => setQuery(event.target.value)} placeholder="Buscar OS, veículo, placa ou cliente" /></label>
      </PageIntro>

      <section className="atlas-alerts" aria-label="Prioridades da oficina">
        <button><span className="alert-icon warning"><UiIcon name="clock" size={19} /></span><div><small>APROVAÇÕES PARADAS</small><strong>{counts.approval} clientes aguardando</strong><p>A mais antiga está há 2h18 sem resposta.</p></div><UiIcon name="chevronRight" size={18} /></button>
        <button><span className="alert-icon danger"><UiIcon name="alert" size={19} /></span><div><small>RISCO DE ATRASO</small><strong>1 entrega fora do combinado</strong><p>Saveiro TCJ-9I23 precisa de atualização.</p></div><UiIcon name="chevronRight" size={18} /></button>
        <button><span className="alert-icon info"><UiIcon name="camera" size={19} /></span><div><small>EVIDÊNCIAS</small><strong>3 OS sem fotos do diagnóstico</strong><p>Registre antes de enviar o orçamento.</p></div><UiIcon name="chevronRight" size={18} /></button>
      </section>

      <section className="pw-metrics atlas-metrics">
        <MetricCard icon="calendar" label="Entradas de hoje" value="05" detail="2 veículos ainda não chegaram" />
        <MetricCard icon="tool" label="Em execução" value={String(counts.service).padStart(2, "0")} detail="Capacidade atual de 72%" tone="success" />
        <MetricCard icon="message" label="Aguardando cliente" value={String(counts.approval).padStart(2, "0")} detail="R$ 4.260 em decisão" tone="warning" />
        <MetricCard icon="car" label="Prontos para entrega" value={String(counts.delivery).padStart(2, "0")} detail="1 cliente ainda não confirmado" />
      </section>

      <div className="atlas-workspace-grid">
        <section className="atlas-board-panel">
          <header className="section-heading"><div><span>FLUXO AO VIVO</span><h2>Pátio da oficina</h2></div><div className="view-toggle"><button className="active"><UiIcon name="columns" size={16} />Quadro</button><button onClick={() => actions.setActiveView("agenda")}><UiIcon name="list" size={16} />Lista</button></div></header>
          <div className="atlas-board">
            {stages.map((stage) => {
              const rows = stageRows(stage);
              return (
                <div className="atlas-lane" key={stage}>
                  <header><span><i className={`lane-dot status-${statusTone(stage)}`} />{stage}</span><b>{rows.length}</b></header>
                  <div className="atlas-lane-body">
                    {rows.map((row, index) => {
                      const parts = titleParts(row.title);
                      const minutes = 28 + index * 37;
                      return (
                        <button key={row.id} className={`atlas-job ${selectedId === row.id ? "selected" : ""}`} onClick={() => setSelectedId(row.id)}>
                          <div className="atlas-job-top"><span>{parts.code}</span><small>{minutes > 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`} na etapa</small></div>
                          <strong>{parts.name}</strong>
                          <p>{row.meta}</p>
                          <div className="atlas-job-tags"><span><UiIcon name="camera" size={13} />{index + 2}</span>{index % 2 === 0 ? <span><UiIcon name="message" size={13} />Cliente avisado</span> : <span className="needs-action"><UiIcon name="alert" size={13} />Ação necessária</span>}</div>
                          <footer><b>{row.value}</b><span className="tech-avatar">{["JL", "MR", "AS", "CP"][index % 4]}</span></footer>
                        </button>
                      );
                    })}
                    {!rows.length ? <div className="pw-empty-mini"><UiIcon name="checkCircle" size={18} />Nenhuma OS nesta etapa</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="atlas-inspector">
          {selected ? (
            <>
              <div className="inspector-head"><div><span>ATENDIMENTO SELECIONADO</span><h2>{titleParts(selected.title).name}</h2><p>{titleParts(selected.title).code}</p></div><button onClick={() => actions.openEdit("ordens", selected)}><UiIcon name="edit" size={17} /></button></div>
              <StatusPill status={selected.status} />
              <div className="inspector-value"><small>Estimativa atual</small><strong>{selected.value}</strong><span>Sem cobrança ou faturamento pelo sistema</span></div>
              <div className="inspector-details">
                <div><span><UiIcon name="user" size={16} />Cliente</span><strong>{selected.meta.split("·")[0]?.trim() || "Cliente"}</strong></div>
                <div><span><UiIcon name="tool" size={16} />Responsável</span><strong>João Lima</strong></div>
                <div><span><UiIcon name="clock" size={16} />Promessa</span><strong>Hoje, 17:30</strong></div>
                <div><span><UiIcon name="camera" size={16} />Evidências</span><strong>4 fotos</strong></div>
              </div>
              <div className="atlas-timeline">
                <h3>Linha do atendimento</h3>
                <ol>
                  <li className="done"><i /><div><strong>Recepção concluída</strong><small>09:12 · fotos de entrada registradas</small></div></li>
                  <li className="done"><i /><div><strong>Diagnóstico registrado</strong><small>10:36 · observação técnica adicionada</small></div></li>
                  <li className="current"><i /><div><strong>{selected.status}</strong><small>Etapa atual · requer acompanhamento</small></div></li>
                  <li><i /><div><strong>Entrega</strong><small>Aguardando avanço do atendimento</small></div></li>
                </ol>
              </div>
              <div className="inspector-actions">
                <button className="secondary" onClick={() => actions.showToast("Atalho de WhatsApp preparado para demonstração.")}><UiIcon name="message" size={17} />Avisar cliente</button>
                <button className="primary" onClick={() => actions.updateStatus("ordens", selected.id, nextStatus(selected.status))}>Avançar etapa<UiIcon name="arrowRight" size={17} /></button>
              </div>
            </>
          ) : <EmptyState icon="car" title="Selecione uma OS" description="A ficha completa aparecerá aqui." />}
        </aside>
      </div>
    </main>
  );
}
