"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import styles from "./artemis.module.css";

type View = "comandas" | "cardapio" | "cozinha" | "mesas" | "caixa";
type OrderStatus = "comanda" | "cozinha" | "pronto" | "caixa" | "pago";

type MenuItem = { id: number; name: string; category: string; price: number; available: boolean };
type Order = { id: number; table: string; attendant: string; opened: string; status: OrderStatus; items: { name: string; quantity: number; price: number }[] };

const orderFlow: { id: OrderStatus; label: string }[] = [
  { id: "comanda", label: "Comanda" },
  { id: "cozinha", label: "Cozinha" },
  { id: "pronto", label: "Pronto" },
  { id: "caixa", label: "Caixa" },
  { id: "pago", label: "Concluído" },
];

const initialMenu: MenuItem[] = [
  { id: 1, name: "Burger da casa", category: "Lanches", price: 34, available: true },
  { id: 2, name: "Risoto de filé", category: "Pratos", price: 48, available: true },
  { id: 3, name: "Salada da praça", category: "Pratos", price: 29, available: true },
  { id: 4, name: "Batata rústica", category: "Acompanhamentos", price: 22, available: true },
  { id: 5, name: "Soda italiana", category: "Bebidas", price: 16, available: true },
  { id: 6, name: "Suco natural", category: "Bebidas", price: 12, available: true },
  { id: 7, name: "Cheesecake de frutas", category: "Sobremesas", price: 22, available: false },
];

const initialOrders: Order[] = [
  { id: 384, table: "Mesa 08", attendant: "Lívia", opened: "14:32", status: "comanda", items: [{ name: "Burger da casa", quantity: 2, price: 34 }, { name: "Soda italiana", quantity: 2, price: 16 }] },
  { id: 381, table: "Entrega", attendant: "Caio", opened: "14:25", status: "cozinha", items: [{ name: "Burger da casa", quantity: 2, price: 34 }, { name: "Batata rústica", quantity: 1, price: 22 }] },
  { id: 379, table: "Mesa 03", attendant: "Lívia", opened: "14:18", status: "cozinha", items: [{ name: "Risoto de filé", quantity: 2, price: 48 }, { name: "Suco natural", quantity: 2, price: 12 }] },
  { id: 377, table: "Mesa 12", attendant: "Bruno", opened: "14:08", status: "pronto", items: [{ name: "Salada da praça", quantity: 1, price: 29 }, { name: "Risoto de filé", quantity: 2, price: 48 }, { name: "Soda italiana", quantity: 3, price: 16 }] },
  { id: 374, table: "Mesa 05", attendant: "Bruno", opened: "13:54", status: "caixa", items: [{ name: "Burger da casa", quantity: 2, price: 34 }, { name: "Suco natural", quantity: 2, price: 12 }] },
];

const tables = [
  { name: "Mesa 03", seats: 2, opened: "42 min", status: "Em atendimento" },
  { name: "Mesa 05", seats: 2, opened: "À espera da conta", status: "No caixa" },
  { name: "Mesa 08", seats: 4, opened: "18 min", status: "Comanda aberta" },
  { name: "Mesa 12", seats: 3, opened: "55 min", status: "Pedido pronto" },
  { name: "Mesa 01", seats: 4, opened: "—", status: "Livre" },
  { name: "Mesa 02", seats: 2, opened: "—", status: "Livre" },
];

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function total(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function Icon({ name, size = 19 }: { name: "orders" | "menu" | "kitchen" | "tables" | "cash" | "search" | "plus" | "arrow" | "check" | "close" | "restaurant" | "clock"; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    orders: <><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4" /></>,
    menu: <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></>,
    kitchen: <><path d="M7 3v8M4 3v5c0 2 1 3 3 3s3-1 3-3V3M7 11v10M16 3c3 2 4 5 4 8h-4v10M16 3v18" /></>,
    tables: <><path d="M5 8h14v8H5zM8 16v5M16 16v5M8 8V4M16 8V4" /></>,
    cash: <><rect x="3" y="6" width="18" height="13" rx="1" /><path d="M3 10h18M16 15h2" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="m9 6 6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    restaurant: <><path d="M7 3v8M4 3v5c0 2 1 3 3 3s3-1 3-3V3M7 11v10M16 3c3 2 4 5 4 8h-4v10" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function ArtemisWorkspace() {
  const [view, setView] = useState<View>("comandas");
  const [orders, setOrders] = useState(initialOrders);
  const [menu, setMenu] = useState(initialMenu);
  const [selectedId, setSelectedId] = useState(384);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | OrderStatus>("todos");
  const [notice, setNotice] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<number[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];
  const step = orderFlow.findIndex((item) => item.id === selected.status);
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return orders.filter((order) => (filter === "todos" || order.status === filter) && (!query || `${order.id} ${order.table} ${order.attendant} ${order.items.map((item) => item.name).join(" ")}`.toLocaleLowerCase("pt-BR").includes(query)));
  }, [filter, orders, search]);

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function updateStatus(status: OrderStatus, message: string) {
    setOrders((items) => items.map((order) => order.id === selected.id ? { ...order, status } : order));
    showNotice(message);
  }

  function nextAction() {
    if (selected.status === "comanda") updateStatus("cozinha", `Pedido #${selected.id} enviado à cozinha.`);
    else if (selected.status === "cozinha") updateStatus("pronto", `Pedido #${selected.id} está pronto para servir.`);
    else if (selected.status === "pronto") updateStatus("caixa", `Comanda #${selected.id} encaminhada ao caixa.`);
    else if (selected.status === "caixa") setPaymentOpen(true);
  }

  function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftItems.length) { showNotice("Escolha pelo menos um item do cardápio."); return; }
    const newId = Math.max(...orders.map((order) => order.id)) + 1;
    const counts = draftItems.reduce<Record<number, number>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
    const items = Object.entries(counts).map(([id, quantity]) => {
      const item = menu.find((menuItem) => menuItem.id === Number(id))!;
      return { name: item.name, price: item.price, quantity };
    });
    setOrders((current) => [{ id: newId, table: "Mesa 06", attendant: "Lívia", opened: "agora", status: "comanda", items }, ...current]);
    setSelectedId(newId);
    setFilter("todos");
    setNewOrderOpen(false);
    setDraftItems([]);
    setView("comandas");
    showNotice(`Comanda #${newId} criada.`);
  }

  function confirmPayment(method: string) {
    updateStatus("pago", `Pagamento por ${method} registrado. Comanda concluída.`);
    setPaymentOpen(false);
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span><Icon name="restaurant" size={22} /></span><div><strong>Artemis</strong><small>CRM Plus</small></div></div>
        <div className={styles.company}><small>RESTAURANTE</small><strong>Bistrô da Praça</strong><span>Salão aberto · 12 mesas</span></div>
        <nav className={styles.nav} aria-label="Navegação do Artemis">
          <NavButton active={view === "comandas"} icon="orders" onClick={() => setView("comandas")}>Comandas</NavButton>
          <NavButton active={view === "cardapio"} icon="menu" onClick={() => setView("cardapio")}>Cardápio</NavButton>
          <NavButton active={view === "cozinha"} icon="kitchen" onClick={() => setView("cozinha")}>Cozinha</NavButton>
          <NavButton active={view === "mesas"} icon="tables" onClick={() => setView("mesas")}>Mesas</NavButton>
          <NavButton active={view === "caixa"} icon="cash" onClick={() => setView("caixa")}>Caixa</NavButton>
        </nav>
        <p className={styles.offline}>Demonstração local<br />Dados fictícios</p>
      </aside>

      <div className={styles.body}>
        <header className={styles.topbar}>
          <div className={styles.mobileBrand}><Icon name="restaurant" /><strong>Artemis</strong></div>
          <label className={styles.search}><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pedido, mesa ou item" aria-label="Buscar pedido, mesa ou item" /></label>
          <span className={styles.serviceOpen}><i />SALÃO ABERTO</span>
          <span className={styles.avatar} aria-label="Perfil de Lívia">LV</span>
        </header>

        <main className={styles.main}>
          {view === "comandas" ? (
            <>
              <PageHeading eyebrow="Atendimento" title="Comandas em movimento" description="Do pedido ao pagamento, sem perder o ritmo do salão." action="Nova comanda" onAction={() => setNewOrderOpen(true)} />
              <section className={styles.metrics} aria-label="Resumo do restaurante"><div><strong>{orders.filter((order) => order.status !== "pago").length}</strong><span>comandas abertas</span></div><div><strong>{orders.filter((order) => order.status === "cozinha").length}</strong><span>na cozinha</span></div><div><strong>18 min</strong><span>tempo médio</span></div><div><strong>{money(orders.filter((order) => order.status === "pago").reduce((sum, order) => sum + total(order), 2840))}</strong><span>caixa de hoje</span></div></section>

              <section className={styles.orderArea}>
                <div className={styles.filters} role="group" aria-label="Filtrar comandas">
                  {(["todos", "comanda", "cozinha", "pronto", "caixa"] as const).map((status) => <button key={status} className={filter === status ? styles.filterActive : ""} onClick={() => setFilter(status)}>{status === "todos" ? "Todas" : orderFlow.find((item) => item.id === status)?.label}</button>)}
                </div>
                <div className={styles.workGrid}>
                  <div className={styles.orderList} role="listbox" aria-label="Comandas">
                    {filteredOrders.map((order) => <button key={order.id} role="option" aria-selected={selected.id === order.id} className={selected.id === order.id ? styles.orderSelected : ""} onClick={() => setSelectedId(order.id)}><span className={styles.orderNumber}>#{order.id}</span><div><strong>{order.table}</strong><small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} itens · {order.opened}</small></div><div><b>{money(total(order))}</b><em data-status={order.status}>{orderFlow.find((item) => item.id === order.status)?.label}</em></div></button>)}
                  </div>

                  <article className={styles.orderDetail}>
                    <header><div><small>COMANDA #{selected.id}</small><h2>{selected.table}</h2><p>Atendimento de {selected.attendant} · aberta às {selected.opened}</p></div><span>{orderFlow.find((item) => item.id === selected.status)?.label}</span></header>
                    <div className={styles.progress} aria-label={`Etapa da comanda ${selected.id}`}>{orderFlow.map((item, index) => <div key={item.id} className={index < step ? styles.complete : index === step ? styles.current : ""}><span>{index < step ? <Icon name="check" size={13} /> : index + 1}</span><small>{item.label}</small></div>)}</div>
                    <div className={styles.items}><div className={styles.itemHeading}><span>Itens</span><span>Valor</span></div>{selected.items.map((item) => <div key={item.name}><span><b>{item.quantity}×</b>{item.name}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div>
                    <div className={styles.total}><span>Total da comanda</span><strong>{money(total(selected))}</strong></div>
                    {selected.status !== "pago" ? <button className={styles.advance} onClick={nextAction}>{selected.status === "comanda" ? "Enviar para a cozinha" : selected.status === "cozinha" ? "Marcar como pronto" : selected.status === "pronto" ? "Levar para o caixa" : "Registrar pagamento"}<Icon name="arrow" size={17} /></button> : <div className={styles.done}><Icon name="check" size={17} />Comanda concluída</div>}
                  </article>
                </div>
              </section>
            </>
          ) : null}

          {view === "cardapio" ? <><PageHeading eyebrow="Produtos" title="Cardápio" description="Pratos, bebidas e disponibilidade para receber pedidos." action="Novo item" onAction={() => showNotice("Cadastro de item aberto na demonstração.")} /><section className={styles.menuList}>{menu.map((item) => <article key={item.id}><div className={styles.foodMark}>{item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><small>{item.category}</small><h2>{item.name}</h2></div><strong>{money(item.price)}</strong><label className={styles.switch}><input type="checkbox" checked={item.available} onChange={() => setMenu((items) => items.map((current) => current.id === item.id ? { ...current, available: !current.available } : current))} /><span />{item.available ? "Disponível" : "Pausado"}</label></article>)}</section></> : null}

          {view === "cozinha" ? <><PageHeading eyebrow="Produção" title="Cozinha" description="Pedidos por ordem de chegada e preparo." /><section className={styles.kitchenBoard}>{(["cozinha", "pronto"] as const).map((status) => <div key={status}><header><h2>{status === "cozinha" ? "Em preparo" : "Prontos"}</h2><span>{orders.filter((order) => order.status === status).length}</span></header>{orders.filter((order) => order.status === status).map((order) => <article key={order.id}><div><small>#{order.id} · {order.opened}</small><strong>{order.table}</strong></div><ul>{order.items.map((item) => <li key={item.name}><b>{item.quantity}×</b>{item.name}</li>)}</ul><button onClick={() => { setSelectedId(order.id); setOrders((items) => items.map((item) => item.id === order.id ? { ...item, status: status === "cozinha" ? "pronto" : "caixa" } : item)); showNotice(status === "cozinha" ? `Pedido #${order.id} marcado como pronto.` : `Pedido #${order.id} enviado ao salão.`); }}>{status === "cozinha" ? "Finalizar preparo" : "Enviar ao salão"}</button></article>)}</div>)}</section></> : null}

          {view === "mesas" ? <><PageHeading eyebrow="Salão" title="Mesas" description="Ocupação e situação de cada atendimento." action="Abrir mesa" onAction={() => setNewOrderOpen(true)} /><section className={styles.tableGrid}>{tables.map((table) => <button key={table.name} onClick={() => showNotice(`${table.name} selecionada.`)}><span className={table.status === "Livre" ? styles.freeTable : ""}>{table.name.replace("Mesa ", "")}</span><div><h2>{table.name}</h2><p>{table.status === "Livre" ? "Disponível para atendimento" : `${table.seats} pessoas · ${table.opened}`}</p></div><em>{table.status}</em></button>)}</section></> : null}

          {view === "caixa" ? <><PageHeading eyebrow="Fechamento" title="Caixa de hoje" description="Recebimentos e comandas aguardando pagamento." /><section className={styles.cashGrid}><div className={styles.cashSummary}><small>TOTAL RECEBIDO</small><strong>R$ 2.840,00</strong><p>68 comandas concluídas</p><dl><div><dt>Cartão</dt><dd>R$ 1.934,00</dd></div><div><dt>Pix</dt><dd>R$ 738,00</dd></div><div><dt>Dinheiro</dt><dd>R$ 168,00</dd></div></dl></div><div className={styles.pendingCash}><header><h2>Aguardando pagamento</h2><span>{orders.filter((order) => order.status === "caixa").length}</span></header>{orders.filter((order) => order.status === "caixa").map((order) => <button key={order.id} onClick={() => { setSelectedId(order.id); setPaymentOpen(true); }}><div><strong>{order.table}</strong><small>Comanda #{order.id}</small></div><b>{money(total(order))}</b><Icon name="arrow" size={16} /></button>)}</div></section></> : null}
        </main>
      </div>

      {newOrderOpen ? <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setNewOrderOpen(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="new-order-title"><header><div><small>NOVO ATENDIMENTO</small><h2 id="new-order-title">Abrir comanda</h2></div><button onClick={() => setNewOrderOpen(false)} aria-label="Fechar"><Icon name="close" /></button></header><form onSubmit={createOrder}><label>Mesa ou tipo de pedido<select defaultValue="Mesa 06"><option>Mesa 06</option><option>Mesa 09</option><option>Retirada</option><option>Entrega</option></select></label><fieldset><legend>Escolha os itens</legend><div className={styles.menuPicker}>{menu.filter((item) => item.available).map((item) => { const quantity = draftItems.filter((id) => id === item.id).length; return <button type="button" key={item.id} onClick={() => setDraftItems((items) => [...items, item.id])}><span><strong>{item.name}</strong><small>{money(item.price)}</small></span>{quantity ? <b>{quantity}</b> : <Icon name="plus" size={16} />}</button>; })}</div></fieldset><footer><span>{draftItems.length} {draftItems.length === 1 ? "item" : "itens"}</span><div><button type="button" onClick={() => setNewOrderOpen(false)}>Cancelar</button><button className={styles.primary} type="submit">Abrir comanda</button></div></footer></form></section></div> : null}

      {paymentOpen ? <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setPaymentOpen(false); }}><section className={`${styles.modal} ${styles.paymentModal}`} role="dialog" aria-modal="true" aria-labelledby="payment-title"><header><div><small>COMANDA #{selected.id}</small><h2 id="payment-title">Registrar pagamento</h2></div><button onClick={() => setPaymentOpen(false)} aria-label="Fechar"><Icon name="close" /></button></header><div className={styles.paymentTotal}><span>Total</span><strong>{money(total(selected))}</strong></div><div className={styles.paymentMethods}><button onClick={() => confirmPayment("cartão")}>Cartão</button><button onClick={() => confirmPayment("Pix")}>Pix</button><button onClick={() => confirmPayment("dinheiro")}>Dinheiro</button></div></section></div> : null}
      {notice ? <div className={styles.toast} role="status"><Icon name="check" size={16} />{notice}</div> : null}
    </div>
  );
}

function NavButton({ active, icon, onClick, children }: { active: boolean; icon: "orders" | "menu" | "kitchen" | "tables" | "cash"; onClick: () => void; children: ReactNode }) {
  return <button className={active ? styles.activeNav : ""} aria-current={active ? "page" : undefined} onClick={onClick}><Icon name={icon} /><span>{children}</span></button>;
}

function PageHeading({ eyebrow, title, description, action, onAction }: { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <section className={styles.pageHeading}><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action && onAction ? <button className={styles.primary} onClick={onAction}><Icon name="plus" size={17} />{action}</button> : null}</section>;
}
