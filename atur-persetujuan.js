(function () {
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 500_000_000;
  const DEFAULT_MAX_APPROVERS = 10;

  const drawer = document.getElementById('drawer');
  const drawerCloseBtn = document.getElementById('approvalDrawerClose');
  const saveBtn = document.getElementById('saveChangesBtn');
  const confirmBtn = document.getElementById('confirmApprovalBtn');
  const maxInput = document.getElementById('maxLimitInput');
  const maxError = document.getElementById('maxLimitError');
  const approverInput = document.getElementById('approverCountInput');
  const approverError = document.getElementById('approverCountError');
  const editButtons = Array.from(document.querySelectorAll('.approval-edit-btn'));

  const dialogContainer = document.getElementById('topApprovalDialogContainer');
  const dialogOverlay = document.getElementById('topApprovalDialogOverlay');
  const dialogCancel = document.getElementById('topApprovalDialogCancel');
  const dialogProceed = document.getElementById('topApprovalDialogProceed');

  let pendingButton = null;
  let activeRowButton = null;
  let formDirty = false;
  let formSaved = false;
  let maxTouched = false;
  let approverTouched = false;
  let currentInitialData = { min: MIN_LIMIT, max: null, approvers: null, maxApprovers: DEFAULT_MAX_APPROVERS };

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

  function isMaxValid() {
    const value = getMaxValue();
    return value !== null && value >= MIN_LIMIT && value <= MAX_LIMIT;
  }

  function isApproverValid() {
    const value = getApproverValue();
    const maxAllowed = currentInitialData.maxApprovers || DEFAULT_MAX_APPROVERS;
    return value !== null && value >= 1 && value <= maxAllowed;
  }

  function updateButtonStates() {
    if (saveBtn) {
      const valid = isMaxValid() && isApproverValid();
      saveBtn.disabled = !(valid && formDirty);
    }
    if (confirmBtn) {
      confirmBtn.disabled = !formSaved;
    }
  }

  function clearErrors() {
    hideError(maxError);
    hideError(approverError);
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

  function markDirty() {
    formDirty = hasChanges();
    if (formDirty) {
      formSaved = false;
    }
    updateButtonStates();
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

  function applyInitialData(data) {
    currentInitialData = {
      min: typeof data.min === 'number' ? data.min : MIN_LIMIT,
      max: typeof data.max === 'number' ? data.max : null,
      approvers: typeof data.approvers === 'number' ? data.approvers : null,
      maxApprovers: typeof data.maxApprovers === 'number' ? data.maxApprovers : DEFAULT_MAX_APPROVERS,
    };

    setMaxValue(currentInitialData.max);
    setApproverValue(currentInitialData.approvers);

    formDirty = false;
    formSaved = false;
    maxTouched = false;
    approverTouched = false;
    clearErrors();
    updateButtonStates();
  }

  function openDrawer(button) {
    if (!drawer || !button) return;

    activeRowButton = button;
    const min = parseCurrency(button.getAttribute('data-min')) ?? MIN_LIMIT;
    const max = parseCurrency(button.getAttribute('data-max'));
    const approvers = parseCurrency(button.getAttribute('data-approvers'));
    const maxApprovers = parseCurrency(button.getAttribute('data-max-approvers')) || DEFAULT_MAX_APPROVERS;

    applyInitialData({ min, max, approvers, maxApprovers });

    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      maxInput?.focus();
    });
  }

  function resetDrawerState() {
    applyInitialData({
      min: MIN_LIMIT,
      max: null,
      approvers: null,
      maxApprovers: DEFAULT_MAX_APPROVERS,
    });
    activeRowButton = null;
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

  function isDialogOpen() {
    return dialogContainer && !dialogContainer.classList.contains('hidden');
  }

  function openDialog(button) {
    if (!dialogContainer) {
      openDrawer(button);
      return;
    }
    pendingButton = button;
    dialogContainer.classList.remove('hidden');
  }

  function closeDialog() {
    if (!dialogContainer) return;
    dialogContainer.classList.add('hidden');
    pendingButton = null;
  }

  function handleSave() {
    const maxValid = isMaxValid();
    const approverValid = isApproverValid();

    if (!maxValid) {
      const message = !getMaxValue()
        ? 'Batas maksimal wajib diisi.'
        : `Batas maksimal harus antara Rp1 hingga Rp${MAX_LIMIT.toLocaleString('id-ID')}.`;
      showError(maxError, message);
    }

    if (!approverValid) {
      const maxAllowed = currentInitialData.maxApprovers || DEFAULT_MAX_APPROVERS;
      const message = !getApproverValue()
        ? 'Jumlah penyetuju wajib diisi.'
        : `Jumlah penyetuju harus antara 1 hingga ${maxAllowed}.`;
      showError(approverError, message);
    }

    if (!maxValid || !approverValid) {
      maxTouched = true;
      approverTouched = true;
      return;
    }

    currentInitialData = {
      ...currentInitialData,
      max: getMaxValue(),
      approvers: getApproverValue(),
    };

    formDirty = false;
    formSaved = true;
    updateButtonStates();
  }

  function updateRowValues() {
    if (!activeRowButton) return;
    const row = activeRowButton.closest('tr');
    if (!row) return;
    const rangeCell = row.querySelector('[data-range-cell]');
    const approverCell = row.querySelector('[data-approver-cell]');

    const minValue = currentInitialData.min ?? MIN_LIMIT;
    const maxValue = getMaxValue();
    const approverValue = getApproverValue();

    if (rangeCell && maxValue !== null) {
      rangeCell.textContent = `${formatCurrency(minValue)} – ${formatCurrency(maxValue)}`;
    }

    if (approverCell && approverValue !== null) {
      const suffix = approverValue === 1 ? 'Penyetuju' : 'Penyetuju';
      approverCell.textContent = `${approverValue} ${suffix}`;
    }

    if (maxValue !== null) {
      activeRowButton.setAttribute('data-max', String(maxValue));
    }
    if (approverValue !== null) {
      activeRowButton.setAttribute('data-approvers', String(approverValue));
    }
  }

  function handleConfirmSubmission() {
    if (!formSaved) return;
    updateRowValues();
    closeDrawer({ force: true });
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
    maxTouched = true;
    if (!isMaxValid()) {
      const message = !getMaxValue()
        ? 'Batas maksimal wajib diisi.'
        : `Batas maksimal harus antara Rp1 hingga Rp${MAX_LIMIT.toLocaleString('id-ID')}.`;
      showError(maxError, message);
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
    approverTouched = true;
    if (!isApproverValid()) {
      const maxAllowed = currentInitialData.maxApprovers || DEFAULT_MAX_APPROVERS;
      const message = !getApproverValue()
        ? 'Jumlah penyetuju wajib diisi.'
        : `Jumlah penyetuju harus antara 1 hingga ${maxAllowed}.`;
      showError(approverError, message);
    }
  }

  function handleEditButtonClick(button) {
    const requiresConfirm = button.getAttribute('data-requires-confirm') === 'true';
    if (requiresConfirm) {
      openDialog(button);
    } else {
      openDrawer(button);
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Escape') return;
    if (isDialogOpen()) {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (drawer && drawer.classList.contains('open')) {
      event.preventDefault();
      closeDrawer();
    }
  }

  editButtons.forEach((button) => {
    button.addEventListener('click', () => handleEditButtonClick(button));
  });

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => closeDrawer());
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirmSubmission);
  }

  if (maxInput) {
    maxInput.addEventListener('input', handleMaxInput);
    maxInput.addEventListener('blur', handleMaxBlur);
  }

  if (approverInput) {
    approverInput.addEventListener('input', handleApproverInput);
    approverInput.addEventListener('blur', handleApproverBlur);
  }

  if (dialogCancel) {
    dialogCancel.addEventListener('click', () => closeDialog());
  }

  if (dialogOverlay) {
    dialogOverlay.addEventListener('click', () => closeDialog());
  }

  if (dialogProceed) {
    dialogProceed.addEventListener('click', () => {
      const button = pendingButton;
      closeDialog();
      if (button) {
        openDrawer(button);
      }
    });
  }

  document.addEventListener('keydown', handleKeyDown);
})();
