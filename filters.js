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

  const MONTH_NAMES_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des'
  ];

  const AIR_DATEPICKER_LOCALE_ID = Object.freeze({
    days: [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu'
    ],
    daysShort: [
      'Min',
      'Sen',
      'Sel',
      'Rab',
      'Kam',
      'Jum',
      'Sab'
    ],
    daysMin: [
      'Mg',
      'Sn',
      'Sl',
      'Rb',
      'Km',
      'Jm',
      'Sb'
    ],
    months: MONTH_NAMES.slice(),
    monthsShort: MONTH_NAMES_SHORT,
    today: 'Hari ini',
    clear: 'Bersihkan',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    firstDay: 1,
    ariaLabel: {
      month: 'Pilih bulan',
      year: 'Pilih tahun',
      hour: 'Pilih jam',
      minute: 'Pilih menit'
    }
  });

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
    const customRangeStartInput = customRange ? customRange.querySelector('[data-date-start]') : null;
    const customRangeEndInput = customRange ? customRange.querySelector('[data-date-end]') : null;
    const dateOptionEntries = isDate
      ? Array.from(panel.querySelectorAll('label')).map(label => {
          const radio = label.querySelector('input[type="radio"]');
          return radio ? { label, input: radio } : null;
        }).filter(Boolean)
      : [];
    if (isDate) {
      dateOptionEntries.forEach(({ label }) => {
        label.classList.add('filter-date-option');
      });
    }
    const customOption = isDate
      ? Array.from(options).find(option => option.value === 'custom') || null
      : null;
    const customRangeStartPlaceholder = customRangeStartInput ? (customRangeStartInput.getAttribute('placeholder') || '') : '';
    const customRangeEndPlaceholder = customRangeEndInput ? (customRangeEndInput.getAttribute('placeholder') || '') : '';
    if (customRangeStartInput) {
      customRangeStartInput.dataset.defaultPlaceholder = customRangeStartPlaceholder;
    }
    if (customRangeEndInput) {
      customRangeEndInput.dataset.defaultPlaceholder = customRangeEndPlaceholder;
    }
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

    function refreshDateOptionHighlight() {
      if (!isDate) return;
      const selected = getSelected();
      const activeValue = selected.length > 0 ? selected[0] : null;
      dateOptionEntries.forEach(({ label, input }) => {
        const isActive = input.value === activeValue;
        label.classList.toggle('filter-date-option-active', isActive);
      });
    }

    function ensureDefaultDateSelection() {
      if (!isDate) return;
      const hasChecked = Array.from(options).some(option => option.checked);
      if (!hasChecked) {
        const defaultOption = Array.from(options).find(option => option.value === '7 Hari Terakhir');
        if (defaultOption) defaultOption.checked = true;
      }
      refreshDateOptionHighlight();
    }

    function activateCustomOptionFromPicker() {
      if (!isDate || !customOption) return;
      if (!customOption.checked) {
        customOption.checked = true;
      }
      if (customRange) {
        customRange.classList.remove('hidden');
      }
      refreshDateOptionHighlight();
    }

    filter._refreshDateOptionHighlight = refreshDateOptionHighlight;
    filter._ensureDefaultDateSelection = ensureDefaultDateSelection;

    function setDateInputValue(input, date) {
      if (!input) return;
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        const label = formatDateLabel(date);
        const isoValue = formatISODate(date);
        input.value = label;
        input.dataset.isoValue = isoValue;
        if (label) {
          input.setAttribute('placeholder', label);
        }
      } else {
        input.value = '';
        delete input.dataset.isoValue;
        const defaultPlaceholder = input.dataset.defaultPlaceholder || '';
        if (defaultPlaceholder) {
          input.setAttribute('placeholder', defaultPlaceholder);
        } else {
          input.removeAttribute('placeholder');
        }
      }
    }

    function getInputDate(input) {
      if (!input) return null;
      const isoValue = input.dataset.isoValue;
      if (!isoValue) return null;
      return parseISODate(isoValue);
    }

    function ensureStartDatepicker() {
      if (!customRangeStartInput) return null;
      if (customRangeStartInput._airDatepicker) return customRangeStartInput._airDatepicker;
      if (typeof AirDatepicker === 'undefined') return null;
      const instance = new AirDatepicker(customRangeStartInput, {
        autoClose: true,
        dateFormat: 'dd/MM/yyyy',
        locale: AIR_DATEPICKER_LOCALE_ID,
        onSelect: ({ date }) => {
          if (date instanceof Date && !Number.isNaN(date.getTime())) {
            setDateInputValue(customRangeStartInput, date);
            const endPicker = ensureEndDatepicker();
            if (endPicker) {
              if (typeof endPicker.update === 'function') {
                endPicker.update({ minDate: date });
              }
              const endDate = getInputDate(customRangeEndInput);
              if (endDate && endDate.getTime() < date.getTime()) {
                setDateInputValue(customRangeEndInput, null);
                endPicker.clear();
              }
            }
          } else {
            setDateInputValue(customRangeStartInput, null);
          }
          activateCustomOptionFromPicker();
          updateButtons();
        },
      });
      customRangeStartInput._airDatepicker = instance;
      return instance;
    }

    function ensureEndDatepicker() {
      if (!customRangeEndInput) return null;
      if (customRangeEndInput._airDatepicker) return customRangeEndInput._airDatepicker;
      if (typeof AirDatepicker === 'undefined') return null;
      const instance = new AirDatepicker(customRangeEndInput, {
        autoClose: true,
        dateFormat: 'dd/MM/yyyy',
        locale: AIR_DATEPICKER_LOCALE_ID,
        onSelect: ({ date }) => {
          if (date instanceof Date && !Number.isNaN(date.getTime())) {
            setDateInputValue(customRangeEndInput, date);
            const startPicker = ensureStartDatepicker();
            const startDate = getInputDate(customRangeStartInput);
            if (startPicker) {
              if (typeof startPicker.update === 'function') {
                startPicker.update({ maxDate: date });
              }
            }
            if (startDate && startDate.getTime() > date.getTime()) {
              setDateInputValue(customRangeStartInput, null);
              if (startPicker) startPicker.clear();
            }
          } else {
            setDateInputValue(customRangeEndInput, null);
          }
          activateCustomOptionFromPicker();
          updateButtons();
        },
      });
      customRangeEndInput._airDatepicker = instance;
      return instance;
    }

    function clearCustomRange() {
      setDateInputValue(customRangeStartInput, null);
      setDateInputValue(customRangeEndInput, null);
      const startPicker = customRangeStartInput ? customRangeStartInput._airDatepicker : null;
      const endPicker = customRangeEndInput ? customRangeEndInput._airDatepicker : null;
      if (startPicker) {
        startPicker.clear();
        if (typeof startPicker.update === 'function') {
          startPicker.update({ maxDate: null });
        }
      }
      if (endPicker) {
        endPicker.clear();
        if (typeof endPicker.update === 'function') {
          endPicker.update({ minDate: null });
        }
      }
    }

    function getSelectedRange() {
      const startDate = getInputDate(customRangeStartInput);
      const endDate = getInputDate(customRangeEndInput);
      if (!startDate || !endDate) return null;
      if (startDate.getTime() > endDate.getTime()) return null;
      return { start: startDate, end: endDate };
    }

    function setCustomRangeFromApplied(applied) {
      if (!customRange || (!customRangeStartInput && !customRangeEndInput)) return;
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

      const startPicker = ensureStartDatepicker();
      const endPicker = ensureEndDatepicker();

      if (startPicker) {
        startPicker.selectDate(startDate);
      } else {
        setDateInputValue(customRangeStartInput, startDate);
      }

      if (endPicker) {
        endPicker.selectDate(endDate);
      } else {
        setDateInputValue(customRangeEndInput, endDate);
      }

      if (startPicker) {
        if (typeof startPicker.update === 'function') {
          startPicker.update({ maxDate: endDate });
        }
      }
      if (endPicker) {
        if (typeof endPicker.update === 'function') {
          endPicker.update({ minDate: startDate });
        }
      }

      updateButtons();
      refreshDateOptionHighlight();
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
    [
      { input: customRangeStartInput, ensure: ensureStartDatepicker },
      { input: customRangeEndInput, ensure: ensureEndDatepicker },
    ].forEach(({ input, ensure }) => {
      if (!input) return;
      input.addEventListener('focus', () => {
        const picker = ensure();
        if (picker) picker.show();
      });
      input.addEventListener('click', (event) => {
        event.preventDefault();
        const picker = ensure();
        if (picker) picker.show();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const picker = ensure();
          if (picker) picker.show();
        }
      });
    });

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
      if (isDate) {
        ensureDefaultDateSelection();
      }
      updateButtons();
      panel.classList.remove('hidden');
      openPanel = panel;
    }

    function close() {
      panel.classList.add('hidden');
      if (isDate) {
        const startPicker = customRangeStartInput ? customRangeStartInput._airDatepicker : null;
        const endPicker = customRangeEndInput ? customRangeEndInput._airDatepicker : null;
        if (startPicker) startPicker.hide();
        if (endPicker) endPicker.hide();
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
          const picker = ensureStartDatepicker();
          if (customRangeStartInput) customRangeStartInput.focus();
          if (picker) picker.show();
        } else if (o.value === 'custom' && !o.checked) {
          customRange.classList.add('hidden');
          clearCustomRange();
        } else if (o.value !== 'custom') {
          customRange.classList.add('hidden');
          if (customOption) customOption.checked = false;
          clearCustomRange();
        }
      }
      updateButtons();
      refreshDateOptionHighlight();
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
      refreshDateOptionHighlight();
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
              if (inp._airDatepicker) {
                inp._airDatepicker.clear();
                if (typeof inp._airDatepicker.update === 'function') {
                  inp._airDatepicker.update({ minDate: null, maxDate: null });
                }
              }
              if (inp.dataset && inp.dataset.isoValue) {
                delete inp.dataset.isoValue;
              }
              const defaultPlaceholder = inp.dataset ? inp.dataset.defaultPlaceholder : '';
              if (defaultPlaceholder) {
                inp.setAttribute('placeholder', defaultPlaceholder);
              }
            }
          });
          const cr = f.querySelector('.custom-range');
          if (cr) {
            cr.classList.add('hidden');
            cr.querySelectorAll('input').forEach(rangeInput => {
              if (rangeInput._airDatepicker) {
                rangeInput._airDatepicker.clear();
                if (typeof rangeInput._airDatepicker.update === 'function') {
                  rangeInput._airDatepicker.update({ minDate: null, maxDate: null });
                }
              }
              rangeInput.value = '';
              if (rangeInput.dataset && rangeInput.dataset.isoValue) {
                delete rangeInput.dataset.isoValue;
              }
              const defaultPlaceholder = rangeInput.dataset ? rangeInput.dataset.defaultPlaceholder : '';
              if (defaultPlaceholder) {
                rangeInput.setAttribute('placeholder', defaultPlaceholder);
              }
            });
          }
          if (typeof f._setTriggerState === 'function') f._setTriggerState(false);
          if (typeof f._ensureDefaultDateSelection === 'function') f._ensureDefaultDateSelection();
        });
        updateButtons();
        refreshDateOptionHighlight();
        emitChange();
        close();
      }
    });

    document.addEventListener('click', e => {
      let interactedWithCalendar = false;
      if (isDate) {
        const startPicker = customRangeStartInput ? customRangeStartInput._airDatepicker : null;
        const endPicker = customRangeEndInput ? customRangeEndInput._airDatepicker : null;
        if (startPicker && startPicker.$datepicker && startPicker.$datepicker.contains(e.target)) {
          interactedWithCalendar = true;
        }
        if (!interactedWithCalendar && endPicker && endPicker.$datepicker && endPicker.$datepicker.contains(e.target)) {
          interactedWithCalendar = true;
        }
      }
      if (!filter.contains(e.target) && !interactedWithCalendar && !panel.classList.contains('hidden')) {
        close();
      }
    });
  });
})();
