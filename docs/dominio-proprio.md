# Domínio próprio da SanaTech

Atualizado em 02/11/2026.

URL principal: https://sanatechia.com.br/

## Preparado neste projeto

- site.config.json define a URL principal usada pelo build.
- O build atualiza canonical, Open Graph, JSON-LD, robots.txt e sitemap.xml.
- O documento google-ads-textos.md usa a nova URL final e os novos destinos dos sitelinks.
- wrangler.json prepara o Worker sanatech-landing-page para servir os arquivos de dist no domínio sanatechia.com.br. O comando de build é executado antes de um deploy pelo Wrangler.

## Ativação na Cloudflare

A configuração local não ativa o domínio na internet. Nenhum deploy ou alteração de DNS foi realizado nesta sessão.

É necessário ter o domínio como zona ativa na conta Cloudflare que possui o Worker. Confira o nome do Worker na sua conta antes da publicação; o nome usado aqui corresponde ao endereço anterior informado no projeto.

Pelo painel: Workers & Pages → selecione sanatech-landing-page → Settings → Domains & Routes → Add → Custom Domain → sanatechia.com.br.

A Cloudflare cria o registro DNS do Custom Domain. Se existir um CNAME conflitante, revise a configuração existente antes de associar o domínio. Se os servidores DNS do domínio ainda não apontarem para a zona Cloudflare, será necessário concluir essa etapa no registrador.

Após revisar e decidir publicar, use a conta Cloudflare correta para executar npx wrangler deploy. Este comando publica o build e aplica o domínio configurado. Não foi executado aqui.

A configuração atual cobre o domínio sem www, conforme solicitado. www.sanatechia.com.br é um hostname separado e não foi configurado.

## Conferência após ativar

1. Abrir https://sanatechia.com.br/ e verificar HTTPS, logo e WhatsApp.
2. Abrir https://sanatechia.com.br/robots.txt e https://sanatechia.com.br/sitemap.xml.
3. Confirmar canonical e links de compartilhamento com o novo domínio.
4. Usar https://sanatechia.com.br/ como URL final dos anúncios e revisar os sitelinks no documento atualizado.

## Fontes oficiais

- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/static-assets/get-started/
