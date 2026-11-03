import { createHash } from 'node:crypto';

// Permit only the exact reviewed inline blocks, rather than arbitrary inline scripts.
export function securityHeaders(html) {
  const data = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  const ads = html.match(/<script id="google-ads-config">([\s\S]*?)<\/script>/)?.[1];
  if (!data || !ads) throw Error('JSON-LD ou configuração da tag Google ausente.');
  const hashes = [data, ads].map(text => "'sha256-" + createHash('sha256').update(text).digest('base64') + "'").join(' ');
  // Google Ads origins: https://developers.google.com/tag-platform/security/guides/csp
  const googleScripts = 'https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com';
  const googleImages = googleScripts + ' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com.br';
  return {
    'Content-Security-Policy': [
      "default-src 'none'",
      `script-src 'self' ${hashes} ${googleScripts} https://googleads.g.doubleclick.net/pagead/`,
      "style-src 'self'",
      `img-src 'self' data: ${googleImages}`,
      "font-src 'self'",
      `connect-src ${googleImages} https://ad.doubleclick.net`,
      'frame-src https://www.googletagmanager.com',
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests'
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000'
  };
}
