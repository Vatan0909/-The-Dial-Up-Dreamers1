/* ── iPhone Tasviri Wizard ────────────────────────────────────── */
(function () {

  const STEPS = [
    {
      key: 'screenSize',
      question: 'اندازه صفحه نمایش رو انتخاب کن',
      hint: 'بر اساس فضای موجود و نیاز خود یک اندازه انتخاب کن.',
      icon: 'bi-display',
      image: 'assets/images/wizard/wizard-iphone-screen.png',
      fallback: 'assets/images/iphone_tasviri_home.png',
      imageAlt: 'انتخاب اندازه صفحه آیفون تصویری',
      options: [
        { value: '4.3', label: '۴.۳ اینچ', sub: 'اقتصادی و کوچک' },
        { value: '7',   label: '۷ اینچ',   sub: 'استاندارد پرفروش' },
        { value: '9',   label: 'همه‌ی اندازه‌ها',   sub: ' '}
      ]
    },
    {
      key: 'hasMemory',
      question: 'حافظه داخلی نیاز داری؟',
      hint: 'با حافظه می‌تونی تصویر مراجعه‌کننده رو ذخیره کنی.',
      icon: 'bi-hdd',
      image: 'assets/images/wizard/wizard-iphone-memory.png',
      fallback: 'assets/images/iphone_tasviri_home.png',
      imageAlt: 'انتخاب حافظه آیفون تصویری',
      options: [
        { value: false, label: 'بدون حافظه', sub: 'فقط مشاهده زنده' },
        { value: true,  label: 'با حافظه',   sub: 'ذخیره تصویر مراجعه‌کننده' }
      ]
    },
    {
      key: 'unitType',
      question: 'آیفون رو برای چند واحد نیاز داری؟',
      hint: 'تعداد واحد ساختمان مورد نظرت رو مشخص کن.',
      icon: 'bi-buildings',
      image: 'assets/images/wizard/wizard-iphone-units.png',
      fallback: 'assets/images/iphone_tasviri_home.png',
      imageAlt: 'انتخاب تعداد واحد',
      options: [
        { value: 'monitor-only', label: 'فقط مانیتور',   sub: 'پنل قبلاً نصب شده' },
        { value: 'pack-1',       label: 'پک یک واحدی',   sub: 'مانیتور + پنل + متعلقات' },
        { value: 'pack-2',       label: 'پک دو واحدی',   sub: '۲ مانیتور + پنل مشترک' },
        { value: 'pack-3',       label: 'پک سه واحدی',   sub: '۳ مانیتور + پنل چند واحدی' },
        { value: 'pack-4',       label: 'پک چهار واحدی', sub: '۴ مانیتور + پنل چند واحدی' }
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

    wizardEl.classList.add('wizard-section--collapsed');
    wizardEl.setAttribute('aria-hidden', 'true');

    try {
      const data = await window.SiteDataService.request('assets/data/products.json');
      allProducts = (data.products || []).filter(p => p.category === 'iphone-tasviri');
    } catch (e) { allProducts = []; }

    document.querySelectorAll('[data-wizard-start]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        startWizard(true);
      });
    });

    if (window.location.hash === '#wizard-root') {
      setTimeout(function () { startWizard(true); }, 180);
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
      renderStep(1);
    }

    if (shouldScroll) {
      setTimeout(function () { wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    }
  }

  function buildStepper() {
    return STEPS.map((step, index) => {
      const stateClass = index < currentStep ? 'done' : index === currentStep ? 'active' : '';
      const content = index < currentStep ? '<i class="bi bi-check-lg"></i>' : toPersianNum(index + 1);
      return `<span class="wiz-step-node ${stateClass}" aria-label="مرحله ${toPersianNum(index + 1)}">
          <span class="wiz-step-circle">${content}</span>
        </span>`;
    }).join('');
  }

  function buildStepHTML() {
    if (currentStep >= STEPS.length) return null;
    const step = STEPS[currentStep];
    const progress = Math.round((currentStep / STEPS.length) * 100);
    const edge = (50 / STEPS.length).toFixed(3);

    return `
      <div class="wizard-card" style="--wizard-steps:${STEPS.length};--wizard-edge:${edge}%">
        <div class="wiz-steps-row">${buildStepper()}</div>
        <div class="wizard-step-body">
          <div class="wizard-step-layout">
            <div class="wizard-step-content">
              <div class="wizard-step-label">سوال ${toPersianNum(currentStep + 1)} از ${toPersianNum(STEPS.length)}</div>
              <div class="wizard-question"><i class="bi ${step.icon}"></i>${step.question}</div>
              <p class="wizard-question-hint">${step.hint}</p>
              <div class="wizard-progress-wrap">
                <div class="wizard-progress-bar" style="width:${progress}%"></div>
              </div>
              <div class="wizard-options">
                ${step.options.map((opt, oi) => `
                  <button type="button" class="wizard-option" data-value="${opt.value}" style="--option-index:${oi}">
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
            <div class="wizard-step-visual" aria-hidden="true">
              <span class="wizard-visual-orbit wizard-visual-orbit--one"></span>
              <span class="wizard-visual-orbit wizard-visual-orbit--two"></span>
              <img src="${step.image}" data-fallback="${step.fallback}" alt="${step.imageAlt}"
                   onerror="this.onerror=null;this.src=this.dataset.fallback">
              <span class="wizard-visual-caption">${step.imageAlt}</span>
            </div>
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
        const nextBtn = document.getElementById('wiz-next');
        if (nextBtn) nextBtn.disabled = false;
        answers[step.key] = parseValue(btn.dataset.value);
      });
    });

    const nextBtn = document.getElementById('wiz-next');
    if (nextBtn) nextBtn.addEventListener('click', () => { if (!isTransitioning) transitionTo(currentStep + 1, 1); });

    const backBtn = document.getElementById('wiz-back');
    if (backBtn) backBtn.addEventListener('click', () => { if (!isTransitioning) transitionTo(currentStep - 1, -1); });
  }

  function animateStepperForward(wizardEl, nextStepIndex, onDone) {
    const nodes = Array.from(wizardEl.querySelectorAll('.wiz-step-node'));
    const currentNode = nodes[currentStep];
    if (!currentNode) return onDone();

    currentNode.classList.add('completing');
    const circle = currentNode.querySelector('.wiz-step-circle');
    if (circle) setTimeout(() => { circle.innerHTML = '<i class="bi bi-check-lg"></i>'; }, 150);

    const nextNode = nodes[nextStepIndex];
    if (nextNode) {
      setTimeout(() => nextNode.classList.add('line-filling'), 260);
      setTimeout(() => nextNode.classList.add('activating'), 760);
      setTimeout(onDone, 980);
    } else {
      setTimeout(onDone, 620);
    }
  }

  function transitionTo(nextStepIdx, dir) {
    const wizardEl = document.getElementById('wizard-root');
    if (!wizardEl) return;

    const body = wizardEl.querySelector('.wizard-step-body');
    if (!body) { currentStep = nextStepIdx; renderStep(dir); return; }

    isTransitioning = true;
    const swap = () => {
      body.classList.add(dir > 0 ? 'wiz-exit-forward' : 'wiz-exit-back');
      setTimeout(() => {
        currentStep = nextStepIdx;
        if (currentStep >= STEPS.length) {
          renderResults();
        } else {
          renderStep(dir);
        }
        isTransitioning = false;
      }, 280);
    };

    if (dir > 0) animateStepperForward(wizardEl, nextStepIdx, swap);
    else swap();
  }

  function renderStep(dir) {
    const wizardEl = document.getElementById('wizard-root');
    if (!wizardEl || currentStep >= STEPS.length) return;

    wizardEl.innerHTML = buildStepHTML();

    const body = wizardEl.querySelector('.wizard-step-body');
    if (body) body.classList.add(dir >= 0 ? 'wiz-enter-forward' : 'wiz-enter-back');

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

    wizardEl.addEventListener('wiz-restart', function () {
      currentStep = 0; answers = {};
      renderStep(1);
      wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, { once: true });
  }

  function toPersianNum(n) {
    return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }

  window.WizardInit = init;
})();
