import fs from "node:fs/promises";

const path = "scripts/audit-processes.mjs";
let content = await fs.readFile(path, "utf8");
const before = `  try {
    await page.evaluate(({ slug }) => {
      const key = \`crmplus.\${slug}.records.v2\`;
      const parsed = JSON.parse(localStorage.getItem(key));
      const select = document.querySelector('select[aria-label="Filtrar por situação"]');
      const first = select?.querySelector('option:not([value="Todos"])')?.textContent || "";
      parsed.value[1].status = first;
      localStorage.setItem(key, JSON.stringify(parsed));
    }, { slug });
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Finalizados/ }).click();`;
const after = `  try {
    const mainAreaButton = page.locator('nav[aria-label^="Navegação"] button').nth(1);
    await mainAreaButton.click();
    await page.evaluate(({ slug }) => {
      const key = \`crmplus.\${slug}.records.v2\`;
      const parsed = JSON.parse(localStorage.getItem(key));
      const select = document.querySelector('select[aria-label="Filtrar por situação"]');
      const first = select?.querySelector('option:not([value="Todos"])')?.textContent || "";
      if (!first) throw new Error("A lista principal não expôs as situações configuradas");
      parsed.value[1].status = first;
      localStorage.setItem(key, JSON.stringify(parsed));
    }, { slug });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator('nav[aria-label^="Navegação"] button').nth(1).click();
    await page.getByRole("button", { name: /Finalizados/ }).click();`;
if (!content.includes(before)) throw new Error("Trecho vertical esperado não foi encontrado no agente de processos");
content = content.replace(before, after);
await fs.writeFile(path, content, "utf8");
console.log("Agente de processos atualizado para as novas homes verticais.");
