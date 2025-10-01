const approvalsData = {
  butuh: [
    {
      id: 'T001',
      category: 'Transfer',
      title: 'Transfer Rp100.000.000 ke PT Maju Jaya',
      date: '2025-09-28',
      status: 'Butuh Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'B001',
      category: 'Beli Bayar',
      title: 'Pembayaran PLN Rp2.000.000',
      date: '2025-09-29',
      status: 'Butuh Persetujuan',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'T002',
      category: 'Transfer',
      title: 'Transfer Rp250.000.000 ke PT Sejahtera',
      date: '2025-09-27',
      status: 'Butuh Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'LM001',
      category: 'Limit Management',
      title: 'Perubahan Batas Transaksi Rp300.000.000',
      date: '2025-09-25',
      status: 'Butuh Persetujuan',
      sourcePage: 'batas-transaksi.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'T003',
      category: 'Transfer',
      title: 'Transfer Rp50.000.000 ke CV Karya Abadi',
      date: '2025-09-28',
      status: 'Butuh Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
  ],
  menunggu: [
    {
      id: 'T004',
      category: 'Transfer',
      title: 'Transfer Rp400.000.000 ke PT Mega Finance',
      date: '2025-09-26',
      status: 'Menunggu Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'B002',
      category: 'Beli Bayar',
      title: 'Pembayaran Internet Rp1.500.000',
      date: '2025-09-24',
      status: 'Menunggu Persetujuan',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'T005',
      category: 'Transfer',
      title: 'Transfer Rp75.000.000 ke PT Cipta Mandiri',
      date: '2025-09-23',
      status: 'Menunggu Persetujuan',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
  ],
  selesai: [
    {
      id: 'T006',
      category: 'Transfer',
      title: 'Transfer Rp500.000.000 ke PT Prima Utama',
      date: '2025-09-20',
      status: 'Selesai',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'B003',
      category: 'Beli Bayar',
      title: 'Pembayaran PDAM Rp750.000',
      date: '2025-09-21',
      status: 'Selesai',
      sourcePage: 'biller.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'AM001',
      category: 'Approval Matrix',
      title: 'Ubah Persetujuan Transfer Rp200.000.000',
      date: '2025-09-19',
      status: 'Selesai',
      sourcePage: 'atur-persetujuan.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
    {
      id: 'T007',
      category: 'Transfer',
      title: 'Transfer Rp150.000.000 ke PT Nusantara',
      date: '2025-09-18',
      status: 'Selesai',
      sourcePage: 'transfer.html',
      action: { label: 'Detail', type: 'drawer', task: 'pending' },
    },
  ],
};

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
let activeTab = 'butuh';

const SOURCE_LABELS = {
  'transfer.html': 'Halaman Transfer',
  'biller.html': 'Halaman Beli & Bayar',
  'batas-transaksi.html': 'Halaman Limit Management',
  'atur-persetujuan.html': 'Halaman Approval Matrix',
};

const CATEGORY_CLASS_MAP = {
  Transfer: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  'Beli Bayar': 'bg-amber-50 text-amber-700 border-amber-200',
  'Limit Management': 'bg-sky-50 text-sky-800 border-sky-200',
  'Approval Matrix': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_CLASS_MAP = {
  'Butuh Persetujuan': 'bg-amber-50 text-amber-700 border-amber-200',
  'Menunggu Persetujuan': 'bg-sky-50 text-sky-800 border-sky-200',
  Selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const CATEGORY_BADGE_BASE = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border';
const STATUS_BADGE_BASE = 'inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border';
const LINK_DISABLED_CLASSES = ['pointer-events-none', 'opacity-50'];

const detailState = {
  currentItemId: null,
};

const drawer = document.getElementById('drawer');
const drawerCloseBtn = document.getElementById('approvalDrawerClose');
const drawerElements = {
  title: document.getElementById('approvalDrawerTitle'),
  id: document.getElementById('approvalDrawerId'),
  category: document.getElementById('approvalDrawerCategory'),
  status: document.getElementById('approvalDrawerStatus'),
  date: document.getElementById('approvalDrawerDate'),
  sourceLabel: document.getElementById('approvalDrawerSourceLabel'),
  detail: document.getElementById('approvalDrawerDetail'),
  sourceLink: document.getElementById('approvalDrawerSourceLink'),
};

const drawerController =
  drawer && window.drawerManager && typeof window.drawerManager.register === 'function'
    ? window.drawerManager.register(drawer, { manageAria: true })
    : null;

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

function getItemDateValue(item) {
  if (!item) return null;
  return item.date || item.time || null;
}

function getSourceLabel(sourcePage) {
  if (!sourcePage) return 'Halaman Sumber';
  return SOURCE_LABELS[sourcePage] || sourcePage;
}

function getCategoryClass(category) {
  return CATEGORY_CLASS_MAP[category] || 'bg-slate-100 text-slate-600 border-slate-200';
}

function getStatusClass(status) {
  return STATUS_CLASS_MAP[status] || 'bg-slate-100 text-slate-600 border-slate-200';
}

function setDrawerLinkState(enabled, label, href) {
  const link = drawerElements.sourceLink;
  if (!link) return;

  if (enabled && href) {
    link.href = href;
    link.textContent = label || 'Buka halaman sumber';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    link.setAttribute('aria-disabled', 'false');
    LINK_DISABLED_CLASSES.forEach(cls => link.classList.remove(cls));
  } else {
    link.href = '#';
    link.textContent = label || 'Halaman sumber tidak tersedia';
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.setAttribute('aria-disabled', 'true');
    LINK_DISABLED_CLASSES.forEach(cls => link.classList.add(cls));
  }
}

function updateDrawerContent(item) {
  const titleEl = drawerElements.title;
  const idEl = drawerElements.id;
  const categoryEl = drawerElements.category;
  const statusEl = drawerElements.status;
  const dateEl = drawerElements.date;
  const sourceLabelEl = drawerElements.sourceLabel;
  const detailEl = drawerElements.detail;

  if (!item) {
    if (titleEl) titleEl.textContent = 'Detail Persetujuan';
    if (idEl) idEl.textContent = '-';
    if (categoryEl) categoryEl.textContent = '-';
    if (statusEl) {
      statusEl.textContent = '-';
      statusEl.className = `${STATUS_BADGE_BASE} bg-slate-100 text-slate-600 border-slate-200`;
    }
    if (dateEl) dateEl.textContent = '-';
    if (sourceLabelEl) sourceLabelEl.textContent = '-';
    if (detailEl) detailEl.textContent = '-';
    setDrawerLinkState(false, 'Halaman sumber tidak tersedia');
    return;
  }

  const sourceLabel = getSourceLabel(item.sourcePage);
  const formattedDate = formatDateLong(getItemDateValue(item));
  const statusClass = `${STATUS_BADGE_BASE} ${getStatusClass(item.status)}`;

  if (titleEl) titleEl.textContent = item.title || 'Detail Persetujuan';
  if (idEl) idEl.textContent = item.id || '-';
  if (categoryEl) categoryEl.textContent = item.category || '-';
  if (statusEl) {
    statusEl.textContent = item.status || '-';
    statusEl.className = statusClass;
  }
  if (dateEl) dateEl.textContent = formattedDate;
  if (sourceLabelEl) sourceLabelEl.textContent = sourceLabel;

  if (detailEl) {
    const detailParts = [];
    if (item.title) detailParts.push(item.title);
    if (item.status) detailParts.push(`Status saat ini: ${item.status}.`);
    if (sourceLabel) detailParts.push(`Diajukan melalui ${sourceLabel}.`);
    detailEl.textContent = detailParts.join(' ');
  }

  const linkLabel = sourceLabel ? `Lihat ${sourceLabel}` : 'Buka halaman sumber';
  setDrawerLinkState(Boolean(item.sourcePage), linkLabel, item.sourcePage || '#');
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

function openDetailDrawer(item) {
  if (!item || !drawer) return;

  detailState.currentItemId = item.id || null;
  updateDrawerContent(item);
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

    const displayDate = formatDateShort(getItemDateValue(item));
    const categoryClass = `${CATEGORY_BADGE_BASE} ${getCategoryClass(item.category)}`;
    const statusClass = `${STATUS_BADGE_BASE} ${getStatusClass(item.status)}`;
    const sourceLabel = getSourceLabel(item.sourcePage);
    const actionLabel = item.action && item.action.label ? item.action.label : 'Detail';

    tr.innerHTML = `
      <td class="px-4 py-3 align-top">
        <div class="text-sm text-slate-600">${displayDate}</div>
      </td>
      <td class="px-4 py-3 align-top">
        <span class="${categoryClass}">${item.category || '-'}</span>
      </td>
      <td class="px-4 py-3">
        <p class="font-semibold text-slate-900">${item.title || '-'}</p>
        <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>ID: ${item.id || '-'}</span>
          <span class="${statusClass}">${item.status || '-'}</span>
        </div>
        <p class="mt-2 text-sm text-slate-400">Sumber: ${sourceLabel}</p>
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
