(function () {
<<<<<<< Updated upstream
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
=======
  function init() {
>>>>>>> Stashed changes
    if (document.body.dataset.page !== "product") {
      return;
    }

    // ۱. مدیریت گالری تصاویر
    const mainImage = document.getElementById("product-main-image");
    const thumbBtns = document.querySelectorAll(".thumb-btn");

    if (thumbBtns.length > 0) {
      thumbBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          const newSrc = this.getAttribute("data-gallery-src");
          if (newSrc && mainImage) {
            mainImage.src = newSrc;
          }
          
          thumbBtns.forEach(function (node) {
            node.classList.remove("active");
          });
          this.classList.add("active");
        });
      });
    }

    // ۲. مدیریت دکمه‌های کم و زیاد کردن تعداد (هماهنگ با ظاهر جدید و فرم مخفی)
    const realQtyInput = document.querySelector('input[name="quantity"]'); // فیلد فرم جنگو
    const uiQtyValue = document.getElementById('ui-qty-value'); // عنصر نمایشی
    const btnPlus = document.querySelector('[data-qty-plus]');
    const btnMinus = document.querySelector('[data-qty-minus]');

    if (realQtyInput && uiQtyValue) {
      // مقدار اولیه عنصر نمایشی را بر اساس فیلد جنگو تنظیم کن
      uiQtyValue.textContent = realQtyInput.value || "1";

      if (btnPlus) {
        btnPlus.addEventListener("click", function () {
          let currentVal = Number(realQtyInput.value) || 1;
          let newVal = currentVal + 1;
          realQtyInput.value = newVal; // آپدیت فرم پنهان
          uiQtyValue.textContent = newVal; // آپدیت ظاهر
        });
      }
      if (btnMinus) {
        btnMinus.addEventListener("click", function () {
          let currentVal = Number(realQtyInput.value) || 1;
          let newVal = Math.max(1, currentVal - 1);
          realQtyInput.value = newVal; // آپدیت فرم پنهان
          uiQtyValue.textContent = newVal; // آپدیت ظاهر
        });
      }
    }

    // ۳. مدیریت تب‌ها
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = this.getAttribute("data-tab-target");

        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        this.classList.add("active");
        const content = document.querySelector('.tab-content[data-tab-panel="' + target + '"]');
        if (content) {
          content.classList.add("active");
        }
      });
    });

    // ۴. مدیریت انتخاب رنگ و حافظه
    const colorChips = document.querySelectorAll('[data-variant-color]');
    const memoryChips = document.querySelectorAll('[data-variant-memory]');
    const selectedColorInput = document.getElementById('selected-color');
    const selectedMemoryInput = document.getElementById('selected-memory');

<<<<<<< Updated upstream
      window.SiteComponents.renderProductSlider(suggestedMount, {
        title: "محصولات پیشنهادی",
        products: suggestions,
        seeAll: { label: "مشاهده همه", href: categoryPageMap[product.category] || "index.html" }
      });
    }
=======
    colorChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        colorChips.forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        if (selectedColorInput) {
          selectedColorInput.value = this.getAttribute("data-variant-color");
        }
      });
    });

    memoryChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        memoryChips.forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        if (selectedMemoryInput) {
          selectedMemoryInput.value = this.getAttribute("data-variant-memory");
        }
      });
    });
>>>>>>> Stashed changes
  }

  window.PageProduct = {
    init
  };
})();