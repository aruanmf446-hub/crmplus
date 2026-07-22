import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { AppAccessGate } from "./workspaces/phase-four/AppAccessGate";
import { PhaseFourWorkspace } from "./workspaces/phase-four/PhaseFourWorkspace";

export function WorkspaceRouter({ product }: { product: Product; workspace?: Workspace }) {
  return <AppAccessGate product={product}><PhaseFourWorkspace product={product} /></AppAccessGate>;
}
