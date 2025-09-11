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
  const brandText = brandP?.textContent?.trim() || '';

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

  // --- Navigation: icons always navigate
  const sbLinks = sidebar.querySelectorAll('a.sb-item');
  sbLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.stopPropagation(); // don’t toggle
    });
    const lbl = a.querySelector('.sb-label');
    if (lbl && !a.title) a.title = lbl.textContent.trim();
  });

  // expose helper for other scripts
  window.sidebarSetCollapsed = (collapsed, opts = {}) => setCollapsed(collapsed, opts);
  window.isSidebarCollapsed = () => sidebar.classList.contains('collapsed');
});
