export type WorkspaceRow = {
  title: string;
  meta: string;
  value: string;
  status: string;
};

export type WorkspaceView = {
  id: string;
  label: string;
  description: string;
  rows: WorkspaceRow[];
};

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
    slug: "atlas",
    business: "Oficina Avenida",
    greeting: "Sua oficina, sem pontos cegos.",
    primaryAction: "Nova ordem de serviço",
    searchPlaceholder: "Buscar cliente, placa ou OS",
    metrics: [
      { label: "Agendados hoje", value: "08", detail: "2 aguardando chegada" },
      { label: "Em serviço", value: "06", detail: "Dentro do planejado" },
      { label: "Prontos para entrega", value: "03", detail: "Clientes já avisados" },
    ],
    focusTitle: "Fluxo da oficina",
    focusDescription: "Acompanhe cada veículo do recebimento até a entrega.",
    focusColumns: [
      { label: "Recepção", count: 2, items: [{ title: "Nivus · QVE 4A21", meta: "Mariana Costa · 09:00" }, { title: "Onix · RTH 8F32", meta: "Carlos Souza · 10:30" }] },
      { label: "Em serviço", count: 3, items: [{ title: "Saveiro · TCJ 9I23", meta: "OS #1048 · Suspensão" }, { title: "HB20 · QDB 7J10", meta: "OS #1046 · Revisão" }] },
      { label: "Finalização", count: 2, items: [{ title: "T-Cross · OSM 2D11", meta: "Aguardando conferência" }, { title: "Strada · RXA 3E05", meta: "Pronto para entrega" }] },
    ],
    activity: [{ title: "OS #1048 avançou para serviço", time: "há 8 min", status: "Em andamento" }, { title: "Agendamento confirmado", time: "há 24 min", status: "Confirmado" }, { title: "Veículo liberado para entrega", time: "há 1 h", status: "Concluído" }],
    views: [
      { id: "agenda", label: "Agenda", description: "Organize os horários e a capacidade da oficina.", rows: [{ title: "09:00 · Mariana Costa", meta: "VW Nivus · Revisão de 30.000 km", value: "Box 01", status: "Confirmado" }, { title: "10:30 · Carlos Souza", meta: "Chevrolet Onix · Ruído dianteiro", value: "A confirmar", status: "Pendente" }, { title: "13:30 · Renata Lima", meta: "Fiat Toro · Troca de óleo", value: "Box 03", status: "Confirmado" }, { title: "15:00 · Paulo Reis", meta: "Honda City · Alinhamento", value: "Box 02", status: "Confirmado" }] },
      { id: "ordens", label: "Ordens de serviço", description: "Veja o andamento e os valores estimados de cada serviço.", rows: [{ title: "OS #1048 · Saveiro TCJ 9I23", meta: "Barros & Braga · aberta hoje", value: "R$ 1.480", status: "Em andamento" }, { title: "OS #1047 · T-Cross OSM 2D11", meta: "Amanda Ribeiro · aberta ontem", value: "R$ 680", status: "Conferência" }, { title: "OS #1046 · HB20 QDB 7J10", meta: "João Pedro · aberta ontem", value: "R$ 920", status: "Em andamento" }, { title: "OS #1045 · Strada RXA 3E05", meta: "Moura Serviços · 19 jul", value: "R$ 540", status: "Pronto" }] },
      { id: "clientes", label: "Clientes e veículos", description: "Histórico simples de clientes e veículos atendidos.", rows: [{ title: "Mariana Costa", meta: "VW Nivus · QVE 4A21", value: "3 serviços", status: "Ativo" }, { title: "Carlos Souza", meta: "Chevrolet Onix · RTH 8F32", value: "1 serviço", status: "Novo" }, { title: "Barros & Braga", meta: "VW Saveiro · TCJ 9I23", value: "8 serviços", status: "Ativo" }, { title: "Amanda Ribeiro", meta: "VW T-Cross · OSM 2D11", value: "4 serviços", status: "Ativo" }] },
      { id: "servicos", label: "Serviços", description: "Cadastre os serviços oferecidos e valores de referência.", rows: [{ title: "Revisão preventiva", meta: "Tempo estimado · 2h30", value: "A partir de R$ 450", status: "Disponível" }, { title: "Alinhamento e balanceamento", meta: "Tempo estimado · 1h", value: "A partir de R$ 180", status: "Disponível" }, { title: "Diagnóstico de suspensão", meta: "Tempo estimado · 1h30", value: "A partir de R$ 220", status: "Disponível" }] },
    ],
  },
  {
    slug: "artemis",
    business: "Bistrô da Praça",
    greeting: "O salão e a cozinha no mesmo ritmo.",
    primaryAction: "Novo pedido",
    searchPlaceholder: "Buscar pedido, mesa ou item",
    metrics: [{ label: "Pedidos abertos", value: "12", detail: "4 em preparo" }, { label: "Tempo médio", value: "18 min", detail: "3 min abaixo de ontem" }, { label: "Caixa de hoje", value: "R$ 2.840", detail: "68 pedidos fechados" }],
    focusTitle: "Pedidos em movimento",
    focusDescription: "Uma visão rápida do atendimento à entrega.",
    focusColumns: [{ label: "Recebidos", count: 4, items: [{ title: "Mesa 08 · #384", meta: "3 itens · há 2 min" }, { title: "Retirada · #385", meta: "2 itens · há 4 min" }] }, { label: "Na cozinha", count: 5, items: [{ title: "Mesa 03 · #379", meta: "Risoto + 2 bebidas" }, { title: "Entrega · #381", meta: "2 burgers + fritas" }] }, { label: "Prontos", count: 3, items: [{ title: "Mesa 12 · #377", meta: "Aguardando garçom" }, { title: "Retirada · #378", meta: "Cliente avisado" }] }],
    activity: [{ title: "Pedido #384 enviado à cozinha", time: "há 2 min", status: "Recebido" }, { title: "Mesa 12 pronta para servir", time: "há 5 min", status: "Pronto" }, { title: "Conta da mesa 05 fechada", time: "há 11 min", status: "Pago" }],
    views: [
      { id: "pedidos", label: "Pedidos", description: "Acompanhe pedidos do salão, retirada e entrega.", rows: [{ title: "#384 · Mesa 08", meta: "3 itens · entrada 14:32", value: "R$ 126,00", status: "Recebido" }, { title: "#381 · Entrega", meta: "2 burgers + fritas · entrada 14:25", value: "R$ 89,00", status: "Em preparo" }, { title: "#379 · Mesa 03", meta: "Risoto + bebidas · entrada 14:18", value: "R$ 142,00", status: "Em preparo" }, { title: "#377 · Mesa 12", meta: "4 itens · entrada 14:08", value: "R$ 178,00", status: "Pronto" }] },
      { id: "cardapio", label: "Cardápio", description: "Organize categorias, pratos, adicionais e disponibilidade.", rows: [{ title: "Burger artesanal", meta: "Lanches · mais pedido hoje", value: "R$ 34,00", status: "Disponível" }, { title: "Risoto de filé", meta: "Pratos principais", value: "R$ 48,00", status: "Disponível" }, { title: "Soda italiana", meta: "Bebidas · 4 sabores", value: "R$ 16,00", status: "Disponível" }, { title: "Cheesecake de frutas", meta: "Sobremesas", value: "R$ 22,00", status: "Pausado" }] },
      { id: "mesas", label: "Mesas", description: "Veja ocupação, consumo e tempo de atendimento.", rows: [{ title: "Mesa 03", meta: "2 pessoas · aberta há 42 min", value: "R$ 142,00", status: "Ocupada" }, { title: "Mesa 08", meta: "4 pessoas · aberta há 18 min", value: "R$ 126,00", status: "Ocupada" }, { title: "Mesa 12", meta: "3 pessoas · aberta há 55 min", value: "R$ 178,00", status: "Conta solicitada" }, { title: "Mesa 05", meta: "Capacidade para 4 pessoas", value: "Livre", status: "Disponível" }] },
      { id: "caixa", label: "Caixa", description: "Acompanhe entradas e fechamento do dia sem contabilidade complexa.", rows: [{ title: "Vendas no cartão", meta: "42 pagamentos", value: "R$ 1.934,00", status: "Recebido" }, { title: "Vendas no PIX", meta: "21 pagamentos", value: "R$ 738,00", status: "Recebido" }, { title: "Vendas em dinheiro", meta: "5 pagamentos", value: "R$ 168,00", status: "Recebido" }] },
    ],
  },
  {
    slug: "poseidon",
    business: "Norte Comercial",
    greeting: "Toda venda começa pelo próximo passo.",
    primaryAction: "Nova negociação",
    searchPlaceholder: "Buscar cliente ou negociação",
    metrics: [{ label: "Pipeline aberto", value: "R$ 86 mil", detail: "24 negociações" }, { label: "Retornos hoje", value: "07", detail: "2 estão atrasados" }, { label: "Conversão do mês", value: "31%", detail: "+4,2% sobre junho" }],
    focusTitle: "Funil de vendas",
    focusDescription: "Priorize negociações sem perder nenhum retorno.",
    focusColumns: [{ label: "Qualificação", count: 8, items: [{ title: "Solar Norte", meta: "R$ 8.500 · retorno hoje" }, { title: "Clínica Vida", meta: "R$ 4.200 · novo lead" }] }, { label: "Proposta", count: 6, items: [{ title: "Grupo Horizonte", meta: "R$ 12.800 · proposta enviada" }, { title: "Moura Serviços", meta: "R$ 6.400 · ajuste solicitado" }] }, { label: "Decisão", count: 3, items: [{ title: "Rota Engenharia", meta: "R$ 18.000 · reunião amanhã" }, { title: "Casa Lima", meta: "R$ 3.750 · aguardando aceite" }] }],
    activity: [{ title: "Proposta enviada para Grupo Horizonte", time: "há 14 min", status: "Proposta" }, { title: "Novo lead: Clínica Vida", time: "há 38 min", status: "Novo" }, { title: "Casa Lima abriu a proposta", time: "há 1 h", status: "Visualizado" }],
    views: [
      { id: "funil", label: "Funil", description: "Mova oportunidades pelas etapas do seu processo comercial.", rows: [{ title: "Rota Engenharia", meta: "Decisão · responsável: Camila", value: "R$ 18.000", status: "Reunião amanhã" }, { title: "Grupo Horizonte", meta: "Proposta · responsável: Lucas", value: "R$ 12.800", status: "Proposta enviada" }, { title: "Solar Norte", meta: "Qualificação · responsável: Camila", value: "R$ 8.500", status: "Retorno hoje" }, { title: "Clínica Vida", meta: "Novo lead · responsável: André", value: "R$ 4.200", status: "Novo" }] },
      { id: "clientes", label: "Clientes", description: "Centralize contatos, histórico e próximos passos.", rows: [{ title: "Grupo Horizonte", meta: "Marina Alves · Diretora", value: "3 negociações", status: "Ativo" }, { title: "Rota Engenharia", meta: "Fábio Costa · Compras", value: "1 negociação", status: "Em negociação" }, { title: "Solar Norte", meta: "Ana Reis · Sócia", value: "2 negociações", status: "Ativo" }, { title: "Clínica Vida", meta: "Priscila Moura · Gestora", value: "Novo contato", status: "Lead" }] },
      { id: "tarefas", label: "Retornos", description: "Veja quem contatar e por qual motivo.", rows: [{ title: "Ligar para Solar Norte", meta: "Confirmar número de usuários · hoje 15:00", value: "Camila", status: "Hoje" }, { title: "Revisar proposta Moura Serviços", meta: "Cliente pediu nova condição · hoje 16:30", value: "Lucas", status: "Hoje" }, { title: "Reunião com Rota Engenharia", meta: "Apresentação final · amanhã 09:00", value: "Camila", status: "Agendado" }, { title: "Retomar Clínica Vida", meta: "Entender necessidade · atrasado desde ontem", value: "André", status: "Atrasado" }] },
      { id: "resultados", label: "Resultados", description: "Acompanhe o essencial do desempenho comercial.", rows: [{ title: "Vendas fechadas em julho", meta: "12 negócios · ticket médio R$ 5.240", value: "R$ 62.880", status: "+12%" }, { title: "Novos clientes", meta: "Meta mensal: 18", value: "14", status: "78% da meta" }, { title: "Ciclo médio de venda", meta: "Da entrada ao fechamento", value: "19 dias", status: "-3 dias" }] },
    ],
  },
  {
    slug: "hercules",
    business: "Operação Carajás",
    greeting: "Rotina boa é rotina comprovada.",
    primaryAction: "Novo checklist",
    searchPlaceholder: "Buscar rotina, unidade ou responsável",
    metrics: [{ label: "Execução de hoje", value: "84%", detail: "42 de 50 concluídos" }, { label: "Pendências", value: "08", detail: "3 exigem evidência" }, { label: "Conformidade", value: "94%", detail: "+2% nesta semana" }],
    focusTitle: "Rotinas de hoje",
    focusDescription: "Execução visível por turno, unidade e responsável.",
    focusColumns: [{ label: "A iniciar", count: 8, items: [{ title: "Fechamento da unidade", meta: "Loja Centro · 18:00" }, { title: "Inspeção do veículo 04", meta: "Frota · 16:30" }] }, { label: "Em execução", count: 4, items: [{ title: "Auditoria de exposição", meta: "Loja Norte · 7/10 itens" }, { title: "Limpeza operacional", meta: "Unidade Sul · 5/8 itens" }] }, { label: "Concluídas", count: 42, items: [{ title: "Abertura da unidade", meta: "Loja Centro · 100%" }, { title: "Conferência de segurança", meta: "Pátio · 100%" }] }],
    activity: [{ title: "Evidência adicionada à auditoria", time: "há 6 min", status: "Registrado" }, { title: "Pendência atribuída a Marcos", time: "há 17 min", status: "Pendente" }, { title: "Checklist de abertura concluído", time: "há 48 min", status: "Concluído" }],
    views: [
      { id: "rotinas", label: "Rotinas", description: "Organize atividades recorrentes por unidade e turno.", rows: [{ title: "Abertura da unidade", meta: "Diária · Loja Centro · 8 itens", value: "07:30", status: "Concluído" }, { title: "Auditoria de exposição", meta: "Semanal · Loja Norte · 10 itens", value: "70%", status: "Em execução" }, { title: "Fechamento da unidade", meta: "Diária · Loja Centro · 12 itens", value: "18:00", status: "A iniciar" }, { title: "Inspeção de frota", meta: "Diária · Pátio · 15 itens", value: "16:30", status: "A iniciar" }] },
      { id: "execucoes", label: "Execuções", description: "Acompanhe o que foi feito, quando e por quem.", rows: [{ title: "Abertura · Loja Centro", meta: "Júlia Martins · concluído às 07:42", value: "8/8 itens", status: "Conforme" }, { title: "Segurança · Pátio", meta: "Rafael Lima · concluído às 09:18", value: "12/12 itens", status: "Conforme" }, { title: "Exposição · Loja Norte", meta: "Marcos Alves · iniciado às 13:55", value: "7/10 itens", status: "Em execução" }, { title: "Limpeza · Unidade Sul", meta: "Carla Reis · iniciado às 14:02", value: "5/8 itens", status: "Em execução" }] },
      { id: "pendencias", label: "Pendências", description: "Trate desvios com responsável, prazo e evidência.", rows: [{ title: "Extintor sem lacre", meta: "Pátio · responsável: Marcos", value: "Hoje 17:00", status: "Alta" }, { title: "Etiqueta de validade ausente", meta: "Loja Norte · responsável: Júlia", value: "Amanhã", status: "Média" }, { title: "Iluminação do corredor", meta: "Unidade Sul · responsável: Rafael", value: "23 jul", status: "Baixa" }] },
      { id: "auditorias", label: "Auditorias", description: "Compare unidades e mantenha registros visuais.", rows: [{ title: "Auditoria mensal · Loja Centro", meta: "Realizada em 18 jul · 24 evidências", value: "96%", status: "Conforme" }, { title: "Auditoria mensal · Loja Norte", meta: "Realizada em 17 jul · 19 evidências", value: "89%", status: "Atenção" }, { title: "Auditoria mensal · Unidade Sul", meta: "Programada para 24 jul", value: "Não iniciada", status: "Agendada" }] },
    ],
  },
  {
    slug: "pandora",
    business: "Experiência Cliente",
    greeting: "Ouvir bem ajuda a decidir melhor.",
    primaryAction: "Nova pesquisa",
    searchPlaceholder: "Buscar pesquisa ou resposta",
    metrics: [{ label: "Respostas no mês", value: "486", detail: "Taxa de resposta de 38%" }, { label: "Satisfação geral", value: "4,6/5", detail: "+0,2 sobre junho" }, { label: "Pontos de atenção", value: "12", detail: "Feedbacks para revisar" }],
    focusTitle: "Pesquisas ativas",
    focusDescription: "Resultados claros sem relatórios difíceis de interpretar.",
    focusColumns: [{ label: "Coletando", count: 3, items: [{ title: "Pós-atendimento", meta: "214 respostas · nota 4,7" }, { title: "Entrega do serviço", meta: "86 respostas · nota 4,5" }] }, { label: "Em análise", count: 2, items: [{ title: "Experiência de compra", meta: "142 respostas · 8 alertas" }, { title: "Pesquisa trimestral", meta: "44 respostas · encerrada" }] }, { label: "Ações", count: 5, items: [{ title: "Tempo de espera", meta: "Responsável: Atendimento" }, { title: "Comunicação da entrega", meta: "Responsável: Operação" }] }],
    activity: [{ title: "Nova resposta com nota máxima", time: "há 3 min", status: "Positivo" }, { title: "Comentário sinalizado para revisão", time: "há 21 min", status: "Atenção" }, { title: "Pesquisa pós-atendimento enviada", time: "há 1 h", status: "Enviado" }],
    views: [
      { id: "pesquisas", label: "Pesquisas", description: "Crie, publique e acompanhe pesquisas curtas.", rows: [{ title: "Pós-atendimento", meta: "3 perguntas · atualizada hoje", value: "214 respostas", status: "Ativa" }, { title: "Entrega do serviço", meta: "5 perguntas · atualizada ontem", value: "86 respostas", status: "Ativa" }, { title: "Experiência de compra", meta: "6 perguntas · encerrada em 18 jul", value: "142 respostas", status: "Em análise" }, { title: "Pesquisa trimestral", meta: "8 perguntas · encerrada em 15 jul", value: "44 respostas", status: "Encerrada" }] },
      { id: "respostas", label: "Respostas", description: "Leia avaliações e comentários em um só lugar.", rows: [{ title: "“Atendimento muito rápido e atencioso.”", meta: "Pós-atendimento · hoje 14:28", value: "5 de 5", status: "Positivo" }, { title: "“Poderiam avisar melhor o prazo.”", meta: "Entrega do serviço · hoje 13:52", value: "3 de 5", status: "Atenção" }, { title: "“Voltarei a comprar com certeza.”", meta: "Experiência de compra · hoje 11:40", value: "5 de 5", status: "Positivo" }, { title: "“Esperei mais do que imaginava.”", meta: "Pós-atendimento · hoje 10:18", value: "2 de 5", status: "Revisar" }] },
      { id: "resultados", label: "Resultados", description: "Entenda tendências de satisfação sem planilhas.", rows: [{ title: "Satisfação geral", meta: "Base: 486 respostas em julho", value: "4,6 de 5", status: "+0,2" }, { title: "Recomendariam a empresa", meta: "Pergunta de recomendação", value: "89%", status: "+4%" }, { title: "Tempo de atendimento", meta: "Principal tema dos comentários", value: "4,2 de 5", status: "Atenção" }] },
      { id: "compartilhar", label: "Compartilhamento", description: "Distribua pesquisas por link, QR Code ou mensagem.", rows: [{ title: "Link · Pós-atendimento", meta: "crm.plus/p/atendimento", value: "634 acessos", status: "Ativo" }, { title: "QR Code · Balcão", meta: "Pesquisa pós-atendimento", value: "188 acessos", status: "Ativo" }, { title: "Link · Entrega do serviço", meta: "crm.plus/p/entrega", value: "246 acessos", status: "Ativo" }] },
    ],
  },
  {
    slug: "ares",
    business: "Mafra Soluções",
    greeting: "Propostas claras fecham negócios mais rápido.",
    primaryAction: "Novo orçamento",
    searchPlaceholder: "Buscar orçamento, pedido ou cliente",
    metrics: [{ label: "Em negociação", value: "R$ 48 mil", detail: "11 propostas abertas" }, { label: "Aguardando resposta", value: "07", detail: "3 vencem nesta semana" }, { label: "Aprovados no mês", value: "R$ 36 mil", detail: "Taxa de aprovação de 42%" }],
    focusTitle: "Orçamentos recentes",
    focusDescription: "Da criação ao pedido, com cada situação visível.",
    focusColumns: [{ label: "Rascunhos", count: 4, items: [{ title: "#OR-128 · Clínica Mais", meta: "R$ 4.850 · editado hoje" }, { title: "#OR-127 · Casa Lima", meta: "R$ 2.300 · falta revisar" }] }, { label: "Enviados", count: 7, items: [{ title: "#OR-124 · Rota Engenharia", meta: "R$ 12.800 · vence 25 jul" }, { title: "#OR-122 · Solar Norte", meta: "R$ 8.500 · visualizado" }] }, { label: "Aprovados", count: 5, items: [{ title: "#OR-119 · Grupo Vale", meta: "R$ 9.600 · gerar pedido" }, { title: "#OR-117 · Bistrô Praça", meta: "R$ 3.420 · pedido criado" }] }],
    activity: [{ title: "Orçamento #OR-122 foi visualizado", time: "há 12 min", status: "Visualizado" }, { title: "#OR-119 aprovado pelo cliente", time: "há 44 min", status: "Aprovado" }, { title: "Pedido #PD-086 criado", time: "há 2 h", status: "Pedido" }],
    views: [
      { id: "orcamentos", label: "Orçamentos", description: "Crie e acompanhe propostas comerciais profissionais.", rows: [{ title: "#OR-128 · Clínica Mais", meta: "Criado hoje · validade de 10 dias", value: "R$ 4.850", status: "Rascunho" }, { title: "#OR-124 · Rota Engenharia", meta: "Enviado em 20 jul · vence 25 jul", value: "R$ 12.800", status: "Enviado" }, { title: "#OR-122 · Solar Norte", meta: "Enviado em 19 jul · visualizado hoje", value: "R$ 8.500", status: "Visualizado" }, { title: "#OR-119 · Grupo Vale", meta: "Aprovado hoje", value: "R$ 9.600", status: "Aprovado" }] },
      { id: "itens", label: "Produtos e serviços", description: "Mantenha itens e valores prontos para usar nas propostas.", rows: [{ title: "Desenvolvimento de landing page", meta: "Serviço · prazo padrão de 10 dias", value: "R$ 2.800", status: "Ativo" }, { title: "Manutenção mensal", meta: "Serviço recorrente", value: "R$ 680/mês", status: "Ativo" }, { title: "Identidade visual básica", meta: "Serviço · prazo padrão de 7 dias", value: "R$ 1.900", status: "Ativo" }, { title: "Hora técnica", meta: "Serviço avulso", value: "R$ 120", status: "Ativo" }] },
      { id: "pedidos", label: "Pedidos", description: "Converta aprovações em pedidos e acompanhe a entrega.", rows: [{ title: "#PD-086 · Grupo Vale", meta: "Originado do orçamento #OR-119", value: "R$ 9.600", status: "Novo" }, { title: "#PD-084 · Bistrô Praça", meta: "Entrega prevista em 28 jul", value: "R$ 3.420", status: "Em andamento" }, { title: "#PD-081 · Moura Serviços", meta: "Concluído em 18 jul", value: "R$ 6.200", status: "Concluído" }] },
      { id: "clientes", label: "Clientes", description: "Acesse contatos e histórico de propostas e pedidos.", rows: [{ title: "Rota Engenharia", meta: "Fábio Costa · Compras", value: "4 propostas", status: "Em negociação" }, { title: "Grupo Vale", meta: "Márcia Lima · Diretora", value: "3 pedidos", status: "Cliente" }, { title: "Solar Norte", meta: "Ana Reis · Sócia", value: "2 propostas", status: "Em negociação" }, { title: "Clínica Mais", meta: "Paula Santos · Gestora", value: "1 proposta", status: "Novo" }] },
    ],
  },
];

export function getWorkspace(slug: string) {
  return workspaces.find((workspace) => workspace.slug === slug);
}
