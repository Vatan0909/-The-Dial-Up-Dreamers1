(function () {
  async function loadPartial(targetSelector, filePath) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      return;
    }
    const html = await window.SiteDataService.request(filePath);
    target.innerHTML = html;
  }

  function currentFileName() {
    const path = window.location.pathname.split("/");
    return path[path.length - 1] || "index.html";
  }

  function createMenuLink(item, currentPage) {
    const a = document.createElement("a");
    a.href = item.page;
    a.className = "menu-link";
    a.textContent = item.label;
    if (currentPage === item.page) {
      a.classList.add("active");
    }
    return a;
  }

  function fillHeader(config) {
    const header = config.header || {};
    const currentPage = currentFileName();

    const authText = document.getElementById("header-auth-text");
    const cartText = document.getElementById("header-cart-text");
    const shopName = document.getElementById("shop-name");
    const menuTitle = document.getElementById("header-menu-title");

    if (authText) authText.textContent = header.authText || "ثبت نام / ورود";
    if (cartText) cartText.textContent = header.cartText || "سبد خرید";
    if (shopName) shopName.textContent = (config.shop && config.shop.name) || "فروشگاه";
    if (menuTitle) menuTitle.textContent = header.menuTitle || "دسته بندی";

    const categoryList = document.getElementById("category-menu-list");
    const mobileList = document.getElementById("mobile-category-list");
    const desktopNav = document.getElementById("desktop-nav");
    const items = header.categories || [];

    if (categoryList) {
      categoryList.innerHTML = "";
      items.forEach(function (item) {
        const li = document.createElement("li");
        li.appendChild(createMenuLink(item, currentPage));
        categoryList.appendChild(li);
      });
    }

    if (mobileList) {
      mobileList.innerHTML = "";
      const homeLi = document.createElement("li");
      homeLi.appendChild(createMenuLink({ label: "صفحه اصلی", page: "index.html" }, currentPage));
      mobileList.appendChild(homeLi);
      items.forEach(function (item) {
        const li = document.createElement("li");
        li.appendChild(createMenuLink(item, currentPage));
        mobileList.appendChild(li);
      });
    }

    if (desktopNav) {
      desktopNav.innerHTML = "";
      const links = [{ label: "صفحه اصلی", page: "index.html" }].concat(items);
      links.forEach(function (item) {
        const link = createMenuLink(item, currentPage);
        desktopNav.appendChild(link);
      });
    }
  }

  function fillFooter(config) {
    const name = document.getElementById("footer-shop-name");
    if (name) {
      name.textContent = (config.shop && config.shop.name) || "فروشگاه";
    }

    const columnsWrap = document.getElementById("footer-columns");
    const footer = config.footer || {};
    const columns = footer.columns || [];
    if (columnsWrap) {
      columnsWrap.innerHTML = "";
      columns.forEach(function (column) {
        const col = document.createElement("section");
        col.className = "footer-col";
        const title = document.createElement("h4");
        title.textContent = column.title;
        col.appendChild(title);
        const list = document.createElement("ul");
        (column.links || []).forEach(function (link) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = link.href || "#";
          a.textContent = link.label;
          li.appendChild(a);
          list.appendChild(li);
        });
        col.appendChild(list);
        columnsWrap.appendChild(col);
      });
    }

    const rights = document.getElementById("footer-rights");
    if (rights) {
      rights.textContent = footer.rights || "تمامی حقوق محفوظ است.";
    }

    const socialWrap = document.getElementById("social-links");
    if (socialWrap) {
      window.SiteComponents.renderSocialLinks(socialWrap, footer.social || []);
    }
  }

  function setupHeaderInteractions() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("open");
        });
      });
    }

    const dropdownWrap = document.getElementById("category-dropdown-wrap");
    const dropdownToggle = document.getElementById("category-toggle");
    if (dropdownWrap && dropdownToggle) {
      dropdownToggle.addEventListener("click", function () {
        dropdownWrap.classList.toggle("open");
        const expanded = dropdownWrap.classList.contains("open");
        dropdownToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
      document.addEventListener("click", function (event) {
        if (!dropdownWrap.contains(event.target)) {
          dropdownWrap.classList.remove("open");
          dropdownToggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  async function init() {
    try {
      await loadPartial("#site-header", "header.html");
      await loadPartial("#site-footer", "footer.html");
      const config = await window.SiteDataService.request("assets/data/site-config.json");
      fillHeader(config);
      fillFooter(config);
      setupHeaderInteractions();
      return config;
    } catch (error) {
      const target = document.querySelector("#site-header");
      if (target) {
        target.innerHTML =
          '<div style="padding:10px;border:1px solid #d8e2ef;background:#fff;">خطا در بارگذاری قالب مشترک. لطفا سایت را با یک سرور محلی اجرا کنید.</div>';
      }
      return null;
    }
  }

  window.LayoutLoader = {
    init
  };
})();
