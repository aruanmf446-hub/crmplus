"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";
import { copyText, currency, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type QuoteStatus = "Rascunho" | "Pronto" | "Enviado" | "Visualizado" | "Aprovado" | "Reprovado";
type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number };
type Quote = { id: string; client: string; title: string; status: QuoteStatus; validity: string; updated: string; notes: string; items: QuoteItem[]; version?: number; originId?: string };
type QuoteModel = { id: string; name: string; title: string; items: Array<{ description: string; unitPrice: number }> };

const initialQuotes: Quote[] = [
  { id: "ORC-0248", client: "Clínica Horizonte", title: "Website institucional", status: "Visualizado", validity: "2026-07-26", updated: "há 18 min", notes: "Prazo estimado de 30 dias após aprovação.", version: 2, originId: "ORC-0239", items: [{ id: "q1", description: "Planejamento e definição do escopo", quantity: 1, unitPrice: 1600 }, { id: "q2", description: "Execução dos serviços contratados", quantity: 1, unitPrice: 5800 }, { id: "q3", description: "Revisão e entrega final", quantity: 1, unitPrice: 1200 }] },
  { id: "ORC-0247", client: "Móveis Real", title: "Catálogo digital", status: "Enviado", validity: "2026-07-25", updated: "ontem", notes: "Entrega em duas etapas.", version: 1, items: [{ id: "q4", description: "Design do catálogo", quantity: 1, unitPrice: 2250 }, { id: "q5", description: "Publicação e treinamento", quantity: 1, unitPrice: 2000 }] },
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

  function blankQuote(model?: QuoteModel): Quote {
    return {
      id: uid("ORC"),
      client: "",
      title: model?.title ?? "",
      status: "Rascunho",
      validity: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      updated: "agora",
      notes: "",
      version: 1,
      items: model ? model.items.map((item) => ({ id: uid("ITEM"), description: item.description, quantity: 1, unitPrice: item.unitPrice })) : [{ id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }],
    };
  }

  function newQuote(model?: QuoteModel) {
    setEditing(blankQuote(model));
    setActive("Criar orçamento");
  }

  function editSelected() {
    if (!selected) return;
    setEditing(structuredClone({ ...selected, version: selected.version ?? 1 }));
    setActive("Criar orçamento");
  }

  function createVersion() {
    if (!selected) return;
    const originId = selected.originId ?? selected.id;
    const relatedVersions = quotes.filter((quote) => (quote.originId ?? quote.id) === originId);
    const nextVersion = Math.max(...relatedVersions.map((quote) => quote.version ?? 1), selected.version ?? 1) + 1;
    setEditing({ ...structuredClone(selected), id: uid("ORC"), originId, version: nextVersion, status: "Rascunho", updated: "agora", items: selected.items.map((item) => ({ ...item, id: uid("ITEM") })) });
    setActive("Criar orçamento");
    setToast(`Nova versão ${nextVersion} preparada`);
  }

  function validateQuote(quote: Quote, finalize: boolean) {
    if (!quote.client.trim() || !quote.title.trim()) return "Informe o cliente e o título da proposta";
    if (!quote.items.length || quote.items.some((item) => !item.description.trim())) return "Revise os itens antes de salvar a proposta";
    if (quote.items.some((item) => item.quantity <= 0 || item.unitPrice < 0)) return "Revise quantidade e valores dos itens";
    if (finalize && !quote.validity) return "Informe a validade da proposta";
    return "";
  }

  function saveDraft(quote: Quote, finalize = false) {
    const error = validateQuote(quote, finalize);
    if (error) { setToast(error); return; }
    const normalized: Quote = { ...quote, client: quote.client.trim(), title: quote.title.trim(), notes: quote.notes.trim(), updated: "agora", version: quote.version ?? 1, status: finalize ? "Pronto" : quote.status };
    setQuotes((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists ? current.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...current];
    });
    setSelectedId(normalized.id);
    setEditing(null);
    setActive("Orçamentos");
    setToast(finalize ? "Proposta pronta para envio" : "Rascunho salvo");
  }

  function cancelEditing() {
    if (editing && (editing.client || editing.title || editing.items.some((item) => item.description))) {
      if (!window.confirm("Descartar as alterações desta proposta?")) return;
    }
    setEditing(null);
    setActive("Orçamentos");
  }

  function updateStatus(status: QuoteStatus) {
    if (!selected) return;
    setQuotes((current) => current.map((quote) => quote.id === selected.id ? { ...quote, status, updated: "agora" } : quote));
    setModal(null);
    setToast(`Situação alterada para ${status}`);
  }

  async function shareQuote() {
    if (!selected) return;
    const total = quoteTotal(selected);
    await copyText(`Proposta ${selected.id} · versão ${selected.version ?? 1}\n${selected.title}\nCliente: ${selected.client}\nTotal: ${currency(total)}\nValidade: ${formatDate(selected.validity)}\nSituação: ${selected.status}`);
    setToast("Resumo da proposta copiado");
  }

  function addModel() {
    if (!editing) return;
    const validItems = editing.items.filter((item) => item.description.trim());
    const name = editing.title.trim();
    if (!name || !validItems.length) { setToast("Preencha o título e ao menos um item antes de criar o modelo"); return; }
    if (models.some((model) => model.name.toLowerCase() === name.toLowerCase())) { setToast("Já existe um modelo com este nome"); return; }
    setModels((current) => [...current, { id: uid("MOD"), name, title: editing.title.trim(), items: validItems.map((item) => ({ description: item.description.trim(), unitPrice: item.unitPrice })) }]);
    setToast("Modelo criado a partir da proposta");
  }

  function removeModel(model: QuoteModel) {
    if (!window.confirm(`Remover o modelo “${model.name}”?`)) return;
    setModels((current) => current.filter((item) => item.id !== model.id));
    setToast("Modelo removido");
  }

  const headerAction = active !== "Criar orçamento" && active !== "Modelos"
    ? <button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Novo orçamento</button>
    : active === "Modelos"
      ? <button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Criar proposta</button>
      : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={(value) => { if (active === "Criar orçamento" && editing && value !== "Criar orçamento") { setToast("Salve ou descarte a proposta antes de sair"); return; } setActive(value); if (value === "Criar orçamento" && !editing) setEditing(blankQuote()); }} title={active} subtitle="Propostas editáveis, versionadas e acompanhadas até a decisão do cliente." action={headerAction}>
    {active === "Orçamentos" ? <div className={styles.masterDetail}>
      <section className={styles.listPane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar orçamento ou cliente" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as QuoteStatus | "Todos")}><option>Todos</option><option>Rascunho</option><option>Pronto</option><option>Enviado</option><option>Visualizado</option><option>Aprovado</option><option>Reprovado</option></select></div><div className={styles.recordList}>{filtered.map((quote) => <button key={quote.id} className={`${styles.recordRow} ${selected?.id === quote.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(quote.id)}><div className={styles.recordAvatar}><Icon name="document" /></div><div className={styles.recordMain}><div><strong>{quote.client || "Cliente não informado"}</strong><span>{quote.id} · v{quote.version ?? 1}</span></div><p>{quote.title || "Sem título"} · {currency(quoteTotal(quote))}</p></div><div className={styles.recordMeta}><StatusPill status={quote.status} /><small>{quote.updated}</small></div></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhum orçamento encontrado" description="Altere os filtros ou crie uma nova proposta." /> : null}</div></section>
      {selected ? <QuotePreview quote={selected} onEdit={editSelected} onVersion={createVersion} onShare={shareQuote} onPrint={() => window.print()} onStatus={() => setModal("status")} /> : <EmptyState icon="document" title="Nenhum orçamento selecionado" description="Escolha uma proposta na lista." />}
    </div> : null}

    {active === "Criar orçamento" && editing ? <QuoteBuilder quote={editing} onChange={setEditing} onSave={(quote) => saveDraft(quote, false)} onGenerate={(quote) => saveDraft(quote, true)} onCreateModel={addModel} onCancel={cancelEditing} /> : null}

    {active === "Clientes" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Clientes</span><h2>Clientes com propostas</h2><p>Consulte propostas, versões e valores por cliente.</p></div></div><div className={styles.directoryRows}>{Array.from(new Set(quotes.map((quote) => quote.client).filter(Boolean))).map((client) => { const clientQuotes = quotes.filter((quote) => quote.client === client); return <button key={client} onClick={() => { const quote = clientQuotes[0]; if (quote) { setSelectedId(quote.id); setActive("Orçamentos"); } }}><span className={styles.companyAvatar}>{client.slice(0, 2).toUpperCase()}</span><div><strong>{client}</strong><small>{clientQuotes.length} proposta(s) · {currency(clientQuotes.reduce((sum, quote) => sum + quoteTotal(quote), 0))}</small></div><Icon name="chevron" /></button>; })}{!quotes.some((quote) => quote.client) ? <EmptyState icon="people" title="Nenhum cliente vinculado" description="Os clientes aparecerão após a criação das propostas." /> : null}</div></section> : null}

    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Modelos reutilizáveis</span><h2>Comece com uma estrutura pronta</h2><p>Reaproveite itens e valores como ponto de partida.</p></div></div><div className={styles.templateGrid}>{models.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="document" /></div><h3>{model.name}</h3><p>{model.items.length} itens · base de {currency(model.items.reduce((sum, item) => sum + item.unitPrice, 0))}</p><div><button className={styles.secondaryButton} onClick={() => newQuote(model)}>Usar modelo</button><button className={styles.iconButton} aria-label={`Remover modelo ${model.name}`} onClick={() => removeModel(model)}><Icon name="trash" /></button></div></article>)}{!models.length ? <EmptyState icon="clipboard" title="Nenhum modelo salvo" description="Crie uma proposta e salve sua estrutura como modelo." /> : null}</div></section> : null}

    <Modal open={modal === "status"} title="Alterar situação" description={selected?.id} onClose={() => setModal(null)}><div className={styles.statusChoices}>{(["Rascunho", "Pronto", "Enviado", "Visualizado", "Aprovado", "Reprovado"] as QuoteStatus[]).map((status) => <button key={status} onClick={() => updateStatus(status)}><StatusPill status={status} /><span>{status === selected?.status ? "Situação atual" : "Selecionar"}</span></button>)}</div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function QuotePreview({ quote, onEdit, onVersion, onShare, onPrint, onStatus }: { quote: Quote; onEdit: () => void; onVersion: () => void; onShare: () => void; onPrint: () => void; onStatus: () => void }) {
  const expired = isExpired(quote.validity) && !["Aprovado", "Reprovado"].includes(quote.status);
  return <section className={styles.documentPane}><div className={styles.documentToolbar}><div><button onClick={onStatus}><StatusPill status={quote.status} /></button><span>Versão {quote.version ?? 1} · validade {formatDate(quote.validity)}</span></div><div><button className={styles.iconButton} onClick={onEdit} aria-label="Editar proposta"><Icon name="edit" /></button><button className={styles.secondaryButton} onClick={onVersion}><Icon name="plus" /> Nova versão</button><button className={styles.iconButton} onClick={onPrint} aria-label="Imprimir proposta"><Icon name="print" /></button><button className={styles.primaryButton} onClick={onShare}>Copiar para compartilhar</button></div></div>{expired ? <div className={styles.noteBox}>A validade desta proposta venceu. Crie uma nova versão antes de reenviar.</div> : null}<article className={styles.paper}><header><div className={styles.paperBrand}>A</div><div><strong>ARES PROPOSTAS</strong><span>{quote.id} · VERSÃO {quote.version ?? 1}</span></div></header><div className={styles.paperIntro}><span>PROPOSTA PARA</span><h2>{quote.client || "Cliente não informado"}</h2><p>{quote.title || "Proposta sem título"}</p></div><div className={styles.paperLines}>{quote.items.map((item) => <div key={item.id}><span>{item.quantity}× {item.description || "Item sem descrição"}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}</div><div className={styles.paperTotal}><span>Investimento total</span><strong>{currency(quoteTotal(quote))}</strong></div><div className={styles.paperTerms}><h3>Condições</h3><p>{quote.notes || "Sem condições adicionais."} Proposta válida até {formatDate(quote.validity)}.</p></div></article></section>;
}

function QuoteBuilder({ quote, onChange, onSave, onGenerate, onCreateModel, onCancel }: { quote: Quote; onChange: (quote: Quote) => void; onSave: (quote: Quote) => void; onGenerate: (quote: Quote) => void; onCreateModel: () => void; onCancel: () => void }) {
  function patch(patchValue: Partial<Quote>) { onChange({ ...quote, ...patchValue }); }
  function patchItem(id: string, patchValue: Partial<QuoteItem>) { patch({ items: quote.items.map((item) => item.id === id ? { ...item, ...patchValue } : item) }); }
  function addItem() { patch({ items: [...quote.items, { id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }] }); }
  const total = quoteTotal(quote);
  return <div className={styles.builderLayout}><section className={styles.builderForm}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>{quote.id} · versão {quote.version ?? 1}</span><h2>Monte a proposta</h2><p>Os campos atualizam a prévia imediatamente.</p></div><button type="button" className={styles.secondaryButton} onClick={onCancel}>Descartar e sair</button></div><div className={styles.formGrid}><label className={styles.fieldLabel}><span>Cliente</span><input required value={quote.client} onChange={(event) => patch({ client: event.target.value })} /></label><label className={styles.fieldLabel}><span>Validade</span><input type="date" value={quote.validity} onChange={(event) => patch({ validity: event.target.value })} /></label></div><label className={styles.fieldLabel}><span>Título da proposta</span><input required value={quote.title} onChange={(event) => patch({ title: event.target.value })} /></label><div className={styles.builderItems}><div className={styles.sectionHeading}><div><h3>Itens da proposta</h3><p>Quantidade, descrição e valor unitário.</p></div><button type="button" onClick={addItem}><Icon name="plus" /> Adicionar</button></div>{quote.items.map((item, index) => <div className={styles.builderLineAdvanced} key={item.id}><span>{index + 1}</span><input value={item.description} onChange={(event) => patchItem(item.id, { description: event.target.value })} placeholder="Descrição" /><input type="number" min="1" value={item.quantity} onChange={(event) => patchItem(item.id, { quantity: Number(event.target.value) || 1 })} /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => patchItem(item.id, { unitPrice: Number(event.target.value) || 0 })} /><button type="button" className={styles.iconButton} aria-label={`Remover item ${index + 1}`} disabled={quote.items.length === 1} onClick={() => patch({ items: quote.items.filter((line) => line.id !== item.id) })}><Icon name="trash" /></button></div>)}</div><label className={styles.fieldLabel}><span>Condições e observações</span><textarea value={quote.notes} onChange={(event) => patch({ notes: event.target.value })} /></label><div className={styles.totalBar}><span>Total da proposta</span><strong>{currency(total)}</strong></div><div className={styles.builderFooter}><button type="button" className={styles.secondaryButton} onClick={onCreateModel}>Salvar como modelo</button><button type="button" className={styles.secondaryButton} onClick={() => onSave(quote)}>Salvar rascunho</button><button type="button" className={styles.primaryButton} onClick={() => onGenerate(quote)}>Finalizar proposta</button></div></section><section className={styles.livePreview}><span>Prévia do cliente · versão {quote.version ?? 1}</span><div className={styles.miniPaper}><strong>Proposta comercial</strong><h3>{quote.client || "Cliente"}</h3><p>{quote.title || "Título da proposta"}</p>{quote.items.map((item) => <div key={item.id}><span>{item.description || "Novo item"}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}<footer><span>Total</span><strong>{currency(total)}</strong></footer></div></section></div>;
}

function quoteTotal(quote: Quote) { return quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); }
function formatDate(value: string) { if (!value) return "não definida"; return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)); }
function isExpired(value: string) { if (!value) return false; const end = new Date(`${value}T23:59:59`); return end.getTime() < Date.now(); }
