import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkspaceRouter } from "@/components/WorkspaceRouter";
import { getProduct, products } from "@/lib/apps";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const title = `${product.name} | Acesso | CRMPlus+`;
  const description = `Acesso local ao ${product.name}. Conta, sessão e registros permanecem somente neste navegador.`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

export default async function WorkspacePage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <WorkspaceRouter product={product} />;
}
