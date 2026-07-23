import fs from "node:fs";

const file = "scripts/audit-processes.mjs";
let source = fs.readFileSync(file, "utf8");

const replacements = [
  ['commandDialog.getByLabel("Mesa", { exact: true })', 'commandDialog.getByLabel(/^Mesa/)'],
  ['dialog.getByLabel("Tema", { exact: true })', 'dialog.getByLabel(/^Tema/)'],
  ['page.getByLabel("Confirmar nova senha", { exact: true })', 'page.getByLabel(/^Confirmar nova senha/)'],
];

for (const [before, after] of replacements) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`Esperava uma ocorrência de: ${before}. Encontradas: ${occurrences}`);
  source = source.replace(before, after);
}

fs.writeFileSync(file, source, "utf8");
console.log("Seletores acessíveis dos processos ajustados.");
