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
const confirmElements = {
  container: document.getElementById('limitConfirmContainer'),
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

let otpState = 'idle';
let otpFlowInstance = null;

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

function ensureOtpFlow() {
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
  ensureOtpFlow().setError(message);
}

function hideOtpError() {
  ensureOtpFlow().setError('');
}

function activateOtpFlow() {
  const flow = ensureOtpFlow();
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
  flow.reset();
  if (otpElements.section) {
    otpElements.section.classList.add('hidden');
  }
  if (confirmElements.proceedBtn) {
    confirmElements.proceedBtn.textContent = 'Lanjut Ubah Batas Transaksi';
    confirmElements.proceedBtn.disabled = false;
  }
  if (confirmElements.cancelBtn) {
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

async function openConfirmSheet(newLimitValue) {
  const { container, sheet, previousValue, newValue } = confirmElements;
  if (!sheet) return;

  pendingNewLimit = newLimitValue;
  confirmSheetOpen = true;

  resetOtpFlow();

  if (previousValue) {
    previousValue.textContent = formatCurrency(currentLimit);
  }
  if (newValue) {
    newValue.textContent = formatCurrency(newLimitValue);
  }

  await openBottomSheet({
    container,
    sheet,
    closeSelectors: ['#limitConfirmCancelBtn'],
    focusTarget: '#limitConfirmProceedBtn',
    onOpen: () => {
      confirmSheetOpen = true;
    },
    onClose: () => {
      confirmSheetOpen = false;
      pendingNewLimit = null;
      resetOtpFlow();
    },
  });
}

async function closeConfirmSheet(options = {}) {
  const { container, sheet } = confirmElements;
  if (!sheet) return;
  if (!confirmSheetOpen && !options.force) return;

  confirmSheetOpen = false;
  pendingNewLimit = null;
  resetOtpFlow();

  await closeBottomSheet({ immediate: Boolean(options.immediate) });

  container?.classList.add('pointer-events-none');
}

function openLimitDrawer() {
  if (!drawer) return;

  closeConfirmSheet({ immediate: true });

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
      closeConfirmSheet({ immediate: true });
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
    closeLimitDrawer();
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

const otpFlow = ensureOtpFlow();
resetOtpFlow();

confirmElements.proceedBtn?.addEventListener('click', (event) => {
  event.preventDefault();

  if (otpState !== 'active') {
    activateOtpFlow();
    return;
  }

  if (!confirmElements.proceedBtn || confirmElements.proceedBtn.disabled) {
    return;
  }

  const otpValue = otpFlow.getValue();
  if (otpValue.length < otpElements.inputs.length) {
    showOtpError('Masukkan kode OTP lengkap.');
    confirmElements.proceedBtn.disabled = true;
    return;
  }

  if (typeof pendingNewLimit !== 'number' || Number.isNaN(pendingNewLimit)) {
    closeConfirmSheet({ immediate: true });
    return;
  }

  hideOtpError();

  const previousLimitValue = currentLimit;
  const newLimitValue = pendingNewLimit;

  console.log('OTP submitted:', otpValue);

  closeConfirmSheet();
  showPendingView(previousLimitValue, newLimitValue);
});


pendingCloseBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  closeLimitDrawer();
});

updateDisplays();
