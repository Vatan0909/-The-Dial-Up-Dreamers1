(function () {
  function init() {
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
  }

  window.PageProduct = {
    init
  };
})();