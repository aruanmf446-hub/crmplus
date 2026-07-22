import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { PhaseThreeWorkspace } from "./workspaces/phase-three/PhaseThreeWorkspace";

export function WorkspaceRouter({ product }: { product: Product; workspace: Workspace }) {
  return <PhaseThreeWorkspace product={product} />;
}
