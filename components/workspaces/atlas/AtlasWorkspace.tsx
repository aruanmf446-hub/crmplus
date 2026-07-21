"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import styles from "./atlas.module.css";

type View = "fluxo" | "agenda" | "clientes" | "servicos";
type FlowStep = "agenda" | "recepcao" | "os" | "aprovacao" | "servico" | "entrega";

type ServiceOrder = {
  id: string;
  customer: string;
  vehicle: string;
  plate: string;
  service: string;
  time: string;
  step: FlowStep;
  estimate: string;
  technician: string;
};

const flow: { id: FlowStep; label: string; short: string }[] = [
  { id: "agenda", label: "Agendado", short: "Agenda" },
  { id: "recepcao", label: "Recepção", short: "Recepção" },
  { id: "os", label: "Ordem aberta", short: "OS" },
  { id: "aprovacao", label: "Aprovação", short: "Aprovação" },
  { id: "servico", label: "Em serviço", short: "Serviço" },
  { id: "entrega", label: "Entrega", short: "Entrega" },
];

const initialOrders: ServiceOrder[] = [
  { id: "1052", customer: "Cliente Exemplo A", vehicle: "Volkswagen Nivus", plate: "DEMO 001", service: "Revisão de 30.000 km", time: "09:00", step: "recepcao", estimate: "R$ 680,00", technician: "Técnico A" },
  { id: "1051", customer: "Empresa Exemplo", vehicle: "Volkswagen Saveiro", plate: "DEMO 002", service: "Diagnóstico de suspensão", time: "08:30", step: "aprovacao", estimate: "R$ 1.480,00", technician: "Técnico B" },
  { id: "1050", customer: "Cliente Exemplo B", vehicle: "Volkswagen T-Cross", plate: "DEMO 003", service: "Troca de óleo e filtros", time: "08:00", step: "servico", estimate: "R$ 540,00", technician: "Técnico C" },
  { id: "1049", customer: "Cliente Exemplo C", vehicle: "Hyundai HB20", plate: "DEMO 004", service: "Alinhamento e balanceamento", time: "07:40", step: "entrega", estimate: "R$ 220,00", technician: "Técnico A" },
];

const agenda = [
  { time: "08:00", customer: "Cliente Exemplo B", vehicle: "T-Cross · DEMO 003", reason: "Troca de óleo e filtros", state: "Recebido" },
  { time: "09:00", customer: "Cliente Exemplo A", vehicle: "Nivus · DEMO 001", reason: "Revisão de 30.000 km", state: "Na recepção" },
  { time: "10:30", customer: "Cliente Exemplo D", vehicle: "Onix · DEMO 005", reason: "Ruído dianteiro", state: "Confirmado" },
  { time: "13:30", customer: "Cliente Exemplo E", vehicle: "Fiat Toro · DEMO 006", reason: "Diagnóstico de freios", state: "Confirmado" },
  { time: "15:00", customer: "Cliente Exemplo F", vehicle: "Honda City · DEMO 007", reason: "Alinhamento", state: "A confirmar" },
];

const clients = [
  { name: "Cliente Exemplo A", vehicle: "Volkswagen Nivus · DEMO 001", last: "Revisão em 21 jul", visits: "3 atendimentos" },
  { name: "Empresa Exemplo", vehicle: "Volkswagen Saveiro · DEMO 002", last: "Suspensão em andamento", visits: "8 atendimentos" },
  { name: "Cliente Exemplo B", vehicle: "Volkswagen T-Cross · DEMO 003", last: "Troca de óleo hoje", visits: "4 atendimentos" },
  { name: "Cliente Exemplo C", vehicle: "Hyundai HB20 · DEMO 004", last: "Pronto para entrega", visits: "2 atendimentos" },
];

const services = [
  { name: "Revisão preventiva", duration: "2h30", price: "a partir de R$ 450" },
  { name: "Alinhamento e balanceamento", duration: "1h", price: "a partir de R$ 180" },
  { name: "Diagnóstico de suspensão", duration: "1h30", price: "a partir de R$ 220" },
  { name: "Troca de óleo e filtros", duration: "1h", price: "a partir de R$ 320" },
];

function Icon({ name, size = 19 }: { name: "flow" | "calendar" | "users" | "tools" | "search" | "plus" | "arrow" | "check" | "message" | "close" | "car"; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    flow: <><path d="M5 5h4v4H5zM15 5h4v4h-4zM10 7h5M7 9v7h8M15 14h4v4h-4zM5 16h4v4H5z" /></>,
    calendar: <><path d="M5 4v3M19 4v3M4 9h16M5 6h14a1 1 0 0 1 1 1v13H4V7a1 1 0 0 1 1-1Z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.6-4 2.4-6 5.5-6s4.9 2 5.5 6M16 5.5a3 3 0 0 1 0 5.5M16 13c2.6.2 4 2.2 4.5 5" /></>,
    tools: <><path d="m14 6 4-4 4 4-4 4M17 9 8 18M7 13l4 4-5 5-4-4Z" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="m9 6 6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    message: <><path d="M4 5h16v11H8l-4 4Z" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    car: <><path d="m5 15 1.5-6h11L19 15M4 15h16v4H4zM7 19v2M17 19v2M7 12h10" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AtlasWorkspace() {
  const [view, setView] = useState<View>("fluxo");
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState("1051");
  const [messageSent, setMessageSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];
  const currentStep = flow.findIndex((item) => item.id === selected.step);
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return query ? orders.filter((order) => `${order.customer} ${order.vehicle} ${order.plate} ${order.id}`.toLocaleLowerCase("pt-BR").includes(query)) : orders;
  }, [orders, search]);

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function advanceOrder() {
    if (!selected || currentStep >= flow.length - 1) return;
    const next = flow[currentStep + 1].id;
    setOrders((items) => items.map((item) => item.id === selected.id ? { ...item, step: next } : item));
    setMessageSent(false);
    showNotice(`${selected.vehicle} avançou para ${flow[currentStep + 1].label}.`);
  }

  function sendApproval() {
    setMessageSent(true);
    showNotice("Link de aprovação simulado como enviado pelo WhatsApp.");
  }

  function approveEstimate() {
    setOrders((items) => items.map((item) => item.id === selected.id ? { ...item, step: "servico" } : item));
    setMessageSent(false);
    showNotice("Orçamento aprovado. A OS está pronta para iniciar.");
  }

  function addOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = String(1053 + orders.length);
    const newOrder: ServiceOrder = { id, customer: "Novo cliente", vehicle: "Veículo a confirmar", plate: "—", service: "Avaliação inicial", time: "16:00", step: "agenda", estimate: "A definir", technician: "A definir" };
    setOrders((items) => [...items, newOrder]);
    setSelectedId(id);
    setView("fluxo");
    setNewOrderOpen(false);
    showNotice(`Agendamento #${id} criado nesta demonstração.`);
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span><Icon name="car" size={22} /></span><div><strong>Atlas</strong><small>CRM Plus</small></div></div>
        <div className={styles.company}><small>OFICINA</small><strong>Oficina Avenida</strong><span>Operação de hoje</span></div>
        <nav className={styles.nav} aria-label="Navegação do Atlas">
          <NavButton active={view === "fluxo"} icon="flow" onClick={() => setView("fluxo")}>Fluxo da oficina</NavButton>
          <NavButton active={view === "agenda"} icon="calendar" onClick={() => setView("agenda")}>Agenda</NavButton>
          <NavButton active={view === "clientes"} icon="users" onClick={() => setView("clientes")}>Clientes e veículos</NavButton>
          <NavButton active={view === "servicos"} icon="tools" onClick={() => setView("servicos")}>Serviços</NavButton>
        </nav>
        <p className={styles.offline}>Demonstração local<br />Dados fictícios</p>
      </aside>

      <div className={styles.body}>
        <header className={styles.topbar}>
          <div className={styles.mobileBrand}><Icon name="car" /><strong>Atlas</strong></div>
          <label className={styles.search}><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, placa ou OS" aria-label="Buscar cliente, placa ou ordem de serviço" /></label>
          <span className={styles.demo}>AMBIENTE DEMONSTRATIVO</span>
          <span className={styles.avatar} aria-label="Perfil de Alisson Mafra">AM</span>
        </header>

        <main className={styles.main}>
          {view === "fluxo" && selected ? (
            <>
              <section className={styles.pageHeading}>
                <div><p>Terça-feira, 21 de julho</p><h1>Fluxo da oficina</h1><span>Acompanhe cada veículo do agendamento até a entrega.</span></div>
                <button className={styles.primary} onClick={() => setNewOrderOpen(true)}><Icon name="plus" size={17} />Nova OS</button>
              </section>

              <section className={styles.metrics} aria-label="Resumo da oficina">
                <div><strong>05</strong><span>agendados hoje</span></div>
                <div><strong>03</strong><span>em atendimento</span></div>
                <div><strong>01</strong><span>aguardando aprovação</span></div>
                <div><strong>02</strong><span>para entregar</span></div>
              </section>

              <section className={styles.flowSection}>
                <div className={styles.sectionHeading}><div><h2>Veículos em atendimento</h2><p>Selecione uma OS para acompanhar ou avançar a etapa.</p></div><span>{filteredOrders.length} veículos</span></div>
                <div className={styles.orderTabs} role="tablist" aria-label="Ordens em atendimento">
                  {filteredOrders.map((order) => (
                    <button key={order.id} role="tab" aria-selected={selected.id === order.id} className={selected.id === order.id ? styles.selectedTab : ""} onClick={() => { setSelectedId(order.id); setMessageSent(false); }}>
                      <span>{order.plate}</span><strong>{order.vehicle}</strong><small>OS #{order.id} · {flow.find((step) => step.id === order.step)?.label}</small>
                    </button>
                  ))}
                </div>

                <div className={styles.progress} aria-label={`Andamento da OS ${selected.id}`}>
                  {flow.map((step, index) => (
                    <div key={step.id} className={index < currentStep ? styles.complete : index === currentStep ? styles.current : ""}>
                      <span>{index < currentStep ? <Icon name="check" size={14} /> : index + 1}</span><small>{step.short}</small>
                    </div>
                  ))}
                </div>

                <div className={styles.detailGrid}>
                  <article className={styles.orderDetail}>
                    <div className={styles.orderTitle}><div><small>OS #{selected.id}</small><h2>{selected.vehicle}</h2><p>{selected.plate} · {selected.customer}</p></div><span>{flow[currentStep].label}</span></div>
                    <dl><div><dt>Serviço solicitado</dt><dd>{selected.service}</dd></div><div><dt>Responsável</dt><dd>{selected.technician}</dd></div><div><dt>Previsão</dt><dd>Hoje, 17:30</dd></div><div><dt>Estimativa</dt><dd>{selected.estimate}</dd></div></dl>
                    {selected.step === "aprovacao" ? (
                      <div className={styles.approvalBox}>
                        <div><Icon name="message" /><div><strong>Aprovação do cliente</strong><p>Compartilhe um link com o resumo do serviço e acompanhe a resposta.</p></div></div>
                        {!messageSent ? <button onClick={sendApproval}>Simular envio pelo WhatsApp</button> : <div className={styles.approvalActions}><span><Icon name="check" size={15} />Link enviado</span><button onClick={approveEstimate}>Simular aprovação</button></div>}
                      </div>
                    ) : (
                      <button className={styles.advance} onClick={advanceOrder} disabled={selected.step === "entrega"}>{selected.step === "entrega" ? "Veículo pronto para entregar" : `Avançar para ${flow[currentStep + 1].label}`}<Icon name="arrow" size={17} /></button>
                    )}
                  </article>

                  <aside className={styles.dayAgenda}>
                    <div className={styles.sectionHeading}><div><h2>Próximos horários</h2><p>Agenda de hoje</p></div></div>
                    {agenda.slice(1, 5).map((item) => <div className={styles.agendaMini} key={item.time}><time>{item.time}</time><div><strong>{item.customer}</strong><small>{item.vehicle}</small></div><span>{item.state}</span></div>)}
                    <button onClick={() => setView("agenda")}>Ver agenda completa <Icon name="arrow" size={15} /></button>
                  </aside>
                </div>
              </section>
            </>
          ) : null}

          {view === "agenda" ? <ListView eyebrow="Atendimento" title="Agenda de hoje" description="Horários organizados pela chegada dos veículos." action="Novo agendamento" onAction={() => setNewOrderOpen(true)}>{agenda.map((item) => <div className={styles.listRow} key={item.time}><time>{item.time}</time><div><strong>{item.customer}</strong><span>{item.vehicle}</span></div><p>{item.reason}</p><em>{item.state}</em></div>)}</ListView> : null}
          {view === "clientes" ? <ListView eyebrow="Histórico" title="Clientes e veículos" description="Dados essenciais e atendimentos anteriores em um só lugar." action="Novo cliente" onAction={() => showNotice("Cadastro de cliente aberto na demonstração.")}>{clients.map((client) => <button className={styles.listRow} key={client.name} onClick={() => showNotice(`Histórico de ${client.name} selecionado.`)}><span className={styles.initials}>{client.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{client.name}</strong><span>{client.vehicle}</span></div><p>{client.last}</p><em>{client.visits}</em></button>)}</ListView> : null}
          {view === "servicos" ? <ListView eyebrow="Catálogo" title="Serviços da oficina" description="Valores de referência e tempo estimado para agilizar a OS." action="Novo serviço" onAction={() => showNotice("Cadastro de serviço aberto na demonstração.")}>{services.map((service) => <div className={styles.listRow} key={service.name}><span className={styles.serviceIcon}><Icon name="tools" size={17} /></span><div><strong>{service.name}</strong><span>Tempo estimado: {service.duration}</span></div><p>{service.price}</p><em>Disponível</em></div>)}</ListView> : null}
        </main>
      </div>

      {newOrderOpen ? <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setNewOrderOpen(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="atlas-modal-title"><header><div><small>NOVO ATENDIMENTO</small><h2 id="atlas-modal-title">Agendar veículo</h2></div><button onClick={() => setNewOrderOpen(false)} aria-label="Fechar"><Icon name="close" /></button></header><form onSubmit={addOrder}><label>Cliente<input required autoFocus placeholder="Nome do cliente" /></label><div className={styles.formGrid}><label>Veículo<input required placeholder="Modelo" /></label><label>Placa<input required placeholder="ABC 1D23" /></label></div><label>Motivo do atendimento<textarea rows={3} placeholder="Descreva o pedido do cliente" /></label><footer><button type="button" onClick={() => setNewOrderOpen(false)}>Cancelar</button><button className={styles.primary} type="submit">Criar agendamento</button></footer></form></section></div> : null}
      {notice ? <div className={styles.toast} role="status"><Icon name="check" size={16} />{notice}</div> : null}
    </div>
  );
}

function NavButton({ active, icon, onClick, children }: { active: boolean; icon: "flow" | "calendar" | "users" | "tools"; onClick: () => void; children: ReactNode }) {
  return <button className={active ? styles.activeNav : ""} aria-current={active ? "page" : undefined} onClick={onClick}><Icon name={icon} /><span>{children}</span></button>;
}

function ListView({ eyebrow, title, description, action, onAction, children }: { eyebrow: string; title: string; description: string; action: string; onAction: () => void; children: ReactNode }) {
  return <><section className={styles.pageHeading}><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div><button className={styles.primary} onClick={onAction}><Icon name="plus" size={17} />{action}</button></section><section className={styles.listPanel}>{children}</section></>;
}
