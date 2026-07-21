import type { Product } from "@/lib/apps";
import type { Workspace } from "@/lib/workspaces";
import { AppWorkspace } from "./AppWorkspace";
import { AresWorkspace } from "./workspaces/ares/AresWorkspace";
import { ArtemisWorkspace } from "./workspaces/artemis";
import { AtlasWorkspace } from "./workspaces/atlas";
import { HerculesWorkspace } from "./workspaces/hercules/HerculesWorkspace";
import { PandoraWorkspace } from "./workspaces/pandora/PandoraWorkspace";
import { PoseidonWorkspace } from "./workspaces/poseidon/PoseidonWorkspace";

export function WorkspaceRouter({ product, workspace }: { product: Product; workspace: Workspace }) {
  if (product.slug === "atlas") return <AtlasWorkspace />;
  if (product.slug === "artemis") return <ArtemisWorkspace />;
  if (product.slug === "poseidon") return <PoseidonWorkspace />;
  if (product.slug === "hercules") return <HerculesWorkspace />;
  if (product.slug === "pandora") return <PandoraWorkspace />;
  if (product.slug === "ares") return <AresWorkspace />;
  return <AppWorkspace product={product} workspace={workspace} />;
}
