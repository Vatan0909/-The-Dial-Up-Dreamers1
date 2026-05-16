(function () {
  function byCategory(allProducts, categoryKey) {
    return allProducts.filter(function (item) {
      return item.category === categoryKey;
    });
  }

  function byGroup(allProducts, categoryKey, groupKey, limit) {
    let items = allProducts.filter(function (item) {
      return item.category === categoryKey && item.group === groupKey;
    });
    if (limit) {
      items = items.slice(0, limit);
    }
    return items;
  }

  async function init() {
    if (document.body.dataset.page !== "category") {
      return;
    }

    const pageKey = document.body.dataset.categoryPage;
    const [pagesData, productsData] = await Promise.all([
      window.SiteDataService.request("assets/data/pages-data.json"),
      window.SiteDataService.request("assets/data/products.json")
    ]);

    const pageConfig = pagesData.pages && pagesData.pages[pageKey];
    if (!pageConfig) {
      return;
    }

    const intro = document.getElementById("category-intro");
    if (intro) {
      intro.innerHTML = "<h1>" + pageConfig.title + "</h1><p>" + pageConfig.subtitle + "</p>";
    }

    const sectionMount = document.getElementById("category-sections");
    if (sectionMount) {
      sectionMount.innerHTML = "";
      (pageConfig.sliderGroups || []).forEach(function (group) {
        const products = byGroup(productsData.products || [], pageKey, group.key, group.limit);
        window.SiteComponents.renderProductSlider(sectionMount, {
          title: group.title,
          products: products,
          sectionId: group.sectionId || "",
          seeAll: group.seeAll || null
        });
      });
    }

    if (pageConfig.showAllProducts) {
      const allProductsMount = document.getElementById("all-products");
      if (allProductsMount) {
        allProductsMount.innerHTML = "";
        const allItems = byCategory(productsData.products || [], pageKey);
        window.SiteComponents.renderProductGrid(allProductsMount, "همه محصولات", allItems);
      }
    }
  }

  window.PageCategory = {
    init
  };
})();
