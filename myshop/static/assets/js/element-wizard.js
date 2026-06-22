/* Element customization wizard */
(function () {
  const LENGTH_PRESETS = [10, 20, 30, 50, 100, 200];
  const POWER_PRESETS = [500, 750, 1000, 1500, 2000];
  const STEPS = [
    {
      key: 'length',
      question: 'طول المنت رو چند سانتی‌متر می‌خوای؟',
      hint: 'اندازه دقیق المنت مدنظرت را تایپ کن.',
      icon: 'bi-rulers',
      image: 'assets/images/wizard/wizard-element-length.png',
      fallback: 'assets/images/products/element.svg',
      imageAlt: 'انتخاب طول المنت'
    },
    {
      key: 'power',
      question: 'توان المنت چند وات باشه؟',
      hint: 'توان مورد نظرت رو از بین گزینه‌های آماده انتخاب کن.',
      icon: 'bi-lightning-charge-fill',
      image: 'assets/images/wizard/wizard-element-power.png',
      fallback: 'assets/images/products/element.svg',
      imageAlt: 'انتخاب توان المنت'
    },
    {
      key: 'notes',
      question: 'توضیحات تکمیلی و شماره موبایل',
      hint: ' علاوه بر شماره موبایل، شکل، محل استفاده، نوع اتصال یا هر نکته مهم دیگه رو اینجا بنویس.',
      icon: 'bi-chat-square-text-fill',
      image: 'assets/images/wizard/wizard-element-notes.png',
      fallback: 'assets/images/products/accessory.svg',
      imageAlt: 'توضیحات تکمیلی سفارش المنت'
    },
    {
      key: 'upload',
      question: 'المنت خود را برای ما ارسال کنید',
      hint: 'از المنت مورد نظرت عکس بگیر و برای ما ارسال کن؛ ما مشابه اون رو برات می‌سازیم.',
      icon: 'bi-camera-fill',
      image: 'assets/images/element.png',
      fallback: 'assets/images/products/element.svg',
      imageAlt: 'ارسال تصویر المنت مورد نظر'
    },
    {
      key: 'summary',
      question: 'سفارش اختصاصی شما آماده‌ست',
      hint: ' ',
      icon: 'bi-check2-circle',
      image: 'assets/images/wizard/wizard-element-summary.png',
      fallback: 'assets/images/products/element.svg',
      imageAlt: 'خلاصه سفارش المنت'
    }
  ];

  let currentStep = 0;
  let answers = { length: null, power: null, notes: '', imageFile: null, imageName: '', imageUrl: '' };
  let answerMode = { length: '', power: '' };
  let isTransitioning = false;
  let hasStarted = false;

  function init() {
    const wizardEl = document.getElementById('element-wizard-root');
    if (!wizardEl) return;

    wizardEl.classList.add('wizard-section--collapsed');
    wizardEl.setAttribute('aria-hidden', 'true');

    document.querySelectorAll('[data-element-wizard-start]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        startWizard(true);
      });
    });

    if (window.location.hash === '#element-wizard-root') {
      setTimeout(() => startWizard(true), 180);
    }
  }

  function startWizard(shouldScroll) {
    const wizardEl = document.getElementById('element-wizard-root');
    if (!wizardEl) return;

    wizardEl.classList.remove('wizard-section--collapsed');
    wizardEl.classList.add('wizard-section--open');
    wizardEl.setAttribute('aria-hidden', 'false');

    if (!hasStarted) {
      hasStarted = true;
      renderStep(1);
    }

    if (shouldScroll) {
      setTimeout(() => wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  function buildStepper() {
    return STEPS.map((step, index) => {
      const stateClass = index < currentStep ? 'done' : index === currentStep ? 'active' : '';
      const content = index < currentStep ? '<i class="bi bi-check-lg"></i>' : toEnglishNum(index + 1);
      return `
        <span class="wiz-step-node ${stateClass}" aria-label="مرحله ${toEnglishNum(index + 1)}">
          <span class="wiz-step-circle">${content}</span>
        </span>`;
    }).join('');
  }

  function buildPresetOptions(values, unit, key) {
    return values.map((value, index) => {
      const selected = answerMode[key] === 'preset' && answers[key] === value;
      return `
        <button type="button" class="wizard-option wizard-option--value ${key === 'power' ? 'wizard-option--watt' : ''} ${selected ? 'selected' : ''}"
                data-element-value="${value}" style="--option-index: ${index}">
          <span class="element-preset-value">${toEnglishNum(value)}</span>
          <span class="element-preset-unit">${unit}</span>
          <i class="bi bi-check-circle-fill wiz-check"></i>
        </button>`;
    }).join('');
  }

  function buildLengthControls() {
    const customValue = answerMode.length === 'custom' && answers.length ? answers.length : '';
    return `
      <div class="element-custom-field ${answerMode.length === 'custom' ? 'is-active' : ''}">
        <label for="element-custom-length">اندازه دلخواه</label>
        <div class="element-input-wrap">
          <input id="element-custom-length" type="number" inputmode="decimal"
                 min="1" max="100000" step="0.1" value="${customValue}"
                 placeholder="مثلاً 75" aria-describedby="element-length-help element-wiz-error">
          <span>cm</span>
        </div>
        <small id="element-length-help">حداقل 30 و حداکثر 100 سانتی‌متر</small>
      </div>`;
  }

  function buildPowerControls() {
    return `
      <div class="wizard-options wizard-options--presets wizard-options--power">
        ${buildPresetOptions(POWER_PRESETS, 'W', 'power')}
      </div>
      <small class="element-preset-help">توان‌ها بر حسب وات نمایش داده شده‌اند.</small>`;
  }

  function buildNotesControls() {
    return `
      <div class="element-notes-field">
        <textarea id="element-order-notes" maxlength="500" rows="6"
                  placeholder="مثلاً المنت حلقه‌ای برای دستگاه بسته‌بندی، با سیم اتصال 30 سانتی‌متری...">${escapeHtml(answers.notes)}</textarea>
        <div class="element-notes-meta">
          <span>اختیاری</span>
          <span id="element-notes-count">${toEnglishNum(answers.notes.length)} / 500</span>
        </div>
      </div>`;
  }

  function buildUploadControls() {
    const imagePreview = answers.imageUrl
      ? `<div class="element-upload-preview">
           <img src="${answers.imageUrl}" alt="تصویر نمونه سفارش">
           <span>${escapeHtml(answers.imageName)}</span>
         </div>`
      : '<div class="element-upload-empty"><i class="bi bi-image"></i><span>هنوز تصویری انتخاب نشده</span></div>';
    return `
      <div class="element-upload-field">
        <span class="element-upload-label">تصویر المنت مورد نظر</span>
        <label class="element-upload-control" for="element-order-image">
          <i class="bi bi-cloud-arrow-up-fill"></i>
          <span><strong>انتخاب تصویر</strong><small>PNG، JPG یا WEBP</small></span>
          <input id="element-order-image" type="file" accept="image/png,image/jpeg,image/webp">
        </label>
        ${imagePreview}
      </div>`;
  }

  function buildSummaryControls() {
    const notes = answers.notes.trim() || 'توضیحی ثبت نشده';
    return `
      <div class="element-summary" id="element-summary-card">
        <div class="element-summary-title">
          <i class="bi bi-lightning-charge-fill"></i>
          <div>
            <strong>مشخصات المنت سفارشی</strong>
            <span>آماده ارسال برای کارشناسان امگا</span>
          </div>
        </div>
        <dl class="element-summary-list">
          <div><dt>طول المنت</dt><dd>${formatNumber(answers.length)} سانتی‌متر</dd></div>
          <div><dt>توان المنت</dt><dd>${formatNumber(answers.power)} وات</dd></div>
          <div class="element-summary-notes"><dt>توضیحات</dt><dd>${escapeHtml(notes)}</dd></div>
          <div><dt>تصویر نمونه</dt><dd>${answers.imageName ? escapeHtml(answers.imageName) : 'انتخاب نشده'}</dd></div>
        </dl>
        ${answers.imageUrl
          ? `<div class="element-summary-image"><img src="${answers.imageUrl}" alt="تصویر نمونه سفارش"></div>`
          : ''}
      </div>
      <p class="element-summary-help">
        <i class="bi bi-info-circle"></i>
        کارشناسان فروش به زودی برای نهایی کردن سفارشتان با شما تماس خواهند گرفت.
      </p>
      <div class="element-summary-actions">
        <button type="button" class="element-action-btn element-action-btn--primary" id="element-download-summary">
          <i class="bi bi-download"></i> دانلود تصویر
        </button>
        <button type="button" class="element-action-btn" id="element-copy-summary">
          <i class="bi bi-copy"></i> کپی مشخصات
        </button>
        <button type="button" class="element-action-btn" id="element-share-summary">
          <i class="bi bi-share-fill"></i> اشتراک‌گذاری
        </button>
        <a class="element-action-btn element-action-btn--whatsapp" id="element-whatsapp-summary"
           target="_blank" rel="noopener" href="#">
          <i class="bi bi-whatsapp"></i> واتساپ
        </a>
        <a class="element-action-btn element-action-btn--telegram" id="element-telegram-summary"
           target="_blank" rel="noopener" href="#">
          <i class="bi bi-telegram"></i> تلگرام
        </a>
      </div>
      <div class="element-action-status" id="element-action-status" role="status" aria-live="polite"></div>`;
  }

  function buildStepControls() {
    if (currentStep === 0) return buildLengthControls();
    if (currentStep === 1) return buildPowerControls();
    if (currentStep === 2) return buildNotesControls();
    if (currentStep === 3) return buildUploadControls();
    return buildSummaryControls();
  }

  function buildStepHTML() {
    const step = STEPS[currentStep];
    const isSummary = currentStep === STEPS.length - 1;
    const nextDisabled = currentStep === 0
      ? !answers.length
      : currentStep === 1
        ? !answers.power
        : currentStep === 3 ? !answers.imageFile : false;

    return `
      <div class="wizard-card wizard-card--element" style="--wizard-steps: ${STEPS.length}; --wizard-edge: ${50 / STEPS.length}%">
        <div class="wiz-steps-row">${buildStepper()}</div>
        <div class="wizard-step-body">
          <div class="wizard-step-layout">
            <div class="wizard-step-content">
              <div class="wizard-step-label">مرحله ${toEnglishNum(currentStep + 1)} از ${toEnglishNum(STEPS.length)}</div>
              <div class="wizard-question"><i class="bi ${step.icon}"></i>${step.question}</div>
              <p class="wizard-question-hint">${step.hint}</p>
              ${buildStepControls()}
              <div class="element-wizard-error" id="element-wiz-error" role="alert"></div>
              <div class="wizard-nav">
                ${currentStep > 0
                  ? '<button type="button" class="wiz-back-btn" id="element-wiz-back"><i class="bi bi-chevron-right"></i> قبلی</button>'
                  : '<span></span>'}
                ${isSummary
                  ? '<button type="button" class="wiz-next-btn" id="element-wiz-restart"><i class="bi bi-arrow-clockwise"></i> سفارش جدید</button>'
                  : `<button type="button" class="wiz-next-btn" id="element-wiz-next" ${nextDisabled ? 'disabled' : ''}>
                       بعدی <i class="bi bi-chevron-left"></i>
                     </button>`}
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
    if (currentStep === 0 || currentStep === 1) attachNumericListeners(wizardEl);
    if (currentStep === 2) attachNotesListener(wizardEl);
    if (currentStep === 3) attachUploadListener(wizardEl);
    if (currentStep === 4) attachSummaryListeners(wizardEl);

    const nextButton = wizardEl.querySelector('#element-wiz-next');
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (!isTransitioning && validateCurrentStep(wizardEl)) transitionTo(currentStep + 1, 1);
      });
    }

    const backButton = wizardEl.querySelector('#element-wiz-back');
    if (backButton) {
      backButton.addEventListener('click', () => {
        if (!isTransitioning) transitionTo(currentStep - 1, -1);
      });
    }

    const restartButton = wizardEl.querySelector('#element-wiz-restart');
    if (restartButton) restartButton.addEventListener('click', restartWizard);
  }

  function attachNumericListeners(wizardEl) {
    const key = currentStep === 0 ? 'length' : 'power';
    const inputId = currentStep === 0 ? '#element-custom-length' : '#element-custom-power';
    const input = wizardEl.querySelector(inputId);
    const nextButton = wizardEl.querySelector('#element-wiz-next');

    wizardEl.querySelectorAll('[data-element-value]').forEach(button => {
      button.addEventListener('click', () => {
        wizardEl.querySelectorAll('[data-element-value]').forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
        answers[key] = Number(button.dataset.elementValue);
        answerMode[key] = 'preset';
        if (input) input.value = '';
        wizardEl.querySelector('.element-custom-field')?.classList.remove('is-active');
        clearError(wizardEl);
        if (nextButton) nextButton.disabled = false;
      });
    });

    if (input) {
      input.addEventListener('input', () => {
        wizardEl.querySelectorAll('[data-element-value]').forEach(item => item.classList.remove('selected'));
        wizardEl.querySelector('.element-custom-field')?.classList.add('is-active');
        answerMode[key] = 'custom';
        answers[key] = input.value === '' ? null : Number(input.value);
        clearError(wizardEl);
        if (nextButton) nextButton.disabled = !answers[key];
      });
    }
  }

  function attachNotesListener(wizardEl) {
    const textarea = wizardEl.querySelector('#element-order-notes');
    const counter = wizardEl.querySelector('#element-notes-count');
    if (textarea) {
      textarea.addEventListener('input', () => {
        answers.notes = textarea.value;
        if (counter) counter.textContent = `${toEnglishNum(textarea.value.length)} / 500`;
      });
    }
  }

  function attachUploadListener(wizardEl) {
    const imageInput = wizardEl.querySelector('#element-order-image');
    if (imageInput) {
      imageInput.addEventListener('change', () => {
        const file = imageInput.files && imageInput.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          showError(wizardEl, 'فقط فایل تصویری قابل انتخابه.');
          return;
        }
        if (answers.imageUrl) URL.revokeObjectURL(answers.imageUrl);
        answers.imageFile = file;
        answers.imageName = file.name;
        answers.imageUrl = URL.createObjectURL(file);
        clearError(wizardEl);
        renderStep(0);
      });
    }
  }

  function attachSummaryListeners(wizardEl) {
    const summaryText = getSummaryText();
    const whatsapp = wizardEl.querySelector('#element-whatsapp-summary');
    const telegram = wizardEl.querySelector('#element-telegram-summary');
    if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    if (telegram) telegram.href = `https://t.me/share/url?url=&text=${encodeURIComponent(summaryText)}`;

    wizardEl.querySelector('#element-copy-summary')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(summaryText);
        showActionStatus(wizardEl, 'مشخصات سفارش کپی شد.');
      } catch (error) {
        fallbackCopy(summaryText);
        showActionStatus(wizardEl, 'مشخصات سفارش کپی شد.');
      }
    });

    wizardEl.querySelector('#element-share-summary')?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'سفارش المنت اختصاصی', text: summaryText });
          showActionStatus(wizardEl, 'پنجره اشتراک‌گذاری باز شد.');
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      fallbackCopy(summaryText);
      showActionStatus(wizardEl, 'اشتراک‌گذاری در این مرورگر فعال نیست؛ متن کپی شد.');
    });

    wizardEl.querySelector('#element-download-summary')?.addEventListener('click', () => {
      downloadSummaryImage();
      showActionStatus(wizardEl, 'تصویر خلاصه سفارش دانلود شد.');
    });
  }

  function validateCurrentStep(wizardEl) {
    if (currentStep === 0) {
      if (!Number.isFinite(answers.length) || answers.length < 1 || answers.length > 100000) {
        showError(wizardEl, 'طول المنت باید بین 1 تا 100,000 سانتی‌متر باشه.');
        wizardEl.querySelector('#element-custom-length')?.focus();
        return false;
      }
    }

    if (currentStep === 1) {
      if (!POWER_PRESETS.includes(answers.power)) {
        showError(wizardEl, 'یکی از توان‌های آماده رو انتخاب کن.');
        return false;
      }
    }

    if (currentStep === 3 && !answers.imageFile) {
      showError(wizardEl, 'لطفاً یک تصویر از المنت مورد نظرت انتخاب کن.');
      return false;
    }

    clearError(wizardEl);
    return true;
  }

  function animateStepperForward(wizardEl, nextStepIndex, onDone) {
    const nodes = Array.from(wizardEl.querySelectorAll('.wiz-step-node'));
    const currentNode = nodes[currentStep];
    const nextNode = nodes[nextStepIndex];
    if (!currentNode) return onDone();

    currentNode.classList.add('completing');
    const circle = currentNode.querySelector('.wiz-step-circle');
    if (circle) setTimeout(() => { circle.innerHTML = '<i class="bi bi-check-lg"></i>'; }, 150);

    if (nextNode) {
      setTimeout(() => nextNode.classList.add('line-filling'), 260);
      setTimeout(() => nextNode.classList.add('activating'), 760);
      setTimeout(onDone, 980);
    } else {
      setTimeout(onDone, 620);
    }
  }

  function transitionTo(nextStepIndex, direction) {
    const wizardEl = document.getElementById('element-wizard-root');
    const currentBody = wizardEl?.querySelector('.wizard-step-body');
    if (!wizardEl || !currentBody) return;
    isTransitioning = true;

    const swap = () => {
      currentBody.classList.add(direction > 0 ? 'wiz-exit-forward' : 'wiz-exit-back');
      setTimeout(() => {
        currentStep = nextStepIndex;
        renderStep(direction);
        isTransitioning = false;
      }, 280);
    };

    if (direction > 0) animateStepperForward(wizardEl, nextStepIndex, swap);
    else swap();
  }

  function renderStep(direction) {
    const wizardEl = document.getElementById('element-wizard-root');
    if (!wizardEl) return;
    wizardEl.innerHTML = buildStepHTML();
    wizardEl.querySelector('.wizard-step-body')?.classList.add(direction >= 0 ? 'wiz-enter-forward' : 'wiz-enter-back');
    attachListeners(wizardEl);
  }

  function restartWizard() {
    currentStep = 0;
    if (answers.imageUrl) URL.revokeObjectURL(answers.imageUrl);
    answers = { length: null, power: null, notes: '', imageFile: null, imageName: '', imageUrl: '' };
    answerMode = { length: '', power: '' };
    renderStep(-1);
    document.getElementById('element-wizard-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getSummaryText() {
    const notes = answers.notes.trim() || 'ندارد';
    return [
      'سفارش المنت اختصاصی',
      `طول: ${formatNumber(answers.length)} سانتی‌متر`,
      `توان: ${formatNumber(answers.power)} وات`,
      `توضیحات: ${notes}`,
      `تصویر نمونه: ${answers.imageName || 'انتخاب نشده'}`
    ].join('\n');
  }

  function downloadSummaryImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#f7f9fc';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#b5451b';
    context.fillRect(0, 0, canvas.width, 260);
    context.direction = 'rtl';
    context.textAlign = 'right';
    context.fillStyle = '#ffffff';
    context.font = '700 58px Vazir, Tahoma, Arial';
    context.fillText('سفارش المنت اختصاصی', 1080, 120);
    context.font = '400 30px Vazir, Tahoma, Arial';
    context.fillText('فروشگاه الکتروصنعت امگا', 1080, 185);

    context.fillStyle = '#1d2733';
    context.font = '700 42px Vazir, Tahoma, Arial';
    context.fillText(`طول المنت: ${formatNumber(answers.length)} سانتی‌متر`, 1080, 390);
    context.fillText(`توان المنت: ${formatNumber(answers.power)} وات`, 1080, 500);
    context.fillStyle = '#4f6378';
    context.font = '700 32px Vazir, Tahoma, Arial';
    context.fillText('توضیحات سفارش', 1080, 630);
    context.font = '400 28px Vazir, Tahoma, Arial';
    drawWrappedRtlText(context, answers.notes.trim() || 'توضیحی ثبت نشده', 1080, 690, 960, 48);

    context.fillStyle = '#e7edf4';
    context.fillRect(120, 1030, 960, 2);
    context.fillStyle = '#4f6378';
    context.font = '400 25px Vazir, Tahoma, Arial';
    context.fillText('این تصویر را برای کارشناسان امگا ارسال کنید.', 1080, 1100);

    const link = document.createElement('a');
    link.download = 'omega-element-order.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function drawWrappedRtlText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(/\s+/);
    let line = '';
    let lineY = y;
    words.forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        context.fillText(line, x, lineY);
        line = word;
        lineY += lineHeight;
      } else {
        line = candidate;
      }
    });
    if (line) context.fillText(line, x, lineY);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  function showError(wizardEl, message) {
    const error = wizardEl.querySelector('#element-wiz-error');
    if (error) error.textContent = message;
  }

  function clearError(wizardEl) {
    const error = wizardEl.querySelector('#element-wiz-error');
    if (error) error.textContent = '';
  }

  function showActionStatus(wizardEl, message) {
    const status = wizardEl.querySelector('#element-action-status');
    if (!status) return;
    status.textContent = message;
    clearTimeout(showActionStatus.timeoutId);
    showActionStatus.timeoutId = setTimeout(() => { status.textContent = ''; }, 3200);
  }

  function formatNumber(value) {
    return toEnglishNum(new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value));
  }

  function toEnglishNum(value) {
    return String(value)
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.ElementWizardInit = init;
})();
