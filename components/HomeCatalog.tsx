"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type MouseEvent } from "react";
import { ProductIcon } from "@/components/ProductIcon";
import type { Product } from "@/lib/apps";
import { getProductPresentation } from "@/lib/productPresentation";
import { formatMonthlyPrice, getProductMedia, getSearchText, getStorefrontInfo, normalizeSearch, segmentFilters } from "@/lib/storefront";
import styles from "./HomeCatalog.module.css";

type Props = { products: Product[] };
type SegmentId = (typeof segmentFilters)[number]["id"];

export function HomeCatalog({ products }: Props) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<SegmentId>("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    return products.filter((product) => {
      const info = getStorefrontInfo(product.slug);
      return (segment === "all" || info.segment === segment) && (!normalizedQuery || normalizeSearch(getSearchText(product)).includes(normalizedQuery));
    });
  }, [products, query, segment]);

  return (
    <section className={`${styles.catalog} storefront-catalog`} id="sistemas" aria-labelledby="catalog-title">
      <div className="shell">
        <div className={styles.heading}>
          <div><h2 id="catalog-title">Encontre o produto que combina com o seu negócio.</h2></div>
          <p>Pesquise pelo segmento ou pela necessidade. Cada aplicativo possui identidade, fluxo e funções próprias.</p>
        </div>

        <label className={styles.search}>
          <svg className="storefront-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="Pesquisar oficina, pet shop, orçamento, eventos..." aria-label="Pesquisar segmento, necessidade ou aplicativo" />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa">×</button> : null}
        </label>

        <div className={styles.filters} aria-label="Filtrar aplicativos por segmento">
          {segmentFilters.map((filter) => <button type="button" key={filter.id} className={segment === filter.id ? styles.filterActive : undefined} onClick={() => setSegment(filter.id)} aria-pressed={segment === filter.id}><FilterIcon id={filter.id} />{filter.label}</button>)}
        </div>

        <div className={styles.resultBar}><strong>{filteredProducts.length === 1 ? "1 aplicativo encontrado" : `${filteredProducts.length} aplicativos encontrados`}</strong></div>

        {filteredProducts.length ? (
          <div className="storefront-products-grid">{filteredProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
        ) : (
          <div className={styles.empty}><ProductIcon slug="pandora" size={30} /><h3>Nenhum aplicativo encontrado</h3><p>Tente pesquisar por oficina, pet shop, orçamento, imóveis, eventos ou biblioteca.</p><button type="button" onClick={() => { setQuery(""); setSegment("all"); }}>Mostrar todos</button></div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failedSlides, setFailedSlides] = useState<Set<number>>(new Set());
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const info = getStorefrontInfo(product.slug);
  const presentation = getProductPresentation(product.slug);
  const media = getProductMedia(product.slug);
  const candidates = media.galleryCandidates[galleryIndex];
  const currentImage = candidates[candidateIndex];
  const availableSlides = [0, 1, 2].filter((index) => !failedSlides.has(index));
  const mediaStyle = { "--product-color": product.color, "--product-soft": product.colorSoft } as CSSProperties;

  async function startVideo() {
    if (videoUnavailable) return;
    try { await videoRef.current?.play(); setVideoActive(true); } catch { setVideoActive(false); }
  }

  function stopVideo(reset = false) {
    videoRef.current?.pause();
    if (reset && videoRef.current) videoRef.current.currentTime = 0;
    setVideoActive(false);
  }

  function selectSlide(index: number) {
    if (failedSlides.has(index)) return;
    stopVideo(true);
    setGalleryIndex(index);
    setCandidateIndex(0);
    setImageUnavailable(false);
  }

  function moveGallery(direction: -1 | 1) {
    const choices = availableSlides.length ? availableSlides : [0];
    const position = Math.max(0, choices.indexOf(galleryIndex));
    selectSlide(choices[(position + direction + choices.length) % choices.length]);
  }

  function tryNextImage() {
    const next = candidateIndex + 1;
    if (next < candidates.length) {
      setCandidateIndex(next);
      return;
    }
    setImageUnavailable(true);
    setFailedSlides((current) => new Set(current).add(galleryIndex));
  }

  return (
    <article className={`${styles.card} storefront-card`} style={mediaStyle}>
      <div className={`${styles.media} crm-media`}>
        {!imageUnavailable && currentImage ? <img className="crm-cover-image" src={currentImage} alt={galleryIndex === 0 ? `Capa do ${product.name}` : `Tela ${galleryIndex} do ${product.name}`} loading="lazy" onError={tryNextImage} /> : <div className="crm-cover-fallback"><ProductIcon slug={product.slug} size={62} /><strong>{galleryIndex === 0 ? product.shortName : presentation.screens[Math.max(0, galleryIndex - 1)].title}</strong><small>{presentation.label}</small></div>}
        <video ref={videoRef} className={videoActive ? styles.videoActive : undefined} src={media.video} poster={!imageUnavailable ? currentImage : undefined} muted loop playsInline preload="none" onError={() => { setVideoUnavailable(true); setVideoActive(false); }} aria-label={`Prévia em vídeo do ${product.name}`} />

        {availableSlides.length > 1 ? <>
          <button className={`${styles.mediaArrow} ${styles.mediaArrowLeft}`} type="button" onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); moveGallery(-1); }} aria-label="Imagem anterior"><ArrowIcon direction="left" /></button>
          <button className={`${styles.mediaArrow} ${styles.mediaArrowRight}`} type="button" onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); moveGallery(1); }} aria-label="Próxima imagem"><ArrowIcon direction="right" /></button>
        </> : null}

        {!videoUnavailable ? <button className="storefront-play-control" type="button" onClick={() => videoActive ? stopVideo() : void startVideo()} aria-label={videoActive ? "Pausar prévia" : "Ver prévia em vídeo"}>{videoActive ? <PauseIcon /> : <PlayIcon />}<span>{videoActive ? "Pausar" : "Ver prévia"}</span></button> : null}

        {availableSlides.length > 1 ? <div className="storefront-media-dots" aria-label={`Imagem ${galleryIndex + 1} de ${availableSlides.length}`}>{availableSlides.map((index) => <button type="button" className={index === galleryIndex ? "active" : undefined} key={`${product.slug}-${index}`} onClick={() => selectSlide(index)} aria-label={`Mostrar imagem ${index + 1}`} aria-pressed={index === galleryIndex} />)}</div> : null}
      </div>

      <div className={`${styles.cardBody} storefront-card-body`}>
        <div className={styles.cardIdentity}><span><ProductIcon slug={product.slug} size={21} /></span><div><small className="storefront-card-label">{presentation.label}</small><h3>{product.shortName}</h3></div></div>
        <p>{presentation.benefit}</p>
        <ul className="storefront-card-features">{product.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>
        <div className="storefront-card-price"><span>A partir de</span><strong>{formatMonthlyPrice(info.monthlyPrice)}</strong></div>
        <div className="storefront-card-footer"><Link className="storefront-demo-link" href={`/sistemas/${product.slug}`}>Ver demonstração</Link><Link className="storefront-primary-link" href={`/aplicativos/${product.slug}`}>Conhecer {product.shortName}<ArrowIcon direction="right" /></Link></div>
      </div>
    </article>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" style={direction === "left" ? { transform: "rotate(180deg)" } : undefined}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function PlayIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5Z" /></svg>; }
function PauseIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7v10M15 7v10" /></svg>; }

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
