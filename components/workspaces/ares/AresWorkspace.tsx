"use client";

import { useMemo, useState } from "react";
import styles from "./ares.module.css";

type View = "inicio" | "novo" | "orcamentos" | "clientes" | "aprovacoes";
type QuoteStatus = "Rascunho" | "Aguardando" | "Aprovado" | "Reprovado";

type Client = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
};

type CatalogItem = {
  id: number;
  name: string;
  unit: string;
  price: number;
};

type QuoteItem = CatalogItem & { quantity: number };

type Quote = {
  id: string;
  client: Client;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: QuoteStatus;
  createdAt: string;
};

const clients: Client[] = [
  { id: 1, name: "Camila Nogueira", company: "Casa Nogueira", email: "camila@example.com", phone: "(00) 00000-0001" },
  { id: 2, name: "Rodrigo Mendes", company: "RM Arquitetura", email: "rodrigo@example.com", phone: "(00) 00000-0002" },
  { id: 3, name: "Luana Costa", company: "Studio Lume", email: "luana@example.com", phone: "(00) 00000-0003" },
];

const catalog: CatalogItem[] = [
  { id: 1, name: "Projeto de cozinha planejada", unit: "projeto", price: 2850 },
  { id: 2, name: "Módulo inferior em MDF", unit: "módulo", price: 920 },
  { id: 3, name: "Módulo aéreo em MDF", unit: "módulo", price: 780 },
  { id: 4, name: "Instalação e acabamento", unit: "serviço", price: 1450 },
];

const initialQuotes: Quote[] = [
  { id: "ORC-0248", client: clients[1], items: [{ ...catalog[0], quantity: 1 }, { ...catalog[3], quantity: 1 }], subtotal: 4300, discount: 0, total: 4300, status: "Aguardando", createdAt: "21 jul 2026" },
  { id: "ORC-0247", client: clients[2], items: [{ ...catalog[1], quantity: 3 }], subtotal: 2760, discount: 160, total: 2600, status: "Aprovado", createdAt: "20 jul 2026" },
  { id: "ORC-0246", client: clients[0], items: [{ ...catalog[2], quantity: 2 }], subtotal: 1560, discount: 0, total: 1560, status: "Rascunho", createdAt: "19 jul 2026" },
];

const navItems: Array<{ id: View; label: string; icon: IconName }> = [
  { id: "inicio", label: "Visão geral", icon: "home" },
  { id: "novo", label: "Novo orçamento", icon: "plus" },
  { id: "orcamentos", label: "Orçamentos", icon: "document" },
  { id: "clientes", label: "Clientes", icon: "users" },
  { id: "aprovacoes", label: "Aprovações", icon: "checkCircle" },
];

export function AresWorkspace() {
  const [view, setView] = useState<View>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [selectedClientId, setSelectedClientId] = useState(clients[0].id);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("Prazo estimado de produção: 30 dias após a aprovação.");
  const [step, setStep] = useState(1);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [toast, setToast] = useState("");

  const subtotal = useMemo(() => quoteItems.reduce((total, item) => total + item.price * item.quantity, 0), [quoteItems]);
  const total = Math.max(0, subtotal - discount);
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0];
  const pending = quotes.filter((quote) => quote.status === "Aguardando").length;

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function addItem(item: CatalogItem) {
    setQuoteItems((current) => {
      const found = current.find((entry) => entry.id === item.id);
      if (found) return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      return [...current, { ...item, quantity: 1 }];
    });
    showToast(`${item.name} adicionado`);
  }

  function saveQuote(status: QuoteStatus) {
    if (!quoteItems.length) return;
    const newQuote: Quote = {
      id: `ORC-${String(249 + quotes.length - initialQuotes.length).padStart(4, "0")}`,
      client: selectedClient,
      items: quoteItems,
      subtotal,
      discount,
      total,
      status,
      createdAt: "21 jul 2026",
    };
    setQuotes((current) => [newQuote, ...current]);
    setPreviewQuote(newQuote);
    if (status === "Aguardando") {
      navigate("aprovacoes");
      showToast("Link de aprovação preparado");
    } else {
      navigate("orcamentos");
      showToast("Orçamento salvo como rascunho");
    }
    setQuoteItems([]);
    setDiscount(0);
    setStep(1);
  }

  function updateStatus(id: string, status: QuoteStatus) {
    setQuotes((current) => current.map((quote) => quote.id === id ? { ...quote, status } : quote));
    setPreviewQuote((current) => current?.id === id ? { ...current, status } : current);
    showToast(status === "Aprovado" ? "Orçamento aprovado" : "Orçamento reprovado");
  }

  return (
    <div className={styles.workspace}>
      <button className={`${styles.scrim} ${menuOpen ? styles.scrimOpen : ""}`} aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`} aria-label="Navegação do Ares">
        <div className={styles.productMark}>
          <span className={styles.logo}><Icon name="document" size={20} /></span>
          <span><strong>Ares</strong><small>Orçamentos</small></span>
        </div>
        <div className={styles.company}>
          <small>Empresa</small>
          <strong>Marcenaria Horizonte</strong>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button key={item.id} type="button" className={view === item.id ? styles.active : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => navigate(item.id)}>
              <Icon name={item.icon} size={18} />{item.label}
              {item.id === "aprovacoes" && pending ? <b>{pending}</b> : null}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          <span className={styles.avatar}>AN</span>
          <span><strong>Ana Nunes</strong><small>Comercial</small></span>
        </div>
      </aside>

      <div className={styles.page}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} type="button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Icon name="menu" size={21} /></button>
          <div className={styles.context}><span>Área comercial</span><strong>Marcenaria Horizonte</strong></div>
          <button className={styles.newButton} type="button" onClick={() => navigate("novo")}><Icon name="plus" size={16} />Novo orçamento</button>
        </header>

        <main className={styles.main}>
          {view === "inicio" ? <Overview quotes={quotes} onNavigate={navigate} onPreview={setPreviewQuote} /> : null}
          {view === "novo" ? (
            <QuoteBuilder
              step={step}
              setStep={setStep}
              clients={clients}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              catalog={catalog}
              items={quoteItems}
              onAdd={addItem}
              onItemsChange={setQuoteItems}
              discount={discount}
              setDiscount={setDiscount}
              notes={notes}
              setNotes={setNotes}
              subtotal={subtotal}
              total={total}
              onSave={saveQuote}
            />
          ) : null}
          {view === "orcamentos" ? <QuotesView quotes={quotes} onPreview={setPreviewQuote} onCreate={() => navigate("novo")} /> : null}
          {view === "clientes" ? <ClientsView clients={clients} onCreateQuote={(id) => { setSelectedClientId(id); setStep(2); navigate("novo"); }} /> : null}
          {view === "aprovacoes" ? <ApprovalsView quotes={quotes} onStatus={updateStatus} onPreview={setPreviewQuote} /> : null}
        </main>
      </div>

      {previewQuote ? <QuotePreviewModal quote={previewQuote} notes={notes} onClose={() => setPreviewQuote(null)} onStatus={updateStatus} /> : null}
      {toast ? <div className={styles.toast} role="status"><Icon name="check" size={17} />{toast}</div> : null}
    </div>
  );
}

function Overview({ quotes, onNavigate, onPreview }: { quotes: Quote[]; onNavigate: (view: View) => void; onPreview: (quote: Quote) => void }) {
  const issuedTotal = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const approved = quotes.filter((quote) => quote.status === "Aprovado");
  const approvedTotal = approved.reduce((sum, quote) => sum + quote.total, 0);
  return (
    <>
      <section className={styles.heading}>
        <div><p>Visão de hoje</p><h1>Orçamentos claros, do início à resposta.</h1><span>Prepare a proposta, apresente os valores e acompanhe a decisão do cliente.</span></div>
        <button className={styles.primary} type="button" onClick={() => onNavigate("novo")}><Icon name="plus" size={17} />Criar orçamento</button>
      </section>
      <section className={styles.metrics} aria-label="Resumo dos orçamentos">
        <article><small>Em negociação</small><strong>{quotes.filter((quote) => quote.status === "Aguardando").length}</strong><span>Aguardando resposta</span></article>
        <article><small>Valor enviado</small><strong>{formatCurrency(issuedTotal)}</strong><span>{quotes.length} orçamentos</span></article>
        <article><small>Valor aprovado</small><strong>{formatCurrency(approvedTotal)}</strong><span>{approved.length} aprovado(s)</span></article>
      </section>
      <div className={styles.overviewGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><p>Movimentação recente</p><h2>Últimos orçamentos</h2></div><button type="button" onClick={() => onNavigate("orcamentos")}>Ver todos <Icon name="chevron" size={15} /></button></div>
          <div className={styles.quoteList}>
            {quotes.slice(0, 4).map((quote) => (
              <button key={quote.id} type="button" onClick={() => onPreview(quote)}>
                <span className={styles.fileIcon}><Icon name="document" size={17} /></span>
                <span><strong>{quote.client.company}</strong><small>{quote.id} · {quote.createdAt}</small></span>
                <strong>{formatCurrency(quote.total)}</strong>
                <StatusBadge status={quote.status} />
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        </section>
        <aside className={styles.sidePanel}>
          <p>Atalho</p>
          <h2>Monte uma proposta em três passos.</h2>
          <ol><li><span>1</span>Escolha o cliente</li><li><span>2</span>Adicione os itens</li><li><span>3</span>Revise e envie</li></ol>
          <button className={styles.primary} type="button" onClick={() => onNavigate("novo")}>Começar agora <Icon name="chevron" size={16} /></button>
        </aside>
      </div>
    </>
  );
}

function QuoteBuilder({ step, setStep, clients: clientList, selectedClientId, setSelectedClientId, catalog: catalogItems, items, onAdd, onItemsChange, discount, setDiscount, notes, setNotes, subtotal, total, onSave }: {
  step: number;
  setStep: (step: number) => void;
  clients: Client[];
  selectedClientId: number;
  setSelectedClientId: (id: number) => void;
  catalog: CatalogItem[];
  items: QuoteItem[];
  onAdd: (item: CatalogItem) => void;
  onItemsChange: (items: QuoteItem[]) => void;
  discount: number;
  setDiscount: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  subtotal: number;
  total: number;
  onSave: (status: QuoteStatus) => void;
}) {
  const client = clientList.find((entry) => entry.id === selectedClientId) ?? clientList[0];
  return (
    <>
      <section className={styles.heading}>
        <div><p>Novo orçamento</p><h1>{step === 1 ? "Para quem é a proposta?" : step === 2 ? "O que será incluído?" : "Revise antes de enviar."}</h1><span>{step === 1 ? "Selecione um cliente cadastrado." : step === 2 ? "Adicione produtos e serviços com os valores combinados." : "Confira a apresentação que o cliente receberá."}</span></div>
      </section>
      <nav className={styles.steps} aria-label="Etapas do orçamento">
        {["Cliente", "Itens e valores", "Revisão"].map((label, index) => <button key={label} type="button" className={step === index + 1 ? styles.currentStep : step > index + 1 ? styles.completeStep : ""} onClick={() => { if (index + 1 < step) setStep(index + 1); }}><span>{step > index + 1 ? <Icon name="check" size={14} /> : index + 1}</span>{label}</button>)}
      </nav>

      {step === 1 ? (
        <section className={styles.clientPicker}>
          {clientList.map((entry) => (
            <label key={entry.id} className={selectedClientId === entry.id ? styles.selectedClient : ""}>
              <input type="radio" name="client" value={entry.id} checked={selectedClientId === entry.id} onChange={() => setSelectedClientId(entry.id)} />
              <span className={styles.clientAvatar}>{initials(entry.name)}</span>
              <span><strong>{entry.company}</strong><small>{entry.name}</small><em>{entry.email}</em></span>
              <span className={styles.radioMark}><Icon name="check" size={13} /></span>
            </label>
          ))}
          <footer><button className={styles.primary} type="button" onClick={() => setStep(2)}>Continuar <Icon name="chevron" size={16} /></button></footer>
        </section>
      ) : null}

      {step === 2 ? (
        <div className={styles.builderGrid}>
          <section className={styles.catalogPanel}>
            <div className={styles.sectionHead}><div><p>Catálogo</p><h2>Produtos e serviços</h2></div></div>
            <div className={styles.catalogList}>
              {catalogItems.map((item) => <button type="button" key={item.id} onClick={() => onAdd(item)}><span><strong>{item.name}</strong><small>{formatCurrency(item.price)} / {item.unit}</small></span><Icon name="plus" size={16} /></button>)}
            </div>
          </section>
          <section className={styles.summaryPanel}>
            <div className={styles.sectionHead}><div><p>Orçamento atual</p><h2>{client.company}</h2></div><span>{items.length} item(ns)</span></div>
            {items.length ? (
              <div className={styles.lineItems}>
                {items.map((item) => (
                  <article key={item.id}>
                    <div><strong>{item.name}</strong><small>{formatCurrency(item.price)} por {item.unit}</small></div>
                    <label>Qtd.<input type="number" min="1" value={item.quantity} onChange={(event) => onItemsChange(items.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(1, Number(event.target.value)) } : entry))} /></label>
                    <b>{formatCurrency(item.price * item.quantity)}</b>
                    <button type="button" aria-label={`Remover ${item.name}`} onClick={() => onItemsChange(items.filter((entry) => entry.id !== item.id))}><Icon name="trash" size={16} /></button>
                  </article>
                ))}
              </div>
            ) : <div className={styles.emptyItems}><Icon name="document" size={25} /><strong>Adicione o primeiro item</strong><span>Use o catálogo ao lado para montar a proposta.</span></div>}
            <div className={styles.totals}>
              <span><small>Subtotal</small><strong>{formatCurrency(subtotal)}</strong></span>
              <label><span>Desconto</span><div>R$<input type="number" min="0" max={subtotal} value={discount || ""} placeholder="0,00" onChange={(event) => setDiscount(Math.min(subtotal, Math.max(0, Number(event.target.value))))} /></div></label>
              <span className={styles.grandTotal}><small>Total</small><strong>{formatCurrency(total)}</strong></span>
            </div>
            <footer className={styles.builderActions}><button className={styles.secondary} type="button" onClick={() => setStep(1)}>Voltar</button><button className={styles.primary} type="button" disabled={!items.length} onClick={() => setStep(3)}>Revisar orçamento <Icon name="chevron" size={16} /></button></footer>
          </section>
        </div>
      ) : null}

      {step === 3 ? (
        <div className={styles.reviewGrid}>
          <QuotePaper client={client} items={items} subtotal={subtotal} discount={discount} total={total} notes={notes} />
          <aside className={styles.reviewActions}>
            <h2>Pronto para enviar?</h2><p>O cliente receberá um link com esta proposta e poderá aprovar ou reprovar.</p>
            <label>Mensagem final<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
            <button className={styles.primary} type="button" onClick={() => onSave("Aguardando")}><Icon name="send" size={17} />Preparar link de aprovação</button>
            <button className={styles.secondary} type="button" onClick={() => onSave("Rascunho")}>Salvar como rascunho</button>
            <button className={styles.backLink} type="button" onClick={() => setStep(2)}>Voltar aos itens</button>
            <small>Simulação local. Nenhum link ou arquivo externo será criado nesta etapa.</small>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function QuotesView({ quotes, onPreview, onCreate }: { quotes: Quote[]; onPreview: (quote: Quote) => void; onCreate: () => void }) {
  const [query, setQuery] = useState("");
  const filtered = quotes.filter((quote) => `${quote.id} ${quote.client.name} ${quote.client.company}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <section className={styles.heading}><div><p>Histórico</p><h1>Orçamentos</h1><span>Consulte valores, clientes e respostas.</span></div><button className={styles.primary} type="button" onClick={onCreate}><Icon name="plus" size={17} />Criar orçamento</button></section>
      <section className={styles.tablePanel}>
        <div className={styles.tableTools}><label><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente ou número" /></label><span>{filtered.length} resultado(s)</span></div>
        <div className={styles.quoteTableHead}><span>Orçamento</span><span>Cliente</span><span>Valor</span><span>Situação</span><span /></div>
        {filtered.map((quote) => <button className={styles.quoteTableRow} key={quote.id} type="button" onClick={() => onPreview(quote)}><span><strong>{quote.id}</strong><small>{quote.createdAt}</small></span><span><strong>{quote.client.company}</strong><small>{quote.client.name}</small></span><b>{formatCurrency(quote.total)}</b><StatusBadge status={quote.status} /><Icon name="chevron" size={16} /></button>)}
      </section>
    </>
  );
}

function ClientsView({ clients: clientList, onCreateQuote }: { clients: Client[]; onCreateQuote: (id: number) => void }) {
  return (
    <>
      <section className={styles.heading}><div><p>Relacionamento</p><h1>Clientes</h1><span>Contatos usados na criação e no envio das propostas.</span></div></section>
      <section className={styles.clientsGrid}>
        {clientList.map((client) => <article key={client.id}><header><span>{initials(client.name)}</span><div><strong>{client.company}</strong><small>{client.name}</small></div></header><dl><div><dt>E-mail</dt><dd>{client.email}</dd></div><div><dt>Telefone</dt><dd>{client.phone}</dd></div></dl><button type="button" onClick={() => onCreateQuote(client.id)}>Criar orçamento <Icon name="chevron" size={16} /></button></article>)}
      </section>
    </>
  );
}

function ApprovalsView({ quotes, onStatus, onPreview }: { quotes: Quote[]; onStatus: (id: string, status: QuoteStatus) => void; onPreview: (quote: Quote) => void }) {
  const pendingQuotes = quotes.filter((quote) => quote.status === "Aguardando");
  return (
    <>
      <section className={styles.heading}><div><p>Respostas on-line</p><h1>Aprovações</h1><span>Simule a decisão do cliente e acompanhe o resultado da proposta.</span></div></section>
      {pendingQuotes.length ? <div className={styles.approvalList}>{pendingQuotes.map((quote) => <article key={quote.id}><div className={styles.approvalCopy}><span className={styles.fileIcon}><Icon name="document" size={18} /></span><div><small>{quote.id} · enviado hoje</small><strong>{quote.client.company}</strong><span>{quote.client.name} · {formatCurrency(quote.total)}</span></div></div><div className={styles.approvalActions}><button type="button" onClick={() => onPreview(quote)}>Visualizar</button><button type="button" className={styles.reject} onClick={() => onStatus(quote.id, "Reprovado")}><Icon name="close" size={14} />Reprovar</button><button type="button" className={styles.approve} onClick={() => onStatus(quote.id, "Aprovado")}><Icon name="check" size={14} />Aprovar</button></div></article>)}</div> : <section className={styles.emptyState}><Icon name="checkCircle" size={29} /><h2>Nenhuma resposta pendente</h2><p>Os orçamentos enviados para aprovação aparecerão aqui.</p></section>}
    </>
  );
}

function QuotePaper({ client, items, subtotal, discount, total, notes }: { client: Client; items: QuoteItem[]; subtotal: number; discount: number; total: number; notes: string }) {
  return (
    <section className={styles.paper} aria-label="Prévia do orçamento">
      <header><div className={styles.paperBrand}><span>MH</span><div><strong>Marcenaria Horizonte</strong><small>Móveis planejados</small></div></div><div className={styles.paperId}><small>Orçamento</small><strong>ORC-0249</strong><span>21 de julho de 2026</span></div></header>
      <div className={styles.paperClient}><small>Preparado para</small><strong>{client.name}</strong><span>{client.company} · {client.email}</span></div>
      <div className={styles.paperItems}><div><span>Descrição</span><span>Qtd.</span><span>Valor</span></div>{items.map((item) => <div key={item.id}><span><strong>{item.name}</strong><small>{formatCurrency(item.price)} / {item.unit}</small></span><span>{item.quantity}</span><span>{formatCurrency(item.price * item.quantity)}</span></div>)}</div>
      <div className={styles.paperTotals}><span><small>Subtotal</small><strong>{formatCurrency(subtotal)}</strong></span>{discount > 0 ? <span><small>Desconto</small><strong>− {formatCurrency(discount)}</strong></span> : null}<span><small>Total</small><strong>{formatCurrency(total)}</strong></span></div>
      <footer><small>Condições</small><p>{notes}</p><span>Proposta válida por 10 dias.</span></footer>
    </section>
  );
}

function QuotePreviewModal({ quote, notes, onClose, onStatus }: { quote: Quote; notes: string; onClose: () => void; onStatus: (id: string, status: QuoteStatus) => void }) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="quote-preview-title">
        <header><div><small>Prévia PDF simulada</small><h2 id="quote-preview-title">{quote.id}</h2></div><button type="button" aria-label="Fechar prévia" onClick={onClose}><Icon name="close" size={18} /></button></header>
        <div className={styles.modalPaper}><QuotePaper client={quote.client} items={quote.items} subtotal={quote.subtotal} discount={quote.discount} total={quote.total} notes={notes} /></div>
        <footer><StatusBadge status={quote.status} /><span>Esta prévia permanece somente neste navegador.</span>{quote.status === "Aguardando" ? <div><button type="button" className={styles.reject} onClick={() => onStatus(quote.id, "Reprovado")}>Simular reprovação</button><button type="button" className={styles.approve} onClick={() => onStatus(quote.id, "Aprovado")}>Simular aprovação</button></div> : null}</footer>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  return <span className={`${styles.status} ${styles[`status${status}`]}`}>{status}</span>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("");
}

type IconName = "home" | "plus" | "document" | "users" | "checkCircle" | "menu" | "chevron" | "check" | "close" | "trash" | "send" | "search";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === "document") return <svg {...common}><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h5"/></svg>;
  if (name === "users") return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.75"/></svg>;
  if (name === "checkCircle") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === "chevron") return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
  if (name === "close") return <svg {...common}><path d="m7 7 10 10M17 7 7 17"/></svg>;
  if (name === "trash") return <svg {...common}><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>;
  if (name === "send") return <svg {...common}><path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
  return null;
}
