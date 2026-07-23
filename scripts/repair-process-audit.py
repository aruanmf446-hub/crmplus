from pathlib import Path

path = Path("scripts/audit-processes.mjs")
text = path.read_text(encoding="utf-8")
old_open = "async function open(slug, setup) {\n  const page = await context.newPage();"
new_open = "async function open(slug, setup, setupArg) {\n  const page = await context.newPage();"
old_init = "  if (setup) await page.addInitScript(setup);"
new_init = "  if (setup) await page.addInitScript(setup, setupArg);"
old_vertical = '''for (const [slug, terminal] of Object.entries(verticalFinals)) {
  const setup = ({ slug, terminal }) => {
    const make = (id, title, status) => ({ id, title, subtitle: `Teste ${slug}`, status, owner: "Agente QA", updated: "agora", archived: false, data: { test: "preenchido" }, history: [{ text: "Teste", date: "Agora" }], attachments: [] });
    localStorage.setItem(`crmplus.${slug}.records.v2`, JSON.stringify({ version: 1, value: [make("FINAL-QA", `Final ${slug}`, terminal), make("OPEN-QA", `Aberto ${slug}`, "__OPEN__")] }));
  };
  // A etapa aberta precisa ser válida para não distorcer a ordenação; substituímos após carregar a configuração visual.
  const { page, errors } = await open(slug, () => setup({ slug, terminal }));
'''
new_vertical = '''for (const [slug, terminal] of Object.entries(verticalFinals)) {
  const setup = ({ slug, terminal }) => {
    const make = (id, title, status) => ({ id, title, subtitle: `Teste ${slug}`, status, owner: "Agente QA", updated: "agora", archived: false, data: { test: "preenchido" }, history: [{ text: "Teste", date: "Agora" }], attachments: [] });
    localStorage.setItem(`crmplus.${slug}.records.v2`, JSON.stringify({ version: 1, value: [make("FINAL-QA", `Final ${slug}`, terminal), make("OPEN-QA", `Aberto ${slug}`, "__OPEN__")] }));
  };
  // A etapa aberta precisa ser válida para não distorcer a ordenação; substituímos após carregar a configuração visual.
  const { page, errors } = await open(slug, setup, { slug, terminal });
'''
changed = False
if old_open in text:
    text = text.replace(old_open, new_open, 1)
    changed = True
if old_init in text:
    text = text.replace(old_init, new_init, 1)
    changed = True
if old_vertical in text:
    text = text.replace(old_vertical, new_vertical, 1)
    changed = True
if not changed and not (new_open in text and new_init in text and new_vertical in text):
    raise RuntimeError("Estrutura do agente não reconhecida")
path.write_text(text, encoding="utf-8")
print("Agente de auditoria preparado ou já atualizado.")
