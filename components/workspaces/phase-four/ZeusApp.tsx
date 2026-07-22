"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/apps";
import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Timeline, Toast, type NavItem } from "./shared";
import { currency, todayLabel, uid, useLocalState } from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";
import zeus from "./ZeusApp.module.css";

type VehicleStatus = "Disponível" | "Em uso" | "Manutenção" | "Inativo";
type DriverStatus = "Disponível" | "Em rota" | "Afastado";
type VehicleDocument = { id: string; type: string; expiry: string; note: string };
type MaintenanceRecord = { id: string; type: string; date: string; odometer: number; cost: number; note: string };
type FuelRecord = { id: string; date: string; liters: number; cost: number; odometer: number; station: string };
type Vehicle = {
  id: string; model: string; plate: string; year: number; status: VehicleStatus; driverId: string; odometer: number;
  nextMaintenanceKm: number; nextMaintenanceDate: string; location: string; documents: VehicleDocument[];
  maintenance: MaintenanceRecord[]; fuel: FuelRecord[]; history: Array<{ text: string; date: string }>;
};
type Driver = { id: string; name: string; phone: string; license: string; licenseExpiry: string; status: DriverStatus };

const initialDrivers: Driver[] = [
  { id: "MOT-01", name: "Carlos Henrique", phone: "(94) 99999-2101", license: "AB", licenseExpiry: "2027-03-18", status: "Em rota" },
  { id: "MOT-02", name: "Marcos Silva", phone: "(94) 99999-2102", license: "D", licenseExpiry: "2026-10-08", status: "Disponível" },
  { id: "MOT-03", name: "Rafael Souza", phone: "(94) 99999-2103", license: "B", licenseExpiry: "2026-08-12", status: "Disponível" },
];

const initialVehicles: Vehicle[] = [
  { id: "VEI-014", model: "Toyota Hilux 2.8", plate: "QVE4A21", year: 2023, status: "Em uso", driverId: "MOT-01", odometer: 48210, nextMaintenanceKm: 50000, nextMaintenanceDate: "2026-08-10", location: "Obra Norte · informado às 08:20", documents: [{ id: "DOC-1", type: "Licenciamento", expiry: "2027-01-31", note: "Documento anual" }], maintenance: [{ id: "MAN-1", type: "Troca de óleo e filtros", date: "2026-05-14", odometer: 40220, cost: 780, note: "Preventiva concluída" }], fuel: [{ id: "ABS-1", date: "2026-07-20", liters: 52, cost: 338, odometer: 48010, station: "Posto Centro" }], history: [{ text: "Quilometragem atualizada para 48.210 km", date: "Hoje, 08:20" }, { text: "Veículo atribuído a Carlos Henrique", date: "20 jul, 15:10" }] },
  { id: "VEI-013", model: "Volkswagen Saveiro", plate: "TCJ9I23", year: 2024, status: "Manutenção", driverId: "", odometer: 72260, nextMaintenanceKm: 72000, nextMaintenanceDate: "2026-07-19", location: "Oficina parceira", documents: [{ id: "DOC-2", type: "Seguro", expiry: "2026-08-02", note: "Renovação em análise" }], maintenance: [{ id: "MAN-2", type: "Correção do eixo traseiro", date: "2026-07-21", odometer: 72260, cost: 0, note: "Veículo aguardando orçamento" }], fuel: [], history: [{ text: "Veículo colocado em manutenção", date: "Ontem, 14:30" }, { text: "Desalinhamento traseiro registrado", date: "Ontem, 14:12" }] },
  { id: "VEI-012", model: "Fiat Strada Endurance", plate: "RQX7B44", year: 2022, status: "Disponível", driverId: "", odometer: 61340, nextMaintenanceKm: 65000, nextMaintenanceDate: "2026-09-12", location: "Pátio principal", documents: [{ id: "DOC-3", type: "Licenciamento", expiry: "2026-12-20", note: "Regular" }], maintenance: [], fuel: [{ id: "ABS-2", date: "2026-07-18", liters: 44, cost: 286, odometer: 61210, station: "Posto Avenida" }], history: [{ text: "Veículo devolvido ao pátio", date: "18 jul, 18:05" }] },
];

export function ZeusApp({ product }: { product: Product }) {
  const [active, setActive] = useState("Frota");
  const [vehicles, setVehicles] = useLocalState<Vehicle[]>("crmplus.zeus.vehicles", initialVehicles);
  const [drivers, setDrivers] = useLocalState<Driver[]>("crmplus.zeus.drivers", initialDrivers);
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "Todos">("Todos");
  const [detailTab, setDetailTab] = useState("Resumo");
  const [modal, setModal] = useState<"vehicle" | "maintenance" | "driver" | "document" | "fuel" | null>(null);
  const [toast, setToast] = useState("");
  const [vehicleDraft, setVehicleDraft] = useState({ model: "", plate: "", year: String(new Date().getFullYear()), odometer: "0", location: "Pátio principal" });
  const [driverDraft, setDriverDraft] = useState({ name: "", phone: "", license: "B", licenseExpiry: "" });
  const [maintenanceDraft, setMaintenanceDraft] = useState({ type: "Revisão preventiva", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "" });
  const [documentDraft, setDocumentDraft] = useState({ type: "Licenciamento", expiry: "", note: "" });
  const [fuelDraft, setFuelDraft] = useState({ date: new Date().toISOString().slice(0, 10), liters: "", cost: "", odometer: "", station: "" });
  const selected = vehicles.find((vehicle) => vehicle.id === selectedId) ?? vehicles[0];

  const nav: NavItem[] = [
    { label: "Frota", icon: "car" },
    { label: "Manutenções", icon: "settings" },
    { label: "Motoristas", icon: "people" },
    { label: "Documentos", icon: "document" },
    { label: "Combustível", icon: "activity" },
  ];

  const filteredVehicles = useMemo(() => {
    const value = query.trim().toLowerCase();
    return vehicles.filter((vehicle) => (statusFilter === "Todos" || vehicle.status === statusFilter) && (!value || `${vehicle.model} ${vehicle.plate} ${vehicle.id} ${vehicle.location}`.toLowerCase().includes(value)));
  }, [query, statusFilter, vehicles]);

  const attentionCount = vehicles.filter(needsAttention).length;
  const totalFuelCost = vehicles.reduce((sum, vehicle) => sum + vehicle.fuel.reduce((subtotal, item) => subtotal + item.cost, 0), 0);
  const totalFuelLiters = vehicles.reduce((sum, vehicle) => sum + vehicle.fuel.reduce((subtotal, item) => subtotal + item.liters, 0), 0);

  function updateSelected(patch: Partial<Vehicle>, historyText?: string) {
    if (!selected) return;
    setVehicles((current) => current.map((vehicle) => vehicle.id === selected.id ? { ...vehicle, ...patch, history: historyText ? [{ text: historyText, date: todayLabel() }, ...vehicle.history] : vehicle.history } : vehicle));
  }

  function createVehicle() {
    const plate = vehicleDraft.plate.trim().toUpperCase();
    if (!vehicleDraft.model.trim() || !plate) return;
    if (vehicles.some((vehicle) => vehicle.plate === plate)) { setToast("Já existe um veículo cadastrado com esta placa"); return; }
    const odometer = Math.max(0, Number(vehicleDraft.odometer) || 0);
    const vehicle: Vehicle = {
      id: uid("VEI"), model: vehicleDraft.model.trim(), plate, year: Number(vehicleDraft.year) || new Date().getFullYear(), status: "Disponível", driverId: "", odometer,
      nextMaintenanceKm: odometer + 10000, nextMaintenanceDate: "", location: vehicleDraft.location.trim() || "Local não informado", documents: [], maintenance: [], fuel: [], history: [{ text: "Veículo cadastrado", date: todayLabel() }],
    };
    setVehicles((current) => [vehicle, ...current]); setSelectedId(vehicle.id); setVehicleDraft({ model: "", plate: "", year: String(new Date().getFullYear()), odometer: "0", location: "Pátio principal" }); setModal(null); setActive("Frota"); setToast("Veículo cadastrado");
  }

  function createDriver() {
    if (!driverDraft.name.trim()) return;
    const driver: Driver = { id: uid("MOT"), name: driverDraft.name.trim(), phone: driverDraft.phone.trim(), license: driverDraft.license.trim().toUpperCase(), licenseExpiry: driverDraft.licenseExpiry, status: "Disponível" };
    setDrivers((current) => [driver, ...current]); setDriverDraft({ name: "", phone: "", license: "B", licenseExpiry: "" }); setModal(null); setToast("Motorista cadastrado");
  }

  function removeDriver(driver: Driver) {
    const assigned = vehicles.filter((vehicle) => vehicle.driverId === driver.id).length;
    const message = assigned ? `${driver.name} está vinculado a ${assigned} veículo(s). Remover e deixar esses veículos sem motorista?` : `Remover ${driver.name}?`;
    if (!window.confirm(message)) return;
    setDrivers((current) => current.filter((item) => item.id !== driver.id));
    setVehicles((current) => current.map((vehicle) => vehicle.driverId === driver.id ? { ...vehicle, driverId: "", history: [{ text: `Motorista ${driver.name} removido`, date: todayLabel() }, ...vehicle.history] } : vehicle));
    setToast("Motorista removido");
  }

  function addMaintenance() {
    if (!selected || !maintenanceDraft.type.trim()) return;
    const record: MaintenanceRecord = { id: uid("MAN"), type: maintenanceDraft.type.trim(), date: maintenanceDraft.date, odometer: Number(maintenanceDraft.odometer) || selected.odometer, cost: Number(maintenanceDraft.cost.replace(",", ".")) || 0, note: maintenanceDraft.note.trim() };
    updateSelected({ maintenance: [record, ...selected.maintenance], odometer: Math.max(selected.odometer, record.odometer), nextMaintenanceKm: Math.max(selected.odometer, record.odometer) + 10000, status: selected.status === "Manutenção" ? "Disponível" : selected.status }, `Manutenção registrada: ${record.type}`);
    setMaintenanceDraft({ type: "Revisão preventiva", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "" }); setModal(null); setToast("Manutenção registrada");
  }

  function addDocument() {
    if (!selected || !documentDraft.type.trim() || !documentDraft.expiry) return;
    const document: VehicleDocument = { id: uid("DOC"), type: documentDraft.type.trim(), expiry: documentDraft.expiry, note: documentDraft.note.trim() };
    updateSelected({ documents: [document, ...selected.documents] }, `Documento adicionado: ${document.type}`);
    setDocumentDraft({ type: "Licenciamento", expiry: "", note: "" }); setModal(null); setToast("Documento adicionado");
  }

  function addFuel() {
    if (!selected) return;
    const liters = Number(fuelDraft.liters.replace(",", ".")) || 0;
    const cost = Number(fuelDraft.cost.replace(",", ".")) || 0;
    if (liters <= 0 || cost <= 0) { setToast("Informe litros e valor maiores que zero"); return; }
    const record: FuelRecord = { id: uid("ABS"), date: fuelDraft.date, liters, cost, odometer: Number(fuelDraft.odometer) || selected.odometer, station: fuelDraft.station.trim() };
    updateSelected({ fuel: [record, ...selected.fuel], odometer: Math.max(selected.odometer, record.odometer) }, `Abastecimento registrado: ${record.liters.toLocaleString("pt-BR")} L`);
    setFuelDraft({ date: new Date().toISOString().slice(0, 10), liters: "", cost: "", odometer: "", station: "" }); setModal(null); setToast("Abastecimento registrado");
  }

  function openVehicle(vehicleId: string, tab = "Resumo") { setSelectedId(vehicleId); setDetailTab(tab); setActive("Frota"); }
  function driverName(driverId: string) { return drivers.find((driver) => driver.id === driverId)?.name ?? "Sem motorista"; }

  const headerAction = active === "Frota" ? <button className={styles.primaryButton} onClick={() => setModal("vehicle")}><Icon name="plus" /> Novo veículo</button> : active === "Motoristas" ? <button className={styles.primaryButton} onClick={() => setModal("driver")}><Icon name="plus" /> Novo motorista</button> : null;

  return <AppShell product={product} nav={nav} active={active} onChange={setActive} title={active} subtitle="Veículos, responsáveis, manutenção, documentos e abastecimentos em registros simples." action={headerAction}>
    {active === "Frota" ? <>
      <div className={zeus.fleetSummary}><div><span>Veículos cadastrados</span><strong>{vehicles.length}</strong></div><div><span>Em uso agora</span><strong>{vehicles.filter((vehicle) => vehicle.status === "Em uso").length}</strong></div><div><span>Precisam de atenção</span><strong>{attentionCount}</strong></div></div>
      <div className={styles.masterDetail}>
        <section className={styles.listPane}><div className={styles.listToolbar}><label className={styles.inputSearch}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Placa, modelo ou local" /></label><select className={styles.compactSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as VehicleStatus | "Todos")}><option>Todos</option><option>Disponível</option><option>Em uso</option><option>Manutenção</option><option>Inativo</option></select></div><div className={styles.recordList}>{filteredVehicles.map((vehicle) => <button key={vehicle.id} className={`${styles.recordRow} ${selected?.id === vehicle.id ? styles.recordSelected : ""}`} onClick={() => { setSelectedId(vehicle.id); setDetailTab("Resumo"); }}><div className={styles.recordAvatar}><Icon name="car" /></div><div className={styles.recordMain}><div><strong>{vehicle.model}</strong><span>{vehicle.plate}</span></div><p>{driverName(vehicle.driverId)} · {vehicle.odometer.toLocaleString("pt-BR")} km</p></div><div className={styles.recordMeta}><StatusPill status={vehicle.status} /><small>{needsAttention(vehicle) ? "Atenção necessária" : vehicle.location}</small></div></button>)}{!filteredVehicles.length ? <EmptyState icon="search" title="Nenhum veículo encontrado" description="Altere a busca ou cadastre um novo veículo." /> : null}</div></section>
        {selected ? <section className={styles.detailPane}><div className={styles.detailHeader}><div className={zeus.vehicleIdentity}><div className={zeus.vehicleIcon}><Icon name="car" /></div><div><span className={styles.eyebrow}>{selected.id}</span><h2>{selected.model}</h2><p>{selected.plate} · {selected.year}</p></div></div><div className={styles.headerButtons}><StatusPill status={selected.status} /><button className={styles.secondaryButton} onClick={() => setModal("maintenance")}>Registrar manutenção</button></div></div><div className={styles.detailTabs}>{["Resumo", "Manutenção", "Documentos", "Combustível", "Histórico"].map((tab) => <button key={tab} className={detailTab === tab ? styles.tabActive : ""} onClick={() => setDetailTab(tab)}>{tab}</button>)}</div><div className={styles.detailBody}>
          {detailTab === "Resumo" ? <><div className={styles.summaryGrid}><div><span>Situação</span><StatusPill status={selected.status} /></div><div><span>Motorista</span><strong>{driverName(selected.driverId)}</strong></div><div><span>Quilometragem</span><strong>{selected.odometer.toLocaleString("pt-BR")} km</strong></div><div><span>Local informado</span><strong>{selected.location}</strong></div></div>{needsAttention(selected) ? <div className={zeus.attentionBox}><Icon name="warning" /><div><strong>Este veículo precisa de atenção</strong><span>{maintenanceAlert(selected)}</span></div></div> : null}<section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Dados operacionais</h3><p>Atualize as informações principais do veículo.</p></div></div><div className={zeus.detailFields}><label><span>Situação</span><select value={selected.status} onChange={(event) => updateSelected({ status: event.target.value as VehicleStatus }, `Situação alterada para ${event.target.value}`)}><option>Disponível</option><option>Em uso</option><option>Manutenção</option><option>Inativo</option></select></label><label><span>Motorista responsável</span><select value={selected.driverId} onChange={(event) => updateSelected({ driverId: event.target.value }, `Motorista alterado para ${driverName(event.target.value)}`)}><option value="">Sem motorista</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select></label><label><span>Quilometragem atual</span><input type="number" min="0" value={selected.odometer} onChange={(event) => updateSelected({ odometer: Math.max(0, Number(event.target.value) || 0) })} /></label><label><span>Local informado</span><input value={selected.location} onChange={(event) => updateSelected({ location: event.target.value })} /></label><label><span>Próxima manutenção em km</span><input type="number" min="0" value={selected.nextMaintenanceKm} onChange={(event) => updateSelected({ nextMaintenanceKm: Math.max(0, Number(event.target.value) || 0) })} /></label><label><span>Próxima manutenção por data</span><input type="date" value={selected.nextMaintenanceDate} onChange={(event) => updateSelected({ nextMaintenanceDate: event.target.value })} /></label></div></section></> : null}
          {detailTab === "Manutenção" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Histórico de manutenção</h3><p>Serviços preventivos e corretivos registrados.</p></div><button onClick={() => setModal("maintenance")}><Icon name="plus" /> Adicionar</button></div><div className={zeus.simpleRows}>{selected.maintenance.map((record) => <div key={record.id}><div><strong>{record.type}</strong><p>{formatDate(record.date)} · {record.odometer.toLocaleString("pt-BR")} km</p><small>{record.note || "Sem observação"}</small></div><span className={zeus.rowValue}>{currency(record.cost)}</span><button className={styles.iconButton} aria-label={`Remover ${record.type}`} onClick={() => updateSelected({ maintenance: selected.maintenance.filter((item) => item.id !== record.id) }, `${record.type} removida do histórico`)}><Icon name="trash" /></button></div>)}{!selected.maintenance.length ? <EmptyState icon="settings" title="Sem manutenção registrada" description="Adicione o primeiro serviço deste veículo." /> : null}</div></section> : null}
          {detailTab === "Documentos" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Documentos e vencimentos</h3><p>Acompanhe datas e observações importantes.</p></div><button onClick={() => setModal("document")}><Icon name="plus" /> Adicionar</button></div><div className={zeus.simpleRows}>{selected.documents.map((document) => <div key={document.id}><div><strong>{document.type}</strong><p>Vencimento: {formatDate(document.expiry)}</p><small>{document.note || "Sem observação"}</small></div><StatusPill status={documentStatus(document.expiry)} /><button className={styles.iconButton} aria-label={`Remover ${document.type}`} onClick={() => updateSelected({ documents: selected.documents.filter((item) => item.id !== document.id) }, `${document.type} removido`)}><Icon name="trash" /></button></div>)}{!selected.documents.length ? <EmptyState icon="document" title="Nenhum documento cadastrado" description="Registre licenciamento, seguro ou outro vencimento." /> : null}</div></section> : null}
          {detailTab === "Combustível" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Abastecimentos</h3><p>Litros, valor, posto e quilometragem.</p></div><button onClick={() => setModal("fuel")}><Icon name="plus" /> Registrar</button></div><div className={zeus.simpleRows}>{selected.fuel.map((record) => <div key={record.id}><div><strong>{record.liters.toLocaleString("pt-BR")} L · {record.station || "Posto não informado"}</strong><p>{formatDate(record.date)} · {record.odometer.toLocaleString("pt-BR")} km</p></div><span className={zeus.rowValue}>{currency(record.cost)}</span><button className={styles.iconButton} aria-label="Remover abastecimento" onClick={() => updateSelected({ fuel: selected.fuel.filter((item) => item.id !== record.id) }, "Abastecimento removido")}><Icon name="trash" /></button></div>)}{!selected.fuel.length ? <EmptyState icon="activity" title="Sem abastecimentos" description="Registre o primeiro abastecimento deste veículo." /> : null}</div></section> : null}
          {detailTab === "Histórico" ? <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Linha do tempo</h3><p>Alterações importantes do veículo.</p></div></div><Timeline items={selected.history} /></section> : null}
        </div></section> : null}
      </div>
    </> : null}

    {active === "Manutenções" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Preventiva e corretiva</span><h2>Veículos que exigem atenção</h2><p>Prioridade definida por quilometragem, data e situação atual.</p></div></div><div className={zeus.simpleRows}>{vehicles.slice().sort((a, b) => Number(needsAttention(b)) - Number(needsAttention(a))).map((vehicle) => { const progress = Math.min(100, Math.max(0, vehicle.nextMaintenanceKm ? (vehicle.odometer / vehicle.nextMaintenanceKm) * 100 : 0)); return <button key={vehicle.id} onClick={() => openVehicle(vehicle.id, "Manutenção")}><div><strong>{vehicle.model} · {vehicle.plate}</strong><p>{maintenanceAlert(vehicle)}</p><div className={zeus.mileageBar}><i style={{ width: `${progress}%` }} /></div></div><StatusPill status={needsAttention(vehicle) ? "Atenção" : "Programada"} /><Icon name="chevron" /></button>; })}</div></section> : null}

    {active === "Motoristas" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Condutores</span><h2>Motoristas cadastrados</h2><p>Responsável, categoria da habilitação e validade.</p></div></div><div className={zeus.simpleRows}>{drivers.map((driver) => <div className={zeus.driverCard} key={driver.id}><span className={zeus.driverAvatar}>{driver.name.slice(0, 2).toUpperCase()}</span><div><h3>{driver.name}</h3><p>CNH {driver.license} · validade {formatDate(driver.licenseExpiry)} · {vehicles.filter((vehicle) => vehicle.driverId === driver.id).length} veículo(s)</p></div><div className={zeus.inlineActions}><StatusPill status={driver.status} /><button className={styles.iconButton} aria-label={`Remover ${driver.name}`} onClick={() => removeDriver(driver)}><Icon name="trash" /></button></div></div>)}{!drivers.length ? <EmptyState icon="people" title="Nenhum motorista cadastrado" description="Cadastre o primeiro motorista da frota." /> : null}</div></section> : null}

    {active === "Documentos" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Vencimentos</span><h2>Documentos da frota</h2><p>Lista única para encontrar pendências sem abrir veículo por veículo.</p></div></div><div className={zeus.simpleRows}>{vehicles.flatMap((vehicle) => vehicle.documents.map((document) => ({ vehicle, document }))).sort((a, b) => a.document.expiry.localeCompare(b.document.expiry)).map(({ vehicle, document }) => <button key={`${vehicle.id}-${document.id}`} onClick={() => openVehicle(vehicle.id, "Documentos")}><div><strong>{document.type} · {vehicle.plate}</strong><p>{vehicle.model} · vence em {formatDate(document.expiry)}</p></div><StatusPill status={documentStatus(document.expiry)} /><Icon name="chevron" /></button>)}{!vehicles.some((vehicle) => vehicle.documents.length) ? <EmptyState icon="document" title="Nenhum documento cadastrado" description="Adicione documentos na ficha de um veículo." /> : null}</div></section> : null}

    {active === "Combustível" ? <section className={styles.pageSheet}><div className={styles.pageHeading}><div><span className={styles.eyebrow}>Abastecimentos</span><h2>Abastecimentos da frota</h2><p>Consulte os valores, volumes e postos registrados.</p></div></div><div className={zeus.fuelTotals}><div><span>Total registrado</span><strong>{currency(totalFuelCost)}</strong></div><div><span>Volume registrado</span><strong>{totalFuelLiters.toLocaleString("pt-BR")} L</strong></div></div><div className={zeus.simpleRows}>{vehicles.flatMap((vehicle) => vehicle.fuel.map((record) => ({ vehicle, record }))).sort((a, b) => b.record.date.localeCompare(a.record.date)).map(({ vehicle, record }) => <button key={`${vehicle.id}-${record.id}`} onClick={() => openVehicle(vehicle.id, "Combustível")}><div><strong>{vehicle.plate} · {record.liters.toLocaleString("pt-BR")} L</strong><p>{formatDate(record.date)} · {record.station || "Posto não informado"}</p></div><span className={zeus.rowValue}>{currency(record.cost)}</span><Icon name="chevron" /></button>)}{!vehicles.some((vehicle) => vehicle.fuel.length) ? <EmptyState icon="activity" title="Nenhum abastecimento registrado" description="Registre o primeiro abastecimento na ficha de um veículo." /> : null}</div></section> : null}

    <Modal open={modal === "vehicle"} title="Novo veículo" description="Cadastre somente os dados necessários para começar." onClose={() => setModal(null)}><Form onSubmit={createVehicle}><div className={styles.formGrid}><Field label="Modelo"><input required value={vehicleDraft.model} onChange={(event) => setVehicleDraft((current) => ({ ...current, model: event.target.value }))} /></Field><Field label="Placa"><input required maxLength={7} value={vehicleDraft.plate} onChange={(event) => setVehicleDraft((current) => ({ ...current, plate: event.target.value.toUpperCase() }))} /></Field><Field label="Ano"><input type="number" min="1900" max={new Date().getFullYear() + 1} value={vehicleDraft.year} onChange={(event) => setVehicleDraft((current) => ({ ...current, year: event.target.value }))} /></Field><Field label="Quilometragem"><input type="number" min="0" value={vehicleDraft.odometer} onChange={(event) => setVehicleDraft((current) => ({ ...current, odometer: event.target.value }))} /></Field></div><Field label="Local inicial"><input value={vehicleDraft.location} onChange={(event) => setVehicleDraft((current) => ({ ...current, location: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Cadastrar veículo</button></div></Form></Modal>
    <Modal open={modal === "driver"} title="Novo motorista" onClose={() => setModal(null)}><Form onSubmit={createDriver}><Field label="Nome"><input required value={driverDraft.name} onChange={(event) => setDriverDraft((current) => ({ ...current, name: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Telefone"><input inputMode="tel" value={driverDraft.phone} onChange={(event) => setDriverDraft((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Categoria da CNH"><input value={driverDraft.license} onChange={(event) => setDriverDraft((current) => ({ ...current, license: event.target.value }))} /></Field></div><Field label="Validade da CNH"><input type="date" value={driverDraft.licenseExpiry} onChange={(event) => setDriverDraft((current) => ({ ...current, licenseExpiry: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Cadastrar motorista</button></div></Form></Modal>
    <Modal open={modal === "maintenance"} title="Registrar manutenção" description={selected ? `${selected.model} · ${selected.plate}` : undefined} onClose={() => setModal(null)}><Form onSubmit={addMaintenance}><Field label="Serviço"><input required value={maintenanceDraft.type} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, type: event.target.value }))} /></Field><div className={styles.formGrid}><Field label="Data"><input type="date" value={maintenanceDraft.date} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Quilometragem"><input type="number" min="0" value={maintenanceDraft.odometer} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, odometer: event.target.value }))} placeholder={selected ? String(selected.odometer) : ""} /></Field><Field label="Custo"><input inputMode="decimal" value={maintenanceDraft.cost} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, cost: event.target.value }))} /></Field></div><Field label="Observação"><textarea value={maintenanceDraft.note} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, note: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Salvar manutenção</button></div></Form></Modal>
    <Modal open={modal === "document"} title="Adicionar documento" description={selected ? `${selected.model} · ${selected.plate}` : undefined} onClose={() => setModal(null)}><Form onSubmit={addDocument}><Field label="Tipo"><input required value={documentDraft.type} onChange={(event) => setDocumentDraft((current) => ({ ...current, type: event.target.value }))} /></Field><Field label="Vencimento"><input required type="date" value={documentDraft.expiry} onChange={(event) => setDocumentDraft((current) => ({ ...current, expiry: event.target.value }))} /></Field><Field label="Observação"><input value={documentDraft.note} onChange={(event) => setDocumentDraft((current) => ({ ...current, note: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Adicionar documento</button></div></Form></Modal>
    <Modal open={modal === "fuel"} title="Registrar abastecimento" description={selected ? `${selected.model} · ${selected.plate}` : undefined} onClose={() => setModal(null)}><Form onSubmit={addFuel}><div className={styles.formGrid}><Field label="Data"><input type="date" value={fuelDraft.date} onChange={(event) => setFuelDraft((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Litros"><input required inputMode="decimal" value={fuelDraft.liters} onChange={(event) => setFuelDraft((current) => ({ ...current, liters: event.target.value }))} /></Field><Field label="Valor total"><input required inputMode="decimal" value={fuelDraft.cost} onChange={(event) => setFuelDraft((current) => ({ ...current, cost: event.target.value }))} /></Field><Field label="Quilometragem"><input type="number" min="0" value={fuelDraft.odometer} onChange={(event) => setFuelDraft((current) => ({ ...current, odometer: event.target.value }))} /></Field></div><Field label="Posto"><input value={fuelDraft.station} onChange={(event) => setFuelDraft((current) => ({ ...current, station: event.target.value }))} /></Field><div className={styles.modalActions}><button className={styles.primaryButton}>Salvar abastecimento</button></div></Form></Modal>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
  </AppShell>;
}

function formatDate(value: string) {
  if (!value) return "não definida";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
}

function dateDiffDays(value: string) {
  if (!value) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T12:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function documentStatus(expiry: string) {
  const days = dateDiffDays(expiry);
  if (days < 0) return "Vencido";
  if (days <= 30) return "Atenção";
  return "Regular";
}

function needsAttention(vehicle: Vehicle) {
  return vehicle.status === "Manutenção" || vehicle.odometer >= vehicle.nextMaintenanceKm || dateDiffDays(vehicle.nextMaintenanceDate) <= 30 || vehicle.documents.some((document) => dateDiffDays(document.expiry) <= 30);
}

function maintenanceAlert(vehicle: Vehicle) {
  if (vehicle.status === "Manutenção") return "Veículo está marcado como em manutenção.";
  if (vehicle.odometer >= vehicle.nextMaintenanceKm) return `Revisão por quilometragem vencida em ${vehicle.nextMaintenanceKm.toLocaleString("pt-BR")} km.`;
  if (dateDiffDays(vehicle.nextMaintenanceDate) <= 30) return `Manutenção prevista para ${formatDate(vehicle.nextMaintenanceDate)}.`;
  const document = vehicle.documents.find((item) => dateDiffDays(item.expiry) <= 30);
  if (document) return `${document.type} vence em ${formatDate(document.expiry)}.`;
  return `Próxima revisão em ${vehicle.nextMaintenanceKm.toLocaleString("pt-BR")} km.`;
}
