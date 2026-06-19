/* ── iPhone Tasviri Wizard ────────────────────────────────────── */
(function () {

  const STEPS = [
    {
      key: 'screenSize',
      question: 'اندازه صفحه نمایش رو انتخاب کن',
      icon: 'bi-display',
      options: [
        { value: '4.3', label: '۴.۳ اینچ', sub: 'اقتصادی و کوچک',     icon: 'assets/images/products/iphone.svg' },
        { value: '5',   label: '۵ اینچ',   sub: 'میانی و محبوب',        icon: 'assets/images/products/iphone.svg' },
        { value: '7',   label: '۷ اینچ',   sub: 'استاندارد پرفروش',     icon: 'assets/images/products/iphone.svg' },
        { value: '9',   label: '۹ اینچ',   sub: 'لمسی و لوکس',          icon: 'assets/images/products/iphone.svg' }
      ]
    },
    {
      key: 'hasMemory',
      question: 'حافظه داخلی نیاز داری؟',
      icon: 'bi-hdd',
      options: [
        { value: false, label: 'بدون حافظه', sub: 'فقط مشاهده زنده',             icon: 'assets/images/products/panel.svg' },
        { value: true,  label: 'با حافظه',   sub: 'ذخیره تصویر مراجعه‌کننده',  icon: 'assets/images/products/accessory.svg' }
      ]
    },
    {
      key: 'unitType',
      question: 'آیفون رو برای چند واحد نیاز داری؟',
      icon: 'bi-buildings',
      options: [
        { value: 'monitor-only', label: 'فقط مانیتور',         sub: 'پنل قبلاً نصب شده',            icon: 'assets/images/products/iphone.svg' },
        { value: 'pack-1',       label: 'پک یک واحدی',          sub: 'مانیتور + پنل + متعلقات',      icon: 'assets/images/products/package.svg' },
        { value: 'pack-2',       label: 'پک دو واحدی',          sub: '۲ مانیتور + پنل مشترک',        icon: 'assets/images/products/package.svg' },
        { value: 'pack-3',       label: 'پک سه واحدی',          sub: '۳ مانیتور + پنل چند واحدی',   icon: 'assets/images/products/package.svg' },
        { value: 'pack-4',       label: 'پک چهار واحدی',        sub: '۴ مانیتور + پنل پیشرفته',     icon: 'assets/images/products/package.svg' }
      ]
    }
  ];

  let currentStep = 0;
  let answers = {};
  let allProducts = [];
  let isTransitioning = false;
  let hasStarted = false;

  async function init() {
    const wizardEl = document.getElementById('wizard-root');
    if (!wizardEl) return;
    try {
      const data = await window.SiteDataService.request('assets/data/products.json');
      allProducts = (data.products || []).filter(p => p.category === 'iphone-tasviri');
    } catch (e) { allProducts = []; }

    wizardEl.classList.add('wizard-section--collapsed');
    wizardEl.setAttribute('aria-hidden', 'true');

    document.querySelectorAll('[data-wizard-start]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        startWizard(true);
      });
    });

    if (window.location.hash === '#wizard-root') {
      setTimeout(() => startWizard(true), 180);
    }
  }

  function startWizard(shouldScroll) {
    const wizardEl = document.getElementById('wizard-root');
    if (!wizardEl) return;

    wizardEl.classList.remove('wizard-section--collapsed');
    wizardEl.classList.add('wizard-section--open');
    wizardEl.setAttribute('aria-hidden', 'false');

    if (!hasStarted) {
      hasStarted = true;
      currentStep = 0;
      answers = {};
      renderStep(1);
    }

    if (shouldScroll) {
      setTimeout(() => {
        wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }

  /* Build the inner HTML for the current step */
  function buildStepHTML() {
    if (currentStep >= STEPS.length) return null;
    const step = STEPS[currentStep];

    const dotHTML = STEPS.map((_, i) => {
      const cls = i < currentStep ? 'done' : i === currentStep ? 'active' : '';
      return `
        <span class="wiz-step-node ${cls}">
          <span class="wiz-step-circle">
            ${i < currentStep ? '<i class="bi bi-check-lg"></i>' : String(i + 1)}
          </span>
        </span>`;
    }).join('');

    return `
      <div class="wizard-card">
        <div class="wiz-steps-row">${dotHTML}</div>
        <div class="wizard-step-body">
          <div class="wizard-step-label">سوال ${toPersianNum(currentStep + 1)} از ${toPersianNum(STEPS.length)}</div>
          <div class="wizard-question">
            <i class="bi ${step.icon}"></i>${step.question}
          </div>
          <div class="wizard-options">
            ${step.options.map(opt => `
              <button type="button" class="wizard-option" data-value="${opt.value}">
                <img class="wiz-opt-img" src="${opt.icon}" alt="${opt.label}">
                <div class="wiz-opt-text">
                  <span class="wiz-opt-label">${opt.label}</span>
                  <span class="wiz-opt-sub">${opt.sub}</span>
                </div>
                <i class="bi bi-check-circle-fill wiz-check"></i>
              </button>`).join('')}
          </div>
          <div class="wizard-nav">
            ${currentStep > 0
              ? '<button type="button" class="wiz-back-btn" id="wiz-back"><i class="bi bi-chevron-right"></i> قبلی</button>'
              : '<span></span>'}
            <button type="button" class="wiz-next-btn" id="wiz-next" disabled>
              ${currentStep < STEPS.length - 1
                ? 'بعدی <i class="bi bi-chevron-left"></i>'
                : 'مشاهده محصولات <i class="bi bi-arrow-left"></i>'}
            </button>
          </div>
        </div>
      </div>`;
  }

  function attachListeners(wizardEl) {
    const step = STEPS[currentStep];
    wizardEl.querySelectorAll('.wizard-option').forEach(btn => {
      btn.addEventListener('click', () => {
        wizardEl.querySelectorAll('.wizard-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('wiz-next').disabled = false;
        answers[step.key] = parseValue(btn.dataset.value);
      });
    });

    const nextBtn = document.getElementById('wiz-next');
    if (nextBtn) nextBtn.addEventListener('click', () => { if (!isTransitioning) transitionTo(currentStep + 1, 1); });

    const backBtn = document.getElementById('wiz-back');
    if (backBtn) backBtn.addEventListener('click', () => { if (!isTransitioning) transitionTo(currentStep - 1, -1); });
  }

  function animateStepperForward(wizardEl, nextStepIdx, onDone) {
    const nodes = Array.from(wizardEl.querySelectorAll('.wiz-step-node'));
    const currentNode = nodes[currentStep];
    const nextNode = nodes[nextStepIdx];

    if (!currentNode) {
      onDone();
      return;
    }

    currentNode.classList.add('completing');
    const circle = currentNode.querySelector('.wiz-step-circle');
    if (circle) {
      setTimeout(() => { circle.innerHTML = '<i class="bi bi-check-lg"></i>'; }, 150);
    }

    if (nextNode) {
      setTimeout(() => { nextNode.classList.add('line-filling'); }, 260);
      setTimeout(() => { nextNode.classList.add('activating'); }, 760);
      setTimeout(onDone, 980);
    } else {
      setTimeout(onDone, 620);
    }
  }

  /* Slide transition between steps */
  function transitionTo(nextStepIdx, dir) {
    const wizardEl = document.getElementById('wizard-root');
    if (!wizardEl) return;

    const existing = wizardEl.querySelector('.wizard-step-body');
    if (!existing) { currentStep = nextStepIdx; renderStep(dir); return; }

    isTransitioning = true;

    function swapContent() {
      existing.classList.add(dir > 0 ? 'wiz-exit-forward' : 'wiz-exit-back');

      setTimeout(() => {
        currentStep = nextStepIdx;
        if (currentStep >= STEPS.length) {
          renderResults();
        } else {
          renderStep(dir);
        }
        isTransitioning = false;
      }, 280);
    }

    if (dir > 0) {
      animateStepperForward(wizardEl, nextStepIdx, swapContent);
    } else {
      swapContent();
    }
  }

  function renderStep(dir) {
    const wizardEl = document.getElementById('wizard-root');
    if (!wizardEl || currentStep >= STEPS.length) return;

    wizardEl.innerHTML = buildStepHTML();

    const body = wizardEl.querySelector('.wizard-step-body');
    if (body) {
      body.classList.add(dir >= 0 ? 'wiz-enter-forward' : 'wiz-enter-back');
    }

    attachListeners(wizardEl);
  }

  function parseValue(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }

  function renderResults() {
    const wizardEl = document.getElementById('wizard-root');
    let results = allProducts.filter(p => {
      if (answers.screenSize && p.screenSize !== answers.screenSize) return false;
      if (answers.hasMemory !== undefined && p.hasMemory !== answers.hasMemory) return false;
      if (answers.unitType && p.unitType !== answers.unitType) return false;
      return true;
    });
    if (!results.length) results = allProducts.filter(p => {
      if (answers.screenSize && p.screenSize !== answers.screenSize) return false;
      if (answers.unitType && p.unitType !== answers.unitType) return false;
      return true;
    });
    if (!results.length) results = allProducts.filter(p => {
      if (answers.unitType && p.unitType !== answers.unitType) return false;
      return true;
    });
    if (!results.length) results = allProducts.slice(0, 4);

    wizardEl.innerHTML = `
      <div class="wizard-results wiz-enter-forward">
        <div class="wizard-results-head">
          <i class="bi bi-stars"></i>
          <div>
            <h3>محصولات پیشنهادی برای شما</h3>
            <p>${toPersianNum(results.length)} محصول مطابق با انتخاب شما</p>
          </div>
          <button type="button" class="wiz-restart-btn"
            onclick="document.getElementById('wizard-root').dispatchEvent(new CustomEvent('wiz-restart'))">
            <i class="bi bi-arrow-clockwise"></i> شروع دوباره
          </button>
        </div>
        <div class="wizard-results-grid" id="wiz-results-grid"></div>
      </div>`;

    const grid = document.getElementById('wiz-results-grid');
    if (grid) results.forEach(p => grid.appendChild(window.SiteComponents.createProductCard(p)));

    wizardEl.addEventListener('wiz-restart', () => {
      currentStep = 0; answers = {};
      hasStarted = true;
      renderStep(1);
      wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, { once: true });
  }

  function toPersianNum(n) {
    return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }

  window.WizardInit = init;
})();
