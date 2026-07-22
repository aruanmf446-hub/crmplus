"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { copyText, currency, fileToDataUrl, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type WorkStatus = "Avaliação" | "Aguardando aprovação" | "Em serviço" | "Pronto" | "Entregue";
type ServiceLine = { id: string; description: string; value: number; kind: "Serviço" | "Peça" };
type WorkOrder = {
  id: string; vehicle: string; plate: string; client: string; phone: string; status: WorkStatus; issue: string;
  diagnosis: string; technician: string; updated: string; priority: boolean; services: ServiceLine[]; photos: string[];
  history: Array<{ text: string; date: string }>;
};
type Appointment = { id: string; time: string; client: string; vehicle: string; type: string };

const initialOrders: WorkOrder[] = [
  { id: "OS-1052", vehicle: "Volkswagen Nivus", plate: "SFK2C10", client: "Renato Lima", phone: "5594999991001", status: "Avaliação", issue: "Luz da injeção acesa", diagnosis: "", technician: "Sem técnico", updated: "há 28 min", priority: false, services: [], photos: [], history: [{ text: "Veículo recebido e quilometragem registrada", date: "Hoje, 08:12" }] },
  { id: "OS-1051", vehicle: "Volkswagen Saveiro", plate: "TCJ9I23", client: "Barros & Braga", phone: "5594999991002", status: "Aguardando aprovação", issue: "Ruído e desalinhamento traseiro", diagnosis: "Eixo traseiro com deformação e desalinhamento geométrico.", technician: "Marcos", updated: "há 2 h", priority: true, services: [{ id: "s1", description: "Substituição do eixo traseiro", value: 2850, kind: "Serviço" }, { id: "s2", description: "Componentes de fixação", value: 570, kind: "Peça" }], photos: [], history: [{ text: "Orçamento enviado ao cliente", date: "Hoje, 09:40" }, { text: "Diagnóstico registrado por Marcos", date: "Hoje, 09:10" }] },
  { id: "OS-1048", vehicle: "Fiat Strada", plate: "RQX7B44", client: "Construtora Norte", phone: "5594999991003", status: "Em serviço", issue: "Falha intermitente na partida", diagnosis: "Bateria com baixa capacidade de partida.", technician: "Carlos", updated: "há 12 min", priority: false, services: [{ id: "s3", description: "Teste do sistema de carga", value: 180, kind: "Serviço" }, { id: "s4", description: "Bateria 70 Ah", value: 800, kind: "Peça" }], photos: [], history: [{ text: "Serviço iniciado", date: "Hoje, 10:20" }] },
];
const initialAppointments: Appointment[] = [
  { id: "a1", time: "08:00", client: "Renato Lima", vehicle: "Volkswagen Nivus", type: "Diagnóstico" },
  { id: "a2", time: "11:00", client: "Marina Costa", vehicle: "Hyundai HB20", type: "Entrega" },
  { id: "a3", time: "14:00", client: "Fernanda Souza", vehicle: "Volkswagen T-Cross", type: "Revisão" },
];

export function AtlasApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Ordens de serviço");
  const [orders, setOrders] = useLocalState<WorkOrder[]>("crmplus.atlas.orders", initialOrders);
  const [appointments, setAppointments] = useLocalState<Appointment[]>("crmplus.atlas.appointments", initialAppointments);
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [listMode, setListMode] = useState<"Em andamento" | "Concluídas">("Em andamento");
  const [detailTab, setDetailTab] = useState("Resumo");
  const [modal, setModal] = useState<"new" | "editIssue" | "service" | "appointment" | null>(null);
  const [toast, setToast] = useState("");
  const [draft, setDraft] = useState({ client: "", phone: "", vehicle: "", plate: "", issue: "", technician: "Sem técnico" });
  const [serviceDraft, setServiceDraft] = useState({ description: "", value: "", kind: "Serviço" as ServiceLine["kind"] });
  const [appointmentDraft, setAppointmentDraft] = useState({ time: "09:00", client: "", vehicle: "", type: "Avaliação" });
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];
  const nav: NavItem[] = [{ label: "Ordens de serviço", icon: "clipboard" }, { label: "Agenda", icon: "calendar" }, { label: "Clientes", icon: "people" }, { label: "Veículos", icon: "car" }];

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return orders.filter((order) => {
      const closed = order.status === "Pronto" || order.status === "Entregue";
      const matchesMode = listMode === "Concluídas" ? closed : !closed;
      const matchesSearch = !value || `${order.id} ${order.vehicle} ${order.plate} ${order.client} ${order.issue}`.toLowerCase().includes(value);
      return matchesMode && matchesSearch;
    });
  }, [listMode, orders, query]);

  function updateSelected(patch: Partial<WorkOrder>, historyText?: string) {
    if (!selected) return;
    setOrders((current) => current.map((order) => order.id === selected.id ? { ...order, ...patch, updated: "agora", history: historyText ? [{ text: historyText, date: todayLabel() }, ...order.history] : order.history } : order));
  }

  function createOrder() {
    const next: WorkOrder = { id: uid("OS"), ...draft, status: "Avaliação", diagnosis: "", updated: "agora", priority: false, services: [], photos: [], history: [{ text: "Ordem de serviço criada", date: todayLabel() }] };
    setOrders((current) => [next, ...current]);
    setSelectedId(next.id);
    setDraft({ client: "", phone: "", vehicle: "", plate: "", issue: "", technician: "Sem técnico" });
    setModal(null); setActive("Ordens de serviço"); setToast("Ordem de serviço criada localmente");
  }

  function advance() {
    if (!selected) return;
    const flow: WorkStatus[] = ["Avaliação", "Aguardando aprovação", "Em serviço", "Pronto", "Entregue"];
    const next = flow[Math.min(flow.indexOf(selected.status) + 1, flow.length - 1)];
    updateSelected({ status: next }, `Situação alterada para ${next}`);
    setToast(`OS avançou para ${next}`);
  }

  function saveDiagnosis(value: string) { updateSelected({ diagnosis: value }, "Diagnóstico atualizado"); }
  function addService() {
    if (!selected || !serviceDraft.description.trim()) return;
    const line: ServiceLine = { id: uid("ITEM"), description: serviceDraft.description.trim(), value: Number(serviceDraft.value.replace(",", ".")) || 0, kind: serviceDraft.kind };
    updateSelected({ services: [...selected.services, line] }, `${line.kind} adicionada: ${line.description}`);
    setServiceDraft({ description: "", value: "", kind: "Serviço" }); setModal(null); setToast("Item adicionado ao orçamento");
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 4);
    const urls = await Promise.all(files.map(fileToDataUrl));
    updateSelected({ photos: [...selected.photos, ...urls] }, `${urls.length} evidência(s) adicionada(s)`);
    setToast("Fotos salvas neste navegador");
  }

  async function shareSummary() {
    if (!selected) return;
    const total = selected.services.reduce((sum, item) => sum + item.value, 0);
    await copyText(`Olá, ${selected.client}. Atualização da ${selected.id}: ${selected.vehicle} (${selected.plate}) está em ${selected.status}. Valor estimado: ${currency(total)}.`);
    setToast("Mensagem copiada para compartilhar");
  }

  function createAppointment() {
    const item: Appointment = { id: uid("AG"), ...appointmentDraft };
    setAppointments((current) => [...current, item].sort((a, b) => a.time.localeCompare(b.time)));
    setAppointmentDraft({ time: "09:00", client: "", vehicle: "", type: "Avaliação" }); setModal(null); setToast("Agendamento criado");
  }

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Atendimento, diagnóstico, orçamento e histórico em um único registro." action={<button className={styles.primaryButton} onClick={() => setModal("new")}><Icon name="plus" /> Nova OS</button>}>
    {active === "Ordens de serviço" ? <div className={styles.masterDetail}>
      <section className={styles.listPane}>
        <div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Placa, cliente, veículo ou OS" /></label></div>
        <div className={styles.segmented}><button className={listMode === "Em andamento" ? styles.segmentActive : ""} onClick={() => setListMode("Em andamento")}>Em andamento <span>{orders.filter((item) => !["Pronto", "Entregue"].includes(item.status)).length}</span></button><button className={listMode === "Concluídas" ? styles.segmentActive : ""} onClick={() => setListMode("Concluídas")}>Concluídas <span>{orders.filter((item) => ["Pronto", "Entregue"].includes(item.status)).length}</span></button></div>
        <div className={styles.recordList}>{filtered.map((order) => <button key={order.id} className={`${styles.recordRow} ${selected?.id === order.id ? styles.recordSelected : ""}`} onClick={() => { setSelectedId(order.id); setDetailTab("Resumo"); }}><div className={styles.recordAvatar}><Icon name="car" /></div><div className={styles.recordMain}><div><strong>{order.vehicle}</strong><span>{order.plate}</span></div><p>{order.client} · {order.issue}</p></div><div className={styles.recordMeta}><StatusPill status={order.status} /><small>{order.updated}</small></div></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma OS encontrada" description="Altere a busca ou crie uma nova ordem de serviço." /> : null}</div>
      </section>
      {selected ? <section className={styles.detailPane}>
        <div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.vehicle}</h2><p>{selected.plate} · {selected.client}</p></div><div className={styles.headerButtons}><button className={styles.secondaryButton} onClick={shareSummary}><Icon name="message" /> Copiar atualização</button><button className={styles.primaryButton} onClick={advance}>Avançar etapa</button></div></div>
        <div className={styles.detailTabs}>{["Resumo", "Diagnóstico", "Serviços e peças", "Fotos", "Histórico"].map((tab) => <button key={tab} className={detailTab === tab ? styles.tabActive : ""} onClick={() => setDetailTab(tab)}>{tab}</button>)}</div>
        <div className={styles.detailBody}>{detailTab === "Resumo" ? <><div className={styles.summaryGrid}><div><span>Situação atual</span><StatusPill status={selected.status} /></div><div><span>Responsável</span><strong>{selected.technician}</strong></div><div><span>Valor estimado</span><strong>{currency(selected.services.reduce((sum, item) => sum + item.value, 0))}</strong></div><div><span>Última atualização</span><strong>{selected.updated}</strong></div></div><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Defeito informado</h3><p>Relato registrado na abertura.</p></div><button onClick={() => { setDraft((current) => ({ ...current, issue: selected.issue })); setModal("editIssue"); }}>Editar</button></div><div className={styles.noteBox}>{selected.issue}</div></section><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Próxima ação</h3><p>Ação necessária para o atendimento continuar.</p></div></div><div className={styles.nextAction}><Icon name={selected.priority ? "warning" : "arrow"} /><div><strong>{selected.status === "Avaliação" ? "Registrar diagnóstico" : selected.status === "Aguardando aprovação" ? "Confirmar decisão do cliente" : selected.status === "Em serviço" ? "Atualizar serviços executados" : selected.status === "Pronto" ? "Agendar entrega" : "Atendimento encerrado"}</strong><span>{selected.priority ? "Atendimento marcado como prioritário" : "Sem alertas adicionais"}</span></div><button onClick={() => setDetailTab(selected.status === "Avaliação" ? "Diagnóstico" : "Serviços e peças")}>Abrir ação</button></div></section></> : null}
          {detailTab === "Diagnóstico" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Diagnóstico da oficina</h3><p>Conclusão técnica editável e salva automaticamente.</p></div></div><textarea className={styles.largeTextarea} value={selected.diagnosis} onChange={(event) => saveDiagnosis(event.target.value)} placeholder="Descreva testes, causas e conclusão" /><div className={styles.inlineFields}><label><span>Técnico responsável</span><select value={selected.technician} onChange={(event) => updateSelected({ technician: event.target.value }, `Responsável alterado para ${event.target.value}`)}><option>Sem técnico</option><option>Marcos</option><option>Carlos</option><option>Paulo</option></select></label><label className={styles.toggleRow}><input type="checkbox" checked={selected.priority} onChange={(event) => updateSelected({ priority: event.target.checked })} /><span><strong>Prioridade</strong><small>Destacar esta OS.</small></span></label></div></section> : null}
          {detailTab === "Serviços e peças" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Orçamento descritivo</h3><p>Peças são apenas descrições; não existe controle de estoque.</p></div><button onClick={() => setModal("service")}><Icon name="plus" /> Adicionar item</button></div><div className={styles.lineItems}>{selected.services.map((item) => <div key={item.id}><StatusPill status={item.kind} /><span>{item.description}</span><strong>{currency(item.value)}</strong><button onClick={() => updateSelected({ services: selected.services.filter((line) => line.id !== item.id) }, `${item.description} removido`)}><Icon name="trash" /></button></div>)}</div><div className={styles.totalBar}><span>Total estimado</span><strong>{currency(selected.services.reduce((sum, item) => sum + item.value, 0))}</strong></div></section> : null}
          {detailTab === "Fotos" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Fotos e evidências</h3><p>Arquivos comprimidos pelo navegador e mantidos localmente.</p></div><label className={styles.secondaryButton}><Icon name="plus" /> Adicionar fotos<input hidden type="file" accept="image/*" multiple onChange={addPhotos} /></label></div><div className={styles.photoGrid}>{selected.photos.map((photo, index) => <figure key={`${photo.slice(0, 24)}-${index}`}><img src={photo} alt={`Evidência ${index + 1}`} /><button onClick={() => updateSelected({ photos: selected.photos.filter((_, photoIndex) => photoIndex !== index) })}><Icon name="trash" /></button></figure>)}{!selected.photos.length ? <EmptyState icon="image" title="Nenhuma foto adicionada" description="Inclua imagens da entrada, defeito ou serviço concluído." /> : null}</div></section> : null}
          {detailTab === "Histórico" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Linha do tempo</h3><p>Todas as mudanças importantes desta OS.</p></div></div><Timeline items={selected.history} /></section> : null}
        </div>
      </section> : <EmptyState icon="clipboard" title="Selecione uma OS" description="Escolha um registro na lista." />}
    </div> : null}
    {active === "Agenda" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Agenda local</span><h2>Compromissos da oficina</h2><p>Recebimentos, retornos e entregas.</p></div><button className={styles.primaryButton} onClick={() => setModal("appointment")}><Icon name="plus" /> Agendar</button></div><div className={styles.scheduleList}>{appointments.map((item) => <div key={item.id} className={styles.scheduleRow}><strong>{item.time}</strong><div><span>{item.type}</span><h3>{item.client}</h3><p>{item.vehicle}</p></div><button onClick={() => setAppointments((current) => current.filter((entry) => entry.id !== item.id))}>Remover</button></div>)}</div></section> : null}
    {active === "Clientes" ? <DirectoryView title="Clientes da oficina" rows={Array.from(new Set(orders.map((order) => order.client)))} /> : null}
    {active === "Veículos" ? <DirectoryView title="Veículos cadastrados" rows={orders.map((order) => `${order.vehicle} · ${order.plate}`)} /> : null}

    <Modal open={modal === "new"} title="Nova ordem de serviço" description="Cadastre somente o necessário para iniciar." onClose={() => setModal(null)}><Form onSubmit={createOrder}><div className={styles.formGrid}><Field label="Cliente"><input required value={draft.client} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} /></Field><Field label="Telefone"><input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Veículo"><input required value={draft.vehicle} onChange={(event) => setDraft((current) => ({ ...current, vehicle: event.target.value }))} /></Field><Field label="Placa"><input required value={draft.plate} onChange={(event) => setDraft((current) => ({ ...current, plate: event.target.value.toUpperCase() }))} /></Field></div><Field label="Defeito informado"><textarea required value={draft.issue} onChange={(event) => setDraft((current) => ({ ...current, issue: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Criar OS</button></div></Form></Modal>
    <Modal open={modal === "editIssue"} title="Editar defeito informado" onClose={() => setModal(null)}><Form onSubmit={() => { updateSelected({ issue: draft.issue }, "Defeito informado atualizado"); setModal(null); setToast("Relato atualizado"); }}><Field label="Relato do cliente"><textarea value={draft.issue} onChange={(event) => setDraft((current) => ({ ...current, issue: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Salvar</button></div></Form></Modal>
    <Modal open={modal === "service"} title="Adicionar ao orçamento" description="Cadastre serviço ou peça apenas como descrição e valor." onClose={() => setModal(null)}><Form onSubmit={addService}><Field label="Tipo"><select value={serviceDraft.kind} onChange={(event) => setServiceDraft((current) => ({ ...current, kind: event.target.value as ServiceLine["kind"] }))}><option>Serviço</option><option>Peça</option></select></Field><Field label="Descrição"><input required value={serviceDraft.description} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} /></Field><Field label="Valor"><input inputMode="decimal" value={serviceDraft.value} onChange={(event) => setServiceDraft((current) => ({ ...current, value: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Adicionar</button></div></Form></Modal>
    <Modal open={modal === "appointment"} title="Novo agendamento" onClose={() => setModal(null)}><Form onSubmit={createAppointment}><div className={styles.formGrid}><Field label="Horário"><input type="time" value={appointmentDraft.time} onChange={(event) => setAppointmentDraft((current) => ({ ...current, time: event.target.value }))} /></Field><Field label="Tipo"><input value={appointmentDraft.type} onChange={(event) => setAppointmentDraft((current) => ({ ...current, type: event.target.value }))} /></Field><Field label="Cliente"><input required value={appointmentDraft.client} onChange={(event) => setAppointmentDraft((current) => ({ ...current, client: event.target.value }))} /></Field><Field label="Veículo"><input required value={appointmentDraft.vehicle} onChange={(event) => setAppointmentDraft((current) => ({ ...current, vehicle: event.target.value }))} /></Field></div><div className={styles.modalActions}><button className={styles.primaryButton}>Agendar</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function DirectoryView({ title, rows }: { title: string; rows: string[] }) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((row) => row.toLowerCase().includes(query.toLowerCase()));
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cadastros vinculados</span><h2>{title}</h2><p>Gerados a partir das ordens de serviço locais.</p></div></div><div className={styles.directoryToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar registro" /></label></div><div className={styles.directoryRows}>{filtered.map((row) => <button key={row}><span className={styles.companyAvatar}>{row.slice(0, 2).toUpperCase()}</span><div><strong>{row}</strong><small>Histórico disponível nas ordens de serviço</small></div><Icon name="chevron" /></button>)}</div></section>;
}
