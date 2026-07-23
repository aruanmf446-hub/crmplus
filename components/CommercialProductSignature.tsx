import type { Product } from "@/lib/apps";
import styles from "./CommercialProductSignature.module.css";

type SignatureKind =
  | "workshop"
  | "proposal"
  | "restaurant"
  | "survey"
  | "pipeline"
  | "inspection"
  | "fleet"
  | "library"
  | "property"
  | "assets"
  | "events"
  | "bids"
  | "field"
  | "pet"
  | "construction";

type SignatureConfig = {
  kind: SignatureKind;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  labels: string[];
  details: string[];
};

const signatures: Record<string, SignatureConfig> = {
  atlas: {
    kind: "workshop",
    title: "A oficina inteira em uma sequência visível.",
    description: "Recepção, avaliação, orçamento, execução e entrega permanecem ligadas ao mesmo veículo.",
    metric: "08",
    metricLabel: "atendimentos hoje",
    labels: ["Recebido", "Avaliação", "Aprovado", "Em serviço", "Entrega"],
    details: ["Saveiro · diagnóstico", "Hilux · orçamento", "Strada · revisão", "T-Cross · conferência"],
  },
  ares: {
    kind: "proposal",
    title: "A proposta é o centro da decisão.",
    description: "Escopo, itens, condições, validade e retorno do cliente aparecem sem transformar o orçamento em planilha.",
    metric: "R$ 8.450",
    metricLabel: "valor da proposta",
    labels: ["Escopo", "Itens", "Condições", "Decisão"],
    details: ["Versão 03", "Validade de 10 dias", "Aguardando cliente", "PDF pronto"],
  },
  artemis: {
    kind: "restaurant",
    title: "Salão e cozinha enxergam o mesmo pedido.",
    description: "A mesa abre a comanda, a cozinha recebe a sequência e o atendimento acompanha o tempo.",
    metric: "12 min",
    metricLabel: "tempo médio atual",
    labels: ["Mesa 04", "Mesa 08", "Balcão", "Retirada"],
    details: ["2 pratos em preparo", "1 pedido pronto", "observação registrada", "fila organizada"],
  },
  pandora: {
    kind: "survey",
    title: "A voz do cliente vira uma fila de ação.",
    description: "Notas, comentários e temas recorrentes ficam próximos de quem precisa responder e corrigir.",
    metric: "76",
    metricLabel: "NPS do período",
    labels: ["Atendimento", "Prazo", "Qualidade", "Comunicação"],
    details: ["42 promotores", "11 neutros", "7 detratores", "3 temas críticos"],
  },
  poseidon: {
    kind: "pipeline",
    title: "Toda oportunidade precisa de um próximo passo.",
    description: "O funil mostra valor, responsável, contexto e a ação que impede cada negociação de parar.",
    metric: "R$ 184 mil",
    metricLabel: "pipeline aberto",
    labels: ["Novo", "Qualificado", "Proposta", "Negociação"],
    details: ["12 oportunidades", "7 ações para hoje", "3 propostas abertas", "2 decisões próximas"],
  },
  hercules: {
    kind: "inspection",
    title: "Inspecionar, comprovar e acompanhar a correção.",
    description: "Cada resposta pode receber evidência, abrir uma não conformidade e preservar a verificação final.",
    metric: "82%",
    metricLabel: "inspeção concluída",
    labels: ["Conforme", "Não conforme", "Evidência", "Correção"],
    details: ["18 itens verificados", "2 desvios abertos", "6 fotos", "1 prazo próximo"],
  },
  zeus: {
    kind: "fleet",
    title: "Disponibilidade, motorista e manutenção no mesmo contexto.",
    description: "A frota mostra o que está rodando, o que precisa parar e quem responde por cada veículo.",
    metric: "14",
    metricLabel: "veículos operacionais",
    labels: ["Disponível", "Em uso", "Manutenção", "Documentos"],
    details: ["Hilux · Obra Norte", "Saveiro · oficina", "Strada · pátio", "2 alertas próximos"],
  },
  alexandria: {
    kind: "library",
    title: "O acervo começa pela disponibilidade real.",
    description: "Obras, exemplares, reservas, empréstimos e atrasos permanecem conectados em uma busca simples.",
    metric: "1.248",
    metricLabel: "obras disponíveis",
    labels: ["Acervo", "Reservas", "Emprestados", "Atrasados"],
    details: ["Dom Casmurro · 1 disponível", "Engenharia · reservado", "História do Pará · emprestado", "4 devoluções hoje"],
  },
  olympus: {
    kind: "property",
    title: "O imóvel certo encontra o interessado certo.",
    description: "Captação, disponibilidade, visitas e propostas ficam ligadas ao imóvel e ao atendimento.",
    metric: "38",
    metricLabel: "imóveis disponíveis",
    labels: ["Captação", "Disponível", "Visita", "Proposta"],
    details: ["Apartamento · 3 quartos", "Galpão · 1.400 m²", "Casa · visita amanhã", "2 propostas abertas"],
  },
  argus: {
    kind: "assets",
    title: "Cada bem precisa de localização e responsável.",
    description: "Identificação, condição, movimentação, manutenção e documentos aparecem em um registro auditável.",
    metric: "286",
    metricLabel: "bens ativos",
    labels: ["Patrimônio", "Local", "Responsável", "Condição"],
    details: ["0001082 · Administrativo", "0001074 · Oficina", "3 manutenções", "5 termos pendentes"],
  },
  hermes: {
    kind: "events",
    title: "O evento acontece melhor quando tudo foi confirmado antes.",
    description: "Programação, fornecedores, tarefas, convidados e presença seguem o mesmo cronograma.",
    metric: "14 ago",
    metricLabel: "próximo evento",
    labels: ["Planejamento", "Convites", "Preparação", "Realização"],
    details: ["120 convidados", "8 tarefas abertas", "buffet aguardando", "credenciamento nominal"],
  },
  athena: {
    kind: "bids",
    title: "Prazo e documentação conduzem a decisão.",
    description: "A oportunidade passa por triagem, checklist, proposta, sessão e resultado sem perder uma etapa crítica.",
    metric: "29 jul",
    metricLabel: "próximo prazo",
    labels: ["Triagem", "Documentos", "Proposta", "Sessão"],
    details: ["Pregão 042/2026", "2 certidões com atenção", "entrega viável", "proposta em preparação"],
  },
  gaia: {
    kind: "field",
    title: "Cada ciclo mostra o planejado, o realizado e o observado.",
    description: "Cultivos e criações são acompanhados por área, atividade, ocorrência e resultado esperado.",
    metric: "42 ha",
    metricLabel: "em produção",
    labels: ["Planejado", "Preparação", "Produção", "Resultado"],
    details: ["Milho · Talhão 4", "inspeção registrada", "umidade sob atenção", "produção prevista"],
  },
  pegasus: {
    kind: "pet",
    title: "O atendimento começa pela ficha individual do pet.",
    description: "Agenda, comportamento, restrições, preferências e retirada permanecem visíveis para a equipe.",
    metric: "09",
    metricLabel: "pets agendados hoje",
    labels: ["Agenda", "Chegada", "Cuidado", "Entrega"],
    details: ["Thor · atenção especial", "Luna · banho sem perfume", "2 hospedagens", "1 retirada às 16:30"],
  },
  titans: {
    kind: "construction",
    title: "Avanço, diário e decisões no mesmo retrato da obra.",
    description: "Escopo, etapas, fotos, bloqueios, alterações e vistoria acompanham a execução até a entrega.",
    metric: "42%",
    metricLabel: "avanço da obra",
    labels: ["Planejamento", "Execução", "Vistoria", "Entrega"],
    details: ["Revestimento iniciado", "6 pessoas em campo", "1 decisão do cliente", "sem bloqueio novo"],
  },
};

export function CommercialProductSignature({ product }: { product: Product }) {
  const config = signatures[product.slug] ?? signatures.poseidon;
  return (
    <section className={styles.section} data-signature={config.kind} aria-labelledby={`signature-${product.slug}`}>
      <div className="shell">
        <header className={styles.header}>
          <div>
            <h2 id={`signature-${product.slug}`}>{config.title}</h2>
            <p>{config.description}</p>
          </div>
          <div className={styles.metric}><strong>{config.metric}</strong><span>{config.metricLabel}</span></div>
        </header>
        <SignatureVisual config={config} product={product} />
      </div>
    </section>
  );
}

function SignatureVisual({ config, product }: { config: SignatureConfig; product: Product }) {
  if (config.kind === "proposal") {
    return <div className={`${styles.visual} ${styles.proposal}`}><aside>{config.labels.map((label, index) => <span key={label} className={index === 1 ? styles.active : ""}>{label}</span>)}</aside><article><small>{product.name}</small><h3>Proposta comercial</h3>{config.details.slice(0, 3).map((detail) => <p key={detail}>{detail}<b>✓</b></p>)}<footer><span>Total</span><strong>{config.metric}</strong></footer></article><div className={styles.decision}><span>Decisão do cliente</span><strong>Aguardando retorno</strong><button type="button">Registrar decisão</button></div></div>;
  }

  if (config.kind === "restaurant") {
    return <div className={`${styles.visual} ${styles.restaurant}`}><div className={styles.tables}>{config.labels.map((label, index) => <article key={label} className={index === 1 ? styles.attention : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><small>{index === 1 ? "pedido em preparo" : "atendimento ativo"}</small></article>)}</div><div className={styles.queue}><header><strong>Fila da cozinha</strong><span>ao vivo</span></header>{config.details.map((detail, index) => <p key={detail}><b>{index + 1}</b><span>{detail}</span><small>{8 + index * 3} min</small></p>)}</div></div>;
  }

  if (config.kind === "survey") {
    return <div className={`${styles.visual} ${styles.survey}`}><div className={styles.score}><strong>{config.metric}</strong><span>{config.metricLabel}</span></div><div className={styles.bars}>{config.labels.map((label, index) => <div key={label}><span>{label}</span><i><b style={{ width: `${82 - index * 13}%` }} /></i><strong>{82 - index * 13}%</strong></div>)}</div><div className={styles.comments}>{config.details.map((detail, index) => <p key={detail}><span>{index < 2 ? "+" : "!"}</span>{detail}</p>)}</div></div>;
  }

  if (config.kind === "inspection") {
    return <div className={`${styles.visual} ${styles.inspection}`}><div className={styles.checklist}>{config.labels.map((label, index) => <p key={label}><span>{index === 1 ? "!" : "✓"}</span><strong>{label}</strong><small>{config.details[index]}</small></p>)}</div><div className={styles.evidence}><header><strong>Evidências</strong><span>{config.metric}</span></header><div>{[1, 2, 3, 4].map((item) => <i key={item}>Foto {item}</i>)}</div></div></div>;
  }

  if (["library", "property", "pet"].includes(config.kind)) {
    return <div className={`${styles.visual} ${styles.cards}`} data-card-kind={config.kind}>{config.details.map((detail, index) => <article key={detail}><span>{config.labels[index] ?? config.labels.at(-1)}</span><div className={styles.cardMark}>{product.shortName.slice(0, 1)}{index + 1}</div><strong>{detail}</strong><small>{index % 2 ? "próxima ação definida" : "registro atualizado hoje"}</small></article>)}</div>;
  }

  if (["assets", "fleet", "bids"].includes(config.kind)) {
    return <div className={`${styles.visual} ${styles.dataTable}`} data-table-kind={config.kind}><header>{config.labels.map((label) => <span key={label}>{label}</span>)}</header>{config.details.map((detail, index) => <article key={detail}><strong>{detail}</strong><span>{config.labels[(index + 1) % config.labels.length]}</span><span>{index % 2 ? "Em acompanhamento" : "Regular"}</span><button type="button">Abrir</button></article>)}</div>;
  }

  if (["events", "field", "construction"].includes(config.kind)) {
    return <div className={`${styles.visual} ${styles.timeline}`} data-timeline-kind={config.kind}><div className={styles.timelineRail}>{config.labels.map((label, index) => <span key={label} className={index <= 1 ? styles.done : ""}><i />{label}</span>)}</div><article><header><span>Próxima ação</span><strong>{config.details[0]}</strong></header>{config.details.slice(1).map((detail, index) => <p key={detail}><b>{String(index + 1).padStart(2, "0")}</b>{detail}</p>)}</article></div>;
  }

  return <div className={`${styles.visual} ${styles.board}`} data-board-kind={config.kind}>{config.labels.map((label, index) => <section key={label}><header><span>{label}</span><b>{index + 2}</b></header><article><strong>{config.details[index] ?? config.details.at(-1)}</strong><p>{index % 2 ? "Responsável definido" : "Próxima ação registrada"}</p><small>Atualizado hoje</small></article></section>)}</div>;
}
