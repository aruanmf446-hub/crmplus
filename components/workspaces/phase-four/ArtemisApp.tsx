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
type ConfirmAction = { type: "send" | "serve" | "close" | "prepare" | "ready"; title: string; from: string; to: string; consequence: string; ticketId?: string };

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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modal, setModal] = useState<"item" | "menu" | "command" | "confirm" | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [toast, setToast] = useState("");
  const [historyPreview, setHistoryPreview] = useState<ClosedOrder | null>(null);
  const [itemDraft, setItemDraft] = useState({ menuId: initialMenu[0]?.id ?? "", quantity: 1, note: "" });
  const [menuDraft, setMenuDraft] = useState({ id: "", name: "", category: "", price: "", active: true });
  const [commandDraft, setCommandDraft] = useState({ tableId: "", waiter: "" });
  const [menuQuery, setMenuQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const selected = selectedId === null ? undefined : tables.find((table) => table.id === selectedId);
  const nav: NavItem[] = [{ label: "Salão", icon: "table" }, { label: "Cozinha", icon: "kitchen" }, { label: "Cardápio", icon: "document" }, { label: "Histórico", icon: "history" }];
  const selectedTotal = selected?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const activeMenu = menu.filter((item) => item.active);
  const freeTables = tables.filter((table) => table.status === "Livre");
  const pendingItems = selected?.items.filter((item) => !item.sent) ?? [];
  const tableTickets = selected ? tickets.filter((ticket) => ticket.tableId === selected.id) : [];
  const canClose = Boolean(selected && selected.status === "Em atendimento" && !tableTickets.length && !pendingItems.length);
  const categories = useMemo(() => ["Todas", ...Array.from(new Set(menu.map((item) => item.category))).sort()], [menu]);
  const filteredMenu = useMemo(() => { const value = menuQuery.trim().toLowerCase(); return menu.filter((item) => (categoryFilter === "Todas" || item.category === categoryFilter) && (!value || `${item.name} ${item.category}`.toLowerCase().includes(value))); }, [categoryFilter, menu, menuQuery]);

  function updateTable(id: number, updater: (table: DiningTable) => DiningTable) { setTables((current) => current.map((table) => table.id === id ? updater(table) : table)); }
  function changeArea(value: string) { setActive(value); setSelectedId(null); }

  function openCommandModal(tableId?: number) {
    const table = tableId ? tables.find((item) => item.id === tableId && item.status === "Livre") : freeTables[0];
    if (!table) { setToast("Não há mesas livres neste momento"); return; }
    setCommandDraft({ tableId: String(table.id), waiter: "" }); setModal("command");
  }

  function createCommand() {
    const tableId = Number(commandDraft.tableId);
    const table = tables.find((item) => item.id === tableId);
    if (!table || table.status !== "Livre") { setToast("Selecione uma mesa livre"); return; }
    if (!commandDraft.waiter.trim()) { setToast("Informe o responsável pela mesa"); return; }
    updateTable(table.id, (current) => ({ ...current, status: "Em atendimento", waiter: commandDraft.waiter.trim(), openedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }));
    setSelectedId(table.id); setModal(null); setActive("Salão"); setToast(`Mesa ${table.id} aberta em Em atendimento`);
  }

  function addItem() {
    if (!selected || selected.status === "Livre") { setToast("Abra a mesa antes de adicionar itens"); return; }
    const menuItem = menu.find((item) => item.id === itemDraft.menuId && item.active);
    if (!menuItem) { setToast("Selecione um item disponível"); return; }
    const line: OrderItem = { id: uid("ITEM"), menuId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: Math.max(1, itemDraft.quantity), note: itemDraft.note.trim(), sent: false };
    updateTable(selected.id, (table) => ({ ...table, items: [...table.items, line] }));
    setItemDraft({ menuId: activeMenu[0]?.id ?? "", quantity: 1, note: "" }); setModal(null); setToast("Item adicionado; ainda não foi enviado à cozinha");
  }

  function changeQuantity(itemId: string, delta: number) { if (selected) updateTable(selected.id, (table) => ({ ...table, items: table.items.map((item) => item.id === itemId && !item.sent ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item) })); }
  function removeItem(itemId: string) { if (selected) updateTable(selected.id, (table) => ({ ...table, items: table.items.filter((item) => item.id !== itemId || item.sent) })); }

  function requestSend() {
    if (!selected || !pendingItems.length) { setToast("Não existem novos itens para enviar"); return; }
    setConfirmAction({ type: "send", title: "Enviar pedido à cozinha", from: selected.status, to: tickets.some((item) => item.tableId === selected.id && item.state === "Pronto") ? "Pronto" : "Na cozinha", consequence: `${pendingItems.length} novo(s) item(ns) serão bloqueados para edição e entrarão na fila da cozinha.` });
    setModal("confirm");
  }

  function requestTicket(ticket: KitchenTicket, type: "prepare" | "ready") {
    setConfirmAction(type === "prepare" ? { type, ticketId: ticket.id, title: "Iniciar preparo", from: "Novo", to: "Preparando", consequence: `O pedido ${ticket.id} ficará marcado como em preparo.` } : { type, ticketId: ticket.id, title: "Marcar pedido como pronto", from: ticket.state, to: "Pronto", consequence: `A mesa ${ticket.tableId} será avisada de que este pedido está pronto para servir.` });
    setModal("confirm");
  }

  function requestServe() {
    if (!selected) return;
    const ready = tickets.filter((ticket) => ticket.tableId === selected.id && ticket.state === "Pronto");
    if (!ready.length) { setToast("Nenhum pedido pronto para servir"); return; }
    const other = tickets.some((ticket) => ticket.tableId === selected.id && ticket.state !== "Pronto");
    setConfirmAction({ type: "serve", title: "Confirmar pedido servido", from: "Pronto", to: other ? "Na cozinha" : "Em atendimento", consequence: `${ready.length} pedido(s) pronto(s) serão retirados da fila. A comanda continuará aberta.` });
    setModal("confirm");
  }

  function requestClose() {
    if (!selected) return;
    if (!canClose) { setToast("Sirva os pedidos e envie os novos itens antes de encerrar"); return; }
    setConfirmAction({ type: "close", title: selected.items.length ? "Encerrar atendimento" : "Liberar mesa", from: "Em atendimento", to: "Livre", consequence: selected.items.length ? "A comanda será salva no histórico e a mesa ficará livre." : "A mesa será liberada sem gerar comanda no histórico." });
    setModal("confirm");
  }

  function confirmProcessAction() {
    if (!confirmAction) return;
    if (confirmAction.type === "prepare" && confirmAction.ticketId) setTickets((current) => current.map((ticket) => ticket.id === confirmAction.ticketId ? { ...ticket, state: "Preparando" } : ticket));
    if (confirmAction.type === "ready" && confirmAction.ticketId) {
      const ticket = tickets.find((item) => item.id === confirmAction.ticketId);
      setTickets((current) => current.map((item) => item.id === confirmAction.ticketId ? { ...item, state: "Pronto" } : item));
      if (ticket) updateTable(ticket.tableId, (table) => ({ ...table, status: "Pronto" }));
    }
    if (confirmAction.type === "send" && selected) {
      const ticket: KitchenTicket = { id: uid("PED"), tableId: selected.id, createdAt: "agora", state: "Novo", items: pendingItems.map((item) => ({ ...item, sent: true })) };
      const hasReady = tickets.some((item) => item.tableId === selected.id && item.state === "Pronto");
      setTickets((current) => [...current, ticket]);
      updateTable(selected.id, (table) => ({ ...table, status: hasReady ? "Pronto" : "Na cozinha", items: table.items.map((item) => pendingItems.some((pending) => pending.id === item.id) ? { ...item, sent: true } : item) }));
    }
    if (confirmAction.type === "serve" && selected) {
      const nextTickets = tickets.filter((ticket) => !(ticket.tableId === selected.id && ticket.state === "Pronto"));
      setTickets(nextTickets);
      updateTable(selected.id, (table) => ({ ...table, status: nextTickets.some((ticket) => ticket.tableId === selected.id) ? "Na cozinha" : "Em atendimento" }));
    }
    if (confirmAction.type === "close" && selected) {
      if (selected.items.length) {
        const summary = selected.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ");
        const closed: ClosedOrder = { id: uid("CMD"), place: `Mesa ${String(selected.id).padStart(2, "0")}`, total: selectedTotal, closedAt: todayLabel(), items: selected.items.reduce((sum, item) => sum + item.quantity, 0), summary };
        setHistory((current) => [closed, ...current]);
      }
      updateTable(selected.id, (table) => ({ ...table, status: "Livre", waiter: undefined, openedAt: undefined, items: [] }));
      setSelectedId(null);
    }
    setModal(null); setToast(`${confirmAction.from} → ${confirmAction.to} confirmado`); setConfirmAction(null);
  }

  function openNewMenuItem() { setMenuDraft({ id: "", name: "", category: "", price: "", active: true }); setModal("menu"); }
  function openEditMenuItem(item: MenuItem) { setMenuDraft({ id: item.id, name: item.name, category: item.category, price: String(item.price), active: item.active }); setModal("menu"); }
  function saveMenuItem() {
    const name = menuDraft.name.trim(); const price = Number(menuDraft.price.replace(",", ".")) || 0;
    if (!name) { setToast("Informe o nome do item"); return; }
    if (price <= 0) { setToast("Informe um preço maior que zero"); return; }
    if (menuDraft.id) setMenu((current) => current.map((item) => item.id === menuDraft.id ? { ...item, name, category: menuDraft.category.trim() || "Outros", price, active: menuDraft.active } : item));
    else { const next: MenuItem = { id: uid("MENU"), name, category: menuDraft.category.trim() || "Outros", price, active: true }; setMenu((current) => [...current, next]); }
    setModal(null); setToast(menuDraft.id ? "Item atualizado" : "Item criado no cardápio");
  }
  function removeMenuItem(item: MenuItem) { if (window.confirm(`Remover “${item.name}” do cardápio?`)) setMenu((current) => current.filter((entry) => entry.id !== item.id)); }
  function toggleMenuItem(item: MenuItem, activeValue: boolean) { if (!window.confirm(`${activeValue ? "Disponibilizar" : "Indisponibilizar"} “${item.name}” no atendimento?`)) return; setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, active: activeValue } : entry)); }

  const headerAction = active === "Salão" ? <button className={styles.primaryButton} disabled={!freeTables.length} onClick={() => openCommandModal()}><Icon name="plus" /> Nova comanda</button> : active === "Cardápio" ? <button className={styles.primaryButton} onClick={openNewMenuItem}><Icon name="plus" /> Novo item</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={active} subtitle="Cada mesa mostra somente a etapa atual e a próxima ação segura." action={headerAction}>
    {active === "Salão" ? <div className={styles.restaurantLayout}><section className={styles.floorSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Turno atual</span><h2>Mapa do salão</h2><p>Escolha uma mesa para abrir ou acompanhar o atendimento.</p></div></div><div className={styles.floorMap}>{tables.map((table) => <button key={table.id} className={`${styles.floorTable} ${styles[`floor${table.status.replaceAll(" ", "")}`]} ${selected?.id === table.id ? styles.floorSelected : ""}`} onClick={() => setSelectedId(table.id)}><span>Mesa {String(table.id).padStart(2, "0")}</span><strong>{table.status === "Livre" ? `${table.seats} lugares` : table.status}</strong><small>{table.waiter ? `${table.waiter} · ${table.items.reduce((sum, item) => sum + item.quantity, 0)} itens` : "Selecione para abrir"}</small></button>)}</div></section>{selected ? <aside className={styles.orderSheet}><div className={styles.orderHeader}><div><span className={styles.eyebrow}>Etapa atual</span><h2>Mesa {String(selected.id).padStart(2, "0")}</h2><p>{selected.waiter ?? "Sem responsável"}</p></div><StatusPill status={selected.status} /></div>{selected.status === "Livre" ? <EmptyState icon="table" title="Mesa disponível" description="Abra a mesa e informe o responsável." action={<button className={styles.primaryButton} onClick={() => openCommandModal(selected.id)}>Abrir mesa</button>} /> : <><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Trabalho desta etapa</h3><p>{tableGuidance(selected.status)}</p></div></div></section><div className={styles.orderItems}>{selected.items.map((item) => <div key={item.id}><div className={styles.quantityControl}><button disabled={item.sent} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}×</span><button disabled={item.sent} onClick={() => changeQuantity(item.id, 1)}>+</button></div><div><strong>{item.name}</strong><small>{item.note || "Sem observação"}</small></div><StatusPill status={item.sent ? "Enviado" : "Novo"} /><b>{currency(item.price * item.quantity)}</b><button disabled={item.sent} className={styles.iconButton} onClick={() => removeItem(item.id)}><Icon name="trash" /></button></div>)}</div>{selected.status === "Em atendimento" ? <button className={styles.addItemButton} onClick={() => setModal("item")}><Icon name="plus" /> Adicionar item</button> : null}<div className={styles.orderTotal}><span>Total parcial</span><strong>{currency(selectedTotal)}</strong></div><div className={styles.orderFooter}>{selected.status === "Pronto" ? <button className={styles.primaryButton} onClick={requestServe}>Confirmar pedido servido</button> : null}{selected.status === "Em atendimento" ? <button className={styles.primaryButton} disabled={!pendingItems.length} onClick={requestSend}>{pendingItems.length ? `Enviar ${pendingItems.length} item(ns) à cozinha` : "Sem novos itens"}</button> : null}{canClose ? <button className={styles.secondaryButton} onClick={requestClose}>{selected.items.length ? "Encerrar atendimento" : "Liberar mesa"}</button> : null}</div></>}</aside> : <EmptyState icon="table" title="Nenhuma mesa selecionada" description="Escolha uma mesa para visualizar somente a etapa atual." />}</div> : null}

    {active === "Cozinha" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cozinha</span><h2>Fila de preparo</h2><p>Cada pedido mostra uma única situação atual.</p></div></div><div className={styles.kitchenTable}>{tickets.map((ticket) => <div className={styles.kitchenRow} key={ticket.id}><div><strong>{ticket.id}</strong><span>Mesa {String(ticket.tableId).padStart(2, "0")}</span></div><div><strong>{ticket.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</strong></div><b>{ticket.createdAt}</b><StatusPill status={ticket.state} /><div className={styles.rowActions}>{ticket.state === "Novo" ? <button className={styles.secondaryButton} onClick={() => requestTicket(ticket, "prepare")}>Confirmar início</button> : null}{ticket.state === "Preparando" ? <button className={styles.primaryButton} onClick={() => requestTicket(ticket, "ready")}><Icon name="check" /> Confirmar pronto</button> : null}{ticket.state === "Pronto" ? <span>Aguardando servir</span> : null}</div></div>)}</div>{!tickets.length ? <EmptyState icon="check" title="Fila concluída" description="Nenhum pedido aguardando preparo." /> : null}</section> : null}

    {active === "Cardápio" ? <section className={styles.pageSheet}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} placeholder="Buscar item ou categoria" /></label><select className={styles.compactSelect} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className={styles.menuRows}>{filteredMenu.map((item) => <div key={item.id}><button type="button" onClick={() => openEditMenuItem(item)}><strong>{item.name}</strong><span>{item.category}</span></button><b>{currency(item.price)}</b><button className={styles.secondaryButton} onClick={() => toggleMenuItem(item, !item.active)}>{item.active ? "Indisponibilizar" : "Disponibilizar"}</button><button className={styles.iconButton} onClick={() => removeMenuItem(item)}><Icon name="trash" /></button></div>)}</div></section> : null}

    {active === "Histórico" ? <section className={styles.pageSheet}><div className={styles.directoryRows}>{history.map((item) => <button key={item.id} onClick={() => setHistoryPreview(item)}><span className={styles.companyAvatar}>{item.place.slice(-2)}</span><div><strong>{item.place} · {item.id}</strong><small>{item.closedAt} · {item.items} itens</small></div><strong>{currency(item.total)}</strong></button>)}</div></section> : null}

    <Modal open={Boolean(historyPreview)} title={historyPreview?.place ?? "Comanda"} description={historyPreview?.id} onClose={() => setHistoryPreview(null)}>{historyPreview?.summary ? <div className={styles.noteBox}>{historyPreview.summary}</div> : null}</Modal>
    <Modal open={modal === "command"} title="Nova comanda" description="A mesa abrirá na etapa Em atendimento." onClose={() => setModal(null)}><Form onSubmit={createCommand}><Field label="Mesa"><select required value={commandDraft.tableId} onChange={(event) => setCommandDraft((current) => ({ ...current, tableId: event.target.value }))}><option value="">Selecione</option>{freeTables.map((table) => <option key={table.id} value={table.id}>Mesa {String(table.id).padStart(2, "0")}</option>)}</select></Field><Field label="Responsável"><input required value={commandDraft.waiter} onChange={(event) => setCommandDraft((current) => ({ ...current, waiter: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Abrir comanda</button></div></Form></Modal>
    <Modal open={modal === "item"} title="Adicionar item" description={selected ? `Mesa ${String(selected.id).padStart(2, "0")} · ainda não enviado` : undefined} onClose={() => setModal(null)}><Form onSubmit={addItem}><Field label="Item"><select required value={itemDraft.menuId} onChange={(event) => setItemDraft((current) => ({ ...current, menuId: event.target.value }))}>{activeMenu.map((item) => <option value={item.id} key={item.id}>{item.name} · {currency(item.price)}</option>)}</select></Field><Field label="Quantidade"><input type="number" min="1" value={itemDraft.quantity} onChange={(event) => setItemDraft((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))} /></Field><Field label="Observação"><input value={itemDraft.note} onChange={(event) => setItemDraft((current) => ({ ...current, note: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Adicionar à comanda</button></div></Form></Modal>
    <Modal open={modal === "menu"} title={menuDraft.id ? "Editar item" : "Novo item"} onClose={() => setModal(null)}><Form onSubmit={saveMenuItem}><Field label="Nome"><input required value={menuDraft.name} onChange={(event) => setMenuDraft((current) => ({ ...current, name: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Categoria"><input value={menuDraft.category} onChange={(event) => setMenuDraft((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Preço"><input inputMode="decimal" value={menuDraft.price} onChange={(event) => setMenuDraft((current) => ({ ...current, price: event.target.value }))} /></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar</button></div></Form></Modal>
    <Modal open={modal === "confirm"} title={confirmAction?.title ?? "Confirmar ação"} onClose={() => setModal(null)}>{confirmAction ? <><div className={styles.noteBox}><strong>{confirmAction.from}</strong> → <strong>{confirmAction.to}</strong><br />{confirmAction.consequence}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmProcessAction}>Confirmar ação</button></div></> : null}</Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function tableGuidance(status: TableStatus) { if (status === "Em atendimento") return "Adicione itens e envie somente quando o pedido estiver confirmado."; if (status === "Na cozinha") return "Aguarde a cozinha. Novos itens só aparecem depois de um novo envio."; if (status === "Pronto") return "Confirme que o pedido foi servido antes de continuar."; return "Abra uma comanda para iniciar."; }
