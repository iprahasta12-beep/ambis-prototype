(function () {
  const MIN_LIMIT = 1;
  const DEFAULT_DAILY_MAX_LIMIT = 200_000_000;

  const dailyMaxLimitDisplay = document.getElementById('dailyMaxLimitValue');

  function toIntegerAmount(value) {
    if (typeof value !== 'string') {
      return null;
    }

    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) {
      return null;
    }

    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function resolveDailyMaxLimit() {
    const fallbackValue = dailyMaxLimitDisplay ? toIntegerAmount(dailyMaxLimitDisplay.textContent ?? '') : null;

    if (typeof fallbackValue === 'number') {
      return fallbackValue;
    }

    return DEFAULT_DAILY_MAX_LIMIT;
  }

  const resolvedDailyMaxLimit = resolveDailyMaxLimit();

  const drawer = document.getElementById('drawer');
  const drawerController =
    window.drawerManager && typeof window.drawerManager.register === 'function'
      ? window.drawerManager.register(drawer, { manageAria: true })
      : null;
  const approvalPane = document.getElementById('approvalPane');
  const drawerCloseBtn = document.getElementById('approvalDrawerClose');
  const drawerTitle = document.getElementById('approvalDrawerTitle');
  const pendingPane = document.getElementById('approvalPendingPane');
  const pendingCloseBtn = document.getElementById('approvalPendingClose');
  const pendingDismissBtn = document.getElementById('approvalPendingDismiss');
  const pendingViewProcessBtn = document.getElementById('approvalPendingViewProcess');
  const pendingList = document.getElementById('approvalPendingList');

  const rowsContainer = document.getElementById('approvalRowsContainer');
  const emptyState = document.getElementById('approvalEmptyState');

  const matrixSection = document.getElementById('approvalMatrixSection');
  const matrixList = document.getElementById('approvalMatrixList');

  const minInput = document.getElementById('minLimitInput');
  const maxInput = document.getElementById('maxLimitInput');
  const approverInput = document.getElementById('approverCountInput');

  const minError = document.getElementById('minLimitError');
  const maxError = document.getElementById('maxLimitError');
  const approverError = document.getElementById('approverCountError');

  const saveBtn = document.getElementById('saveChangesBtn');
  const confirmBtn = document.getElementById('confirmApprovalBtn');
  const confirmOverlay = document.getElementById('approvalConfirmOverlay');
  const confirmSheet = document.getElementById('approvalConfirmSheet');
  const confirmList = document.getElementById('approvalConfirmList');
  const confirmBackBtn = document.getElementById('approvalConfirmBack');
  const confirmProceedBtn = document.getElementById('approvalConfirmProceed');
  const confirmOtpSection = document.getElementById('approvalConfirmOtpSection');
  const confirmOtpInputs = confirmOtpSection ? Array.from(confirmOtpSection.querySelectorAll('.otp-input')) : [];
  const confirmOtpCountdown = document.getElementById('approvalConfirmOtpCountdown');
  const confirmOtpCountdownMessage = document.getElementById('approvalConfirmOtpCountdownMessage');
  const confirmOtpTimer = document.getElementById('approvalConfirmOtpTimer');
  const confirmOtpResendBtn = document.getElementById('approvalConfirmOtpResend');
  const confirmOtpError = document.getElementById('approvalConfirmOtpError');

  const confirmSheetState = {};
  const confirmSheetController = window.bottomSheetManager?.create({
    overlay: confirmOverlay,
    sheet: confirmSheet,
    state: confirmSheetState,
    closeDuration: 200,
  });

  const numberFormatter = new Intl.NumberFormat('id-ID');

  const CONFIRM_BACK_DEFAULT_LABEL = 'Kembali';
  const CONFIRM_PROCEED_DEFAULT_LABEL = 'Lanjut Ubah Persetujuan';
  const CONFIRM_BACK_OTP_LABEL = 'Batalkan';
  const CONFIRM_PROCEED_OTP_LABEL = 'Verifikasi';
  const OTP_DURATION_SECONDS = 30;
  const OTP_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir.';

  const state = {
    dailyMaxLimit: resolvedDailyMaxLimit,
    tableRows: [
      { id: 'table-1', min: 1, max: resolvedDailyMaxLimit, approvers: 2 },
    ],
    matrixEntries: [],
    drawerContext: null,
    editingMatrixIndex: null,
    initialValues: { min: null, max: null, approvers: null },
    isDrawerOpen: false,
    nextMatrixId: 1,
  };

  let confirmOverlayHideTimeout = null;
  let isConfirmSheetOpen = false;
  let confirmOtpActive = false;
  let confirmOtpIntervalId = null;
  let confirmOtpTimeLeft = OTP_DURATION_SECONDS;
  const confirmOtpCountdownDefaultMessage =
    confirmOtpCountdownMessage?.textContent?.trim() || 'Sesi akan berakhir dalam';

  function formatCurrency(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '';
    }
    return `Rp ${numberFormatter.format(value)}`;
  }

  function parseCurrency(value) {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    return toIntegerAmount(value);
  }

  function setInputValue(input, value) {
    if (!input) return;
    if (value == null) {
      input.value = '';
    } else if (input === approverInput) {
      input.value = String(value);
    } else {
      input.value = formatCurrency(value);
    }
  }

  function clearErrors() {
    if (minError) {
      minError.textContent = '';
      minError.classList.add('hidden');
    }
    if (maxError) {
      maxError.textContent = '';
      maxError.classList.add('hidden');
    }
    if (approverError) {
      approverError.textContent = '';
      approverError.classList.add('hidden');
    }
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function ensureDrawerOpen() {
    if (!drawer || state.isDrawerOpen) {
      return;
    }
    if (drawerController) {
      drawerController.open();
    } else {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      if (typeof window.sidebarCollapseForDrawer === 'function') {
        window.sidebarCollapseForDrawer();
      }
    }
    drawer.setAttribute('aria-hidden', 'false');
    state.isDrawerOpen = true;
  }

  function ensureDrawerClosed() {
    if (!drawer || !state.isDrawerOpen) {
      return;
    }
    closeConfirmSheet({ focusTrigger: false });
    if (pendingPane) {
      pendingPane.classList.add('hidden');
    }
    if (approvalPane) {
      approvalPane.classList.remove('hidden');
    }
    if (drawerController) {
      drawerController.close();
    } else {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      if (typeof window.sidebarRestoreForDrawer === 'function') {
        window.sidebarRestoreForDrawer();
      }
    }
    drawer.setAttribute('aria-hidden', 'true');
    state.isDrawerOpen = false;
    state.drawerContext = null;
    state.editingMatrixIndex = null;
    state.initialValues = { min: null, max: null, approvers: null };
    clearErrors();
    updateSaveButtonState();
    updateConfirmButtonState();
  }

  function setDrawerContext(
    context,
    {
      min = null,
      max = null,
      approvers = null,
      editingIndex = null,
      resetForNext = false,
    } = {}
  ) {
    state.drawerContext = context;
    state.editingMatrixIndex = editingIndex;

    let derivedMin = min;
    let derivedMax = max;
    let derivedApprovers = approvers;

    if (context === 'table' && editingIndex == null) {
      const lastEntry = state.matrixEntries[state.matrixEntries.length - 1];

      if (derivedMin == null && lastEntry && typeof lastEntry.max === 'number') {
        if (lastEntry.max >= state.dailyMaxLimit) {
          derivedMin = state.dailyMaxLimit;
        } else {
          derivedMin = Math.min(lastEntry.max + 1, state.dailyMaxLimit);
        }
      }

      if (resetForNext) {
        derivedMax = null;
        derivedApprovers = null;
      }
    }

    state.initialValues = {
      min: derivedMin,
      max: derivedMax,
      approvers: derivedApprovers,
    };

    if (drawerTitle) {
      drawerTitle.textContent = context === 'matrix' ? 'Ubah Approval Matrix' : 'Ubah Persetujuan Transfer';
    }

    setInputValue(minInput, derivedMin);
    setInputValue(maxInput, derivedMax);
    setInputValue(approverInput, derivedApprovers);

    clearErrors();
    updateSaveButtonState();
    updateConfirmButtonState();
  }

  function renderTable() {
    if (!rowsContainer || !emptyState) return;

    rowsContainer.innerHTML = '';

    if (!state.tableRows.length) {
      emptyState.classList.remove('hidden');
      rowsContainer.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    rowsContainer.classList.remove('hidden');

    state.tableRows.forEach((row) => {
      const container = document.createElement('div');
      container.className = 'approval-table-row items-center gap-4 px-6 py-4';

      const range = document.createElement('p');
      range.className = 'text-sm text-slate-700 text-left';
      range.textContent = `${formatCurrency(row.min)} – ${formatCurrency(row.max)}`;

      const approvers = document.createElement('p');
      approvers.className = 'text-sm font-semibold text-slate-500 text-center';
      approvers.textContent = `${row.approvers} Penyetuju`;

      const action = document.createElement('div');
      action.className = 'flex justify-end';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'inline-flex items-center justify-center rounded-lg border border-cyan-500 bg-white px-4 py-2 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60';
      editBtn.textContent = 'Ubah';
      editBtn.addEventListener('click', () => {
        ensureDrawerOpen();
        setDrawerContext('table', {
          min: row.min,
          max: row.max,
          approvers: row.approvers,
        });
      });

      action.appendChild(editBtn);
      container.appendChild(range);
      container.appendChild(approvers);
      container.appendChild(action);
      rowsContainer.appendChild(container);
    });
  }

  function createMatrixCard(entry, index) {
    const card = document.createElement('article');
    card.className = 'flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm';

    const content = document.createElement('div');
    content.className = 'space-y-1';

    const title = document.createElement('p');
    title.className = 'text-sm font-bold text-slate-900 mb-4';
    title.textContent = `Jumlah Approval = ${entry.approvers}`;

    const subtitle = document.createElement('p');
    subtitle.className = 'text-xs font-semibold tracking-wide text-slate-400';
    subtitle.textContent = 'Nominal Transaksi';

    const body = document.createElement('p');
    body.className = 'text-sm text-slate-600';
    body.textContent = `Min. Rp${numberFormatter.format(entry.min)} » Max. Rp${numberFormatter.format(entry.max)}`;

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(body);

    const action = document.createElement('div');
    action.className = 'flex flex-shrink-0';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'inline-flex items-center justify-center rounded-lg border border-cyan-500 px-3 py-2 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60';
    editBtn.textContent = 'Ubah';
    editBtn.addEventListener('click', () => {
      ensureDrawerOpen();
      setDrawerContext('matrix', {
        min: entry.min,
        max: entry.max,
        approvers: entry.approvers,
        editingIndex: index,
      });
    });

    action.appendChild(editBtn);

    card.appendChild(content);
    card.appendChild(action);

    return card;
  }

  function renderMatrixList() {
    if (!matrixList || !matrixSection) return;

    matrixList.innerHTML = '';

    if (!state.matrixEntries.length) {
      matrixSection.classList.add('hidden');
      updateConfirmButtonState();
      return;
    }

    matrixSection.classList.remove('hidden');

    state.matrixEntries.forEach((entry, index) => {
      matrixList.appendChild(createMatrixCard(entry, index));
    });

    updateConfirmButtonState();
  }

  function getCurrentInputValues() {
    return {
      min: parseCurrency(minInput?.value ?? ''),
      max: parseCurrency(maxInput?.value ?? ''),
      approvers: approverInput && approverInput.value ? parseInt(approverInput.value, 10) : null,
    };
  }

  function hasInputChanges() {
    const current = getCurrentInputValues();
    const initial = state.initialValues;

    return (
      current.min !== initial.min ||
      current.max !== initial.max ||
      current.approvers !== initial.approvers
    );
  }

  function areValuesValid(values) {
    if (!values) {
      return false;
    }

    const { min, max, approvers } = values;

    if (min == null || max == null || approvers == null) {
      return false;
    }

    if (min < MIN_LIMIT || max > state.dailyMaxLimit) {
      return false;
    }

    if (max < min) {
      return false;
    }

    if (!Number.isInteger(approvers) || approvers < 1) {
      return false;
    }

    return true;
  }

  function updateSaveButtonState() {
    if (!saveBtn) return;
    const current = getCurrentInputValues();
    saveBtn.disabled = !(hasInputChanges() && areValuesValid(current));
  }

  function validateInputs() {
    const { min, max, approvers } = getCurrentInputValues();
    let hasError = false;

    clearErrors();

    if (min == null) {
      showError(minError, 'Batas Minimal wajib diisi.');
      hasError = true;
    } else if (min < MIN_LIMIT) {
      showError(minError, `Batas Minimal tidak boleh kurang dari Rp ${numberFormatter.format(MIN_LIMIT)}.`);
      hasError = true;
    }

    if (max == null) {
      showError(maxError, 'Batas Maksimal wajib diisi.');
      hasError = true;
    } else if (max > state.dailyMaxLimit) {
      const formattedDailyLimit = formatCurrency(state.dailyMaxLimit);
      showError(maxError, `Batas Maksimal tidak boleh lebih dari ${formattedDailyLimit}.`);
      hasError = true;
    }

    if (min != null && max != null && max < min) {
      showError(maxError, 'Batas Maksimal harus lebih besar atau sama dengan Batas Minimal.');
      hasError = true;
    }

    if (approvers == null || Number.isNaN(approvers)) {
      showError(approverError, 'Jumlah penyetuju wajib diisi.');
      hasError = true;
    } else if (approvers < 1) {
      showError(approverError, 'Jumlah penyetuju minimal 1.');
      hasError = true;
    }

    return hasError ? null : { min, max, approvers };
  }

  function hasSingleMatrixCoveringMax(entries) {
    if (!entries.length) {
      return false;
    }

    const coveringEntries = entries.filter((entry) => {
      if (entry == null) {
        return false;
      }

      const { min, max } = entry;
      if (min == null || max == null) {
        return false;
      }

      return min <= state.dailyMaxLimit && max === state.dailyMaxLimit;
    });

    return coveringEntries.length === 1;
  }

  function updateConfirmButtonState() {
    if (!confirmBtn) return;
    confirmBtn.disabled = !hasSingleMatrixCoveringMax(state.matrixEntries);
  }

  function getSortedMatrixEntries() {
    return state.matrixEntries
      .filter((entry) => entry && typeof entry.min === 'number' && typeof entry.max === 'number' && typeof entry.approvers === 'number')
      .slice()
      .sort((a, b) => a.min - b.min);
  }

  function formatApproverLabel(count) {
    if (count == null || Number.isNaN(count)) {
      return '-';
    }

    return `${count} Penyetuju`;
  }

  function renderConfirmList(entries) {
    if (!confirmList) return;

    if (!entries.length) {
      confirmList.innerHTML = '<div class="px-4 py-6 text-center text-sm text-slate-500">Belum ada persetujuan transfer.</div>';
      return;
    }

    const html = entries
      .map((entry) => {
        const minLabel = formatCurrency(entry.min);
        const maxLabel = formatCurrency(entry.max);
        const approverLabel = formatApproverLabel(entry.approvers);
        return `
          <div class="approval-table-row items-center gap-4 min-h-[56px] px-4 py-4 text-sm">
            <span class="font-semibold text-slate-900">${minLabel} – ${maxLabel}</span>
            <span class="text-right text-sm font-semibold text-slate-700">${approverLabel}</span>
          </div>
        `;
      })
      .join('');

    confirmList.innerHTML = html;
  }

  function renderPendingList(entries) {
    if (!pendingList) return;

    if (!entries.length) {
      pendingList.innerHTML =
        '<div class="px-5 py-6 text-center text-sm text-slate-500">Belum ada persetujuan transfer.</div>';
      return;
    }

    const html = entries
      .map((entry) => {
        const minLabel = formatCurrency(entry.min);
        const maxLabel = formatCurrency(entry.max);
        const approverLabel = formatApproverLabel(entry.approvers);
        return `
          <div class="approval-table-row items-center gap-4 min-h-[56px] px-5 py-4 text-sm">
            <span class="font-semibold text-slate-900">${minLabel} – ${maxLabel}</span>
            <span class="text-right text-sm font-semibold text-slate-700">${approverLabel}</span>
          </div>
        `;
      })
      .join('');

    pendingList.innerHTML = html;
  }

  function openPendingPane(entries = []) {
    if (!pendingPane) {
      return;
    }

    const safeEntries = Array.isArray(entries) && entries.length ? entries : getSortedMatrixEntries();
    renderPendingList(safeEntries);

    if (approvalPane) {
      approvalPane.classList.add('hidden');
    }
    pendingPane.classList.remove('hidden');
    ensureDrawerOpen();
  }

  function closePendingPane({ closeDrawer = false } = {}) {
    if (pendingPane) {
      pendingPane.classList.add('hidden');
    }
    if (approvalPane) {
      approvalPane.classList.remove('hidden');
    }
    if (closeDrawer) {
      ensureDrawerClosed();
    }
  }

  function formatOtpTime(value) {
    const safeValue = Math.max(0, value);
    const minutes = Math.floor(safeValue / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (safeValue % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function setConfirmProceedEnabled(isEnabled) {
    if (!confirmProceedBtn) return;
    confirmProceedBtn.disabled = !isEnabled;
    confirmProceedBtn.classList.toggle('opacity-50', !isEnabled);
    confirmProceedBtn.classList.toggle('cursor-not-allowed', !isEnabled);
  }

  function hideConfirmOtpError() {
    if (!confirmOtpError) return;
    confirmOtpError.textContent = '';
    confirmOtpError.classList.add('hidden');
  }

  function showConfirmOtpError(message) {
    if (!confirmOtpError) return;
    confirmOtpError.textContent = message;
    confirmOtpError.classList.remove('hidden');
  }

  function clearConfirmOtpInterval() {
    if (confirmOtpIntervalId) {
      clearInterval(confirmOtpIntervalId);
      confirmOtpIntervalId = null;
    }
  }

  function resetConfirmOtpState() {
    confirmOtpActive = false;
    clearConfirmOtpInterval();
    confirmOtpTimeLeft = OTP_DURATION_SECONDS;

    if (confirmOtpSection) {
      confirmOtpSection.classList.add('hidden');
    }
    confirmOtpInputs.forEach((input) => {
      input.value = '';
    });
    hideConfirmOtpError();

    if (confirmOtpCountdown) {
      confirmOtpCountdown.classList.remove('hidden');
    }
    if (confirmOtpCountdownMessage) {
      confirmOtpCountdownMessage.textContent = confirmOtpCountdownDefaultMessage;
    }
    if (confirmOtpTimer) {
      confirmOtpTimer.textContent = formatOtpTime(OTP_DURATION_SECONDS);
      confirmOtpTimer.classList.remove('hidden');
    }
    if (confirmOtpResendBtn) {
      confirmOtpResendBtn.classList.add('hidden');
    }

    if (confirmBackBtn) {
      confirmBackBtn.textContent = CONFIRM_BACK_DEFAULT_LABEL;
    }
    if (confirmProceedBtn) {
      confirmProceedBtn.textContent = CONFIRM_PROCEED_DEFAULT_LABEL;
    }
    setConfirmProceedEnabled(true);
  }

  function isConfirmOtpFilled() {
    if (!confirmOtpInputs.length) {
      return false;
    }
    return confirmOtpInputs.every((input) => input.value && input.value.trim() !== '');
  }

  function updateConfirmOtpState() {
    if (!confirmOtpActive) {
      setConfirmProceedEnabled(true);
      return;
    }

    const canSubmit = isConfirmOtpFilled() && confirmOtpTimeLeft > 0;
    setConfirmProceedEnabled(canSubmit);
  }

  function handleConfirmOtpTick() {
    if (!confirmOtpTimer) {
      return;
    }

    confirmOtpTimeLeft -= 1;
    if (confirmOtpTimeLeft <= 0) {
      confirmOtpTimeLeft = 0;
      clearConfirmOtpInterval();
      if (confirmOtpCountdownMessage) {
        confirmOtpCountdownMessage.textContent = OTP_EXPIRED_MESSAGE;
      }
      if (confirmOtpTimer) {
        confirmOtpTimer.classList.add('hidden');
      }
      if (confirmOtpResendBtn) {
        confirmOtpResendBtn.classList.remove('hidden');
      }
      updateConfirmOtpState();
      showConfirmOtpError('Kode verifikasi kedaluwarsa. Silakan kirim ulang kode.');
      return;
    }

    confirmOtpTimer.textContent = formatOtpTime(confirmOtpTimeLeft);
  }

  function startConfirmOtpCountdown() {
    clearConfirmOtpInterval();
    confirmOtpTimeLeft = OTP_DURATION_SECONDS;

    if (confirmOtpCountdownMessage) {
      confirmOtpCountdownMessage.textContent = confirmOtpCountdownDefaultMessage;
    }
    if (confirmOtpTimer) {
      confirmOtpTimer.textContent = formatOtpTime(confirmOtpTimeLeft);
      confirmOtpTimer.classList.remove('hidden');
    }
    if (confirmOtpCountdown) {
      confirmOtpCountdown.classList.remove('hidden');
    }
    if (confirmOtpResendBtn) {
      confirmOtpResendBtn.classList.add('hidden');
    }

    confirmOtpIntervalId = setInterval(handleConfirmOtpTick, 1000);
  }

  function activateConfirmOtp() {
    confirmOtpActive = true;
    hideConfirmOtpError();

    if (confirmOtpSection) {
      confirmOtpSection.classList.remove('hidden');
    }
    if (confirmBackBtn) {
      confirmBackBtn.textContent = CONFIRM_BACK_OTP_LABEL;
    }
    if (confirmProceedBtn) {
      confirmProceedBtn.textContent = CONFIRM_PROCEED_OTP_LABEL;
    }

    confirmOtpInputs[0]?.focus();
    startConfirmOtpCountdown();
    updateConfirmOtpState();
  }

  function getConfirmOtpValue() {
    return confirmOtpInputs.map((input) => input.value).join('');
  }

  function openConfirmSheet() {
    if (!confirmOverlay || !confirmSheet || isConfirmSheetOpen) {
      return;
    }

    resetConfirmOtpState();
    renderConfirmList(getSortedMatrixEntries());

    window.clearTimeout(confirmOverlayHideTimeout);
    confirmOverlayHideTimeout = null;

    if (confirmSheetController) {
      confirmSheetController.open();
    } else {
      confirmOverlay.classList.remove('hidden');
      confirmOverlay.classList.remove('opacity-100');
      confirmOverlay.classList.add('opacity-0');

      requestAnimationFrame(() => {
        confirmOverlay.classList.remove('opacity-0');
        confirmOverlay.classList.add('opacity-100');
        confirmSheet.classList.remove('translate-y-full');
      });
    }

    isConfirmSheetOpen = true;

    if (confirmProceedBtn) {
      confirmProceedBtn.focus({ preventScroll: true });
    }
  }

  function closeConfirmSheet({ focusTrigger = true } = {}) {
    if (!confirmOverlay || !confirmSheet || !isConfirmSheetOpen) {
      return;
    }

    resetConfirmOtpState();
    isConfirmSheetOpen = false;

    if (confirmSheetController) {
      confirmSheetController.close();
      confirmOverlayHideTimeout = null;
    } else {
      confirmSheet.classList.add('translate-y-full');
      confirmOverlay.classList.remove('opacity-100');
      confirmOverlay.classList.add('opacity-0');

      confirmOverlayHideTimeout = window.setTimeout(() => {
        confirmOverlay.classList.add('hidden');
        confirmOverlayHideTimeout = null;
      }, 200);
    }

    if (focusTrigger && confirmBtn) {
      confirmBtn.focus({ preventScroll: true });
    }
  }

  function handleSave() {
    if (!saveBtn || saveBtn.disabled) {
      return;
    }

    const values = validateInputs();
    if (!values) {
      return;
    }

    if (state.drawerContext === 'matrix' && state.editingMatrixIndex != null) {
      const target = state.matrixEntries[state.editingMatrixIndex];
      if (target) {
        state.matrixEntries[state.editingMatrixIndex] = { ...target, ...values };
      }
    } else {
      state.matrixEntries.push({
        id: `matrix-${state.nextMatrixId}`,
        ...values,
      });
      state.nextMatrixId += 1;
    }

    renderMatrixList();

    if (state.drawerContext === 'matrix' && state.editingMatrixIndex != null) {
      const updatedEntry = state.matrixEntries[state.editingMatrixIndex];
      setDrawerContext('matrix', {
        ...updatedEntry,
        editingIndex: state.editingMatrixIndex,
      });
    } else {
      setDrawerContext('table', { min: null, max: null, approvers: null, resetForNext: true });
    }

    updateSaveButtonState();
  }

  function handleConfirm() {
    if (!hasSingleMatrixCoveringMax(state.matrixEntries)) {
      return;
    }

    openConfirmSheet();
  }

  function handleClose() {
    ensureDrawerClosed();
  }

  function handleMinInput(event) {
    if (!minInput) return;
    const digits = event.target.value.replace(/[^0-9]/g, '');
    minInput.value = digits ? formatCurrency(parseInt(digits, 10)) : '';
    if (minError) {
      minError.textContent = '';
      minError.classList.add('hidden');
    }
    updateSaveButtonState();
  }

  function handleMaxInput(event) {
    if (!maxInput) return;
    const digits = event.target.value.replace(/[^0-9]/g, '');
    const numericValue = digits ? parseInt(digits, 10) : null;
    maxInput.value = digits ? formatCurrency(numericValue) : '';

    if (maxError) {
      if (numericValue != null && numericValue > state.dailyMaxLimit) {
        const formattedDailyLimit = formatCurrency(state.dailyMaxLimit);
        showError(maxError, `Batas Maksimal tidak boleh lebih dari ${formattedDailyLimit}.`);
      } else {
        maxError.textContent = '';
        maxError.classList.add('hidden');
      }
    }
    updateSaveButtonState();
  }

  function handleApproverInput(event) {
    if (!approverInput) return;
    const digits = event.target.value.replace(/[^0-9]/g, '');
    approverInput.value = digits;
    if (approverError) {
      approverError.textContent = '';
      approverError.classList.add('hidden');
    }
    updateSaveButtonState();
  }

  function init() {
    if (dailyMaxLimitDisplay) {
      dailyMaxLimitDisplay.textContent = formatCurrency(state.dailyMaxLimit);
    }

    renderTable();
    renderMatrixList();
    updateSaveButtonState();
    updateConfirmButtonState();
  }

  init();

  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirm);
  }

  if (confirmBackBtn) {
    confirmBackBtn.addEventListener('click', () => {
      closeConfirmSheet();
    });
  }

  if (confirmOverlay) {
    confirmOverlay.addEventListener('click', (event) => {
      if (event.target === confirmOverlay) {
        closeConfirmSheet();
      }
    });
  }

  if (confirmOtpInputs.length) {
    confirmOtpInputs.forEach((input, idx) => {
      input.addEventListener('input', (event) => {
        const value = event.target.value.replace(/\D/g, '');
        event.target.value = value ? value[0] : '';
        if (value && idx < confirmOtpInputs.length - 1) {
          confirmOtpInputs[idx + 1].focus();
        }
        hideConfirmOtpError();
        updateConfirmOtpState();
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
          if (input.value) {
            input.value = '';
            hideConfirmOtpError();
            updateConfirmOtpState();
            event.preventDefault();
          } else if (idx > 0) {
            confirmOtpInputs[idx - 1].focus();
            confirmOtpInputs[idx - 1].value = '';
            hideConfirmOtpError();
            updateConfirmOtpState();
            event.preventDefault();
          }
        } else if (event.key === 'ArrowLeft' && idx > 0) {
          confirmOtpInputs[idx - 1].focus();
          event.preventDefault();
        } else if (event.key === 'ArrowRight' && idx < confirmOtpInputs.length - 1) {
          confirmOtpInputs[idx + 1].focus();
          event.preventDefault();
        }
      });

      input.addEventListener('paste', (event) => {
        event.preventDefault();
        const pasted = (event.clipboardData || window.clipboardData)
          ?.getData('text')
          ?.replace(/\D/g, '') || '';
        if (!pasted) {
          updateConfirmOtpState();
          return;
        }

        let currentIndex = idx;
        for (const char of pasted) {
          if (currentIndex >= confirmOtpInputs.length) break;
          confirmOtpInputs[currentIndex].value = char;
          currentIndex += 1;
        }

        if (currentIndex < confirmOtpInputs.length) {
          confirmOtpInputs[currentIndex].focus();
        } else {
          confirmOtpInputs[confirmOtpInputs.length - 1].focus();
        }

        hideConfirmOtpError();
        updateConfirmOtpState();
      });
    });
  }

  if (confirmOtpResendBtn) {
    confirmOtpResendBtn.addEventListener('click', () => {
      confirmOtpInputs.forEach((input) => {
        input.value = '';
      });
      hideConfirmOtpError();
      startConfirmOtpCountdown();
      confirmOtpInputs[0]?.focus();
      updateConfirmOtpState();
    });
  }

  if (confirmProceedBtn) {
    confirmProceedBtn.addEventListener('click', () => {
      if (!hasSingleMatrixCoveringMax(state.matrixEntries)) {
        return;
      }

      if (!confirmOtpActive) {
        activateConfirmOtp();
        return;
      }

      if (!isConfirmOtpFilled()) {
        showConfirmOtpError('Kode verifikasi wajib diisi.');
        updateConfirmOtpState();
        return;
      }

      if (confirmOtpTimeLeft <= 0) {
        showConfirmOtpError('Kode verifikasi kedaluwarsa. Silakan kirim ulang kode.');
        updateConfirmOtpState();
        return;
      }

      hideConfirmOtpError();
      const otpValue = getConfirmOtpValue();
      console.log('OTP submitted:', otpValue);

      window.dispatchEvent(new CustomEvent('approval:confirm-transfer', {
        detail: { entries: [...state.matrixEntries] },
      }));

      closeConfirmSheet();
    });
  }

  window.addEventListener('approval:confirm-transfer', (event) => {
    const entries = event?.detail?.entries ?? [];
    openPendingPane(entries);
  });

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', handleClose);
  }

  if (pendingCloseBtn) {
    pendingCloseBtn.addEventListener('click', () => {
      closePendingPane({ closeDrawer: true });
    });
  }

  if (pendingDismissBtn) {
    pendingDismissBtn.addEventListener('click', () => {
      closePendingPane({ closeDrawer: true });
    });
  }

  if (pendingViewProcessBtn) {
    pendingViewProcessBtn.addEventListener('click', () => {
      closePendingPane({ closeDrawer: true });
      window.location.href = 'persetujuan-transaksi.html#proses-persetujuan';
    });
  }

  if (minInput) {
    minInput.addEventListener('input', handleMinInput);
  }
  if (maxInput) {
    maxInput.addEventListener('input', handleMaxInput);
  }
  if (approverInput) {
    approverInput.addEventListener('input', handleApproverInput);
  }
})();
