# CRMPlus+

Vitrine e ambientes demonstrativos de seis aplicativos independentes para pequenas empresas. Nesta fase, todo cadastro, alteração e login ficam somente no navegador utilizado.

## Aplicativos

- **Atlas** — central operacional para oficina, com agenda, clientes, veículos, ordens de serviço, diagnósticos, fotos, observações, aprovação e entrega. Sem estoque.
- **Ares** — propostas e orçamentos com escopo, versões, validade e registro de aprovação ou reprovação. Sem cobrança, faturamento ou pedido comercial.
- **Artemis** — cardápio, mesas, comandas e fila da cozinha. Sem caixa, pagamento ou estoque.
- **Pandora** — NPS e pesquisas com links, respostas, indicadores, temas recorrentes e ações de melhoria.
- **Poseidon** — funil de vendas, clientes, retornos, histórico e próximos passos. Valores são apenas referências comerciais.
- **Hercules** — checklists e inspeções com evidências, não conformidades, responsáveis e correções.

## Novo modelo de experiência

Os seis ambientes seguem a mesma regra de produto: **simplicidade para executar e profundidade para gerenciar**.

- Perfis operacionais recebem uma tela direta, com tarefa atual, prioridades e uma ação principal.
- Supervisores acompanham exceções e gargalos sem abrir um dashboard completo.
- Gestão e qualidade recebem indicadores filtráveis, classificação e exportação.
- Restaurante possui experiências próprias para garçom, cozinha e gestor.
- Inspeções separa a execução sequencial do inspetor da análise de qualidade.
- Detalhes aparecem somente após a seleção de um registro.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Demonstrações

- `/sistemas/atlas`
- `/sistemas/ares`
- `/sistemas/artemis`
- `/sistemas/pandora`
- `/sistemas/poseidon`
- `/sistemas/hercules`

Cada ambiente tem identidade, arquitetura de informação e padrões operacionais próprios. Os registros demonstrativos podem ser criados, editados, duplicados e excluídos localmente.

## Limites desta fase

- Sem API, banco de dados ou autenticação externa.
- Sem armazenamento de dados no GitHub.
- Sem cobrança, pagamento, faturamento, emissão fiscal ou movimentação financeira real.
- Sem controle de estoque.
- Sem SEO público: os ambientes estão configurados como `noindex`.
- Sem envio automático para WhatsApp ou outros serviços.
