# Especificação e auditoria técnica

## Objetivo

Explicar o posicionamento da Sana Tech e levar o visitante a iniciar um diagnóstico por WhatsApp (principal) ou e-mail/Gmail (alternativo). Público: empresas que querem crescer e encontram barreiras de custo ou conhecimento tecnológico.

## Requisitos rastreáveis

| Requisito | Implementação | Verificação |
|---|---|---|
| Explicar a proposta | Hero, soluções, método e origem de Sana | Revisão editorial pelo contexto fornecido |
| Priorizar conversão | CTA hero, serviços, processo, contato e flutuantes | Destino único configurável por canal |
| Consultoria inicial acessível | Copy explica gratuidade ou valor simbólico conforme caso | FAQ diferencia implementação de consulta |
| Prova social real | Componente condicional de depoimentos autorizados | Ausente enquanto não fornecidos |
| Modularidade sem frameworks | HTML estático, CSS separado, JS somente comportamento | Build sem dependências externas |
| Responsividade | Grid, flex, breakpoints 600/800/900px | Navegador em 360, 390, 768 e 1440px |
| Links funcionais sem JS | Interpolação dos links em tempo de build | Teste com JavaScript desligado |
| Rastreabilidade | Configuração → template → dist | Produção bloqueia dados obrigatórios ausentes |

## Arquitetura semântica

`header`/`nav`, um `main`, um `h1`, seções identificadas por `aria-labelledby`, cards em `article`, processo em lista ordenada, imagem em `figure`, FAQ nativo em `details`/`summary`, rodapé em `footer`. A hierarquia h1 → h2 → h3 organiza serviços e etapas. Isso facilita interpretação do conteúdo por tecnologias assistivas e mecanismos de busca, sem promessa de ranking.

## Core Web Vitals

- LCP: hero WebP de aproximadamente 37 KB, preload e `fetchpriority=high`; fontes locais WOFF2 com `font-display: swap`, preload do display e cerca de 53 KB somados; nenhum serviço externo no carregamento.
- CLS: imagens com largura/altura declaradas e proporção reservada. Conteúdo principal presente desde o HTML inicial.
- INP: menu separado de efeitos; FAQ nativo; tilt com leitura de geometria na entrada, atualizações limitadas por requestAnimationFrame e inclinação máxima de 3 graus. Paralaxe até 14,4 px, listener passivo ativo apenas enquanto o hero está visível, em ponteiro preciso e sem preferência por movimento reduzido. Não há loop contínuo.
- CSS em três arquivos cacheáveis: tokens, componentes e movimento. Não foi duplicado CSS crítico inline; medir em produção antes de introduzir duplicação. Nenhum framework de animação.

Lighthouse e métricas de campo ainda precisam ser medidos no domínio de produção; não há garantia ou alegação de nota 100, CLS zero absoluto ou conformidade integral automática.

## Acessibilidade

Skip link, foco visível, nomes acessíveis, menu com `aria-expanded`/`aria-controls`, fechamento por Escape e foco devolvido, navegação disponível sem JS. Ícones decorativos ocultos de leitores de tela, textos alternativos nas imagens, controles com áreas de toque generosas. Preferência de movimento reduzido remove transições e rolagem suave. Cores escuras em fundos claros e texto claro nas seções escuras. A verificação funcional não substitui auditoria completa WCAG com leitor de tela.

## SEO e JSON-LD

Título, descrição, idioma pt-BR, Open Graph e Twitter. Domínio gera canonical e URLs absolutas de imagem; produção gera sitemap e permite indexação. Revisão usa noindex. Organization contém apenas nome e contatos/domínio configurados. Não inclui AggregateRating, Review ou credenciais não verificadas.

```json
{"@context":"https://schema.org","@type":"Organization","name":"Sana Tech"}
```

## Verificação realizada

Build de revisão e sintaxe JavaScript aprovados. Chrome/Playwright: 320, 360, 390, 768 e 1440 pixels, sem overflow horizontal; imagens carregadas, um h1, destinos de âncoras existentes, menu com Escape e restauração de foco, FAQ, JSON-LD válido e conteúdo/navegação com JavaScript desligado. Capturas de desktop e celular inspecionadas visualmente. Nenhum erro de página ou resposta HTTP >= 400 observado. O comando de produção recusou corretamente o build sem WhatsApp, e-mail e domínio. Não foram enviados contatos nem realizada publicação.

Refatoração v2: mesma matriz de larguras aprovada, com fontes WOFF2 carregadas; tilt ativado por ponteiro e removido na saída; alteração em tempo real para movimento reduzido remove efeitos, entradas e paralaxe. A composição editorial foi revisada em capturas mobile e desktop. Testes funcionais não medem nota Lighthouse nem Core Web Vitals de campo.

## Limites conhecidos

WhatsApp, Gmail/endereço de e-mail, domínio e depoimentos reais ainda precisam ser fornecidos. Não há envio de formulário, armazenamento de dados, analytics nem cookies adicionados pelo site. A imagem gerada é conceitual, não representa um produto entregue ou cliente. O site não foi publicado e contatos reais ainda não foram testados.
