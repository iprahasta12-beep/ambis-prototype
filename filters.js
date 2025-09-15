(function() {
  const filters = document.querySelectorAll('.filter');
  let openPanel = null;

  filters.forEach(filter => {
    const trigger = filter.querySelector('.filter-trigger');
    const panel = filter.querySelector('.filter-panel');
    const options = panel.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const applyBtn = panel.querySelector('.apply');
    const cancelBtn = panel.querySelector('.cancel');
    const labelSpan = trigger.querySelector('.filter-label');
    const name = filter.dataset.name;
    const defaultLabel = filter.dataset.default;
    const isMulti = options[0] && options[0].type === 'checkbox';
    const isDate = filter.dataset.filter === 'date';
    const customRange = isDate ? panel.querySelector('.custom-range') : null;
    const customInputs = customRange ? customRange.querySelectorAll('input') : null;

    function getSelected() {
      return Array.from(options).filter(o => o.checked).map(o => o.value);
    }

    function updateButtons() {
      const selected = getSelected();
      if (isDate && selected[0] === 'custom') {
        const filled = Array.from(customInputs || []).every(i => i.value);
        applyBtn.disabled = !filled;
      } else {
        applyBtn.disabled = selected.length === 0;
      }
      const anyApplied = selected.length > 0 || Array.from(document.querySelectorAll('.filter')).some(f => f.dataset.applied);
      cancelBtn.textContent = anyApplied ? 'Reset Ulang' : 'Batalkan';
    }

    function open() {
      if (openPanel && openPanel !== panel) openPanel.classList.add('hidden');
      const applied = filter.dataset.applied;
      if (isDate && applied && applied.startsWith('custom:')) {
        const [start, end] = applied.slice(7).split('|');
        const [sy, sm, sd] = start.split('-');
        const [ey, em, ed] = end.split('-');
        options.forEach(o => {
          o.checked = o.value === 'custom';
        });
        if (customInputs) {
          customRange.classList.remove('hidden');
          customRange.querySelector('[data-field="start-day"]').value = sd;
          customRange.querySelector('[data-field="start-month"]').value = sm;
          customRange.querySelector('[data-field="start-year"]').value = sy;
          customRange.querySelector('[data-field="end-day"]').value = ed;
          customRange.querySelector('[data-field="end-month"]').value = em;
          customRange.querySelector('[data-field="end-year"]').value = ey;
        }
      } else {
        const appliedArr = applied ? applied.split(',') : [];
        options.forEach(o => {
          o.checked = appliedArr.includes(o.value);
        });
        if (customRange) {
          customRange.classList.add('hidden');
          (customInputs || []).forEach(i => i.value = '');
        }
      }
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

    options.forEach(o => o.addEventListener('change', () => {
      if (isDate) {
        if (o.value === 'custom' && o.checked) {
          customRange.classList.remove('hidden');
        } else if (o.value === 'custom' && !o.checked) {
          customRange.classList.add('hidden');
          (customInputs || []).forEach(i => i.value = '');
        } else if (o.value !== 'custom') {
          customRange.classList.add('hidden');
          const customOption = Array.from(options).find(opt => opt.value === 'custom');
          if (customOption) customOption.checked = false;
          (customInputs || []).forEach(i => i.value = '');
        }
      }
      updateButtons();
    }));

    applyBtn.addEventListener('click', () => {
      const selected = getSelected();
      if (isDate && selected[0] === 'custom') {
        const sd = customRange.querySelector('[data-field="start-day"]').value.padStart(2, '0');
        const sm = customRange.querySelector('[data-field="start-month"]').value.padStart(2, '0');
        const sy = customRange.querySelector('[data-field="start-year"]').value;
        const ed = customRange.querySelector('[data-field="end-day"]').value.padStart(2, '0');
        const em = customRange.querySelector('[data-field="end-month"]').value.padStart(2, '0');
        const ey = customRange.querySelector('[data-field="end-year"]').value;
        const startISO = `${sy}-${sm}-${sd}`;
        const endISO = `${ey}-${em}-${ed}`;
        filter.dataset.applied = `custom:${startISO}|${endISO}`;
        labelSpan.textContent = `${sd}/${sm}/${sy} – ${ed}/${em}/${ey}`;
      } else {
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
      }
      document.dispatchEvent(new CustomEvent('filter-change'));
      close();
    });

    cancelBtn.addEventListener('click', () => {
      if (cancelBtn.textContent === 'Batalkan') {
        close();
      } else {
        document.querySelectorAll('.filter').forEach(f => {
          f.dataset.applied = '';
          const span = f.querySelector('.filter-label');
          span.textContent = f.dataset.default;
          f.querySelectorAll('input').forEach(inp => {
            if (inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false;
            else inp.value = '';
          });
          const cr = f.querySelector('.custom-range');
          if (cr) cr.classList.add('hidden');
        });
        document.dispatchEvent(new CustomEvent('filter-change'));
        close();
      }
    });

    document.addEventListener('click', e => {
      if (!filter.contains(e.target) && !panel.classList.contains('hidden')) {
        close();
      }
    });
  });
})();
