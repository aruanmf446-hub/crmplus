type SceneProps = { slug: string; label: string };

const sceneData: Record<string, { title: string; stats: string[]; rows: string[] }> = {
  atlas: { title: "Fluxo da oficina", stats: ["08 agenda", "06 serviço"], rows: ["Recepção", "OS 1048", "Entrega"] },
  ares: { title: "Orçamento #0284", stats: ["R$ 4.850", "Enviado"], rows: ["Escopo", "Serviços", "Aprovação"] },
  artemis: { title: "Pedidos em preparo", stats: ["12 abertos", "18 min"], rows: ["Mesa 08", "Cozinha", "Pronto"] },
  pandora: { title: "Satisfação do cliente", stats: ["72 NPS", "184 respostas"], rows: ["Promotores", "Neutros", "Detratores"] },
  poseidon: { title: "Carteira comercial", stats: ["24 abertas", "31% decisão"], rows: ["Qualificação", "Proposta", "Negociação"] },
  hercules: { title: "Inspeções de hoje", stats: ["18 concluídas", "03 ações"], rows: ["Inspeção", "Não conformidade", "Correção"] },
  zeus: { title: "Situação da frota", stats: ["14 veículos", "03 alertas"], rows: ["Disponíveis", "Em uso", "Manutenção"] },
  alexandria: { title: "Circulação do acervo", stats: ["1.284 obras", "26 empréstimos"], rows: ["Disponíveis", "Reservados", "Atrasados"] },
  olympus: { title: "Carteira de imóveis", stats: ["42 disponíveis", "06 visitas"], rows: ["Captação", "Visitas", "Negociação"] },
  argus: { title: "Mapa patrimonial", stats: ["386 bens", "08 divergências"], rows: ["Em uso", "Transferência", "Manutenção"] },
  hermes: { title: "Operação do evento", stats: ["280 inscritos", "74% presença"], rows: ["Programação", "Credenciamento", "Ocorrências"] },
  athena: { title: "Prazos da licitação", stats: ["09 abertas", "04 esta semana"], rows: ["Triagem", "Proposta", "Habilitação"] },
  gaia: { title: "Safras em andamento", stats: ["128 ha", "05 ciclos"], rows: ["Planejamento", "Campo", "Colheita"] },
  pegasus: { title: "Atendimentos do dia", stats: ["18 pets", "04 hospedados"], rows: ["Chegada", "Em atendimento", "Retirada"] },
  titans: { title: "Avanço das obras", stats: ["06 ativas", "12 pendências"], rows: ["Planejamento", "Execução", "Entrega"] },
};

export function ProductScene({ slug, label }: SceneProps) {
  const scene = sceneData[slug] ?? { title: "Operação em andamento", stats: ["Dados locais", "Fluxo ativo"], rows: ["Entrada", "Andamento", "Resultado"] };
  return (
    <div className="product-scene" role="img" aria-label={label}>
      <div className="scene-bar"><i /><i /><i /><span>{scene.title}</span></div>
      <div className="scene-content">
        <div className="scene-stats">{scene.stats.map((stat) => <b key={stat}>{stat}</b>)}</div>
        <div className="scene-rows">{scene.rows.map((row, index) => <span key={row}><i style={{ width: `${74 - index * 10}%` }} />{row}<em>{index + 2}</em></span>)}</div>
      </div>
    </div>
  );
}
