// transfer.js - drawer logic for transfer page

document.addEventListener('DOMContentLoaded', () => {
  const openBtn  = document.getElementById('openTransferDrawer');
  const drawer   = document.getElementById('drawer');
  const closeBtn = document.getElementById('drawerCloseBtn');

  // buttons & inputs in form
  const sourceBtn = document.getElementById('sourceAccountBtn');
  const destBtn   = document.getElementById('destinationAccountBtn');
  const categoryBtn = document.getElementById('categoryBtn');
  const amountInput = document.getElementById('amountInput');
  const methodContainer = document.getElementById('methodContainer');
  const transferMethod = document.getElementById('transferMethod');
  const feeBreakdown = document.getElementById('feeBreakdown');
  const nominalDisplay = document.getElementById('nominalDisplay');
  const feeDisplay = document.getElementById('feeDisplay');
  const totalDisplay = document.getElementById('totalDisplay');
  const confirmBtn = document.getElementById('confirmBtn');
  const noteInput = document.getElementById('noteInput');
  const noteCounter = document.getElementById('noteCounter');

  // generic bottom sheet
  const sheetOverlay = document.getElementById('sheetOverlay');
  const sheet       = document.getElementById('bottomSheet');
  const sheetTitle  = document.getElementById('sheetTitle');
  const sheetList   = document.getElementById('sheetList');
  const sheetCancel = document.getElementById('sheetCancel');
  const sheetChoose = document.getElementById('sheetChoose');

  // destination sheet elements
  const destSheet   = document.getElementById('destSheet');
  const destBank    = document.getElementById('destBank');
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
  const confirmContent = document.getElementById('confirmContent');
  const confirmBack = document.getElementById('confirmBack');
  const confirmProceed = document.getElementById('confirmProceed');

  // data
  const accounts = [
    { initial:'O', color:'bg-cyan-100 text-cyan-600', name:'Operasional', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'D', color:'bg-orange-100 text-orange-600', name:'Distributor', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'P', color:'bg-teal-100 text-teal-600', name:'Partnership', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'A', color:'bg-purple-100 text-purple-600', name:'Admin', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'B', color:'bg-red-100 text-red-600', name:'Bill', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' }
  ];

  const categories = ['Tagihan','Pembayaran','Transportasi','Pemindahan Dana','Investasi','Lainnya'];

  const transferMethodsData = [
    { name:'BI Fast', fee:2500, min:0, max:250000000 },
    { name:'RTGS', fee:25000, min:100000000, max:Infinity },
    { name:'SKN/LLG', fee:2900, min:0, max:500000000 },
    { name:'Online Transfer', fee:6500, min:0, max:25000000 }
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
  let methodSelected = false;
  let categorySelected = false;
  let selectedCategory = '';
  let currentSheetType = 'source';

  function renderList(data, type) {
    if (type === 'source') {
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
    } else if (type === 'category') {
      sheetList.innerHTML = data.map((cat, idx) => `
        <li>
          <button type="button" data-index="${idx}" class="sheet-item w-full flex items-center justify-between px-4 py-3 text-left">
            <span>${cat}</span>
            <span class="ml-2 w-5 h-5 rounded-full border border-slate-300 grid place-items-center">
              <span class="radio-dot w-2 h-2 rounded-full bg-cyan-500 hidden"></span>
            </span>
          </button>
        </li>`).join('');
    }
  }

  function openSheet(type = 'source') {
    currentSheetType = type;
    selectedIndex = null;
    currentData = type === 'source' ? accounts : categories;
    sheetTitle.textContent = type === 'source' ? 'Sumber Rekening' : 'Kategori';
    sheetChoose.textContent = type === 'source' ? 'Pilih Rekening' : 'Pilih';
    renderList(currentData, type);
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
    destBank.value = '';
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
    } else if (currentSheetType === 'category') {
      selectedCategory = currentData[selectedIndex];
      categoryBtn.textContent = selectedCategory;
      categoryBtn.classList.remove('text-slate-500');
      categorySelected = true;
    }
    updateConfirmState();
    closeSheet();
  });

  sourceBtn?.addEventListener('click', () => openSheet('source'));
  categoryBtn?.addEventListener('click', () => openSheet('category'));
  destBtn?.addEventListener('click', openDestSheet);

  destNumber?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g,'');
  });

  checkAccount?.addEventListener('click', () => {
    selectedBank = destBank.value;
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
    checkMethodVisibility();
    updateConfirmState();
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

  function checkMethodVisibility() {
    if (destSelected && amountValid) {
      methodContainer.classList.remove('hidden');
      updateMethodOptions();
    } else {
      methodContainer.classList.add('hidden');
      transferMethod.value = '';
      feeBreakdown.classList.add('hidden');
      methodSelected = false;
    }
  }

  function updateMethodOptions() {
    const validMethods = transferMethodsData.filter(m => amountValue >= m.min && amountValue <= m.max);
    transferMethod.innerHTML = '<option value="">Pilih metode transfer</option>' +
      validMethods.map(m => `<option value="${m.name}" data-fee="${m.fee}">${m.name}</option>`).join('');
    transferMethod.disabled = validMethods.length === 0;
  }

  function updateConfirmState() {
    if (sourceSelected && destSelected && amountValid && categorySelected && methodSelected) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('opacity-50','cursor-not-allowed');
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('opacity-50','cursor-not-allowed');
    }
  }

  amountInput?.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g,'');
    e.target.value = raw ? formatter.format(raw) : '';
    amountValue = parseInt(raw) || 0;
    amountValid = amountValue > 0 && amountValue <= dailyLimit;
    checkMethodVisibility();
    updateConfirmState();
  });

  transferMethod?.addEventListener('change', (e) => {
    if (e.target.value) {
      const fee = parseInt(e.target.selectedOptions[0].dataset.fee);
      nominalDisplay.textContent = 'Rp' + formatter.format(amountValue);
      feeDisplay.textContent = 'Rp' + formatter.format(fee);
      totalDisplay.textContent = 'Rp' + formatter.format(amountValue + fee);
      feeBreakdown.classList.remove('hidden');
      methodSelected = true;
    } else {
      feeBreakdown.classList.add('hidden');
      methodSelected = false;
    }
    updateConfirmState();
  });

  noteInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 50) {
      e.target.value = e.target.value.slice(0,50);
    }
    noteCounter.textContent = `${e.target.value.length}/50`;
  });

  confirmBtn?.addEventListener('click', () => {
    const fee = parseInt(transferMethod.selectedOptions[0].dataset.fee);
    const total = amountValue + fee;
    const ref = Math.floor(100000000 + Math.random()*900000000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    const noteVal = noteInput.value || '-';
    confirmContent.innerHTML = `
      <div class="space-y-4">
        <div>
          <p class="font-semibold mb-1">Transfer Saldo</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-600">Sumber</span><span>${sourceBtn.textContent}</span></div>
            <div class="flex justify-between"><span class="text-slate-600">Tujuan</span><span>${destBtn.textContent}</span></div>
          </div>
        </div>
        <div>
          <p class="font-semibold mb-1">Total Transaksi</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>Nominal</span><span>Rp${formatter.format(amountValue)}</span></div>
            <div class="flex justify-between"><span>Biaya Transfer</span><span>Rp${formatter.format(fee)}</span></div>
            <div class="flex justify-between font-semibold"><span>Total</span><span>Rp${formatter.format(total)}</span></div>
          </div>
        </div>
        <div>
          <p class="font-semibold mb-1">Detail Transaksi</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>Metode Transfer</span><span>${transferMethod.value}</span></div>
            <div class="flex justify-between"><span>Nomor Referensi</span><span>${ref}</span></div>
            <div class="flex justify-between"><span>Tanggal dan Waktu</span><span>${dateStr} ${timeStr}</span></div>
            <div class="flex justify-between"><span>Kategori</span><span>${selectedCategory}</span></div>
            <div class="flex justify-between"><span>Catatan</span><span>${noteVal}</span></div>
          </div>
        </div>
      </div>`;
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      confirmSheet.classList.remove('translate-y-full');
    });
  });

  confirmBack?.addEventListener('click', closeConfirmSheet);
  confirmProceed?.addEventListener('click', () => {
    alert('Transfer diproses (dummy).');
    closeConfirmSheet();
  });
});

