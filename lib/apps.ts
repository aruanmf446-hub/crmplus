export type Product = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  tagline: string;
  description: string;
  seoDescription: string;
  color: string;
  colorSoft: string;
  features: string[];
  audience: string;
  outcome: string;
  workflow: string[];
};

export const products: Product[] = [
  {
    slug: "atlas",
    name: "CRM Plus Atlas",
    shortName: "Atlas",
    category: "Oficinas",
    tagline: "A oficina em tempo real, sem pontos cegos.",
    description: "Central operacional para acompanhar veículos, aprovações, diagnósticos, evidências e entregas em um fluxo visual.",
    seoDescription: "Demonstração local do sistema Atlas para organização de oficinas.",
    color: "#f36a16",
    colorSoft: "#fff0e6",
    features: ["Pátio operacional", "OS com diagnóstico", "Fotos e observações", "Aprovação e entrega"],
    audience: "Oficinas e centros automotivos que precisam enxergar gargalos e próximos passos durante o dia.",
    outcome: "Cada veículo mostra etapa, responsável, tempo parado, evidências e próxima ação.",
    workflow: ["Agendar", "Receber", "Diagnosticar", "Aprovar", "Executar", "Entregar"],
  },
  {
    slug: "artemis",
    name: "CRM Plus Artemis",
    shortName: "Artemis",
    category: "Restaurantes",
    tagline: "Salão e cozinha no mesmo ritmo.",
    description: "Comandas, mesas, cardápio e fila de preparo em uma experiência operacional rápida, sem caixa e sem estoque.",
    seoDescription: "Demonstração local do sistema Artemis para restaurantes.",
    color: "#e95f46",
    colorSoft: "#fff0eb",
    features: ["Mapa do salão", "Comandas digitais", "Fila da cozinha", "Tempo de preparo"],
    audience: "Restaurantes, lanchonetes e cafés que precisam coordenar atendimento e preparo.",
    outcome: "A equipe sabe qual pedido entrou, qual está atrasado e o que já pode ser servido.",
    workflow: ["Abrir comanda", "Enviar à cozinha", "Preparar", "Marcar pronto", "Servir"],
  },
  {
    slug: "poseidon",
    name: "CRM Plus Poseidon",
    shortName: "Poseidon",
    category: "Vendas",
    tagline: "Toda negociação com próximo passo.",
    description: "Funil comercial, agenda de retornos e histórico de contatos para pequenas equipes de vendas.",
    seoDescription: "Demonstração local do CRM Poseidon para vendas.",
    color: "#1677b8",
    colorSoft: "#e9f5fb",
    features: ["Pipeline visual", "Próximas ações", "Histórico de contato", "Decisões registradas"],
    audience: "Vendedores e pequenas empresas que precisam manter uma rotina comercial consistente.",
    outcome: "Nenhuma oportunidade fica sem responsável, motivo de contato ou próxima ação.",
    workflow: ["Cadastrar lead", "Qualificar", "Propor", "Acompanhar", "Registrar decisão"],
  },
  {
    slug: "hercules",
    name: "CRM Plus Hercules",
    shortName: "Hercules",
    category: "Inspeções",
    tagline: "Inspeção com evidência e correção.",
    description: "Checklists executáveis, fotos, não conformidades, responsáveis e histórico local de inspeções.",
    seoDescription: "Demonstração local do sistema Hercules para checklists e inspeções.",
    color: "#d5a90b",
    colorSoft: "#fff7d8",
    features: ["Checklists executáveis", "Evidências visuais", "Não conformidades", "Tratamento de desvios"],
    audience: "Equipes que realizam inspeções, auditorias, abertura, fechamento e conferências.",
    outcome: "Cada execução deixa prova do que foi conferido, do que falhou e de quem deve corrigir.",
    workflow: ["Programar", "Executar", "Registrar evidência", "Abrir desvio", "Validar correção"],
  },
  {
    slug: "pandora",
    name: "CRM Plus Pandora",
    shortName: "Pandora",
    category: "NPS e pesquisas",
    tagline: "Feedback que vira prioridade.",
    description: "Pesquisas, links, respostas, indicadores e temas para transformar a voz do cliente em ação.",
    seoDescription: "Demonstração local do sistema Pandora para NPS e pesquisas.",
    color: "#7650b6",
    colorSoft: "#f1eafb",
    features: ["Pesquisas personalizadas", "Links e QR Code", "NPS e satisfação", "Temas e ações"],
    audience: "Empresas que querem acompanhar a experiência do cliente sem depender de planilhas.",
    outcome: "Notas e comentários mostram os temas que elevam ou prejudicam a experiência.",
    workflow: ["Criar pesquisa", "Compartilhar", "Coletar", "Interpretar", "Agir"],
  },
  {
    slug: "zeus",
    name: "CRM Plus Zeus",
    shortName: "Zeus",
    category: "Gestão de frotas",
    tagline: "Cada veículo com responsável e próxima manutenção.",
    description: "Gestão local e direta de veículos, motoristas, manutenções, documentos e abastecimentos, sem rastreamento ou integrações externas.",
    seoDescription: "Demonstração local do CRM Plus Zeus para gestão de frotas.",
    color: "#16866d",
    colorSoft: "#e8f7f2",
    features: ["Cadastro da frota", "Manutenção preventiva", "Motoristas e documentos", "Abastecimentos locais"],
    audience: "Pequenas empresas que precisam organizar veículos e evitar manutenção ou documento vencido.",
    outcome: "O gestor identifica rapidamente qual veículo está disponível, em uso ou precisa de atenção.",
    workflow: ["Cadastrar veículo", "Atribuir motorista", "Atualizar quilometragem", "Registrar manutenção", "Controlar documentos"],
  },
  {
    slug: "ares",
    name: "CRM Plus Ares",
    shortName: "Ares",
    category: "Orçamentos",
    tagline: "Propostas que facilitam a decisão.",
    description: "Orçamentos profissionais com escopo, versões, validade e registro de aprovação ou reprovação.",
    seoDescription: "Demonstração local do sistema Ares para orçamentos.",
    color: "#355fc4",
    colorSoft: "#eaf0ff",
    features: ["Documento profissional", "Versões e validade", "Visualização do cliente", "Aprovação ou reprovação"],
    audience: "Prestadores de serviço e pequenos negócios que enviam propostas com frequência.",
    outcome: "O cliente entende o escopo e a empresa acompanha visualização, validade e decisão.",
    workflow: ["Montar", "Revisar", "Compartilhar", "Acompanhar", "Registrar decisão"],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
