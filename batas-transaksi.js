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
  const infoBtn = document.getElementById('limitInfoBtn');
  const infoOverlay = document.getElementById('limitInfoOverlay');
  const infoCloseBtn = document.getElementById('limitInfoCloseBtn');
  const successMessageEl = document.getElementById('limitSuccessMessage');
  const confirmElements = {
    container: document.getElementById('limitConfirmContainer'),
    overlay: document.getElementById('limitConfirmOverlay'),
    sheet: document.getElementById('limitConfirmSheet'),
    previousValue: document.getElementById('limitConfirmPreviousValue'),
    newValue: document.getElementById('limitConfirmNewValue'),
    cancelBtn: document.getElementById('limitConfirmCancelBtn'),
    proceedBtn: document.getElementById('limitConfirmProceedBtn'),
  };

  const otpElements = {
    section: document.getElementById('limitOtpSection'),
    inputs: Array.from(document.querySelectorAll('#limitOtpSection .otp-input')),
    countdown: document.getElementById('limitOtpCountdown'),
    countdownMessage: document.getElementById('limitOtpCountdownMessage'),
    timer: document.getElementById('limitOtpTimer'),
    resendBtn: document.getElementById('limitOtpResend'),
    error: document.getElementById('limitOtpError'),
  };

  const OTP_DURATION_SECONDS = 30;
  const OTP_DEFAULT_COUNTDOWN_MESSAGE = 'Sesi akan berakhir dalam';
  const OTP_EXPIRED_MESSAGE = 'Kode OTP kedaluwarsa. Silakan kirim ulang kode untuk melanjutkan.';
  const otpCountdownDefaultMessage =
    otpElements.countdownMessage?.textContent?.trim() || OTP_DEFAULT_COUNTDOWN_MESSAGE;

  let otpActive = false;
  let otpIntervalId = null;
  let otpTimeLeft = OTP_DURATION_SECONDS;

  let infoOverlayOpen = false;

  let currentLimit = 150_000_000;
  let pendingNewLimit = null;
  let confirmSheetOpen = false;
  let successTimer = null;

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

  function closeInfoOverlay() {
    infoOverlayOpen = false;
    if (infoOverlay) {
      infoOverlay.classList.add('hidden');
    }
    if (infoBtn) {
      infoBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function openInfoOverlay() {
    if (!infoOverlay || !infoBtn) return;
    infoOverlay.classList.remove('hidden');
    infoBtn.setAttribute('aria-expanded', 'true');
    infoOverlayOpen = true;
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

  function hideSuccessMessage() {
    if (!successMessageEl) return;
    successMessageEl.classList.add('hidden');
  }

  function showSuccessMessage(message) {
    if (!successMessageEl) return;
    successMessageEl.textContent = message;
    successMessageEl.classList.remove('hidden');
    if (successTimer) {
      clearTimeout(successTimer);
      successTimer = null;
    }
    successTimer = setTimeout(() => {
      hideSuccessMessage();
      successTimer = null;
    }, 4000);
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

  function hideOtpError() {
    if (!otpElements.error) return;
    otpElements.error.textContent = '';
    otpElements.error.classList.add('hidden');
  }

  function showOtpError(message) {
    if (!otpElements.error) return;
    otpElements.error.textContent = message;
    otpElements.error.classList.remove('hidden');
  }

  function resetOtpInputs() {
    otpElements.inputs.forEach((input) => {
      input.value = '';
    });
  }

  function isOtpFilled() {
    if (!otpElements.inputs.length) return false;
    return otpElements.inputs.every((input) => input.value && input.value.trim() !== '');
  }

  function clearOtpTimer() {
    if (otpIntervalId) {
      clearInterval(otpIntervalId);
      otpIntervalId = null;
    }
  }

  function formatOtpTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  function updateOtpCountdownDisplay() {
    if (otpElements.timer) {
      otpElements.timer.textContent = formatOtpTime(otpTimeLeft);
    }
  }

  function showOtpCountdownDefaultMessage() {
    if (otpElements.countdownMessage) {
      otpElements.countdownMessage.textContent = otpCountdownDefaultMessage;
    }
    if (otpElements.timer) {
      otpElements.timer.classList.remove('hidden');
    }
  }

  function showOtpExpiredMessage() {
    if (otpElements.countdownMessage) {
      otpElements.countdownMessage.textContent = OTP_EXPIRED_MESSAGE;
    }
    if (otpElements.timer) {
      otpElements.timer.classList.add('hidden');
    }
  }

  function updateOtpVerifyState() {
    if (!confirmElements.proceedBtn) return;
    if (!otpActive) {
      confirmElements.proceedBtn.disabled = false;
      return;
    }

    if (otpTimeLeft <= 0) {
      confirmElements.proceedBtn.disabled = true;
      return;
    }

    confirmElements.proceedBtn.disabled = !isOtpFilled();
  }

  function startOtpTimer() {
    if (!otpActive) return;

    if (otpElements.countdown) {
      otpElements.countdown.classList.remove('hidden');
    }
    showOtpCountdownDefaultMessage();
    hideOtpError();
    if (otpElements.resendBtn) {
      otpElements.resendBtn.classList.add('hidden');
    }
    otpTimeLeft = OTP_DURATION_SECONDS;
    updateOtpCountdownDisplay();
    clearOtpTimer();

    otpIntervalId = setInterval(() => {
      otpTimeLeft -= 1;
      if (otpTimeLeft <= 0) {
        otpTimeLeft = 0;
        updateOtpCountdownDisplay();
        clearOtpTimer();
        showOtpExpiredMessage();
        if (otpElements.resendBtn) {
          otpElements.resendBtn.classList.remove('hidden');
        }
        showOtpError('Kode OTP kedaluwarsa. Silakan kirim ulang kode untuk melanjutkan.');
        updateOtpVerifyState();
        return;
      }

      updateOtpCountdownDisplay();
    }, 1000);
  }

  function resetOtpState() {
    otpActive = false;
    clearOtpTimer();
    otpTimeLeft = OTP_DURATION_SECONDS;
    if (otpElements.section) {
      otpElements.section.classList.add('hidden');
    }
    resetOtpInputs();
    if (otpElements.countdown) {
      otpElements.countdown.classList.remove('hidden');
    }
    showOtpCountdownDefaultMessage();
    if (otpElements.timer) {
      otpElements.timer.textContent = formatOtpTime(OTP_DURATION_SECONDS);
      otpElements.timer.classList.remove('hidden');
    }
    if (otpElements.resendBtn) {
      otpElements.resendBtn.classList.add('hidden');
    }
    hideOtpError();
    if (confirmElements.proceedBtn) {
      confirmElements.proceedBtn.textContent = 'Lanjut Ubah Batas Transaksi';
      confirmElements.proceedBtn.disabled = false;
    }
    if (confirmElements.cancelBtn) {
      confirmElements.cancelBtn.textContent = 'Batal';
    }
    updateOtpVerifyState();
  }

  function showOtpSection() {
    if (!otpElements.section || !confirmElements.proceedBtn) return;

    otpActive = true;
    otpElements.section.classList.remove('hidden');
    confirmElements.proceedBtn.textContent = 'Verifikasi';
    confirmElements.proceedBtn.disabled = true;
    if (confirmElements.cancelBtn) {
      confirmElements.cancelBtn.textContent = 'Batalkan';
    }
    resetOtpInputs();
    hideOtpError();
    otpElements.inputs[0]?.focus();
    startOtpTimer();
    updateOtpVerifyState();
  }

  function getOtpValue() {
    return otpElements.inputs.map((input) => input.value).join('');
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

  function openConfirmSheet(newLimitValue) {
    const { container, overlay, sheet, previousValue, newValue } = confirmElements;
    if (!overlay || !sheet) return;

    pendingNewLimit = newLimitValue;
    confirmSheetOpen = true;

    resetOtpState();

    if (previousValue) {
      previousValue.textContent = formatCurrency(currentLimit);
    }
    if (newValue) {
      newValue.textContent = formatCurrency(newLimitValue);
    }

    sheet.setAttribute('aria-hidden', 'false');

    container?.classList.remove('pointer-events-none');

    overlay.classList.remove('hidden');
    overlay.classList.add('opacity-0');
    overlay.classList.remove('opacity-100');

    sheet.classList.add('translate-y-full');
    sheet.classList.remove('translate-y-0');

    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
      sheet.classList.add('translate-y-0');
    });
  }

  function closeConfirmSheet(options = {}) {
    const { container, overlay, sheet } = confirmElements;
    if (!overlay || !sheet) return;
    if (!confirmSheetOpen && !options.force) return;

    confirmSheetOpen = false;
    pendingNewLimit = null;
    resetOtpState();
    sheet.setAttribute('aria-hidden', 'true');

    const finishClose = () => {
      overlay.classList.add('hidden');
      container?.classList.add('pointer-events-none');
    };

    if (options.immediate) {
      overlay.classList.add('opacity-0');
      overlay.classList.remove('opacity-100');
      finishClose();
      sheet.classList.add('translate-y-full');
      sheet.classList.remove('translate-y-0');
      return;
    }

    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    sheet.classList.add('translate-y-full');
    sheet.classList.remove('translate-y-0');

    const handleTransitionEnd = (event) => {
      if (event.target !== sheet) return;
      finishClose();
      sheet.removeEventListener('transitionend', handleTransitionEnd);
    };

    sheet.addEventListener('transitionend', handleTransitionEnd);
  }

  function openDrawer() {
    if (!drawer) return;

    closeConfirmSheet({ immediate: true });

    if (input) {
      input.value = '';
    }

    hideError();
    closeInfoOverlay();

    if (confirmBtn) confirmBtn.disabled = true;

    updateDisplays();
    drawer.classList.add('open');

    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
  }

  function closeDrawer() {
    if (!drawer) return;
    closeConfirmSheet({ immediate: true });
    drawer.classList.remove('open');
    closeInfoOverlay();
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

  confirmBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!validateInput()) return;
    const newValue = getInputValue();
    if (Number.isNaN(newValue)) return;

    openConfirmSheet(newValue);
  });

  input?.addEventListener('input', () => {
    if (!input) return;
    const formatted = sanitizeInputValue(input.value);
    input.value = formatted;
    validateInput();
  });

  infoBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (infoOverlayOpen) {
      closeInfoOverlay();
    } else {
      openInfoOverlay();
    }
  });

  infoCloseBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeInfoOverlay();
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
    if (!infoOverlayOpen) return;
    if (infoOverlay?.contains(event.target)) return;
    if (infoBtn?.contains(event.target)) return;
    closeInfoOverlay();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (confirmSheetOpen) {
      closeConfirmSheet();
      return;
    }
    if (drawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  confirmElements.cancelBtn?.addEventListener('click', () => {
    closeConfirmSheet();
  });

  confirmElements.overlay?.addEventListener('click', (event) => {
    if (event.target === confirmElements.overlay) {
      closeConfirmSheet();
    }
  });

  otpElements.resendBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!otpActive) return;
    resetOtpInputs();
    hideOtpError();
    otpElements.inputs[0]?.focus();
    startOtpTimer();
    updateOtpVerifyState();
  });

  otpElements.inputs.forEach((input, index) => {
    input.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const digits = target.value.replace(/\D/g, '');
      target.value = digits.slice(-1);
      if (target.value && index < otpElements.inputs.length - 1) {
        otpElements.inputs[index + 1]?.focus();
      }
      hideOtpError();
      updateOtpVerifyState();
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        event.preventDefault();
        const previous = otpElements.inputs[index - 1];
        previous.value = '';
        previous.focus();
        updateOtpVerifyState();
        return;
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        otpElements.inputs[index - 1]?.focus();
        return;
      }
      if (event.key === 'ArrowRight' && index < otpElements.inputs.length - 1) {
        event.preventDefault();
        otpElements.inputs[index + 1]?.focus();
      }
    });

    input.addEventListener('paste', (event) => {
      event.preventDefault();
      const clipboard = event.clipboardData || window.clipboardData;
      const text = clipboard?.getData('text') || '';
      const digits = text.replace(/\D/g, '');
      if (!digits) return;
      resetOtpInputs();
      const chars = digits.split('').slice(0, otpElements.inputs.length);
      chars.forEach((char, charIndex) => {
        otpElements.inputs[charIndex].value = char;
      });
      const focusIndex = Math.min(chars.length - 1, otpElements.inputs.length - 1);
      if (focusIndex >= 0) {
        otpElements.inputs[focusIndex].focus();
      }
      hideOtpError();
      updateOtpVerifyState();
    });

    input.addEventListener('focus', () => {
      if (input.value) {
        input.select();
      }
    });
  });

  confirmElements.proceedBtn?.addEventListener('click', (event) => {
    event.preventDefault();

    if (!otpActive) {
      showOtpSection();
      return;
    }

    if (!confirmElements.proceedBtn || confirmElements.proceedBtn.disabled) {
      return;
    }

    if (otpTimeLeft <= 0) {
      showOtpError('Kode OTP kedaluwarsa. Silakan kirim ulang kode untuk melanjutkan.');
      confirmElements.proceedBtn.disabled = true;
      return;
    }

    if (!isOtpFilled()) {
      showOtpError('Masukkan kode OTP lengkap.');
      confirmElements.proceedBtn.disabled = true;
      return;
    }

    if (typeof pendingNewLimit !== 'number' || Number.isNaN(pendingNewLimit)) {
      closeConfirmSheet({ immediate: true, force: true });
      return;
    }

    const newLimitValue = pendingNewLimit;

    const otpValue = getOtpValue();
    hideOtpError();
    console.log('OTP submitted:', otpValue);

    currentLimit = newLimitValue;
    persistLimit();
    updateDisplays();

    closeConfirmSheet();
    closeDrawer();
    showSuccessMessage('Batas transaksi harian berhasil diperbarui.');
  });

  updateDisplays();
})();
