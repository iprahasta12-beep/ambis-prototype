document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('mutasiAccountGrid');
  if (!container) return;

  const drawer = document.getElementById('drawer');
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
  const sidebar = document.getElementById('sidebar');

  const formatter = new Intl.NumberFormat('id-ID');
  const dataSource = window.MUTASI_DATA || null;
  const ambis = window.AMBIS || {};

  let activeAccount = null;
  let activeData = null;
  let sidebarWasCollapsed = false;
  let loadTimer = null;

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

  function collapseSidebar() {
    if (!sidebar) return;
    sidebarWasCollapsed = sidebar.classList.contains('collapsed');
    if (!sidebarWasCollapsed) {
      sidebar.classList.add('collapsed');
    }
  }

  function restoreSidebar() {
    if (!sidebar) return;
    if (!sidebarWasCollapsed) {
      sidebar.classList.remove('collapsed');
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
          if (input._flatpickr) input._flatpickr.clear();
        }
      });
      const custom = filter.querySelector('.custom-range');
      if (custom) custom.classList.add('hidden');
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
      transactions: (group.transactions || []).map((tx) => ({ ...tx })),
    }));
  }

  function renderTransactions(groups) {
    if (!listEl) return;
    listEl.innerHTML = '';

    groups.forEach((group) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'space-y-3';

      const heading = document.createElement('p');
      heading.className = 'font-semibold text-slate-900';
      heading.textContent = group.label || '-';
      wrapper.appendChild(heading);

      const cards = document.createElement('div');
      cards.className = 'space-y-3';

      (group.transactions || []).forEach((tx) => {
        const tone = tx.type === 'masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600';
        const symbol = tx.type === 'masuk' ? '↑' : '↓';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white text-left hover:border-cyan-300 hover:shadow-sm transition';
        button.innerHTML = `
          <div class="flex items-start gap-4">
            <span class="flex-none w-10 h-10 rounded-full grid place-items-center ${tone} text-lg font-semibold">${symbol}</span>
            <div>
              <p class="font-semibold text-slate-900">${tx.title || '-'}</p>
              <p class="text-sm text-slate-500">${tx.note || ''}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-slate-900">${formatCurrency(tx.amount)}</span>
            <span class="text-slate-300 text-2xl leading-none">&rsaquo;</span>
          </div>
        `;
        button.addEventListener('click', () => {
          console.info('Open detail for transaction', tx.id || tx.title);
        });
        cards.appendChild(button);
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
    if (!filterGroup) return { date: '', type: [] };

    const read = (name) => {
      const el = filterGroup.querySelector(`.filter[data-filter="${name}"]`);
      return el ? el.dataset.applied || '' : '';
    };

    const typeRaw = read('type');

    return {
      date: read('date'),
      type: typeRaw ? typeRaw.split(',').filter(Boolean) : [],
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

  function openDrawer(account) {
    if (!drawer) return;
    activeAccount = account;
    activeData = null;

    if (drawerTitle) drawerTitle.textContent = account.displayName || account.name || 'Mutasi Rekening';
    if (drawerAccountLabel) drawerAccountLabel.textContent = account.displayName || account.name || 'Mutasi Rekening';

    resetFilters();
    showState('loading');
    drawer.classList.add('open');
    collapseSidebar();

    if (drawerInner) {
      drawerInner.classList.remove('opacity-0');
    }

    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      loadTransactions(account);
    }, 300);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    restoreSidebar();
    activeAccount = null;
    activeData = null;
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
  }

  function renderCards() {
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

  document.addEventListener('filter-change', (event) => {
    const groupId = event.detail ? event.detail.groupId : null;
    if (!groupId || groupId === 'mutasi') {
      applyFiltersAndRender();
    }
  });
});
