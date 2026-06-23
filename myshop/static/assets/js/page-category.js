(function () {

  var CATEGORY_META = {
    'iphone-tasviri':  { icon: 'bi-camera-video-fill',  color: '#2b6cb0', label: 'آیفون تصویری' },
    'jack-dar-parking':{ icon: 'bi-door-open-fill',      color: '#2d6a4f', label: 'جک در پارکینگ' },
    'element':         { icon: 'bi-lightning-charge-fill',color: '#b5451b', label: 'المنت' },
    'mohafez-bargh':   { icon: 'bi-shield-check-fill',   color: '#6b46c1', label: 'محافظ برق' }
  };

  function byCategory(allProducts, categoryKey) {
    return allProducts.filter(function (item) { return item.category === categoryKey; });
  }

  function byGroup(allProducts, categoryKey, groupKey, limit) {
    var items = allProducts.filter(function (item) {
      return item.category === categoryKey && item.group === groupKey;
    });
    if (limit) items = items.slice(0, limit);
    return items;
  }

  async function init() {
    if (document.body.dataset.page !== "category") return;

    var pageKey = document.body.dataset.categoryPage;
    var [pagesData, productsData] = await Promise.all([
      window.SiteDataService.request("assets/data/pages-data.json"),
      window.SiteDataService.request("assets/data/products.json")
    ]);

    var pageConfig = pagesData.pages && pagesData.pages[pageKey];
    if (!pageConfig) return;

    /* Category hero intro */
    var intro = document.getElementById("category-intro");
    if (intro) {
      var meta = CATEGORY_META[pageKey] || { icon: 'bi-grid-fill', color: '#2b6cb0', label: pageConfig.title };
      intro.style.setProperty('--cat-color', meta.color);
      intro.innerHTML =
        '<div class="cat-intro-inner">' +
          '<div class="cat-intro-icon-wrap">' +
            '<i class="bi ' + meta.icon + ' cat-intro-icon"></i>' +
          '</div>' +
          '<div class="cat-intro-text">' +
            '<div class="cat-breadcrumb">' +
              '<a href="index.html">صفحه اصلی</a>' +
              '<i class="bi bi-chevron-left"></i>' +
              '<span>' + pageConfig.title + '</span>' +
            '</div>' +
            '<h1>' + pageConfig.title + '</h1>' +
            '<p>' + pageConfig.subtitle + '</p>' +
          '</div>' +
        '</div>';
    }

    /* Slider groups */
    var sectionMount = document.getElementById("category-sections");
    if (sectionMount) {
      sectionMount.innerHTML = "";
      (pageConfig.sliderGroups || []).forEach(function (group) {
        var products = byGroup(productsData.products || [], pageKey, group.key, group.limit);
        window.SiteComponents.renderProductSlider(sectionMount, {
          title: group.title,
          products: products,
          sectionId: group.sectionId || "",
          seeAll: group.seeAll || null
        });
      });
    }

    /* All products grid */
    if (pageConfig.showAllProducts) {
      var allProductsMount = document.getElementById("all-products");
      if (allProductsMount) {
        allProductsMount.innerHTML = "";
        var allItems = byCategory(productsData.products || [], pageKey);
        window.SiteComponents.renderProductGrid(allProductsMount, "همه محصولات", allItems);
      }
    }
  }

  window.PageCategory = { init };
})();
