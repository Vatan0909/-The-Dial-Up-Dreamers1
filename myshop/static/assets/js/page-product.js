/**
 * page-product.js — منطق اختصاصی صفحه جزئیات محصول
 * این فایل وظیفه مدیریت گالری، تب‌ها، تعداد کالا و آپدیت زنده قیمت متغیرها را بر عهده دارد.
 */
(function () {
  function init() {
    // بررسی اینکه آیا کاربر در صفحه محصول قرار دارد یا خیر
    if (document.body.dataset.page !== "product") {
      return;
    }

    // =========================================================================
    // ۱. مدیریت گالری تصاویر
    // =========================================================================
    const mainImage = document.getElementById("product-main-image");
    const thumbBtns = document.querySelectorAll(".thumb-btn");

    if (thumbBtns.length > 0) {
      thumbBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          // دریافت آدرس تصویر جدید از دکمه کلیک شده
          const newSrc = this.getAttribute("data-gallery-src");
          if (newSrc && mainImage) {
            mainImage.src = newSrc; // تغییر عکس اصلی
          }
          
          // مدیریت استایل دکمه‌های کوچک (حذف حالت فعال از همه و اضافه کردن به دکمه فعلی)
          thumbBtns.forEach(function (node) {
            node.classList.remove("active");
          });
          this.classList.add("active");
        });
      });
    }

    // =========================================================================
    // ۲. مدیریت دکمه‌های کم و زیاد کردن تعداد (هماهنگ با ظاهر جدید و فرم مخفی)
    // =========================================================================
    const realQtyInput = document.querySelector('input[name="quantity"]'); // فیلد مخفی که به جنگو ارسال می‌شود
    const uiQtyValue = document.getElementById('ui-qty-value'); // عنصری که عدد را به کاربر نشان می‌دهد
    const btnPlus = document.querySelector('[data-qty-plus]'); // دکمه پلاس
    const btnMinus = document.querySelector('[data-qty-minus]'); // دکمه ماینوس

    if (realQtyInput && uiQtyValue) {
      // تنظیم مقدار اولیه ظاهر سایت بر اساس مقدار پیش‌فرض فیلد فرم
      uiQtyValue.textContent = realQtyInput.value || "1";

      // رویداد کلیک برای افزایش تعداد
      if (btnPlus) {
        btnPlus.addEventListener("click", function () {
          let currentVal = Number(realQtyInput.value) || 1;
          let newVal = currentVal + 1;
          realQtyInput.value = newVal; // آپدیت فرم پنهان (برای ارسال به بک‌اند)
          uiQtyValue.textContent = newVal; // آپدیت ظاهر سایت
        });
      }
      
      // رویداد کلیک برای کاهش تعداد
      if (btnMinus) {
        btnMinus.addEventListener("click", function () {
          let currentVal = Number(realQtyInput.value) || 1;
          let newVal = Math.max(1, currentVal - 1); // جلوگیری از صفر یا منفی شدن تعداد
          realQtyInput.value = newVal; // آپدیت فرم پنهان
          uiQtyValue.textContent = newVal; // آپدیت ظاهر سایت
        });
      }
    }

    // =========================================================================
    // ۳. مدیریت تب‌های اطلاعات محصول (گارانتی، مشخصات فنی و ...)
    // =========================================================================
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = this.getAttribute("data-tab-target");

        // غیرفعال کردن تمامی تب‌ها و محتواهای قبلی
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        // فعال کردن تب کلیک شده
        this.classList.add("active");
        
        // پیدا کردن و نمایش محتوای متناظر با تب کلیک شده
        const content = document.querySelector('.tab-content[data-tab-panel="' + target + '"]');
        if (content) {
          content.classList.add("active");
        }
      });
    });

    // =========================================================================
    // ۴. مدیریت انتخاب رنگ و حافظه و آپدیت زنده قیمت (AJAX)
    // =========================================================================
    const colorChips = document.querySelectorAll('[data-variant-color]');
    const memoryChips = document.querySelectorAll('[data-variant-memory]');
    const selectedColorInput = document.getElementById('selected-color');
    const selectedMemoryInput = document.getElementById('selected-memory');

    /**
     * تابع ارسال درخواست به بک‌اند جنگو برای دریافت قیمت واریانت جدید
     */
    function fetchVariantPrice() {
      // دریافت آدرس ویوی جنگو و شناسه محصول از المان‌های HTML
      const urlInput = document.getElementById('variant-price-url');
      const priceSpan = document.getElementById('variant-price');
      
      if (!urlInput || !priceSpan) return;

      const url = urlInput.value;
      const productId = priceSpan.getAttribute('data-product-id');
      
      // دریافت مقادیر فعلی انتخاب شده توسط کاربر
      const color = selectedColorInput ? selectedColorInput.value : "";
      const memory = selectedMemoryInput ? selectedMemoryInput.value : "";

      if (!productId) return;

      // ساخت پارامترهای درخواست (Query Params)
      const params = new URLSearchParams({
        product: productId,
        color: color,
        memory: memory
      });

      // ارسال درخواست به سرور به صورت زنده
      fetch(`${url}?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
          // اگر قیمت با موفقیت از بک‌اند برگشت
          if (data.price !== undefined) {
             // تبدیل عدد به فرمت استاندارد فارسی با جداکننده هزارگان
             priceSpan.textContent = Number(data.price).toLocaleString("fa-IR") + " تومان";
          } else {
             // اگر واریانت با این ترکیب وجود نداشت یا ناموجود بود
             priceSpan.textContent = "ناموجود / تماس بگیرید";
          }
        })
        .catch(err => console.error("خطا در دریافت قیمت جدید:", err));
    }

    // اختصاص رویداد کلیک به دکمه‌های رنگ
    colorChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        // تغییر ظاهر دکمه‌های رنگ
        colorChips.forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        
        if (selectedColorInput) {
          // آپدیت مقدار فیلد مخفی برای ارسال فرم
          selectedColorInput.value = this.getAttribute("data-variant-color");
          // فراخوانی تابع آپدیت زنده قیمت
          fetchVariantPrice(); 
        }
      });
    });

    // اختصاص رویداد کلیک به دکمه‌های حافظه
    memoryChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        // تغییر ظاهر دکمه‌های حافظه
        memoryChips.forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        
        if (selectedMemoryInput) {
          // آپدیت مقدار فیلد مخفی (ارسال مقادیر true یا false)
          selectedMemoryInput.value = this.getAttribute("data-variant-memory");
          // فراخوانی تابع آپدیت زنده قیمت
          fetchVariantPrice(); 
        }
      });
    });
  }

  // اکسپورت کردن تابع init برای اجرا در فایل اصلی اپلیکیشن
  window.PageProduct = {
    init
  };
})();