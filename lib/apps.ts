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
      "Atendimento, agenda e ordens de serviço em um fluxo simples. Sem estoque, sem módulo fiscal e sem complexidade de ERP.",
    seoDescription:
      "Sistema simples para oficinas com atendimento, agendamento e ordens de serviço. Organize os veículos sem controle de estoque complexo.",
    color: "#a85c24",
    colorSoft: "#f8eee7",
    features: ["Agenda da oficina", "Cadastro de clientes e veículos", "Ordens de serviço", "Status até a entrega"],
    audience: "Oficinas e centros automotivos que precisam organizar o serviço sem adotar um ERP pesado.",
    outcome: "Menos informação espalhada e mais clareza sobre o que está agendado, em execução ou pronto.",
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
      "Sistema para restaurantes com cardápio digital, pedidos e caixa simples. Acompanhe a operação do salão, balcão e retirada.",
    color: "#a23e52",
    colorSoft: "#faecef",
    features: ["Cardápio digital", "Entrada de pedidos", "Acompanhamento da cozinha", "Caixa simples"],
    audience: "Restaurantes, lanchonetes, cafés e operações pequenas que querem abandonar comandas soltas.",
    outcome: "Pedidos claros do início ao fim e menos ruído entre atendimento, preparo e entrega.",
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
      "CRM de vendas simples com carteira de clientes, negociações, funil e acompanhamento de resultados para pequenas equipes.",
    color: "#176d83",
    colorSoft: "#e7f3f5",
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
      "Checklists, evidências visuais e auditorias para acompanhar processos recorrentes sem planilhas extensas.",
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
    tagline: "Escute o cliente sem complicar a pergunta.",
    description:
      "Pesquisas de satisfação fáceis de enviar, responder e acompanhar em uma visão clara dos resultados.",
    seoDescription:
      "Sistema simples de pesquisa de satisfação para criar formulários, coletar respostas e acompanhar a experiência dos clientes.",
    color: "#76539c",
    colorSoft: "#f1ecf7",
    features: ["Pesquisas rápidas", "Links para resposta", "Indicadores de satisfação", "Histórico de resultados"],
    audience: "Empresas que querem ouvir seus clientes com frequência, sem ferramentas de pesquisa complicadas.",
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
