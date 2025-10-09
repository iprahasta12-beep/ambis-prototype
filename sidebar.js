// sidebar.js — sidebar collapse + persistent state + safe navigation
// Apply saved collapse state early to avoid width flicker on page load
const STORAGE_KEY = 'ambis:sidebar-collapsed';
let initialCollapsed = false;
try { initialCollapsed = localStorage.getItem(STORAGE_KEY) === '1'; } catch {}
if (initialCollapsed) document.documentElement.classList.add('sidebar-collapsed');

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const btn     = document.getElementById('navToggle');
  const label   = document.getElementById('collapseLabel');
  if (!sidebar || !btn) return;

  // --- Brand node
  const brandWrap = sidebar.querySelector('.px-6.pt-6 .sb-label');
  const brandP    = brandWrap?.querySelector('p');
  const brandApi  = window.AMBIS || {};
  let brandText   = typeof brandApi.getBrandName === 'function'
    ? brandApi.getBrandName()
    : (brandApi.brandName || brandP?.textContent?.trim() || '');

  if (brandP) {
    brandP.textContent = brandText;
  }

  if (brandWrap) {
    brandWrap.style.transition = 'none';
    brandWrap.style.opacity = '';
  }

  // --- Config
  const EXPANDED_WIDTH  = 300;
  const COLLAPSED_WIDTH = 84;
  const ANIM_MS         = 250;

  function hideBrand() {
    if (!brandWrap || !brandP) return;
    brandWrap.style.display = 'none';
    brandP.textContent = '';
  }
  function showBrand() {
    if (!brandWrap || !brandP) return;
    brandWrap.style.display = '';
    brandP.textContent = brandText;
  }
  function applyWidth(collapsed) {
    sidebar.style.width = `${collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`;
  }
  function afterWidthTransition(cb) {
    let done = false;
    const onEnd = (e) => {
      if (e.propertyName !== 'width') return;
      if (done) return;
      done = true;
      sidebar.removeEventListener('transitionend', onEnd);
      cb();
    };
    sidebar.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(() => {
      if (!done) {
        sidebar.removeEventListener('transitionend', onEnd);
        cb();
      }
    }, ANIM_MS + 20);
  }

  function setCollapsed(collapsed, { persist = true, animate = true } = {}) {
    if (!animate) sidebar.style.transition = 'none';

    sidebar.classList.toggle('collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    applyWidth(collapsed);

    if (label) label.textContent = collapsed ? 'Perbesar Navigasi' : 'Perkecil Navigasi';

    if (collapsed) {
      hideBrand();
    } else {
      hideBrand();
      if (animate) afterWidthTransition(showBrand);
      else showBrand();
    }

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch {}
    }

    if (!animate) {
      requestAnimationFrame(() => {
        sidebar.style.transition = `width ${ANIM_MS}ms ease`;
      });
    }
  }

  // --- Restore saved state instantly (no flicker, handled by CSS + body class)
  setCollapsed(initialCollapsed, { persist: false, animate: false });

  // --- Toggle button (with animation)
  btn.addEventListener('click', () => {
    setCollapsed(!sidebar.classList.contains('collapsed'), { animate: true });
  });

  if (typeof brandApi.onBrandNameChange === 'function') {
    brandApi.onBrandNameChange((name) => {
      brandText = name;
      if (brandWrap && !sidebar.classList.contains('collapsed')) {
        brandP.textContent = brandText;
      }
    });
  }

  // --- Navigation: icons always navigate
  const sbLinks = sidebar.querySelectorAll('a.sb-item');
  sbLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.stopPropagation(); // don’t toggle
    });
    const lbl = a.querySelector('.sb-label');
    const text = lbl?.textContent.trim();
    if (text) {
      if (!a.title) a.title = text;
      a.setAttribute('data-label', text);
    }
  });

  // --- Blocked feature dialog (Manajemen Pengguna)
  const USER_MGMT_SELECTOR = 'a[href="manajemen-pengguna.html"]';
  const userMgmtLinks = sidebar ? sidebar.querySelectorAll(USER_MGMT_SELECTOR) : [];

  const DIALOG_ID = 'userMgmtAccessDialog';
  let userMgmtOverlay = null;
  let userMgmtDialog = null;
  let userMgmtCloseBtn = null;
  let userMgmtPrevOverflow = '';
  let userMgmtLastFocus = null;

  function hideUserMgmtDialog() {
    if (!userMgmtOverlay) return;
    userMgmtOverlay.classList.remove('is-visible');
    userMgmtOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = userMgmtPrevOverflow;
    if (userMgmtLastFocus && typeof userMgmtLastFocus.focus === 'function') {
      userMgmtLastFocus.focus();
    }
  }

  function showUserMgmtDialog() {
    ensureUserMgmtDialog();
    if (!userMgmtOverlay) return;
    userMgmtLastFocus = document.activeElement;
    userMgmtPrevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    userMgmtOverlay.classList.add('is-visible');
    userMgmtOverlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      userMgmtCloseBtn?.focus();
    });
  }

  function ensureUserMgmtDialog() {
    if (userMgmtOverlay) return userMgmtOverlay;

    userMgmtOverlay = document.getElementById(DIALOG_ID);
    if (!userMgmtOverlay) {
      userMgmtOverlay = document.createElement('div');
      userMgmtOverlay.id = DIALOG_ID;
      userMgmtOverlay.className = 'user-mgmt-overlay';
      userMgmtOverlay.setAttribute('aria-hidden', 'true');
      userMgmtOverlay.innerHTML = `
        <div class="user-mgmt-dialog" role="dialog" aria-modal="true" aria-labelledby="userMgmtDialogTitle" aria-describedby="userMgmtDialogMessage" data-user-mgmt-dialog>
          <div class="user-mgmt-icon" aria-hidden="true">
            <span>i</span>
          </div>
          <h2 id="userMgmtDialogTitle">Belum Bisa Diakses</h2>
          <p id="userMgmtDialogMessage">Fitur Manajemen Pengguna belum tersedia untuk akun Anda.</p>
          <button type="button" class="user-mgmt-close" data-user-mgmt-close>Tutup</button>
        </div>
      `;
      document.body.appendChild(userMgmtOverlay);
    }

    userMgmtDialog = userMgmtOverlay.querySelector('[data-user-mgmt-dialog]');
    userMgmtCloseBtn = userMgmtOverlay.querySelector('[data-user-mgmt-close]');

    userMgmtDialog?.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    userMgmtOverlay.addEventListener('click', (event) => {
      if (event.target === userMgmtOverlay) hideUserMgmtDialog();
    });

    userMgmtCloseBtn?.addEventListener('click', hideUserMgmtDialog);

    return userMgmtOverlay;
  }

  if (userMgmtLinks.length) {
    ensureUserMgmtDialog();
    userMgmtLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showUserMgmtDialog();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && userMgmtOverlay?.classList.contains('is-visible')) {
        hideUserMgmtDialog();
      }
    });
  }

  // expose helper for other scripts
  window.sidebarSetCollapsed = (collapsed, opts = {}) => setCollapsed(collapsed, opts);
  window.isSidebarCollapsed = () => sidebar.classList.contains('collapsed');

  // Helpers to temporarily collapse the sidebar when a drawer is open
  let prevCollapsed = false;
  window.sidebarCollapseForDrawer = () => {
    prevCollapsed = sidebar.classList.contains('collapsed');
    if (!prevCollapsed) setCollapsed(true, { persist: false });
  };
  window.sidebarRestoreForDrawer = () => {
    if (!prevCollapsed) setCollapsed(false, { persist: false });
  };
});
