(() => {
  'use strict';
  const button = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  if (!button || !links) return;
  const desktop = window.matchMedia('(min-width: 900px)');
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    links.hidden = !open && !desktop.matches;
  };
  const sync = () => {
    button.hidden = desktop.matches;
    setOpen(false);
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  desktop.addEventListener('change', sync);
  sync();
})();
