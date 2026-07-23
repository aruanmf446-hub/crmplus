import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.CRMPLUS_AUDIT_URL || "http://127.0.0.1:4173/crmplus";
const slugs = [
  "atlas", "ares", "artemis", "pandora", "poseidon", "hercules", "zeus",
  "alexandria", "olympus", "argus", "hermes", "athena", "gaia", "pegasus", "titans",
];
const verticalFinals = {
  alexandria: "Arquivada",
  olympus: "Negócio concluído",
  argus: "Baixado",
  hermes: "Encerrado",
  athena: "Vencedora",
  gaia: "Interrompido",
  pegasus: "Inativo",
  titans: "Entregue",
};

await fs.mkdir("artifacts/process-audit", { recursive: true });
const failures = [];
const passes = [];

function fail(slug, test, error) {
  failures.push(`${slug} · ${test} · ${error instanceof Error ? error.message : String(error)}`);
}

function pass(slug, test) {
  passes.push(`${slug} · ${test}`);
}

async function assert(slug, test, condition, message, page) {
  if (!condition) {
    fail(slug, test, message);
    if (page) {
      await page.screenshot({
        path: `artifacts/process-audit/${slug}-${test.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`,
        fullPage: true,
      }).catch(() => undefined);
    }
    return false;
  }
  pass(slug, test);
  return true;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript((apps) => {
  localStorage.setItem("crmplus.color-mode", "light");
  localStorage.setItem("crmplus.access.account", JSON.stringify({
    name: "Auditoria de processos",
    company: "CRM Plus QA",
    email: "qa@crmplus.local",
    password: "Teste1234",
    pin: "2468",
  }));
  for (const slug of apps) localStorage.setItem(`crmplus.access.${slug}.session`, "active");
}, slugs);

async function open(slug, setup, setupArg) {
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  if (setup) await page.addInitScript(setup, setupArg);
  await page.goto(`${baseUrl}/sistemas/${slug}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForSelector(`[data-product="${slug}"]`, { timeout: 30_000 });
  return { page, errors };
}

async function closePage(page) {
  await page.close().catch(() => undefined);
}

async function openVerticalRecords(page) {
  const navButtons = page.locator('nav[aria-label^="Navegação"] button');
  await assert("qa", "menu vertical possui área de registros", await navButtons.count() >= 2, "menu vertical incompleto", page);
  await navButtons.nth(1).click();
  await page.locator('select[aria-label="Filtrar por situação"]').waitFor();
}

// Navegação e seleção inicial em todos os aplicativos.
for (const slug of slugs) {
  const { page, errors } = await open(slug);
  try {
    const selected = await page.locator('[class*="recordSelected"], [class*="salesSelected"], [class*="floorSelected"], [class*="checkCurrent"]').count();
    await assert(slug, "entrada sem seleção automática", selected === 0, `foram encontrados ${selected} elementos selecionados`, page);
    const navButtons = page.locator('nav[aria-label^="Navegação"] button');
    const count = await navButtons.count();
    for (let index = 0; index < count; index += 1) {
      await navButtons.nth(index).click();
      await page.waitForTimeout(80);
    }
    await assert(slug, "todas as áreas do menu abrem", errors.length === 0, errors.join(" | ") || "erro de navegação", page);
  } catch (error) {
    fail(slug, "navegação geral", error);
  }
  await closePage(page);
}

// Atlas: orçamento aprovado não pode ser alterado durante execução.
{
  const { page, errors } = await open("atlas");
  try {
    await page.getByRole("button", { name: /Fiat Strada/ }).click();
    await assert("atlas", "orçamento aprovado bloqueado", await page.getByRole("button", { name: /Adicionar item/ }).count() === 0, "botão Adicionar item ainda aparece em Em serviço", page);
    await assert("atlas", "itens aprovados sem remoção", await page.getByRole("button", { name: /Remover / }).count() === 0, "item aprovado ainda pode ser removido", page);
    await assert("atlas", "sem erro no bloqueio", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("atlas", "orçamento aprovado", error);
  }
  await closePage(page);
}

// Ares: vencida aparece no histórico e não oferece avanço de decisão.
{
  const setup = () => {
    localStorage.setItem("crmplus.ares.quotes.v2", JSON.stringify({
      version: 1,
      value: [{
        id: "ORC-EXP",
        client: "Cliente Vencido",
        title: "Proposta vencida",
        status: "Enviado",
        validity: "2026-01-01",
        updated: "agora",
        notes: "",
        decisionNote: "",
        version: 1,
        history: [{ text: "Enviada", date: "Ontem" }],
        items: [{ id: "I-1", description: "Serviço", quantity: 1, unitPrice: 100 }],
      }],
    }));
  };
  const { page, errors } = await open("ares", setup);
  try {
    await page.getByRole("button", { name: /Finalizadas/ }).click();
    await page.getByRole("button", { name: /Cliente Vencido/ }).click();
    await assert("ares", "vencimento refletido no detalhe", (await page.locator("main").innerText()).includes("Expirado"), "detalhe não mostrou Expirado", page);
    await assert("ares", "vencida sem avanço", await page.getByRole("button", { name: /Registrar|Aprovar|Recusar|Enviar proposta/ }).count() === 0, "proposta vencida ainda oferece transição", page);
    await assert("ares", "sem erro na proposta vencida", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("ares", "proposta vencida", error);
  }
  await closePage(page);
}

// Artemis: comandos globais não escolhem mesa ou produto por conta própria.
{
  const { page, errors } = await open("artemis");
  try {
    await page.getByRole("button", { name: "Nova comanda" }).click();
    const commandDialog = page.getByRole("dialog");
    await assert("artemis", "nova comanda sem mesa pré-selecionada", await commandDialog.getByLabel(/^Mesa/).inputValue() === "", "uma mesa veio escolhida", page);
    await commandDialog.getByRole("button", { name: "Cancelar" }).click();
    await page.getByRole("button", { name: /Mesa 02/ }).click();
    await page.getByRole("button", { name: "Adicionar novo pedido" }).click();
    const itemDialog = page.getByRole("dialog");
    await assert("artemis", "novo pedido sem item pré-selecionado", await itemDialog.getByLabel("Item", { exact: true }).inputValue() === "", "um produto veio escolhido", page);
    await assert("artemis", "sem erro nas escolhas", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("artemis", "seleções conscientes", error);
  }
  await closePage(page);
}

// Pandora: nota e tema exigem escolha explícita.
{
  const { page, errors } = await open("pandora");
  try {
    await page.getByRole("button", { name: "Pesquisas" }).click();
    await page.getByRole("button", { name: "Registrar resposta" }).first().click();
    const dialog = page.getByRole("dialog");
    await assert("pandora", "resposta sem nota automática", await dialog.getByLabel("Nota", { exact: true }).inputValue() === "", "nota veio preenchida", page);
    await assert("pandora", "resposta sem tema automático", await dialog.getByLabel(/^Tema/).inputValue() === "", "tema veio preenchido", page);
    await assert("pandora", "sem erro no formulário", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("pandora", "resposta consciente", error);
  }
  await closePage(page);
}

// Poseidon: encerramento preserva atividade pendente como cancelada.
{
  const { page, errors } = await open("poseidon");
  try {
    await page.getByRole("button", { name: /Academia Elite/ }).click();
    await page.getByRole("button", { name: "Marcar como ganha" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /Confirmar/ }).last().click();
    await page.getByRole("button", { name: "Atividades" }).click();
    await page.getByRole("button", { name: /Histórico/ }).click();
    const activityText = await page.locator("main").innerText();
    await assert("poseidon", "atividade preservada ao encerrar", activityText.includes("Academia Elite") && activityText.includes("Cancelada"), "atividade pendente desapareceu ou não foi marcada cancelada", page);
    await assert("poseidon", "sem erro no encerramento", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("poseidon", "preservação de atividades", error);
  }
  await closePage(page);
}

// Hércules: encerramento de desvio exige descrição da validação.
{
  const setup = () => {
    localStorage.setItem("crmplus.hercules.deviations", JSON.stringify({
      version: 1,
      value: [{
        id: "NC-QA",
        inspectionId: "INS-2048",
        itemId: "ITEM-QA",
        description: "Proteção ausente",
        priority: "Alta",
        responsible: "Paulo",
        due: "2026-12-31",
        status: "Validar",
        action: "Proteção instalada",
        validation: "",
        evidence: [],
      }],
    }));
  };
  const { page, errors } = await open("hercules", setup);
  try {
    await page.getByRole("button", { name: "Desvios" }).click();
    await page.getByRole("button", { name: "Confirmar encerramento" }).click();
    const dialog = page.getByRole("dialog");
    await assert("hercules", "validação exigida antes de encerrar", (await dialog.innerText()).includes("Como a correção foi verificada"), "encerramento abriu sem exigir validação", page);
    await assert("hercules", "sem erro ao exigir validação", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("hercules", "validação do desvio", error);
  }
  await closePage(page);
}

// Zeus: manutenção antiga ou não conferida não libera o veículo.
{
  const { page, errors } = await open("zeus");
  try {
    await page.getByRole("button", { name: /Volkswagen Saveiro/ }).click();
    await page.getByRole("button", { name: "Confirmar disponibilidade" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Confirmar mudança" }).click();
    await page.waitForTimeout(120);
    const text = await page.locator("body").innerText();
    await assert("zeus", "liberação exige manutenção conferida", text.includes("manutenção concluída") || text.includes("marque a conferência"), "veículo em manutenção foi liberado sem conferência", page);
    await assert("zeus", "permanece em manutenção", (await page.locator("main").innerText()).includes("Manutenção"), "status mudou indevidamente", page);
    await assert("zeus", "sem erro no bloqueio", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("zeus", "liberação de manutenção", error);
  }
  await closePage(page);
}

// Oito verticais: cada status terminal deve aparecer em Finalizados, não em andamento.
for (const [slug, terminal] of Object.entries(verticalFinals)) {
  const setup = ({ slug, terminal }) => {
    const make = (id, title, status) => ({
      id,
      title,
      subtitle: `Teste ${slug}`,
      status,
      owner: "Agente QA",
      updated: "agora",
      archived: false,
      data: { test: "preenchido" },
      history: [{ text: "Teste", date: "Agora" }],
      attachments: [],
    });
    localStorage.setItem(`crmplus.${slug}.records.v2`, JSON.stringify({
      version: 1,
      value: [make("FINAL-QA", `Final ${slug}`, terminal), make("OPEN-QA", `Aberto ${slug}`, "__OPEN__")],
    }));
  };

  const { page, errors } = await open(slug, setup, { slug, terminal });
  try {
    await openVerticalRecords(page);
    await page.evaluate(({ slug }) => {
      const key = `crmplus.${slug}.records.v2`;
      const parsed = JSON.parse(localStorage.getItem(key));
      const select = document.querySelector('select[aria-label="Filtrar por situação"]');
      const first = select?.querySelector('option:not([value="Todos"])')?.textContent || "";
      parsed.value[1].status = first;
      localStorage.setItem(key, JSON.stringify(parsed));
    }, { slug });
    await page.reload({ waitUntil: "networkidle" });
    await openVerticalRecords(page);
    await page.getByRole("button", { name: /Finalizados/ }).click();
    const mainText = await page.locator("main").innerText();
    await assert(slug, "status terminal no histórico", mainText.includes(`Final ${slug}`) && !mainText.includes(`Aberto ${slug}`), `status ${terminal} não foi separado corretamente`, page);
    await assert(slug, "sem erro na classificação final", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail(slug, "classificação de finalizados", error);
  }
  await closePage(page);
}

// Conta local: recuperação valida e-mail e PIN, protege a nova senha e inicia a sessão.
{
  const authContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await authContext.addInitScript(() => {
    localStorage.setItem("crmplus.color-mode", "light");
    localStorage.setItem("crmplus.access.account", JSON.stringify({
      name: "Usuário QA",
      company: "Empresa QA",
      email: "recuperacao@example.com",
      password: "Senha1234",
      pin: "2468",
    }));
    localStorage.removeItem("crmplus.access.atlas.session");
  });
  const page = await authContext.newPage();
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  try {
    await page.goto(`${baseUrl}/sistemas/atlas/?modo=recuperar-senha`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.getByRole("heading", { name: "Redefinir senha", exact: true }).waitFor({ timeout: 30_000 });
    await assert("acesso", "recuperação abre no modo correto", await page.getByRole("heading", { name: "Redefinir senha", exact: true }).count() === 1, "a rota abriu no login comum", page);
    await page.getByLabel("E-mail", { exact: true }).fill("recuperacao@example.com");
    await page.getByLabel("Nova senha", { exact: true }).fill("NovaSenha123");
    await page.getByLabel(/^Confirmar nova senha/).fill("NovaSenha123");
    await page.getByLabel("PIN local", { exact: true }).fill("2468");
    await page.getByRole("button", { name: "Redefinir senha e entrar", exact: true }).click();
    await page.waitForSelector('[data-product="atlas"]', { timeout: 30_000 });
    const recoveryState = await page.evaluate(() => ({
      account: JSON.parse(localStorage.getItem("crmplus.access.account") || "null"),
      session: localStorage.getItem("crmplus.access.atlas.session"),
    }));
    await assert("acesso", "nova senha protegida localmente", recoveryState.account?.passwordHash?.length === 64 && !recoveryState.account?.password, "a nova senha não foi protegida por hash", page);
    await assert("acesso", "PIN protegido localmente", recoveryState.account?.pinHash?.length === 64 && !recoveryState.account?.pin, "o PIN não foi protegido por hash", page);
    await assert("acesso", "sessão iniciada após recuperação", recoveryState.session === "active", "a recuperação não abriu o aplicativo", page);
    await assert("acesso", "recuperação sem erro de navegador", errors.length === 0, errors.join(" | "), page);
  } catch (error) {
    fail("acesso", "recuperação local", error);
  }
  await closePage(page);
  await authContext.close();
}

await browser.close();
const report = [
  `PASSARAM: ${passes.length}`,
  ...passes.map((item) => `PASSOU · ${item}`),
  "",
  `FALHARAM: ${failures.length}`,
  ...failures.map((item) => `FALHOU · ${item}`),
].join("\n");
await fs.writeFile("artifacts/process-audit/report.txt", `${report}\n`, "utf8");
console.log(report);
if (failures.length) process.exit(1);
