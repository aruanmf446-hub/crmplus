import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommercialProductPage } from "@/components/CommercialProductPage";
import { getProduct, products } from "@/lib/apps";
import { getStorefrontInfo } from "@/lib/storefront";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const info = getStorefrontInfo(product.slug);
  return {
    title: `${product.name} — ${product.category}`,
    description: `${product.description} Conheça funções, benefícios, fluxo de uso e planos a partir de R$ ${info.monthlyPrice} por mês.`,
    keywords: [product.name, product.category, product.tagline, ...product.features],
    alternates: { canonical: `/aplicativos/${product.slug}/` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${product.name} | CRMPlus+`,
      description: product.description,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const info = getStorefrontInfo(product.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: info.monthlyPrice,
      category: "subscription",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CommercialProductPage product={product} />
    </>
  );
}
