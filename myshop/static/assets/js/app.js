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
    if (window.WizardInit) await window.WizardInit();
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
