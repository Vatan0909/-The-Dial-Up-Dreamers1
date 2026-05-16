(function () {
  const categoryPageMap = {
    "iphone-tasviri": "iphone-tasviri.html",
    "jack-dar-parking": "jack-dar-parking.html",
    element: "element.html",
    "mohafez-bargh": "mohafez-bargh.html"
  };

  function createOptionBlock(title, values) {
    const block = document.createElement("section");
    block.className = "option-block";
    const heading = document.createElement("h4");
    heading.textContent = title;
    block.appendChild(heading);
    const row = document.createElement("div");
    row.className = "option-row";
    values.forEach(function (value, idx) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-btn" + (idx === 0 ? " active" : "");
      btn.textContent = value;
      btn.addEventListener("click", function () {
        row.querySelectorAll(".chip-btn").forEach(function (node) {
          node.classList.remove("active");
        });
        btn.classList.add("active");
      });
      row.appendChild(btn);
    });
    block.appendChild(row);
    return block;
  }

  function createGallery(product) {
    const box = document.createElement("div");
    const mainWrap = document.createElement("div");
    mainWrap.className = "product-gallery-main";
    const mainImage = document.createElement("img");
    mainImage.src = product.image;
    mainImage.alt = product.name;
    mainWrap.appendChild(mainImage);
    box.appendChild(mainWrap);

    const thumbRow = document.createElement("div");
    thumbRow.className = "thumb-row";
    const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
    gallery.forEach(function (imgSrc, index) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb-btn" + (index === 0 ? " active" : "");
      btn.innerHTML = '<img src="' + imgSrc + '" alt="' + product.name + '">';
      btn.addEventListener("click", function () {
        mainImage.src = imgSrc;
        thumbRow.querySelectorAll(".thumb-btn").forEach(function (n) {
          n.classList.remove("active");
        });
        btn.classList.add("active");
      });
      thumbRow.appendChild(btn);
    });
    box.appendChild(thumbRow);
    return box;
  }

  function createProductInfo(product) {
    const info = document.createElement("div");
    info.className = "product-info";
    info.innerHTML = "<h1>" + product.name + "</h1>";

    const list = document.createElement("ul");
    list.className = "product-meta-list";
    (product.description || []).forEach(function (line) {
      const li = document.createElement("li");
      li.textContent = line;
      list.appendChild(li);
    });
    info.appendChild(list);

    if (product.type === "video-doorphone") {
      if (product.modelOptions && product.modelOptions.length) {
        info.appendChild(createOptionBlock("مدل", product.modelOptions));
      }
      if (product.colorOptions && product.colorOptions.length) {
        info.appendChild(createOptionBlock("رنگ", product.colorOptions));
      }
      if (product.memoryOptions && product.memoryOptions.length) {
        info.appendChild(createOptionBlock("حافظه", product.memoryOptions));
      }
    }

    const purchase = document.createElement("div");
    purchase.className = "purchase-row";

    const qtyWrap = document.createElement("div");
    qtyWrap.className = "qty-wrap";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty-btn";
    minus.textContent = "-";
    const value = document.createElement("span");
    value.className = "qty-value";
    value.textContent = "1";
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty-btn";
    plus.textContent = "+";

    plus.addEventListener("click", function () {
      value.textContent = String(Number(value.textContent) + 1);
    });
    minus.addEventListener("click", function () {
      value.textContent = String(Math.max(1, Number(value.textContent) - 1));
    });

    qtyWrap.appendChild(minus);
    qtyWrap.appendChild(value);
    qtyWrap.appendChild(plus);

    const add = document.createElement("button");
    add.type = "button";
    add.className = "add-cart-btn";
    add.textContent = "افزودن به سبد خرید";
    add.addEventListener("click", function () {
      window.alert("محصول با تعداد " + value.textContent + " به سبد خرید اضافه شد.");
    });

    const price = document.createElement("span");
    price.className = "price-text";
    price.textContent = window.SiteComponents.formatPrice(product.price);

    purchase.appendChild(qtyWrap);
    purchase.appendChild(add);
    purchase.appendChild(price);
    info.appendChild(purchase);

    return info;
  }

  function findProductById(products, id) {
    if (!id && products.length) {
      return products[0];
    }
    return products.find(function (item) {
      return item.id === id;
    });
  }

  async function init() {
    if (document.body.dataset.page !== "product") {
      return;
    }

    const [productsData] = await Promise.all([
      window.SiteDataService.request("assets/data/products.json")
    ]);

    const products = productsData.products || [];
    const productId = window.SiteDataService.getQueryParam("id");
    const product = findProductById(products, productId);
    const page = document.getElementById("product-page");
    if (!page) {
      return;
    }

    if (!product) {
      page.innerHTML = '<div class="empty-state">محصول مورد نظر پیدا نشد.</div>';
      return;
    }

    document.title = product.name + " | فروشگاه الکتروصنعت امگا";

    const detail = document.createElement("article");
    detail.className = "product-detail";

    const top = document.createElement("div");
    top.className = "product-top";
    top.appendChild(createGallery(product));
    top.appendChild(createProductInfo(product));
    detail.appendChild(top);

    const tabsWrap = document.createElement("div");
    tabsWrap.className = "product-tabs-wrap";
    window.SiteComponents.renderTabs(tabsWrap, product.tabs || {});
    detail.appendChild(tabsWrap);
    page.appendChild(detail);

    const suggestedMount = document.getElementById("suggested-products");
    if (suggestedMount) {
      suggestedMount.innerHTML = "";
      const suggestions = products
        .filter(function (item) {
          return item.category === product.category && item.id !== product.id;
        })
        .slice(0, 8);

      window.SiteComponents.renderProductSlider(suggestedMount, {
        title: "محصولات پیشنهادی",
        products: suggestions,
        seeAll: { label: "مشاهده همه", href: categoryPageMap[product.category] || "index.html" }
      });
    }
  }

  window.PageProduct = {
    init
  };
})();
