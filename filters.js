(function() {
  const allFilters = document.querySelectorAll('.filter');
  let openPanel = null;

  allFilters.forEach(filter => {
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
    const groupEl = filter.closest('[data-filter-group]');
    const groupId = groupEl ? groupEl.dataset.filterGroup || null : null;
    const groupFilters = groupEl ? groupEl.querySelectorAll('.filter') : allFilters;

    function setTriggerState(applied) {
      trigger.classList.toggle('border-cyan-500', applied);
      trigger.classList.toggle('bg-[#E6F5F7]', applied);
      trigger.classList.toggle('text-cyan-700', applied);
      trigger.classList.toggle('border-slate-300', !applied);
      trigger.classList.toggle('bg-white', !applied);
      trigger.classList.toggle('text-slate-600', !applied);
    }

    filter._setTriggerState = setTriggerState;
    setTriggerState(Boolean(filter.dataset.applied));

    function emitChange() {
      document.dispatchEvent(new CustomEvent('filter-change', { detail: { groupId } }));
    }

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
      const anyApplied = selected.length > 0 || Array.from(groupFilters).some(f => f.dataset.applied);
      cancelBtn.textContent = anyApplied ? 'Reset Ulang' : 'Batalkan';
    }

    if (customInputs && typeof flatpickr !== 'undefined') {
      customInputs.forEach(inp => {
        flatpickr(inp, {
          dateFormat: 'd/m/Y',
          locale: flatpickr.l10ns.id,
          onChange: updateButtons
        });
        inp.addEventListener('input', updateButtons);
      });
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
          const startStr = `${sd}/${sm}/${sy}`;
          const endStr = `${ed}/${em}/${ey}`;
          const startInput = customRange.querySelector('[data-field="start"]');
          const endInput = customRange.querySelector('[data-field="end"]');
          startInput.value = startStr;
          endInput.value = endStr;
          if (startInput._flatpickr) startInput._flatpickr.setDate(startStr, false, 'd/m/Y');
          if (endInput._flatpickr) endInput._flatpickr.setDate(endStr, false, 'd/m/Y');
        }
      } else {
        const appliedArr = applied ? applied.split(',') : [];
        options.forEach(o => {
          o.checked = appliedArr.includes(o.value);
        });
        if (customRange) {
          customRange.classList.add('hidden');
          (customInputs || []).forEach(i => {
            i.value = '';
            if (i._flatpickr) i._flatpickr.clear();
          });
        }
      }
      updateButtons();
      panel.classList.remove('hidden');
      openPanel = panel;
    }

    function close() {
      panel.classList.add('hidden');
      if (isDate && customInputs) {
        Array.from(customInputs).forEach(inp => {
          if (inp._flatpickr) inp._flatpickr.close();
        });
      }
      openPanel = null;
    }

    trigger.addEventListener('click', () => {
      panel.classList.contains('hidden') ? open() : close();
    });

    options.forEach(o => o.addEventListener('change', () => {
      if (isDate) {
        if (o.value === 'custom' && o.checked) {
          customRange.classList.remove('hidden');
          if (customInputs && customInputs[0]._flatpickr) {
            customInputs[0]._flatpickr.open();
          }
        } else if (o.value === 'custom' && !o.checked) {
          customRange.classList.add('hidden');
          (customInputs || []).forEach(i => {
            i.value = '';
            if (i._flatpickr) i._flatpickr.clear();
          });
        } else if (o.value !== 'custom') {
          customRange.classList.add('hidden');
          const customOption = Array.from(options).find(opt => opt.value === 'custom');
          if (customOption) customOption.checked = false;
          (customInputs || []).forEach(i => {
            i.value = '';
            if (i._flatpickr) i._flatpickr.clear();
          });
        }
      }
      updateButtons();
    }));

    applyBtn.addEventListener('click', () => {
      const selected = getSelected();
      if (isDate && selected[0] === 'custom') {
        const startVal = customRange.querySelector('[data-field="start"]').value;
        const endVal = customRange.querySelector('[data-field="end"]').value;
        const [sd, sm, sy] = startVal.split('/');
        const [ed, em, ey] = endVal.split('/');
        const startISO = `${sy}-${sm.padStart(2, '0')}-${sd.padStart(2, '0')}`;
        const endISO = `${ey}-${em.padStart(2, '0')}-${ed.padStart(2, '0')}`;
        filter.dataset.applied = `custom:${startISO}|${endISO}`;
        labelSpan.textContent = `${sd}/${sm}/${sy} – ${ed}/${em}/${ey}`;
        setTriggerState(true);
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
        setTriggerState(selected.length > 0);
      }
      emitChange();
      close();
    });

    cancelBtn.addEventListener('click', () => {
      if (cancelBtn.textContent === 'Batalkan') {
        close();
      } else {
        Array.from(groupFilters).forEach(f => {
          f.dataset.applied = '';
          const span = f.querySelector('.filter-label');
          span.textContent = f.dataset.default;
          f.querySelectorAll('input').forEach(inp => {
            if (inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false;
            else {
              inp.value = '';
              if (inp._flatpickr) inp._flatpickr.clear();
            }
          });
          const cr = f.querySelector('.custom-range');
          if (cr) cr.classList.add('hidden');
          if (typeof f._setTriggerState === 'function') f._setTriggerState(false);
        });
        updateButtons();
        emitChange();
        close();
      }
    });

    document.addEventListener('click', e => {
      const interactedWithCalendar = isDate && customInputs && Array.from(customInputs).some(inp => {
        const fp = inp._flatpickr;
        return fp && fp.calendarContainer && fp.calendarContainer.contains(e.target);
      });
      if (!filter.contains(e.target) && !interactedWithCalendar && !panel.classList.contains('hidden')) {
        close();
      }
    });
  });
})();
