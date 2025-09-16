const accountSelect = document.getElementById('accountSelect');
const balanceEl = document.getElementById('dashBalanceValue');
const transactionListEl = document.getElementById('transactionList');

let accounts = [];

fetch('data/account.json')
  .then((res) => res.json())
  .then((data) => {
    accounts = data;
    populateSelect();
    accountSelect.addEventListener('change', updateView);
    updateView();
  })
  .catch((err) => {
    console.error('Failed to load accounts', err);
  });

function populateSelect() {
  accountSelect.innerHTML = '';
  accounts.forEach((acc) => {
    const opt = document.createElement('option');
    opt.value = acc.id;
    opt.textContent = acc.name;
    if (acc.name === 'Rekening Utama') {
      opt.selected = true;
    }
    accountSelect.appendChild(opt);
  });
}

function updateView() {
  const selectedId = parseInt(accountSelect.value, 10);
  const account = accounts.find((a) => a.id === selectedId);
  if (!account) return;

  balanceEl.textContent = formatCurrency(account.balance);

  transactionListEl.innerHTML = '';
  account.transactions.forEach((tx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50';
    const isTransferOut = tx.amount < 0;
    const iconSrc = isTransferOut
      ? 'img/dashboard/akses-cepat/transfer-out.svg'
      : 'img/dashboard/akses-cepat/transfer-in.svg';
    const iconBgClass = isTransferOut ? 'bg-red-100' : 'bg-green-100';
    tr.innerHTML = `
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="w-10 h-10 rounded-full ${iconBgClass} border grid place-items-center">
            <img src="${iconSrc}" alt="" class="w-6 h-6 object-contain">
          </span>
          <span>${tx.description}</span>
        </div>
      </td>
      <td class="px-4 py-3"><span class="text-xs rounded border px-2 py-0.5">${account.name}</span></td>
      <td class="px-4 py-3">${tx.date}</td>
      <td class="px-4 py-3">${formatCurrency(tx.amount)}</td>
      <td class="px-4 py-3"></td>
    `;
    transactionListEl.appendChild(tr);
  });
}

function formatCurrency(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Drawer logic for "Ubah Akses"
const drawer = document.getElementById('drawer');
const openBtn = document.getElementById('ubahAksesBtn');
const closeBtn = document.getElementById('drawerCloseBtn');

function openDrawer() {
  tempSelectedAkses = [...selectedAkses];
  renderDrawer();
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
