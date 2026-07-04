let currentTab = 'register';
let loginMethod = 'otp';

function getOtpValue(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return '';
  return Array.from(container.querySelectorAll('.otp-box')).map(box => box.value.trim()).join('');
}

function wireOtpContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const hidden = container.querySelector('input[type="hidden"]');
  const boxes = Array.from(container.querySelectorAll('.otp-box'));

  const sync = () => {
    if (hidden) hidden.value = getOtpValue(containerId);
  };

  boxes.forEach((box, index) => {
    box.addEventListener('input', e => {
      const value = e.target.value.replace(/\D/g, '').slice(-1);
      box.value = value;
      if (value && index < boxes.length - 1) boxes[index + 1].focus();
      sync();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && index > 0) {
        boxes[index - 1].focus();
        boxes[index - 1].value = '';
        sync();
      }
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, boxes.length);
      boxes.forEach((b, i) => { b.value = digits[i] || ''; });
      const lastFilled = Math.min(digits.length, boxes.length - 1);
      boxes[lastFilled >= 0 ? lastFilled : 0].focus();
      sync();
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  document.body.classList.toggle('auth-mode-login', tab === 'login');
  document.body.classList.toggle('auth-mode-register', tab === 'register');
  const shell = document.getElementById('auth-shell');
  if (shell) shell.dataset.authMode = tab;
  const doorSwitch = document.getElementById('auth-door-switch');
  if (doorSwitch) doorSwitch.dataset.mode = tab;
  document.querySelectorAll('.auth-door-target').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  const doorText = document.getElementById('auth-door-text');
  const doorIcon = document.getElementById('auth-door-icon');
  if (doorText) doorText.textContent = tab === 'login' ? 'ورود' : 'ثبت‌نام';
  if (doorIcon) doorIcon.className = tab === 'login' ? 'bi bi-box-arrow-in-right' : 'bi bi-door-open-fill';
  const modeBadge = document.getElementById('auth-mode-badge');
  const modeTitle = document.getElementById('auth-mode-title');
  const modeSubtitle = document.getElementById('auth-mode-subtitle');
  if (modeBadge) modeBadge.textContent = tab === 'login' ? 'ورود امن' : 'حساب جدید';
  if (modeTitle) modeTitle.textContent = tab === 'login' ? 'ورود به حساب امگا' : 'ثبت‌نام در امگا';
  if (modeSubtitle) modeSubtitle.textContent = tab === 'login'
    ? 'با شماره موبایل و کد تایید یا رمز عبور وارد حساب خود شوید.'
    : 'شماره موبایل را وارد کنید تا حساب شما با کد تایید ساخته شود.';
  document.getElementById('register-flow').style.display = tab === 'register' ? '' : 'none';
  document.getElementById('login-flow').style.display = tab === 'login' ? '' : 'none';
}

function toggleDoor() {
  switchTab(currentTab === 'register' ? 'login' : 'register');
}

function setLoginMethod(method) {
  loginMethod = method;
  document.querySelectorAll('#login-method-toggle .method-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.method === method));
  const passField = document.getElementById('login-pass-field');
  const action = document.getElementById('login-action');
  const sub = document.getElementById('login-step-sub');
  const mainBtn = document.getElementById('login-main-btn');
  if (method === 'password') {
    if (passField) passField.style.display = '';
    if (action) action.value = 'login_password';
    if (sub) sub.textContent = 'شماره موبایل و رمز عبور خود را وارد کنید';
    if (mainBtn) mainBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> ورود';
  } else {
    if (passField) passField.style.display = 'none';
    if (action) action.value = 'login_send_otp';
    if (sub) sub.textContent = 'شماره موبایل خود را وارد کنید';
    if (mainBtn) mainBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> ادامه';
  }
}

function goRegStep(n) {
  document.querySelectorAll('#register-flow .auth-step').forEach((step, index) => {
    step.classList.toggle('active', index === (n - 1));
  });
}

function goLoginStep(n) {
  document.querySelectorAll('#login-flow .auth-step').forEach((step, index) => {
    step.classList.toggle('active', index === (n - 1));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  switchTab(window.AUTH_INITIAL_MODE || 'register');
  setLoginMethod(window.AUTH_LOGIN_METHOD || 'otp');
  goRegStep(Number(window.AUTH_REGISTER_STEP || 1));
  goLoginStep(Number(window.AUTH_LOGIN_STEP || 1));
  wireOtpContainer('reg-otp-boxes');
  wireOtpContainer('login-otp-boxes');

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll('[data-method]').forEach(btn => {
    btn.addEventListener('click', () => setLoginMethod(btn.dataset.method));
  });
  document.querySelectorAll('[data-back="register"]').forEach(btn => btn.addEventListener('click', () => goRegStep(1)));
  document.querySelectorAll('[data-back="login"]').forEach(btn => btn.addEventListener('click', () => goLoginStep(1)));
});
