# SanaTech — landing page

HTML, CSS e JavaScript nativos. Node.js 22+ para gerar e servir; nenhuma dependência de produção.

## Executar

Na pasta `SanaTech-Landing-Page`:

```sh
npm run build
npm run preview
```

Abra http://127.0.0.1:4173. A saída está em `dist/`; também pode ser aberta diretamente no navegador. Depois de editar, execute novamente o build.

## Contatos e publicação

Edite `site.config.json`:
- `WHATSAPP_NUMBER`: DDI + DDD + número; por exemplo, somente dígitos. Não foi fornecido.
- `CONTACT_EMAIL`: e-mail real. Não foi fornecido.
- `INSTAGRAM_URL`: URL HTTPS do perfil real. Não foi fornecida.
- `url`: endereço HTTPS definitivo do site, para canonical e sitemap.

Campos de contato vazios geram links para `#contato`, com indicação de canal em preparação. Os CTAs dos planos enviam mensagens específicas pelo WhatsApp quando preenchido. Sem WhatsApp, apontam para a seção com os demais canais disponíveis.

`npm run build` gera uma revisão com `noindex`. Para publicar após configurar domínio e ao menos um contato, execute `npm run build:production` e hospede `dist/`. A versão de produção gera canonical, robots e sitemap. Os valores de consultoria são separados da implementação e da manutenção. Não existe formulário, envio de dados ou rastreamento.

## Estrutura

- `src/index.html`: conteúdo semântico completo, serviços, cinco etapas, preços e CTAs.
- `src/styles/tokens.css`: fontes locais, paleta e estilos básicos.
- `src/styles/components.css`: layout e responsividade.
- `src/styles/motion.css`: preferência por movimento reduzido.
- `src/scripts/navigation.js`: menu e teclado.
- `src/scripts/motion.js`: geometria neural xyz, projeção em perspectiva e deslocamento de câmera pela rolagem, renderizados em Canvas 2D sem bibliotecas externas. Textos permanecem em HTML.
- `scripts/build.mjs`: validação de contatos, metadados e geração estática.
- `scripts/verify.mjs`: testes funcionais no navegador.

## Acessibilidade e desempenho

Conteúdo legível sem JavaScript; skip link, foco visível e menu operável por teclado. Fontes locais: Space Grotesk variável nos títulos e DM Sans nos textos; marca WebP, resolução do canvas limitada a 1,5x. Sem animação contínua: desenhos solicitados pela rolagem/resize. Em celular, economia de dados, hardware limitado e movimento reduzido, usa composição estática. Sem suporte a Canvas, uma alternativa leve aparece e todo o conteúdo continua acessível.

## Testes

Com Playwright e Chrome disponíveis, inicie a prévia e execute `npm test`. Se Playwright estiver em um runtime externo, configure `PLAYWRIGHT_PATH` com o caminho do pacote. `TEST_URL` permite testar a saída via URL `file:///` quando o acesso localhost for restrito.

Cobertura: 12 larguras de 320 a 1920 px, ampliação de texto de 200% em 320/768/1440 px, carregamento da Space Grotesk, overflow, imagens, menu/Escape/foco, cinco etapas de câmera, âncoras, contatos vazios/preenchidos, rejeição de URL inválida, movimento reduzido, sem JavaScript/Canvas e JSON-LD. Não foi realizada auditoria Lighthouse; não se atribui nota de desempenho ou certificação WCAG.

## Pendência da marca

Não foram encontrados `image-gen-1.png`, `image-gen-1(1).png`, `image-gen-1(2).png` ou `image-gen-1(3).png` no projeto, anexos ou pastas verificadas. Foi preservado `assets/brand.webp`, derivado já existente da marca `sanaTechLogo.png`, sem redesenho ou deformação. A escolha entre os dois ícones minimalistas depende de disponibilizar esses arquivos.
