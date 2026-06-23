(function () {

  /* ── Group badge map ─────────────────────────────────────── */
  var GROUP_LABELS = {
    monitor:                  { label: 'مانیتور',        cls: 'bg-blue' },
    panel:                    { label: 'پنل دم در',       cls: 'bg-green' },
    accessory:                { label: 'متعلقات',         cls: 'bg-gray' },
    package:                  { label: 'پکیج کامل',      cls: 'bg-orange' },
    jack:                     { label: 'جک پارکینگ',     cls: 'bg-red' },
    heater:                   { label: 'گرمایشی',        cls: 'bg-red' },
    industrial:               { label: 'صنعتی',           cls: 'bg-dark' },
    'home-appliance':         { label: 'خانگی',           cls: 'bg-blue' },
    'audio-visual':           { label: 'صوتی‌تصویری',    cls: 'bg-purple' },
    refrigerator:             { label: 'یخچال',           cls: 'bg-teal' },
    'industrial-refrigerator':{ label: 'یخچال صنعتی',   cls: 'bg-dark' },
    'main-meter':             { label: 'کنتور برق',      cls: 'bg-red' },
    stabilizer:               { label: 'استابلایزر',     cls: 'bg-purple' }
  };

  /* ── Formatters ──────────────────────────────────────────── */
  function formatPrice(value) {
    return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
  }

  function formatPriceNum(value) {
    return new Intl.NumberFormat("fa-IR").format(value);
  }

  /* ── Section Head ────────────────────────────────────────── */
  function createSectionHead(title, seeAll) {
    var head = document.createElement("div");
    head.className = "section-head";

    var left = document.createElement("div");
    left.className = "section-head-left";

    var heading = document.createElement("h3");
    heading.textContent = title;
    left.appendChild(heading);
    head.appendChild(left);

    if (seeAll && seeAll.href) {
      var link = document.createElement("a");
      link.className = "see-all-btn";
      link.href = seeAll.href;
      link.innerHTML = (seeAll.label || "مشاهده همه") + ' <i class="bi bi-arrow-left-short"></i>';
      head.appendChild(link);
    }
    return head;
  }

  /* ── Product Card ────────────────────────────────────────── */
  function createProductCard(product) {
    var item = document.createElement("article");
    item.className = "product-card anim-up";

    /* --- Image wrapper --- */
    var imgWrap = document.createElement("div");
    imgWrap.className = "product-img-wrap";

    var img = document.createElement("img");
    img.className = "product-image";
    img.src = product.image;
    img.alt = product.name;
    img.loading = "lazy";
    imgWrap.appendChild(img);

    /* --- Group badge --- */
    if (product.group && GROUP_LABELS[product.group]) {
      var badge = document.createElement("span");
      var gInfo = GROUP_LABELS[product.group];
      badge.className = "product-badge " + gInfo.cls;
      badge.textContent = gInfo.label;
      imgWrap.appendChild(badge);
    }

    /* --- Quick-view overlay --- */
    var overlay = document.createElement("div");
    overlay.className = "card-overlay";
    var quickLink = document.createElement("a");
    quickLink.href = "product.html?id=" + encodeURIComponent(product.id);
    quickLink.className = "card-overlay-btn";
    quickLink.innerHTML = '<i class="bi bi-eye"></i> مشاهده';
    overlay.appendChild(quickLink);
    imgWrap.appendChild(overlay);

    item.appendChild(imgWrap);

    /* --- Body --- */
    var body = document.createElement("div");
    body.className = "product-body";

    var title = document.createElement("h4");
    title.className = "product-title";
    title.textContent = product.name;
    body.appendChild(title);

    /* --- Price --- */
    var priceWrap = document.createElement("div");
    priceWrap.className = "product-price-wrap";
    priceWrap.innerHTML =
      '<div class="price-label">قیمت</div>' +
      '<div class="price-amount">' +
        '<span class="price-num">' + formatPriceNum(product.price) + '</span>' +
        '<span class="price-cur">تومان</span>' +
      '</div>';
    body.appendChild(priceWrap);

    /* --- Actions --- */
    var actions = document.createElement("div");
    actions.className = "product-actions";

    var detailsLink = document.createElement("a");
    detailsLink.className = "btn-outline";
    detailsLink.href = "product.html?id=" + encodeURIComponent(product.id);
    detailsLink.innerHTML = '<i class="bi bi-eye"></i><span>جزئیات</span>';
    actions.appendChild(detailsLink);

    var buyBtn = document.createElement("button");
    buyBtn.className = "btn-solid";
    buyBtn.type = "button";
    buyBtn.innerHTML = '<i class="bi bi-cart-plus"></i><span>سبد</span>';
    buyBtn.addEventListener("click", function () {
      if (window.Cart && window.Cart.addItem) {
        window.Cart.addItem({
          id: product.id,
          title: product.name,
          price: product.price,
          image: product.image
        });
        buyBtn.classList.add("btn-added");
        setTimeout(function () { buyBtn.classList.remove("btn-added"); }, 1200);
      }
    });
    actions.appendChild(buyBtn);

    body.appendChild(actions);
    item.appendChild(body);
    return item;
  }

  function createEmptyState(text) {
    var state = document.createElement("div");
    state.className = "empty-state";
    state.innerHTML = '<i class="bi bi-inbox" style="font-size:2rem;opacity:.4;display:block;margin-bottom:.5rem"></i>' +
                      (text || "محصولی برای نمایش موجود نیست.");
    return state;
  }

  /* ── Paginated slider (transform-based, no RTL scroll issues) ── */
  function setupPagedSlider(track, prevBtn, nextBtn, dotsEl) {
    var items = Array.from(track.children);
    var currentPage = 0;
    var autoTimer = null;

    function getPerPage() {
      var w = track.parentElement.clientWidth;
      if (w >= 860) return 4;
      if (w >= 640) return 3;
      if (w >= 420) return 2;
      return 1;
    }

    function getPageCount() { return Math.ceil(items.length / getPerPage()); }

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      var n = getPageCount();
      dotsEl.style.display = n > 1 ? '' : 'none';
      for (var i = 0; i < n; i++) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slider-dot' + (i === currentPage ? ' active' : '');
        btn.setAttribute('aria-label', 'صفحه ' + (i + 1));
        (function (p) { btn.addEventListener('click', function () { goTo(p); restartAuto(); }); })(i);
        dotsEl.appendChild(btn);
      }
    }

    function showPage(dir) {
      var perPage = getPerPage();
      var start = currentPage * perPage;
      track.style.setProperty('--per-page', perPage);

      var pageItems = [];
      items.forEach(function (item, i) {
        item.classList.remove('si-visible', 'si-in-next', 'si-in-prev');
        if (i >= start && i < start + perPage) {
          item.style.display = 'block';
          pageItems.push(item);
        } else {
          item.style.display = 'none';
        }
      });

      track.style.justifyContent = pageItems.length < perPage ? 'center' : '';

      var animClass = dir >= 0 ? 'si-in-next' : 'si-in-prev';
      void track.offsetWidth; // force reflow before adding class
      pageItems.forEach(function (item, i) {
        item.style.animationDelay = (i * 45) + 'ms';
        item.classList.add('si-visible', animClass);
      });

      updateButtons();
      buildDots();
    }

    function goTo(page) {
      var pages = getPageCount();
      if (pages <= 0) return;
      var nextPage = ((page % pages) + pages) % pages;
      var dir = page >= currentPage ? 1 : -1;
      if (currentPage === pages - 1 && nextPage === 0) dir = 1;
      if (currentPage === 0 && nextPage === pages - 1) dir = -1;
      currentPage = nextPage;
      showPage(dir);
    }

    function updateButtons() {
      var pages = getPageCount();
      var disabled = pages <= 1;
      prevBtn.disabled = disabled;
      nextBtn.disabled = disabled;
      prevBtn.style.display = disabled ? 'none' : '';
      nextBtn.style.display = disabled ? 'none' : '';
      prevBtn.style.opacity = disabled ? '0.28' : '1';
      nextBtn.style.opacity = disabled ? '0.28' : '1';
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAuto() {
      stopAuto();
      if (getPageCount() > 1) {
        autoTimer = setInterval(function () { goTo(currentPage + 1); }, 10000);
      }
    }

    function restartAuto() {
      startAuto();
    }

    /* RTL: prevBtn = RIGHT side = go back (lower page index)
            nextBtn = LEFT  side = go forward (higher page index)  */
    prevBtn.addEventListener('click', function () { goTo(currentPage - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(currentPage + 1); restartAuto(); });
    var sliderWrap = track.closest('.slider-wrap');
    if (sliderWrap) {
      sliderWrap.addEventListener('mouseenter', stopAuto);
      sliderWrap.addEventListener('mouseleave', startAuto);
    }

    showPage(1);
    startAuto();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { currentPage = 0; showPage(1); startAuto(); }, 200);
    });
  }

  /* ── Product Slider ──────────────────────────────────────── */
  function renderProductSlider(mount, options) {
    var section = document.createElement("section");
    section.className = "slider-section";
    if (options.sectionId) section.id = options.sectionId;

    section.appendChild(createSectionHead(options.title, options.seeAll));

    if (!options.products || !options.products.length) {
      section.appendChild(createEmptyState("در این بخش محصولی ثبت نشده است."));
      mount.appendChild(section);
      return section;
    }

    var wrap = document.createElement("div");
    wrap.className = "slider-wrap";

    var track = document.createElement("div");
    track.className = "slider-track";

    options.products.forEach(function (product) {
      var cell = document.createElement("div");
      cell.className = "slider-item";
      cell.appendChild(createProductCard(product));
      track.appendChild(cell);
    });
    wrap.appendChild(track);

    var dotsEl = document.createElement("div");
    dotsEl.className = "slider-dots";
    wrap.appendChild(dotsEl);

    var nav = document.createElement("div");
    nav.className = "slider-nav";
    var prev = document.createElement("button");
    prev.type = "button";
    prev.setAttribute("aria-label", "قبلی");
    prev.innerHTML = '<i class="bi bi-chevron-right"></i>';
    var next = document.createElement("button");
    next.type = "button";
    next.setAttribute("aria-label", "بعدی");
    next.innerHTML = '<i class="bi bi-chevron-left"></i>';
    nav.appendChild(prev);
    nav.appendChild(next);
    wrap.appendChild(nav);

    section.appendChild(wrap);
    mount.appendChild(section);

    setTimeout(function () { setupPagedSlider(track, prev, next, dotsEl); }, 0);
    return section;
  }

  /* ── Product Grid ────────────────────────────────────────── */
  function renderProductGrid(mount, title, products) {
    var wrapper = document.createElement("section");
    wrapper.className = "all-products";
    wrapper.appendChild(createSectionHead(title));

    if (!products.length) {
      wrapper.appendChild(createEmptyState("محصولی برای نمایش وجود ندارد."));
      mount.appendChild(wrapper);
      return;
    }

    var grid = document.createElement("div");
    grid.className = "product-grid";
    products.forEach(function (product) {
      grid.appendChild(createProductCard(product));
    });
    wrapper.appendChild(grid);
    mount.appendChild(wrapper);
  }

  /* ── Hero Slider ─────────────────────────────────────────── */
  function renderHero(mount, dotsMount, slides) {
    if (!slides || !slides.length) {
      mount.appendChild(createEmptyState("اسلاید تبلیغاتی ثبت نشده است."));
      return;
    }

    var current = 0;
    var timerId = null;
    var heroAssetVersion = Date.now();

    function withHeroCacheBust(src) {
      if (!src) return "";
      return src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + heroAssetVersion;
    }

    slides.forEach(function (slide, index) {
      var item = document.createElement("article");
      item.className = "hero-slide" + (index === 0 ? " active" : "");
      item.innerHTML =
        '<img src="' + withHeroCacheBust(slide.image) + '" alt="' + (slide.title || "اسلاید") + '">' +
        (slide.title || slide.subtitle
          ? '<div class="hero-content">' +
            (slide.title ? '<h2>' + slide.title + '</h2>' : '') +
            (slide.subtitle ? '<p>' + slide.subtitle + '</p>' : '') +
            '<a class="hero-link" href="' + (slide.link || '#') + '">مشاهده محصولات <i class="bi bi-arrow-left"></i></a>' +
            '</div>'
          : '<a class="hero-slide-link" href="' + (slide.link || '#') + '" aria-label="مشاهده"></a>');
      mount.appendChild(item);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot" + (index === 0 ? " active" : "");
      dot.setAttribute("aria-label", "اسلاید " + (index + 1));
      dot.addEventListener("click", function () { goTo(index); restart(); });
      dotsMount.appendChild(dot);
    });

    var nav = document.createElement("div");
    nav.className = "hero-nav";
    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "hero-nav-btn";
    prevBtn.setAttribute("aria-label", "اسلاید قبلی");
    prevBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "hero-nav-btn";
    nextBtn.setAttribute("aria-label", "اسلاید بعدی");
    nextBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    mount.appendChild(nav);

    var slideNodes = mount.querySelectorAll(".hero-slide");
    var dotNodes = dotsMount.querySelectorAll(".hero-dot");

    function goTo(index) {
      current = index;
      slideNodes.forEach(function (node, i) { node.classList.toggle("active", i === current); });
      dotNodes.forEach(function (node, i) { node.classList.toggle("active", i === current); });
    }
    function next() { goTo((current + 1) % slides.length); }
    function prev() { goTo((current - 1 + slides.length) % slides.length); }
    function stop() { if (timerId) { clearInterval(timerId); timerId = null; } }
    function start() { stop(); timerId = setInterval(next, 7000); }
    function restart() { stop(); start(); }

    prevBtn.addEventListener("click", function () { prev(); restart(); });
    nextBtn.addEventListener("click", function () { next(); restart(); });
    mount.addEventListener("mouseenter", stop);
    mount.addEventListener("mouseleave", start);
    start();
  }

  /* ── Tabs ────────────────────────────────────────────────── */
  function renderTabs(mount, tabsMap) {
    var keys = Object.keys(tabsMap || {});
    if (!keys.length) return;

    var tabs = document.createElement("div");
    tabs.className = "tabs";
    var head = document.createElement("div");
    head.className = "tab-head";
    var content = document.createElement("div");
    content.className = "tab-content";
    var current = keys[0];

    function draw() {
      content.textContent = tabsMap[current];
      head.querySelectorAll(".tab-btn").forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.key === current);
      });
    }

    keys.forEach(function (key) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn";
      btn.dataset.key = key;
      btn.textContent = key;
      btn.addEventListener("click", function () { current = key; draw(); });
      head.appendChild(btn);
    });

    tabs.appendChild(head);
    tabs.appendChild(content);
    mount.appendChild(tabs);
    draw();
  }

  /* ── Shortcuts ───────────────────────────────────────────── */
  function renderShortcuts(mount, items) {
    var list = document.createElement("div");
    list.className = "shortcuts-grid";
    (items || []).forEach(function (item, idx) {
      var anchor = document.createElement("a");
      anchor.className = "shortcut-item anim-up";
      anchor.href = item.link || "#";
      anchor.style.transitionDelay = (idx * 65) + "ms";
      anchor.innerHTML =
        '<span class="shortcut-circle"><img src="' + item.icon + '" alt="' + item.label + '"></span>' +
        '<span class="shortcut-label">' + item.label + '</span>';
      list.appendChild(anchor);
    });
    mount.appendChild(list);
  }

  /* ── Trust strip ─────────────────────────────────────────── */
  function renderTrustStrip(mount) {
    var items = [
      { icon: 'bi-truck',        title: 'ارسال سریع',       sub: 'به سراسر ایران' },
      { icon: 'bi-patch-check',  title: 'ضمانت اصالت',      sub: 'تمامی محصولات' },
      { icon: 'bi-headset',      title: 'پشتیبانی فنی',     sub: 'شنبه تا پنجشنبه' },
      { icon: 'bi-tag-fill',     title: 'بهترین قیمت',      sub: 'تضمین قیمت‌گذاری' }
    ];
    var strip = document.createElement("div");
    strip.className = "trust-strip anim-up";
    items.forEach(function (item, i) {
      var cell = document.createElement("div");
      cell.className = "trust-item";
      cell.style.transitionDelay = (i * 80) + "ms";
      cell.innerHTML =
        '<div class="trust-icon"><i class="bi ' + item.icon + '"></i></div>' +
        '<div class="trust-text"><strong>' + item.title + '</strong><span>' + item.sub + '</span></div>';
      strip.appendChild(cell);
    });
    mount.appendChild(strip);
  }

  /* ── Social links ────────────────────────────────────────── */
  function socialIconClass(name) {
    var map = { instagram: 'bi-instagram', telegram: 'bi-telegram', whatsapp: 'bi-whatsapp', aparat: 'bi-play-circle' };
    return map[name] || 'bi-link-45deg';
  }

  function renderSocialLinks(mount, links) {
    mount.innerHTML = "";
    (links || []).forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href || "#";
      a.target = "_blank";
      a.rel = "noreferrer";
      a.setAttribute("aria-label", item.label);
      a.innerHTML = '<i class="bi ' + socialIconClass(item.icon) + '"></i>';
      mount.appendChild(a);
    });
  }

  window.SiteComponents = {
    formatPrice,
    createProductCard,
    renderProductSlider,
    renderProductGrid,
    renderHero,
    renderTabs,
    renderShortcuts,
    renderTrustStrip,
    renderSocialLinks,
    createEmptyState
  };
})();
