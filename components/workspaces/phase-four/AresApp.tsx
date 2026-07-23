"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { copyText, currency, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

 type QuoteStatus = "Rascunho" | "Pronto" | "Enviado" | "Visualizado" | "Alteração solicitada" | "Aprovado" | "Recusado" | "Expirado";
 type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number };
 type Quote = { id: string; client: string; title: string; status: QuoteStatus; validity: string; updated: string; notes: string; decisionNote?: string; items: QuoteItem[]; version: number; originId?: string; history: Array<{ text: string; date: string }> };
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
const finalQuoteStatuses: QuoteStatus[] = ["Alteração solicitada", "Aprovado", "Recusado", "Expirado"];

export function AresApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Propostas");
  const [quotes, setQuotes] = useLocalState<Quote[]>("crmplus.ares.quotes.v2", initialQuotes);
  const [models, setModels] = useLocalState<QuoteModel[]>("crmplus.ares.models.v2", initialModels);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "Todas">("Todas");
  const [scope, setScope] = useState<"Em andamento" | "Finalizadas">("Em andamento");
  const [sortMode, setSortMode] = useState<"Mais recentes" | "Cliente" | "Valor" | "Validade">("Mais recentes");
  const [clientQuery, setClientQuery] = useState("");
  const [clientSort, setClientSort] = useState<"Nome" | "Mais propostas">("Nome");
  const [modelQuery, setModelQuery] = useState("");
  const [modelSort, setModelSort] = useState<"Nome" | "Mais itens">("Nome");
  const [editing, setEditing] = useState<Quote | null>(null);
  const [modal, setModal] = useState<"transition" | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<QuoteStatus>("Enviado");
  const [decisionNote, setDecisionNote] = useState("");
  const [toast, setToast] = useState("");

  const selected = quotes.find((quote) => quote.id === selectedId);
  const nav: NavItem[] = [{ label: "Propostas", icon: "document" }, { label: "Criar proposta", icon: "plus" }, { label: "Clientes", icon: "people" }, { label: "Modelos", icon: "clipboard" }];
  const normalizedQuotes = useMemo(() => quotes.map((quote) => isExpired(quote.validity) && !["Aprovado", "Recusado"].includes(quote.status) ? { ...quote, status: "Expirado" as QuoteStatus } : quote), [quotes]);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const scoped = normalizedQuotes.filter((quote) => (scope === "Finalizadas" ? finalQuoteStatuses.includes(quote.status) : !finalQuoteStatuses.includes(quote.status)) && (statusFilter === "Todas" || quote.status === statusFilter) && (!value || `${quote.id} ${quote.client} ${quote.title}`.toLowerCase().includes(value)));
    return [...scoped].sort((a, b) => sortMode === "Cliente" ? a.client.localeCompare(b.client, "pt-BR") : sortMode === "Valor" ? quoteTotal(b) - quoteTotal(a) : sortMode === "Validade" ? a.validity.localeCompare(b.validity) : normalizedQuotes.indexOf(a) - normalizedQuotes.indexOf(b));
  }, [normalizedQuotes, query, scope, sortMode, statusFilter]);
  const clientRows = useMemo(() => Array.from(new Set(quotes.map((quote) => quote.client).filter(Boolean))).map((client) => ({ client, quotes: quotes.filter((quote) => quote.client === client) })).filter((item) => item.client.toLowerCase().includes(clientQuery.trim().toLowerCase())).sort((a, b) => clientSort === "Mais propostas" ? b.quotes.length - a.quotes.length : a.client.localeCompare(b.client, "pt-BR")), [clientQuery, clientSort, quotes]);
  const visibleModels = useMemo(() => [...models.filter((model) => `${model.name} ${model.title}`.toLowerCase().includes(modelQuery.trim().toLowerCase()))].sort((a, b) => modelSort === "Mais itens" ? b.items.length - a.items.length : a.name.localeCompare(b.name, "pt-BR")), [modelQuery, modelSort, models]);

  function blankQuote(model?: QuoteModel): Quote {
    return { id: uid("ORC"), client: "", title: model?.title ?? "", status: "Rascunho", validity: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), updated: "agora", notes: model?.notes ?? "", decisionNote: "", version: 1, history: [{ text: "Rascunho criado", date: todayLabel() }], items: model ? model.items.map((item) => ({ id: uid("ITEM"), description: item.description, quantity: 1, unitPrice: item.unitPrice })) : [{ id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }] };
  }

  function newQuote(model?: QuoteModel) { setEditing(blankQuote(model)); setSelectedId(""); setScope("Em andamento"); setActive("Criar proposta"); }

  function editSelected() {
    if (!selected) return;
    if (!["Rascunho", "Pronto"].includes(selected.status)) { createVersion(); setToast("A versão enviada foi preservada; edite a nova versão"); return; }
    setEditing(structuredClone(selected));
    setActive("Criar proposta");
  }

  function createVersion() {
    if (!selected) return;
    const originId = selected.originId ?? selected.id;
    const versions = quotes.filter((quote) => (quote.originId ?? quote.id) === originId);
    const version = Math.max(...versions.map((quote) => quote.version), selected.version) + 1;
    setEditing({ ...structuredClone(selected), id: uid("ORC"), originId, version, status: "Rascunho", decisionNote: "", updated: "agora", items: selected.items.map((item) => ({ ...item, id: uid("ITEM") })), history: [{ text: `Versão ${version} criada a partir de ${selected.id}`, date: todayLabel() }] });
    setSelectedId("");
    setActive("Criar proposta");
    setToast(`Versão ${version} criada sem alterar a anterior`);
  }

  function validateQuote(quote: Quote, finalize: boolean) {
    if (!quote.client.trim() || !quote.title.trim()) return "Informe o cliente e o título da proposta";
    if (!quote.items.length || quote.items.some((item) => !item.description.trim())) return "Revise os itens antes de continuar";
    if (quote.items.some((item) => item.quantity <= 0 || item.unitPrice < 0)) return "Revise quantidade e valores";
    if (finalize && !quote.validity) return "Informe a validade da proposta";
    return "";
  }

  function saveQuote(quote: Quote, finalize = false) {
    const error = validateQuote(quote, finalize);
    if (error) { setToast(error); return; }
    const nextStatus: QuoteStatus = finalize ? "Pronto" : quote.status === "Expirado" ? "Rascunho" : quote.status;
    const normalized: Quote = { ...quote, client: quote.client.trim(), title: quote.title.trim(), notes: quote.notes.trim(), updated: "agora", status: nextStatus, history: [{ text: finalize ? "Proposta revisada e pronta para envio" : "Rascunho salvo", date: todayLabel() }, ...quote.history] };
    setQuotes((current) => current.some((item) => item.id === normalized.id) ? current.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...current]);
    setSelectedId(normalized.id);
    setScope(finalQuoteStatuses.includes(normalized.status) ? "Finalizadas" : "Em andamento");
    setEditing(null);
    setActive("Propostas");
    setToast(finalize ? "Proposta pronta para envio" : "Rascunho salvo");
  }

  function cancelEditing() {
    if (editing && (editing.client || editing.title || editing.items.some((item) => item.description)) && !window.confirm("Descartar as alterações desta proposta?")) return;
    setEditing(null); setActive("Propostas"); setSelectedId("");
  }

  function allowedTargets(quote: Quote): QuoteStatus[] {
    if (quote.status === "Rascunho") return ["Pronto"];
    if (quote.status === "Pronto") return ["Enviado"];
    if (quote.status === "Enviado") return ["Visualizado", "Alteração solicitada", "Aprovado", "Recusado", "Expirado"];
    if (quote.status === "Visualizado") return ["Alteração solicitada", "Aprovado", "Recusado", "Expirado"];
    return [];
  }

  function openTransition() {
    if (!selected) return;
    const options = allowedTargets(selected);
    if (!options.length) { setToast("Crie uma nova versão para continuar este processo"); return; }
    setTransitionTarget(options[0]); setDecisionNote(""); setModal("transition");
  }

  function confirmTransition() {
    if (!selected) return;
    if (transitionTarget === "Pronto") {
      const error = validateQuote(selected, true);
      if (error) { setModal(null); setToast(error); return; }
    }
    if (["Alteração solicitada", "Recusado"].includes(transitionTarget) && !decisionNote.trim()) { setToast("Registre o motivo antes de confirmar"); return; }
    const previous = selected.status;
    setQuotes((current) => current.map((quote) => quote.id === selected.id ? { ...quote, status: transitionTarget, decisionNote: decisionNote.trim(), updated: "agora", history: [{ text: decisionNote.trim() ? `${previous} → ${transitionTarget}: ${decisionNote.trim()}` : `${previous} → ${transitionTarget}`, date: todayLabel() }, ...quote.history] } : quote));
    setModal(null); setToast(`Etapa atualizada para ${transitionTarget}`);
  }

  async function shareQuote() {
    if (!selected) return;
    await copyText(`Proposta ${selected.id} · versão ${selected.version}\n${selected.title}\nCliente: ${selected.client}\nTotal: ${currency(quoteTotal(selected))}\nValidade: ${formatDate(selected.validity)}\nEtapa atual: ${selected.status}`);
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
    setModels((current) => current.filter((item) => item.id !== model.id)); setToast("Modelo removido");
  }

  function changeArea(value: string) {
    if (active === "Criar proposta" && editing && value !== "Criar proposta") { setToast("Salve ou descarte a proposta antes de sair"); return; }
    setActive(value); setSelectedId("");
    if (value === "Criar proposta" && !editing) setEditing(blankQuote());
  }

  const headerAction = active !== "Criar proposta" && active !== "Modelos" ? <button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Nova proposta</button> : active === "Modelos" ? <button className={styles.primaryButton} onClick={() => newQuote()}><Icon name="plus" /> Criar proposta</button> : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={changeArea} title={active} subtitle="Uma etapa por vez: preparar, enviar e registrar a decisão do cliente." action={headerAction}>
    {active === "Propostas" ? <div className={styles.masterDetail}>
      <section className={styles.listPane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente, proposta ou código" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as QuoteStatus | "Todas"); setSelectedId(""); }}><option>Todas</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select><select className={styles.compactSelect} value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)}><option>Mais recentes</option><option>Cliente</option><option>Valor</option><option>Validade</option></select></div><div className={styles.segmented}><button className={scope === "Em andamento" ? styles.segmentActive : ""} onClick={() => { setScope("Em andamento"); setStatusFilter("Todas"); setSelectedId(""); }}>Em andamento <span>{normalizedQuotes.filter((quote) => !finalQuoteStatuses.includes(quote.status)).length}</span></button><button className={scope === "Finalizadas" ? styles.segmentActive : ""} onClick={() => { setScope("Finalizadas"); setStatusFilter("Todas"); setSelectedId(""); }}>Finalizadas <span>{normalizedQuotes.filter((quote) => finalQuoteStatuses.includes(quote.status)).length}</span></button></div><div className={styles.recordList}>{filtered.map((quote) => <button key={quote.id} className={`${styles.recordRow} ${selected?.id === quote.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(quote.id)}><div className={styles.recordAvatar}><Icon name="document" /></div><div className={styles.recordMain}><div><strong>{quote.client || "Cliente não informado"}</strong><span>{quote.id} · v{quote.version}</span></div><p>{quote.title || "Sem título"} · próxima ação: {nextAction(quote)}</p></div><div className={styles.recordMeta}><StatusPill status={quote.status} /><small>{quote.updated}</small></div></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma proposta encontrada" description="Altere os filtros ou crie uma nova proposta." /> : null}</div></section>
      {selected ? <section className={styles.documentPane}><div className={styles.documentToolbar}><div><StatusPill status={selected.status} /><span>Etapa atual · versão {selected.version}</span></div><div><button className={styles.secondaryButton} onClick={shareQuote}><Icon name="message" /> Copiar resumo</button>{["Rascunho", "Pronto"].includes(selected.status) ? <button className={styles.secondaryButton} onClick={editSelected}><Icon name="edit" /> Editar</button> : <button className={styles.secondaryButton} onClick={createVersion}><Icon name="plus" /> Nova versão</button>}{allowedTargets(selected).length ? <button className={styles.primaryButton} onClick={openTransition}>{primaryAction(selected)}</button> : null}</div></div><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Trabalho desta etapa</h3><p>{stageGuidance(selected)}</p></div></div><div className={styles.summaryGrid}><div><span>Cliente</span><strong>{selected.client}</strong></div><div><span>Validade</span><strong>{formatDate(selected.validity)}</strong></div><div><span>Total</span><strong>{currency(quoteTotal(selected))}</strong></div><div><span>Próxima ação</span><strong>{nextAction(selected)}</strong></div></div>{selected.decisionNote ? <div className={styles.noteBox}><strong>Decisão registrada:</strong> {selected.decisionNote}</div> : null}</section><details><summary>Ver proposta e condições</summary><article className={styles.paper}><header><div className={styles.paperBrand}>A</div><div><strong>ARES PROPOSTAS</strong><span>{selected.id} · VERSÃO {selected.version}</span></div></header><div className={styles.paperIntro}><span>PROPOSTA PARA</span><h2>{selected.client}</h2><p>{selected.title}</p></div><div className={styles.paperLines}>{selected.items.map((item) => <div key={item.id}><span>{item.quantity}× {item.description}</span><b>{currency(item.quantity * item.unitPrice)}</b></div>)}</div><div className={styles.paperTotal}><span>Valor total</span><strong>{currency(quoteTotal(selected))}</strong></div><div className={styles.paperTerms}><h3>Condições</h3><p>{selected.notes || "Sem condições adicionais."}</p></div></article></details><details><summary>Histórico desta versão</summary><Timeline items={selected.history} /></details></section> : <EmptyState icon="document" title="Nenhuma proposta selecionada" description="Escolha uma proposta para visualizar somente a etapa atual." />}
    </div> : null}

    {active === "Criar proposta" && editing ? <QuoteBuilder quote={editing} onChange={setEditing} onSave={(quote) => saveQuote(quote, false)} onGenerate={(quote) => saveQuote(quote, true)} onCreateModel={addModel} onCancel={cancelEditing} /> : null}
    {active === "Clientes" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Clientes</span><h2>Histórico de propostas</h2><p>Selecione um cliente para abrir sua versão mais recente.</p></div></div><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} placeholder="Buscar cliente" /></label><select className={styles.compactSelect} value={clientSort} onChange={(event) => setClientSort(event.target.value as typeof clientSort)}><option>Nome</option><option>Mais propostas</option></select></div><div className={styles.directoryRows}>{clientRows.map(({ client, quotes: clientQuotes }) => <button key={client} onClick={() => { const quote = clientQuotes[0]; if (quote) { setSelectedId(quote.id); setScope(finalQuoteStatuses.includes(quote.status) ? "Finalizadas" : "Em andamento"); setActive("Propostas"); } }}><span className={styles.companyAvatar}>{client.slice(0, 2).toUpperCase()}</span><div><strong>{client}</strong><small>{clientQuotes.length} versão(ões)</small></div><Icon name="chevron" /></button>)}{!clientRows.length ? <EmptyState icon="search" title="Nenhum cliente encontrado" description="Altere a busca ou a classificação." /> : null}</div></section> : null}
    {active === "Modelos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Modelos</span><h2>Comece com uma estrutura pronta</h2></div></div><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} placeholder="Buscar modelo" /></label><select className={styles.compactSelect} value={modelSort} onChange={(event) => setModelSort(event.target.value as typeof modelSort)}><option>Nome</option><option>Mais itens</option></select></div><div className={styles.templateGrid}>{visibleModels.map((model) => <article key={model.id}><div className={styles.templateIcon}><Icon name="document" /></div><h3>{model.name}</h3><p>{model.items.length} itens</p><div><button className={styles.secondaryButton} onClick={() => newQuote(model)}>Usar modelo</button><button className={styles.iconButton} aria-label={`Remover modelo ${model.name}`} onClick={() => removeModel(model)}><Icon name="trash" /></button></div></article>)}{!visibleModels.length ? <EmptyState icon="search" title="Nenhum modelo encontrado" description="Altere a busca ou a classificação." /> : null}</div></section> : null}

    <Modal open={modal === "transition"} title="Confirmar mudança de etapa" description={selected ? `${selected.id} · ${selected.client}` : undefined} onClose={() => setModal(null)}>{selected ? <><Field label="Próxima etapa"><select value={transitionTarget} onChange={(event) => setTransitionTarget(event.target.value as QuoteStatus)}>{allowedTargets(selected).map((status) => <option key={status}>{status}</option>)}</select></Field>{["Alteração solicitada", "Recusado"].includes(transitionTarget) ? <Field label="Motivo ou alteração solicitada"><textarea required value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} /></Field> : null}<div className={styles.noteBox}><strong>{selected.status}</strong> → <strong>{transitionTarget}</strong><br />{transitionConsequence(transitionTarget)}</div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmTransition}>Confirmar mudança</button></div></> : null}</Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function QuoteBuilder({ quote, onChange, onSave, onGenerate, onCreateModel, onCancel }: { quote: Quote; onChange: (quote: Quote) => void; onSave: (quote: Quote) => void; onGenerate: (quote: Quote) => void; onCreateModel: () => void; onCancel: () => void }) {
  function patch(value: Partial<Quote>) { onChange({ ...quote, ...value }); }
  function patchItem(id: string, value: Partial<QuoteItem>) { patch({ items: quote.items.map((item) => item.id === id ? { ...item, ...value } : item) }); }
  const total = quoteTotal(quote);
  return <div className={styles.builderLayout}><section className={styles.builderForm}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>{quote.id} · versão {quote.version}</span><h2>Monte a proposta</h2><p>Preencha o necessário para concluir esta etapa.</p></div><button type="button" className={styles.secondaryButton} onClick={onCancel}>Descartar e sair</button></div><div className={styles.formGrid}><label className={styles.fieldLabel}><span>Cliente</span><input required value={quote.client} onChange={(event) => patch({ client: event.target.value })} /></label><label className={styles.fieldLabel}><span>Validade</span><input type="date" value={quote.validity} onChange={(event) => patch({ validity: event.target.value })} /></label></div><label className={styles.fieldLabel}><span>Título da proposta</span><input required value={quote.title} onChange={(event) => patch({ title: event.target.value })} /></label><div className={styles.builderItems}><div className={styles.sectionHeading}><div><h3>Itens</h3></div><button type="button" onClick={() => patch({ items: [...quote.items, { id: uid("ITEM"), description: "", quantity: 1, unitPrice: 0 }] })}><Icon name="plus" /> Adicionar</button></div>{quote.items.map((item, index) => <div className={styles.builderLineAdvanced} key={item.id}><span>{index + 1}</span><input value={item.description} onChange={(event) => patchItem(item.id, { description: event.target.value })} placeholder="Descrição" /><input type="number" min="1" value={item.quantity} onChange={(event) => patchItem(item.id, { quantity: Number(event.target.value) || 1 })} /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => patchItem(item.id, { unitPrice: Number(event.target.value) || 0 })} /><button type="button" className={styles.iconButton} aria-label={`Remover item ${index + 1}`} disabled={quote.items.length === 1} onClick={() => patch({ items: quote.items.filter((line) => line.id !== item.id) })}><Icon name="trash" /></button></div>)}</div><label className={styles.fieldLabel}><span>Condições e observações</span><textarea value={quote.notes} onChange={(event) => patch({ notes: event.target.value })} /></label><div className={styles.totalBar}><span>Total</span><strong>{currency(total)}</strong></div><div className={styles.builderFooter}><button type="button" className={styles.secondaryButton} onClick={onCreateModel}>Salvar como modelo</button><button type="button" className={styles.secondaryButton} onClick={() => onSave(quote)}>Salvar rascunho</button><button type="button" className={styles.primaryButton} onClick={() => onGenerate(quote)}>Concluir preparação</button></div></section></div>;
}

function quoteTotal(quote: Quote) { return quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); }
function formatDate(value: string) { if (!value) return "não definida"; return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)); }
function isExpired(value: string) { if (!value) return false; return new Date(`${value}T23:59:59`).getTime() < Date.now(); }
function nextAction(quote: Quote) { if (quote.status === "Rascunho") return "Concluir preparação"; if (quote.status === "Pronto") return "Confirmar envio"; if (quote.status === "Enviado") return "Registrar visualização ou decisão"; if (quote.status === "Visualizado") return "Registrar decisão do cliente"; if (quote.status === "Alteração solicitada") return "Criar nova versão"; if (quote.status === "Aprovado") return "Consultar aprovação"; if (quote.status === "Recusado") return "Criar nova versão quando necessário"; return "Criar nova versão"; }
function primaryAction(quote: Quote) { if (quote.status === "Rascunho") return "Concluir preparação"; if (quote.status === "Pronto") return "Confirmar envio"; return "Registrar próxima etapa"; }
function stageGuidance(quote: Quote) { if (quote.status === "Rascunho") return "Revise cliente, escopo, valores e validade antes de concluir."; if (quote.status === "Pronto") return "A proposta está pronta. Confirme somente quando ela realmente for enviada."; if (["Enviado", "Visualizado"].includes(quote.status)) return "Registre apenas o que o cliente realmente fez ou decidiu."; return "Esta versão está encerrada. O histórico permanece preservado."; }
function transitionConsequence(status: QuoteStatus) { if (status === "Pronto") return "A proposta ficará bloqueada para revisão final antes do envio."; if (status === "Enviado") return "O sistema registrará que esta versão foi enviada ao cliente."; if (status === "Visualizado") return "O sistema registrará que o cliente visualizou esta versão."; if (status === "Aprovado") return "A versão será encerrada como aprovada."; if (status === "Recusado") return "A versão será encerrada como recusada e o motivo ficará no histórico."; if (status === "Alteração solicitada") return "A versão será preservada e uma nova versão poderá ser criada."; return "A versão ficará marcada como expirada."; }
