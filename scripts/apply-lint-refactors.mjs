import fs from "node:fs/promises";

async function read(path) {
  return fs.readFile(path, "utf8");
}

async function write(path, content) {
  await fs.writeFile(path, content, "utf8");
  console.log(`Atualizado: ${path}`);
}

function replaceExact(content, before, after, label) {
  if (!content.includes(before)) throw new Error(`Trecho esperado não encontrado: ${label}`);
  return content.replace(before, after);
}

async function refactorLocalStore() {
  const path = "components/workspaces/phase-four/localStore.ts";
  let content = await read(path);
  const pattern = /  useEffect\(\(\) => \{\n    writeBlocked\.current = false;[\s\S]*?\n  \}, \[key\]\);/;
  const match = content.match(pattern);
  if (!match) throw new Error("Bloco de inicialização do localStore não encontrado");
  const replacement = `  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      writeBlocked.current = false;
      setHydrated(false);
      setValue(typeof initialFactory.current === "function" ? (initialFactory.current as () => T)() : initialFactory.current);

      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
          emitStorageStatus({ key, status: "loaded", message: "Pronto para salvar neste navegador." });
          if (active) setHydrated(true);
          return;
        }

        try {
          const parsed = JSON.parse(raw) as StoredValue<T> | T;
          if (isStoredValue<T>(parsed)) {
            if (parsed.version > STORE_VERSION) {
              backupRawValue(key, raw, \`Versão \${parsed.version} mais recente que a suportada (\${STORE_VERSION})\`);
              writeBlocked.current = true;
              emitStorageStatus({ key, status: "error", message: "Estes dados foram criados por uma versão mais recente. Nada foi substituído; exporte o backup antes de continuar." });
            } else {
              if (parsed.version < STORE_VERSION) backupRawValue(key, raw, \`Migração da versão \${parsed.version} para \${STORE_VERSION}\`);
              if (active) setValue(migrateKnownValue(key, parsed.value));
              emitStorageStatus({ key, status: parsed.version < STORE_VERSION ? "warning" : "loaded", message: parsed.version < STORE_VERSION ? "Dados antigos migrados com cópia de segurança." : "Dados locais carregados." });
            }
          } else {
            backupRawValue(key, raw, "Migração de formato legado");
            if (active) setValue(migrateKnownValue(key, parsed));
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
        if (active) setHydrated(true);
      }
    });
    return () => { active = false; };
  }, [key]);`;
  content = content.replace(pattern, replacement);
  await write(path, content);
}

async function refactorSharedShell() {
  const path = "components/workspaces/phase-four/shared.tsx";
  let content = await read(path);
  const before = `  useEffect(() => {
    const savedMode = window.localStorage.getItem("crmplus.color-mode");
    const nextMode = savedMode === "dark" ? "dark" : "light";
    setColorMode(nextMode);
    document.documentElement.dataset.colorMode = nextMode;
    setCollapsed(window.localStorage.getItem("crmplus.ui.sidebar.collapsed") === "true");
    return subscribeStorageStatus((detail) => {
      if (detail.key.includes(product.slug) || detail.key.startsWith("crmplus.preferences.")) setStorageStatus(detail);
    });
  }, [product.slug]);`;
  const after = `  useEffect(() => {
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
  }, [product.slug]);`;
  content = replaceExact(content, before, after, "inicialização do AppShell");
  await write(path, content);
}

async function refactorPandora() {
  const path = "components/workspaces/phase-four/PandoraApp.tsx";
  let content = await read(path);
  content = replaceExact(content, 'import { useMemo, useState } from "react";', 'import { useCallback, useMemo, useState } from "react";', "import do Pandora");
  const beforeSurvey = `  const visibleSurveys = useMemo(() => surveys.filter((survey) => (surveyStatus === "Todas" || (surveyStatus === "Ativas" ? survey.active : !survey.active)) && \`\${survey.name} \${survey.question}\`.toLowerCase().includes(surveyQuery.trim().toLowerCase())).sort((a, b) => surveySort === "Mais respostas" ? surveyResponseCount(b) - surveyResponseCount(a) : a.name.localeCompare(b.name, "pt-BR")), [feedbacks, surveyQuery, surveySort, surveyStatus, surveys]);`;
  const afterSurvey = `  const surveyResponseCount = useCallback((survey: Survey) => feedbacks.filter((feedback) => feedback.channel === survey.name).length, [feedbacks]);
  const visibleSurveys = useMemo(() => surveys.filter((survey) => (surveyStatus === "Todas" || (surveyStatus === "Ativas" ? survey.active : !survey.active)) && \`\${survey.name} \${survey.question}\`.toLowerCase().includes(surveyQuery.trim().toLowerCase())).sort((a, b) => surveySort === "Mais respostas" ? surveyResponseCount(b) - surveyResponseCount(a) : a.name.localeCompare(b.name, "pt-BR")), [surveyQuery, surveyResponseCount, surveySort, surveyStatus, surveys]);`;
  content = replaceExact(content, beforeSurvey, afterSurvey, "contagem das pesquisas do Pandora");
  content = replaceExact(content, `  function surveyResponseCount(survey: Survey) { return feedbacks.filter((feedback) => feedback.channel === survey.name).length; }\n`, "", "função antiga de contagem do Pandora");
  await write(path, content);
}

async function refactorVerticalApp() {
  const path = "components/workspaces/phase-four/VerticalBusinessApp.tsx";
  let content = await read(path);
  content = replaceExact(content, 'import { useMemo, useState, type ChangeEvent } from "react";', 'import { useCallback, useMemo, useState, type ChangeEvent } from "react";', "import do VerticalBusinessApp");
  content = replaceExact(content,
    `  const finalStatuses = config.finalStatuses ?? [finalStatus];\n  const operationFinalStatuses = config.operationFinalStatuses ?? [config.operationStatuses.at(-1) ?? ""];\n  const resourceFinalStatuses = config.resourceFinalStatuses ?? [config.resourceStatuses.at(-1) ?? ""];\n  const isFinalRecord = (record: MainRecord) => finalStatuses.includes(record.status);`,
    `  const finalStatuses = useMemo(() => config.finalStatuses ?? [finalStatus], [config.finalStatuses, finalStatus]);\n  const operationFinalStatuses = config.operationFinalStatuses ?? [config.operationStatuses.at(-1) ?? ""];\n  const resourceFinalStatuses = config.resourceFinalStatuses ?? [config.resourceStatuses.at(-1) ?? ""];\n  const isFinalRecord = useCallback((record: MainRecord) => finalStatuses.includes(record.status), [finalStatuses]);`,
    "estados finais do VerticalBusinessApp");
  content = replaceExact(content, `  }, [config.statuses, query, recordSort, records, scope, statusFilter]);`, `  }, [config.statuses, isFinalRecord, query, recordSort, records, scope, statusFilter]);`, "dependências da lista vertical");
  await write(path, content);
}

async function cleanHerculesImport() {
  const path = "components/workspaces/phase-four/HerculesApp.tsx";
  let content = await read(path);
  content = replaceExact(content,
    'import { AppShell, EmptyState, Field, Form, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";',
    'import { AppShell, Field, Form, Icon, Modal, StatusPill, Toast, type NavItem } from "./shared";',
    "import não utilizado do Hercules");
  await write(path, content);
}

await refactorLocalStore();
await refactorSharedShell();
await refactorPandora();
await refactorVerticalApp();
await cleanHerculesImport();
