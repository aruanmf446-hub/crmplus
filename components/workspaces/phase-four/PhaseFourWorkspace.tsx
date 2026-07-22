"use client";

import type { Product } from "@/lib/apps";
import { AtlasApp } from "./AtlasApp";
import { ArtemisApp } from "./ArtemisApp";
import { AresApp } from "./AresApp";
import { PoseidonApp } from "./PoseidonApp";
import { PandoraApp } from "./PandoraApp";
import { HerculesApp } from "./HerculesApp";
import { ZeusApp } from "./ZeusApp";

export function PhaseFourWorkspace({ product }: { product: Product }) {
  if (product.slug === "atlas") return <AtlasApp product={product} />;
  if (product.slug === "artemis") return <ArtemisApp product={product} />;
  if (product.slug === "ares") return <AresApp product={product} />;
  if (product.slug === "poseidon") return <PoseidonApp product={product} />;
  if (product.slug === "pandora") return <PandoraApp product={product} />;
  if (product.slug === "hercules") return <HerculesApp product={product} />;
  if (product.slug === "zeus") return <ZeusApp product={product} />;
  return null;
}
