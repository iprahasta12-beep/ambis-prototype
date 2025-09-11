// transfer.js - drawer logic for transfer page

document.addEventListener('DOMContentLoaded', () => {
  const openBtn  = document.getElementById('openTransferDrawer');
  const drawer   = document.getElementById('drawer');
  const closeBtn = document.getElementById('drawerCloseBtn');

  function openDrawer() {
    drawer.classList.add('open');
    if (typeof window.sidebarCollapseForDrawer === 'function') {
      window.sidebarCollapseForDrawer();
    }
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (typeof window.sidebarRestoreForDrawer === 'function') {
      window.sidebarRestoreForDrawer();
    }
  }

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
});

