# Assets dos aplicativos CRMPlus+

Esta pasta concentra as capas, imagens e vídeos usados nos cards da tela inicial e nas páginas comerciais.

## Estrutura por aplicativo

Crie uma pasta com o `slug` do aplicativo e envie os arquivos abaixo:

```text
public/media/apps/pandora/
├── cover.webp
├── gallery-1.webp
├── gallery-2.webp
└── preview.mp4
```

A mesma estrutura vale para: `atlas`, `ares`, `artemis`, `pandora`, `poseidon`, `hercules`, `zeus`, `alexandria`, `olympus`, `argus`, `hermes`, `athena`, `gaia`, `pegasus` e `titans`.

## Padrão visual

- `cover.webp`: capa principal quadrada, proporção **1:1**, recomendado **1080 × 1080 px**.
- `gallery-1.webp` e `gallery-2.webp`: imagens quadradas que podem ser arrastadas ou trocadas pelas setas do card.
- `preview.mp4`: vídeo institucional curto, recomendado entre **6 e 15 segundos**, em MP4/H.264.
- O vídeo deve funcionar sem depender de áudio. A interface sempre inicia a reprodução no modo silencioso.
- Evite textos pequenos dentro das imagens, pois o card também será exibido em celulares.
- Mantenha cada vídeo leve para não prejudicar o carregamento da página.

A interface usa uma arte de fallback com a identidade do aplicativo enquanto algum arquivo ainda não tiver sido enviado. Portanto, os caminhos podem ser preenchidos aos poucos sem quebrar os cards.
