(function() {
  const filters = document.querySelectorAll('.filter');
  let openPanel = null;

  filters.forEach(filter => {
    const trigger = filter.querySelector('.filter-trigger');
    const panel = filter.querySelector('.filter-panel');
    const options = panel.querySelectorAll('input');
    const applyBtn = panel.querySelector('.apply');
    const cancelBtn = panel.querySelector('.cancel');
    const labelSpan = trigger.querySelector('.filter-label');
    const name = filter.dataset.name;
    const defaultLabel = filter.dataset.default;
    const isMulti = options[0] && options[0].type === 'checkbox';

    function getSelected() {
      return Array.from(options).filter(o => o.checked).map(o => o.value);
    }

    function updateButtons() {
      const selected = getSelected();
      applyBtn.disabled = selected.length === 0;
      cancelBtn.textContent = selected.length ? 'Reset Ulang' : 'Batalkan';
    }

    function open() {
      if (openPanel && openPanel !== panel) openPanel.classList.add('hidden');
      const applied = filter.dataset.applied;
      const appliedArr = applied ? applied.split(',') : [];
      options.forEach(o => {
        o.checked = appliedArr.includes(o.value);
      });
      updateButtons();
      panel.classList.remove('hidden');
      openPanel = panel;
    }

    function close() {
      panel.classList.add('hidden');
      openPanel = null;
    }

    trigger.addEventListener('click', () => {
      panel.classList.contains('hidden') ? open() : close();
    });

    options.forEach(o => o.addEventListener('change', updateButtons));

    applyBtn.addEventListener('click', () => {
      const selected = getSelected();
      filter.dataset.applied = selected.join(',');
      if (isMulti) {
        if (selected.length === 1) {
          labelSpan.textContent = selected[0];
        } else if (selected.length > 1) {
          labelSpan.textContent = `${name} (${selected.length})`;
        } else {
          labelSpan.textContent = defaultLabel;
        }
      } else {
        labelSpan.textContent = selected[0] || defaultLabel;
      }
      document.dispatchEvent(new CustomEvent('filter-change'));
      close();
    });

    cancelBtn.addEventListener('click', () => {
      if (cancelBtn.textContent === 'Batalkan') {
        close();
      } else {
        options.forEach(o => {
          o.checked = false;
        });
        updateButtons();
      }
    });

    document.addEventListener('click', e => {
      if (!filter.contains(e.target) && !panel.classList.contains('hidden')) {
        close();
      }
    });
  });
})();
