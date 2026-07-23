"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

export function WorkspaceMenuToggle() {
  const pathname = usePathname();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [shell, setShell] = useState<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let currentShell: HTMLElement | null = null;

    function connect() {
      const nextShell = document.querySelector<HTMLElement>("[data-product]");
      const nextTarget = nextShell?.querySelector<HTMLElement>("[class*='sidebarFooter']") ?? null;

      if (!nextShell || !nextTarget || nextShell === currentShell) return;

      currentShell = nextShell;
      const slug = nextShell.dataset.product ?? "app";
      const saved = window.localStorage.getItem(`crmplus.ui.sidebar.${slug}`) === "true";

      nextShell.dataset.sidebarCollapsed = String(saved);
      setCollapsed(saved);
      setShell(nextShell);
      setTarget(nextTarget);
    }

    connect();
    const observer = new MutationObserver(connect);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  function toggleMenu() {
    if (!shell) return;

    const next = !collapsed;
    const slug = shell.dataset.product ?? "app";

    shell.dataset.sidebarCollapsed = String(next);
    window.localStorage.setItem(`crmplus.ui.sidebar.${slug}`, String(next));
    setCollapsed(next);
  }

  if (!target) return null;

  const label = collapsed ? "Expandir menu" : "Recolher menu";

  return createPortal(
    <button
      type="button"
      className="crmplus-sidebar-toggle"
      onClick={toggleMenu}
      aria-label={label}
      aria-expanded={!collapsed}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </button>,
    target,
  );
}
