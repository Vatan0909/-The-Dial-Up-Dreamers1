(function () {
  async function loadPartial(targetSelector, filePath) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      return;
    }
    if (target.innerHTML.trim()) {
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
    const djangoCategoryMap = {
      "iphone-tasviri.html": "/category/iphone-tasviri/",
      "element.html": "/category/element/",
      "mohafez-bargh.html": "/category/mohafez-bargh/",
      "jack-dar-parking.html": "/category/jack-dar-parking/",
      "index.html": "/"
    };
    a.href = djangoCategoryMap[item.page] || item.page;
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
    const searchWrap = document.querySelector(".header-search");
    if (searchWrap) {
      const searchInput = searchWrap.querySelector("input");
      const searchButton = searchWrap.querySelector("button");
      const submitSearch = function () {
        const query = searchInput ? searchInput.value.trim() : "";
        if (query) {
          window.location.href = "/search/?q=" + encodeURIComponent(query);
        }
      };
      if (searchButton) searchButton.addEventListener("click", submitSearch);
      if (searchInput) {
        searchInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") submitSearch();
        });
      }
    }

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

  function fillStories(config) {
    if (document.querySelector("#story-circles .story-circle")) {
      return;
    }
    const stories = config.stories || [];
    const bar = document.getElementById('story-bar');
    const mount = document.getElementById('story-circles');
    if (!bar || !mount || !stories.length) return;
    mount.innerHTML = '';
    stories.forEach(function (story) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'story-circle';
      btn.setAttribute('aria-label', story.label);
      btn.innerHTML = '<div class="story-ring"><img src="' + window.SiteDataService.resolveUrl(story.thumb) + '" alt="' + story.label + '"></div>' +
                      '<span class="story-label">' + story.label + '</span>';
      btn.addEventListener('click', function () {
        openStoryModal(story);
      });
      mount.appendChild(btn);
    });
    bar.style.display = '';
  }

  window.openStoryModal = function (story) {
    const modal = document.getElementById('story-modal');
    const titleEl = document.getElementById('story-modal-title');
    const videoEl = document.getElementById('story-modal-video');
    if (!modal) return;
    titleEl.textContent = story.label;
    if (story.videoUrl) {
      const isYT = story.videoUrl.includes('youtube.com') || story.videoUrl.includes('youtu.be');
      if (isYT) {
        const ytId = story.videoUrl.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
        videoEl.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId + '?autoplay=1" allowfullscreen allow="autoplay"></iframe>';
      } else {
        videoEl.innerHTML = '<video src="' + story.videoUrl + '" controls autoplay playsinline></video>';
      }
    } else if (story.imageUrl) {
      const imageMarkup = '<img src="' + story.imageUrl + '" alt="' + story.label + '">';
      videoEl.innerHTML = story.link
        ? '<a class="story-image-link" href="' + story.link + '">' + imageMarkup + '</a>'
        : imageMarkup;
    } else {
      videoEl.innerHTML = '<div class="story-no-video"><i class="bi bi-camera-video-off"></i><p>ویدیو در دسترس نیست</p></div>';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  function setupServerStories() {
    document.querySelectorAll("#story-circles .story-circle").forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.dataset.storyLink) {
          window.location.href = button.dataset.storyLink;
          return;
        }
        const story = {
          label: button.dataset.storyTitle || button.getAttribute("aria-label") || "",
          videoUrl: button.dataset.storyVideo || "",
          imageUrl: button.dataset.storyImage || "",
          link: ""
        };
        openStoryModal(story);
      });
    });
  }

  window.closeStoryModal = function (e) {
    if (e && e.target !== document.getElementById('story-modal') && !e.target.closest('.story-modal-close')) return;
    const modal = document.getElementById('story-modal');
    const videoEl = document.getElementById('story-modal-video');
    if (modal) modal.style.display = 'none';
    if (videoEl) videoEl.innerHTML = '';
    document.body.style.overflow = '';
  };

  async function init() {
    try {
      await loadPartial("#site-header", "header.html");
      await loadPartial("#site-footer", "footer.html");
      const config = await window.SiteDataService.request("assets/data/site-config.json");
      fillHeader(config);
      fillFooter(config);
      fillStories(config);
      setupHeaderInteractions();
      setupServerStories();
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
