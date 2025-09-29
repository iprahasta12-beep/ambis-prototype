(function () {
  const drawer = document.getElementById('drawer');
  const drawerRangeLabel = document.getElementById('drawerRangeLabel');
  const drawerApproverInput = document.getElementById('drawerApproverInput');
  const drawerError = document.getElementById('drawerError');
  const drawerSaveBtn = document.getElementById('drawerSaveBtn');
  const drawerCancelBtn = document.getElementById('drawerCancelBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  let activeButton = null;

  function openDrawer(range, approvers, trigger) {
    if (!drawer) return;

    activeButton = trigger;

    if (drawerRangeLabel) {
      drawerRangeLabel.textContent = range;
    }

    if (drawerApproverInput) {
      drawerApproverInput.value = approvers;
      drawerApproverInput.focus({ preventScroll: false });
      drawerApproverInput.select();
    }

    hideError();

    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    activeButton = null;
    hideError();
  }

  function hideError() {
    if (!drawerError) return;
    drawerError.classList.add('hidden');
    drawerError.textContent = '';
  }

  function showError(message) {
    if (!drawerError) return;
    drawerError.textContent = message;
    drawerError.classList.remove('hidden');
  }

  function handleSave() {
    if (!activeButton || !drawerApproverInput) {
      closeDrawer();
      return;
    }

    const rawValue = drawerApproverInput.value.trim();
    if (!rawValue) {
      showError('Jumlah penyetuju wajib diisi.');
      return;
    }

    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed < 1) {
      showError('Jumlah penyetuju harus berupa angka minimal 1.');
      return;
    }

    const approverLabel = activeButton.closest('li')?.querySelector('.range-approver');
    if (approverLabel) {
      approverLabel.textContent = `${parsed} Penyetuju`;
    }

    activeButton.dataset.approvers = String(parsed);
    closeDrawer();
  }

  document.querySelectorAll('[data-action="edit-range"]').forEach((button) => {
    button.addEventListener('click', () => {
      const range = button.dataset.range || '';
      const approvers = button.dataset.approvers || '1';
      openDrawer(range, approvers, button);
    });
  });

  if (drawerSaveBtn) {
    drawerSaveBtn.addEventListener('click', handleSave);
  }

  if (drawerCancelBtn) {
    drawerCancelBtn.addEventListener('click', closeDrawer);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }
})();
