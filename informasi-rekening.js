(function () {
  const balanceElements = new Set();
  let isMasked = false;
  let toastEl = null;
  let toastTimer = null;

  let toggleButtonNode = null;
  let toggleLabelNode = null;
  let totalBalanceNode = null;
  let accountGridNode = null;
  let emptyStateNode = null;
  let drawerNode = null;
  let formNode = null;
  let giroAccordionButton = null;
  let giroAccordionContent = null;
  let nameInputNode = null;
  let nameCounterNode = null;
  let nameErrorNode = null;
  let purposeSelectNode = null;
  let purposeErrorNode = null;
  let purposeDropdownNode = null;
  let purposeButtonNode = null;
  let purposeListNode = null;
  let purposeTextNode = null;
  let purposeOptionButtons = [];
  let termsCheckboxNode = null;
  let termsErrorNode = null;
  let confirmButtonNode = null;

  const MAX_ACCOUNT_NAME_LENGTH = 15;
  const PURPOSE_OPTION_ACTIVE_CLASSES = ['bg-cyan-50', 'border-l-2', 'border-dashed', 'border-cyan-500'];

  const touchedState = {
    name: false,
    purpose: false,
    terms: false,
  };

  let formSubmitted = false;
  let isSubmittingForm = false;

  const SUPPRESSED_ERROR_MESSAGES = new Set([
    'Nama rekening wajib diisi.',
    'Pilih tujuan penambahan rekening.',
    'Anda harus menyetujui syarat dan ketentuan.',
  ]);

  const CURRENCY_FORMATTER = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function getAmbis() {
    return window.AMBIS || {};
  }

  function addAccount(payload) {
    const ambis = getAmbis();
    if (typeof ambis.addAccount === 'function') {
      try {
        const result = ambis.addAccount(payload);
        if (result && typeof result.then === 'function') {
          return result;
        }
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(new Error('API tambah rekening tidak tersedia'));
  }

  function formatCurrency(value) {
    if (typeof value !== 'number') {
      const parsed = Number(value);
      value = Number.isFinite(parsed) ? parsed : 0;
    }
    if (!Number.isFinite(value)) {
      return CURRENCY_FORMATTER.format(0);
    }
    return CURRENCY_FORMATTER.format(value);
  }

  function sanitizeNumber(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\D+/g, '');
  }

  function maskCurrencyText(text) {
    if (!text) {
      return '********';
    }
    const str = String(text);
    const match = str.match(/^(\s*Rp\s*)/i);
    const prefix = match ? match[0] : '';
    const rest = match ? str.slice(prefix.length) : str;
    const core = rest.replace(/\s+/g, '');
    const starCount = Math.max(core.length, 8);
    return `${prefix}${'*'.repeat(starCount)}`;
  }

  function registerBalanceElement(el, value) {
    if (!el) return;
    el.dataset.balanceValue = value;
    el.setAttribute('data-balance-sensitive', 'true');
    balanceElements.add(el);
    el.textContent = isMasked ? maskCurrencyText(value) : value;
  }

  function updateBalanceVisibility() {
    balanceElements.forEach((el) => {
      const original = el.dataset.balanceValue ?? '';
      el.textContent = isMasked ? maskCurrencyText(original) : original;
    });
  }

  function getPurposePlaceholder() {
    if (purposeTextNode) {
      const { placeholder } = purposeTextNode.dataset || {};
      if (placeholder && placeholder.trim()) {
        return placeholder;
      }
      const text = purposeTextNode.textContent;
      if (text && text.trim()) {
        return text.trim();
      }
    }
    return 'Pilih tujuan penambahan rekening';
  }

  function updatePurposeDropdownDisplay(value) {
    const trimmedValue = value ? String(value).trim() : '';
    if (purposeTextNode) {
      const placeholder = getPurposePlaceholder();
      if (trimmedValue) {
        purposeTextNode.textContent = trimmedValue;
        purposeTextNode.classList.remove('text-slate-500');
      } else {
        purposeTextNode.textContent = placeholder;
        purposeTextNode.classList.add('text-slate-500');
      }
    }
    if (purposeOptionButtons && purposeOptionButtons.length) {
      purposeOptionButtons.forEach((btn) => {
        if (!btn) return;
        btn.classList.remove(...PURPOSE_OPTION_ACTIVE_CLASSES);
        btn.setAttribute('aria-selected', 'false');
        if ((btn.dataset.value || '') === trimmedValue) {
          btn.classList.add(...PURPOSE_OPTION_ACTIVE_CLASSES);
          btn.setAttribute('aria-selected', 'true');
        }
      });
    }
  }

  function setPurposeListVisibility(visible) {
    if (!purposeListNode || !purposeButtonNode) return;
    if (visible) {
      purposeListNode.classList.remove('hidden');
      purposeButtonNode.setAttribute('aria-expanded', 'true');
    } else {
      purposeListNode.classList.add('hidden');
      purposeButtonNode.setAttribute('aria-expanded', 'false');
    }
  }

  function handlePurposeSelection(value) {
    const selected = value ? String(value).trim() : '';
    if (purposeSelectNode) {
      purposeSelectNode.value = selected;
      const changeEvent = new Event('change', { bubbles: true });
      purposeSelectNode.dispatchEvent(changeEvent);
    } else {
      touchedState.purpose = true;
      updatePurposeDropdownDisplay(selected);
      validateForm({ showErrors: true });
    }
    setPurposeListVisibility(false);
  }

  function handlePurposeDropdownOutsideClick(event) {
    if (!purposeDropdownNode) return;
    if (!purposeDropdownNode.contains(event.target)) {
      setPurposeListVisibility(false);
    }
  }

  function setAccordionExpanded(expanded) {
    if (!giroAccordionButton || !giroAccordionContent) return;
    giroAccordionButton.dataset.expanded = expanded ? 'true' : 'false';
    giroAccordionButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    const chevron = giroAccordionButton.querySelector('[data-chevron]');
    if (chevron) {
      chevron.style.transform = expanded ? 'rotate(0deg)' : 'rotate(-90deg)';
    }
    giroAccordionContent.dataset.expanded = expanded ? 'true' : 'false';
    giroAccordionContent.setAttribute('aria-hidden', expanded ? 'false' : 'true');
  }

  function toggleAccordion() {
    if (!giroAccordionButton) return;
    const expanded = giroAccordionButton.getAttribute('aria-expanded') === 'true';
    setAccordionExpanded(!expanded);
  }

  function updateNameCounter() {
    if (!nameInputNode || !nameCounterNode) return;
    const length = nameInputNode.value.length;
    nameCounterNode.textContent = `${length}/${MAX_ACCOUNT_NAME_LENGTH}`;
  }

  function getNameError(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Nama rekening wajib diisi.';
    }
    if (trimmed.length > MAX_ACCOUNT_NAME_LENGTH) {
      return `Maksimum ${MAX_ACCOUNT_NAME_LENGTH} karakter.`;
    }
    return '';
  }

  function getPurposeError(value) {
    if (!value) {
      return 'Pilih tujuan penambahan rekening.';
    }
    return '';
  }

  function getTermsError(checked) {
    if (!checked) {
      return 'Anda harus menyetujui syarat dan ketentuan.';
    }
    return '';
  }

  function updateFieldError(control, errorNode, errorMessage, shouldShow) {
    if (!control || !errorNode) return;
    const suppressErrorText = SUPPRESSED_ERROR_MESSAGES.has(errorMessage);
    if (errorMessage && shouldShow) {
      if (suppressErrorText) {
        errorNode.textContent = '';
        errorNode.classList.add('hidden');
      } else {
        errorNode.textContent = errorMessage;
        errorNode.classList.remove('hidden');
      }
      control.setAttribute('aria-invalid', 'true');
      if (control === purposeSelectNode && purposeButtonNode) {
        purposeButtonNode.setAttribute('aria-invalid', 'true');
      }
    } else {
      errorNode.textContent = '';
      errorNode.classList.add('hidden');
      control.setAttribute('aria-invalid', 'false');
      if (control === purposeSelectNode && purposeButtonNode) {
        purposeButtonNode.setAttribute('aria-invalid', 'false');
      }
    }
  }

  function validateForm({ showErrors = false } = {}) {
    if (!formNode) return false;
    const nameValue = nameInputNode ? nameInputNode.value : '';
    const purposeValue = purposeSelectNode ? purposeSelectNode.value : '';
    const termsChecked = termsCheckboxNode ? termsCheckboxNode.checked : false;

    const nameError = getNameError(nameValue);
    const purposeError = getPurposeError(purposeValue);
    const termsError = getTermsError(termsChecked);

    const showNameError = showErrors || touchedState.name || formSubmitted;
    const showPurposeError = showErrors || touchedState.purpose || formSubmitted;
    const showTermsError = showErrors || touchedState.terms || formSubmitted;

    updateFieldError(nameInputNode, nameErrorNode, nameError, showNameError);
    updateFieldError(purposeSelectNode, purposeErrorNode, purposeError, showPurposeError);
    updateFieldError(termsCheckboxNode, termsErrorNode, termsError, showTermsError);

    const isValid = !nameError && !purposeError && !termsError;
    if (confirmButtonNode) {
      confirmButtonNode.disabled = !isValid || isSubmittingForm;
    }
    return isValid;
  }

  function resetTouchedState() {
    touchedState.name = false;
    touchedState.purpose = false;
    touchedState.terms = false;
  }

  function resetFormState({ skipFormReset = false } = {}) {
    formSubmitted = false;
    isSubmittingForm = false;
    resetTouchedState();
    if (!skipFormReset && formNode) {
      formNode.reset();
    }
    if (nameCounterNode) {
      nameCounterNode.textContent = `0/${MAX_ACCOUNT_NAME_LENGTH}`;
    }
    if (nameErrorNode) {
      nameErrorNode.textContent = '';
      nameErrorNode.classList.add('hidden');
    }
    if (purposeErrorNode) {
      purposeErrorNode.textContent = '';
      purposeErrorNode.classList.add('hidden');
    }
    if (termsErrorNode) {
      termsErrorNode.textContent = '';
      termsErrorNode.classList.add('hidden');
    }
    if (nameInputNode) {
      nameInputNode.setAttribute('aria-invalid', 'false');
    }
    if (purposeSelectNode) {
      purposeSelectNode.value = '';
      purposeSelectNode.setAttribute('aria-invalid', 'false');
    }
    if (termsCheckboxNode) {
      termsCheckboxNode.setAttribute('aria-invalid', 'false');
    }
    updatePurposeDropdownDisplay('');
    if (purposeButtonNode) {
      purposeButtonNode.setAttribute('aria-invalid', 'false');
    }
    setPurposeListVisibility(false);
    if (confirmButtonNode) {
      confirmButtonNode.disabled = true;
    }
    setAccordionExpanded(true);
  }

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.id = 'rekeningToast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.className = 'fixed top-6 right-6 z-50 pointer-events-none transform transition duration-200 ease-out opacity-0 translate-y-2';
    const inner = document.createElement('div');
    inner.className = 'rounded-xl bg-slate-900 text-white px-4 py-3 shadow-lg text-sm font-semibold';
    toastEl.appendChild(inner);
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(message) {
    const toast = ensureToast();
    const inner = toast.firstElementChild;
    if (inner) {
      inner.textContent = message;
    }
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-2');
    }, 2200);
  }

  function copyAccountNumber(value) {
    const sanitized = sanitizeNumber(value);
    if (!sanitized) {
      return Promise.reject(new Error('Nomor rekening tidak valid'));
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(sanitized);
    }
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = sanitized;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, sanitized.length);
      try {
        const success = document.execCommand('copy');
        document.body.removeChild(input);
        if (success) {
          resolve();
        } else {
          reject(new Error('Perintah salin gagal'));
        }
      } catch (err) {
        document.body.removeChild(input);
        reject(err);
      }
    });
  }

  function formatAccountNumber(raw) {
    const sanitized = sanitizeNumber(raw);
    if (!sanitized) return '';
    return sanitized.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  function normaliseAccount(account, index) {
    const ambis = getAmbis();
    const copy = { ...account };
    const fallbackName = `Rekening ${index + 1}`;
    if (typeof copy.name !== 'string' || !copy.name.trim()) {
      copy.name = fallbackName;
    } else {
      copy.name = copy.name.trim();
    }
    if (typeof copy.displayName !== 'string' || !copy.displayName.trim()) {
      copy.displayName = copy.name;
    } else {
      copy.displayName = copy.displayName.trim();
    }
    if (typeof copy.initial !== 'string' || !copy.initial.trim()) {
      copy.initial = copy.name.charAt(0).toUpperCase();
    } else {
      copy.initial = copy.initial.trim().charAt(0).toUpperCase();
    }
    if (typeof copy.color !== 'string' || !copy.color.trim()) {
      copy.color = 'bg-cyan-100 text-cyan-600';
    }
    copy.numberRaw = sanitizeNumber(copy.numberRaw || copy.number);
    if (typeof copy.number === 'string') {
      copy.number = copy.number.trim();
    } else {
      copy.number = '';
    }
    if (!copy.number && copy.numberRaw) {
      if (typeof ambis.formatAccountNumber === 'function') {
        copy.number = ambis.formatAccountNumber(copy.numberRaw);
      } else {
        copy.number = formatAccountNumber(copy.numberRaw);
      }
    }
    copy.balance = Number(copy.balance) || 0;
    copy.bank = typeof copy.bank === 'string' ? copy.bank.trim() : '';
    return copy;
  }

  function getAccounts() {
    const ambis = getAmbis();
    let accounts = [];
    if (typeof ambis.getAccounts === 'function') {
      accounts = ambis.getAccounts({ clone: true }) || [];
    } else if (Array.isArray(ambis.accounts)) {
      accounts = ambis.accounts.map((acc) => ({ ...acc }));
    }
    return accounts.map((account, index) => normaliseAccount(account, index));
  }

  function createDetailLink(label) {
    const link = document.createElement('a');
    link.href = 'mutasi.html';
    link.className = 'pt-3 font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 whitespace-nowrap';
    link.setAttribute('aria-label', `Lihat detail ${label}`);
    link.innerHTML = 'Lihat Detail <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.47 3.97a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06L9.44 8 6.47 5.03a.75.75 0 0 1 0-1.06Z"/></svg>';
    return link;
  }

  function createActionButton(href, icon, text) {
    const button = document.createElement('a');
    button.href = href;
    button.className = 'flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-cyan-500 text-cyan-600 hover:bg-cyan-50 text-sm font-semibold';
    button.innerHTML = `<img src="${icon}" alt="" class="w-5 h-5"/>${text}`;
    return button;
  }

  function createAccountCard(account) {
    const card = document.createElement('article');
    card.className = 'rounded-2xl border border-slate-200 p-5 bg-white flex flex-col gap-4';
    card.dataset.accountId = account.id || '';

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-3';

    const info = document.createElement('div');
    info.className = 'flex items-center gap-3';
    const badge = document.createElement('span');
    badge.className = `w-10 h-10 rounded-full grid place-items-center font-semibold ${account.color}`;
    badge.textContent = account.initial || '';
    info.appendChild(badge);

    const nameWrap = document.createElement('div');
    const nameEl = document.createElement('p');
    nameEl.className = 'font-semibold text-slate-900';
    nameEl.textContent = account.name;
    nameWrap.appendChild(nameEl);
    info.appendChild(nameWrap);

    header.appendChild(info);
    header.appendChild(createDetailLink(account.name));

    const numberRow = document.createElement('div');
    numberRow.className = 'flex flex-col';
    const numberLabel = document.createElement('p');
    numberLabel.className = 'text-sm text-slate-400';
    numberLabel.textContent = 'Nomor Rekening';
    const numberValueWrap = document.createElement('div');
    numberValueWrap.className = 'flex items-center gap-2';
    const numberValue = document.createElement('p');
    numberValue.className = 'font-semibold text-slate-900 tracking-wide';
    numberValue.textContent = account.number || '-';
    numberValueWrap.appendChild(numberValue);
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 shrink-0';
    copyBtn.innerHTML = '<img src="img/icon/copy.svg" alt="" class="w-5 h-5"/>Salin';
    copyBtn.setAttribute('aria-label', `Salin nomor rekening ${account.number || account.displayName}`);
    copyBtn.addEventListener('click', () => {
      copyAccountNumber(account.numberRaw || account.number)
        .then(() => {
          showToast('Nomor rekening berhasil disalin');
        })
        .catch(() => {
          showToast('Tidak dapat menyalin nomor rekening');
        });
    });
    numberValueWrap.appendChild(copyBtn);
    numberRow.append(numberLabel, numberValueWrap);

    const balanceWrap = document.createElement('div');
    const balanceLabel = document.createElement('p');
    balanceLabel.className = 'text-sm text-slate-400';
    balanceLabel.textContent = 'Saldo Aktif';
    const balanceValue = document.createElement('p');
    balanceValue.className = 'text-xl font-semibold text-slate-900';
    const formattedBalance = formatCurrency(account.balance);
    registerBalanceElement(balanceValue, formattedBalance);
    balanceWrap.append(balanceLabel, balanceValue);

    const actions = document.createElement('div');
    actions.className = 'grid grid-cols-2 gap-3 pt-2';
    const mutasiBtn = createActionButton('mutasi.html', 'img/icon/transfer-mutasi.svg', 'Mutasi Rekening');
    const transferBtn = createActionButton('transfer.html', 'img/icon/transfer.svg', 'Transfer');
    actions.append(mutasiBtn, transferBtn);

    card.append(header, numberRow, balanceWrap, actions);
    return card;
  }

  function updateToggleState() {
    if (!toggleButtonNode) return;
    toggleButtonNode.setAttribute('aria-pressed', String(isMasked));
    if (toggleLabelNode) {
      toggleLabelNode.textContent = isMasked
        ? 'Tampilkan Semua Saldo'
        : 'Sembunyikan Semua Saldo';
    }
  }

  function renderAccounts() {
    if (!accountGridNode) return;
    const accounts = getAccounts();
    accountGridNode.innerHTML = '';
    balanceElements.clear();

    const total = accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
    if (totalBalanceNode) {
      const formattedTotal = formatCurrency(total);
      registerBalanceElement(totalBalanceNode, formattedTotal);
    }

    if (!accounts.length) {
      accountGridNode.classList.add('hidden');
      if (emptyStateNode) emptyStateNode.classList.remove('hidden');
    } else {
      accountGridNode.classList.remove('hidden');
      if (emptyStateNode) emptyStateNode.classList.add('hidden');
      accounts.forEach((account) => {
        const card = createAccountCard(account);
        accountGridNode.appendChild(card);
      });
    }

    updateToggleState();
  }

  function openDrawer() {
    if (!drawerNode) return;
    if (!drawerNode.classList.contains('open')) {
      resetFormState();
    }
    drawerNode.classList.add('open');
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
    if (formNode) {
      const focusTarget = formNode.querySelector('input, textarea, select');
      if (focusTarget) {
        try {
          focusTarget.focus({ preventScroll: true });
        } catch (err) {
          focusTarget.focus();
        }
      }
    }
  }

  function closeDrawer() {
    if (!drawerNode) return;
    drawerNode.classList.remove('open');
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
    resetFormState();
  }

  function onKeyDown(event) {
    if (event.key === 'Escape' && drawerNode && drawerNode.classList.contains('open')) {
      closeDrawer();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    toggleButtonNode = document.getElementById('balanceToggle');
    toggleLabelNode = toggleButtonNode ? toggleButtonNode.querySelector('[data-toggle-label]') : null;
    totalBalanceNode = document.querySelector('[data-total-balance]');
    accountGridNode = document.getElementById('accountGrid');
    emptyStateNode = document.getElementById('accountEmptyState');
    drawerNode = document.getElementById('drawer');
    formNode = document.getElementById('addAccountForm');
    giroAccordionButton = document.getElementById('giroSpecToggle');
    giroAccordionContent = document.getElementById('giroSpecContent');
    nameInputNode = document.getElementById('accountName');
    nameCounterNode = document.getElementById('accountNameCounter');
    nameErrorNode = document.getElementById('accountNameError');
    purposeSelectNode = document.getElementById('accountPurpose');
    purposeErrorNode = document.getElementById('accountPurposeError');
    purposeDropdownNode = document.getElementById('moveCategoryDropdown');
    purposeButtonNode = document.getElementById('moveCategoryBtn');
    purposeListNode = document.getElementById('moveCategoryList');
    purposeTextNode = document.getElementById('moveCategoryText');
    purposeOptionButtons = purposeListNode ? Array.from(purposeListNode.querySelectorAll('button[data-value]')) : [];
    termsCheckboxNode = document.getElementById('termsAgreement');
    termsErrorNode = document.getElementById('termsAgreementError');
    confirmButtonNode = document.getElementById('confirmAddAccountBtn');

    const addAccountBtn = document.getElementById('addAccountBtn');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');

    renderAccounts();
    updateBalanceVisibility();
    updatePurposeDropdownDisplay(purposeSelectNode ? purposeSelectNode.value : '');
    setPurposeListVisibility(false);

    if (toggleButtonNode) {
      toggleButtonNode.addEventListener('click', () => {
        if (!balanceElements.size) return;
        isMasked = !isMasked;
        updateBalanceVisibility();
        updateToggleState();
      });
      updateToggleState();
    }

    if (giroAccordionButton) {
      const chevron = giroAccordionButton.querySelector('svg');
      if (chevron) {
        chevron.setAttribute('data-chevron', '');
      }
      giroAccordionButton.addEventListener('click', toggleAccordion);
      setAccordionExpanded(true);
    }

    if (formNode) {
      formNode.addEventListener('reset', () => {
        resetFormState({ skipFormReset: true });
      });
    }

    if (nameInputNode) {
      updateNameCounter();
      nameInputNode.addEventListener('input', () => {
        updateNameCounter();
        if (touchedState.name || formSubmitted) {
          validateForm();
        } else if (confirmButtonNode) {
          validateForm();
        }
      });
      nameInputNode.addEventListener('blur', () => {
        touchedState.name = true;
        validateForm({ showErrors: true });
      });
    }

    if (purposeButtonNode && purposeListNode) {
      purposeButtonNode.addEventListener('click', () => {
        const isVisible = !purposeListNode.classList.contains('hidden');
        setPurposeListVisibility(!isVisible);
      });
    }

    if (purposeListNode) {
      purposeListNode.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-value]');
        if (!btn) return;
        event.preventDefault();
        handlePurposeSelection(btn.dataset.value || '');
      });
    }

    if (purposeSelectNode) {
      purposeSelectNode.addEventListener('change', () => {
        touchedState.purpose = true;
        updatePurposeDropdownDisplay(purposeSelectNode.value);
        validateForm({ showErrors: true });
      });
      purposeSelectNode.addEventListener('blur', () => {
        if (purposeSelectNode.value) {
          validateForm();
        }
      });
    }

    if (purposeDropdownNode) {
      document.addEventListener('click', handlePurposeDropdownOutsideClick);
    }

    if (termsCheckboxNode) {
      termsCheckboxNode.addEventListener('change', () => {
        touchedState.terms = true;
        validateForm({ showErrors: true });
      });
    }

    if (addAccountBtn) {
      addAccountBtn.addEventListener('click', openDrawer);
    }
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeDrawer);
    }
    if (formNode) {
      formNode.addEventListener('submit', (event) => {
        event.preventDefault();
        formSubmitted = true;
        const isValid = validateForm({ showErrors: true });
        if (!isValid) {
          return;
        }

        if (confirmButtonNode) {
          confirmButtonNode.disabled = true;
        }
        isSubmittingForm = true;
        validateForm();

        const payload = {
          name: nameInputNode ? nameInputNode.value.trim() : '',
          purpose: purposeSelectNode ? purposeSelectNode.value : '',
          agreedToTerms: termsCheckboxNode ? termsCheckboxNode.checked : false,
        };

        addAccount(payload)
          .then(() => {
            renderAccounts();
            showToast('Rekening berhasil ditambahkan');
            closeDrawer();
          })
          .catch(() => {
            showToast('Gagal menambahkan rekening. Silakan coba lagi.');
          })
          .finally(() => {
            isSubmittingForm = false;
            if (confirmButtonNode) {
              confirmButtonNode.disabled = true;
            }
            validateForm();
          });
      });
    }

    resetFormState({ skipFormReset: true });

    document.addEventListener('keydown', onKeyDown);
  });
})();
