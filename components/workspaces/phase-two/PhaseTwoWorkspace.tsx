"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import styles from "./PhaseTwoWorkspace.module.css";

type IconName =
  | "arrow"
  | "back"
  | "calendar"
  | "car"
  | "check"
  | "chevron"
  | "clipboard"
  | "clock"
  | "close"
  | "comment"
  | "document"
  | "filter"
  | "history"
  | "kitchen"
  | "mail"
  | "menu"
  | "people"
  | "plus"
  | "search"
  | "spark"
  | "table"
  | "user"
  | "warning";

type ShellProps = {
  product: Product;
  section: string;
  children: ReactNode;
  action?: ReactNode;
  nav: string[];
  activeNav: string;
  onNavChange: (item: string) => void;
  variant: string;
};

export function PhaseTwoWorkspace({ product }: { product: Product }) {
  if (product.slug === "atlas") return <AtlasApp product={product} />;
  if (product.slug === "artemis") return <ArtemisApp product={product} />;
  if (product.slug === "ares") return <AresApp product={product} />;
  if (product.slug === "poseidon") return <PoseidonApp product={product} />;
  if (product.slug === "pandora") return <PandoraApp product={product} />;
  if (product.slug === "hercules") return <HerculesApp product={product} />;
  return null;
}

function ProductShell({ product, section, children, action, nav, activeNav, onNavChange, variant }: ShellProps) {
  const [mobileNav, setMobileNav] = useState(false);
  const shellStyle = { "--accent": product.color, "--soft": product.colorSoft } as CSSProperties;

  return (
    <div className={`${styles.product} ${styles[variant]}`} style={shellStyle}>
      <header className={styles.productHeader}>
        <div className={styles.headerIdentity}>
          <Link href="/" className={styles.backButton} aria-label="Voltar aos sistemas"><Icon name="back" /></Link>
          <div className={styles.productMark}><ProductGlyph slug={product.slug} /></div>
          <div><strong>{product.shortName}</strong><small>{section}</small></div>
        </div>
        <button className={styles.mobileMenu} type="button" onClick={() => setMobileNav((value) => !value)} aria-label="Abrir navegação"><Icon name={mobileNav ? "close" : "menu"} /></button>
        <nav className={`${styles.topNav} ${mobileNav ? styles.topNavOpen : ""}`} aria-label={`Navegação do ${product.name}`}>
          {nav.map((item) => (
            <button key={item} type="button" className={activeNav === item ? styles.topNavActive : ""} onClick={() => { onNavChange(item); setMobileNav(false); }}>{item}</button>
          ))}
        </nav>
        <div className={styles.headerAction}>{action}</div>
      </header>
      <main className={styles.productMain}>{children}</main>
      <div className={styles.testNotice}>Ambiente de teste · dados somente neste navegador</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Atlas                                                                       */
/* -------------------------------------------------------------------------- */

type AtlasStage = "avaliacao" | "aprovacao" | "servico" | "entrega";
type Vehicle = {
  id: string;
  vehicle: string;
  plate: string;
  client: string;
  issue: string;
  stage: AtlasStage;
  owner: string;
  time: string;
  urgency?: "danger" | "warning";
  photo: string;
};

const atlasStages: Array<{ id: AtlasStage; label: string; helper: string }> = [
  { id: "avaliacao", label: "Avaliação", helper: "Receber e diagnosticar" },
  { id: "aprovacao", label: "Aguardando cliente", helper: "Orçamento ou autorização" },
  { id: "servico", label: "Em serviço", helper: "Execução e atualização" },
  { id: "entrega", label: "Prontos para entrega", helper: "Conferência e retirada" },
];

const atlasSeed: Vehicle[] = [
  { id: "OS 1052", vehicle: "Volkswagen Nivus", plate: "SFK2C10", client: "Renato Lima", issue: "Luz da injeção acesa", stage: "avaliacao", owner: "Sem técnico", time: "28 min", photo: "NV" },
  { id: "OS 1051", vehicle: "Volkswagen Saveiro", plate: "TCJ9I23", client: "Barros & Braga", issue: "Ruído na traseira", stage: "aprovacao", owner: "Marcos", time: "2h18", urgency: "warning", photo: "SV" },
  { id: "OS 1048", vehicle: "Fiat Strada", plate: "RQX7B44", client: "Construtora Norte", issue: "Falha na partida", stage: "servico", owner: "Carlos", time: "3h02", urgency: "danger", photo: "ST" },
  { id: "OS 1050", vehicle: "Volkswagen T-Cross", plate: "QVA4E19", client: "Fernanda Souza", issue: "Revisão preventiva", stage: "servico", owner: "Paulo", time: "1h12", photo: "TC" },
  { id: "OS 1046", vehicle: "Hyundai HB20", plate: "QDL8F20", client: "Marina Costa", issue: "Troca de correia", stage: "entrega", owner: "Paulo", time: "Pronto 14:20", photo: "HB" },
];

function AtlasApp({ product }: { product: Product }) {
  const [activeNav, setActiveNav] = useState("Pátio");
  const [vehicles, setVehicles] = useState(atlasSeed);
  const [selected, setSelected] = useState<Vehicle | null>(atlasSeed[1]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return vehicles;
    return vehicles.filter((item) => `${item.vehicle} ${item.plate} ${item.client} ${item.id}`.toLowerCase().includes(normalized));
  }, [query, vehicles]);

  function advance(vehicle: Vehicle) {
    const order = atlasStages.map((stage) => stage.id);
    const next = order[Math.min(order.indexOf(vehicle.stage) + 1, order.length - 1)];
    setVehicles((items) => items.map((item) => item.id === vehicle.id ? { ...item, stage: next } : item));
    setSelected((item) => item?.id === vehicle.id ? { ...item, stage: next } : item);
  }

  function createOrder() {
    const next: Vehicle = {
      id: `OS ${1053 + vehicles.length}`,
      vehicle: "Novo veículo",
      plate: "SEM PLACA",
      client: "Cliente em cadastro",
      issue: "Defeito ainda não informado",
      stage: "avaliacao",
      owner: "Sem técnico",
      time: "agora",
      photo: "NV",
    };
    setVehicles((items) => [next, ...items]);
    setSelected(next);
    setShowCreate(false);
  }

  return (
    <ProductShell product={product} section="Oficina" variant="atlas" nav={["Pátio", "Agenda", "Clientes", "Veículos", "Histórico"]} activeNav={activeNav} onNavChange={setActiveNav} action={<button className={styles.primaryAction} onClick={() => setShowCreate(true)}><Icon name="plus" /> Nova OS</button>}>
      <section className={styles.atlasIntro}>
        <div><span className={styles.contextLabel}>Pátio de hoje</span><h1>Veja o carro, a etapa e o próximo passo.</h1><p>Nada de painel: esta tela acompanha o fluxo real da oficina.</p></div>
        <label className={styles.atlasSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar placa, cliente ou OS" /></label>
      </section>

      <section className={styles.atlasBoard} aria-label="Fluxo de veículos da oficina">
        {atlasStages.map((stage) => {
          const items = filtered.filter((vehicle) => vehicle.stage === stage.id);
          return (
            <div className={styles.atlasLane} key={stage.id}>
              <div className={styles.atlasLaneHead}><div><strong>{stage.label}</strong><small>{stage.helper}</small></div><span>{items.length}</span></div>
              <div className={styles.atlasLaneBody}>
                {items.map((vehicle) => (
                  <article key={vehicle.id} className={`${styles.vehicleCard} ${vehicle.urgency ? styles[`vehicle_${vehicle.urgency}`] : ""}`} onClick={() => setSelected(vehicle)}>
                    <div className={styles.vehicleVisual}><span>{vehicle.photo}</span><small>{vehicle.plate}</small></div>
                    <div className={styles.vehicleCopy}>
                      <div className={styles.vehicleTop}><span>{vehicle.id}</span><small>{vehicle.time}</small></div>
                      <h2>{vehicle.vehicle}</h2><p>{vehicle.client}</p>
                      <div className={styles.vehicleIssue}><Icon name={vehicle.urgency === "danger" ? "warning" : "clipboard"} /><span>{vehicle.issue}</span></div>
                      <div className={styles.vehicleOwner}><span>{vehicle.owner}</span><button type="button" onClick={(event) => { event.stopPropagation(); advance(vehicle); }} aria-label={`Avançar ${vehicle.id}`}><Icon name="arrow" /></button></div>
                    </div>
                  </article>
                ))}
                {!items.length && <div className={styles.emptyLane}><Icon name="car" /><span>Nenhum veículo nesta etapa</span></div>}
              </div>
            </div>
          );
        })}
      </section>

      {selected && (
        <aside className={styles.atlasDrawer}>
          <button className={styles.drawerClose} type="button" onClick={() => setSelected(null)} aria-label="Fechar detalhes"><Icon name="close" /></button>
          <span className={styles.contextLabel}>{selected.id}</span><h2>{selected.vehicle}</h2><strong className={styles.bigPlate}>{selected.plate}</strong>
          <dl className={styles.detailList}><div><dt>Cliente</dt><dd>{selected.client}</dd></div><div><dt>Defeito informado</dt><dd>{selected.issue}</dd></div><div><dt>Responsável</dt><dd>{selected.owner}</dd></div><div><dt>Tempo nesta etapa</dt><dd>{selected.time}</dd></div></dl>
          <div className={styles.drawerActions}><button type="button">Adicionar foto</button><button type="button" className={styles.drawerPrimary} onClick={() => advance(selected)}>Avançar etapa</button></div>
        </aside>
      )}
      {showCreate && <SimpleModal title="Nova ordem de serviço" description="Comece apenas com cliente e veículo. O restante aparece durante o atendimento." action="Criar OS" onClose={() => setShowCreate(false)} onConfirm={createOrder} />}
    </ProductShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Artemis                                                                     */
/* -------------------------------------------------------------------------- */

type RestaurantMode = "salao" | "cozinha" | "gestao";
type TableState = "livre" | "atendendo" | "pedido" | "pronto" | "atraso";
type RestaurantTable = { id: number; seats: number; state: TableState; waiter?: string; order?: string; time?: number };

const tableSeed: RestaurantTable[] = [
  { id: 1, seats: 2, state: "livre" }, { id: 2, seats: 4, state: "atendendo", waiter: "Ana", time: 5 },
  { id: 3, seats: 4, state: "atraso", waiter: "Ana", order: "411", time: 31 }, { id: 4, seats: 2, state: "pedido", waiter: "Rafael", order: "412", time: 9 },
  { id: 5, seats: 6, state: "pronto", waiter: "Rafael", order: "410", time: 2 }, { id: 6, seats: 4, state: "livre" },
  { id: 7, seats: 4, state: "pedido", waiter: "Ana", order: "408", time: 12 }, { id: 8, seats: 8, state: "atendendo", waiter: "João", time: 3 },
  { id: 9, seats: 2, state: "livre" }, { id: 10, seats: 4, state: "pedido", waiter: "João", order: "413", time: 7 },
  { id: 11, seats: 2, state: "livre" }, { id: 12, seats: 6, state: "atendendo", waiter: "Rafael", time: 14 },
];

const kitchenSeed = [
  { id: "411", place: "Mesa 03", items: ["2× X-bacon", "1× Fritas grande"], minutes: 31, state: "late" },
  { id: "408", place: "Mesa 07", items: ["1× Frango grelhado", "2× Suco de laranja", "1× Salada"], minutes: 12, state: "cooking" },
  { id: "412", place: "Mesa 04", items: ["2× Parmegiana", "1× Refrigerante"], minutes: 9, state: "new" },
  { id: "413", place: "Mesa 10", items: ["1× Hambúrguer da casa"], minutes: 7, state: "new" },
];

function ArtemisApp({ product }: { product: Product }) {
  const [activeNav, setActiveNav] = useState("Turno");
  const [mode, setMode] = useState<RestaurantMode>("salao");
  const [tables, setTables] = useState(tableSeed);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(tableSeed[2]);
  const [tickets, setTickets] = useState(kitchenSeed);

  function openTable(table: RestaurantTable) {
    if (table.state === "livre") {
      const opened = { ...table, state: "atendendo" as TableState, waiter: "Ana", time: 0 };
      setTables((items) => items.map((item) => item.id === table.id ? opened : item));
      setSelectedTable(opened);
      return;
    }
    setSelectedTable(table);
  }

  function markReady(id: string) {
    setTickets((items) => items.filter((item) => item.id !== id));
    setTables((items) => items.map((table) => table.order === id ? { ...table, state: "pronto" } : table));
  }

  return (
    <ProductShell product={product} section="Restaurante" variant="artemis" nav={["Turno", "Mesas", "Comandas", "Cardápio", "Histórico"]} activeNav={activeNav} onNavChange={setActiveNav} action={<div className={styles.roleSwitch}><button className={mode === "salao" ? styles.roleActive : ""} onClick={() => setMode("salao")}>Salão</button><button className={mode === "cozinha" ? styles.roleActive : ""} onClick={() => setMode("cozinha")}>Cozinha</button><button className={mode === "gestao" ? styles.roleActive : ""} onClick={() => setMode("gestao")}>Gestão</button></div>}>
      {mode === "salao" && (
        <section className={styles.floorView}>
          <div className={styles.floorHeading}><div><span className={styles.contextLabel}>Salão · noite</span><h1>Mesas em um olhar.</h1><p>Toque na mesa para abrir ou continuar o atendimento.</p></div><button className={styles.primaryAction} onClick={() => openTable(tables.find((table) => table.state === "livre") ?? tables[0])}><Icon name="plus" /> Abrir mesa</button></div>
          <div className={styles.floorLegend}><span><i className={styles.legendFree} />Livre</span><span><i className={styles.legendServing} />Atendimento</span><span><i className={styles.legendKitchen} />Na cozinha</span><span><i className={styles.legendReady} />Pronto</span><span><i className={styles.legendLate} />Atrasado</span></div>
          <div className={styles.floorPlan}>
            <div className={styles.floorAreaLabel}>Janela</div>
            {tables.map((table) => (
              <button key={table.id} type="button" className={`${styles.restaurantTable} ${styles[`table_${table.state}`]}`} onClick={() => openTable(table)}>
                <span>Mesa {String(table.id).padStart(2, "0")}</span><strong>{table.state === "livre" ? "Livre" : table.state === "pronto" ? "Servir agora" : `${table.time} min`}</strong><small>{table.seats} lugares{table.waiter ? ` · ${table.waiter}` : ""}</small>
              </button>
            ))}
            <div className={styles.serviceCounter}><Icon name="kitchen" /><span>Balcão de retirada</span></div>
          </div>
          {selectedTable && <CommandPanel table={selectedTable} onClose={() => setSelectedTable(null)} />}
        </section>
      )}

      {mode === "cozinha" && (
        <section className={styles.kitchenView}>
          <div className={styles.kitchenHeading}><div><span className={styles.contextLabel}>Fila da cozinha</span><h1>Prepare na ordem certa.</h1></div><div className={styles.kitchenClock}><Icon name="clock" /><strong>19:46</strong></div></div>
          <div className={styles.kitchenRail}>
            {tickets.map((ticket) => (
              <article key={ticket.id} className={`${styles.kitchenTicket} ${styles[`ticket_${ticket.state}`]}`}>
                <header><div><span>#{ticket.id}</span><strong>{ticket.place}</strong></div><b>{ticket.minutes} min</b></header>
                <ul>{ticket.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <footer><button type="button">Ver observação</button><button type="button" onClick={() => markReady(ticket.id)}><Icon name="check" /> Marcar pronto</button></footer>
              </article>
            ))}
            {!tickets.length && <div className={styles.kitchenClear}><Icon name="check" /><strong>Fila concluída</strong><span>Nenhum pedido aguardando preparo.</span></div>}
          </div>
        </section>
      )}

      {mode === "gestao" && (
        <section className={styles.restaurantManagement}>
          <div className={styles.managementIntro}><span className={styles.contextLabel}>Ritmo do serviço</span><h1>Onde o turno está perdendo tempo.</h1><p>A gestão aparece separada do salão e da cozinha.</p></div>
          <div className={styles.serviceStory}>
            <article><span>Agora</span><h2>Atenção na Mesa 03</h2><p>O pedido está há 31 minutos na cozinha. Priorize antes de abrir uma nova sequência.</p><button type="button" onClick={() => setMode("cozinha")}>Abrir fila da cozinha <Icon name="arrow" /></button></article>
            <div className={styles.serviceTimeline}><div><span>18:00</span><i style={{ width: "42%" }} /><strong>Início leve</strong></div><div><span>19:00</span><i style={{ width: "78%" }} /><strong>Pico do salão</strong></div><div><span>19:46</span><i style={{ width: "61%" }} /><strong>4 pedidos ativos</strong></div></div>
          </div>
          <div className={styles.shiftNotes}><h2>Leitura do turno</h2><div><article><strong>12</strong><span>comandas abertas</span></article><article><strong>18 min</strong><span>tempo típico de preparo</span></article><article><strong>1</strong><span>pedido fora do ritmo</span></article></div></div>
        </section>
      )}
    </ProductShell>
  );
}

function CommandPanel({ table, onClose }: { table: RestaurantTable; onClose: () => void }) {
  return (
    <aside className={styles.commandPanel}>
      <button className={styles.drawerClose} type="button" onClick={onClose}><Icon name="close" /></button>
      <span className={styles.contextLabel}>Atendimento</span><h2>Mesa {String(table.id).padStart(2, "0")}</h2><p>{table.seats} lugares · {table.waiter ?? "Sem garçom"}</p>
      <div className={styles.commandItems}><div><span>2×</span><strong>X-bacon</strong><small>sem cebola</small></div><div><span>1×</span><strong>Fritas grande</strong><small>tradicional</small></div></div>
      <button className={styles.commandAdd}><Icon name="plus" /> Adicionar item</button>
      <div className={styles.commandFooter}><button type="button">Observação</button><button type="button" className={styles.drawerPrimary}>Enviar à cozinha</button></div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Ares                                                                        */
/* -------------------------------------------------------------------------- */

type Proposal = { id: string; client: string; title: string; value: string; status: "rascunho" | "enviado" | "visualizado" | "ajuste" | "aprovado"; validity: string; owner: string; version: string; updated: string };
const proposalSeed: Proposal[] = [
  { id: "OR-132", client: "Studio Aurora", title: "Mobiliário planejado", value: "R$ 18.450", status: "visualizado", validity: "8 dias", owner: "Camila", version: "v3", updated: "Hoje, 13:42" },
  { id: "OR-131", client: "Rota Engenharia", title: "Manutenção preventiva", value: "R$ 6.980", status: "enviado", validity: "4 dias", owner: "Diego", version: "v1", updated: "Ontem, 16:10" },
  { id: "OR-130", client: "Solar Norte", title: "Implantação de serviço", value: "R$ 12.300", status: "ajuste", validity: "10 dias", owner: "Camila", version: "v2", updated: "Ontem, 15:02" },
  { id: "OR-129", client: "Clínica Vida", title: "Serviço recorrente", value: "R$ 4.850", status: "rascunho", validity: "12 dias", owner: "Lucas", version: "v1", updated: "Há 3 dias" },
];

function AresApp({ product }: { product: Product }) {
  const [activeNav, setActiveNav] = useState("Acompanhar");
  const [proposals, setProposals] = useState(proposalSeed);
  const [selectedId, setSelectedId] = useState(proposalSeed[0].id);
  const [showCreate, setShowCreate] = useState(false);
  const selected = proposals.find((proposal) => proposal.id === selectedId) ?? proposals[0];

  function updateStatus(status: Proposal["status"]) {
    setProposals((items) => items.map((item) => item.id === selected.id ? { ...item, status, updated: "agora" } : item));
  }

  function duplicateProposal() {
    const copy = { ...selected, id: `OR-${132 + proposals.length}`, status: "rascunho" as const, version: "v1", updated: "agora" };
    setProposals((items) => [copy, ...items]);
    setSelectedId(copy.id);
  }

  return (
    <ProductShell product={product} section="Orçamentos" variant="ares" nav={["Acompanhar", "Criar", "Clientes", "Modelos", "Histórico"]} activeNav={activeNav} onNavChange={setActiveNav} action={<button className={styles.primaryAction} onClick={() => setShowCreate(true)}><Icon name="plus" /> Nova proposta</button>}>
      <section className={styles.proposalWorkspace}>
        <aside className={styles.proposalRail}>
          <div className={styles.proposalRailHead}><div><span className={styles.contextLabel}>Propostas</span><h1>Acompanhar</h1></div><button type="button"><Icon name="filter" /></button></div>
          <label className={styles.railSearch}><Icon name="search" /><input placeholder="Buscar cliente" /></label>
          <div className={styles.proposalList}>{proposals.map((proposal) => <button type="button" key={proposal.id} className={selected.id === proposal.id ? styles.proposalSelected : ""} onClick={() => setSelectedId(proposal.id)}><span>{proposal.id} · {proposal.version}</span><strong>{proposal.client}</strong><small>{proposal.title}</small><div><StatusLabel status={proposal.status} /><b>{proposal.value}</b></div></button>)}</div>
        </aside>

        <article className={styles.documentCanvas}>
          <div className={styles.documentToolbar}><div><button type="button"><Icon name="back" /></button><span>{selected.id} · {selected.version}</span></div><div><button type="button" onClick={duplicateProposal}>Duplicar</button><button type="button">Gerar PDF</button><button type="button" className={styles.documentShare}><Icon name="mail" /> Compartilhar</button></div></div>
          <div className={styles.proposalPaper}>
            <header><div className={styles.paperBrand}><span>A</span><strong>PROPOSTA COMERCIAL</strong></div><div><span>{selected.id}</span><small>Validade: {selected.validity}</small></div></header>
            <section><span>Preparado para</span><h2>{selected.client}</h2><p>{selected.title}</p></section>
            <div className={styles.scopeBlock}><h3>Escopo</h3><div><span>01</span><p><strong>Planejamento e preparação</strong><small>Levantamento, definição do escopo e alinhamento da execução.</small></p></div><div><span>02</span><p><strong>Execução do serviço</strong><small>Realização das atividades descritas e registro das entregas.</small></p></div><div><span>03</span><p><strong>Conclusão e aceite</strong><small>Revisão final, ajustes acordados e registro da decisão.</small></p></div></div>
            <footer><div><span>Investimento de referência</span><strong>{selected.value}</strong></div><p>Esta demonstração não realiza cobrança ou faturamento.</p></footer>
          </div>
        </article>

        <aside className={styles.proposalActivity}>
          <span className={styles.contextLabel}>Situação atual</span><StatusLabel status={selected.status} large />
          <dl><div><dt>Responsável</dt><dd>{selected.owner}</dd></div><div><dt>Validade</dt><dd>{selected.validity}</dd></div><div><dt>Atualizado</dt><dd>{selected.updated}</dd></div></dl>
          <h2>Linha do tempo</h2><ol><li><i /><div><strong>Proposta visualizada</strong><small>Hoje às 13:42</small></div></li><li><i /><div><strong>Versão {selected.version} compartilhada</strong><small>Ontem às 17:10</small></div></li><li><i /><div><strong>Escopo revisado</strong><small>Camila · ontem</small></div></li></ol>
          <div className={styles.decisionActions}><button type="button" onClick={() => updateStatus("ajuste")}>Registrar ajuste</button><button type="button" onClick={() => updateStatus("aprovado")}>Marcar aprovada</button></div>
        </aside>
      </section>
      {showCreate && <SimpleModal title="Criar proposta" description="Escolha o cliente e comece pelo escopo. Valores e validade entram na próxima etapa." action="Criar rascunho" onClose={() => setShowCreate(false)} onConfirm={() => { duplicateProposal(); setShowCreate(false); }} />}
    </ProductShell>
  );
}

function StatusLabel({ status, large = false }: { status: Proposal["status"]; large?: boolean }) {
  const labels = { rascunho: "Rascunho", enviado: "Enviado", visualizado: "Visualizado", ajuste: "Ajuste solicitado", aprovado: "Aprovado" };
  return <span className={`${styles.statusLabel} ${styles[`status_${status}`]} ${large ? styles.statusLarge : ""}`}>{labels[status]}</span>;
}

/* -------------------------------------------------------------------------- */
/* Poseidon                                                                    */
/* -------------------------------------------------------------------------- */

type DealStage = "entrada" | "qualificacao" | "proposta" | "decisao";
type Deal = { id: string; company: string; contact: string; summary: string; value: string; owner: string; next: string; stage: DealStage; temperature: "cold" | "warm" | "hot" };
const dealStages: Array<{ id: DealStage; label: string; helper: string }> = [
  { id: "entrada", label: "Novas oportunidades", helper: "Entender necessidade" },
  { id: "qualificacao", label: "Em conversa", helper: "Confirmar aderência" },
  { id: "proposta", label: "Proposta enviada", helper: "Acompanhar decisão" },
  { id: "decisao", label: "Decisão", helper: "Registrar resultado" },
];
const dealSeed: Deal[] = [
  { id: "OP-204", company: "Rota Engenharia", contact: "Marcelo", summary: "Controle de inspeções", value: "R$ 8 mil", owner: "Ana", next: "Ligar hoje às 15h", stage: "entrada", temperature: "warm" },
  { id: "OP-201", company: "Clínica Vida", contact: "Mariana", summary: "Orçamentos recorrentes", value: "R$ 5 mil", owner: "Lucas", next: "Enviar exemplo", stage: "qualificacao", temperature: "cold" },
  { id: "OP-198", company: "Studio Aurora", contact: "Rafael", summary: "Gestão comercial", value: "R$ 18 mil", owner: "Ana", next: "Reunião amanhã", stage: "qualificacao", temperature: "hot" },
  { id: "OP-193", company: "Solar Norte", contact: "Bianca", summary: "Checklist operacional", value: "R$ 12 mil", owner: "Diego", next: "Retornar sexta", stage: "proposta", temperature: "warm" },
  { id: "OP-187", company: "Norte Log", contact: "João", summary: "Sistema de oficina", value: "R$ 9 mil", owner: "Diego", next: "Registrar decisão", stage: "decisao", temperature: "cold" },
];

function PoseidonApp({ product }: { product: Product }) {
  const [activeNav, setActiveNav] = useState("Pipeline");
  const [deals, setDeals] = useState(dealSeed);
  const [dragged, setDragged] = useState<string | null>(null);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function drop(stage: DealStage, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!dragged) return;
    setDeals((items) => items.map((deal) => deal.id === dragged ? { ...deal, stage } : deal));
    setDragged(null);
  }

  function createDeal() {
    const deal: Deal = { id: `OP-${205 + deals.length}`, company: "Nova oportunidade", contact: "Contato em cadastro", summary: "Necessidade ainda não informada", value: "A definir", owner: "Sem responsável", next: "Qualificar oportunidade", stage: "entrada", temperature: "cold" };
    setDeals((items) => [deal, ...items]);
    setSelected(deal);
    setShowCreate(false);
  }

  return (
    <ProductShell product={product} section="Vendas" variant="poseidon" nav={["Pipeline", "Agenda", "Contatos", "Atividades", "Histórico"]} activeNav={activeNav} onNavChange={setActiveNav} action={<button className={styles.primaryAction} onClick={() => setShowCreate(true)}><Icon name="plus" /> Nova oportunidade</button>}>
      <section className={styles.pipelineHeading}><div><span className={styles.contextLabel}>Pipeline comercial</span><h1>Toda negociação com um próximo passo.</h1><p>Arraste as oportunidades conforme a conversa avança.</p></div><div className={styles.nextActions}><Icon name="calendar" /><span><strong>3 ações para hoje</strong><small>A próxima começa às 15h</small></span><button type="button">Abrir agenda</button></div></section>
      <section className={styles.pipelineBoard}>
        {dealStages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage.id);
          return (
            <div key={stage.id} className={styles.pipelineStage} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(stage.id, event)}>
              <header><div><strong>{stage.label}</strong><small>{stage.helper}</small></div><span>{stageDeals.length}</span></header>
              <div className={styles.pipelineCards}>{stageDeals.map((deal) => (
                <article key={deal.id} draggable onDragStart={() => setDragged(deal.id)} onClick={() => setSelected(deal)} className={`${styles.dealCard} ${styles[`deal_${deal.temperature}`]}`}>
                  <div className={styles.dealTop}><span>{deal.id}</span><i /></div><h2>{deal.company}</h2><p>{deal.summary}</p><div className={styles.dealPerson}><span>{deal.contact}</span><small>{deal.owner}</small></div><div className={styles.dealNext}><Icon name="clock" /><span>{deal.next}</span></div><footer><strong>{deal.value}</strong><Icon name="chevron" /></footer>
                </article>
              ))}</div>
            </div>
          );
        })}
      </section>
      {selected && <aside className={styles.dealDrawer}><button className={styles.drawerClose} onClick={() => setSelected(null)}><Icon name="close" /></button><span className={styles.contextLabel}>{selected.id}</span><h2>{selected.company}</h2><p>{selected.summary}</p><div className={styles.contactHero}><span>{selected.contact.slice(0, 2).toUpperCase()}</span><div><strong>{selected.contact}</strong><small>Contato principal</small></div></div><dl className={styles.detailList}><div><dt>Responsável</dt><dd>{selected.owner}</dd></div><div><dt>Referência comercial</dt><dd>{selected.value}</dd></div><div><dt>Próxima ação</dt><dd>{selected.next}</dd></div></dl><h3>Últimos contatos</h3><div className={styles.contactHistory}><p><i />Conversa registrada ontem</p><p><i />Material enviado há 3 dias</p></div><button className={styles.drawerPrimary}>Registrar contato</button></aside>}
      {showCreate && <SimpleModal title="Nova oportunidade" description="Registre somente empresa, contato e próximo passo. O restante cresce com a negociação." action="Criar oportunidade" onClose={() => setShowCreate(false)} onConfirm={createDeal} />}
    </ProductShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Pandora                                                                     */
/* -------------------------------------------------------------------------- */

type Feedback = { id: string; score: number; client: string; channel: string; comment: string; theme: string; date: string; treated: boolean };
const feedbackSeed: Feedback[] = [
  { id: "FB-904", score: 3, client: "Marina C.", channel: "Pós-atendimento", comment: "O serviço ficou bom, mas eu não sabia em que etapa estava e precisei perguntar duas vezes.", theme: "Comunicação", date: "Hoje, 09:42", treated: false },
  { id: "FB-903", score: 10, client: "Rafael S.", channel: "Entrega", comment: "Atendimento rápido e explicação muito clara. Voltaria com certeza.", theme: "Atendimento", date: "Hoje, 08:17", treated: false },
  { id: "FB-902", score: 6, client: "Cláudia N.", channel: "Pesquisa mensal", comment: "Gostei do produto, mas o retorno demorou mais do que o combinado.", theme: "Tempo de resposta", date: "Ontem, 17:05", treated: true },
  { id: "FB-901", score: 2, client: "Paulo R.", channel: "Pós-serviço", comment: "Não consegui falar com ninguém depois que deixei o veículo.", theme: "Comunicação", date: "Ontem, 14:22", treated: false },
];

function PandoraApp({ product }: { product: Product }) {
  const [activeNav, setActiveNav] = useState("Caixa de entrada");
  const [feedbacks, setFeedbacks] = useState(feedbackSeed);
  const [selectedId, setSelectedId] = useState(feedbackSeed[0].id);
  const [filter, setFilter] = useState<"todos" | "criticos" | "promotores">("todos");
  const selected = feedbacks.find((item) => item.id === selectedId) ?? feedbacks[0];
  const filtered = feedbacks.filter((item) => filter === "todos" || (filter === "criticos" ? item.score <= 6 : item.score >= 9));

  function markTreated() {
    setFeedbacks((items) => items.map((item) => item.id === selected.id ? { ...item, treated: true } : item));
  }

  return (
    <ProductShell product={product} section="Experiência do cliente" variant="pandora" nav={["Caixa de entrada", "Pesquisas", "Temas", "Ações", "Análise"]} activeNav={activeNav} onNavChange={setActiveNav} action={<button className={styles.primaryAction}><Icon name="plus" /> Nova pesquisa</button>}>
      <section className={styles.feedbackHeader}><div><span className={styles.contextLabel}>Voz do cliente</span><h1>Leia primeiro. Meça depois.</h1><p>Comentários e temas vêm antes dos gráficos.</p></div><div className={styles.feedbackFilter}><button className={filter === "todos" ? styles.feedbackFilterActive : ""} onClick={() => setFilter("todos")}>Todos</button><button className={filter === "criticos" ? styles.feedbackFilterActive : ""} onClick={() => setFilter("criticos")}>Precisam de atenção</button><button className={filter === "promotores" ? styles.feedbackFilterActive : ""} onClick={() => setFilter("promotores")}>Promotores</button></div></section>
      <section className={styles.feedbackWorkspace}>
        <aside className={styles.feedbackInbox}>
          <div className={styles.inboxTitle}><div><h2>Respostas recentes</h2><span>{filtered.length}</span></div><button><Icon name="filter" /></button></div>
          {filtered.map((feedback) => <button type="button" key={feedback.id} onClick={() => setSelectedId(feedback.id)} className={selected.id === feedback.id ? styles.feedbackSelected : ""}><ScoreBadge score={feedback.score} /><div><strong>{feedback.client}</strong><p>{feedback.comment}</p><span>{feedback.theme} · {feedback.date}</span></div>{!feedback.treated && <i />}</button>)}
        </aside>
        <article className={styles.feedbackReader}>
          <header><div><ScoreBadge score={selected.score} large /><div><strong>{selected.client}</strong><small>{selected.channel} · {selected.date}</small></div></div><button type="button"><Icon name="menu" /></button></header>
          <blockquote>“{selected.comment}”</blockquote>
          <div className={styles.feedbackClassification}><span>Tema identificado</span><strong>{selected.theme}</strong><button type="button">Alterar classificação</button></div>
          <div className={styles.feedbackResponse}><label><span>Nota interna</span><textarea placeholder="Registre o que será feito com este feedback" /></label><div><button type="button">Criar ação</button><button type="button" className={styles.drawerPrimary} onClick={markTreated}>{selected.treated ? "Tratado" : "Marcar como tratado"}</button></div></div>
        </article>
        <aside className={styles.insightRail}>
          <span className={styles.contextLabel}>Contexto</span><h2>Este tema está crescendo</h2><p>Comunicação apareceu em 8 comentários nos últimos 30 dias.</p>
          <div className={styles.themePulse}><div><span>4 semanas atrás</span><i style={{ width: "28%" }} /></div><div><span>3 semanas atrás</span><i style={{ width: "42%" }} /></div><div><span>2 semanas atrás</span><i style={{ width: "55%" }} /></div><div><span>Esta semana</span><i style={{ width: "78%" }} /></div></div>
          <button type="button">Ver todos os comentários <Icon name="arrow" /></button>
          <div className={styles.insightNote}><Icon name="spark" /><p><strong>Leitura sugerida</strong><span>Clientes valorizam o resultado, mas sentem falta de atualizações durante o processo.</span></p></div>
        </aside>
      </section>
    </ProductShell>
  );
}

function ScoreBadge({ score, large = false }: { score: number; large?: boolean }) {
  const group = score >= 9 ? "promoter" : score >= 7 ? "neutral" : "detractor";
  return <span className={`${styles.scoreBadge} ${styles[`score_${group}`]} ${large ? styles.scoreLarge : ""}`}>{score}</span>;
}

/* -------------------------------------------------------------------------- */
/* Hercules                                                                    */
/* -------------------------------------------------------------------------- */

type CheckResult = "pending" | "ok" | "fail";
type CheckItem = { id: number; title: string; instruction: string; result: CheckResult };
const checkSeed: CheckItem[] = [
  { id: 1, title: "Condição geral da área", instruction: "Verifique limpeza, organização e acesso seguro.", result: "ok" },
  { id: 2, title: "Proteções e sinalização", instruction: "Confirme placas, barreiras e dispositivos visíveis.", result: "pending" },
  { id: 3, title: "Cabos e conexões", instruction: "Procure desgaste, emendas expostas ou fixação inadequada.", result: "pending" },
  { id: 4, title: "Teste funcional", instruction: "Execute o ciclo previsto e registre qualquer desvio.", result: "pending" },
  { id: 5, title: "Evidência final", instruction: "Adicione ao menos uma foto da condição encontrada.", result: "pending" },
];

function HerculesApp({ product }: { product: Product }) {
  const [activeNav, setActiveNav] = useState("Execuções");
  const [checks, setChecks] = useState(checkSeed);
  const [selectedId, setSelectedId] = useState(2);
  const selected = checks.find((item) => item.id === selectedId) ?? checks[0];
  const completed = checks.filter((item) => item.result !== "pending").length;
  const progress = Math.round((completed / checks.length) * 100);

  function answer(result: CheckResult) {
    setChecks((items) => items.map((item) => item.id === selected.id ? { ...item, result } : item));
    const currentIndex = checks.findIndex((item) => item.id === selected.id);
    const next = checks[currentIndex + 1];
    if (next) setSelectedId(next.id);
  }

  return (
    <ProductShell product={product} section="Inspeções" variant="hercules" nav={["Execuções", "Programação", "Modelos", "Não conformidades", "Histórico"]} activeNav={activeNav} onNavChange={setActiveNav} action={<button className={styles.primaryAction}><Icon name="plus" /> Nova inspeção</button>}>
      <section className={styles.inspectionHeader}>
        <div><span className={styles.contextLabel}>Inspeção em andamento</span><h1>Empilhadeira 07 · Pré-uso</h1><p>Pátio Norte · Responsável: Geovane</p></div>
        <div className={styles.progressRing} style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}><span><strong>{progress}%</strong><small>{completed} de {checks.length}</small></span></div>
      </section>
      <section className={styles.inspectionWorkspace}>
        <aside className={styles.checkSteps}>
          <h2>Etapas da inspeção</h2>
          <div>{checks.map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`${selected.id === item.id ? styles.checkStepActive : ""} ${styles[`check_${item.result}`]}`}><span>{item.result === "ok" ? <Icon name="check" /> : item.result === "fail" ? <Icon name="warning" /> : item.id}</span><div><strong>{item.title}</strong><small>{item.result === "ok" ? "Conforme" : item.result === "fail" ? "Não conforme" : "Pendente"}</small></div></button>)}</div>
          <button className={styles.pauseInspection}>Salvar e continuar depois</button>
        </aside>
        <article className={styles.checkFocus}>
          <div className={styles.checkCounter}>Item {selected.id} de {checks.length}</div><h2>{selected.title}</h2><p>{selected.instruction}</p>
          <div className={styles.evidenceDrop}><Icon name="plus" /><strong>Adicionar evidência</strong><span>Foto ou observação deste item</span></div>
          <label className={styles.inspectionNote}><span>Observação</span><textarea placeholder="Descreva somente quando necessário" /></label>
          <div className={styles.checkDecision}><button type="button" className={styles.failButton} onClick={() => answer("fail")}><Icon name="warning" /><span><strong>Não conforme</strong><small>Abrir desvio</small></span></button><button type="button" className={styles.okButton} onClick={() => answer("ok")}><Icon name="check" /><span><strong>Conforme</strong><small>Ir para o próximo</small></span></button></div>
        </article>
        <aside className={styles.inspectionContext}>
          <span className={styles.contextLabel}>Contexto do ativo</span><div className={styles.assetVisual}><span>07</span><Icon name="clipboard" /></div><dl><div><dt>Última inspeção</dt><dd>Ontem, 06:12</dd></div><div><dt>Último desvio</dt><dd>Pneu dianteiro · encerrado</dd></div><div><dt>Área</dt><dd>Pátio Norte</dd></div></dl><button type="button">Ver histórico do ativo <Icon name="arrow" /></button>
        </aside>
      </section>
    </ProductShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

function SimpleModal({ title, description, action, onClose, onConfirm }: { title: string; description: string; action: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <section className={styles.simpleModal} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.modalClose} type="button" onClick={onClose}><Icon name="close" /></button><span className={styles.contextLabel}>Cadastro rápido</span><h2>{title}</h2><p>{description}</p>
        <label><span>Nome ou identificação</span><input autoFocus placeholder="Digite para começar" /></label><label><span>Observação inicial</span><textarea placeholder="Opcional" /></label>
        <div><button type="button" onClick={onClose}>Cancelar</button><button type="button" className={styles.drawerPrimary} onClick={onConfirm}>{action}</button></div>
      </section>
    </div>
  );
}

function ProductGlyph({ slug }: { slug: string }) {
  const icon: IconName = slug === "atlas" ? "car" : slug === "artemis" ? "table" : slug === "ares" ? "document" : slug === "poseidon" ? "people" : slug === "pandora" ? "comment" : "clipboard";
  return <Icon name={icon} />;
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    back: <><path d="m15 18-6-6 6-6"/><path d="M9 12h10"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    car: <><path d="m5 17 1-5 2-4h8l2 4 1 5"/><path d="M3 17h18v3h-2M5 20H3v-3M7 17h.01M17 17h.01M7 12h10"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    comment: <><path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1-5a8 8 0 1 1 17-5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
    document: <><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    filter: <path d="M4 5h16l-6 7v5l-4 2v-7z"/>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    kitchen: <><path d="M4 3v8M7 3v8M4 7h3M5.5 11v10M14 3v18M14 3c4 2 4 7 0 9"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2-7 6-7s6 3 6 7M16 4c3 0 4 2 4 4s-1 4-4 4M17 14c3 1 4 3 4 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4zM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/></>,
    table: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 4v16M16 4v16M3 10h18"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></>,
    warning: <><path d="M12 3 2.5 20h19z"/><path d="M12 9v4M12 17h.01"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
