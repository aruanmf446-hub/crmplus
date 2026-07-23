"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import { Icon, StatusPill } from "./shared";
import type { MainRecord, RelatedRecord, ResourceRecord, VerticalConfig } from "./VerticalBusinessApp";
import styles from "./VerticalOperationalHome.module.css";

type Props = {
  product: Product;
  config: VerticalConfig;
  records: MainRecord[];
  operations: RelatedRecord[];
  resources: ResourceRecord[];
  onOpenRecord: (record: MainRecord) => void;
  onCreateRecord: () => void;
  onOpenRecords: () => void;
  onOpenOperations: () => void;
  onOpenResources: () => void;
};

type HomeCopy = { title: string; description: string; primary: string; secondary: string };

const copy: Record<string, HomeCopy> = {
  alexandria: { title: "Encontre a obra e confirme a disponibilidade.", description: "A visão inicial prioriza catálogo, exemplares disponíveis, empréstimos e devoluções que exigem acompanhamento.", primary: "Catalogar obra", secondary: "Abrir acervo" },
  olympus: { title: "Imóveis, visitas e interessados no mesmo contexto.", description: "A carteira mostra o que está disponível, o que já recebeu visita e quais negociações precisam de retorno.", primary: "Cadastrar imóvel", secondary: "Abrir carteira" },
  argus: { title: "Localize cada bem antes de abrir a ficha.", description: "Número patrimonial, localização, responsável e condição aparecem como inventário operacional — não como CRM genérico.", primary: "Cadastrar bem", secondary: "Abrir inventário" },
  hermes: { title: "O cronograma mostra o que precisa estar confirmado.", description: "Eventos, tarefas, fornecedores e presença são organizados em torno das datas que não podem ser esquecidas.", primary: "Planejar evento", secondary: "Abrir eventos" },
  athena: { title: "Prazo, documentos e decisão de participar vêm primeiro.", description: "A home destaca sessões próximas, prontidão documental e pendências que podem impedir o envio da proposta.", primary: "Cadastrar oportunidade", secondary: "Abrir licitações" },
  gaia: { title: "Acompanhe cada ciclo pela fase e pelos sinais do campo.", description: "Produção, áreas, atividades e ocorrências aparecem como rotina de campo, com atenção ao que precisa ser observado.", primary: "Criar ciclo", secondary: "Abrir produções" },
  pegasus: { title: "A agenda começa pela segurança de cada pet.", description: "Atendimentos, preferências, restrições e retirada ficam próximos da ficha individual do animal.", primary: "Cadastrar pet", secondary: "Abrir fichas" },
  titans: { title: "Avanço, diário e decisões visíveis por obra.", description: "A home mostra progresso, próxima etapa, bloqueios, alterações e registros recentes da execução.", primary: "Cadastrar obra", secondary: "Abrir obras" },
};

export function VerticalOperationalHome(props: Props) {
  const activeRecords = props.records.filter((record) => !record.archived);
  const shared = { ...props, records: activeRecords };
  if (props.config.slug === "alexandria") return <AlexandriaHome {...shared} />;
  if (props.config.slug === "olympus") return <OlympusHome {...shared} />;
  if (props.config.slug === "argus") return <ArgusHome {...shared} />;
  if (props.config.slug === "hermes") return <HermesHome {...shared} />;
  if (props.config.slug === "athena") return <AthenaHome {...shared} />;
  if (props.config.slug === "gaia") return <GaiaHome {...shared} />;
  if (props.config.slug === "pegasus") return <PegasusHome {...shared} />;
  return <TitansHome {...shared} />;
}

function HomeFrame({ props, stats, children }: { props: Props; stats: Array<{ value: string | number; label: string; attention?: boolean }>; children: ReactNode }) {
  const content = copy[props.config.slug] ?? copy.titans;
  return <div className={styles.home}>
    <section className={styles.hero}>
      <div className={styles.heroMain}>
        <span className={styles.eyebrow}><Icon name={props.config.icon} /> Visão operacional do {props.product.shortName}</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryAction} onClick={props.onCreateRecord}><Icon name="plus" />{content.primary}</button>
          <button type="button" className={styles.secondaryAction} onClick={props.onOpenRecords}>{content.secondary}<Icon name="arrow" /></button>
        </div>
      </div>
      <div className={styles.heroAside} aria-label="Resumo operacional">
        {stats.map((stat) => <div key={stat.label} className={`${styles.statCard} ${stat.attention ? styles.statAttention : ""}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
      </div>
    </section>
    {children}
  </div>;
}

function AlexandriaHome(props: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => props.records.filter((record) => `${record.title} ${record.subtitle} ${record.data.authors ?? ""} ${record.data.isbn ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())), [props.records, query]);
  const availableCopies = props.resources.filter((item) => item.status === "Disponível").length;
  const openLoans = props.operations.filter((item) => !["Devolvido", "Cancelado"].includes(item.status));
  const delayed = openLoans.filter((item) => item.status === "Atrasado");
  return <HomeFrame props={props} stats={[{ value: props.records.length, label: "obras ativas" }, { value: availableCopies, label: "exemplares disponíveis" }, { value: openLoans.length, label: "circulações abertas" }, { value: delayed.length, label: "devoluções atrasadas", attention: delayed.length > 0 }]}>
    <div className={styles.grid2}>
      <section className={styles.panel}>
        <header className={styles.panelHeader}><div><h3>Busca no acervo</h3><p>Pesquise por título, autor ou identificador.</p></div><button type="button" onClick={props.onOpenRecords}>Busca completa</button></header>
        <div className={styles.searchBar}><label><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, autor ou ISBN" aria-label="Buscar no acervo" /></label></div>
        <div className={styles.cardGrid}>{filtered.slice(0, 4).map((record) => {
          const copies = props.resources.filter((item) => item.parentId === record.id);
          const available = copies.filter((item) => item.status === "Disponível").length;
          return <button type="button" className={styles.recordCard} key={record.id} onClick={() => props.onOpenRecord(record)}><span className={styles.cardLabel}>{record.data.category || "Acervo"}</span><h4>{record.title}</h4><p>{record.data.authors || record.subtitle}</p><p>{record.data.location || "Localização não informada"}</p><div className={styles.cardFooter}><StatusPill status={available ? `${available} disponível` : "Sem exemplar"} /><span>{copies.length} exemplar(es)</span></div></button>;
        })}{!filtered.length ? <div className={styles.empty}>Nenhuma obra encontrada nesta busca.</div> : null}</div>
      </section>
      <section className={styles.panel}>
        <header className={styles.panelHeader}><div><h3>Empréstimos e devoluções</h3><p>O que precisa ser retirado, devolvido ou cobrado.</p></div><button type="button" onClick={props.onOpenOperations}>Ver circulação</button></header>
        <div className={styles.recordList}>{openLoans.slice(0, 6).map((item) => <button type="button" className={styles.recordRow} key={item.id} onClick={() => openParent(props, item.parentId)}><div><strong>{item.title}</strong><p>{item.description}</p></div><StatusPill status={item.status} /><Icon name="chevron" /></button>)}{!openLoans.length ? <div className={styles.empty}>Nenhuma circulação aberta.</div> : null}</div>
      </section>
    </div>
  </HomeFrame>;
}

function OlympusHome(props: Props) {
  const available = props.records.filter((record) => record.status === "Disponível");
  const negotiations = props.records.filter((record) => record.status === "Em negociação");
  const openVisits = props.operations.filter((item) => !["Aceita", "Recusada", "Cancelada"].includes(item.status));
  const activeInterests = props.resources.filter((item) => !["Sem interesse", "Concluído"].includes(item.status));
  return <HomeFrame props={props} stats={[{ value: available.length, label: "imóveis disponíveis" }, { value: negotiations.length, label: "em negociação" }, { value: openVisits.length, label: "visitas e propostas abertas" }, { value: activeInterests.length, label: "interessados ativos" }]}>
    <div className={styles.grid2}>
      <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Carteira em destaque</h3><p>Disponibilidade, finalidade e condições principais.</p></div><button type="button" onClick={props.onOpenRecords}>Todos os imóveis</button></header><div className={styles.cardGrid}>{props.records.slice(0, 4).map((record) => <button type="button" className={styles.recordCard} key={record.id} onClick={() => props.onOpenRecord(record)}><span className={styles.cardLabel}>{record.data.purpose || record.status}</span><h4>{record.title}</h4><p>{record.data.type} · {record.data.area || "área não informada"}</p><p>{record.data.address || record.subtitle}</p><div className={styles.cardFooter}><StatusPill status={record.status} /><span>{record.data.announcedValue || "valor sob consulta"}</span></div></button>)}</div></section>
      <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Próximos atendimentos</h3><p>Visitas, propostas e decisões pendentes.</p></div><button type="button" onClick={props.onOpenOperations}>Agenda comercial</button></header><div className={styles.recordList}>{openVisits.slice(0, 6).map((item) => <button type="button" className={styles.recordRow} key={item.id} onClick={() => openParent(props, item.parentId)}><div><strong>{item.title}</strong><p>{parentTitle(props, item.parentId)} · {formatDate(item.date)}</p></div><StatusPill status={item.status} /><Icon name="chevron" /></button>)}{!openVisits.length ? <div className={styles.empty}>Nenhuma visita ou proposta aberta.</div> : null}</div></section>
    </div>
  </HomeFrame>;
}

function ArgusHome(props: Props) {
  const active = props.records.filter((record) => record.status !== "Baixado");
  const maintenance = active.filter((record) => record.status === "Em manutenção");
  const notFound = active.filter((record) => record.status === "Não localizado");
  const documentsAttention = props.resources.filter((item) => ["Pendente", "Vencendo", "Vencido"].includes(item.status));
  return <HomeFrame props={props} stats={[{ value: active.length, label: "bens ativos" }, { value: maintenance.length, label: "em manutenção" }, { value: notFound.length, label: "não localizados", attention: notFound.length > 0 }, { value: documentsAttention.length, label: "documentos com atenção", attention: documentsAttention.length > 0 }]}>
    <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Inventário patrimonial</h3><p>Número, bem, localização, responsável e condição.</p></div><button type="button" onClick={props.onOpenOperations}>Ver movimentações</button></header><div style={{ overflowX: "auto" }}><table className={styles.inventoryTable}><thead><tr><th>Patrimônio</th><th>Bem</th><th>Localização</th><th>Responsável</th><th>Condição</th><th>Situação</th></tr></thead><tbody>{active.map((record) => <tr key={record.id} onClick={() => props.onOpenRecord(record)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") props.onOpenRecord(record); }}><td className={styles.assetCode}>{record.data.assetNumber || record.id}</td><td><strong>{record.title}</strong></td><td>{record.data.location || "Não informada"}</td><td>{record.data.holder || record.owner}</td><td>{record.data.condition || "A conferir"}</td><td><StatusPill status={record.status} /></td></tr>)}</tbody></table></div></section>
    <div className={styles.grid2}><AttentionPanel title="Bens que exigem ação" items={[...notFound, ...maintenance]} props={props} empty="Nenhum bem crítico no momento." /><ResourceAttention title="Termos e garantias" items={documentsAttention} props={props} empty="Nenhum documento com atenção." /></div>
  </HomeFrame>;
}

function HermesHome(props: Props) {
  const events = [...props.records].sort((a, b) => (a.data.date || "9999").localeCompare(b.data.date || "9999"));
  const openTasks = props.operations.filter((item) => !["Concluída", "Cancelada"].includes(item.status));
  const pendingGuests = props.resources.filter((item) => item.status === "Sem resposta");
  const confirmed = props.resources.filter((item) => ["Confirmado", "Acompanhante confirmado", "Presente"].includes(item.status));
  return <HomeFrame props={props} stats={[{ value: events.filter((item) => !["Encerrado", "Cancelado"].includes(item.status)).length, label: "eventos ativos" }, { value: openTasks.length, label: "tarefas abertas" }, { value: pendingGuests.length, label: "convidados sem resposta", attention: pendingGuests.length > 0 }, { value: confirmed.length, label: "presenças confirmadas" }]}>
    <div className={styles.grid2}>
      <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Calendário de eventos</h3><p>Datas, local e etapa de preparação.</p></div><button type="button" onClick={props.onOpenRecords}>Calendário completo</button></header><div className={styles.timelineList}>{events.slice(0, 6).map((record) => <div className={styles.timelineItem} key={record.id}><time className={styles.timelineDate}>{shortDate(record.data.date)}</time><i className={styles.timelineDot} /><button type="button" className={styles.recordRow} style={{ padding: 0, minHeight: 58, borderBottom: 0 }} onClick={() => props.onOpenRecord(record)}><div><strong>{record.title}</strong><p>{record.data.startTime || "horário a definir"} · {record.data.location || record.subtitle}</p></div><StatusPill status={record.status} /><Icon name="chevron" /></button></div>)}</div></section>
      <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Tarefas e fornecedores</h3><p>Confirmações que podem bloquear a preparação.</p></div><button type="button" onClick={props.onOpenOperations}>Abrir cronograma</button></header><div className={styles.recordList}>{openTasks.slice(0, 7).map((item) => <button type="button" className={styles.recordRow} key={item.id} onClick={() => openParent(props, item.parentId)}><div><strong>{item.title}</strong><p>{parentTitle(props, item.parentId)} · {formatDate(item.date)}</p></div><StatusPill status={item.status} /><Icon name="chevron" /></button>)}</div></section>
    </div>
  </HomeFrame>;
}

function AthenaHome(props: Props) {
  const active = props.records.filter((record) => !["Não participar", "Vencedora", "Perdida", "Cancelada"].includes(record.status));
  const deadlines = [...active].sort((a, b) => (a.data.deadline || a.data.session || "9999").localeCompare(b.data.deadline || b.data.session || "9999"));
  const attentionTasks = props.operations.filter((item) => ["Pendente", "Em preparação", "Aguardando informação", "Atrasado"].includes(item.status));
  const attentionDocs = props.resources.filter((item) => ["Pendente", "Vencendo", "Vencido"].includes(item.status));
  return <HomeFrame props={props} stats={[{ value: active.length, label: "oportunidades abertas" }, { value: attentionTasks.length, label: "prazos com ação" }, { value: attentionDocs.length, label: "documentos com atenção", attention: attentionDocs.length > 0 }, { value: active.filter((item) => item.status === "Em triagem").length, label: "decisões de participação" }]}>
    <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Próximos prazos</h3><p>Decida e prepare antes da data limite.</p></div><button type="button" onClick={props.onOpenOperations}>Checklist completo</button></header><div className={styles.deadlineGrid}>{deadlines.slice(0, 6).map((record, index) => <button type="button" className={styles.deadlineCard} data-urgent={index === 0 || undefined} key={record.id} onClick={() => props.onOpenRecord(record)}><time>{formatDate(record.data.deadline || record.data.session)}</time><h4>{record.title}</h4><p>{record.data.agency || record.subtitle}</p><StatusPill status={record.status} /><div className={styles.readiness}><span>Entrega: {record.data.deliveryViable || "A conferir"}</span><span>Documentos: {record.data.documentsReady || "A conferir"}</span></div></button>)}</div></section>
    <div className={styles.grid2}><OperationAttention title="Checklist que exige ação" items={attentionTasks} props={props} empty="Nenhuma etapa urgente." /><ResourceAttention title="Documentação da empresa" items={attentionDocs} props={props} empty="Documentação sem alertas." /></div>
  </HomeFrame>;
}

function GaiaHome(props: Props) {
  const producing = props.records.filter((record) => ["Em preparação", "Em produção", "Produção prevista"].includes(record.status));
  const occurrences = props.operations.filter((item) => ["Com observação", "Ocorrência aberta", "Em acompanhamento"].includes(item.status));
  const activeAreas = props.resources.filter((item) => item.status === "Em produção");
  return <HomeFrame props={props} stats={[{ value: producing.length, label: "ciclos em produção" }, { value: activeAreas.length, label: "áreas ou grupos ativos" }, { value: occurrences.length, label: "registros com atenção", attention: occurrences.length > 0 }, { value: props.records.filter((item) => item.status === "Produção prevista").length, label: "resultados previstos" }]}>
    <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Ciclos produtivos</h3><p>Fase atual, previsão e resultado esperado.</p></div><button type="button" onClick={props.onOpenResources}>Áreas e grupos</button></header><div className={styles.cardGrid}>{props.records.slice(0, 6).map((record) => {
      const progress = productionProgress(record.status);
      return <button type="button" className={styles.recordCard} key={record.id} onClick={() => props.onOpenRecord(record)}><span className={styles.cardLabel}>{record.data.productionType || "Produção"}</span><h4>{record.title}</h4><p>{record.data.property || record.subtitle}</p><p>{record.data.currentPhase || record.status} · previsão {formatDate(record.data.expectedEnd)}</p><div className={styles.progressTrack}><i style={{ width: `${progress}%` }} /></div><div className={styles.cardFooter}><StatusPill status={record.status} /><span>{record.data.goal || "meta a definir"}</span></div></button>;
    })}</div></section>
    <div className={styles.grid2}><OperationAttention title="Ocorrências e observações" items={occurrences} props={props} empty="Nenhuma ocorrência aberta." /><AttentionPanel title="Pontos de atenção dos ciclos" items={producing.filter((item) => item.data.alerts)} props={props} empty="Nenhum alerta registrado." useAlerts /></div>
  </HomeFrame>;
}

function PegasusHome(props: Props) {
  const activePets = props.records.filter((record) => record.status !== "Inativo");
  const special = activePets.filter((record) => record.status === "Atenção especial");
  const appointments = props.operations.filter((item) => !["Entregue", "Faltou", "Cancelado"].includes(item.status));
  const careAttention = props.resources.filter((item) => ["Atenção", "Vencido"].includes(item.status));
  return <HomeFrame props={props} stats={[{ value: activePets.length, label: "pets com ficha ativa" }, { value: appointments.length, label: "atendimentos abertos" }, { value: special.length, label: "pets com atenção especial", attention: special.length > 0 }, { value: careAttention.length, label: "cuidados com alerta", attention: careAttention.length > 0 }]}>
    <div className={styles.grid2}>
      <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Agenda e atendimentos</h3><p>Quem chega, está em atendimento ou aguarda retirada.</p></div><button type="button" onClick={props.onOpenOperations}>Abrir agenda</button></header><div className={styles.recordList}>{appointments.slice(0, 7).map((item) => <button type="button" className={styles.recordRow} key={item.id} onClick={() => openParent(props, item.parentId)}><div><strong>{item.title}</strong><p>{parentTitle(props, item.parentId)} · {formatDate(item.date)}</p></div><StatusPill status={item.status} /><Icon name="chevron" /></button>)}{!appointments.length ? <div className={styles.empty}>Nenhum atendimento aberto.</div> : null}</div></section>
      <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Fichas que exigem atenção</h3><p>Comportamento, restrições e pessoas autorizadas.</p></div><button type="button" onClick={props.onOpenRecords}>Todos os pets</button></header><div className={styles.cardGrid}>{activePets.slice(0, 4).map((record) => <button type="button" className={styles.petCard} key={record.id} onClick={() => props.onOpenRecord(record)}><span className={styles.cardLabel}>{record.data.species || "Pet"} · {record.data.breed || "raça não informada"}</span><h4>{record.title}</h4><p>Tutor: {record.data.tutor || "não informado"}</p><p>{record.data.restrictions || record.data.behavior || "Sem alerta informado."}</p><div className={styles.cardFooter}><StatusPill status={record.status} /><span>{record.data.pickupPerson || "retirada a confirmar"}</span></div></button>)}</div></section>
    </div>
  </HomeFrame>;
}

function TitansHome(props: Props) {
  const active = props.records.filter((record) => !["Entregue", "Cancelada"].includes(record.status));
  const blocked = props.operations.filter((item) => ["Aguardando cliente", "Aguardando equipe", "Atrasada", "Bloqueada"].includes(item.status));
  const decisions = props.resources.filter((item) => ["Solicitada", "Aguardando cliente"].includes(item.status));
  return <HomeFrame props={props} stats={[{ value: active.length, label: "obras ativas" }, { value: blocked.length, label: "etapas com bloqueio", attention: blocked.length > 0 }, { value: decisions.length, label: "decisões do cliente", attention: decisions.length > 0 }, { value: averageProgress(active), label: "avanço médio das obras" }]}>
    <section className={styles.panel}><header className={styles.panelHeader}><div><h3>Avanço das obras</h3><p>Progresso, próxima etapa e bloqueios registrados.</p></div><button type="button" onClick={props.onOpenOperations}>Diário e etapas</button></header><div className={styles.cardGrid}>{active.slice(0, 6).map((record) => {
      const progress = clampProgress(record.data.progress);
      return <button type="button" className={styles.projectCard} key={record.id} onClick={() => props.onOpenRecord(record)}><span className={styles.cardLabel}>{record.data.type || "Obra"}</span><h4>{record.title}</h4><p>{record.data.client || record.subtitle}</p><div className={styles.progressTrack}><i style={{ width: `${progress}%` }} /></div><p><strong>{progress}%</strong> · próxima etapa: {record.data.nextStep || "a definir"}</p>{record.data.blockers ? <p>Bloqueio: {record.data.blockers}</p> : null}<div className={styles.cardFooter}><StatusPill status={record.status} /><span>{formatDate(record.data.end)}</span></div></button>;
    })}</div></section>
    <div className={styles.grid2}><OperationAttention title="Etapas e bloqueios" items={blocked} props={props} empty="Nenhuma etapa bloqueada." /><ResourceAttention title="Alterações e decisões" items={decisions} props={props} empty="Nenhuma decisão aguardando cliente." /></div>
  </HomeFrame>;
}

function AttentionPanel({ title, items, props, empty, useAlerts = false }: { title: string; items: MainRecord[]; props: Props; empty: string; useAlerts?: boolean }) {
  return <section className={styles.panel}><header className={styles.panelHeader}><div><h3>{title}</h3><p>Itens que merecem revisão antes de continuar.</p></div></header>{useAlerts ? <div className={styles.alertList}>{items.slice(0, 5).map((record) => <button type="button" className={styles.alertItem} key={record.id} onClick={() => props.onOpenRecord(record)}><Icon name="warning" /><div><strong>{record.title}</strong><p>{record.data.alerts || record.subtitle}</p></div></button>)}{!items.length ? <div className={styles.empty}>{empty}</div> : null}</div> : <div className={styles.recordList}>{items.slice(0, 6).map((record) => <button type="button" className={styles.recordRow} key={record.id} onClick={() => props.onOpenRecord(record)}><div><strong>{record.title}</strong><p>{record.subtitle}</p></div><StatusPill status={record.status} /><Icon name="chevron" /></button>)}{!items.length ? <div className={styles.empty}>{empty}</div> : null}</div>}</section>;
}

function OperationAttention({ title, items, props, empty }: { title: string; items: RelatedRecord[]; props: Props; empty: string }) {
  return <section className={styles.panel}><header className={styles.panelHeader}><div><h3>{title}</h3><p>Ações vinculadas aos registros principais.</p></div><button type="button" onClick={props.onOpenOperations}>Ver todos</button></header><div className={styles.recordList}>{items.slice(0, 6).map((item) => <button type="button" className={styles.recordRow} key={item.id} onClick={() => openParent(props, item.parentId)}><div><strong>{item.title}</strong><p>{parentTitle(props, item.parentId)} · {formatDate(item.date)}</p></div><StatusPill status={item.status} /><Icon name="chevron" /></button>)}{!items.length ? <div className={styles.empty}>{empty}</div> : null}</div></section>;
}

function ResourceAttention({ title, items, props, empty }: { title: string; items: ResourceRecord[]; props: Props; empty: string }) {
  return <section className={styles.panel}><header className={styles.panelHeader}><div><h3>{title}</h3><p>Documentos, pessoas ou itens vinculados.</p></div><button type="button" onClick={props.onOpenResources}>Ver todos</button></header><div className={styles.recordList}>{items.slice(0, 6).map((item) => <button type="button" className={styles.recordRow} key={item.id} onClick={() => openParent(props, item.parentId)}><div><strong>{item.title}</strong><p>{item.reference || parentTitle(props, item.parentId)} · {formatDate(item.due)}</p></div><StatusPill status={item.status} /><Icon name="chevron" /></button>)}{!items.length ? <div className={styles.empty}>{empty}</div> : null}</div></section>;
}

function openParent(props: Props, parentId: string) {
  const record = props.records.find((item) => item.id === parentId);
  if (record) props.onOpenRecord(record);
}

function parentTitle(props: Props, parentId: string) {
  return props.records.find((item) => item.id === parentId)?.title ?? "Registro não encontrado";
}

function formatDate(value?: string) {
  if (!value) return "data a definir";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function shortDate(value?: string) {
  if (!value) return "A definir";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

function productionProgress(status: string) {
  const map: Record<string, number> = { Planejado: 8, "Em preparação": 25, "Em produção": 58, "Produção prevista": 84, Concluído: 100, Interrompido: 35 };
  return map[status] ?? 12;
}

function clampProgress(value?: string) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function averageProgress(records: MainRecord[]) {
  if (!records.length) return "0%";
  return `${Math.round(records.reduce((total, record) => total + clampProgress(record.data.progress), 0) / records.length)}%`;
}
