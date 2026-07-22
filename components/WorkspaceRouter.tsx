import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { PhaseFourWorkspace } from "./workspaces/phase-four/PhaseFourWorkspace";

export function WorkspaceRouter({ product }: { product: Product; workspace?: Workspace }) {
  return <PhaseFourWorkspace product={product} />;
}
