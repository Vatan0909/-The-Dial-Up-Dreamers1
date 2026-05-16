(function () {
  async function bootstrap() {
    await window.LayoutLoader.init();
    await window.PageHome.init();
    await window.PageCategory.init();
    await window.PageProduct.init();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bootstrap().catch(function (error) {
      console.error(error);
    });
  });
})();
