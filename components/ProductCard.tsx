import Link from "next/link";
import type { Product } from "@/lib/apps";
import { ProductIcon } from "./ProductIcon";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article className="product-card" style={{ "--product-color": product.color, "--product-soft": product.colorSoft } as React.CSSProperties}>
      <div className="product-card-top">
        <span className="product-number">0{index + 1}</span>
        <span className="product-icon"><ProductIcon slug={product.slug} /></span>
      </div>
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <ul aria-label={`Recursos do ${product.shortName}`}>
        {product.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
      <Link href={`/apps/${product.slug}`} aria-label={`Conhecer o ${product.name}`}>
        Conhecer o sistema <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
