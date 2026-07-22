# Assets dos aplicativos CRMPlus+

Esta pasta concentra as capas, imagens e vídeos usados nos cards da tela inicial e nas páginas comerciais.

## Estrutura por aplicativo

Cada aplicativo possui uma pasta com seu `slug`:

```text
public/media/apps/pandora/
├── cover.svg
├── gallery-1.webp
├── gallery-2.webp
└── preview.mp4
```

A mesma estrutura vale para: `atlas`, `ares`, `artemis`, `pandora`, `poseidon`, `hercules`, `zeus`, `alexandria`, `olympus`, `argus`, `hermes`, `athena`, `gaia`, `pegasus` e `titans`.

## Padrão visual

- `cover.svg`: capa principal quadrada em proporção **1:1**, otimizada para permanecer nítida nos cards e nas páginas comerciais.
- `gallery-1.webp` e `gallery-2.webp`: imagens quadradas adicionais que poderão ser arrastadas ou trocadas pelas setas do card.
- `preview.mp4`: vídeo institucional curto, recomendado entre **6 e 15 segundos**, em MP4/H.264.
- O vídeo deve funcionar sem depender de áudio. A interface sempre inicia a reprodução no modo silencioso.
- Evite textos pequenos dentro das imagens, pois o card também será exibido em celulares.
- Mantenha cada vídeo leve para não prejudicar o carregamento da página.

Enquanto uma capa ainda não tiver sido enviada, a interface usa a arte de fallback com a identidade do aplicativo. Os arquivos podem ser adicionados aos poucos sem quebrar o catálogo.
