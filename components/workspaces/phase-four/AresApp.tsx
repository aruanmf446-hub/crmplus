"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";
import { copyText, currency, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type QuoteStatus = "Rascunho" | "Pronto" | "Enviado" | "Visualizado" | "Alteração solicitada" | "Aprovado" | "Recusado" | "Expirado";
type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number };
type Quote = {
  id: string;
  client: string;
  title: string;
  status: QuoteStatus;
  validity: string;
  updated: string;
  notes: string;
  decisionNote?: string;
  items: QuoteItem[];
  version: number;
  originId?: string;
  history: Array<{ text: string; date: string }>;
};
type QuoteModel = { id: string; name: string; title: string; notes: string; items: Array<{ description: string; unitPrice: number }> };

const initialQuotes: Quote[] = [
  { id: "ORC-0248", client: "Clínica Horizonte", title: "Website institucional", status: "Visualizado", validity: "2026-07-26", updated: "há 18 min", notes: "Prazo estimado de 30 dias após aprovação.", decisionNote: "", version: 2, originId: "ORC-0239", history: [{ text: "Cliente visualizou a versão 2", date: "Hoje, 09:18" }, { text: "Versão 2 enviada", date: "Ontem" }], items: [{ id: "q1", description: "Planejamento e definição do escopo", quantity: 1, unitPrice: 1600 }, { id: "q2", description: "Execução dos serviços contratados", quantity: 1, unitPrice: 5800 }, { id: "q3", description: "Revisão e entrega final", quantity: 1, unitPrice: 1200 }] },
  { id: "ORC-0247", client: "Móveis Real", title: "Catálogo digital", status: "Enviado", validity: "2026-07-25", updated: "ontem", notes: "Entrega em duas etapas.", decisionNote: "", version: 1, history: [{ text: "Proposta enviada", date: "Ontem" }], items: [{ id: "q4", description: "Design do catálogo", quantity: 1, unitPrice: 2250 }, { id: "q5", description: "Publicação e treinamento", quantity: 1, unitPrice: 2000 }] },
];
const initialModels: QuoteModel[] = [
  { id: "mod1", name: "Serviço profissional", title: "Proposta de prestação de serviço", notes: "Prazo contado após aprovação.", items: [{ description: "Planejamento", unitPrice: 500 }, { description: "Execução", unitPrice: 1500 }, { description: "Entrega", unitPrice: 500 }] },
  { id: "mod2", name: "Móveis planejados", title: "Projeto de móveis planejados", notes: "Medidas finais precisam ser confirmadas antes da fabricação.", items: [{ description: "Projeto e medição", unitPrice: 800 }, { description: "Fabricação e montagem", unitPrice: 5000 }] },
];

const statusOptions: QuoteStatus[] = ["Rascunho", "Pronto", "Enviado", "Visualizado", "Alteração solicitada", "Aprovado", "Recusado", "Expirado"];

export function AresApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Propostas");
  const [quotes, setQuotes] = useLocalState<Quote[]>("crmplus.ares.quotes.v2", initialQuotes);
  const [models, setModels] = useLocalState<QuoteModel[]>("crmplus.ares.models.v2", initialModels);
  const [selectedId, setSelectedId] = useState(quotes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "Todas">("Todas");
  const [editing, setEditing] = useState<Quote | null>(null);
  const [modal, setModal] = useState<"decision" | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<QuoteStatus>("Visualizado");
  const [decisionNote, setDecisionNote] = useState("");
  const [toast, setToast] = useState("");

  const selected = quotes.find((quote) => quote.id === selectedId) ?? quotes[0];
  const nav: NavItem[] = [{ label: "Propostas", icon: "document" }, { label: "Criar proposta", icon: "plus" }, { label: "Clientes", icon: "people" }, { label: "Modelos", icon: "clipboard" }];

  const normalizedQuotes = useMemo(() => quotes.map((quote) => isExpired(quote.validity) && !["Aprovado", "Recusado"].includes(quote.status) ? { ...quote, status: "Expirado" as QuoteStatus } : quote), [quotes]);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return normalizedQuotes.filter((quote) => (statusFilter === "Todas" || quote.status === statusFilter) && (!value || `${quote.id} ${quote.client} ${quote.title}`.toLowerCase().includes(value)));
  }, [normalizedQuotes, query, statusFilter]);

  function blankQuote(model?: QuoteModel): Quote {
    return {
      id: uid("ORC"), client: "", title: model?.title ?? "", status: "Rascunho", validity: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), updated: "agora", notes: model?.notes ?? "", decisionNote: "", version: 1, history: [{ text: "Rascunho criado", date: todayLabel() }],
      items: model ? model.items.map((item) => ({ id: uid("ITEM"), description: item.description, quantity: 1, unitPrice: item.unitPrice })) : [{ id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }],
    };
  }

  function newQuote(model?: QuoteModel) {
    setEditing(blankQuote(model));
    setActive("Criar proposta");
  }

  function editSelected() {
    if (!selected) return;
    if (!["Rascunho", "Pronto"].includes(selected.status)) {
      createVersion();
      setToast("A proposta enviada foi preservada; edite a nova versão");
      return;
    }
    setEditing(structuredClone(selected));
    setActive("Criar proposta");
  }

  function createVersion() {
    if (!selected) return;
    const originId = selected.originId ?? selected.id;
    const relatedVersions = quotes.filter((quote) => (quote.originId ?? quote.id) === originId);
    const nextVersion = Math.max(...relatedVersions.map((quote) => quote.version), selected.version) + 1;
    setEditing({ ...structuredClone(selected), id: uid("ORC"), originId, version: nextVersion, status: "Rascunho", decisionNote: "", updated: "agora", items: selected.items.map((item) => ({ ...item, id: uid("ITEM") })), history: [{ text: `Versão ${nextVersion} criada a partir de ${selected.id}`, date: todayLabel() }] });
    setActive("Criar proposta");
    setToast(`Versão ${nextVersion} criada sem alterar a anterior`);
  }

  function validateQuote(quote: Quote, finalize: boolean) {
    if (!quote.client.trim() || !quote.title.trim()) return "Informe o cliente e o título da proposta";
    if (!quote.items.length || quote.items.some((item) => !item.description.trim())) return "Revise os itens antes de salvar";
    if (quote.items.some((item) => item.quantity <= 0 || item.unitPrice < 0)) return "Revise quantidade e valores";
    if (finalize && !quote.validity) return "Informe a validade da proposta";
    return "";
  }

  function saveQuote(quote: Quote, finalize = false) {
    const error = validateQuote(quote, finalize);
    if (error) { setToast(error); return; }
    const nextStatus: QuoteStatus = finalize ? "Pronto" : quote.status === "Expirado" ? "Rascunho" : quote.status;
    const normalized: Quote = { ...quote, client: quote.client.trim(), title: quote.title.trim(), notes: quote.notes.trim(), updated: "agora", status: nextStatus, history: [{ text: finalize ? "Proposta finalizada e pronta para envio" : "Rascunho salvo", date: todayLabel() }, ...quote.history] };
    setQuotes((current) => current.some((item) => item.id === normalized.id) ? current.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...current]);
    setSelectedId(normalized.id);
    setEditing(null);
    setActive("Propostas");
    setToast(finalize ? "Proposta pronta para envio" : "Rascunho salvo");
  }

  function cancelEditing() {
    if (editing && (editing.client || editing.title || editing.items.some((item) => item.description)) && !window.confirm("Descartar as alterações desta proposta?")) return;
    setEditing(null);
    setActive("Propostas");
  }

  function openDecision(status: QuoteStatus = selected?.status ?? "Visualizado") {
    setDecisionStatus(status);
    setDecisionNote(selected?.decisionNote ?? "");
    setModal("decision");
  }

  function saveDecision() {
    if (!selected) return;
    const noteRequired = ["Alteração solicitada", "Recusado"].includes(decisionStatus);
    if (noteRequired && !decisionNote.trim()) { setToast("Registre o motivo ou a alteração solicitada"); return; }
    setQuotes((current) => current.map((quote) => quote.id === selected.id ? { ...quote, status: decisionStatus, decisionNote: decisionNote.trim(), updated: "agora", history: [{ text: decisionNote.trim() ? `${decisionStatus}: ${decisionNote.trim()}` : `Situação alterada para ${decisionStatus}`, date: todayLabel() }, ...quote.history] } : quote));
    setModal(null);
    setToast(`Situação registrada: ${decisionStatus}`);
  }

  async function shareQuote() {
    if (!selected) return;
    await copyText(`Proposta ${selected.id} · versão ${selected.version}\n${selected.title}\nCliente: ${selected.client}\nTotal: ${currency(quoteTotal(selected))}\nValidade: ${formatDate(selected.validity)}\nSituação: ${selected.status}`);
    setToast("Resumo da proposta copiado");
  }

  function addModel() {
    if (!editing) return;
    const validItems = editing.items.filter((item) => item.description.trim());
    const name = editing.title.trim();
    if (!name || !validItems.length) { setToast("Preencha o título e ao menos um item"); return; }
    if (models.some((model) => model.name.toLowerCase() === name.toLowerCase())) { setToast("Já existe um modelo com este nome"); return; }
    setModels((current) => [...current, { id: uid("MOD"), name, title: editing.title.trim(), notes: editing.notes.trim(), items: validItems.map((item) => ({ description: item.description.trim(), unitPrice: item.unitPrice })) }]);
    setToast("Modelo criado a partir da proposta");
  }

  function removeModel(model: QuoteModel) {
    if (!window.confirm(`Remover o modelo “${model.name}”?`)) return;
    setModels((current) => current.filter((item) => item.id !== model.id));
    setToast("Modelo removido");
  }

  const headerAction = active !== "Criar proposta" && active !== "Modelos"
    ? <button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Nova proposta</button>
    : active === "Modelos" ? <button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Criar proposta</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={(value) => { if (active === "Criar proposta" && editing && value !== "Criar proposta") { setToast("Salve ou descarte a proposta antes de sair"); return; } setActive(value); if (value === "Criar proposta" && !editing) setEditing(blankQuote()); }} title={active} subtitle="Uma proposta, suas versões e a decisão do cliente no mesmo histórico." action={headerAction}>
    {active === "Propostas" ? <div className={styles.masterDetail}>
      <section className={styles.listPane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente, proposta ou código" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as QuoteStatus | "Todas")}><option>Todas</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></div><div className={styles.recordList}>{filtered.map((quote) => <button key={quote.id} className={`${styles.recordRow} ${selected?.id === quote.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(quote.id)}><div className={styles.recordAvatar}><Icon name="document" /></div><div className={styles.recordMain}><div><strong>{quote.client || "Cliente não informado"}</strong><span>{quote.id} · v{quote.version}</span></div><p>{quote.title || "Sem título"} · {currency(quoteTotal(quote))}</p></div><div className={styles.recordMeta}><StatusPill status={quote.status} /><small>{quote.updated}</small></div></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma proposta encontrada" description="Altere os filtros ou crie uma nova proposta." /> : null}</div></section>
      {selected ? <QuotePreview quote={normalizedQuotes.find((quote) => quote.id === selected.id) ?? selected} onEdit={editSelected} onVersion={createVersion} onShare={shareQuote} onPrint={() => window.print()} onStatus={openDecision} /> : <EmptyState icon="document" title="Nenhuma proposta selecionada" description="Escolha uma proposta na lista." />}
    </div> : null}

    {active === "Criar proposta" && editing ? <QuoteBuilder quote={editing} onChange={setEditing} onSave={(quote) => saveQuote(quote, false)} onGenerate={(quote) => saveQuote(quote, true)} onCreateModel={addModel} onCancel={cancelEditing} /> : null}

    {active === "Clientes" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Clientes</span><h2>Histórico de propostas</h2><p>Todas as versões e decisões ficam ligadas ao mesmo cliente.</p></div></div><div className={styles.directoryRows}>{Array.from(new Set(quotes.map((quote) => quote.client).filter(Boolean))).map((client) => { const clientQuotes = quotes.filter((quote) => quote.client === client); return <button key={client} onClick={() => { const quote = clientQuotes[0]; if (quote) { setSelectedId(quote.id); setActive("Propostas"); } }}><span className={styles.companyAvatar}>{client.slice(0, 2).toUpperCase()}</span><div><strong>{client}</strong><small>{clientQuotes.length} versão(ões) · {clientQuotes.filter((quote) => quote.status === "Aprovado").length} aprovada(s)</small></div><Icon name="chevron" /></button>; })}{!quotes.some((quote) => quote.client) ? <EmptyState icon="people" title="Nenhum cliente vinculado" description="Os clientes aparecerão após a criação das propostas." /> : null}</div></section> : null}

    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Modelos reutilizáveis</span><h2>Comece com uma estrutura pronta</h2><p>Reaproveite itens e condições sem copiar uma proposta de cliente.</p></div></div><div className={styles.templateGrid}>{models.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="document" /></div><h3>{model.name}</h3><p>{model.items.length} itens · base de {currency(model.items.reduce((sum, item) => sum + item.unitPrice, 0))}</p><div><button className={styles.secondaryButton} onClick={() => newQuote(model)}>Usar modelo</button><button className={styles.iconButton} aria-label={`Remover modelo ${model.name}`} onClick={() => removeModel(model)}><Icon name="trash" /></button></div></article>)}{!models.length ? <EmptyState icon="clipboard" title="Nenhum modelo salvo" description="Crie uma proposta e salve sua estrutura como modelo." /> : null}</div></section> : null}

    <Modal open={modal === "decision"} title="Registrar situação do cliente" description={selected ? `${selected.id} · versão ${selected.version}` : undefined} onClose={() => setModal(null)}><Field label="Situação"><select value={decisionStatus} onChange={(event) => setDecisionStatus(event.target.value as QuoteStatus)}>{statusOptions.filter((status) => status !== "Rascunho" && status !== "Pronto").map((status) => <option key={status}>{status}</option>)}</select></Field><Field label="Observação" hint="Obrigatória quando houver recusa ou pedido de alteração."><textarea value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} placeholder="O que o cliente decidiu ou pediu para mudar?" /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button type="button" className={styles.primaryButton} onClick={saveDecision}>Registrar decisão</button></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function QuotePreview({ quote, onEdit, onVersion, onShare, onPrint, onStatus }: { quote: Quote; onEdit: () => void; onVersion: () => void; onShare: () => void; onPrint: () => void; onStatus: () => void }) {
  return <section className={styles.documentPane}><div className={styles.documentToolbar}><div><button onClick={onStatus}><StatusPill status={quote.status} /></button><span>Versão {quote.version} · validade {formatDate(quote.validity)}</span></div><div><button className={styles.iconButton} onClick={onEdit} aria-label="Editar proposta"><Icon name="edit" /></button><button className={styles.secondaryButton} onClick={onVersion}><Icon name="plus" /> Nova versão</button><button className={styles.iconButton} onClick={onPrint} aria-label="Imprimir proposta"><Icon name="print" /></button><button className={styles.primaryButton} onClick={onShare}>Copiar para compartilhar</button></div></div>{quote.status === "Expirado" ? <div className={styles.noteBox}>Esta versão expirou. Crie uma nova versão antes de reenviar.</div> : null}{quote.decisionNote ? <div className={styles.noteBox}><strong>Decisão do cliente:</strong> {quote.decisionNote}</div> : null}<article className={styles.paper}><header><div className={styles.paperBrand}>A</div><div><strong>ARES PROPOSTAS</strong><span>{quote.id} · VERSÃO {quote.version}</span></div></header><div className={styles.paperIntro}><span>PROPOSTA PARA</span><h2>{quote.client || "Cliente não informado"}</h2><p>{quote.title || "Proposta sem título"}</p></div><div className={styles.paperLines}>{quote.items.map((item) => <div key={item.id}><span>{item.quantity}× {item.description || "Item sem descrição"}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}</div><div className={styles.paperTotal}><span>Valor total</span><strong>{currency(quoteTotal(quote))}</strong></div><div className={styles.paperTerms}><h3>Condições</h3><p>{quote.notes || "Sem condições adicionais."} Proposta válida até {formatDate(quote.validity)}.</p></div></article><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Histórico desta versão</h3><p>Envios, visualizações e decisões preservados.</p></div></div><div className={styles.scheduleList}>{quote.history.map((item, index) => <div className={styles.scheduleRow} key={`${item.date}-${index}`}><strong>{item.date}</strong><div><h3>{item.text}</h3></div></div>)}</div></section></section>;
}

function QuoteBuilder({ quote, onChange, onSave, onGenerate, onCreateModel, onCancel }: { quote: Quote; onChange: (quote: Quote) => void; onSave: (quote: Quote) => void; onGenerate: (quote: Quote) => void; onCreateModel: () => void; onCancel: () => void }) {
  function patch(value: Partial<Quote>) { onChange({ ...quote, ...value }); }
  function patchItem(id: string, value: Partial<QuoteItem>) { patch({ items: quote.items.map((item) => item.id === id ? { ...item, ...value } : item) }); }
  function addItem() { patch({ items: [...quote.items, { id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }] }); }
  const total = quoteTotal(quote);
  return <div className={styles.builderLayout}><section className={styles.builderForm}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>{quote.id} · versão {quote.version}</span><h2>Monte a proposta</h2><p>O cliente verá somente escopo, condições, prazo e valor.</p></div><button type="button" className={styles.secondaryButton} onClick={onCancel}>Descartar e sair</button></div><div className={styles.formGrid}><label className={styles.fieldLabel}><span>Cliente</span><input required value={quote.client} onChange={(event) => patch({ client: event.target.value })} /></label><label className={styles.fieldLabel}><span>Validade</span><input type="date" value={quote.validity} onChange={(event) => patch({ validity: event.target.value })} /></label></div><label className={styles.fieldLabel}><span>Título da proposta</span><input required value={quote.title} onChange={(event) => patch({ title: event.target.value })} /></label><div className={styles.builderItems}><div className={styles.sectionHeading}><div><h3>Itens da proposta</h3><p>Quantidade, descrição e valor unitário.</p></div><button type="button" onClick={addItem}><Icon name="plus" /> Adicionar</button></div>{quote.items.map((item, index) => <div className={styles.builderLineAdvanced} key={item.id}><span>{index + 1}</span><input value={item.description} onChange={(event) => patchItem(item.id, { description: event.target.value })} placeholder="Descrição" /><input type="number" min="1" value={item.quantity} onChange={(event) => patchItem(item.id, { quantity: Number(event.target.value) || 1 })} /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => patchItem(item.id, { unitPrice: Number(event.target.value) || 0 })} /><button type="button" className={styles.iconButton} aria-label={`Remover item ${index + 1}`} disabled={quote.items.length === 1} onClick={() => patch({ items: quote.items.filter((line) => line.id !== item.id) })}><Icon name="trash" /></button></div>)}</div><label className={styles.fieldLabel}><span>Condições, prazo e observações</span><textarea value={quote.notes} onChange={(event) => patch({ notes: event.target.value })} /></label><div className={styles.totalBar}><span>Total da proposta</span><strong>{currency(total)}</strong></div><div className={styles.builderFooter}><button type="button" className={styles.secondaryButton} onClick={onCreateModel}>Salvar como modelo</button><button type="button" className={styles.secondaryButton} onClick={() => onSave(quote)}>Salvar rascunho</button><button type="button" className={styles.primaryButton} onClick={() => onGenerate(quote)}>Finalizar proposta</button></div></section><section className={styles.livePreview}><span>Prévia do cliente · versão {quote.version}</span><div className={styles.miniPaper}><strong>Proposta comercial</strong><h3>{quote.client || "Cliente"}</h3><p>{quote.title || "Título da proposta"}</p>{quote.items.map((item) => <div key={item.id}><span>{item.description || "Novo item"}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}<footer><span>Total</span><strong>{currency(total)}</strong></footer></div></section></div>;
}

function quoteTotal(quote: Quote) { return quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); }
function formatDate(value: string) { if (!value) return "não definida"; return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)); }
function isExpired(value: string) { if (!value) return false; return new Date(`${value}T23:59:59`).getTime() < Date.now(); }
