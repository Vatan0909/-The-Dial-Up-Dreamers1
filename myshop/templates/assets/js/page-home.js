(function () {
  function selectProducts(allProducts, filter) {
    let items = allProducts.slice();
    if (filter.category) {
      items = items.filter(function (item) {
        return item.category === filter.category;
      });
    }
    if (filter.group) {
      items = items.filter(function (item) {
        return item.group === filter.group;
      });
    }
    if (filter.ids && filter.ids.length) {
      items = filter.ids
        .map(function (id) {
          return allProducts.find(function (item) {
            return item.id === id;
          });
        })
        .filter(Boolean);
    }
    if (filter.limit) {
      items = items.slice(0, filter.limit);
    }
    return items;
  }

  async function init() {
    const page = document.body.dataset.page;
    if (page !== "home") {
      return;
    }

    const [homeData, productData, siteConfig] = await Promise.all([
      window.SiteDataService.request("assets/data/home-data.json"),
      window.SiteDataService.request("assets/data/products.json"),
      window.SiteDataService.request("assets/data/site-config.json")
    ]);

    const hero = document.getElementById("hero-slider");
    const heroDots = document.getElementById("hero-dots");
    if (hero && heroDots) {
      window.SiteComponents.renderHero(hero, heroDots, homeData.heroSlides || []);
    }

    const shortcuts = document.getElementById("section-shortcuts");
    if (shortcuts) {
      window.SiteComponents.renderShortcuts(shortcuts, homeData.shortcuts || []);
    }

    const sectionsMount = document.getElementById("home-sections");
    if (sectionsMount) {
      sectionsMount.innerHTML = "";
      (homeData.featuredSections || []).forEach(function (section) {
        const items = selectProducts(productData.products || [], section.filter || {});
        window.SiteComponents.renderProductSlider(sectionsMount, {
          title: section.title,
          products: items,
          sectionId: section.sectionId,
          seeAll: section.seeAll || null
        });
      });
    }

    const contact = document.getElementById("home-contact");
    if (contact) {
      const about = siteConfig.contact || {};
      contact.innerHTML =
        '<div><h3>درباره‌ی ما</h3><p class="contact-text">' +
        (about.aboutText || "") +
        '</p></div><div><ul class="contact-list"><li>تلفن: ' +
        (about.phone || "-") +
        "</li><li>ایمیل: " +
        (about.email || "-") +
        "</li><li>آدرس: " +
        (about.address || "-") +
        "</li></ul></div>";
    }
  }

  window.PageHome = {
    init
  };
})();
