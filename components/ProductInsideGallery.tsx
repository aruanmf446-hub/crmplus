import type { Product } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { getProductMedia } from "@/lib/storefront";
import { ProductIcon } from "./ProductIcon";
import { ProductMediaImage } from "./ProductMediaImage";

export function ProductInsideGallery({ product }: { product: Product }) {
  const presentation = getProductPresentation(product.slug);
  const media = getProductMedia(product.slug);

  return (
    <section className="product-inside-section">
      <div className="shell">
        <div className="product-inside-heading">
          <div><h2>Veja o {product.shortName} por dentro.</h2><p>{product.outcome}</p></div>
        </div>
        <div className="product-inside-grid">
          {presentation.screens.map((screen, index) => {
            const candidates = [...media.galleryCandidates[index + 1], ...media.coverCandidates];
            return (
              <article key={screen.title}>
                <div className="product-inside-media">
                  <ProductMediaImage
                    candidates={candidates}
                    alt={`${screen.title} no ${product.name}`}
                    className="product-inside-image"
                    fallback={<div className="product-inside-fallback"><ProductIcon slug={product.slug} size={58} /><span>{screen.title}</span></div>}
                  />
                </div>
                <div className="product-inside-copy"><span>0{index + 1}</span><div><h3>{screen.title}</h3><p>{screen.description}</p></div></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
