/**
 * page-cart.js — منطق صفحه سبد خرید
 * وابسته به cart.js
 */

// کدهای تخفیف نمونه
const VALID_COUPONS = {
  'OMEGA10': { discount: 10, label: '۱۰٪ تخفیف اعمال شد' },
  'OMEGA20': { discount: 20, label: '۲۰٪ تخفیف اعمال شد' },
  'FREESHIP': { discount: 0, freeShip: true, label: 'ارسال رایگان فعال شد' },
};

let activeCoupon = null;

// ─── رندر اصلی ────────────────────────────────────────────────
function renderCart() {
  const items = Cart.getItems();
  const isEmpty = items.length === 0;

  document.getElementById('cart-layout').style.display = isEmpty ? 'none' : '';
  document.getElementById('cart-empty').style.display  = isEmpty ? 'flex' : 'none';

  if (isEmpty) return;

  // تعداد
  const countEl = document.getElementById('cart-items-count');
  if (countEl) countEl.textContent = `${items.length} کالا`;

  // لیست آیتم‌ها
  const list = document.getElementById('cart-items-list');
  list.innerHTML = items.map(item => renderItem(item)).join('');

  // رویدادها
  list.querySelectorAll('.qty-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id, color, storage, dir } = btn.dataset;
      Cart.updateQty(id, color, storage, dir === '+' ? 1 : -1);
    });
  });

  list.querySelectorAll('.qty-value[data-input]').forEach(input => {
    input.addEventListener('change', () => {
      const { id, color, storage } = input.dataset;
      Cart.setQty(id, color, storage, input.value);
    });
  });

  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id, color, storage } = btn.dataset;
      Cart.removeItem(id, color, storage);
    });
  });

  updateSummary();
}

function renderItem(item) {
  const subtotal = (item.price * item.qty).toLocaleString('fa-IR');
  const unitPrice = item.price.toLocaleString('fa-IR');
  const metaParts = [];
  if (item.color)   metaParts.push(`<span><i class="bi bi-circle-fill" style="font-size:0.6rem;color:#888"></i> رنگ: ${item.color}</span>`);
  if (item.storage) metaParts.push(`<span><i class="bi bi-hdd"></i> حافظه: ${item.storage}</span>`);

  return `
    <div class="cart-item">
      <img class="cart-item-img"
           src="${item.image || 'assets/images/placeholder.jpg'}"
           alt="${item.title}"
           onerror="this.src='assets/images/placeholder.jpg'">

      <div class="cart-item-body">
        <p class="cart-item-title">${item.title}</p>
        ${metaParts.length ? `<div class="cart-item-meta">${metaParts.join('')}</div>` : ''}
        <div class="cart-item-price">${unitPrice} تومان</div>
      </div>

      <div class="cart-item-controls">
        <div class="qty-wrap">
          <button class="qty-btn" data-dir="-"
                  data-id="${item.id}" data-color="${item.color||''}" data-storage="${item.storage||''}"
                  aria-label="کاهش تعداد" type="button">
            <i class="bi bi-dash"></i>
          </button>
          <input class="qty-value" type="number" value="${item.qty}" min="1" max="99"
                 data-input="1"
                 data-id="${item.id}" data-color="${item.color||''}" data-storage="${item.storage||''}"
                 aria-label="تعداد">
          <button class="qty-btn" data-dir="+"
                  data-id="${item.id}" data-color="${item.color||''}" data-storage="${item.storage||''}"
                  aria-label="افزایش تعداد" type="button">
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:0.75rem">
          <span style="font-size:0.88rem;color:var(--brand-blue);font-weight:700">
            جمع: ${subtotal} تومان
          </span>
          <button class="remove-btn" type="button"
                  data-id="${item.id}" data-color="${item.color||''}" data-storage="${item.storage||''}">
            <i class="bi bi-trash3"></i> حذف
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── خلاصه قیمت ───────────────────────────────────────────────
function updateSummary() {
  const subtotal = Cart.getTotalPrice();
  let discount = 0;
  let freeShip = false;

  if (activeCoupon) {
    if (activeCoupon.freeShip) freeShip = true;
    if (activeCoupon.discount) discount = Math.round(subtotal * activeCoupon.discount / 100);
  }

  const total = subtotal - discount;

  document.getElementById('summary-subtotal').textContent =
    subtotal.toLocaleString('fa-IR') + ' تومان';

  const shippingEl = document.getElementById('summary-shipping');
  shippingEl.textContent = freeShip ? 'رایگان' : 'رایگان';
  shippingEl.className = 'summary-free';

  // ردیف تخفیف اختیاری
  let discountRow = document.getElementById('summary-discount-row');
  if (discount > 0) {
    if (!discountRow) {
      discountRow = document.createElement('div');
      discountRow.className = 'summary-row';
      discountRow.id = 'summary-discount-row';
      document.getElementById('summary-rows').insertBefore(
        discountRow,
        document.querySelector('.summary-total-row')
      );
    }
    discountRow.innerHTML = `<span>تخفیف (${activeCoupon.discount}٪)</span>
      <span style="color:#c0392b">- ${discount.toLocaleString('fa-IR')} تومان</span>`;
  } else if (discountRow) {
    discountRow.remove();
  }

  document.getElementById('summary-total').textContent =
    total.toLocaleString('fa-IR') + ' تومان';
}

// ─── کد تخفیف ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const couponBtn = document.getElementById('coupon-btn');
  const couponInput = document.getElementById('coupon-input');
  const couponMsg = document.getElementById('coupon-msg');

  couponBtn?.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) {
      couponMsg.textContent = 'کد تخفیف را وارد کنید.';
      couponMsg.className = 'coupon-msg error';
      return;
    }
    const coupon = VALID_COUPONS[code];
    if (coupon) {
      activeCoupon = coupon;
      couponMsg.textContent = coupon.label;
      couponMsg.className = 'coupon-msg success';
      couponBtn.textContent = 'تغییر';
      updateSummary();
    } else {
      activeCoupon = null;
      couponMsg.textContent = 'کد تخفیف معتبر نیست.';
      couponMsg.className = 'coupon-msg error';
      updateSummary();
    }
  });

  // ─── پرداخت ──────────────────────────────────────────────────
  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('payment-modal');
  const modalClose = document.getElementById('modal-close');

  checkoutBtn?.addEventListener('click', () => {
    if (Cart.getTotalCount() === 0) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // مرحله ۱ ← ۲
  document.getElementById('modal-step1-btn')?.addEventListener('click', () => {
    if (!validateForm()) return;
    showStep(2);
    renderModalSummary();
  });

  // انتخاب روش پرداخت
  document.querySelectorAll('.payment-method').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
    });
  });

  // بازگشت
  document.getElementById('modal-back-btn')?.addEventListener('click', () => showStep(1));

  // تأیید پرداخت
  document.getElementById('modal-pay-btn')?.addEventListener('click', () => {
    showStep(3);
    const code = 'OMG-' + Date.now().toString().slice(-7);
    document.getElementById('success-order-code').textContent = 'کد پیگیری: ' + code;
    Cart.clearCart();
  });

  // ─── رویداد cart:updated ──────────────────────────────────────
  document.addEventListener('cart:updated', renderCart);

  // رندر اولیه
  renderCart();
});

// ─── اعتبارسنجی فرم ───────────────────────────────────────────
function validateForm() {
  const name    = document.getElementById('f-name')?.value.trim();
  const phone   = document.getElementById('f-phone')?.value.trim();
  const address = document.getElementById('f-address')?.value.trim();
  const postal  = document.getElementById('f-postal')?.value.trim();
  const errEl   = document.getElementById('form-error');

  if (!name) {
    showFormError(errEl, 'نام و نام‌خانوادگی را وارد کنید.'); return false;
  }
  if (!/^09[0-9]{9}$/.test(phone)) {
    showFormError(errEl, 'شماره موبایل معتبر وارد کنید (مثل: 09123456789).'); return false;
  }
  if (address.length < 10) {
    showFormError(errEl, 'آدرس کامل را وارد کنید.'); return false;
  }
  if (!/^\d{10}$/.test(postal)) {
    showFormError(errEl, 'کد پستی باید ۱۰ رقم باشد.'); return false;
  }

  errEl.style.display = 'none';
  return true;
}

function showFormError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// ─── مدیریت مراحل مودال ───────────────────────────────────────
function showStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`modal-step-${i}`);
    if (el) el.style.display = i === n ? '' : 'none';
  });
}

function renderModalSummary() {
  const items = Cart.getItems();
  const subtotal = Cart.getTotalPrice();
  let discount = 0;
  if (activeCoupon?.discount) discount = Math.round(subtotal * activeCoupon.discount / 100);
  const total = subtotal - discount;

  const el = document.getElementById('modal-order-summary');
  if (!el) return;

  const rows = items.slice(0, 3).map(i =>
    `<div class="summary-row">
      <span>${i.title.substring(0, 28)}${i.title.length > 28 ? '…' : ''} × ${i.qty}</span>
      <span>${(i.price * i.qty).toLocaleString('fa-IR')} تومان</span>
    </div>`
  ).join('');

  const moreRow = items.length > 3
    ? `<div class="summary-row" style="color:var(--text-secondary);font-size:0.82rem">
        <span>و ${items.length - 3} کالای دیگر…</span></div>` : '';

  el.innerHTML = `
    ${rows}${moreRow}
    <div class="summary-row summary-total-row">
      <span>مبلغ قابل پرداخت</span>
      <span style="color:var(--brand-blue);font-weight:700">${total.toLocaleString('fa-IR')} تومان</span>
    </div>
  `;
}
