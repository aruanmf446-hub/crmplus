"use client";

import { useState } from "react";
import { UiIcon } from "../UiIcon";
import { ScreenProps, appConfigs, useSelectedRow, PageIntro, MetricCard, StatusPill, statusTone } from "./shared";

export function HerculesEvidence({ actions }: ScreenProps) {
  const config = appConfigs.hercules;
  const executions = actions.records.execucoes ?? [];
  const issues = actions.records.pendencias ?? [];
  const { selected, selectedId, setSelectedId } = useSelectedRow(executions);
  const [checked, setChecked] = useState<Record<string, boolean>>({ motor: true, pneus: true, luzes: false, documentos: true, limpeza: false });
  const completed = Object.values(checked).filter(Boolean).length;

  return (
    <main className="pw-content hercules-evidence">
      <PageIntro config={config}>
        <div className="hercules-shift"><span>TURNO ATUAL</span><strong>14:00 — 22:00</strong><small>7 inspeções programadas · 3 em execução</small></div>
      </PageIntro>

      <section className="pw-metrics hercules-metrics">
        <MetricCard icon="checkCircle" label="Execução de hoje" value="84%" detail="42 de 50 checklists concluídos" tone="success" />
        <MetricCard icon="alert" label="Não conformidades" value={String(issues.length).padStart(2, "0")} detail="1 classificada como alta" tone="danger" />
        <MetricCard icon="camera" label="Evidências registradas" value="126" detail="Fotos e observações locais" />
        <MetricCard icon="shield" label="Conformidade" value="94%" detail="+2 p.p. nesta semana" tone="success" />
      </section>

      <div className="hercules-layout">
        <aside className="inspection-list">
          <header><div><span>EXECUÇÕES</span><strong>{executions.length} inspeções</strong></div><button onClick={() => actions.openCreate("execucoes")}><UiIcon name="plus" size={17} /></button></header>
          <div>{executions.map((row, index) => <button key={row.id} className={selectedId === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><span className={`inspection-index status-${statusTone(row.status)}`}>{String(index + 1).padStart(2, "0")}</span><div><strong>{row.title}</strong><p>{row.meta}</p><small>{row.value}</small></div><StatusPill status={row.status} /></button>)}</div>
        </aside>

        <section className="inspection-execution">
          {selected ? (
            <>
              <header className="execution-header"><div><span>INSPEÇÃO EM FOCO</span><h2>{selected.title}</h2><p>{selected.meta}</p></div><div className="execution-progress"><strong>{completed}/5</strong><span>itens concluídos</span><i><b style={{ width: `${completed * 20}%` }} /></i></div></header>
              <div className="execution-meta"><span><UiIcon name="user" size={16} />Rafael Lima</span><span><UiIcon name="clock" size={16} />Iniciada às 14:02</span><span><UiIcon name="mapPin" size={16} />Pátio principal</span><StatusPill status={selected.status} /></div>
              <div className="checklist-block">
                <header><span>CHECKLIST OPERACIONAL</span><small>Toque no item para registrar a conferência</small></header>
                {[{ id: "motor", label: "Condição visual do motor", note: "Sem vazamentos aparentes" }, { id: "pneus", label: "Pneus e rodas", note: "Verificar desgaste e calibragem" }, { id: "luzes", label: "Sistema de iluminação", note: "Faróis, lanternas e setas" }, { id: "documentos", label: "Documentação do veículo", note: "Conferir identificação e validade" }, { id: "limpeza", label: "Condição de entrega", note: "Cabine e área externa" }].map((item, index) => (
                  <button key={item.id} className={checked[item.id] ? "checked" : ""} onClick={() => setChecked((current) => ({ ...current, [item.id]: !current[item.id] }))}>
                    <span className="check-control">{checked[item.id] ? <UiIcon name="check" size={15} /> : index + 1}</span><div><strong>{item.label}</strong><p>{item.note}</p></div><span className="evidence-count"><UiIcon name="camera" size={15} />{checked[item.id] ? "1 evidência" : "Adicionar"}</span>
                  </button>
                ))}
              </div>
              <div className="evidence-gallery"><header><div><span>EVIDÊNCIAS VISUAIS</span><h3>Fotos registradas</h3></div><button onClick={() => actions.showToast("A captura de foto é simulada neste ambiente local.")}><UiIcon name="camera" size={16} />Adicionar foto</button></header><div>{[1, 2, 3].map((item) => <button key={item}><span><UiIcon name="image" size={23} /></span><small>Evidência {item}</small></button>)}<button className="empty"><UiIcon name="plus" size={20} /><small>Nova evidência</small></button></div></div>
              <footer className="execution-footer"><button onClick={() => actions.openEdit("execucoes", selected)}><UiIcon name="edit" size={16} />Adicionar observação</button><button className="finish" onClick={() => actions.updateStatus("execucoes", selected.id, completed === 5 ? "Conforme" : "Atenção")}><UiIcon name="shield" size={16} />Finalizar inspeção</button></footer>
            </>
          ) : null}
        </section>

        <aside className="nonconformity-panel">
          <header><div><span>DESVIOS ABERTOS</span><h2>Não conformidades</h2></div><b>{issues.length}</b></header>
          <div className="issue-list">{issues.map((row) => <article key={row.id}><div><StatusPill status={row.status} /><button onClick={() => actions.openEdit("pendencias", row)}><UiIcon name="edit" size={15} /></button></div><strong>{row.title}</strong><p>{row.meta}</p><footer><span><UiIcon name="clock" size={14} />{row.value}</span><button onClick={() => actions.updateStatus("pendencias", row.id, "Corrigido")}>Tratar desvio</button></footer></article>)}</div>
          <button className="new-issue" onClick={() => actions.openCreate("pendencias")}><UiIcon name="plus" size={16} />Registrar não conformidade</button>
        </aside>
      </div>
    </main>
  );
}
