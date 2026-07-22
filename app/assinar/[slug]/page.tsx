import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { getProduct, products } from "@/lib/apps";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `Planos do ${product.name}`,
    description: `Escolha entre os planos mensal, semestral e anual do ${product.name}. Pagamento ainda não integrado.`,
    robots: { index: false, follow: true },
  };
}

export default async function SubscribePage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <SubscriptionPlans product={product} />;
}
