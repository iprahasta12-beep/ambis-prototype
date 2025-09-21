(function () {
  const initialData = {
    brandName: 'PT Sarana Pancing Indonesia',
    accounts: [
      {
        id: 'utama',
        name: 'Utama',
        displayName: 'Rekening Utama',
        bank: 'PT Bank Amar Indonesia',
        number: '0009 6789 5439',
        balance: 100_000_000,
        color: 'bg-cyan-100 text-cyan-600',
        initial: 'U',
      },
      {
        id: 'operasional',
        name: 'Operasional',
        displayName: 'Rekening Operasional',
        bank: 'PT Bank Amar Indonesia',
        number: '0009 6789 5440',
        balance: 50_000_000,
        color: 'bg-orange-100 text-orange-600',
        initial: 'O',
      },
      {
        id: 'pembayaran-distributor',
        name: 'Pembayaran Distributor',
        displayName: 'Rekening Pembayaran Distributor',
        bank: 'PT Bank Amar Indonesia',
        number: '0009 6789 5462',
        balance: 62_000_000,
        color: 'bg-pink-100 text-pink-600',
        initial: 'D',
      },
    ],
    transactionsByAccount: {
      '000967895439': [
        { id: 'UTM-001', date: '12 September', description: 'Ke BCA - PT Sinar Jaya Utama', amount: -2_000_000 },
        { id: 'UTM-002', date: '12 September', description: 'Dari BRI - PT Roti Manis Indonesia', amount: 100_000_000 },
        { id: 'UTM-003', date: '12 September', description: 'Ke BRI - PT Roti Manis Indonesia', amount: -100_000_000 },
        { id: 'UTM-004', date: '12 September', description: 'Dari BRI - PT Roti Manis Indonesia', amount: 100_000_000 },
      ],
      '000967895440': [
        { id: 'OPR-001', date: '10 September', description: 'Pembelian ATK', amount: -500_000 },
        { id: 'OPR-002', date: '11 September', description: 'Penjualan Produk', amount: 2_000_000 },
      ],
      '000967895462': [
        { id: 'DST-001', date: '9 September', description: 'Pembayaran Distributor Wilayah Barat', amount: -1_000_000 },
        { id: 'DST-002', date: '8 September', description: 'Pencairan Piutang Distributor', amount: 5_000_000 },
      ],
    },
  };

  const state = {
    brandName: initialData.brandName,
    accounts: initialData.accounts.map((acc) => ({ ...acc })),
    transactions: new Map(),
  };

  const brandSubscribers = new Set();

  function sanitizeNumber(value) {
    return (value || '').toString().replace(/\D+/g, '');
  }

  function formatAccountNumber(value) {
    const raw = sanitizeNumber(value);
    if (!raw) return '';
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  const COLOR_PALETTE = [
    'bg-cyan-100 text-cyan-600',
    'bg-orange-100 text-orange-600',
    'bg-pink-100 text-pink-600',
    'bg-purple-100 text-purple-600',
    'bg-emerald-100 text-emerald-600',
  ];

  function pickAccountColor(index) {
    if (!Number.isFinite(index) || index < 0) {
      return COLOR_PALETTE[0];
    }
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
  }

  function generateAccountNumber() {
    let attempt = 0;
    let candidate = '';
    do {
      const randomValue = Math.floor(100_000_000_000 + Math.random() * 900_000_000_000);
      candidate = String(randomValue);
      attempt += 1;
      if (attempt > 25) {
        break;
      }
    } while (state.accounts.some((acc) => acc.numberRaw === candidate));

    if (!candidate) {
      candidate = String(Date.now()).slice(-12).padStart(12, '0');
    }

    return {
      raw: candidate,
      formatted: formatAccountNumber(candidate),
    };
  }

  function generateAccountId(name) {
    const base = (name || 'rekening')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '') || 'rekening';

    let candidate = base;
    let suffix = 1;
    while (state.accounts.some((acc) => acc.id === candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  function addNewAccount({ name, purpose } = {}) {
    const normalisedName = typeof name === 'string' ? name.trim() : '';
    if (!normalisedName) {
      throw new Error('Nama rekening wajib diisi.');
    }

    const { raw, formatted } = generateAccountNumber();
    const id = generateAccountId(normalisedName);
    const initial = normalisedName.charAt(0).toUpperCase() || 'R';
    const color = pickAccountColor(state.accounts.length);

    const newAccount = {
      id,
      name: normalisedName,
      displayName: normalisedName,
      bank: 'PT Bank Amar Indonesia',
      number: formatted,
      numberRaw: raw,
      balance: 0,
      color,
      initial,
      purpose: typeof purpose === 'string' ? purpose : '',
      brandName: state.brandName,
      company: state.brandName,
    };

    state.accounts.push(newAccount);
    if (!state.transactions.has(raw)) {
      state.transactions.set(raw, []);
    }

    return { ...newAccount };
  }

  function ensureAccountBrand(name) {
    state.accounts.forEach((account) => {
      account.company = name;
      account.brandName = name;
    });
  }

  function updateBrandNodes(name) {
    const nodes = document.querySelectorAll('[data-brand-name], #brandName');
    nodes.forEach((node) => {
      node.textContent = name;
    });
  }

  function getAccountKey(accountOrNumber) {
    if (!accountOrNumber) return '';
    if (typeof accountOrNumber === 'string') {
      return sanitizeNumber(accountOrNumber);
    }
    if (typeof accountOrNumber === 'object') {
      if (accountOrNumber.numberRaw) return sanitizeNumber(accountOrNumber.numberRaw);
      if (accountOrNumber.number) return sanitizeNumber(accountOrNumber.number);
      if (accountOrNumber.accountNumberRaw) return sanitizeNumber(accountOrNumber.accountNumberRaw);
    }
    return '';
  }

  function setBrandName(newName) {
    if (typeof newName !== 'string') return state.brandName;
    const normalized = newName.trim();
    if (!normalized) return state.brandName;
    if (normalized === state.brandName) {
      updateBrandNodes(state.brandName);
      return state.brandName;
    }
    state.brandName = normalized;
    window.AMBIS.brandName = state.brandName;
    ensureAccountBrand(state.brandName);
    updateBrandNodes(state.brandName);
    brandSubscribers.forEach((cb) => {
      try {
        cb(state.brandName);
      } catch (err) {
        console.error('AMBIS brand subscriber failed', err);
      }
    });
    return state.brandName;
  }

  state.accounts.forEach((account) => {
    account.displayName = account.displayName || account.name || '';
    account.initial = account.initial || (account.name ? account.name.charAt(0).toUpperCase() : '');
    account.color = account.color || 'bg-cyan-100 text-cyan-600';
    account.numberRaw = sanitizeNumber(account.number);
    account.number = formatAccountNumber(account.numberRaw);
    account.company = state.brandName;
    account.brandName = state.brandName;
  });

  Object.entries(initialData.transactionsByAccount).forEach(([rawNumber, entries]) => {
    const key = sanitizeNumber(rawNumber);
    const account = state.accounts.find((acc) => acc.numberRaw === key);
    const formattedNumber = account ? account.number : formatAccountNumber(key);
    const list = (entries || []).map((tx, idx) => ({
      ...tx,
      id: tx.id || `${key}-${String(idx + 1).padStart(3, '0')}`,
      accountNumber: formattedNumber,
      accountNumberRaw: key,
    }));
    state.transactions.set(key, list);
  });

  state.accounts.forEach((account) => {
    if (!state.transactions.has(account.numberRaw)) {
      state.transactions.set(account.numberRaw, []);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    updateBrandNodes(state.brandName);
  });

  const api = {
    getBrandName: () => state.brandName,
    setBrandName,
    onBrandNameChange(callback) {
      if (typeof callback !== 'function') return () => {};
      brandSubscribers.add(callback);
      return () => brandSubscribers.delete(callback);
    },
    getAccounts({ clone = false } = {}) {
      return clone ? state.accounts.map((acc) => ({ ...acc })) : state.accounts;
    },
    findAccountById(id) {
      if (!id) return null;
      return state.accounts.find((acc) => acc.id === id) || null;
    },
    findAccountByNumber(number) {
      const key = sanitizeNumber(number);
      if (!key) return null;
      return state.accounts.find((acc) => acc.numberRaw === key) || null;
    },
    addAccount(accountPayload) {
      return addNewAccount(accountPayload);
    },
    getTransactionsForAccount(accountOrNumber, { clone = true } = {}) {
      const key = getAccountKey(accountOrNumber);
      if (!key) return clone ? [] : [];
      const list = state.transactions.get(key) || [];
      return clone ? list.map((tx) => ({ ...tx })) : list;
    },
    formatAccountNumber,
  };

  window.AMBIS = Object.assign(window.AMBIS || {}, api, {
    brandName: state.brandName,
    accounts: state.accounts,
    transactionsByAccount: state.transactions,
  });
})();
