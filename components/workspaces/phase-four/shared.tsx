"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/apps";
import {
  clearAppStorage,
  exportLocalBackup,
  fileToDataUrl,
  formatBytes,
  getLocalStorageUsage,
  importLocalBackup,
  subscribeStorageStatus,
  useLocalState,
  type StorageStatusDetail,
} from "./localStore";
import styles from "./PhaseFourWorkspace.module.css";
import hierarchy from "./SemanticHierarchy.module.css";
import brand from "./BrandLogo.module.css";
import shellUi from "./AppShellEnhancements.module.css";

export type IconName =
  | "activity" | "arrow" | "back" | "calendar" | "car" | "check" | "chevron" | "clipboard"
  | "clock" | "close" | "document" | "download" | "edit" | "filter" | "history" | "home"
  | "image" | "inbox" | "kitchen" | "menu" | "message" | "moon" | "panel" | "people" | "plus" | "print"
  | "search" | "settings" | "spark" | "sun" | "table" | "tag" | "trash" | "user" | "warning";

export type NavItem = { label: string; icon: IconName };

type VisualTheme = {
  nav: string;
  navRaised: string;
  selection: string;
  selectionStrong: string;
  result: string;
  resultRaised: string;
  canvas: string;
  topbar: string;
  data: string;
};

const appThemes: Record<string, VisualTheme> = {
  atlas: { nav: "#2c1b14", navRaised: "#3a241a", selection: "#fff4ec", selectionStrong: "#ffe0ca", result: "#fff9f5", resultRaised: "#ffefe3", canvas: "#f7f3f0", topbar: "#fffcfa", data: "#ffffff" },
  artemis: { nav: "#351b1d", navRaised: "#462226", selection: "#fff2ef", selectionStrong: "#ffdcd5", result: "#fff8f6", resultRaised: "#ffeae5", canvas: "#f7f2f1", topbar: "#fffdfc", data: "#ffffff" },
  ares: { nav: "#142344", navRaised: "#1c2f59", selection: "#f0f4ff", selectionStrong: "#dce6ff", result: "#f7f9ff", resultRaised: "#e9efff", canvas: "#f2f4f9", topbar: "#fbfcff", data: "#ffffff" },
  poseidon: { nav: "#102d3e", navRaised: "#163d53", selection: "#edf7fb", selectionStrong: "#d5ecf6", result: "#f6fbfd", resultRaised: "#e2f2f8", canvas: "#f1f5f7", topbar: "#fbfdfe", data: "#ffffff" },
  pandora: { nav: "#2b213e", navRaised: "#3a2b53", selection: "#f6f1fc", selectionStrong: "#e7dcf6", result: "#fbf8fe", resultRaised: "#efe7f9", canvas: "#f4f1f7", topbar: "#fdfbff", data: "#ffffff" },
  hercules: { nav: "#302a17", navRaised: "#40371d", selection: "#fff9e8", selectionStrong: "#ffefb7", result: "#fffdf6", resultRaised: "#fff5cf", canvas: "#f7f5ed", topbar: "#fffefb", data: "#ffffff" },
  zeus: { nav: "#102f28", navRaised: "#17443a", selection: "#edf8f4", selectionStrong: "#d8f0e8", result: "#f7fcfa", resultRaised: "#e4f5ef", canvas: "#f1f6f4", topbar: "#fbfefd", data: "#ffffff" },
  alexandria: { nav: "#322319", navRaised: "#463126", selection: "#faf1ea", selectionStrong: "#efd9ca", result: "#fdf9f6", resultRaised: "#f5e7dc", canvas: "#f5f1ee", topbar: "#fffdfb", data: "#ffffff" },
  olympus: { nav: "#142f3d", navRaised: "#1d4254", selection: "#edf6f9", selectionStrong: "#d7eaf1", result: "#f7fbfc", resultRaised: "#e3f1f5", canvas: "#f0f5f7", topbar: "#fbfdfe", data: "#ffffff" },
  argus: { nav: "#252d38", navRaised: "#333e4c", selection: "#f0f2f5", selectionStrong: "#dfe4e9", result: "#f8f9fb", resultRaised: "#e9edf1", canvas: "#f2f4f6", topbar: "#fcfcfd", data: "#ffffff" },
  hermes: { nav: "#382216", navRaised: "#4c2e1c", selection: "#fff4ec", selectionStrong: "#f9dfcc", result: "#fffaf6", resultRaised: "#fbe9dc", canvas: "#f7f2ee", topbar: "#fffdfb", data: "#ffffff" },
  athena: { nav: "#28203b", navRaised: "#392c54", selection: "#f5f1fb", selectionStrong: "#e5dcf4", result: "#fbf9fd", resultRaised: "#eee7f8", canvas: "#f4f2f7", topbar: "#fdfcff", data: "#ffffff" },
  gaia: { nav: "#21301b", navRaised: "#304526", selection: "#f0f7ec", selectionStrong: "#deecd7", result: "#f9fcf7", resultRaised: "#e8f3e2", canvas: "#f2f6ef", topbar: "#fcfefb", data: "#ffffff" },
  pegasus: { nav: "#3b202b", navRaised: "#502c3b", selection: "#fcf0f4", selectionStrong: "#f3dbe4", result: "#fef9fb", resultRaised: "#f8e7ed", canvas: "#f7f1f3", topbar: "#fffdfd", data: "#ffffff" },
  titans: { nav: "#352918", navRaised: "#493923", selection: "#fbf5ea", selectionStrong: "#efe2ca", result: "#fdfbf7", resultRaised: "#f6ead8", canvas: "#f5f2ed", topbar: "#fffefc", data: "#ffffff" },
};

type ShellProps = {
  product: Product;
  nav: NavItem[];
  active: string;
  onChange: (label: string) => void;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
};

type Preferences = { company: string; logo: string };

export function AppShell({ product, nav, active, onChange, title, subtitle, action, children }: ShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [logoError, setLogoError] = useState("");
  const [importError, setImportError] = useState("");
  const [storageStatus, setStorageStatus] = useState<StorageStatusDetail | null>(null);
  const [usage, setUsage] = useState({ bytes: 0, entries: 0 });
  const [preferences, setPreferences] = useLocalState<Preferences>(`crmplus.preferences.${product.slug}`, { company: "Minha empresa", logo: "" });
  const [settingsDraft, setSettingsDraft] = useState<Preferences>(preferences);
  const visualTheme = appThemes[product.slug] ?? appThemes.ares;
  const shellStyle = {
    "--accent": product.color,
    "--accent-soft": product.colorSoft,
    "--nav-bg": visualTheme.nav,
    "--nav-raised": visualTheme.navRaised,
    "--selection-bg": visualTheme.selection,
    "--selection-strong": visualTheme.selectionStrong,
    "--result-bg": visualTheme.result,
    "--result-raised": visualTheme.resultRaised,
    "--canvas-bg": visualTheme.canvas,
    "--topbar-bg": visualTheme.topbar,
    "--data-bg": visualTheme.data,
  } as CSSProperties;

  useEffect(() => {
    const savedMode = window.localStorage.getItem("crmplus.color-mode");
    const nextMode = savedMode === "dark" ? "dark" : "light";
    document.documentElement.dataset.colorMode = nextMode;
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setColorMode(nextMode);
      setCollapsed(window.localStorage.getItem("crmplus.ui.sidebar.collapsed") === "true");
    }, 0);
    const unsubscribe = subscribeStorageStatus((detail) => {
      if (detail.key.includes(product.slug) || detail.key.startsWith("crmplus.preferences.")) setStorageStatus(detail);
    });
    return () => {
      active = false;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [product.slug]);

  function toggleColorMode() {
    const nextMode = colorMode === "dark" ? "light" : "dark";
    setColorMode(nextMode);
    window.localStorage.setItem("crmplus.color-mode", nextMode);
    document.documentElement.dataset.colorMode = nextMode;
  }

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("crmplus.ui.sidebar.collapsed", String(next));
      return next;
    });
  }

  function openSettings() {
    setSettingsDraft(preferences);
    setLogoError("");
    setImportError("");
    setUsage(getLocalStorageUsage("crmplus."));
    setSettingsOpen(true);
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError("");
    if (!file.type.startsWith("image/")) {
      setLogoError("Selecione uma imagem PNG, JPEG ou WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > 700 * 1024) {
      setLogoError("Escolha uma imagem de até 700 KB.");
      event.target.value = "";
      return;
    }
    try {
      const logo = await fileToDataUrl(file);
      setSettingsDraft((current) => ({ ...current, logo }));
    } catch {
      setLogoError("Não foi possível ler esta imagem.");
    }
    event.target.value = "";
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreferences({ company: settingsDraft.company.trim() || "Minha empresa", logo: settingsDraft.logo });
    setSettingsOpen(false);
  }

  function resetApp() {
    const confirmed = window.confirm(`Redefinir o ${product.shortName}? Os registros deste aplicativo serão removidos deste navegador.`);
    if (!confirmed) return;
    clearAppStorage(product.slug);
    window.location.reload();
  }

  function exportBackup() {
    const count = exportLocalBackup(product.slug);
    setStorageStatus({ key: product.slug, status: "saved", message: `${count} conjunto(s) de dados exportado(s) para backup.` });
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError("");
    try {
      const count = await importLocalBackup(file, product.slug);
      setStorageStatus({ key: product.slug, status: "saved", message: `${count} conjunto(s) restaurado(s). Recarregando o aplicativo.` });
      window.setTimeout(() => window.location.reload(), 450);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Não foi possível importar este backup.");
    }
    event.target.value = "";
  }

  return (
    <div className={`${styles.appShell} ${hierarchy.visualHierarchy} ${shellUi.shell} ${collapsed ? shellUi.shellCollapsed : ""}`} style={shellStyle} data-product={product.slug}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`} data-ui="navigation">
        <div className={styles.brandBlock} data-ui="brand">
          <div className={styles.productLogo}>{preferences.logo ? <img className={brand.brandLogoImage} src={preferences.logo} alt={`Logo de ${preferences.company}`} /> : <ProductGlyph slug={product.slug} />}</div>
          <div data-ui="brand-copy"><strong>{product.shortName}</strong><span>{preferences.company}</span></div>
          <button type="button" className={styles.closeMenu} onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><Icon name="close" /></button>
        </div>
        <nav className={styles.sideNav} aria-label={`Navegação do ${product.shortName}`}>
          {nav.map((item) => (
            <button key={item.label} type="button" className={active === item.label ? styles.navActive : ""} onClick={() => { onChange(item.label); setMenuOpen(false); }} aria-current={active === item.label ? "page" : undefined} title={collapsed ? item.label : undefined}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter} data-ui="sidebar-footer">
          <button type="button" className={shellUi.sidebarUtility} onClick={toggleColorMode} title={colorMode === "dark" ? "Usar tema claro" : "Usar tema escuro"}><Icon name={colorMode === "dark" ? "sun" : "moon"} /><span>{colorMode === "dark" ? "Tema claro" : "Tema escuro"}</span></button>
          <button type="button" className={`${shellUi.sidebarUtility} ${shellUi.collapseControl}`} onClick={toggleCollapsed} aria-expanded={!collapsed} title={collapsed ? "Expandir menu" : "Recolher menu"}><Icon name="panel" /><span>{collapsed ? "Expandir menu" : "Recolher menu"}</span></button>
          <button type="button" className={shellUi.sidebarUtility} onClick={openSettings}><Icon name="settings" /><span>Configurações</span></button>
        </div>
      </aside>

      {menuOpen ? <button className={styles.scrim} type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" /> : null}

      <div className={styles.workspace}>
        <header className={styles.topbar} data-ui="context">
          <button type="button" className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
          <div className={styles.titleBlock}><h1>{title}</h1><p>{subtitle}</p></div>
          <div className={styles.topActions}>
            {storageStatus ? <span className={shellUi.storageBadge} data-status={storageStatus.status} title={storageStatus.message}><Icon name={storageStatus.status === "error" ? "warning" : "check"} />{storageStatus.status === "error" ? "Falha ao salvar" : storageStatus.status === "warning" ? "Dados migrados" : "Salvo localmente"}</span> : null}
            {action}
          </div>
        </header>
        <main className={styles.content} data-ui="workspace">{children}</main>
      </div>

      <Modal open={settingsOpen} title="Configurações" description="Identidade visual, tema e segurança dos dados locais." onClose={() => setSettingsOpen(false)}>
        <form className={styles.stackForm} onSubmit={saveSettings}>
          <Field label="Nome da empresa"><input value={settingsDraft.company} onChange={(event) => setSettingsDraft((current) => ({ ...current, company: event.target.value }))} /></Field>
          <div className={brand.logoSettings}>
            <div className={brand.logoSettingsHeader}>
              <div><strong>Logo da empresa</strong><span>PNG, JPEG ou WebP de até 700 KB. A imagem é comprimida antes de ser salva.</span></div>
              <div className={brand.logoPreview}>{settingsDraft.logo ? <img src={settingsDraft.logo} alt={`Prévia da logo de ${settingsDraft.company}`} /> : <ProductGlyph slug={product.slug} />}</div>
            </div>
            <div className={brand.logoActions}>
              <label className={brand.logoUploadButton}><Icon name="image" /> {settingsDraft.logo ? "Trocar logo" : "Selecionar logo"}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} /></label>
              {settingsDraft.logo ? <button type="button" className={brand.logoRemoveButton} onClick={() => setSettingsDraft((current) => ({ ...current, logo: "" }))}><Icon name="trash" /> Remover</button> : null}
            </div>
            {logoError ? <p className={brand.logoError} role="alert">{logoError}</p> : null}
          </div>

          <section className={shellUi.settingsSection}>
            <header><div><h3>Dados deste navegador</h3><p>Exporte uma cópia antes de limpar o navegador ou trocar de computador.</p></div><strong>{formatBytes(usage.bytes)} · {usage.entries} registros</strong></header>
            <div className={shellUi.backupActions}>
              <button type="button" className={shellUi.backupButton} onClick={exportBackup}><Icon name="download" /> Exportar backup</button>
              <label className={shellUi.importButton}><Icon name="arrow" /> Importar backup<input type="file" accept="application/json,.json" onChange={importBackup} /></label>
            </div>
            {storageStatus ? <p className={shellUi.storageMessage} data-status={storageStatus.status}>{storageStatus.message}</p> : null}
            {importError ? <p className={shellUi.storageMessage} data-status="error" role="alert">{importError}</p> : null}
          </section>

          <details className={styles.settingsDanger}>
            <summary>Redefinir dados deste aplicativo</summary>
            <p>Exporte um backup antes de apagar os rascunhos e registros deste navegador.</p>
            <button type="button" className={styles.dangerButton} onClick={resetApp}>Redefinir aplicativo</button>
          </details>
          <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setSettingsOpen(false)}>Cancelar</button><button className={styles.primaryButton}>Salvar configurações</button></div>
        </form>
      </Modal>
    </div>
  );
}

export function Modal({ open, title, description, onClose, children, wide = false }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const titleId = useId();
  const descriptionId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = backdropRef.current?.closest("[data-product]");
    const inertElements = root ? Array.from(root.children).filter((element) => element !== backdropRef.current) as HTMLElement[] : [];
    inertElements.forEach((element) => { element.inert = true; });

    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      const first = cardRef.current?.querySelector<HTMLElement>("[autofocus], " + focusableSelector);
      (first ?? cardRef.current)?.focus();
    });

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !cardRef.current) return;
      const focusable = Array.from(cardRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); cardRef.current.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      inertElements.forEach((element) => { element.inert = false; });
      previousFocus.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div ref={backdropRef} className={shellUi.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={cardRef} className={`${shellUi.modalCard} ${wide ? shellUi.modalWide : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabIndex={-1}>
        <header className={shellUi.modalHeader}><div><h2 id={titleId}>{title}</h2>{description ? <p id={descriptionId}>{description}</p> : null}</div><button type="button" className={shellUi.modalClose} onClick={onClose} aria-label="Fechar janela"><Icon name="close" /></button></header>
        <div className={shellUi.modalBody}>{children}</div>
      </section>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className={styles.fieldLabel}><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timer);
  }, [onClose]);
  return <div className={shellUi.toast} role="status" aria-live="polite" aria-atomic="true"><Icon name="check" /><span>{message}</span><button type="button" onClick={onClose} aria-label="Fechar notificação"><Icon name="close" /></button></div>;
}

export function EmptyState({ icon, title, description, action }: { icon: IconName; title: string; description: string; action?: ReactNode }) {
  return <div className={styles.emptyState}><Icon name={icon} /><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "");
  return <span className={`${styles.statusPill} ${styles[`status_${normalized}`] ?? ""}`}>{status}</span>;
}

export function ScoreBadge({ score, large = false }: { score: number; large?: boolean }) {
  return <span className={`${styles.scoreBadge} ${score <= 6 ? styles.scoreBad : score <= 8 ? styles.scoreNeutral : styles.scoreGood} ${large ? styles.scoreLarge : ""}`}>{score}</span>;
}

export function Timeline({ items }: { items: Array<{ text: string; date: string }> }) {
  return <div className={styles.timeline}>{items.map((item, index) => <div key={`${item.text}-${index}`}><i /><div><strong>{item.text}</strong><span>{item.date}</span></div></div>)}</div>;
}

export function DataTable({ columns, rows, onRow }: { columns: string[]; rows: string[][]; onRow?: (index: number) => void }) {
  return <div className={shellUi.tableScroll}><table className={shellUi.dataTable}><thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}{onRow ? <th scope="col"><span className="sr-only">Ações</span></th> : null}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cellIndex === 0 ? <strong>{cell}</strong> : cell}</td>)}{onRow ? <td><button type="button" className={shellUi.rowAction} onClick={() => onRow(index)} aria-label={`Abrir ${row[0]}`}><Icon name="chevron" /></button></td> : null}</tr>)}</tbody></table></div>;
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return <button className={styles.primaryButton} type="submit">{children}</button>;
}

export function Form({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(); }
  return <form className={styles.stackForm} onSubmit={submit}>{children}</form>;
}

export function ProductGlyph({ slug }: { slug: string }) {
  const map: Record<string, IconName> = { atlas: "car", artemis: "kitchen", ares: "document", poseidon: "spark", pandora: "message", hercules: "check", zeus: "car", alexandria: "document", olympus: "home", argus: "tag", hermes: "calendar", athena: "clipboard", gaia: "activity", pegasus: "user", titans: "table" };
  return <Icon name={map[slug] ?? "home"} />;
}

export function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    activity: <path d="M3 12h4l2-6 4 12 2-6h6" />, arrow: <path d="M5 12h14M13 6l6 6-6 6" />, back: <path d="m15 18-6-6 6-6" />, calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>, car: <><path d="m5 17-1 2M19 17l1 2M3 13l2-6h14l2 6v5H3z" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></>, check: <path d="m5 12 4 4L19 6" />, chevron: <path d="m9 18 6-6-6-6" />, clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 10h6M9 14h6" /></>, clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, close: <path d="m6 6 12 12M18 6 6 18" />, document: <><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6" /></>, download: <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />, edit: <><path d="m4 16-1 5 5-1L19 9l-4-4z" /><path d="m13 7 4 4" /></>, filter: <path d="M4 5h16M7 12h10M10 19h4" />, history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /><path d="M12 7v5l3 2" /></>, home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />, image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-5L5 20" /></>, inbox: <path d="M4 4h16v14H4zM4 14h5l2 3h2l2-3h5" />, kitchen: <><path d="M7 3v7M4 3v4c0 2 6 2 6 0V3M7 10v11M17 3v18" /><path d="M14 3c0 5 6 5 6 0" /></>, menu: <path d="M4 7h16M4 12h16M4 17h16" />, message: <path d="M4 4h16v13H8l-4 4z" />, moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />, panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>, people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 21c0-4 2-7 6-7s6 3 6 7M15 15c4 0 6 2 6 6" /></>, plus: <path d="M12 5v14M5 12h14" />, print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v7H7z" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3.1h5l.4-3.1a8 8 0 0 0 1.7 1l2.4 1 2-3.4-2.1-1.5a7 7 0 0 0 .1-1Z" /></>, spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m18 16 .7 2.3L21 19l-2.3.7L18 22l-.7-2.3L15 19l2.3-.7z" /></>, sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></>, table: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M8 10v9" /></>, tag: <><path d="M3 11V4h7l11 11-7 7z" /><circle cx="7" cy="8" r="1" /></>, trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>, user: <><circle cx="12" cy="8" r="4" /><path d="M4 22c0-5 3-8 8-8s8 3 8 8" /></>, warning: <path d="M12 3 2 21h20zM12 9v5M12 18h.01" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
