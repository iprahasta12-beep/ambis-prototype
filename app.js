/* ---------- SIDEBAR ---------- */
   document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Drawer logic ---------- */
  const trigger    = document.getElementById('tilePlnToken');
  const pane       = document.getElementById('plnPane');
  const inner      = document.getElementById('plnPaneInner');
  const closeBtn   = document.getElementById('closePlnPane');
  const tokenBtns  = pane.querySelectorAll('.token-btn');
  const confirm    = document.getElementById('confirmBtn');
  const idInput    = document.getElementById('plnIdInput');
  const split      = document.getElementById('deskSplit');

  // Sidebar auto-collapse while drawer is open
  const sidebar    = document.getElementById('sidebar');
  let sidebarWasCollapsed = false;   // remember previous state

  function setTileSelected(sel) {
    trigger.classList.toggle('ring-2', sel);
    trigger.classList.toggle('ring-cyan-400', sel);
    trigger.classList.toggle('border-cyan-300', sel);
    trigger.classList.toggle('bg-cyan-50', sel);
  }

  function openPane() {
    // remove gutter between left and drawer
    split?.classList.remove('gap-6');
    split?.classList.add('gap-0');

    // expand drawer width
    pane.classList.remove('w-0', 'duration-150');
    pane.classList.add('w-[520px]', 'duration-300'); // open at normal speed

    requestAnimationFrame(() => {
      inner.classList.remove('opacity-0','translate-x-4');
      inner.classList.add('opacity-100','translate-x-0');
    });
    setTileSelected(true);

    // collapse sidebar temporarily
    if (sidebar) {
      sidebarWasCollapsed = sidebar.classList.contains('collapsed');
      if (!sidebarWasCollapsed) sidebar.classList.add('collapsed');
    }
  }

  function closePane() {
    // speed up close a bit
    pane.classList.remove('duration-300');
    pane.classList.add('duration-150');

    inner.classList.add('opacity-0','translate-x-4');
    inner.classList.remove('opacity-100','translate-x-0');

    // collapse width after the fade
    setTimeout(() => {
      pane.classList.remove('w-[520px]');
      pane.classList.add('w-0');
      // restore gutter after it fully closed
      split?.classList.remove('gap-0');
      split?.classList.add('gap-6');

      // restore sidebar state if we collapsed it
      if (sidebar && !sidebarWasCollapsed) sidebar.classList.remove('collapsed');

      // return duration back for next open
      pane.classList.remove('duration-150');
      pane.classList.add('duration-300');
    }, 160); // slightly faster than open
    setTileSelected(false);
  }

  function updateConfirm() {
    const picked = [...tokenBtns].some(b => b.classList.contains('ring-2'));
    const hasId  = idInput.value.trim().length > 0;
    const enable = picked && hasId;
    confirm.disabled = !enable;
    confirm.classList.toggle('bg-slate-200', !enable);
    confirm.classList.toggle('text-slate-400', !enable);
    confirm.classList.toggle('bg-cyan-600', enable);
    confirm.classList.toggle('text-white', enable);
    confirm.classList.toggle('hover:bg-cyan-700', enable);
  }

  trigger?.addEventListener('click', (e)=>{ e.preventDefault(); openPane(); });
  closeBtn?.addEventListener('click', closePane);

  tokenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tokenBtns.forEach(b => b.classList.remove('ring-2','ring-cyan-400','bg-cyan-50','border-cyan-300'));
      btn.classList.add('ring-2','ring-cyan-400','bg-cyan-50','border-cyan-300');
      updateConfirm();
    });
  });
  idInput.addEventListener('input', updateConfirm);

  /* ---------- Sidebar collapse (persisted) ---------- */
  const btn = document.getElementById('navToggle');
  const label = document.getElementById('collapseLabel');
  const STORAGE_KEY = 'ambis:sidebar-collapsed';

  function setCollapsed(collapsed) {
    sidebar.classList.toggle('collapsed', collapsed);
    btn?.setAttribute('aria-expanded', String(!collapsed));
    if (label) label.textContent = collapsed ? 'Perbesar Navigasi' : 'Perkecil Navigasi';
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  }

  const saved = localStorage.getItem(STORAGE_KEY) === '1';
  setCollapsed(saved);
  btn?.addEventListener('click', () => setCollapsed(!sidebar.classList.contains('collapsed')));
});

 /* ---------- SIDEBAR ---------- */

 /* ---------- DRAWER ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const split    = document.getElementById('deskSplit');
  const sidebar  = document.getElementById('sidebar');

  const pane     = document.getElementById('plnPane');
  const inner    = document.getElementById('plnPaneInner');
  const closeBtn = document.getElementById('closePlnPane');

  const tokenTile = document.getElementById('tilePlnToken');
  const billTile  = document.getElementById('tilePlnBill');

  const jenisBtn   = document.getElementById('jenisBtn');
  const jenisMenu  = document.getElementById('jenisMenu');
  const jenisLabel = document.getElementById('jenisLabel');
  const noteLine1  = document.getElementById('noteLine1');

  const tokenSection = document.getElementById('tokenSection');
  const billSection  = document.getElementById('billSection');

  const idInput   = document.getElementById('plnIdInput');
  const confirm   = document.getElementById('confirmBtn');

  let tokenBtns = [];
  let sidebarWasCollapsed = false;
  let mode = 'token';            // 'token' | 'bill'
  let isOpen = false;            // <— NEW: drawer visibility

  // ---- tile highlight helpers ----
  const ACTIVE_CLASSES = ['ring-2','ring-cyan-400','border-cyan-300','bg-cyan-50'];
  function clearTileActive() {
    [tokenTile, billTile].forEach(el => el && el.classList.remove(...ACTIVE_CLASSES));
  }
  function setTileActive(m) {
    clearTileActive();
    if (m === 'token' && tokenTile) tokenTile.classList.add(...ACTIVE_CLASSES);
    if (m === 'bill'  && billTile)  billTile.classList.add(...ACTIVE_CLASSES);
  }

  function collapseSidebarForDrawer() {
    if (sidebar) {
      sidebarWasCollapsed = sidebar.classList.contains('collapsed');
      if (!sidebarWasCollapsed) sidebar.classList.add('collapsed');
    }
    split?.classList.remove('gap-6'); split?.classList.add('gap-0');
  }
  function restoreSidebarAfterDrawer() {
    split?.classList.remove('gap-0'); split?.classList.add('gap-6');
    if (sidebar && !sidebarWasCollapsed) sidebar.classList.remove('collapsed');
  }

  // ---- open/close ----
  function openPane(openMode = 'token') {
    isOpen = true;                         // <— mark open
    setMode(openMode);
    collapseSidebarForDrawer();
    pane.classList.replace('w-0','w-[520px]');
    requestAnimationFrame(() => {
      inner.classList.remove('opacity-0','translate-x-2');
      inner.classList.add('opacity-100','translate-x-0');
    });
    setTileActive(mode);                   // <— highlight only now
  }
  function closePane() {
    inner.classList.add('opacity-0','translate-x-2');
    inner.classList.remove('opacity-100','translate-x-0');
    setTimeout(() => {
      pane.classList.replace('w-[520px]','w-0');
      restoreSidebarAfterDrawer();
      isOpen = false;                      // <— mark closed
      clearTileActive();                   // <— remove highlight when closed
    }, 200);
  }

  closeBtn?.addEventListener('click', closePane);
  tokenTile?.addEventListener('click', e => { e.preventDefault(); openPane('token'); });
  billTile?.addEventListener('click',  e => { e.preventDefault(); openPane('bill');  });

  // ---- mode switching ----
  function isTokenPicked() {
    return tokenBtns.some(b => b.classList.contains('ring-2'));
  }
  function updateConfirm() {
    const hasId = idInput.value.trim().length > 0;
    const enable = (mode === 'token') ? (hasId && isTokenPicked()) : hasId;

    confirm.disabled = !enable;
    confirm.textContent = (mode === 'token') ? 'Konfirmasi Pembelian' : 'Konfirmasi Pembayaran';
    confirm.classList.toggle('bg-slate-200', !enable);
    confirm.classList.toggle('text-slate-400', !enable);
    confirm.classList.toggle('bg-cyan-600', enable);
    confirm.classList.toggle('text-white', enable);
    confirm.classList.toggle('hover:bg-cyan-700', enable);
  }

  function setMode(next) {
    mode = next;

    // labels / note
    if (mode === 'token') {
      jenisLabel.textContent = 'Token Listrik';
      noteLine1.textContent  = '- Cek limit kWH sebelum melakukan transaksi PLN prabayar.';
    } else {
      jenisLabel.textContent = 'Tagihan Listrik';
      noteLine1.textContent  = '- Pembayaran tagihan listrik di atas tanggal 20 akan dikenakan denda oleh PLN.';
    }

    // sections
    tokenSection.classList.toggle('hidden', mode !== 'token');
    billSection.classList.toggle('hidden',  mode !== 'bill');

    // token nominal binding
    if (mode === 'token') {
      tokenBtns = Array.from(tokenSection.querySelectorAll('.token-btn'));
      tokenBtns.forEach(btn => {
        btn.onclick = () => {
          tokenBtns.forEach(b => b.classList.remove('ring-2','ring-cyan-400','bg-cyan-50','border-cyan-300'));
          btn.classList.add('ring-2','ring-cyan-400','bg-cyan-50','border-cyan-300');
          updateConfirm();
        };
      });
    } else {
      tokenBtns.forEach(b => b.classList.remove('ring-2','ring-cyan-400','bg-cyan-50','border-cyan-300'));
    }

    // only reflect tile active when drawer is open
    if (isOpen) setTileActive(mode); else clearTileActive();

    updateConfirm();
    hideJenisMenu();
  }

  idInput.addEventListener('input', updateConfirm);

  // ---- Jenis dropdown ----
  function hideJenisMenu(){ jenisMenu.classList.add('hidden'); }
  jenisBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    jenisMenu.classList.toggle('hidden');
  });
  document.addEventListener('click', hideJenisMenu);
  jenisMenu.querySelectorAll('button[data-mode]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const m = e.currentTarget.getAttribute('data-mode');
      setMode(m === 'bill' ? 'bill' : 'token');
    });
  });

  // initial content setup WITHOUT activating any tile
  setMode('token');       // sets labels/sections only
  clearTileActive();      // ensure no tile is highlighted on load
});


 /* ---------- DRAWER ---------- */

 /* ---------- BOTTOM SHEET ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const inner         = document.getElementById('plnPaneInner');   // drawer scroller
  const btnRekening   = document.getElementById('btnRekening');     // trigger in drawer

  // sheet elements
  const sheet         = document.getElementById('sheetRekening');
  const sheetPanel    = document.getElementById('sheetPanel');
  const sheetBackdrop = document.getElementById('sheetBackdrop');
  const sheetCancel   = document.getElementById('sheetCancel');
  const sheetChoose   = document.getElementById('sheetChoose');

  // where we write the selection
  const rekeningLabel = document.getElementById('rekeningLabel');

  let ignoreNextOutside = false;   // guards the open→close race

  function enableChoose(enable) {
    sheetChoose.disabled = !enable;
    sheetChoose.classList.toggle('cursor-not-allowed', !enable);
    sheetChoose.classList.toggle('bg-slate-200', !enable);
    sheetChoose.classList.toggle('text-slate-400', !enable);

    sheetChoose.classList.toggle('bg-cyan-600', enable);
    sheetChoose.classList.toggle('text-white', enable);
    sheetChoose.classList.toggle('hover:bg-cyan-700', enable);
  }

  function openSheet() {
    ignoreNextOutside = true;

    // normal (longer) duration on open
    sheetPanel.classList.remove('duration-100'); sheetPanel.classList.add('duration-200');
    sheetBackdrop.classList.remove('duration-100'); sheetBackdrop.classList.add('duration-200');

    inner.classList.add('overflow-hidden'); // lock drawer scroll
    sheet.classList.remove('hidden');

    // reset state
    enableChoose(false);
    sheet.querySelectorAll('input[name="rek"]').forEach(r => { r.checked = false; });

    requestAnimationFrame(() => {
      sheetBackdrop.classList.remove('opacity-0');     // fade in
      sheetPanel.classList.remove('translate-y-full'); // slide up
      setTimeout(() => { ignoreNextOutside = false; }, 0); // allow outside-close next tick
    });
  }

  function closeSheet() {
    // faster close
    sheetPanel.classList.remove('duration-200'); sheetPanel.classList.add('duration-100');
    sheetBackdrop.classList.remove('duration-200'); sheetBackdrop.classList.add('duration-100');

    sheetBackdrop.classList.add('opacity-0');      // fade out
    sheetPanel.classList.add('translate-y-full');  // slide down

    setTimeout(() => {
      sheet.classList.add('hidden');
      inner.classList.remove('overflow-hidden');   // unlock drawer scroll

      // restore normal duration for next open
      sheetPanel.classList.remove('duration-100'); sheetPanel.classList.add('duration-200');
      sheetBackdrop.classList.remove('duration-100'); sheetBackdrop.classList.add('duration-200');
    }, 110);
  }

  // Open (prevent immediate outside-close)
  btnRekening?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSheet();
  });

  // Enable choose once a radio is picked
  sheet.querySelectorAll('input[name="rek"]').forEach(radio => {
    radio.addEventListener('change', () => enableChoose(true));
  });

  // Apply chosen rekening to the drawer label
  sheetChoose?.addEventListener('click', () => {
    const picked = sheet.querySelector('input[name="rek"]:checked');
    if (!picked) return;
    rekeningLabel.textContent = picked.value;
    rekeningLabel.classList.remove('text-slate-400'); // no longer placeholder
    closeSheet();
  });

  // Cancel
  sheetCancel?.addEventListener('click', (e) => {
    e.preventDefault();
    closeSheet();
  });

  // Close when clicking backdrop
  sheetBackdrop?.addEventListener('click', closeSheet);

  // Close on outside clicks anywhere in the drawer (but ignore the open click)
  document.addEventListener('click', (e) => {
    if (sheet.classList.contains('hidden')) return;
    if (ignoreNextOutside) return;
    if (!sheetPanel.contains(e.target)) closeSheet();
  });

  // Don’t close when clicking inside the panel
  sheetPanel?.addEventListener('click', (e) => e.stopPropagation());

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sheet.classList.contains('hidden')) closeSheet();
  });
});

 /* ---------- BOTTOM SHEET ---------- */

 /* ---------- NUMBER VALIDATION ---------- */

document.addEventListener("DOMContentLoaded", () => {
  const plnIdInput = document.getElementById("plnIdInput");
  const confirmBtn = document.getElementById("confirmBtn");
  const plnIdError = document.getElementById("plnIdError");
  const plnIdGlobalError = document.getElementById("plnIdGlobalError");
  const closeGlobalError = document.getElementById("closeGlobalError");
  const rekeningLabel = document.getElementById("rekeningLabel");
  const sheetChoose = document.getElementById("sheetChoose");
  const rekRadios = document.querySelectorAll('input[name="rek"]');
  const tokenButtons = document.querySelectorAll(".token-btn");
  const jenisLabel = document.getElementById("jenisLabel"); // "Token Listrik" or "Tagihan Listrik"

  const VALID_TAGIHAN_ID = "00988906554";
  let selectedRek = null;
  let selectedNominal = null;
  let errorTimeout = null;

  // Rule: must be exactly 11 digits
  const isValidId = (val) => /^\d{11}$/.test(val);

  // Update Confirm Button State
  const updateConfirmState = () => {
    const idValue = plnIdInput.value.trim();
    const idValid = isValidId(idValue);
    const rekValid = !!selectedRek;
    const mode = jenisLabel.textContent.trim();

    let nominalValid = true;
    if (mode === "Token Listrik") {
      nominalValid = !!selectedNominal;
    }

    // For enabling button: just basic validity (format + rek + nominal if needed)
    if (idValid && rekValid && nominalValid) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove("bg-slate-200", "text-slate-400");
      confirmBtn.classList.add("bg-cyan-600", "text-white", "hover:bg-cyan-700");
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.remove("bg-cyan-600", "text-white", "hover:bg-cyan-700");
      confirmBtn.classList.add("bg-slate-200", "text-slate-400");
    }
  };

  // Input validation
  plnIdInput.addEventListener("input", () => {
    const value = plnIdInput.value.trim();
    plnIdGlobalError.classList.add("hidden");

    if (isValidId(value)) {
      plnIdInput.classList.remove("border-rose-400");
      plnIdError.classList.add("hidden");
    } else {
      if (value.length > 0) {
        plnIdInput.classList.add("border-rose-400");
        plnIdError.classList.remove("hidden");
      } else {
        plnIdInput.classList.remove("border-rose-400");
        plnIdError.classList.add("hidden");
      }
    }

    updateConfirmState();
  });

  // Rekening selection
  rekRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      selectedRek = radio.value;
      rekeningLabel.textContent = radio.value;
      rekeningLabel.classList.remove("text-slate-400");
      sheetChoose.disabled = false;
      sheetChoose.classList.remove("bg-slate-200", "text-slate-400", "cursor-not-allowed");
      sheetChoose.classList.add("bg-cyan-600", "text-white", "hover:bg-cyan-700");
      updateConfirmState();
    });
  });

  // Token nominal selection
  tokenButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tokenButtons.forEach(b => b.classList.remove("border-cyan-600", "bg-cyan-50"));
      btn.classList.add("border-cyan-600", "bg-cyan-50");
      selectedNominal = btn.textContent.trim();
      updateConfirmState();
    });
  });

  // Confirm click
  confirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const value = plnIdInput.value.trim();
    const mode = jenisLabel.textContent.trim();

    let valid = false;

    if (mode === "Token Listrik") {
      // All token IDs are considered invalid
      valid = false;
    } else if (mode === "Tagihan Listrik") {
      // Only one specific ID is valid
      valid = value === VALID_TAGIHAN_ID;
    }

    if (!valid) {
      plnIdGlobalError.classList.remove("hidden");

      if (errorTimeout) clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => {
        plnIdGlobalError.classList.add("hidden");
      }, 5000);

      return;
    }

    const sheetConfirm = document.getElementById("sheetConfirmToken");
const sheetConfirmBackdrop = document.getElementById("sheetConfirmBackdrop");
const sheetConfirmPanel = document.getElementById("sheetConfirmPanel");

// show sheet
sheetConfirm.classList.remove("hidden");
requestAnimationFrame(() => {
  sheetConfirmBackdrop.classList.add("opacity-100");
  sheetConfirmPanel.classList.remove("translate-y-full");
});

// optional: close handler
document.getElementById("sheetConfirmCancel").addEventListener("click", () => {
  sheetConfirmBackdrop.classList.remove("opacity-100");
  sheetConfirmPanel.classList.add("translate-y-full");
  setTimeout(() => sheetConfirm.classList.add("hidden"), 200);
});
  });

  // Close global error manually
  closeGlobalError.addEventListener("click", () => {
    plnIdGlobalError.classList.add("hidden");
    if (errorTimeout) clearTimeout(errorTimeout);
  });
});

/* ---------- NUMBER VALIDATION ---------- */

/* ---------- DYNAMIC SUMBER REKENING---------- */

const sheetChoose = document.getElementById("sheetChoose");

sheetChoose?.addEventListener("click", () => {
  const selected = document.querySelector('input[name="rek"]:checked');
  if (!selected) return;

  // find label info
  const label = selected.closest("label");
  const name = label.querySelector("div.font-semibold").textContent;
  const noRek = label.querySelector(".text-slate-500").textContent;
  const saldo = label.querySelector("span.text-right").textContent;
  const icon = label.querySelector("span.w-10").cloneNode(true);

  // update drawer label
  document.getElementById("rekeningLabel").textContent = name;

  // update confirm sheet with same style
  document.getElementById("confirmRekName").textContent = name;
  document.getElementById("confirmRekNo").textContent = noRek;
  document.getElementById("confirmRekSaldo").textContent = saldo;

  const confirmIcon = document.getElementById("confirmRekIcon");
  confirmIcon.replaceWith(icon); // replace with the same styled circle
});

const saveChk = document.getElementById("saveNumberChk");
const aliasInput = document.getElementById("aliasInput");
if (saveChk && aliasInput) {
  saveChk.addEventListener("change", () => {
    if (saveChk.checked) {
      aliasInput.disabled = false;
      aliasInput.classList.remove("bg-slate-100", "text-slate-400");
    } else {
      aliasInput.disabled = true;
      aliasInput.classList.add("bg-slate-100", "text-slate-400");
    }
  });
}

/* ---------- MOBILE TOKEN ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const btnPay = document.getElementById("sheetConfirmBuy");
  const verifySection = document.getElementById("verificationSection");
  const otpTimerEl = document.getElementById("otpTimer");

  let otpInterval = null;
  const startOtpTimer = (seconds = 300) => {
    if (otpInterval) clearInterval(otpInterval);
    let remain = seconds;

    const render = () => {
      const m = String(Math.floor(remain / 60)).padStart(2, "0");
      const s = String(remain % 60).padStart(2, "0");
      if (otpTimerEl) otpTimerEl.textContent = `${m}:${s}`;
    };

    render();
    otpInterval = setInterval(() => {
      remain = Math.max(0, remain - 1);
      render();
      if (remain === 0) clearInterval(otpInterval);
    }, 1000);
  };

  // klik "Bayar Tagihan Listrik" -> tampilkan OTP, scroll, ubah tombol, remove note
  btnPay.addEventListener("click", () => {
    // tampilkan section OTP
    verifySection.classList.remove("hidden");

    // ubah tombol -> Verifikasi (disabled)
    btnPay.textContent = "Verifikasi";
    btnPay.disabled = true;
    btnPay.classList.remove("bg-cyan-600", "hover:bg-cyan-700", "text-white");
    btnPay.classList.add("bg-slate-200", "text-slate-400", "cursor-not-allowed");

    // hapus note dengan ikon i di dalam sheet
    const noteWithIcon = document.querySelector(
      "#sheetConfirmPanel .bg-blue-50.border-blue-100"
    );
    if (noteWithIcon) noteWithIcon.remove();

    // mulai timer 05:00
    startOtpTimer(300);

    // anchor/scroll ke section OTP
    verifySection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // enable tombol saat 6 digit terisi
  const inputs = verifySection.querySelectorAll("input");
  inputs.forEach((input, idx) => {
    input.addEventListener("input", () => {
      if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();

      const filled = Array.from(inputs).every(i => i.value.trim() !== "");
      if (filled) {
        btnPay.disabled = false;
        btnPay.classList.add("bg-cyan-600", "hover:bg-cyan-700", "text-white");
        btnPay.classList.remove("bg-slate-200", "text-slate-400", "cursor-not-allowed");
      } else {
        btnPay.disabled = true;
        btnPay.classList.remove("bg-cyan-600", "hover:bg-cyan-700", "text-white");
        btnPay.classList.add("bg-slate-200", "text-slate-400", "cursor-not-allowed");
      }
    });

    // navigasi dengan panah & backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && idx > 0) inputs[idx - 1].focus();
      if (e.key === "ArrowLeft" && idx > 0) inputs[idx - 1].focus();
      if (e.key === "ArrowRight" && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
  });
});

/* ---------- MOBILE TOKEN ---------- */

// OTP logic
document.addEventListener("DOMContentLoaded", () => {
  const sheetConfirmBuy = document.getElementById("sheetConfirmBuy");
  const verificationSection = document.getElementById("verificationSection");
  const otpInputs = verificationSection.querySelectorAll("input[maxlength='1']");

  const VALID_OTP = "29042404"; // ✅ the only valid OTP

  // error element
  let otpError = document.getElementById("otpError");
  if (!otpError) {
    otpError = document.createElement("p");
    otpError.id = "otpError";
    otpError.className = "text-center text-sm text-rose-600 mt-2 hidden";
    verificationSection.appendChild(otpError);
  }

  const showOtpError = (msg) => {
    otpError.textContent = msg;
    otpError.classList.remove("hidden");
  };
  const hideOtpError = () => otpError.classList.add("hidden");

  const getOtpValue = () =>
    Array.from(otpInputs).map((i) => i.value).join("");

  const clearOtp = () => otpInputs.forEach((i) => (i.value = ""));

  // move focus automatically
  otpInputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 1);
      if (e.target.value && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
      hideOtpError();
      // enable button only if 8 digits entered
      sheetConfirmBuy.disabled = getOtpValue().length < 8;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });
  });

  // click handler
  sheetConfirmBuy.addEventListener("click", () => {
    if (!verificationSection.classList.contains("hidden")) {
      const otp = getOtpValue();
      if (otp.length < 8) {
        showOtpError("Kode verifikasi harus 8 digit.");
        sheetConfirmBuy.disabled = true; // back to disabled
        return;
      }

      if (otp !== VALID_OTP) {
        showOtpError("Kode verifikasi salah. Silakan coba lagi.");
        clearOtp();
        sheetConfirmBuy.disabled = true; // back to disabled
        return;
      }

      // ✅ Correct OTP flow → close sheet & open Success drawer
hideOtpError();

// 1) Close the confirm bottom sheet
const sheetConfirm         = document.getElementById("sheetConfirmToken");
const sheetConfirmBackdrop = document.getElementById("sheetConfirmBackdrop");
const sheetConfirmPanel    = document.getElementById("sheetConfirmPanel");

sheetConfirmBackdrop.classList.remove("opacity-100");
sheetConfirmPanel.classList.add("translate-y-full");

// 2) After the close animation, open the success drawer
setTimeout(() => {
  sheetConfirm.classList.add("hidden");

  // Collect values to display
  const jenis   = document.getElementById("jenisLabel")?.textContent?.trim() || "Tagihan Listrik";
  const idVal   = document.getElementById("plnIdInput")?.value?.trim() || "ID12230";

  // Demo/static values to match your success spec (swap with real data later)
  const payload = {
    jenis,
    id: idVal,
    meter:  "45093051325",
    nama:   "RAM*********",
    tarif:  "R2 / 4400 VA",
    kwh:    "120",
    jumlahBulan: "2",
    periode: "Juli & Agustus 2025",
    // optional totals (only used if you kept the totals section)
    nominal: "Rp1.000.000",
    admin:   "Rp2.500",
    total:   "Rp1.002.500",
  };

  // Prefer helper if you added it earlier
  if (typeof openSuccessDrawer === "function") {
    openSuccessDrawer(payload);
  } else {
    // Fallback: populate fields and reveal the success drawer directly
    const paneInput   = document.getElementById("plnPane");
    const paneSucc    = document.getElementById("plnSuccessPane");
    const innerSucc   = document.getElementById("plnSuccessInner");

    // Fill success content
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("succJenis",   payload.jenis);
    set("succId",      payload.id);
    set("succMeter",   payload.meter);
    set("succNama",    payload.nama);
    set("succTarif",   payload.tarif);
    set("succKwh",     payload.kwh);
    set("succBulan",   payload.jumlahBulan);
    set("succPeriode", payload.periode);
    if (document.getElementById("succNominal")) {
      set("succNominal", payload.nominal);
      set("succAdmin",   payload.admin);
      set("succTotal",   payload.total);
    }

    // Slide out input drawer, slide in success drawer
    const split = document.getElementById("deskSplit");
    paneInput?.classList.replace("w-[520px]", "w-0");
    split?.classList.remove("gap-6"); split?.classList.add("gap-0");

    paneSucc?.classList.replace("w-0", "w-[520px]");
    requestAnimationFrame(() => {
      innerSucc?.classList.remove("opacity-0","translate-x-2");
      innerSucc?.classList.add("opacity-100","translate-x-0");
    });

    // Close handlers
    const closeSuccess = () => {
      innerSucc?.classList.add("opacity-0","translate-x-2");
      innerSucc?.classList.remove("opacity-100","translate-x-0");
      setTimeout(() => {
        paneSucc?.classList.replace("w-[520px]", "w-0");
        split?.classList.remove("gap-0"); split?.classList.add("gap-6");
      }, 200);
    };
    document.getElementById("closeSuccessPane")?.addEventListener("click", closeSuccess, { once:true });
    document.getElementById("successCloseBtn")?.addEventListener("click", closeSuccess, { once:true });
  }
}, 180);

    }
  });
});

/* ---------- RESET ACTIVE BUTTON ---------- */
function closeSuccessDrawer() {
  const split     = document.getElementById('deskSplit');
  const paneSucc  = document.getElementById('plnSuccessPane');
  const innerSucc = document.getElementById('plnSuccessInner');
  const billTile  = document.getElementById('tilePlnBill');

  innerSucc.classList.add('opacity-0','translate-x-2');
  innerSucc.classList.remove('opacity-100','translate-x-0');
  setTimeout(() => {
    paneSucc?.classList.replace('w-[520px]', 'w-0');
    split?.classList.remove('gap-0'); 
    split?.classList.add('gap-6');

    // reset Tagihan Listrik tile to inactive
    billTile?.classList.remove('ring-2','ring-cyan-400','border-cyan-300','bg-cyan-50');
  }, 200);
}

// also re-bind
document.getElementById('closeSuccessPane')?.addEventListener('click', closeSuccessDrawer);
document.getElementById('successCloseBtn')?.addEventListener('click', closeSuccessDrawer);
