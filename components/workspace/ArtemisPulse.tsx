"use client";

import { useState } from "react";
import { UiIcon } from "../UiIcon";
import { ScreenProps, appConfigs, useSelectedRow, PageIntro, MetricCard, StatusPill, statusTone, titleParts, EmptyState } from "./shared";

export function ArtemisPulse({ actions }: ScreenProps) {
  const config = appConfigs.artemis;
  const orders = actions.records.pedidos ?? [];
  const tables = actions.records.mesas ?? [];
  const { selected, selectedId, setSelectedId } = useSelectedRow(orders);
  const queue = ["Recebido", "Em preparo", "Pronto"];

  return (
    <main className="pw-content artemis-pulse">
      <PageIntro config={config}>
        <div className="artemis-clock"><span>AGORA</span><strong>14:38</strong><small>Serviço de almoço · 72% das mesas ocupadas</small></div>
      </PageIntro>

      <section className="pw-metrics artemis-metrics">
        <MetricCard icon="receipt" label="Comandas abertas" value={String(orders.filter((row) => !/servido/i.test(row.status)).length).padStart(2, "0")} detail="4 novas nos últimos 10 min" />
        <MetricCard icon="flame" label="Tempo médio" value="18 min" detail="Meta operacional: até 22 min" tone="success" />
        <MetricCard icon="alert" label="Pedido em risco" value="01" detail="Mesa 03 está há 31 min" tone="danger" />
        <MetricCard icon="table" label="Mesas livres" value={String(tables.filter((row) => /disponível|livre/i.test(row.status)).length).padStart(2, "0")} detail="Prontas para receber clientes" />
      </section>

      <div className="artemis-grid">
        <section className="floor-panel">
          <header className="section-heading"><div><span>MAPA DO SALÃO</span><h2>Mesas em atendimento</h2></div><button onClick={() => actions.setActiveView("mesas")}><UiIcon name="expand" size={16} />Ver todas</button></header>
          <div className="floor-map">
            {tables.slice(0, 8).map((row, index) => (
              <button key={row.id} className={`table-card table-${statusTone(row.status)}`} onClick={() => actions.setActiveView("mesas")}>
                <span className="table-number">{String(index + 1).padStart(2, "0")}</span>
                <StatusPill status={row.status} />
                <strong>{row.title}</strong><p>{row.meta}</p>
                <footer><span>{row.value}</span><small>{/ocupada/i.test(row.status) ? `${18 + index * 7} min` : "Disponível"}</small></footer>
              </button>
            ))}
          </div>
        </section>

        <section className="kitchen-panel">
          <header className="section-heading"><div><span>PASSE DA COZINHA</span><h2>Fila de preparo</h2></div><span className="kitchen-live"><i />Atualização local</span></header>
          <div className="kitchen-columns">
            {queue.map((stage) => {
              const rows = orders.filter((row) => row.status === stage);
              return (
                <div className="kitchen-column" key={stage}>
                  <header><span>{stage}</span><b>{rows.length}</b></header>
                  {rows.map((row, index) => (
                    <button key={row.id} className={`kitchen-ticket ${selectedId === row.id ? "selected" : ""} ${index === 0 && stage === "Em preparo" ? "risk" : ""}`} onClick={() => setSelectedId(row.id)}>
                      <div><span>{titleParts(row.title).code}</span><strong>{12 + index * 7} min</strong></div>
                      <h3>{titleParts(row.title).name}</h3><p>{row.meta}</p>
                      <footer><span><UiIcon name="receipt" size={14} />{row.value}</span>{index === 0 && stage === "Em preparo" ? <small><UiIcon name="alert" size={13} />Atenção</small> : <small>Dentro do tempo</small>}</footer>
                    </button>
                  ))}
                  {!rows.length ? <div className="pw-empty-mini">Sem comandas nesta etapa</div> : null}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="order-detail">
          {selected ? (
            <>
              <header><div><span>COMANDA SELECIONADA</span><h2>{selected.title}</h2></div><button onClick={() => actions.openEdit("pedidos", selected)}><UiIcon name="edit" size={17} /></button></header>
              <StatusPill status={selected.status} />
              <div className="order-timer"><span>Tempo total</span><strong>18:42</strong><small>Meta: até 22 minutos</small></div>
              <div className="order-items"><h3>Itens da comanda</h3><div><span><b>2×</b>Burger artesanal</span><small>sem cebola</small></div><div><span><b>1×</b>Batata rústica</span><small>ponto normal</small></div><div><span><b>1×</b>Soda italiana</span><small>sem gelo</small></div></div>
              <div className="order-note"><UiIcon name="message" size={17} /><span><strong>Observação do salão</strong><small>{selected.meta}</small></span></div>
              <div className="order-actions"><button onClick={() => actions.updateStatus("pedidos", selected.id, "Em preparo")}>Em preparo</button><button className="ready" onClick={() => actions.updateStatus("pedidos", selected.id, "Pronto")}><UiIcon name="check" size={16} />Marcar pronto</button></div>
            </>
          ) : <EmptyState icon="receipt" title="Selecione uma comanda" description="Os itens aparecerão aqui." />}
        </aside>
      </div>
    </main>
  );
}
