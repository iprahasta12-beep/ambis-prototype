// Drawer and bottom sheet logic for Transfer page

document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('transferDrawer');
  const inner = document.getElementById('transferDrawerInner');
  const openBtn = document.getElementById('openTransferDrawer');
  const closeBtn = document.getElementById('closeTransferDrawer');
  const cancelBtn = document.getElementById('drawerCancel');

  function openDrawer() {
    drawer.classList.replace('w-0', 'w-[520px]');
  }
  function closeDrawer() {
    drawer.classList.replace('w-[520px]', 'w-0');
  }

  openBtn?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
  closeBtn?.addEventListener('click', closeDrawer);
  cancelBtn?.addEventListener('click', closeDrawer);

  // Bottom sheet
  const fieldSumber = document.getElementById('fieldSumber');
  const fieldTujuan = document.getElementById('fieldTujuan');
  const sumberLabel = document.getElementById('sumberLabel');
  const tujuanLabel = document.getElementById('tujuanLabel');

  const sheet = document.getElementById('accountSheet');
  const sheetPanel = document.getElementById('accountSheetPanel');
  const sheetBackdrop = document.getElementById('accountSheetBackdrop');
  const sheetCancel = document.getElementById('sheetCancel');
  const sheetChoose = document.getElementById('sheetChoose');
  const sheetTitle = document.getElementById('sheetTitle');

  let activeField = null; // 'sumber' | 'tujuan'

  function disableChoose() {
    sheetChoose.disabled = true;
    sheetChoose.classList.add('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
    sheetChoose.classList.remove('bg-cyan-600', 'text-white', 'hover:bg-cyan-700');
  }
  function enableChoose() {
    sheetChoose.disabled = false;
    sheetChoose.classList.remove('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
    sheetChoose.classList.add('bg-cyan-600', 'text-white', 'hover:bg-cyan-700');
  }

  function openSheet(field) {
    activeField = field;
    sheetTitle.textContent = field === 'sumber' ? 'Sumber Rekening' : 'Tujuan Rekening';
    disableChoose();
    sheet.querySelectorAll('input[name="account"]').forEach(r => { r.checked = false; });

    sheet.classList.remove('hidden');
    inner.classList.add('overflow-hidden');
    requestAnimationFrame(() => {
      sheetBackdrop.classList.add('opacity-100');
      sheetPanel.classList.remove('translate-y-full');
    });
  }

  function closeSheet() {
    sheetBackdrop.classList.remove('opacity-100');
    sheetPanel.classList.add('translate-y-full');
    setTimeout(() => {
      sheet.classList.add('hidden');
      inner.classList.remove('overflow-hidden');
    }, 200);
  }

  fieldSumber?.addEventListener('click', () => openSheet('sumber'));
  fieldTujuan?.addEventListener('click', () => openSheet('tujuan'));

  sheet.querySelectorAll('input[name="account"]').forEach(radio => {
    radio.addEventListener('change', enableChoose);
  });

  sheetChoose?.addEventListener('click', () => {
    const picked = sheet.querySelector('input[name="account"]:checked');
    if (!picked) return;
    if (activeField === 'sumber') {
      sumberLabel.textContent = picked.value;
      sumberLabel.classList.remove('text-slate-400');
    } else {
      tujuanLabel.textContent = picked.value;
      tujuanLabel.classList.remove('text-slate-400');
    }
    closeSheet();
  });

  sheetCancel?.addEventListener('click', (e) => { e.preventDefault(); closeSheet(); });
  sheetBackdrop?.addEventListener('click', closeSheet);
});
