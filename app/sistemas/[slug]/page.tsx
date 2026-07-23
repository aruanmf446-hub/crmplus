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
  return { title: `${product.name} | Acesso`, description: product.description, robots: { index: false, follow: false } };
}

export default async function WorkspacePage({ params }: Props) {
  const slug = (await params).slug;
  const product = getProduct(slug);
  if (!product) notFound();
  const workspace = getWorkspace(slug);
  return (
    <>
      <title>{`${product.name} | Acesso | CRMPlus+`}</title>
      <meta name="description" content={`Acesso local ao ${product.name}. Conta e registros permanecem somente neste navegador.`} />
      <WorkspaceRouter product={product} workspace={workspace} />
    </>
  );
}
