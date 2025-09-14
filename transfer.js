// transfer.js - drawer logic for transfer page

document.addEventListener('DOMContentLoaded', () => {
  const openBtn  = document.getElementById('openTransferDrawer');
  const drawer   = document.getElementById('drawer');
  const closeBtn = document.getElementById('drawerCloseBtn');

  // buttons & inputs in form
  const sourceBtn = document.getElementById('sourceAccountBtn');
  const destBtn   = document.getElementById('destinationAccountBtn');
  const categoryBtn = document.getElementById('categoryBtn');
  const categoryList = document.getElementById('categoryList');
  const categoryDropdown = document.getElementById('categoryDropdown');
  const categoryText = document.getElementById('categoryText');
  const amountInput = document.getElementById('amountInput');
  const confirmBtn = document.getElementById('confirmBtn');
  const noteInput = document.getElementById('noteInput');
  const noteCounter = document.getElementById('noteCounter');
  const methodBtn = document.getElementById('methodBtn');
  const methodText = document.getElementById('methodText');
  const methodSection = document.getElementById('methodSection');
  const summarySection = document.getElementById('summarySection');
  const summaryNominal = document.getElementById('summaryNominal');
  const summaryFee = document.getElementById('summaryFee');
  const summaryTotal = document.getElementById('summaryTotal');

  // generic bottom sheet
  const sheetOverlay = document.getElementById('sheetOverlay');
  const sheet       = document.getElementById('bottomSheet');
  const sheetTitle  = document.getElementById('sheetTitle');
  const sheetList   = document.getElementById('sheetList');
  const sheetCancel = document.getElementById('sheetCancel');
  const sheetChoose = document.getElementById('sheetChoose');

  // destination sheet elements
  const destSheet   = document.getElementById('destSheet');
  const bankBtn     = document.getElementById('bankBtn');
  const bankList    = document.getElementById('bankList');
  const bankDropdown = document.getElementById('bankDropdown');
  const bankText    = document.getElementById('bankText');
  const destNumber  = document.getElementById('destNumber');
  const checkAccount = document.getElementById('checkAccount');
  const accountInfo = document.getElementById('accountInfo');
  const ownerField  = document.getElementById('ownerField');
  const accountOwnerField = document.getElementById('accountOwnerField');
  const saveContainer = document.getElementById('saveContainer');
  const saveCheckbox  = document.getElementById('saveCheckbox');
  const aliasContainer = document.getElementById('aliasContainer');
  const aliasInput = document.getElementById('aliasInput');
  const aliasCounter = document.getElementById('aliasCounter');
  const destBack    = document.getElementById('destBack');
  const destProceed = document.getElementById('destProceed');

  // confirmation sheet
  const confirmSheet = document.getElementById('confirmSheet');
  const confirmBack = document.getElementById('confirmBack');
  const confirmProceed = document.getElementById('confirmProceed');
  const confirmClose = document.getElementById('confirmClose');
  const sheetSource = document.getElementById('sheetSource');
  const sheetDestination = document.getElementById('sheetDestination');
  const sheetNominal = document.getElementById('sheetNominal');
  const sheetFee = document.getElementById('sheetFee');
  const sheetTotal = document.getElementById('sheetTotal');
  const sheetCategory = document.getElementById('sheetCategory');
  const sheetNote = document.getElementById('sheetNote');
  const sheetMethod = document.getElementById('sheetMethod');
  const sheetRef = document.getElementById('sheetRef');
  const sheetDate = document.getElementById('sheetDate');

  // move drawer elements
  const openMoveBtn = document.getElementById('openMoveDrawer');
  const moveDrawer = document.getElementById('moveDrawer');
  const moveCloseBtn = document.getElementById('moveDrawerCloseBtn');
  const moveSourceBtn = document.getElementById('moveSourceBtn');
  const moveDestBtn = document.getElementById('moveDestBtn');
  const moveAmountInput = document.getElementById('moveAmountInput');
  const moveCategoryBtn = document.getElementById('moveCategoryBtn');
  const moveCategoryList = document.getElementById('moveCategoryList');
  const moveCategoryDropdown = document.getElementById('moveCategoryDropdown');
  const moveCategoryText = document.getElementById('moveCategoryText');
  const moveNoteInput = document.getElementById('moveNoteInput');
  const moveNoteCounter = document.getElementById('moveNoteCounter');
  const moveConfirmBtn = document.getElementById('moveConfirmBtn');
  const moveDestError = document.getElementById('moveDestError');
  const moveAmountError = document.getElementById('moveAmountError');

  // data
  const accounts = [
    { initial:'O', color:'bg-cyan-100 text-cyan-600', name:'Utama', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp100.000.000,00' },
    { initial:'D', color:'bg-orange-100 text-orange-600', name:'Operasional', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp50.000.000,00' },
    { initial:'R', color:'bg-pink-100 text-pink-600', name:'Distributor', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp25.000.000,00' }
  ];


  function isBusinessDay(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday-Friday
  }

  function isWithinHours(date, start, end) {
    const hour = date.getHours();
    return hour >= start && hour < end;
  }

  const transferMethodsData = [
    { name:'BI Fast', fee:2500, min:10000, max:250000000, desc:'Dana langsung sampai ke penerima', check: () => true },
    { name:'RTOL', fee:6500, min:10000, max:1000000000, desc:'Dana langsung sampai ke penerima', check: () => true },
    { name:'SKN/LLG', fee:2900, min:100000, max:1000000000, desc:'Dana sampai 1-3 hari kerja', check: now => isBusinessDay(now) && isWithinHours(now,8,15) },
    { name:'RTGS', fee:25000, min:100000000, max:1000000000, desc:'Dana sampai dalam 1 jam', check: now => isBusinessDay(now) && isWithinHours(now,8,16) }
  ];

  // state
  let currentData = [];
  let selectedIndex = null;
  let selectedBank = '';
  let accountNumber = '';
  let accountOwner = '';
  let saveBeneficiary = false;
  let sourceSelected = false;
  let destSelected = false;
  let amountValue = 0;
  let amountValid = false;
  let categorySelected = false;
  let selectedCategory = '';
  let methodSelected = false;
  let selectedMethod = '';
  let selectedFee = 0;
  let availableMethods = [];
  let currentSheetType = 'source';

  // move drawer state
  let moveSourceSelected = false;
  let moveDestination = '';
  let moveDestValid = false;
  let moveAmountValue = 0;
  let moveAmountValid = false;
  let moveCategorySelected = false;
  let moveSelectedCategory = '';

  function renderList(data) {
    sheetList.innerHTML = data.map((acc, idx) => `
      <li>
        <button type="button" data-index="${idx}" class="sheet-item w-full flex items-center gap-3 px-4 py-3 text-left">
          <div class="w-10 h-10 rounded-full ${acc.color} flex items-center justify-center font-semibold">${acc.initial}</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium">${acc.name}</p>
            <p class="text-slate-500">${acc.company}</p>
            <p class="text-slate-500">${acc.bank} - ${acc.number}</p>
          </div>
          <div class="text-sm font-medium whitespace-nowrap mr-2">${acc.balance}</div>
          <span class="ml-2 w-5 h-5 rounded-full border border-slate-300 grid place-items-center">
            <span class="radio-dot w-2 h-2 rounded-full bg-cyan-500 hidden"></span>
          </span>
        </button>
      </li>`).join('');
  }

  function renderMethodList(data) {
    sheetList.innerHTML = data.map((m, idx) => `
      <li>
        <button type="button" data-index="${idx}" class="sheet-item w-full flex items-center gap-3 px-4 py-3 text-left">
          <div class="flex-1 min-w-0">
            <p class="font-medium mb-2 font-bold">${m.name}</p>
            <p class="mb-2">Rp${formatter.format(m.fee)}</p>
            <p class="text-sm text-slate-500">${m.desc}</p>
            <p class="text-sm text-slate-500">Nominal transfer: Rp${formatter.format(m.min)} - Rp${formatter.format(m.max)}</p>
          </div>
          <span class="ml-2 w-5 h-5 rounded-full border border-slate-300 grid place-items-center">
            <span class="radio-dot w-2 h-2 rounded-full bg-cyan-500 hidden"></span>
          </span>
        </button>
      </li>`).join('');
  }

  function openSheet() {
    currentSheetType = 'source';
    selectedIndex = null;
    currentData = accounts;
    sheetTitle.textContent = 'Sumber Rekening';
    sheetChoose.textContent = 'Pilih Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function openMoveSourceSheet() {
    currentSheetType = 'moveSource';
    selectedIndex = null;
    currentData = accounts;
    sheetTitle.textContent = 'Sumber Rekening';
    sheetChoose.textContent = 'Pilih Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function openMoveDestSheet() {
    currentSheetType = 'moveDest';
    selectedIndex = null;
    currentData = accounts;
    sheetTitle.textContent = 'Rekening Tujuan';
    sheetChoose.textContent = 'Pilih Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function openMethodSheet() {
    currentSheetType = 'method';
    selectedIndex = null;
    currentData = availableMethods;
    sheetTitle.textContent = 'Metode Transfer';
    sheetChoose.textContent = 'Pilih Metode';
    renderMethodList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function closeSheet() {
    sheetOverlay.classList.remove('opacity-100');
    sheet.classList.add('translate-y-full');
    setTimeout(() => {
      sheetOverlay.classList.add('hidden');
    }, 200);
  }

  function resetDestForm() {
    bankText.textContent = 'Pilih bank';
    bankText.classList.add('text-slate-500');
    bankList.classList.add('hidden');
    destNumber.value = '';
    accountOwnerField.value = '';
    accountInfo.classList.add('hidden');
    ownerField.classList.add('hidden');
    saveContainer.classList.add('hidden');
    aliasContainer.classList.add('hidden');
    aliasInput.value = '';
    aliasCounter.textContent = '0/15';
    destProceed.disabled = true;
    destProceed.classList.add('opacity-50','cursor-not-allowed');
    saveCheckbox.checked = false;
    selectedBank = '';
    accountNumber = '';
    accountOwner = '';
    saveBeneficiary = false;
  }

  function openDestSheet() {
    resetDestForm();
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      destSheet.classList.remove('translate-y-full');
    });
  }

  function closeDestSheet() {
    destSheet.classList.add('translate-y-full');
    sheetOverlay.classList.remove('opacity-100');
    setTimeout(() => {
      sheetOverlay.classList.add('hidden');
    }, 200);
  }

  function closeConfirmSheet() {
    confirmSheet.classList.add('translate-y-full');
    sheetOverlay.classList.remove('opacity-100');
    setTimeout(() => {
      sheetOverlay.classList.add('hidden');
    }, 200);
  }

  sheetList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-index]');
    if (!btn) return;
    selectedIndex = btn.dataset.index;
    sheetList.querySelectorAll('button[data-index]').forEach(b => {
      b.classList.remove('ring-2');
      b.querySelector('.radio-dot').classList.add('hidden');
    });
    btn.classList.add('ring-2');
    btn.querySelector('.radio-dot').classList.remove('hidden');
    sheetChoose.disabled = false;
    sheetChoose.classList.remove('opacity-50','cursor-not-allowed');
  });

  sheetCancel?.addEventListener('click', closeSheet);
  sheetOverlay?.addEventListener('click', () => {
    closeSheet();
    closeDestSheet();
    closeConfirmSheet();
  });

  sheetChoose?.addEventListener('click', () => {
    if (selectedIndex === null) return;
    if (currentSheetType === 'source') {
      const acc = currentData[selectedIndex];
      sourceBtn.textContent = `${acc.name} - ${acc.number}`;
      sourceBtn.classList.remove('text-slate-500');
      sourceSelected = true;
      updateMethodVisibility();
    } else if (currentSheetType === 'moveSource') {
      const acc = currentData[selectedIndex];
      moveSourceBtn.textContent = `${acc.name} - ${acc.number}`;
      moveSourceBtn.classList.remove('text-slate-500');
      moveSourceSelected = true;
      moveDestination = '';
      moveDestBtn.textContent = 'Pilih rekening tujuan';
      moveDestBtn.classList.add('text-slate-500');
      moveDestValid = false;
      moveDestError.classList.add('hidden');
      updateMoveConfirmState();
    } else if (currentSheetType === 'moveDest') {
      const acc = currentData[selectedIndex];
      moveDestination = `${acc.name} - ${acc.number}`;
      moveDestBtn.textContent = moveDestination;
      moveDestBtn.classList.remove('text-slate-500');
      const sourceName = moveSourceBtn.textContent.split(' - ')[0];
      moveDestValid = acc.name !== sourceName;
      moveDestError.classList.toggle('hidden', moveDestValid);
      updateMoveConfirmState();
    } else if (currentSheetType === 'method') {
      const m = currentData[selectedIndex];
      methodText.textContent = m.name;
      methodText.classList.remove('text-slate-500');
      methodSelected = true;
      selectedMethod = m.name;
      selectedFee = m.fee;
      updateConfirmState();
      updateSummary();
    }
    closeSheet();
  });

  sourceBtn?.addEventListener('click', openSheet);
  destBtn?.addEventListener('click', openDestSheet);
  methodBtn?.addEventListener('click', () => {
    if (methodBtn.disabled) return;
    openMethodSheet();
  });
  moveSourceBtn?.addEventListener('click', openMoveSourceSheet);
  moveDestBtn?.addEventListener('click', openMoveDestSheet);

  categoryBtn?.addEventListener('click', () => {
    categoryList.classList.toggle('hidden');
  });
  moveCategoryBtn?.addEventListener('click', () => {
    moveCategoryList.classList.toggle('hidden');
  });

  categoryList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    categoryList.querySelectorAll('button[data-value]').forEach(b => {
      b.classList.remove('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    });
    btn.classList.add('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    selectedCategory = btn.dataset.value;
    categoryText.textContent = selectedCategory;
    categoryText.classList.remove('text-slate-500');
    categorySelected = true;
  categoryList.classList.add('hidden');
    updateConfirmState();
  });

  moveCategoryList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    moveCategoryList.querySelectorAll('button[data-value]').forEach(b => {
      b.classList.remove('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    });
    btn.classList.add('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    moveSelectedCategory = btn.dataset.value;
    moveCategoryText.textContent = moveSelectedCategory;
    moveCategoryText.classList.remove('text-slate-500');
    moveCategorySelected = true;
    moveCategoryList.classList.add('hidden');
    updateMoveConfirmState();
  });

  bankBtn?.addEventListener('click', () => {
    bankList.classList.toggle('hidden');
  });

  bankList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    bankList.querySelectorAll('button[data-value]').forEach(b => {
      b.classList.remove('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    });
    btn.classList.add('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    selectedBank = btn.dataset.value;
    bankText.textContent = selectedBank;
    bankText.classList.remove('text-slate-500');
    bankList.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (categoryDropdown && !categoryDropdown.contains(e.target)) {
      categoryList.classList.add('hidden');
    }
    if (bankDropdown && !bankDropdown.contains(e.target)) {
      bankList.classList.add('hidden');
    }
    if (moveCategoryDropdown && !moveCategoryDropdown.contains(e.target)) {
      moveCategoryList.classList.add('hidden');
    }
  });

  destNumber?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g,'');
  });

  checkAccount?.addEventListener('click', () => {
    accountNumber = destNumber.value;
    if (!selectedBank || !accountNumber) return;
    accountOwner = 'PT XYZ Indonesia';
    accountOwnerField.value = accountOwner;
    accountInfo.classList.remove('hidden');
    ownerField.classList.remove('hidden');
    saveContainer.classList.remove('hidden');
    destProceed.disabled = false;
    destProceed.classList.remove('opacity-50','cursor-not-allowed');
  });

  saveCheckbox?.addEventListener('change', (e) => {
    saveBeneficiary = e.target.checked;
    aliasContainer.classList.toggle('hidden', !saveBeneficiary);
  });

  aliasInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 15) {
      e.target.value = e.target.value.slice(0,15);
    }
    aliasCounter.textContent = `${e.target.value.length}/15`;
  });

  destBack?.addEventListener('click', closeDestSheet);
  destProceed?.addEventListener('click', () => {
    destBtn.textContent = `${selectedBank} - ${accountNumber} - ${accountOwner}`;
    destBtn.classList.remove('text-slate-500');
    destSelected = true;
    closeDestSheet();
    updateMethodVisibility();
  });

  function openDrawer() {
    closeMoveDrawerPanel();
    drawer.classList.add('open');
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    closeSheet();
    closeDestSheet();
    closeConfirmSheet();
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
  }

  function openMoveDrawerPanel() {
    closeDrawer();
    moveDrawer.classList.add('open');
    moveSourceBtn.textContent = 'Pilih sumber rekening';
    moveSourceBtn.classList.add('text-slate-500');
    moveDestBtn.textContent = 'Pilih rekening tujuan';
    moveDestBtn.classList.add('text-slate-500');
    moveDestError.classList.add('hidden');
    moveAmountInput.value = '';
    moveAmountError.classList.add('hidden');
    moveCategoryText.textContent = 'Pilih kategori';
    moveCategoryText.classList.add('text-slate-500');
    moveCategorySelected = false;
    moveSelectedCategory = '';
    moveNoteInput.value = '';
    moveNoteCounter.textContent = '0/50';
    moveSourceSelected = false;
    moveDestination = '';
    moveDestValid = false;
    moveAmountValue = 0;
    moveAmountValid = false;
    updateMoveConfirmState();
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
  }

  function closeMoveDrawerPanel() {
    moveDrawer.classList.remove('open');
    closeSheet();
    closeDestSheet();
    closeConfirmSheet();
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
  }

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
  openMoveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openMoveDrawerPanel();
  });
  moveCloseBtn?.addEventListener('click', closeMoveDrawerPanel);

  // helpers
  const formatter = new Intl.NumberFormat('id-ID');
  const dailyLimit = 200000000;

  function updateConfirmState() {
    if (sourceSelected && destSelected && amountValid && categorySelected && methodSelected) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('opacity-50','cursor-not-allowed');
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('opacity-50','cursor-not-allowed');
    }
  }

  function updateMoveConfirmState() {
    if (moveSourceSelected && moveDestValid && moveAmountValid && moveCategorySelected) {
      moveConfirmBtn.disabled = false;
      moveConfirmBtn.classList.remove('opacity-50','cursor-not-allowed');
    } else {
      moveConfirmBtn.disabled = true;
      moveConfirmBtn.classList.add('opacity-50','cursor-not-allowed');
    }
  }

  function updateSummary() {
    if (methodSelected && amountValid) {
      summaryNominal.textContent = 'Rp' + formatter.format(amountValue);
      summaryFee.textContent = 'Rp' + formatter.format(selectedFee);
      summaryTotal.textContent = 'Rp' + formatter.format(amountValue + selectedFee);
      summarySection.classList.remove('hidden');
    } else {
      summarySection.classList.add('hidden');
    }
  }

  function updateMethodOptions() {
    const now = new Date();
    availableMethods = (amountValid && sourceSelected && destSelected)
      ? transferMethodsData.filter(m => amountValue >= m.min && amountValue <= m.max && m.check(now))
      : [];
    methodBtn.disabled = availableMethods.length === 0;
    methodBtn.classList.toggle('opacity-50', methodBtn.disabled);
    methodBtn.classList.toggle('cursor-not-allowed', methodBtn.disabled);
    methodSelected = false;
    selectedMethod = '';
    selectedFee = 0;
    methodText.textContent = 'Pilih metode transfer';
    methodText.classList.add('text-slate-500');
    updateConfirmState();
    updateSummary();
  }

  function updateMethodVisibility() {
    if (sourceSelected && destSelected) {
      methodSection.classList.remove('hidden');
      updateMethodOptions();
    } else {
      methodSection.classList.add('hidden');
      methodBtn.disabled = true;
      methodBtn.classList.add('opacity-50','cursor-not-allowed');
      methodText.textContent = 'Pilih metode transfer';
      methodText.classList.add('text-slate-500');
      methodSelected = false;
      selectedMethod = '';
      selectedFee = 0;
      updateConfirmState();
      updateSummary();
    }
  }

  updateMethodVisibility();
  updateMoveConfirmState();

  amountInput?.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g,'');
    e.target.value = raw ? formatter.format(raw) : '';
    amountValue = parseInt(raw) || 0;
    amountValid = amountValue > 0 && amountValue <= dailyLimit;
    updateMethodOptions();
  });

  noteInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 50) {
      e.target.value = e.target.value.slice(0,50);
    }
    noteCounter.textContent = `${e.target.value.length}/50`;
  });

  moveAmountInput?.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g,'');
    e.target.value = raw ? formatter.format(raw) : '';
    moveAmountValue = parseInt(raw) || 0;
    moveAmountValid = moveAmountValue > 0;
    moveAmountError.classList.toggle('hidden', moveAmountValid);
    updateMoveConfirmState();
  });

  moveNoteInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 50) {
      e.target.value = e.target.value.slice(0,50);
    }
    moveNoteCounter.textContent = `${e.target.value.length}/50`;
  });


  confirmBtn?.addEventListener('click', () => {
    const ref = Math.floor(100000000 + Math.random()*900000000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    sheetSource.textContent = sourceBtn.textContent;
    sheetDestination.textContent = destBtn.textContent;
    sheetNominal.textContent = 'Rp' + formatter.format(amountValue);
    sheetFee.textContent = 'Rp' + formatter.format(selectedFee);
    sheetTotal.textContent = 'Rp' + formatter.format(amountValue + selectedFee);
    sheetCategory.textContent = selectedCategory;
    sheetNote.textContent = noteInput.value || '-';
    sheetRef.textContent = ref;
    sheetDate.textContent = `${dateStr} ${timeStr}`;
    sheetMethod.textContent = selectedMethod;
    confirmProceed.disabled = false;
    confirmProceed.classList.remove('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      confirmSheet.classList.remove('translate-y-full');
    });
  });

  moveConfirmBtn?.addEventListener('click', () => {
    const ref = Math.floor(100000000 + Math.random()*900000000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    sheetSource.textContent = moveSourceBtn.textContent;
    sheetDestination.textContent = moveDestBtn.textContent;
    sheetNominal.textContent = 'Rp' + formatter.format(moveAmountValue);
    sheetFee.textContent = 'Rp0';
    sheetTotal.textContent = 'Rp' + formatter.format(moveAmountValue);
    sheetCategory.textContent = moveSelectedCategory;
    sheetNote.textContent = moveNoteInput.value || '-';
    sheetMethod.textContent = 'Pindah Buku';
    sheetRef.textContent = ref;
    sheetDate.textContent = `${dateStr} ${timeStr}`;
    confirmProceed.disabled = false;
    confirmProceed.classList.remove('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      confirmSheet.classList.remove('translate-y-full');
    });
  });

  confirmBack?.addEventListener('click', closeConfirmSheet);
  confirmClose?.addEventListener('click', closeConfirmSheet);
  confirmProceed?.addEventListener('click', () => {
    alert('Transfer diproses (dummy).');
    closeConfirmSheet();
  });
});

