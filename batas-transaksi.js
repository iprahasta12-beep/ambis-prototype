(function () {
  const MAX_LIMIT = 200_000_000;
  const STORAGE_KEY = 'ambis:batas-transaksi-limit';

  const drawer = document.getElementById('drawer');
  const openBtn = document.getElementById('openLimitDrawerBtn');
  const closeBtn = document.getElementById('limitDrawerCloseBtn');
  const confirmBtn = document.getElementById('confirmLimitBtn');
  const input = document.getElementById('newLimitInput');
  const errorEl = document.getElementById('newLimitError');
  const drawerMaxEl = document.getElementById('drawerMaxLimit');
  const drawerCurrentEl = document.getElementById('drawerCurrentLimit');
  const cardCurrentEl = document.getElementById('currentLimitDisplay');
  const cardMaxEl = document.getElementById('maxLimitDisplay');
  const progressBar = document.getElementById('limitBar');

  let ignoreOutsideClick = false;

  let currentLimit = 150_000_000;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= MAX_LIMIT) {
        currentLimit = parsed;
      }
    }
  } catch (err) {
    // localStorage might be unavailable; ignore.
  }

  function formatCurrency(value) {
    return `Rp${value.toLocaleString('id-ID')}`;
  }

  function updateDisplays() {
    const formattedCurrent = formatCurrency(currentLimit);
    const formattedMax = formatCurrency(MAX_LIMIT);

    if (drawerCurrentEl) drawerCurrentEl.textContent = formattedCurrent;
    if (drawerMaxEl) drawerMaxEl.textContent = formattedMax;
    if (cardCurrentEl) cardCurrentEl.textContent = formattedCurrent;
    if (cardMaxEl) cardMaxEl.textContent = formattedMax;

    if (progressBar) {
      const percent = Math.max(0, Math.min(100, (currentLimit / MAX_LIMIT) * 100));
      progressBar.style.width = `${percent}%`;
    }
  }

  function persistLimit() {
    try {
      localStorage.setItem(STORAGE_KEY, String(currentLimit));
    } catch (err) {
      // Ignore persistence errors.
    }
  }

  function hideError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function sanitizeInputValue(rawValue) {
    const digitsOnly = rawValue.replace(/\D/g, '');
    if (!digitsOnly) return '';
    const numeric = Number(digitsOnly);
    if (Number.isNaN(numeric)) return '';
    return numeric.toLocaleString('id-ID');
  }

  function getInputValue() {
    if (!input) return NaN;
    const digitsOnly = input.value.replace(/\D/g, '');
    if (!digitsOnly) return NaN;
    return parseInt(digitsOnly, 10);
  }

  function validateInput() {
    if (!input || !confirmBtn) return false;

    const digitsOnly = input.value.replace(/\D/g, '');

    if (!digitsOnly) {
      confirmBtn.disabled = true;
      showError('Masukkan batas transaksi harian baru.');
      return false;
    }

    const numericValue = parseInt(digitsOnly, 10);

    if (Number.isNaN(numericValue)) {
      confirmBtn.disabled = true;
      showError('Masukkan angka yang valid.');
      return false;
    }

    if (numericValue <= 0) {
      confirmBtn.disabled = true;
      showError('Batas transaksi harus lebih dari 0.');
      return false;
    }

    if (numericValue > MAX_LIMIT) {
      confirmBtn.disabled = true;
      showError('Nilai tidak boleh melebihi batas maksimum.');
      return false;
    }

    confirmBtn.disabled = false;
    hideError();
    return true;
  }

  function openDrawer() {
    if (!drawer) return;
    ignoreOutsideClick = true;

    if (input) {
      input.value = '';
      input.focus();
    }

    hideError();

    if (confirmBtn) confirmBtn.disabled = true;

    updateDisplays();
    drawer.classList.add('open');

    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }

    // Allow outside click to close on the next tick so the opening click
    // doesn't immediately trigger a close.
    setTimeout(() => {
      ignoreOutsideClick = false;
    }, 0);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
  }

  openBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openDrawer();
  });

  closeBtn?.addEventListener('click', () => {
    closeDrawer();
  });

  confirmBtn?.addEventListener('click', () => {
    if (!validateInput()) return;
    const newValue = getInputValue();
    if (Number.isNaN(newValue)) return;

    currentLimit = newValue;
    persistLimit();
    updateDisplays();
    closeDrawer();
  });

  input?.addEventListener('input', () => {
    if (!input) return;
    const formatted = sanitizeInputValue(input.value);
    input.value = formatted;
    validateInput();
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (validateInput()) {
        confirmBtn?.click();
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (!drawer || !drawer.classList.contains('open')) return;
    if (ignoreOutsideClick) return;
    if (drawer.contains(event.target)) return;
    if (openBtn && openBtn.contains(event.target)) return;
    closeDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  updateDisplays();
})();
