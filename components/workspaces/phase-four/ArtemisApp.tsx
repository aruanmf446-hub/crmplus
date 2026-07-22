"use client";

import { useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";
import { currency, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type MenuItem = { id: string; name: string; category: string; price: number; active: boolean };
type OrderItem = { id: string; menuId: string; name: string; price: number; quantity: number; note: string };
type TableStatus = "Livre" | "Em atendimento" | "Na cozinha" | "Pronto";
type DiningTable = { id: number; seats: number; status: TableStatus; waiter?: string; openedAt?: string; items: OrderItem[] };
type KitchenTicket = { id: string; tableId: number; createdAt: string; state: "Novo" | "Preparando" | "Pronto"; items: OrderItem[] };
type ClosedOrder = { id: string; place: string; total: number; closedAt: string; items: number };

const initialMenu: MenuItem[] = [
  { id: "m1", name: "X-bacon", category: "Lanches", price: 22, active: true },
  { id: "m2", name: "Parmegiana", category: "Pratos", price: 38, active: true },
  { id: "m3", name: "Frango grelhado", category: "Pratos", price: 32, active: true },
  { id: "m4", name: "Fritas grande", category: "Porções", price: 28, active: true },
  { id: "m5", name: "Refrigerante lata", category: "Bebidas", price: 8, active: true },
];
const initialTables: DiningTable[] = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, seats: index % 5 === 0 ? 6 : index % 3 === 0 ? 2 : 4, status: "Livre" as TableStatus, items: [] }));
initialTables[1] = { ...initialTables[1], status: "Em atendimento", waiter: "Ana", openedAt: "19:41", items: [{ id: "oi1", menuId: "m1", name: "X-bacon", price: 22, quantity: 2, note: "Sem cebola" }] };
initialTables[2] = { ...initialTables[2], status: "Na cozinha", waiter: "Ana", openedAt: "19:15", items: [{ id: "oi2", menuId: "m1", name: "X-bacon", price: 22, quantity: 2, note: "" }, { id: "oi3", menuId: "m4", name: "Fritas grande", price: 28, quantity: 1, note: "" }] };

export function ArtemisApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Salão");
  const [menu, setMenu] = useLocalState<MenuItem[]>("crmplus.artemis.menu", initialMenu);
  const [tables, setTables] = useLocalState<DiningTable[]>("crmplus.artemis.tables", initialTables);
  const [tickets, setTickets] = useLocalState<KitchenTicket[]>("crmplus.artemis.tickets", [{ id: "PED-411", tableId: 3, createdAt: "há 31 min", state: "Preparando", items: initialTables[2].items }]);
  const [history, setHistory] = useLocalState<ClosedOrder[]>("crmplus.artemis.history", [{ id: "CMD-407", place: "Mesa 08", total: 96, closedAt: "Hoje, 18:52", items: 5 }]);
  const [selectedId, setSelectedId] = useState(2);
  const [modal, setModal] = useState<"item" | "menu" | "command" | null>(null);
  const [toast, setToast] = useState("");
  const [itemDraft, setItemDraft] = useState({ menuId: initialMenu[0].id, quantity: 1, note: "" });
  const [menuDraft, setMenuDraft] = useState({ name: "", category: "", price: "" });
  const selected = tables.find((table) => table.id === selectedId) ?? tables[0];
  const nav: NavItem[] = [{ label: "Salão", icon: "table" }, { label: "Cozinha", icon: "kitchen" }, { label: "Cardápio", icon: "document" }, { label: "Histórico", icon: "history" }];
  const selectedTotal = selected.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateTable(id: number, updater: (table: DiningTable) => DiningTable) {
    setTables((current) => current.map((table) => table.id === id ? updater(table) : table));
  }

  function openTable(table: DiningTable) {
    if (table.status === "Livre") {
      updateTable(table.id, (current) => ({ ...current, status: "Em atendimento", waiter: "Ana", openedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }));
      setToast(`Mesa ${table.id} aberta`);
    }
    setSelectedId(table.id);
  }

  function createCommand() {
    const free = tables.find((table) => table.status === "Livre");
    if (!free) { setToast("Não há mesas livres neste momento"); return; }
    openTable(free); setModal(null); setActive("Salão");
  }

  function addItem() {
    const menuItem = menu.find((item) => item.id === itemDraft.menuId);
    if (!menuItem) return;
    const line: OrderItem = { id: uid("ITEM"), menuId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: itemDraft.quantity, note: itemDraft.note };
    updateTable(selected.id, (table) => ({ ...table, status: table.status === "Livre" ? "Em atendimento" : table.status, waiter: table.waiter ?? "Ana", items: [...table.items, line] }));
    setItemDraft({ menuId: menu.find((item) => item.active)?.id ?? menu[0].id, quantity: 1, note: "" }); setModal(null); setToast("Item adicionado à comanda");
  }

  function changeQuantity(itemId: string, delta: number) {
    updateTable(selected.id, (table) => ({ ...table, items: table.items.map((item) => item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item) }));
  }

  function removeItem(itemId: string) { updateTable(selected.id, (table) => ({ ...table, items: table.items.filter((item) => item.id !== itemId) })); }

  function sendKitchen() {
    if (!selected.items.length) { setToast("Adicione itens antes de enviar"); return; }
    const ticket: KitchenTicket = { id: uid("PED"), tableId: selected.id, createdAt: "agora", state: "Novo", items: selected.items };
    setTickets((current) => [ticket, ...current.filter((item) => item.tableId !== selected.id || item.state === "Pronto")]);
    updateTable(selected.id, (table) => ({ ...table, status: "Na cozinha" }));
    setToast("Pedido enviado à cozinha");
  }

  function markPreparing(ticketId: string) { setTickets((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, state: "Preparando" } : ticket)); }
  function markReady(ticketId: string) {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket) return;
    setTickets((current) => current.map((item) => item.id === ticketId ? { ...item, state: "Pronto" } : item));
    updateTable(ticket.tableId, (table) => ({ ...table, status: "Pronto" }));
    setToast(`Mesa ${ticket.tableId} pronta para servir`);
  }
  function serveTable() { updateTable(selected.id, (table) => ({ ...table, status: "Em atendimento" })); setToast("Pedido marcado como servido"); }

  function closeCommand() {
    if (!selected.items.length) { updateTable(selected.id, (table) => ({ ...table, status: "Livre", waiter: undefined, openedAt: undefined })); setToast("Mesa liberada"); return; }
    const closed: ClosedOrder = { id: uid("CMD"), place: `Mesa ${String(selected.id).padStart(2, "0")}`, total: selectedTotal, closedAt: todayLabel(), items: selected.items.reduce((sum, item) => sum + item.quantity, 0) };
    setHistory((current) => [closed, ...current]);
    setTickets((current) => current.filter((ticket) => ticket.tableId !== selected.id));
    updateTable(selected.id, (table) => ({ ...table, status: "Livre", waiter: undefined, openedAt: undefined, items: [] }));
    setToast("Comanda encerrada e salva no histórico");
  }

  function addMenuItem() {
    if (!menuDraft.name.trim()) return;
    setMenu((current) => [...current, { id: uid("MENU"), name: menuDraft.name.trim(), category: menuDraft.category.trim() || "Outros", price: Number(menuDraft.price.replace(",", ".")) || 0, active: true }]);
    setMenuDraft({ name: "", category: "", price: "" }); setModal(null); setToast("Item criado no cardápio");
  }

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Salão, comandas, cozinha e cardápio sem misturar responsabilidades." action={<button className={styles.primaryButton} onClick={() => setModal("command")}><Icon name="plus" /> Nova comanda</button>}>
    {active === "Salão" ? <div className={styles.restaurantLayout}>
      <section className={styles.floorSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Turno atual</span><h2>Mapa do salão</h2><p>Abra uma mesa ou acompanhe o atendimento em andamento.</p></div><div className={styles.serviceStatus}><i /><span>{tables.filter((table) => table.status !== "Livre").length} mesas ativas</span></div></div><div className={styles.floorLegend}><span><i className={styles.freeDot} />Livre</span><span><i className={styles.servingDot} />Atendimento</span><span><i className={styles.kitchenDot} />Cozinha</span><span><i className={styles.readyDot} />Pronto</span></div><div className={styles.floorMap}>{tables.map((table) => <button key={table.id} className={`${styles.floorTable} ${styles[`floor${table.status.replaceAll(" ", "")}`]} ${selected.id === table.id ? styles.floorSelected : ""}`} onClick={() => openTable(table)}><span>Mesa {String(table.id).padStart(2, "0")}</span><strong>{table.status === "Livre" ? `${table.seats} lugares` : table.status}</strong><small>{table.waiter ? `${table.waiter} · ${table.items.reduce((sum, item) => sum + item.quantity, 0)} itens` : "Toque para abrir"}</small></button>)}</div></section>
      <aside className={styles.orderSheet}><div className={styles.orderHeader}><div><span className={styles.eyebrow}>Comanda</span><h2>Mesa {String(selected.id).padStart(2, "0")}</h2><p>{selected.waiter ?? "Sem garçom"} · {selected.seats} lugares</p></div><StatusPill status={selected.status} /></div>{selected.status === "Livre" ? <EmptyState icon="table" title="Mesa disponível" description="Abra a mesa para iniciar uma comanda." action={<button className={styles.primaryButton} onClick={() => openTable(selected)}>Abrir mesa</button>} /> : <><div className={styles.orderItems}>{selected.items.map((item) => <div key={item.id}><div className={styles.quantityControl}><button onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}×</span><button onClick={() => changeQuantity(item.id, 1)}>+</button></div><div><strong>{item.name}</strong><small>{item.note || "Sem observação"}</small></div><b>{currency(item.price * item.quantity)}</b><button className={styles.iconButton} onClick={() => removeItem(item.id)}><Icon name="trash" /></button></div>)}</div><button className={styles.addItemButton} onClick={() => setModal("item")}><Icon name="plus" /> Adicionar item</button><div className={styles.orderTotal}><span>Total parcial</span><strong>{currency(selectedTotal)}</strong></div><div className={styles.orderFooter}>{selected.status === "Pronto" ? <button className={styles.secondaryButton} onClick={serveTable}>Marcar servido</button> : <button className={styles.secondaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir</button>}<button className={styles.primaryButton} onClick={selected.status === "Em atendimento" ? sendKitchen : closeCommand}>{selected.status === "Em atendimento" ? "Enviar à cozinha" : selected.status === "Na cozinha" ? "Aguardando cozinha" : "Encerrar comanda"}</button></div></>}</aside>
    </div> : null}

    {active === "Cozinha" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cozinha</span><h2>Fila de preparo</h2><p>Pedidos em ordem de entrada e situação.</p></div><div className={styles.serviceStatus}><i /><span>{tickets.filter((ticket) => ticket.state !== "Pronto").length} ativos</span></div></div><div className={styles.kitchenTable}><div className={styles.tableHead}><span>Pedido</span><span>Itens</span><span>Entrada</span><span>Situação</span><span /></div>{tickets.map((ticket) => <div className={styles.kitchenRow} key={ticket.id}><div><strong>{ticket.id}</strong><span>Mesa {String(ticket.tableId).padStart(2, "0")}</span></div><div><strong>{ticket.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</strong><span>{ticket.items.map((item) => item.note).filter(Boolean).join(" · ") || "Sem observações"}</span></div><b>{ticket.createdAt}</b><StatusPill status={ticket.state} /><div className={styles.rowActions}>{ticket.state === "Novo" ? <button className={styles.secondaryButton} onClick={() => markPreparing(ticket.id)}>Iniciar</button> : null}{ticket.state !== "Pronto" ? <button className={styles.primaryButton} onClick={() => markReady(ticket.id)}><Icon name="check" /> Pronto</button> : <span>Concluído</span>}</div></div>)}{!tickets.length ? <EmptyState icon="check" title="Fila concluída" description="Nenhum pedido aguardando preparo." /> : null}</div></section> : null}

    {active === "Cardápio" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cardápio local</span><h2>Itens e disponibilidade</h2><p>Sem estoque: somente nome, categoria, preço e disponibilidade.</p></div><button className={styles.primaryButton} onClick={() => setModal("menu")}><Icon name="plus" /> Novo item</button></div><div className={styles.menuRows}>{menu.map((item) => <div key={item.id}><div><strong>{item.name}</strong><span>{item.category}</span></div><b>{currency(item.price)}</b><label className={styles.inlineToggle}><input type="checkbox" checked={item.active} onChange={(event) => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, active: event.target.checked } : entry))} /><span>{item.active ? "Disponível" : "Indisponível"}</span></label><button className={styles.iconButton} onClick={() => setMenu((current) => current.filter((entry) => entry.id !== item.id))}><Icon name="trash" /></button></div>)}</div></section> : null}

    {active === "Histórico" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Histórico local</span><h2>Comandas encerradas</h2><p>Registros mantidos neste navegador.</p></div></div><div className={styles.directoryRows}>{history.map((item) => <button key={item.id}><span className={styles.companyAvatar}>{item.place.slice(-2)}</span><div><strong>{item.place} · {item.id}</strong><small>{item.closedAt} · {item.items} itens</small></div><strong>{currency(item.total)}</strong></button>)}{!history.length ? <EmptyState icon="history" title="Sem comandas encerradas" description="As comandas finalizadas aparecerão aqui." /> : null}</div></section> : null}

    <Modal open={modal === "command"} title="Nova comanda" description="O sistema abrirá a primeira mesa livre." onClose={() => setModal(null)}><div className={styles.confirmBox}><Icon name="table" /><div><strong>{tables.filter((table) => table.status === "Livre").length} mesas livres</strong><span>Garçom padrão: Ana</span></div></div><div className={styles.modalActions}><button className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton} onClick={createCommand}>Abrir mesa livre</button></div></Modal>
    <Modal open={modal === "item"} title="Adicionar item" description={`Mesa ${String(selected.id).padStart(2, "0")}`} onClose={() => setModal(null)}><Form onSubmit={addItem}><Field label="Item do cardápio"><select value={itemDraft.menuId} onChange={(event) => setItemDraft((current) => ({ ...current, menuId: event.target.value }))}>{menu.filter((item) => item.active).map((item) => <option value={item.id} key={item.id}>{item.name} · {currency(item.price)}</option>)}</select></Field><Field label="Quantidade"><input type="number" min="1" value={itemDraft.quantity} onChange={(event) => setItemDraft((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))} /></Field><Field label="Observação"><input value={itemDraft.note} onChange={(event) => setItemDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Ex.: sem cebola" /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Adicionar à comanda</button></div></Form></Modal>
    <Modal open={modal === "menu"} title="Novo item do cardápio" onClose={() => setModal(null)}><Form onSubmit={addMenuItem}><Field label="Nome"><input required value={menuDraft.name} onChange={(event) => setMenuDraft((current) => ({ ...current, name: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Categoria"><input value={menuDraft.category} onChange={(event) => setMenuDraft((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Preço"><input inputMode="decimal" value={menuDraft.price} onChange={(event) => setMenuDraft((current) => ({ ...current, price: event.target.value }))} /></Field></div><div className={styles.modalActions}><button className={styles.primaryButton}>Criar item</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}
