(function () {
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 500_000_000;
  const DEFAULT_MAX_APPROVERS = 10;

  const drawer = document.getElementById('drawer');
  const drawerTitle = document.getElementById('approvalDrawerTitle');
  const drawerCloseBtn = document.getElementById('approvalDrawerClose');
  const saveBtn = document.getElementById('saveChangesBtn');
  const confirmBtn = document.getElementById('confirmApprovalBtn');
  const minInput = document.getElementById('minLimitInput');
  const maxInput = document.getElementById('maxLimitInput');
  const maxError = document.getElementById('maxLimitError');
  const approverInput = document.getElementById('approverCountInput');
  const approverError = document.getElementById('approverCountError');
  const addRuleBtn = document.getElementById('addApprovalRuleBtn');
  const cardsContainer = document.getElementById('approvalRowsContainer');
  const emptyState = document.getElementById('approvalEmptyState');
  const limitNotice = document.getElementById('approvalLimitNotice');
  const topDialogContainer = document.getElementById('topApprovalDialogContainer');
  const topDialogOverlay = document.getElementById('topApprovalDialogOverlay');
  const topDialogCancel = document.getElementById('topApprovalDialogCancel');
  const topDialogProceed = document.getElementById('topApprovalDialogProceed');

  let approvals = [
    { id: 'rule-1', min: MIN_LIMIT, max: 200_000_000, approvers: 2 },
    { id: 'rule-2', min: 200_000_000 + 1, max: MAX_LIMIT, approvers: 3 },
  ];
  let nextId = approvals.length + 1;

  let currentInitialData = {
    id: null,
    index: null,
    min: MIN_LIMIT,
    max: null,
    approvers: null,
    maxApprovers: DEFAULT_MAX_APPROVERS,
    isNew: true,
  };

  let formDirty = false;
  let pendingTopEditIndex = null;

  function formatCurrency(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return '';
    return `Rp ${value.toLocaleString('id-ID')}`;
  }

  function parseCurrency(value) {
    if (!value) return null;
    const digits = String(value).replace(/[^0-9]/g, '');
    if (!digits) return null;
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function generateId() {
    const id = `rule-${nextId}`;
    nextId += 1;
    return id;
  }

  function hideError(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.textContent = '';
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function clearErrors() {
    hideError(maxError);
    hideError(approverError);
  }

  function setMinValue(value) {
    if (!minInput) return;
    if (value === null || typeof value === 'undefined') {
      minInput.value = '';
    } else {
      minInput.value = formatCurrency(value);
    }
  }

  function setMaxValue(value) {
    if (!maxInput) return;
    if (value === null || typeof value === 'undefined') {
      maxInput.value = '';
    } else {
      maxInput.value = formatCurrency(value);
      requestAnimationFrame(() => {
        maxInput.setSelectionRange(maxInput.value.length, maxInput.value.length);
      });
    }
  }

  function setApproverValue(value) {
    if (!approverInput) return;
    if (value === null || typeof value === 'undefined') {
      approverInput.value = '';
    } else {
      approverInput.value = String(value);
    }
  }

  function getMaxValue() {
    return parseCurrency(maxInput?.value || '');
  }

  function getApproverValue() {
    if (!approverInput) return null;
    const digits = approverInput.value.replace(/[^0-9]/g, '');
    if (!digits) return null;
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function hasChanges() {
    const currentMax = getMaxValue();
    const currentApprovers = getApproverValue();
    const initialMax = currentInitialData.max;
    const initialApprovers = currentInitialData.approvers;
    const normalizedCurrentMax = currentMax === null ? null : currentMax;
    const normalizedInitialMax = typeof initialMax === 'number' ? initialMax : null;
    const normalizedCurrentApprovers = currentApprovers === null ? null : currentApprovers;
    const normalizedInitialApprovers = typeof initialApprovers === 'number' ? initialApprovers : null;
    return (
      normalizedCurrentMax !== normalizedInitialMax ||
      normalizedCurrentApprovers !== normalizedInitialApprovers
    );
  }

  function getMaxValidationError() {
    const value = getMaxValue();
    const minValue = currentInitialData.min ?? MIN_LIMIT;

    if (value === null) {
      return 'Batas maksimal wajib diisi.';
    }

    if (value < minValue || value > MAX_LIMIT) {
      return `Batas maksimal harus antara ${formatCurrency(minValue)} hingga ${formatCurrency(MAX_LIMIT)}.`;
    }

    if (!currentInitialData.isNew && typeof currentInitialData.index === 'number') {
      const nextRule = approvals[currentInitialData.index + 1];
      if (nextRule && value >= nextRule.max) {
        return `Batas maksimal harus kurang dari ${formatCurrency(nextRule.max)}.`;
      }
    }

    return null;
  }

  function getApproverValidationError() {
    const value = getApproverValue();
    const maxAllowed = currentInitialData.maxApprovers || DEFAULT_MAX_APPROVERS;

    if (value === null) {
      return 'Jumlah penyetuju wajib diisi.';
    }

    if (value < 1 || value > maxAllowed) {
      return `Jumlah penyetuju harus antara 1 hingga ${maxAllowed}.`;
    }

    return null;
  }

  function isMaxValid() {
    return getMaxValidationError() === null;
  }

  function isApproverValid() {
    return getApproverValidationError() === null;
  }

  function markDirty() {
    formDirty = hasChanges();
    updateButtonStates();
  }

  function applyInitialData(data, { fillInputs = true } = {}) {
    currentInitialData = {
      id: typeof data.id === 'string' ? data.id : null,
      index: typeof data.index === 'number' ? data.index : null,
      min: typeof data.min === 'number' ? data.min : MIN_LIMIT,
      max: typeof data.max === 'number' ? data.max : null,
      approvers: typeof data.approvers === 'number' ? data.approvers : null,
      maxApprovers: typeof data.maxApprovers === 'number' ? data.maxApprovers : DEFAULT_MAX_APPROVERS,
      isNew: Boolean(data.isNew),
    };

    if (fillInputs) {
      setMinValue(currentInitialData.min);
      setMaxValue(currentInitialData.max);
      setApproverValue(currentInitialData.approvers);
    } else {
      setMinValue(null);
      setMaxValue(null);
      setApproverValue(null);
    }

    formDirty = false;
    clearErrors();
    updateButtonStates();
  }

  function recomputeSequentialMins() {
    approvals.forEach((rule, index) => {
      if (index === 0) {
        rule.min = MIN_LIMIT;
      } else {
        rule.min = approvals[index - 1].max + 1;
      }
    });
  }

  function computeNextMin() {
    if (!approvals.length) {
      return MIN_LIMIT;
    }
    return approvals[approvals.length - 1].max + 1;
  }

  function isCoverageComplete() {
    if (!approvals.length) return false;
    if (approvals[0].min !== MIN_LIMIT) return false;

    for (let i = 1; i < approvals.length; i += 1) {
      const expectedMin = approvals[i - 1].max + 1;
      if (approvals[i].min !== expectedMin) {
        return false;
      }
    }

    const lastRule = approvals[approvals.length - 1];
    return lastRule.max === MAX_LIMIT;
  }

  function updateConfirmState() {
    if (!confirmBtn) return;
    confirmBtn.disabled = !isCoverageComplete();
  }

  function updateEmptyState() {
    if (!cardsContainer || !emptyState) return;
    if (!approvals.length) {
      emptyState.classList.remove('hidden');
      cardsContainer.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      cardsContainer.classList.remove('hidden');
    }
  }

  function hideLimitNotice() {
    if (!limitNotice) return;
    limitNotice.classList.add('hidden');
    limitNotice.textContent = '';
  }

  function showLimitNotice(message) {
    if (!limitNotice) return;
    limitNotice.textContent = message;
    limitNotice.classList.remove('hidden');
  }

  function renderApprovals() {
    if (!cardsContainer) return;

    recomputeSequentialMins();
    cardsContainer.innerHTML = '';

    approvals.forEach((rule, index) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4';
      row.dataset.id = rule.id;

      const range = document.createElement('p');
      range.className = 'text-sm text-slate-700 text-left';
      const minText = formatCurrency(rule.min).replace('Rp ', 'Rp');
      const maxText = formatCurrency(rule.max).replace('Rp ', 'Rp');
      range.textContent = `${minText} – ${maxText}`;

      const approverDetail = document.createElement('p');
      approverDetail.className = 'text-sm font-semibold text-slate-500 text-center';
      approverDetail.textContent = `${rule.approvers} Penyetuju`;

      const action = document.createElement('div');
      action.className = 'flex justify-end';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'approval-edit-btn inline-flex items-center justify-center rounded-lg border border-cyan-500 bg-white px-4 py-2 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60';
      editBtn.textContent = 'Ubah';
      editBtn.addEventListener('click', () => {
        if (index === 0) {
          openTopApprovalDialog(index);
        } else {
          openDrawerForEdit(index);
        }
      });

      action.appendChild(editBtn);

      row.appendChild(range);
      row.appendChild(approverDetail);
      row.appendChild(action);

      cardsContainer.appendChild(row);
    });

    updateEmptyState();
    updateConfirmState();
  }

  function openDrawerWithData(data, options = {}) {
    if (!drawer) return;

    const { fillInputs = true, autoFocus = true } = options;

    applyInitialData(data, { fillInputs });

    if (drawerTitle) {
      drawerTitle.textContent = data.isNew ? 'Tambah Persetujuan Transfer' : 'Ubah Persetujuan Transfer';
    }

    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      if (autoFocus) {
        maxInput?.focus();
      }
    });
  }

  function openDrawerForEdit(index, options = {}) {
    if (index < 0 || index >= approvals.length) return;
    const rule = approvals[index];
    hideLimitNotice();
    openDrawerWithData({
      id: rule.id,
      index,
      min: rule.min,
      max: rule.max,
      approvers: rule.approvers,
      maxApprovers: DEFAULT_MAX_APPROVERS,
      isNew: false,
    }, options);
  }

  function openDrawerForCreate() {
    hideLimitNotice();
    recomputeSequentialMins();
    const nextMin = computeNextMin();

    if (nextMin > MAX_LIMIT) {
      showLimitNotice('Batas maksimal persetujuan sudah tercapai (Rp500.000.000).');
      return;
    }

    const lastRule = approvals[approvals.length - 1];
    if (lastRule && lastRule.max >= MAX_LIMIT) {
      showLimitNotice('Batas maksimal persetujuan sudah tercapai (Rp500.000.000).');
      return;
    }

    openDrawerWithData({
      id: null,
      index: approvals.length,
      min: nextMin,
      max: null,
      approvers: null,
      maxApprovers: DEFAULT_MAX_APPROVERS,
      isNew: true,
    });
  }

  function resetDrawerState() {
    applyInitialData({
      id: null,
      index: null,
      min: MIN_LIMIT,
      max: null,
      approvers: null,
      maxApprovers: DEFAULT_MAX_APPROVERS,
      isNew: true,
    });
  }

  function closeDrawer({ force = false } = {}) {
    if (!drawer) return;
    if (!force && formDirty && !window.confirm('Perubahan belum disimpan. Anda yakin ingin menutup tanpa menyimpan?')) {
      return;
    }
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    resetDrawerState();
  }

  function openTopApprovalDialog(index) {
    if (!topDialogContainer) {
      openDrawerForEdit(index, { fillInputs: false, autoFocus: false });
      return;
    }
    pendingTopEditIndex = index;
    topDialogContainer.classList.remove('hidden');
    topDialogContainer.setAttribute('aria-hidden', 'false');
  }

  function closeTopApprovalDialog({ clearPending = true } = {}) {
    if (!topDialogContainer) return;
    topDialogContainer.classList.add('hidden');
    topDialogContainer.setAttribute('aria-hidden', 'true');
    if (clearPending) {
      pendingTopEditIndex = null;
    }
  }

  function proceedTopApprovalChange() {
    const index = pendingTopEditIndex;
    closeTopApprovalDialog({ clearPending: false });
    pendingTopEditIndex = null;
    if (typeof index === 'number') {
      openDrawerForEdit(index, { fillInputs: false, autoFocus: false });
    }
  }

  function updateButtonStates() {
    if (saveBtn) {
      const maxValid = isMaxValid();
      const approverValid = isApproverValid();
      const dirty = hasChanges();
      saveBtn.disabled = !(maxValid && approverValid && dirty);
    }
  }

  function handleSave() {
    const maxErrorMessage = getMaxValidationError();
    const approverErrorMessage = getApproverValidationError();

    if (maxErrorMessage) {
      showError(maxError, maxErrorMessage);
    }

    if (approverErrorMessage) {
      showError(approverError, approverErrorMessage);
    }

    if (maxErrorMessage || approverErrorMessage) {
      return;
    }

    const maxValue = getMaxValue();
    const approverValue = getApproverValue();

    if (maxValue === null || approverValue === null) {
      return;
    }

    if (currentInitialData.isNew) {
      approvals.push({
        id: generateId(),
        min: currentInitialData.min,
        max: maxValue,
        approvers: approverValue,
      });
    } else if (typeof currentInitialData.index === 'number' && approvals[currentInitialData.index]) {
      approvals[currentInitialData.index] = {
        ...approvals[currentInitialData.index],
        max: maxValue,
        approvers: approverValue,
      };
    }

    renderApprovals();
    formDirty = false;
    closeDrawer({ force: true });
  }

  function handleConfirm() {
    if (!isCoverageComplete()) {
      window.alert('Lengkapi aturan persetujuan hingga Rp500.000.000 sebelum mengkonfirmasi.');
      return;
    }
    window.alert('Persetujuan transfer berhasil dikonfirmasi.');
  }

  function handleMaxInput(event) {
    if (!maxInput) return;
    const value = event.target.value;
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) {
      maxInput.value = '';
    } else {
      const parsed = parseInt(digits, 10);
      maxInput.value = formatCurrency(parsed);
      requestAnimationFrame(() => {
        maxInput.setSelectionRange(maxInput.value.length, maxInput.value.length);
      });
    }
    hideError(maxError);
    markDirty();
  }

  function handleMaxBlur() {
    const errorMessage = getMaxValidationError();
    if (errorMessage) {
      showError(maxError, errorMessage);
    }
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
  }

  function handleKeyDown(event) {
    if (event.key !== 'Escape') return;
    if (topDialogContainer && !topDialogContainer.classList.contains('hidden')) {
      event.preventDefault();
      closeTopApprovalDialog();
      return;
    }
    if (drawer && drawer.classList.contains('open')) {
      event.preventDefault();
      closeDrawer();
    }
  }

  renderApprovals();

  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', openDrawerForCreate);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => closeDrawer());
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirm);
  }

  if (maxInput) {
    maxInput.addEventListener('input', handleMaxInput);
    maxInput.addEventListener('blur', handleMaxBlur);
  }

  if (approverInput) {
    approverInput.addEventListener('input', handleApproverInput);
    approverInput.addEventListener('blur', handleApproverBlur);
  }

  if (topDialogCancel) {
    topDialogCancel.addEventListener('click', () => closeTopApprovalDialog());
  }

  if (topDialogOverlay) {
    topDialogOverlay.addEventListener('click', () => closeTopApprovalDialog());
  }

  if (topDialogProceed) {
    topDialogProceed.addEventListener('click', proceedTopApprovalChange);
  }

  document.addEventListener('keydown', handleKeyDown);
})();
