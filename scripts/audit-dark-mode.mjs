import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.CRMPLUS_AUDIT_URL || "http://127.0.0.1:4173";
const slugs = [
  "atlas", "ares", "artemis", "pandora", "poseidon", "hercules", "zeus",
  "alexandria", "olympus", "argus", "hermes", "athena", "gaia", "pegasus", "titans",
];

await fs.mkdir("artifacts/dark-mode", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

await context.addInitScript((apps) => {
  localStorage.setItem("crmplus.color-mode", "dark");
  for (const slug of apps) {
    localStorage.setItem(`crmplus.access.${slug}.account`, JSON.stringify({
      name: "Auditoria visual",
      company: "CRM Plus QA",
      email: `qa.${slug}@example.com`,
      password: "Teste1234",
    }));
    localStorage.setItem(`crmplus.access.${slug}.session`, "active");
  }
}, slugs);

const failures = [];

function formatIssue(slug, area, issue) {
  return `${slug} · ${area} · ${issue.kind} · ${issue.selector} · ${issue.value}`;
}

async function inspectColors(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-product]");
    if (!root) return [{ kind: "estrutura", selector: "[data-product]", value: "não encontrado" }];

    const issues = [];
    const parse = (value) => {
      const match = value?.match(/rgba?\(([^)]+)\)/i);
      if (!match) return null;
      const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
      return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts.length > 3 ? parts[3] : 1 };
    };
    const neutral = (color, tolerance = 18) => Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) <= tolerance;
    const luminance = (color) => (color.r * 0.2126) + (color.g * 0.7152) + (color.b * 0.0722);
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.03;
    };
    const selectorFor = (element) => {
      const tag = element.tagName.toLowerCase();
      const className = typeof element.className === "string" ? element.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
      const role = element.getAttribute("role");
      const label = element.getAttribute("aria-label");
      return `${tag}${className ? `.${className}` : ""}${role ? `[role=${role}]` : ""}${label ? `[aria-label=${label}]` : ""}`.slice(0, 180);
    };

    for (const element of root.querySelectorAll("*")) {
      if (!visible(element)) continue;
      const style = getComputedStyle(element);
      const selector = selectorFor(element);
      const background = parse(style.backgroundColor);
      if (background && background.a > 0.04) {
        if (!neutral(background) || luminance(background) > 105) {
          issues.push({ kind: "fundo", selector, value: style.backgroundColor });
        }
      }

      const hasOwnText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      if (hasOwnText) {
        const color = parse(style.color);
        if (color && color.a > 0.04 && luminance(color) < 145) {
          issues.push({ kind: "texto", selector, value: style.color });
        }
      }

      const borderWidths = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(Number.parseFloat);
      if (borderWidths.some((width) => width > 0)) {
        for (const value of [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor]) {
          const color = parse(value);
          if (color && color.a > 0.04 && !neutral(color)) {
            issues.push({ kind: "borda", selector, value });
            break;
          }
        }
      }

      for (const pseudo of ["::before", "::after"]) {
        const pseudoStyle = getComputedStyle(element, pseudo);
        if (!pseudoStyle || pseudoStyle.content === "none") continue;
        const pseudoBackground = parse(pseudoStyle.backgroundColor);
        if (pseudoBackground && pseudoBackground.a > 0.04 && !neutral(pseudoBackground)) {
          issues.push({ kind: `pseudo ${pseudo}`, selector, value: pseudoStyle.backgroundColor });
        }
        const pseudoColor = parse(pseudoStyle.color);
        if (pseudoColor && pseudoColor.a > 0.04 && !neutral(pseudoColor)) {
          issues.push({ kind: `pseudo texto ${pseudo}`, selector, value: pseudoStyle.color });
        }
      }

      if (issues.length >= 80) break;
    }
    return issues;
  });
}

for (const slug of slugs) {
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await page.goto(`${baseUrl}/sistemas/${slug}/`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForSelector(`[data-product="${slug}"]`, { timeout: 30_000 });
    await page.waitForFunction(() => document.documentElement.dataset.colorMode === "dark", null, { timeout: 10_000 });

    const areas = await page.locator('nav[aria-label^="Navegação"] button').allTextContents();
    const checks = [{ name: "inicial", click: false }, ...areas.map((name) => ({ name: name.trim(), click: true }))];

    for (const check of checks) {
      if (check.click) {
        const button = page.locator('nav[aria-label^="Navegação"] button').filter({ hasText: check.name }).first();
        await button.click();
        await page.waitForTimeout(180);
      }
      const issues = await inspectColors(page);
      for (const issue of issues) failures.push(formatIssue(slug, check.name, issue));
    }

    const settings = page.getByRole("button", { name: "Configurações" });
    if (await settings.count()) {
      await settings.first().click();
      await page.waitForSelector('[role="dialog"]');
      const modalIssues = await inspectColors(page);
      for (const issue of modalIssues) failures.push(formatIssue(slug, "Configurações", issue));
      await page.screenshot({ path: `artifacts/dark-mode/${slug}.png`, fullPage: true });
      await page.getByRole("button", { name: "Fechar" }).click();
    }

    for (const error of consoleErrors) failures.push(`${slug} · console · ${error}`);
  } catch (error) {
    failures.push(`${slug} · execução · ${error instanceof Error ? error.message : String(error)}`);
    await page.screenshot({ path: `artifacts/dark-mode/${slug}-error.png`, fullPage: true }).catch(() => undefined);
  } finally {
    await page.close();
  }
}

await browser.close();

const uniqueFailures = [...new Set(failures)];
await fs.writeFile("artifacts/dark-mode/report.txt", uniqueFailures.length ? uniqueFailures.join("\n") : "PASSOU: nenhum vazamento de cor ou texto escuro encontrado nos 15 aplicativos.\n", "utf8");

if (uniqueFailures.length) {
  console.error(`Auditoria do modo escuro encontrou ${uniqueFailures.length} problema(s):`);
  console.error(uniqueFailures.slice(0, 160).join("\n"));
  process.exit(1);
}

console.log("PASSOU: modo escuro neutro e legível nos 15 aplicativos.");
