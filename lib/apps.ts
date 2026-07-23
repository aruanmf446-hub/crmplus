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
    slug: "atlas", name: "CRM Plus Atlas", shortName: "Atlas", category: "Oficinas", tagline: "Do veículo recebido à entrega sem perder o próximo passo.",
    description: "Agenda, recepção, diagnóstico, orçamento, aprovação, execução, evidências e histórico do veículo em uma rotina direta.", seoDescription: "Sistema simples para organizar atendimentos, diagnósticos, orçamentos e entregas em pequenas oficinas.",
    color: "#f36a16", colorSoft: "#fff0e6", features: ["Recepção e estado de entrada", "Diagnóstico ligado ao orçamento", "Aprovação e execução", "Histórico do veículo"],
    audience: "Oficinas e centros automotivos pequenos que precisam organizar o pátio e transmitir segurança ao cliente.", outcome: "Cada veículo mostra o que foi encontrado, o que depende do cliente e o que falta para entregar.", workflow: ["Agendar", "Receber", "Avaliar", "Aprovar", "Executar", "Conferir", "Entregar"],
  },
  {
    slug: "artemis", name: "CRM Plus Artemis", shortName: "Artemis", category: "Restaurantes", tagline: "Pedido correto, cozinha organizada e mesa bem atendida.",
    description: "Cardápio, mesas, comandas, observações e fila da cozinha sem caixa, pagamento ou estoque.", seoDescription: "Sistema simples para organizar salão, comandas e cozinha em pequenos restaurantes.",
    color: "#e95f46", colorSoft: "#fff0eb", features: ["Mapa de mesas", "Comandas com observações", "Fila da cozinha", "Pedidos prontos para servir"],
    audience: "Restaurantes, lanchonetes e cafés pequenos que precisam reduzir erro e pedido perdido.", outcome: "Salão e cozinha enxergam a mesma informação e sabem exatamente qual ação vem a seguir.", workflow: ["Abrir atendimento", "Registrar pedido", "Preparar", "Marcar pronto", "Servir", "Encerrar"],
  },
  {
    slug: "poseidon", name: "CRM Plus Poseidon", shortName: "Poseidon", category: "Vendas", tagline: "Toda negociação precisa de uma próxima ação.",
    description: "Contatos, oportunidades, atividades, histórico e motivos de perda para pequenas rotinas comerciais.", seoDescription: "CRM simples para acompanhar contatos, oportunidades e próximos passos comerciais.",
    color: "#1677b8", colorSoft: "#e9f5fb", features: ["Oportunidades por etapa", "Próximas ações", "Histórico de contato", "Ganhos e motivos de perda"],
    audience: "Vendedores e pequenos negócios que perdem retornos por depender de memória, planilhas ou mensagens soltas.", outcome: "Nenhuma negociação fica sem responsável, contexto ou próxima ação definida.", workflow: ["Receber contato", "Qualificar", "Propor", "Negociar", "Concluir"],
  },
  {
    slug: "hercules", name: "CRM Plus Hercules", shortName: "Hercules", category: "Inspeções", tagline: "Inspecionar, corrigir e comprovar.",
    description: "Checklists sequenciais, fotos, não conformidades, responsáveis, prazos e verificação da correção.", seoDescription: "Sistema simples para executar inspeções, registrar evidências e acompanhar correções.",
    color: "#d5a90b", colorSoft: "#fff7d8", features: ["Modelos de checklist", "Execução com evidências", "Correções com responsável", "Verificação do encerramento"],
    audience: "Pequenas equipes que realizam abertura, fechamento, conferência, segurança ou inspeção de ativos.", outcome: "Cada falha gera uma correção rastreável e só termina depois de verificada.", workflow: ["Programar", "Executar", "Registrar falha", "Corrigir", "Verificar", "Encerrar"],
  },
  {
    slug: "pandora", name: "CRM Plus Pandora", shortName: "Pandora", category: "Experiência do cliente", tagline: "Ouvir o cliente e transformar resposta em ação.",
    description: "Pesquisas curtas, NPS, comentários, temas recorrentes e tratamento das respostas que exigem retorno.", seoDescription: "Sistema simples para criar pesquisas, acompanhar NPS e tratar feedbacks de clientes.",
    color: "#7650b6", colorSoft: "#f1eafb", features: ["Pesquisas rápidas", "NPS e satisfação", "Temas recorrentes", "Tratamento e retorno"],
    audience: "Pequenos negócios que querem melhorar o atendimento usando respostas reais dos clientes.", outcome: "Notas e comentários deixam de ser números soltos e passam a gerar responsáveis e ações.", workflow: ["Criar pesquisa", "Compartilhar", "Receber resposta", "Classificar", "Tratar", "Retornar"],
  },
  {
    slug: "zeus", name: "CRM Plus Zeus", shortName: "Zeus", category: "Gestão de frotas", tagline: "Veículos disponíveis, responsáveis definidos e manutenção no prazo.",
    description: "Veículos, motoristas, uso, quilometragem, manutenção, documentos e abastecimentos para frotas pequenas.", seoDescription: "Sistema simples para organizar veículos, motoristas, manutenções e documentos de pequenas frotas.",
    color: "#16866d", colorSoft: "#e8f7f2", features: ["Situação da frota", "Motorista responsável", "Manutenção preventiva", "Documentos e quilometragem"],
    audience: "Pequenas empresas com poucos veículos que precisam evitar documento vencido e manutenção esquecida.", outcome: "O dono sabe qual veículo está disponível, quem está usando e o que precisa de atenção.", workflow: ["Cadastrar", "Atribuir", "Usar", "Atualizar", "Manter", "Liberar"],
  },
  {
    slug: "ares", name: "CRM Plus Ares", shortName: "Ares", category: "Propostas e orçamentos", tagline: "Escopo claro para o cliente decidir com segurança.",
    description: "Propostas com itens, condições, validade, versões e registro da decisão do cliente.", seoDescription: "Sistema simples para criar, revisar e acompanhar propostas e orçamentos profissionais.",
    color: "#355fc4", colorSoft: "#eaf0ff", features: ["Escopo e condições", "Modelos reutilizáveis", "Versões preservadas", "Aprovação, recusa ou alteração"],
    audience: "Prestadores de serviço e pequenos negócios que enviam propostas com frequência.", outcome: "A empresa evita arquivos desencontrados e o cliente entende exatamente o que está sendo oferecido.", workflow: ["Montar", "Revisar", "Enviar", "Negociar", "Registrar decisão"],
  },
  {
    slug: "alexandria", name: "CRM Plus Alexandria", shortName: "Alexandria", category: "Bibliotecas", tagline: "Acervo encontrado, empréstimo controlado e devolução no prazo.",
    description: "Obras, exemplares, leitores, empréstimos, renovações e reservas para pequenas bibliotecas.", seoDescription: "Sistema simples para organizar acervo, exemplares, empréstimos e reservas.",
    color: "#9a5b32", colorSoft: "#f9eee6", features: ["Catálogo e exemplares", "Empréstimo e devolução", "Renovação e reserva", "Atrasos e localização"],
    audience: "Bibliotecas escolares, comunitárias, religiosas e institucionais de pequeno porte.", outcome: "A equipe encontra a obra, sabe qual exemplar está disponível e acompanha quem precisa devolver.", workflow: ["Catalogar", "Identificar exemplar", "Emprestar", "Renovar ou reservar", "Devolver"],
  },
  {
    slug: "olympus", name: "CRM Plus Olympus", shortName: "Olympus", category: "Imobiliárias", tagline: "O imóvel certo para a necessidade certa.",
    description: "Imóveis, proprietários, interessados, compatibilidade, visitas e propostas para pequenas imobiliárias.", seoDescription: "Sistema simples para organizar imóveis, interessados, visitas e propostas.",
    color: "#2f6f8f", colorSoft: "#e8f3f7", features: ["Carteira de imóveis", "Perfil do interessado", "Visitas e retorno", "Propostas e contrapropostas"],
    audience: "Corretores e pequenas imobiliárias que precisam unir imóvel, interessado e próxima ação.", outcome: "Cada atendimento mostra imóveis compatíveis, visitas realizadas e decisão pendente.", workflow: ["Captar", "Atender interessado", "Selecionar imóveis", "Visitar", "Propor", "Concluir"],
  },
  {
    slug: "argus", name: "CRM Plus Argus", shortName: "Argus", category: "Patrimônio", tagline: "Cada bem com localização, condição e responsável.",
    description: "Cadastro, identificação, entrega, transferência, devolução, manutenção e conferência de bens.", seoDescription: "Sistema simples para organizar bens, responsáveis, movimentações e manutenção patrimonial.",
    color: "#596579", colorSoft: "#edf0f4", features: ["Identificação do bem", "Responsável e localização", "Movimentações e termos", "Manutenção e conferência"],
    audience: "Pequenas empresas, escolas, igrejas e instituições que precisam localizar seus bens.", outcome: "O histórico mostra onde o bem está, quem responde por ele e em qual condição se encontra.", workflow: ["Cadastrar", "Identificar", "Entregar", "Transferir ou devolver", "Conferir", "Baixar"],
  },
  {
    slug: "hermes", name: "CRM Plus Hermes", shortName: "Hermes", category: "Eventos", tagline: "Tudo confirmado antes de o evento começar.",
    description: "Eventos, tarefas, fornecedores, convidados, confirmações e presença para organizadores pequenos.", seoDescription: "Sistema simples para planejar pequenos eventos, convidados, fornecedores e check-in.",
    color: "#d06a2e", colorSoft: "#fff0e6", features: ["Planejamento e tarefas", "Fornecedores e prazos", "Convidados e acompanhantes", "Confirmação e presença"],
    audience: "Organizadores, cerimonialistas e pequenos negócios que realizam poucos eventos por vez.", outcome: "O organizador enxerga o que falta, quem confirmou e qual fornecedor ainda precisa responder.", workflow: ["Planejar", "Contratar", "Convidar", "Confirmar", "Recepcionar", "Encerrar"],
  },
  {
    slug: "athena", name: "CRM Plus Athena", shortName: "Athena", category: "Licitações", tagline: "Decidir cedo, preparar certo e não perder prazo.",
    description: "Oportunidades, triagem, checklist, documentos, proposta, sessão e resultado para pequenos fornecedores.", seoDescription: "Sistema simples para analisar licitações, organizar documentos, propostas e prazos.",
    color: "#6750a4", colorSoft: "#f0ebfb", features: ["Triagem de oportunidade", "Checklist do edital", "Documentos e validade", "Prazos, sessão e resultado"],
    audience: "Pequenas empresas que participam de licitações e precisam organizar o processo interno.", outcome: "Cada oportunidade mostra se vale participar, o que falta e qual prazo não pode ser perdido.", workflow: ["Encontrar", "Triar", "Preparar", "Enviar", "Acompanhar", "Registrar resultado"],
  },
  {
    slug: "gaia", name: "CRM Plus Gaia", shortName: "Gaia", category: "Produção rural", tagline: "O que foi planejado, feito e produzido em cada ciclo.",
    description: "Cultivos e criações organizados por propriedade, área ou grupo, atividades, ocorrências e produção.", seoDescription: "Sistema simples para organizar ciclos de cultivo e criação em pequenas propriedades.",
    color: "#4f7c35", colorSoft: "#edf6e8", features: ["Cultivo ou criação", "Agenda de campo", "Ocorrências e fotos", "Produção e rastreabilidade"],
    audience: "Pequenos produtores, sítios, chácaras, hortas e criações familiares.", outcome: "O produtor registra o trabalho sem depender apenas de caderno, memória ou mensagens espalhadas.", workflow: ["Criar ciclo", "Planejar", "Executar", "Registrar ocorrência", "Produzir", "Concluir"],
  },
  {
    slug: "pegasus", name: "CRM Plus Pegasus", shortName: "Pegasus", category: "Pet shops", tagline: "O pet entra com segurança e sai com o cuidado registrado.",
    description: "Tutores, pets, agenda, banho e tosa, creche, hospedagem, preferências e entrega.", seoDescription: "Sistema simples para organizar agenda, pets, banho e tosa e hospedagem em pet shops.",
    color: "#c4577b", colorSoft: "#fbeaf0", features: ["Tutor e ficha do pet", "Agenda e quadro do dia", "Preferências e restrições", "Pronto para retirada"],
    audience: "Pet shops, banho e tosa, creches e hospedagens pequenas sem atendimento veterinário.", outcome: "A equipe respeita preferências, acompanha o atendimento e entrega o pet com segurança.", workflow: ["Agendar", "Confirmar", "Receber", "Atender", "Finalizar", "Entregar"],
  },
  {
    slug: "titans", name: "CRM Plus Titans", shortName: "Titans", category: "Pequenas obras", tagline: "Escopo, avanço e decisões visíveis para o cliente.",
    description: "Orçamento, etapas, diário, fotos, alterações, pendências, vistoria e entrega de pequenas obras.", seoDescription: "Sistema simples para acompanhar reformas, pequenas obras, etapas e alterações.",
    color: "#b67a24", colorSoft: "#fbf1df", features: ["Escopo e cronograma", "Diário e evidências", "Alterações aprovadas", "Vistoria e entrega"],
    audience: "Pequenos construtores, empreiteiros e empresas de reforma com poucas obras simultâneas.", outcome: "Dono e cliente sabem o que foi feito, o que está bloqueado e qual decisão está pendente.", workflow: ["Orçar", "Planejar", "Executar", "Registrar", "Aprovar alteração", "Vistoriar", "Entregar"],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
