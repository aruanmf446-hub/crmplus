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
const warnings = [];
const passes = [];

function safeName(value) {
  return value.replaceAll(/[^a-z0-9_-]+/gi, "-").replaceAll(/^-+|-+$/g, "").toLowerCase();
}

function recordFailure(scope, issue) {
  failures.push(`${scope} · ${issue}`);
}

function recordWarning(scope, issue) {
  warnings.push(`${scope} · ${issue}`);
}

async function seedLocalAccess(context, colorMode = "light") {
  await context.addInitScript(({ apps, mode }) => {
    localStorage.setItem("crmplus.color-mode", mode);
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
  }, { apps: slugs, mode: colorMode });
}

async function inspectPage(page, expectedMode) {
  return page.evaluate((mode) => {
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
    const parseRgb = (value) => {
      const match = value.match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)/i);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
    };
    const brightness = (rgb) => rgb ? (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 255000 : 0;

    const critical = [];
    const advisory = [];
    const root = document.documentElement;
    if (root.scrollWidth > window.innerWidth + 4) {
      critical.push(`overflow horizontal do documento: ${root.scrollWidth}px em viewport de ${window.innerWidth}px`);
    }

    const sidebar = document.querySelector('[data-product] > aside[data-ui="navigation"]');
    const appShell = sidebar?.parentElement ?? null;
    if (appShell && sidebar) {
      const shellRect = appShell.getBoundingClientRect();
      const shellGap = Math.round(window.innerHeight - shellRect.bottom);
      if (shellRect.top < -2 || Math.abs(shellGap) > 2 || shellRect.height < 120) {
        critical.push(`shell não ocupa a área disponível: topo ${Math.round(shellRect.top)}px, altura ${Math.round(shellRect.height)}px, diferença inferior ${shellGap}px`);
      }

      const sidebarRect = sidebar.getBoundingClientRect();
      const sidebarGap = Math.round(window.innerHeight - sidebarRect.bottom);
      if (Math.abs(sidebarGap) > 2 || sidebarRect.height < 120) {
        critical.push(`sidebar não alcança o limite inferior: topo ${Math.round(sidebarRect.top)}px, altura ${Math.round(sidebarRect.height)}px, diferença inferior ${sidebarGap}px`);
      }
    }

    if (mode === "dark" && appShell) {
      const currentMode = document.documentElement.dataset.colorMode;
      if (currentMode !== "dark") critical.push(`tema escuro solicitado, mas o documento está em ${currentMode || "modo indefinido"}`);
      const largeLightSurfaces = [];
      const minimumArea = window.innerWidth * window.innerHeight * 0.12;
      for (const element of appShell.querySelectorAll("main *, main, section, aside")) {
        if (!visible(element)) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width * rect.height < minimumArea) continue;
        const color = parseRgb(getComputedStyle(element).backgroundColor);
        if (brightness(color) > 0.78) largeLightSurfaces.push(`${elementName(element)} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        if (largeLightSurfaces.length >= 6) break;
      }
      if (largeLightSurfaces.length) critical.push(`superfícies claras grandes no tema escuro: ${largeLightSurfaces.join(" | ")}`);
    }

    const smallControls = [];
    for (const element of document.querySelectorAll('button, input:not([type="hidden"]), select, textarea, [role="button"]')) {
      if (!visible(element) || element.hasAttribute("data-compact-control")) continue;
      const ownRect = element.getBoundingClientRect();
      const label = element.closest("label");
      const labelRect = label && visible(label) ? label.getBoundingClientRect() : null;
      const width = Math.max(ownRect.width, labelRect?.width ?? 0);
      const height = Math.max(ownRect.height, labelRect?.height ?? 0);
      if (width < 32 || height < 32) smallControls.push(`${elementName(element)} ${Math.round(width)}x${Math.round(height)}`);
      if (smallControls.length >= 8) break;
    }
    if (smallControls.length) advisory.push(`controles compactos: ${smallControls.join(" | ")}`);

    const tinyText = [];
    for (const element of document.querySelectorAll("body *")) {
      if (!visible(element) || element.matches("svg, path, script, style, noscript") || element.closest('[aria-hidden="true"]')) continue;
      const hasOwnText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      if (!hasOwnText) continue;
      const size = Number.parseFloat(getComputedStyle(element).fontSize);
      if (size < 10.5) tinyText.push(`${elementName(element)} ${size}px`);
      if (tinyText.length >= 8) break;
    }
    if (tinyText.length) advisory.push(`texto compacto: ${tinyText.join(" | ")}`);

    const unlabeled = [];
    for (const element of document.querySelectorAll('button, input:not([type="hidden"]), select, textarea')) {
      if (!visible(element)) continue;
      const labelled = element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || element.closest("label") || (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)) || element.textContent?.trim();
      if (!labelled) unlabeled.push(elementName(element));
      if (unlabeled.length >= 8) break;
    }
    if (unlabeled.length) critical.push(`controles sem nome acessível: ${unlabeled.join(" | ")}`);

    return { critical, advisory };
  }, expectedMode);
}

async function auditRoute(browser, viewport, route, label, options = {}) {
  const colorMode = options.colorMode || "light";
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "reduce" });
  await seedLocalAccess(context, colorMode);
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  const scope = `${viewport.name} · ${colorMode} · ${label}`;
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(160);
    const inspection = await inspectPage(page, colorMode);
    for (const issue of inspection.critical) recordFailure(scope, issue);
    for (const issue of inspection.advisory) recordWarning(scope, issue);
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
        path: `artifacts/visual-audit/screenshots/${safeName(`${viewport.name}-${colorMode}-${label}`)}.png`,
        fullPage: true,
      });
    }

    if (!inspection.critical.length && !runtimeErrors.length && focusVisible) passes.push(scope);
    else if (!options.screenshot) {
      await page.screenshot({
        path: `artifacts/visual-audit/screenshots/${safeName(`${viewport.name}-${colorMode}-${label}-falha`)}.png`,
        fullPage: true,
      }).catch(() => undefined);
    }
  } catch (error) {
    recordFailure(scope, `execução: ${error instanceof Error ? error.message : String(error)}`);
    await page.screenshot({ path: `artifacts/visual-audit/screenshots/${safeName(`${viewport.name}-${colorMode}-${label}-erro`)}.png`, fullPage: true }).catch(() => undefined);
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

for (const slug of slugs) {
  await auditRoute(browser, viewports[1], `/sistemas/${slug}/`, `sistema-${slug}`, { screenshot: true, colorMode: "light" });
  await auditRoute(browser, viewports[1], `/sistemas/${slug}/`, `sistema-${slug}`, { screenshot: true, colorMode: "dark" });
}

for (const viewport of viewports.filter((item) => [768, 390].includes(item.width))) {
  for (const slug of slugs) {
    await auditRoute(browser, viewport, `/sistemas/${slug}/`, `sistema-${slug}`, { screenshot: true, colorMode: "light" });
  }
}

for (const viewport of viewports.filter((item) => [1440, 390].includes(item.width))) {
  for (const slug of slugs) {
    await auditRoute(browser, viewport, `/aplicativos/${slug}/`, `comercial-${slug}`);
    await auditRoute(browser, viewport, `/assinar/${slug}/`, `assinatura-${slug}`);
  }
}

await browser.close();

const report = [
  `PASSARAM: ${passes.length}`,
  ...passes.map((item) => `PASSOU · ${item}`),
  "",
  `AVISOS: ${warnings.length}`,
  ...warnings.map((item) => `AVISO · ${item}`),
  "",
  `FALHARAM: ${failures.length}`,
  ...failures.map((item) => `FALHOU · ${item}`),
].join("\n");
await fs.writeFile("artifacts/visual-audit/report.txt", `${report}\n`, "utf8");
console.log(report);
if (failures.length) process.exit(1);
