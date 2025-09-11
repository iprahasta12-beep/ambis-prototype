// transfer.js - drawer logic for transfer page

document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openTransferDrawer');
  const drawer = document.getElementById('drawer');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const sidebar = document.getElementById('sidebar');
  let sidebarWasCollapsed = false;

  function collapseSidebarForDrawer() {
    if (!sidebar) return;
    sidebarWasCollapsed = typeof window.isSidebarCollapsed === 'function'
      ? window.isSidebarCollapsed()
      : sidebar.classList.contains('collapsed');
    if (!sidebarWasCollapsed) {
      if (typeof window.sidebarSetCollapsed === 'function') {
        window.sidebarSetCollapsed(true, { persist: false });
      } else {
        sidebar.classList.add('collapsed');
      }
    }
  }

  function restoreSidebar() {
    if (!sidebar || sidebarWasCollapsed) return;
    if (typeof window.sidebarSetCollapsed === 'function') {
      window.sidebarSetCollapsed(false, { persist: false });
    } else {
      sidebar.classList.remove('collapsed');
    }
  }

  function openDrawer() {
    drawer.classList.add('open');
    collapseSidebarForDrawer();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    restoreSidebar();
  }

  openBtn?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
  closeBtn?.addEventListener('click', closeDrawer);
});
