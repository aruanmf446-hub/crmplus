import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkspaceRouter } from "@/components/WorkspaceRouter";
import { getProduct, products } from "@/lib/apps";
import { getWorkspace } from "@/lib/workspaces";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: `Demonstração ${product.name}`, description: `Conheça a estrutura visual e responsiva do ${product.name}.`, robots: { index: false, follow: false } };
}

export default async function WorkspacePage({ params }: Props) {
  const slug = (await params).slug;
  const product = getProduct(slug);
  const workspace = getWorkspace(slug);
  if (!product || !workspace) notFound();
  return <WorkspaceRouter product={product} workspace={workspace} />;
}
