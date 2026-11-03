# Revisão de segurança — SanaTech

Data: 02/11/2026. Escopo: fonte HTML/CSS/JavaScript, configuração, scripts de build e prévia, pacote público dist e configuração de Cloudflare Workers Static Assets.

## Resultado

Não foi identificada falha crítica explorável remotamente no código estático revisado. Isso não é garantia de ausência de vulnerabilidades nem auditoria da conta Cloudflare, do registrador, do computador ou do navegador. O domínio público não pôde ser acessado pela ferramenta nesta sessão, portanto não foram confirmados os cabeçalhos, DNS, certificado TLS ou regras atualmente em produção.

A página não possui login, banco de dados, upload, API própria nem formulário que recebe dados. Não foram encontrados scripts externos, uso de eval, inserção de dados do visitante por innerHTML ou consumo de parâmetros da URL nos scripts carregados. O package.json não declara dependências de produção. O número de WhatsApp e o e-mail são contatos públicos por decisão do projeto.

A busca por padrões comuns de chaves privadas e tokens no código/configuração não encontrou correspondências. Essa busca não substitui análise de todo o histórico Git ou auditoria das contas externas.

## Achados e correções

1. Cabeçalhos de proteção ausentes: adicionado dist/_headers, gerado pelo build para Cloudflare Workers Static Assets. A CSP restringe recursos à origem do site, permite imagens data: usadas pela logo e autoriza somente o bloco exato de JSON-LD por hash. Scripts inline arbitrários, conexões externas, frames, objetos, base URLs e submissões de formulário ficam bloqueados. Incluídos nosniff, bloqueio de incorporação em iframe, política de referência, restrições de câmera/microfone/localização/pagamento e HSTS do hostname atual. Não foi aplicado includeSubDomains nem preload.
2. Build mantinha sobras: foram observadas imagens antigas em dist. Não eram segredos, mas o mesmo comportamento poderia preservar arquivos adicionados por engano. O build agora recria apenas o diretório dist validado e copia uma lista explícita de arquivos públicos. A limpeza rejeita um dist que seja link simbólico. O script de animação antigo e fontes sem uso deixaram de entrar no pacote.
3. Substituições no build: alteradas para callbacks, evitando que sequências como $& em texto configurado sejam interpretadas como comandos de substituição. Isso é robustez no processamento da configuração local; não foi identificada uma entrada remota que explorasse esse trecho.
4. Prévia local: continua vinculada exclusivamente a 127.0.0.1, limita métodos a GET/HEAD, rejeita arquivos ocultos e entrega os cabeçalhos de proteção. Ela não deve ser usada como servidor público de produção.
5. Prevenção de exposição acidental: .gitignore ampliado para arquivos .env, .dev.vars, diretório .wrangler e arquivos de chaves privadas. Isso não remove segredos que já tenham sido versionados anteriormente.

## Validação

npm run test:security testa em Chromium, usando respostas locais com os cabeçalhos de produção e sem acessar o domínio real:

- execução de script inline arbitrário bloqueada;
- incorporação em iframe de outra origem bloqueada;
- menu, imagens, fontes, fade-in e progresso de leitura continuam funcionando, sem violações CSP para o código legítimo;
- arquivo fictício antigo removido pelo build;
- somente os arquivos da lista pública permanecem em dist.

npm test verifica layout e funcionamento geral em 12 larguras, ampliação de texto, menu/teclado, links de contato, fontes, favicons, animações, movimento reduzido e uso sem JavaScript.

## Aplicação e limites

Nenhum deploy foi realizado. Os cabeçalhos entram em vigor quando dist é publicado pelo Workers Static Assets. Abrir src/index.html diretamente por file:// não aplica cabeçalhos HTTP. Se futuramente houver um Worker que produza respostas próprias ou outro servidor de hospedagem, ele precisará aplicar cabeçalhos equivalentes; não basta manter o arquivo _headers sem suporte da plataforma.

A CSP atual bloqueia scripts e conexões externas, incluindo futuras tags de Google Ads/Analytics ou integrações inseridas pela hospedagem. Quando essas ferramentas forem implementadas, seus domínios e requisitos devem ser revisados explicitamente, mantendo a política restritiva. Links normais para WhatsApp, e-mail e Instagram continuam permitidos.

O código da landing page não impede spam, tentativas de phishing, roubo de conta por senha comprometida ou ataques de disponibilidade. Para reduzir o risco de alteração do site, use autenticação de dois fatores ou passkeys na Cloudflare, no registrador do domínio e na conta do repositório; mantenha permissões e tokens limitados ao necessário. Essas configurações não foram verificadas nem alteradas nesta revisão.

## Referências

- Cloudflare: https://developers.cloudflare.com/workers/static-assets/headers/
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy

## Atualização — instalação da tag Google Ads

A pedido do proprietário, a tag-base AW-18525878213 foi incluída no head do HTML. A CSP foi atualizada com os domínios de script, imagem, conexão e frame documentados pelo Google para Ads e com o hash exato do bloco de inicialização. Continua sem unsafe-inline/unsafe-eval e mantém bloqueio de incorporação por outras páginas. A declaração anterior sobre ausência de scripts/rastreamento externo descreve o estado anterior à instalação.

O teste de segurança usa uma resposta simulada para gtag.js e verifica a inicialização de AW-18525878213 sem transmitir eventos reais. O recebimento no Google Ads precisa ser validado após a publicação. Não foi criado evento de conversão: falta o rótulo fornecido pelo Google Ads.

Fonte: https://developers.google.com/tag-platform/security/guides/csp

Validação final com a biblioteca pública real gtag.js: identificado carregamento de script em https://googleads.g.doubleclick.net/pagead/. Esse caminho específico foi incluído em script-src, e o teste de segurança passou a cobrir esse carregamento. Requisições de medição foram interceptadas localmente; o teste não enviou conversões ao Google.
