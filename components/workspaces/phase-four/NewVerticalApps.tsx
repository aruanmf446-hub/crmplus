"use client";

import type { Product } from "@/lib/apps";
import { VerticalBusinessApp, type MainRecord, type RelatedRecord, type ResourceRecord, type VerticalConfig } from "./VerticalBusinessApp";

function record(id: string, title: string, subtitle: string, status: string, owner: string, data: Record<string, string>): MainRecord {
  return { id, title, subtitle, status, owner, updated: "hoje", archived: false, data, history: [{ text: "Registro criado", date: "Hoje" }], attachments: [] };
}

function related(id: string, parentId: string, title: string, description: string, status: string, date: string): RelatedRecord {
  return { id, parentId, title, description, status, date };
}

function resource(id: string, parentId: string, title: string, category: string, reference: string, status: string, due: string): ResourceRecord {
  return { id, parentId, title, category, reference, status, due };
}

const alexandria: VerticalConfig = {
  slug: "alexandria", icon: "document", entityLabel: "Obra", entityPlural: "Acervo", entityDescription: "Catálogo, exemplares e circulação sem repetir o mesmo livro por unidade física.",
  operationLabel: "Circulação", operationPlural: "Empréstimos e reservas", resourceLabel: "Exemplar", resourcePlural: "Exemplares",
  statuses: ["Em catalogação", "Disponível", "Reservado", "Indisponível"], operationStatuses: ["Solicitado", "Emprestado", "Aguardando devolução", "Devolvido", "Cancelado"], resourceStatuses: ["Disponível", "Emprestado", "Reservado", "Danificado", "Extraviado"],
  fields: [
    { key: "authors", label: "Autor ou autores" }, { key: "publisher", label: "Editora" }, { key: "year", label: "Ano", type: "number" },
    { key: "isbn", label: "ISBN ou identificador" }, { key: "category", label: "Categoria" }, { key: "material", label: "Tipo de material", type: "select", options: ["Livro", "Revista", "Apostila", "Trabalho acadêmico", "Gibi", "DVD", "Documento", "Arquivo digital"] },
    { key: "summary", label: "Sinopse", type: "textarea", wide: true },
  ],
  seed: [
    record("OBR-001", "Dom Casmurro", "Machado de Assis · 5 exemplares", "Disponível", "Lívia", { authors: "Machado de Assis", publisher: "Editora Nacional", year: "1899", isbn: "978-85-0001", category: "Literatura brasileira", material: "Livro", summary: "Romance brasileiro disponível para circulação." }),
    record("OBR-002", "Introdução à Engenharia", "Acervo acadêmico · 2 exemplares", "Reservado", "Rafael", { authors: "Autores diversos", publisher: "Atlas", year: "2024", isbn: "978-85-0002", category: "Engenharia", material: "Livro", summary: "Material de apoio aos cursos introdutórios." }),
  ],
  relatedSeed: [related("EMP-014", "OBR-001", "Empréstimo para Ana Souza", "Leitor ativo · devolução prevista em 29/07", "Emprestado", "2026-07-22")],
  resourceSeed: [resource("EX-001", "OBR-001", "Exemplar 001", "Livro", "Estante A · Prateleira 2", "Emprestado", "2026-07-29"), resource("EX-002", "OBR-001", "Exemplar 002", "Livro", "Estante A · Prateleira 2", "Disponível", "")],
  highlights: ["Obras catalogadas", "Circulação ativa", "Disponíveis"], primaryAction: "Nova obra",
};

const olympus: VerticalConfig = {
  slug: "olympus", icon: "home", entityLabel: "Imóvel", entityPlural: "Imóveis", entityDescription: "Captação, visitas, propostas e documentos até a venda, locação ou encerramento.",
  operationLabel: "Atendimento", operationPlural: "Visitas e propostas", resourceLabel: "Documento", resourcePlural: "Documentos e chaves",
  statuses: ["Em captação", "Aguardando documentos", "Disponível", "Em negociação", "Vendido"], operationStatuses: ["Solicitada", "Confirmada", "Realizada", "Proposta enviada", "Aceita", "Recusada"], resourceStatuses: ["Pendente", "Recebido", "Vigente", "Vencendo", "Vencido"],
  fields: [
    { key: "purpose", label: "Finalidade", type: "select", options: ["Venda", "Aluguel", "Venda ou aluguel"] }, { key: "type", label: "Tipo", type: "select", options: ["Casa", "Apartamento", "Terreno", "Sala comercial", "Loja", "Galpão", "Fazenda", "Chácara"] },
    { key: "address", label: "Endereço", wide: true }, { key: "owner", label: "Proprietário" }, { key: "broker", label: "Corretor" }, { key: "area", label: "Área total" },
    { key: "rooms", label: "Quartos" }, { key: "announcedValue", label: "Valor anunciado apenas informativo" }, { key: "description", label: "Descrição do imóvel", type: "textarea", wide: true },
  ],
  seed: [
    record("IMO-204", "Apartamento Jardim Europa", "Venda · 3 quartos · 2 vagas", "Disponível", "Carla", { purpose: "Venda", type: "Apartamento", address: "Rua das Palmeiras, 140", owner: "Renato Alves", broker: "Carla", area: "118 m²", rooms: "3", announcedValue: "R$ 780.000", description: "Apartamento com varanda e área de lazer." }),
    record("IMO-203", "Galpão Distrito Industrial", "Locação · 1.400 m²", "Em negociação", "Marcos", { purpose: "Aluguel", type: "Galpão", address: "Distrito Industrial, lote 18", owner: "Grupo Norte", broker: "Marcos", area: "1.400 m²", rooms: "", announcedValue: "R$ 24.000/mês", description: "Galpão com docas e pátio de manobra." }),
  ],
  relatedSeed: [related("VIS-088", "IMO-204", "Visita com Juliana Mendes", "Ponto positivo: localização. Próxima ação: proposta.", "Realizada", "2026-07-22")],
  resourceSeed: [resource("DOC-IM-1", "IMO-204", "Matrícula atualizada", "Matrícula", "Cartório 2º Ofício", "Vigente", "2026-12-31")],
  highlights: ["Imóveis na carteira", "Em acompanhamento", "Negociações concluídas"], primaryAction: "Novo imóvel",
};

const argus: VerticalConfig = {
  slug: "argus", icon: "tag", entityLabel: "Patrimônio", entityPlural: "Patrimônios", entityDescription: "Acompanhe localização, responsável, conservação e movimentações de cada bem.",
  operationLabel: "Movimentação", operationPlural: "Movimentações", resourceLabel: "Documento", resourcePlural: "Garantias e documentos",
  statuses: ["Disponível", "Em uso", "Emprestado", "Em manutenção", "Baixado"], operationStatuses: ["Solicitada", "Aguardando aprovação", "Em transporte", "Recebida", "Cancelada"], resourceStatuses: ["Vigente", "Vencendo", "Vencido", "Sem documento"],
  fields: [
    { key: "assetNumber", label: "Número patrimonial" }, { key: "category", label: "Categoria" }, { key: "brandModel", label: "Marca e modelo" }, { key: "serial", label: "Número de série" },
    { key: "location", label: "Localização completa", wide: true }, { key: "holder", label: "Responsável atual" }, { key: "condition", label: "Estado de conservação", type: "select", options: ["Novo", "Bom", "Regular", "Danificado"] },
    { key: "acquisition", label: "Data de aquisição", type: "date" }, { key: "value", label: "Valor de aquisição informativo" },
  ],
  seed: [
    record("PAT-1082", "Notebook Dell Latitude", "Tecnologia · Sala Administrativa", "Em uso", "Fernanda", { assetNumber: "0001082", category: "Computador", brandModel: "Dell Latitude 5440", serial: "DL5440-8891", location: "Matriz · 2º andar · Administrativo", holder: "Fernanda Lima", condition: "Bom", acquisition: "2025-02-10", value: "R$ 6.800" }),
    record("PAT-1074", "Furadeira industrial", "Ferramenta · Oficina", "Em manutenção", "Carlos", { assetNumber: "0001074", category: "Ferramenta", brandModel: "Bosch GSB", serial: "B-99382", location: "Unidade Sul · Oficina", holder: "Carlos", condition: "Regular", acquisition: "2023-06-12", value: "R$ 1.450" }),
  ],
  relatedSeed: [related("MOV-311", "PAT-1082", "Termo para Fernanda Lima", "Transferência de responsabilidade confirmada.", "Recebida", "2026-07-18")],
  resourceSeed: [resource("GAR-19", "PAT-1082", "Garantia Dell", "Garantia", "Suporte empresarial", "Vigente", "2027-02-10")],
  highlights: ["Bens ativos", "Movimentações abertas", "Bens regularizados"], primaryAction: "Novo patrimônio",
};

const hermes: VerticalConfig = {
  slug: "hermes", icon: "calendar", entityLabel: "Evento", entityPlural: "Eventos", entityDescription: "Planejamento, programação, inscrições e credenciamento sem venda de ingressos.",
  operationLabel: "Atividade", operationPlural: "Programação e ocorrências", resourceLabel: "Participante", resourcePlural: "Participantes e equipe",
  statuses: ["Rascunho", "Em planejamento", "Inscrições abertas", "Em andamento", "Encerrado"], operationStatuses: ["Planejada", "Confirmada", "Em andamento", "Concluída", "Cancelada"], resourceStatuses: ["Pré-inscrito", "Confirmado", "Credenciado", "Presente", "Ausente"],
  fields: [
    { key: "category", label: "Categoria", type: "select", options: ["Congresso", "Feira", "Workshop", "Treinamento", "Palestra", "Convenção", "Cerimônia", "Evento esportivo"] },
    { key: "organizer", label: "Organizador" }, { key: "start", label: "Data inicial", type: "date" }, { key: "end", label: "Data final", type: "date" }, { key: "location", label: "Local" }, { key: "capacity", label: "Capacidade", type: "number" },
    { key: "audience", label: "Público-alvo" }, { key: "rules", label: "Regras de participação", type: "textarea", wide: true },
  ],
  seed: [
    record("EVE-042", "Encontro de Segurança 2026", "Treinamento · 180 participantes", "Inscrições abertas", "Juliana", { category: "Treinamento", organizer: "Equipe de Segurança", start: "2026-08-14", end: "2026-08-14", location: "Centro de Convenções", capacity: "180", audience: "Colaboradores e prestadores", rules: "Credenciamento obrigatório e presença mínima para certificado." }),
    record("EVE-041", "Workshop de Liderança", "Workshop · Sala 3", "Em planejamento", "Ricardo", { category: "Workshop", organizer: "RH", start: "2026-09-03", end: "2026-09-03", location: "Auditório Norte", capacity: "80", audience: "Lideranças", rules: "Inscrição sujeita a aprovação." }),
  ],
  relatedSeed: [related("ATV-121", "EVE-042", "Abertura e orientações", "Palco principal · responsável Juliana", "Confirmada", "2026-08-14")],
  resourceSeed: [resource("PAR-888", "EVE-042", "Mariana Costa", "Participante", "Empresa Norte", "Confirmado", "2026-08-14")],
  highlights: ["Eventos ativos", "Atividades em preparação", "Eventos encerrados"], primaryAction: "Novo evento",
};

const athena: VerticalConfig = {
  slug: "athena", icon: "clipboard", entityLabel: "Licitação", entityPlural: "Licitações", entityDescription: "Controle interno de edital, proposta, habilitação, prazos e resultado — nunca substitui o portal oficial.",
  operationLabel: "Etapa", operationPlural: "Prazos e etapas", resourceLabel: "Documento", resourcePlural: "Documentos da empresa",
  statuses: ["Aguardando análise", "Participar", "Proposta preparada", "Em sessão", "Encerrada"], operationStatuses: ["Pendente", "Em preparação", "Enviado", "Concluído", "Perdido"], resourceStatuses: ["Vigente", "Vencendo", "Vencido", "Pendente"],
  fields: [
    { key: "number", label: "Número da licitação" }, { key: "agency", label: "Órgão" }, { key: "modality", label: "Modalidade" }, { key: "process", label: "Processo" },
    { key: "portal", label: "Portal oficial" }, { key: "session", label: "Data da sessão", type: "date" }, { key: "deadline", label: "Prazo da proposta", type: "date" },
    { key: "estimated", label: "Valor estimado informativo" }, { key: "object", label: "Objeto", type: "textarea", wide: true },
  ],
  seed: [
    record("LIC-088", "Pregão eletrônico 042/2026", "Prefeitura Municipal · equipamentos", "Participar", "Ana", { number: "042/2026", agency: "Prefeitura Municipal", modality: "Pregão eletrônico", process: "2026.0042", portal: "PNCP / portal do órgão", session: "2026-07-30", deadline: "2026-07-29", estimated: "R$ 240.000", object: "Fornecimento de equipamentos conforme edital e anexos." }),
    record("LIC-087", "Concorrência 011/2026", "Secretaria Estadual · serviços", "Aguardando análise", "Paulo", { number: "011/2026", agency: "Secretaria Estadual", modality: "Concorrência", process: "2026.0011", portal: "PNCP", session: "2026-08-12", deadline: "2026-08-10", estimated: "R$ 1.100.000", object: "Contratação de serviços técnicos especializados." }),
  ],
  relatedSeed: [related("PRA-22", "LIC-088", "Enviar proposta final", "Responsável Ana · prazo interno um dia antes.", "Em preparação", "2026-07-28")],
  resourceSeed: [resource("CERT-01", "LIC-088", "Certidão federal", "Regularidade fiscal", "Receita Federal", "Vigente", "2026-09-15")],
  highlights: ["Oportunidades acompanhadas", "Prazos ativos", "Processos encerrados"], primaryAction: "Nova licitação",
};

const gaia: VerticalConfig = {
  slug: "gaia", icon: "spark", entityLabel: "Safra", entityPlural: "Safras", entityDescription: "Propriedades, áreas, culturas e diário de campo sem estoque de insumos ou produção.",
  operationLabel: "Atividade de campo", operationPlural: "Atividades de campo", resourceLabel: "Área", resourcePlural: "Áreas e máquinas",
  statuses: ["Planejada", "Em preparação", "Plantada", "Em desenvolvimento", "Em colheita", "Concluída"], operationStatuses: ["Planejada", "Executada", "Com observação", "Reprogramada", "Cancelada"], resourceStatuses: ["Ativa", "Em manutenção", "Indisponível", "Arquivada"],
  fields: [
    { key: "farm", label: "Fazenda ou unidade" }, { key: "crop", label: "Cultura" }, { key: "variety", label: "Variedade" }, { key: "area", label: "Talhão ou área" },
    { key: "hectares", label: "Área utilizada (ha)", type: "number" }, { key: "start", label: "Início previsto", type: "date" }, { key: "end", label: "Término previsto", type: "date" },
    { key: "goal", label: "Meta de produção" }, { key: "technical", label: "Responsável técnico" },
  ],
  seed: [
    record("SAF-026", "Safra de milho 2026", "Fazenda Horizonte · Talhão 4", "Em desenvolvimento", "João", { farm: "Fazenda Horizonte", crop: "Milho", variety: "AG 8700", area: "Talhão 4", hectares: "42", start: "2026-03-12", end: "2026-08-30", goal: "7.800 kg/ha", technical: "Eng. Agr. João Lima" }),
    record("SAF-025", "Ciclo de tomate estufa 2", "Unidade Sul · Estufa 2", "Plantada", "Carla", { farm: "Unidade Sul", crop: "Tomate", variety: "Italiano", area: "Estufa 2", hectares: "1.2", start: "2026-07-10", end: "2026-10-20", goal: "48 t", technical: "Carla Souza" }),
  ],
  relatedSeed: [related("CAM-102", "SAF-026", "Inspeção de desenvolvimento", "Germinação uniforme; observar umidade na borda norte.", "Com observação", "2026-07-22")],
  resourceSeed: [resource("AREA-04", "SAF-026", "Talhão 4", "Área produtiva", "42 hectares", "Ativa", "")],
  highlights: ["Safras ativas", "Ações de campo", "Ciclos concluídos"], primaryAction: "Nova safra",
};

const pegasus: VerticalConfig = {
  slug: "pegasus", icon: "user", entityLabel: "Pet", entityPlural: "Pets", entityDescription: "Cadastro do animal, agenda de serviços, hospedagem, vacinas e histórico de cuidados.",
  operationLabel: "Atendimento", operationPlural: "Agenda e atendimentos", resourceLabel: "Registro", resourcePlural: "Vacinas e documentos",
  statuses: ["Ativo", "Aguardando chegada", "Em atendimento", "Aguardando retirada", "Concluído"], operationStatuses: ["Solicitado", "Confirmado", "Pet recebido", "Em atendimento", "Pronto", "Concluído", "Cancelado"], resourceStatuses: ["Apresentado", "Vigente", "Próximo do vencimento", "Vencido", "Pendente"],
  fields: [
    { key: "tutor", label: "Tutor" }, { key: "contact", label: "Contato" }, { key: "species", label: "Espécie", type: "select", options: ["Cão", "Gato", "Ave", "Outro"] }, { key: "breed", label: "Raça" },
    { key: "birth", label: "Nascimento", type: "date" }, { key: "size", label: "Porte", type: "select", options: ["Pequeno", "Médio", "Grande"] }, { key: "weight", label: "Peso" },
    { key: "behavior", label: "Comportamento e manejo", type: "textarea", wide: true }, { key: "restrictions", label: "Alergias e restrições informadas", type: "textarea", wide: true },
  ],
  seed: [
    record("PET-301", "Thor", "Golden Retriever · tutor Mariana", "Aguardando chegada", "Ana", { tutor: "Mariana Costa", contact: "(94) 99999-1000", species: "Cão", breed: "Golden Retriever", birth: "2022-05-10", size: "Grande", weight: "31 kg", behavior: "Sociável; prefere secagem com baixa temperatura.", restrictions: "Tutor informa sensibilidade em ouvido esquerdo." }),
    record("PET-300", "Luna", "SRD felina · tutora Paula", "Ativo", "Carlos", { tutor: "Paula Mendes", contact: "(94) 99999-1001", species: "Gato", breed: "SRD", birth: "2023-02-18", size: "Pequeno", weight: "4,2 kg", behavior: "Manejo calmo e individual.", restrictions: "Sem restrições informadas." }),
  ],
  relatedSeed: [related("ATE-900", "PET-301", "Banho e hidratação", "Profissional Ana · retirada prevista às 16:30.", "Confirmado", "2026-07-22")],
  resourceSeed: [resource("VAC-19", "PET-301", "Vacina antirrábica", "Vacina informada", "Clínica Amigo Pet", "Vigente", "2027-03-10")],
  highlights: ["Pets ativos", "Atendimentos abertos", "Atendimentos concluídos"], primaryAction: "Novo pet",
};

const titans: VerticalConfig = {
  slug: "titans", icon: "table", entityLabel: "Obra", entityPlural: "Obras", entityDescription: "Execução física, diário, documentos, decisões e pendências sem financeiro ou estoque.",
  operationLabel: "Registro de obra", operationPlural: "Etapas e diário", resourceLabel: "Documento técnico", resourcePlural: "Projetos e documentos",
  statuses: ["Em estudo", "Em planejamento", "Mobilização", "Em execução", "Em conclusão", "Entregue"], operationStatuses: ["Planejada", "Em execução", "Atrasada", "Concluída", "Bloqueada"], resourceStatuses: ["Rascunho", "Em análise", "Vigente", "Revisar", "Aprovado"],
  fields: [
    { key: "client", label: "Cliente" }, { key: "address", label: "Endereço", wide: true }, { key: "type", label: "Tipo da obra" }, { key: "technical", label: "Responsável técnico" },
    { key: "manager", label: "Gerente da obra" }, { key: "start", label: "Início previsto", type: "date" }, { key: "end", label: "Conclusão prevista", type: "date" },
    { key: "progress", label: "Avanço físico (%)", type: "number" }, { key: "description", label: "Descrição", type: "textarea", wide: true },
  ],
  seed: [
    record("OBR-700", "Centro Administrativo Norte", "Edificação comercial · 42% concluída", "Em execução", "Eduardo", { client: "Grupo Norte", address: "Avenida Central, 300", type: "Edificação comercial", technical: "Eng. Eduardo Reis", manager: "Marcos Lima", start: "2026-02-10", end: "2027-01-30", progress: "42", description: "Construção do novo centro administrativo com três pavimentos." }),
    record("OBR-699", "Reforma Unidade Sul", "Reforma industrial · mobilização", "Mobilização", "Patrícia", { client: "Indústria Vale", address: "Distrito Industrial Sul", type: "Reforma industrial", technical: "Eng. Patrícia Melo", manager: "Carlos Souza", start: "2026-07-25", end: "2026-12-10", progress: "4", description: "Reforma de áreas operacionais e adequações técnicas." }),
  ],
  relatedSeed: [related("RDO-044", "OBR-700", "Diário de obra 22/07", "Clima seco; 28 trabalhadores; concretagem do pavimento 2.", "Concluída", "2026-07-22")],
  resourceSeed: [resource("PROJ-22", "OBR-700", "Projeto estrutural revisão 04", "Projeto estrutural", "Revisão vigente", "Vigente", "2026-07-20")],
  highlights: ["Obras ativas", "Etapas em acompanhamento", "Obras entregues"], primaryAction: "Nova obra",
};

export function AlexandriaApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={alexandria} />; }
export function OlympusApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={olympus} />; }
export function ArgusApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={argus} />; }
export function HermesApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={hermes} />; }
export function AthenaApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={athena} />; }
export function GaiaApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={gaia} />; }
export function PegasusApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={pegasus} />; }
export function TitansApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={titans} />; }
