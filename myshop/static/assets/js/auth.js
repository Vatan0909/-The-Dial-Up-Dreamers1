/* ── Auth page JS ─────────────────────────────────────────────── */

let currentTab = 'register';
let loginMethod = 'otp';
let generatedRegOTP = '';
let generatedLoginOTP = '';

// ── Tab switching ────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.body.classList.toggle('auth-mode-login', tab === 'login');
  document.body.classList.toggle('auth-mode-register', tab === 'register');
  const shell = document.getElementById('auth-shell');
  if (shell) shell.dataset.authMode = tab;

  const doorSwitch = document.getElementById('auth-door-switch');
  if (doorSwitch) doorSwitch.dataset.mode = tab;

  document.querySelectorAll('.auth-door-target').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  const doorText = document.getElementById('auth-door-text');
  const doorIcon = document.getElementById('auth-door-icon');
  if (doorText) doorText.textContent = tab === 'login' ? 'ورود' : 'ثبت‌نام';
  if (doorIcon) doorIcon.className = tab === 'login'
    ? 'bi bi-box-arrow-in-right'
    : 'bi bi-door-open-fill';

  const modeBadge = document.getElementById('auth-mode-badge');
  const modeTitle = document.getElementById('auth-mode-title');
  const modeSubtitle = document.getElementById('auth-mode-subtitle');
  if (modeBadge) modeBadge.textContent = tab === 'login' ? 'ورود امن' : 'حساب جدید';
  if (modeTitle) modeTitle.textContent = tab === 'login' ? 'ورود به حساب امگا' : 'ثبت‌نام در امگا';
  if (modeSubtitle) {
    modeSubtitle.textContent = tab === 'login'
      ? 'با شماره موبایل و کد تایید یا رمز عبور وارد حساب خود شوید.'
      : 'شماره موبایل را وارد کنید تا حساب شما با کد تایید ساخته شود.';
  }

  document.getElementById('register-flow').style.display = tab === 'register' ? '' : 'none';
  document.getElementById('login-flow').style.display = tab === 'login' ? '' : 'none';
}

function toggleDoor() {
  switchTab(currentTab === 'register' ? 'login' : 'register');
}

function normalizePhoneValue(value) {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  let normalized = String(value || '').replace(/[۰-۹٠-٩]/g, ch => {
    const faIndex = fa.indexOf(ch);
    if (faIndex >= 0) return String(faIndex);
    const arIndex = ar.indexOf(ch);
    return arIndex >= 0 ? String(arIndex) : ch;
  }).replace(/\D/g, '');

  if (normalized.startsWith('98') && normalized.length > 10) {
    normalized = normalized.slice(2);
  }
  if (normalized.startsWith('0') && normalized.length > 10) {
    normalized = normalized.slice(1);
  }
  return normalized.slice(0, 10);
}

// ── OTP Generation ───────────────────────────────────────────
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Register flow ────────────────────────────────────────────
function sendRegOTP() {
  const phone = document.getElementById('reg-phone').value.trim();
  if (phone.length < 10) {
    shakeElement(document.querySelector('.phone-input-wrap'));
    return;
  }
  generatedRegOTP = generateOTP();
  document.getElementById('reg-otp-code').textContent = generatedRegOTP;
  document.getElementById('reg-otp-hint').style.display = 'flex';
  goRegStep(2);
  setTimeout(() => focusFirstOTP('reg-otp-boxes'), 200);
}

let _currentRegStep = 1;
function goRegStep(n) {
  const dir = n > _currentRegStep ? 1 : -1;
  _currentRegStep = n;
  [1, 2, 3].forEach(i => {
    const el = document.getElementById('reg-step-' + i);
    if (!el) return;
    if (i === n) {
      el.style.display = 'block';
      el.classList.add('active');
      el.classList.remove('step-enter-fwd', 'step-enter-back');
      void el.offsetWidth;
      el.classList.add(dir > 0 ? 'step-enter-fwd' : 'step-enter-back');
    } else {
      el.classList.remove('active', 'step-enter-fwd', 'step-enter-back');
    }
  });
}

function completeRegister() {
  const p1 = document.getElementById('reg-pass').value;
  const p2 = document.getElementById('reg-pass2').value;
  if (p1.length < 6) {
    shakeElement(document.getElementById('reg-pass'));
    return;
  }
  if (p1 !== p2) {
    shakeElement(document.getElementById('reg-pass2'));
    return;
  }
  // Simulate successful registration → redirect home
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

// ── Login flow ───────────────────────────────────────────────
function setLoginMethod(method) {
  loginMethod = method;
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.method === method);
  });
  const passField = document.getElementById('login-pass-field');
  const sub = document.getElementById('login-step-sub');
  if (method === 'password') {
    passField.style.display = '';
    sub.textContent = 'شماره موبایل و رمز عبور خود را وارد کنید';
  } else {
    passField.style.display = 'none';
    sub.textContent = 'شماره موبایل خود را وارد کنید';
  }
}

function loginAction() {
  const phone = document.getElementById('login-phone').value.trim();
  if (phone.length < 10) {
    shakeElement(document.querySelector('#login-step-1 .phone-input-wrap'));
    return;
  }
  if (loginMethod === 'password') {
    const pass = document.getElementById('login-pass').value;
    if (pass.length < 1) {
      shakeElement(document.getElementById('login-pass'));
      return;
    }
    // Simulate login
    setTimeout(() => { window.location.href = 'index.html'; }, 400);
  } else {
    generatedLoginOTP = generateOTP();
    document.getElementById('login-otp-code').textContent = generatedLoginOTP;
    document.getElementById('login-otp-hint').style.display = 'flex';
    goLoginStep(2);
    setTimeout(() => focusFirstOTP('login-otp-boxes'), 200);
  }
}

let _currentLoginStep = 1;
function goLoginStep(n) {
  const dir = n > _currentLoginStep ? 1 : -1;
  _currentLoginStep = n;
  [1, 2].forEach(i => {
    const el = document.getElementById('login-step-' + i);
    if (!el) return;
    if (i === n) {
      el.style.display = 'block';
      el.classList.add('active');
      el.classList.remove('step-enter-fwd', 'step-enter-back');
      void el.offsetWidth;
      el.classList.add(dir > 0 ? 'step-enter-fwd' : 'step-enter-back');
    } else {
      el.classList.remove('active', 'step-enter-fwd', 'step-enter-back');
    }
  });
}

// ── OTP Boxes logic ──────────────────────────────────────────
function focusFirstOTP(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const boxes = container.querySelectorAll('.otp-box');
  if (boxes.length) boxes[0].focus();
  initOTPBoxes(container);
}

function initOTPBoxes(container) {
  const boxes = Array.from(container.querySelectorAll('.otp-box'));
  const checkEl = container.closest('.auth-step, .otp-wrapper')
                            ?.querySelector('.otp-check')
                 || container.parentElement.querySelector('.otp-check');

  boxes.forEach((box, idx) => {
    // Remove old listeners by cloning
    const fresh = box.cloneNode(true);
    box.parentNode.replaceChild(fresh, box);
    boxes[idx] = fresh;
  });

  boxes.forEach((box, idx) => {
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace') {
        if (!box.value && idx > 0) {
          boxes[idx - 1].focus();
          boxes[idx - 1].value = '';
          boxes[idx - 1].classList.remove('filled');
        } else {
          box.value = '';
          box.classList.remove('filled');
        }
        e.preventDefault();
      }
    });

    box.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, '').slice(-1);
      box.value = val;
      box.classList.toggle('filled', val !== '');
      if (val && idx < boxes.length - 1) {
        boxes[idx + 1].focus();
      }
      checkAllFilled(boxes, checkEl, container);
    });

    box.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      boxes.forEach((b, i) => {
        b.value = text[i] || '';
        b.classList.toggle('filled', !!b.value);
      });
      checkAllFilled(boxes, checkEl, container);
    });
  });
}

function checkAllFilled(boxes, checkEl, container) {
  const values = boxes.map(b => b.value);
  if (values.every(v => v !== '')) {
    triggerOTPSuccess(boxes, checkEl, container);
  }
}

function triggerOTPSuccess(boxes, checkEl, container) {
  // 1. Shake all boxes
  boxes.forEach(box => {
    box.classList.add('shaking');
    box.setAttribute('readonly', true);
  });

  setTimeout(() => {
    boxes.forEach(box => box.classList.remove('shaking'));

    // 2. Merge to center
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    boxes.forEach(box => {
      const boxRect = box.getBoundingClientRect();
      const boxCenterX = boxRect.left + boxRect.width / 2;
      const tx = centerX - boxCenterX;
      box.style.setProperty('--tx', tx + 'px');
      box.classList.add('merging');
    });

    // 3. Show checkmark
    setTimeout(() => {
      if (checkEl) {
        container.style.visibility = 'hidden';
        checkEl.classList.add('visible');
      }

      // 4. Proceed
      setTimeout(() => {
        const isReg = container.id === 'reg-otp-boxes';
        if (isReg) {
          goRegStep(3);
        } else {
          // login success
          window.location.href = 'index.html';
        }
      }, 800);
    }, 500);
  }, 550);
}

// ── Shake utility ────────────────────────────────────────────
function shakeElement(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'otpShake 0.45s ease-in-out';
  setTimeout(() => { el.style.animation = ''; }, 500);
}

// ── Init on load ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  switchTab(currentTab);

  // Phone input: digits only
  ['reg-phone', 'login-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = normalizePhoneValue(el.value);
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (id === 'reg-phone') sendRegOTP();
        else loginAction();
      }
    });
  });
});
