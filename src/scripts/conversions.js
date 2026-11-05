(() => {
  // Google Ads: "Clique no Whatsapp". This measures a click, not a sent message.
  const destination = 'AW-18525878213/FT4PCOLrpbIdEMXv6YFF';

  function gtag_report_conversion(url) {
    let navigated = false;
    let timeout;
    const navigate = () => {
      if (!url || navigated) return;
      navigated = true;
      clearTimeout(timeout);
      window.location.assign(url);
    };

    // A blocked tag must never prevent a visitor from contacting SanaTech.
    if (url) timeout = setTimeout(navigate, 1000);
    try {
      window.gtag('event', 'conversion', {
        send_to: destination,
        ...(url ? {event_callback: navigate, event_timeout: 800} : {})
      });
    } catch {
      navigate();
    }
  }

  function trackWhatsAppClick(event) {
    const expectedButton = event.type === 'auxclick' ? 1 : 0;
    if (event.defaultPrevented || event.button !== expectedButton) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.protocol !== 'https:' || link.hostname !== 'wa.me' || !/^\/[1-9]\d{7,14}$/.test(link.pathname)) return;
    if (typeof window.gtag !== 'function') return;

    const sameTab = event.type === 'click' && !event.ctrlKey && !event.metaKey &&
      !event.shiftKey && !event.altKey && !link.hasAttribute('download') &&
      (!link.target || link.target === '_self');
    if (sameTab) event.preventDefault();
    // New tabs keep native behavior; same-tab links wait briefly for the event.
    gtag_report_conversion(sameTab ? link.href : undefined);
  }

  document.addEventListener('click', trackWhatsAppClick);
  document.addEventListener('auxclick', trackWhatsAppClick);
})();
