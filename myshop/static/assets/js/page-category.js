(function () {

  var CATEGORY_META = {
    'iphone-tasviri':  { icon: 'bi-camera-video-fill',  color: '#2b6cb0', label: 'آیفون تصویری' },
    'jack-dar-parking':{ icon: 'bi-door-open-fill',      color: '#b5451b', label: 'جک در پارکینگ' },
    'element':         { icon: 'bi-lightning-charge-fill',color: '#b5451b', label: 'المنت' },
    'mohafez-bargh':   { icon: 'bi-shield-check-fill',   color: '#2b6cb0', label: 'محافظ برق' }
  };

  async function init() {
    if (document.body.dataset.page !== "category") return;

    var pageKey = document.body.dataset.categoryPage;
    var pagesData = await window.SiteDataService.request("assets/data/pages-data.json");

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
              '<a href="/">صفحه اصلی</a>' +
              '<i class="bi bi-chevron-left"></i>' +
              '<span>' + pageConfig.title + '</span>' +
            '</div>' +
            '<h1>' + pageConfig.title + '</h1>' +
            '<p>' + pageConfig.subtitle + '</p>' +
          '</div>' +
        '</div>';
    }

  }

  window.PageCategory = { init };
})();
