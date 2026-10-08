// Mobile menu toggle. Without JS the nav links simply wrap, as in the original design.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-links');
  if (!toggle || !menu) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  }
  function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

  toggle.addEventListener('click', function () { setOpen(!isOpen()); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', function (e) {
    if (isOpen() && !e.target.closest('.site-header')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
    if (e.matches) setOpen(false);
  });
})();
