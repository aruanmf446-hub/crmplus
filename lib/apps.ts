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
    tagline: "A oficina organizada do agendamento à entrega.",
    description:
      "Agenda, atendimento e ordens de serviço reunidos para acompanhar cada veículo da chegada à entrega.",
    seoDescription:
      "Sistema para oficinas com agenda, atendimento e ordens de serviço. Acompanhe cada veículo da chegada à entrega.",
    color: "#a85c24",
    colorSoft: "#f8eee7",
    features: ["Agenda da oficina", "Cadastro de clientes e veículos", "Ordens de serviço", "Status até a entrega"],
    audience: "Oficinas e centros automotivos que acompanham atendimentos, veículos e serviços ao longo do dia.",
    outcome: "Agenda, andamento dos serviços e entregas visíveis para toda a equipe.",
    workflow: ["Agendar", "Receber o veículo", "Abrir a OS", "Acompanhar", "Entregar"],
  },
  {
    slug: "artemis",
    name: "CRM Plus Artemis",
    shortName: "Artemis",
    category: "Restaurantes",
    tagline: "Pedidos em movimento, operação sob controle.",
    description:
      "Cardápio digital, acompanhamento de pedidos e caixa para uma rotina mais rápida no salão, balcão ou retirada.",
    seoDescription:
      "Sistema para restaurantes com cardápio digital, acompanhamento de pedidos e caixa para salão, balcão e retirada.",
    color: "#a23e52",
    colorSoft: "#faecef",
    features: ["Cardápio digital", "Entrada de pedidos", "Acompanhamento da cozinha", "Movimento do caixa"],
    audience: "Restaurantes, lanchonetes e cafés que atendem no salão, balcão ou retirada.",
    outcome: "Cada pedido segue visível do atendimento ao preparo, entrega e fechamento.",
    workflow: ["Receber pedido", "Confirmar", "Preparar", "Entregar", "Fechar conta"],
  },
  {
    slug: "poseidon",
    name: "CRM Plus Poseidon",
    shortName: "Poseidon",
    category: "Vendas",
    tagline: "Cada negociação com um próximo passo claro.",
    description:
      "Carteira de clientes, funil de vendas e acompanhamento de resultados para equipes comerciais pequenas.",
    seoDescription:
      "CRM de vendas com carteira de clientes, negociações, retornos, funil e acompanhamento de resultados comerciais.",
    color: "#596778",
    colorSoft: "#edf0f3",
    features: ["Carteira de clientes", "Funil de vendas", "Histórico de negociações", "Resultados comerciais"],
    audience: "Pequenas empresas e vendedores que precisam saber quem contatar e o que fazer em seguida.",
    outcome: "Negociações visíveis, retornos no tempo certo e uma rotina comercial mais constante.",
    workflow: ["Cadastrar lead", "Qualificar", "Negociar", "Fazer retorno", "Fechar"],
  },
  {
    slug: "hercules",
    name: "CRM Plus Hercules",
    shortName: "Hercules",
    category: "Rotinas",
    tagline: "Rotinas bem feitas, todos os dias.",
    description:
      "Checklists, evidências visuais e auditorias reunidos para acompanhar rotinas e tratar pendências.",
    seoDescription:
      "Sistema de checklist e auditoria visual para acompanhar rotinas, evidências e pendências em pequenas empresas.",
    color: "#347153",
    colorSoft: "#e9f3ed",
    features: ["Checklists recorrentes", "Registro com fotos", "Pendências e responsáveis", "Auditorias visuais"],
    audience: "Equipes operacionais que executam inspeções, abertura, fechamento, limpeza ou conferências.",
    outcome: "Padrões mais consistentes e uma visão objetiva das rotinas concluídas e pendentes.",
    workflow: ["Criar rotina", "Atribuir", "Executar", "Registrar evidência", "Revisar"],
  },
  {
    slug: "pandora",
    name: "CRM Plus Pandora",
    shortName: "Pandora",
    category: "Pesquisas",
    tagline: "Ouça o cliente e acompanhe cada resposta.",
    description:
      "Crie pesquisas de satisfação, compartilhe com os clientes e acompanhe respostas e resultados.",
    seoDescription:
      "Sistema de pesquisa de satisfação para criar formulários, coletar respostas e acompanhar a experiência dos clientes.",
    color: "#76539c",
    colorSoft: "#f1ecf7",
    features: ["Pesquisas rápidas", "Links para resposta", "Indicadores de satisfação", "Histórico de resultados"],
    audience: "Empresas que acompanham a experiência do cliente após atendimentos, compras ou entregas.",
    outcome: "Feedback organizado e sinais claros sobre o que manter ou melhorar no atendimento.",
    workflow: ["Criar pesquisa", "Compartilhar", "Receber respostas", "Acompanhar", "Melhorar"],
  },
  {
    slug: "ares",
    name: "CRM Plus Ares",
    shortName: "Ares",
    category: "Orçamentos",
    tagline: "Da cotação ao pedido, sem perder o ritmo.",
    description:
      "Orçamentos, cotações e pedidos em um fluxo direto para vender com mais rapidez e apresentação profissional.",
    seoDescription:
      "Sistema de orçamentos, cotações e pedidos para pequenas empresas. Crie propostas claras e acompanhe cada oportunidade.",
    color: "#b44732",
    colorSoft: "#f9ece9",
    features: ["Orçamentos profissionais", "Cotações", "Conversão em pedido", "Acompanhamento de status"],
    audience: "Prestadores de serviço e pequenos negócios que criam propostas com frequência.",
    outcome: "Menos retrabalho para montar propostas e mais controle sobre o que foi enviado, aprovado ou recusado.",
    workflow: ["Montar orçamento", "Enviar", "Revisar", "Aprovar", "Gerar pedido"],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
