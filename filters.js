(function() {
  const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  function formatDateLabel(date) {
    if (!(date instanceof Date)) return '';
    if (Number.isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function parseISODate(value) {
    if (typeof value !== 'string' || !value) return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    const [yearRaw, monthRaw, dayRaw] = parts;
    const year = parseInt(yearRaw, 10);
    const month = parseInt(monthRaw, 10);
    const day = parseInt(dayRaw, 10);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function formatISODate(date) {
    if (!(date instanceof Date)) return '';
    if (Number.isNaN(date.getTime())) return '';
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getPresetDateRange(value) {
    const today = new Date();
    const end = new Date(today.getTime());
    let start = null;

    if (value === '7 Hari Terakhir') {
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    } else if (value === '30 Hari Terakhir') {
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    } else if (value === '1 Tahun Terakhir') {
      start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    }

    if (!start) return null;
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return { start, end };
  }

  function getPresetDateLabel(value) {
    const range = getPresetDateRange(value);
    if (!range) return '';
    const startText = formatDateLabel(range.start);
    const endText = formatDateLabel(range.end);
    if (!startText || !endText) return '';
    return `${startText} – ${endText}`;
  }

  const allFilters = document.querySelectorAll('.filter');
  let openPanel = null;

  allFilters.forEach(filter => {
    const trigger = filter.querySelector('.filter-trigger');
    const panel = filter.querySelector('.filter-panel');
    const options = panel.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const applyBtn = panel.querySelector('.apply');
    const cancelBtn = panel.querySelector('.cancel');
    const labelSpan = trigger.querySelector('.filter-label');
    const iconEl = trigger.querySelector('img');
    const name = filter.dataset.name;
    const defaultLabel = filter.dataset.default;
    const isMulti = options[0] && options[0].type === 'checkbox';
    const isDate = filter.dataset.filter === 'date';
    const customRange = isDate ? panel.querySelector('.custom-range') : null;
    const customRangeInput = customRange ? customRange.querySelector('input') : null;
    let datepickerInstance = null;
    const groupEl = filter.closest('[data-filter-group]');
    const groupId = groupEl ? groupEl.dataset.filterGroup || null : null;
    const groupFilters = groupEl ? groupEl.querySelectorAll('.filter') : allFilters;
    const defaultIconSrc = iconEl ? iconEl.getAttribute('src') : null;
    const isFilterIcon = defaultIconSrc && defaultIconSrc.includes('/filter.svg');
    const isDateIcon = defaultIconSrc && defaultIconSrc.includes('date-picker');
    const activeIconSrc = isDateIcon
      ? 'img/icon/date-picker-active.svg'
      : (isFilterIcon ? 'img/icon/filter-active.svg' : null);

    function setTriggerState(applied) {
      trigger.classList.toggle('border-cyan-600', applied);
      trigger.classList.toggle('bg-[#E6F5F7]', applied);
      trigger.classList.toggle('text-cyan-600', applied);
      trigger.classList.toggle('border-slate-300', !applied);
      trigger.classList.toggle('bg-white', !applied);
      trigger.classList.toggle('text-slate-600', !applied);
      trigger.classList.toggle('hover:bg-slate-50', !applied);
      trigger.classList.toggle('hover:border-slate-300', !applied);

      if (iconEl && activeIconSrc && defaultIconSrc) {
        iconEl.setAttribute('src', applied ? activeIconSrc : defaultIconSrc);
      }

    }

    filter._setTriggerState = setTriggerState;
    setTriggerState(Boolean(filter.dataset.applied));

    function getDatepickerInstance() {
      if (!customRangeInput) return null;
      if (customRangeInput._airDatepicker) return customRangeInput._airDatepicker;
      if (typeof AirDatepicker === 'undefined') return null;
      datepickerInstance = new AirDatepicker(customRangeInput, {
        range: true,
        autoClose: true,
        dateFormat: 'dd/MM/yyyy',
        multipleDatesSeparator: ' – ',
        onSelect: () => {
          updateButtons();
        },
      });
      customRangeInput._airDatepicker = datepickerInstance;
      return datepickerInstance;
    }

    function getExistingDatepicker() {
      if (!customRangeInput) return null;
      return customRangeInput._airDatepicker || datepickerInstance;
    }

    function clearCustomRange() {
      if (customRangeInput) {
        customRangeInput.value = '';
      }
      const picker = getExistingDatepicker();
      if (picker) {
        picker.clear();
      }
    }

    function getSelectedRange() {
      const picker = getExistingDatepicker();
      if (!picker) return null;
      const dates = picker.selectedDates;
      if (!Array.isArray(dates) || dates.length < 2) return null;
      const [start, end] = dates;
      if (!(start instanceof Date) || Number.isNaN(start.getTime())) return null;
      if (!(end instanceof Date) || Number.isNaN(end.getTime())) return null;
      return { start, end };
    }

    function setCustomRangeFromApplied(applied) {
      if (!customRange || !customRangeInput) return;
      if (!applied || !applied.startsWith('custom:')) {
        clearCustomRange();
        return;
      }

      const [startIso, endIso] = applied.slice(7).split('|');
      const startDate = parseISODate(startIso);
      const endDate = parseISODate(endIso);

      if (!startDate || !endDate) {
        clearCustomRange();
        return;
      }

      const picker = getDatepickerInstance();
      if (picker) {
        picker.clear();
        picker.selectDate([startDate, endDate]);
      } else {
        const startLabel = formatDateLabel(startDate);
        const endLabel = formatDateLabel(endDate);
        if (startLabel && endLabel) {
          customRangeInput.value = `${startLabel} – ${endLabel}`;
        }
      }
    }

    function emitChange() {
      document.dispatchEvent(new CustomEvent('filter-change', { detail: { groupId } }));
    }

    function getSelected() {
      return Array.from(options).filter(o => o.checked).map(o => o.value);
    }

    function updateButtons() {
      const selected = getSelected();
      if (isDate && selected[0] === 'custom') {
        const range = getSelectedRange();
        applyBtn.disabled = !range;
      } else {
        applyBtn.disabled = selected.length === 0;
      }
      const anyApplied = selected.length > 0 || Array.from(groupFilters).some(f => f.dataset.applied);
      cancelBtn.textContent = anyApplied ? 'Reset Ulang' : 'Batalkan';
    }
    if (customRangeInput) {
      customRangeInput.addEventListener('focus', () => {
        const picker = getDatepickerInstance();
        if (picker) picker.show();
      });
      customRangeInput.addEventListener('click', (event) => {
        event.preventDefault();
        const picker = getDatepickerInstance();
        if (picker) picker.show();
      });
      customRangeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const picker = getDatepickerInstance();
          if (picker) picker.show();
        }
      });
    }

    function open() {
      if (openPanel && openPanel !== panel) openPanel.classList.add('hidden');
      const applied = filter.dataset.applied;
      if (isDate && applied && applied.startsWith('custom:')) {
        options.forEach(o => {
          o.checked = o.value === 'custom';
        });
        if (customRange) {
          customRange.classList.remove('hidden');
          setCustomRangeFromApplied(applied);
        }
      } else {
        const appliedArr = applied ? applied.split(',') : [];
        options.forEach(o => {
          o.checked = appliedArr.includes(o.value);
        });
        if (customRange) {
          customRange.classList.add('hidden');
          clearCustomRange();
        }
      }
      updateButtons();
      panel.classList.remove('hidden');
      openPanel = panel;
    }

    function close() {
      panel.classList.add('hidden');
      if (isDate) {
        const picker = getExistingDatepicker();
        if (picker) picker.hide();
      }
      openPanel = null;
    }

    trigger.addEventListener('click', () => {
      panel.classList.contains('hidden') ? open() : close();
    });

    options.forEach(o => o.addEventListener('change', () => {
      if (isDate && customRange) {
        if (o.value === 'custom' && o.checked) {
          customRange.classList.remove('hidden');
          const picker = getDatepickerInstance();
          if (picker) picker.show();
        } else if (o.value === 'custom' && !o.checked) {
          customRange.classList.add('hidden');
          clearCustomRange();
        } else if (o.value !== 'custom') {
          customRange.classList.add('hidden');
          const customOption = Array.from(options).find(opt => opt.value === 'custom');
          if (customOption) customOption.checked = false;
          clearCustomRange();
        }
      }
      updateButtons();
    }));

    applyBtn.addEventListener('click', () => {
      const selected = getSelected();
      if (isDate && selected[0] === 'custom') {
        const range = getSelectedRange();
        if (!range) {
          updateButtons();
          return;
        }
        const { start, end } = range;
        const startISO = formatISODate(start);
        const endISO = formatISODate(end);
        filter.dataset.applied = `custom:${startISO}|${endISO}`;
        const startLabel = formatDateLabel(start);
        const endLabel = formatDateLabel(end);
        labelSpan.textContent = `${startLabel} – ${endLabel}`;
        setTriggerState(true);
      } else {
        filter.dataset.applied = selected.join(',');
        let labelText = defaultLabel;

        if (isDate && selected.length > 0) {
          const presetLabel = getPresetDateLabel(selected[0]);
          labelText = presetLabel || selected[0] || defaultLabel;
        } else if (isMulti) {
          if (selected.length === 1) {
            labelText = selected[0];
          } else if (selected.length > 1) {
            labelText = `${name} (${selected.length})`;
          }
        } else {
          labelText = selected[0] || defaultLabel;
        }

        labelSpan.textContent = labelText;
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
              if (inp._airDatepicker) inp._airDatepicker.clear();
            }
          });
          const cr = f.querySelector('.custom-range');
          if (cr) {
            cr.classList.add('hidden');
            const rangeInput = cr.querySelector('input');
            if (rangeInput && rangeInput._airDatepicker) {
              rangeInput._airDatepicker.clear();
            }
            if (rangeInput) rangeInput.value = '';
          }
          if (typeof f._setTriggerState === 'function') f._setTriggerState(false);
        });
        updateButtons();
        emitChange();
        close();
      }
    });

    document.addEventListener('click', e => {
      let interactedWithCalendar = false;
      if (isDate) {
        const picker = getExistingDatepicker();
        if (picker && picker.$datepicker) {
          interactedWithCalendar = picker.$datepicker.contains(e.target);
        }
      }
      if (!filter.contains(e.target) && !interactedWithCalendar && !panel.classList.contains('hidden')) {
        close();
      }
    });
  });
})();
