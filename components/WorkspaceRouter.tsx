import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { PhaseTwoWorkspace } from "./workspaces/phase-two/PhaseTwoWorkspace";

export function WorkspaceRouter({ product }: { product: Product; workspace: Workspace }) {
  return <PhaseTwoWorkspace product={product} />;
}
