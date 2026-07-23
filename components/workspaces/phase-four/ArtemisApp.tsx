"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";
import { currency, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type MenuItem = { id: string; name: string; category: string; price: number; active: boolean };
type OrderItem = { id: string; menuId: string; name: string; price: number; quantity: number; note: string; sent: boolean };
type TableStatus = "Livre" | "Em atendimento" | "Na cozinha" | "Pronto";
type DiningTable = { id: number; seats: number; status: TableStatus; waiter?: string; openedAt?: string; items: OrderItem[] };
type KitchenTicket = { id: string; tableId: number; createdAt: string; state: "Novo" | "Preparando" | "Pronto"; items: OrderItem[] };
type ClosedOrder = { id: string; place: string; total: number; closedAt: string; items: number; summary?: string };

const initialMenu: MenuItem[] = [
  { id: "m1", name: "X-bacon", category: "Lanches", price: 22, active: true },
  { id: "m2", name: "Parmegiana", category: "Pratos", price: 38, active: true },
  { id: "m3", name: "Frango grelhado", category: "Pratos", price: 32, active: true },
  { id: "m4", name: "Fritas grande", category: "Porções", price: 28, active: true },
  { id: "m5", name: "Refrigerante lata", category: "Bebidas", price: 8, active: true },
];
const initialTables: DiningTable[] = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, seats: index % 5 === 0 ? 6 : index % 3 === 0 ? 2 : 4, status: "Livre" as TableStatus, items: [] }));
initialTables[1] = { ...initialTables[1], status: "Em atendimento", waiter: "Ana", openedAt: "19:41", items: [{ id: "oi1", menuId: "m1", name: "X-bacon", price: 22, quantity: 2, note: "Sem cebola", sent: false }] };
initialTables[2] = { ...initialTables[2], status: "Na cozinha", waiter: "Ana", openedAt: "19:15", items: [{ id: "oi2", menuId: "m1", name: "X-bacon", price: 22, quantity: 2, note: "", sent: true }, { id: "oi3", menuId: "m4", name: "Fritas grande", price: 28, quantity: 1, note: "", sent: true }] };

export function ArtemisApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Salão");
  const [menu, setMenu] = useLocalState<MenuItem[]>("crmplus.artemis.menu.v2", initialMenu);
  const [tables, setTables] = useLocalState<DiningTable[]>("crmplus.artemis.tables.v2", initialTables);
  const [tickets, setTickets] = useLocalState<KitchenTicket[]>("crmplus.artemis.tickets.v2", [{ id: "PED-411", tableId: 3, createdAt: "há 31 min", state: "Preparando", items: initialTables[2].items }]);
  const [history, setHistory] = useLocalState<ClosedOrder[]>("crmplus.artemis.history.v2", [{ id: "CMD-407", place: "Mesa 08", total: 96, closedAt: "Hoje, 18:52", items: 5, summary: "2× X-bacon · 1× Fritas grande · 2× Refrigerante lata" }]);
  const [selectedId, setSelectedId] = useState(2);
  const [modal, setModal] = useState<"item" | "menu" | "command" | null>(null);
  const [toast, setToast] = useState("");
  const [historyPreview, setHistoryPreview] = useState<ClosedOrder | null>(null);
  const [itemDraft, setItemDraft] = useState({ menuId: initialMenu[0]?.id ?? "", quantity: 1, note: "" });
  const [menuDraft, setMenuDraft] = useState({ id: "", name: "", category: "", price: "", active: true });
  const [commandDraft, setCommandDraft] = useState({ tableId: "", waiter: "" });
  const [menuQuery, setMenuQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const selected = tables.find((table) => table.id === selectedId) ?? tables[0];
  const nav: NavItem[] = [{ label: "Salão", icon: "table" }, { label: "Cozinha", icon: "kitchen" }, { label: "Cardápio", icon: "document" }, { label: "Histórico", icon: "history" }];
  const selectedTotal = selected?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const activeMenu = menu.filter((item) => item.active);
  const freeTables = tables.filter((table) => table.status === "Livre");
  const pendingItems = selected?.items.filter((item) => !item.sent) ?? [];
  const tableTickets = tickets.filter((ticket) => ticket.tableId === selected?.id);
  const canClose = Boolean(selected && selected.status === "Em atendimento" && !tableTickets.length && !pendingItems.length);
  const categories = useMemo(() => ["Todas", ...Array.from(new Set(menu.map((item) => item.category))).sort()], [menu]);
  const filteredMenu = useMemo(() => {
    const value = menuQuery.trim().toLowerCase();
    return menu.filter((item) => (categoryFilter === "Todas" || item.category === categoryFilter) && (!value || `${item.name} ${item.category}`.toLowerCase().includes(value)));
  }, [categoryFilter, menu, menuQuery]);

  function updateTable(id: number, updater: (table: DiningTable) => DiningTable) {
    setTables((current) => current.map((table) => table.id === id ? updater(table) : table));
  }

  function openCommandModal(tableId?: number) {
    const table = tableId ? tables.find((item) => item.id === tableId && item.status === "Livre") : freeTables[0];
    if (!table) { setToast("Não há mesas livres neste momento"); return; }
    setCommandDraft({ tableId: String(table.id), waiter: "" });
    setModal("command");
  }

  function createCommand() {
    const tableId = Number(commandDraft.tableId);
    const table = tables.find((item) => item.id === tableId);
    if (!table || table.status !== "Livre") { setToast("Selecione uma mesa livre"); return; }
    if (!commandDraft.waiter.trim()) { setToast("Informe o responsável pela mesa"); return; }
    updateTable(table.id, (current) => ({ ...current, status: "Em atendimento", waiter: commandDraft.waiter.trim(), openedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }));
    setSelectedId(table.id);
    setCommandDraft({ tableId: "", waiter: "" });
    setModal(null);
    setActive("Salão");
    setToast(`Mesa ${table.id} aberta`);
  }

  function addItem() {
    if (!selected || selected.status === "Livre") { setToast("Abra a mesa antes de adicionar itens"); return; }
    const menuItem = menu.find((item) => item.id === itemDraft.menuId && item.active);
    if (!menuItem) { setToast("Selecione um item disponível"); return; }
    const line: OrderItem = { id: uid("ITEM"), menuId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: Math.max(1, itemDraft.quantity), note: itemDraft.note.trim(), sent: false };
    updateTable(selected.id, (table) => ({ ...table, items: [...table.items, line] }));
    setItemDraft({ menuId: activeMenu[0]?.id ?? "", quantity: 1, note: "" });
    setModal(null);
    setToast("Item adicionado; envie apenas os novos itens à cozinha");
  }

  function changeQuantity(itemId: string, delta: number) {
    if (!selected) return;
    updateTable(selected.id, (table) => ({ ...table, items: table.items.map((item) => item.id === itemId && !item.sent ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item) }));
  }

  function removeItem(itemId: string) {
    if (!selected) return;
    updateTable(selected.id, (table) => ({ ...table, items: table.items.filter((item) => item.id !== itemId || item.sent) }));
  }

  function sendKitchen() {
    if (!selected || !pendingItems.length) { setToast("Não existem novos itens para enviar"); return; }
    const ticket: KitchenTicket = { id: uid("PED"), tableId: selected.id, createdAt: "agora", state: "Novo", items: pendingItems.map((item) => ({ ...item, sent: true })) };
    setTickets((current) => [...current, ticket]);
    updateTable(selected.id, (table) => ({ ...table, status: "Na cozinha", items: table.items.map((item) => pendingItems.some((pending) => pending.id === item.id) ? { ...item, sent: true } : item) }));
    setToast(`${pendingItems.length} novo(s) item(ns) enviado(s) à cozinha`);
  }

  function markPreparing(ticketId: string) {
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, state: "Preparando" } : ticket));
  }

  function markReady(ticketId: string) {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket) return;
    const nextTickets = tickets.map((item) => item.id === ticketId ? { ...item, state: "Pronto" as const } : item);
    setTickets(nextTickets);
    const allReady = nextTickets.filter((item) => item.tableId === ticket.tableId).every((item) => item.state === "Pronto");
    if (allReady) updateTable(ticket.tableId, (table) => ({ ...table, status: "Pronto" }));
    setToast(`Pedido ${ticket.id} pronto para servir`);
  }

  function serveTable() {
    if (!selected) return;
    const readyTickets = tickets.filter((ticket) => ticket.tableId === selected.id && ticket.state === "Pronto");
    if (!readyTickets.length) { setToast("Nenhum pedido pronto para servir"); return; }
    const nextTickets = tickets.filter((ticket) => !(ticket.tableId === selected.id && ticket.state === "Pronto"));
    setTickets(nextTickets);
    const stillPreparing = nextTickets.some((ticket) => ticket.tableId === selected.id);
    updateTable(selected.id, (table) => ({ ...table, status: stillPreparing ? "Na cozinha" : "Em atendimento" }));
    setToast(readyTickets.length > 1 ? "Pedidos marcados como servidos" : "Pedido marcado como servido");
  }

  function closeCommand() {
    if (!selected) return;
    if (!canClose) { setToast("Sirva os pedidos e envie os novos itens antes de encerrar"); return; }
    if (!selected.items.length) {
      updateTable(selected.id, (table) => ({ ...table, status: "Livre", waiter: undefined, openedAt: undefined }));
      setToast("Mesa liberada");
      return;
    }
    const summary = selected.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ");
    const closed: ClosedOrder = { id: uid("CMD"), place: `Mesa ${String(selected.id).padStart(2, "0")}`, total: selectedTotal, closedAt: todayLabel(), items: selected.items.reduce((sum, item) => sum + item.quantity, 0), summary };
    setHistory((current) => [closed, ...current]);
    updateTable(selected.id, (table) => ({ ...table, status: "Livre", waiter: undefined, openedAt: undefined, items: [] }));
    setToast("Atendimento encerrado e salvo no histórico");
  }

  function openNewMenuItem() {
    setMenuDraft({ id: "", name: "", category: "", price: "", active: true });
    setModal("menu");
  }

  function openEditMenuItem(item: MenuItem) {
    setMenuDraft({ id: item.id, name: item.name, category: item.category, price: String(item.price), active: item.active });
    setModal("menu");
  }

  function saveMenuItem() {
    const name = menuDraft.name.trim();
    const price = Number(menuDraft.price.replace(",", ".")) || 0;
    if (!name) { setToast("Informe o nome do item"); return; }
    if (price <= 0) { setToast("Informe um preço maior que zero"); return; }
    if (menuDraft.id) {
      setMenu((current) => current.map((item) => item.id === menuDraft.id ? { ...item, name, category: menuDraft.category.trim() || "Outros", price, active: menuDraft.active } : item));
      setToast("Item atualizado");
    } else {
      const nextItem: MenuItem = { id: uid("MENU"), name, category: menuDraft.category.trim() || "Outros", price, active: true };
      setMenu((current) => [...current, nextItem]);
      setItemDraft((current) => ({ ...current, menuId: nextItem.id }));
      setToast("Item criado no cardápio");
    }
    setMenuDraft({ id: "", name: "", category: "", price: "", active: true });
    setModal(null);
  }

  function removeMenuItem(item: MenuItem) {
    if (!window.confirm(`Remover “${item.name}” do cardápio?`)) return;
    setMenu((current) => current.filter((entry) => entry.id !== item.id));
    if (itemDraft.menuId === item.id) setItemDraft((current) => ({ ...current, menuId: "" }));
    setToast("Item removido do cardápio");
  }

  const headerAction = active === "Salão"
    ? <button className={styles.primaryButton} disabled={!freeTables.length} onClick={() => openCommandModal()}><Icon name="plus" /> Nova comanda</button>
    : active === "Cardápio" ? <button className={styles.primaryButton} onClick={openNewMenuItem}><Icon name="plus" /> Novo item</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Uma comanda por mesa, com quantos pedidos forem necessários." action={headerAction}>
    {active === "Salão" && selected ? <div className={styles.restaurantLayout}>
      <section className={styles.floorSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Turno atual</span><h2>Mapa do salão</h2><p>Selecione uma mesa para abrir ou acompanhar o atendimento.</p></div><div className={styles.serviceStatus}><i /><span>{tables.filter((table) => table.status !== "Livre").length} mesas ativas</span></div></div><div className={styles.floorLegend}><span><i className={styles.freeDot} />Livre</span><span><i className={styles.servingDot} />Atendimento</span><span><i className={styles.kitchenDot} />Cozinha</span><span><i className={styles.readyDot} />Pronto</span></div><div className={styles.floorMap}>{tables.map((table) => <button key={table.id} className={`${styles.floorTable} ${styles[`floor${table.status.replaceAll(" ", "")}`]} ${selected.id === table.id ? styles.floorSelected : ""}`} onClick={() => setSelectedId(table.id)}><span>Mesa {String(table.id).padStart(2, "0")}</span><strong>{table.status === "Livre" ? `${table.seats} lugares` : table.status}</strong><small>{table.waiter ? `${table.waiter} · ${table.items.reduce((sum, item) => sum + item.quantity, 0)} itens` : "Selecione para abrir"}</small></button>)}</div></section>
      <aside className={styles.orderSheet}><div className={styles.orderHeader}><div><span className={styles.eyebrow}>Comanda</span><h2>Mesa {String(selected.id).padStart(2, "0")}</h2><p>{selected.waiter ?? "Sem responsável"} · {selected.seats} lugares{selected.openedAt ? ` · aberta às ${selected.openedAt}` : ""}</p></div><StatusPill status={selected.status} /></div>{selected.status === "Livre" ? <EmptyState icon="table" title="Mesa disponível" description="Abra a mesa e informe o responsável pelo atendimento." action={<button className={styles.primaryButton} onClick={() => openCommandModal(selected.id)}>Abrir mesa</button>} /> : <><div className={styles.orderItems}>{selected.items.map((item) => <div key={item.id}><div className={styles.quantityControl}><button disabled={item.sent} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}×</span><button disabled={item.sent} onClick={() => changeQuantity(item.id, 1)}>+</button></div><div><strong>{item.name}</strong><small>{item.note || "Sem observação"}</small></div><StatusPill status={item.sent ? "Enviado" : "Novo"} /><b>{currency(item.price * item.quantity)}</b><button disabled={item.sent} className={styles.iconButton} aria-label={`Remover ${item.name}`} onClick={() => removeItem(item.id)}><Icon name="trash" /></button></div>)}</div>{!selected.items.length ? <EmptyState icon="document" title="Comanda vazia" description="Adicione itens antes de enviar o primeiro pedido." /> : null}<button className={styles.addItemButton} disabled={!activeMenu.length} onClick={() => { setItemDraft((current) => ({ ...current, menuId: activeMenu.some((item) => item.id === current.menuId) ? current.menuId : activeMenu[0]?.id ?? "" })); setModal("item"); }}><Icon name="plus" /> {activeMenu.length ? "Adicionar item" : "Cardápio sem itens disponíveis"}</button><div className={styles.orderTotal}><span>Total parcial</span><strong>{currency(selectedTotal)}</strong></div><div className={styles.orderFooter}>{selected.status === "Pronto" ? <button className={styles.primaryButton} onClick={serveTable}>Marcar pronto como servido</button> : <button className={styles.secondaryButton} onClick={() => window.print()}><Icon name="print" /> Imprimir comanda</button>}<button className={styles.primaryButton} disabled={!pendingItems.length} onClick={sendKitchen}>{pendingItems.length ? `Enviar ${pendingItems.length} novo(s) item(ns)` : "Sem novos itens"}</button><button className={styles.secondaryButton} disabled={!canClose} onClick={closeCommand}>{selected.items.length ? "Encerrar atendimento" : "Liberar mesa"}</button></div></>}</aside>
    </div> : null}

    {active === "Cozinha" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cozinha</span><h2>Fila de preparo</h2><p>Cada envio entra como um pedido sem substituir os pedidos anteriores da mesa.</p></div><div className={styles.serviceStatus}><i /><span>{tickets.filter((ticket) => ticket.state !== "Pronto").length} em preparo</span></div></div><div className={styles.kitchenTable}><div className={styles.tableHead}><span>Pedido</span><span>Itens</span><span>Entrada</span><span>Situação</span><span /></div>{tickets.map((ticket) => <div className={styles.kitchenRow} key={ticket.id}><div><strong>{ticket.id}</strong><span>Mesa {String(ticket.tableId).padStart(2, "0")}</span></div><div><strong>{ticket.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</strong><span>{ticket.items.map((item) => item.note).filter(Boolean).join(" · ") || "Sem observações"}</span></div><b>{ticket.createdAt}</b><StatusPill status={ticket.state} /><div className={styles.rowActions}>{ticket.state === "Novo" ? <button className={styles.secondaryButton} onClick={() => markPreparing(ticket.id)}>Iniciar</button> : null}{ticket.state !== "Pronto" ? <button className={styles.primaryButton} onClick={() => markReady(ticket.id)}><Icon name="check" /> Pronto</button> : <span>Aguardando servir</span>}</div></div>)}</div>{!tickets.length ? <EmptyState icon="check" title="Fila concluída" description="Nenhum pedido aguardando preparo." /> : null}</section> : null}

    {active === "Cardápio" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cardápio</span><h2>Itens e disponibilidade</h2><p>Nome, categoria, preço de referência e disponibilidade no atendimento.</p></div></div><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} placeholder="Buscar item ou categoria" /></label><select className={styles.compactSelect} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className={styles.menuRows}>{filteredMenu.map((item) => <div key={item.id}><button type="button" onClick={() => openEditMenuItem(item)}><strong>{item.name}</strong><span>{item.category}</span></button><b>{currency(item.price)}</b><label className={styles.inlineToggle}><input type="checkbox" checked={item.active} onChange={(event) => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, active: event.target.checked } : entry))} /><span>{item.active ? "Disponível" : "Indisponível"}</span></label><button className={styles.iconButton} aria-label={`Remover ${item.name}`} onClick={() => removeMenuItem(item)}><Icon name="trash" /></button></div>)}{!filteredMenu.length ? <EmptyState icon="search" title={menu.length ? "Nenhum item encontrado" : "Cardápio vazio"} description={menu.length ? "Altere a busca ou o filtro de categoria." : "Crie o primeiro item para começar a usar as comandas."} /> : null}</div></section> : null}

    {active === "Histórico" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Histórico</span><h2>Atendimentos encerrados</h2><p>Resumo final de cada comanda.</p></div></div><div className={styles.directoryRows}>{history.map((item) => <button key={item.id} onClick={() => setHistoryPreview(item)}><span className={styles.companyAvatar}>{item.place.slice(-2)}</span><div><strong>{item.place} · {item.id}</strong><small>{item.closedAt} · {item.items} itens</small></div><strong>{currency(item.total)}</strong></button>)}{!history.length ? <EmptyState icon="history" title="Sem atendimentos encerrados" description="As comandas finalizadas aparecerão aqui." /> : null}</div></section> : null}

    <Modal open={Boolean(historyPreview)} title={historyPreview?.place ?? "Comanda"} description={historyPreview?.id} onClose={() => setHistoryPreview(null)}><div className={styles.historySummary}><div><span>Encerrada em</span><strong>{historyPreview?.closedAt}</strong></div><div><span>Quantidade de itens</span><strong>{historyPreview?.items}</strong></div><div><span>Total registrado</span><strong>{currency(historyPreview?.total ?? 0)}</strong></div></div>{historyPreview?.summary ? <div className={styles.noteBox}>{historyPreview.summary}</div> : null}</Modal>
    <Modal open={modal === "command"} title="Nova comanda" description="Escolha uma mesa livre e o responsável pelo atendimento." onClose={() => setModal(null)}><Form onSubmit={createCommand}><Field label="Mesa"><select required value={commandDraft.tableId} onChange={(event) => setCommandDraft((current) => ({ ...current, tableId: event.target.value }))}><option value="">Selecione</option>{freeTables.map((table) => <option key={table.id} value={table.id}>Mesa {String(table.id).padStart(2, "0")} · {table.seats} lugares</option>)}</select></Field><Field label="Responsável"><input required value={commandDraft.waiter} onChange={(event) => setCommandDraft((current) => ({ ...current, waiter: event.target.value }))} placeholder="Nome do atendente" /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Abrir comanda</button></div></Form></Modal>
    <Modal open={modal === "item"} title="Adicionar item" description={selected ? `Mesa ${String(selected.id).padStart(2, "0")}` : undefined} onClose={() => setModal(null)}><Form onSubmit={addItem}><Field label="Item do cardápio"><select required value={itemDraft.menuId} onChange={(event) => setItemDraft((current) => ({ ...current, menuId: event.target.value }))}><option value="">Selecione</option>{activeMenu.map((item) => <option value={item.id} key={item.id}>{item.name} · {currency(item.price)}</option>)}</select></Field><Field label="Quantidade"><input type="number" min="1" value={itemDraft.quantity} onChange={(event) => setItemDraft((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))} /></Field><Field label="Observação"><input value={itemDraft.note} onChange={(event) => setItemDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Ex.: sem cebola" /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Adicionar à comanda</button></div></Form></Modal>
    <Modal open={modal === "menu"} title={menuDraft.id ? "Editar item do cardápio" : "Novo item do cardápio"} onClose={() => setModal(null)}><Form onSubmit={saveMenuItem}><Field label="Nome"><input required value={menuDraft.name} onChange={(event) => setMenuDraft((current) => ({ ...current, name: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Categoria"><input value={menuDraft.category} onChange={(event) => setMenuDraft((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Preço"><input inputMode="decimal" value={menuDraft.price} onChange={(event) => setMenuDraft((current) => ({ ...current, price: event.target.value }))} /></Field></div>{menuDraft.id ? <label className={styles.toggleRow}><input type="checkbox" checked={menuDraft.active} onChange={(event) => setMenuDraft((current) => ({ ...current, active: event.target.checked }))} /><span><strong>Disponível</strong><small>Permitir seleção em novas comandas.</small></span></label> : null}<div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>{menuDraft.id ? "Salvar alterações" : "Criar item"}</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}
