(function () {
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 500_000_000;

  const drawer = document.getElementById('drawer');
  const drawerTitle = document.getElementById('approvalDrawerTitle');
  const drawerCloseBtn = document.getElementById('approvalDrawerClose');
  const saveBtn = document.getElementById('saveChangesBtn');
  const confirmBtn = document.getElementById('confirmApprovalBtn');
  const addRuleBtn = document.getElementById('addApprovalRuleBtn');

  const minInput = document.getElementById('minLimitInput');
  const maxInput = document.getElementById('maxLimitInput');
  const approverInput = document.getElementById('approverCountInput');

  const minError = document.getElementById('minLimitError');
  const maxError = document.getElementById('maxLimitError');
  const approverError = document.getElementById('approverCountError');

  const limitNotice = document.getElementById('approvalLimitNotice');
  const rowsContainer = document.getElementById('approvalRowsContainer');
  const emptyState = document.getElementById('approvalEmptyState');

  const matrixSection = document.getElementById('approvalMatrixSection');
  const matrixList = document.getElementById('approvalMatrixList');
  const formFieldsSection = document.getElementById('approvalFormFields');

  const numberFormatter = new Intl.NumberFormat('id-ID');

  let nextId = 1;

  let isDrawerOpen = drawer?.getAttribute('aria-hidden') === 'false';

  const state = {
    approvals: [],
    mode: 'create',
    editingIndex: null,
    requiredMin: MIN_LIMIT,
  };

  let currentInitial = { min: MIN_LIMIT, max: null, approvers: null };

    state.approvals = [
    {
      id: `matrix-${nextId}`,
      min: MIN_LIMIT,
      max: MAX_LIMIT,
      approvers: 2,
    },
  ];
  nextId += 1;

  let matrixGenerated = false;

  function formatNumber(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return '';
    return numberFormatter.format(value);
  }

  function formatCurrency(value, { withSpace = true } = {}) {
    if (typeof value !== 'number' || Number.isNaN(value)) return '';
    return `Rp${withSpace ? ' ' : ''}${formatNumber(value)}`;
  }

  function parseCurrency(value) {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) return null;
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function hideElement(el) {
    if (!el) return;
    el.classList.add('hidden');
  }

  function showElement(el) {
    if (!el) return;
    el.classList.remove('hidden');
  }

  function hideError(el) {
    if (!el) return;
    el.textContent = '';
    el.classList.add('hidden');
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function resetErrors() {
    hideError(minError);
    hideError(maxError);
    hideError(approverError);
  }

  function setMinValue(value) {
    if (!minInput) return;
    minInput.value = value == null ? '' : formatCurrency(value);
  }

  function setMaxValue(value) {
    if (!maxInput) return;
    maxInput.value = value == null ? '' : formatCurrency(value);
  }

  function setApproverValue(value) {
    if (!approverInput) return;
    approverInput.value = value == null ? '' : String(value);
  }

  function getMinValue() {
    return parseCurrency(minInput?.value ?? '');
  }

  function getMaxValue() {
    return parseCurrency(maxInput?.value ?? '');
  }

  function getApproverValue() {
    if (!approverInput) return null;
    const digits = approverInput.value.replace(/[^0-9]/g, '');
    if (!digits) return null;
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function hasChanges() {
    const minValue = getMinValue();
    const maxValue = getMaxValue();
    const approverValue = getApproverValue();

    const normalizedMin = typeof minValue === 'number' ? minValue : null;
    const normalizedInitialMin = typeof currentInitial.min === 'number' ? currentInitial.min : null;

    const normalizedMax = typeof maxValue === 'number' ? maxValue : null;
    const normalizedInitialMax = typeof currentInitial.max === 'number' ? currentInitial.max : null;

    const normalizedApprover = typeof approverValue === 'number' ? approverValue : null;
    const normalizedInitialApprover = typeof currentInitial.approvers === 'number' ? currentInitial.approvers : null;

    return (
      normalizedMin !== normalizedInitialMin ||
      normalizedMax !== normalizedInitialMax ||
      normalizedApprover !== normalizedInitialApprover
    );
  }

  function computeNextMin() {
    if (!state.approvals.length) return MIN_LIMIT;
    const lastRule = state.approvals[state.approvals.length - 1];
    return lastRule.max + 1;
  }

  function recomputeSequentialRanges() {
    state.approvals.sort((a, b) => a.min - b.min);
    state.approvals.forEach((rule, index) => {
      rule.min = index === 0 ? MIN_LIMIT : state.approvals[index - 1].max + 1;
    });
  }

  function isContiguous() {
    if (!state.approvals.length) return false;
    if (state.approvals[0].min !== MIN_LIMIT) return false;
    for (let i = 1; i < state.approvals.length; i += 1) {
      const expectedMin = state.approvals[i - 1].max + 1;
      if (state.approvals[i].min !== expectedMin) {
        return false;
      }
    }
    return true;
  }

  function isCoverageComplete() {
    if (!state.approvals.length) return false;
    if (!isContiguous()) return false;
    const lastRule = state.approvals[state.approvals.length - 1];
    return lastRule.max === MAX_LIMIT;
  }

  function updateConfirmState() {
    if (!confirmBtn) return;
    const canConfirm = matrixGenerated && isCoverageComplete() && !isDrawerOpen;
    confirmBtn.disabled = !canConfirm;
  }

  function updateAddButtonState() {
    if (!addRuleBtn) return;
    const nextMin = computeNextMin();
    const disabled = isDrawerOpen || nextMin > MAX_LIMIT;
    addRuleBtn.disabled = disabled;
    addRuleBtn.classList.toggle('opacity-50', addRuleBtn.disabled);
    addRuleBtn.classList.toggle('cursor-not-allowed', addRuleBtn.disabled);
  }

  function updateEditButtonsState() {
    const disabled = isDrawerOpen;
    if (rowsContainer) {
      rowsContainer.querySelectorAll('button').forEach((button) => {
        button.disabled = disabled;
      });
    }
    if (matrixList) {
      matrixList.querySelectorAll('button').forEach((button) => {
        button.disabled = disabled;
      });
    }
  }

  function hideLimitNotice() {
    if (!limitNotice) return;
    limitNotice.textContent = '';
    hideElement(limitNotice);
  }

  function showLimitNotice(message) {
    if (!limitNotice) return;
    limitNotice.textContent = message;
    showElement(limitNotice);
  }

  function updateLimitNotice() {
    if (computeNextMin() > MAX_LIMIT && state.approvals.length) {
      showLimitNotice(`Batas maksimal persetujuan sudah tercapai (Rp${formatNumber(MAX_LIMIT)}).`);
    } else {
      hideLimitNotice();
    }
  }

  function renderTable() {
    if (!rowsContainer || !emptyState) return;

    rowsContainer.innerHTML = '';

    if (!state.approvals.length) {
      showElement(emptyState);
      rowsContainer.classList.add('hidden');
      return;
    }

    hideElement(emptyState);
    rowsContainer.classList.remove('hidden');

    state.approvals.forEach((rule, index) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4';

      const range = document.createElement('p');
      range.className = 'text-sm text-slate-700 text-left';
      range.textContent = `${formatCurrency(rule.min, { withSpace: false })} – ${formatCurrency(rule.max, { withSpace: false })}`;

      const approverDetail = document.createElement('p');
      approverDetail.className = 'text-sm font-semibold text-slate-500 text-center';
      approverDetail.textContent = `${rule.approvers} Penyetuju`;

      const action = document.createElement('div');
      action.className = 'flex justify-end';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'inline-flex items-center justify-center rounded-lg border border-cyan-500 bg-white px-4 py-2 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60';
      editBtn.textContent = 'Ubah';
      editBtn.addEventListener('click', () => openForEdit(index));

      action.appendChild(editBtn);

      row.appendChild(range);
      row.appendChild(approverDetail);
      row.appendChild(action);

      rowsContainer.appendChild(row);
    });
  }

  function ensureMatrixPlacement() {
    if (!matrixSection || !formFieldsSection) return;
    if (matrixSection.nextElementSibling === formFieldsSection) {
      return;
    }
    const parent = matrixSection.parentElement;
    if (parent) {
      parent.insertBefore(matrixSection, formFieldsSection);
    }
  }

  function renderMatrixCards() {
    if (!matrixSection || !matrixList) return;

    matrixList.innerHTML = '';

    if (!matrixGenerated || !state.approvals.length) {
      matrixSection.classList.add('hidden');
      return;
    }

    ensureMatrixPlacement();
    matrixSection.classList.remove('hidden');

    state.approvals.forEach((rule, index) => {
      const card = document.createElement('article');
      card.className = 'flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm';

      const content = document.createElement('div');
      content.className = 'space-y-1';

      const title = document.createElement('p');
      title.className = 'text-sm font-bold text-slate-900 mb-4';
      title.textContent = `Jumlah Approval ${rule.approvers}`;

      const subtitle = document.createElement('p');
      subtitle.className = 'text-xs font-semibold tracking-wide text-slate-400';
      subtitle.textContent = 'Nominal Transaksi';

      const body = document.createElement('p');
      body.className = 'text-sm text-slate-600';
      body.textContent = `Min. Rp${formatNumber(rule.min)} » Max. Rp${formatNumber(rule.max)}`;

      content.appendChild(title);
      content.appendChild(subtitle);
      content.appendChild(body);

      const action = document.createElement('div');
      action.className = 'flex flex-shrink-0';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'inline-flex items-center justify-center rounded-lg border border-cyan-500 px-3 py-2 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60';
      editBtn.textContent = 'Ubah';
      editBtn.addEventListener('click', () => openForEdit(index));

      action.appendChild(editBtn);

      card.appendChild(content);
      card.appendChild(action);

      matrixList.appendChild(card);
    });
  }

  function renderAll() {
    recomputeSequentialRanges();
    renderTable();
    renderMatrixCards();
    updateConfirmState();
    updateAddButtonState();
    updateEditButtonsState();
    updateLimitNotice();
  }

  function updateDrawerTitle() {
    if (!drawerTitle) return;
    drawerTitle.textContent = state.mode === 'edit' ? 'Ubah Persetujuan Transfer' : 'Tambah Persetujuan Transfer';
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    isDrawerOpen = true;
    updateConfirmState();
    updateAddButtonState();
    updateEditButtonsState();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    isDrawerOpen = false;
    state.mode = 'create';
    state.editingIndex = null;
    state.requiredMin = computeNextMin();
    currentInitial = { min: state.requiredMin, max: null, approvers: null };
    setMinValue(state.requiredMin);
    setMaxValue(null);
    setApproverValue(null);
    resetErrors();
    updateDrawerTitle();
    updateButtonStates();
    updateConfirmState();
    updateAddButtonState();
    updateEditButtonsState();
  }

  function prepareFormForMode() {
    updateDrawerTitle();
    const requiredMin = state.requiredMin;
    setMinValue(requiredMin);
    if (state.mode === 'edit') {
      const rule = state.approvals[state.editingIndex];
      setMaxValue(rule?.max ?? null);
      setApproverValue(rule?.approvers ?? null);
      currentInitial = {
        min: requiredMin,
        max: rule?.max ?? null,
        approvers: rule?.approvers ?? null,
      };
    } else {
      setMaxValue(null);
      setApproverValue(null);
      currentInitial = { min: requiredMin, max: null, approvers: null };
    }
    resetErrors();
    updateButtonStates();
  }

  function setModeCreate() {
    state.mode = 'create';
    state.editingIndex = null;
    state.requiredMin = computeNextMin();
    prepareFormForMode();
  }

  function setModeEdit(index) {
    state.mode = 'edit';
    state.editingIndex = index;
    const prevRule = index > 0 ? state.approvals[index - 1] : null;
    state.requiredMin = prevRule ? prevRule.max + 1 : MIN_LIMIT;
    prepareFormForMode();
  }

  function openForCreate() {
    hideLimitNotice();
    setModeCreate();
    openDrawer();
    updateButtonStates();
    if (state.requiredMin > MAX_LIMIT) {
      showLimitNotice(`Batas maksimal persetujuan sudah tercapai (Rp${formatNumber(MAX_LIMIT)}).`);
    }
  }

  function openForEdit(index) {
    if (index < 0 || index >= state.approvals.length) return;
    hideLimitNotice();
    setModeEdit(index);
    openDrawer();
  }

  function getMinValidationError() {
    if (state.requiredMin > MAX_LIMIT) {
      return null;
    }

    const value = getMinValue();
    const requiredMin = state.requiredMin;

    if (value === null) {
      return `Batas Minimal harus dimulai dari Rp${formatNumber(requiredMin)}.`;
    }

    if (value !== requiredMin) {
      return `Batas Minimal harus dimulai dari Rp${formatNumber(requiredMin)}.`;
    }

    return null;
  }

  function getMaxValidationError() {
    if (state.requiredMin > MAX_LIMIT) {
      return null;
    }

    const value = getMaxValue();
    const minValue = state.requiredMin;

    if (value === null) {
      return 'Batas Maksimal wajib diisi.';
    }

    if (value < minValue) {
      return 'Batas Minimal tidak boleh lebih besar dari Batas Maksimal.';
    }

    if (value > MAX_LIMIT) {
      return `Batas Maksimal tidak boleh melebihi Rp${formatNumber(MAX_LIMIT)}.`;
    }

    if (state.mode === 'edit') {
      const nextRule = state.approvals[state.editingIndex + 1];
      if (nextRule) {
        const maxAllowed = nextRule.max - 1;
        if (value > maxAllowed) {
          return `Batas Maksimal harus kurang dari Rp${formatNumber(nextRule.max)}.`;
        }
      }
    }

    return null;
  }

  function getApproverValidationError() {
    const value = getApproverValue();

    if (value === null) {
      return 'Jumlah penyetuju wajib diisi.';
    }

    if (value < 1) {
      return 'Jumlah penyetuju harus minimal 1.';
    }

    return null;
  }

  function areInputsValid() {
    const minErrorMessage = getMinValidationError();
    const maxErrorMessage = getMaxValidationError();
    const approverErrorMessage = getApproverValidationError();

    return !minErrorMessage && !maxErrorMessage && !approverErrorMessage;
  }

  function updateButtonStates() {
    if (!saveBtn) return;

    if (state.requiredMin > MAX_LIMIT) {
      saveBtn.disabled = true;
      return;
    }

    const canSave = areInputsValid() && (state.mode === 'create' || hasChanges());
    saveBtn.disabled = !canSave;
  }

  function markDirty() {
    updateButtonStates();
  }

  function handleMinInput(event) {
    if (!minInput) return;
    const digits = event.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      minInput.value = '';
    } else {
      const parsed = parseInt(digits, 10);
      minInput.value = formatCurrency(parsed);
    }
    hideError(minError);
    markDirty();
  }

  function handleMinBlur() {
    const errorMessage = getMinValidationError();
    if (errorMessage) {
      showError(minError, errorMessage);
    }
    updateButtonStates();
  }

  function handleMaxInput(event) {
    if (!maxInput) return;
    const digits = event.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      maxInput.value = '';
    } else {
      let parsed = parseInt(digits, 10);
      if (parsed > MAX_LIMIT) {
        parsed = MAX_LIMIT;
      }
      maxInput.value = formatCurrency(parsed);
    }
    hideError(maxError);
    markDirty();
  }

  function handleMaxFocus() {
    if (!maxInput) return;
    if (!maxInput.value) {
      maxInput.value = formatCurrency(MAX_LIMIT);
    }
  }

  function handleMaxBlur() {
    const errorMessage = getMaxValidationError();
    if (errorMessage) {
      showError(maxError, errorMessage);
    }
    updateButtonStates();
  }

  function handleApproverInput(event) {
    if (!approverInput) return;
    const digits = event.target.value.replace(/[^0-9]/g, '');
    approverInput.value = digits;
    hideError(approverError);
    markDirty();
  }

  function handleApproverBlur() {
    const errorMessage = getApproverValidationError();
    if (errorMessage) {
      showError(approverError, errorMessage);
    }
    updateButtonStates();
  }

  function generateId() {
    const id = `matrix-${nextId}`;
    nextId += 1;
    return id;
  }

  function handleSave() {
    if (state.requiredMin > MAX_LIMIT) {
      updateButtonStates();
      return;
    }

    const minErrorMessage = getMinValidationError();
    const maxErrorMessage = getMaxValidationError();
    const approverErrorMessage = getApproverValidationError();

    if (minErrorMessage) {
      showError(minError, minErrorMessage);
    }
    if (maxErrorMessage) {
      showError(maxError, maxErrorMessage);
    }
    if (approverErrorMessage) {
      showError(approverError, approverErrorMessage);
    }

    if (minErrorMessage || maxErrorMessage || approverErrorMessage) {
      return;
    }

    const maxValue = getMaxValue();
    const approverValue = getApproverValue();
    const hadChanges = hasChanges();

    if (maxValue == null || approverValue == null) {
      return;
    }

    if (state.mode === 'edit' && typeof state.editingIndex === 'number') {
      const target = state.approvals[state.editingIndex];
      if (!target) return;
      target.min = state.requiredMin;
      target.max = maxValue;
      target.approvers = approverValue;
    } else {
      state.approvals.push({
        id: generateId(),
        min: state.requiredMin,
        max: maxValue,
        approvers: approverValue,
      });
    }

    if (hadChanges) {
      matrixGenerated = true;
    }

    renderAll();
    setModeCreate();
    openDrawer();
    resetErrors();
    updateButtonStates();
  }

  function handleConfirm() {
    if (!isCoverageComplete()) {
      window.alert(`Lengkapi aturan persetujuan hingga Rp${formatNumber(MAX_LIMIT)} sebelum mengonfirmasi.`);
      return;
    }
    window.alert('Persetujuan transfer berhasil dikonfirmasi.');
  }

  function handleClose() {
    closeDrawer();
  }

  function init() {
    renderAll();
    setModeCreate();
    updateButtonStates();
  }

  init();

  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', openForCreate);
  }

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
    minInput.addEventListener('blur', handleMinBlur);
  }

  if (maxInput) {
    maxInput.addEventListener('input', handleMaxInput);
    maxInput.addEventListener('focus', handleMaxFocus);
    maxInput.addEventListener('blur', handleMaxBlur);
  }

  if (approverInput) {
    approverInput.addEventListener('input', handleApproverInput);
    approverInput.addEventListener('blur', handleApproverBlur);
  }
})();
