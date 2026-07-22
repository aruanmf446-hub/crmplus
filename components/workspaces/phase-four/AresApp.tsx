"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";
import { copyText, currency, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type QuoteStatus = "Rascunho" | "Enviado" | "Visualizado" | "Aprovado" | "Reprovado";
type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number };
type Quote = { id: string; client: string; title: string; status: QuoteStatus; validity: string; updated: string; notes: string; items: QuoteItem[] };
type QuoteModel = { id: string; name: string; title: string; items: Array<{ description: string; unitPrice: number }> };

const initialQuotes: Quote[] = [
  { id: "ORC-0248", client: "Clínica Horizonte", title: "Website institucional", status: "Visualizado", validity: "2026-07-26", updated: "há 18 min", notes: "Prazo estimado de 30 dias após aprovação.", items: [{ id: "q1", description: "Planejamento e definição do escopo", quantity: 1, unitPrice: 1600 }, { id: "q2", description: "Execução dos serviços contratados", quantity: 1, unitPrice: 5800 }, { id: "q3", description: "Revisão e entrega final", quantity: 1, unitPrice: 1200 }] },
  { id: "ORC-0247", client: "Móveis Real", title: "Catálogo digital", status: "Enviado", validity: "2026-07-25", updated: "ontem", notes: "Entrega em duas etapas.", items: [{ id: "q4", description: "Design do catálogo", quantity: 1, unitPrice: 2250 }, { id: "q5", description: "Publicação e treinamento", quantity: 1, unitPrice: 2000 }] },
];
const initialModels: QuoteModel[] = [
  { id: "mod1", name: "Serviço profissional", title: "Proposta de prestação de serviço", items: [{ description: "Planejamento", unitPrice: 500 }, { description: "Execução", unitPrice: 1500 }, { description: "Entrega", unitPrice: 500 }] },
  { id: "mod2", name: "Móveis planejados", title: "Projeto de móveis planejados", items: [{ description: "Projeto e medição", unitPrice: 800 }, { description: "Fabricação e montagem", unitPrice: 5000 }] },
];

export function AresApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Orçamentos");
  const [quotes, setQuotes] = useLocalState<Quote[]>("crmplus.ares.quotes", initialQuotes);
  const [models, setModels] = useLocalState<QuoteModel[]>("crmplus.ares.models", initialModels);
  const [selectedId, setSelectedId] = useState(quotes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "Todos">("Todos");
  const [editing, setEditing] = useState<Quote | null>(null);
  const [modal, setModal] = useState<"status" | null>(null);
  const [toast, setToast] = useState("");
  const selected = quotes.find((quote) => quote.id === selectedId) ?? quotes[0];
  const nav: NavItem[] = [{ label: "Orçamentos", icon: "document" }, { label: "Criar orçamento", icon: "plus" }, { label: "Clientes", icon: "people" }, { label: "Modelos", icon: "clipboard" }];

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return quotes.filter((quote) => (statusFilter === "Todos" || quote.status === statusFilter) && (!value || `${quote.id} ${quote.client} ${quote.title}`.toLowerCase().includes(value)));
  }, [query, quotes, statusFilter]);

  function newQuote(model?: QuoteModel) {
    const draft: Quote = { id: uid("ORC"), client: "", title: model?.title ?? "", status: "Rascunho", validity: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), updated: "agora", notes: "", items: model ? model.items.map((item) => ({ id: uid("ITEM"), description: item.description, quantity: 1, unitPrice: item.unitPrice })) : [{ id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }] };
    setEditing(draft); setActive("Criar orçamento");
  }

  function editSelected() { if (selected) { setEditing(structuredClone(selected)); setActive("Criar orçamento"); } }

  function saveDraft(quote: Quote, generated = false) {
    const normalized = { ...quote, updated: "agora", status: generated ? "Enviado" as QuoteStatus : quote.status };
    setQuotes((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists ? current.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...current];
    });
    setSelectedId(normalized.id); setEditing(null); setActive("Orçamentos"); setToast(generated ? "Proposta gerada e marcada como enviada" : "Rascunho salvo localmente");
  }

  function updateStatus(status: QuoteStatus) {
    if (!selected) return;
    setQuotes((current) => current.map((quote) => quote.id === selected.id ? { ...quote, status, updated: "agora" } : quote));
    setModal(null); setToast(`Situação alterada para ${status}`);
  }

  async function shareQuote() {
    if (!selected) return;
    const total = quoteTotal(selected);
    await copyText(`Proposta ${selected.id} — ${selected.title}\nCliente: ${selected.client}\nTotal: ${currency(total)}\nValidade: ${formatDate(selected.validity)}\nSituação: ${selected.status}`);
    setToast("Resumo da proposta copiado");
  }

  function addModel() {
    if (!editing) return;
    setModels((current) => [...current, { id: uid("MOD"), name: editing.title || "Novo modelo", title: editing.title, items: editing.items.map((item) => ({ description: item.description, unitPrice: item.unitPrice })) }]);
    setToast("Modelo criado a partir da proposta");
  }

  return <AppShell product={product} nav={nav} active={active} onChange={(value) => { setActive(value); if (value === "Criar orçamento" && !editing) newQuote(); }} title={active} subtitle="Propostas editáveis, profissionais e acompanhadas até a decisão." action={<button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Novo orçamento</button>}>
    {active === "Orçamentos" ? <div className={styles.masterDetail}>
      <section className={styles.listPane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar orçamento ou cliente" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as QuoteStatus | "Todos")}><option>Todos</option><option>Rascunho</option><option>Enviado</option><option>Visualizado</option><option>Aprovado</option><option>Reprovado</option></select></div><div className={styles.recordList}>{filtered.map((quote) => <button key={quote.id} className={`${styles.recordRow} ${selected?.id === quote.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(quote.id)}><div className={styles.recordAvatar}><Icon name="document" /></div><div className={styles.recordMain}><div><strong>{quote.client || "Cliente não informado"}</strong><span>{quote.id}</span></div><p>{quote.title || "Sem título"} · {currency(quoteTotal(quote))}</p></div><div className={styles.recordMeta}><StatusPill status={quote.status} /><small>{quote.updated}</small></div></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhum orçamento encontrado" description="Altere os filtros ou crie uma nova proposta." /> : null}</div></section>
      {selected ? <QuotePreview quote={selected} onEdit={editSelected} onShare={shareQuote} onPrint={() => window.print()} onStatus={() => setModal("status")} /> : null}
    </div> : null}

    {active === "Criar orçamento" ? <QuoteBuilder quote={editing ?? { id: uid("ORC"), client: "", title: "", status: "Rascunho", validity: "", updated: "agora", notes: "", items: [] }} onChange={setEditing} onSave={(quote) => saveDraft(quote, false)} onGenerate={(quote) => saveDraft(quote, true)} onCreateModel={addModel} /> : null}

    {active === "Clientes" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Clientes</span><h2>Clientes com propostas</h2><p>Lista derivada dos orçamentos locais.</p></div></div><div className={styles.directoryRows}>{Array.from(new Set(quotes.map((quote) => quote.client).filter(Boolean))).map((client) => { const clientQuotes = quotes.filter((quote) => quote.client === client); return <button key={client}><span className={styles.companyAvatar}>{client.slice(0, 2).toUpperCase()}</span><div><strong>{client}</strong><small>{clientQuotes.length} orçamento(s) · {currency(clientQuotes.reduce((sum, quote) => sum + quoteTotal(quote), 0))}</small></div><Icon name="chevron" /></button>; })}</div></section> : null}

    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Modelos reutilizáveis</span><h2>Comece com uma estrutura pronta</h2><p>Modelos ficam disponíveis apenas neste navegador.</p></div></div><div className={styles.templateGrid}>{models.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="document" /></div><h3>{model.name}</h3><p>{model.items.length} itens · base de {currency(model.items.reduce((sum, item) => sum + item.unitPrice, 0))}</p><div><button className={styles.secondaryButton} onClick={() => newQuote(model)}>Usar modelo</button><button className={styles.iconButton} onClick={() => setModels((current) => current.filter((item) => item.id !== model.id))}><Icon name="trash" /></button></div></article>)}</div></section> : null}

    <Modal open={modal === "status"} title="Alterar situação" description={selected?.id} onClose={() => setModal(null)}><div className={styles.statusChoices}>{(["Rascunho", "Enviado", "Visualizado", "Aprovado", "Reprovado"] as QuoteStatus[]).map((status) => <button key={status} onClick={() => updateStatus(status)}><StatusPill status={status} /><span>{status === selected?.status ? "Situação atual" : "Selecionar"}</span></button>)}</div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function QuotePreview({ quote, onEdit, onShare, onPrint, onStatus }: { quote: Quote; onEdit: () => void; onShare: () => void; onPrint: () => void; onStatus: () => void }) {
  return <section className={styles.documentPane}><div className={styles.documentToolbar}><div><button onClick={onStatus}><StatusPill status={quote.status} /></button><span>Validade: {formatDate(quote.validity)}</span></div><div><button className={styles.iconButton} onClick={onEdit}><Icon name="edit" /></button><button className={styles.iconButton} onClick={onPrint}><Icon name="print" /></button><button className={styles.primaryButton} onClick={onShare}>Copiar para compartilhar</button></div></div><article className={styles.paper}><header><div className={styles.paperBrand}>A</div><div><strong>ARES PROPOSTAS</strong><span>{quote.id}</span></div></header><div className={styles.paperIntro}><span>PROPOSTA PARA</span><h2>{quote.client || "Cliente não informado"}</h2><p>{quote.title || "Proposta sem título"}</p></div><div className={styles.paperLines}>{quote.items.map((item) => <div key={item.id}><span>{item.quantity}× {item.description || "Item sem descrição"}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}</div><div className={styles.paperTotal}><span>Investimento total</span><strong>{currency(quoteTotal(quote))}</strong></div><div className={styles.paperTerms}><h3>Condições</h3><p>{quote.notes || "Sem condições adicionais."} Proposta válida até {formatDate(quote.validity)}.</p></div></article></section>;
}

function QuoteBuilder({ quote, onChange, onSave, onGenerate, onCreateModel }: { quote: Quote; onChange: (quote: Quote) => void; onSave: (quote: Quote) => void; onGenerate: (quote: Quote) => void; onCreateModel: () => void }) {
  function patch(patchValue: Partial<Quote>) { onChange({ ...quote, ...patchValue }); }
  function patchItem(id: string, patchValue: Partial<QuoteItem>) { patch({ items: quote.items.map((item) => item.id === id ? { ...item, ...patchValue } : item) }); }
  function addItem() { patch({ items: [...quote.items, { id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }] }); }
  const total = quoteTotal(quote);
  return <div className={styles.builderLayout}><section className={styles.builderForm}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>{quote.id}</span><h2>Monte a proposta</h2><p>Todos os campos atualizam a prévia imediatamente.</p></div></div><div className={styles.formGrid}><label className={styles.fieldLabel}><span>Cliente</span><input required value={quote.client} onChange={(event) => patch({ client: event.target.value })} /></label><label className={styles.fieldLabel}><span>Validade</span><input type="date" value={quote.validity} onChange={(event) => patch({ validity: event.target.value })} /></label></div><label className={styles.fieldLabel}><span>Título da proposta</span><input required value={quote.title} onChange={(event) => patch({ title: event.target.value })} /></label><div className={styles.builderItems}><div className={styles.sectionHeading}><div><h3>Itens da proposta</h3><p>Quantidade, descrição e valor unitário.</p></div><button onClick={addItem}><Icon name="plus" /> Adicionar</button></div>{quote.items.map((item, index) => <div className={styles.builderLineAdvanced} key={item.id}><span>{index + 1}</span><input value={item.description} onChange={(event) => patchItem(item.id, { description: event.target.value })} placeholder="Descrição" /><input type="number" min="1" value={item.quantity} onChange={(event) => patchItem(item.id, { quantity: Number(event.target.value) || 1 })} /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => patchItem(item.id, { unitPrice: Number(event.target.value) || 0 })} /><button className={styles.iconButton} onClick={() => patch({ items: quote.items.filter((line) => line.id !== item.id) })}><Icon name="trash" /></button></div>)}</div><label className={styles.fieldLabel}><span>Condições e observações</span><textarea value={quote.notes} onChange={(event) => patch({ notes: event.target.value })} /></label><div className={styles.totalBar}><span>Total da proposta</span><strong>{currency(total)}</strong></div><div className={styles.builderFooter}><button className={styles.secondaryButton} onClick={onCreateModel}>Salvar como modelo</button><button className={styles.secondaryButton} onClick={() => onSave(quote)}>Salvar rascunho</button><button className={styles.primaryButton} onClick={() => onGenerate(quote)}>Gerar proposta</button></div></section><section className={styles.livePreview}><span>Prévia do cliente</span><div className={styles.miniPaper}><strong>Proposta comercial</strong><h3>{quote.client || "Cliente"}</h3><p>{quote.title || "Título da proposta"}</p>{quote.items.map((item) => <div key={item.id}><span>{item.description || "Novo item"}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}<footer><span>Total</span><strong>{currency(total)}</strong></footer></div></section></div>;
}

function quoteTotal(quote: Quote) { return quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); }
function formatDate(value: string) { if (!value) return "não definida"; const date = new Date(`${value}T12:00:00`); return new Intl.DateTimeFormat("pt-BR").format(date); }
