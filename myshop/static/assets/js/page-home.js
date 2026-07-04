(function () {
  async function init() {
    var page = document.body.dataset.page;
    if (page !== "home") return;

    var [homeData, siteConfig] = await Promise.all([
      window.SiteDataService.request("assets/data/home-data.json"),
      window.SiteDataService.request("assets/data/site-config.json")
    ]);

    /* Hero slider */
    var hero = document.getElementById("hero-slider");
    var heroDots = document.getElementById("hero-dots");
    if (hero && heroDots) {
      window.SiteComponents.renderHero(hero, heroDots, homeData.heroSlides || []);
    }

    /* Shortcuts */
    var shortcuts = document.getElementById("section-shortcuts");
    if (shortcuts) {
      var shortcutHead = document.createElement("div");
      shortcutHead.className = "shortcuts-heading";
      shortcutHead.innerHTML = '<span class="shortcuts-tag"><i class="bi bi-grid-3x3-gap-fill"></i> دسته‌بندی‌ها</span>';
      shortcuts.insertBefore(shortcutHead, shortcuts.firstChild);
      window.SiteComponents.renderShortcuts(shortcuts, homeData.shortcuts || []);
    }

    /* Trust strip */
    var trustMount = document.getElementById("trust-strip-mount");
    if (trustMount) {
      window.SiteComponents.renderTrustStrip(trustMount);
    }

    /* Contact strip */
    var contact = document.getElementById("home-contact");
    if (contact) {
      var about = siteConfig.contact || {};
      contact.innerHTML =
        '<div class="home-contact-about">' +
          '<div class="home-contact-badge"><i class="bi bi-shop"></i> درباره‌ی ما</div>' +
          '<p class="contact-text">' + (about.aboutText || "") + '</p>' +
          '<a href="#" class="contact-cta-link">' +
            '<i class="bi bi-headset"></i> تماس با ما' +
          '</a>' +
        '</div>' +
        '<div class="home-contact-details">' +
          '<div class="hc-item"><i class="bi bi-telephone-fill"></i>' +
            '<div><span>تلفن</span><a href="tel:03432232340" dir="ltr">' + (about.phone || "") + '</a></div>' +
          '</div>' +
          '<div class="hc-item"><i class="bi bi-envelope-fill"></i>' +
            '<div><span>ایمیل</span><a href="mailto:' + (about.email || "") + '">' + (about.email || "") + '</a></div>' +
          '</div>' +
          '<div class="hc-item"><i class="bi bi-geo-alt-fill"></i>' +
            '<div><span>آدرس</span><span>' + (about.address || "") + '</span></div>' +
          '</div>' +
          '<div class="hc-item"><i class="bi bi-clock-fill"></i>' +
            '<div><span>ساعت کاری</span><span>شنبه تا پنجشنبه — ۸ تا ۱۷</span></div>' +
          '</div>' +
        '</div>';
    }
  }

  window.PageHome = { init };
})();
