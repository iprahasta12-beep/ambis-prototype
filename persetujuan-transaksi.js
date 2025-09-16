const approvalsData = {
  transaksi: [
    { time: '17 Agu 2025 • 20:10', jenis: 'kredit', activity: 'Transfer Saldo', description: 'Ke BCA PT Queen Japan - Rp50.000.000' },
    { time: '22 Agu 2025 • 20:10', jenis: 'kredit', activity: 'Transfer Saldo', description: 'Ke Mandiri PT Aman Jaya - Rp100.000.000' },
    { time: '26 Agu 2025 • 20:10', jenis: 'kredit', activity: 'Transfer Saldo', description: 'Ke BRI PT Nusantara - Rp75.000.000' },
    { time: '30 Sep 2025 • 20:10', jenis: 'kredit', activity: 'Transfer Saldo', description: 'Ke BNI PT Sejahtera - Rp90.000.000' },
    { time: '02 Sep 2025 • 20:10', jenis: 'kredit', activity: 'Transfer Saldo', description: 'Ke BCA PT Queen Japan - Rp50.000.000' }
  ],
  batas: [
    { time: '19 Agu 2025 • 20:10', jenis: 'debit', activity: 'Ubah Batas Transaksi', description: 'Dari Rp500.000.000 ke Rp250.000.000 - Oleh Bimo Purwoko' },
    { time: '24 Agu 2025 • 20:10', jenis: 'debit', activity: 'Tambah Batas Transaksi', description: 'Dari Rp250.000.000 ke Rp300.000.000 - Oleh Bimo Purwoko' },
    { time: '20 Agu 2025 • 20:10', jenis: 'debit', activity: 'Ubah Batas Transaksi', description: 'Dari Rp300.000.000 ke Rp350.000.000 - Oleh Bimo Purwoko' },
    { time: '04 Sep 2025 • 20:10', jenis: 'debit', activity: 'Ubah Batas Transaksi', description: 'Dari Rp350.000.000 ke Rp400.000.000 - Oleh Bimo Purwoko' }
  ],
  persetujuan: [
    { time: '20 Agu 2025 • 20:10', jenis: 'debit', activity: 'Buat Persetujuan Transfer', description: 'Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '25 Agu 2025 • 20:10', jenis: 'debit', activity: 'Edit Persetujuan Transfer', description: 'Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '05 Sep 2025 • 20:10', jenis: 'debit', activity: 'Buat Persetujuan Transfer', description: 'Persetujuan Transfer - Oleh Fajar Satria' }
  ]
};

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
let activeTab = 'transaksi';

function parseDate(str) {
  const months = {Jan:0, Feb:1, Mar:2, Apr:3, Mei:4, Jun:5, Jul:6, Agu:7, Sep:8, Okt:9, Nov:10, Des:11};
  const [datePart, timePart] = str.split('•').map(s => s.trim());
  const [day, mon, year] = datePart.split(' ');
  const [hour, min] = timePart.split(':');
  return new Date(+year, months[mon], +day, +hour, +min);
}

function getFilters(tab) {
  const group = document.querySelector(`[data-filter-group="${tab}"]`);
  const read = key => {
    const el = group ? group.querySelector(`.filter[data-filter="${key}"]`) : null;
    return el ? el.dataset.applied || '' : '';
  };
  return {
    date: read('date'),
    jenis: read('jenis')
  };
}

function filterByDate(list, value) {
  if (!value) return list;
  const now = new Date();
  return list.filter(item => {
    const d = parseDate(item.time);
    if (value === '7 Hari Terakhir') {
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      return d >= weekAgo;
    }
    if (value === '30 Hari Terakhir') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      return d >= monthAgo;
    }
    if (value === '1 Tahun Terakhir') {
      const yearAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365);
      return d >= yearAgo;
    }
    if (value.startsWith('custom:')) {
      const [startStr, endStr] = value.slice(7).split('|');
      const start = new Date(startStr);
      const end = new Date(endStr);
      return d >= start && d <= end;
    }
    return true;
  });
}

function render(tab) {
  const panel = document.querySelector(`[data-tab-panel="${tab}"]`);
  if (!panel) return;
  const tbody = panel.querySelector('[data-role="table-body"]');
  if (!tbody) return;

  const filters = getFilters(tab);
  let list = approvalsData[tab] ? [...approvalsData[tab]] : [];

  list = filterByDate(list, filters.date);

  if (filters.jenis) {
    list = list.filter(item => item.jenis === filters.jenis);
  }

  tbody.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('tr');
    empty.innerHTML = `
      <td class="px-4 py-6 text-center text-slate-500" colspan="4">Tidak ada data pada rentang ini.</td>
    `;
    tbody.appendChild(empty);
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50';
    const isCredit = item.jenis === 'kredit';
    const badgeClass = isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
    const jenisLabel = isCredit ? 'Kredit' : 'Debit';
    tr.innerHTML = `
      <td class="px-4 py-3">${item.time}</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="font-medium">${item.activity}</span>
          <span class="text-xs font-semibold rounded-full px-2 py-0.5 ${badgeClass}">${jenisLabel}</span>
        </div>
      </td>
      <td class="px-4 py-3">${item.description}</td>
      <td class="px-4 py-3 text-right">
        <button class="px-4 py-1 rounded-lg border border-cyan-500 text-cyan-600 hover:bg-cyan-50">Detail</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCounts() {
  tabButtons.forEach(btn => {
    const tab = btn.dataset.tab;
    const countEl = btn.querySelector('.tab-count');
    if (!countEl) return;
    const total = approvalsData[tab] ? approvalsData[tab].length : 0;
    countEl.textContent = total;
    countEl.classList.toggle('hidden', total === 0);
  });
}

function setActive(tab) {
  activeTab = tab;
  tabButtons.forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('relative', isActive);
    btn.classList.toggle('font-semibold', isActive);
    btn.classList.toggle('text-slate-900', isActive);
    btn.classList.toggle('text-slate-600', !isActive);
    btn.classList.toggle('hover:text-slate-900', !isActive);
    const indicator = btn.querySelector('.tab-indicator');
    if (indicator) {
      indicator.classList.toggle('hidden', !isActive);
    }
  });

  tabPanels.forEach(panel => {
    const isActive = panel.dataset.tabPanel === tab;
    panel.classList.toggle('hidden', !isActive);
  });

  render(tab);
}

updateCounts();
setActive(activeTab);

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    if (tab && tab !== activeTab) {
      setActive(tab);
    }
  });
});

document.addEventListener('filter-change', event => {
  const groupId = event.detail ? event.detail.groupId : null;
  if (!groupId || groupId === activeTab) {
    render(activeTab);
  }
});
