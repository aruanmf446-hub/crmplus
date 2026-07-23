import fs from "node:fs/promises";

const path = ".github/workflows/branch-validation.yml";
let content = await fs.readFile(path, "utf8");
const before = `          git add -A\n          if git diff --cached --quiet; then`;
const after = `          git add -u\n          git add package-lock.json audits/branch-validation.txt\n          if git diff --cached --quiet; then`;
if (!content.includes(before)) throw new Error("Trecho de staging do workflow não foi encontrado");
content = content.replace(before, after);
await fs.writeFile(path, content, "utf8");
console.log("Workflow limitado a arquivos rastreados e relatório.");
