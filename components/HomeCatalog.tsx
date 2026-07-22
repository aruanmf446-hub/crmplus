"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type KeyboardEvent, type MouseEvent } from "react";
import { ProductIcon } from "@/components/ProductIcon";
import type { Product } from "@/lib/apps";
import {
  formatMonthlyPrice,
  getProductMedia,
  getSearchText,
  getStorefrontInfo,
  normalizeSearch,
  segmentFilters,
} from "@/lib/storefront";
import styles from "./HomeCatalog.module.css";

type Props = { products: Product[] };
type SegmentId = (typeof segmentFilters)[number]["id"];

export function HomeCatalog({ products }: Props) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<SegmentId>("all");
  const railRef = useRef<HTMLDivElement | null>(null);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    return products.filter((product) => {
      const info = getStorefrontInfo(product.slug);
      return (segment === "all" || info.segment === segment) && (!normalizedQuery || normalizeSearch(getSearchText(product)).includes(normalizedQuery));
    });
  }, [products, query, segment]);

  function selectSegment(nextSegment: SegmentId) {
    setSegment(nextSegment);
    requestAnimationFrame(() => railRef.current?.scrollTo({ left: 0, behavior: "smooth" }));
  }

  return (
    <section className={styles.catalog} id="sistemas" aria-labelledby="catalog-title">
      <div className="shell">
        <div className={styles.heading}>
          <div><p className={styles.kicker}>Encontre sem perder tempo</p><h2 id="catalog-title">O sistema certo para o seu segmento.</h2></div>
          <p>Pesquise pelo tipo de negócio ou escolha um filtro. Você verá somente os aplicativos que fazem sentido para a sua rotina.</p>
        </div>

        <label className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="Pesquisar segmento, necessidade ou app" aria-label="Pesquisar segmento, necessidade ou aplicativo" />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa">×</button> : null}
        </label>

        <div className={styles.filters} aria-label="Filtrar aplicativos por segmento">
          {segmentFilters.map((filter) => <button type="button" key={filter.id} className={segment === filter.id ? styles.filterActive : undefined} onClick={() => selectSegment(filter.id)} aria-pressed={segment === filter.id}><FilterIcon id={filter.id} />{filter.label}</button>)}
        </div>

        <div className={styles.resultBar}><strong>{filteredProducts.length === 1 ? "1 aplicativo encontrado" : `${filteredProducts.length} aplicativos encontrados`}</strong><span>Arraste para o lado ou use as setas</span></div>

        {filteredProducts.length ? (
          <div className={styles.carouselShell}>
            <button className={`${styles.railButton} ${styles.railButtonLeft}`} type="button" onClick={() => railRef.current?.scrollBy({ left: -350, behavior: "smooth" })} aria-label="Ver aplicativos anteriores">‹</button>
            <div className={styles.rail} ref={railRef}>{filteredProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
            <button className={`${styles.railButton} ${styles.railButtonRight}`} type="button" onClick={() => railRef.current?.scrollBy({ left: 350, behavior: "smooth" })} aria-label="Ver próximos aplicativos">›</button>
          </div>
        ) : (
          <div className={styles.empty}><ProductIcon slug="pandora" size={30} /><h3>Nenhum aplicativo encontrado</h3><p>Tente pesquisar por palavras como oficina, pet shop, orçamento, imóveis, eventos ou biblioteca.</p><button type="button" onClick={() => { setQuery(""); selectSegment("all"); }}>Mostrar todos</button></div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const info = getStorefrontInfo(product.slug);
  const media = getProductMedia(product.slug);
  const hasMultipleImages = media.gallery.length > 1;
  const mediaStyle = { "--product-color": product.color, "--product-soft": product.colorSoft, "--media-image": `url("${media.gallery[galleryIndex]}")` } as CSSProperties;

  async function startVideo() {
    if (videoUnavailable) return;
    try { await videoRef.current?.play(); setVideoActive(true); } catch { setVideoActive(false); }
  }
  function stopVideo(reset = false) { videoRef.current?.pause(); if (reset && videoRef.current) videoRef.current.currentTime = 0; setVideoActive(false); }
  function toggleVideo() { if (videoActive) stopVideo(); else void startVideo(); }
  function moveGallery(direction: -1 | 1) { stopVideo(true); setGalleryIndex((current) => (current + direction + media.gallery.length) % media.gallery.length); }

  return (
    <article className={styles.card} style={mediaStyle}>
      <div className={styles.media} onMouseEnter={() => void startVideo()} onMouseLeave={() => stopVideo(true)} onClick={toggleVideo} role="button" tabIndex={0} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => { if (event.key === "Enter" || event.key === " ") toggleVideo(); }} aria-label={`Ver prévia do ${product.name}`}>
        {!videoUnavailable ? <video ref={videoRef} className={videoActive ? styles.videoActive : undefined} src={media.video} poster={media.gallery[galleryIndex]} muted loop playsInline preload="metadata" onError={() => { setVideoUnavailable(true); setVideoActive(false); }} aria-hidden="true" /> : null}
        {hasMultipleImages ? <><button className={`${styles.mediaArrow} ${styles.mediaArrowLeft}`} type="button" onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); moveGallery(-1); }} aria-label="Imagem anterior">‹</button><button className={`${styles.mediaArrow} ${styles.mediaArrowRight}`} type="button" onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); moveGallery(1); }} aria-label="Próxima imagem">›</button><div className={styles.dots}>{media.gallery.map((item, index) => <i className={index === galleryIndex ? styles.dotActive : undefined} key={item} />)}</div></> : null}
      </div>
      <div className={styles.cardBody}><div className={styles.cardIdentity}><span><ProductIcon slug={product.slug} size={21} /></span><div><h3>{product.name}</h3><strong>{formatMonthlyPrice(info.monthlyPrice)}</strong></div></div><p>{product.description}</p><div className={styles.cardActions}><Link className={styles.learnMore} href={`/aplicativos/${product.slug}`}>Saiba mais</Link><Link className={styles.subscribe} href={`/assinar/${product.slug}`}>Assinar agora</Link></div></div>
    </article>
  );
}

function FilterIcon({ id }: { id: string }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (id === "automotivo") return <svg {...common}><path d="M5 17h14l-1-6-2-3H8l-2 3-1 6Z" /><circle cx="8" cy="17" r="2" /><circle cx="16" cy="17" r="2" /></svg>;
  if (id === "alimentacao") return <svg {...common}><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4" /></svg>;
  if (id === "educacao") return <svg {...common}><path d="M4 5h7a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3ZM20 5h-3a3 3 0 0 0-3 3v11h3a3 3 0 0 1 3 3Z" /></svg>;
  if (id === "imoveis-patrimonio") return <svg {...common}><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" /></svg>;
  if (id === "eventos-publico") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>;
  if (id === "campo") return <svg {...common}><path d="M12 21V9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 17c5 0 8-3 8-8-5 0-8 3-8 8Z" /></svg>;
  if (id === "pet-shop") return <svg {...common}><circle cx="8" cy="7" r="2" /><circle cx="16" cy="7" r="2" /><circle cx="5" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><path d="M12 11c-4 0-7 4-7 7 0 2 2 3 4 2l3-1 3 1c2 1 4 0 4-2 0-3-3-7-7-7Z" /></svg>;
  if (id === "vendas-servicos") return <svg {...common}><path d="M5 19V9M12 19V5M19 19v-7M3 19h18" /></svg>;
  return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
}
