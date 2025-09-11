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
    const iconSrc = tx.amount < 0
      ? 'img/dashboard/akses-cepat/transfer-out.svg'
      : 'img/dashboard/akses-cepat/transfer-in.svg';
    tr.innerHTML = `
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 grid place-items-center">
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
    minimumFractionDigits: 0,
  }).format(num);
}

// Drawer logic for "Ubah Akses"
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('drawerOverlay');
const openBtn = document.getElementById('ubahAksesBtn');
const closeBtn = document.getElementById('drawerCloseBtn');

function openDrawer() {
  drawer.classList.remove('translate-x-full');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100');
}

function closeDrawer() {
  drawer.classList.add('translate-x-full');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  overlay.classList.remove('opacity-100');
}

openBtn?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);
overlay?.addEventListener('click', closeDrawer);
