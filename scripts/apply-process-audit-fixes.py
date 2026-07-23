from pathlib import Path
import re


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Trecho não encontrado: {label}")
    return text.replace(old, new, 1)


def sub_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Padrão não encontrado: {label}")
    return result


# Atlas: preservar exatamente o orçamento aprovado durante execução/conferência.
path = "components/workspaces/phase-four/AtlasApp.tsx"
text = read(path)
text = sub_once(
    text,
    r"  function quoteSection\(order: WorkOrder\) \{.*?\n  function photosSection",
    '''  function quoteSection(order: WorkOrder) {
    const canEdit = order.status === "Avaliação" || (order.status === "Aguardando aprovação" && order.approval === "Recusado");
    function removeLine(item: ServiceLine) {
      updateSelected({ services: order.services.filter((line) => line.id !== item.id), approval: order.status === "Aguardando aprovação" ? "Pendente" : order.approval }, `${item.description} removido; orçamento voltou para revisão`);
    }
    return <section className={styles.infoSection}><div className={styles.sectionHeading}><div><h3>Orçamento atual</h3><p>{canEdit ? "Revise os itens antes de enviar novamente ao cliente." : "Itens preservados conforme a versão aprovada pelo cliente."}</p></div>{canEdit ? <button className={styles.primaryButton} onClick={() => setModal("service")}><Icon name="plus" /> Adicionar item</button> : null}</div><div className={styles.lineItems}>{order.services.map((item) => <div key={item.id}><StatusPill status={item.kind} /><span>{item.description}</span><strong>{currency(item.value)}</strong>{canEdit ? <button aria-label={`Remover ${item.description}`} onClick={() => removeLine(item)}><Icon name="trash" /></button> : <span aria-label="Item preservado"><Icon name="check" /></span>}</div>)}</div>{!order.services.length ? <EmptyState icon="document" title="Orçamento vazio" description="Adicione um serviço ou peça antes de enviar para aprovação." /> : null}{!canEdit && order.services.length ? <div className={styles.noteBox}>Para mudar itens ou valores, registre uma nova revisão e obtenha nova aprovação antes de continuar a execução.</div> : null}<div className={styles.totalBar}><span>Total estimado</span><strong>{currency(total(order))}</strong></div></section>;
  }
  function photosSection''',
    "bloquear orçamento aprovado",
)
write(path, text)


# Ares: vencimento real no detalhe e qualquer edição volta para rascunho.
path = "components/workspaces/phase-four/AresApp.tsx"
text = read(path)
text = replace_once(text, '  const selected = quotes.find((quote) => quote.id === selectedId);\n', '', "selected bruto do Ares")
text = replace_once(text, '  const normalizedQuotes = useMemo(() => quotes.map((quote) => isExpired(quote.validity) && !["Aprovado", "Recusado"].includes(quote.status) ? { ...quote, status: "Expirado" as QuoteStatus } : quote), [quotes]);\n', '  const normalizedQuotes = useMemo(() => quotes.map((quote) => isExpired(quote.validity) && !["Aprovado", "Recusado"].includes(quote.status) ? { ...quote, status: "Expirado" as QuoteStatus } : quote), [quotes]);\n  const selected = normalizedQuotes.find((quote) => quote.id === selectedId);\n', "selected normalizado do Ares")
text = replace_once(text, '    if (finalize && !quote.validity) return "Informe a validade da proposta";\n', '    if (finalize && (!quote.validity || isExpired(quote.validity))) return "Informe uma validade futura para a proposta";\n', "validade futura do Ares")
text = replace_once(text, '    const nextStatus: QuoteStatus = finalize ? "Pronto" : quote.status === "Expirado" ? "Rascunho" : quote.status;\n', '    const nextStatus: QuoteStatus = finalize ? "Pronto" : "Rascunho";\n', "edição volta a rascunho no Ares")
write(path, text)


# Artemis: nenhuma mesa ou item de cardápio previamente escolhido.
path = "components/workspaces/phase-four/ArtemisApp.tsx"
text = read(path)
text = replace_once(text, '  const [itemDraft, setItemDraft] = useState({ menuId: initialMenu[0]?.id ?? "", quantity: 1, note: "" });\n', '  const [itemDraft, setItemDraft] = useState({ menuId: "", quantity: 1, note: "" });\n', "item inicial do Artemis")
text = replace_once(text, '  function openCommandModal(tableId?: number) { const table = tableId ? tables.find((item) => item.id === tableId && item.status === "Livre") : freeTables[0]; if (!table) { setToast("Não há mesas livres"); return; } setCommandDraft({ tableId: String(table.id), waiter: "" }); setModal("command"); }\n', '  function openCommandModal(tableId?: number) { if (!freeTables.length) { setToast("Não há mesas livres"); return; } const table = tableId ? tables.find((item) => item.id === tableId && item.status === "Livre") : undefined; if (tableId && !table) { setToast("Esta mesa não está livre"); return; } setCommandDraft({ tableId: table ? String(table.id) : "", waiter: "" }); setModal("command"); }\n', "mesa consciente do Artemis")
text = replace_once(text, ' setItemDraft({ menuId: activeMenu[0]?.id ?? "", quantity: 1, note: "" }); setModal(null);', ' setItemDraft({ menuId: "", quantity: 1, note: "" }); setModal(null);', "limpar item do Artemis")
text = replace_once(text, '<button className={styles.addItemButton} onClick={() => setModal("item")}><Icon name="plus" /> Adicionar novo pedido</button>', '<button className={styles.addItemButton} onClick={() => { setItemDraft({ menuId: "", quantity: 1, note: "" }); setModal("item"); }}><Icon name="plus" /> Adicionar novo pedido</button>', "abrir item vazio do Artemis")
text = replace_once(text, '<Field label="Item"><select required value={itemDraft.menuId} onChange={(event) => setItemDraft((current) => ({ ...current, menuId: event.target.value }))}>{activeMenu.map', '<Field label="Item"><select required value={itemDraft.menuId} onChange={(event) => setItemDraft((current) => ({ ...current, menuId: event.target.value }))}><option value="">Selecione o item</option>{activeMenu.map', "placeholder de item do Artemis")
write(path, text)


# Pandora: histórico, reabertura coerente e resposta sem nota/tema escolhidos.
path = "components/workspaces/phase-four/PandoraApp.tsx"
text = read(path)
text = replace_once(text, 'AppShell, EmptyState, Field, Form, Icon, Modal, ScoreBadge, StatusPill, Toast, type NavItem', 'AppShell, EmptyState, Field, Form, Icon, Modal, ScoreBadge, StatusPill, Timeline, Toast, type NavItem', "Timeline no Pandora")
text = replace_once(text, 'type Feedback = { id: string; customer: string; score: number; channel: string; date: string; comment: string; theme: string; status: FeedbackStatus; priority: boolean; treatment: string; owner: string; dueDate: string; customerReturn: string };', 'type Feedback = { id: string; customer: string; score: number; channel: string; date: string; comment: string; theme: string; status: FeedbackStatus; priority: boolean; treatment: string; owner: string; dueDate: string; customerReturn: string; history?: Array<{ text: string; date: string }> };', "histórico do feedback")
text = replace_once(text, '  const [responseDraft, setResponseDraft] = useState({ customer: "", score: 8, comment: "", theme: "Atendimento" });\n', '  const [responseDraft, setResponseDraft] = useState<{ customer: string; score: number | ""; comment: string; theme: string }>({ customer: "", score: "", comment: "", theme: "" });\n', "resposta sem seleção Pandora")
text = replace_once(text, '  function updateSelected(patch: Partial<Feedback>) { if (selected) setFeedbacks((current) => current.map((feedback) => feedback.id === selected.id ? { ...feedback, ...patch } : feedback)); }\n', '  function updateSelected(patch: Partial<Feedback>, historyText?: string) { if (selected) setFeedbacks((current) => current.map((feedback) => feedback.id === selected.id ? { ...feedback, ...patch, history: historyText ? [{ text: historyText, date: todayLabel() }, ...(feedback.history ?? [])] : feedback.history } : feedback)); }\n', "update com histórico Pandora")
text = replace_once(text, '    updateSelected({ status: transitionTarget, priority: transitionTarget === "Tratado" ? false : selected.priority });\n    setModal(null); setToast(`${previous} → ${transitionTarget} confirmado`);\n', '    updateSelected({ status: transitionTarget, priority: transitionTarget === "Tratado" ? false : selected.score <= 6 ? true : selected.priority }, `${previous} → ${transitionTarget}`);\n    setScope(transitionTarget === "Tratado" ? "Finalizadas" : "Em acompanhamento");\n    setModal(null); setToast(`${previous} → ${transitionTarget} confirmado`);\n', "transição rastreável Pandora")
text = replace_once(text, '  function openResponse(survey: Survey) { if (!survey.active) { setToast("Ative a pesquisa antes de receber respostas"); return; } setResponseSurvey(survey); setResponseDraft({ customer: "", score: 8, comment: "", theme: "Atendimento" }); setModal("response"); }\n', '  function openResponse(survey: Survey) { if (!survey.active) { setToast("Ative a pesquisa antes de receber respostas"); return; } setResponseSurvey(survey); setResponseDraft({ customer: "", score: "", comment: "", theme: "" }); setModal("response"); }\n', "abrir resposta vazia Pandora")
text = replace_once(text, '    if (!responseSurvey?.active || !responseDraft.comment.trim()) { setToast("Informe o comentário da resposta"); return; }\n    const feedback: Feedback = { id: uid("R"), customer: responseDraft.customer.trim() || "Cliente não identificado", score: responseDraft.score, channel: responseSurvey.name, date: todayLabel(), comment: responseDraft.comment.trim(), theme: responseDraft.theme, status: "Novo", priority: responseDraft.score <= 6, treatment: "", owner: "", dueDate: "", customerReturn: "" };\n', '    if (!responseSurvey?.active || responseDraft.score === "" || !responseDraft.theme || !responseDraft.comment.trim()) { setToast("Escolha a nota e o tema e informe o comentário"); return; }\n    const feedback: Feedback = { id: uid("R"), customer: responseDraft.customer.trim() || "Cliente não identificado", score: responseDraft.score, channel: responseSurvey.name, date: todayLabel(), comment: responseDraft.comment.trim(), theme: responseDraft.theme, status: "Novo", priority: responseDraft.score <= 6, treatment: "", owner: "", dueDate: "", customerReturn: "", history: [{ text: "Resposta recebida na etapa Novo", date: todayLabel() }] };\n', "validar resposta Pandora")
text = replace_once(text, '</button></section></details></section> : <EmptyState icon="inbox"', '</button></section></details><details><summary>Histórico do tratamento</summary><section className={styles.infoSection}><Timeline items={selected.history?.length ? selected.history : [{ text: "Resposta recebida", date: selected.date }]} /></section></details></section> : <EmptyState icon="inbox"', "mostrar histórico Pandora")
text = replace_once(text, '<Field label="Nota"><input type="number" min="0" max="10" value={responseDraft.score} onChange={(event) => setResponseDraft((current) => ({ ...current, score: Math.min(10, Math.max(0, Number(event.target.value) || 0)) }))} /></Field>', '<Field label="Nota"><input required type="number" min="0" max="10" value={responseDraft.score} onChange={(event) => setResponseDraft((current) => ({ ...current, score: event.target.value === "" ? "" : Math.min(10, Math.max(0, Number(event.target.value))) }))} placeholder="Escolha de 0 a 10" /></Field>', "nota vazia Pandora")
text = replace_once(text, '<Field label="Tema"><select value={responseDraft.theme}', '<Field label="Tema"><select required value={responseDraft.theme}', "tema obrigatório Pandora")
text = replace_once(text, '<Field label="Tema"><select required value={responseDraft.theme} onChange={(event) => setResponseDraft((current) => ({ ...current, theme: event.target.value }))}><option>Atendimento</option>', '<Field label="Tema"><select required value={responseDraft.theme} onChange={(event) => setResponseDraft((current) => ({ ...current, theme: event.target.value }))}><option value="">Selecione o tema</option><option>Atendimento</option>', "placeholder tema Pandora")
write(path, text)


# Poseidon: preservar atividades pendentes como canceladas no histórico.
path = "components/workspaces/phase-four/PoseidonApp.tsx"
text = read(path)
text = replace_once(text, 'type Activity = { id: string; opportunityId: string; date: string; time: string; type: string; company: string; person: string; done: boolean; result?: string };', 'type Activity = { id: string; opportunityId: string; date: string; time: string; type: string; company: string; person: string; done: boolean; cancelled?: boolean; result?: string };', "atividade cancelada Poseidon")
text = replace_once(text, '(activityMode === "Pendentes" ? !item.done : item.done)', '(activityMode === "Pendentes" ? !item.done && !item.cancelled : item.done || item.cancelled)', "escopo atividade Poseidon")
text = replace_once(text, '    if (["Ganha", "Perdida"].includes(target)) setActivities((current) => current.filter((activity) => activity.opportunityId !== selected.id || activity.done));\n', '    if (["Ganha", "Perdida"].includes(target)) setActivities((current) => current.map((activity) => activity.opportunityId === selected.id && !activity.done ? { ...activity, cancelled: true, result: "Cancelada após encerramento da negociação" } : activity));\n', "preservar atividades Poseidon")
text = text.replace('${item.done ? styles.completedRow : ""}', '${item.done || item.cancelled ? styles.completedRow : ""}')
text = replace_once(text, '{item.done ? <StatusPill status="Concluída" /> : <button onClick={() => { setResultDraft({ id: item.id, result: "", next: "" }); setModal("result"); }}>Registrar resultado <Icon name="chevron" /></button>}', '{item.cancelled ? <StatusPill status="Cancelada" /> : item.done ? <StatusPill status="Concluída" /> : <button onClick={() => { setResultDraft({ id: item.id, result: "", next: "" }); setModal("result"); }}>Registrar resultado <Icon name="chevron" /></button>}', "status cancelado Poseidon")
text = replace_once(text, 'Pendentes <span>{activities.filter((item) => !item.done).length}</span>', 'Pendentes <span>{activities.filter((item) => !item.done && !item.cancelled).length}</span>', "contador pendentes Poseidon")
text = replace_once(text, 'Concluídas <span>{activities.filter((item) => item.done).length}</span>', 'Histórico <span>{activities.filter((item) => item.done || item.cancelled).length}</span>', "contador histórico Poseidon")
write(path, text)


# Hércules: preservar não conformidade e exigir registro de validação.
path = "components/workspaces/phase-four/HerculesApp.tsx"
text = read(path)
text = replace_once(text, 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; evidence: string[] };', 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation: string; evidence: string[] };', "validação desvio Hércules")
text = replace_once(text, 'type DeviationDraft = { id: string; description: string; priority: Deviation["priority"]; responsible: string; due: string; action: string };', 'type DeviationDraft = { id: string; description: string; priority: Deviation["priority"]; responsible: string; due: string; action: string; validation: string };', "draft validação Hércules")
text = replace_once(text, '  const [scheduleDraft, setScheduleDraft] = useState({ title: initialModels[0].name, location: "", responsible: "", scheduledAt: "" });\n  const [deviationDraft, setDeviationDraft] = useState<DeviationDraft>({ id: "", description: "", priority: "Alta", responsible: "", due: "", action: "" });\n', '  const [scheduleDraft, setScheduleDraft] = useState({ title: "", location: "", responsible: "", scheduledAt: "" });\n  const [deviationDraft, setDeviationDraft] = useState<DeviationDraft>({ id: "", description: "", priority: "Alta", responsible: "", due: "", action: "", validation: "" });\n', "seleções vazias Hércules")
text = replace_once(text, '    updateItem({ result });\n', '    const linkedDeviation = deviations.find((deviation) => deviation.inspectionId === inspection.id && deviation.itemId === currentItem.id);\n    if (currentItem.result === "Não conforme" && result !== "Não conforme" && linkedDeviation) { setToast("O item possui um desvio registrado; valide e encerre a correção antes de alterar o resultado observado"); return; }\n    updateItem({ result });\n', "preservar não conformidade Hércules")
text = replace_once(text, 'setDeviationDraft({ id: "", description: currentItem.label, priority: "Alta", responsible: inspection.responsible, due: "", action: currentItem.note });', 'setDeviationDraft({ id: "", description: currentItem.label, priority: "Alta", responsible: inspection.responsible, due: "", action: currentItem.note, validation: "" });', "novo desvio Hércules")
text = replace_once(text, 'status: "Aberto", action: deviationDraft.action.trim(), evidence: currentItem.evidence', 'status: "Aberto", action: deviationDraft.action.trim(), validation: "", evidence: currentItem.evidence', "criar validação Hércules")
text = replace_once(text, 'setDeviationDraft({ id: deviation.id, description: deviation.description, priority: deviation.priority, responsible: deviation.responsible, due: deviation.due, action: deviation.action });', 'setDeviationDraft({ id: deviation.id, description: deviation.description, priority: deviation.priority, responsible: deviation.responsible, due: deviation.due, action: deviation.action, validation: deviation.validation ?? "" });', "abrir desvio Hércules")
text = replace_once(text, 'due: deviationDraft.due, action: deviationDraft.action.trim() } : item));', 'due: deviationDraft.due, action: deviationDraft.action.trim(), validation: deviationDraft.validation.trim() } : item));', "salvar validação Hércules")
text = replace_once(text, '    if ((next === "Validar" || next === "Encerrado") && !deviation.action.trim()) { openDeviation(deviation); setToast("Registre a ação corretiva antes de avançar"); return; }\n', '    if ((next === "Validar" || next === "Encerrado") && !deviation.action.trim()) { openDeviation(deviation); setToast("Registre a ação corretiva antes de avançar"); return; }\n    if (next === "Encerrado" && !deviation.validation.trim()) { openDeviation(deviation); setToast("Registre como a correção foi verificada antes de encerrar"); return; }\n', "exigir validação Hércules")
text = replace_once(text, '    const model = models.find((item) => item.name === scheduleDraft.title) ?? models[0];\n    if (!model) { setToast("Crie um modelo antes de programar"); return; }\n', '    const model = models.find((item) => item.name === scheduleDraft.title);\n    if (!model) { setToast("Escolha um modelo antes de programar"); return; }\n', "modelo consciente Hércules")
text = replace_once(text, '<Field label="Modelo"><select required value={scheduleDraft.title}', '<Field label="Modelo"><select required value={scheduleDraft.title}', "seletor modelo Hércules")
text = replace_once(text, '<Field label="Modelo"><select required value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))}>{models.map', '<Field label="Modelo"><select required value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))}><option value="">Selecione o modelo</option>{models.map', "placeholder modelo Hércules")
text = replace_once(text, '<Field label="Ação corretiva"><textarea value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))} /></Field></>;', '<Field label="Ação corretiva"><textarea value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))} /></Field><Field label="Como a correção foi verificada" hint="Obrigatório antes do encerramento"><textarea value={draft.validation} onChange={(event) => setDraft((current) => ({ ...current, validation: event.target.value }))} /></Field></>;', "campo validação Hércules")
write(path, text)


# Zeus: liberação somente com conferência explícita e bloqueios de segurança para uso.
path = "components/workspaces/phase-four/ZeusApp.tsx"
text = read(path)
text = replace_once(text, 'type MaintenanceRecord = { id: string; type: string; date: string; odometer: number; cost: number; note: string };', 'type MaintenanceRecord = { id: string; type: string; date: string; odometer: number; cost: number; note: string; verified?: boolean };', "manutenção verificada Zeus")
text = replace_once(text, '  const [maintenanceDraft, setMaintenanceDraft] = useState({ type: "Revisão preventiva", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "" });\n', '  const [maintenanceDraft, setMaintenanceDraft] = useState({ type: "Revisão preventiva", date: new Date().toISOString().slice(0, 10), odometer: "", cost: "", note: "", verified: false });\n', "draft manutenção Zeus")
text = replace_once(text, '      if (!driver || driver.status === "Afastado" || isPast(driver.licenseExpiry)) { setModal(null); setToast("Escolha um motorista disponível com CNH válida"); return; }\n', '      if (!driver || driver.status === "Afastado" || isPast(driver.licenseExpiry)) { setModal(null); setToast("Escolha um motorista disponível com CNH válida"); return; }\n      if (selected.documents.some((document) => isPast(document.expiry))) { setModal(null); setToast("Regularize os documentos vencidos antes de colocar o veículo em uso"); return; }\n      if (selected.odometer >= selected.nextMaintenanceKm || (selected.nextMaintenanceDate && isPast(selected.nextMaintenanceDate))) { setModal(null); setToast("Registre e confira a manutenção vencida antes de colocar o veículo em uso"); return; }\n', "bloqueios para uso Zeus")
text = replace_once(text, '      if (!latest || !latest.note.trim()) { setModal(null); setToast("Registre a manutenção e a conferência antes de liberar o veículo"); return; }\n', '      if (!latest || !latest.verified || !latest.note.trim()) { setModal(null); setToast("Registre uma manutenção concluída e marque a conferência antes de liberar o veículo"); return; }\n', "liberação verificada Zeus")
text = replace_once(text, 'const record: MaintenanceRecord = { id: uid("MAN"), type: maintenanceDraft.type.trim(), date: maintenanceDraft.date, odometer, cost: Math.max(0, Number(maintenanceDraft.cost.replace(",", ".")) || 0), note: maintenanceDraft.note.trim() };', 'const record: MaintenanceRecord = { id: uid("MAN"), type: maintenanceDraft.type.trim(), date: maintenanceDraft.date, odometer, cost: Math.max(0, Number(maintenanceDraft.cost.replace(",", ".")) || 0), note: maintenanceDraft.note.trim(), verified: maintenanceDraft.verified };', "salvar verificação Zeus")
text = replace_once(text, '<Field label="Conferência e observação"><textarea value={maintenanceDraft.note} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Registre o serviço e a conferência necessária para liberar" /></Field><div className={styles.modalActions}>', '<Field label="Conferência e observação"><textarea value={maintenanceDraft.note} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Registre o serviço executado e o resultado da conferência" /></Field><label className={styles.toggleRow}><input type="checkbox" checked={maintenanceDraft.verified} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, verified: event.target.checked }))} /><span><strong>Serviço concluído e veículo conferido</strong><small>Somente registros marcados assim permitem liberar o veículo.</small></span></label><div className={styles.modalActions}>', "checkbox verificação Zeus")
write(path, text)


# Base dos oito verticais: finais múltiplos e transições somente permitidas.
path = "components/workspaces/phase-four/VerticalBusinessApp.tsx"
text = read(path)
text = replace_once(text, '  allowDuplicate?: boolean;\n};', '  allowDuplicate?: boolean;\n  finalStatuses?: string[];\n  operationFinalStatuses?: string[];\n  resourceFinalStatuses?: string[];\n  transitions?: Record<string, string[]>;\n  operationTransitions?: Record<string, string[]>;\n  resourceTransitions?: Record<string, string[]>;\n};', "configuração de fluxos verticais")
text = replace_once(text, 'type ItemTransition = {\n  id: string;\n  title: string;\n  current: string;\n  target: string;\n};', 'type ItemTransition = {\n  id: string;\n  title: string;\n  current: string;\n  target: string;\n  options: string[];\n};', "opções de item vertical")
text = replace_once(text, '  const [itemTransition, setItemTransition] = useState<ItemTransition>({ id: "", title: "", current: "", target: "" });', '  const [itemTransition, setItemTransition] = useState<ItemTransition>({ id: "", title: "", current: "", target: "", options: [] });', "estado opções vertical")
text = replace_once(text, '  const finalStatus = config.statuses.at(-1) ?? "";\n', '  const finalStatus = config.statuses.at(-1) ?? "";\n  const finalStatuses = config.finalStatuses ?? [finalStatus];\n  const operationFinalStatuses = config.operationFinalStatuses ?? [config.operationStatuses.at(-1) ?? ""];\n  const resourceFinalStatuses = config.resourceFinalStatuses ?? [config.resourceStatuses.at(-1) ?? ""];\n  const isFinalRecord = (record: MainRecord) => finalStatuses.includes(record.status);\n', "finais múltiplos vertical")
text = replace_once(text, 'scope === "Finalizados" ? record.status === finalStatus : record.status !== finalStatus', 'scope === "Finalizados" ? isFinalRecord(record) : !isFinalRecord(record)', "escopo final vertical")
text = replace_once(text, '  const nextStatus = selected && linearFlow && currentStatusIndex >= 0 && selected.status !== finalStatus ? config.statuses[currentStatusIndex + 1] : "";\n', '  const nextStatus = selected && linearFlow && currentStatusIndex >= 0 && !isFinalRecord(selected) ? config.statuses[currentStatusIndex + 1] : "";\n', "próxima etapa vertical")
text = replace_once(text, '  const finalizedCount = records.filter((record) => !record.archived && record.status === finalStatus).length;\n  const openCount = records.filter((record) => !record.archived && record.status !== finalStatus).length;\n', '  const finalizedCount = records.filter((record) => !record.archived && isFinalRecord(record)).length;\n  const openCount = records.filter((record) => !record.archived && !isFinalRecord(record)).length;\n', "contadores finais verticais")
text = replace_once(text, '    if (linearFlow) return nextStatus ? [nextStatus] : [];\n    return config.statuses.filter((status) => status !== selected.status);\n', '    if (isFinalRecord(selected)) return [];\n    const configured = config.transitions?.[selected.status];\n    if (configured) return configured.filter((status) => config.statuses.includes(status));\n    const fallback = config.statuses[currentStatusIndex + 1];\n    return fallback ? [fallback] : [];\n', "transições principais verticais")
text = replace_once(text, '    if (target === finalStatus && attentionResources > 0)', '    if (finalStatuses.includes(target) && attentionResources > 0)', "bloqueio final vertical")
text = sub_once(text, r'  function openOperationStatus\(item: RelatedRecord\) \{.*?\n  function confirmItemTransition', '''  function allowedItemTargets(statuses: string[], finals: string[], configured: Record<string, string[]> | undefined, current: string) {
    if (finals.includes(current)) return [];
    const mapped = configured?.[current];
    if (mapped) return mapped.filter((status) => statuses.includes(status));
    const next = statuses[statuses.indexOf(current) + 1];
    return next ? [next] : [];
  }

  function openOperationStatus(item: RelatedRecord) {
    const options = allowedItemTargets(config.operationStatuses, operationFinalStatuses, config.operationTransitions, item.status);
    if (!options.length) { setToast(`${config.operationLabel} já está em uma situação final`); return; }
    setItemTransition({ id: item.id, title: item.title, current: item.status, target: options[0], options });
    setModal("operationStatus");
  }

  function openResourceStatus(item: ResourceRecord) {
    const options = allowedItemTargets(config.resourceStatuses, resourceFinalStatuses, config.resourceTransitions, item.status);
    if (!options.length) { setToast(`${config.resourceLabel} já está em uma situação final`); return; }
    setItemTransition({ id: item.id, title: item.title, current: item.status, target: options[0], options });
    setModal("resourceStatus");
  }

  function confirmItemTransition''', "transições de itens verticais")
text = replace_once(text, 'record.status === finalStatus ? "Consultar conclusão"', 'isFinalRecord(record) ? "Consultar conclusão"', "ação de final vertical")
text = replace_once(text, 'finalStatus={config.operationStatuses.at(-1) ?? ""}', 'finalStatuses={operationFinalStatuses}', "listagem operações final vertical")
text = replace_once(text, 'finalStatus={config.resourceStatuses.at(-1) ?? ""}', 'finalStatuses={resourceFinalStatuses}', "listagem recursos final vertical")
text = replace_once(text, '{config.operationStatuses.filter((status) => status !== itemTransition.current).map((status) => <option key={status}>{status}</option>)}', '{itemTransition.options.map((status) => <option key={status}>{status}</option>)}', "opções modal operação vertical")
text = replace_once(text, '{config.resourceStatuses.filter((status) => status !== itemTransition.current).map((status) => <option key={status}>{status}</option>)}', '{itemTransition.options.map((status) => <option key={status}>{status}</option>)}', "opções modal recurso vertical")
text = replace_once(text, 'function ListingPage({ title, description, icon, items, statuses, finalStatus, onRow }: { title: string; description: string; icon: IconName; items: ListingItem[]; statuses: string[]; finalStatus: string; onRow: (item: ListingItem) => void })', 'function ListingPage({ title, description, icon, items, statuses, finalStatuses, onRow }: { title: string; description: string; icon: IconName; items: ListingItem[]; statuses: string[]; finalStatuses: string[]; onRow: (item: ListingItem) => void })', "assinatura ListingPage vertical")
text = replace_once(text, '(scope === "Finalizados" ? item.status === finalStatus : item.status !== finalStatus)', '(scope === "Finalizados" ? finalStatuses.includes(item.status) : !finalStatuses.includes(item.status))', "escopo ListingPage vertical")
text = replace_once(text, '  }, [finalStatus, items, query, scope, sort, status, statuses]);\n  const openCount = items.filter((item) => item.status !== finalStatus).length;\n  const finishedCount = items.filter((item) => item.status === finalStatus).length;\n', '  }, [finalStatuses, items, query, scope, sort, status, statuses]);\n  const openCount = items.filter((item) => !finalStatuses.includes(item.status)).length;\n  const finishedCount = items.filter((item) => finalStatuses.includes(item.status)).length;\n', "contadores ListingPage vertical")
write(path, text)


# Configurações específicas dos oito verticais.
path = "components/workspaces/phase-four/NewVerticalApps.tsx"
text = read(path)
configs = {
    '  primaryAction: "Nova obra",\n  linearFlow: false,\n  allowDuplicate: false,\n};': '''  primaryAction: "Nova obra",
  linearFlow: false,
  allowDuplicate: false,
  finalStatuses: ["Arquivada"],
  operationFinalStatuses: ["Devolvido", "Cancelado"],
  resourceFinalStatuses: ["Extraviado"],
  transitions: { "Em catalogação": ["Disponível"], "Disponível": ["Sem exemplar disponível", "Arquivada"], "Sem exemplar disponível": ["Disponível", "Arquivada"] },
};''',
    '  primaryAction: "Novo imóvel",\n  linearFlow: false,\n};': '''  primaryAction: "Novo imóvel",
  linearFlow: false,
  finalStatuses: ["Indisponível", "Negócio concluído"],
  operationFinalStatuses: ["Aceita", "Recusada", "Cancelada"],
  resourceFinalStatuses: ["Sem interesse", "Concluído"],
  transitions: { "Em captação": ["Aguardando informações"], "Aguardando informações": ["Disponível"], "Disponível": ["Em negociação", "Indisponível"], "Em negociação": ["Disponível", "Indisponível", "Negócio concluído"], "Indisponível": ["Disponível"] },
};''',
    '  primaryAction: "Novo bem",\n  linearFlow: false,\n  allowDuplicate: false,\n};': '''  primaryAction: "Novo bem",
  linearFlow: false,
  allowDuplicate: false,
  finalStatuses: ["Baixado"],
  operationFinalStatuses: ["Concluída", "Cancelada"],
  resourceFinalStatuses: [],
  transitions: { "Disponível": ["Em uso", "Emprestado", "Em manutenção", "Não localizado", "Baixado"], "Em uso": ["Disponível", "Em manutenção", "Não localizado", "Baixado"], "Emprestado": ["Disponível", "Em manutenção", "Não localizado", "Baixado"], "Em manutenção": ["Disponível", "Baixado"], "Não localizado": ["Disponível", "Baixado"] },
};''',
    '  primaryAction: "Novo evento",\n  linearFlow: false,\n};': '''  primaryAction: "Novo evento",
  linearFlow: false,
  finalStatuses: ["Encerrado", "Cancelado"],
  operationFinalStatuses: ["Concluída", "Cancelada"],
  resourceFinalStatuses: ["Não participará", "Presente", "Ausente"],
  transitions: { "Em planejamento": ["Convites enviados", "Cancelado"], "Convites enviados": ["Em preparação", "Cancelado"], "Em preparação": ["Em realização", "Cancelado"], "Em realização": ["Encerrado"] },
};''',
    '  primaryAction: "Nova oportunidade",\n  linearFlow: false,\n};': '''  primaryAction: "Nova oportunidade",
  linearFlow: false,
  finalStatuses: ["Não participar", "Vencedora", "Perdida", "Cancelada"],
  operationFinalStatuses: ["Concluído", "Não se aplica"],
  resourceFinalStatuses: ["Não se aplica"],
  transitions: { "Nova oportunidade": ["Em triagem"], "Em triagem": ["Não participar", "Preparando proposta"], "Preparando proposta": ["Proposta enviada", "Cancelada"], "Proposta enviada": ["Em sessão", "Cancelada"], "Em sessão": ["Habilitação", "Perdida", "Cancelada"], "Habilitação": ["Vencedora", "Perdida", "Cancelada"] },
  operationTransitions: { "Pendente": ["Em preparação", "Não se aplica"], "Em preparação": ["Aguardando informação", "Enviado", "Concluído"], "Aguardando informação": ["Em preparação", "Atrasado"], "Enviado": ["Concluído"], "Atrasado": ["Em preparação", "Concluído"] },
};''',
    '  primaryAction: "Novo ciclo",\n  linearFlow: false,\n};': '''  primaryAction: "Novo ciclo",
  linearFlow: false,
  finalStatuses: ["Concluído", "Interrompido"],
  operationFinalStatuses: ["Executada", "Resolvida", "Cancelada"],
  resourceFinalStatuses: ["Arquivado"],
  transitions: { "Planejado": ["Em preparação", "Interrompido"], "Em preparação": ["Em produção", "Interrompido"], "Em produção": ["Produção prevista", "Concluído", "Interrompido"], "Produção prevista": ["Concluído", "Interrompido"], "Interrompido": ["Em preparação"] },
};''',
    '  primaryAction: "Novo pet",\n  linearFlow: false,\n  allowDuplicate: false,\n};': '''  primaryAction: "Novo pet",
  linearFlow: false,
  allowDuplicate: false,
  finalStatuses: ["Inativo"],
  operationFinalStatuses: ["Entregue", "Faltou", "Cancelado"],
  resourceFinalStatuses: ["Concluído", "Cancelado"],
  transitions: { "Ativo": ["Atenção especial", "Inativo"], "Atenção especial": ["Ativo", "Inativo"], "Inativo": ["Ativo"] },
};''',
    '  primaryAction: "Nova obra",\n  linearFlow: false,\n};': '''  primaryAction: "Nova obra",
  linearFlow: false,
  finalStatuses: ["Entregue", "Cancelada"],
  operationFinalStatuses: ["Concluída", "Cancelada"],
  resourceFinalStatuses: ["Recusada", "Substituída"],
  transitions: { "Orçamento": ["Em planejamento", "Cancelada"], "Em planejamento": ["Em execução", "Cancelada"], "Em execução": ["Em vistoria", "Cancelada"], "Em vistoria": ["Em correção", "Entregue"], "Em correção": ["Em vistoria", "Entregue"] },
};''',
}
for old, new in configs.items():
    text = replace_once(text, old, new, f"configuração vertical {new.splitlines()[0]}")
write(path, text)

print("Correções da auditoria de processos aplicadas.")
