document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('mutasiAccountGrid');

  const drawer = document.getElementById('drawer');
  const drawerController =
    window.drawerManager && typeof window.drawerManager.register === 'function'
      ? window.drawerManager.register(drawer)
      : null;
  const drawerInner = document.getElementById('mutasiDrawerInner');
  const closeBtn = document.getElementById('mutasiDrawerClose');
  const drawerTitle = document.getElementById('mutasiDrawerTitle');
  const drawerAccountLabel = document.getElementById('mutasiDrawerAccountLabel');
  const loadingEl = document.getElementById('mutasiLoading');
  const errorEl = document.getElementById('mutasiError');
  const emptyEl = document.getElementById('mutasiEmpty');
  const successEl = document.getElementById('mutasiSuccess');
  const listEl = document.getElementById('mutasiTransactionList');
  const retryBtn = document.getElementById('mutasiRetry');
  const filterGroup = document.querySelector('[data-filter-group="mutasi"]');
  const detailOverlay = document.getElementById('mutasiDetailOverlay');
  const detailSheet = document.getElementById('mutasiDetailSheet');
  const detailSheetState = {};
  const detailSheetController = window.bottomSheetManager?.create({
    overlay: detailOverlay,
    sheet: detailSheet,
    state: detailSheetState,
  });
  const detailContent = document.getElementById('mutasiDetailView');
  const detailCloseButtons = document.querySelectorAll('[data-mutasi-detail-close]');
  const detailElements = {
    activity: document.getElementById('mutasiDetailActivity'),
    total: document.getElementById('mutasiDetailTotal'),
    method: document.getElementById('mutasiDetailMethod'),
    reference: document.getElementById('mutasiDetailReference'),
    date: document.getElementById('mutasiDetailDate'),
    category: document.getElementById('mutasiDetailCategory'),
    note: document.getElementById('mutasiDetailNote'),
  };
  const detailAccounts = {
    source: {
      badge: document.getElementById('mutasiDetailSourceBadge'),
      name: document.getElementById('mutasiDetailSourceName'),
      subtitle: document.getElementById('mutasiDetailSourceSubtitle'),
      account: document.getElementById('mutasiDetailSourceAccount'),
    },
    destination: {
      badge: document.getElementById('mutasiDetailDestinationBadge'),
      name: document.getElementById('mutasiDetailDestinationName'),
      subtitle: document.getElementById('mutasiDetailDestinationSubtitle'),
      account: document.getElementById('mutasiDetailDestinationAccount'),
    },
  };

  const formatter = new Intl.NumberFormat('id-ID');
  const dataSource = window.MUTASI_DATA || null;
  const ambis = window.AMBIS || {};
  const CATEGORY_OPTIONS = [
    'Tagihan',
    'Pembayaran',
    'Transportasi',
    'Pemindahan Dana',
    'Investasi',
    'Lainnya',
  ];
  const tabButtons = {
    mutasi: document.querySelector('[data-tab-button="mutasi"]'),
    'e-statement': document.querySelector('[data-tab-button="e-statement"]'),
  };
  const tabContents = {
    mutasi: document.querySelector('[data-tab-content="mutasi"]'),
    'e-statement': document.querySelector('[data-tab-content="e-statement"]'),
  };
  const eStatementElements = {
    yearTrigger: document.getElementById('eStatementYearTrigger'),
    yearLabel: document.getElementById('eStatementYearLabel'),
    yearPanel: document.getElementById('eStatementYearPanel'),
    monthTrigger: document.getElementById('eStatementMonthTrigger'),
    monthLabel: document.getElementById('eStatementMonthLabel'),
    monthPanel: document.getElementById('eStatementMonthPanel'),
    downloadBtn: document.getElementById('eStatementDownloadBtn'),
    alert: document.getElementById('eStatementAlert'),
  };
  const DEFAULT_LABELS = {
    year: 'Pilih Tahun',
    month: 'Pilih Bulan',
  };
  const dropdowns = {
    year: {
      trigger: eStatementElements.yearTrigger,
      panel: eStatementElements.yearPanel,
      label: eStatementElements.yearLabel,
      options: [],
    },
    month: {
      trigger: eStatementElements.monthTrigger,
      panel: eStatementElements.monthPanel,
      label: eStatementElements.monthLabel,
      options: [],
    },
  };

  let activeAccount = null;
  let activeData = null;
  let detailIsOpen = false;
  let loadTimer = null;
  let activeTab = 'mutasi';
  let eStatementYear = '';
  let eStatementMonth = '';
  let openDropdown = null;
  const savedFiltersByAccount = new Map();

  function closeDropdownMenu(target) {
    if (!target || !target.panel) return;
    target.panel.classList.add('hidden');
    if (target.trigger) {
      target.trigger.setAttribute('aria-expanded', 'false');
    }
    if (openDropdown === target) {
      openDropdown = null;
    }
  }

  function openDropdownMenu(target) {
    if (!target || !target.panel) return;
    if (openDropdown && openDropdown !== target) {
      closeDropdownMenu(openDropdown);
    }
    target.panel.classList.remove('hidden');
    if (target.trigger) {
      target.trigger.setAttribute('aria-expanded', 'true');
    }
    openDropdown = target;
  }

  function updateDropdownSelection(type, value) {
    const dropdown = dropdowns[type];
    if (!dropdown || !dropdown.options) return;
    dropdown.options.forEach((option) => {
      const isSelected = Boolean(value) && option.dataset.value === value;
      option.classList.toggle('bg-slate-100', isSelected);
      option.classList.toggle('text-cyan-600', isSelected);
      option.classList.toggle('font-semibold', isSelected);
    });
  }

  function hideEStatementAlert() {
    const alertEl = eStatementElements.alert;
    if (!alertEl) return;
    alertEl.classList.add('hidden');
    alertEl.textContent = '';
  }

  function updateEStatementButtonState() {
    const btn = eStatementElements.downloadBtn;
    if (!btn) return;
    const shouldEnable = Boolean(eStatementYear) && Boolean(eStatementMonth);
    btn.disabled = !shouldEnable;
    if (!shouldEnable) {
      hideEStatementAlert();
    }
  }

  function getBrandName() {
    if (ambis && typeof ambis.getBrandName === 'function') {
      const result = ambis.getBrandName();
      if (typeof result === 'string' && result.trim()) {
        return result.trim();
      }
    }
    if (ambis && typeof ambis.brandName === 'string' && ambis.brandName.trim()) {
      return ambis.brandName.trim();
    }
    const node = document.getElementById('brandName');
    if (node && node.textContent && node.textContent.trim()) {
      return node.textContent.trim();
    }
    return 'Perusahaan Anda';
  }

  function getUserEmail() {
    if (ambis) {
      if (typeof ambis.getActiveUser === 'function') {
        const activeUser = ambis.getActiveUser();
        if (activeUser && typeof activeUser.email === 'string' && activeUser.email.trim()) {
          return activeUser.email.trim();
        }
      }
      if (typeof ambis.getUser === 'function') {
        const user = ambis.getUser();
        if (user && typeof user.email === 'string' && user.email.trim()) {
          return user.email.trim();
        }
      }
      const candidates = [
        ambis.userEmail,
        ambis.email,
        ambis.user && ambis.user.email,
        ambis.profile && ambis.profile.email,
      ];
      for (let index = 0; index < candidates.length; index += 1) {
        const candidate = candidates[index];
        if (typeof candidate === 'string') {
          const trimmed = candidate.trim();
          if (trimmed) {
            return trimmed;
          }
        }
      }
    }
    const node = document.querySelector('[data-user-email]');
    if (node && node.textContent && node.textContent.trim()) {
      const text = node.textContent.trim();
      if (text.includes('@')) {
        return text;
      }
    }
    return 'indra.buana@abc.id';
  }

  function showEStatementAlert() {
    const alertEl = eStatementElements.alert;
    if (!alertEl) return;
    const email = getUserEmail();
    const brandName = getBrandName();
    alertEl.textContent = '';
    const line1 = document.createElement('p');
    line1.className = 'font-semibold';
    line1.textContent = `e-Statement berhasil diunduh dan dikirim ke email ${email}`;
    const line2 = document.createElement('p');
    line2.className = 'mt-1';
    line2.textContent = `dan juga disimpan kedalam fitur Brankas Dokumen pada aplikasi Amar Bank Bisnis milik ${brandName}`;
    alertEl.appendChild(line1);
    alertEl.appendChild(line2);
    alertEl.classList.remove('hidden');
    alertEl.setAttribute('role', 'alert');
  }

  function resetEStatement() {
    eStatementYear = '';
    eStatementMonth = '';
    if (dropdowns.year.label) {
      dropdowns.year.label.textContent = DEFAULT_LABELS.year;
    }
    if (dropdowns.month.label) {
      dropdowns.month.label.textContent = DEFAULT_LABELS.month;
    }
    if (openDropdown) {
      closeDropdownMenu(openDropdown);
    }
    updateDropdownSelection('year', '');
    updateDropdownSelection('month', '');
    hideEStatementAlert();
    updateEStatementButtonState();
  }

  function setupDropdown(type) {
    const dropdown = dropdowns[type];
    if (!dropdown) return;
    const trigger = dropdown.trigger;
    const panel = dropdown.panel;
    if (!trigger || !panel) return;
    const options = Array.from(panel.querySelectorAll('button[data-value]'));
    dropdown.options = options;
    trigger.addEventListener('click', () => {
      if (panel.classList.contains('hidden')) {
        openDropdownMenu(dropdown);
      } else {
        closeDropdownMenu(dropdown);
      }
    });
    options.forEach((option) => {
      option.addEventListener('click', () => {
        const value = option.dataset.value || '';
        const labelText = option.textContent ? option.textContent.trim() : '';
        if (type === 'year') {
          eStatementYear = value;
          if (dropdown.label) {
            dropdown.label.textContent = labelText || DEFAULT_LABELS.year;
          }
        } else if (type === 'month') {
          eStatementMonth = value;
          if (dropdown.label) {
            dropdown.label.textContent = labelText || DEFAULT_LABELS.month;
          }
        }
        updateDropdownSelection(type, value);
        closeDropdownMenu(dropdown);
        hideEStatementAlert();
        updateEStatementButtonState();
      });
    });
  }

  function setActiveTab(name) {
    if (!tabButtons[name] || !tabContents[name]) return;
    activeTab = name;

    Object.keys(tabButtons).forEach((key) => {
      const button = tabButtons[key];
      if (!button) return;
      const isActive = key === name;
      button.classList.toggle('bg-white', isActive);
      button.classList.toggle('text-slate-900', isActive);
      button.classList.toggle('shadow-sm', isActive);
      button.classList.toggle('text-slate-400', !isActive);
      button.classList.toggle('hover:text-slate-600', !isActive);
      button.setAttribute('aria-current', isActive ? 'true' : 'false');
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    Object.keys(tabContents).forEach((key) => {
      const content = tabContents[key];
      if (!content) return;
      if (key === name) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });

    if (name !== 'e-statement' && openDropdown) {
      closeDropdownMenu(openDropdown);
    }

    if (name === 'mutasi') {
      applyFiltersAndRender();
    } else if (name === 'e-statement') {
      updateEStatementButtonState();
    }
  }

  function getAccounts() {
    if (typeof ambis.getAccounts === 'function') {
      return ambis.getAccounts({ clone: false }) || [];
    }
    if (Array.isArray(ambis.accounts)) {
      return ambis.accounts;
    }
    return [];
  }

  function formatCurrency(amount) {
    const value = Math.abs(Number(amount) || 0);
    return `Rp${formatter.format(value)}`;
  }

  function normaliseDetailValue(value, fallback = '-') {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
  }

  function setDetailText(element, value, fallback) {
    if (!element) return;
    element.textContent = normaliseDetailValue(value, fallback);
  }

  function getInitial(value) {
    if (!value) return '-';
    const str = value.toString().trim();
    return str ? str.charAt(0).toUpperCase() : '-';
  }

  function setDetailAccount(section, info) {
    const target = detailAccounts[section];
    if (!target) return;
    const name = info && (info.name || info.label || info.title) ? (info.name || info.label || info.title) : '';
    const subtitle = info && (info.subtitle || info.company) ? (info.subtitle || info.company) : '';
    const account = info && (info.account || info.number || info.detail) ? (info.account || info.number || info.detail) : '';
    if (target.badge) {
      const badgeSource = info && info.badge ? info.badge : name;
      target.badge.textContent = getInitial(badgeSource);
    }
    setDetailText(target.name, name);
    setDetailText(target.subtitle, subtitle);
    setDetailText(target.account, account);
  }

  function formatDetailDateTime(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' && value.trim() ? value : '';
    }
    const dateText = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return dateText;
  }

  function generateMockTime() {
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return `${hours}.${minutes}`;
  }

  function resolveTransactionCategory(transaction) {
    if (!transaction) return 'Lainnya';
    const rawCategory = transaction.detail && transaction.detail.category
      ? transaction.detail.category.toString().trim()
      : '';
    if (rawCategory) {
      const match = CATEGORY_OPTIONS.find(
        (label) => label.toLowerCase() === rawCategory.toLowerCase(),
      );
      if (match) return match;
    }
    const type = (transaction.type || '').toLowerCase();
    if (type === 'masuk' || type === 'keluar') {
      return 'Pemindahan Dana';
    }
    return 'Lainnya';
  }

  function fillDetailSheet(transaction, options = {}) {
    const detail = (transaction && transaction.detail) || {};
    setDetailText(detailElements.activity, detail.activity || 'Transfer Saldo');
    const totalAmount = detail.total !== undefined && detail.total !== null ? detail.total : transaction.amount;
    setDetailText(detailElements.total, formatCurrency(totalAmount || 0));
    setDetailText(detailElements.method, detail.method);
    setDetailText(detailElements.reference, detail.reference);
    const groupLabel = transaction ? transaction.__groupLabel : '';
    const mockTime = options.time || generateMockTime();
    if (groupLabel) {
      setDetailText(detailElements.date, `${groupLabel}, ${mockTime}`);
    } else {
      const fallbackDate = formatDetailDateTime(detail.datetime || detail.date);
      if (fallbackDate) {
        setDetailText(detailElements.date, `${fallbackDate}, ${mockTime}`);
      } else {
        setDetailText(detailElements.date, mockTime);
      }
    }
    const categoryLabel = transaction ? transaction.__categoryLabel : null;
    setDetailText(
      detailElements.category,
      categoryLabel || resolveTransactionCategory(transaction),
      'Lainnya',
    );
    setDetailText(detailElements.note, detail.note);
    setDetailAccount('source', detail.source || {});
    setDetailAccount('destination', detail.destination || {});
  }

  function openDetailSheet(transaction) {
    if (!detailSheet || !detailOverlay) return;
    fillDetailSheet(transaction || {}, { time: generateMockTime() });
    detailIsOpen = true;
    if (detailContent) {
      detailContent.scrollTo({ top: 0, behavior: 'auto' });
    }
    if (detailSheetController) {
      detailSheetController.open();
    } else if (detailOverlay && detailSheet) {
      detailOverlay.classList.remove('hidden');
      requestAnimationFrame(() => {
        detailOverlay.classList.add('opacity-100');
        detailSheet.classList.remove('translate-y-full');
      });
    }
  }

  function closeDetailSheet(immediate = false) {
    if (!detailSheet || !detailOverlay) return;
    if (!detailIsOpen && !immediate) return;

    detailIsOpen = false;
    if (detailSheetController) {
      detailSheetController.close({ immediate });
    } else if (detailSheet && detailOverlay) {
      detailSheet.classList.add('translate-y-full');
      detailOverlay.classList.remove('opacity-100');
      if (immediate) {
        detailOverlay.classList.add('hidden');
      } else {
        setTimeout(() => {
          if (!detailIsOpen) {
            detailOverlay.classList.add('hidden');
          }
        }, 200);
      }
    }
  }

  function showState(state) {
    const mapping = {
      loading: loadingEl,
      error: errorEl,
      empty: emptyEl,
      success: successEl,
    };

    Object.values(mapping).forEach((el) => {
      if (el) el.classList.add('hidden');
    });

    if (state !== 'success') {
      closeDetailSheet(true);
    }

    if (state === 'loading') {
      if (loadingEl) loadingEl.classList.remove('hidden');
      return;
    }

    if (state === 'error') {
      if (errorEl) errorEl.classList.remove('hidden');
      return;
    }

    if (state === 'empty') {
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (state === 'success') {
      if (successEl) successEl.classList.remove('hidden');
    }
  }

  function resetFilters() {
    if (!filterGroup) return;
    const filters = filterGroup.querySelectorAll('.filter');
    filters.forEach((filter) => {
      filter.dataset.applied = '';
      const label = filter.querySelector('.filter-label');
      if (label) {
        label.textContent = filter.dataset.default || '';
      }
      filter.querySelectorAll('input').forEach((input) => {
        if (input.type === 'radio' || input.type === 'checkbox') {
          input.checked = false;
        } else {
          input.value = '';
          if (input._airDatepicker) input._airDatepicker.clear();
        }
      });
      const custom = filter.querySelector('.custom-range');
      if (custom) custom.classList.add('hidden');
    });
  }

  function resolveAccountKey(account) {
    if (!account) return '__default__';
    const candidates = [
      account.id,
      account.numberRaw,
      account.number,
      account.displayName,
      account.name,
    ];

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (candidate === null || candidate === undefined) continue;
      const value = typeof candidate === 'string' ? candidate : String(candidate);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    return '__default__';
  }

  function persistCurrentFilters() {
    if (!filterGroup || !activeAccount) return;
    const accountKey = resolveAccountKey(activeAccount);
    if (!accountKey) return;

    const filters = {};
    let hasApplied = false;
    filterGroup.querySelectorAll('.filter').forEach((filter) => {
      const filterName = filter.dataset.filter;
      if (!filterName) return;

      const applied = filter.dataset.applied || '';
      const labelEl = filter.querySelector('.filter-label');
      const labelText = labelEl && typeof labelEl.textContent === 'string'
        ? labelEl.textContent
        : (filter.dataset.default || '');

      if (applied) {
        hasApplied = true;
      }

      filters[filterName] = {
        applied,
        label: labelText,
      };
    });

    if (!hasApplied) {
      savedFiltersByAccount.delete(accountKey);
      return;
    }

    savedFiltersByAccount.set(accountKey, filters);
  }

  function restoreFiltersForAccount(account) {
    if (!filterGroup) return;
    const accountKey = resolveAccountKey(account);
    if (!accountKey) return;

    const saved = savedFiltersByAccount.get(accountKey);
    if (!saved) return;

    filterGroup.querySelectorAll('.filter').forEach((filter) => {
      const filterName = filter.dataset.filter;
      if (!filterName) return;
      const state = saved[filterName];
      if (!state) return;

      const applied = typeof state.applied === 'string' ? state.applied : '';
      const labelText = typeof state.label === 'string' && state.label.trim()
        ? state.label
        : (filter.dataset.default || '');

      filter.dataset.applied = applied;
      const labelEl = filter.querySelector('.filter-label');
      if (labelEl) {
        labelEl.textContent = labelText;
      }

      if (typeof filter._setTriggerState === 'function') {
        filter._setTriggerState(Boolean(applied));
      }
    });
  }

  function getDataForAccount(account) {
    if (!account) return { status: 'empty', groups: [] };
    const key = account.id || account.numberRaw || account.number || '';
    if (dataSource && typeof dataSource.get === 'function') {
      return dataSource.get(key);
    }
    return { status: 'empty', groups: [] };
  }

  function sanitiseGroups(groups) {
    return (groups || []).map((group) => ({
      date: group.date,
      label: group.label,
      transactions: (group.transactions || []).map((tx) => {
        const copy = { ...tx };
        copy.detail = { ...(tx.detail || {}) };
        copy.__groupLabel = group.label || '';
        copy.__groupDate = group.date || '';
        copy.__categoryLabel = resolveTransactionCategory(copy);
        return copy;
      }),
    }));
  }

  function renderTransactions(groups) {
    if (!listEl) return;
    closeDetailSheet(true);
    listEl.innerHTML = '';

    groups.forEach((group, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = index === 0 ? 'space-y-3' : 'space-y-3 mt-6';

      const heading = document.createElement('p');
      heading.className = 'text-base font-normal text-slate-900';
      heading.textContent = group.label || '-';
      wrapper.appendChild(heading);

      const cards = document.createElement('div');
      cards.className = 'rounded-2xl border border-slate-300 overflow-hidden bg-white';

      (group.transactions || []).forEach((tx, txIndex, arr) => {
        const typeNormalized = (tx.type || '').toLowerCase();
        const isCredit = typeNormalized === 'masuk';
        const isDebit = typeNormalized === 'keluar';
        const badgeClass = isCredit
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-rose-50 text-rose-600';
        const icon = isCredit
          ? '<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.56L6.03 8.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L10.75 5.56v10.69A.75.75 0 0 1 10 17Z" clip-rule="evenodd"/></svg>'
          : '<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3Z" clip-rule="evenodd"/></svg>';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'w-full bg-white p-4 text-left transition';
        const category = isCredit ? 'masuk' : (isDebit ? 'keluar' : '');
        if (category) {
          button.setAttribute('data-category', category);
        } else {
          button.removeAttribute('data-category');
        }
        button.innerHTML = `
          <div class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div class="flex min-w-0 items-start gap-4">
              <span class="flex h-11 w-11 flex-none items-center justify-center rounded-full ${badgeClass}">
                ${icon}
              </span>
              <div class="min-w-0 space-y-1">
                <p class="font-semibold text-slate-900 truncate">${tx.title || '-'}</p>
                <p class="text-sm text-slate-500 truncate">${tx.note || ''}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center justify-end gap-3 text-right">
              <span class="font-semibold text-slate-900 shrink-0 whitespace-nowrap text-right">${formatCurrency(tx.amount)}</span>
              <span class="hidden text-xl leading-none text-slate-400 opacity-50 sm:block">&rsaquo;</span>
            </div>
          </div>
        `;
        button.addEventListener('click', () => {
          openDetailSheet(tx);
        });
        cards.appendChild(button);

        if (txIndex < arr.length - 1) {
          const divider = document.createElement('div');
          divider.className = 'border-t border-slate-300';
          cards.appendChild(divider);
        }
      });

      wrapper.appendChild(cards);
      listEl.appendChild(wrapper);
    });
  }

  function parseDate(value) {
    if (!value) return new Date('1970-01-01');
    const parts = value.split('-');
    if (parts.length !== 3) return new Date(value);
    const [year, month, day] = parts.map((p) => parseInt(p, 10));
    return new Date(year || 0, (month || 1) - 1, day || 1);
  }

  function getFilters() {
    if (!filterGroup) return { date: '', type: [], category: '' };

    const read = (name) => {
      const el = filterGroup.querySelector(`.filter[data-filter="${name}"]`);
      return el ? el.dataset.applied || '' : '';
    };

    const typeRaw = read('type');
    const categoryRaw = read('category');

    return {
      date: read('date'),
      type: typeRaw ? typeRaw.split(',').filter(Boolean) : [],
      category: categoryRaw,
    };
  }

  function filterGroupsByType(groups, values) {
    if (!values || values.length === 0) return groups;
    const wanted = values.map((val) => val.toLowerCase());
    return groups
      .map((group) => ({
        ...group,
        transactions: (group.transactions || []).filter((tx) => {
          const type = (tx.type || '').toLowerCase();
          if (!type) return false;
          if (type === 'masuk' && wanted.includes('masuk')) return true;
          if (type === 'keluar' && wanted.includes('keluar')) return true;
          return false;
        }),
      }))
      .filter((group) => (group.transactions || []).length > 0);
  }

  function filterGroupsByCategory(groups, value) {
    if (!value) return groups;
    const wanted = value.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        transactions: (group.transactions || []).filter((tx) => {
          const label = (tx.__categoryLabel || '').toLowerCase();
          return label === wanted;
        }),
      }))
      .filter((group) => (group.transactions || []).length > 0);
  }

  function filterGroupsByDate(groups, value) {
    if (!value) return groups;

    const now = new Date();
    let start = null;
    let end = null;

    if (value === '7 Hari Terakhir') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      end = now;
    } else if (value === '30 Hari Terakhir') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      end = now;
    } else if (value === '1 Tahun Terakhir') {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      end = now;
    } else if (value.startsWith('custom:')) {
      const [startStr, endStr] = value.slice(7).split('|');
      if (startStr) start = new Date(startStr);
      if (endStr) end = new Date(endStr);
    }

    if (!start && !end) return groups;

    return groups
      .map((group) => ({
        ...group,
        transactions: (group.transactions || []).filter((tx) => {
          const txDate = parseDate(tx.date || group.date);
          if (start && txDate < start) return false;
          if (end && txDate > end) return false;
          return true;
        }),
      }))
      .filter((group) => (group.transactions || []).length > 0);
  }

  function applyFiltersAndRender() {
    if (!activeData) {
      showState('empty');
      return;
    }

    if (activeData.status === 'loading') {
      showState('loading');
      return;
    }

    if (activeData.status === 'error') {
      showState('error');
      return;
    }

    let groups = sanitiseGroups(activeData.groups);
    const filters = getFilters();

    groups = filterGroupsByDate(groups, filters.date);
    groups = filterGroupsByType(groups, filters.type);
    groups = filterGroupsByCategory(groups, filters.category);

    if (!groups.length) {
      showState('empty');
      return;
    }

    showState('success');
    renderTransactions(groups);
  }

  function loadTransactions(account) {
    activeData = getDataForAccount(account);
    applyFiltersAndRender();
  }

  function prepareDrawerForAccount(account, { autoOpen = true, titleOverride } = {}) {
    if (!drawer) return;
    activeAccount = account;
    activeData = null;

    resetEStatement();
    setActiveTab('mutasi');

    const defaultTitle = account && (account.displayName || account.name)
      ? (account.displayName || account.name)
      : 'Mutasi Rekening';
    const resolvedTitle = typeof titleOverride === 'string' && titleOverride.trim()
      ? titleOverride.trim()
      : defaultTitle;

    if (drawerTitle) drawerTitle.textContent = resolvedTitle;
    if (drawerAccountLabel) drawerAccountLabel.textContent = defaultTitle;

    resetFilters();
    restoreFiltersForAccount(account);
    showState('loading');

    if (autoOpen) {
      if (drawerController) {
        drawerController.open({ trigger: account || null });
      } else {
        const wasClosed = !drawer.classList.contains('open');
        if (wasClosed) {
          drawer.classList.add('open');
          if (typeof window.sidebarCollapseForDrawer === 'function') {
            window.sidebarCollapseForDrawer();
          }
        }
      }
    }

    if (drawerInner) {
      drawerInner.classList.remove('opacity-0');
    }

    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      loadTransactions(account);
    }, 300);
  }

  function openDrawer(account) {
    prepareDrawerForAccount(account, { autoOpen: true });
  }

  function closeDrawer() {
    if (!drawer) return;
    if (openDropdown) {
      closeDropdownMenu(openDropdown);
    }
    closeDetailSheet(true);
    if (drawerController) {
      drawerController.close({ trigger: 'mutasi' });
    } else if (drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      if (typeof window.sidebarRestoreForDrawer === 'function') {
        window.sidebarRestoreForDrawer();
      }
    }
    activeAccount = null;
    activeData = null;
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
  }

  function renderCards() {
    if (!container) return;
    const accounts = getAccounts();
    container.innerHTML = '';
    accounts.forEach((account, index) => {
      const card = document.createElement('div');
      card.className = 'rounded-2xl border border-slate-200 p-5 bg-white flex flex-col';
      const name = account.name || account.displayName || `Rekening ${index + 1}`;
      const initial = account.initial || (name ? name.charAt(0).toUpperCase() : '');
      const color = account.color || 'bg-cyan-100 text-cyan-600';
      const formattedNumber = account.number
        || (typeof ambis.formatAccountNumber === 'function'
          ? ambis.formatAccountNumber(account.numberRaw)
          : '');

      card.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
          <span class="w-8 h-8 rounded-full ${color} font-semibold grid place-items-center">${initial}</span>
          <span class="font-medium">${name}</span>
        </div>
        <p class="text-slate-500">Nomor Rekening</p>
        <p class="font-bold text-slate-900 tracking-wide mb-4">${formattedNumber || '-'}</p>
        <button class="mt-auto rounded-lg border border-cyan-500 text-cyan-600 px-4 py-2 hover:bg-cyan-50">Pilih Rekening</button>
      `;

      const button = card.querySelector('button');
      if (button) {
        button.addEventListener('click', () => openDrawer(account));
      }

      container.appendChild(card);
    });
  }

  setupDropdown('year');
  setupDropdown('month');
  resetEStatement();
  setActiveTab(activeTab);

  if (tabButtons['e-statement']) {
    tabButtons['e-statement'].addEventListener('click', () => setActiveTab('e-statement'));
  }

  if (tabButtons.mutasi) {
    tabButtons.mutasi.addEventListener('click', () => setActiveTab('mutasi'));
  }

  if (eStatementElements.downloadBtn) {
    eStatementElements.downloadBtn.addEventListener('click', () => {
      if (eStatementElements.downloadBtn.disabled) return;
      showEStatementAlert();
    });
  }

  renderCards();

  if (typeof ambis.onBrandNameChange === 'function') {
    ambis.onBrandNameChange(renderCards);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (!activeAccount) return;
      showState('loading');
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        loadTransactions(activeAccount);
      }, 300);
    });
  }

  if (detailOverlay) {
    detailOverlay.addEventListener('click', () => closeDetailSheet());
  }

  detailCloseButtons.forEach((button) => {
    button.addEventListener('click', () => closeDetailSheet());
  });

  document.addEventListener('click', (event) => {
    if (!openDropdown) return;
    const dropdown = openDropdown;
    if (dropdown.panel && dropdown.panel.contains(event.target)) return;
    if (dropdown.trigger && dropdown.trigger.contains(event.target)) return;
    closeDropdownMenu(dropdown);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (openDropdown) {
        closeDropdownMenu(openDropdown);
        return;
      }
      closeDetailSheet();
    }
  });

  document.addEventListener('filter-change', (event) => {
    const groupId = event.detail ? event.detail.groupId : null;
    if (!groupId || groupId === 'mutasi') {
      persistCurrentFilters();
      applyFiltersAndRender();
    }
  });

  const mutasiApi = window.AMBIS_MUTASI || {};
  mutasiApi.prepareDrawerForAccount = (account, options = {}) => {
    prepareDrawerForAccount(account, { autoOpen: false, ...options });
  };
  mutasiApi.setActiveTab = setActiveTab;
  mutasiApi.showState = showState;
  window.AMBIS_MUTASI = mutasiApi;
});
