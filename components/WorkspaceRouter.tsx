import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { RedesignedWorkspace } from "./workspaces/redesign/RedesignedWorkspace";

export function WorkspaceRouter({ product }: { product: Product; workspace: Workspace }) {
  return <RedesignedWorkspace product={product} />;
}
