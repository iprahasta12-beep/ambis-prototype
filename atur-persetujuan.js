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
  const drawerCloseBtn = document.getElementById('approvalDrawerClose');
  const drawerTitle = document.getElementById('approvalDrawerTitle');

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
  const confirmSheet = document.getElementById('confirmApprovalSheet');
  const confirmSheetOverlay = document.getElementById('confirmApprovalSheetOverlay');
  const confirmSheetPanel = document.getElementById('confirmApprovalSheetPanel');
  const confirmSheetList = document.getElementById('confirmApprovalSheetList');
  const confirmSheetBackBtn = document.getElementById('confirmApprovalSheetBack');
  const confirmSheetProceedBtn = document.getElementById('confirmApprovalSheetProceed');

  const numberFormatter = new Intl.NumberFormat('id-ID');

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

  let isConfirmSheetOpen = false;
  const CONFIRM_SHEET_TRANSITION_MS = 300;

  function formatCurrency(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '';
    }
    return `Rp ${numberFormatter.format(value)}`;
  }

  function formatCurrencyCompact(value) {
    const formatted = formatCurrency(value);
    return formatted.replace(/^Rp\s+/, 'Rp');
  }

  function formatApproverLabel(count) {
    if (typeof count !== 'number' || Number.isNaN(count)) {
      return '';
    }
    return `${count} Penyetuju`;
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
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    state.isDrawerOpen = true;
  }

  function ensureDrawerClosed() {
    if (!drawer || !state.isDrawerOpen) {
      return;
    }
    closeConfirmSheet({ immediate: true });
    drawer.classList.remove('open');
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
      container.className = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4';

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

  function getSortedMatrixEntries() {
    const validEntries = state.matrixEntries.filter((entry) => {
      if (!entry) {
        return false;
      }

      const { min, max, approvers } = entry;
      return (
        typeof min === 'number' &&
        typeof max === 'number' &&
        typeof approvers === 'number' &&
        !Number.isNaN(min) &&
        !Number.isNaN(max) &&
        !Number.isNaN(approvers)
      );
    });

    return [...validEntries].sort((a, b) => {
      if (a.min == null && b.min == null) return 0;
      if (a.min == null) return 1;
      if (b.min == null) return -1;
      return a.min - b.min;
    });
  }

  function renderConfirmSheetList(entries = getSortedMatrixEntries()) {
    if (!confirmSheetList) return;

    confirmSheetList.innerHTML = '';

    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm text-slate-500';
      empty.textContent = 'Belum ada persetujuan transfer.';
      confirmSheetList.appendChild(empty);
      return;
    }

    entries.forEach((entry) => {
      const row = document.createElement('article');
      row.className = 'flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3';

      const left = document.createElement('div');
      left.className = 'flex flex-col gap-1';

      const leftLabel = document.createElement('p');
      leftLabel.className = 'text-[11px] font-semibold uppercase tracking-wide text-slate-500';
      leftLabel.textContent = 'Nominal Transaksi';

      const leftValue = document.createElement('p');
      leftValue.className = 'text-sm font-medium text-slate-700';
      leftValue.textContent = `${formatCurrencyCompact(entry.min)} - ${formatCurrencyCompact(entry.max)}`;

      left.appendChild(leftLabel);
      left.appendChild(leftValue);

      const right = document.createElement('div');
      right.className = 'flex flex-col items-end gap-1 text-right';

      const rightLabel = document.createElement('p');
      rightLabel.className = 'text-[11px] font-semibold uppercase tracking-wide text-slate-500';
      rightLabel.textContent = 'Jumlah Penyetuju';

      const rightValue = document.createElement('p');
      rightValue.className = 'text-sm font-semibold text-slate-700';
      rightValue.textContent = formatApproverLabel(entry.approvers);

      right.appendChild(rightLabel);
      right.appendChild(rightValue);

      row.appendChild(left);
      row.appendChild(right);

      confirmSheetList.appendChild(row);
    });
  }

  function openConfirmSheet() {
    if (!confirmSheet || isConfirmSheetOpen) {
      return;
    }
    });

    isConfirmSheetOpen = true;

    if (confirmSheetProceedBtn) {
      confirmSheetProceedBtn.focus();
    }
  }

  function closeConfirmSheet({ immediate = false } = {}) {
    if (!confirmSheetPanel) {
      return;
    }


      isConfirmSheetOpen = false;
      return;
    }

    if (!isConfirmSheetOpen) {
      return;
    }


    isConfirmSheetOpen = false;
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

    const entries = getSortedMatrixEntries();
    if (!entries.length) {
      return;
    }

    renderConfirmSheetList(entries);
    openConfirmSheet();
  }

  function handleConfirmBack() {
    closeConfirmSheet();
  }

  function handleConfirmProceed() {
    const entries = getSortedMatrixEntries();
    if (!entries.length) {
      closeConfirmSheet({ immediate: true });
      return;
    }

    closeConfirmSheet({ immediate: true });

    state.tableRows = entries.map((entry, index) => ({
      id: `table-${index + 1}`,
      min: entry.min,
      max: entry.max,
      approvers: entry.approvers,
    }));

    state.matrixEntries = entries.map((entry) => ({ ...entry }));

    renderTable();
    renderMatrixList();
    updateConfirmButtonState();

    ensureDrawerClosed();

    const payloadEntries = entries.map((entry) => ({ ...entry }));
    window.dispatchEvent(new CustomEvent('approval:confirm-transfer', {
      detail: { entries: payloadEntries },
    }));
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

  if (confirmSheetBackBtn) {
    confirmSheetBackBtn.addEventListener('click', handleConfirmBack);
  }

  if (confirmSheetProceedBtn) {
    confirmSheetProceedBtn.addEventListener('click', handleConfirmProceed);
  }

  if (confirmSheetOverlay) {
    confirmSheetOverlay.addEventListener('click', handleConfirmBack);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', handleClose);
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
