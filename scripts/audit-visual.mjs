import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.CRMPLUS_AUDIT_URL || "http://127.0.0.1:4173/crmplus";
const slugs = [
  "atlas", "ares", "artemis", "pandora", "poseidon", "hercules", "zeus",
  "alexandria", "olympus", "argus", "hermes", "athena", "gaia", "pegasus", "titans",
];
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "notebook-1366", width: 1366, height: 768 },
  { name: "notebook-1024", width: 1024, height: 768 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-360", width: 360, height: 800 },
];

await fs.mkdir("artifacts/visual-audit/screenshots", { recursive: true });
const failures = [];
const passes = [];

function safeName(value) {
  return value.replaceAll(/[^a-z0-9_-]+/gi, "-").replaceAll(/^-+|-+$/g, "").toLowerCase();
}

function recordFailure(scope, issue) {
  failures.push(`${scope} · ${issue}`);
}

async function seedLocalAccess(context) {
  await context.addInitScript((apps) => {
    localStorage.setItem("crmplus.color-mode", "light");
    localStorage.setItem("crmplus.access.account", JSON.stringify({
      name: "Auditoria visual",
      company: "CRM Plus QA",
      email: "qa@crmplus.local",
      password: "Teste1234",
      pin: "2468",
    }));
    for (const slug of apps) {
      localStorage.setItem(`crmplus.access.${slug}.account`, JSON.stringify({
        name: "Auditoria visual",
        company: "CRM Plus QA",
        email: "qa@crmplus.local",
        password: "Teste1234",
        pin: "2468",
      }));
      localStorage.setItem(`crmplus.access.${slug}.session`, "active");
    }
  }, slugs);
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.04;
    };
    const elementName = (element) => {
      const text = (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70);
      const className = typeof element.className === "string" ? element.className.split(/\s+/).slice(0, 2).join(".") : "";
      return `${element.tagName.toLowerCase()}${className ? `.${className}` : ""}${text ? `{${text}}` : ""}`;
    };

    const issues = [];
    const root = document.documentElement;
    if (root.scrollWidth > window.innerWidth + 4) {
      issues.push(`overflow horizontal do documento: ${root.scrollWidth}px em viewport de ${window.innerWidth}px`);
    }

    const smallControls = [];
    for (const element of document.querySelectorAll('button, input:not([type="hidden"]), select, textarea, [role="button"]')) {
      if (!visible(element) || element.hasAttribute("data-compact-control")) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 36 || rect.height < 36) smallControls.push(`${elementName(element)} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
      if (smallControls.length >= 8) break;
    }
    if (smallControls.length) issues.push(`controles abaixo de 36px: ${smallControls.join(" | ")}`);

    const tinyText = [];
    for (const element of document.querySelectorAll("body *")) {
      if (!visible(element) || element.matches("svg, path, script, style, noscript") || element.closest('[aria-hidden="true"]')) continue;
      const hasOwnText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      if (!hasOwnText) continue;
      const size = Number.parseFloat(getComputedStyle(element).fontSize);
      if (size < 10.5) tinyText.push(`${elementName(element)} ${size}px`);
      if (tinyText.length >= 8) break;
    }
    if (tinyText.length) issues.push(`texto abaixo de 10.5px: ${tinyText.join(" | ")}`);

    const unlabeled = [];
    for (const element of document.querySelectorAll('button, input:not([type="hidden"]), select, textarea')) {
      if (!visible(element)) continue;
      const labelled = element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || element.closest("label") || (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)) || element.textContent?.trim();
      if (!labelled) unlabeled.push(elementName(element));
      if (unlabeled.length >= 8) break;
    }
    if (unlabeled.length) issues.push(`controles sem nome acessível: ${unlabeled.join(" | ")}`);

    return issues;
  });
}

async function auditRoute(browser, viewport, route, label, options = {}) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "reduce" });
  await seedLocalAccess(context);
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  const scope = `${viewport.name} · ${label}`;
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(120);
    const issues = await inspectPage(page);
    for (const issue of issues) recordFailure(scope, issue);
    for (const error of [...new Set(runtimeErrors)]) recordFailure(scope, `console: ${error}`);

    await page.keyboard.press("Tab");
    const focusVisible = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) return false;
      const rect = active.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= window.innerHeight;
    });
    if (!focusVisible) recordFailure(scope, "navegação por teclado não produziu foco visível");

    if (options.screenshot) {
      await page.screenshot({
        path: `artifacts/visual-audit/screenshots/${safeName(`${viewport.name}-${label}`)}.png`,
        fullPage: true,
      });
    }

    if (!issues.length && !runtimeErrors.length && focusVisible) passes.push(scope);
    else if (!options.screenshot) {
      await page.screenshot({
        path: `artifacts/visual-audit/screenshots/${safeName(`${viewport.name}-${label}-falha`)}.png`,
        fullPage: true,
      }).catch(() => undefined);
    }
  } catch (error) {
    recordFailure(scope, `execução: ${error instanceof Error ? error.message : String(error)}`);
    await page.screenshot({ path: `artifacts/visual-audit/screenshots/${safeName(`${viewport.name}-${label}-erro`)}.png`, fullPage: true }).catch(() => undefined);
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });

for (const viewport of viewports) {
  await auditRoute(browser, viewport, "/", "home", { screenshot: true });
  await auditRoute(browser, viewport, "/entrar/", "seleção-entrar");
  await auditRoute(browser, viewport, "/criar-conta/", "seleção-criar-conta");
  await auditRoute(browser, viewport, "/recuperar-senha/", "seleção-recuperação");
}

for (const viewport of viewports.filter((item) => [1366, 768, 390].includes(item.width))) {
  for (const slug of slugs) {
    await auditRoute(browser, viewport, `/sistemas/${slug}/`, `sistema-${slug}`, { screenshot: true });
  }
}

for (const viewport of viewports.filter((item) => [1440, 390].includes(item.width))) {
  for (const slug of slugs) {
    await auditRoute(browser, viewport, `/aplicativos/${slug}/`, `comercial-${slug}`);
    await auditRoute(browser, viewport, `/aplicativos/${slug}/planos/`, `planos-${slug}`);
  }
}

await browser.close();

const report = [
  `PASSARAM: ${passes.length}`,
  ...passes.map((item) => `PASSOU · ${item}`),
  "",
  `FALHARAM: ${failures.length}`,
  ...failures.map((item) => `FALHOU · ${item}`),
].join("\n");
await fs.writeFile("artifacts/visual-audit/report.txt", `${report}\n`, "utf8");
console.log(report);
if (failures.length) process.exit(1);
