import type { Product } from "@/lib/apps";

export type BillingPeriod = "monthly" | "semiannual" | "annual";

export type StorefrontInfo = {
  monthlyPrice: number;
  segment: string;
  aliases: string[];
};

export const segmentFilters = [
  { id: "all", label: "Todos" },
  { id: "automotivo", label: "Automotivo" },
  { id: "alimentacao", label: "Alimentação" },
  { id: "vendas-servicos", label: "Vendas e serviços" },
  { id: "educacao", label: "Educação" },
  { id: "imoveis-patrimonio", label: "Imóveis e patrimônio" },
  { id: "eventos-publico", label: "Eventos e licitações" },
  { id: "campo", label: "Campo" },
  { id: "pet-shop", label: "Pet shop" },
] as const;

const storefront: Record<string, StorefrontInfo> = {
  atlas: { monthlyPrice: 79, segment: "automotivo", aliases: ["oficina", "ordem de serviço", "veículos", "centro automotivo"] },
  zeus: { monthlyPrice: 79, segment: "automotivo", aliases: ["frota", "motoristas", "manutenção de veículos"] },
  artemis: { monthlyPrice: 69, segment: "alimentacao", aliases: ["restaurante", "comanda", "cozinha", "cardápio"] },
  poseidon: { monthlyPrice: 59, segment: "vendas-servicos", aliases: ["crm", "funil", "leads", "vendas"] },
  ares: { monthlyPrice: 59, segment: "vendas-servicos", aliases: ["orçamento", "proposta", "pdf", "aprovação"] },
  pandora: { monthlyPrice: 49, segment: "vendas-servicos", aliases: ["nps", "pesquisa", "satisfação", "feedback"] },
  hercules: { monthlyPrice: 49, segment: "vendas-servicos", aliases: ["checklist", "inspeção", "auditoria", "evidências"] },
  alexandria: { monthlyPrice: 49, segment: "educacao", aliases: ["biblioteca", "livros", "empréstimos", "acervo"] },
  olympus: { monthlyPrice: 69, segment: "imoveis-patrimonio", aliases: ["imobiliária", "imóveis", "corretor", "visitas"] },
  argus: { monthlyPrice: 69, segment: "imoveis-patrimonio", aliases: ["patrimônio", "bens", "inventário", "transferência"] },
  titans: { monthlyPrice: 89, segment: "imoveis-patrimonio", aliases: ["construtora", "obras", "rdo", "cronograma"] },
  hermes: { monthlyPrice: 59, segment: "eventos-publico", aliases: ["eventos", "credenciamento", "check-in", "participantes"] },
  athena: { monthlyPrice: 79, segment: "eventos-publico", aliases: ["licitação", "editais", "prazos", "propostas"] },
  gaia: { monthlyPrice: 69, segment: "campo", aliases: ["produção rural", "fazenda", "safra", "talhão"] },
  pegasus: { monthlyPrice: 59, segment: "pet-shop", aliases: ["pet shop", "banho e tosa", "pets", "hotel para animais"] },
};

const uploadedCovers = new Set([
  "atlas", "zeus", "artemis", "poseidon", "ares", "pandora", "hercules",
  "alexandria", "olympus", "argus", "titans", "hermes", "athena", "gaia", "pegasus",
]);

const safeCovers = new Set(["atlas", "artemis", "poseidon", "ares", "pandora"]);

const fallback: StorefrontInfo = { monthlyPrice: 49, segment: "vendas-servicos", aliases: [] };

export function getStorefrontInfo(slug: string): StorefrontInfo {
  return storefront[slug] ?? fallback;
}

export function getSearchText(product: Product): string {
  const info = getStorefrontInfo(product.slug);
  return [
    product.name,
    product.shortName,
    product.category,
    product.tagline,
    product.description,
    ...product.features,
    ...info.aliases,
  ].join(" ");
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatMonthlyPrice(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}/mês`;
}

export function getBillingPrice(monthlyPrice: number, period: BillingPeriod) {
  if (period === "semiannual") return { months: 6, discount: 8, total: monthlyPrice * 6 * 0.92 };
  if (period === "annual") return { months: 12, discount: 16, total: monthlyPrice * 12 * 0.84 };
  return { months: 1, discount: 0, total: monthlyPrice };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getPublicBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function getProductMedia(slug: string) {
  const hasCover = uploadedCovers.has(slug);
  const repositoryBase = `https://raw.githubusercontent.com/aruanmf446-hub/crmplus/main/public/media/apps/${slug}`;
  const coverFile = safeCovers.has(slug) ? "cover-safe.svg" : "cover.svg";
  const cover = hasCover ? `${repositoryBase}/${coverFile}?v=20260722-8` : "";

  return {
    cover,
    hasCover,
    gallery: [cover, cover, cover],
    video: `${repositoryBase}/preview.mp4?v=20260722-8`,
  };
}
