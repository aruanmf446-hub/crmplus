"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type ColorMode = "light" | "dark";

const STORAGE_KEY = "crmplus.color-mode";

export function ColorModeToggle() {
  const pathname = usePathname();
  const isAppRoute = pathname.startsWith("/sistemas/");
  const [mode, setMode] = useState<ColorMode>("light");
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") setMode(saved);
  }, []);

  useEffect(() => {
    const appliedMode: ColorMode = isAppRoute ? mode : "light";
    document.documentElement.dataset.colorMode = appliedMode;
    document.body.dataset.colorMode = appliedMode;
    if (isAppRoute) window.localStorage.setItem(STORAGE_KEY, mode);
  }, [isAppRoute, mode]);

  useEffect(() => {
    if (!isAppRoute) {
      setTarget(null);
      return;
    }

    const findTarget = () => {
      const header = document.querySelector('header[data-ui="context"]');
      if (header) setTarget(header);
      return Boolean(header);
    };

    if (findTarget()) return;

    const observer = new MutationObserver(() => {
      if (findTarget()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isAppRoute, pathname]);

  useEffect(() => () => {
    document.documentElement.dataset.colorMode = "light";
    document.body.dataset.colorMode = "light";
  }, []);

  if (!isAppRoute || !target) return null;

  const dark = mode === "dark";

  return createPortal(
    <button
      type="button"
      className="crmplus-theme-toggle"
      aria-label={dark ? "Ativar modo claro" : "Ativar modo noturno"}
      aria-pressed={dark}
      title={dark ? "Mudar para modo claro" : "Mudar para modo noturno"}
      onClick={() => setMode((current) => current === "dark" ? "light" : "dark")}
    >
      <span className="crmplus-theme-icon" aria-hidden="true"><i /></span>
      <span className="crmplus-theme-label">{dark ? "Modo claro" : "Modo noturno"}</span>
    </button>,
    target,
  );
}
