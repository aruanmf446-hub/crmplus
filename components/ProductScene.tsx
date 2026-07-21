type SceneProps = { slug: string; label: string };

const sceneData: Record<string, { title: string; stats: string[]; rows: string[] }> = {
  atlas: { title: "Fluxo da oficina", stats: ["08 agenda", "06 serviço"], rows: ["Recepção", "OS 1048", "Entrega"] },
  ares: { title: "Orçamento #0284", stats: ["R$ 4.850", "Enviado"], rows: ["Materiais", "Serviços", "Aprovação"] },
  artemis: { title: "Pedidos em preparo", stats: ["12 abertos", "18 min"], rows: ["Mesa 08", "Cozinha", "Caixa"] },
  pandora: { title: "Satisfação do cliente", stats: ["72 NPS", "184 respostas"], rows: ["Promotores", "Neutros", "Detratores"] },
  poseidon: { title: "Funil de vendas", stats: ["24 abertas", "31% conversão"], rows: ["Qualificação", "Proposta", "Decisão"] },
  hercules: { title: "Inspeções de hoje", stats: ["18 concluídas", "03 ações"], rows: ["Inspeção", "Não conformidade", "Plano de ação"] },
};

export function ProductScene({ slug, label }: SceneProps) {
  const scene = sceneData[slug] ?? sceneData.atlas;
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
