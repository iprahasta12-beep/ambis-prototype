// Drawer logic for Akses Cepat configuration
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openAksesDrawer');
  const drawer = document.getElementById('aksesDrawer');
  const closeBtn = document.getElementById('closeAksesDrawer');
  const saveBtn = document.getElementById('simpanAkses');

  function openDrawer(e) {
    e?.preventDefault();
    drawer.classList.remove('hidden');
  }
  function closeDrawer() {
    drawer.classList.add('hidden');
  }

  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  saveBtn?.addEventListener('click', closeDrawer);

  // close when clicking on the backdrop
  drawer?.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
    }
  });
});
