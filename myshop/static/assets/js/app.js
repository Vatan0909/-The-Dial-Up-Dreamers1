(function () {
  function hideLoader() {
    const loader = document.getElementById('site-loader');
    if (loader) loader.classList.add('loaded');
  }

  async function bootstrap() {
    await window.LayoutLoader.init();
    await window.PageHome.init();
    await window.PageCategory.init();
    await window.PageProduct.init();
    document.querySelectorAll("[data-server-slider]").forEach(function (track) {
      if (track.dataset.sliderReady === "true") return;
      var wrap = track.closest(".slider-wrap");
      if (!wrap || !window.SiteComponents || !window.SiteComponents.setupPagedSlider) return;
      var buttons = wrap.querySelectorAll(".slider-nav button");
      var dots = wrap.querySelector(".slider-dots");
      if (buttons.length >= 2 && dots) {
        window.SiteComponents.setupPagedSlider(track, buttons[0], buttons[1], dots);
        track.dataset.sliderReady = "true";
      }
    });
    if (window.WizardInit) await window.WizardInit();
    if (window.ElementWizardInit) await window.ElementWizardInit();
    setTimeout(hideLoader, 300);
  }

  document.addEventListener("DOMContentLoaded", function () {
    bootstrap().catch(function (error) {
      console.error(error);
      // hide loader even on error so page isn't stuck
      hideLoader();
    });
  });
})();
