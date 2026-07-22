"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { Product } from "@/lib/apps";
import styles from "./RedesignedWorkspace.module.css";

type Role = { id: string; label: string; mode: "operational" | "supervisor" | "analytics" };
type Metric = { label: string; value: string; hint: string; tone?: "warning" | "danger" | "positive"; filter?: string };
type RecordItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  statusTone: "neutral" | "warning" | "danger" | "positive" | "info";
  owner: string;
  nextAction: string;
  details: Array<[string, string]>;
};
type AppConfig = {
  shortTitle: string;
  workspaceTitle: string;
  operationalTitle: string;
  analyticsTitle: string;
  operationalDescription: string;
  analyticsDescription: string;
  accent: string;
  accentSoft: string;
  roles: Role[];
  primaryAction: string;
  primaryActionNoun: string;
  searchPlaceholder: string;
  nav: string[];
  metrics: Metric[];
  records: RecordItem[];
  filters: string[];
};

const appConfigs: Record<string, AppConfig> = {
  atlas: {
    shortTitle: "Atlas",
    workspaceTitle: "Oficina",
    operationalTitle: "O que precisa de atenção agora",
    analyticsTitle: "Controle da operação",
    operationalDescription: "Somente veículos com atraso, aprovação pendente ou entrega próxima.",
    analyticsDescription: "Indicadores filtráveis para acompanhar gargalos sem atrapalhar a rotina da oficina.",
    accent: "#d75b17",
    accentSoft: "#fff2e9",
    roles: [
      { id: "atendimento", label: "Atendimento", mode: "operational" },
      { id: "tecnico", label: "Técnico", mode: "supervisor" },
      { id: "gestor", label: "Gestor", mode: "analytics" },
    ],
    primaryAction: "Novo atendimento",
    primaryActionNoun: "atendimento",
    searchPlaceholder: "Buscar placa, cliente ou OS",
    nav: ["Hoje", "Atendimentos", "Clientes e veículos", "Histórico", "Relatórios"],
    metrics: [
      { label: "Aguardando cliente", value: "2", hint: "orçamentos enviados", tone: "warning", filter: "Aguardando cliente" },
      { label: "Entrega hoje", value: "3", hint: "1 exige conferência", filter: "Entrega hoje" },
      { label: "Em atraso", value: "1", hint: "parado há 2h18", tone: "danger", filter: "Em atraso" },
    ],
    records: [
      { id: "OS 1051", title: "Saveiro • TCJ9I23", subtitle: "Barros & Braga Veículos", meta: "Orçamento enviado há 2h18", status: "Aguardando cliente", statusTone: "warning", owner: "Marcos", nextAction: "Confirmar aprovação", details: [["Entrada", "Hoje, 08:42"], ["Defeito informado", "Ruído na traseira"], ["Diagnóstico", "Aguardando aprovação"], ["Responsável", "Marcos"]] },
      { id: "OS 1050", title: "T-Cross • QVA4E19", subtitle: "Fernanda Souza", meta: "Entrega prometida para 17:30", status: "Entrega hoje", statusTone: "info", owner: "Paulo", nextAction: "Realizar conferência final", details: [["Entrada", "Ontem, 14:10"], ["Serviço", "Revisão preventiva"], ["Previsão", "Hoje, 17:30"], ["Responsável", "Paulo"]] },
      { id: "OS 1048", title: "Strada • RQX7B44", subtitle: "Construtora Norte", meta: "Sem atualização há 2h18", status: "Em atraso", statusTone: "danger", owner: "Carlos", nextAction: "Atualizar diagnóstico", details: [["Entrada", "Hoje, 07:55"], ["Defeito informado", "Falha na partida"], ["Última atualização", "09:20"], ["Responsável", "Carlos"]] },
      { id: "OS 1052", title: "Nivus • SFK2C10", subtitle: "Renato Lima", meta: "Recebido há 28 minutos", status: "Em avaliação", statusTone: "neutral", owner: "Sem responsável", nextAction: "Atribuir técnico", details: [["Entrada", "Hoje, 10:52"], ["Defeito informado", "Luz de injeção"], ["Fotos", "3 anexos"], ["Responsável", "Não definido"]] },
    ],
    filters: ["Status", "Responsável", "Data de entrada", "Prioridade"],
  },
  ares: {
    shortTitle: "Ares",
    workspaceTitle: "Orçamentos",
    operationalTitle: "Propostas que precisam de acompanhamento",
    analyticsTitle: "Desempenho dos orçamentos",
    operationalDescription: "Acompanhe visualização, validade e decisão sem misturar criação com relatório.",
    analyticsDescription: "Compare períodos, responsáveis e motivos de aprovação ou reprovação.",
    accent: "#355fc4",
    accentSoft: "#edf2ff",
    roles: [
      { id: "comercial", label: "Comercial", mode: "operational" },
      { id: "revisor", label: "Revisor", mode: "supervisor" },
      { id: "gestor", label: "Gestor", mode: "analytics" },
    ],
    primaryAction: "Novo orçamento",
    primaryActionNoun: "orçamento",
    searchPlaceholder: "Buscar cliente ou orçamento",
    nav: ["Acompanhar", "Orçamentos", "Clientes", "Modelos", "Relatórios"],
    metrics: [
      { label: "Em decisão", value: "7", hint: "3 visualizados hoje", filter: "Visualizado" },
      { label: "Vencem esta semana", value: "3", hint: "revisar validade", tone: "warning", filter: "Vence em breve" },
      { label: "Solicitaram ajuste", value: "2", hint: "aguardando revisão", filter: "Ajustes" },
    ],
    records: [
      { id: "OR-132", title: "Studio Aurora", subtitle: "Projeto de mobiliário planejado", meta: "Visualizado hoje às 13:42", status: "Visualizado", statusTone: "info", owner: "Camila", nextAction: "Fazer acompanhamento", details: [["Versão", "03"], ["Validade", "8 dias"], ["Valor de referência", "R$ 18.450"], ["Responsável", "Camila"]] },
      { id: "OR-131", title: "Rota Engenharia", subtitle: "Manutenção preventiva", meta: "Vence em 4 dias", status: "Vence em breve", statusTone: "warning", owner: "Diego", nextAction: "Confirmar interesse", details: [["Versão", "01"], ["Validade", "4 dias"], ["Valor de referência", "R$ 6.980"], ["Responsável", "Diego"]] },
      { id: "OR-130", title: "Solar Norte", subtitle: "Implantação de serviço", meta: "Cliente solicitou revisão", status: "Ajustes", statusTone: "warning", owner: "Camila", nextAction: "Revisar escopo", details: [["Versão", "02"], ["Solicitação", "Alterar prazo"], ["Atualizado", "Ontem, 16:20"], ["Responsável", "Camila"]] },
      { id: "OR-129", title: "Clínica Vida", subtitle: "Serviço recorrente", meta: "Enviado há 5 dias", status: "Sem retorno", statusTone: "neutral", owner: "Lucas", nextAction: "Registrar tentativa de contato", details: [["Versão", "01"], ["Validade", "12 dias"], ["Último contato", "Há 5 dias"], ["Responsável", "Lucas"]] },
    ],
    filters: ["Período", "Status", "Responsável", "Validade"],
  },
  artemis: {
    shortTitle: "Artemis",
    workspaceTitle: "Restaurante",
    operationalTitle: "Seu turno, sem distrações",
    analyticsTitle: "Gestão do serviço",
    operationalDescription: "Cada função vê apenas o que precisa para atender, preparar ou coordenar.",
    analyticsDescription: "A gestão acompanha atrasos e ritmo do salão sem ocupar a tela de quem está atendendo.",
    accent: "#c84b36",
    accentSoft: "#fff0ec",
    roles: [
      { id: "garcom", label: "Garçom", mode: "operational" },
      { id: "cozinha", label: "Cozinha", mode: "supervisor" },
      { id: "gestor", label: "Gestor", mode: "analytics" },
    ],
    primaryAction: "Abrir comanda",
    primaryActionNoun: "comanda",
    searchPlaceholder: "Buscar mesa ou comanda",
    nav: ["Turno", "Mesas", "Comandas", "Cardápio", "Gestão"],
    metrics: [
      { label: "Comandas abertas", value: "12", hint: "4 no salão" },
      { label: "Tempo médio", value: "18 min", hint: "últimos 20 pedidos" },
      { label: "Pedido em risco", value: "1", hint: "31 min em preparo", tone: "danger", filter: "Em risco" },
    ],
    records: [
      { id: "411", title: "Mesa 03", subtitle: "3 itens • salão", meta: "31 min em preparo", status: "Em risco", statusTone: "danger", owner: "Cozinha", nextAction: "Priorizar preparo", details: [["Entrada", "19:12"], ["Itens", "3"], ["Garçom", "Ana"], ["Tempo atual", "31 min"]] },
      { id: "410", title: "Retirada", subtitle: "2 itens • balcão", meta: "Pronto há 6 minutos", status: "Pronto", statusTone: "positive", owner: "Balcão", nextAction: "Entregar pedido", details: [["Entrada", "19:20"], ["Itens", "2"], ["Cliente", "Marina"], ["Pronto desde", "19:38"]] },
      { id: "409", title: "Mesa 12", subtitle: "Sem pedido registrado", meta: "Aberta há 14 minutos", status: "Atenção", statusTone: "warning", owner: "Rafael", nextAction: "Verificar atendimento", details: [["Abertura", "19:30"], ["Pessoas", "4"], ["Garçom", "Rafael"], ["Pedidos", "Nenhum"]] },
      { id: "408", title: "Mesa 07", subtitle: "4 itens • salão", meta: "Em preparo há 12 minutos", status: "No ritmo", statusTone: "neutral", owner: "Ana", nextAction: "Aguardar preparo", details: [["Entrada", "19:26"], ["Itens", "4"], ["Garçom", "Ana"], ["Tempo atual", "12 min"]] },
    ],
    filters: ["Período", "Etapa", "Responsável", "Tipo de atendimento"],
  },
  pandora: {
    shortTitle: "Pandora",
    workspaceTitle: "NPS e qualidade",
    operationalTitle: "Comentários que precisam de tratamento",
    analyticsTitle: "O que está mudando a experiência",
    operationalDescription: "A equipe trata comentários sem precisar interpretar todo o dashboard.",
    analyticsDescription: "Dados com período, filtros, classificação e detalhamento para apoiar decisões reais.",
    accent: "#6c4bb2",
    accentSoft: "#f3effc",
    roles: [
      { id: "atendimento", label: "Atendimento", mode: "operational" },
      { id: "qualidade", label: "Qualidade", mode: "analytics" },
      { id: "gestor", label: "Gestor", mode: "analytics" },
    ],
    primaryAction: "Nova pesquisa",
    primaryActionNoun: "pesquisa",
    searchPlaceholder: "Buscar pesquisa, tema ou comentário",
    nav: ["Visão geral", "Pesquisas", "Respostas", "Comentários", "Análises"],
    metrics: [
      { label: "NPS", value: "68", hint: "últimos 30 dias", filter: "NPS" },
      { label: "Respostas", value: "486", hint: "+12% no período", tone: "positive", filter: "Respostas" },
      { label: "Comentários a tratar", value: "12", hint: "4 críticos", tone: "danger", filter: "Crítico" },
    ],
    records: [
      { id: "TEMA-01", title: "Cumprimento de prazo", subtitle: "74 menções no período", meta: "Queda de 6 pontos", status: "Crítico", statusTone: "danger", owner: "Qualidade", nextAction: "Abrir plano de ação", details: [["Período", "Últimos 30 dias"], ["Menções", "74"], ["Tendência", "-6 pontos"], ["Segmento mais afetado", "Clientes novos"]] },
      { id: "TEMA-02", title: "Atualização durante o serviço", subtitle: "58% de menções favoráveis", meta: "Melhora após ação recente", status: "Em acompanhamento", statusTone: "info", owner: "Operação", nextAction: "Medir por mais 7 dias", details: [["Período", "Últimos 30 dias"], ["Menções", "41"], ["Tendência", "+3 pontos"], ["Responsável", "Operação"]] },
      { id: "TEMA-03", title: "Clareza da explicação", subtitle: "92% de menções favoráveis", meta: "Principal ponto positivo", status: "Positivo", statusTone: "positive", owner: "Atendimento", nextAction: "Manter padrão", details: [["Período", "Últimos 30 dias"], ["Menções", "56"], ["Tendência", "+1 ponto"], ["Destaque", "Equipe de recepção"]] },
      { id: "COM-112", title: "Comentário sem classificação", subtitle: "Pesquisa pós-atendimento", meta: "Recebido hoje às 09:18", status: "Classificar", statusTone: "warning", owner: "Sem responsável", nextAction: "Aplicar tema e prioridade", details: [["Nota", "6"], ["Canal", "Link direto"], ["Cliente", "Anônimo"], ["Classificação", "Pendente"]] },
    ],
    filters: ["Período", "Pesquisa", "Segmento", "Nota", "Tema", "Responsável"],
  },
  poseidon: {
    shortTitle: "Poseidon",
    workspaceTitle: "Vendas",
    operationalTitle: "Próximas ações do dia",
    analyticsTitle: "Gestão do funil",
    operationalDescription: "O vendedor entra e já sabe quem contatar e qual é o próximo passo.",
    analyticsDescription: "O gestor analisa conversão, origem e responsável em uma área separada da rotina comercial.",
    accent: "#176f9e",
    accentSoft: "#eaf6fb",
    roles: [
      { id: "vendedor", label: "Vendedor", mode: "operational" },
      { id: "lider", label: "Líder", mode: "supervisor" },
      { id: "gestor", label: "Gestor", mode: "analytics" },
    ],
    primaryAction: "Nova oportunidade",
    primaryActionNoun: "oportunidade",
    searchPlaceholder: "Buscar cliente ou oportunidade",
    nav: ["Hoje", "Oportunidades", "Funil", "Atividades", "Relatórios"],
    metrics: [
      { label: "Retornos hoje", value: "7", hint: "2 já concluídos", filter: "Hoje" },
      { label: "Atrasados", value: "2", hint: "desde ontem", tone: "danger", filter: "Atrasado" },
      { label: "Sem próxima ação", value: "3", hint: "precisam de definição", tone: "warning", filter: "Sem próxima ação" },
    ],
    records: [
      { id: "OP-91", title: "Rota Engenharia", subtitle: "Implantação de serviço", meta: "Reunião hoje às 15:00", status: "Hoje", statusTone: "info", owner: "Camila", nextAction: "Realizar reunião", details: [["Etapa", "Proposta"], ["Potencial", "R$ 18 mil"], ["Último contato", "Ontem"], ["Responsável", "Camila"]] },
      { id: "OP-88", title: "Clínica Vida", subtitle: "Contrato recorrente", meta: "Retorno atrasado desde ontem", status: "Atrasado", statusTone: "danger", owner: "Lucas", nextAction: "Ligar para cliente", details: [["Etapa", "Negociação"], ["Potencial", "R$ 7,5 mil"], ["Último contato", "Há 4 dias"], ["Responsável", "Lucas"]] },
      { id: "OP-86", title: "Solar Norte", subtitle: "Expansão de licença", meta: "Sem data definida", status: "Sem próxima ação", statusTone: "warning", owner: "Diego", nextAction: "Definir próximo contato", details: [["Etapa", "Qualificação"], ["Potencial", "R$ 11 mil"], ["Último contato", "Há 2 dias"], ["Responsável", "Diego"]] },
      { id: "OP-84", title: "Studio Aurora", subtitle: "Projeto personalizado", meta: "Aguardando retorno do cliente", status: "Acompanhamento", statusTone: "neutral", owner: "Camila", nextAction: "Aguardar até sexta", details: [["Etapa", "Proposta"], ["Potencial", "R$ 23 mil"], ["Último contato", "Hoje"], ["Responsável", "Camila"]] },
    ],
    filters: ["Período", "Etapa", "Responsável", "Origem", "Próxima ação"],
  },
  hercules: {
    shortTitle: "Hercules",
    workspaceTitle: "Inspeções",
    operationalTitle: "Inspeções do seu turno",
    analyticsTitle: "Controle de conformidade",
    operationalDescription: "O inspetor executa uma sequência simples e registra evidências sem enfrentar um dashboard.",
    analyticsDescription: "Qualidade acompanha desvios, responsáveis, prazos e reincidência com filtros e exportação.",
    accent: "#9a7810",
    accentSoft: "#fff8dc",
    roles: [
      { id: "inspetor", label: "Inspetor", mode: "operational" },
      { id: "supervisor", label: "Supervisor", mode: "supervisor" },
      { id: "qualidade", label: "Qualidade", mode: "analytics" },
    ],
    primaryAction: "Nova inspeção",
    primaryActionNoun: "inspeção",
    searchPlaceholder: "Buscar inspeção, local ou desvio",
    nav: ["Meu turno", "Inspeções", "Pendências", "Não conformidades", "Relatórios"],
    metrics: [
      { label: "Execução do turno", value: "84%", hint: "3 de 5 concluídas" },
      { label: "Não conformidades", value: "3", hint: "1 com prazo hoje", tone: "danger", filter: "Não conformidade" },
      { label: "Conformidade", value: "94%", hint: "últimos 30 dias", tone: "positive", filter: "Conforme" },
    ],
    records: [
      { id: "NC-032", title: "Extintor sem lacre", subtitle: "Pátio principal", meta: "Prazo hoje às 17:00", status: "Não conformidade", statusTone: "danger", owner: "Marcos", nextAction: "Registrar correção", details: [["Inspeção", "Abertura diária"], ["Prioridade", "Alta"], ["Evidência", "2 fotos"], ["Responsável", "Marcos"]] },
      { id: "NC-031", title: "Etiqueta de validade ausente", subtitle: "Loja Norte", meta: "Prazo amanhã", status: "Em tratamento", statusTone: "warning", owner: "Ana", nextAction: "Anexar nova evidência", details: [["Inspeção", "Segurança semanal"], ["Prioridade", "Média"], ["Evidência", "1 foto"], ["Responsável", "Ana"]] },
      { id: "INSP-220", title: "Inspeção veículo 07", subtitle: "Checklist de saída", meta: "3 de 5 itens concluídos", status: "Em execução", statusTone: "info", owner: "João", nextAction: "Continuar checklist", details: [["Início", "Hoje, 10:15"], ["Progresso", "60%"], ["Evidências", "3 fotos"], ["Responsável", "João"]] },
      { id: "INSP-219", title: "Conferência de abertura", subtitle: "Unidade Centro", meta: "Concluída às 08:22", status: "Conforme", statusTone: "positive", owner: "Lívia", nextAction: "Nenhuma ação", details: [["Início", "Hoje, 07:58"], ["Conclusão", "08:22"], ["Conformidade", "100%"], ["Responsável", "Lívia"]] },
    ],
    filters: ["Período", "Status", "Local", "Responsável", "Prioridade", "Modelo"],
  },
};

export function RedesignedWorkspace({ product }: { product: Product }) {
  const config = appConfigs[product.slug] ?? appConfigs.atlas;
  const [roleId, setRoleId] = useState(config.roles[0].id);
  const [activeNav, setActiveNav] = useState(config.nav[0]);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(config.records[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const role = config.roles.find((item) => item.id === roleId) ?? config.roles[0];
  const isAnalytics = role.mode === "analytics";

  const visibleRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return config.records.filter((item) => {
      const matchesSearch = !normalized || [item.id, item.title, item.subtitle, item.status, item.owner].join(" ").toLowerCase().includes(normalized);
      const matchesMetric = !selectedMetric || item.status === selectedMetric || selectedMetric === "NPS" || selectedMetric === "Respostas" || selectedMetric === "Conforme";
      return matchesSearch && matchesMetric;
    });
  }, [config.records, query, selectedMetric]);

  function changeRole(nextRole: string) {
    setRoleId(nextRole);
    setSelectedMetric(null);
    setShowFilters(false);
    setSelectedRecord(config.records[0]);
  }

  function exportCsv() {
    const header = "ID,Título,Status,Responsável,Próxima ação";
    const rows = visibleRecords.map((item) => [item.id, item.title, item.status, item.owner, item.nextAction].map((value) => `"${value.replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${product.slug}-dados-filtrados.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const shellStyle = { "--accent": config.accent, "--accent-soft": config.accentSoft } as CSSProperties;

  return (
    <div className={styles.app} style={shellStyle}>
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark}><AppIcon slug={product.slug} /></span>
          <div><strong>CRMPlus+ {config.shortTitle}</strong><small>{config.workspaceTitle}</small></div>
          <button className={styles.mobileClose} type="button" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)}><Icon name="close" /></button>
        </div>

        <nav className={styles.nav} aria-label={`Navegação do ${config.workspaceTitle}`}>
          {config.nav.map((item, index) => (
            <button key={item} type="button" className={activeNav === item ? styles.navActive : ""} onClick={() => { setActiveNav(item); setMobileNavOpen(false); }}>
              <Icon name={["home", "list", "users", "history", "chart"][index] ?? "list"} />
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.localNotice}><Icon name="shield" /><span><strong>Ambiente de teste</strong><small>Dados somente neste navegador</small></span></div>
          <Link href="/" className={styles.backLink}><Icon name="arrowLeft" /> Voltar aos sistemas</Link>
        </div>
      </aside>

      {mobileNavOpen && <button type="button" aria-label="Fechar menu" className={styles.backdrop} onClick={() => setMobileNavOpen(false)} />}

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} type="button" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className={styles.topbarContext}><span>{activeNav}</span><small>{config.workspaceTitle}</small></div>
          <div className={styles.topbarActions}>
            <label className={styles.roleSelectLabel}>
              <span>Visualização</span>
              <select value={roleId} onChange={(event) => changeRole(event.target.value)}>
                {config.roles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <button className={styles.iconButton} type="button" aria-label="Ajuda"><Icon name="help" /></button>
            <span className={styles.avatar}>AM</span>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.pageHeading}>
            <div>
              <h1>{isAnalytics ? config.analyticsTitle : config.operationalTitle}</h1>
              <p>{isAnalytics ? config.analyticsDescription : config.operationalDescription}</p>
            </div>
            <button className={styles.primaryButton} type="button" onClick={() => setShowCreate(true)}><Icon name="plus" />{config.primaryAction}</button>
          </section>

          {product.slug === "artemis" && roleId === "garcom" ? (
            <WaiterView onOpen={(record) => setSelectedRecord(record)} records={config.records} />
          ) : product.slug === "artemis" && roleId === "cozinha" ? (
            <KitchenView onOpen={(record) => setSelectedRecord(record)} records={config.records} />
          ) : product.slug === "hercules" && roleId === "inspetor" ? (
            <InspectorView onOpen={(record) => setSelectedRecord(record)} records={config.records} />
          ) : (
            <>
              <section className={`${styles.metrics} ${isAnalytics ? styles.metricsAnalytics : ""}`} aria-label="Indicadores principais">
                {config.metrics.map((metric) => (
                  <button key={metric.label} type="button" className={`${styles.metric} ${metric.tone ? styles[`metric_${metric.tone}`] : ""} ${selectedMetric === metric.filter ? styles.metricSelected : ""}`} onClick={() => setSelectedMetric((current) => current === metric.filter ? null : metric.filter ?? null)}>
                    <span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.hint}</small>
                  </button>
                ))}
              </section>

              {isAnalytics && <AnalyticsSummary slug={product.slug} />}

              <section className={styles.workspaceGrid}>
                <div className={styles.listArea}>
                  <div className={styles.listToolbar}>
                    <label className={styles.searchBox}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} /></label>
                    <button type="button" className={`${styles.secondaryButton} ${showFilters ? styles.secondaryActive : ""}`} onClick={() => setShowFilters((value) => !value)}><Icon name="filter" />Filtros{selectedMetric ? <span className={styles.filterCount}>1</span> : null}</button>
                    {isAnalytics && <button type="button" className={styles.secondaryButton} onClick={exportCsv}><Icon name="download" />Exportar</button>}
                  </div>

                  {showFilters && (
                    <div className={styles.filterPanel}>
                      <div className={styles.filterPanelHead}><div><strong>Refinar resultados</strong><small>Os filtros afetam a lista e a exportação.</small></div><button type="button" onClick={() => { setSelectedMetric(null); setQuery(""); }}>Limpar</button></div>
                      <div className={styles.filterFields}>
                        {config.filters.map((filter) => <label key={filter}><span>{filter}</span><select defaultValue=""><option value="">Todos</option><option>Opção 1</option><option>Opção 2</option></select></label>)}
                      </div>
                    </div>
                  )}

                  <div className={styles.listHeader}>
                    <div><h2>{isAnalytics ? "Registros do período" : "Prioridades"}</h2><p>{visibleRecords.length} itens encontrados{selectedMetric ? ` • filtro: ${selectedMetric}` : ""}</p></div>
                    <button type="button" className={styles.textButton}>Ver lista completa <Icon name="arrowRight" /></button>
                  </div>

                  <div className={styles.recordList}>
                    {visibleRecords.length ? visibleRecords.map((item) => (
                      <button key={item.id} type="button" className={`${styles.recordRow} ${selectedRecord?.id === item.id ? styles.recordSelected : ""}`} onClick={() => setSelectedRecord(item)}>
                        <div className={styles.recordPrimary}><span className={styles.recordId}>{item.id}</span><strong>{item.title}</strong><small>{item.subtitle}</small></div>
                        <div className={styles.recordMeta}><span>{item.meta}</span><small>{item.nextAction}</small></div>
                        <Status tone={item.statusTone}>{item.status}</Status>
                        <Icon name="chevronRight" />
                      </button>
                    )) : (
                      <div className={styles.emptyState}><Icon name="search" /><strong>Nenhum resultado encontrado</strong><p>Remova um filtro ou tente outra busca.</p><button type="button" onClick={() => { setQuery(""); setSelectedMetric(null); }}>Limpar busca</button></div>
                    )}
                  </div>
                </div>

                <DetailPanel item={selectedRecord} onClose={() => setSelectedRecord(null)} />
              </section>
            </>
          )}
        </div>
      </main>

      {showCreate && <CreateDialog title={config.primaryAction} noun={config.primaryActionNoun} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function WaiterView({ records, onOpen }: { records: RecordItem[]; onOpen: (record: RecordItem) => void }) {
  const tables = [
    { number: "01", state: "Livre", info: "Disponível" },
    { number: "03", state: "Em atendimento", info: "3 itens • 31 min" },
    { number: "05", state: "Aguardando", info: "Sem pedido • 6 min" },
    { number: "07", state: "Em atendimento", info: "4 itens • 12 min" },
    { number: "09", state: "Livre", info: "Disponível" },
    { number: "12", state: "Atenção", info: "Sem pedido • 14 min" },
  ];
  return <section className={styles.roleWorkspace}>
    <div className={styles.roleWorkspaceHead}><div><h2>Mesas do seu setor</h2><p>Toque em uma mesa para atender. Sem relatórios ou configurações nesta tela.</p></div><button className={styles.secondaryButton} type="button"><Icon name="refresh" />Atualizar</button></div>
    <div className={styles.tableGrid}>{tables.map((table) => <button type="button" key={table.number} className={`${styles.tableCard} ${table.state === "Atenção" ? styles.tableAttention : ""}`} onClick={() => onOpen(records.find((item) => item.title.includes(`Mesa ${table.number}`)) ?? records[0])}><span>Mesa</span><strong>{table.number}</strong><small>{table.info}</small><em>{table.state}</em></button>)}</div>
  </section>;
}

function KitchenView({ records, onOpen }: { records: RecordItem[]; onOpen: (record: RecordItem) => void }) {
  const columns = [
    { title: "Entraram", items: records.filter((_, index) => index > 1) },
    { title: "Em preparo", items: records.filter((item) => item.status === "Em risco" || item.status === "No ritmo") },
    { title: "Prontos", items: records.filter((item) => item.status === "Pronto") },
  ];
  return <section className={styles.kitchenBoard}>
    {columns.map((column) => <div key={column.title} className={styles.kitchenColumn}><div className={styles.kitchenColumnHead}><h2>{column.title}</h2><span>{column.items.length}</span></div>{column.items.map((item) => <button type="button" key={item.id} className={styles.kitchenTicket} onClick={() => onOpen(item)}><div><strong>{item.title}</strong><span>#{item.id}</span></div><p>{item.subtitle}</p><small>{item.meta}</small><Status tone={item.statusTone}>{item.status}</Status></button>)}</div>)}
  </section>;
}

function InspectorView({ records, onOpen }: { records: RecordItem[]; onOpen: (record: RecordItem) => void }) {
  const current = records.find((item) => item.status === "Em execução") ?? records[0];
  return <section className={styles.inspectorLayout}>
    <div className={styles.inspectionFocus}>
      <div className={styles.inspectionTop}><div><span>Inspeção atual</span><h2>{current.title}</h2><p>{current.subtitle}</p></div><strong>3 de 5</strong></div>
      <div className={styles.progress}><span style={{ width: "60%" }} /></div>
      <div className={styles.checkSteps}>
        {["Documentação conferida", "Iluminação e sinalização", "Pneus e condições externas", "Itens de segurança", "Registro final"].map((label, index) => <label key={label} className={index < 3 ? styles.checkDone : index === 3 ? styles.checkCurrent : ""}><input type="checkbox" defaultChecked={index < 3} /><span><strong>{label}</strong><small>{index < 3 ? "Concluído" : index === 3 ? "Em execução" : "Próxima etapa"}</small></span></label>)}
      </div>
      <div className={styles.inspectionActions}><button type="button" className={styles.secondaryButton}>Salvar e sair</button><button type="button" className={styles.primaryButton}>Continuar inspeção</button></div>
    </div>
    <div className={styles.shiftList}><h2>Seu turno</h2><p>Próximas inspeções, sem indicadores gerenciais.</p>{records.slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => onOpen(item)}><span><strong>{item.title}</strong><small>{item.meta}</small></span><Status tone={item.statusTone}>{item.status}</Status></button>)}</div>
  </section>;
}

function AnalyticsSummary({ slug }: { slug: string }) {
  const data: Record<string, { title: string; rows: Array<[string, string, number]> }> = {
    atlas: { title: "Tempo médio por etapa", rows: [["Avaliação", "42 min", 62], ["Aprovação", "2h18", 84], ["Execução", "3h04", 54], ["Entrega", "26 min", 38]] },
    ares: { title: "Decisão por status", rows: [["Aprovados", "48%", 48], ["Em decisão", "31%", 31], ["Reprovados", "13%", 13], ["Expirados", "8%", 8]] },
    artemis: { title: "Ritmo do serviço", rows: [["No tempo", "78%", 78], ["Atenção", "16%", 16], ["Em risco", "6%", 6]] },
    pandora: { title: "Temas mais citados", rows: [["Prazo", "74 menções", 86], ["Comunicação", "56 menções", 66], ["Clareza", "41 menções", 48], ["Atendimento", "29 menções", 34]] },
    poseidon: { title: "Distribuição do funil", rows: [["Qualificação", "9", 72], ["Proposta", "6", 52], ["Negociação", "4", 34], ["Decisão", "2", 18]] },
    hercules: { title: "Desvios por categoria", rows: [["Segurança", "8", 74], ["Documentação", "5", 48], ["Conservação", "3", 28], ["Processo", "2", 18]] },
  };
  const summary = data[slug] ?? data.atlas;
  return <section className={styles.analyticsStrip}>
    <div><h2>{summary.title}</h2><p>Selecione um indicador para filtrar os registros abaixo.</p></div>
    <div className={styles.barList}>{summary.rows.map(([label, value, width]) => <div key={label}><span><strong>{label}</strong><em>{value}</em></span><i><b style={{ width: `${width}%` }} /></i></div>)}</div>
  </section>;
}

function DetailPanel({ item, onClose }: { item: RecordItem | null; onClose: () => void }) {
  if (!item) return <aside className={styles.detailEmpty}><Icon name="pointer" /><strong>Selecione um item</strong><p>O resumo será exibido aqui sem abrir outra tela.</p></aside>;
  return <aside className={styles.detailPanel}>
    <div className={styles.detailHead}><div><span>{item.id}</span><h2>{item.title}</h2><p>{item.subtitle}</p></div><button type="button" aria-label="Fechar detalhe" onClick={onClose}><Icon name="close" /></button></div>
    <Status tone={item.statusTone}>{item.status}</Status>
    <dl>{item.details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className={styles.nextAction}><span>Próxima ação</span><strong>{item.nextAction}</strong><small>Responsável: {item.owner}</small></div>
    <div className={styles.detailActions}><button type="button" className={styles.primaryButton}>Executar próxima ação</button><button type="button" className={styles.secondaryButton}>Abrir detalhe completo</button></div>
  </aside>;
}

function CreateDialog({ title, noun, onClose }: { title: string; noun: string; onClose: () => void }) {
  const [saved, setSaved] = useState(false);
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-title">
      <div className={styles.modalHead}><div><h2 id="create-title">{title}</h2><p>Somente os dados necessários para começar.</p></div><button type="button" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button></div>
      {saved ? <div className={styles.successState}><Icon name="check" /><strong>{noun.charAt(0).toUpperCase() + noun.slice(1)} criado com sucesso</strong><p>O registro foi adicionado ao ambiente demonstrativo.</p><button type="button" className={styles.primaryButton} onClick={onClose}>Concluir</button></div> : <>
        <div className={styles.formGrid}><label><span>Título ou identificação</span><input placeholder={`Identificação do ${noun}`} autoFocus /></label><label><span>Responsável</span><select><option>Selecionar depois</option><option>Camila</option><option>Marcos</option></select></label><label className={styles.formWide}><span>Observação inicial</span><textarea rows={4} placeholder="Inclua somente o contexto necessário para começar." /></label></div>
        <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button><button type="button" className={styles.primaryButton} onClick={() => setSaved(true)}>Criar {noun}</button></div>
      </>}
    </section>
  </div>;
}

function Status({ tone, children }: { tone: RecordItem["statusTone"]; children: ReactNode }) {
  return <span className={`${styles.status} ${styles[`status_${tone}`]}`}>{children}</span>;
}

function AppIcon({ slug }: { slug: string }) {
  const names: Record<string, string> = { atlas: "tool", ares: "file", artemis: "restaurant", pandora: "message", poseidon: "target", hercules: "checklist" };
  return <Icon name={names[slug] ?? "grid"} />;
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 3 3 5-7"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
    arrowLeft: <><path d="m15 18-6-6 6-6"/><path d="M21 12H9"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    chevronRight: <path d="m9 18 6-6-6-6"/>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    help: <><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    filter: <path d="M4 5h16l-6.5 7v5l-3 2v-7L4 5Z"/>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5M5 21h14"/></>,
    refresh: <><path d="M20 11a8 8 0 1 0 2 5M20 4v7h-7"/></>,
    pointer: <><path d="m3 3 7.8 18 2.8-7.4L21 10.8 3 3Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    tool: <><path d="M14.7 6.3a4 4 0 0 0-5-5L7.4 3.6l3 3-3.8 3.8-3-3-2.3 2.3a4 4 0 0 0 5 5L14 22.4l8.4-8.4-7.7-7.7Z"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
    restaurant: <><path d="M3 2v7a3 3 0 0 0 3 3v10M6 2v20M9 2v7a3 3 0 0 1-3 3"/><path d="M18 2v20M15 2v8a3 3 0 0 0 3 3"/></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    checklist: <><path d="M9 5h11M9 12h11M9 19h11"/><path d="m3 5 1 1 2-2M3 12l1 1 2-2M3 19l1 1 2-2"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.grid}</svg>;
}
