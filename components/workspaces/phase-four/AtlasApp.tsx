"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { copyText, currency, fileToDataUrl, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";

type WorkStatus = "Avaliação" | "Aguardando aprovação" | "Aguardando peça" | "Em serviço" | "Em conferência" | "Pronto" | "Entregue";
type ApprovalStatus = "Pendente" | "Aprovado" | "Recusado";
type ServiceLine = { id: string; description: string; value: number; kind: "Serviço" | "Peça" };
type WorkOrder = {
  id: string;
  vehicle: string;
  plate: string;
  client: string;
  phone: string;
  status: WorkStatus;
  approval?: ApprovalStatus;
  issue: string;
  diagnosis: string;
  technician: string;
  updated: string;
  priority: boolean;
  odometer?: string;
  fuel?: string;
  intakeNotes?: string;
  expectedDelivery?: string;
  services: ServiceLine[];
  photos: string[];
  history: Array<{ text: string; date: string }>;
};
type Appointment = { id: string; time: string; client: string; vehicle: string; type: string; done?: boolean };
type PendingTransition = { status: WorkStatus; title: string; description: string; history: string; toast: string };

const initialOrders: WorkOrder[] = [
  { id: "OS-1052", vehicle: "Volkswagen Nivus", plate: "SFK2C10", client: "Renato Lima", phone: "5594999991001", status: "Avaliação", approval: "Pendente", issue: "Luz da injeção acesa", diagnosis: "", technician: "Sem técnico", updated: "há 28 min", priority: false, odometer: "30.480 km", fuel: "1/2", intakeNotes: "Sem avaria nova aparente. Triângulo e estepe conferidos.", expectedDelivery: "", services: [], photos: [], history: [{ text: "Veículo recebido; quilometragem e estado de entrada registrados", date: "Hoje, 08:12" }] },
  { id: "OS-1051", vehicle: "Volkswagen Saveiro", plate: "TCJ9I23", client: "Barros & Braga", phone: "5594999991002", status: "Aguardando aprovação", approval: "Pendente", issue: "Ruído e desalinhamento traseiro", diagnosis: "Eixo traseiro com deformação e desalinhamento geométrico.", technician: "Marcos", updated: "há 2 h", priority: true, odometer: "72.260 km", fuel: "1/4", intakeNotes: "Risco no para-choque traseiro já informado ao condutor.", expectedDelivery: "25/07 · tarde", services: [{ id: "s1", description: "Substituição do eixo traseiro", value: 2850, kind: "Serviço" }, { id: "s2", description: "Componentes de fixação", value: 570, kind: "Peça" }], photos: [], history: [{ text: "Orçamento enviado ao cliente", date: "Hoje, 09:40" }, { text: "Diagnóstico registrado por Marcos", date: "Hoje, 09:10" }] },
  { id: "OS-1048", vehicle: "Fiat Strada", plate: "RQX7B44", client: "Construtora Norte", phone: "5594999991003", status: "Em serviço", approval: "Aprovado", issue: "Falha intermitente na partida", diagnosis: "Bateria com baixa capacidade de partida.", technician: "Carlos", updated: "há 12 min", priority: false, odometer: "61.340 km", fuel: "3/4", intakeNotes: "Ferramentas na carroceria registradas em foto.", expectedDelivery: "Hoje · 17:00", services: [{ id: "s3", description: "Teste do sistema de carga", value: 180, kind: "Serviço" }, { id: "s4", description: "Bateria 70 Ah", value: 800, kind: "Peça" }], photos: [], history: [{ text: "Serviço iniciado", date: "Hoje, 10:20" }] },
];

const initialAppointments: Appointment[] = [
  { id: "a1", time: "08:00", client: "Renato Lima", vehicle: "Volkswagen Nivus", type: "Recebimento" },
  { id: "a2", time: "11:00", client: "Marina Costa", vehicle: "Hyundai HB20", type: "Entrega" },
  { id: "a3", time: "14:00", client: "Fernanda Souza", vehicle: "Volkswagen T-Cross", type: "Revisão" },
];

export function AtlasApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Ordens de serviço");
  const [orders, setOrders] = useLocalState<WorkOrder[]>("crmplus.atlas.orders", initialOrders);
  const [appointments, setAppointments] = useLocalState<Appointment[]>("crmplus.atlas.appointments", initialAppointments);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [listMode, setListMode] = useState<"Em andamento" | "Concluídas">("Em andamento");
  const [modal, setModal] = useState<"new" | "editIssue" | "service" | "appointment" | "approval" | "advance" | null>(null);
  const [toast, setToast] = useState("");
  const [draft, setDraft] = useState({ client: "", phone: "", vehicle: "", plate: "", issue: "", technician: "Sem técnico", odometer: "", fuel: "", intakeNotes: "" });
  const [serviceDraft, setServiceDraft] = useState({ description: "", value: "", kind: "Serviço" as ServiceLine["kind"] });
  const [appointmentDraft, setAppointmentDraft] = useState({ time: "09:00", client: "", vehicle: "", type: "Recebimento" });
  const [approvalNote, setApprovalNote] = useState("");
  const [pendingTransition, setPendingTransition] = useState<PendingTransition | null>(null);

  const selected = orders.find((order) => order.id === selectedId);
  const nav: NavItem[] = [
    { label: "Ordens de serviço", icon: "clipboard" },
    { label: "Agenda", icon: "calendar" },
    { label: "Clientes", icon: "people" },
    { label: "Veículos", icon: "car" },
  ];

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return orders.filter((order) => {
      const concluded = order.status === "Entregue";
      return (listMode === "Concluídas" ? concluded : !concluded) && (!value || `${order.id} ${order.vehicle} ${order.plate} ${order.client} ${order.issue}`.toLowerCase().includes(value));
    });
  }, [listMode, orders, query]);

  const customerRows = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; lastOrderId: string }>();
    orders.forEach((order) => {
      const current = map.get(order.client);
      map.set(order.client, { name: order.client, phone: order.phone || "Telefone não informado", count: (current?.count ?? 0) + 1, lastOrderId: order.id });
    });
    return Array.from(map.values());
  }, [orders]);

  const vehicleRows = useMemo(() => {
    const map = new Map<string, { label: string; plate: string; count: number; lastOrderId: string }>();
    orders.forEach((order) => {
      const current = map.get(order.plate);
      map.set(order.plate, { label: order.vehicle, plate: order.plate, count: (current?.count ?? 0) + 1, lastOrderId: order.id });
    });
    return Array.from(map.values());
  }, [orders]);

  function updateSelected(patch: Partial<WorkOrder>, historyText?: string) {
    if (!selected) return;
    setOrders((current) => current.map((order) => order.id === selected.id ? { ...order, ...patch, updated: "agora", history: historyText ? [{ text: historyText, date: todayLabel() }, ...order.history] : order.history } : order));
  }

  function createOrder() {
    const plate = draft.plate.trim().toUpperCase();
    if (!draft.client.trim() || !draft.vehicle.trim() || !plate || !draft.issue.trim()) { setToast("Preencha cliente, veículo, placa e relato do cliente"); return; }
    const next: WorkOrder = { id: uid("OS"), client: draft.client.trim(), phone: draft.phone.trim(), vehicle: draft.vehicle.trim(), plate, issue: draft.issue.trim(), technician: draft.technician, odometer: draft.odometer.trim(), fuel: draft.fuel.trim(), intakeNotes: draft.intakeNotes.trim(), expectedDelivery: "", status: "Avaliação", approval: "Pendente", diagnosis: "", updated: "agora", priority: false, services: [], photos: [], history: [{ text: "Veículo recebido e ordem de serviço criada", date: todayLabel() }] };
    setOrders((current) => [next, ...current]);
    setSelectedId(next.id);
    setDraft({ client: "", phone: "", vehicle: "", plate: "", issue: "", technician: "Sem técnico", odometer: "", fuel: "", intakeNotes: "" });
    setModal(null);
    setActive("Ordens de serviço");
    setListMode("Em andamento");
    setToast("Veículo recebido e OS criada");
  }

  function queueTransition(transition: PendingTransition) {
    setPendingTransition(transition);
    setModal("advance");
  }

  function requestAdvance() {
    if (!selected) return;
    if (selected.status === "Avaliação") {
      if (!selected.diagnosis.trim()) { setToast("Registre o diagnóstico antes de continuar"); return; }
      if (!selected.services.length) { setToast("Adicione ao menos um serviço ou peça ao orçamento"); return; }
      queueTransition({ status: "Aguardando aprovação", title: "Enviar para aprovação?", description: "A avaliação será encerrada e o orçamento ficará aguardando a decisão do cliente.", history: "Orçamento preparado e aguardando decisão do cliente", toast: "Orçamento aguardando decisão do cliente" });
      return;
    }
    if (selected.status === "Aguardando aprovação") { setApprovalNote(""); setModal("approval"); return; }
    if (selected.status === "Aguardando peça") {
      queueTransition({ status: "Em serviço", title: "Retomar o serviço?", description: "Confirme somente quando o item necessário estiver disponível e a equipe puder continuar a execução.", history: "Item necessário disponível; execução retomada", toast: "Execução retomada" });
      return;
    }
    if (selected.status === "Em serviço") {
      queueTransition({ status: "Em conferência", title: "Concluir a execução?", description: "A OS sairá da execução e ficará aguardando a conferência final do serviço.", history: "Execução concluída e encaminhada para conferência", toast: "Veículo encaminhado para conferência" });
      return;
    }
    if (selected.status === "Em conferência") {
      queueTransition({ status: "Pronto", title: "Liberar para entrega?", description: "Confirme que o serviço foi conferido e o veículo está realmente pronto para o cliente.", history: "Conferência final concluída; veículo pronto para entrega", toast: "Veículo pronto para entrega" });
      return;
    }
    if (selected.status === "Pronto") {
      queueTransition({ status: "Entregue", title: "Confirmar a entrega?", description: "Esta ação encerra o atendimento e move a OS para o histórico de entregues.", history: "Veículo entregue ao cliente", toast: "Atendimento concluído" });
      return;
    }
    setToast("Este atendimento já está concluído");
  }

  function confirmTransition() {
    if (!selected || !pendingTransition) return;
    updateSelected({ status: pendingTransition.status }, pendingTransition.history);
    if (pendingTransition.status === "Entregue") setListMode("Concluídas");
    setToast(pendingTransition.toast);
    setPendingTransition(null);
    setModal(null);
  }

  function requestWaitingPart() {
    if (!selected || selected.status !== "Em serviço") return;
    queueTransition({ status: "Aguardando peça", title: "Pausar aguardando peça?", description: "A execução ficará pausada até alguém confirmar que o item necessário está disponível.", history: "Execução pausada aguardando item necessário", toast: "OS marcada como aguardando peça" });
  }

  function registerApproval(decision: ApprovalStatus) {
    if (!selected) return;
    const note = approvalNote.trim();
    if (decision === "Aprovado") {
      updateSelected({ approval: "Aprovado", status: "Em serviço" }, note ? `Cliente aprovou o orçamento: ${note}` : "Cliente aprovou o orçamento");
      setToast("Orçamento aprovado e serviço liberado");
    } else {
      if (!note) { setToast("Registre o motivo ou a alteração solicitada pelo cliente"); return; }
      updateSelected({ approval: "Recusado" }, `Cliente recusou ou pediu alteração: ${note}`);
      setToast("Decisão registrada; revise o orçamento antes de solicitar nova aprovação");
    }
    setApprovalNote("");
    setModal(null);
  }

  function addService() {
    if (!selected || !serviceDraft.description.trim()) return;
    const value = Number(serviceDraft.value.replace(",", ".")) || 0;
    if (value < 0) { setToast("Informe um valor válido"); return; }
    const line: ServiceLine = { id: uid("ITEM"), description: serviceDraft.description.trim(), value, kind: serviceDraft.kind };
    updateSelected({ services: [...selected.services, line], approval: selected.status === "Aguardando aprovação" ? "Pendente" : selected.approval }, `${line.kind} adicionada: ${line.description}`);
    setServiceDraft({ description: "", value: "", kind: "Serviço" });
    setModal(null);
    setToast("Item adicionado ao orçamento");
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 4);
    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha imagens menores, com até 700 KB cada"); event.target.value = ""; return; }
    const urls = await Promise.all(files.map(fileToDataUrl));
    updateSelected({ photos: [...selected.photos, ...urls] }, `${urls.length} evidência(s) adicionada(s)`);
    setToast("Fotos adicionadas");
    event.target.value = "";
  }

  async function shareSummary() {
    if (!selected) return;
    const total = selected.services.reduce((sum, item) => sum + item.value, 0);
    const delivery = selected.expectedDelivery ? ` Previsão informada: ${selected.expectedDelivery}.` : "";
    await copyText(`Olá, ${selected.client}. Atualização da ${selected.id}: ${selected.vehicle} (${selected.plate}) está em ${selected.status}. Valor estimado: ${currency(total)}.${delivery}`);
    setToast("Atualização copiada para compartilhar");
  }

  function openAppointment(prefillSelected = false) {
    setAppointmentDraft(prefillSelected && selected ? { time: "09:00", client: selected.client, vehicle: `${selected.vehicle} · ${selected.plate}`, type: selected.status === "Pronto" ? "Entrega" : "Retorno" } : { time: "09:00", client: "", vehicle: "", type: "Recebimento" });
    setModal("appointment");
  }

  function createAppointment() {
    if (!appointmentDraft.client.trim() || !appointmentDraft.vehicle.trim()) { setToast("Informe cliente e veículo"); return; }
    const item: Appointment = { id: uid("AG"), ...appointmentDraft, client: appointmentDraft.client.trim(), vehicle: appointmentDraft.vehicle.trim(), done: false };
    setAppointments((current) => [...current, item].sort((a, b) => a.time.localeCompare(b.time)));
    setAppointmentDraft({ time: "09:00", client: "", vehicle: "", type: "Recebimento" });
    setModal(null);
    setToast("Agendamento criado");
  }

  function nextActionText(order: WorkOrder) {
    if (order.status === "Avaliação") return "Concluir diagnóstico e orçamento";
    if (order.status === "Aguardando aprovação") return order.approval === "Recusado" ? "Revisar o orçamento e registrar nova decisão" : "Registrar a decisão do cliente";
    if (order.status === "Aguardando peça") return "Confirmar a disponibilidade do item";
    if (order.status === "Em serviço") return "Finalizar a execução ou pausar por peça";
    if (order.status === "Em conferência") return "Conferir e liberar para entrega";
    if (order.status === "Pronto") return "Combinar e confirmar a entrega";
    return "Atendimento encerrado";
  }

  function actionLabel(order: WorkOrder) {
    if (order.status === "Avaliação") return "Enviar para aprovação";
    if (order.status === "Aguardando aprovação") return "Registrar decisão";
    if (order.status === "Aguardando peça") return "Retomar serviço";
    if (order.status === "Em serviço") return "Concluir execução";
    if (order.status === "Em conferência") return "Liberar para entrega";
    if (order.status === "Pronto") return "Confirmar entrega";
    return "Atendimento concluído";
  }

  function renderQuote() {
    if (!selected) return null;
    return <section className={styles.infoSection}>
      <div className={styles.sectionHeading}><div><h3>Orçamento atual</h3><p>Somente o escopo que será apresentado ao cliente.</p></div><button className={styles.primaryButton} onClick={() => setModal("service")}><Icon name="plus" /> Adicionar item</button></div>
      <div className={styles.lineItems}>{selected.services.map((item) => <div key={item.id}><StatusPill status={item.kind} /><span>{item.description}</span><strong>{currency(item.value)}</strong><button onClick={() => updateSelected({ services: selected.services.filter((line) => line.id !== item.id), approval: selected.status === "Aguardando aprovação" ? "Pendente" : selected.approval }, `${item.description} removido`)} aria-label={`Remover ${item.description}`}><Icon name="trash" /></button></div>)}</div>
      {!selected.services.length ? <EmptyState icon="document" title="Orçamento ainda vazio" description="Adicione o que será realizado e o valor estimado." /> : null}
      <div className={styles.totalBar}><span>Total estimado</span><strong>{currency(selected.services.reduce((sum, item) => sum + item.value, 0))}</strong></div>
    </section>;
  }

  function renderPhotos() {
    if (!selected) return null;
    return <section className={styles.infoSection}>
      <div className={styles.sectionHeading}><div><h3>Evidências desta etapa</h3><p>Adicione somente fotos que ajudam a comprovar o serviço.</p></div><label className={styles.secondaryButton}><Icon name="plus" /> Adicionar fotos<input hidden type="file" accept="image/*" multiple onChange={addPhotos} /></label></div>
      <div className={styles.photoGrid}>{selected.photos.map((photo, index) => <figure key={`${photo.slice(0, 24)}-${index}`}><img src={photo} alt={`Evidência ${index + 1}`} /><button onClick={() => updateSelected({ photos: selected.photos.filter((_, photoIndex) => photoIndex !== index) })} aria-label={`Remover evidência ${index + 1}`}><Icon name="trash" /></button></figure>)}</div>
      {!selected.photos.length ? <EmptyState icon="image" title="Nenhuma evidência adicionada" description="Fotos são opcionais, mas ajudam na conferência e na entrega." /> : null}
    </section>;
  }

  function renderCurrentStage() {
    if (!selected) return null;
    if (selected.status === "Avaliação") return <>
      <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Diagnóstico atual</h3><p>Preencha somente o necessário para preparar o orçamento.</p></div></div><textarea className={styles.largeTextarea} value={selected.diagnosis} onChange={(event) => updateSelected({ diagnosis: event.target.value })} placeholder="Causa encontrada e recomendação" /><div className={styles.inlineFields}><label><span>Técnico responsável</span><select value={selected.technician} onChange={(event) => updateSelected({ technician: event.target.value }, `Responsável alterado para ${event.target.value}`)}><option>Sem técnico</option><option>Marcos</option><option>Carlos</option><option>Paulo</option></select></label><label className={styles.toggleRow}><input type="checkbox" checked={selected.priority} onChange={(event) => updateSelected({ priority: event.target.checked })} /><span><strong>Prioridade</strong><small>Destacar esta OS.</small></span></label></div></section>
      {renderQuote()}
    </>;
    if (selected.status === "Aguardando aprovação") return <>
      <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Decisão do cliente</h3><p>O serviço não começa sem uma decisão registrada.</p></div></div><div className={styles.noteBox}><strong>Diagnóstico:</strong> {selected.diagnosis}</div>{selected.approval === "Recusado" ? <div className={styles.noteBox}>O cliente pediu alteração ou recusou esta versão. Revise os itens antes de registrar uma nova decisão.</div> : null}</section>
      {renderQuote()}
    </>;
    if (selected.status === "Aguardando peça") return <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Execução pausada</h3><p>Retome somente quando o item necessário estiver disponível.</p></div></div>{renderQuote()}</section>;
    if (selected.status === "Em serviço") return <>{renderQuote()}{renderPhotos()}</>;
    if (selected.status === "Em conferência") return <><section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Conferência final</h3><p>Revise o que foi executado antes de liberar o veículo.</p></div></div><div className={styles.summaryGrid}><div><span>Responsável</span><strong>{selected.technician}</strong></div><div><span>Itens executados</span><strong>{selected.services.length}</strong></div><div><span>Evidências</span><strong>{selected.photos.length}</strong></div><div><span>Total estimado</span><strong>{currency(selected.services.reduce((sum, item) => sum + item.value, 0))}</strong></div></div></section>{renderPhotos()}</>;
    if (selected.status === "Pronto") return <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Entrega ao cliente</h3><p>Combine a retirada e confirme somente quando o veículo for entregue.</p></div><button className={styles.secondaryButton} onClick={() => openAppointment(true)}><Icon name="calendar" /> Agendar entrega</button></div><Field label="Previsão informada"><input value={selected.expectedDelivery ?? ""} onChange={(event) => updateSelected({ expectedDelivery: event.target.value })} placeholder="Ex.: hoje às 17:00" /></Field></section>;
    return <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Atendimento concluído</h3><p>A OS permanece disponível somente para consulta.</p></div></div><div className={styles.summaryGrid}><div><span>Entregue</span><StatusPill status="Entregue" /></div><div><span>Cliente</span><strong>{selected.client}</strong></div><div><span>Veículo</span><strong>{selected.vehicle}</strong></div><div><span>Valor estimado</span><strong>{currency(selected.services.reduce((sum, item) => sum + item.value, 0))}</strong></div></div></section>;
  }

  const headerAction = active === "Ordens de serviço"
    ? <button className={styles.primaryButton} onClick={() => setModal("new")}><Icon name="plus" /> Receber veículo</button>
    : active === "Agenda"
      ? <button className={styles.primaryButton} onClick={() => openAppointment(false)}><Icon name="plus" /> Agendar</button>
      : undefined;

  return <AppShell product={product} nav={nav} active={active} onChange={(value) => { setActive(value); if (value !== "Ordens de serviço") setSelectedId(""); }} title={active} subtitle="Cada OS mostra somente o trabalho da etapa atual." action={headerAction}>
    {active === "Ordens de serviço" ? <div className={styles.masterDetail}>
      <section className={styles.listPane}>
        <div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Placa, cliente, veículo ou OS" /></label></div>
        <div className={styles.segmented}><button className={listMode === "Em andamento" ? styles.segmentActive : ""} onClick={() => { setListMode("Em andamento"); setSelectedId(""); }}>Em andamento <span>{orders.filter((item) => item.status !== "Entregue").length}</span></button><button className={listMode === "Concluídas" ? styles.segmentActive : ""} onClick={() => { setListMode("Concluídas"); setSelectedId(""); }}>Entregues <span>{orders.filter((item) => item.status === "Entregue").length}</span></button></div>
        <div className={styles.recordList}>{filtered.map((order) => <button key={order.id} className={`${styles.recordRow} ${selected?.id === order.id ? styles.recordSelected : ""}`} onClick={() => setSelectedId(order.id)}><div className={styles.recordAvatar}><Icon name="car" /></div><div className={styles.recordMain}><div><strong>{order.vehicle}</strong><span>{order.plate}</span></div><p>{order.client} · {nextActionText(order)}</p></div><div className={styles.recordMeta}><StatusPill status={order.status} /><small>{order.updated}</small></div></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhuma OS encontrada" description="Altere a busca ou receba um novo veículo." /> : null}</div>
      </section>
      {selected ? <section className={styles.detailPane}>
        <div className={styles.detailHeader}><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.vehicle}</h2><p>{selected.plate} · {selected.client}</p></div><div className={styles.headerButtons}><button className={styles.secondaryButton} onClick={shareSummary}><Icon name="message" /> Copiar atualização</button>{selected.status === "Em serviço" ? <button className={styles.secondaryButton} onClick={requestWaitingPart}>Aguardar peça</button> : null}<button className={styles.primaryButton} disabled={selected.status === "Entregue"} onClick={requestAdvance}>{actionLabel(selected)}</button></div></div>
        <div className={styles.detailBody}>
          <div className={styles.nextAction}><Icon name={selected.priority || selected.status === "Aguardando peça" ? "warning" : selected.status === "Pronto" ? "calendar" : "arrow"} /><div><span>Etapa atual</span><strong>{selected.status}</strong><small>{nextActionText(selected)}</small></div><StatusPill status={selected.status} /></div>
          {renderCurrentStage()}
          <details className={styles.infoSection}><summary>Dados do atendimento</summary><div className={styles.summaryGrid}><div><span>Quilometragem</span><strong>{selected.odometer || "Não informada"}</strong></div><div><span>Combustível</span><strong>{selected.fuel || "Não informado"}</strong></div><div><span>Telefone</span><strong>{selected.phone || "Não informado"}</strong></div><div><span>Previsão</span><strong>{selected.expectedDelivery || "Não informada"}</strong></div></div><div className={styles.noteBox}><strong>Relato do cliente:</strong> {selected.issue}</div><div className={styles.noteBox}><strong>Estado de entrada:</strong> {selected.intakeNotes || "Sem observações"}</div><button className={styles.secondaryButton} onClick={() => { setDraft((current) => ({ ...current, issue: selected.issue })); setModal("editIssue"); }}>Editar relato</button></details>
          <details className={styles.infoSection}><summary>Histórico da OS</summary><Timeline items={selected.history} /></details>
        </div>
      </section> : <section className={styles.detailPane}><EmptyState icon="clipboard" title="Nenhuma OS selecionada" description="Escolha um atendimento para visualizar somente a etapa atual." /></section>}
    </div> : null}

    {active === "Agenda" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Agenda</span><h2>Compromissos futuros</h2><p>Recebimentos, retornos e entregas. Veículos já recebidos ficam nas ordens de serviço.</p></div></div><div className={styles.scheduleList}>{appointments.map((item) => <div key={item.id} className={`${styles.scheduleRow} ${item.done ? styles.completedRow : ""}`}><strong>{item.time}</strong><div><span>{item.type}</span><h3>{item.client}</h3><p>{item.vehicle}</p></div>{item.done ? <StatusPill status="Concluído" /> : <button onClick={() => setAppointments((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: true } : entry))}>Concluir <Icon name="check" /></button>}<button className={styles.iconButton} aria-label={`Remover agendamento de ${item.client}`} onClick={() => setAppointments((current) => current.filter((entry) => entry.id !== item.id))}><Icon name="trash" /></button></div>)}{!appointments.length ? <EmptyState icon="calendar" title="Agenda vazia" description="Crie o primeiro compromisso futuro da oficina." /> : null}</div></section> : null}
    {active === "Clientes" ? <DirectoryView title="Clientes da oficina" description="Contatos e atendimentos já registrados." rows={customerRows.map((row) => ({ id: row.lastOrderId, title: row.name, subtitle: `${row.phone} · ${row.count} atendimento(s)` }))} onSelect={(id) => { setSelectedId(id); setActive("Ordens de serviço"); }} /> : null}
    {active === "Veículos" ? <DirectoryView title="Veículos cadastrados" description="Histórico de atendimento por veículo." rows={vehicleRows.map((row) => ({ id: row.lastOrderId, title: `${row.label} · ${row.plate}`, subtitle: `${row.count} atendimento(s) registrado(s)` }))} onSelect={(id) => { setSelectedId(id); setActive("Ordens de serviço"); }} /> : null}

    <Modal open={modal === "new"} title="Receber veículo" description="Comece com os dados que protegem a entrada e permitem iniciar a avaliação." onClose={() => setModal(null)}><Form onSubmit={createOrder}><div className={styles.formGrid}><Field label="Cliente"><input required value={draft.client} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} /></Field><Field label="Telefone"><input inputMode="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Veículo"><input required value={draft.vehicle} onChange={(event) => setDraft((current) => ({ ...current, vehicle: event.target.value }))} /></Field><Field label="Placa"><input required maxLength={7} value={draft.plate} onChange={(event) => setDraft((current) => ({ ...current, plate: event.target.value.toUpperCase() }))} /></Field><Field label="Quilometragem"><input value={draft.odometer} onChange={(event) => setDraft((current) => ({ ...current, odometer: event.target.value }))} placeholder="Ex.: 72.260 km" /></Field><Field label="Combustível"><input value={draft.fuel} onChange={(event) => setDraft((current) => ({ ...current, fuel: event.target.value }))} placeholder="Ex.: 1/2" /></Field></div><Field label="Relato do cliente"><textarea required value={draft.issue} onChange={(event) => setDraft((current) => ({ ...current, issue: event.target.value }))} /></Field><Field label="Estado de entrada" hint="Avarias visíveis, objetos deixados ou observações relevantes."><textarea value={draft.intakeNotes} onChange={(event) => setDraft((current) => ({ ...current, intakeNotes: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Receber e criar OS</button></div></Form></Modal>
    <Modal open={modal === "editIssue"} title="Editar relato do cliente" onClose={() => setModal(null)}><Form onSubmit={() => { updateSelected({ issue: draft.issue.trim() }, "Relato do cliente atualizado"); setModal(null); setToast("Relato atualizado"); }}><Field label="Relato"><textarea required value={draft.issue} onChange={(event) => setDraft((current) => ({ ...current, issue: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Salvar</button></div></Form></Modal>
    <Modal open={modal === "service"} title="Adicionar ao orçamento" description="Cadastre serviço ou peça apenas como descrição e valor estimado." onClose={() => setModal(null)}><Form onSubmit={addService}><Field label="Tipo"><select value={serviceDraft.kind} onChange={(event) => setServiceDraft((current) => ({ ...current, kind: event.target.value as ServiceLine["kind"] }))}><option>Serviço</option><option>Peça</option></select></Field><Field label="Descrição"><input required value={serviceDraft.description} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} /></Field><Field label="Valor estimado"><input inputMode="decimal" value={serviceDraft.value} onChange={(event) => setServiceDraft((current) => ({ ...current, value: event.target.value }))} /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Adicionar</button></div></Form></Modal>
    <Modal open={modal === "appointment"} title="Novo agendamento" onClose={() => setModal(null)}><Form onSubmit={createAppointment}><div className={styles.formGrid}><Field label="Horário"><input type="time" value={appointmentDraft.time} onChange={(event) => setAppointmentDraft((current) => ({ ...current, time: event.target.value }))} /></Field><Field label="Tipo"><select value={appointmentDraft.type} onChange={(event) => setAppointmentDraft((current) => ({ ...current, type: event.target.value }))}><option>Recebimento</option><option>Avaliação</option><option>Retorno</option><option>Entrega</option><option>Revisão</option></select></Field><Field label="Cliente"><input required value={appointmentDraft.client} onChange={(event) => setAppointmentDraft((current) => ({ ...current, client: event.target.value }))} /></Field><Field label="Veículo"><input required value={appointmentDraft.vehicle} onChange={(event) => setAppointmentDraft((current) => ({ ...current, vehicle: event.target.value }))} /></Field></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setModal(null)}>Cancelar</button><button className={styles.primaryButton}>Agendar</button></div></Form></Modal>
    <Modal open={modal === "approval"} title="Registrar decisão do cliente" description={selected ? `${selected.id} · ${selected.client}` : undefined} onClose={() => setModal(null)}><div className={styles.noteBox}>A aprovação libera o serviço. A recusa mantém a OS nesta etapa para revisão do orçamento.</div><Field label="Observação da decisão" hint="Obrigatória quando houver recusa ou pedido de alteração."><textarea value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} placeholder="O que o cliente decidiu ou pediu para mudar?" /></Field><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => registerApproval("Recusado")}>Registrar recusa</button><button type="button" className={styles.primaryButton} onClick={() => registerApproval("Aprovado")}>Confirmar aprovação</button></div></Modal>
    <Modal open={modal === "advance"} title={pendingTransition?.title ?? "Confirmar avanço"} description={selected ? `${selected.id} · ${selected.vehicle}` : undefined} onClose={() => { setPendingTransition(null); setModal(null); }}><div className={styles.noteBox}>{pendingTransition?.description}</div>{selected && pendingTransition ? <div className={styles.summaryGrid}><div><span>Situação atual</span><StatusPill status={selected.status} /></div><div><span>Nova situação</span><StatusPill status={pendingTransition.status} /></div></div> : null}<div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => { setPendingTransition(null); setModal(null); }}>Voltar</button><button type="button" className={styles.primaryButton} onClick={confirmTransition}>Confirmar mudança</button></div></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function DirectoryView({ title, description, rows, onSelect }: { title: string; description: string; rows: Array<{ id: string; title: string; subtitle: string }>; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((row) => `${row.title} ${row.subtitle}`.toLowerCase().includes(query.toLowerCase()));
  return <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Cadastros vinculados</span><h2>{title}</h2><p>{description}</p></div></div><div className={styles.directoryToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar registro" /></label></div><div className={styles.directoryRows}>{filtered.map((row) => <button key={`${row.id}-${row.title}`} onClick={() => onSelect(row.id)}><span className={styles.companyAvatar}>{row.title.slice(0, 2).toUpperCase()}</span><div><strong>{row.title}</strong><small>{row.subtitle}</small></div><Icon name="chevron" /></button>)}{!filtered.length ? <EmptyState icon="search" title="Nenhum registro encontrado" description="Altere a busca para encontrar outros registros." /> : null}</div></section>;
}
