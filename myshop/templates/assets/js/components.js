(function () {
  function formatPrice(value) {
    return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
  }

  function createSectionHead(title, seeAll) {
    const head = document.createElement("div");
    head.className = "section-head";
    const heading = document.createElement("h3");
    heading.textContent = title;
    head.appendChild(heading);

    if (seeAll && seeAll.href) {
      const link = document.createElement("a");
      link.className = "see-all-btn";
      link.href = seeAll.href;
      link.textContent = seeAll.label || "مشاهده همه";
      head.appendChild(link);
    }

    return head;
  }

  function createProductCard(product) {
    const item = document.createElement("article");
    item.className = "product-card";

    const img = document.createElement("img");
    img.className = "product-image";
    img.src = product.image;
    img.alt = product.name;
    img.loading = "lazy";
    item.appendChild(img);

    const body = document.createElement("div");
    body.className = "product-body";

    const title = document.createElement("h4");
    title.className = "product-title";
    title.textContent = product.name;
    body.appendChild(title);

    const priceRow = document.createElement("div");
    priceRow.className = "price-row";
    priceRow.innerHTML =
      '<span class="price-label">قیمت</span><span class="price-value">' +
      formatPrice(product.price) +
      "</span>";
    body.appendChild(priceRow);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const detailsLink = document.createElement("a");
    detailsLink.className = "btn-outline";
    detailsLink.href = "product.html?id=" + encodeURIComponent(product.id);
    detailsLink.innerHTML = '<i class="bi bi-info-circle"></i><span>اطلاعات</span>';
    actions.appendChild(detailsLink);

    const buyBtn = document.createElement("button");
    buyBtn.className = "btn-solid";
    buyBtn.type = "button";
    buyBtn.innerHTML = '<i class="bi bi-cart-plus"></i><span>افزودن به سبد</span>';
    buyBtn.addEventListener("click", function () {
      window.alert("محصول به سبد خرید اضافه شد.");
    });
    actions.appendChild(buyBtn);

    body.appendChild(actions);
    item.appendChild(body);
    return item;
  }

  function createEmptyState(text) {
    const state = document.createElement("div");
    state.className = "empty-state";
    state.textContent = text || "محصولی برای نمایش موجود نیست.";
    return state;
  }

  function setupHorizontalSlider(track, prevBtn, nextBtn) {
    function step() {
      return Math.max(track.clientWidth * 0.75, 180);
    }

    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });

    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
  }

  function renderProductSlider(mount, options) {
    const section = document.createElement("section");
    section.className = "slider-section";
    if (options.sectionId) {
      section.id = options.sectionId;
    }

    section.appendChild(createSectionHead(options.title, options.seeAll));

    if (!options.products || options.products.length === 0) {
      section.appendChild(createEmptyState("در این بخش محصولی ثبت نشده است."));
      mount.appendChild(section);
      return section;
    }

    const wrap = document.createElement("div");
    wrap.className = "slider-wrap";

    const track = document.createElement("div");
    track.className = "slider-track";

    options.products.forEach(function (product) {
      const cell = document.createElement("div");
      cell.className = "slider-item";
      cell.appendChild(createProductCard(product));
      track.appendChild(cell);
    });

    wrap.appendChild(track);

    const nav = document.createElement("div");
    nav.className = "slider-nav";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.setAttribute("aria-label", "قبلی");
    prev.innerHTML = '<i class="bi bi-chevron-right"></i>';
    const next = document.createElement("button");
    next.type = "button";
    next.setAttribute("aria-label", "بعدی");
    next.innerHTML = '<i class="bi bi-chevron-left"></i>';
    nav.appendChild(next);
    nav.appendChild(prev);
    wrap.appendChild(nav);
    setupHorizontalSlider(track, prev, next);

    section.appendChild(wrap);
    mount.appendChild(section);
    return section;
  }

  function renderProductGrid(mount, title, products) {
    const wrapper = document.createElement("section");
    wrapper.appendChild(createSectionHead(title));

    if (!products.length) {
      wrapper.appendChild(createEmptyState("محصولی برای نمایش در این بخش وجود ندارد."));
      mount.appendChild(wrapper);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "product-grid";
    products.forEach(function (product) {
      grid.appendChild(createProductCard(product));
    });
    wrapper.appendChild(grid);
    mount.appendChild(wrapper);
  }

  function renderHero(mount, dotsMount, slides) {
    if (!slides || !slides.length) {
      mount.appendChild(createEmptyState("اسلاید تبلیغاتی ثبت نشده است."));
      return;
    }

    let current = 0;
    let timerId = null;

    slides.forEach(function (slide, index) {
      const item = document.createElement("article");
      item.className = "hero-slide" + (index === 0 ? " active" : "");
      item.innerHTML =
        '<img src="' +
        slide.image +
        '" alt="' +
        slide.title +
        '">' +
        '<div class="hero-content"><h2>' +
        slide.title +
        "</h2><p>" +
        slide.subtitle +
        '</p><a class="hero-link" href="' +
        slide.link +
        '">مشاهده</a></div>';
      mount.appendChild(item);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot" + (index === 0 ? " active" : "");
      dot.setAttribute("aria-label", "اسلاید " + (index + 1));
      dot.addEventListener("click", function () {
        goTo(index);
        restart();
      });
      dotsMount.appendChild(dot);
    });

    const nav = document.createElement("div");
    nav.className = "hero-nav";
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "hero-nav-btn";
    prevBtn.setAttribute("aria-label", "اسلاید قبلی");
    prevBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "hero-nav-btn";
    nextBtn.setAttribute("aria-label", "اسلاید بعدی");
    nextBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    nav.appendChild(nextBtn);
    nav.appendChild(prevBtn);
    mount.appendChild(nav);

    const slideNodes = mount.querySelectorAll(".hero-slide");
    const dotNodes = dotsMount.querySelectorAll(".hero-dot");

    function goTo(index) {
      current = index;
      slideNodes.forEach(function (node, i) {
        node.classList.toggle("active", i === current);
      });
      dotNodes.forEach(function (node, i) {
        node.classList.toggle("active", i === current);
      });
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    function prev() {
      goTo((current - 1 + slides.length) % slides.length);
    }

    function start() {
      timerId = setInterval(next, 4500);
    }

    function stop() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }

    function restart() {
      stop();
      start();
    }

    prevBtn.addEventListener("click", function () {
      prev();
      restart();
    });
    nextBtn.addEventListener("click", function () {
      next();
      restart();
    });

    mount.addEventListener("mouseenter", stop);
    mount.addEventListener("mouseleave", start);
    start();
  }

  function renderTabs(mount, tabsMap) {
    const keys = Object.keys(tabsMap || {});
    if (!keys.length) {
      return;
    }

    const tabs = document.createElement("div");
    tabs.className = "tabs";

    const head = document.createElement("div");
    head.className = "tab-head";
    const content = document.createElement("div");
    content.className = "tab-content";

    let current = keys[0];

    function draw() {
      content.textContent = tabsMap[current];
      head.querySelectorAll(".tab-btn").forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.key === current);
      });
    }

    keys.forEach(function (key) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn";
      btn.dataset.key = key;
      btn.textContent = key;
      btn.addEventListener("click", function () {
        current = key;
        draw();
      });
      head.appendChild(btn);
    });

    tabs.appendChild(head);
    tabs.appendChild(content);
    mount.appendChild(tabs);
    draw();
  }

  function renderShortcuts(mount, items) {
    const list = document.createElement("div");
    list.className = "shortcuts-grid";
    (items || []).forEach(function (item) {
      const anchor = document.createElement("a");
      anchor.className = "shortcut-item";
      anchor.href = item.link || "#";
      anchor.innerHTML =
        '<span class="shortcut-circle"><img src="' +
        item.icon +
        '" alt="' +
        item.label +
        '"></span><span>' +
        item.label +
        "</span>";
      list.appendChild(anchor);
    });
    mount.appendChild(list);
  }

  function socialIconClass(name) {
    const iconMap = {
      instagram: "bi-instagram",
      telegram: "bi-telegram",
      whatsapp: "bi-whatsapp",
      aparat: "bi-play-circle"
    };
    return iconMap[name] || "bi-link-45deg";
  }

  function renderSocialLinks(mount, links) {
    mount.innerHTML = "";
    (links || []).forEach(function (item) {
      const a = document.createElement("a");
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
    renderSocialLinks,
    createEmptyState
  };
})();
