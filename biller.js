(function () {
  'use strict';

  const digitsOnly = (value = '') => value.replace(/\D+/g, '');

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

  function mergeValidation(config) {
    if (!config || !config.validation) {
      return { ...DEFAULT_VALIDATION };
    }
    return { ...DEFAULT_VALIDATION, ...config.validation };
  }

  document.addEventListener('DOMContentLoaded', () => {
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

    const paymentSheet = document.getElementById('paymentSheet');
    const paymentSheetBackdrop = document.getElementById('paymentSheetBackdrop');
    const paymentSheetPanel = document.getElementById('paymentSheetPanel');
    const paymentSheetClose = document.getElementById('paymentSheetClose');
    const paymentSheetCancel = document.getElementById('paymentSheetCancel');
    const paymentSheetConfirm = document.getElementById('paymentSheetConfirm');
    const sheetBiller = document.getElementById('sheetBiller');
    const sheetAccountName = document.getElementById('sheetAccountName');
    const sheetAccountNumber = document.getElementById('sheetAccountNumber');
    const sheetIdLabel = document.getElementById('sheetIdLabel');
    const sheetIdValue = document.getElementById('sheetIdValue');
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

    if (!drawer || !drawerInner || !drawerTitle || !notesList || !idInput || !confirmBtn) {
      return;
    }

    const billerButtons = Array.from(document.querySelectorAll('[data-biller]'));
    if (!billerButtons.length) {
      return;
    }

    const ambis = window.AMBIS || {};

    function sanitizeNumber(value) {
      return (value || '').toString().replace(/\D+/g, '');
    }

    function fallbackFormatNumber(value) {
      const raw = sanitizeNumber(value);
      if (!raw) return '';
      return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }

    const formatAccountNumber = typeof ambis.formatAccountNumber === 'function'
      ? (value) => ambis.formatAccountNumber(value)
      : fallbackFormatNumber;

    const defaultCompanyName = typeof ambis.getBrandName === 'function'
      ? ambis.getBrandName()
      : (ambis.brandName || '');

    const accountMap = new Map();
    const accountDisplayList = [];
    const currencyFormatter = new Intl.NumberFormat('id-ID');

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
        primary.className = 'text-sm font-semibold text-slate-900 truncate';
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
      if (sheetIdLabel) {
        sheetIdLabel.textContent = label;
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
      if (!paymentSheet || paymentSheet.classList.contains('hidden')) return;
      const immediate = Boolean(options.immediate);
      paymentSheetOpen = false;
      if (immediate) {
        paymentSheet.classList.add('hidden');
        paymentSheetBackdrop?.classList.add('opacity-0');
        paymentSheetPanel?.classList.add('translate-y-full');
        return;
      }
      paymentSheetBackdrop?.classList.add('opacity-0');
      paymentSheetPanel?.classList.add('translate-y-full');
      setTimeout(() => {
        paymentSheet.classList.add('hidden');
      }, 220);
    }

    function openPaymentSheet() {
      if (!paymentSheet || !activeKey) return;
      const config = BILLER_CONFIG[activeKey];
      if (!config) return;
      const sanitizedId = typeof currentValidation.sanitize === 'function'
        ? currentValidation.sanitize(idInput.value.trim())
        : idInput.value.trim();
      idInput.value = sanitizedId;

      const account = appliedAccountId ? accountMap.get(appliedAccountId) : null;
      sheetBiller.textContent = config.title;
      sheetIdLabel.textContent = config.idCopy || 'ID Pelanggan';
      sheetIdValue.textContent = sanitizedId || '-';
      sheetAccountName.textContent = account?.displayName || '-';
      const accountSubtitle = account?.subtitle || [account?.company, account?.number].filter(Boolean).join(' • ');
      sheetAccountNumber.textContent = accountSubtitle || '-';

      paymentSheet.classList.remove('hidden');
      requestAnimationFrame(() => {
        paymentSheetBackdrop?.classList.remove('opacity-0');
        paymentSheetPanel?.classList.remove('translate-y-full');
      });
      paymentSheetOpen = true;
    }

    function openDrawer(key, button) {
      const config = BILLER_CONFIG[key];
      if (!config) return;
      closeSavedSheet({ immediate: true });
      closeAccountSheet({ immediate: true });
      closePaymentSheet({ immediate: true });
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

    paymentSheetBackdrop?.addEventListener('click', () => closePaymentSheet());
    paymentSheetClose?.addEventListener('click', () => closePaymentSheet());
    paymentSheetCancel?.addEventListener('click', () => closePaymentSheet());
    paymentSheetConfirm?.addEventListener('click', () => {
      closePaymentSheet();
      console.info('Konfirmasi pembayaran diproses (mock).');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (savedSheetOpen) {
          closeSavedSheet();
        } else if (accountSheetOpen) {
          closeAccountSheet();
        } else if (paymentSheetOpen) {
          closePaymentSheet();
        } else {
          closeDrawer();
        }
      }
    });
  });
})();
