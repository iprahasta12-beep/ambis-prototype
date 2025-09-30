(function () {
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 200_000_000;

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

  const numberFormatter = new Intl.NumberFormat('id-ID');

  const state = {
    tableRows: [
      { id: 'table-1', min: 1, max: MAX_LIMIT, approvers: 2 },
    ],
    matrixEntries: [],
    drawerContext: null,
    editingMatrixIndex: null,
    initialValues: { min: null, max: null, approvers: null },
    isDrawerOpen: false,
    nextMatrixId: 1,
  };

  function formatCurrency(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '';
    }
    return `Rp ${numberFormatter.format(value)}`;
  }

  function parseCurrency(value) {
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

  function setDrawerContext(context, { min, max, approvers, editingIndex = null }) {
    state.drawerContext = context;
    state.editingMatrixIndex = editingIndex;

    let derivedMin = min;
    if (
      context === 'table' &&
      editingIndex == null &&
      state.matrixEntries.length > 0
    ) {
      const lastEntry = state.matrixEntries[state.matrixEntries.length - 1];
      if (lastEntry && typeof lastEntry.max === 'number') {
        derivedMin = lastEntry.max;
      }
    }

    state.initialValues = { min: derivedMin, max, approvers };

    if (drawerTitle) {
      drawerTitle.textContent = context === 'matrix' ? 'Ubah Approval Matrix' : 'Ubah Persetujuan Transfer';
    }

    setInputValue(minInput, derivedMin);
    setInputValue(maxInput, max);
    setInputValue(approverInput, approvers);

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

    if (min < MIN_LIMIT || max > MAX_LIMIT) {
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
    } else if (max > MAX_LIMIT) {
      showError(maxError, `Batas Maksimal tidak boleh melebihi Rp ${numberFormatter.format(MAX_LIMIT)}.`);
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

      return min <= MAX_LIMIT && max === MAX_LIMIT;
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

    state.initialValues = { ...values };
    updateSaveButtonState();
    renderMatrixList();
    const nextContext = state.drawerContext === 'matrix' ? 'matrix' : 'table';
    const nextEditingIndex = nextContext === 'matrix' ? state.editingMatrixIndex : null;
    setDrawerContext(nextContext, { ...values, editingIndex: nextEditingIndex });
  }

  function handleConfirm() {
    if (!hasSingleMatrixCoveringMax(state.matrixEntries)) {
      return;
    }

    // Placeholder for future confirmation bottom sheet integration.
    window.dispatchEvent(new CustomEvent('approval:confirm-transfer', {
      detail: { entries: [...state.matrixEntries] },
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
    maxInput.value = digits ? formatCurrency(parseInt(digits, 10)) : '';
    if (maxError) {
      maxError.textContent = '';
      maxError.classList.add('hidden');
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
