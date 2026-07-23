"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

const STORE_VERSION = 2;
const STORAGE_EVENT = "crmplus:storage-status";
const BACKUP_PREFIX = "crmplus.backup.";
const EXPORT_VERSION = 1;

export type StorageStatus = "loaded" | "saved" | "warning" | "error";
export type StorageStatusDetail = {
  key: string;
  status: StorageStatus;
  message: string;
  bytes?: number;
};

type StoredValue<T> = { version: number; value: T };
type MigratableRecord = Record<string, unknown>;
type ExportPayload = {
  format: "crmplus-local-backup";
  version: number;
  createdAt: string;
  slug?: string;
  entries: Record<string, string>;
};

function isStoredValue<T>(value: unknown): value is StoredValue<T> {
  return Boolean(value && typeof value === "object" && "version" in value && "value" in value);
}

function emitStorageStatus(detail: StorageStatusDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StorageStatusDetail>(STORAGE_EVENT, { detail }));
}

function byteSize(value: string) {
  return new Blob([value]).size;
}

function backupRawValue(key: string, raw: string, reason: string) {
  if (key.startsWith(BACKUP_PREFIX)) return;
  try {
    const backupKey = `${BACKUP_PREFIX}${Date.now()}.${encodeURIComponent(key)}`;
    window.localStorage.setItem(backupKey, JSON.stringify({ key, reason, raw, createdAt: new Date().toISOString() }));
  } catch {
    // A cópia é a última linha de defesa; se a quota já estiver cheia, preservamos o valor original sem alterá-lo.
  }
}

function migrateKnownValue<T>(key: string, value: T): T {
  if (!Array.isArray(value)) return value;

  if (key === "crmplus.olympus.records" || key === "crmplus.olympus.records.v2") {
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const record = entry as MigratableRecord;
      return record.status === "Vendido" ? { ...record, status: "Negócio concluído" } : record;
    }) as unknown as T;
  }

  if (key === "crmplus.pegasus.records" || key === "crmplus.pegasus.records.v2") {
    const previousServiceStates = new Set(["Aguardando chegada", "Em atendimento", "Aguardando retirada", "Concluído", "Agendado", "Pronto", "Hospedado"]);
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const record = entry as MigratableRecord;
      return typeof record.status === "string" && previousServiceStates.has(record.status) ? { ...record, status: "Ativo" } : record;
    }) as unknown as T;
  }

  if (key === "crmplus.pandora.surveys" || key === "crmplus.pandora.surveys.v2") {
    return value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const survey = entry as MigratableRecord;
      return typeof survey.link === "string" ? { ...survey, link: survey.link.replace("crmplus.local", "crmplus.store") } : survey;
    }) as unknown as T;
  }

  return value;
}

export function useLocalState<T>(key: string, initial: T | (() => T)) {
  const initialFactory = useRef(initial);
  const [value, setValue] = useState<T>(() => typeof initial === "function" ? (initial as () => T)() : initial);
  const [hydrated, setHydrated] = useState(false);
  const writeBlocked = useRef(false);

  useEffect(() => {
    writeBlocked.current = false;
    setHydrated(false);
    setValue(typeof initialFactory.current === "function" ? (initialFactory.current as () => T)() : initialFactory.current);

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        emitStorageStatus({ key, status: "loaded", message: "Pronto para salvar neste navegador." });
        setHydrated(true);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as StoredValue<T> | T;
        if (isStoredValue<T>(parsed)) {
          if (parsed.version > STORE_VERSION) {
            backupRawValue(key, raw, `Versão ${parsed.version} mais recente que a suportada (${STORE_VERSION})`);
            writeBlocked.current = true;
            emitStorageStatus({ key, status: "error", message: "Estes dados foram criados por uma versão mais recente. Nada foi substituído; exporte o backup antes de continuar." });
          } else {
            if (parsed.version < STORE_VERSION) backupRawValue(key, raw, `Migração da versão ${parsed.version} para ${STORE_VERSION}`);
            setValue(migrateKnownValue(key, parsed.value));
            emitStorageStatus({ key, status: parsed.version < STORE_VERSION ? "warning" : "loaded", message: parsed.version < STORE_VERSION ? "Dados antigos migrados com cópia de segurança." : "Dados locais carregados." });
          }
        } else {
          backupRawValue(key, raw, "Migração de formato legado");
          setValue(migrateKnownValue(key, parsed));
          emitStorageStatus({ key, status: "warning", message: "Formato antigo migrado com cópia de segurança." });
        }
      } catch {
        backupRawValue(key, raw, "JSON inválido");
        writeBlocked.current = true;
        emitStorageStatus({ key, status: "error", message: "Os dados locais estão corrompidos. O valor original foi preservado e o salvamento foi bloqueado." });
      }
    } catch {
      writeBlocked.current = true;
      emitStorageStatus({ key, status: "error", message: "O navegador bloqueou o acesso aos dados locais." });
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated || writeBlocked.current) return;
    try {
      const serialized = JSON.stringify({ version: STORE_VERSION, value } satisfies StoredValue<T>);
      window.localStorage.setItem(key, serialized);
      emitStorageStatus({ key, status: "saved", message: "Alterações salvas neste navegador.", bytes: byteSize(serialized) });
    } catch (error) {
      const quota = error instanceof DOMException && ["QuotaExceededError", "NS_ERROR_DOM_QUOTA_REACHED"].includes(error.name);
      emitStorageStatus({
        key,
        status: "error",
        message: quota ? "O espaço local está cheio. Exporte um backup e remova anexos antes de continuar." : "Não foi possível salvar as alterações neste navegador.",
      });
    }
  }, [hydrated, key, value]);

  return [value, setValue as Dispatch<SetStateAction<T>>] as const;
}

export function subscribeStorageStatus(listener: (detail: StorageStatusDetail) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<StorageStatusDetail>).detail);
  window.addEventListener(STORAGE_EVENT, handler);
  return () => window.removeEventListener(STORAGE_EVENT, handler);
}

export function getLocalStorageUsage(prefix = "crmplus.") {
  let bytes = 0;
  let entries = 0;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith(prefix)) continue;
    const value = window.localStorage.getItem(key) ?? "";
    bytes += byteSize(key) + byteSize(value);
    entries += 1;
  }
  return { bytes, entries };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function appKeyMatches(key: string, slug?: string) {
  if (!key.startsWith("crmplus.")) return false;
  if (!slug) return true;
  return key.startsWith(`crmplus.${slug}`) || key.startsWith(`crmplus.preferences.${slug}`) || key === `crmplus.access.${slug}.session`;
}

export function exportLocalBackup(slug?: string) {
  const entries: Record<string, string> = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || key.startsWith(BACKUP_PREFIX) || !appKeyMatches(key, slug)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  const payload: ExportPayload = { format: "crmplus-local-backup", version: EXPORT_VERSION, createdAt: new Date().toISOString(), slug, entries };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `crmplus-${slug ?? "completo"}-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return Object.keys(entries).length;
}

export async function importLocalBackup(file: File, slug?: string) {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<ExportPayload>;
  if (parsed.format !== "crmplus-local-backup" || parsed.version !== EXPORT_VERSION || !parsed.entries || typeof parsed.entries !== "object") {
    throw new Error("Arquivo de backup inválido ou incompatível.");
  }
  const entries = Object.entries(parsed.entries).filter(([key, value]) => appKeyMatches(key, slug) && typeof value === "string");
  if (!entries.length) throw new Error("Este backup não contém dados compatíveis com o aplicativo.");

  for (const [key, value] of entries) {
    const current = window.localStorage.getItem(key);
    if (current !== null) backupRawValue(key, current, "Substituição por importação de backup");
    window.localStorage.setItem(key, value);
  }
  return entries.length;
}

export function clearAppStorage(slug: string) {
  const keys = Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index)).filter((key): key is string => Boolean(key && appKeyMatches(key, slug)));
  for (const key of keys) window.localStorage.removeItem(key);
  return keys.length;
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function fileToDataUrl(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return readFileAsDataUrl(file);
  const source = await readFileAsDataUrl(file);
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) { resolve(source); return; }
      context.drawImage(image, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/webp", 0.78);
      resolve(compressed.length < source.length ? compressed : source);
    };
    image.onerror = () => resolve(source);
    image.src = source;
  });
}
