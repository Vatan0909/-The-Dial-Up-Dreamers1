/**
 * cart.js — سبد خرید فروشگاه الکتروصنعت امگا
 * ذخیره‌سازی با localStorage، قابل استفاده در تمام صفحات
 */

const Cart = (() => {
  const STORAGE_KEY = 'omega_cart';

  // ─── خواندن / نوشتن ────────────────────────────────────────────
  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    _notify();
  }

  // ─── عملیات اصلی ───────────────────────────────────────────────
  function addItem(product) {
    // product: { id, title, price, image, color?, storage? }
    const items = getItems();
    const key = _itemKey(product);
    const existing = items.find(i => _itemKey(i) === key);

    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 99);
    } else {
      items.push({ ...product, qty: 1 });
    }

    saveItems(items);
    _showToast(`«${product.title}» به سبد خرید اضافه شد`);
  }

  function removeItem(id, color, storage) {
    const items = getItems().filter(i => _itemKey(i) !== _makeKey(id, color, storage));
    saveItems(items);
  }

  function updateQty(id, color, storage, delta) {
    const items = getItems();
    const item = items.find(i => _itemKey(i) === _makeKey(id, color, storage));
    if (!item) return;

    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    saveItems(items);
  }

  function setQty(id, color, storage, qty) {
    const items = getItems();
    const item = items.find(i => _itemKey(i) === _makeKey(id, color, storage));
    if (!item) return;

    const val = parseInt(qty, 10);
    if (!isNaN(val) && val >= 1) {
      item.qty = Math.min(val, 99);
      saveItems(items);
    }
  }

  function clearCart() {
    saveItems([]);
  }

  // ─── محاسبات ───────────────────────────────────────────────────
  function getTotalCount() {
    return getItems().reduce((s, i) => s + i.qty, 0);
  }

  function getTotalPrice() {
    return getItems().reduce((s, i) => s + i.price * i.qty, 0);
  }

  // ─── رویداد (برای به‌روزرسانی badge هدر) ──────────────────────
  function _notify() {
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }

  // ─── کلید یکتا برای هر آیتم ────────────────────────────────────
  function _itemKey(item) {
    return _makeKey(item.id, item.color, item.storage);
  }
  function _makeKey(id, color, storage) {
    return `${id}__${color || ''}__${storage || ''}`;
  }

  // ─── Toast ──────────────────────────────────────────────────────
  function _showToast(msg) {
    let container = document.getElementById('cart-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cart-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `<i class="bi bi-cart-check"></i> ${msg}`;
    container.appendChild(toast);

    // انیمیشن ورود
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // ─── به‌روزرسانی badge هدر ─────────────────────────────────────
  function updateHeaderBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) {
      const count = getTotalCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  // شنیدن رویداد cart:updated برای به‌روزرسانی badge
  document.addEventListener('cart:updated', updateHeaderBadge);
  document.addEventListener('DOMContentLoaded', updateHeaderBadge);

  // ─── عمومی ─────────────────────────────────────────────────────
  return { addItem, removeItem, updateQty, setQty, clearCart, getItems, getTotalCount, getTotalPrice };
})();
