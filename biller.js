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
    const accountButton = document.getElementById('sourceAccountButton');
    const accountNameEl = document.getElementById('sourceAccountName');
    const accountSubtitleEl = document.getElementById('sourceAccountSubtitle');
    const accountPlaceholderEl = document.getElementById('sourceAccountPlaceholder');
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const savedBtn = document.getElementById('savedNumberButton');

    const accountSheet = document.getElementById('accountSheet');
    const accountSheetBackdrop = document.getElementById('accountSheetBackdrop');
    const accountSheetPanel = document.getElementById('accountSheetPanel');
    const accountSheetList = document.getElementById('accountSheetList');
    const accountSheetClose = document.getElementById('accountSheetClose');
    const accountSheetCancel = document.getElementById('accountSheetCancel');
    const accountSheetConfirm = document.getElementById('accountSheetConfirm');

    const sheet = document.getElementById('paymentSheet');
    const sheetBackdrop = document.getElementById('paymentSheetBackdrop');
    const sheetPanel = document.getElementById('paymentSheetPanel');
    const sheetClose = document.getElementById('paymentSheetClose');
    const sheetCancel = document.getElementById('paymentSheetCancel');
    const sheetConfirm = document.getElementById('paymentSheetConfirm');
    const sheetBiller = document.getElementById('sheetBiller');
    const sheetAccountName = document.getElementById('sheetAccountName');
    const sheetAccountNumber = document.getElementById('sheetAccountNumber');
    const sheetIdLabel = document.getElementById('sheetIdLabel');
    const sheetIdValue = document.getElementById('sheetIdValue');

    if (!drawer || !drawerInner || !drawerTitle || !notesList || !idInput || !accountButton || !confirmBtn || !accountSheetList) {
      return;
    }

    const billerButtons = Array.from(document.querySelectorAll('[data-biller]'));
    if (!billerButtons.length) {
      return;
    }

    const ambis = window.AMBIS || {};
    const sharedAccounts = typeof ambis.getAccounts === 'function'
      ? ambis.getAccounts({ clone: false })
      : Array.isArray(ambis.accounts)
        ? ambis.accounts
        : [];

    const currencyFormatter = new Intl.NumberFormat('id-ID');

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

    function normaliseAccount(account, index) {
      if (!account) return null;
      const id = account.id || account.accountId || account.numberRaw || account.number || `acc-${index}`;
      const displayName = account.displayName || account.name || account.alias || `Rekening ${index + 1}`;
      const numberSource = account.numberRaw || account.number || '';
      const numberRaw = sanitizeNumber(numberSource);
      const formattedNumber = numberRaw ? formatAccountNumber(numberRaw) : formatAccountNumber(numberSource) || '';
      const company = (typeof account.company === 'string' && account.company.trim())
        || (typeof account.brandName === 'string' && account.brandName.trim())
        || defaultCompanyName
        || '';
      const subtitleParts = [];
      if (company) subtitleParts.push(company);
      if (formattedNumber) subtitleParts.push(formattedNumber);
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
        company,
        subtitle,
        number: formattedNumber,
        numberRaw,
        balance: account.balance,
        color,
        initial,
      };
    }

    sharedAccounts.forEach((account, index) => {
      const normalised = normaliseAccount(account, index);
      if (!normalised) return;
      accountMap.set(normalised.id, normalised);
      accountDisplayList.push(normalised);
    });

    function formatAccountBalance(balance) {
      if (typeof balance === 'number' && Number.isFinite(balance)) {
        return `Rp ${currencyFormatter.format(balance)}`;
      }
      if (typeof balance === 'string' && balance.trim()) {
        return balance.trim();
      }
      return '';
    }

    function closeAccountSheet(options = {}) {
      if (!accountSheet || accountSheet.classList.contains('hidden')) return;
      const immediate = Boolean(options.immediate);
      accountSheetOpen = false;
      sheetSelectionId = appliedAccountId;
      updateSheetActionState();
      accountButton?.setAttribute('aria-expanded', 'false');
      if (immediate) {
        accountSheet.classList.add('hidden');
        accountSheetBackdrop?.classList.add('opacity-0');
        accountSheetPanel?.classList.add('translate-y-full');
        return;
      }
      accountSheetBackdrop?.classList.add('opacity-0');
      accountSheetPanel?.classList.add('translate-y-full');
      setTimeout(() => {
        accountSheet.classList.add('hidden');
      }, 220);
    }

    function openAccountSheet() {
      if (!accountSheet || accountSheetOpen) return;
      sheetSelectionId = appliedAccountId;
      renderAccountList();
      accountSheet.classList.remove('hidden');
      accountButton?.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        accountSheetBackdrop?.classList.remove('opacity-0');
        accountSheetPanel?.classList.remove('translate-y-full');
      });
      accountSheetOpen = true;
    }

    function updateSheetActionState() {
      const hasSelection = Boolean(sheetSelectionId);
      if (accountSheetConfirm) {
        accountSheetConfirm.disabled = !hasSelection;
      }
    }

    function renderAccountList() {
      accountSheetList.innerHTML = '';
      if (!accountDisplayList.length) {
        sheetSelectionId = '';
        const empty = document.createElement('li');
        empty.className = 'px-4 py-6 text-center text-sm text-slate-500';
        empty.textContent = 'Tidak ada rekening tersedia.';
        accountSheetList.appendChild(empty);
        updateSheetActionState();
        return;
      }

      accountDisplayList.forEach((account) => {
        const li = document.createElement('li');
        li.className = 'list-none';

        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.accountId = account.id;
        button.setAttribute('role', 'radio');
        const isSelected = account.id === sheetSelectionId;
        button.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        button.className = 'w-full flex items-center gap-4 rounded-xl border border-transparent bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
        if (isSelected) {
          button.classList.add('border-cyan-300', 'bg-cyan-50');
        }

        const avatar = document.createElement('div');
        avatar.className = `flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold ${account.color || 'bg-cyan-100 text-cyan-600'}`;
        const initialSource = (account.initial || account.displayName || '').toString().trim();
        const initial = initialSource ? initialSource.charAt(0).toUpperCase() : 'R';
        avatar.textContent = initial;
        button.appendChild(avatar);

        const info = document.createElement('div');
        info.className = 'min-w-0 flex-1';
        const title = document.createElement('p');
        title.className = 'truncate font-semibold text-slate-900';
        title.textContent = account.displayName;
        info.appendChild(title);

        const subtitleText = account.subtitle || [account.company, account.number].filter(Boolean).join(' • ');
        if (subtitleText) {
          const subtitle = document.createElement('p');
          subtitle.className = 'truncate text-sm text-slate-500';
          subtitle.textContent = subtitleText;
          info.appendChild(subtitle);
        }
        button.appendChild(info);

        const trailing = document.createElement('div');
        trailing.className = 'flex flex-none items-center gap-3';

        const balanceText = formatAccountBalance(account.balance);
        if (balanceText) {
          const balanceEl = document.createElement('p');
          balanceEl.className = 'whitespace-nowrap text-sm font-semibold text-slate-900 text-right';
          balanceEl.textContent = balanceText;
          trailing.appendChild(balanceEl);
        }

        const indicator = document.createElement('span');
        indicator.className = 'flex h-5 w-5 items-center justify-center rounded-full border transition-colors';
        indicator.textContent = '✓';
        if (isSelected) {
          indicator.classList.add('border-cyan-500', 'bg-cyan-500', 'text-white');
        } else {
          indicator.classList.add('border-slate-300', 'text-transparent');
        }
        trailing.appendChild(indicator);

        button.appendChild(trailing);

        button.addEventListener('click', () => {
          setSheetSelection(account.id);
        });

        li.appendChild(button);
        accountSheetList.appendChild(li);
      });

      updateSheetActionState();
    }

    function setSheetSelection(nextId) {
      const resolvedId = accountMap.has(nextId) ? nextId : '';
      sheetSelectionId = resolvedId;
      renderAccountList();
    }

    function applyAccountSelection(nextId) {
      const resolvedId = accountMap.has(nextId) ? nextId : '';
      appliedAccountId = resolvedId;
      const account = resolvedId ? accountMap.get(resolvedId) : null;

      if (accountPlaceholderEl) {
        accountPlaceholderEl.classList.toggle('hidden', Boolean(account));
      }
      if (accountNameEl) {
        if (account) {
          accountNameEl.textContent = account.displayName || '';
          accountNameEl.classList.remove('hidden');
        } else {
          accountNameEl.textContent = '';
          accountNameEl.classList.add('hidden');
        }
      }
      if (accountSubtitleEl) {
        if (account) {
          const subtitle = account.subtitle || [account.company, account.number].filter(Boolean).join(' • ');
          accountSubtitleEl.textContent = subtitle;
          accountSubtitleEl.classList.toggle('hidden', !subtitle);
        } else {
          accountSubtitleEl.textContent = '';
          accountSubtitleEl.classList.add('hidden');
        }
      }

      updateConfirmState();
    }

    const ACTIVE_CLASSES = ['ring-2', 'ring-cyan-400', 'border-cyan-300', 'bg-cyan-50'];

    let activeButton = null;
    let activeKey = '';
    let currentValidation = { ...DEFAULT_VALIDATION };
    let idDirty = false;
    let sheetOpen = false;
    let accountSheetOpen = false;
    let appliedAccountId = '';
    let sheetSelectionId = '';

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

      applyAccountSelection('');
      sheetSelectionId = appliedAccountId;
      updateSheetActionState();

      applyValidationAttributes(currentValidation);

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

    function closeSheet(options = {}) {
      if (!sheet || sheet.classList.contains('hidden')) return;
      const immediate = Boolean(options.immediate);
      sheetOpen = false;
      if (immediate) {
        sheet.classList.add('hidden');
        sheetBackdrop?.classList.add('opacity-0');
        sheetPanel?.classList.add('translate-y-full');
        return;
      }
      sheetBackdrop?.classList.add('opacity-0');
      sheetPanel?.classList.add('translate-y-full');
      setTimeout(() => {
        sheet.classList.add('hidden');
      }, 220);
    }

    function openSheet() {
      if (!sheet || !activeKey) return;
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

      sheet.classList.remove('hidden');
      requestAnimationFrame(() => {
        sheetBackdrop?.classList.remove('opacity-0');
        sheetPanel?.classList.remove('translate-y-full');
      });
      sheetOpen = true;
    }

    function openDrawer(key, button) {
      const config = BILLER_CONFIG[key];
      if (!config) return;
      closeSheet({ immediate: true });
      closeAccountSheet({ immediate: true });
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
      closeSheet({ immediate: true });
      closeAccountSheet({ immediate: true });
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

    accountButton.addEventListener('click', () => {
      openAccountSheet();
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
      openSheet();
    });

    savedBtn?.addEventListener('click', () => {
      console.info('Fitur nomor tersimpan belum tersedia dalam prototipe ini.');
    });

    sheetBackdrop?.addEventListener('click', () => closeSheet());
    sheetClose?.addEventListener('click', () => closeSheet());
    sheetCancel?.addEventListener('click', () => closeSheet());
    sheetConfirm?.addEventListener('click', () => {
      closeSheet();
      console.info('Konfirmasi pembayaran diproses (mock).');
    });

    accountSheetBackdrop?.addEventListener('click', () => closeAccountSheet());
    accountSheetClose?.addEventListener('click', () => closeAccountSheet());
    accountSheetCancel?.addEventListener('click', () => closeAccountSheet());
    accountSheetConfirm?.addEventListener('click', () => {
      if (!sheetSelectionId) return;
      applyAccountSelection(sheetSelectionId);
      closeAccountSheet();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (sheetOpen) {
          closeSheet();
        } else if (accountSheetOpen) {
          closeAccountSheet();
        } else {
          closeDrawer();
        }
      }
    });
  });
})();
