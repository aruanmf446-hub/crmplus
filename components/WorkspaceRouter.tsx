import type { Product } from "@/lib/apps";
import { AppAccessGate } from "./workspaces/phase-four/AppAccessGate";
import { PhaseFourWorkspace } from "./workspaces/phase-four/PhaseFourWorkspace";

export function WorkspaceRouter({ product }: { product: Product }) {
  return <AppAccessGate product={product}><PhaseFourWorkspace product={product} /></AppAccessGate>;
}
