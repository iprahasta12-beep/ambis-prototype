// informasi-rekening.js
// Sidebar logic copied + page-specific table filter/search
document.addEventListener('DOMContentLoaded', () => {
  // ==== Sidebar logic (from dashboard.js) ====
  const sidebar = document.getElementById('sidebar');
  const btn     = document.getElementById('navToggle');
  const label   = document.getElementById('collapseLabel');
  if (!sidebar || !btn) return;

  const STORAGE_KEY     = 'ambis:sidebar-collapsed';
  const EXPANDED_WIDTH  = 300;
  const COLLAPSED_WIDTH = 84;
  const ANIM_MS         = 250;

  sidebar.style.transition = `width ${ANIM_MS}ms ease`;
  function applyWidth(collapsed) {
    sidebar.style.width = `${collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`;
  }
  function setCollapsed(collapsed, { persist = true } = {}) {
    sidebar.classList.toggle('collapsed', collapsed);
    applyWidth(collapsed);
    if (label) label.textContent = collapsed ? 'Perbesar Navigasi' : 'Perkecil Navigasi';
    if (persist) try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch {}
  }
  let saved = false;
  try { saved = localStorage.getItem(STORAGE_KEY) === '1'; } catch {}
  setCollapsed(saved, { persist: false });
  btn.addEventListener('click', () => {
    setCollapsed(!sidebar.classList.contains('collapsed'));
  });

  // ==== Page-specific logic ====
  const searchInput = document.getElementById('searchInput');
  const filterJenis = document.getElementById('filterJenis');
  const rows = Array.from(document.querySelectorAll('#rekeningTable tr'));

  function filterTable() {
    const keyword = searchInput.value.toLowerCase();
    const jenis = filterJenis.value;

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchKeyword = keyword === '' || text.includes(keyword);
      const matchJenis = jenis === '' || row.cells[2].innerText === jenis;
      row.style.display = (matchKeyword && matchJenis) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterTable);
  filterJenis.addEventListener('change', filterTable);
});
