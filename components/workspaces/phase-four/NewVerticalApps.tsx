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
  slug: "alexandria",
  icon: "document",
  entityLabel: "Obra",
  entityPlural: "Acervo",
  entityDescription: "Obras, exemplares e circulação em uma rotina simples para bibliotecas pequenas.",
  operationLabel: "Circulação",
  operationPlural: "Empréstimos e reservas",
  resourceLabel: "Exemplar",
  resourcePlural: "Exemplares",
  statuses: ["Em catalogação", "Disponível", "Sem exemplar disponível", "Arquivada"],
  operationStatuses: ["Reservado", "Aguardando retirada", "Emprestado", "Devolução próxima", "Atrasado", "Devolvido", "Cancelado"],
  resourceStatuses: ["Disponível", "Emprestado", "Reservado", "Danificado", "Extraviado"],
  fields: [
    { key: "authors", label: "Autor ou autores" },
    { key: "publisher", label: "Editora" },
    { key: "year", label: "Ano", type: "number" },
    { key: "isbn", label: "ISBN ou identificador" },
    { key: "category", label: "Categoria" },
    { key: "keywords", label: "Palavras-chave" },
    { key: "location", label: "Localização no acervo" },
    { key: "summary", label: "Resumo", type: "textarea", wide: true },
  ],
  seed: [
    record("OBR-001", "Dom Casmurro", "Machado de Assis · 2 exemplares", "Disponível", "Lívia", { authors: "Machado de Assis", publisher: "Editora Nacional", year: "1899", isbn: "978-85-0001", category: "Literatura brasileira", keywords: "romance, clássico", location: "Estante A · Prateleira 2", summary: "Romance brasileiro disponível para circulação." }),
    record("OBR-002", "Introdução à Engenharia", "Acervo acadêmico · 1 exemplar", "Sem exemplar disponível", "Rafael", { authors: "Autores diversos", publisher: "Atlas", year: "2024", isbn: "978-85-0002", category: "Engenharia", keywords: "engenharia, graduação", location: "Estante C · Prateleira 1", summary: "Material de apoio aos cursos introdutórios." }),
  ],
  relatedSeed: [related("EMP-014", "OBR-001", "Empréstimo para Ana Souza", "Leitora ativa · devolução prevista em 29/07", "Emprestado", "2026-07-22")],
  resourceSeed: [
    resource("EX-001", "OBR-001", "Exemplar 001", "Livro", "Estante A · Prateleira 2", "Emprestado", "2026-07-29"),
    resource("EX-002", "OBR-001", "Exemplar 002", "Livro", "Estante A · Prateleira 2", "Disponível", ""),
  ],
  metrics: [
    { label: "obras no acervo", helper: "Títulos ativos", source: "records", excludeStatuses: ["Arquivada"] },
    { label: "circulações abertas", helper: "Reservas e empréstimos", source: "operations", excludeStatuses: ["Devolvido", "Cancelado"] },
    { label: "exemplares disponíveis", helper: "Prontos para empréstimo", source: "resources", statuses: ["Disponível"] },
  ],
  primaryAction: "Nova obra",
  linearFlow: false,
  allowDuplicate: false,
};

const olympus: VerticalConfig = {
  slug: "olympus",
  icon: "home",
  entityLabel: "Imóvel",
  entityPlural: "Imóveis",
  entityDescription: "Imóveis, interessados, visitas e propostas sem transformar a rotina em um CRM genérico.",
  operationLabel: "Atendimento",
  operationPlural: "Visitas e propostas",
  resourceLabel: "Interessado",
  resourcePlural: "Interessados compatíveis",
  statuses: ["Em captação", "Aguardando informações", "Disponível", "Em negociação", "Indisponível", "Negócio concluído"],
  operationStatuses: ["Contato recebido", "Visita solicitada", "Visita confirmada", "Visita realizada", "Proposta enviada", "Contraproposta", "Aceita", "Recusada", "Cancelada"],
  resourceStatuses: ["Novo", "Em atendimento", "Visita marcada", "Proposta aberta", "Sem interesse", "Concluído"],
  fields: [
    { key: "purpose", label: "Finalidade", type: "select", options: ["Venda", "Aluguel", "Venda ou aluguel"] },
    { key: "type", label: "Tipo", type: "select", options: ["Casa", "Apartamento", "Terreno", "Sala comercial", "Loja", "Galpão", "Fazenda", "Chácara"] },
    { key: "address", label: "Endereço", wide: true },
    { key: "ownerName", label: "Proprietário" },
    { key: "ownerContact", label: "Contato do proprietário" },
    { key: "area", label: "Área" },
    { key: "rooms", label: "Quartos" },
    { key: "parking", label: "Vagas" },
    { key: "announcedValue", label: "Valor de referência" },
    { key: "visitConditions", label: "Condições para visita" },
    { key: "keyLocation", label: "Local das chaves" },
    { key: "description", label: "Descrição do imóvel", type: "textarea", wide: true },
  ],
  seed: [
    record("IMO-204", "Apartamento Jardim Europa", "Venda · 3 quartos · 2 vagas", "Disponível", "Carla", { purpose: "Venda", type: "Apartamento", address: "Rua das Palmeiras, 140", ownerName: "Renato Alves", ownerContact: "(94) 99999-2100", area: "118 m²", rooms: "3", parking: "2", announcedValue: "R$ 780.000", visitConditions: "Agendar com 24 horas", keyLocation: "Com a corretora Carla", description: "Apartamento com varanda e área de lazer." }),
    record("IMO-203", "Galpão Distrito Industrial", "Aluguel · 1.400 m²", "Em negociação", "Marcos", { purpose: "Aluguel", type: "Galpão", address: "Distrito Industrial, lote 18", ownerName: "Grupo Norte", ownerContact: "Fábio · (94) 98888-3000", area: "1.400 m²", rooms: "", parking: "Pátio de manobra", announcedValue: "R$ 24.000/mês", visitConditions: "Visitas pela manhã", keyLocation: "Imobiliária", description: "Galpão com docas e pátio de manobra." }),
  ],
  relatedSeed: [related("VIS-088", "IMO-204", "Visita com Juliana Mendes", "Gostou da localização; próxima ação é preparar proposta.", "Visita realizada", "2026-07-22")],
  resourceSeed: [resource("INT-019", "IMO-204", "Juliana Mendes", "Compra", "Até R$ 800 mil · 3 quartos", "Proposta aberta", "2026-07-25")],
  metrics: [
    { label: "imóveis disponíveis", helper: "Prontos para atendimento", source: "records", statuses: ["Disponível"] },
    { label: "visitas e propostas abertas", helper: "Próximas decisões", source: "operations", excludeStatuses: ["Aceita", "Recusada", "Cancelada"] },
    { label: "interessados em atendimento", helper: "Com próximo passo", source: "resources", excludeStatuses: ["Sem interesse", "Concluído"] },
  ],
  primaryAction: "Novo imóvel",
  linearFlow: false,
};

const argus: VerticalConfig = {
  slug: "argus",
  icon: "tag",
  entityLabel: "Bem",
  entityPlural: "Bens",
  entityDescription: "Localização, responsável, condição e histórico de cada patrimônio.",
  operationLabel: "Movimentação",
  operationPlural: "Movimentações e manutenções",
  resourceLabel: "Documento",
  resourcePlural: "Termos e garantias",
  statuses: ["Disponível", "Em uso", "Emprestado", "Em manutenção", "Não localizado", "Baixado"],
  operationStatuses: ["Agendada", "Aguardando entrega", "Entregue", "Em manutenção", "Aguardando devolução", "Devolvido", "Concluída", "Cancelada"],
  resourceStatuses: ["Pendente", "Vigente", "Vencendo", "Vencido", "Sem documento"],
  fields: [
    { key: "assetNumber", label: "Número patrimonial" },
    { key: "category", label: "Categoria" },
    { key: "brandModel", label: "Marca e modelo" },
    { key: "serial", label: "Número de série" },
    { key: "location", label: "Localização", wide: true },
    { key: "holder", label: "Responsável atual" },
    { key: "condition", label: "Condição", type: "select", options: ["Novo", "Bom", "Regular", "Danificado"] },
    { key: "acquisition", label: "Data de aquisição", type: "date" },
    { key: "warranty", label: "Garantia até", type: "date" },
    { key: "notes", label: "Observações", type: "textarea", wide: true },
  ],
  seed: [
    record("PAT-1082", "Notebook Dell Latitude", "Tecnologia · Administrativo", "Em uso", "Fernanda", { assetNumber: "0001082", category: "Computador", brandModel: "Dell Latitude 5440", serial: "DL5440-8891", location: "Matriz · Administrativo", holder: "Fernanda Lima", condition: "Bom", acquisition: "2025-02-10", warranty: "2027-02-10", notes: "Termo de responsabilidade assinado." }),
    record("PAT-1074", "Furadeira industrial", "Ferramenta · Oficina", "Em manutenção", "Carlos", { assetNumber: "0001074", category: "Ferramenta", brandModel: "Bosch GSB", serial: "B-99382", location: "Unidade Sul · Oficina", holder: "Carlos", condition: "Regular", acquisition: "2023-06-12", warranty: "", notes: "Aguardando retorno da manutenção." }),
  ],
  relatedSeed: [related("MOV-311", "PAT-1082", "Entrega para Fernanda Lima", "Responsabilidade confirmada e localização atualizada.", "Entregue", "2026-07-18")],
  resourceSeed: [resource("TER-19", "PAT-1082", "Termo de responsabilidade", "Termo", "Fernanda Lima", "Vigente", "")],
  metrics: [
    { label: "bens em operação", helper: "Ainda ativos", source: "records", excludeStatuses: ["Baixado"] },
    { label: "movimentações abertas", helper: "Entregas, devoluções e manutenção", source: "operations", excludeStatuses: ["Concluída", "Cancelada"] },
    { label: "documentos com atenção", helper: "Pendentes ou vencendo", source: "resources", statuses: ["Pendente", "Vencendo", "Vencido"] },
  ],
  primaryAction: "Novo bem",
  linearFlow: false,
  allowDuplicate: false,
};

const hermes: VerticalConfig = {
  slug: "hermes",
  icon: "calendar",
  entityLabel: "Evento",
  entityPlural: "Eventos",
  entityDescription: "Planejamento, convidados, fornecedores, tarefas e presença para eventos de pequeno porte.",
  operationLabel: "Tarefa",
  operationPlural: "Tarefas e fornecedores",
  resourceLabel: "Convidado",
  resourcePlural: "Convidados e presença",
  statuses: ["Em planejamento", "Convites enviados", "Em preparação", "Em realização", "Encerrado", "Cancelado"],
  operationStatuses: ["Pendente", "Confirmada", "Em andamento", "Aguardando fornecedor", "Atrasada", "Concluída", "Cancelada"],
  resourceStatuses: ["Sem resposta", "Confirmado", "Não participará", "Acompanhante confirmado", "Presente", "Ausente"],
  fields: [
    { key: "category", label: "Tipo", type: "select", options: ["Aniversário", "Casamento", "Confraternização", "Treinamento", "Palestra", "Feira pequena", "Cerimônia", "Outro"] },
    { key: "client", label: "Cliente ou responsável" },
    { key: "contact", label: "Contato" },
    { key: "date", label: "Data", type: "date" },
    { key: "startTime", label: "Horário" },
    { key: "location", label: "Local" },
    { key: "capacity", label: "Capacidade", type: "number" },
    { key: "expectedGuests", label: "Convidados previstos", type: "number" },
    { key: "checkin", label: "Forma de recepção" },
    { key: "notes", label: "Orientações importantes", type: "textarea", wide: true },
  ],
  seed: [
    record("EVE-042", "Aniversário de 40 anos", "Salão Primavera · 120 convidados", "Convites enviados", "Juliana", { category: "Aniversário", client: "Mariana Costa", contact: "(94) 99999-8000", date: "2026-08-14", startTime: "19:00", location: "Salão Primavera", capacity: "150", expectedGuests: "120", checkin: "Lista nominal na recepção", notes: "Separar mesa para idosos e registrar restrições alimentares." }),
    record("EVE-041", "Treinamento da equipe", "Auditório Norte · 55 pessoas", "Em planejamento", "Ricardo", { category: "Treinamento", client: "Comercial Norte", contact: "Ricardo · (94) 98888-2000", date: "2026-09-03", startTime: "08:00", location: "Auditório Norte", capacity: "80", expectedGuests: "55", checkin: "Confirmação pelo nome", notes: "Coffee break às 10:00." }),
  ],
  relatedSeed: [related("TAR-121", "EVE-042", "Confirmar buffet", "Fornecedor Sabor & Arte · retorno prometido para hoje.", "Aguardando fornecedor", "2026-07-22")],
  resourceSeed: [resource("CON-888", "EVE-042", "Mariana Alves", "Convidada", "2 pessoas · restrição a lactose", "Confirmado", "2026-08-14")],
  metrics: [
    { label: "eventos ativos", helper: "Em preparação ou realização", source: "records", excludeStatuses: ["Encerrado", "Cancelado"] },
    { label: "tarefas abertas", helper: "O que ainda exige ação", source: "operations", excludeStatuses: ["Concluída", "Cancelada"] },
    { label: "convidados confirmados", helper: "Presenças esperadas", source: "resources", statuses: ["Confirmado", "Acompanhante confirmado", "Presente"] },
  ],
  primaryAction: "Novo evento",
  linearFlow: false,
};

const athena: VerticalConfig = {
  slug: "athena",
  icon: "clipboard",
  entityLabel: "Oportunidade",
  entityPlural: "Licitações",
  entityDescription: "Triagem, documentos, proposta e prazos para pequenas empresas participarem sem perder etapas.",
  operationLabel: "Etapa",
  operationPlural: "Checklist e prazos",
  resourceLabel: "Documento",
  resourcePlural: "Documentos da empresa",
  statuses: ["Nova oportunidade", "Em triagem", "Não participar", "Preparando proposta", "Proposta enviada", "Em sessão", "Habilitação", "Vencedora", "Perdida", "Cancelada"],
  operationStatuses: ["Pendente", "Em preparação", "Aguardando informação", "Enviado", "Concluído", "Não se aplica", "Atrasado"],
  resourceStatuses: ["Pendente", "Vigente", "Vencendo", "Vencido", "Não se aplica"],
  fields: [
    { key: "number", label: "Número" },
    { key: "agency", label: "Órgão" },
    { key: "modality", label: "Modalidade" },
    { key: "location", label: "Local de entrega" },
    { key: "portal", label: "Portal oficial" },
    { key: "session", label: "Data da sessão", type: "date" },
    { key: "deadline", label: "Prazo da proposta", type: "date" },
    { key: "estimated", label: "Valor estimado informativo" },
    { key: "deliveryViable", label: "Prazo de entrega viável?", type: "select", options: ["A conferir", "Sim", "Não"] },
    { key: "documentsReady", label: "Documentação disponível?", type: "select", options: ["A conferir", "Sim", "Parcial", "Não"] },
    { key: "risks", label: "Riscos e pontos de atenção", type: "textarea", wide: true },
    { key: "object", label: "Objeto", type: "textarea", wide: true },
  ],
  seed: [
    record("LIC-088", "Pregão eletrônico 042/2026", "Prefeitura Municipal · equipamentos", "Preparando proposta", "Ana", { number: "042/2026", agency: "Prefeitura Municipal", modality: "Pregão eletrônico", location: "Sede do município", portal: "PNCP / portal do órgão", session: "2026-07-30", deadline: "2026-07-29", estimated: "R$ 240.000", deliveryViable: "Sim", documentsReady: "Parcial", risks: "Confirmar prazo de entrega e comprovação técnica do item 4.", object: "Fornecimento de equipamentos conforme edital e anexos." }),
    record("LIC-087", "Concorrência 011/2026", "Secretaria Estadual · serviços", "Em triagem", "Paulo", { number: "011/2026", agency: "Secretaria Estadual", modality: "Concorrência", location: "Capital", portal: "PNCP", session: "2026-08-12", deadline: "2026-08-10", estimated: "R$ 1.100.000", deliveryViable: "A conferir", documentsReady: "A conferir", risks: "Revisar capacidade técnica exigida.", object: "Contratação de serviços técnicos especializados." }),
  ],
  relatedSeed: [related("PRA-22", "LIC-088", "Enviar proposta final", "Responsável Ana · prazo interno um dia antes.", "Em preparação", "2026-07-28")],
  resourceSeed: [resource("CERT-01", "LIC-088", "Certidão federal", "Regularidade fiscal", "Receita Federal", "Vigente", "2026-09-15")],
  metrics: [
    { label: "oportunidades em análise", helper: "Decisão ainda aberta", source: "records", statuses: ["Nova oportunidade", "Em triagem"] },
    { label: "prazos que exigem ação", helper: "Etapas abertas ou atrasadas", source: "operations", statuses: ["Pendente", "Em preparação", "Aguardando informação", "Atrasado"] },
    { label: "documentos com atenção", helper: "Pendentes, vencendo ou vencidos", source: "resources", statuses: ["Pendente", "Vencendo", "Vencido"] },
  ],
  primaryAction: "Nova oportunidade",
  linearFlow: false,
};

const gaia: VerticalConfig = {
  slug: "gaia",
  icon: "spark",
  entityLabel: "Ciclo produtivo",
  entityPlural: "Produções",
  entityDescription: "Cultivos e criações organizados por ciclo, atividade, ocorrência e resultado.",
  operationLabel: "Registro de campo",
  operationPlural: "Atividades e ocorrências",
  resourceLabel: "Área ou grupo",
  resourcePlural: "Áreas e grupos",
  statuses: ["Planejado", "Em preparação", "Em produção", "Produção prevista", "Concluído", "Interrompido"],
  operationStatuses: ["Planejada", "Executada", "Com observação", "Ocorrência aberta", "Em acompanhamento", "Resolvida", "Reprogramada", "Cancelada"],
  resourceStatuses: ["Disponível", "Em produção", "Em recuperação", "Indisponível", "Arquivado"],
  fields: [
    { key: "productionType", label: "Tipo de produção", type: "select", options: ["Cultivo", "Criação animal"] },
    { key: "property", label: "Propriedade ou unidade" },
    { key: "areaGroup", label: "Área, canteiro, viveiro ou grupo" },
    { key: "product", label: "Cultura, espécie ou produto" },
    { key: "varietyPurpose", label: "Variedade ou finalidade" },
    { key: "initialSize", label: "Área ou quantidade inicial" },
    { key: "start", label: "Início", type: "date" },
    { key: "expectedEnd", label: "Previsão de produção", type: "date" },
    { key: "currentPhase", label: "Etapa atual" },
    { key: "responsible", label: "Responsável" },
    { key: "goal", label: "Resultado esperado" },
    { key: "alerts", label: "Pontos de atenção", type: "textarea", wide: true },
  ],
  seed: [
    record("CIC-026", "Milho · Talhão 4", "Fazenda Horizonte · 42 hectares", "Em produção", "João", { productionType: "Cultivo", property: "Fazenda Horizonte", areaGroup: "Talhão 4", product: "Milho", varietyPurpose: "AG 8700", initialSize: "42 hectares", start: "2026-03-12", expectedEnd: "2026-08-30", currentPhase: "Desenvolvimento", responsible: "João Lima", goal: "7.800 kg/ha", alerts: "Observar umidade na borda norte." }),
    record("CIC-025", "Galinhas poedeiras · Grupo A", "Sítio Boa Esperança · 80 aves", "Em produção", "Francisco", { productionType: "Criação animal", property: "Sítio Boa Esperança", areaGroup: "Galinheiro 1 · Grupo A", product: "Galinhas poedeiras", varietyPurpose: "Produção de ovos", initialSize: "80 aves", start: "2026-01-10", expectedEnd: "", currentPhase: "Produção", responsible: "Francisco", goal: "60 ovos/dia", alerts: "Acompanhar consumo de água nos dias mais quentes." }),
  ],
  relatedSeed: [related("CAM-102", "CIC-026", "Inspeção de desenvolvimento", "Desenvolvimento uniforme; observar umidade na borda norte.", "Com observação", "2026-07-22")],
  resourceSeed: [
    resource("AREA-04", "CIC-026", "Talhão 4", "Área produtiva", "42 hectares", "Em produção", ""),
    resource("GRP-01", "CIC-025", "Galinheiro 1 · Grupo A", "Grupo animal", "80 aves", "Em produção", ""),
  ],
  metrics: [
    { label: "ciclos em produção", helper: "Cultivos e criações ativos", source: "records", statuses: ["Em preparação", "Em produção", "Produção prevista"] },
    { label: "registros que exigem atenção", helper: "Ocorrências e observações", source: "operations", statuses: ["Com observação", "Ocorrência aberta", "Em acompanhamento"] },
    { label: "áreas e grupos ativos", helper: "Em uso na produção", source: "resources", statuses: ["Em produção"] },
  ],
  primaryAction: "Novo ciclo",
  linearFlow: false,
};

const pegasus: VerticalConfig = {
  slug: "pegasus",
  icon: "user",
  entityLabel: "Pet",
  entityPlural: "Pets",
  entityDescription: "Agenda, preferências, segurança e histórico para banho, tosa, creche e hospedagem.",
  operationLabel: "Atendimento",
  operationPlural: "Agenda e atendimentos",
  resourceLabel: "Cuidado",
  resourcePlural: "Cuidados, planos e hospedagens",
  statuses: ["Ativo", "Atenção especial", "Inativo"],
  operationStatuses: ["Agendado", "Confirmado", "Chegou", "Aguardando", "Em atendimento", "Em finalização", "Pronto", "Entregue", "Faltou", "Cancelado"],
  resourceStatuses: ["Ativo", "Em andamento", "Atenção", "Concluído", "Vencido", "Cancelado"],
  fields: [
    { key: "tutor", label: "Tutor" },
    { key: "contact", label: "Contato" },
    { key: "emergency", label: "Contato de emergência" },
    { key: "species", label: "Espécie", type: "select", options: ["Cão", "Gato", "Ave", "Outro"] },
    { key: "breed", label: "Raça" },
    { key: "birth", label: "Nascimento aproximado", type: "date" },
    { key: "size", label: "Porte", type: "select", options: ["Pequeno", "Médio", "Grande"] },
    { key: "weight", label: "Peso aproximado" },
    { key: "pickupPerson", label: "Pessoa autorizada para retirada" },
    { key: "behavior", label: "Comportamento e manejo", type: "textarea", wide: true },
    { key: "restrictions", label: "Sensibilidades e restrições informadas", type: "textarea", wide: true },
    { key: "grooming", label: "Preferências de banho e tosa", type: "textarea", wide: true },
  ],
  seed: [
    record("PET-301", "Thor", "Golden Retriever · tutor Mariana", "Atenção especial", "Ana", { tutor: "Mariana Costa", contact: "(94) 99999-1000", emergency: "Rafael · (94) 98888-1000", species: "Cão", breed: "Golden Retriever", birth: "2022-05-10", size: "Grande", weight: "31 kg", pickupPerson: "Mariana ou Rafael", behavior: "Sociável; prefere secagem com baixa temperatura.", restrictions: "Sensibilidade informada no ouvido esquerdo.", grooming: "Manter pelagem natural e aparar patas." }),
    record("PET-300", "Luna", "SRD felina · tutora Paula", "Ativo", "Carlos", { tutor: "Paula Mendes", contact: "(94) 99999-1001", emergency: "Mesmo contato da tutora", species: "Gato", breed: "SRD", birth: "2023-02-18", size: "Pequeno", weight: "4,2 kg", pickupPerson: "Paula", behavior: "Manejo calmo e individual.", restrictions: "Sem restrições informadas.", grooming: "Banho com produto sem perfume." }),
  ],
  relatedSeed: [related("ATE-900", "PET-301", "Banho e hidratação", "Profissional Ana · retirada prevista às 16:30.", "Em atendimento", "2026-07-22")],
  resourceSeed: [resource("CUI-19", "PET-301", "Plano mensal de banho", "Plano de serviços", "2 de 4 sessões utilizadas", "Ativo", "2026-08-31")],
  metrics: [
    { label: "pets ativos", helper: "Com ficha disponível", source: "records", excludeStatuses: ["Inativo"] },
    { label: "atendimentos abertos", helper: "Ainda não entregues", source: "operations", excludeStatuses: ["Entregue", "Faltou", "Cancelado"] },
    { label: "cuidados com atenção", helper: "Hospedagens, planos ou alertas", source: "resources", statuses: ["Atenção", "Vencido"] },
  ],
  primaryAction: "Novo pet",
  linearFlow: false,
  allowDuplicate: false,
};

const titans: VerticalConfig = {
  slug: "titans",
  icon: "table",
  entityLabel: "Obra",
  entityPlural: "Obras",
  entityDescription: "Escopo, cronograma, diário, alterações e entrega para pequenas obras e reformas.",
  operationLabel: "Registro de obra",
  operationPlural: "Etapas, diário e pendências",
  resourceLabel: "Alteração",
  resourcePlural: "Alterações e documentos",
  statuses: ["Orçamento", "Em planejamento", "Em execução", "Em vistoria", "Em correção", "Entregue", "Cancelada"],
  operationStatuses: ["Planejada", "Em execução", "Aguardando cliente", "Aguardando equipe", "Atrasada", "Bloqueada", "Concluída", "Cancelada"],
  resourceStatuses: ["Solicitada", "Aguardando cliente", "Aprovada", "Recusada", "Vigente", "Substituída"],
  fields: [
    { key: "client", label: "Cliente" },
    { key: "contact", label: "Contato" },
    { key: "address", label: "Endereço", wide: true },
    { key: "type", label: "Tipo da obra" },
    { key: "responsible", label: "Responsável" },
    { key: "start", label: "Início previsto", type: "date" },
    { key: "end", label: "Conclusão prevista", type: "date" },
    { key: "progress", label: "Avanço aproximado (%)", type: "number" },
    { key: "nextStep", label: "Próxima etapa" },
    { key: "scope", label: "Escopo combinado", type: "textarea", wide: true },
    { key: "blockers", label: "Pendências e bloqueios", type: "textarea", wide: true },
  ],
  seed: [
    record("OBR-700", "Reforma da Clínica Norte", "Reforma comercial · 42% concluída", "Em execução", "Eduardo", { client: "Clínica Norte", contact: "Marina · (94) 99999-4010", address: "Avenida Central, 300", type: "Reforma comercial", responsible: "Eduardo Reis", start: "2026-06-10", end: "2026-09-30", progress: "42", nextStep: "Concluir revestimento da recepção", scope: "Reforma da recepção, pintura, iluminação e adequação de duas salas.", blockers: "Cliente precisa confirmar a cor final da recepção." }),
    record("OBR-699", "Ampliação da casa do Sr. Paulo", "Residencial · preparação", "Em planejamento", "Patrícia", { client: "Paulo Mendes", contact: "(94) 98888-4110", address: "Rua das Flores, 88", type: "Ampliação residencial", responsible: "Patrícia Melo", start: "2026-07-25", end: "2026-11-10", progress: "4", nextStep: "Confirmar medidas e liberar início", scope: "Construção de um quarto e ampliação da varanda.", blockers: "Aguardar decisão do cliente sobre a janela." }),
  ],
  relatedSeed: [related("DIA-044", "OBR-700", "Diário de 22/07", "Equipe com 6 pessoas; revestimento iniciado; sem bloqueio novo.", "Concluída", "2026-07-22")],
  resourceSeed: [resource("ALT-22", "OBR-700", "Troca do modelo de luminária", "Alteração de escopo", "Aguardando aprovação da cliente", "Aguardando cliente", "2026-07-24")],
  metrics: [
    { label: "obras ativas", helper: "Ainda não entregues", source: "records", excludeStatuses: ["Entregue", "Cancelada"] },
    { label: "etapas com atenção", helper: "Atrasos e bloqueios", source: "operations", statuses: ["Aguardando cliente", "Aguardando equipe", "Atrasada", "Bloqueada"] },
    { label: "alterações aguardando decisão", helper: "Dependem do cliente", source: "resources", statuses: ["Solicitada", "Aguardando cliente"] },
  ],
  primaryAction: "Nova obra",
  linearFlow: false,
};

export function AlexandriaApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={alexandria} />; }
export function OlympusApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={olympus} />; }
export function ArgusApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={argus} />; }
export function HermesApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={hermes} />; }
export function AthenaApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={athena} />; }
export function GaiaApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={gaia} />; }
export function PegasusApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={pegasus} />; }
export function TitansApp({ product }: { product: Product }) { return <VerticalBusinessApp product={product} config={titans} />; }
