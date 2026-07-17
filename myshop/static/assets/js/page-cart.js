document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.getElementById('csrf-token')?.value;
  
    async function fetchCartData() {
      try {
        const response = await fetch('/cart/api/data/');
        const data = await response.json();
        renderCart(data);
      } catch (err) {
        console.error("خطا در دریافت اطلاعات سبد خرید:", err);
      }
    }
  
    async function updateCartItem(itemId, action, value = 1) {
      try {
        const response = await fetch('/cart/update/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ item_id: itemId, action: action, value: value })
        });
        const data = await response.json();
        
        if (data.success) {
          fetchCartData(); 
        } else {
          alert(data.error || "خطا در بروزرسانی سبد خرید");
          fetchCartData(); 
        }
      } catch (err) {
        console.error("خطا:", err);
      }
    }
  
    async function removeCartItem(itemId) {
      try {
        const response = await fetch('/cart/remove/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ item_id: itemId })
        });
        const data = await response.json();
        if (data.success) {
          fetchCartData();
        } else {
          alert(data.error || "خطا در حذف محصول");
        }
      } catch (err) {
        console.error("خطا:", err);
      }
    }
  
    function renderCart(data) {
      const items = data.items;
      const isEmpty = items.length === 0;
  
      document.getElementById('cart-layout').style.display = isEmpty ? 'none' : 'flex';
      document.getElementById('cart-empty').style.display = isEmpty ? 'flex' : 'none';
  
      if (isEmpty) return;
  
      const countEl = document.getElementById('cart-items-count');
      if (countEl) countEl.textContent = `${data.total_count} کالا`;
  
      const list = document.getElementById('cart-items-list');
      list.innerHTML = items.map(item => renderItem(item)).join('');
  
      list.querySelectorAll('.qty-btn[data-dir]').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.dataset.id;
          const dir = btn.dataset.dir;
          updateCartItem(itemId, dir === '+' ? 'increase' : 'decrease');
        });
      });
  
      list.querySelectorAll('.qty-value[data-input]').forEach(input => {
        input.addEventListener('change', () => {
          updateCartItem(input.dataset.id, 'set', input.value);
        });
      });
  
      list.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          removeCartItem(btn.dataset.id);
        });
      });
  
      updateSummary(data.total_price);
    }
  
    function renderItem(item) {
      const subtotal = (item.price * item.qty).toLocaleString('fa-IR');
      const unitPrice = item.price.toLocaleString('fa-IR');
      
      const metaParts = [];
      
      // استایل‌دهی جدید برای نمایش رنگ و حافظه زیر هم
      if (item.color) {
          metaParts.push(`<span style="display:block; margin-bottom:4px; font-size:0.9rem;">
            <i class="bi bi-circle-fill" style="font-size:0.6rem;color:#888; margin-left:3px;"></i> رنگ: ${item.color}
          </span>`);
      }
      
      if (item.storage) {
          metaParts.push(`<span style="display:block; font-size:0.82rem; color:#666;">
            <i class="bi bi-hdd" style="margin-left:3px;"></i> حافظه: ${item.storage}
          </span>`);
      }
  
      return `
        <div class="cart-item">
          <img class="cart-item-img"
               src="${item.image || '/static/assets/images/placeholder.jpg'}"
               alt="${item.title}"
               onerror="this.src='/static/assets/images/placeholder.jpg'">
  
          <div class="cart-item-body">
            <p class="cart-item-title">${item.title}</p>
            ${metaParts.length ? `<div class="cart-item-meta" style="margin-top: 8px;">${metaParts.join('')}</div>` : ''}
            <div class="cart-item-price">${unitPrice} تومان</div>
            ${item.stock < 5 ? `<div style="color:#d32f2f; font-size:0.8rem; margin-top:5px">تنها ${item.stock} عدد در انبار باقیست</div>` : ''}
          </div>
  
          <div class="cart-item-controls">
            <div class="qty-wrap">
              <button class="qty-btn" data-dir="-" data-id="${item.item_id}" type="button"><i class="bi bi-dash"></i></button>
              <input class="qty-value" type="number" value="${item.qty}" min="1" max="${item.stock}" data-input="1" data-id="${item.item_id}">
              <button class="qty-btn" data-dir="+" data-id="${item.item_id}" type="button"><i class="bi bi-plus"></i></button>
            </div>
  
            <div style="display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:0.88rem;color:var(--brand-blue);font-weight:700">جمع: ${subtotal} تومان</span>
              <button class="remove-btn" type="button" data-id="${item.item_id}">
                <i class="bi bi-trash3"></i> حذف
              </button>
            </div>
          </div>
        </div>
      `;
    }
  
    function updateSummary(totalPrice) {
      document.getElementById('summary-subtotal').textContent = totalPrice.toLocaleString('fa-IR') + ' تومان';
      document.getElementById('summary-total').textContent = totalPrice.toLocaleString('fa-IR') + ' تومان';
    }

    // لاجیک نمایشی باکس کد تخفیف
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
      // در آینده این بخش باید از طریق Fetch API به بک‌اند جنگو متصل شود
      couponMsg.textContent = 'کد تخفیف در حال حاضر غیرفعال است.';
      couponMsg.className = 'coupon-msg error';
    });
  
    fetchCartData();
});