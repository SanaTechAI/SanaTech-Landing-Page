# SanaTech — landing page

Página estática em português, com foco na avaliação gratuita de 30 a 45 minutos, soluções e implementação. Sem preços, formulário ou rastreamento. Os botões abrem o aplicativo de e-mail com assunto e mensagem prontos; o visitante envia a mensagem e o horário é combinado depois.

## Revisar localmente

Requer Node.js 22+:

```sh
npm run build:production
npm run preview
```

Abra http://127.0.0.1:4173. Você também pode abrir `src/index.html` diretamente: ele contém valores reais, sem chaves de template; o build atualiza esses valores a partir da configuração e prepara os caminhos de `dist/`. `dist/` contém o build de produção com canonical, indexação, robots e sitemap. Gerar o build não publica o site. Nenhum deploy foi executado.

`npm run build` gera uma variante de revisão com noindex. Para a entrega final, use `npm run build:production`.

## Configuração

`site.config.json` contém o endereço https://sanatech-landing-page.edulazaro2008.workers.dev/ e o contato sana.tech.ai2026@gmail.com. WhatsApp e Instagram continuam opcionais: enquanto vazios, seus canais não aparecem. Se um WhatsApp for configurado com DDI + DDD + número, ele aparece como contato adicional. Os botões de avaliação continuam abrindo o e-mail. `year` fixa o ano do rodapé em 2026.

## Conteúdo e marca

- `src/index.html`: oferta, soluções, diferenciais, três etapas e contato.
- `src/styles/`: fontes locais e layout responsivo.
- `src/scripts/navigation.js`: menu, Escape e foco por teclado.
- `assets/logo-brain.png`: símbolo transparente sem texto, incorporado no HTML da navegação e do rodapé para não depender de uma requisição separada.
- `assets/favicon.ico`, `assets/favicon.svg`, `assets/favicon.png`, `assets/apple-touch-icon.png`: derivados do mesmo símbolo.
- `assets/logo-brain-source.png`: imagem original gerada para esta revisão; os arquivos de referência foram preservados.
- `scripts/build.mjs`: validação, substituição da configuração e geração em `dist/`.

Prompt final usado com a ferramenta integrada de imagem: remover todas as letras SanaTech, preservar o cérebro azul-claro, faixa azul-marinho/turquesa, refletor prateado, lâmpada amarela e base flutuante; símbolo centralizado em tela quadrada, transparente, sem texto ou elementos adicionais, para navbar e favicon.

A antiga animação em `src/scripts/motion.js` permanece como arquivo de referência, mas não é carregada pela página.

## Validação

Com Playwright e Chrome disponíveis, mantenha a prévia aberta e execute `npm test`. `PLAYWRIGHT_PATH` permite indicar um pacote externo, e `TEST_URL` muda a URL da prévia.

Os testes verificam 12 larguras de 320 a 1920 px, texto ampliado em 200%, carregamento de fontes e imagens, menu e teclado, âncoras, favicons, mensagens de e-mail, contatos opcionais, ausência de preços, metadados de produção, movimento reduzido e leitura sem JavaScript. A página foi preparada com uma oferta e chamada para ação claras; resultados de anúncios e conversões precisam ser medidos após publicação. Não há tags de Google Ads ou Analytics configuradas.
