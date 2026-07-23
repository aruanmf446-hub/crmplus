import fs from "node:fs";

const file = "scripts/audit-processes.mjs";
let source = fs.readFileSync(file, "utf8");

const replacements = [
  ['itemDialog.getByLabel("Item", { exact: true })', 'itemDialog.getByLabel(/^Item/)'],
  ['page.getByLabel("PIN local", { exact: true })', 'page.getByLabel(/^PIN local/)'],
];

for (const [before, after] of replacements) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`Esperava uma ocorrência de ${before}; encontrei ${count}.`);
  source = source.replace(before, after);
}

fs.writeFileSync(file, source, "utf8");
console.log("Seletores finais do QA atualizados.");
