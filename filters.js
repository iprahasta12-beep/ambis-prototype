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

  const monthYearPicker = (() => {
    const state = {
      overlay: null,
      modal: null,
      container: null,
      headerMonth: null,
      headerYear: null,
      prevBtn: null,
      nextBtn: null,
      monthGrid: null,
      yearGrid: null,
      cancelBtn: null,
      applyBtn: null,
      monthButtons: [],
      yearButtons: [],
      activeView: 'month',
      activeInstance: null,
      viewMonth: 0,
      viewYear: 0,
      selectedMonth: 0,
      selectedYear: 0,
      pendingMonth: null,
      pendingYear: null,
      selectionMade: false,
      yearRangeStart: 0
    };

    function createButton(label, className) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className;
      btn.textContent = label;
      return btn;
    }

    function ensureElements(container) {
      if (!container) return;

      if (state.overlay) {
        container.appendChild(state.overlay);
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'month-year-picker-overlay';

      const modal = document.createElement('div');
      modal.className = 'month-year-picker-modal';

      const header = document.createElement('div');
      header.className = 'month-year-picker-header';

      const prevBtn = createButton('<', 'month-year-picker-nav');
      prevBtn.setAttribute('aria-label', 'Sebelumnya');

      const title = document.createElement('div');
      title.className = 'month-year-picker-title';

      const monthSpan = document.createElement('button');
      monthSpan.type = 'button';
      monthSpan.className = 'month-year-picker-title-part';
      monthSpan.setAttribute('data-view', 'month');

      const yearSpan = document.createElement('button');
      yearSpan.type = 'button';
      yearSpan.className = 'month-year-picker-title-part';
      yearSpan.setAttribute('data-view', 'year');

      title.appendChild(monthSpan);
      title.appendChild(document.createTextNode(' '));
      title.appendChild(yearSpan);

      const nextBtn = createButton('>', 'month-year-picker-nav');
      nextBtn.setAttribute('aria-label', 'Berikutnya');

      header.appendChild(prevBtn);
      header.appendChild(title);
      header.appendChild(nextBtn);

      const content = document.createElement('div');
      content.className = 'month-year-picker-content';

      const monthGrid = document.createElement('div');
      monthGrid.className = 'month-year-picker-grid month-year-picker-months';

      MONTH_NAMES.forEach((name, index) => {
        const monthBtn = createButton(name, 'month-year-picker-option');
        monthBtn.dataset.month = String(index);
        monthGrid.appendChild(monthBtn);
        state.monthButtons.push(monthBtn);
      });

      const yearGrid = document.createElement('div');
      yearGrid.className = 'month-year-picker-grid month-year-picker-years hidden';

      for (let index = 0; index < 9; index += 1) {
        const yearBtn = createButton('', 'month-year-picker-option');
        yearBtn.dataset.year = '';
        yearGrid.appendChild(yearBtn);
        state.yearButtons.push(yearBtn);
      }

      content.appendChild(monthGrid);
      content.appendChild(yearGrid);

      const footer = document.createElement('div');
      footer.className = 'month-year-picker-footer';

      const cancelBtn = createButton('Batalkan', 'month-year-picker-cancel');
      const applyBtn = createButton('Terapkan', 'month-year-picker-apply');
      applyBtn.disabled = true;

      footer.appendChild(cancelBtn);
      footer.appendChild(applyBtn);

      modal.appendChild(header);
      modal.appendChild(content);
      modal.appendChild(footer);

      overlay.appendChild(modal);
      container.appendChild(overlay);

      state.overlay = overlay;
      state.modal = modal;
      state.headerMonth = monthSpan;
      state.headerYear = yearSpan;
      state.prevBtn = prevBtn;
      state.nextBtn = nextBtn;
      state.monthGrid = monthGrid;
      state.yearGrid = yearGrid;
      state.cancelBtn = cancelBtn;
      state.applyBtn = applyBtn;

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          closePicker();
        }
      });

      cancelBtn.addEventListener('click', () => {
        closePicker();
      });

      applyBtn.addEventListener('click', () => {
        applySelection();
      });

      prevBtn.addEventListener('click', () => {
        if (state.activeView === 'month') {
          state.viewYear -= 1;
        } else {
          state.yearRangeStart -= 9;
          state.viewYear -= 9;
        }
        render();
      });

      nextBtn.addEventListener('click', () => {
        if (state.activeView === 'month') {
          state.viewYear += 1;
        } else {
          state.yearRangeStart += 9;
          state.viewYear += 9;
        }
        render();
      });

      monthSpan.addEventListener('click', () => {
        state.activeView = 'month';
        render();
      });

      yearSpan.addEventListener('click', () => {
        state.activeView = 'year';
        state.yearRangeStart = computeYearRangeStart(state.viewYear);
        render();
      });

      state.monthButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const monthIndex = Number(btn.dataset.month || '0');
          state.pendingMonth = monthIndex;
          state.pendingYear = state.viewYear;
          state.viewMonth = monthIndex;
          state.selectionMade = true;
          render();
        });
      });

      state.yearButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const yearValue = Number(btn.dataset.year || '0');
          state.pendingYear = yearValue;
          state.viewYear = yearValue;
          state.selectionMade = true;
          state.yearRangeStart = computeYearRangeStart(state.viewYear);
          render();
        });
      });

      document.addEventListener('keydown', (event) => {
        if (
          event.key === 'Escape'
          && state.overlay
          && state.container
          && state.container.classList.contains('month-year-picker-active')
        ) {
          closePicker();
        }
      });
    }

    function computeYearRangeStart(year) {
      return year - 4;
    }

    function updateApplyState() {
      if (!state.applyBtn) return;
      state.applyBtn.disabled = !state.selectionMade;
    }

    function renderMonthView() {
      state.monthGrid.classList.remove('hidden');
      state.yearGrid.classList.add('hidden');

      const highlightYear = state.pendingYear != null ? state.pendingYear : state.selectedYear;
      const highlightMonth = state.pendingMonth != null ? state.pendingMonth : state.selectedMonth;

      state.monthButtons.forEach((btn) => {
        const monthIndex = Number(btn.dataset.month || '0');
        const isSelected = state.viewYear === highlightYear && monthIndex === highlightMonth;
        btn.classList.toggle('month-year-picker-option-active', isSelected);
      });
    }

    function renderYearView() {
      state.monthGrid.classList.add('hidden');
      state.yearGrid.classList.remove('hidden');

      const start = state.yearRangeStart;
      const highlightYear = state.pendingYear != null ? state.pendingYear : state.selectedYear;

      state.yearButtons.forEach((btn, index) => {
        const yearValue = start + index;
        btn.dataset.year = String(yearValue);
        btn.textContent = String(yearValue);
        const isSelected = yearValue === highlightYear;
        btn.classList.toggle('month-year-picker-option-active', isSelected);
      });
    }

    function renderHeader() {
      if (!state.headerMonth || !state.headerYear) return;
      const displayMonth = state.pendingMonth != null ? state.pendingMonth : state.viewMonth;
      const displayYear = state.pendingYear != null ? state.pendingYear : state.viewYear;
      state.headerMonth.textContent = MONTH_NAMES[displayMonth] || '';
      state.headerYear.textContent = String(displayYear);
      state.headerMonth.classList.toggle('month-year-picker-title-active', state.activeView === 'month');
      state.headerYear.classList.toggle('month-year-picker-title-active', state.activeView === 'year');
    }

    function render() {
      if (!state.overlay) return;
      renderHeader();
      if (state.activeView === 'month') {
        renderMonthView();
      } else {
        renderYearView();
      }
      updateApplyState();
    }

    function resetState() {
      state.activeInstance = null;
      state.container = null;
      state.viewMonth = 0;
      state.viewYear = 0;
      state.selectedMonth = 0;
      state.selectedYear = 0;
      state.pendingMonth = null;
      state.pendingYear = null;
      state.selectionMade = false;
      state.activeView = 'month';
      state.yearRangeStart = 0;
      updateApplyState();
    }

    function openPicker(instance, view) {
      if (!instance || !instance.calendarContainer) return;
      const container = instance.calendarContainer;
      ensureElements(container);

      state.activeInstance = instance;
      state.container = container;
      state.selectedMonth = instance.currentMonth;
      state.selectedYear = instance.currentYear;
      state.viewMonth = instance.currentMonth;
      state.viewYear = instance.currentYear;
      state.pendingMonth = null;
      state.pendingYear = null;
      state.selectionMade = false;
      state.activeView = view === 'year' ? 'year' : 'month';
      state.yearRangeStart = computeYearRangeStart(state.viewYear);

      container.classList.add('month-year-picker-active');
      render();
    }

    function closePicker() {
      if (!state.overlay) return;
      if (state.container) {
        state.container.classList.remove('month-year-picker-active');
      }
      resetState();
    }

    function applySelection() {
      const instance = state.activeInstance;
      if (!instance) return;

      const targetYear = state.pendingYear != null ? state.pendingYear : state.viewYear;
      const targetMonth = state.pendingMonth != null ? state.pendingMonth : state.viewMonth;

      instance.changeYear(targetYear);
      const monthDelta = targetMonth - instance.currentMonth;
      if (monthDelta !== 0) {
        instance.changeMonth(monthDelta, true);
      } else {
        instance.redraw();
      }
      instance.jumpToDate(new Date(targetYear, targetMonth, 1));
      closePicker();
    }

    function bindInstance(instance) {
      if (!instance || !instance.calendarContainer) return;
      const container = instance.calendarContainer;
      if (container.dataset.monthYearPickerBound === 'true') return;

      container.dataset.monthYearPickerBound = 'true';

      const monthContainers = container.querySelectorAll('.flatpickr-month');
      if (!monthContainers.length) return;

      monthContainers.forEach((monthEl) => {
        monthEl.addEventListener('click', (event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;
          event.preventDefault();
          event.stopPropagation();
          const isYearTarget = target.closest('.cur-year') || target.closest('.numInputWrapper');
          const view = isYearTarget ? 'year' : 'month';
          openPicker(instance, view);
        });

        const yearInput = monthEl.querySelector('.cur-year');
        if (yearInput) {
          yearInput.setAttribute('readonly', 'readonly');
          yearInput.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openPicker(instance, 'year');
          });
          yearInput.addEventListener('focus', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openPicker(instance, 'year');
          });
          yearInput.addEventListener('keydown', (event) => {
            event.preventDefault();
          });
        }
      });
    }

    return {
      open: openPicker,
      bindInstance
    };
  })();

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
    const customInputs = customRange ? customRange.querySelectorAll('input') : null;
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
          monthSelectorType: 'static',
          onReady: (selectedDates, dateStr, instance) => {
            monthYearPicker.bindInstance(instance);
          },
          onOpen: (selectedDates, dateStr, instance) => {
            monthYearPicker.bindInstance(instance);
          },
          onChange: updateButtons
        });
        inp.addEventListener('input', updateButtons);

        const openCalendar = () => {
          const instance = inp._flatpickr;
          if (instance && !instance.isOpen) {
            instance.open();
          }
        };

        inp.addEventListener('focus', openCalendar);
        inp.addEventListener('click', (event) => {
          event.preventDefault();
          openCalendar();
        });
        inp.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openCalendar();
          }
        });
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
