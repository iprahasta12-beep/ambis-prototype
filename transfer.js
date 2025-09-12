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
  const methodSelect = document.getElementById('methodSelect');
  const methodSection = document.getElementById('methodSection');

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

  // data
  const accounts = [
    { initial:'O', color:'bg-cyan-100 text-cyan-600', name:'Operasional', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'D', color:'bg-orange-100 text-orange-600', name:'Distributor', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'P', color:'bg-teal-100 text-teal-600', name:'Partnership', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'A', color:'bg-purple-100 text-purple-600', name:'Admin', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'B', color:'bg-red-100 text-red-600', name:'Bill', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' }
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
    { name:'BI Fast', fee:2500, min:0, max:250000000, check: () => true },
    { name:'RTOL', fee:6500, min:0, max:25000000, check: () => true },
    { name:'SKN/LLG', fee:2900, min:0, max:500000000, check: now => isBusinessDay(now) && isWithinHours(now,8,15) },
    { name:'RTGS', fee:25000, min:100000000, max:Infinity, check: now => isBusinessDay(now) && isWithinHours(now,8,16) }
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
  let currentSheetType = 'source';

  function renderList(data) {
    sheetList.innerHTML = data.map((acc, idx) => `
      <li>
        <button type="button" data-index="${idx}" class="sheet-item w-full flex items-center gap-3 px-4 py-3 text-left">
          <div class="w-10 h-10 rounded-full ${acc.color} flex items-center justify-center font-semibold">${acc.initial}</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium">${acc.name}</p>
            <p class="text-sm text-slate-500">${acc.company}</p>
            <p class="text-sm text-slate-500">${acc.bank} - ${acc.number}</p>
          </div>
          <div class="text-sm font-medium whitespace-nowrap mr-2">${acc.balance}</div>
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
      b.classList.remove('bg-cyan-50','ring-2','ring-cyan-400');
      b.querySelector('.radio-dot').classList.add('hidden');
    });
    btn.classList.add('bg-cyan-50','ring-2','ring-cyan-400');
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
    }
    updateMethodVisibility();
    closeSheet();
  });

  sourceBtn?.addEventListener('click', openSheet);
  destBtn?.addEventListener('click', openDestSheet);

  categoryBtn?.addEventListener('click', () => {
    categoryList.classList.toggle('hidden');
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
    drawer.classList.add('open');
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
  }

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);

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

  function updateMethodOptions() {
    const now = new Date();
    const validMethods = (amountValid && sourceSelected && destSelected)
      ? transferMethodsData.filter(m => amountValue >= m.min && amountValue <= m.max && m.check(now))
      : [];
    methodSelect.innerHTML = '<option value="">Pilih metode transfer</option>' +
      validMethods.map(m => `<option value="${m.name}" data-fee="${m.fee}">${m.name}</option>`).join('');
    methodSelect.disabled = validMethods.length === 0;
    methodSelect.value = '';
    methodSelected = false;
    selectedMethod = '';
    selectedFee = 0;
    updateConfirmState();
  }

  function updateMethodVisibility() {
    if (sourceSelected && destSelected) {
      methodSection.classList.remove('hidden');
      updateMethodOptions();
    } else {
      methodSection.classList.add('hidden');
      methodSelect.value = '';
      methodSelect.disabled = true;
      methodSelected = false;
      selectedMethod = '';
      selectedFee = 0;
      updateConfirmState();
    }
  }

  updateMethodVisibility();

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

  methodSelect?.addEventListener('change', (e) => {
    if (e.target.value) {
      methodSelected = true;
      selectedMethod = e.target.value;
      selectedFee = parseInt(e.target.selectedOptions[0].dataset.fee);
    } else {
      methodSelected = false;
      selectedMethod = '';
      selectedFee = 0;
    }
    updateConfirmState();
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

  confirmBack?.addEventListener('click', closeConfirmSheet);
  confirmClose?.addEventListener('click', closeConfirmSheet);
  confirmProceed?.addEventListener('click', () => {
    alert('Transfer diproses (dummy).');
    closeConfirmSheet();
  });
});

