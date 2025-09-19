// transfer.js - drawer logic for transfer page

document.addEventListener('DOMContentLoaded', () => {
  const openBtn  = document.getElementById('openTransferDrawer');
  const drawer   = document.getElementById('drawer');
  const transferPane = document.getElementById('transferPane');
  const movePane = document.getElementById('movePane');
  const successPane = document.getElementById('successPane');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const cardGrid = document.getElementById('cardGrid');

  function updateCardGridLayout(isDrawerOpen) {
    if (!cardGrid) return;
    cardGrid.classList.toggle('md:grid-cols-3', !isDrawerOpen);
    cardGrid.classList.toggle('md:grid-cols-2', isDrawerOpen);
  }

  updateCardGridLayout(drawer?.classList.contains('open'));

  const successHeaderClose = document.getElementById('successHeaderClose');
  const successTitle = document.getElementById('successTitle');
  const successCloseBtn = document.getElementById('successCloseBtn');
  const successSourceBadge = document.getElementById('successSourceBadge');
  const successSourceName = document.getElementById('successSourceName');
  const successSourceSubtitle = document.getElementById('successSourceSubtitle');
  const successDestBadge = document.getElementById('successDestBadge');
  const successDestName = document.getElementById('successDestName');
  const successDestSubtitle = document.getElementById('successDestSubtitle');
  const successNominal = document.getElementById('successNominal');
  const successTotal = document.getElementById('successTotal');
  const successCreatedBy = document.getElementById('successCreatedBy');
  const successReference = document.getElementById('successReference');
  const successDate = document.getElementById('successDate');
  const successCategory = document.getElementById('successCategory');
  const successNote = document.getElementById('successNote');
  const successMethod = document.getElementById('successMethod');

  // buttons & inputs in form
  const sourceBtn = document.getElementById('sourceAccountBtn');
  const destBtn   = document.getElementById('destinationAccountBtn');
  const categoryBtn = document.getElementById('categoryBtn');
  const categoryList = document.getElementById('categoryList');
  const categoryDropdown = document.getElementById('categoryDropdown');
  const categoryText = document.getElementById('categoryText');
  const amountInput = document.getElementById('amountInput');
  const confirmBtn = document.getElementById('confirmBtn');
  const noteInput = document.getElementById('noteInput');
  const noteCounter = document.getElementById('noteCounter');
  const methodBtn = document.getElementById('methodBtn');
  const methodText = document.getElementById('methodText');
  const methodSection = document.getElementById('methodSection');
  const summarySection = document.getElementById('summarySection');
  const summaryNominal = document.getElementById('summaryNominal');
  const summaryFee = document.getElementById('summaryFee');
  const summaryTotal = document.getElementById('summaryTotal');

  // generic bottom sheet
  const sheetOverlay = document.getElementById('sheetOverlay');
  const sheet       = document.getElementById('bottomSheet');
  const sheetTitle  = document.getElementById('sheetTitle');
  const sheetList   = document.getElementById('sheetList');
  const sheetCancel = document.getElementById('sheetCancel');
  const sheetChoose = document.getElementById('sheetChoose');
  const sheetClose  = document.getElementById('sheetClose');

  // destination sheet elements
  const destSheet   = document.getElementById('destSheet');
  const bankBtn     = document.getElementById('bankBtn');
  const bankList    = document.getElementById('bankList');
  const bankDropdown = document.getElementById('bankDropdown');
  const bankText    = document.getElementById('bankText');
  const destNumber  = document.getElementById('destNumber');
  const checkAccount = document.getElementById('checkAccount');
  const accountInfo = document.getElementById('accountInfo');
  const ownerField  = document.getElementById('ownerField');
  const accountOwnerField = document.getElementById('accountOwnerField');
  const saveContainer = document.getElementById('saveContainer');
  const saveCheckbox  = document.getElementById('saveCheckbox');
  const aliasContainer = document.getElementById('aliasContainer');
  const aliasInput = document.getElementById('aliasInput');
  const aliasCounter = document.getElementById('aliasCounter');
  const destBack    = document.getElementById('destBack');
  const destProceed = document.getElementById('destProceed');
  const destClose   = document.getElementById('destClose');

  // confirmation sheet
  const confirmSheet = document.getElementById('confirmSheet');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmBack = document.getElementById('confirmBack');
  const confirmProceed = document.getElementById('confirmProceed');
  const confirmClose = document.getElementById('confirmClose');
  const confirmSourceBadge = document.getElementById('confirmSourceBadge');
  const confirmDestinationBadge = document.getElementById('confirmDestinationBadge');
  const confirmActivityLabel = document.getElementById('confirmActivityLabel');
  const sheetSource = document.getElementById('sheetSource');
  const sheetSourceCompany = document.getElementById('sheetSourceCompany');
  const sheetSourceDetail = document.getElementById('sheetSourceDetail');
  const sheetDestination = document.getElementById('sheetDestination');
  const sheetDestinationCompany = document.getElementById('sheetDestinationCompany');
  const sheetDestinationDetail = document.getElementById('sheetDestinationDetail');
  const sheetNominal = document.getElementById('sheetNominal');
  const sheetBiaya = document.getElementById('sheetBiaya');
  const sheetTotal = document.getElementById('sheetTotal');
  const sheetCategory = document.getElementById('sheetCategory');
  const sheetNote = document.getElementById('sheetNote');
  const sheetRef = document.getElementById('sheetRef');
  const sheetDate = document.getElementById('sheetDate');
  const otpSection = document.getElementById('otpSection');
  const otpInputs = otpSection ? Array.from(otpSection.querySelectorAll('.otp-input')) : [];
  const otpCountdown = document.getElementById('otpCountdown');
  const otpCountdownMessage = document.getElementById('otpCountdownMessage');
  const otpTimerEl = document.getElementById('otpTimer');
  const otpResendBtn = document.getElementById('otpResendBtn');
  const otpCountdownDefaultMessage = otpCountdownMessage?.textContent?.trim() || 'Sesi akan berakhir dalam';
  const OTP_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir.';

  // move drawer elements
  const openMoveBtn = document.getElementById('openMoveDrawer');
  const moveCloseBtn = document.getElementById('moveDrawerCloseBtn');
  const moveSourceBtn = document.getElementById('moveSourceBtn');
  const moveDestBtn = document.getElementById('moveDestBtn');
  const moveAmountInput = document.getElementById('moveAmountInput');
  const moveCategoryBtn = document.getElementById('moveCategoryBtn');
  const moveCategoryList = document.getElementById('moveCategoryList');
  const moveCategoryDropdown = document.getElementById('moveCategoryDropdown');
  const moveCategoryText = document.getElementById('moveCategoryText');
  const moveNoteInput = document.getElementById('moveNoteInput');
  const moveNoteCounter = document.getElementById('moveNoteCounter');
  const moveConfirmBtn = document.getElementById('moveConfirmBtn');
  const moveDestError = document.getElementById('moveDestError');
  const moveAmountError = document.getElementById('moveAmountError');

  const transferActivityCard = cardGrid?.querySelector('[data-activity-card="transfer"]')
    || openBtn?.closest('[data-activity-card="transfer"]');
  const moveActivityCard = cardGrid?.querySelector('[data-activity-card="move"]')
    || openMoveBtn?.closest('[data-activity-card="move"]');
  const DEFAULT_CARD_BORDER = 'border-slate-200';
  const ACTIVE_CARD_BORDER = 'border-cyan-300';
  const DEFAULT_ACTIVITY_TYPE = 'transfer';
  const ACTIVITY_TITLES = {
    transfer: 'Transfer Saldo',
    move: 'Pemindahan Saldo'
  };

  function setActivityCardState(card, active) {
    if (!card) return;
    card.classList.toggle(ACTIVE_CARD_BORDER, active);
    card.classList.toggle(DEFAULT_CARD_BORDER, !active);
  }

  function setActiveActivityCard(type) {
    setActivityCardState(transferActivityCard, type === 'transfer');
    setActivityCardState(moveActivityCard, type === 'move');
  }

  function clearActiveActivityCard() {
    setActiveActivityCard(null);
  }

  function getActivityTitle(type) {
    return ACTIVITY_TITLES[type] || ACTIVITY_TITLES[DEFAULT_ACTIVITY_TYPE];
  }

  function updateConfirmProceedLabel(type) {
    if (!confirmProceed) return;
    const title = getActivityTitle(type);
    confirmProceed.textContent = `Lanjut ${title}`;
  }

  function updateConfirmSheetContent(type) {
    const title = getActivityTitle(type);
    if (confirmTitle) {
      confirmTitle.textContent = title;
    }
    if (confirmActivityLabel) {
      confirmActivityLabel.textContent = title;
    }
    updateConfirmProceedLabel(type);
  }

  // data
  const accounts = [
    { initial:'O', color:'bg-cyan-100 text-cyan-600', name:'Utama', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp100.000.000,00' },
    { initial:'D', color:'bg-orange-100 text-orange-600', name:'Operasional', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp50.000.000,00' },
    { initial:'R', color:'bg-pink-100 text-pink-600', name:'Distributor', company:'PT ABC Indonesia', bank:'Amar Indonesia', number:'000967895483', balance:'Rp25.000.000,00' }
  ];


  function isBusinessDay(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday-Friday
  }

  function isWithinHours(date, start, end) {
    const hour = date.getHours();
    return hour >= start && hour < end;
  }

  const transferMethodsData = [
    { name:'BI Fast', fee:2500, min:10000, max:250000000, desc:'Dana langsung sampai ke penerima', check: () => true },
    { name:'RTOL', fee:6500, min:10000, max:1000000000, desc:'Dana langsung sampai ke penerima', check: () => true },
    { name:'SKN/LLG', fee:2900, min:100000, max:1000000000, desc:'Dana sampai 1-3 hari kerja', check: now => isBusinessDay(now) && isWithinHours(now,8,15) },
    { name:'RTGS', fee:25000, min:100000000, max:1000000000, desc:'Dana sampai dalam 1 jam', check: now => isBusinessDay(now) && isWithinHours(now,8,16) }
  ];

  const currentUserFullName = 'Bambang Triadmodjo';

  // state
  let currentData = [];
  let selectedIndex = null;
  let selectedBank = '';
  let accountNumber = '';
  let accountOwner = '';
  let saveBeneficiary = false;
  let sourceSelected = false;
  let destSelected = false;
  let amountValue = 0;
  let amountValid = false;
  let categorySelected = false;
  let selectedCategory = '';
  let methodSelected = false;
  let selectedMethod = '';
  let selectedFee = 0;
  let availableMethods = [];
  let currentSheetType = 'source';
  let otpActive = false;
  let otpIntervalId = null;
  let otpTimeLeft = 30;
  let selectedSourceAccountData = null;
  let selectedDestinationAccountData = null;
  let lastTransactionDetails = null;
  let activePaneType = DEFAULT_ACTIVITY_TYPE;

  // move drawer state
  let moveSourceSelected = false;
  let moveDestination = '';
  let moveDestValid = false;
  let moveAmountValue = 0;
  let moveAmountValid = false;
  let moveCategorySelected = false;
  let moveSelectedCategory = '';
  let moveSourceAccountData = null;
  let moveDestAccountData = null;

  function formatAccountSubtitle(company, bank, number) {
    const segments = [];
    if (company) {
      segments.push(company);
    }
    const bankParts = [];
    if (bank) {
      bankParts.push(bank);
    }
    if (number) {
      bankParts.push(number);
    }
    if (bankParts.length) {
      segments.push(bankParts.join(' - '));
    }
    return segments.join(' • ');
  }

  function mapAccountToDisplay(acc) {
    if (!acc) return null;
    const title = acc.name || '';
    const subtitle = formatAccountSubtitle(acc.company || '', acc.bank || '', acc.number || '');
    return {
      title,
      company: acc.company || '',
      bank: acc.bank || '',
      number: acc.number || '',
      initial: acc.initial || (title ? title.charAt(0).toUpperCase() : ''),
      color: acc.color || 'bg-cyan-100 text-cyan-600',
      subtitle
    };
  }

  function createManualAccountDisplay({ title, company, bank, number, color }) {
    const safeTitle = title || company || bank || '';
    const safeCompany = company || '';
    const subtitle = formatAccountSubtitle(safeCompany || safeTitle, bank || '', number || '');
    return {
      title: safeTitle,
      company: safeCompany,
      bank: bank || '',
      number: number || '',
      initial: safeTitle ? safeTitle.charAt(0).toUpperCase() : '',
      color: color || 'bg-amber-100 text-amber-600',
      subtitle
    };
  }

  function createFallbackAccountDisplay(label, color) {
    const safeLabel = label || '-';
    const trimmed = safeLabel.trim();
    return {
      title: safeLabel,
      subtitle: safeLabel,
      initial: trimmed ? trimmed.charAt(0).toUpperCase() : '',
      color: color || 'bg-cyan-100 text-cyan-600'
    };
  }

  function renderList(data) {
    sheetList.innerHTML = data.map((acc, idx) => `
      <li>
        <button type="button" data-index="${idx}" class="sheet-item w-full flex items-center gap-3 px-4 py-3 text-left">
          <div class="w-10 h-10 rounded-full ${acc.color} flex items-center justify-center font-semibold">${acc.initial}</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium">${acc.name}</p>
            <p class="text-slate-500">${acc.company}</p>
            <p class="text-slate-500">${acc.bank} - ${acc.number}</p>
          </div>
          <div class="text-sm font-medium whitespace-nowrap mr-2">${acc.balance}</div>
          <span class="ml-2 w-5 h-5 rounded-full border border-slate-300 grid place-items-center">
            <span class="radio-dot w-2 h-2 rounded-full bg-cyan-500 hidden"></span>
          </span>
        </button>
      </li>`).join('');
  }

  function renderMethodList(data) {
    sheetList.innerHTML = data.map((m, idx) => `
      <li>
        <button type="button" data-index="${idx}" class="sheet-item w-full flex items-center gap-3 px-4 py-3 text-left">
          <div class="flex-1 min-w-0">
            <p class="font-medium mb-2 font-bold">${m.name}</p>
            <p class="mb-2">Rp${formatter.format(m.fee)}</p>
            <p class="text-sm text-slate-500">${m.desc}</p>
            <p class="text-sm text-slate-500">Nominal transfer: Rp${formatter.format(m.min)} - Rp${formatter.format(m.max)}</p>
          </div>
          <span class="ml-2 w-5 h-5 rounded-full border border-slate-300 grid place-items-center">
            <span class="radio-dot w-2 h-2 rounded-full bg-cyan-500 hidden"></span>
          </span>
        </button>
      </li>`).join('');
  }

  function applyBadgeStyles(element, colorClass) {
    if (!element) return;
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-base';
    element.className = `${baseClasses} ${colorClass || 'bg-cyan-100 text-cyan-600'}`;
  }

  function setTextOrFallback(element, value, fallback = '-') {
    if (!element) return;
    element.textContent = value || fallback;
  }

  function setOptionalText(element, value) {
    if (!element) return;
    if (value) {
      element.textContent = value;
      element.classList.remove('hidden');
    } else {
      element.textContent = '';
      element.classList.add('hidden');
    }
  }

  function deriveDetailText(display) {
    if (!display) return '';
    const bankParts = [];
    if (display.bank) {
      bankParts.push(display.bank);
    }
    if (display.number) {
      bankParts.push(display.number);
    }
    if (bankParts.length) {
      return bankParts.join(' - ');
    }
    if (display.subtitle && display.subtitle !== display.title && display.subtitle !== display.company) {
      return display.subtitle;
    }
    return '';
  }

  function deriveCompanyText(display) {
    if (!display) return '';
    const company = display.company || '';
    if (!company) {
      return '';
    }
    if (company === display.title) {
      const detail = deriveDetailText(display);
      return detail ? '' : company;
    }
    return company;
  }

  function populateConfirmAccount(badgeEl, nameEl, companyEl, detailEl, display, fallbackColor) {
    if (!display) {
      display = createFallbackAccountDisplay('-', fallbackColor);
    }
    applyBadgeStyles(badgeEl, display.color || fallbackColor);
    if (badgeEl) {
      badgeEl.textContent = display.initial || '';
    }
    setTextOrFallback(nameEl, display.title || '-');
    const companyText = deriveCompanyText(display);
    setOptionalText(companyEl, companyText);
    const detailText = deriveDetailText(display);
    setOptionalText(detailEl, detailText);
  }

  function populateSuccessView(details) {
    if (!details || !successPane) return;
    const activityTitle = getActivityTitle(details.type);
    if (successTitle) {
      successTitle.textContent = activityTitle;
    }
    const source = details.source || {};
    const destination = details.destination || {};

    applyBadgeStyles(successSourceBadge, source.color || 'bg-cyan-100 text-cyan-600');
    if (successSourceBadge) {
      successSourceBadge.textContent = source.initial || '';
    }
    if (successSourceName) {
      successSourceName.textContent = source.title || '-';
    }
    if (successSourceSubtitle) {
      successSourceSubtitle.textContent = source.subtitle || '-';
    }

    applyBadgeStyles(successDestBadge, destination.color || 'bg-amber-100 text-amber-600');
    if (successDestBadge) {
      successDestBadge.textContent = destination.initial || '';
    }
    if (successDestName) {
      successDestName.textContent = destination.title || '-';
    }
    if (successDestSubtitle) {
      successDestSubtitle.textContent = destination.subtitle || '-';
    }

    const nominal = typeof details.amount === 'number' ? details.amount : 0;
    const total = typeof details.total === 'number' ? details.total : nominal;
    if (successNominal) {
      successNominal.textContent = 'Rp' + formatter.format(nominal);
    }
    if (successTotal) {
      successTotal.textContent = 'Rp' + formatter.format(total);
    }
    if (successCreatedBy) {
      successCreatedBy.textContent = details.createdBy || '-';
    }
    if (successReference) {
      successReference.textContent = details.reference || '-';
    }
    if (successDate) {
      successDate.textContent = details.datetime || '-';
    }
    if (successCategory) {
      successCategory.textContent = details.category || '-';
    }
    if (successNote) {
      successNote.textContent = details.note || '-';
    }
    if (successMethod) {
      successMethod.textContent = details.method || '-';
    }
  }

  function openSuccessPane() {
    if (!lastTransactionDetails) return;
    populateSuccessView(lastTransactionDetails);
    transferPane?.classList.add('hidden');
    movePane?.classList.add('hidden');
    successPane?.classList.remove('hidden');
    drawer.classList.add('open');
    updateCardGridLayout(true);
    successCloseBtn?.focus();
    const activeType = lastTransactionDetails.type === 'move' ? 'move' : 'transfer';
    setActiveActivityCard(activeType);
  }

  function openSheet() {
    currentSheetType = 'source';
    selectedIndex = null;
    currentData = accounts;
    sheetTitle.textContent = 'Sumber Rekening';
    sheetChoose.textContent = 'Pilih Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function openMoveSourceSheet() {
    currentSheetType = 'moveSource';
    selectedIndex = null;
    currentData = accounts;
    sheetTitle.textContent = 'Sumber Rekening';
    sheetChoose.textContent = 'Pilih Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function openMoveDestSheet() {
    currentSheetType = 'moveDest';
    selectedIndex = null;
    // If a source account has been selected, exclude it from destination list
    if (moveSourceSelected) {
      const sourceName = moveSourceBtn.textContent.split(' - ')[0];
      currentData = accounts.filter(acc => acc.name !== sourceName);
    } else {
      currentData = accounts;
    }
    sheetTitle.textContent = 'Rekening Tujuan';
    sheetChoose.textContent = 'Pilih Rekening';
    renderList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function openMethodSheet() {
    currentSheetType = 'method';
    selectedIndex = null;
    currentData = availableMethods;
    sheetTitle.textContent = 'Metode Transfer';
    sheetChoose.textContent = 'Pilih Metode';
    renderMethodList(currentData);
    sheetChoose.disabled = true;
    sheetChoose.classList.add('opacity-50','cursor-not-allowed');
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  }

  function closeSheet() {
    sheetOverlay.classList.remove('opacity-100');
    sheet.classList.add('translate-y-full');
    setTimeout(() => {
      sheetOverlay.classList.add('hidden');
    }, 200);
  }

  function resetDestForm() {
    bankText.textContent = 'Pilih bank';
    bankText.classList.add('text-slate-500');
    bankList.classList.add('hidden');
    destNumber.value = '';
    accountOwnerField.value = '';
    accountInfo.classList.add('hidden');
    ownerField.classList.add('hidden');
    saveContainer.classList.add('hidden');
    aliasContainer.classList.add('hidden');
    aliasInput.value = '';
    aliasCounter.textContent = '0/15';
    destProceed.disabled = true;
    destProceed.classList.add('opacity-50','cursor-not-allowed');
    saveCheckbox.checked = false;
    selectedBank = '';
    accountNumber = '';
    accountOwner = '';
    saveBeneficiary = false;
    selectedDestinationAccountData = null;
  }

  function openDestSheet() {
    resetDestForm();
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      destSheet.classList.remove('translate-y-full');
    });
  }

  function closeDestSheet() {
    destSheet.classList.add('translate-y-full');
    sheetOverlay.classList.remove('opacity-100');
    setTimeout(() => {
      sheetOverlay.classList.add('hidden');
    }, 200);
  }

  function setConfirmProceedEnabled(enabled) {
    if (!confirmProceed) return;
    confirmProceed.disabled = !enabled;
    confirmProceed.classList.toggle('opacity-50', !enabled);
    confirmProceed.classList.toggle('cursor-not-allowed', !enabled);
  }

  function clearOtpTimer() {
    if (otpIntervalId) {
      clearInterval(otpIntervalId);
      otpIntervalId = null;
    }
  }

  function formatOtpTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function showOtpCountdownDefaultMessage() {
    if (otpCountdownMessage) {
      otpCountdownMessage.textContent = otpCountdownDefaultMessage;
    }
    if (otpTimerEl) {
      otpTimerEl.classList.remove('hidden');
    }
  }

  function showOtpExpiredMessage() {
    if (otpCountdownMessage) {
      otpCountdownMessage.textContent = OTP_EXPIRED_MESSAGE;
    }
    if (otpTimerEl) {
      otpTimerEl.classList.add('hidden');
    }
  }

  function updateOtpCountdownDisplay() {
    if (!otpTimerEl) return;
    otpTimerEl.textContent = formatOtpTime(otpTimeLeft);
  }

  function resetOtpInputs() {
    otpInputs.forEach(input => {
      input.value = '';
    });
  }

  function updateOtpVerifyState() {
    if (!otpActive) return;
    const filled = otpInputs.every(input => input.value.trim() !== '');
    setConfirmProceedEnabled(filled);
  }

  function showOtpSection() {
    if (!otpSection) return;
    otpActive = true;
    otpSection.classList.remove('hidden');
    confirmProceed.textContent = 'Verifikasi';
    resetOtpInputs();
    otpInputs[0]?.focus();
    startOtpTimer();
    setConfirmProceedEnabled(false);
  }

  function startOtpTimer() {
    otpCountdown?.classList.remove('hidden');
    showOtpCountdownDefaultMessage();
    otpResendBtn?.classList.add('hidden');
    otpTimeLeft = 30;
    updateOtpCountdownDisplay();
    clearOtpTimer();
    otpIntervalId = setInterval(() => {
      otpTimeLeft -= 1;
      if (otpTimeLeft <= 0) {
        otpTimeLeft = 0;
        updateOtpCountdownDisplay();
        clearOtpTimer();
        showOtpExpiredMessage();
        otpResendBtn?.classList.remove('hidden');
        setConfirmProceedEnabled(false);
        return;
      }
      updateOtpCountdownDisplay();
    }, 1000);
  }

  function resetOtpState() {
    otpActive = false;
    clearOtpTimer();
    otpTimeLeft = 30;
    if (otpSection) {
      otpSection.classList.add('hidden');
    }
    resetOtpInputs();
    if (otpCountdown) {
      otpCountdown.classList.remove('hidden');
    }
    showOtpCountdownDefaultMessage();
    if (otpResendBtn) {
      otpResendBtn.classList.add('hidden');
    }
    if (otpTimerEl) {
      otpTimerEl.textContent = '00:30';
    }
    const labelType = lastTransactionDetails?.type || activePaneType || DEFAULT_ACTIVITY_TYPE;
    updateConfirmProceedLabel(labelType);
    setConfirmProceedEnabled(true);
  }

  function closeConfirmSheet() {
    resetOtpState();
    confirmSheet.classList.add('translate-y-full');
    sheetOverlay.classList.remove('opacity-100');
    setTimeout(() => {
      sheetOverlay.classList.add('hidden');
    }, 200);
  }

  sheetList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-index]');
    if (!btn) return;
    selectedIndex = btn.dataset.index;
    sheetList.querySelectorAll('button[data-index]').forEach(b => {
      b.classList.remove('ring-2');
      b.querySelector('.radio-dot').classList.add('hidden');
    });
    btn.classList.add('ring-2');
    btn.querySelector('.radio-dot').classList.remove('hidden');
    sheetChoose.disabled = false;
    sheetChoose.classList.remove('opacity-50','cursor-not-allowed');
  });

  sheetCancel?.addEventListener('click', closeSheet);
  sheetClose?.addEventListener('click', closeSheet);
  sheetOverlay?.addEventListener('click', () => {
    closeSheet();
    closeDestSheet();
    closeConfirmSheet();
  });

  sheetChoose?.addEventListener('click', () => {
    if (selectedIndex === null) return;
    if (currentSheetType === 'source') {
      const acc = currentData[selectedIndex];
      sourceBtn.textContent = `${acc.name} - ${acc.number}`;
      sourceBtn.classList.remove('text-slate-500');
      sourceSelected = true;
      selectedSourceAccountData = mapAccountToDisplay(acc);
      updateMethodVisibility();
    } else if (currentSheetType === 'moveSource') {
      const acc = currentData[selectedIndex];
      moveSourceBtn.textContent = `${acc.name} - ${acc.number}`;
      moveSourceBtn.classList.remove('text-slate-500');
      moveSourceSelected = true;
      moveSourceAccountData = mapAccountToDisplay(acc);
      moveDestination = '';
      moveDestBtn.textContent = 'Pilih rekening tujuan';
      moveDestBtn.classList.add('text-slate-500');
      moveDestValid = false;
      moveDestAccountData = null;
      moveDestError.classList.add('hidden');
      updateMoveConfirmState();
    } else if (currentSheetType === 'moveDest') {
      const acc = currentData[selectedIndex];
      moveDestination = `${acc.name} - ${acc.number}`;
      moveDestBtn.textContent = moveDestination;
      moveDestBtn.classList.remove('text-slate-500');
      const sourceName = moveSourceBtn.textContent.split(' - ')[0];
      moveDestValid = acc.name !== sourceName;
      moveDestAccountData = moveDestValid ? mapAccountToDisplay(acc) : null;
      moveDestError.classList.toggle('hidden', moveDestValid);
      updateMoveConfirmState();
    } else if (currentSheetType === 'method') {
      const m = currentData[selectedIndex];
      methodText.textContent = m.name;
      methodText.classList.remove('text-slate-500');
      methodSelected = true;
      selectedMethod = m.name;
      selectedFee = m.fee;
      updateConfirmState();
      updateSummary();
    }
    closeSheet();
  });

  sourceBtn?.addEventListener('click', openSheet);
  destBtn?.addEventListener('click', openDestSheet);
  methodBtn?.addEventListener('click', () => {
    if (methodBtn.disabled) return;
    openMethodSheet();
  });
  moveSourceBtn?.addEventListener('click', openMoveSourceSheet);
  moveDestBtn?.addEventListener('click', openMoveDestSheet);

  categoryBtn?.addEventListener('click', () => {
    categoryList.classList.toggle('hidden');
  });
  moveCategoryBtn?.addEventListener('click', () => {
    moveCategoryList.classList.toggle('hidden');
  });

  categoryList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    categoryList.querySelectorAll('button[data-value]').forEach(b => {
      b.classList.remove('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    });
    btn.classList.add('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    selectedCategory = btn.dataset.value;
    categoryText.textContent = selectedCategory;
    categoryText.classList.remove('text-slate-500');
    categorySelected = true;
  categoryList.classList.add('hidden');
    updateConfirmState();
  });

  moveCategoryList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    moveCategoryList.querySelectorAll('button[data-value]').forEach(b => {
      b.classList.remove('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    });
    btn.classList.add('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    moveSelectedCategory = btn.dataset.value;
    moveCategoryText.textContent = moveSelectedCategory;
    moveCategoryText.classList.remove('text-slate-500');
    moveCategorySelected = true;
    moveCategoryList.classList.add('hidden');
    updateMoveConfirmState();
  });

  bankBtn?.addEventListener('click', () => {
    bankList.classList.toggle('hidden');
  });

  bankList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    bankList.querySelectorAll('button[data-value]').forEach(b => {
      b.classList.remove('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    });
    btn.classList.add('bg-cyan-50','border-l-2','border-dashed','border-cyan-500');
    selectedBank = btn.dataset.value;
    bankText.textContent = selectedBank;
    bankText.classList.remove('text-slate-500');
    bankList.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (categoryDropdown && !categoryDropdown.contains(e.target)) {
      categoryList.classList.add('hidden');
    }
    if (bankDropdown && !bankDropdown.contains(e.target)) {
      bankList.classList.add('hidden');
    }
    if (moveCategoryDropdown && !moveCategoryDropdown.contains(e.target)) {
      moveCategoryList.classList.add('hidden');
    }
  });

  destNumber?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g,'');
  });

  checkAccount?.addEventListener('click', () => {
    accountNumber = destNumber.value;
    if (!selectedBank || !accountNumber) return;
    accountOwner = 'PT XYZ Indonesia';
    accountOwnerField.value = accountOwner;
    accountInfo.classList.remove('hidden');
    ownerField.classList.remove('hidden');
    saveContainer.classList.remove('hidden');
    destProceed.disabled = false;
    destProceed.classList.remove('opacity-50','cursor-not-allowed');
  });

  saveCheckbox?.addEventListener('change', (e) => {
    saveBeneficiary = e.target.checked;
    aliasContainer.classList.toggle('hidden', !saveBeneficiary);
  });

  aliasInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 15) {
      e.target.value = e.target.value.slice(0,15);
    }
    aliasCounter.textContent = `${e.target.value.length}/15`;
  });

  destBack?.addEventListener('click', closeDestSheet);
  destClose?.addEventListener('click', closeDestSheet);
  destProceed?.addEventListener('click', () => {
    const alias = aliasInput?.value?.trim() || '';
    const title = alias || accountOwner || selectedBank;
    selectedDestinationAccountData = createManualAccountDisplay({
      title,
      company: accountOwner || '',
      bank: selectedBank,
      number: accountNumber,
      color: 'bg-amber-100 text-amber-600'
    });
    const destLabelParts = [selectedBank, accountNumber, accountOwner].filter(Boolean);
    destBtn.textContent = destLabelParts.join(' - ');
    destBtn.classList.remove('text-slate-500');
    destSelected = true;
    closeDestSheet();
    updateMethodVisibility();
  });

  function openDrawer() {
    movePane.classList.add('hidden');
    transferPane.classList.remove('hidden');
    successPane?.classList.add('hidden');
    drawer.classList.add('open');
    updateCardGridLayout(true);
    activePaneType = 'transfer';
    updateConfirmSheetContent(activePaneType);
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
    setActiveActivityCard('transfer');
  }

  function closeDrawer() {
    transferPane.classList.add('hidden');
    movePane.classList.add('hidden');
    successPane?.classList.add('hidden');
    drawer.classList.remove('open');
    updateCardGridLayout(false);
    closeSheet();
    closeDestSheet();
    closeConfirmSheet();
    lastTransactionDetails = null;
    activePaneType = DEFAULT_ACTIVITY_TYPE;
    updateConfirmSheetContent(activePaneType);
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
    clearActiveActivityCard();
  }

  function openMoveDrawerPanel() {
    transferPane.classList.add('hidden');
    movePane.classList.remove('hidden');
    successPane?.classList.add('hidden');
    drawer.classList.add('open');
    updateCardGridLayout(true);
    moveSourceBtn.textContent = 'Pilih sumber rekening';
    moveSourceBtn.classList.add('text-slate-500');
    moveDestBtn.textContent = 'Pilih rekening tujuan';
    moveDestBtn.classList.add('text-slate-500');
    moveDestError.classList.add('hidden');
    moveAmountInput.value = '';
    moveAmountError.classList.add('hidden');
    moveCategoryText.textContent = 'Pilih kategori';
    moveCategoryText.classList.add('text-slate-500');
    moveCategorySelected = false;
    moveSelectedCategory = '';
    moveNoteInput.value = '';
    moveNoteCounter.textContent = '0/50';
    moveSourceSelected = false;
    moveDestination = '';
    moveDestValid = false;
    moveAmountValue = 0;
    moveAmountValid = false;
    moveSourceAccountData = null;
    moveDestAccountData = null;
    updateMoveConfirmState();
    activePaneType = 'move';
    updateConfirmSheetContent(activePaneType);
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
    setActiveActivityCard('move');
  }

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
  successCloseBtn?.addEventListener('click', closeDrawer);
  successHeaderClose?.addEventListener('click', closeDrawer);
  openMoveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openMoveDrawerPanel();
  });
  moveCloseBtn?.addEventListener('click', closeDrawer);

  // helpers
  const formatter = new Intl.NumberFormat('id-ID');
  const dailyLimit = 200000000;

  function updateConfirmState() {
    if (sourceSelected && destSelected && amountValid && categorySelected && methodSelected) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('opacity-50','cursor-not-allowed');
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('opacity-50','cursor-not-allowed');
    }
  }

  function updateMoveConfirmState() {
    if (moveSourceSelected && moveDestValid && moveAmountValid && moveCategorySelected) {
      moveConfirmBtn.disabled = false;
      moveConfirmBtn.classList.remove('opacity-50','cursor-not-allowed');
    } else {
      moveConfirmBtn.disabled = true;
      moveConfirmBtn.classList.add('opacity-50','cursor-not-allowed');
    }
  }

  function updateSummary() {
    if (methodSelected && amountValid) {
      summaryNominal.textContent = 'Rp' + formatter.format(amountValue);
      summaryFee.textContent = 'Rp' + formatter.format(selectedFee);
      summaryTotal.textContent = 'Rp' + formatter.format(amountValue + selectedFee);
      summarySection.classList.remove('hidden');
    } else {
      summarySection.classList.add('hidden');
    }
  }

  function updateMethodOptions() {
    const now = new Date();
    availableMethods = (amountValid && sourceSelected && destSelected)
      ? transferMethodsData.filter(m => amountValue >= m.min && amountValue <= m.max && m.check(now))
      : [];
    methodBtn.disabled = availableMethods.length === 0;
    methodBtn.classList.toggle('opacity-50', methodBtn.disabled);
    methodBtn.classList.toggle('cursor-not-allowed', methodBtn.disabled);
    methodSelected = false;
    selectedMethod = '';
    selectedFee = 0;
    methodText.textContent = 'Pilih metode transfer';
    methodText.classList.add('text-slate-500');
    updateConfirmState();
    updateSummary();
  }

  function updateMethodVisibility() {
    if (sourceSelected && destSelected) {
      methodSection.classList.remove('hidden');
      updateMethodOptions();
    } else {
      methodSection.classList.add('hidden');
      methodBtn.disabled = true;
      methodBtn.classList.add('opacity-50','cursor-not-allowed');
      methodText.textContent = 'Pilih metode transfer';
      methodText.classList.add('text-slate-500');
      methodSelected = false;
      selectedMethod = '';
      selectedFee = 0;
      updateConfirmState();
      updateSummary();
    }
  }

  updateMethodVisibility();
  updateMoveConfirmState();

  amountInput?.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g,'');
    e.target.value = raw ? formatter.format(raw) : '';
    amountValue = parseInt(raw) || 0;
    amountValid = amountValue > 0 && amountValue <= dailyLimit;
    updateMethodOptions();
  });

  noteInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 50) {
      e.target.value = e.target.value.slice(0,50);
    }
    noteCounter.textContent = `${e.target.value.length}/50`;
  });

  moveAmountInput?.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g,'');
    e.target.value = raw ? formatter.format(raw) : '';
    moveAmountValue = parseInt(raw) || 0;
    moveAmountValid = moveAmountValue > 0;
    moveAmountError.classList.toggle('hidden', moveAmountValid);
    updateMoveConfirmState();
  });

  moveNoteInput?.addEventListener('input', (e) => {
    if (e.target.value.length > 50) {
      e.target.value = e.target.value.slice(0,50);
    }
    moveNoteCounter.textContent = `${e.target.value.length}/50`;
  });

  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '');
      e.target.value = value ? value[0] : '';
      if (value && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
      updateOtpVerifyState();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (input.value) {
          input.value = '';
          updateOtpVerifyState();
          e.preventDefault();
        } else if (idx > 0) {
          otpInputs[idx - 1].focus();
          otpInputs[idx - 1].value = '';
          updateOtpVerifyState();
          e.preventDefault();
        }
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        otpInputs[idx - 1].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
        e.preventDefault();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData)?.getData('text')?.replace(/\D/g, '') || '';
      if (!text) {
        updateOtpVerifyState();
        return;
      }
      let currentIndex = idx;
      for (const char of text) {
        if (currentIndex >= otpInputs.length) break;
        otpInputs[currentIndex].value = char;
        currentIndex += 1;
      }
      if (currentIndex < otpInputs.length) {
        otpInputs[currentIndex].focus();
      } else {
        otpInputs[otpInputs.length - 1].focus();
      }
      updateOtpVerifyState();
    });
  });

  otpResendBtn?.addEventListener('click', () => {
    resetOtpInputs();
    otpInputs[0]?.focus();
    startOtpTimer();
    setConfirmProceedEnabled(false);
  });


  confirmBtn?.addEventListener('click', () => {
    resetOtpState();
    const ref = Math.floor(100000000 + Math.random()*900000000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    const noteValue = noteInput?.value?.trim() || '';
    const sourceDisplay = selectedSourceAccountData || createFallbackAccountDisplay(sourceBtn.textContent || '-', 'bg-cyan-100 text-cyan-600');
    const destinationDisplay = selectedDestinationAccountData || createFallbackAccountDisplay(destBtn.textContent || '-', 'bg-amber-100 text-amber-600');
    populateConfirmAccount(confirmSourceBadge, sheetSource, sheetSourceCompany, sheetSourceDetail, sourceDisplay, 'bg-cyan-100 text-cyan-600');
    populateConfirmAccount(confirmDestinationBadge, sheetDestination, sheetDestinationCompany, sheetDestinationDetail, destinationDisplay, 'bg-amber-100 text-amber-600');
    if (sheetNominal) {
      sheetNominal.textContent = 'Rp' + formatter.format(amountValue);
    }
    if (sheetBiaya) {
      sheetBiaya.textContent = 'Rp' + formatter.format(selectedFee);
    }
    if (sheetTotal) {
      sheetTotal.textContent = 'Rp' + formatter.format(amountValue + selectedFee);
    }
    setTextOrFallback(sheetCategory, selectedCategory, '-');
    setTextOrFallback(sheetNote, noteValue, '-');
    setTextOrFallback(sheetRef, String(ref), '-');
    setTextOrFallback(sheetDate, `${dateStr}, ${timeStr}`, '-');
    lastTransactionDetails = {
      type: 'transfer',
      source: sourceDisplay,
      destination: destinationDisplay,
      amount: amountValue,
      fee: selectedFee,
      total: amountValue + selectedFee,
      method: selectedMethod || '-',
      reference: String(ref),
      datetime: `${dateStr}, ${timeStr}`,
      category: selectedCategory || '-',
      note: noteValue || '-',
      createdBy: currentUserFullName
    };
    updateConfirmSheetContent('transfer');
    setConfirmProceedEnabled(true);
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      confirmSheet.classList.remove('translate-y-full');
    });
  });

  moveConfirmBtn?.addEventListener('click', () => {
    resetOtpState();
    const ref = Math.floor(100000000 + Math.random()*900000000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    const noteValue = moveNoteInput?.value?.trim() || '';
    const sourceDisplay = moveSourceAccountData || createFallbackAccountDisplay(moveSourceBtn.textContent || '-', 'bg-cyan-100 text-cyan-600');
    const destDisplay = moveDestAccountData || createFallbackAccountDisplay(moveDestBtn.textContent || '-', 'bg-amber-100 text-amber-600');
    populateConfirmAccount(confirmSourceBadge, sheetSource, sheetSourceCompany, sheetSourceDetail, sourceDisplay, 'bg-cyan-100 text-cyan-600');
    populateConfirmAccount(confirmDestinationBadge, sheetDestination, sheetDestinationCompany, sheetDestinationDetail, destDisplay, 'bg-amber-100 text-amber-600');
    if (sheetNominal) {
      sheetNominal.textContent = 'Rp' + formatter.format(moveAmountValue);
    }
    if (sheetBiaya) {
      sheetBiaya.textContent = 'Rp' + formatter.format(0);
    }
    if (sheetTotal) {
      sheetTotal.textContent = 'Rp' + formatter.format(moveAmountValue);
    }
    setTextOrFallback(sheetCategory, moveSelectedCategory, '-');
    setTextOrFallback(sheetNote, noteValue, '-');
    setTextOrFallback(sheetRef, String(ref), '-');
    setTextOrFallback(sheetDate, `${dateStr}, ${timeStr}`, '-');
    lastTransactionDetails = {
      type: 'move',
      source: sourceDisplay,
      destination: destDisplay,
      amount: moveAmountValue,
      fee: 0,
      total: moveAmountValue,
      method: 'Pindah Buku',
      reference: String(ref),
      datetime: `${dateStr}, ${timeStr}`,
      category: moveSelectedCategory || '-',
      note: noteValue || '-',
      createdBy: currentUserFullName
    };
    updateConfirmSheetContent('move');
    setConfirmProceedEnabled(true);
    sheetOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetOverlay.classList.add('opacity-100');
      confirmSheet.classList.remove('translate-y-full');
    });
  });

  confirmBack?.addEventListener('click', closeConfirmSheet);
  confirmClose?.addEventListener('click', closeConfirmSheet);
  confirmProceed?.addEventListener('click', (e) => {
    if (!otpActive) {
      e.preventDefault();
      showOtpSection();
      return;
    }
    if (confirmProceed.disabled) return;
    e.preventDefault();
    const otpValue = otpInputs.map(input => input.value).join('');
    console.log('OTP submitted:', otpValue);
    closeConfirmSheet();
    openSuccessPane();
  });
});

