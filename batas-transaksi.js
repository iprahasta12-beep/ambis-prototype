import { openDrawer, closeDrawer } from './drawer.js';
import { openBottomSheet, closeBottomSheet } from './bottomsheet.js';
import { createOtpFlow } from './otp.js';

const MAX_LIMIT = 200_000_000;
const STORAGE_KEY = 'ambis:batas-transaksi-limit';

const drawer = document.getElementById('drawer');
const openBtn = document.getElementById('openLimitDrawerBtn');
const closeBtn = document.getElementById('limitDrawerCloseBtn');
const confirmBtn = document.getElementById('confirmLimitBtn');
const formSection = document.getElementById('limitFormSection');
const pendingSection = document.getElementById('limitPendingSection');
const pendingPreviousValueEl = document.getElementById('limitPendingPreviousValue');
const pendingNewValueEl = document.getElementById('limitPendingNewValue');
const pendingCloseBtn = document.getElementById('limitPendingCloseBtn');
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
const confirmTemplate = document.getElementById('limitConfirmTemplate');

function createConfirmSheet() {
  if (!confirmTemplate) return null;

  const container = document.createElement('div');
  container.className = 'fixed inset-0 z-50 flex items-end justify-center pointer-events-none hidden';
  container.setAttribute('aria-hidden', 'true');

  const fragment = confirmTemplate.content.cloneNode(true);
  container.appendChild(fragment);
  document.body.appendChild(container);

  const sheet = container.querySelector('[data-bottom-sheet]');
  if (!sheet) {
    document.body.removeChild(container);
    return null;
  }

  return {
    container,
    sheet,
    previousValue: container.querySelector('[data-limit-confirm-previous]'),
    newValue: container.querySelector('[data-limit-confirm-new]'),
    cancelBtn: container.querySelector('[data-limit-confirm-cancel]'),
    proceedBtn: container.querySelector('[data-limit-confirm-proceed]'),
    otpSection: container.querySelector('[data-limit-otp-section]'),
    otpInputs: Array.from(container.querySelectorAll('[data-limit-otp-input]')),
    otpCountdown: container.querySelector('[data-limit-otp-countdown]'),
    otpCountdownMessage: container.querySelector('[data-limit-otp-countdown-message]'),
    otpTimer: container.querySelector('[data-limit-otp-timer]'),
    otpResend: container.querySelector('[data-limit-otp-resend]'),
    otpError: container.querySelector('[data-limit-otp-error]'),
  };
}

const confirmElements = createConfirmSheet();

const otpElements = confirmElements
  ? {
      section: confirmElements.otpSection,
      inputs: confirmElements.otpInputs,
      countdown: confirmElements.otpCountdown,
      countdownMessage: confirmElements.otpCountdownMessage,
      timer: confirmElements.otpTimer,
      resendBtn: confirmElements.otpResend,
      error: confirmElements.otpError,
    }
  : {
      section: null,
      inputs: [],
      countdown: null,
      countdownMessage: null,
      timer: null,
      resendBtn: null,
      error: null,
    };

const OTP_DURATION_SECONDS = 30;
const OTP_DEFAULT_COUNTDOWN_MESSAGE = 'Sesi akan berakhir dalam';
const OTP_EXPIRED_MESSAGE = 'Kode OTP kedaluwarsa. Silakan kirim ulang kode untuk melanjutkan.';
const otpCountdownDefaultMessage =
  otpElements.countdownMessage?.textContent?.trim() || OTP_DEFAULT_COUNTDOWN_MESSAGE;

let otpState = 'idle';
let otpFlowInstance = null;

let infoOverlayOpen = false;

let currentLimit = 150_000_000;
let pendingNewLimit = null;
let confirmSheetOpen = false;
let confirmSheetClosingReason = null;
let successTimer = null;

const confirmSheetDefaultCallbacks = {
  onOpen: null,
  onClose: null,
  onConfirm: null,
  onCancel: null,
};

let confirmSheetCallbacks = { ...confirmSheetDefaultCallbacks };

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

function ensureOtpFlow() {
  if (!confirmElements) return null;
  if (otpFlowInstance) return otpFlowInstance;
  otpFlowInstance = createOtpFlow({
    container: otpElements.section,
    inputs: otpElements.inputs,
    countdownElement: otpElements.countdown,
    countdownMessageElement: otpElements.countdownMessage,
    timerElement: otpElements.timer,
    errorElement: otpElements.error,
    resendButton: otpElements.resendBtn,
    duration: OTP_DURATION_SECONDS,
    countdownMessage: otpCountdownDefaultMessage,
    expiredMessage: OTP_EXPIRED_MESSAGE,
    onRequest: () => {
      console.info('OTP requested for limit change');
    },
    onResend: () => {
      console.info('OTP resent for limit change');
    },
    onChange: ({ filled }) => {
      if (confirmElements.proceedBtn && otpState === 'active') {
        confirmElements.proceedBtn.disabled = !filled;
      }
    },
    onError: () => {
      if (confirmElements.proceedBtn && otpState === 'active') {
        confirmElements.proceedBtn.disabled = true;
      }
    },
    onExpire: () => {
      if (confirmElements.proceedBtn && otpState === 'active') {
        confirmElements.proceedBtn.disabled = true;
      }
      ensureOtpFlow().setError(OTP_EXPIRED_MESSAGE);
    },
  });
  return otpFlowInstance;
}

function showOtpError(message) {
  const flow = ensureOtpFlow();
  flow?.setError(message);
}

function hideOtpError() {
  const flow = ensureOtpFlow();
  flow?.setError('');
}

function activateOtpFlow() {
  const flow = ensureOtpFlow();
  if (!confirmElements || !flow) return null;
  if (otpState === 'active') return flow;
  otpState = 'active';
  if (otpElements.section) {
    otpElements.section.classList.remove('hidden');
  }
  if (confirmElements.proceedBtn) {
    confirmElements.proceedBtn.textContent = 'Verifikasi';
    confirmElements.proceedBtn.disabled = true;
  }
  if (confirmElements.cancelBtn) {
    confirmElements.cancelBtn.textContent = 'Batalkan';
  }
  flow.start();
  return flow;
}

function resetOtpFlow() {
  const flow = ensureOtpFlow();
  otpState = 'idle';
  flow?.reset?.();
  if (otpElements.section) {
    otpElements.section.classList.add('hidden');
  }
  if (confirmElements?.proceedBtn) {
    confirmElements.proceedBtn.textContent = 'Konfirmasi';
    confirmElements.proceedBtn.disabled = false;
  }
  if (confirmElements?.cancelBtn) {
    confirmElements.cancelBtn.textContent = 'Batal';
  }
}

function getOtpValue() {
  return ensureOtpFlow().getValue();
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

function showFormView() {
  if (formSection) {
    formSection.classList.remove('hidden');
  }
  if (pendingSection) {
    pendingSection.classList.add('hidden');
  }
}

function showPendingView(previousLimit, newLimitValue) {
  if (pendingPreviousValueEl) {
    pendingPreviousValueEl.textContent = formatCurrency(previousLimit);
  }
  if (pendingNewValueEl) {
    pendingNewValueEl.textContent = formatCurrency(newLimitValue);
  }

  if (pendingSection) {
    pendingSection.classList.remove('hidden');
  }
  if (formSection) {
    formSection.classList.add('hidden');
  }

  pendingCloseBtn?.focus?.();
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

async function openConfirmSheet(newLimitValue, callbacks = {}) {
  if (!confirmElements?.sheet) return;

  pendingNewLimit = newLimitValue;
  confirmSheetCallbacks = {
    ...confirmSheetDefaultCallbacks,
    ...callbacks,
  };

  confirmSheetClosingReason = null;
  resetOtpFlow();

  if (confirmElements.previousValue) {
    confirmElements.previousValue.textContent = formatCurrency(currentLimit);
  }
  if (confirmElements.newValue) {
    confirmElements.newValue.textContent = formatCurrency(newLimitValue);
  }

  await openBottomSheet({
    container: confirmElements.container,
    sheet: confirmElements.sheet,
    closeSelectors: [],
    focusTarget: confirmElements.proceedBtn,
    onOpen: () => {
      confirmSheetOpen = true;
      if (typeof confirmSheetCallbacks.onOpen === 'function') {
        confirmSheetCallbacks.onOpen({
          sheet: confirmElements.sheet,
          container: confirmElements.container,
          newLimit: newLimitValue,
        });
      }
    },
    onClose: () => {
      confirmSheetOpen = false;
      pendingNewLimit = null;
      resetOtpFlow();
      const reason = confirmSheetClosingReason || 'cancel';
      if (reason !== 'confirm' && typeof confirmSheetCallbacks.onCancel === 'function') {
        confirmSheetCallbacks.onCancel({
          sheet: confirmElements.sheet,
          container: confirmElements.container,
          reason,
        });
      }
      if (typeof confirmSheetCallbacks.onClose === 'function') {
        confirmSheetCallbacks.onClose({
          sheet: confirmElements.sheet,
          container: confirmElements.container,
          reason,
        });
      }
      confirmSheetClosingReason = null;
      confirmSheetCallbacks = { ...confirmSheetDefaultCallbacks };
    },
  });
}

async function closeConfirmSheet(options = {}) {
  if (!confirmElements?.sheet) return;
  if (!confirmSheetOpen && !options.force) return;

  if (!confirmSheetClosingReason) {
    confirmSheetClosingReason = 'cancel';
  }

  await closeBottomSheet({ immediate: Boolean(options.immediate) });
}

function openLimitDrawer() {
  if (!drawer) return;

  closeConfirmSheet({ immediate: true, force: true });

  showFormView();

  if (input) {
    input.value = '';
  }

  hideError();
  closeInfoOverlay();

  if (confirmBtn) confirmBtn.disabled = true;

  updateDisplays();

  openDrawer({
    drawer,
    title: 'Ubah Batas Transaksi Harian',
    contentTarget: '[data-drawer-content]',
    content: (contentEl) => {
      if (contentEl) {
        contentEl.classList.add('drawer-content-ready');
      }
    },
    closeSelectors: ['#limitDrawerCloseBtn'],
    onOpen: () => {
      if (typeof window.sidebarCollapseForDrawer === 'function') {
        window.sidebarCollapseForDrawer();
      }
    },
    onClose: () => {
      closeConfirmSheet({ immediate: true, force: true });
      closeInfoOverlay();
      showFormView();
      if (typeof window.sidebarRestoreForDrawer === 'function') {
        window.sidebarRestoreForDrawer();
      }
    },
  });
}

function closeLimitDrawer() {
  closeDrawer();
}

openBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  openLimitDrawer();
});

closeBtn?.addEventListener('click', () => {
  closeLimitDrawer();
});

confirmBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  if (!validateInput()) return;
  const newValue = getInputValue();
  if (Number.isNaN(newValue)) return;

  openConfirmSheet(newValue, {
    onOpen: () => {
      hideOtpError();
    },
    onCancel: () => {
      hideOtpError();
    },
    onConfirm: async ({ previousLimit, newLimit, otp }) => {
      console.log(
        'OTP submitted for limit change:',
        otp,
        'previous limit:',
        formatCurrency(previousLimit),
        'new limit:',
        formatCurrency(newLimit),
      );
      currentLimit = newLimit;
      persistLimit();
      updateDisplays();
      showSuccessMessage('Batas transaksi harian berhasil diperbarui.');
      showFormView();
      return true;
    },
  });
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
    confirmSheetClosingReason = 'cancel';
    closeConfirmSheet();
    return;
  }
  if (drawer?.classList.contains('open')) {
    closeLimitDrawer();
  }
});

confirmElements?.cancelBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  confirmSheetClosingReason = 'cancel';
  closeConfirmSheet();
});

const otpFlow = ensureOtpFlow();
resetOtpFlow();

confirmElements?.proceedBtn?.addEventListener('click', async (event) => {
  event.preventDefault();

  if (!confirmElements?.proceedBtn) return;

  if (otpState !== 'active') {
    activateOtpFlow();
    return;
  }

  if (confirmElements.proceedBtn.disabled) {
    return;
  }

  const flow = ensureOtpFlow();
  if (!flow) {
    closeConfirmSheet({ force: true, immediate: true });
    return;
  }

  const otpValue = flow.getValue();
  if (otpValue.length < otpElements.inputs.length) {
    showOtpError('Masukkan kode OTP lengkap.');
    confirmElements.proceedBtn.disabled = true;
    return;
  }

  if (typeof pendingNewLimit !== 'number' || Number.isNaN(pendingNewLimit)) {
    closeConfirmSheet({ force: true, immediate: true });
    return;
  }

  hideOtpError();

  const previousLimitValue = currentLimit;
  const newLimitValue = pendingNewLimit;

  confirmElements.proceedBtn.disabled = true;

  try {
    const result = await Promise.resolve(
      confirmSheetCallbacks.onConfirm?.({
        previousLimit: previousLimitValue,
        newLimit: newLimitValue,
        otp: otpValue,
      }) ?? true,
    );

    if (result === false) {
      confirmElements.proceedBtn.disabled = false;
      return;
    }

    confirmSheetClosingReason = 'confirm';
    await closeConfirmSheet();
    closeLimitDrawer();
  } catch (error) {
    const message = error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
    showOtpError(message);
    confirmElements.proceedBtn.disabled = false;
  }
});


pendingCloseBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  closeLimitDrawer();
});

updateDisplays();
