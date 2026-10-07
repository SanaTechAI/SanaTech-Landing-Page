# Sana Tech — direção editorial v2

## Conceito

“Chega de tratar só os sintomas.” O cuidado tecnológico aparece na linguagem, no prontuário sobreposto ao hero e no percurso diagnóstico → direção → execução. A autoridade vem de critérios e escopo claros, sem credenciais, clientes ou resultados inventados. A consulta gratuita ou simbólica permanece qualificada por “conforme o caso”.

## Arquitetura dos componentes modificados

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Conteúdo/semântica | src/index.html | Wordmark, hero, prontuário, serviços assimétricos, método, etimologia, FAQ, contato |
| Conteúdo configurável | site.config.json | H1, introdução, metadados e canais |
| Sistema visual | src/styles/tokens.css | Fontes, cores, hierarquia, reset, foco e medidas fluidas |
| Composição | src/styles/components.css | Grades, superfícies, sombras, textura, breakpoints |
| Movimento | src/styles/motion.css | Perspectiva, transformações e redução de movimento |
| Comportamento | src/scripts/motion.js | Tilt limitado, entradas observadas e paralaxe sob demanda |
| Navegação | src/scripts/navigation.js | Menu e teclado, preservados |
| Entrega | scripts/build.mjs | HTML estático, fontes locais, contatos e SEO |

Os arquivos listados contêm o código integral. `dist/` é gerado com `npm run build`. O template não precisa de JavaScript para apresentar a copy, FAQ ou links.

## Tipografia e composição

- DM Serif Display: título principal, palavras editoriais e números do método.
- DM Sans: texto, controles e títulos contrastantes.
- Microtexto em caixa alta contraposto a títulos fluidos; hierarquia sem saltos de heading.
- Marinho esverdeado, papel quente, verde mineral e acento cítrico. O novo wordmark é tipográfico; logos originais ficam preservados em assets.
- Serviços com um bloco principal de IA e dois blocos deslocados no desktop. Ordem lógica mantida no mobile.
- Prontuário com fundo quase opaco, blur localizado e sombras em camadas; a legibilidade não depende do suporte a backdrop-filter.
- Textura SVG inline decorativa, sem raster adicional e sem requisição externa.

## Efeitos e acessibilidade

Tilt é um aprimoramento opcional em ponteiro preciso, limitado a 2,5°/3°. O código agenda uma atualização por frame e cancela frames pendentes na saída. A paralaxe do hero é limitada a 14,4 px; o listener é desligado quando ele sai da viewport. Mudanças na preferência de movimento e no tipo de ponteiro são respeitadas durante a sessão.

Entradas não escondem conteúdo antes da observação. JavaScript indisponível preserva leitura e interação nativa. Movimento reduzido elimina efeitos. Foco visível, Escape, menu acessível, navegação sem JS e FAQ nativo são mantidos. Não há animação infinita, som, autoplay nem scroll hijacking.

## Fontes e payload

WOFF2 locais: DM Sans regular 14.200 bytes, bold 14.348 bytes; DM Serif Display 24.744 bytes. Total: 53.292 bytes. Hero: 37.222 bytes. Arquivos TTF de origem ficam preservados; o navegador só referencia WOFF2.

Fontes obtidas de Google Fonts/Fontsource (distribuição jsDelivr). Licenças OFL em `assets/fonts/DM-Sans-LICENSE.txt` e `DM-Serif-LICENSE.txt`. O visitante não acessa Google Fonts ou CDN: todos os recursos carregam do próprio site.

## Validação e limites

Chrome: 320, 360, 390, 768 e 1440 px; sem overflow horizontal, imagens/fontes carregadas, âncoras válidas, JSON-LD parseável, menu/FAQ/teclado e leitura sem JS. Testes de hover/saída e movimento reduzido aprovados. Capturas em `.qa/`.

Não foi realizada medição Lighthouse ou de campo; não há garantia de 100 pontos. LCP, CLS e INP precisam ser medidos na hospedagem real. A versão de revisão permanece noindex porque WhatsApp, e-mail e domínio ainda não foram informados. Isso é intencional e impede uma nota SEO de produção enquanto o site estiver em revisão. A geração de produção habilita indexação e canonical após configuração.
