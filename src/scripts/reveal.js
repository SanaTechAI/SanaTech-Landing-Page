(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.section-heading, .service-grid article, .difference .eyebrow, .difference h2, .difference-grid article, .process .eyebrow, .process h2, .process li, .process-note, .contact-panel > div');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
  for (const target of targets) {
    // Keep content already in view immediately readable.
    if (target.getBoundingClientRect().top < window.innerHeight - 32) continue;
    if (target.matches('article, li')) {
      const position = Array.from(target.parentElement.children).indexOf(target);
      target.style.setProperty('--reveal-delay', `${Math.min(position * 65, 195)}ms`);
    }
    target.classList.add('reveal-pending');
    observer.observe(target);
  }
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.reveal-pending');
    if (target) { target.classList.add('is-visible'); observer.unobserve(target); }
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach(target => target.classList.add('is-visible'));
  });
})();
