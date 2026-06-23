/* ── Site-wide animations: scroll reveal, page transitions, header compact ── */
(function () {

  /* ── Scroll reveal ──────────────────────────────────────── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  function observeAll() {
    document.querySelectorAll('.anim-up, .anim-fade, .anim-scale').forEach(function (el) {
      if (!el.classList.contains('is-visible')) observer.observe(el);
    });
  }

  /* Watch for dynamically added elements (JS-rendered cards, etc.) */
  var mutObs = new MutationObserver(function () { observeAll(); });
  mutObs.observe(document.body, { childList: true, subtree: true });

  /* ── Page transition ────────────────────────────────────── */
  function initPageTransition() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' ||
          href.indexOf('javascript') === 0 ||
          href.indexOf('mailto') === 0 ||
          href.indexOf('tel') === 0 ||
          link.target === '_blank') return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function () { window.location.href = href; }, 260);
    });
  }

  /* ── Header: compact on scroll + shadow ────────────────── */
  function initHeaderScroll() {
    var header = document.getElementById('main-header');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          header.classList.toggle('header-compact', window.scrollY > 55);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Cart count bounce ──────────────────────────────────── */
  function initCartWatch() {
    var count = document.getElementById('cart-count');
    if (!count) return;
    var prev = count.textContent;
    new MutationObserver(function () {
      if (count.textContent !== prev) {
        prev = count.textContent;
        count.classList.remove('count-bounce');
        void count.offsetWidth;
        count.classList.add('count-bounce');
      }
    }).observe(count, { childList: true, characterData: true, subtree: true });
  }

  /* ── Stagger children ───────────────────────────────────── */
  function staggerChildren(selector, delay) {
    document.querySelectorAll(selector).forEach(function (parent) {
      Array.from(parent.children).forEach(function (child, i) {
        child.style.transitionDelay = (i * (delay || 55)) + 'ms';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('page-enter');
    observeAll();
    initPageTransition();
    initHeaderScroll();
    initCartWatch();
    staggerChildren('.shortcuts-grid', 60);
    staggerChildren('.wizard-options', 50);
  });

  window.SiteAnimate = { observe: observeAll };
})();
