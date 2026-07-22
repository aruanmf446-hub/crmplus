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
    slug: "atlas", name: "CRM Plus Atlas", shortName: "Atlas", category: "Oficinas", tagline: "A oficina em tempo real, sem pontos cegos.",
    description: "Central operacional para acompanhar veículos, aprovações, diagnósticos, evidências e entregas em um fluxo visual.", seoDescription: "Demonstração local do sistema Atlas para organização de oficinas.",
    color: "#f36a16", colorSoft: "#fff0e6", features: ["Pátio operacional", "OS com diagnóstico", "Fotos e observações", "Aprovação e entrega"],
    audience: "Oficinas e centros automotivos que precisam enxergar gargalos e próximos passos durante o dia.", outcome: "Cada veículo mostra etapa, responsável, tempo parado, evidências e próxima ação.", workflow: ["Agendar", "Receber", "Diagnosticar", "Aprovar", "Executar", "Entregar"],
  },
  {
    slug: "artemis", name: "CRM Plus Artemis", shortName: "Artemis", category: "Restaurantes", tagline: "Salão e cozinha no mesmo ritmo.",
    description: "Comandas, mesas, cardápio e fila de preparo em uma experiência operacional rápida, sem caixa e sem estoque.", seoDescription: "Demonstração local do sistema Artemis para restaurantes.",
    color: "#e95f46", colorSoft: "#fff0eb", features: ["Mapa do salão", "Comandas digitais", "Fila da cozinha", "Tempo de preparo"],
    audience: "Restaurantes, lanchonetes e cafés que precisam coordenar atendimento e preparo.", outcome: "A equipe sabe qual pedido entrou, qual está atrasado e o que já pode ser servido.", workflow: ["Abrir comanda", "Enviar à cozinha", "Preparar", "Marcar pronto", "Servir"],
  },
  {
    slug: "poseidon", name: "CRM Plus Poseidon", shortName: "Poseidon", category: "Vendas", tagline: "Toda negociação com próximo passo.",
    description: "Funil comercial, agenda de retornos e histórico de contatos para pequenas equipes de vendas.", seoDescription: "Demonstração local do CRM Poseidon para vendas.",
    color: "#1677b8", colorSoft: "#e9f5fb", features: ["Pipeline visual", "Próximas ações", "Histórico de contato", "Decisões registradas"],
    audience: "Vendedores e pequenas empresas que precisam manter uma rotina comercial consistente.", outcome: "Nenhuma oportunidade fica sem responsável, motivo de contato ou próxima ação.", workflow: ["Cadastrar lead", "Qualificar", "Propor", "Acompanhar", "Registrar decisão"],
  },
  {
    slug: "hercules", name: "CRM Plus Hercules", shortName: "Hercules", category: "Inspeções", tagline: "Inspeção com evidência e correção.",
    description: "Checklists executáveis, fotos, não conformidades, responsáveis e histórico local de inspeções.", seoDescription: "Demonstração local do sistema Hercules para checklists e inspeções.",
    color: "#d5a90b", colorSoft: "#fff7d8", features: ["Checklists executáveis", "Evidências visuais", "Não conformidades", "Tratamento de desvios"],
    audience: "Equipes que realizam inspeções, auditorias, abertura, fechamento e conferências.", outcome: "Cada execução deixa prova do que foi conferido, do que falhou e de quem deve corrigir.", workflow: ["Programar", "Executar", "Registrar evidência", "Abrir desvio", "Validar correção"],
  },
  {
    slug: "pandora", name: "CRM Plus Pandora", shortName: "Pandora", category: "NPS e pesquisas", tagline: "Feedback que vira prioridade.",
    description: "Pesquisas, links, respostas, indicadores e temas para transformar a voz do cliente em ação.", seoDescription: "Demonstração local do sistema Pandora para NPS e pesquisas.",
    color: "#7650b6", colorSoft: "#f1eafb", features: ["Pesquisas personalizadas", "Links e QR Code", "NPS e satisfação", "Temas e ações"],
    audience: "Empresas que querem acompanhar a experiência do cliente sem depender de planilhas.", outcome: "Notas e comentários mostram os temas que elevam ou prejudicam a experiência.", workflow: ["Criar pesquisa", "Compartilhar", "Coletar", "Interpretar", "Agir"],
  },
  {
    slug: "zeus", name: "CRM Plus Zeus", shortName: "Zeus", category: "Gestão de frotas", tagline: "Cada veículo com responsável e próxima manutenção.",
    description: "Gestão local e direta de veículos, motoristas, manutenções, documentos e abastecimentos, sem rastreamento ou integrações externas.", seoDescription: "Demonstração local do CRM Plus Zeus para gestão de frotas.",
    color: "#16866d", colorSoft: "#e8f7f2", features: ["Cadastro da frota", "Manutenção preventiva", "Motoristas e documentos", "Abastecimentos locais"],
    audience: "Pequenas empresas que precisam organizar veículos e evitar manutenção ou documento vencido.", outcome: "O gestor identifica rapidamente qual veículo está disponível, em uso ou precisa de atenção.", workflow: ["Cadastrar veículo", "Atribuir motorista", "Atualizar quilometragem", "Registrar manutenção", "Controlar documentos"],
  },
  {
    slug: "ares", name: "CRM Plus Ares", shortName: "Ares", category: "Orçamentos", tagline: "Propostas que facilitam a decisão.",
    description: "Orçamentos profissionais com escopo, versões, validade e registro de aprovação ou reprovação.", seoDescription: "Demonstração local do sistema Ares para orçamentos.",
    color: "#355fc4", colorSoft: "#eaf0ff", features: ["Documento profissional", "Versões e validade", "Visualização do cliente", "Aprovação ou reprovação"],
    audience: "Prestadores de serviço e pequenos negócios que enviam propostas com frequência.", outcome: "O cliente entende o escopo e a empresa acompanha visualização, validade e decisão.", workflow: ["Montar", "Revisar", "Compartilhar", "Acompanhar", "Registrar decisão"],
  },
  {
    slug: "alexandria", name: "CRM Plus Alexandria", shortName: "Alexandria", category: "Bibliotecas", tagline: "Acervo organizado e circulação sem confusão.",
    description: "Catálogo bibliográfico separado dos exemplares físicos, com empréstimos, reservas, leitores e localização.", seoDescription: "Demonstração local do CRM Plus Alexandria para bibliotecas.",
    color: "#9a5b32", colorSoft: "#f9eee6", features: ["Catálogo e exemplares", "Empréstimos e reservas", "Leitores e restrições", "Inventário do acervo"],
    audience: "Bibliotecas escolares, comunitárias e institucionais que precisam organizar o acervo e a circulação.", outcome: "Cada obra, exemplar e empréstimo possui situação clara, localização e histórico preservado.", workflow: ["Catalogar obra", "Cadastrar exemplares", "Emprestar", "Renovar ou reservar", "Devolver"],
  },
  {
    slug: "olympus", name: "CRM Plus Olympus", shortName: "Olympus", category: "Imobiliárias", tagline: "Da captação à entrega das chaves.",
    description: "Imóveis, proprietários, interessados, visitas, propostas e documentos em um fluxo imobiliário direto.", seoDescription: "Demonstração local do CRM Plus Olympus para imobiliárias.",
    color: "#2f6f8f", colorSoft: "#e8f3f7", features: ["Carteira de imóveis", "Agenda de visitas", "Propostas preservadas", "Documentos e chaves"],
    audience: "Imobiliárias e corretores que precisam acompanhar captação, atendimento e negociação.", outcome: "O corretor sabe qual imóvel está disponível, qual visita ocorreu e qual é a próxima decisão.", workflow: ["Captar imóvel", "Liberar carteira", "Atender interessado", "Realizar visita", "Negociar", "Encerrar"],
  },
  {
    slug: "argus", name: "CRM Plus Argus", shortName: "Argus", category: "Patrimônio", tagline: "Cada bem com localização e responsável.",
    description: "Gestão do ciclo de vida dos bens com transferências, empréstimos, manutenção, garantias e baixa.", seoDescription: "Demonstração local do CRM Plus Argus para gestão patrimonial.",
    color: "#596579", colorSoft: "#edf0f4", features: ["Cadastro patrimonial", "Termos e transferências", "Manutenções", "Inventário físico"],
    audience: "Empresas e instituições que precisam saber onde está cada bem e quem responde por ele.", outcome: "Movimentações só alteram localização após confirmação e todo o histórico permanece consultável.", workflow: ["Cadastrar bem", "Atribuir responsável", "Transferir", "Manter", "Conferir", "Baixar"],
  },
  {
    slug: "hermes", name: "CRM Plus Hermes", shortName: "Hermes", category: "Eventos", tagline: "Planejamento, credenciamento e presença.",
    description: "Eventos, programação, participantes, equipe, check-in e ocorrências sem venda de ingressos.", seoDescription: "Demonstração local do CRM Plus Hermes para eventos.",
    color: "#d06a2e", colorSoft: "#fff0e6", features: ["Programação por espaço", "Inscrições e capacidade", "Check-in e credenciais", "Ocorrências e certificados"],
    audience: "Organizadores de treinamentos, feiras, congressos e eventos corporativos.", outcome: "A organização acompanha capacidade, programação, confirmação e presença sem depender de listas soltas.", workflow: ["Planejar evento", "Abrir inscrições", "Confirmar participantes", "Credenciar", "Executar", "Encerrar"],
  },
  {
    slug: "athena", name: "CRM Plus Athena", shortName: "Athena", category: "Licitações", tagline: "Edital, prazos e decisão sob controle.",
    description: "Controle interno de oportunidades, exigências, propostas, sessão, habilitação e recursos.", seoDescription: "Demonstração local do CRM Plus Athena para controle de licitações.",
    color: "#6750a4", colorSoft: "#f0ebfb", features: ["Triagem de oportunidades", "Leitura estruturada do edital", "Documentos válidos", "Sessão e resultado"],
    audience: "Empresas que acompanham e participam de licitações sem substituir os portais oficiais.", outcome: "Cada prazo, documento e decisão da participação fica registrado com responsável e histórico.", workflow: ["Cadastrar oportunidade", "Analisar edital", "Preparar proposta", "Acompanhar sessão", "Habilitar", "Registrar resultado"],
  },
  {
    slug: "gaia", name: "CRM Plus Gaia", shortName: "Gaia", category: "Produção rural", tagline: "Safras e campo em uma linha do tempo clara.",
    description: "Propriedades, áreas, culturas, atividades, observações técnicas e colheitas sem estoque de insumos.", seoDescription: "Demonstração local do CRM Plus Gaia para produção rural.",
    color: "#4f7c35", colorSoft: "#edf6e8", features: ["Safras e talhões", "Atividades de campo", "Observações técnicas", "Produção por área"],
    audience: "Produtores e equipes técnicas que precisam registrar o planejado e o executado por área.", outcome: "Cada safra mostra cultura, área, atividade, ocorrência e resultado de campo.", workflow: ["Criar safra", "Planejar", "Plantar", "Registrar manejos", "Observar", "Colher"],
  },
  {
    slug: "pegasus", name: "CRM Plus Pegasus", shortName: "Pegasus", category: "Pet shops", tagline: "Cada pet com rotina, cuidado e histórico.",
    description: "Tutores, pets, agenda, banho e tosa, hospedagem, vacinas e comunicação manual.", seoDescription: "Demonstração local do CRM Plus Pegasus para pet shops.",
    color: "#c4577b", colorSoft: "#fbeaf0", features: ["Perfis dos pets", "Agenda de serviços", "Hotel e creche", "Vacinas e restrições"],
    audience: "Pet shops, banho e tosa, hotéis e creches que precisam preservar preferências e cuidados.", outcome: "A equipe identifica rapidamente o serviço, alertas, comportamento e responsável pela retirada.", workflow: ["Cadastrar pet", "Agendar", "Receber", "Atender ou hospedar", "Atualizar tutor", "Entregar"],
  },
  {
    slug: "titans", name: "CRM Plus Titans", shortName: "Titans", category: "Construtoras", tagline: "Obra, decisão e evidência no mesmo lugar.",
    description: "Execução física, cronograma, diário, RDO, projetos, pendências e entrega sem financeiro ou estoque.", seoDescription: "Demonstração local do CRM Plus Titans para construtoras.",
    color: "#b67a24", colorSoft: "#fbf1df", features: ["Etapas e avanço físico", "Diário e RDO", "Projetos e revisões", "Pendências e decisões"],
    audience: "Construtoras e equipes de obra que precisam conectar escritório, campo e histórico técnico.", outcome: "A equipe identifica a versão vigente, o avanço físico, a pendência e a decisão responsável.", workflow: ["Cadastrar obra", "Planejar etapas", "Registrar diário", "Controlar documentos", "Resolver pendências", "Entregar"],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
