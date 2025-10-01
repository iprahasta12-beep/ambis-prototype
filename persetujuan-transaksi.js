const approvalsData = {
  butuh: [
    {
      id: 'TRX-20240817-01',
      category: 'Transfer',
      title: 'Transfer Saldo',
      counterpart: 'Ke BCA PT Queen Japan',
      amount: 'Rp250.000.000',
      date: '2024-08-17T11:40:00',
      status: 'Butuh Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      method: 'BI Fast',
      reference: 'TRX-20240817-01',
      sourceAccountKey: 'operasional',
      sourceAccount: {
        initial: 'O',
        title: 'Operasional',
        subtitle: 'PT Ambis Sejahtera',
        color: 'bg-cyan-100 text-cyan-600',
      },
      destinationAccount: {
        initial: 'Q',
        title: 'PT Queen Japan',
        subtitle: 'BCA • 1234567890',
        color: 'bg-amber-100 text-amber-600',
      },
    },
    {
      id: 'TRX-20240817-02',
      category: 'Transfer',
      title: 'Pemindahan Dana',
      counterpart: 'Dari Rekening Utama ke Operasional',
      amount: 'Rp500.000.000',
      date: '2024-08-17T09:55:00',
      status: 'Butuh Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      method: 'RTGS',
      reference: 'TRX-20240817-02',
      sourceAccountKey: 'utama',
      sourceAccount: {
        initial: 'U',
        title: 'Rekening Utama',
        subtitle: 'PT Ambis Sejahtera',
        color: 'bg-emerald-100 text-emerald-600',
      },
      destinationAccount: {
        initial: 'O',
        title: 'Rekening Operasional',
        subtitle: 'Mandiri • 9876543210',
        color: 'bg-sky-100 text-sky-600',
      },
    },
    {
      id: 'BLR-20240817-02',
      category: 'Beli Bayar',
      title: 'Pembayaran Tagihan',
      counterpart: 'Tagihan Listrik',
      amount: 'Rp1.200.000',
      date: '2024-08-17T16:06:00',
      status: 'Butuh Persetujuan',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      sourceAccountKey: 'operasional',
      sourceAccount: 'Operasional • BCA 1234567890',
      customerId: '14123123123',
      customerName: 'PT Ambis Sejahtera',
      adminFee: 'Rp5.000',
      totalAmount: 'Rp1.205.000',
      paymentLabel: 'Tagihan Listrik PLN',
      statusLabel: 'Menunggu Persetujuan',
    },
    {
      id: 'BLR-20240817-03',
      category: 'Beli Bayar',
      title: 'Pembayaran Internet',
      counterpart: 'Indihome',
      amount: 'Rp350.000',
      date: '2024-08-17T13:12:00',
      status: 'Butuh Persetujuan',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      sourceAccountKey: 'operasional',
      sourceAccount: 'Operasional • BNI 1122334455',
      customerId: '1929393939',
      customerName: 'PT Ambis Nusantara',
      adminFee: 'Rp3.500',
      totalAmount: 'Rp353.500',
      paymentLabel: 'Internet Indihome',
      statusLabel: 'Menunggu Persetujuan',
    },
    {
      id: 'BLR-20240817-05',
      category: 'Beli Bayar',
      title: 'Pembayaran Internet',
      counterpart: 'CBN',
      amount: 'Rp350.000',
      date: '2024-08-17T10:10:00',
      status: 'Butuh Persetujuan',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      sourceAccountKey: 'operasional',
      sourceAccount: 'Operasional • Permata 6677889900',
      customerId: '8877665544',
      customerName: 'CV Sentosa Mandiri',
      adminFee: 'Rp2.500',
      totalAmount: 'Rp352.500',
      paymentLabel: 'Internet CBN',
      statusLabel: 'Menunggu Persetujuan',
    },
  ],
  menunggu: [
    {
      id: 'TRX-20240815-01',
      category: 'Transfer',
      title: 'Transfer Valas',
      counterpart: 'Ke PT Mega Finance',
      amount: 'Rp400.000.000',
      date: '2024-08-15T18:45:00',
      status: 'Menunggu Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      method: 'SWIFT',
      reference: 'TRX-20240815-01',
      sourceAccount: {
        initial: 'V',
        title: 'Valas USD',
        subtitle: 'PT Ambis Sejahtera',
        color: 'bg-purple-100 text-purple-600',
      },
      destinationAccount: {
        initial: 'M',
        title: 'PT Mega Finance',
        subtitle: 'HSBC • 4455667711',
        color: 'bg-amber-100 text-amber-600',
      },
    },
    {
      id: 'BLR-20240814-01',
      category: 'Beli Bayar',
      title: 'Pembayaran Layanan',
      counterpart: 'Langganan Internet',
      amount: 'Rp1.500.000',
      date: '2024-08-14T09:20:00',
      status: 'Menunggu Persetujuan',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      sourceAccountKey: 'operasional',
      sourceAccount: 'Operasional • BCA 1234567890',
      customerId: '8899776655',
      customerName: 'PT Sumber Abadi',
      adminFee: 'Rp4.500',
      totalAmount: 'Rp1.504.500',
      paymentLabel: 'Internet Bisnis',
      statusLabel: 'Menunggu Persetujuan',
    },
    {
      id: 'TRX-20240813-01',
      category: 'Transfer',
      title: 'Transfer Saldo',
      counterpart: 'Ke PT Cipta Mandiri',
      amount: 'Rp75.000.000',
      date: '2024-08-13T15:30:00',
      status: 'Menunggu Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      method: 'BI Fast',
      reference: 'TRX-20240813-01',
      sourceAccountKey: 'operasional',
      sourceAccount: {
        initial: 'O',
        title: 'Operasional',
        subtitle: 'PT Ambis Sejahtera',
        color: 'bg-cyan-100 text-cyan-600',
      },
      destinationAccount: {
        initial: 'C',
        title: 'PT Cipta Mandiri',
        subtitle: 'BCA • 9988776655',
        color: 'bg-amber-100 text-amber-600',
      },
    },
  ],
  selesai: [
    {
      id: 'TRX-20240810-01',
      category: 'Transfer',
      title: 'Transfer Saldo',
      counterpart: 'Ke PT Prima Utama',
      amount: 'Rp500.000.000',
      date: '2024-08-10T11:00:00',
      status: 'Selesai',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      method: 'RTGS',
      reference: 'TRX-20240810-01',
      sourceAccountKey: 'utama',
      sourceAccount: {
        initial: 'U',
        title: 'Rekening Utama',
        subtitle: 'PT Ambis Sejahtera',
        color: 'bg-emerald-100 text-emerald-600',
      },
      destinationAccount: {
        initial: 'P',
        title: 'PT Prima Utama',
        subtitle: 'BCA • 1122003344',
        color: 'bg-amber-100 text-amber-600',
      },
    },
    {
      id: 'BLR-20240811-01',
      category: 'Beli Bayar',
      title: 'Pembayaran Air',
      counterpart: 'Tagihan PDAM',
      amount: 'Rp750.000',
      date: '2024-08-11T08:15:00',
      status: 'Selesai',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      sourceAccountKey: 'operasional',
      sourceAccount: 'Operasional • BCA 1234567890',
      customerId: 'PLG-773311',
      customerName: 'PT Ambis Sejahtera',
      adminFee: 'Rp2.000',
      totalAmount: 'Rp752.000',
      paymentLabel: 'Tagihan PDAM',
      statusLabel: 'Berhasil',
    },
    {
      id: 'APR-20240809-01',
      category: 'Approval Matrix',
      title: 'Ubah Persetujuan Transfer',
      counterpart: 'Limit Rp200.000.000',
      amount: '',
      date: '2024-08-09T14:40:00',
      status: 'Selesai',
      sourcePage: 'atur-persetujuan.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      approvalMatrix: [
        { min: 0, max: 100_000_000, approvers: 1 },
        { min: 100_000_001, max: 200_000_000, approvers: 2 },
      ],
    },
    {
      id: 'TRX-20240808-01',
      category: 'Transfer',
      title: 'Transfer Saldo',
      counterpart: 'Ke PT Nusantara',
      amount: 'Rp150.000.000',
      date: '2024-08-08T10:00:00',
      status: 'Selesai',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
      method: 'BI Fast',
      reference: 'TRX-20240808-01',
      sourceAccountKey: 'operasional',
      sourceAccount: {
        initial: 'O',
        title: 'Operasional',
        subtitle: 'PT Ambis Sejahtera',
        color: 'bg-cyan-100 text-cyan-600',
      },
      destinationAccount: {
        initial: 'N',
        title: 'PT Nusantara',
        subtitle: 'Mandiri • 6677889900',
        color: 'bg-amber-100 text-amber-600',
      },
    },
  ],
};

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
let activeTab = 'butuh';

const CATEGORY_CLASS_MAP = {
  Transfer: '',
  'Beli Bayar': '',
  'Limit Management': '',
  'Approval Matrix': '',
};

const CATEGORY_BADGE_BASE = 'inline-flex items-center px-3 py-1';

const CURRENCY_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const detailState = {
  currentItemId: null,
};

const drawer = document.getElementById('drawer');
const drawerCloseBtn = document.getElementById('approvalDrawerClose');
const paneHost = document.getElementById('detailPaneHost');
const paneCreator = document.getElementById('detailPaneCreator');
const paneDate = document.getElementById('detailPaneDate');
const paneApprovalStatus = document.getElementById('detailApprovalStatus');
const paneApprovalList = document.getElementById('detailApprovalList');

const drawerController =
  drawer && window.drawerManager && typeof window.drawerManager.register === 'function'
    ? window.drawerManager.register(drawer, { manageAria: true })
    : null;

const TEMPLATE_SOURCES = {
  transfer: { url: 'transfer.html', selector: '#successPane', type: 'transfer' },
  'beli bayar': { url: 'biller.html', selector: '#paymentSuccessInner', type: 'biller' },
  'approval matrix': { url: 'atur-persetujuan.html', selector: '#approvalPendingPane', type: 'approval' },
};

const RANDOM_NAMES = [
  'Nadia Paramitha',
  'Reyhan Alfaro',
  'Hanna Saputra',
  'Mira Pradipta',
  'Rizky Narendra',
  'Fajar Maheswara',
  'Alika Rachman',
  'Sari Widyaningrum',
];

const RANDOM_NOTE_WORDS = [
  'cek',
  'ulang',
  'lampiran',
  'sudah',
  'selesai',
  'verifikasi',
  'menunggu',
  'konfirmasi',
  'detail',
  'transaksi',
  'internal',
  'dokumen',
];

const templateCache = new Map();

function getRekeningApi() {
  if (typeof window === 'undefined') return null;
  return window.AMBIS || null;
}

function getRekeningAccounts(api) {
  if (!api) return [];
  if (typeof api.getAccounts === 'function') {
    try {
      const accounts = api.getAccounts({ clone: false });
      if (Array.isArray(accounts)) return accounts;
    } catch (error) {
      try {
        const fallback = api.getAccounts();
        if (Array.isArray(fallback)) return fallback;
      } catch (err) {
        /* ignore */
      }
    }
  }

  if (Array.isArray(api.accounts)) {
    return api.accounts;
  }

  return [];
}

function sanitizeAccountNumber(value) {
  if (!value) return '';
  return String(value).replace(/\D+/g, '');
}

function formatAccountNumberFromData(value) {
  const digits = sanitizeAccountNumber(value);
  if (!digits) {
    return typeof value === 'string' ? value.trim() : '';
  }

  const api = getRekeningApi();
  if (api && typeof api.formatAccountNumber === 'function') {
    try {
      return api.formatAccountNumber(digits);
    } catch (error) {
      /* ignore formatting errors */
    }
  }

  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function resolveAccountFromRekeningData(reference) {
  const api = getRekeningApi();
  if (!api) return null;

  const accounts = getRekeningAccounts(api);
  const candidates = [];

  const pushCandidate = value => {
    if (typeof value === 'string' && value.trim()) {
      candidates.push(value.trim());
    }
  };

  if (reference && typeof reference === 'object' && !Array.isArray(reference)) {
    pushCandidate(reference.accountId);
    pushCandidate(reference.sourceAccountId);
    pushCandidate(reference.sourceAccountKey);
    pushCandidate(reference.id);
    pushCandidate(reference.key);
    pushCandidate(reference.name);
    pushCandidate(reference.displayName);
    pushCandidate(reference.numberRaw);
    pushCandidate(reference.number);
  } else {
    pushCandidate(reference);
  }

  for (const candidate of candidates) {
    if (typeof api.findAccountById === 'function') {
      const direct = api.findAccountById(candidate);
      if (direct) return direct;

      const lower = candidate.toLowerCase();
      if (lower !== candidate) {
        const lowerMatch = api.findAccountById(lower);
        if (lowerMatch) return lowerMatch;
      }
    }

    const numeric = sanitizeAccountNumber(candidate);
    if (numeric && typeof api.findAccountByNumber === 'function') {
      const numberMatch = api.findAccountByNumber(numeric);
      if (numberMatch) return numberMatch;
    }

    const lowerCandidate = candidate.toLowerCase();
    const byName = accounts.find(account => {
      const idMatch = account.id && account.id.toLowerCase() === lowerCandidate;
      const nameMatch = account.name && account.name.toLowerCase() === lowerCandidate;
      const displayMatch = account.displayName && account.displayName.toLowerCase() === lowerCandidate;
      if (idMatch || nameMatch || displayMatch) return true;

      const accountLabel = (account.displayName || account.name || '').toLowerCase();
      if (!accountLabel) return false;

      if (lowerCandidate.includes(accountLabel)) {
        return true;
      }

      const parts = lowerCandidate
        .split(/[•–\-]/)
        .map(part => part.trim())
        .filter(Boolean);

      return parts.some(part => accountLabel.includes(part));
    });

    if (byName) return byName;
  }

  return null;
}

function buildTransferSourceAccount(item) {
  const fallback =
    item && item.sourceAccount && typeof item.sourceAccount === 'object' && !Array.isArray(item.sourceAccount)
      ? { ...item.sourceAccount }
      : {};

  const keyCandidate =
    (item && item.sourceAccountKey) ||
    (item && item.sourceAccountId) ||
    (typeof item?.sourceAccount === 'string' ? item.sourceAccount : '') ||
    fallback.accountId ||
    fallback.id ||
    '';

  const account = resolveAccountFromRekeningData(keyCandidate);

  if (!account) {
    return fallback;
  }

  const formattedNumber = formatAccountNumberFromData(account.numberRaw || account.number);
  const subtitleParts = [];
  if (account.bank) subtitleParts.push(account.bank);
  if (formattedNumber) subtitleParts.push(formattedNumber);

  const subtitle = subtitleParts.join(' • ') || fallback.subtitle || '-';

  const initialSource =
    account.initial ||
    fallback.initial ||
    (account.displayName ? account.displayName.charAt(0).toUpperCase() : '') ||
    (account.name ? account.name.charAt(0).toUpperCase() : '') ||
    (fallback.title ? fallback.title.charAt(0).toUpperCase() : '');

  return {
    initial: initialSource,
    title: account.displayName || account.name || fallback.title || '-',
    subtitle,
    color: account.color || fallback.color || 'bg-cyan-100 text-cyan-600',
  };
}

function resolveSourceAccountDisplay(item) {
  if (!item) return '-';

  const keyCandidate =
    (item && item.sourceAccountKey) ||
    (item && item.sourceAccountId) ||
    (typeof item?.sourceAccount === 'string' ? item.sourceAccount : '') ||
    '';

  const account = resolveAccountFromRekeningData(keyCandidate);

  if (account) {
    const formattedNumber = formatAccountNumberFromData(account.numberRaw || account.number);
    const name = account.displayName || account.name || '';
    if (name && formattedNumber) {
      return `${name} – ${formattedNumber}`;
    }
    if (name) return name;
    if (formattedNumber) return formattedNumber;
  }

  if (typeof item.sourceAccount === 'string' && item.sourceAccount.trim()) {
    return item.sourceAccount.trim();
  }

  return '-';
}

function stripPaneChrome(pane) {
  if (!pane) return;

  const headerSelectors = ['#successHeaderClose', '#successTitle', '#approvalPendingClose'];
  headerSelectors.forEach(selector => {
    const node = pane.querySelector(selector);
    if (!node) return;
    const bordered = node.closest('.border-b');
    if (bordered && bordered.parentElement === pane) {
      bordered.remove();
      return;
    }
    const parentDiv = node.closest('div');
    if (parentDiv && parentDiv !== pane && parentDiv.parentElement === pane) {
      parentDiv.remove();
    }
  });

  const footerSelectors = [
    '#successCloseBtn',
    '#successDrawerCloseButton',
    '#successDrawerStatusButton',
    '#approvalPendingDismiss',
    '#approvalPendingViewProcess',
  ];

  const removed = new Set();

  footerSelectors.forEach(selector => {
    const node = pane.querySelector(selector);
    if (!node) return;

    const sticky = node.closest('.sticky');
    if (sticky && sticky.parentElement === pane && !removed.has(sticky)) {
      sticky.remove();
      removed.add(sticky);
      return;
    }

    const bordered = node.closest('.border-t');
    if (bordered && bordered.parentElement === pane && !removed.has(bordered)) {
      bordered.remove();
      removed.add(bordered);
      return;
    }

    const container = node.closest('div');
    if (container && container !== pane && container.parentElement === pane && !removed.has(container)) {
      container.remove();
      removed.add(container);
      return;
    }

    if (!removed.has(node)) {
      node.remove();
      removed.add(node);
    }
  });
}

const LEGACY_MONTH_MAP = {
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
  Des: 11,
};

const DATE_FORMAT_SHORT = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DATE_FORMAT_LONG = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function parseDate(value) {
  if (!value) return new Date(Number.NaN);

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [yearStr, monthStr, dayStr] = trimmed.split('-');
      const year = Number(yearStr) || 0;
      const month = (Number(monthStr) || 1) - 1;
      const day = Number(dayStr) || 1;
      return new Date(year, month, day);
    }

    if (trimmed.includes('•')) {
      const [datePart, timePart] = trimmed.split('•').map(part => part.trim());
      const [dayStr, monthStr, yearStr] = (datePart || '').split(' ');
      const [hourStr, minuteStr] = (timePart || '').split(':');
      const monthIdx = LEGACY_MONTH_MAP[monthStr] ?? 0;
      const day = Number(dayStr) || 1;
      const year = Number(yearStr) || 0;
      const hour = Number(hourStr) || 0;
      const minute = Number(minuteStr) || 0;
      return new Date(year, monthIdx, day, hour, minute);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(Number.NaN) : parsed;
}

function formatDateShort(value) {
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? '-' : DATE_FORMAT_SHORT.format(date);
}

function formatDateLong(value) {
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? '-' : DATE_FORMAT_LONG.format(date);
}

function formatDateWithTime(value) {
  const datePart = formatDateLong(value);
  const timePart = formatTime(value);

  if (datePart === '-' && timePart === '-') return '-';
  if (datePart === '-') return timePart;
  if (timePart === '-') return datePart;
  return `${datePart} • ${timePart}`;
}

function formatTime(value, fallback = '') {
  if (fallback) return fallback;
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '-';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseCurrencyValue(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value !== 'string') return Number.NaN;

  const cleaned = value.replace(/[^\d,-]/g, '').replace(/,/g, '.');
  if (!cleaned) return Number.NaN;

  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function formatCurrencyValue(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return CURRENCY_FORMATTER.format(Math.round(value));
}

function formatCurrencyDisplay(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return formatCurrencyValue(value);
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = parseCurrencyValue(value);
    if (!Number.isNaN(parsed)) {
      return formatCurrencyValue(parsed);
    }
    return value.trim();
  }

  return '-';
}

function getItemDateValue(item) {
  if (!item) return null;
  return item.date || item.time || null;
}

function getItemTimeValue(item) {
  if (!item) return '';
  if (typeof item.time === 'string' && item.time.trim()) {
    return item.time.trim();
  }
  return formatTime(getItemDateValue(item));
}

function getDashboardDisplayDateTime(item) {
  const displayDate = formatDateShort(getItemDateValue(item));
  const displayTime = getItemTimeValue(item);
  return displayTime && displayTime !== '-' ? `${displayDate} - ${displayTime}` : displayDate;
}

function getDescriptionParts(item) {
  if (!item) return [];
  const parts = [item.title, item.counterpart, item.subtitle, item.amount, item.description]
    .map(part => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);

  return parts;
}

function getDescriptionLine(item) {
  const parts = getDescriptionParts(item);
  return parts.length ? parts.join(' – ') : '-';
}

function getCategoryKey(category) {
  return typeof category === 'string' ? category.trim().toLowerCase() : '';
}

function getTemplateConfig(category) {
  const key = getCategoryKey(category);
  return TEMPLATE_SOURCES[key] || null;
}

function getRandomFrom(list, fallback = '') {
  if (!Array.isArray(list) || list.length === 0) return fallback;
  const index = Math.floor(Math.random() * list.length);
  return list[index] ?? fallback;
}

function getRandomName() {
  return getRandomFrom(RANDOM_NAMES, 'Admin AMBIS');
}

function getRandomNameList(count) {
  const results = [];
  const pool = Array.isArray(RANDOM_NAMES) ? [...RANDOM_NAMES] : [];

  for (let index = 0; index < count; index += 1) {
    if (pool.length === 0) {
      results.push(`Admin ${index + 1}`);
      continue;
    }

    const pickIndex = Math.floor(Math.random() * pool.length);
    const [name] = pool.splice(pickIndex, 1);
    results.push(name || `Admin ${index + 1}`);
  }

  return results;
}

function generateRandomNote() {
  if (!Array.isArray(RANDOM_NOTE_WORDS) || RANDOM_NOTE_WORDS.length === 0) {
    return 'catatan transaksi';
  }

  const pool = [...RANDOM_NOTE_WORDS];
  const count = Math.floor(Math.random() * 2) + 3; // 3 or 4 words
  const words = [];

  while (words.length < count && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    const [word] = pool.splice(index, 1);
    if (word) {
      words.push(word);
    }
  }

  return words.join(' ');
}

function capitalizeSentence(text) {
  if (typeof text !== 'string') return '-';
  const trimmed = text.trim();
  if (!trimmed) return '-';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function preparePaneElement(element) {
  if (!element) return element;

  element.classList.remove('hidden');
  element.classList.remove('opacity-0');
  element.classList.remove('translate-x-8');
  element.classList.remove('translate-x-full');
  element.classList.remove('translate-y-full');

  return element;
}

function applyBadgeStyles(element, colorClass) {
  if (!element) return;
  const base = 'w-10 h-10 rounded-full flex items-center justify-center font-semibold';
  element.className = `${base} ${colorClass || 'bg-cyan-100 text-cyan-600'}`.trim();
}

function generateWaitingApprovalSteps(count) {
  const numberCount = Number(count);
  const total = Number.isFinite(numberCount) ? Math.max(0, Math.floor(numberCount)) : 0;
  if (total <= 0) return [];

  const approvers = getRandomNameList(total);

  return approvers.map((name, index) => ({
    label: `Approval ${index + 1}`,
    approver: name,
  }));
}

function renderApprovalList(listElement, steps) {
  if (!listElement) return;

  listElement.innerHTML = '';

  if (!Array.isArray(steps) || steps.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'text-sm text-slate-500';
    emptyItem.textContent = 'Belum ada daftar persetujuan.';
    listElement.appendChild(emptyItem);
    return;
  }

  steps.forEach(step => {
    const item = document.createElement('li');
    item.className = 'p4';

    const content = document.createElement('div');
    content.className = 'flex items-center gap-3';

    const badge = document.createElement('span');
    badge.className = 'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700';
    badge.setAttribute('aria-label', 'Menunggu persetujuan');
    badge.innerHTML = `
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" stroke="#F97316" stroke-width="1.5"></circle>
        <path d="M10 6.5V10.25L12.5 11.75" stroke="#F97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <span>Menunggu</span>
    `;

    const textWrap = document.createElement('div');
    textWrap.className = 'flex flex-col';

    const label = document.createElement('span');
    label.className = 'text-sm font-semibold text-slate-900';
    label.textContent = (step && step.label) || 'Approval';

    const caption = document.createElement('span');
    caption.className = 'text-xs text-slate-500';
    caption.textContent = (step && step.approver) || '-';

    textWrap.appendChild(label);
    textWrap.appendChild(caption);

    content.appendChild(badge);
    content.appendChild(textWrap);

    item.appendChild(content);

    listElement.appendChild(item);
  });
}

function updateApprovalStatusText(statusElement, completed, total) {
  if (!statusElement) return;

  const totalNumber = Number(total);
  const completedNumber = Number(completed);
  const safeTotal = Number.isFinite(totalNumber) ? Math.max(0, Math.floor(totalNumber)) : 0;
  const safeCompleted = Number.isFinite(completedNumber)
    ? Math.min(Math.max(0, Math.floor(completedNumber)), safeTotal)
    : 0;

  statusElement.textContent = `${safeCompleted}/${safeTotal}`;
}

function updateApprovalSection(statusElement, listElement, totalSteps = 2, completedSteps = 0) {
  const steps = generateWaitingApprovalSteps(totalSteps);
  renderApprovalList(listElement, steps);
  updateApprovalStatusText(statusElement, completedSteps, steps.length);
}

function setTextContent(element, value) {
  if (!element) return;
  element.textContent = value;
}

function appendDynamicRow(container, label, value) {
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-start justify-between gap-4';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'text-sm text-slate-500';
  labelSpan.textContent = label;

  const valueSpan = document.createElement('span');
  valueSpan.className = 'max-w-[60%] text-right text-sm font-semibold text-slate-900';
  valueSpan.textContent = value;

  wrapper.append(labelSpan, valueSpan);
  container.appendChild(wrapper);
}

function formatApproverLabel(count) {
  if (count == null || Number.isNaN(count)) {
    return '-';
  }
  return `${count} Penyetuju`;
}

function renderApprovalMatrixList(container, entries) {
  if (!container) return;

  if (!Array.isArray(entries) || entries.length === 0) {
    container.innerHTML =
      '<div class="px-5 py-6 text-center text-sm text-slate-500">Belum ada persetujuan transfer.</div>';
    return;
  }

  const html = entries
    .map(entry => {
      const minValue =
        typeof entry.min === 'number' && Number.isFinite(entry.min)
          ? entry.min
          : parseCurrencyValue(entry.min);
      const maxValue =
        typeof entry.max === 'number' && Number.isFinite(entry.max)
          ? entry.max
          : parseCurrencyValue(entry.max);
      const minLabel = Number.isNaN(minValue) ? '-' : formatCurrencyValue(minValue);
      const maxLabel = Number.isNaN(maxValue) ? '-' : formatCurrencyValue(maxValue);
      const approverLabel = formatApproverLabel(entry.approvers);
      return `
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 min-h-[56px] px-5 py-4 text-sm">
          <span class="font-semibold text-slate-900">${minLabel} – ${maxLabel}</span>
          <span class="text-right text-sm font-semibold text-slate-700">${approverLabel}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = html;
}

function bindPaneClosers(element, selectors = []) {
  if (!element) return;
  selectors.forEach(selector => {
    const target = element.querySelector(selector);
    if (target) {
      target.addEventListener('click', () => {
        closeDetailDrawer({ trigger: 'pane-button' });
      });
    }
  });
}

async function loadTemplateElement(config) {
  if (!config) return null;
  const cacheKey = `${config.url}|${config.selector}`;

  if (!templateCache.has(cacheKey)) {
    try {
      const response = await fetch(config.url);
      if (!response.ok) throw new Error(`Gagal memuat template: ${config.url}`);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const element = doc.querySelector(config.selector);
      templateCache.set(cacheKey, element ? element.cloneNode(true) : null);
    } catch (error) {
      console.error(error);
      templateCache.set(cacheKey, null);
    }
  }

  const cached = templateCache.get(cacheKey);
  return cached ? cached.cloneNode(true) : null;
}

function fillTransferPane(pane, item, displayDate, noteText) {
  if (!pane) return;

  const source = buildTransferSourceAccount(item);
  const destination = item && item.destinationAccount ? item.destinationAccount : {};
  const reference = (item && item.reference) || (item && item.id) || '-';
  const method = (item && item.method) || 'BI Fast';
  const amountDisplay = formatCurrencyDisplay(item?.amount);
  const totalDisplay = formatCurrencyDisplay(item?.totalAmount || item?.amount);
  const noteDisplay = capitalizeSentence(noteText);

  preparePaneElement(pane);

  setTextContent(pane.querySelector('#successTitle'), item?.title || 'Detail Transfer');

  applyBadgeStyles(pane.querySelector('#successSourceBadge'), source.color);
  setTextContent(
    pane.querySelector('#successSourceBadge'),
    source.initial || (source.title ? source.title.charAt(0).toUpperCase() : '')
  );
  setTextContent(pane.querySelector('#successSourceName'), source.title || '-');
  setTextContent(pane.querySelector('#successSourceSubtitle'), source.subtitle || '-');

  applyBadgeStyles(pane.querySelector('#successDestBadge'), destination.color);
  setTextContent(
    pane.querySelector('#successDestBadge'),
    destination.initial || (destination.title ? destination.title.charAt(0).toUpperCase() : '')
  );
  setTextContent(pane.querySelector('#successDestName'), destination.title || '-');
  setTextContent(pane.querySelector('#successDestSubtitle'), destination.subtitle || '-');

  setTextContent(pane.querySelector('#successNominal'), amountDisplay);
  setTextContent(pane.querySelector('#successTotal'), totalDisplay);
  setTextContent(pane.querySelector('#successReference'), reference);
  setTextContent(pane.querySelector('#successDate'), displayDate || '-');
  setTextContent(pane.querySelector('#successCategory'), item?.category || '-');
  setTextContent(pane.querySelector('#successNote'), noteDisplay);
  setTextContent(pane.querySelector('#successMethod'), method);

  stripPaneChrome(pane);
}

function fillBillerPane(pane, item, displayDate, noteText) {
  if (!pane) return;

  preparePaneElement(pane);

  setTextContent(pane.querySelector('#successHeroTitle'), item?.title || 'Transaksi Beli & Bayar');
  setTextContent(pane.querySelector('#successHeroCategory'), item?.category || 'Beli & Bayar');
  setTextContent(pane.querySelector('#successPaymentValue'), item?.paymentLabel || item?.counterpart || '-');
  setTextContent(pane.querySelector('#successAccountValue'), resolveSourceAccountDisplay(item));
  setTextContent(pane.querySelector('#successIdValue'), item?.customerId || '-');
  setTextContent(pane.querySelector('#successCustomerName'), item?.customerName || '-');
  setTextContent(pane.querySelector('#successStatusPill'), item?.statusLabel || item?.status || '-');

  setTextContent(pane.querySelector('#successNominal'), formatCurrencyDisplay(item?.amount));
  setTextContent(pane.querySelector('#successAdmin'), formatCurrencyDisplay(item?.adminFee));
  setTextContent(pane.querySelector('#successTotal'), formatCurrencyDisplay(item?.totalAmount || item?.amount));

  const dynamicSection = pane.querySelector('#successDynamicSection');
  if (dynamicSection) {
    dynamicSection.innerHTML = '';
    dynamicSection.classList.remove('hidden');
    appendDynamicRow(dynamicSection, 'Tanggal & Waktu', displayDate || '-');
    appendDynamicRow(dynamicSection, 'Catatan', capitalizeSentence(noteText));
  }

  stripPaneChrome(pane);
}

function fillApprovalPane(pane, item) {
  if (!pane) return;

  preparePaneElement(pane);
  setTextContent(pane.querySelector('h2'), item?.title || 'Approval Matrix');
  const heroHeading = pane.querySelector('h3');
  if (heroHeading) {
    heroHeading.textContent = item?.status || 'Menunggu Persetujuan Admin Lain';
  }
  renderApprovalMatrixList(pane.querySelector('#approvalPendingList'), item?.approvalMatrix || []);

  stripPaneChrome(pane);
}

async function renderDetailPane(item) {
  if (!paneHost) return;

  paneHost.innerHTML = '';

  const config = getTemplateConfig(item?.category);
  const displayDate = item?.__displayDateTime || getDashboardDisplayDateTime(item);
  const note = generateRandomNote();
  const creatorName = getRandomName();

  if (paneCreator) {
    paneCreator.textContent = creatorName;
  }
  if (paneDate) {
    paneDate.textContent = displayDate || '-';
  }

  updateApprovalSection(paneApprovalStatus, paneApprovalList, 2, 0);

  const paneElement = await loadTemplateElement(config);

  if (!paneElement) {
    const fallback = document.createElement('div');
    fallback.className = 'p-6 text-sm text-slate-600';
    fallback.textContent = 'Detail transaksi tidak tersedia.';
    paneHost.appendChild(fallback);
    return;
  }

  paneHost.appendChild(paneElement);

  if (config?.type === 'transfer') {
    fillTransferPane(paneElement, item, displayDate, note);
    bindPaneClosers(paneElement, ['#successHeaderClose', '#successCloseBtn']);
  } else if (config?.type === 'biller') {
    fillBillerPane(paneElement, item, displayDate, note);
    bindPaneClosers(paneElement, ['#successDrawerCloseButton']);
  } else if (config?.type === 'approval') {
    fillApprovalPane(paneElement, item);
    bindPaneClosers(paneElement, ['#approvalPendingClose', '#approvalPendingDismiss']);
  }
}

function getCategoryClass(category) {
  return CATEGORY_CLASS_MAP[category] || '';
}

function highlightActiveRow(itemId, tab) {
  const panel = document.querySelector(`[data-tab-panel="${tab}"]`);
  if (!panel) return;
  const rows = panel.querySelectorAll('tr[data-item-id]');
  rows.forEach(row => {
    const isActive = Boolean(itemId) && row.dataset.itemId === itemId;
    row.classList.toggle('bg-cyan-50', isActive);
    row.classList.toggle('hover:bg-cyan-50', isActive);
    row.classList.toggle('hover:bg-slate-50', !isActive);
  });
}

async function openDetailDrawer(item) {
  if (!item || !drawer) return;

  detailState.currentItemId = item.id || null;

  try {
    await renderDetailPane(item);
  } catch (error) {
    console.error(error);
  }

  highlightActiveRow(detailState.currentItemId, activeTab);

  if (drawerController) {
    drawerController.open({ trigger: 'detail' });
  } else {
    if (!drawer.classList.contains('open')) {
      drawer.classList.add('open');
    }
    drawer.setAttribute('aria-hidden', 'false');
  }
}

function closeDetailDrawer(options = {}) {
  if (!drawer) return;

  if (drawerController) {
    drawerController.close(options);
  } else if (drawer.classList.contains('open')) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  detailState.currentItemId = null;
  highlightActiveRow(null, activeTab);
}

if (drawerCloseBtn) {
  drawerCloseBtn.addEventListener('click', () => closeDetailDrawer({ trigger: 'close-button' }));
}

if (drawer) {
  drawer.addEventListener('drawer:close', () => {
    detailState.currentItemId = null;
    highlightActiveRow(null, activeTab);
  });
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
    kategori: kategoriRaw ? kategoriRaw.split(',').filter(Boolean) : [],
  };
}

function filterByDate(list, value) {
  if (!value) return list;

  const now = new Date();
  return list.filter(item => {
    const dateValue = parseDate(getItemDateValue(item));
    if (Number.isNaN(dateValue.getTime())) return false;

    if (value === '7 Hari Terakhir') {
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      return dateValue >= weekAgo;
    }
    if (value === '30 Hari Terakhir') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      return dateValue >= monthAgo;
    }
    if (value === '1 Tahun Terakhir') {
      const yearAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365);
      return dateValue >= yearAgo;
    }
    if (value.startsWith('custom:')) {
      const [startStr, endStr] = value.slice(7).split('|');
      const start = parseDate(startStr);
      const end = parseDate(endStr);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
      return dateValue >= start && dateValue <= end;
    }

    return true;
  });
}

function filterByKategori(list, values) {
  if (!values.length) return list;
  const valueSet = new Set(values.map(value => value.toLowerCase()));
  return list.filter(item => {
    const rawCategory = item.category || item.activity || item.jenis || '';
    const normalized = rawCategory.toLowerCase();
    return valueSet.has(normalized);
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

  if (detailState.currentItemId) {
    const exists = list.some(item => item.id === detailState.currentItemId);
    if (!exists) {
      closeDetailDrawer({ trigger: 'filter-change' });
    }
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
    tr.dataset.itemId = item.id || '';

    const displayDateTime = getDashboardDisplayDateTime(item);
    item.__displayDateTime = displayDateTime;
    const categoryClass = `${CATEGORY_BADGE_BASE} ${getCategoryClass(item.category)}`;
    const actionLabel = item.action && item.action.label ? item.action.label : 'Detail';
    const descriptionLine = getDescriptionLine(item);

    tr.innerHTML = `
      <td class="px-4 py-3 align-top">
        <div class="text-sm font-semibold text-slate-900">${displayDateTime}</div>
      </td>
      <td class="px-4 py-3 align-top">
        <span class="${categoryClass}">${item.category || '-'}</span>
      </td>
      <td class="px-4 py-3">
        <p class="text-sm font-semibold text-slate-900">${descriptionLine}</p>
      </td>
      <td class="px-4 py-3 text-right align-top">
        <button type="button" class="px-4 py-1 rounded-lg border border-cyan-500 text-cyan-600 hover:bg-cyan-50" data-role="detail-button">${actionLabel}</button>
      </td>
    `;

    const detailButton = tr.querySelector('[data-role="detail-button"]');
    if (detailButton) {
      detailButton.addEventListener('click', () => {
        if (item.action && item.action.type && item.action.type !== 'drawer') {
          if (item.sourcePage) {
            window.location.href = item.sourcePage;
          }
          return;
        }
        openDetailDrawer(item);
      });
    }

    tbody.appendChild(tr);
  });

  highlightActiveRow(detailState.currentItemId, tab);
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
  if (tab === activeTab) return;

  closeDetailDrawer({ trigger: 'tab-change' });

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
render(activeTab);

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
