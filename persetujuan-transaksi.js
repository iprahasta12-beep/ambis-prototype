const approvalsData = {
  butuh: [
    { time: '17 Agu 2024 • 20:10', category: 'Transaksi', description: 'Transfer Saldo - Ke BCA PT Queen Japan - Rp50.000.000' },
    { time: '18 Agu 2024 • 20:10', category: 'Manajemen Pengguna', description: 'Penambahan Pengguna Baru - Fajar Satria - Finance & Accounting' },
    { time: '19 Agu 2024 • 20:10', category: 'Batas Transaksi', description: 'Ubah Batas Transaksi - Dari Rp500.000.000 ke Rp250.000.000 - Oleh Bimo Purwoko' },
    { time: '20 Agu 2024 • 20:10', category: 'Atur Persetujuan', description: 'Buat Persetujuan Transaksi - Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '21 Agu 2024 • 20:10', category: 'Pengaturan Rekening', description: 'Hapus Rekening - Operasional - Oleh Fajar Satria' },
    { time: '22 Agu 2024 • 20:10', category: 'Transaksi', description: 'Transfer Saldo - Ke Mandiri PT Aman Jaya - Rp100.000.000' },
    { time: '23 Agu 2024 • 20:10', category: 'Manajemen Pengguna', description: 'Nonaktifkan Pengguna - Budi Santoso - Admin' },
    { time: '24 Agu 2024 • 20:10', category: 'Batas Transaksi', description: 'Tambah Batas Transaksi - Dari Rp250.000.000 ke Rp300.000.000 - Oleh Bimo Purwoko' },
    { time: '25 Agu 2024 • 20:10', category: 'Atur Persetujuan', description: 'Edit Persetujuan - Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '26 Agu 2024 • 20:10', category: 'Transaksi', description: 'Transfer Saldo - Ke BRI PT Nusantara - Rp75.000.000' }
  ],
  menunggu: [
    { time: '27 Agu 2024 • 20:10', category: 'Transaksi', description: 'Transfer Saldo - Ke BCA PT Queen Japan - Rp60.000.000' },
    { time: '28 Agu 2024 • 20:10', category: 'Manajemen Pengguna', description: 'Penambahan Pengguna Baru - Siti Aisyah - Marketing' },
    { time: '29 Agu 2024 • 20:10', category: 'Batas Transaksi', description: 'Ubah Batas Transaksi - Dari Rp300.000.000 ke Rp350.000.000 - Oleh Bimo Purwoko' },
    { time: '30 Agu 2024 • 20:10', category: 'Atur Persetujuan', description: 'Buat Persetujuan - Persetujuan Transfer - Oleh Fajar Satria' },
    { time: '31 Agu 2024 • 20:10', category: 'Pengaturan Rekening', description: 'Tambah Rekening - Operasional - Oleh Fajar Satria' },
    { time: '01 Sep 2024 • 20:10', category: 'Transaksi', description: 'Transfer Saldo - Ke BNI PT Sejahtera - Rp90.000.000' }
  ],
  selesai: [
    { time: '02 Sep 2024 • 20:10', category: 'Transaksi', description: 'Transfer Saldo - Ke BCA PT Queen Japan - Rp50.000.000' },
    { time: '03 Sep 2024 • 20:10', category: 'Manajemen Pengguna', description: 'Penambahan Pengguna Baru - Fajar Satria - Finance' },
    { time: '04 Sep 2024 • 20:10', category: 'Batas Transaksi', description: 'Ubah Batas Transaksi - Dari Rp350.000.000 ke Rp400.000.000 - Oleh Bimo Purwoko' }
  ]
};

const tabButtons = document.querySelectorAll('.tab-btn');
const tableBody = document.getElementById('approvalBody');

function render(tab) {
  const list = approvalsData[tab];
  tableBody.innerHTML = '';
  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50';
    tr.innerHTML = `
      <td class="px-4 py-3">${item.time}</td>
      <td class="px-4 py-3">${item.category}</td>
      <td class="px-4 py-3">${item.description}</td>
      <td class="px-4 py-3">
        <button class="px-4 py-1 rounded-lg border border-cyan-500 text-cyan-600 hover:bg-cyan-50">Detail</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function updateCounts() {
  tabButtons.forEach(btn => {
    const tab = btn.dataset.tab;
    const countEl = btn.querySelector('.tab-count');
    if (countEl) countEl.textContent = approvalsData[tab].length;
  });
}

function setActive(tab) {
  tabButtons.forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('relative', isActive);
    btn.classList.toggle('font-medium', isActive);
    btn.classList.toggle('text-slate-900', isActive);
    btn.classList.toggle('text-slate-600', !isActive);
    btn.classList.toggle('hover:text-slate-900', !isActive);
    const indicator = btn.querySelector('.tab-indicator');
    if (indicator) {
      indicator.classList.toggle('hidden', !isActive);
    }
  });
}

updateCounts();
setActive('butuh');
render('butuh');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    setActive(tab);
    render(tab);
  });
});
