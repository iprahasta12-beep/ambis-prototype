// transfer.js - drawer logic for transfer page

document.addEventListener('DOMContentLoaded', () => {
  const openBtn  = document.getElementById('openTransferDrawer');
  const drawer   = document.getElementById('drawer');
  const closeBtn = document.getElementById('drawerCloseBtn');

  // bottom sheet elements
  const sourceBtn = document.getElementById('sourceAccountBtn');
  const destBtn   = document.getElementById('destinationAccountBtn');
  const sheetOverlay = document.getElementById('sheetOverlay');
  const sheet       = document.getElementById('bottomSheet');
  const sheetTitle  = document.getElementById('sheetTitle');
  const sheetList   = document.getElementById('sheetList');
  const sheetCancel = document.getElementById('sheetCancel');
  const sheetChoose = document.getElementById('sheetChoose');

  const accounts = [
    { initial:'O', color:'bg-cyan-100 text-cyan-600', name:'Operasional', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'D', color:'bg-orange-100 text-orange-600', name:'Distributor', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'P', color:'bg-teal-100 text-teal-600', name:'Partnership', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'A', color:'bg-purple-100 text-purple-600', name:'Admin', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' },
    { initial:'B', color:'bg-red-100 text-red-600', name:'Bill', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp3.000.000.000,00' }
  ];

  let currentField = null;   // 'source' or 'dest'
  let currentData  = [];
  let selectedIndex = null;

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

  function openSheet(field) {
    currentField = field;
    currentData = accounts; // same list for now
    selectedIndex = null;
    sheetTitle.textContent = field === 'source' ? 'Sumber Rekening' : 'Tujuan Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50', 'cursor-not-allowed');
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
  sheetOverlay?.addEventListener('click', closeSheet);

  sheetChoose?.addEventListener('click', () => {
    if (selectedIndex === null) return;
    const acc = currentData[selectedIndex];
    const target = currentField === 'source' ? sourceBtn : destBtn;
    target.textContent = `${acc.name} - ${acc.number}`;
    target.classList.remove('text-slate-500');
    closeSheet();
  });

  sourceBtn?.addEventListener('click', () => openSheet('source'));
  destBtn?.addEventListener('click', () => openSheet('dest'));

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
});

