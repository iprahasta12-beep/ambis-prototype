(function () {
  'use strict';

  const ambis = window.AMBIS || {};
  const sanitizeNumber = (value = '') => value.toString().replace(/\D+/g, '');
  const formatAccountNumber = typeof ambis.formatAccountNumber === 'function'
    ? (value) => ambis.formatAccountNumber(value)
    : (value) => {
        const raw = sanitizeNumber(value);
        if (!raw) return '';
        return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      };
  const currencyFormatter = new Intl.NumberFormat('id-ID');
  const defaultCompanyName = typeof ambis.getBrandName === 'function'
    ? ambis.getBrandName()
    : (ambis.brandName || '');
  const accountMap = new Map();
  const accountDisplayList = [];

  const digitsOnly = (value = '') => value.replace(/\D+/g, '');

  const HISTORY_DRAWER_WIDTH = 420;
  const HISTORY_TIMEZONE = 'Asia/Jakarta';
  const HISTORY_DATE_FORMAT = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: HISTORY_TIMEZONE,
  });
  const HISTORY_TIME_FORMAT = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: HISTORY_TIMEZONE,
  });

  function prepareHistoryEntry(entry = {}) {
    const prepared = { ...entry };
    const date = entry && entry.datetime ? new Date(entry.datetime) : null;
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      prepared.date = date;
      prepared.dateValue = date.getTime();
    } else {
      prepared.date = null;
      prepared.dateValue = null;
    }
    return prepared;
  }

  const HISTORY_DATA = {
    processing: [
      prepareHistoryEntry({
        id: 'INV-20250802-001',
        service: 'Token Listrik',
        description: 'Token listrik 20 kWh',
        customer: 'Gudang Jakarta',
        account: 'Rekening Operasional • 9021 3344 5566',
        category: 'Listrik',
        amount: 250000,
        datetime: '2025-08-02T09:30:00+07:00',
        badge: { label: 'Sedang Diproses', className: 'bg-amber-100 text-amber-600' },
        note: 'Menunggu konfirmasi PLN sebelum token diterbitkan.',
      }),
      prepareHistoryEntry({
        id: 'INV-20250801-003',
        service: 'BPJS Kesehatan Badan Usaha',
        description: 'Pembayaran iuran bulan Agustus 2025',
        customer: 'CV Andalas',
        account: 'Rekening Operasional • 9021 7777 8899',
        category: 'BPJS',
        amount: 510000,
        datetime: '2025-08-01T15:20:00+07:00',
        badge: { label: 'Menunggu Persetujuan', className: 'bg-cyan-100 text-cyan-600' },
        note: 'Menunggu persetujuan pejabat berwenang.',
      }),
      prepareHistoryEntry({
        id: 'INV-20250730-009',
        service: 'Pembayaran Internet',
        description: 'Tagihan IndiHome Juli 2025',
        customer: 'Kantor Utama',
        account: 'Rekening Payroll • 9011 2233 4455',
        category: 'Internet',
        amount: 385000,
        datetime: '2025-07-30T10:45:00+07:00',
        badge: { label: 'Sedang Diproses', className: 'bg-amber-100 text-amber-600' },
        note: 'Provider sedang memvalidasi pembayaran.',
      }),
    ],
    completed: [
      prepareHistoryEntry({
        id: 'INV-20250729-008',
        service: 'Transfer Vendor',
        description: 'Pembayaran ke PT Elektron Nusantara',
        customer: 'PT Elektron Nusantara',
        account: 'Rekening Operasional • 9021 3344 5566',
        category: 'Transfer',
        amount: 17500000,
        datetime: '2025-07-29T11:10:00+07:00',
        badge: { label: 'Berhasil', className: 'bg-emerald-100 text-emerald-600' },
        note: 'Dana telah diterima oleh bank tujuan.',
      }),
      prepareHistoryEntry({
        id: 'INV-20250728-004',
        service: 'Tagihan Listrik',
        description: 'Tagihan PLN Kantor Pusat',
        customer: 'Kantor Pusat',
        account: 'Rekening Operasional • 9021 3344 5566',
        category: 'Tagihan',
        amount: 2250000,
        datetime: '2025-07-28T09:05:00+07:00',
        badge: { label: 'Berhasil', className: 'bg-emerald-100 text-emerald-600' },
        note: 'Transaksi selesai dan tersimpan di Riwayat.',
      }),
      prepareHistoryEntry({
        id: 'INV-20250725-002',
        service: 'Top-up E-Wallet',
        description: 'Top-up OVO Corporate',
        customer: 'OVO Corporate',
        account: 'Rekening Operasional • 9021 6677 8899',
        category: 'Top-up',
        amount: 1500000,
        datetime: '2025-07-25T17:25:00+07:00',
        badge: { label: 'Berhasil', className: 'bg-emerald-100 text-emerald-600' },
        note: 'Saldo sudah masuk ke akun OVO Corporate.',
      }),
    ],
  };

  function formatHistoryDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '-';
    const datePart = HISTORY_DATE_FORMAT.format(date);
    const timePart = HISTORY_TIME_FORMAT.format(date);
    return `${datePart} • ${timePart} WIB`;
  }

  const DEFAULT_VALIDATION = {
    sanitize: digitsOnly,
    pattern: /^\d{6,20}$/,
    minLength: 6,
    maxLength: 20,
    message: 'ID Pelanggan harus terdiri dari 6-20 digit.',
    inputmode: 'numeric',
  };

  const BILLER_CONFIG = {
    'token-listrik': {
      title: 'Token Listrik',
      notes: [
        'Cek limit kWH sebelum melakukan transaksi PLN prabayar.',
        'Sesuai dengan kebijakan PLN, transaksi tidak dapat dilakukan 22:45 – 01:00 WIB.',
      ],
      idCopy: 'ID Pelanggan / Nomor Meter',
      idHint: 'Gunakan ID Pelanggan atau Nomor Meter yang sesuai.',
      validation: {
        pattern: /^\d{11}$/,
        minLength: 11,
        maxLength: 11,
        message: 'ID Pelanggan / Nomor Meter harus terdiri dari 11 digit.',
      },
    },
    'tagihan-listrik': {
      title: 'Tagihan Listrik',
      notes: [
        'Pembayaran tagihan listrik di atas tanggal 20 akan dikenakan denda oleh PLN.',
        'Transaksi tidak dapat dilakukan 22:45 – 01:00 WIB.',
      ],
      idCopy: 'ID Pelanggan / Nomor Meter',
      idHint: 'Gunakan ID Pelanggan atau Nomor Meter yang sesuai.',
      validation: {
        pattern: /^\d{11}$/,
        minLength: 11,
        maxLength: 11,
        message: 'ID Pelanggan / Nomor Meter harus terdiri dari 11 digit.',
      },
    },
    indihome: {
      title: 'IndiHome',
      notes: [
        'Produk IndiHome tidak tersedia pada jam cut off/maintenance (23:30 – 01:30).',
        'Khusus pelanggan Speedy, pelunasan bisa via IndiHome.',
      ],
      idCopy: 'ID Pelanggan',
      idHint: 'Masukkan ID Pelanggan IndiHome.',
      validation: {
        pattern: /^\d{6,16}$/,
        minLength: 6,
        maxLength: 16,
        message: 'ID Pelanggan harus terdiri dari 6-16 digit.',
      },
    },
    myrepublic: {
      title: 'MyRepublic',
      notes: [
        'Tidak tersedia pada jam cut off/maintenance (23:50 – 00:00).',
        'Belum mendukung pembayaran corporate.',
      ],
      idCopy: 'ID Pelanggan',
      idHint: 'Masukkan ID Pelanggan MyRepublic.',
      validation: {
        pattern: /^\d{6,16}$/,
        minLength: 6,
        maxLength: 16,
        message: 'ID Pelanggan harus terdiri dari 6-16 digit.',
      },
    },
    cbn: {
      title: 'CBN',
      notes: ['Transaksi butuh waktu proses maksimal 1x24 jam hari kerja.'],
      idCopy: 'ID Pelanggan',
      idHint: 'Masukkan ID Pelanggan CBN.',
    },
    iconnet: {
      title: 'Iconnet',
      notes: [],
      idCopy: 'ID Pelanggan',
      idHint: 'Masukkan ID Pelanggan Iconnet.',
    },
    'bpjs-keluarga': {
      title: 'BPJS Kesehatan Keluarga',
      notes: ['Nomor virtual account = 88888 + 11 digit terakhir dari nomor kartu BPJS Kesehatan.'],
      idCopy: 'Nomor Virtual Account',
      idHint: 'Gunakan 88888 + 11 digit terakhir nomor kartu BPJS.',
      validation: {
        pattern: /^\d{16}$/,
        minLength: 16,
        maxLength: 16,
        message: 'Nomor Virtual Account harus terdiri dari 16 digit.',
      },
    },
    'bpjs-badan-usaha': {
      title: 'BPJS Kesehatan Badan Usaha',
      notes: ['Nomor virtual account mengikuti ketentuan BPJS Kesehatan Badan Usaha (88888 + 11 digit terakhir nomor peserta).'],
      idCopy: 'Nomor Virtual Account',
      idHint: 'Gunakan 88888 + 11 digit terakhir nomor peserta.',
      validation: {
        pattern: /^\d{16}$/,
        minLength: 16,
        maxLength: 16,
        message: 'Nomor Virtual Account harus terdiri dari 16 digit.',
      },
    },
    'bpjstk-penerima-upah': {
      title: 'BPJSTK Penerima Upah',
      notes: ['Nomor virtual account mengikuti ketentuan BPJS Ketenagakerjaan (88888 + 11 digit terakhir nomor peserta).'],
      idCopy: 'ID Pelanggan',
      idHint: 'Masukkan ID Pelanggan BPJSTK.',
      validation: {
        pattern: /^\d{6,16}$/,
        minLength: 6,
        maxLength: 16,
        message: 'ID Pelanggan harus terdiri dari 6-16 digit.',
      },
    },
    'bpjstk-bukan-penerima-upah': {
      title: 'BPJSTK Bukan Penerima Upah',
      notes: ['Nomor virtual account mengikuti ketentuan BPJS Ketenagakerjaan (88888 + 11 digit terakhir nomor peserta).'],
      idCopy: 'ID Pelanggan',
      idHint: 'Masukkan ID Pelanggan BPJSTK.',
      validation: {
        pattern: /^\d{6,16}$/,
        minLength: 6,
        maxLength: 16,
        message: 'ID Pelanggan harus terdiri dari 6-16 digit.',
      },
    },
  };

  const SAVED_NUMBERS = {
    'token-listrik': [
      { id: '45093051325', name: 'Ramero Carlo' },
      { id: '0992837566', name: 'Bill Listeria' },
      { id: '88771288234', name: 'Gudang Jakarta' },
    ],
    'tagihan-listrik': [
      { id: '56009800321', name: 'CV Andalas' },
      { id: '88771288234', name: 'Rumah Utama' },
      { id: '66781200345', name: 'Toko Sore' },
    ],
    indihome: [
      { id: '120034556788', name: 'Cabang Bandung' },
      { id: '120034556799', name: 'Ruko Merpati' },
    ],
    myrepublic: [
      { id: '8899322001', name: 'Kantor Utama' },
      { id: '8899322002', name: 'Gudang Utama' },
    ],
    cbn: [
      { id: '7788200345', name: 'CBN Operasional' },
    ],
    iconnet: [
      { id: '223300145678', name: 'Iconnet Lantai 3' },
    ],
    'bpjs-keluarga': [
      { id: '8888800123456789', name: 'BPJS Keluarga Utama' },
    ],
    'bpjs-badan-usaha': [
      { id: '8888800456123789', name: 'BPJS Badan Usaha' },
    ],
    'bpjstk-penerima-upah': [
      { id: '888880011223', name: 'BPJSTK Karyawan' },
    ],
    'bpjstk-bukan-penerima-upah': [
      { id: '888880099887', name: 'BPJSTK Mandiri' },
    ],
  };

  const PAYMENT_DETAILS = {
    'token-listrik': {
      type: 'pembelian',
      displayName: 'Token Listrik',
      customerName: 'Gudang Jakarta',
      dynamic: [
        { label: 'Tarif/Daya', value: 'R2 / 4400 VA' },
      ],
      amounts: {
        nominal: 200000,
        admin: 2500,
      },
      cta: 'Bayar Token Listrik',
    },
    'tagihan-listrik': {
      type: 'pembayaran',
      displayName: 'Tagihan Listrik',
      customerName: 'CV Andalas',
      dynamic: [
        { label: 'Tarif/Daya', value: 'R2 / 4400 VA' },
        { label: 'Jumlah Bulan', value: '2' },
        { label: 'Bulan Tagihan', value: 'Juli & Agustus 2025' },
      ],
      amounts: {
        nominal: 875000,
        admin: 2500,
      },
      cta: 'Bayar Listrik',
    },
    indihome: {
      type: 'pembayaran',
      displayName: 'IndiHome',
      customerName: 'Cabang Bandung',
      dynamic: [],
      amounts: {
        nominal: 480000,
        admin: 2000,
      },
      cta: 'Bayar IndiHome',
    },
    myrepublic: {
      type: 'pembayaran',
      displayName: 'MyRepublic',
      customerName: 'Kantor Utama',
      dynamic: [],
      amounts: {
        nominal: 550000,
        admin: 2500,
      },
      cta: 'Bayar MyRepublic',
    },
    cbn: {
      type: 'pembayaran',
      displayName: 'CBN',
      customerName: 'CBN Operasional',
      dynamic: [],
      amounts: {
        nominal: 610000,
        admin: 2500,
      },
      cta: 'Bayar CBN',
    },
    iconnet: {
      type: 'pembayaran',
      displayName: 'Iconnet',
      customerName: 'Iconnet Lantai 3',
      dynamic: [],
      amounts: {
        nominal: 425000,
        admin: 2500,
      },
      cta: 'Bayar Iconnet',
    },
    'bpjs-keluarga': {
      type: 'pembayaran',
      displayName: 'BPJS Kesehatan Keluarga',
      customerName: 'Keluarga Hartono',
      dynamic: [
        { label: 'Jumlah Keluarga', value: '3' },
      ],
      amounts: {
        nominal: 150000,
        admin: 2500,
      },
      cta: 'Bayar BPJS',
    },
    'bpjs-badan-usaha': {
      type: 'pembayaran',
      displayName: 'BPJS Kesehatan Badan Usaha',
      customerName: 'PT Maju Lancar',
      dynamic: [
        { label: 'Jumlah Karyawan', value: '60' },
      ],
      amounts: {
        nominal: 2500000,
        admin: 5000,
      },
      cta: 'Bayar BPJS',
    },
    'bpjstk-penerima-upah': {
      type: 'pembayaran',
      displayName: 'BPJSTK Penerima Upah',
      customerName: 'PT Sentosa Prima',
      dynamic: [
        { label: 'Tagihan', value: 'Juli 2025' },
      ],
      amounts: {
        nominal: 3500000,
        admin: 5000,
      },
      cta: 'Bayar BPJSTK',
    },
    'bpjstk-bukan-penerima-upah': {
      type: 'pembayaran',
      displayName: 'BPJSTK Bukan Penerima Upah',
      customerName: 'Bimo Santosa',
      dynamic: [
        { label: 'Tagihan', value: 'Juli 2025' },
        { label: 'Tanggal Lahir', value: '2 Februari 2000' },
        { label: 'Alamat Personal', value: 'Jl Kejora 24' },
        { label: 'Alamat Kantor Cabang', value: 'Ciracas' },
        { label: 'Upah', value: 'Rp7.200.000' },
        { label: 'Program', value: 'JKK + JKM' },
      ],
      amounts: {
        nominal: 750000,
        admin: 3500,
      },
      cta: 'Bayar BPJSTK',
    },
  };

  function mergeValidation(config) {
    if (!config || !config.validation) {
      return { ...DEFAULT_VALIDATION };
    }
    return { ...DEFAULT_VALIDATION, ...config.validation };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const historyDrawer = document.getElementById('historyDrawer');
    const historyDrawerContent = document.getElementById('historyDrawerContent');
    const openHistoryDrawerBtn = document.getElementById('openHistoryDrawerBtn');
    const historyDrawerCloseBtn = document.getElementById('historyDrawerCloseBtn');
    const historyList = document.getElementById('historyList');
    const historyEmptyState = document.getElementById('historyEmptyState');
    const historyErrorBanner = document.getElementById('historyErrorBanner');
    const historyRetryBtn = document.getElementById('historyErrorRetry');
    const historyTabs = Array.from(document.querySelectorAll('[data-history-tab]'));
    const historyFilterGroup = document.querySelector('[data-filter-group="history"]');

    const historyState = {
      activeTab: 'processing',
      filters: { date: { type: 'all' }, category: null },
      error: false,
    };

    let historyDrawerOpen = false;
    let historyCloseFallback = null;
    let lastHistoryTrigger = null;

    function initializeHistoryFilters() {
      if (!historyFilterGroup) return;
      const dateFilter = historyFilterGroup.querySelector('[data-filter="date"]');
      const categoryFilter = historyFilterGroup.querySelector('[data-filter="category"]');
      if (dateFilter) {
        dateFilter.dataset.default = 'Semua Tanggal';
        const label = dateFilter.querySelector('.filter-label');
        if (label) label.textContent = 'Semua Tanggal';
        if (typeof dateFilter._setTriggerState === 'function') {
          dateFilter._setTriggerState(Boolean(dateFilter.dataset.applied));
        }
      }
      if (categoryFilter) {
        categoryFilter.dataset.default = 'Semua Kategori';
        const label = categoryFilter.querySelector('.filter-label');
        if (label) label.textContent = 'Semua Kategori';
        if (typeof categoryFilter._setTriggerState === 'function') {
          categoryFilter._setTriggerState(Boolean(categoryFilter.dataset.applied));
        }
      }
    }

    function resetHistoryFilters() {
      if (!historyFilterGroup) return;
      const filters = historyFilterGroup.querySelectorAll('.filter');
      filters.forEach((filter) => {
        if (filter.dataset.filter === 'date') {
          filter.dataset.default = 'Semua Tanggal';
        } else if (filter.dataset.filter === 'category') {
          filter.dataset.default = 'Semua Kategori';
        }
        filter.dataset.applied = '';
        const label = filter.querySelector('.filter-label');
        const defaultLabel = filter.dataset.default || filter.dataset.name || '';
        if (label) label.textContent = defaultLabel;
        const inputs = filter.querySelectorAll('input');
        inputs.forEach((input) => {
          if (input.type === 'radio' || input.type === 'checkbox') {
            const shouldCheck =
              (filter.dataset.filter === 'date' && input.value === 'Semua Tanggal') ||
              (filter.dataset.filter === 'category' && input.value === 'Semua Kategori');
            input.checked = shouldCheck;
          } else {
            input.value = '';
            if (input.dataset && input.dataset.isoValue) {
              delete input.dataset.isoValue;
            }
            if (input._airDatepicker && typeof input._airDatepicker.clear === 'function') {
              input._airDatepicker.clear();
              if (typeof input._airDatepicker.update === 'function') {
                input._airDatepicker.update({ minDate: null, maxDate: null });
              }
            }
          }
        });
        const customRange = filter.querySelector('.custom-range');
        if (customRange) {
          customRange.classList.add('hidden');
        }
        if (typeof filter._setTriggerState === 'function') {
          filter._setTriggerState(false);
        }
        if (typeof filter._ensureDefaultDateSelection === 'function') {
          filter._ensureDefaultDateSelection();
        }
      });
      historyState.filters = { date: { type: 'all' }, category: null };
    }

    function parseDateFilter(value) {
      if (!value || value === 'Semua Tanggal') {
        return { type: 'all' };
      }
      if (value.startsWith('custom:')) {
        const payload = value.slice(7).split('|');
        const startIso = payload[0];
        const endIso = payload[1];
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (startDate instanceof Date && endDate instanceof Date && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return { type: 'range', start: start.getTime(), end: end.getTime() };
        }
        return { type: 'all' };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      if (value === 'Hari ini') {
        return { type: 'range', start: today.getTime(), end: endOfToday.getTime() };
      }
      if (value === '7 Hari Terakhir') {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return { type: 'range', start: start.getTime(), end: endOfToday.getTime() };
      }
      if (value === '30 Hari Terakhir') {
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return { type: 'range', start: start.getTime(), end: endOfToday.getTime() };
      }
      return { type: 'all' };
    }

    function getHistoryFilters() {
      const result = { date: { type: 'all' }, category: null };
      if (!historyFilterGroup) return result;
      const dateFilter = historyFilterGroup.querySelector('[data-filter="date"]');
      const categoryFilter = historyFilterGroup.querySelector('[data-filter="category"]');
      if (dateFilter) {
        const applied = dateFilter.dataset.applied || '';
        result.date = parseDateFilter(applied);
      }
      if (categoryFilter) {
        const applied = categoryFilter.dataset.applied || '';
        result.category = applied && applied !== 'Semua Kategori' ? applied : null;
      }
      return result;
    }

    function createHistoryCard(entry) {
      const container = document.createElement('div');
      container.className = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 focus-within:border-cyan-300';
      if (entry.id) {
        container.dataset.historyTransaction = entry.id;
      }

      const topRow = document.createElement('div');
      topRow.className = 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between';

      const left = document.createElement('div');
      left.className = 'space-y-2';
      if (entry.category) {
        const categoryPill = document.createElement('span');
        categoryPill.className = 'inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600';
        categoryPill.textContent = entry.category;
        left.appendChild(categoryPill);
      }

      const title = document.createElement('p');
      title.className = 'text-base font-semibold text-slate-900';
      title.textContent = entry.service || 'Transaksi';
      left.appendChild(title);

      if (entry.description) {
        const description = document.createElement('p');
        description.className = 'text-sm text-slate-500';
        description.textContent = entry.description;
        left.appendChild(description);
      }

      if (entry.id) {
        const idLine = document.createElement('p');
        idLine.className = 'text-sm text-slate-500';
        idLine.textContent = `ID Transaksi: ${entry.id}`;
        left.appendChild(idLine);
      }

      if (entry.customer) {
        const customerLine = document.createElement('p');
        customerLine.className = 'text-sm text-slate-500';
        customerLine.textContent = entry.customer;
        left.appendChild(customerLine);
      }

      if (entry.account) {
        const accountLine = document.createElement('p');
        accountLine.className = 'text-sm text-slate-500';
        accountLine.textContent = entry.account;
        left.appendChild(accountLine);
      }

      const right = document.createElement('div');
      right.className = 'space-y-2 text-right';
      if (typeof entry.amount === 'number' && Number.isFinite(entry.amount)) {
        const amount = document.createElement('p');
        amount.className = 'text-base font-semibold text-slate-900';
        amount.textContent = `Rp${currencyFormatter.format(entry.amount)}`;
        right.appendChild(amount);
      }

      if (entry.badge && entry.badge.label) {
        const badge = document.createElement('span');
        badge.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${entry.badge.className || ''}`.trim();
        badge.textContent = entry.badge.label;
        right.appendChild(badge);
      }

      if (entry.date) {
        const dateLine = document.createElement('p');
        dateLine.className = 'text-xs text-slate-500';
        dateLine.textContent = formatHistoryDate(entry.date);
        right.appendChild(dateLine);
      }

      topRow.appendChild(left);
      topRow.appendChild(right);
      container.appendChild(topRow);

      if (entry.note) {
        const note = document.createElement('p');
        note.className = 'mt-4 text-sm text-slate-600';
        note.textContent = entry.note;
        container.appendChild(note);
      }

      return container;
    }

    function renderHistoryList() {
      if (!historyList || !historyEmptyState) return;
      historyList.innerHTML = '';
      const filters = getHistoryFilters();
      historyState.filters = filters;

      if (historyState.error) {
        if (historyErrorBanner) historyErrorBanner.classList.remove('hidden');
        historyEmptyState.classList.add('hidden');
        return;
      }

      if (historyErrorBanner) historyErrorBanner.classList.add('hidden');

      const dataset = Array.isArray(HISTORY_DATA[historyState.activeTab]) ? HISTORY_DATA[historyState.activeTab] : [];
      const filtered = dataset.filter((entry) => {
        if (!entry) return false;
        if (filters.category && entry.category !== filters.category) return false;
        if (filters.date && filters.date.type === 'range') {
          if (typeof entry.dateValue !== 'number') return false;
          if (entry.dateValue < filters.date.start || entry.dateValue > filters.date.end) return false;
        }
        return true;
      });

      if (!filtered.length) {
        historyEmptyState.classList.remove('hidden');
        return;
      }

      historyEmptyState.classList.add('hidden');
      const fragment = document.createDocumentFragment();
      filtered.forEach((entry) => {
        fragment.appendChild(createHistoryCard(entry));
      });
      historyList.appendChild(fragment);
    }

    function setHistoryActiveTab(target) {
      const normalized = target === 'completed' ? 'completed' : 'processing';
      historyState.activeTab = normalized;
      historyTabs.forEach((tab) => {
        const isActive = tab.dataset.historyTab === normalized;
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.classList.toggle('bg-white', isActive);
        tab.classList.toggle('text-slate-900', isActive);
        tab.classList.toggle('shadow-sm', isActive);
        tab.classList.toggle('text-slate-500', !isActive);
        tab.classList.toggle('hover:text-slate-700', !isActive);
      });
      renderHistoryList();
    }

    function closeHistoryDrawer({ focusTrigger = true } = {}) {
      if (!historyDrawer || !historyDrawerOpen) return;
      historyDrawerOpen = false;
      historyDrawer.setAttribute('aria-hidden', 'true');

      const finalizeClose = () => {
        if (historyCloseFallback) {
          clearTimeout(historyCloseFallback);
          historyCloseFallback = null;
        }
        historyDrawer.style.width = '0px';
        historyDrawer.classList.add('pointer-events-none');
        if (focusTrigger && lastHistoryTrigger && typeof lastHistoryTrigger.focus === 'function') {
          try {
            lastHistoryTrigger.focus();
          } catch (err) {
            // Ignore focus errors.
          }
        }
      };

      if (historyDrawerContent) {
        historyDrawerContent.classList.remove('opacity-100');
        historyDrawerContent.classList.add('opacity-0', 'translate-x-full');
        const handleTransitionEnd = (event) => {
          if (event.target !== historyDrawerContent) return;
          finalizeClose();
        };
        historyDrawerContent.addEventListener('transitionend', handleTransitionEnd, { once: true });
        historyCloseFallback = window.setTimeout(finalizeClose, 400);
      } else {
        finalizeClose();
      }
    }

    function openHistoryDrawer() {
      if (!historyDrawer || historyDrawerOpen) return;
      historyDrawerOpen = true;
      historyState.error = false;
      if (historyCloseFallback) {
        clearTimeout(historyCloseFallback);
        historyCloseFallback = null;
      }
      historyDrawer.classList.remove('pointer-events-none');
      historyDrawer.setAttribute('aria-hidden', 'false');
      historyDrawer.style.width = `${HISTORY_DRAWER_WIDTH}px`;
      if (historyDrawerContent) {
        requestAnimationFrame(() => {
          historyDrawerContent.classList.remove('translate-x-full', 'opacity-0');
          historyDrawerContent.classList.add('opacity-100');
        });
      }
      resetHistoryFilters();
      setHistoryActiveTab('processing');
      window.setTimeout(() => {
        if (historyDrawerCloseBtn && typeof historyDrawerCloseBtn.focus === 'function') {
          try {
            historyDrawerCloseBtn.focus();
          } catch (err) {
            // Ignore focus errors.
          }
        }
      }, 250);
    }

    function handleHistoryRetry() {
      historyState.error = false;
      renderHistoryList();
    }

    initializeHistoryFilters();
    setHistoryActiveTab(historyState.activeTab);

    if (openHistoryDrawerBtn) {
      openHistoryDrawerBtn.addEventListener('click', () => {
        lastHistoryTrigger = openHistoryDrawerBtn;
        openHistoryDrawer();
      });
    }

    if (historyDrawerCloseBtn) {
      historyDrawerCloseBtn.addEventListener('click', () => closeHistoryDrawer());
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && historyDrawerOpen) {
        closeHistoryDrawer();
      }
    });

    historyTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.historyTab || 'processing';
        setHistoryActiveTab(targetTab);
      });
    });

    document.addEventListener('filter-change', (event) => {
      if (!event || !event.detail || event.detail.groupId !== 'history') return;
      renderHistoryList();
    });

    if (historyRetryBtn) {
      historyRetryBtn.addEventListener('click', handleHistoryRetry);
    }

    const drawer = document.getElementById('drawer');
    const drawerInner = document.getElementById('drawerInner');
    const drawerTitle = document.getElementById('drawerTitle');
    const notesList = document.getElementById('drawerNotes');
    const notesEmpty = document.getElementById('drawerNotesEmpty');
    const idLabel = document.getElementById('idInputLabel');
    const idHint = document.getElementById('idInputHint');
    const idInput = document.getElementById('billerIdInput');
    const idError = document.getElementById('idInputError');
    const accountNameEl = document.getElementById('sourceAccountName');
    const accountSubtitleEl = document.getElementById('sourceAccountSubtitle');
    const accountPlaceholderEl = document.getElementById('sourceAccountPlaceholder');
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const savedBtn = document.getElementById('savedNumberButton');

    const paymentSheetOverlay = document.getElementById('paymentSheetOverlay');
    const paymentBottomSheet = document.getElementById('paymentBottomSheet');
    const paymentSheetClose = document.getElementById('paymentSheetClose');
    const paymentSheetCancel = document.getElementById('paymentSheetCancel');
    const paymentSheetConfirm = document.getElementById('paymentSheetConfirm');
    const paymentSheetTitle = document.getElementById('paymentSheetTitle');
    const paymentSheetAccountValue = document.getElementById('paymentSheetAccountValue');
    const paymentSheetIdLabel = document.getElementById('paymentSheetIdLabel');
    const paymentSheetIdValue = document.getElementById('paymentSheetIdValue');
    const paymentSheetCustomerName = document.getElementById('paymentSheetCustomerName');
    const paymentSheetDynamicSection = document.getElementById('paymentSheetDynamicSection');
    const paymentSheetNominal = document.getElementById('paymentSheetNominal');
    const paymentSheetAdmin = document.getElementById('paymentSheetAdmin');
    const paymentSheetTotal = document.getElementById('paymentSheetTotal');
    const moveSourceButton = document.getElementById('moveSourceButton');
    const accountSheetOverlay = document.getElementById('sheetOverlay');
    const accountBottomSheet = document.getElementById('bottomSheet');
    const accountSheetClose = document.getElementById('sheetClose');
    const accountSheetCancel = document.getElementById('sheetCancel');
    const accountSheetConfirm = document.getElementById('sheetConfirm');
    const accountSheetList = document.getElementById('sheetList');
    const savedDisplay = document.getElementById('savedNumberDisplay');
    const savedSheetOverlay = document.getElementById('savedSheetOverlay');
    const savedBottomSheet = document.getElementById('savedBottomSheet');
    const savedSheetClose = document.getElementById('savedSheetClose');
    const savedSheetCancel = document.getElementById('savedSheetCancel');
    const savedSheetConfirm = document.getElementById('savedSheetConfirm');
    const savedSheetList = document.getElementById('savedSheetList');
    const savedSheetEmpty = document.getElementById('savedSheetEmpty');
    const paymentOtpSection = document.getElementById('paymentOtpSection');
    const paymentOtpInputs = paymentOtpSection ? Array.from(paymentOtpSection.querySelectorAll('.otp-input')) : [];
    const paymentOtpCountdown = document.getElementById('paymentOtpCountdown');
    const paymentOtpCountdownMessage = document.getElementById('paymentOtpCountdownMessage');
    const paymentOtpTimer = document.getElementById('paymentOtpTimer');
    const paymentOtpResend = document.getElementById('paymentOtpResend');
    const paymentOtpError = document.getElementById('paymentOtpError');
    const successDrawer = document.getElementById('paymentSuccessDrawer');
    const successDrawerInner = document.getElementById('paymentSuccessInner');
    const successHeaderClose = document.getElementById('successDrawerHeaderClose');
    const successCloseButton = document.getElementById('successDrawerCloseButton');
    const successStatusButton = document.getElementById('successDrawerStatusButton');
    const successHeroTitle = document.getElementById('successHeroTitle');
    const successHeroCategory = document.getElementById('successHeroCategory');
    const successHeroSubtitle = document.getElementById('successHeroSubtitle');
    const successPaymentLabel = document.getElementById('successPaymentLabel');
    const successPaymentValue = document.getElementById('successPaymentValue');
    const successAccountValue = document.getElementById('successAccountValue');
    const successIdLabel = document.getElementById('successIdLabel');
    const successIdValue = document.getElementById('successIdValue');
    const successCustomerName = document.getElementById('successCustomerName');
    const successDynamicSection = document.getElementById('successDynamicSection');
    const successStatusPill = document.getElementById('successStatusPill');
    const successNominal = document.getElementById('successNominal');
    const successAdmin = document.getElementById('successAdmin');
    const successTotal = document.getElementById('successTotal');
    const successStatusButtonDefaultText = successStatusButton?.textContent?.trim() || 'Cek Status';
    const billerButtons = document.querySelectorAll('[data-biller]');

    function normaliseAccount(account, index) {
      if (!account) return null;
      const id = account.id || account.accountId || account.numberRaw || account.number || `acc-${index}`;
      const displayName = account.displayName || account.name || account.alias || `Rekening ${index + 1}`;
      const shortName = typeof account.name === 'string' && account.name.trim()
        ? account.name.trim()
        : displayName;
      const numberSource = account.numberRaw || account.number || '';
      const numberRaw = sanitizeNumber(numberSource);
      const formattedNumber = numberRaw ? formatAccountNumber(numberRaw) : formatAccountNumber(numberSource) || '';
      const bank = typeof account.bank === 'string' ? account.bank.trim() : '';
      const company = (typeof account.company === 'string' && account.company.trim())
        || (typeof account.brandName === 'string' && account.brandName.trim())
        || defaultCompanyName
        || '';
      const subtitleParts = [];
      if (company) subtitleParts.push(company);
      const bankSubtitleParts = [];
      if (bank) bankSubtitleParts.push(bank);
      if (formattedNumber) bankSubtitleParts.push(formattedNumber);
      if (bankSubtitleParts.length) {
        subtitleParts.push(bankSubtitleParts.join(' - '));
      } else if (formattedNumber) {
        subtitleParts.push(formattedNumber);
      }
      const subtitle = subtitleParts.join(' • ');

      const color = (typeof account.color === 'string' && account.color.trim())
        ? account.color.trim()
        : 'bg-cyan-100 text-cyan-600';
      const initialSource = (typeof account.initial === 'string' && account.initial.trim())
        ? account.initial.trim()
        : (displayName || '').toString().trim();
      const initial = initialSource ? initialSource.charAt(0).toUpperCase() : 'R';

      return {
        id,
        displayName,
        name: shortName,
        company,
        bank,
        subtitle,
        number: formattedNumber,
        numberRaw,
        balance: account.balance,
        color,
        initial,
      };
    }

    function getAvailableAccounts() {
      if (typeof ambis.getAccounts === 'function') {
        const result = ambis.getAccounts({ clone: false });
        if (Array.isArray(result)) {
          return result;
        }
      }
      if (Array.isArray(ambis.accounts)) {
        return ambis.accounts;
      }
      return [];
    }

    function rebuildAccountCollections() {
      accountMap.clear();
      accountDisplayList.length = 0;
      const accounts = getAvailableAccounts();
      accounts.forEach((account, index) => {
        const normalised = normaliseAccount(account, index);
        if (!normalised) return;
        accountMap.set(normalised.id, normalised);
        accountDisplayList.push(normalised);
      });
      let selectionChanged = false;
      if (appliedAccountId && !accountMap.has(appliedAccountId)) {
        appliedAccountId = '';
        selectionChanged = true;
      }
      if (pendingAccountId && !accountMap.has(pendingAccountId)) {
        pendingAccountId = appliedAccountId;
      }
      return selectionChanged;
    }

    function applyAccountSelection(nextId) {
      const resolvedId = accountMap.has(nextId) ? nextId : '';
      appliedAccountId = resolvedId;
      pendingAccountId = resolvedId;
      const account = resolvedId ? accountMap.get(resolvedId) : null;

      if (accountPlaceholderEl) {
        accountPlaceholderEl.classList.toggle('hidden', Boolean(account));
      }
      if (accountNameEl) {
        if (account) {
          const nickname = account.name || account.displayName || '';
          accountNameEl.textContent = nickname;
          accountNameEl.classList.remove('hidden');
        } else {
          accountNameEl.textContent = '';
          accountNameEl.classList.add('hidden');
        }
      }
      if (accountSubtitleEl) {
        if (account) {
          const accountNumber = account.number || formatAccountNumber(account.numberRaw) || '';
          accountSubtitleEl.textContent = accountNumber;
          accountSubtitleEl.classList.toggle('hidden', !accountNumber);
        } else {
          accountSubtitleEl.textContent = '';
          accountSubtitleEl.classList.add('hidden');
        }
      }

      updateConfirmState();
    }

    const SHEET_SELECTED_CLASSES = ['bg-cyan-50'];

    function formatAccountBalance(balance) {
      if (typeof balance === 'number' && Number.isFinite(balance)) {
        return `Rp${currencyFormatter.format(balance)}`;
      }
      if (typeof balance === 'string' && balance.trim()) {
        return balance;
      }
      return 'Rp0';
    }

    function resolveRadioDotClass() {
      return 'bg-cyan-500';
    }

    function renderAccountOptions(selectedId) {
      if (!accountSheetList) return;
      const items = accountDisplayList.map((account) => {
        const avatarClasses = account.color || 'bg-cyan-100 text-cyan-600';
        const radioDotClass = resolveRadioDotClass();
        const isSelected = account.id === selectedId;
        const selectedClasses = isSelected ? ` ${SHEET_SELECTED_CLASSES.join(' ')}` : '';
        const checkedAttr = isSelected ? ' checked' : '';
        const metaLines = [];
        if (account.company) {
          metaLines.push(`<p class="text-sm text-slate-500">${account.company}</p>`);
        }
        const bankNumberParts = [];
        if (account.bank) bankNumberParts.push(account.bank);
        if (account.number) bankNumberParts.push(account.number);
        if (bankNumberParts.length) {
          metaLines.push(`<p class="text-sm text-slate-500">${bankNumberParts.join(' - ')}</p>`);
        }
        const metaMarkup = metaLines.length
          ? `<div class="space-y-1">${metaLines.join('')}</div>`
          : '';
        return `
      <li>
        <label data-account-id="${account.id}" class="sheet-item w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-within:bg-slate-50 rounded-2xl cursor-pointer${selectedClasses}">
          <input type="radio" class="sr-only" name="sheetAccountOption" value="${account.id}"${checkedAttr}>
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold ${avatarClasses}">
            ${account.initial || 'R'}
          </div>

          <!-- Account info -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-base text-slate-900 truncate">${account.name || account.displayName || 'Rekening'}</p>
            ${metaMarkup}
          </div>

          <!-- Balance -->
          <div class="text-sm font-semibold text-slate-900 whitespace-nowrap mr-2">
            ${formatAccountBalance(account.balance)}
          </div>

          <!-- Custom radio -->
          <span class="ml-2 w-5 h-5 rounded-full border border-slate-300 grid place-items-center">
            <span class="radio-dot w-2 h-2 rounded-full ${radioDotClass} ${isSelected ? '' : 'hidden'}"></span>
          </span>
        </label>
      </li>`;
      });
      accountSheetList.innerHTML = items.join('');
    }

    function setAccountSheetConfirmState(enabled) {
      if (!accountSheetConfirm) return;
      accountSheetConfirm.disabled = !enabled;
      accountSheetConfirm.classList.toggle('opacity-50', !enabled);
      accountSheetConfirm.classList.toggle('cursor-not-allowed', !enabled);
      accountSheetConfirm.classList.toggle('hover:bg-cyan-600', enabled);
    }

    function openAccountSheet() {
      if (!moveSourceButton || !accountSheetOverlay || !accountBottomSheet) return;
      const selectionChanged = rebuildAccountCollections();
      if (selectionChanged || appliedAccountId || !pendingAccountId) {
        applyAccountSelection(appliedAccountId);
      }
      if (!accountDisplayList.length) return;
      if (pendingAccountId && !accountMap.has(pendingAccountId)) {
        pendingAccountId = appliedAccountId;
      }
      renderAccountOptions(pendingAccountId);
      setAccountSheetConfirmState(Boolean(pendingAccountId));
      accountSheetOverlay.classList.remove('hidden');
      requestAnimationFrame(() => {
        accountSheetOverlay.classList.add('opacity-100');
        accountBottomSheet.classList.remove('translate-y-full');
      });
      accountSheetOpen = true;
    }

    function closeAccountSheet(options = {}) {
      if (!accountSheetOverlay || !accountBottomSheet) return;
      const immediate = Boolean(options.immediate);
      accountSheetOpen = false;
      if (immediate) {
        accountSheetOverlay.classList.remove('opacity-100');
        accountSheetOverlay.classList.add('hidden');
        accountBottomSheet.classList.add('translate-y-full');
        pendingAccountId = appliedAccountId;
        return;
      }
      accountSheetOverlay.classList.remove('opacity-100');
      accountBottomSheet.classList.add('translate-y-full');
      setTimeout(() => {
        accountSheetOverlay.classList.add('hidden');
        pendingAccountId = appliedAccountId;
      }, 220);
    }

    function selectAccount(accountId) {
      if (!accountSheetList) return;
      pendingAccountId = accountId || '';
      const labels = accountSheetList.querySelectorAll('label[data-account-id]');
      labels.forEach((item) => {
        const isMatch = item.getAttribute('data-account-id') === accountId;
        item.classList.remove(...SHEET_SELECTED_CLASSES);
        const radio = item.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = isMatch;
        }
        const dot = item.querySelector('.radio-dot');
        if (dot) {
          dot.classList.toggle('hidden', !isMatch);
        }
        if (isMatch) {
          item.classList.add(...SHEET_SELECTED_CLASSES);
        }
      });
      setAccountSheetConfirmState(Boolean(accountId));
    }

    function confirmAccount() {
      if (!pendingAccountId) return;
      applyAccountSelection(pendingAccountId);
      closeAccountSheet();
    }

    function getSavedOptions(key) {
      if (!key) return [];
      if (savedOptionsCache.has(key)) {
        return savedOptionsCache.get(key);
      }
      const source = Array.isArray(SAVED_NUMBERS[key]) ? SAVED_NUMBERS[key] : [];
      const options = source
        .map((item, index) => {
          if (!item) return null;
          const rawNumber = (item.number ?? item.id ?? '').toString().trim();
          if (!rawNumber) return null;
          const optionId = (item.id ?? '').toString().trim() || `saved-${index}`;
          const name = (item.name ?? '').toString().trim();
          return {
            id: optionId,
            name,
            number: rawNumber,
          };
        })
        .filter(Boolean);
      savedOptionsCache.set(key, options);
      return options;
    }

    function getSavedDisplayText(selection) {
      if (!selection) return '';
      const number = selection.number || selection.value || '';
      if (selection.name) {
        return `${selection.name} – ${number}`;
      }
      return number;
    }

    function updateSavedDisplayForKey(key) {
      if (!savedDisplay) return;
      const selection = savedSelections.get(key);
      if (!selection) {
        savedDisplay.textContent = 'Pilih nomor tersimpan';
        savedDisplay.classList.add('text-slate-400');
        savedDisplay.classList.remove('text-slate-900', 'font-semibold');
        return;
      }
      savedDisplay.textContent = getSavedDisplayText(selection);
      savedDisplay.classList.remove('text-slate-400');
      savedDisplay.classList.add('text-slate-900', 'font-semibold');
    }

    function applySavedValueToInput(key) {
      if (!idInput) return;
      const selection = savedSelections.get(key);
      if (!selection) return;
      const baseValue = (selection.value ?? selection.number ?? '').toString();
      if (!baseValue) return;
      const sanitized = typeof currentValidation.sanitize === 'function'
        ? currentValidation.sanitize(baseValue)
        : baseValue;
      if (sanitized !== idInput.value) {
        idInput.value = sanitized;
      }
      if (sanitized.trim()) {
        idDirty = true;
      }
    }

    function setSavedSheetConfirmState(enabled) {
      if (!savedSheetConfirm) return;
      savedSheetConfirm.disabled = !enabled;
      savedSheetConfirm.classList.toggle('opacity-50', !enabled);
      savedSheetConfirm.classList.toggle('cursor-not-allowed', !enabled);
      savedSheetConfirm.classList.toggle('hover:bg-cyan-600', enabled);
    }

    function renderSavedOptions(selectedId) {
      if (!savedSheetList) return;
      savedSheetList.innerHTML = '';
      const options = getSavedOptions(activeKey);
      if (!options.length) {
        savedSheetEmpty?.classList.remove('hidden');
        setSavedSheetConfirmState(false);
        return;
      }
      savedSheetEmpty?.classList.add('hidden');
      options.forEach((option) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.setAttribute('data-saved-id', option.id);
        label.className = 'flex w-full items-center justify-between gap-3 px-5 py-3 min-h-[56px] cursor-pointer hover:bg-slate-50 transition-colors';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'savedNumberOption';
        radio.value = option.id;
        radio.className = 'hidden';

        const left = document.createElement('div');
        left.className = 'flex-1 min-w-0';

        const primary = document.createElement('p');
        primary.className = 'text-sm font-semibold text-slate-900 truncate mb-2';
        primary.textContent = option.name || 'Tanpa Nama';

        const secondary = document.createElement('p');
        secondary.className = 'text-xs text-slate-500 truncate';
        secondary.textContent = option.number;

        left.appendChild(primary);
        left.appendChild(secondary);

        const radioVisual = document.createElement('span');
        radioVisual.className = 'saved-radio w-5 h-5 flex items-center justify-center rounded-full border border-slate-300 transition-colors';

        const dot = document.createElement('span');
        dot.className = 'saved-radio-dot w-2.5 h-2.5 rounded-full bg-cyan-500 hidden';
        radioVisual.appendChild(dot);

        label.appendChild(radio);
        label.appendChild(left);
        label.appendChild(radioVisual);
        li.appendChild(label);
        savedSheetList.appendChild(li);
      });
      selectSavedNumber(selectedId);
    }

    function openSavedSheet() {
      if (!savedSheetOverlay || !savedBottomSheet) return;
      if (!activeKey) return;
      closeAccountSheet({ immediate: true });
      closePaymentSheet({ immediate: true });
      pendingSavedId = savedSelections.get(activeKey)?.id || '';
      renderSavedOptions(pendingSavedId);
      if (savedSheetList && !savedSheetList.children.length) {
        setSavedSheetConfirmState(false);
      }
      savedSheetOverlay.classList.remove('hidden');
      requestAnimationFrame(() => {
        savedSheetOverlay.classList.add('opacity-100');
        savedBottomSheet.classList.remove('translate-y-full');
      });
      savedSheetOpen = true;
    }

    function closeSavedSheet(options = {}) {
      if (!savedSheetOverlay || !savedBottomSheet) return;
      const immediate = Boolean(options.immediate);
      savedSheetOpen = false;
      if (immediate) {
        savedSheetOverlay.classList.remove('opacity-100');
        savedSheetOverlay.classList.add('hidden');
        savedBottomSheet.classList.add('translate-y-full');
        pendingSavedId = savedSelections.get(activeKey)?.id || '';
        return;
      }
      savedSheetOverlay.classList.remove('opacity-100');
      savedBottomSheet.classList.add('translate-y-full');
      setTimeout(() => {
        savedSheetOverlay.classList.add('hidden');
        pendingSavedId = savedSelections.get(activeKey)?.id || '';
      }, 220);
    }

    function selectSavedNumber(optionId) {
      if (!savedSheetList) {
        setSavedSheetConfirmState(false);
        return;
      }
      pendingSavedId = optionId || '';
      const labels = savedSheetList.querySelectorAll('label[data-saved-id]');
      labels.forEach((label) => {
        const isMatch = label.getAttribute('data-saved-id') === optionId;
        label.classList.toggle('bg-cyan-50', isMatch);
        const radio = label.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = isMatch;
        }
        const visual = label.querySelector('.saved-radio');
        if (visual) {
          visual.classList.toggle('border-cyan-500', isMatch);
          visual.classList.toggle('border-slate-300', !isMatch);
        }
        const dot = label.querySelector('.saved-radio-dot');
        if (dot) {
          dot.classList.toggle('hidden', !isMatch);
        }
      });
      setSavedSheetConfirmState(Boolean(optionId));
    }

    function applySavedSelection(optionId) {
      if (!activeKey) return;
      const option = getSavedOptions(activeKey).find((item) => item.id === optionId);
      if (!option) return;
      const sanitizedValue = typeof currentValidation.sanitize === 'function'
        ? currentValidation.sanitize(option.number)
        : option.number;
      const selection = {
        id: option.id,
        name: option.name,
        number: option.number,
        value: sanitizedValue,
      };
      savedSelections.set(activeKey, selection);
      updateSavedDisplayForKey(activeKey);
      applySavedValueToInput(activeKey);
      updateIdError();
      updateConfirmState();
    }

    const ACTIVE_CLASSES = ['ring-2', 'ring-cyan-400', 'border-cyan-300', 'bg-cyan-50'];

    let activeButton = null;
    let activeKey = '';
    let currentValidation = { ...DEFAULT_VALIDATION };
    let idDirty = false;
    let paymentSheetOpen = false;
    let accountSheetOpen = false;
    let savedSheetOpen = false;
    let appliedAccountId = '';
    let pendingAccountId = '';
    let pendingSavedId = '';
    const savedSelections = new Map();
    const savedOptionsCache = new Map();
    const PAYMENT_OTP_DURATION_SECONDS = 30;
    const PAYMENT_OTP_DEFAULT_COUNTDOWN_MESSAGE = 'Sesi akan berakhir dalam';
    const PAYMENT_OTP_EXPIRED_MESSAGE = 'Kode OTP kedaluwarsa. Silakan kirim ulang kode untuk melanjutkan.';
    const paymentOtpCountdownDefaultMessage =
      paymentOtpCountdownMessage?.textContent?.trim() || PAYMENT_OTP_DEFAULT_COUNTDOWN_MESSAGE;
    const SUCCESS_STATUS_CONFIG = {
      processing: {
        label: 'Sedang Diproses',
        pillClass: 'bg-amber-100 text-amber-600',
        heroTitle: 'Transaksi Sedang Diproses',
      },
      success: {
        label: 'Berhasil',
        pillClass: 'bg-emerald-100 text-emerald-600',
        heroTitle: 'Transaksi Berhasil',
      },
      failed: {
        label: 'Gagal',
        pillClass: 'bg-rose-100 text-rose-600',
        heroTitle: 'Transaksi Gagal',
      },
    };
    const SUCCESS_STATUS_SEQUENCE = ['processing', 'success', 'failed'];
    const SUCCESS_STATUS_PILL_BASE = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold';

    let paymentOtpActive = false;
    let paymentOtpIntervalId = null;
    let paymentOtpTimeLeft = PAYMENT_OTP_DURATION_SECONDS;
    let paymentSheetDefaultCta = 'Bayar Sekarang';
    let successDrawerOpen = false;
    let successStatusLoading = false;
    let currentSuccessStatusKey = 'processing';
    let lastConfirmationContext = null;
    let lastSuccessDetails = null;

    rebuildAccountCollections();
    applyAccountSelection(appliedAccountId);

    function setActiveButton(next) {
      if (activeButton && activeButton !== next) {
        activeButton.classList.remove(...ACTIVE_CLASSES);
      }
      activeButton = next || null;
      if (activeButton) {
        activeButton.classList.add(...ACTIVE_CLASSES);
      }
    }

    function renderNotes(config) {
      notesList.innerHTML = '';
      const items = Array.isArray(config.notes) ? config.notes.filter((note) => note && note.trim()) : [];
      if (!items.length) {
        notesEmpty?.classList.remove('hidden');
        return;
      }
      notesEmpty?.classList.add('hidden');
      items.forEach((note) => {
        const li = document.createElement('li');
        li.textContent = note.trim();
        notesList.appendChild(li);
      });
    }

    function applyValidationAttributes(validation) {
      if (!idInput) return;
      if (validation.inputmode) {
        idInput.setAttribute('inputmode', validation.inputmode);
      } else {
        idInput.removeAttribute('inputmode');
      }
      if (validation.pattern && validation.inputmode === 'numeric') {
        idInput.setAttribute('pattern', '\\d*');
      } else {
        idInput.removeAttribute('pattern');
      }
    }

    function applyConfig(key, config) {
      activeKey = key;
      currentValidation = mergeValidation(config);
      idDirty = false;

      drawerTitle.textContent = config.title;
      renderNotes(config);

      const label = config.idCopy || 'ID Pelanggan';
      idLabel.textContent = label;
      idInput.value = '';
      idInput.placeholder = `Masukkan ${label}`;
      if (idHint) {
        const hintText = config.idHint || '';
        idHint.textContent = hintText ? hintText : '';
        idHint.classList.toggle('hidden', !hintText);
      }
      if (paymentSheetIdLabel) {
        paymentSheetIdLabel.textContent = label;
      }
      idError.classList.add('hidden');
      idError.textContent = '';

      applyValidationAttributes(currentValidation);

      pendingSavedId = savedSelections.get(key)?.id || '';
      updateSavedDisplayForKey(key);
      applySavedValueToInput(key);
      updateIdError();
      updateConfirmState();

      requestAnimationFrame(() => {
        idInput.focus({ preventScroll: true });
      });
    }

    function checkValidity(value) {
      const trimmed = value.trim();
      if (!trimmed) {
        return { valid: false, message: 'ID pelanggan wajib diisi.' };
      }
      const sanitized = typeof currentValidation.sanitize === 'function'
        ? currentValidation.sanitize(trimmed)
        : trimmed;
      if (sanitized !== value) {
        idInput.value = sanitized;
      }
      if (typeof currentValidation.minLength === 'number' && sanitized.length < currentValidation.minLength) {
        return { valid: false, message: currentValidation.message };
      }
      if (typeof currentValidation.maxLength === 'number' && sanitized.length > currentValidation.maxLength) {
        return { valid: false, message: currentValidation.message };
      }
      if (currentValidation.pattern && !currentValidation.pattern.test(sanitized)) {
        return { valid: false, message: currentValidation.message };
      }
      return { valid: true, message: '' };
    }

    function updateIdError(force = false) {
      const { valid, message } = checkValidity(idInput.value);
      if (!valid && (force || idDirty)) {
        idError.textContent = message;
        idError.classList.remove('hidden');
      } else {
        idError.textContent = '';
        idError.classList.add('hidden');
      }
      return valid;
    }

    function updateConfirmState() {
      const hasAccount = Boolean(appliedAccountId);
      const { valid } = checkValidity(idInput.value);
      confirmBtn.disabled = !(hasAccount && valid);
    }

    function closePaymentSheet(options = {}) {
      if (!paymentSheetOverlay || !paymentBottomSheet) return;
      if (paymentSheetOverlay.classList.contains('hidden') && !paymentSheetOpen) {
        return;
      }
      resetPaymentOtpState();
      const immediate = Boolean(options.immediate);
      paymentSheetOpen = false;
      if (immediate) {
        paymentSheetOverlay.classList.remove('opacity-100');
        paymentSheetOverlay.classList.add('hidden');
        paymentBottomSheet.classList.add('translate-y-full');
        return;
      }
      paymentSheetOverlay.classList.remove('opacity-100');
      paymentBottomSheet.classList.add('translate-y-full');
      setTimeout(() => {
        paymentSheetOverlay.classList.add('hidden');
      }, 220);
    }

    function renderPaymentDynamic(fields) {
      if (!paymentSheetDynamicSection) return;
      paymentSheetDynamicSection.innerHTML = '';
      const items = Array.isArray(fields) ? fields.filter((item) => item && item.label && item.value !== undefined && item.value !== null) : [];
      if (!items.length) {
        paymentSheetDynamicSection.classList.add('hidden');
        return;
      }
      items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'flex items-start justify-between gap-4';

        const label = document.createElement('span');
        label.className = 'text-sm text-slate-500';
        label.textContent = item.label;

        const value = document.createElement('span');
        value.className = 'text-sm font-semibold text-slate-900 text-right max-w-[60%] whitespace-pre-line';
        value.textContent = `${item.value}`;

        row.appendChild(label);
        row.appendChild(value);
        paymentSheetDynamicSection.appendChild(row);
      });
      paymentSheetDynamicSection.classList.remove('hidden');
    }

    function renderSuccessDynamic(fields) {
      if (!successDynamicSection) return;
      successDynamicSection.innerHTML = '';
      const items = Array.isArray(fields)
        ? fields.filter((item) => item && item.label && item.value !== undefined && item.value !== null)
        : [];
      if (!items.length) {
        successDynamicSection.classList.add('hidden');
        return;
      }
      items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'flex items-start justify-between gap-4';

        const label = document.createElement('span');
        label.className = 'text-sm text-slate-500';
        label.textContent = item.label;

        const value = document.createElement('span');
        value.className = 'max-w-[60%] whitespace-pre-line text-right text-sm font-semibold text-slate-900';
        value.textContent = `${item.value}`;

        row.appendChild(label);
        row.appendChild(value);
        successDynamicSection.appendChild(row);
      });
      successDynamicSection.classList.remove('hidden');
    }

    function formatCurrencyValue(value, fallback = 'Rp0') {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `Rp${currencyFormatter.format(value)}`;
      }
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
      return fallback;
    }

    function formatAccountForPayment(account) {
      if (!account) {
        return '-';
      }
      const name = account.displayName || account.name || '';
      const number = account.number || formatAccountNumber(account.numberRaw) || '';
      if (name && number) {
        return `${name} – ${number}`;
      }
      if (name) {
        return name;
      }
      if (number) {
        return number;
      }
      if (account.subtitle) {
        return account.subtitle;
      }
      return '-';
    }

    function getSuccessStatusConfig(key) {
      return SUCCESS_STATUS_CONFIG[key] || SUCCESS_STATUS_CONFIG.processing;
    }

    function setSuccessStatus(statusKey, options = {}) {
      const config = getSuccessStatusConfig(statusKey);
      currentSuccessStatusKey = statusKey;
      if (successStatusPill) {
        successStatusPill.className = `${SUCCESS_STATUS_PILL_BASE} ${config.pillClass}`;
        successStatusPill.textContent = config.label;
      }
      if (!options.skipHeroTitle && successHeroTitle) {
        successHeroTitle.textContent = config.heroTitle || SUCCESS_STATUS_CONFIG.processing.heroTitle;
      }
      if (lastSuccessDetails) {
        lastSuccessDetails.status = statusKey;
      }
    }

    function resetSuccessDrawerControls() {
      if (successStatusButton) {
        successStatusButton.disabled = false;
        successStatusButton.textContent = successStatusButtonDefaultText;
      }
      successStatusLoading = false;
    }

    function populateSuccessDrawer(details) {
      if (!details) return;
      const dynamicFields = Array.isArray(details.dynamicFields)
        ? details.dynamicFields.map((item) => ({
            label: item.label,
            value: item.value,
          }))
        : [];
      lastSuccessDetails = {
        ...details,
        dynamicFields,
        amounts: {
          nominal: details.amounts?.nominal,
          admin: details.amounts?.admin,
          total: details.amounts?.total,
        },
      };
      if (successHeroCategory) {
        successHeroCategory.textContent = details.heroCategory || 'Beli & Bayar';
      }
      if (successHeroSubtitle) {
        successHeroSubtitle.textContent = details.heroSubtitle || details.displayName || '-';
      }
      if (successPaymentLabel) {
        successPaymentLabel.textContent = details.transactionLabel || 'Pembayaran';
      }
      if (successPaymentValue) {
        successPaymentValue.textContent = details.displayName || '-';
      }
      if (successAccountValue) {
        successAccountValue.textContent = details.accountDisplay || '-';
      }
      if (successIdLabel) {
        successIdLabel.textContent = details.idLabel || 'ID Pelanggan';
      }
      if (successIdValue) {
        successIdValue.textContent = details.idValue || '-';
      }
      if (successCustomerName) {
        successCustomerName.textContent = details.customerName || '-';
      }
      renderSuccessDynamic(dynamicFields);
      if (successNominal) {
        successNominal.textContent = formatCurrencyValue(details.amounts?.nominal);
      }
      if (successAdmin) {
        successAdmin.textContent = formatCurrencyValue(details.amounts?.admin);
      }
      if (successTotal) {
        successTotal.textContent = formatCurrencyValue(
          details.amounts?.total,
          formatCurrencyValue(details.amounts?.nominal)
        );
      }
      setSuccessStatus(details.status || 'processing');
      resetSuccessDrawerControls();
    }

    function buildSuccessDetailsFromContext(context) {
      if (!context) return null;
      const dynamicFields = Array.isArray(context.dynamicFields)
        ? context.dynamicFields.map((item) => ({
            label: item.label,
            value: item.value,
          }))
        : [];
      return {
        key: context.key,
        type: context.type,
        transactionLabel: context.transactionLabel,
        displayName: context.displayName,
        accountDisplay: context.accountDisplay,
        idLabel: context.idLabel,
        idValue: context.idValue,
        customerName: context.customerName,
        dynamicFields,
        amounts: {
          nominal: context.amounts?.nominal,
          admin: context.amounts?.admin,
          total: context.amounts?.total,
        },
        status: context.status || 'processing',
        heroCategory: context.heroCategory || 'Beli & Bayar',
        heroSubtitle: context.heroSubtitle || context.displayName || '-',
      };
    }

    function openSuccessDrawer(details) {
      if (!successDrawer || !successDrawerInner || !details) return;
      populateSuccessDrawer(details);
      successDrawer.classList.remove('hidden');
      requestAnimationFrame(() => {
        successDrawerInner.classList.remove('translate-x-8', 'opacity-0');
        successDrawerInner.classList.add('translate-x-0', 'opacity-100');
      });
      successDrawerOpen = true;
      successCloseButton?.focus();
    }

    function hideSuccessDrawer(options = {}) {
      if (!successDrawer || !successDrawerInner) {
        if (typeof options.onHidden === 'function') {
          options.onHidden();
        }
        return;
      }
      if (successDrawer.classList.contains('hidden')) {
        successDrawerOpen = false;
        if (typeof options.onHidden === 'function') {
          options.onHidden();
        }
        return;
      }
      successDrawerOpen = false;
      const finalize = () => {
        successDrawer.classList.add('hidden');
        successDrawerInner.classList.remove('translate-x-0', 'opacity-100');
        successDrawerInner.classList.add('translate-x-8', 'opacity-0');
        resetSuccessDrawerControls();
        if (typeof options.onHidden === 'function') {
          options.onHidden();
        }
      };
      if (options.immediate) {
        finalize();
        return;
      }
      successDrawerInner.classList.remove('translate-x-0', 'opacity-100');
      successDrawerInner.classList.add('translate-x-8', 'opacity-0');
      setTimeout(finalize, 220);
    }

    function closeSuccessDrawerAndPanel() {
      hideSuccessDrawer({ onHidden: () => closeDrawer() });
    }

    function getNextSuccessStatusKey(currentKey) {
      const index = SUCCESS_STATUS_SEQUENCE.indexOf(currentKey);
      if (index === -1 || index === SUCCESS_STATUS_SEQUENCE.length - 1) {
        return SUCCESS_STATUS_SEQUENCE[0];
      }
      return SUCCESS_STATUS_SEQUENCE[index + 1];
    }

    function refreshSuccessStatus() {
      if (successStatusLoading || !successStatusButton || !lastSuccessDetails || !successDrawerOpen) {
        return;
      }
      successStatusLoading = true;
      successStatusButton.disabled = true;
      successStatusButton.textContent = 'Memuat...';
      console.info('Memeriksa status transaksi (mock)...');
      setTimeout(() => {
        const nextStatus = getNextSuccessStatusKey(currentSuccessStatusKey);
        setSuccessStatus(nextStatus);
        console.info('Status transaksi diperbarui menjadi:', getSuccessStatusConfig(nextStatus).label);
        resetSuccessDrawerControls();
      }, 1200);
    }

    function setPaymentSheetConfirmEnabled(enabled) {
      if (!paymentSheetConfirm) return;
      paymentSheetConfirm.disabled = !enabled;
      paymentSheetConfirm.classList.toggle('opacity-50', !enabled);
      paymentSheetConfirm.classList.toggle('cursor-not-allowed', !enabled);
    }

    function setPaymentSheetConfirmText(text) {
      if (!paymentSheetConfirm) return;
      paymentSheetConfirm.textContent = text;
    }

    function hidePaymentOtpError() {
      if (!paymentOtpError) return;
      paymentOtpError.textContent = '';
      paymentOtpError.classList.add('hidden');
    }

    function showPaymentOtpError(message) {
      if (!paymentOtpError) return;
      paymentOtpError.textContent = message;
      paymentOtpError.classList.remove('hidden');
    }

    function resetPaymentOtpInputs() {
      if (!paymentOtpInputs.length) return;
      paymentOtpInputs.forEach((input) => {
        input.value = '';
      });
    }

    function formatPaymentOtpTime(seconds) {
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      return `${mins}:${secs}`;
    }

    function updatePaymentOtpCountdownDisplay() {
      if (!paymentOtpTimer) return;
      paymentOtpTimer.textContent = formatPaymentOtpTime(paymentOtpTimeLeft);
    }

    function showPaymentOtpCountdownDefaultMessage() {
      if (paymentOtpCountdownMessage) {
        paymentOtpCountdownMessage.textContent = paymentOtpCountdownDefaultMessage;
      }
      if (paymentOtpTimer) {
        paymentOtpTimer.classList.remove('hidden');
      }
    }

    function showPaymentOtpExpiredMessage() {
      if (paymentOtpCountdownMessage) {
        paymentOtpCountdownMessage.textContent = PAYMENT_OTP_EXPIRED_MESSAGE;
      }
      if (paymentOtpTimer) {
        paymentOtpTimer.classList.add('hidden');
      }
    }

    function clearPaymentOtpTimer() {
      if (paymentOtpIntervalId) {
        clearInterval(paymentOtpIntervalId);
        paymentOtpIntervalId = null;
      }
    }

    function isPaymentOtpFilled() {
      if (!paymentOtpInputs.length) return false;
      return paymentOtpInputs.every((input) => input.value && input.value.trim() !== '');
    }

    function getPaymentOtpValue() {
      if (!paymentOtpInputs.length) return '';
      return paymentOtpInputs.map((input) => input.value).join('');
    }

    function updatePaymentOtpVerifyState() {
      if (!paymentOtpActive) return;
      const canVerify = isPaymentOtpFilled() && paymentOtpTimeLeft > 0;
      setPaymentSheetConfirmEnabled(canVerify);
    }

    function startPaymentOtpTimer() {
      if (paymentOtpCountdown) {
        paymentOtpCountdown.classList.remove('hidden');
      }
      showPaymentOtpCountdownDefaultMessage();
      paymentOtpResend?.classList.add('hidden');
      paymentOtpTimeLeft = PAYMENT_OTP_DURATION_SECONDS;
      updatePaymentOtpCountdownDisplay();
      clearPaymentOtpTimer();
      paymentOtpIntervalId = setInterval(() => {
        paymentOtpTimeLeft -= 1;
        if (paymentOtpTimeLeft <= 0) {
          paymentOtpTimeLeft = 0;
          updatePaymentOtpCountdownDisplay();
          clearPaymentOtpTimer();
          showPaymentOtpExpiredMessage();
          paymentOtpResend?.classList.remove('hidden');
          setPaymentSheetConfirmEnabled(false);
          return;
        }
        updatePaymentOtpCountdownDisplay();
      }, 1000);
    }

    function resetPaymentOtpState() {
      paymentOtpActive = false;
      clearPaymentOtpTimer();
      paymentOtpTimeLeft = PAYMENT_OTP_DURATION_SECONDS;
      if (paymentOtpSection) {
        paymentOtpSection.classList.add('hidden');
      }
      resetPaymentOtpInputs();
      hidePaymentOtpError();
      if (paymentOtpCountdown) {
        paymentOtpCountdown.classList.remove('hidden');
      }
      showPaymentOtpCountdownDefaultMessage();
      if (paymentOtpTimer) {
        paymentOtpTimer.textContent = formatPaymentOtpTime(PAYMENT_OTP_DURATION_SECONDS);
      }
      paymentOtpResend?.classList.add('hidden');
      setPaymentSheetConfirmText(paymentSheetDefaultCta);
      setPaymentSheetConfirmEnabled(true);
    }

    function startPaymentOtpFlow() {
      paymentOtpActive = true;
      hidePaymentOtpError();
      resetPaymentOtpInputs();
      if (paymentOtpSection) {
        paymentOtpSection.classList.remove('hidden');
      }
      setPaymentSheetConfirmText('Verifikasi');
      setPaymentSheetConfirmEnabled(false);
      startPaymentOtpTimer();
      updatePaymentOtpVerifyState();
      paymentOtpInputs[0]?.focus();
    }

    function openPaymentSheet() {
      if (!paymentSheetOverlay || !paymentBottomSheet || !activeKey) return;
      const config = BILLER_CONFIG[activeKey];
      if (!config) return;

      closeAccountSheet({ immediate: true });
      closeSavedSheet({ immediate: true });

      const sanitizedId = typeof currentValidation.sanitize === 'function'
        ? currentValidation.sanitize(idInput.value.trim())
        : idInput.value.trim();
      idInput.value = sanitizedId;

      const summary = PAYMENT_DETAILS[activeKey] || {};
      const type = summary.type === 'pembelian' ? 'pembelian' : 'pembayaran';
      const headerTitle = type === 'pembelian' ? 'Konfirmasi Pembelian' : 'Konfirmasi Pembayaran';
      const transactionLabel = type === 'pembelian' ? 'Pembelian' : 'Pembayaran';
      const displayName = summary.displayName || config.title || '-';
      const account = appliedAccountId ? accountMap.get(appliedAccountId) : null;
      const savedSelection = activeKey ? savedSelections.get(activeKey) : null;
      const customerName = savedSelection?.name || summary.customerName || '-';

      if (paymentSheetTitle) {
        paymentSheetTitle.textContent = headerTitle;
      }
      if (paymentSheetAccountValue) {
        paymentSheetAccountValue.textContent = formatAccountForPayment(account);
      }
      if (paymentSheetIdLabel) {
        paymentSheetIdLabel.textContent = config.idCopy || 'ID Pelanggan';
      }
      if (paymentSheetIdValue) {
        paymentSheetIdValue.textContent = sanitizedId || '-';
      }
      if (paymentSheetCustomerName) {
        paymentSheetCustomerName.textContent = customerName || '-';
      }

      renderPaymentDynamic(summary.dynamic);

      const nominalValue = summary.amounts?.nominal;
      const adminValue = summary.amounts?.admin;
      let totalValue = summary.amounts?.total;
      if (typeof totalValue !== 'number' && typeof nominalValue === 'number' && typeof adminValue === 'number') {
        totalValue = nominalValue + adminValue;
      }

      if (paymentSheetNominal) {
        paymentSheetNominal.textContent = formatCurrencyValue(nominalValue);
      }
      if (paymentSheetAdmin) {
        paymentSheetAdmin.textContent = formatCurrencyValue(adminValue);
      }
      if (paymentSheetTotal) {
        paymentSheetTotal.textContent = formatCurrencyValue(totalValue, formatCurrencyValue(nominalValue));
      }

      const ctaText = summary.cta || (displayName && displayName !== '-' ? `Bayar ${displayName}` : 'Bayar Sekarang');
      paymentSheetDefaultCta = ctaText;
      resetPaymentOtpState();

      lastConfirmationContext = {
        key: activeKey,
        type,
        transactionLabel,
        displayName,
        accountDisplay: formatAccountForPayment(account),
        idLabel: config.idCopy || 'ID Pelanggan',
        idValue: sanitizedId || '-',
        customerName,
        dynamicFields: Array.isArray(summary.dynamic)
          ? summary.dynamic.map((item) => ({ label: item.label, value: item.value }))
          : [],
        amounts: {
          nominal: nominalValue,
          admin: adminValue,
          total: totalValue,
        },
        status: 'processing',
        heroCategory: 'Beli & Bayar',
        heroSubtitle: displayName,
      };

      paymentSheetOverlay.classList.remove('hidden');
      requestAnimationFrame(() => {
        paymentSheetOverlay.classList.add('opacity-100');
        paymentBottomSheet.classList.remove('translate-y-full');
      });
      paymentSheetOpen = true;
    }

    function openDrawer(key, button) {
      const config = BILLER_CONFIG[key];
      if (!config) return;
      closeSavedSheet({ immediate: true });
      closeAccountSheet({ immediate: true });
      closePaymentSheet({ immediate: true });
      hideSuccessDrawer({ immediate: true });
      setActiveButton(button);
      const wasClosed = !drawer.classList.contains('open');
      applyConfig(key, config);
      if (wasClosed) {
        drawer.classList.add('open');
        drawerInner.classList.remove('opacity-0', 'translate-x-4');
        drawerInner.classList.add('opacity-100', 'translate-x-0');
        if (typeof window.sidebarCollapseForDrawer === 'function') {
          window.sidebarCollapseForDrawer();
        }
      } else {
        drawerInner.classList.remove('opacity-0', 'translate-x-4');
        drawerInner.classList.add('opacity-100', 'translate-x-0');
      }
    }

    function closeDrawer() {
      if (!drawer.classList.contains('open')) return;
      hideSuccessDrawer({ immediate: true });
      drawerInner.classList.remove('opacity-100', 'translate-x-0');
      drawerInner.classList.add('opacity-0', 'translate-x-4');
      closeSavedSheet({ immediate: true });
      closeAccountSheet({ immediate: true });
      closePaymentSheet({ immediate: true });
      setTimeout(() => {
        drawer.classList.remove('open');
        if (typeof window.sidebarRestoreForDrawer === 'function') {
          window.sidebarRestoreForDrawer();
        }
        setActiveButton(null);
      }, 220);
    }

    billerButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const key = button.getAttribute('data-biller');
        openDrawer(key, button);
      });
    });

    closeBtn?.addEventListener('click', () => {
      closeDrawer();
    });

    moveSourceButton?.addEventListener('click', openAccountSheet);

    accountSheetOverlay?.addEventListener('click', () => closeAccountSheet());
    accountSheetClose?.addEventListener('click', () => closeAccountSheet());
    accountSheetCancel?.addEventListener('click', () => closeAccountSheet());
    accountSheetConfirm?.addEventListener('click', confirmAccount);

    accountSheetList?.addEventListener('change', (event) => {
      const target = event.target;
      if (!target || target.tagName !== 'INPUT') return;
      if (target.type !== 'radio' || target.name !== 'sheetAccountOption') return;
      const label = target.closest('label[data-account-id]');
      const accountId = target.value || label?.getAttribute('data-account-id');
      if (!accountId) return;
      selectAccount(accountId);
    });

    idInput.addEventListener('input', () => {
      const sanitized = typeof currentValidation.sanitize === 'function'
        ? currentValidation.sanitize(idInput.value)
        : idInput.value;
      if (sanitized !== idInput.value) {
        idInput.value = sanitized;
      }
      if (sanitized.trim().length) {
        idDirty = true;
      }
      updateIdError();
      updateConfirmState();
    });

    idInput.addEventListener('blur', () => {
      if (idInput.value.trim()) {
        idDirty = true;
      }
      updateIdError();
    });

    confirmBtn.addEventListener('click', () => {
      if (confirmBtn.disabled) return;
      const valid = updateIdError(true);
      if (!valid) return;
      openPaymentSheet();
    });

    savedBtn?.addEventListener('click', () => {
      if (!activeKey) return;
      openSavedSheet();
    });

    savedSheetOverlay?.addEventListener('click', () => closeSavedSheet());
    savedSheetClose?.addEventListener('click', () => closeSavedSheet());
    savedSheetCancel?.addEventListener('click', () => closeSavedSheet());
    savedSheetConfirm?.addEventListener('click', () => {
      if (!pendingSavedId) return;
      applySavedSelection(pendingSavedId);
      closeSavedSheet();
    });

    savedSheetList?.addEventListener('click', (event) => {
      const label = event.target.closest('label[data-saved-id]');
      if (!label) return;
      const optionId = label.getAttribute('data-saved-id');
      if (!optionId) return;
      selectSavedNumber(optionId);
    });

    savedSheetList?.addEventListener('change', (event) => {
      const target = event.target;
      if (!target || target.type !== 'radio' || target.name !== 'savedNumberOption') return;
      selectSavedNumber(target.value);
    });

    paymentOtpResend?.addEventListener('click', (event) => {
      event.preventDefault();
      if (!paymentOtpActive) return;
      resetPaymentOtpInputs();
      hidePaymentOtpError();
      startPaymentOtpTimer();
      updatePaymentOtpVerifyState();
      paymentOtpInputs[0]?.focus();
    });

    paymentOtpInputs.forEach((input, index) => {
      input.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;
        const digits = target.value.replace(/\D/g, '');
        target.value = digits.slice(-1);
        if (target.value && index < paymentOtpInputs.length - 1) {
          paymentOtpInputs[index + 1]?.focus();
        }
        hidePaymentOtpError();
        updatePaymentOtpVerifyState();
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && index > 0) {
          event.preventDefault();
          const previous = paymentOtpInputs[index - 1];
          previous.value = '';
          previous.focus();
          updatePaymentOtpVerifyState();
          return;
        }
        if (event.key === 'ArrowLeft' && index > 0) {
          event.preventDefault();
          paymentOtpInputs[index - 1]?.focus();
          return;
        }
        if (event.key === 'ArrowRight' && index < paymentOtpInputs.length - 1) {
          event.preventDefault();
          paymentOtpInputs[index + 1]?.focus();
        }
      });

      input.addEventListener('paste', (event) => {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        const text = clipboard?.getData('text') || '';
        const digits = text.replace(/\D/g, '');
        if (!digits) return;
        resetPaymentOtpInputs();
        const chars = digits.split('').slice(0, paymentOtpInputs.length);
        chars.forEach((char, charIndex) => {
          paymentOtpInputs[charIndex].value = char;
        });
        const focusIndex = Math.min(chars.length - 1, paymentOtpInputs.length - 1);
        if (focusIndex >= 0) {
          paymentOtpInputs[focusIndex].focus();
        }
        hidePaymentOtpError();
        updatePaymentOtpVerifyState();
      });

      input.addEventListener('focus', () => {
        if (input.value) {
          input.select();
        }
      });
    });

    paymentSheetOverlay?.addEventListener('click', (event) => {
      if (event.target === paymentSheetOverlay) {
        closePaymentSheet();
      }
    });
    paymentSheetClose?.addEventListener('click', () => closePaymentSheet());
    paymentSheetCancel?.addEventListener('click', () => closePaymentSheet());
    paymentSheetConfirm?.addEventListener('click', (event) => {
      event.preventDefault();
      if (!paymentSheetConfirm || paymentSheetConfirm.disabled) {
        return;
      }

      if (!paymentOtpActive) {
        startPaymentOtpFlow();
        return;
      }

      if (paymentOtpTimeLeft <= 0) {
        showPaymentOtpError(PAYMENT_OTP_EXPIRED_MESSAGE);
        setPaymentSheetConfirmEnabled(false);
        return;
      }

      if (!isPaymentOtpFilled()) {
        showPaymentOtpError('Masukkan kode OTP lengkap.');
        setPaymentSheetConfirmEnabled(false);
        return;
      }

      const otpValue = getPaymentOtpValue();
      hidePaymentOtpError();
      console.info('OTP pembayaran diverifikasi:', otpValue);
      closePaymentSheet();
      console.info('Konfirmasi pembayaran diproses (mock).');
      const successDetails = buildSuccessDetailsFromContext(lastConfirmationContext);
      if (successDetails) {
        setTimeout(() => {
          openSuccessDrawer(successDetails);
        }, 220);
      }
    });

    successHeaderClose?.addEventListener('click', () => {
      closeSuccessDrawerAndPanel();
    });

    successCloseButton?.addEventListener('click', () => {
      closeSuccessDrawerAndPanel();
    });

    successStatusButton?.addEventListener('click', () => {
      refreshSuccessStatus();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (savedSheetOpen) {
          closeSavedSheet();
        } else if (accountSheetOpen) {
          closeAccountSheet();
        } else if (paymentSheetOpen) {
          closePaymentSheet();
        } else if (successDrawerOpen) {
          closeSuccessDrawerAndPanel();
        } else {
          closeDrawer();
        }
      }
    });
  });
})();
