# CRM Plus

Ecossistema demonstrativo de aplicativos independentes para pequenos negócios. Cada aplicativo resolve uma rotina específica sem se transformar em ERP e sem depender dos demais.

Nesta fase, os cadastros, alterações e contas de demonstração ficam somente no navegador utilizado.

## Direção de produto

O CRM Plus foi desenhado para negócios pequenos: a oficina do bairro, o pet shop local, o pequeno produtor, o corretor independente, a biblioteca escolar e o prestador que administra poucas obras ou clientes.

Cada aplicativo deve:

- mostrar o que precisa de ação agora;
- reduzir esquecimentos, retrabalho e mensagens espalhadas;
- preservar histórico, responsáveis, prazos e evidências;
- separar informação interna do que pode ser apresentado ao cliente;
- usar a linguagem que o profissional já conhece, sem explicar o trabalho básico;
- oferecer poucas funções, mas funções completas e úteis;
- transmitir organização, clareza e confiança.

## Aplicativos

- **Atlas — Oficinas:** agenda, recepção, diagnóstico, orçamento, aprovação, execução, conferência e histórico do veículo.
- **Ares — Propostas e orçamentos:** escopo, itens, condições, validade, versões e decisão do cliente.
- **Artemis — Restaurantes:** cardápio, mesas, comandas, observações e fila da cozinha.
- **Pandora — Experiência do cliente:** pesquisas, NPS, respostas, temas e tratamento de feedbacks.
- **Poseidon — Vendas:** contatos, oportunidades, atividades, histórico e próximos passos.
- **Hercules — Inspeções:** checklists, evidências, não conformidades, correções e verificação.
- **Zeus — Gestão de frotas:** veículos, motoristas, uso, quilometragem, manutenção e documentos.
- **Alexandria — Bibliotecas:** obras, exemplares, empréstimos, renovações, reservas e devoluções.
- **Olympus — Imobiliárias:** imóveis, proprietários, interessados, visitas e propostas.
- **Argus — Patrimônio:** bens, localização, responsáveis, movimentações, manutenção e termos.
- **Hermes — Eventos:** planejamento, tarefas, fornecedores, convidados, confirmações e presença.
- **Athena — Licitações:** oportunidades, triagem, checklist, documentos, proposta, sessão e resultado.
- **Gaia — Produção rural:** ciclos de cultivo ou criação, atividades, ocorrências e produção.
- **Pegasus — Pet shops:** tutores, pets, agenda, banho e tosa, creche, hospedagem e entrega.
- **Titans — Pequenas obras:** escopo, etapas, diário, alterações, pendências, vistoria e entrega.

## Regras de escopo

- Sem cobrança, pagamento, faturamento, emissão fiscal ou movimentação financeira real.
- Sem controle de estoque.
- Sem SEO público nos ambientes internos.
- Sem disparos automáticos para WhatsApp, e-mail ou outros serviços.
- Valores exibidos são apenas referências comerciais ou registros informativos.
- Cada app é um produto independente; não existe obrigação de integração entre os aplicativos.
- Informações demonstrativas não são armazenadas no GitHub.

## Regra de qualidade

Uma informação deve ter uma única origem. Não criar duas telas ou ações para representar a mesma coisa.

Exemplos:

- agendamento futuro não é o mesmo que atendimento já recebido;
- proposta revisada deve preservar versões, não virar outro documento solto;
- não conformidade deve nascer do item reprovado;
- tarefa do cronograma não deve ser recadastrada em outra lista genérica;
- oportunidade comercial precisa ter uma próxima ação;
- alteração de obra precisa registrar a decisão do cliente.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Rotas

Cada aplicativo está disponível em `/sistemas/<nome-do-app>`, por exemplo:

- `/sistemas/atlas`
- `/sistemas/zeus`
- `/sistemas/gaia`
- `/sistemas/pegasus`
- `/sistemas/titans`

Os ambientes estão configurados como `noindex` e são usados apenas para demonstração e testes internos.
