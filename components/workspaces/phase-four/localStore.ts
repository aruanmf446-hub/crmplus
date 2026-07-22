"use client";

import { useEffect, useState } from "react";

const STORE_VERSION = 1;

type StoredValue<T> = { version: number; value: T };
type MigratableRecord = Record<string, unknown>;

function isStoredValue<T>(value: unknown): value is StoredValue<T> {
  return Boolean(value && typeof value === "object" && "version" in value && "value" in value);
}

function migrateKnownValue<T>(key: string, value: T): T {
  if (!Array.isArray(value)) return value;

  if (key === "crmplus.olympus.records") {
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const record = entry as MigratableRecord;
      return record.status === "Vendido" ? { ...record, status: "Negócio concluído" } : record;
    }) as unknown as T;
  }

  if (key === "crmplus.pegasus.records") {
    const previousServiceStates = new Set(["Aguardando chegada", "Em atendimento", "Aguardando retirada", "Concluído", "Agendado", "Pronto", "Hospedado"]);
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const record = entry as MigratableRecord;
      return typeof record.status === "string" && previousServiceStates.has(record.status) ? { ...record, status: "Ativo" } : record;
    }) as unknown as T;
  }

  if (key === "crmplus.pandora.surveys") {
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const survey = entry as MigratableRecord;
      return typeof survey.link === "string" ? { ...survey, link: survey.link.replace("crmplus.local", "crmplus.store") } : survey;
    }) as unknown as T;
  }

  return value;
}

export function useLocalState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => typeof initial === "function" ? (initial as () => T)() : initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredValue<T> | T;
        if (isStoredValue<T>(parsed)) {
          if (parsed.version === STORE_VERSION) setValue(migrateKnownValue(key, parsed.value));
        } else {
          setValue(migrateKnownValue(key, parsed));
        }
      }
    } catch {
      // Valores inválidos são ignorados e a tela mantém os dados iniciais.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify({ version: STORE_VERSION, value } satisfies StoredValue<T>));
    } catch {
      // A interface continua disponível mesmo quando o armazenamento do dispositivo está indisponível.
    }
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export function todayLabel() {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
