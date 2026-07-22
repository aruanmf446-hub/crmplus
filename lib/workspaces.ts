export type WorkspaceRow = { title: string; meta: string; value: string; status: string };
export type WorkspaceView = { id: string; label: string; description: string; rows: WorkspaceRow[] };
export type Workspace = {
  slug: string;
  business: string;
  greeting: string;
  primaryAction: string;
  searchPlaceholder: string;
  metrics: { label: string; value: string; detail: string }[];
  focusTitle: string;
  focusDescription: string;
  focusColumns: { label: string; count: number; items: { title: string; meta: string }[] }[];
  activity: { title: string; time: string; status: string }[];
  views: WorkspaceView[];
};

export const workspaces: Workspace[] = [
  {
    slug: "atlas", business: "Oficina Avenida", greeting: "A oficina em tempo real.", primaryAction: "Nova OS", searchPlaceholder: "Buscar cliente, placa ou OS",
    metrics: [{ label: "Entradas", value: "05", detail: "2 aguardando chegada" }, { label: "Em serviço", value: "03", detail: "72% da capacidade" }, { label: "Para entregar", value: "02", detail: "1 cliente não confirmou" }],
    focusTitle: "Pátio da oficina", focusDescription: "Atendimentos organizados pela próxima ação.",
    focusColumns: [], activity: [],
    views: [
      { id: "ordens", label: "Pátio e OS", description: "Acompanhe cada veículo da avaliação à entrega.", rows: [
        { title: "OS #1052 · VW Nivus · QVE-4A21", meta: "Mariana Costa · revisão de 30.000 km · João", value: "R$ 1.280", status: "Aguardando avaliação" },
        { title: "OS #1051 · VW Saveiro · TCJ-9I23", meta: "Barros & Braga · suspensão traseira · Marcos", value: "R$ 1.480", status: "Orçamento enviado" },
        { title: "OS #1050 · VW T-Cross · OSM-2D11", meta: "Amanda Ribeiro · revisão preventiva · Carlos", value: "R$ 680", status: "Em serviço" },
        { title: "OS #1049 · Hyundai HB20 · QDB-7J10", meta: "João Pedro · alinhamento e freios · André", value: "R$ 920", status: "Finalizado" },
        { title: "OS #1048 · Fiat Strada · RXA-3E05", meta: "Moura Serviços · troca de óleo · João", value: "R$ 540", status: "Aprovado" },
      ] },
      { id: "agenda", label: "Agenda", description: "Organize horários, chegada e capacidade da oficina.", rows: [
        { title: "09:00 · Mariana Costa", meta: "VW Nivus · revisão de 30.000 km", value: "Box 01", status: "Confirmado" },
        { title: "10:30 · Carlos Souza", meta: "Chevrolet Onix · ruído dianteiro", value: "A confirmar", status: "Pendente" },
        { title: "13:30 · Renata Lima", meta: "Fiat Toro · troca de óleo", value: "Box 03", status: "Confirmado" },
      ] },
      { id: "clientes", label: "Clientes e veículos", description: "Consulte veículos, contatos e histórico de atendimento.", rows: [
        { title: "Mariana Costa", meta: "VW Nivus · QVE-4A21", value: "3 atendimentos", status: "Ativo" },
        { title: "Barros & Braga", meta: "VW Saveiro · TCJ-9I23", value: "8 atendimentos", status: "Ativo" },
        { title: "Amanda Ribeiro", meta: "VW T-Cross · OSM-2D11", value: "4 atendimentos", status: "Ativo" },
      ] },
      { id: "servicos", label: "Serviços", description: "Cadastre descrições e valores de referência, sem estoque.", rows: [
        { title: "Revisão preventiva", meta: "Tempo estimado · 2h30", value: "A partir de R$ 450", status: "Disponível" },
        { title: "Diagnóstico de suspensão", meta: "Tempo estimado · 1h30", value: "A partir de R$ 220", status: "Disponível" },
      ] },
    ],
  },
  {
    slug: "ares", business: "Mafra Soluções", greeting: "Propostas que facilitam a decisão.", primaryAction: "Novo orçamento", searchPlaceholder: "Buscar orçamento ou cliente",
    metrics: [{ label: "Em decisão", value: "07", detail: "3 vencem nesta semana" }, { label: "Visualizados", value: "06", detail: "2 sem resposta" }, { label: "Aprovação", value: "48%", detail: "+6 p.p. no mês" }], focusTitle: "Propostas", focusDescription: "Escopo, versão e decisão em um só lugar.", focusColumns: [], activity: [],
    views: [
      { id: "orcamentos", label: "Propostas", description: "Crie, revise e acompanhe orçamentos profissionais.", rows: [
        { title: "OR-132 · Studio Aurora", meta: "Identidade visual · versão 03 · validade de 10 dias", value: "R$ 4.900", status: "Visualizado" },
        { title: "OR-131 · Rota Engenharia", meta: "Portal interno · versão 01 · vence em 4 dias", value: "R$ 12.800", status: "Enviado" },
        { title: "OR-130 · Solar Norte", meta: "Landing page · ajustes solicitados hoje", value: "R$ 8.500", status: "Ajustes solicitados" },
        { title: "OR-129 · Grupo Vale", meta: "Automação de processos · decisão registrada", value: "R$ 9.600", status: "Aprovado" },
      ] },
      { id: "itens", label: "Itens de proposta", description: "Mantenha serviços e descrições prontos para reutilizar.", rows: [
        { title: "Diagnóstico e planejamento", meta: "Serviço · etapa inicial", value: "R$ 950", status: "Ativo" },
        { title: "Desenvolvimento de landing page", meta: "Serviço · prazo padrão de 10 dias", value: "R$ 2.800", status: "Ativo" },
        { title: "Identidade visual básica", meta: "Serviço · prazo padrão de 7 dias", value: "R$ 1.900", status: "Ativo" },
      ] },
      { id: "clientes", label: "Clientes", description: "Consulte contatos e histórico de propostas.", rows: [
        { title: "Rota Engenharia", meta: "Fábio Costa · Compras", value: "4 propostas", status: "Em negociação" },
        { title: "Grupo Vale", meta: "Márcia Lima · Diretora", value: "3 propostas", status: "Cliente" },
        { title: "Solar Norte", meta: "Ana Reis · Sócia", value: "2 propostas", status: "Em negociação" },
      ] },
    ],
  },
  {
    slug: "artemis", business: "Bistrô da Praça", greeting: "Salão e cozinha no mesmo ritmo.", primaryAction: "Nova comanda", searchPlaceholder: "Buscar comanda, mesa ou item",
    metrics: [{ label: "Comandas", value: "12", detail: "4 em preparo" }, { label: "Tempo médio", value: "18 min", detail: "Meta de 22 min" }, { label: "Mesas livres", value: "04", detail: "Prontas para receber" }], focusTitle: "Serviço", focusDescription: "Pedidos visíveis do salão ao passe.", focusColumns: [], activity: [],
    views: [
      { id: "pedidos", label: "Comandas", description: "Acompanhe pedidos do salão, balcão e retirada.", rows: [
        { title: "#412 · Mesa 08", meta: "2 burgers sem cebola · batata · soda sem gelo", value: "4 itens", status: "Recebido" },
        { title: "#411 · Mesa 03", meta: "Risoto de filé · 2 bebidas · prioridade", value: "3 itens", status: "Em preparo" },
        { title: "#410 · Retirada", meta: "2 burgers · fritas · embalagem separada", value: "3 itens", status: "Pronto" },
        { title: "#409 · Mesa 12", meta: "4 itens · sobremesa após pratos", value: "4 itens", status: "Em preparo" },
      ] },
      { id: "mesas", label: "Mesas", description: "Veja ocupação e tempo de atendimento.", rows: [
        { title: "Mesa 03", meta: "2 pessoas · aberta há 42 min", value: "3 itens", status: "Ocupada" },
        { title: "Mesa 08", meta: "4 pessoas · aberta há 18 min", value: "4 itens", status: "Ocupada" },
        { title: "Mesa 12", meta: "3 pessoas · aguardando pedido", value: "Sem comanda", status: "Atenção" },
        { title: "Mesa 05", meta: "Capacidade para 4 pessoas", value: "Livre", status: "Disponível" },
        { title: "Mesa 06", meta: "Capacidade para 2 pessoas", value: "Livre", status: "Disponível" },
        { title: "Mesa 09", meta: "2 pessoas · aberta há 9 min", value: "2 itens", status: "Ocupada" },
      ] },
      { id: "cardapio", label: "Cardápio", description: "Organize categorias, pratos, adicionais e disponibilidade.", rows: [
        { title: "Burger artesanal", meta: "Lanches · mais pedido hoje", value: "R$ 34,00", status: "Disponível" },
        { title: "Risoto de filé", meta: "Pratos principais", value: "R$ 48,00", status: "Disponível" },
        { title: "Cheesecake de frutas", meta: "Sobremesas", value: "R$ 22,00", status: "Pausado" },
      ] },
    ],
  },
  {
    slug: "pandora", business: "Experiência Cliente", greeting: "Feedback que vira prioridade.", primaryAction: "Nova pesquisa", searchPlaceholder: "Buscar pesquisa, resposta ou tema",
    metrics: [{ label: "Respostas", value: "486", detail: "38% de taxa" }, { label: "NPS", value: "68", detail: "+7 no período" }, { label: "Ações", value: "12", detail: "Comentários para tratar" }], focusTitle: "Insights", focusDescription: "Temas e sinais para orientar decisões.", focusColumns: [], activity: [],
    views: [
      { id: "resultados", label: "Insights", description: "Acompanhe NPS, satisfação, tendências e temas.", rows: [
        { title: "Clareza da explicação", meta: "92% de menções favoráveis", value: "+8%", status: "Positivo" },
        { title: "Cumprimento de prazo", meta: "64% de menções favoráveis", value: "-6%", status: "Atenção" },
        { title: "Atualização durante o serviço", meta: "58% de menções favoráveis", value: "-9%", status: "Em ação" },
      ] },
      { id: "pesquisas", label: "Pesquisas", description: "Crie e acompanhe pesquisas curtas.", rows: [
        { title: "Pós-atendimento", meta: "3 perguntas · atualizada hoje", value: "214 respostas", status: "Ativa" },
        { title: "Entrega do serviço", meta: "5 perguntas · atualizada ontem", value: "86 respostas", status: "Ativa" },
        { title: "Experiência de compra", meta: "6 perguntas · encerrada em 18 jul", value: "142 respostas", status: "Encerrada" },
      ] },
      { id: "respostas", label: "Respostas", description: "Leia notas e comentários em um só lugar.", rows: [
        { title: "“Atendimento muito rápido e atencioso.”", meta: "Pós-atendimento · hoje 14:28", value: "5 de 5", status: "Positivo" },
        { title: "“Poderiam avisar melhor o prazo.”", meta: "Entrega do serviço · hoje 13:52", value: "3 de 5", status: "Atenção" },
        { title: "“Voltarei a contratar com certeza.”", meta: "Experiência de compra · hoje 11:40", value: "5 de 5", status: "Positivo" },
        { title: "“Esperei mais do que imaginava.”", meta: "Pós-atendimento · hoje 10:18", value: "2 de 5", status: "Em ação" },
      ] },
      { id: "compartilhar", label: "Links e QR Code", description: "Distribua pesquisas por link, QR Code ou mensagem.", rows: [
        { title: "Link · Pós-atendimento", meta: "Link local de demonstração", value: "634 acessos", status: "Ativo" },
        { title: "QR Code · Balcão", meta: "Pesquisa pós-atendimento", value: "188 acessos", status: "Ativo" },
      ] },
    ],
  },
  {
    slug: "poseidon", business: "Norte Comercial", greeting: "Toda negociação com próximo passo.", primaryAction: "Nova oportunidade", searchPlaceholder: "Buscar cliente, oportunidade ou retorno",
    metrics: [{ label: "Abertas", value: "09", detail: "R$ 86 mil potencial" }, { label: "Retornos", value: "07", detail: "2 atrasados" }, { label: "Conversão", value: "31%", detail: "+4,2 p.p." }], focusTitle: "Pipeline", focusDescription: "Oportunidades por próxima etapa.", focusColumns: [], activity: [],
    views: [
      { id: "funil", label: "Pipeline", description: "Mova oportunidades pelas etapas comerciais.", rows: [
        { title: "Clínica Vida", meta: "Entender necessidade · responsável André", value: "R$ 4.200", status: "Novo lead" },
        { title: "Solar Norte", meta: "Confirmar número de usuários · responsável Camila", value: "R$ 8.500", status: "Qualificação" },
        { title: "Grupo Horizonte", meta: "Proposta enviada · responsável Lucas", value: "R$ 12.800", status: "Proposta" },
        { title: "Rota Engenharia", meta: "Reunião amanhã · responsável Camila", value: "R$ 18.000", status: "Decisão" },
      ] },
      { id: "tarefas", label: "Próximas ações", description: "Veja quem contatar, quando e por qual motivo.", rows: [
        { title: "Reunião com Rota Engenharia", meta: "Apresentação final · hoje 09:00", value: "Camila", status: "Agendado" },
        { title: "Retomar Clínica Vida", meta: "Entender necessidade · atrasado desde ontem", value: "André", status: "Atrasado" },
        { title: "Ligar para Solar Norte", meta: "Confirmar usuários · hoje 15:00", value: "Camila", status: "Hoje" },
        { title: "Revisar proposta Grupo Horizonte", meta: "Ajustar escopo · hoje 16:30", value: "Lucas", status: "Hoje" },
      ] },
      { id: "clientes", label: "Clientes", description: "Centralize contatos, contexto e histórico.", rows: [
        { title: "Grupo Horizonte", meta: "Marina Alves · Diretora", value: "3 oportunidades", status: "Ativo" },
        { title: "Rota Engenharia", meta: "Fábio Costa · Compras", value: "1 oportunidade", status: "Em negociação" },
        { title: "Solar Norte", meta: "Ana Reis · Sócia", value: "2 oportunidades", status: "Ativo" },
      ] },
      { id: "resultados", label: "Resultados", description: "Acompanhe atividade e conversão sem faturamento real.", rows: [
        { title: "Contatos realizados", meta: "Meta mensal: 240", value: "186", status: "+12%" },
        { title: "Novos clientes", meta: "Meta mensal: 18", value: "14", status: "78% da meta" },
        { title: "Ciclo médio", meta: "Da entrada à decisão", value: "19 dias", status: "-3 dias" },
      ] },
    ],
  },
  {
    slug: "hercules", business: "Operação Carajás", greeting: "Inspeção com prova e correção.", primaryAction: "Nova inspeção", searchPlaceholder: "Buscar inspeção, local ou responsável",
    metrics: [{ label: "Execução", value: "84%", detail: "42 de 50" }, { label: "Desvios", value: "03", detail: "1 alta" }, { label: "Conformidade", value: "94%", detail: "+2 p.p." }], focusTitle: "Execuções", focusDescription: "Inspeções, evidências e desvios.", focusColumns: [], activity: [],
    views: [
      { id: "execucoes", label: "Execuções", description: "Acompanhe o que foi conferido, quando e por quem.", rows: [
        { title: "Inspeção do veículo 07", meta: "Rafael Lima · Pátio principal · iniciada 14:02", value: "3/5 itens", status: "Em execução" },
        { title: "Abertura · Loja Centro", meta: "Júlia Martins · concluída 07:42", value: "8/8 itens", status: "Conforme" },
        { title: "Segurança · Pátio", meta: "Rafael Lima · concluída 09:18", value: "12/12 itens", status: "Conforme" },
        { title: "Exposição · Loja Norte", meta: "Marcos Alves · iniciada 13:55", value: "7/10 itens", status: "Atenção" },
      ] },
      { id: "rotinas", label: "Modelos", description: "Crie checklists reutilizáveis por unidade e turno.", rows: [
        { title: "Inspeção de frota", meta: "Diária · Pátio · 15 itens", value: "16:30", status: "Ativo" },
        { title: "Abertura da unidade", meta: "Diária · Loja Centro · 8 itens", value: "07:30", status: "Ativo" },
        { title: "Auditoria de exposição", meta: "Semanal · Loja Norte · 10 itens", value: "Segunda", status: "Ativo" },
      ] },
      { id: "pendencias", label: "Não conformidades", description: "Trate desvios com responsável, prazo e evidência.", rows: [
        { title: "Extintor sem lacre", meta: "Pátio · responsável Marcos · foto registrada", value: "Hoje 17:00", status: "Alta" },
        { title: "Etiqueta de validade ausente", meta: "Loja Norte · responsável Júlia", value: "Amanhã", status: "Atenção" },
        { title: "Iluminação do corredor", meta: "Unidade Sul · responsável Rafael", value: "23 jul", status: "Não conforme" },
      ] },
      { id: "auditorias", label: "Auditorias", description: "Compare execuções e mantenha registros visuais.", rows: [
        { title: "Auditoria mensal · Loja Centro", meta: "18 jul · 24 evidências", value: "96%", status: "Conforme" },
        { title: "Auditoria mensal · Loja Norte", meta: "17 jul · 19 evidências", value: "89%", status: "Atenção" },
      ] },
    ],
  },
];

export function getWorkspace(slug: string) {
  return workspaces.find((workspace) => workspace.slug === slug);
}
