"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { products } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { getProductMedia } from "@/lib/storefront";
import { ProductIcon } from "./ProductIcon";
import { ProductMediaImage } from "./ProductMediaImage";

const showcaseSlugs = ["atlas", "ares", "artemis", "pegasus"];

export function HomeProductShowcase() {
  const showcaseProducts = useMemo(
    () => showcaseSlugs.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean),
    [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const active = showcaseProducts[activeIndex] ?? showcaseProducts[0];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || showcaseProducts.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % showcaseProducts.length), 5200);
    return () => window.clearInterval(timer);
  }, [showcaseProducts.length]);

  if (!active) return null;

  const presentation = getProductPresentation(active.slug);
  const media = getProductMedia(active.slug);
  const activeStyle = { "--showcase-accent": active.color, "--showcase-soft": active.colorSoft } as CSSProperties;
  const mainCandidates = [...media.galleryCandidates[1], ...media.coverCandidates];

  return (
    <div className="home-product-showcase-v2" style={activeStyle} aria-label="Prévia de aplicativos CRMPlus+">
      <Link className="showcase-main-window" href={`/aplicativos/${active.slug}`}>
        <div className="showcase-window-bar">
          <span><i /><i /><i /></span>
          <div><ProductIcon slug={active.slug} size={18} /><strong>{active.shortName}</strong></div>
          <small>{presentation.label}</small>
        </div>
        <div className="showcase-window-media">
          <ProductMediaImage
            candidates={mainCandidates}
            alt={`Tela principal do ${active.name}`}
            className="showcase-window-image"
            eager
            fallback={<div className="showcase-window-fallback"><ProductIcon slug={active.slug} size={70} /><strong>{active.shortName}</strong><span>{presentation.benefit}</span></div>}
          />
        </div>
        <div className="showcase-window-caption"><span>Conheça o produto por dentro</span><strong>{presentation.screens[0].title}</strong></div>
      </Link>

      <div className="showcase-switcher" aria-label="Escolher aplicativo em destaque">
        {showcaseProducts.map((product, index) => {
          if (!product) return null;
          return (
            <button
              key={product.slug}
              type="button"
              className={index === activeIndex ? "showcase-switcher-active" : undefined}
              onClick={() => setActiveIndex(index)}
              aria-pressed={index === activeIndex}
            >
              <ProductIcon slug={product.slug} size={17} />
              <span><strong>{product.shortName}</strong><small>{getProductPresentation(product.slug).label}</small></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
