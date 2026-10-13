(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!header) return;
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.append(progress);
  let frame = null;
  const paint = () => {
    frame = null;
    if (reducedMotion.matches) return;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  const schedule = () => {
    if (!reducedMotion.matches && frame === null) frame = requestAnimationFrame(paint);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener('change', schedule);
  schedule();
})();
