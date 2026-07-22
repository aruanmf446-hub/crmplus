"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { UiIcon } from "./UiIcon";
import { AtlasCommand } from "./workspace/AtlasCommand";
import { AresStudio } from "./workspace/AresStudio";
import { ArtemisPulse } from "./workspace/ArtemisPulse";
import { PandoraInsights } from "./workspace/PandoraInsights";
import { PoseidonRoom } from "./workspace/PoseidonRoom";
import { HerculesEvidence } from "./workspace/HerculesEvidence";
import { appConfigs, seedRecords, ProductRail, ProductTopbar, RecordLibrary, RecordModal } from "./workspace/shared";
import type { LocalRow, ModalState, RecordMap, WorkspaceActions } from "./workspace/shared";

export function AppWorkspace({ product, workspace }: { product: Product; workspace: Workspace }) {
  const config = appConfigs[product.slug] ?? appConfigs.atlas;
  const [activeView, setActiveView] = useState(config.primaryView);
  const [records, setRecords] = useState<RecordMap>(() => seedRecords(workspace));
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const storageKey = `crmplus:${product.slug}:records:v3`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setRecords(JSON.parse(saved) as RecordMap);
    } catch {
      setToast("Não foi possível carregar os dados locais.");
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }, [hydrated, records, storageKey]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function openCreate(viewId?: string) {
    setModal({ viewId: viewId ?? activeView });
  }

  function openEdit(viewId: string, row: LocalRow) {
    setModal({ viewId, row });
  }

  function saveRecord(payload: Omit<LocalRow, "id">) {
    if (!modal) return;
    setRecords((current) => {
      const rows = current[modal.viewId] ?? [];
      const next = modal.row
        ? rows.map((row) => (row.id === modal.row?.id ? { ...payload, id: row.id } : row))
        : [{ ...payload, id: `${modal.viewId}-${Date.now()}` }, ...rows];
      return { ...current, [modal.viewId]: next };
    });
    showToast(modal.row ? "Alterações salvas neste navegador." : "Novo registro criado neste navegador.");
    setModal(null);
  }

  function deleteRecord(viewId: string, id: string) {
    if (!window.confirm("Excluir este registro somente deste navegador?")) return;
    setRecords((current) => ({ ...current, [viewId]: (current[viewId] ?? []).filter((row) => row.id !== id) }));
    showToast("Registro removido deste navegador.");
  }

  function duplicateRecord(viewId: string, row: LocalRow) {
    setRecords((current) => ({
      ...current,
      [viewId]: [{ ...row, id: `${viewId}-${Date.now()}`, title: `${row.title} · cópia`, status: "Rascunho" }, ...(current[viewId] ?? [])],
    }));
    showToast("Cópia criada.");
  }

  function updateStatus(viewId: string, id: string, status: string) {
    setRecords((current) => ({
      ...current,
      [viewId]: (current[viewId] ?? []).map((row) => (row.id === id ? { ...row, status } : row)),
    }));
    showToast(`Situação alterada para ${status}.`);
  }

  const actions: WorkspaceActions = {
    records,
    activeView,
    setActiveView,
    openCreate,
    openEdit,
    deleteRecord,
    duplicateRecord,
    updateStatus,
    showToast,
  };

  const screenProps = { product, workspace, views: workspace.views, actions };
  const primaryScreen = {
    atlas: <AtlasCommand {...screenProps} />,
    ares: <AresStudio {...screenProps} />,
    artemis: <ArtemisPulse {...screenProps} />,
    pandora: <PandoraInsights {...screenProps} />,
    poseidon: <PoseidonRoom {...screenProps} />,
    hercules: <HerculesEvidence {...screenProps} />,
  }[product.slug] ?? <AtlasCommand {...screenProps} />;

  const content = activeView === config.primaryView
    ? primaryScreen
    : <RecordLibrary product={product} workspace={workspace} views={workspace.views} actions={actions} />;

  return (
    <div
      className={`premium-workspace pw-${product.slug}`}
      style={{ "--app-accent": product.color, "--app-soft": product.colorSoft } as CSSProperties}
      data-product={product.slug}
    >
      <ProductRail product={product} workspace={workspace} views={workspace.views} actions={actions} config={config} />
      <div className="pw-stage">
        <ProductTopbar product={product} workspace={workspace} actions={actions} config={config} />
        {content}
      </div>
      {modal ? (
        <RecordModal
          config={config}
          workspace={workspace}
          viewId={modal.viewId}
          row={modal.row}
          onClose={() => setModal(null)}
          onSave={saveRecord}
        />
      ) : null}
      {toast ? <div className="pw-toast"><UiIcon name="checkCircle" size={18} /><span>{toast}</span></div> : null}
    </div>
  );
}
