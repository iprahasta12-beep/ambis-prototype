const approvalsData = {
  butuh: [
    { time: '17 Agu 2025 • 20:10', category: 'Transaksi', jenis: 'kredit', description: 'Transfer Saldo - Ke BCA PT Queen Japan - Rp50.000.000' },
    { time: '18 Agu 2025 • 20:10', category: 'Manajemen Pengguna', jenis: 'debit', description: 'Penambahan Pengguna Baru - Fajar Satria - Finance & Accounting' },
    { time: '19 Agu 2025 • 20:10', category: 'Batas Transaksi', jenis: 'debit', description: 'Ubah Batas Transaksi - Dari Rp500.000.000 ke Rp250.000.000 - Oleh Bimo Purwoko' },
    { time: '20 Agu 2025 • 20:10', category: 'Atur Persetujuan', jenis: 'debit', description: 'Buat Persetujuan Transaksi - Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '21 Agu 2025 • 20:10', category: 'Pengaturan Rekening', jenis: 'debit', description: 'Hapus Rekening - Operasional - Oleh Fajar Satria' },
    { time: '22 Agu 2025 • 20:10', category: 'Transaksi', jenis: 'kredit', description: 'Transfer Saldo - Ke Mandiri PT Aman Jaya - Rp100.000.000' },
    { time: '23 Agu 2025 • 20:10', category: 'Manajemen Pengguna', jenis: 'debit', description: 'Nonaktifkan Pengguna - Budi Santoso - Admin' },
    { time: '24 Agu 2025 • 20:10', category: 'Batas Transaksi', jenis: 'debit', description: 'Tambah Batas Transaksi - Dari Rp250.000.000 ke Rp300.000.000 - Oleh Bimo Purwoko' },
    { time: '25 Agu 2025 • 20:10', category: 'Atur Persetujuan', jenis: 'debit', description: 'Edit Persetujuan - Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '26 Agu 2025 • 20:10', category: 'Transaksi', jenis: 'kredit', description: 'Transfer Saldo - Ke BRI PT Nusantara - Rp75.000.000' }
  ],
  menunggu: [
    { time: '01 Agu 2025 • 20:10', category: 'Transaksi', jenis: 'kredit', description: 'Transfer Saldo - Ke BCA PT Queen Japan - Rp60.000.000' },
    { time: '10 Agu 2025 • 20:10', category: 'Manajemen Pengguna', jenis: 'debit', description: 'Penambahan Pengguna Baru - Siti Aisyah - Marketing' },
    { time: '20 Agu 2025 • 20:10', category: 'Batas Transaksi', jenis: 'debit', description: 'Ubah Batas Transaksi - Dari Rp300.000.000 ke Rp350.000.000 - Oleh Bimo Purwoko' },
    { time: '05 Sep 2025 • 20:10', category: 'Atur Persetujuan', jenis: 'debit', description: 'Buat Persetujuan - Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '15 Sep 2025 • 20:10', category: 'Pengaturan Rekening', jenis: 'debit', description: 'Tambah Rekening - Operasional - Oleh Fajar Satria' },
    { time: '30 Sep 2025 • 20:10', category: 'Transaksi', jenis: 'kredit', description: 'Transfer Saldo - Ke BNI PT Sejahtera - Rp90.000.000' }
  ],
  selesai: [
    { time: '02 Sep 2025 • 20:10', category: 'Transaksi', jenis: 'kredit', description: 'Transfer Saldo - Ke BCA PT Queen Japan - Rp50.000.000' },
    { time: '03 Sep 2025 • 20:10', category: 'Manajemen Pengguna', jenis: 'debit', description: 'Penambahan Pengguna Baru - Fajar Satria - Finance' },
    { time: '04 Sep 2025 • 20:10', category: 'Batas Transaksi', jenis: 'debit', description: 'Ubah Batas Transaksi - Dari Rp350.000.000 ke Rp400.000.000 - Oleh Bimo Purwoko' }
  ]
};

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
let activeTab = 'butuh';

const monthMap = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11
};

function parseDate(str) {
  if (!str) return new Date('1970-01-01');
  const [datePart, timePart] = str.split('•').map(s => s.trim());
  const [day, mon, year] = (datePart || '').split(' ');
  const [hour, min] = (timePart || '').split(':');
  const monthIdx = monthMap[mon] ?? 0;
  return new Date(+year || 0, monthIdx, +day || 1, +hour || 0, +min || 0);
}

function getFilters(tab) {
  const group = document.querySelector(`[data-filter-group="${tab}"]`);
  if (!group) return { date: '', kategori: [] };

  const read = key => {
    const el = group.querySelector(`.filter[data-filter="${key}"]`);
    return el ? el.dataset.applied || '' : '';
  };

  const kategoriRaw = read('Kategori');

  return {
    date: read('date'),
    kategori: kategoriRaw ? kategoriRaw.split(',').filter(Boolean) : []
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

function filterByKategori(list, values) {
  if (!values.length) return list;
  return list.filter(item => {
    if (item.category) {
      return values.includes(item.category);
    }
    if (item.jenis) {
      return values.includes(item.jenis);
    }
    return false;
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
  list = filterByKategori(list, filters.kategori);

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
    const category = item.category || item.activity || '-';
    const description = item.description || '';

    tr.innerHTML = `
      <td class="px-4 py-3">${item.time || '-'}</td>
      <td class="px-4 py-3">
        <span class="font-medium">${category}</span>
      </td>
      <td class="px-4 py-3">${description}</td>
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
