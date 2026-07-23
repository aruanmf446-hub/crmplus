from pathlib import Path

path = Path("scripts/audit-processes.mjs")
text = path.read_text(encoding="utf-8")
text = text.replace(
    "async function open(slug, setup) {\n  const page = await context.newPage();",
    "async function open(slug, setup, setupArg) {\n  const page = await context.newPage();",
    1,
)
text = text.replace(
    "  if (setup) await page.addInitScript(setup);",
    "  if (setup) await page.addInitScript(setup, setupArg);",
    1,
)
old = '''for (const [slug, terminal] of Object.entries(verticalFinals)) {
  const setup = ({ slug, terminal }) => {
    const make = (id, title, status) => ({ id, title, subtitle: `Teste ${slug}`, status, owner: "Agente QA", updated: "agora", archived: false, data: { test: "preenchido" }, history: [{ text: "Teste", date: "Agora" }], attachments: [] });
    localStorage.setItem(`crmplus.${slug}.records.v2`, JSON.stringify({ version: 1, value: [make("FINAL-QA", `Final ${slug}`, terminal), make("OPEN-QA", `Aberto ${slug}`, "__OPEN__")] }));
  };
  // A etapa aberta precisa ser válida para não distorcer a ordenação; substituímos após carregar a configuração visual.
  const { page, errors } = await open(slug, () => setup({ slug, terminal }));
'''
new = '''for (const [slug, terminal] of Object.entries(verticalFinals)) {
  const setup = ({ slug, terminal }) => {
    const make = (id, title, status) => ({ id, title, subtitle: `Teste ${slug}`, status, owner: "Agente QA", updated: "agora", archived: false, data: { test: "preenchido" }, history: [{ text: "Teste", date: "Agora" }], attachments: [] });
    localStorage.setItem(`crmplus.${slug}.records.v2`, JSON.stringify({ version: 1, value: [make("FINAL-QA", `Final ${slug}`, terminal), make("OPEN-QA", `Aberto ${slug}`, "__OPEN__")] }));
  };
  // A etapa aberta precisa ser válida para não distorcer a ordenação; substituímos após carregar a configuração visual.
  const { page, errors } = await open(slug, setup, { slug, terminal });
'''
if old not in text:
    raise RuntimeError("Bloco vertical do agente não encontrado")
text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("Agente de auditoria preparado.")
