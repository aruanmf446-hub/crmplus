"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import styles from "./PhaseThreeWorkspace.module.css";

type IconName =
  | "activity"
  | "arrow"
  | "back"
  | "calendar"
  | "car"
  | "check"
  | "chevron"
  | "clipboard"
  | "clock"
  | "close"
  | "document"
  | "download"
  | "filter"
  | "history"
  | "home"
  | "inbox"
  | "kitchen"
  | "menu"
  | "message"
  | "people"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "table"
  | "tag"
  | "user"
  | "warning";

type NavItem = { label: string; icon: IconName };

type ShellProps = {
  product: Product;
  nav: NavItem[];
  active: string;
  onChange: (label: string) => void;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PhaseThreeWorkspace({ product }: { product: Product }) {
  if (product.slug === "atlas") return <AtlasApp product={product} />;
  if (product.slug === "artemis") return <ArtemisApp product={product} />;
  if (product.slug === "ares") return <AresApp product={product} />;
  if (product.slug === "poseidon") return <PoseidonApp product={product} />;
  if (product.slug === "pandora") return <PandoraApp product={product} />;
  if (product.slug === "hercules") return <HerculesApp product={product} />;
  return null;
}

function SaaSShell({ product, nav, active, onChange, title, subtitle, action, children }: ShellProps) {
  const [open, setOpen] = useState(false);
  const shellStyle = { "--accent": product.color, "--accent-soft": product.colorSoft } as CSSProperties;

  return (
    <div className={styles.appShell} style={shellStyle}>
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.brandBlock}>
          <div className={styles.productLogo}><ProductGlyph slug={product.slug} /></div>
          <div><strong>{product.shortName}</strong><span>{product.category}</span></div>
          <button type="button" className={styles.closeMenu} onClick={() => setOpen(false)} aria-label="Fechar menu"><Icon name="close" /></button>
        </div>
        <nav className={styles.sideNav} aria-label={`Navegação do ${product.shortName}`}>
          {nav.map((item) => (
            <button key={item.label} type="button" className={active === item.label ? styles.navActive : ""} onClick={() => { onChange(item.label); setOpen(false); }}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button type="button"><Icon name="settings" /><span>Configurações</span></button>
          <Link href="/"><Icon name="back" /><span>Todos os sistemas</span></Link>
          <div className={styles.userMini}><span>AM</span><div><strong>Alisson Mafra</strong><small>Administrador</small></div></div>
        </div>
      </aside>

      {open && <button className={styles.scrim} type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" />}

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuButton} onClick={() => setOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
          <div className={styles.titleBlock}><span>{product.shortName} / {active}</span><h1>{title}</h1><p>{subtitle}</p></div>
          <div className={styles.topActions}>
            <button type="button" className={styles.searchButton}><Icon name="search" /><span>Buscar</span><kbd>⌘ K</kbd></button>
            {action}
          </div>
        </header>
        <main className={styles.content}>{children}</main>
        <div className={styles.localNotice}>Ambiente de demonstração · dados mantidos somente neste navegador</div>
      </div>
    </div>
  );
}

/* --------------------------------- ATLAS --------------------------------- */

type WorkOrder = {
  id: string;
  vehicle: string;
  plate: string;
  client: string;
  status: "Avaliação" | "Aguardando aprovação" | "Em serviço" | "Pronto";
  issue: string;
  technician: string;
  updated: string;
  estimate: string;
  priority?: boolean;
};

const atlasOrders: WorkOrder[] = [
  { id: "OS-1052", vehicle: "Volkswagen Nivus", plate: "SFK2C10", client: "Renato Lima", status: "Avaliação", issue: "Luz da injeção acesa", technician: "Sem técnico", updated: "há 28 min", estimate: "Aguardando diagnóstico" },
  { id: "OS-1051", vehicle: "Volkswagen Saveiro", plate: "TCJ9I23", client: "Barros & Braga", status: "Aguardando aprovação", issue: "Ruído e desalinhamento traseiro", technician: "Marcos", updated: "há 2 h", estimate: "R$ 3.420,00", priority: true },
  { id: "OS-1048", vehicle: "Fiat Strada", plate: "RQX7B44", client: "Construtora Norte", status: "Em serviço", issue: "Falha intermitente na partida", technician: "Carlos", updated: "há 12 min", estimate: "R$ 980,00" },
  { id: "OS-1050", vehicle: "Volkswagen T-Cross", plate: "QVA4E19", client: "Fernanda Souza", status: "Em serviço", issue: "Revisão preventiva de 60 mil km", technician: "Paulo", updated: "há 45 min", estimate: "R$ 1.260,00" },
  { id: "OS-1046", vehicle: "Hyundai HB20", plate: "QDL8F20", client: "Marina Costa", status: "Pronto", issue: "Troca de correia e tensionador", technician: "Paulo", updated: "14:20", estimate: "R$ 1.840,00" },
];

function AtlasApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Ordens de serviço");
  const [orders, setOrders] = useState(atlasOrders);
  const [selectedId, setSelectedId] = useState(atlasOrders[1].id);
  const [query, setQuery] = useState("");
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return orders;
    return orders.filter((order) => `${order.id} ${order.vehicle} ${order.plate} ${order.client}`.toLowerCase().includes(value));
  }, [orders, query]);

  const nav: NavItem[] = [
    { label: "Ordens de serviço", icon: "clipboard" },
    { label: "Agenda", icon: "calendar" },
    { label: "Clientes", icon: "people" },
    { label: "Veículos", icon: "car" },
  ];

  function advance() {
    const flow: WorkOrder["status"][] = ["Avaliação", "Aguardando aprovação", "Em serviço", "Pronto"];
    const next = flow[Math.min(flow.indexOf(selected.status) + 1, flow.length - 1)];
    setOrders((items) => items.map((item) => item.id === selected.id ? { ...item, status: next, updated: "agora" } : item));
  }

  return (
    <SaaSShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Uma oficina organizada por registros, decisões e próximas ações." action={<button className={styles.primaryButton}><Icon name="plus" /> Nova OS</button>}>
      {active === "Ordens de serviço" && (
        <div className={styles.masterDetail}>
          <section className={styles.listPane}>
            <div className={styles.listToolbar}>
              <label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Placa, cliente, veículo ou OS" /></label>
              <button type="button" className={styles.iconButton} aria-label="Filtrar"><Icon name="filter" /></button>
            </div>
            <div className={styles.segmented}><button className={styles.segmentActive}>Em andamento <span>{orders.filter((item) => item.status !== "Pronto").length}</span></button><button>Prontas <span>{orders.filter((item) => item.status === "Pronto").length}</span></button></div>
            <div className={styles.recordList}>
              {filtered.map((order) => (
                <button key={order.id} type="button" className={`${styles.recordRow} ${selectedId === order.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(order.id)}>
                  <div className={styles.recordAvatar}><Icon name="car" /></div>
                  <div className={styles.recordMain}><div><strong>{order.vehicle}</strong><span>{order.plate}</span></div><p>{order.client} · {order.issue}</p></div>
                  <div className={styles.recordMeta}><StatusPill status={order.status} /><small>{order.updated}</small></div>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.detailPane}>
            <div className={styles.detailHeader}>
              <div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.vehicle}</h2><p>{selected.plate} · {selected.client}</p></div>
              <div className={styles.headerButtons}><button type="button" className={styles.secondaryButton}><Icon name="message" /> WhatsApp</button><button type="button" className={styles.primaryButton} onClick={advance}>Avançar etapa</button></div>
            </div>
            <div className={styles.detailTabs}><button className={styles.tabActive}>Resumo</button><button>Diagnóstico</button><button>Serviços e peças</button><button>Fotos</button><button>Histórico</button></div>
            <div className={styles.detailBody}>
              <div className={styles.summaryGrid}>
                <div><span>Situação atual</span><StatusPill status={selected.status} /></div>
                <div><span>Responsável</span><strong>{selected.technician}</strong></div>
                <div><span>Valor estimado</span><strong>{selected.estimate}</strong></div>
                <div><span>Última atualização</span><strong>{selected.updated}</strong></div>
              </div>
              <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Defeito informado</h3><p>Relato registrado na abertura da ordem de serviço.</p></div><button type="button">Editar</button></div><div className={styles.noteBox}>{selected.issue}</div></section>
              <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Próxima ação</h3><p>O sistema destaca somente o que precisa acontecer agora.</p></div></div><div className={styles.nextAction}><Icon name={selected.priority ? "warning" : "arrow"} /><div><strong>{selected.status === "Aguardando aprovação" ? "Confirmar decisão do cliente" : selected.status === "Avaliação" ? "Registrar diagnóstico da oficina" : selected.status === "Em serviço" ? "Atualizar execução dos serviços" : "Agendar retirada do veículo"}</strong><span>{selected.priority ? "Atendimento prioritário" : "Sem pendências adicionais"}</span></div><button type="button">Abrir ação</button></div></section>
              <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Linha do tempo</h3><p>Histórico objetivo do atendimento.</p></div></div><Timeline items={["Veículo recebido e quilometragem registrada", "Fotos de entrada adicionadas", selected.status === "Aguardando aprovação" ? "Orçamento enviado ao cliente" : "Atendimento atualizado"]} /></section>
            </div>
          </section>
        </div>
      )}
      {active === "Agenda" && <AtlasAgenda />}
      {active === "Clientes" && <Directory title="Clientes da oficina" rows={["Barros & Braga Veículos", "Renato Lima", "Construtora Norte", "Fernanda Souza", "Marina Costa"]} meta="Último atendimento" />}
      {active === "Veículos" && <Directory title="Veículos cadastrados" rows={["VW Saveiro · TCJ9I23", "VW Nivus · SFK2C10", "Fiat Strada · RQX7B44", "VW T-Cross · QVA4E19", "Hyundai HB20 · QDL8F20"]} meta="Histórico disponível" />}
    </SaaSShell>
  );
}

function AtlasAgenda() {
  const appointments = [
    ["08:00", "Renato Lima", "Volkswagen Nivus", "Diagnóstico"],
    ["09:30", "Construtora Norte", "Fiat Strada", "Retorno"],
    ["11:00", "Marina Costa", "Hyundai HB20", "Entrega"],
    ["14:00", "Fernanda Souza", "Volkswagen T-Cross", "Revisão"],
  ];
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Hoje · quarta-feira</span><h2>Agenda da oficina</h2><p>Horários, retornos e entregas confirmadas.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Agendar</button></div><div className={styles.scheduleList}>{appointments.map(([time, client, vehicle, type]) => <div key={time} className={styles.scheduleRow}><strong>{time}</strong><div><span>{type}</span><h3>{client}</h3><p>{vehicle}</p></div><button type="button">Abrir cadastro <Icon name="chevron" /></button></div>)}</div></section>;
}

/* -------------------------------- ARTEMIS -------------------------------- */

type DiningTable = { id: number; seats: number; status: "Livre" | "Em atendimento" | "Na cozinha" | "Pronto"; waiter?: string; time?: number; total?: string };
const diningTables: DiningTable[] = [
  { id: 1, seats: 2, status: "Livre" }, { id: 2, seats: 4, status: "Em atendimento", waiter: "Ana", time: 5, total: "R$ 84,00" },
  { id: 3, seats: 4, status: "Na cozinha", waiter: "Ana", time: 31, total: "R$ 112,00" }, { id: 4, seats: 2, status: "Na cozinha", waiter: "Rafael", time: 9, total: "R$ 76,00" },
  { id: 5, seats: 6, status: "Pronto", waiter: "Rafael", time: 2, total: "R$ 168,00" }, { id: 6, seats: 4, status: "Livre" },
  { id: 7, seats: 4, status: "Na cozinha", waiter: "Ana", time: 12, total: "R$ 96,00" }, { id: 8, seats: 8, status: "Em atendimento", waiter: "João", time: 3, total: "R$ 204,00" },
];

function ArtemisApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Salão");
  const [selectedId, setSelectedId] = useState(3);
  const [tables, setTables] = useState(diningTables);
  const selected = tables.find((table) => table.id === selectedId) ?? tables[0];
  const nav: NavItem[] = [
    { label: "Salão", icon: "table" }, { label: "Cozinha", icon: "kitchen" }, { label: "Cardápio", icon: "document" }, { label: "Histórico", icon: "history" },
  ];
  function openTable(table: DiningTable) {
    if (table.status === "Livre") setTables((items) => items.map((item) => item.id === table.id ? { ...item, status: "Em atendimento", waiter: "Ana", time: 0, total: "R$ 0,00" } : item));
    setSelectedId(table.id);
  }
  return (
    <SaaSShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Cada função vê somente a tela necessária para o turno." action={<button className={styles.primaryButton}><Icon name="plus" /> Nova comanda</button>}>
      {active === "Salão" && (
        <div className={styles.restaurantLayout}>
          <section className={styles.floorSheet}>
            <div className={styles.pageHeading}><div><span className={styles.eyebrow}>Turno da noite</span><h2>Salão</h2><p>Selecione uma mesa para abrir ou continuar o atendimento.</p></div><div className={styles.serviceStatus}><i /><span>Salão aberto</span></div></div>
            <div className={styles.floorLegend}><span><i className={styles.freeDot} />Livre</span><span><i className={styles.servingDot} />Atendimento</span><span><i className={styles.kitchenDot} />Cozinha</span><span><i className={styles.readyDot} />Pronto</span></div>
            <div className={styles.floorMap}>
              {tables.map((table) => <button type="button" key={table.id} className={`${styles.floorTable} ${styles[`floor${table.status.replaceAll(" ", "")}`]} ${selectedId === table.id ? styles.floorSelected : ""}`} onClick={() => openTable(table)}><span>Mesa {String(table.id).padStart(2, "0")}</span><strong>{table.status === "Livre" ? `${table.seats} lugares` : table.status}</strong><small>{table.time !== undefined ? `${table.time} min · ${table.waiter}` : "Toque para abrir"}</small></button>)}
              <div className={styles.counterZone}><Icon name="kitchen" /><span>Balcão</span></div>
            </div>
          </section>
          <aside className={styles.orderSheet}>
            <div className={styles.orderHeader}><div><span className={styles.eyebrow}>Comanda ativa</span><h2>Mesa {String(selected.id).padStart(2, "0")}</h2><p>{selected.waiter ?? "Sem garçom"} · {selected.seats} lugares</p></div><button className={styles.iconButton}><Icon name="close" /></button></div>
            {selected.status === "Livre" ? <div className={styles.emptyState}><Icon name="table" /><h3>Mesa disponível</h3><p>Abra a mesa para iniciar uma nova comanda.</p><button className={styles.primaryButton} onClick={() => openTable(selected)}>Abrir mesa</button></div> : <><div className={styles.orderItems}><div><span>2×</span><div><strong>X-bacon</strong><small>Sem cebola</small></div><b>R$ 44,00</b></div><div><span>1×</span><div><strong>Fritas grande</strong><small>Molho da casa</small></div><b>R$ 28,00</b></div><div><span>2×</span><div><strong>Refrigerante</strong><small>Lata</small></div><b>R$ 16,00</b></div></div><button className={styles.addItemButton}><Icon name="plus" /> Adicionar item</button><div className={styles.orderTotal}><span>Total parcial</span><strong>{selected.total}</strong></div><div className={styles.orderFooter}><button className={styles.secondaryButton}>Imprimir</button><button className={styles.primaryButton}>Enviar à cozinha</button></div></>}
          </aside>
        </div>
      )}
      {active === "Cozinha" && <KitchenQueue />}
      {active === "Cardápio" && <MenuEditor />}
      {active === "Histórico" && <Directory title="Comandas encerradas" rows={["Mesa 08 · #407", "Balcão · #406", "Mesa 02 · #405", "Mesa 11 · #404"]} meta="Encerrada hoje" />}
    </SaaSShell>
  );
}

function KitchenQueue() {
  const [done, setDone] = useState<string[]>([]);
  const tickets = [
    { id: "#411", place: "Mesa 03", age: "31 min", state: "Atrasado", items: "2 X-bacon, 1 fritas grande", note: "Sem cebola em um lanche" },
    { id: "#408", place: "Mesa 07", age: "12 min", state: "Preparando", items: "1 frango grelhado, 1 salada", note: "Molho separado" },
    { id: "#412", place: "Mesa 04", age: "9 min", state: "Novo", items: "2 parmegianas", note: "Sem observações" },
    { id: "#413", place: "Mesa 10", age: "7 min", state: "Novo", items: "1 hambúrguer da casa", note: "Ponto bem passado" },
  ].filter((ticket) => !done.includes(ticket.id));
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cozinha · 19:46</span><h2>Fila de preparo</h2><p>Pedidos em ordem de prioridade, sem informações do caixa ou do salão.</p></div><div className={styles.serviceStatus}><i /><span>{tickets.length} pedidos ativos</span></div></div><div className={styles.kitchenTable}><div className={styles.tableHead}><span>Pedido</span><span>Itens</span><span>Tempo</span><span>Situação</span><span /></div>{tickets.map((ticket) => <div className={styles.kitchenRow} key={ticket.id}><div><strong>{ticket.id}</strong><span>{ticket.place}</span></div><div><strong>{ticket.items}</strong><span>{ticket.note}</span></div><b>{ticket.age}</b><StatusPill status={ticket.state} /><button type="button" className={styles.primaryButton} onClick={() => setDone((items) => [...items, ticket.id])}><Icon name="check" /> Pronto</button></div>)}</div></section>;
}

function MenuEditor() {
  const dishes = [["X-bacon", "Lanches", "R$ 22,00", "Ativo"], ["Parmegiana", "Pratos", "R$ 38,00", "Ativo"], ["Frango grelhado", "Pratos", "R$ 32,00", "Ativo"], ["Fritas grande", "Porções", "R$ 28,00", "Ativo"]];
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cardápio digital</span><h2>Itens e categorias</h2><p>Edite nomes, descrições e disponibilidade do atendimento.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Novo item</button></div><DataTable columns={["Item", "Categoria", "Preço", "Disponibilidade"]} rows={dishes} /></section>;
}

/* ---------------------------------- ARES --------------------------------- */

type Quote = { id: string; client: string; title: string; value: string; status: "Rascunho" | "Enviado" | "Visualizado" | "Aprovado"; validity: string; updated: string };
const quotes: Quote[] = [
  { id: "ORC-0248", client: "Clínica Horizonte", title: "Website institucional", value: "R$ 8.600,00", status: "Visualizado", validity: "26 jul", updated: "há 18 min" },
  { id: "ORC-0247", client: "Móveis Real", title: "Catálogo digital", value: "R$ 4.250,00", status: "Enviado", validity: "25 jul", updated: "ontem" },
  { id: "ORC-0246", client: "Paulo Mendes", title: "Reforma comercial", value: "R$ 18.900,00", status: "Rascunho", validity: "30 jul", updated: "ontem" },
  { id: "ORC-0245", client: "Grupo Norte", title: "Sistema interno", value: "R$ 12.400,00", status: "Aprovado", validity: "22 jul", updated: "21 jul" },
];

function AresApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Orçamentos");
  const [selectedId, setSelectedId] = useState(quotes[0].id);
  const selected = quotes.find((quote) => quote.id === selectedId) ?? quotes[0];
  const nav: NavItem[] = [{ label: "Orçamentos", icon: "document" }, { label: "Criar orçamento", icon: "plus" }, { label: "Clientes", icon: "people" }, { label: "Modelos", icon: "clipboard" }];
  return <SaaSShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Propostas claras, editáveis e prontas para decisão." action={<button className={styles.primaryButton} onClick={() => setActive("Criar orçamento")}><Icon name="plus" /> Novo orçamento</button>}>
    {active === "Orçamentos" && <div className={styles.masterDetail}><section className={styles.listPane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input placeholder="Buscar orçamento ou cliente" /></label><button className={styles.iconButton}><Icon name="filter" /></button></div><div className={styles.recordList}>{quotes.map((quote) => <button key={quote.id} className={`${styles.recordRow} ${selectedId === quote.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(quote.id)}><div className={styles.recordAvatar}><Icon name="document" /></div><div className={styles.recordMain}><div><strong>{quote.client}</strong><span>{quote.id}</span></div><p>{quote.title} · {quote.value}</p></div><div className={styles.recordMeta}><StatusPill status={quote.status} /><small>{quote.updated}</small></div></button>)}</div></section><QuotePreview quote={selected} /></div>}
    {active === "Criar orçamento" && <QuoteBuilder />}
    {active === "Clientes" && <Directory title="Clientes" rows={["Clínica Horizonte", "Móveis Real", "Paulo Mendes", "Grupo Norte"]} meta="Orçamentos vinculados" />}
    {active === "Modelos" && <Directory title="Modelos de orçamento" rows={["Serviço profissional", "Projeto fechado", "Manutenção recorrente", "Móveis planejados"]} meta="Modelo reutilizável" />}
  </SaaSShell>;
}

function QuotePreview({ quote }: { quote: Quote }) {
  return <section className={styles.documentPane}><div className={styles.documentToolbar}><div><StatusPill status={quote.status} /><span>Validade: {quote.validity}</span></div><div><button className={styles.iconButton}><Icon name="download" /></button><button className={styles.primaryButton}>Compartilhar</button></div></div><article className={styles.paper}><header><div className={styles.paperBrand}>A</div><div><strong>ARES PROPOSTAS</strong><span>{quote.id}</span></div></header><div className={styles.paperIntro}><span>PROPOSTA PARA</span><h2>{quote.client}</h2><p>{quote.title}</p></div><div className={styles.paperLines}><div><span>Planejamento e definição do escopo</span><b>R$ 1.600,00</b></div><div><span>Execução dos serviços contratados</span><b>R$ 5.800,00</b></div><div><span>Revisão e entrega final</span><b>R$ 1.200,00</b></div></div><div className={styles.paperTotal}><span>Investimento total</span><strong>{quote.value}</strong></div><div className={styles.paperTerms}><h3>Condições</h3><p>Prazo estimado de 30 dias após aprovação. Proposta válida até {quote.validity}.</p></div></article></section>;
}

function QuoteBuilder() {
  const [items, setItems] = useState(["Planejamento do projeto", "Execução dos serviços"]);
  return <div className={styles.builderLayout}><section className={styles.builderForm}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Novo orçamento</span><h2>Monte a proposta</h2><p>Preencha o essencial e acompanhe a prévia ao lado.</p></div></div><label className={styles.fieldLabel}>Cliente<input defaultValue="Clínica Horizonte" /></label><label className={styles.fieldLabel}>Título da proposta<input defaultValue="Website institucional" /></label><div className={styles.builderItems}><div className={styles.sectionHeading}><div><h3>Itens</h3><p>Serviços e descrições incluídos na proposta.</p></div><button onClick={() => setItems((list) => [...list, "Novo item"])}><Icon name="plus" /> Adicionar</button></div>{items.map((item, index) => <div className={styles.builderLine} key={`${item}-${index}`}><span>{index + 1}</span><input defaultValue={item} /><input defaultValue={index === 0 ? "1.600,00" : "5.800,00"} /></div>)}</div><div className={styles.builderFooter}><button className={styles.secondaryButton}>Salvar rascunho</button><button className={styles.primaryButton}>Gerar proposta</button></div></section><section className={styles.livePreview}><span>Prévia do cliente</span><div className={styles.miniPaper}><strong>Proposta comercial</strong><h3>Clínica Horizonte</h3><p>Website institucional</p>{items.map((item) => <div key={item}><span>{item}</span><b>—</b></div>)}</div></section></div>;
}

/* ------------------------------- POSEIDON -------------------------------- */

type Opportunity = { company: string; contact: string; value: string; stage: "Novo contato" | "Qualificado" | "Proposta enviada" | "Negociação"; owner: string; next: string; heat: "Alta" | "Média" | "Baixa" };
const opportunities: Opportunity[] = [
  { company: "Solar Norte", contact: "Camila Rocha", value: "R$ 18.000", stage: "Negociação", owner: "Alisson", next: "Ligar hoje, 15:00", heat: "Alta" },
  { company: "Academia Elite", contact: "Bruno Alves", value: "R$ 7.500", stage: "Proposta enviada", owner: "Alisson", next: "Retorno amanhã", heat: "Média" },
  { company: "Clínica Mais", contact: "Sara Lima", value: "R$ 12.800", stage: "Qualificado", owner: "Marina", next: "Reunião quinta", heat: "Alta" },
  { company: "Auto Peças Pará", contact: "Rafael Melo", value: "R$ 4.900", stage: "Novo contato", owner: "Marina", next: "Enviar apresentação", heat: "Baixa" },
];

function PoseidonApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Oportunidades");
  const [selected, setSelected] = useState(opportunities[0]);
  const nav: NavItem[] = [{ label: "Oportunidades", icon: "spark" }, { label: "Atividades", icon: "activity" }, { label: "Contatos", icon: "people" }, { label: "Histórico", icon: "history" }];
  return <SaaSShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Uma carteira comercial baseada em contexto e próxima ação." action={<button className={styles.primaryButton}><Icon name="plus" /> Nova oportunidade</button>}>
    {active === "Oportunidades" && <div className={styles.salesLayout}><section className={styles.salesTablePane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input placeholder="Empresa, contato ou responsável" /></label><button className={styles.iconButton}><Icon name="filter" /></button></div><div className={styles.salesHeader}><span>Empresa</span><span>Etapa</span><span>Valor</span><span>Próxima ação</span><span>Responsável</span></div>{opportunities.map((item) => <button key={item.company} className={`${styles.salesRow} ${selected.company === item.company ? styles.salesSelected : ""}`} onClick={() => setSelected(item)}><div><span className={styles.companyAvatar}>{item.company.slice(0, 2).toUpperCase()}</span><div><strong>{item.company}</strong><small>{item.contact}</small></div></div><StatusPill status={item.stage} /><b>{item.value}</b><span>{item.next}</span><span>{item.owner}</span></button>)}</section><OpportunityDetail opportunity={selected} /></div>}
    {active === "Atividades" && <ActivityAgenda />}
    {active === "Contatos" && <Directory title="Contatos comerciais" rows={["Camila Rocha · Solar Norte", "Bruno Alves · Academia Elite", "Sara Lima · Clínica Mais", "Rafael Melo · Auto Peças Pará"]} meta="Último contato" />}
    {active === "Histórico" && <Directory title="Negociações encerradas" rows={["Condomínio Jardim · Ganha", "Mecânica São João · Perdida", "Escola Prisma · Ganha"]} meta="Decisão registrada" />}
  </SaaSShell>;
}

function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  return <aside className={styles.salesDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>Oportunidade</span><h2>{opportunity.company}</h2><p>{opportunity.contact}</p></div><button className={styles.iconButton}><Icon name="chevron" /></button></div><div className={styles.opportunityValue}><span>Valor estimado</span><strong>{opportunity.value}</strong><StatusPill status={opportunity.heat} /></div><div className={styles.detailTabs}><button className={styles.tabActive}>Atividade</button><button>Dados</button><button>Arquivos</button></div><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Próxima ação</h3><p>Oportunidades sem ação não aparecem como saudáveis.</p></div></div><div className={styles.nextAction}><Icon name="calendar" /><div><strong>{opportunity.next}</strong><span>Responsável: {opportunity.owner}</span></div><button>Concluir</button></div></section><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Histórico</h3><p>Contatos e decisões em ordem cronológica.</p></div></div><Timeline items={["Proposta comercial visualizada", "Mensagem enviada pelo WhatsApp", "Contato qualificado pela equipe"]} /></section><div className={styles.quickComposer}><textarea placeholder="Registrar nota ou resultado do contato" /><button className={styles.primaryButton}>Adicionar registro</button></div></aside>;
}

function ActivityAgenda() {
  const activities = [["09:00", "Retorno", "Academia Elite", "Bruno Alves"], ["11:30", "Reunião", "Clínica Mais", "Sara Lima"], ["15:00", "Ligação", "Solar Norte", "Camila Rocha"], ["16:40", "Enviar apresentação", "Auto Peças Pará", "Rafael Melo"]];
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Hoje</span><h2>Agenda comercial</h2><p>Ações organizadas por horário e prioridade.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Nova atividade</button></div><div className={styles.scheduleList}>{activities.map(([time, type, company, person]) => <div className={styles.scheduleRow} key={`${time}-${company}`}><strong>{time}</strong><div><span>{type}</span><h3>{company}</h3><p>{person}</p></div><button>Registrar resultado <Icon name="chevron" /></button></div>)}</div></section>;
}

/* -------------------------------- PANDORA -------------------------------- */

type Feedback = { id: string; customer: string; score: number; channel: string; date: string; comment: string; theme: string; status: "Novo" | "Em análise" | "Tratado" };
const feedbacks: Feedback[] = [
  { id: "R-884", customer: "Marina Costa", score: 3, channel: "Pós-atendimento", date: "Hoje, 08:42", comment: "O atendimento foi bom, mas esperei muito para receber uma atualização.", theme: "Tempo de resposta", status: "Novo" },
  { id: "R-883", customer: "Ricardo Souza", score: 10, channel: "Entrega", date: "Ontem, 17:10", comment: "Equipe muito atenciosa e serviço concluído antes do prazo.", theme: "Atendimento", status: "Novo" },
  { id: "R-882", customer: "Ana Paula", score: 6, channel: "Pós-venda", date: "Ontem, 14:22", comment: "Faltou explicar melhor o que estava incluído no serviço.", theme: "Comunicação", status: "Em análise" },
  { id: "R-881", customer: "Carlos Mendes", score: 9, channel: "Entrega", date: "21 jul, 11:05", comment: "Gostei da facilidade e da rapidez para resolver tudo.", theme: "Agilidade", status: "Tratado" },
];

function PandoraApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Respostas");
  const [selectedId, setSelectedId] = useState(feedbacks[0].id);
  const selected = feedbacks.find((item) => item.id === selectedId) ?? feedbacks[0];
  const nav: NavItem[] = [{ label: "Respostas", icon: "inbox" }, { label: "Pesquisas", icon: "clipboard" }, { label: "Distribuição", icon: "arrow" }, { label: "Temas", icon: "tag" }];
  return <SaaSShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Feedback tratado como conversa, não como um painel de gráficos." action={<button className={styles.primaryButton}><Icon name="plus" /> Nova pesquisa</button>}>
    {active === "Respostas" && <div className={styles.feedbackLayout}><section className={styles.feedbackInbox}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input placeholder="Buscar resposta ou cliente" /></label><button className={styles.iconButton}><Icon name="filter" /></button></div><div className={styles.feedbackFilter}><button className={styles.segmentActive}>Todas</button><button>Detratores</button><button>Neutros</button><button>Promotores</button></div>{feedbacks.map((feedback) => <button key={feedback.id} className={`${styles.feedbackRow} ${selectedId === feedback.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(feedback.id)}><ScoreBadge score={feedback.score} /><div><div><strong>{feedback.customer}</strong><span>{feedback.date}</span></div><p>{feedback.comment}</p><small>{feedback.channel} · {feedback.theme}</small></div><StatusPill status={feedback.status} /></button>)}</section><FeedbackDetail feedback={selected} /></div>}
    {active === "Pesquisas" && <SurveyList />}
    {active === "Distribuição" && <DistributionPage />}
    {active === "Temas" && <ThemeList />}
  </SaaSShell>;
}

function FeedbackDetail({ feedback }: { feedback: Feedback }) {
  return <section className={styles.feedbackDetail}><div className={styles.detailHeader}><div><span className={styles.eyebrow}>{feedback.id} · {feedback.channel}</span><h2>{feedback.customer}</h2><p>{feedback.date}</p></div><ScoreBadge score={feedback.score} large /></div><blockquote>“{feedback.comment}”</blockquote><div className={styles.feedbackMeta}><div><span>Tema identificado</span><strong>{feedback.theme}</strong></div><div><span>Situação</span><StatusPill status={feedback.status} /></div></div><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Classificação</h3><p>Organize a resposta antes de analisar o indicador.</p></div></div><div className={styles.classification}><button className={styles.classificationActive}>{feedback.theme}</button><button>Adicionar tema</button><button>Marcar prioridade</button></div></section><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Tratamento</h3><p>Registre o que foi feito com este feedback.</p></div></div><textarea className={styles.responseArea} placeholder="Descreva a ação tomada ou encaminhamento" /><div className={styles.alignRight}><button className={styles.primaryButton}>Concluir tratamento</button></div></section></section>;
}

function SurveyList() {
  const rows = [["Pós-atendimento", "Ativa", "124 respostas", "NPS 67"], ["Entrega de serviço", "Ativa", "86 respostas", "NPS 72"], ["Pesquisa trimestral", "Encerrada", "342 respostas", "NPS 61"]];
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Pesquisas</span><h2>Coletas ativas</h2><p>Links, período e volume de respostas.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Criar pesquisa</button></div><DataTable columns={["Pesquisa", "Situação", "Respostas", "Resultado"]} rows={rows} /></section>;
}
function DistributionPage() { return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Compartilhamento</span><h2>Links e canais</h2><p>Distribua a pesquisa pelos canais usados pela empresa.</p></div></div><div className={styles.linkRows}><div><Icon name="message" /><div><strong>WhatsApp</strong><span>Link curto pronto para envio</span></div><button>Copiar link</button></div><div><Icon name="mail" /><div><strong>E-mail</strong><span>Convite com texto personalizado</span></div><button>Preparar envio</button></div><div><Icon name="document" /><div><strong>QR Code</strong><span>Material para impressão no atendimento</span></div><button>Baixar</button></div></div></section>; }
function ThemeList() { return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Temas</span><h2>Assuntos mais citados</h2><p>Classificação das respostas para orientar melhorias.</p></div></div><div className={styles.themeRows}>{[["Tempo de resposta", 38, "Atenção"], ["Atendimento", 31, "Positivo"], ["Comunicação", 24, "Atenção"], ["Agilidade", 19, "Positivo"]].map(([name, count, tone]) => <div key={String(name)}><div><strong>{name}</strong><span>{count} respostas</span></div><StatusPill status={String(tone)} /><button>Abrir respostas <Icon name="chevron" /></button></div>)}</div></section>; }

/* ------------------------------- HERCULES -------------------------------- */

type CheckItem = { id: number; label: string; helper: string; result?: "Conforme" | "Não conforme" | "Não se aplica" };
const inspectionSeed: CheckItem[] = [
  { id: 1, label: "Condição geral da área", helper: "Verifique limpeza, organização e acesso.", result: "Conforme" },
  { id: 2, label: "Proteções e dispositivos de segurança", helper: "Confirme presença, fixação e funcionamento." },
  { id: 3, label: "Cabos, conexões e alimentação", helper: "Procure desgaste, exposição ou aquecimento." },
  { id: 4, label: "Sinalização e identificação", helper: "Confira placas, etiquetas e legibilidade." },
  { id: 5, label: "Teste operacional", helper: "Realize o teste conforme o procedimento local." },
];

function HerculesApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Executar inspeção");
  const nav: NavItem[] = [{ label: "Executar inspeção", icon: "check" }, { label: "Programadas", icon: "calendar" }, { label: "Desvios", icon: "warning" }, { label: "Modelos", icon: "clipboard" }];
  return <SaaSShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Execução guiada, evidência e correção no mesmo registro." action={<button className={styles.secondaryButton}><Icon name="close" /> Sair da execução</button>}>
    {active === "Executar inspeção" && <InspectionRunner />}
    {active === "Programadas" && <ScheduledInspections />}
    {active === "Desvios" && <DeviationList />}
    {active === "Modelos" && <Directory title="Modelos de checklist" rows={["Inspeção de veículo", "Abertura de loja", "Segurança da oficina", "Conferência de entrega"]} meta="Itens configuráveis" />}
  </SaaSShell>;
}

function InspectionRunner() {
  const [items, setItems] = useState(inspectionSeed);
  const [current, setCurrent] = useState(1);
  const item = items.find((entry) => entry.id === current) ?? items[0];
  const completed = items.filter((entry) => entry.result).length;
  function answer(result: CheckItem["result"]) { setItems((list) => list.map((entry) => entry.id === current ? { ...entry, result } : entry)); if (current < items.length) setCurrent(current + 1); }
  return <div className={styles.inspectionLayout}><aside className={styles.inspectionIndex}><div><span className={styles.eyebrow}>INS-2048</span><h2>Inspeção de segurança</h2><p>Oficina principal · Área de serviço</p></div><div className={styles.progressBlock}><div><span>Progresso</span><strong>{completed}/{items.length}</strong></div><i><b style={{ width: `${(completed / items.length) * 100}%` }} /></i></div><div className={styles.checkIndex}>{items.map((entry) => <button key={entry.id} className={current === entry.id ? styles.checkCurrent : ""} onClick={() => setCurrent(entry.id)}><span>{entry.result ? <Icon name={entry.result === "Não conforme" ? "warning" : "check"} /> : entry.id}</span><div><strong>{entry.label}</strong><small>{entry.result ?? "Pendente"}</small></div></button>)}</div></aside><section className={styles.inspectionStage}><div className={styles.stageHeader}><span>Item {item.id} de {items.length}</span><button><Icon name="history" /> Ver instrução</button></div><div className={styles.questionBlock}><span className={styles.eyebrow}>VERIFICAÇÃO</span><h1>{item.label}</h1><p>{item.helper}</p></div><div className={styles.answerGrid}><button className={item.result === "Conforme" ? styles.answerSelected : ""} onClick={() => answer("Conforme")}><Icon name="check" /><strong>Conforme</strong><span>O item atende ao requisito.</span></button><button className={item.result === "Não conforme" ? styles.answerDanger : ""} onClick={() => answer("Não conforme")}><Icon name="warning" /><strong>Não conforme</strong><span>Abra um desvio e registre evidência.</span></button><button className={item.result === "Não se aplica" ? styles.answerSelected : ""} onClick={() => answer("Não se aplica")}><Icon name="close" /><strong>Não se aplica</strong><span>Este requisito não pertence ao local.</span></button></div><div className={styles.evidenceBox}><div><Icon name="plus" /><div><strong>Adicionar evidência</strong><span>Foto ou observação do item verificado.</span></div></div><button>Selecionar arquivo</button></div><div className={styles.stageFooter}><button className={styles.secondaryButton} disabled={current === 1} onClick={() => setCurrent(Math.max(1, current - 1))}>Anterior</button><button className={styles.primaryButton} onClick={() => setCurrent(Math.min(items.length, current + 1))}>Próximo item <Icon name="arrow" /></button></div></section></div>;
}

function ScheduledInspections() { const rows = [["INS-2050", "Veículo TCJ9I23", "Hoje, 14:00", "Paulo"], ["INS-2051", "Área de lavagem", "Amanhã, 08:00", "Marcos"], ["INS-2052", "Ferramentas elétricas", "24 jul, 10:30", "Carlos"]]; return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Programação</span><h2>Próximas inspeções</h2><p>Responsáveis e locais já definidos.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Programar</button></div><DataTable columns={["Código", "Local ou ativo", "Data", "Responsável"]} rows={rows} /></section>; }
function DeviationList() { const rows = [["NC-118", "Proteção lateral ausente", "Alta", "Aberto"], ["NC-117", "Etiqueta ilegível", "Média", "Em correção"], ["NC-114", "Cabo com desgaste", "Alta", "Validar"]]; return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Não conformidades</span><h2>Desvios em tratamento</h2><p>Cada falha mantém responsável, prazo e evidência.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Novo desvio</button></div><DataTable columns={["Código", "Descrição", "Prioridade", "Situação"]} rows={rows} /></section>; }

/* ------------------------------ SHARED UI -------------------------------- */

function Directory({ title, rows, meta }: { title: string; rows: string[]; meta: string }) {
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cadastros</span><h2>{title}</h2><p>Registros organizados, pesquisáveis e prontos para abrir.</p></div><button className={styles.primaryButton}><Icon name="plus" /> Adicionar</button></div><div className={styles.directoryToolbar}><label className={styles.inputSearch}><Icon name="search" /><input placeholder="Buscar registro" /></label><button className={styles.secondaryButton}><Icon name="filter" /> Filtrar</button></div><div className={styles.directoryRows}>{rows.map((row, index) => <button key={row}><span className={styles.companyAvatar}>{row.slice(0, 2).toUpperCase()}</span><div><strong>{row}</strong><small>{meta} · {index + 1} registro{index ? "s" : ""}</small></div><Icon name="chevron" /></button>)}</div></section>;
}

function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return <div className={styles.dataTable}><div className={styles.dataHead}>{columns.map((column) => <span key={column}>{column}</span>)}</div>{rows.map((row, index) => <button key={`${row[0]}-${index}`} className={styles.dataRow}>{row.map((cell, cellIndex) => <span key={`${cell}-${cellIndex}`}>{cellIndex === 0 ? <strong>{cell}</strong> : cell}</span>)}<Icon name="chevron" /></button>)}</div>;
}

function Timeline({ items }: { items: string[] }) {
  return <div className={styles.timeline}>{items.map((item, index) => <div key={item}><i /><div><strong>{item}</strong><span>{index === 0 ? "Hoje" : index === 1 ? "Ontem" : "20 jul"}</span></div></div>)}</div>;
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "");
  return <span className={`${styles.statusPill} ${styles[`status_${normalized}`] ?? ""}`}>{status}</span>;
}

function ScoreBadge({ score, large = false }: { score: number; large?: boolean }) {
  return <span className={`${styles.scoreBadge} ${score <= 6 ? styles.scoreBad : score <= 8 ? styles.scoreNeutral : styles.scoreGood} ${large ? styles.scoreLarge : ""}`}>{score}</span>;
}

function ProductGlyph({ slug }: { slug: string }) {
  const map: Record<string, IconName> = { atlas: "car", artemis: "kitchen", ares: "document", poseidon: "spark", pandora: "message", hercules: "check" };
  return <Icon name={map[slug] ?? "home"} />;
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    activity: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>, arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>, back: <><path d="m15 18-6-6 6-6" /></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>, car: <><path d="m5 17-1 2M19 17l1 2M3 13l2-6h14l2 6v5H3z" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></>, check: <><path d="m5 12 4 4L19 6" /></>, chevron: <><path d="m9 18 6-6-6-6" /></>, clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 10h6M9 14h6" /></>, clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>, document: <><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6" /></>, download: <><path d="M12 3v12m-5-5 5 5 5-5M5 21h14" /></>, filter: <><path d="M4 5h16M7 12h10M10 19h4" /></>, history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" /></>, home: <><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" /></>, inbox: <><path d="M4 4h16v14H4zM4 14h5l2 3h2l2-3h5" /></>, kitchen: <><path d="M7 3v7M4 3v4c0 2 6 2 6 0V3M7 10v11M17 3v18M14 3c0 5 6 5 6 0" /></>, menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>, message: <><path d="M4 4h16v13H8l-4 4z" /></>, people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 21c0-4 2-7 6-7s6 3 6 7M15 15c4 0 6 2 6 6" /></>, plus: <><path d="M12 5v14M5 12h14" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3.1h5l.4-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2.1-1.5a7 7 0 0 0 .1-1Z" /></>, spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m18 16 .7 2.3L21 19l-2.3.7L18 22l-.7-2.3L15 19l2.3-.7z" /></>, table: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M8 10v9" /></>, tag: <><path d="M3 11V4h7l11 11-7 7z" /><circle cx="7" cy="8" r="1" /></>, user: <><circle cx="12" cy="8" r="4" /><path d="M4 22c0-5 3-8 8-8s8 3 8 8" /></>, warning: <><path d="M12 3 2 21h20zM12 9v5M12 18h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
