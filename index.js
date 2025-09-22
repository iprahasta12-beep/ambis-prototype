const accountSelect = document.getElementById('accountSelect');
const balanceEl = document.getElementById('dashBalanceValue');
const transactionListEl = document.getElementById('transactionList');
const balanceToggleBtn = document.getElementById('dashBalanceToggle');
const balanceToggleLabel = balanceToggleBtn?.querySelector('[data-balance-toggle-label]');
const balanceSensitiveEls = Array.from(document.querySelectorAll('[data-balance-sensitive]'));

const MASKED_BALANCE_TEXT = '••••';

const ambis = window.AMBIS || {};
const sharedAccounts = typeof ambis.getAccounts === 'function'
  ? ambis.getAccounts({ clone: false })
  : null;
const accounts = Array.isArray(sharedAccounts)
  ? sharedAccounts
  : Array.isArray(ambis.accounts)
    ? ambis.accounts
    : [];

let isBalanceHidden = false;

function populateSelect() {
  if (!accountSelect) return;
  accountSelect.innerHTML = '';
  accounts.forEach((acc, index) => {
    const opt = document.createElement('option');
    opt.value = acc.id ?? String(index);
    opt.textContent = acc.displayName || acc.name || `Rekening ${index + 1}`;
    if ((acc.id && acc.id === 'utama') || (!acc.id && index === 0)) {
      opt.selected = true;
    }
    accountSelect.appendChild(opt);
  });
}

function findAccountById(id) {
  if (!id && id !== 0) {
    return accounts[0] || null;
  }
  if (typeof ambis.findAccountById === 'function') {
    const found = ambis.findAccountById(id);
    if (found) return found;
  }
  return accounts.find((acc) => String(acc.id) === String(id)) || accounts[0] || null;
}

function getTransactionsForAccount(account) {
  if (!account) return [];
  if (typeof ambis.getTransactionsForAccount === 'function') {
    return ambis.getTransactionsForAccount(account);
  }
  return Array.isArray(account.transactions) ? account.transactions : [];
}

function updateView() {
  if (!accountSelect) return;
  const selectedId = accountSelect.value || (accounts[0]?.id ?? '');
  const account = findAccountById(selectedId);
  if (!account) return;

  setBalanceValue(balanceEl, formatCurrency(account.balance));

  if (!transactionListEl) return;
  transactionListEl.innerHTML = '';
  const transactions = getTransactionsForAccount(account);
  transactions.forEach((tx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50';
    const isTransferOut = (tx.amount ?? 0) < 0;
    const iconSrc = isTransferOut
      ? 'img/dashboard/akses-cepat/transfer-out.svg'
      : 'img/dashboard/akses-cepat/transfer-in.svg';
    const iconBgClass = isTransferOut ? 'bg-red-100' : 'bg-green-100';
    const accountLabel = account.displayName || account.name || 'Rekening';
    const accountNumber = account.number || ambis.formatAccountNumber?.(account.numberRaw) || '';
    tr.innerHTML = `
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="w-10 h-10 rounded-full ${iconBgClass} border grid place-items-center">
            <img src="${iconSrc}" alt="" class="w-6 h-6 object-contain">
          </span>
          <span>${tx.description || '-'}</span>
        </div>
      </td>
     <td class="px-4 py-3">
      <span class="text-xs rounded border px-2 py-0.5">${accountLabel}</span>
    </td>
      <td class="px-4 py-3">${tx.date || '-'}</td>
      <td class="px-4 py-3">${formatCurrency(tx.amount ?? 0)}</td>
      <td class="px-4 py-3"></td>
    `;
    transactionListEl.appendChild(tr);
  });
}

if (accountSelect && accounts.length) {
  populateSelect();
  accountSelect.addEventListener('change', updateView);
  updateView();
}

function formatCurrency(num) {
  const safeValue = typeof num === 'number' && Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

function maskCurrencyText() {
  return MASKED_BALANCE_TEXT;
}

function setBalanceValue(el, value) {
  if (!el) return;
  el.dataset.balanceValue = value;
  el.textContent = isBalanceHidden ? maskCurrencyText(value) : value;
}

function registerBalanceElement(el) {
  if (!el) return;
  if (!el.dataset.balanceValue) {
    el.dataset.balanceValue = el.textContent.trim();
  }
  el.textContent = isBalanceHidden
    ? maskCurrencyText(el.dataset.balanceValue)
    : el.dataset.balanceValue;
}

function updateBalanceVisibility() {
  balanceSensitiveEls.forEach((el) => {
    const original = el.dataset.balanceValue ?? '';
    el.textContent = isBalanceHidden ? maskCurrencyText(original) : original;
  });

  if (balanceToggleLabel) {
    balanceToggleLabel.textContent = isBalanceHidden ? 'Tampilkan' : 'Sembunyikan';
  }

  if (balanceToggleBtn) {
    balanceToggleBtn.setAttribute('aria-pressed', isBalanceHidden ? 'true' : 'false');
  }
}

balanceSensitiveEls.forEach(registerBalanceElement);
updateBalanceVisibility();

balanceToggleBtn?.addEventListener('click', () => {
  isBalanceHidden = !isBalanceHidden;
  updateBalanceVisibility();
});

// Drawer logic for "Ubah Akses"
const drawer = document.getElementById('drawer');
const openBtn = document.getElementById('ubahAksesBtn');
const closeBtn = document.getElementById('drawerCloseBtn');
const dashboardGrid = document.getElementById('dashboardGrid');
const pendingSection = document.getElementById('pendingSection');

function updateDashboardLayout() {
  /*
   * Keep the dashboard grid layout static so the content doesn't shift when
   * the drawer opens or closes. Column adjustments previously triggered
   * noticeable card/text movement, which we now avoid by leaving the grid
   * configuration untouched.
   */
  if (!dashboardGrid || !pendingSection) return;
  dashboardGrid.classList.add('lg:grid-cols-3');
  dashboardGrid.classList.remove('lg:grid-cols-2');
  pendingSection.classList.add('lg:col-span-1');
  pendingSection.classList.remove('lg:col-span-2');
}

updateDashboardLayout();

function openDrawer() {
  tempSelectedAkses = [...selectedAkses];
  renderDrawer();
  drawer.classList.add('open');
  updateDashboardLayout();
  if (typeof window.sidebarCollapseForDrawer === 'function') {
    window.sidebarCollapseForDrawer();
  }
}

function closeDrawer() {
  drawer.classList.remove('open');
  updateDashboardLayout();
  if (typeof window.sidebarRestoreForDrawer === 'function') {
    window.sidebarRestoreForDrawer();
  }
}

openBtn?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);

// Quick access configuration
const aksesContainer = document.getElementById('aksesCepatContainer');
const drawerContent = document.getElementById('drawerContent');
const drawerError = document.getElementById('drawerError');
const saveBtn = document.getElementById('saveAksesBtn');

const aksesItems = [
  { id: 'transfer', label: 'Transfer Saldo', icon: 'img/dashboard/akses-cepat/transfer.svg', category: 'TRANSAKSI' },
  { id: 'pindah', label: 'Pemindahan Saldo', icon: 'img/dashboard/akses-cepat/pindah-saldo.svg', category: 'TRANSAKSI' },
  { id: 'mutasi', label: 'Mutasi Rekening', icon: 'img/dashboard/akses-cepat/mutasi.svg', category: 'TRANSAKSI' },
  { id: 'statement', label: 'e-Statement', icon: 'img/dashboard/akses-cepat/e-statement.svg', category: 'TRANSAKSI' },
  { id: 'token', label: 'Token Listrik', icon: 'img/dashboard/akses-cepat/pln.svg', category: 'LISTRIK PLN' },
  { id: 'tagihan', label: 'Tagihan Listrik', icon: 'img/dashboard/akses-cepat/pln.svg', category: 'LISTRIK PLN' },
  { id: 'indihome', label: 'Indihome', icon: 'mg/dashboard/akses-cepat/internet.svg', category: 'INTERNET' },
  { id: 'myrepublic', label: 'MyRepublic', icon: 'img/dashboard/akses-cepat/internet.svg', category: 'INTERNET' },
  { id: 'cbn', label: 'CBN', icon: 'img/dashboard/akses-cepat/internet.svg', category: 'INTERNET' },
  { id: 'iconnect', label: 'Iconnect', icon: 'img/dashboard/akses-cepat/internet.svg', category: 'INTERNET' },
  { id: 'bpjs-keluarga', label: 'BPJS Kesehatan Keluarga', icon: 'img/dashboard/akses-cepat/bpjs.svg', category: 'BPJS' },
  { id: 'bpjs-badan-usaha', label: 'BPJS Ketenagakerjaan Badan Usaha', icon: 'img/dashboard/akses-cepat/bpjs.svg', category: 'BPJS' },
  { id: 'bpjstk-penerima-upah', label: 'BPJSTK Penerima Upah', icon: 'img/dashboard/akses-cepat/bpjs.svg', category: 'BPJS' },
  { id: 'bpjstk-bukan-penerima-upah', label: 'BPJSTK Bukan Penerima Upah', icon: 'img/dashboard/akses-cepat/bpjs.svg', category: 'BPJS' }
];

let selectedAkses = ['transfer', 'pindah', 'mutasi', 'statement', 'token', 'tagihan'];
let tempSelectedAkses = [...selectedAkses];

function renderQuickAccess() {
  if (!aksesContainer) return;
  aksesContainer.innerHTML = '';
  selectedAkses.forEach((id) => {
    const item = aksesItems.find((i) => i.id === id);
    if (!item) return;
    const btn = document.createElement('button');
    btn.className = 'w-full h-[130px] rounded-[18px] border border-slate-200 bg-white hover:bg-slate-50 transition flex flex-col items-center justify-center gap-3';
    btn.innerHTML = `
      <span class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 grid place-items-center">
        <img src="${item.icon}" alt="" class="w-6 h-6 object-contain">
      </span>
      <span class="text-slate-900 font-medium">${item.label}</span>
    `;
    aksesContainer.appendChild(btn);
  });
}

function showDrawerError(msg) {
  if (!drawerError) return;
  drawerError.textContent = msg;
  drawerError.classList.remove('hidden');
  setTimeout(() => drawerError.classList.add('hidden'), 2000);
}

function onCheckboxChange(e) {
  const id = e.target.dataset.id;
  if (e.target.checked) {
    if (tempSelectedAkses.length >= 6) {
      e.target.checked = false;
      showDrawerError('Maksimal 6 item di akses cepat');
      return;
    }
    tempSelectedAkses.push(id);
  } else {
    tempSelectedAkses = tempSelectedAkses.filter((x) => x !== id);
  }
}

function renderDrawer() {
  if (!drawerContent) return;
  drawerContent.innerHTML = '';
  const categories = [...new Set(aksesItems.map((i) => i.category))];

  categories.forEach((cat, idx) => {
    const section = document.createElement('section');
    section.className = 'p-4';

    const heading = document.createElement('h3');
    heading.className = 'text-xs font-semibold text-slate-500 mb-3';
    heading.textContent = cat;
    section.appendChild(heading);

    // 2-column grid for most, full width for BPJS
    const list = document.createElement('div');
    list.className = (cat === 'BPJS')
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-2 gap-3';

    aksesItems.filter((i) => i.category === cat).forEach((item) => {
      const label = document.createElement('label');
      label.className = 'block cursor-pointer';
      label.innerHTML = `
        <input type="checkbox" data-id="${item.id}" class="sr-only peer" ${tempSelectedAkses.includes(item.id) ? 'checked' : ''}>

        <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm peer-checked:border-cyan-300 peer-checked:bg-cyan-50 peer-checked:[&_img]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400">
          <span class="text-base font-medium text-slate-900">${item.label}</span>
          <span aria-hidden="true" class="flex-shrink-0 w-7 h-7 grid place-items-center">
            <img src="img/dashboard/akses-cepat/aktif.svg" alt="" class="w-5 h-5 opacity-0">
          </span>
        </div>`;
      list.appendChild(label);
    });

    section.appendChild(list);
    drawerContent.appendChild(section);

    if (idx < categories.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'bg-slate-100 h-6';
      drawerContent.appendChild(divider);
    }
  });

  drawerContent.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', onCheckboxChange);
  });
}

renderQuickAccess();

saveBtn?.addEventListener('click', () => {
  selectedAkses = [...tempSelectedAkses];
  renderQuickAccess();
  closeDrawer();
});
