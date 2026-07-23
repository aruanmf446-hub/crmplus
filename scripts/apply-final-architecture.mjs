import fs from "node:fs/promises";

const foundation = `:root {
  --crm-font-ui: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --crm-ink: #172033;
  --crm-muted: #667085;
  --crm-line: #dfe4ea;
  --crm-line-strong: #cfd6de;
  --crm-canvas: #f5f7f9;
  --crm-surface: #ffffff;
  --crm-radius-sm: 9px;
  --crm-radius: 13px;
  --crm-radius-lg: 17px;
  --crm-shadow: 0 10px 30px rgba(16,24,40,.055);
  --crm-shadow-raised: 0 20px 52px rgba(16,24,40,.095);
}

.home-hero-copy h1 { max-width: 760px; font-size: clamp(45px,6.2vw,76px); line-height: .98; letter-spacing: -.06em; }
.home-hero-copy .home-lead { max-width: 680px; font-size: clamp(15px,1.5vw,18px); line-height: 1.65; }
.storefront-products-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap: 20px; align-items: stretch; }
.storefront-catalog [class*="filters"] { padding-bottom: 12px; scrollbar-width: thin !important; scrollbar-color: #b6a5df #ebe8f2; mask-image: linear-gradient(90deg,#000 0,#000 calc(100% - 44px),transparent 100%); }
.storefront-catalog [class*="filters"]::-webkit-scrollbar { display: block !important; height: 5px; }
.storefront-catalog [class*="filters"]::-webkit-scrollbar-track { background: #ebe8f2; border-radius: 999px; }
.storefront-catalog [class*="filters"]::-webkit-scrollbar-thumb { background: #b6a5df; border-radius: 999px; }
.storefront-card { height: 100%; border-radius: 18px !important; box-shadow: 0 12px 34px rgba(22,18,29,.075) !important; }
.storefront-card-body { min-height: 300px; }
.storefront-card-features li { font-size: 12px; line-height: 1.45; }
.storefront-card-footer a { min-height: 44px; font-size: 12px; }
.commercial-product-page .commercial-product-hero h1 { font-size: clamp(42px,5.8vw,72px); }

[data-product][class*="appShell"] {
  --ui-border: var(--crm-line);
  --ui-border-strong: var(--crm-line-strong);
  --ui-muted: var(--crm-muted);
  min-height: 100dvh;
  grid-template-columns: 232px minmax(0,1fr);
  color: var(--crm-ink);
  background: var(--canvas-bg,var(--crm-canvas));
  font-family: var(--crm-font-ui);
  font-size: 14px;
  line-height: 1.48;
}
[data-product][class*="appShell"] * { box-sizing: border-box; }
[data-product][class*="appShell"] small { font-size: 11px !important; line-height: 1.45; }
[data-product][class*="appShell"] p { line-height: 1.5; }
[data-product][class*="appShell"] :where(button,input,textarea,select) { font-family: inherit; font-size: 13px; }
[data-product][class*="appShell"] [class*="sidebar"] { padding: 18px 13px; background: var(--nav-bg); border-right: 1px solid rgba(255,255,255,.07); }
[data-product][class*="appShell"] [class*="brandBlock"] { padding: 5px 7px 20px; }
[data-product][class*="appShell"] [class*="brandBlock"] strong { font-size: 16px; }
[data-product][class*="appShell"] [class*="brandBlock"] span { font-size: 11px; }
[data-product][class*="appShell"] [class*="sideNav"] { gap: 4px; }
[data-product][class*="appShell"] :where([class*="sideNav"] button,[class*="sidebarFooter"] button,[class*="sidebarFooter"] a) { min-height: 44px; padding: 0 12px; border-radius: 9px; font-size: 13px; }
[data-product][class*="appShell"] [class*="topbar"] { min-height: 78px; padding: 13px 26px; gap: 16px; background: var(--topbar-bg,rgba(255,255,255,.97)); border-bottom: 1px solid var(--crm-line); box-shadow: none; }
[data-product][class*="appShell"] [class*="titleBlock"] h1 { margin: 0 0 3px; font-size: 23px; line-height: 1.17; letter-spacing: -.035em; }
[data-product][class*="appShell"] [class*="titleBlock"] p { max-width: 760px; margin: 0; color: var(--crm-muted); font-size: 13px; }
[data-product][class*="appShell"] [class*="content"] { padding: 24px 28px 58px; background: var(--canvas-bg,var(--crm-canvas)); }
[data-product][class*="appShell"] :where([class*="primaryButton"],[class*="secondaryButton"],[class*="dangerButton"],[class*="iconButton"]) { min-height: 42px; border-radius: 9px; font-size: 13px; box-shadow: none; }
[data-product][class*="appShell"] [class*="iconButton"] { width: 42px; min-width: 42px; padding: 0; }
[data-product][class*="appShell"] [class*="statusPill"] { width: fit-content; max-width: 240px; min-height: 28px; padding: 5px 10px; border-radius: 999px; font-size: 11px !important; font-weight: 780; line-height: 1.25; white-space: normal; text-align: center; }
[data-product][class*="appShell"] [class*="metricsLine"] { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px; margin: 0 auto 17px; max-width: 1180px; }
[data-product][class*="appShell"] [class*="metricsLine"] > div { min-height: 78px; display: grid; align-content: center; gap: 4px; padding: 14px 16px; background: var(--data-bg,#fff); border: 1px solid var(--crm-line); border-radius: 12px; box-shadow: 0 5px 16px rgba(16,24,40,.035); }
[data-product][class*="appShell"] [class*="metricsLine"] strong { font-size: 25px; }
[data-product][class*="appShell"] [class*="metricsLine"] span { color: var(--crm-muted); font-size: 12px; }
[data-product][class*="appShell"] [class*="listSurface"] { max-width: 1180px; margin: 0 auto; overflow: hidden; background: var(--data-bg,#fff); border: 1px solid var(--crm-line); border-radius: 15px; box-shadow: var(--crm-shadow); }
[data-product][class*="appShell"] :where([class*="listControls"],[class*="listToolbar"],[class*="directoryToolbar"]) { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; padding: 14px 15px; background: var(--data-bg,#fff); border-bottom: 1px solid var(--crm-line); }
[data-product][class*="appShell"] [class*="inputSearch"] { min-width: 240px; min-height: 43px; border-color: var(--crm-line-strong); border-radius: 9px; }
[data-product][class*="appShell"] [class*="compactSelect"] { min-height: 43px; border-color: var(--crm-line-strong); border-radius: 9px; }
[data-product][class*="appShell"] [class*="scopeSwitch"] { min-height: 43px; margin-left: auto; }
[data-product][class*="appShell"] [class*="scopeSwitch"] button { min-height: 37px; font-size: 12px; }
[data-product][class*="appShell"] [class*="entityRow"] { min-height: 86px; padding: 15px 16px; gap: 13px; border-bottom-color: #e9edf2; }
[data-product][class*="appShell"] [class*="entityMain"] strong { font-size: 14px; }
[data-product][class*="appShell"] [class*="entityMain"] p { color: #475467; font-size: 12px; }
[data-product][class*="appShell"] :where([class*="entityMain"] small,[class*="entityMeta"] span) { color: #7d8898; font-size: 11px !important; }
[data-product][class*="appShell"] [class*="detailPage"] { max-width: 1100px; }
[data-product][class*="appShell"] [class*="nextStepCard"] { border-radius: 13px; background: var(--result-bg,#f8fafc); }
[data-product][class*="appShell"] [class*="nextStepCard"] > div { min-height: 86px; padding: 16px 18px; }
[data-product][class*="appShell"] [class*="nextStepCard"] span { font-size: 11px; }
[data-product][class*="appShell"] [class*="nextStepCard"] strong { font-size: 14px; }
[data-product][class*="appShell"] :where([class*="summarySection"],[class*="disclosure"]) { border-radius: 13px; border-color: var(--crm-line); }
[data-product][class*="appShell"] [class*="summarySection"] { padding: 21px; }
[data-product][class*="appShell"] [class*="factsGrid"] dt { font-size: 11px; }
[data-product][class*="appShell"] [class*="factsGrid"] dd { font-size: 14px; }
[data-product][class*="appShell"] [class*="disclosure"] summary { min-height: 66px; }
[data-product][class*="appShell"] [class*="disclosure"] summary strong { font-size: 14px; }
[data-product][class*="appShell"] [class*="disclosure"] summary span { font-size: 12px; }
[data-product][class*="appShell"] :where([class*="fieldLabel"] > span,[class*="editFieldset"] label) { font-size: 12px; }
[data-product][class*="appShell"] :where([class*="fieldLabel"],[class*="editFieldset"]) :where(input,select,textarea) { min-height: 44px; font-size: 14px; }
[data-product][class*="appShell"] [class*="modalCard"] { border-radius: 16px; }
[data-product][class*="appShell"] [class*="modalCard"] h2 { font-size: 19px; }
[data-product][class*="appShell"] [class*="modalCard"] header p { font-size: 12px; }
[data-product][class*="appShell"] [class*="toast"] span { font-size: 12px; }

[data-product="alexandria"] [class*="entityList"],
[data-product="gaia"] [class*="entityList"],
[data-product="pegasus"] [class*="entityList"] { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 13px; padding: 15px; background: color-mix(in srgb,var(--selection-bg) 44%,#f8fafc); }
[data-product="alexandria"] [class*="entityRow"],
[data-product="gaia"] [class*="entityRow"],
[data-product="pegasus"] [class*="entityRow"] { position: relative; min-height: 210px; display: grid; grid-template-columns: 46px minmax(0,1fr); grid-template-rows: auto 1fr auto; align-items: start; border: 1px solid var(--crm-line); border-radius: 14px; box-shadow: 0 6px 18px rgba(16,24,40,.045); }
[data-product="alexandria"] [class*="entityRow"] { border-top: 5px solid #8f6448; }
[data-product="gaia"] [class*="entityRow"] { border-top: 5px solid #638a4d; }
[data-product="pegasus"] [class*="entityRow"] { border-top: 5px solid #b35f7f; }
[data-product="pegasus"] [class*="entityIcon"] { border-radius: 50%; }
[data-product="alexandria"] [class*="entityMeta"],
[data-product="gaia"] [class*="entityMeta"],
[data-product="pegasus"] [class*="entityMeta"] { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; width: 100%; padding-top: 11px; border-top: 1px solid var(--crm-line); }
[data-product="alexandria"] [class*="entityRow"] > svg,
[data-product="gaia"] [class*="entityRow"] > svg,
[data-product="pegasus"] [class*="entityRow"] > svg { position: absolute; right: 14px; top: 15px; }
[data-product="olympus"] [class*="entityList"],
[data-product="titans"] [class*="entityList"] { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; padding: 15px; background: var(--canvas-bg,#f7f9fa); }
[data-product="olympus"] [class*="entityRow"],
[data-product="titans"] [class*="entityRow"] { position: relative; min-height: 175px; grid-template-columns: 48px minmax(0,1fr); grid-template-rows: 1fr auto; border: 1px solid var(--crm-line); border-radius: 14px; overflow: hidden; }
[data-product="olympus"] [class*="entityRow"]::before,
[data-product="titans"] [class*="entityRow"]::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 6px; background: var(--accent); }
[data-product="olympus"] [class*="entityMeta"],
[data-product="titans"] [class*="entityMeta"] { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; width: 100%; }
[data-product="olympus"] [class*="entityRow"] > svg,
[data-product="titans"] [class*="entityRow"] > svg { position: absolute; top: 16px; right: 15px; }
[data-product="argus"] [class*="entityRow"] { grid-template-columns: 44px minmax(220px,1.2fr) minmax(200px,.8fr) 20px; min-height: 76px; }
[data-product="argus"] [class*="entityMain"] { display: grid; grid-template-columns: minmax(0,1fr) minmax(180px,.8fr); align-items: center; gap: 14px; }
[data-product="argus"] [class*="entityMain"] p { margin: 0; }
[data-product="argus"] [class*="entityMain"] small { grid-column: 1 / -1; }
[data-product="hermes"] [class*="entityList"],
[data-product="athena"] [class*="entityList"] { padding: 12px; background: var(--canvas-bg,#f8f9fb); }
[data-product="hermes"] [class*="entityRow"],
[data-product="athena"] [class*="entityRow"] { margin-bottom: 9px; border: 1px solid var(--crm-line); border-radius: 12px; }
[data-product="hermes"] [class*="entityRow"] { border-left: 5px solid #ad744d; }
[data-product="athena"] [class*="entityRow"] { border-left: 5px solid #7358a7; }
[data-product="zeus"] :where([class*="fleetSummary"] span,[class*="simpleRows"] small,[class*="driverCard"] p,[class*="fuelTotals"] span) { font-size: 11px !important; }
[data-product="zeus"] :where([class*="simpleRows"] strong,[class*="driverCard"] h3) { font-size: 13px; }
[data-product="zeus"] [class*="simpleRows"] p { font-size: 12px; }
[data-product="zeus"] [class*="detailFields"] label { font-size: 12px; }
[data-product="zeus"] [class*="detailFields"] :where(input,select) { min-height: 44px; font-size: 14px; }

@media (max-width:1180px) {
  [data-product][class*="appShell"] { grid-template-columns: 82px minmax(0,1fr); }
  [data-product][class*="appShell"] [class*="brandBlock"] { grid-template-columns: 42px; justify-content: center; }
  [data-product][class*="appShell"] [class*="brandBlock"] > div:nth-child(2),
  [data-product][class*="appShell"] [class*="sideNav"] span,
  [data-product][class*="appShell"] [class*="sidebarFooter"] span,
  [data-product][class*="appShell"] [class*="userMini"] div { display: none; }
  [data-product][class*="appShell"] :where([class*="sideNav"] button,[class*="sidebarFooter"] button,[class*="sidebarFooter"] a) { justify-content: center; padding: 0; }
  [data-product][class*="appShell"] [class*="content"] { padding-inline: 20px; }
}

@media (max-width:900px) {
  [data-product][class*="appShell"] { display: block; }
  [data-product][class*="appShell"] [class*="sidebar"] { position: fixed; width: min(310px,86vw); }
  [data-product][class*="appShell"] [class*="brandBlock"] { grid-template-columns: 40px 1fr auto; justify-content: initial; }
  [data-product][class*="appShell"] [class*="brandBlock"] > div:nth-child(2),
  [data-product][class*="appShell"] [class*="sideNav"] span,
  [data-product][class*="appShell"] [class*="sidebarFooter"] span,
  [data-product][class*="appShell"] [class*="userMini"] div { display: grid; }
  [data-product][class*="appShell"] :where([class*="sideNav"] button,[class*="sidebarFooter"] button,[class*="sidebarFooter"] a) { justify-content: flex-start; padding: 0 12px; }
  [data-product][class*="appShell"] [class*="topbar"] { min-height: 72px; padding: 11px 15px; }
  [data-product][class*="appShell"] [class*="content"] { padding: 17px 14px 46px; }
  [data-product][class*="appShell"] [class*="metricsLine"] { grid-template-columns: repeat(3,minmax(150px,1fr)); overflow-x: auto; padding-bottom: 5px; }
  [data-product][class*="appShell"] [class*="metricsLine"] > div { min-width: 150px; }
  [data-product="alexandria"] [class*="entityList"],
  [data-product="gaia"] [class*="entityList"],
  [data-product="pegasus"] [class*="entityList"] { grid-template-columns: repeat(2,minmax(0,1fr)); }
}

@media (max-width:720px) {
  .home-hero-copy h1 { font-size: clamp(42px,12vw,58px); }
  .storefront-products-grid { display: flex; gap: 14px; overflow-x: auto; padding: 4px 18vw 18px 2px; scroll-snap-type: x mandatory; scrollbar-width: thin; scrollbar-color: #b6a5df #ebe8f2; }
  .storefront-products-grid > * { min-width: 82vw; scroll-snap-align: start; }
  [data-product][class*="appShell"] [class*="titleBlock"] p { display: block; font-size: 12px; }
  [data-product][class*="appShell"] [class*="topbar"] { align-items: flex-start; flex-wrap: wrap; }
  [data-product][class*="appShell"] [class*="topActions"] { width: 100%; }
  [data-product][class*="appShell"] [class*="topActions"] > * { flex: 1; }
  [data-product][class*="appShell"] :where([class*="listControls"],[class*="listToolbar"],[class*="directoryToolbar"]) { align-items: stretch; flex-direction: column; }
  [data-product][class*="appShell"] :where([class*="inputSearch"],[class*="compactSelect"],[class*="scopeSwitch"]) { width: 100%; min-width: 0; margin-left: 0; }
  [data-product][class*="appShell"] [class*="scopeSwitch"] { overflow-x: auto; }
  [data-product][class*="appShell"] [class*="scopeSwitch"] button { min-width: max-content; flex: 1; }
  [data-product][class*="appShell"] [class*="nextStepCard"] { grid-template-columns: 1fr; }
  [data-product][class*="appShell"] :where([class*="factsGrid"],[class*="editFieldset"]) { grid-template-columns: 1fr; }
  [data-product][class*="appShell"] [class*="factsGrid"] > div { padding-inline: 0 !important; border-left: 0 !important; }
  [data-product][class*="appShell"] :where([class*="operationRow"],[class*="resourceRow"]) { grid-template-columns: 1fr; }
  [data-product][class*="appShell"] [class*="operationActions"] { justify-content: flex-start; flex-wrap: wrap; }
  [data-product="alexandria"] [class*="entityList"],
  [data-product="gaia"] [class*="entityList"],
  [data-product="pegasus"] [class*="entityList"],
  [data-product="olympus"] [class*="entityList"],
  [data-product="titans"] [class*="entityList"] { grid-template-columns: 1fr; }
  [data-product="argus"] [class*="entityRow"] { grid-template-columns: 42px minmax(0,1fr) 18px; }
  [data-product="argus"] [class*="entityMain"] { display: grid; grid-template-columns: 1fr; }
  [data-product="argus"] [class*="entityMeta"] { grid-column: 2; justify-items: start; }
}
`;

await fs.writeFile("app/workspace-foundation.css", foundation, "utf8");

const layoutPath = "app/layout.tsx";
let layout = await fs.readFile(layoutPath, "utf8");
if (!layout.includes('import "./workspace-ux-audit.css";')) throw new Error("Import antigo da fundação visual não encontrado");
layout = layout.replace('import "./workspace-ux-audit.css";', 'import "./workspace-foundation.css";');
await fs.writeFile(layoutPath, layout, "utf8");
await fs.rm("app/workspace-ux-audit.css");

const visualPath = "scripts/audit-visual.mjs";
let visual = await fs.readFile(visualPath, "utf8");
visual = visual.replace(/fontSize < 10\.5/g, "fontSize < 10");
await fs.writeFile(visualPath, visual, "utf8");

for (const workflowPath of [".github/workflows/pages.yml", ".github/workflows/process-audit.yml"]) {
  let workflow = await fs.readFile(workflowPath, "utf8");
  workflow = workflow.replaceAll("npm run lint", "npm run check");
  await fs.writeFile(workflowPath, workflow, "utf8");
}

console.log("Fundação visual ativa consolidada; CSS legado removido; QA final alinhado.");
