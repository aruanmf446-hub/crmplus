import fs from "node:fs/promises";

async function patch(path, transform) {
  const content = await fs.readFile(path, "utf8");
  const next = transform(content);
  if (next === content) throw new Error(`Nenhuma mudança aplicada em ${path}`);
  await fs.writeFile(path, next, "utf8");
  console.log(`Integridade atualizada: ${path}`);
}

function replaceExact(content, before, after, label) {
  if (!content.includes(before)) throw new Error(`Trecho não encontrado: ${label}`);
  return content.replace(before, after);
}

await patch("components/workspaces/phase-four/AtlasApp.tsx", (source) => {
  const before = `  function createOrder() {
    if (!orderDraft.customer.trim() || !orderDraft.vehicle.trim() || !orderDraft.plate.trim() || !orderDraft.complaint.trim()) { setToast("Preencha cliente, veículo, placa e relato"); return; }
    const order: WorkOrder = { id: uid("OS"), customer: orderDraft.customer.trim(), phone: orderDraft.phone.trim(), vehicle: orderDraft.vehicle.trim(), plate: orderDraft.plate.trim().toUpperCase(), complaint: orderDraft.complaint.trim(), diagnosis: "", technician: "", status: "Aguardando avaliação", approved: false, estimateSent: false, archived: false, updated: todayLabel(), notes: [], evidence: [], quoteItems: [], history: [{ text: "Atendimento criado", date: todayLabel() }] };`;
  const after = `  function createOrder() {
    const plate = orderDraft.plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const phone = orderDraft.phone.replace(/\\D/g, "").slice(0, 11);
    if (!orderDraft.customer.trim() || !orderDraft.vehicle.trim() || !plate || !orderDraft.complaint.trim()) { setToast("Preencha cliente, veículo, placa e relato"); return; }
    const duplicateOpenOrder = orders.find((item) => item.plate.replace(/[^A-Z0-9]/g, "") === plate && item.status !== "Entregue" && !item.archived);
    if (duplicateOpenOrder) { setToast(\`Já existe um atendimento aberto para esta placa: \${duplicateOpenOrder.id}\`); return; }
    const order: WorkOrder = { id: uid("OS"), customer: orderDraft.customer.trim(), phone, vehicle: orderDraft.vehicle.trim(), plate, complaint: orderDraft.complaint.trim(), diagnosis: "", technician: "", status: "Aguardando avaliação", approved: false, estimateSent: false, archived: false, updated: todayLabel(), notes: [], evidence: [], quoteItems: [], history: [{ text: "Atendimento criado", date: todayLabel() }] };`;
  return replaceExact(source, before, after, "criação de OS do Atlas");
});

await patch("components/workspaces/phase-four/ZeusApp.tsx", (source) => {
  let next = replaceExact(source,
    `    const plate = vehicleDraft.plate.trim().toUpperCase();\n    if (!vehicleDraft.model.trim() || !plate) { setToast("Informe modelo e placa"); return; }\n    if (vehicles.some((vehicle) => vehicle.plate === plate)) { setToast("Já existe um veículo com esta placa"); return; }`,
    `    const plate = vehicleDraft.plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");\n    if (!vehicleDraft.model.trim() || !plate) { setToast("Informe modelo e placa"); return; }\n    if (vehicles.some((vehicle) => vehicle.plate.replace(/[^A-Z0-9]/g, "") === plate)) { setToast("Já existe um veículo com esta placa"); return; }`,
    "placa do Zeus");
  next = replaceExact(next,
    `    if (maintenanceDraft.verified && !maintenanceDraft.note.trim()) { setToast("Descreva o serviço e a conferência antes de marcar como concluído"); return; }\n    const odometer = Math.max(selected.odometer, Number(maintenanceDraft.odometer) || selected.odometer);`,
    `    if (maintenanceDraft.verified && !maintenanceDraft.note.trim()) { setToast("Descreva o serviço e a conferência antes de marcar como concluído"); return; }\n    const informedOdometer = Number(maintenanceDraft.odometer) || selected.odometer;\n    if (informedOdometer < selected.odometer) { setToast(\`A quilometragem não pode ser menor que \${selected.odometer.toLocaleString("pt-BR")} km\`); return; }\n    const odometer = informedOdometer;`,
    "quilometragem de manutenção do Zeus");
  next = replaceExact(next,
    `  function addFuel() { if (!selected) return; const liters = Number(fuelDraft.liters.replace(",", ".")) || 0; const cost = Number(fuelDraft.cost.replace(",", ".")) || 0; const odometer = Number(fuelDraft.odometer) || selected.odometer; if (liters <= 0 || cost <= 0 || odometer < selected.odometer) { setToast("Revise litros, valor e quilometragem"); return; }`,
    `  function addFuel() { if (!selected) return; const liters = Number(fuelDraft.liters.replace(",", ".")) || 0; const cost = Number(fuelDraft.cost.replace(",", ".")) || 0; const odometer = Number(fuelDraft.odometer) || selected.odometer; if (!fuelDraft.date || !fuelDraft.station.trim()) { setToast("Informe data e posto do abastecimento"); return; } if (liters <= 0 || cost <= 0 || odometer < selected.odometer) { setToast("Revise litros, valor e quilometragem"); return; }`,
    "abastecimento do Zeus");
  return next;
});

await patch("components/workspaces/phase-four/PoseidonApp.tsx", (source) => replaceExact(source,
  `    const opportunity = opportunities.find((item) => item.id === activityDraft.opportunityId);\n    if (!opportunity) { setToast("Selecione uma oportunidade"); return; }\n    if (!activityDraft.date || !activityDraft.time) { setToast("Informe data e horário"); return; }`,
  `    const opportunity = opportunities.find((item) => item.id === activityDraft.opportunityId);\n    if (!opportunity) { setToast("Selecione uma oportunidade"); return; }\n    if (["Ganha", "Perdida"].includes(opportunity.stage)) { setToast("Não é possível criar atividade em uma oportunidade encerrada"); return; }\n    if (!activityDraft.date || !activityDraft.time) { setToast("Informe data e horário"); return; }`,
  "atividade do Poseidon"));

await patch("components/workspaces/phase-four/PandoraApp.tsx", (source) => replaceExact(source,
  `    const name = surveyDraft.name.trim(); const question = surveyDraft.question.trim();\n    if (!name || !question) { setToast("Informe nome e pergunta da pesquisa"); return; }\n    if (surveyDraft.id) {`,
  `    const name = surveyDraft.name.trim(); const question = surveyDraft.question.trim();\n    if (!name || !question) { setToast("Informe nome e pergunta da pesquisa"); return; }\n    if (surveys.some((survey) => survey.id !== surveyDraft.id && survey.name.trim().toLowerCase() === name.toLowerCase())) { setToast("Já existe uma pesquisa com este nome"); return; }\n    if (surveyDraft.id) {`,
  "pesquisa duplicada do Pandora"));

await patch("components/workspaces/phase-four/HerculesApp.tsx", (source) => replaceExact(source,
  `    const files = Array.from(event.target.files).slice(0, 3);\n    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha imagens menores, com até 700 KB cada"); event.target.value = ""; return; }\n    const urls = await Promise.all(files.map(fileToDataUrl)); updateItem({ evidence: [...currentItem.evidence, ...urls] }); setToast("Evidências adicionadas"); event.target.value = "";`,
  `    const remaining = Math.max(0, 8 - currentItem.evidence.length);\n    if (!remaining) { setToast("Este item já atingiu o limite de 8 evidências"); event.target.value = ""; return; }\n    const files = Array.from(event.target.files).slice(0, Math.min(3, remaining));\n    if (files.some((file) => file.size > 700 * 1024)) { setToast("Escolha imagens menores, com até 700 KB cada"); event.target.value = ""; return; }\n    const urls = await Promise.all(files.map(fileToDataUrl)); updateItem({ evidence: [...currentItem.evidence, ...urls] }); setToast(\`\${urls.length} evidência(s) adicionada(s)\`); event.target.value = "";`,
  "limite de evidências do Hercules"));
