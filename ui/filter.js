const DEFAULT_LABELS = {
  date: 'Semua Tanggal',
  category: 'Semua Kategori',
};

function resolveRoot(root) {
  if (!root) return document;
  if (root instanceof Element) return root;
  if (typeof root === 'string') {
    const el = document.querySelector(root);
    if (!el) {
      throw new Error(`initFilter root selector \"${root}\" did not match any element.`);
    }
    return el;
  }
  return document;
}

function getFilterType(filterEl) {
  const type = filterEl.dataset.filter;
  if (type === 'date' || type === 'category') return type;
  return filterEl.getAttribute('data-filter-type') || 'generic';
}

function formatCustomRange(startInput, endInput) {
  const start = startInput?.value?.trim();
  const end = endInput?.value?.trim();
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} -`;
  if (end) return `- ${end}`;
  return '';
}

function collectOptionValue(option) {
  if (!option) return null;
  if (option.type === 'checkbox') {
    return option.checked;
  }
  if (option.type === 'radio') {
    return option.value;
  }
  if (option instanceof HTMLInputElement || option instanceof HTMLSelectElement) {
    return option.value;
  }
  return option.textContent;
}

function createFilterState(filterEl, defaults) {
  const trigger = filterEl.querySelector('.filter-trigger');
  const panel = filterEl.querySelector('.filter-panel');
  const labelEl = trigger?.querySelector('.filter-label');
  const applyBtn = panel?.querySelector('.apply');
  const cancelBtn = panel?.querySelector('.cancel');
  const options = panel ? panel.querySelectorAll('input[type="radio"], input[type="checkbox"]') : [];
  const type = getFilterType(filterEl);

  const customRange = panel?.querySelector('.custom-range');
  const customStart = customRange?.querySelector('[data-date-start]');
  const customEnd = customRange?.querySelector('[data-date-end]');

  const defaultLabel = filterEl.dataset.default || defaults[type] || filterEl.dataset.label || '';
  const applied = {
    value: null,
    label: defaultLabel,
  };

  const state = {
    element: filterEl,
    trigger,
    panel,
    labelEl,
    applyBtn,
    cancelBtn,
    options,
    type,
    customRange,
    customStart,
    customEnd,
    applied,
    pending: null,
  };

  if (labelEl && defaultLabel) {
    labelEl.textContent = defaultLabel;
  }

  return state;
}

function openPanel(state, allStates) {
  allStates.forEach((other) => {
    if (other !== state) {
      other.panel?.classList.add('hidden');
      other.trigger?.classList.remove('active');
    }
  });
  state.panel?.classList.remove('hidden');
  state.trigger?.classList.add('active');
}

function closePanel(state) {
  state.panel?.classList.add('hidden');
  state.trigger?.classList.remove('active');
}

function applySelection(state, callbacks) {
  const { labelEl, type, pending, applied, customStart, customEnd } = state;
  if (!pending) return;
  applied.value = pending.value;
  applied.label = pending.label;
  if (labelEl && pending.label) {
    labelEl.textContent = pending.label;
  }
  if (type === 'date' && pending.value === 'custom' && customStart && customEnd) {
    labelEl.textContent = pending.customLabel || pending.label || DEFAULT_LABELS.date;
  }
  if (type === 'category' && !pending.label && labelEl) {
    labelEl.textContent = DEFAULT_LABELS.category;
  }
  if (pending.customLabel && labelEl) {
    labelEl.textContent = pending.customLabel;
  }
  state.pending = null;

  if (type === 'date' && typeof callbacks.onDateChange === 'function') {
    callbacks.onDateChange(applied.value, { label: applied.label, state });
  }
  if (type === 'category' && typeof callbacks.onCategoryChange === 'function') {
    callbacks.onCategoryChange(applied.value, { label: applied.label, state });
  }
  if (typeof callbacks.onChange === 'function') {
    callbacks.onChange(type, applied.value, { label: applied.label, state });
  }
}

function cancelSelection(state) {
  state.pending = null;
  closePanel(state);
}

function handleOptionInput(state, callbacks) {
  const { options, type, customRange, customStart, customEnd } = state;
  const current = { value: null, label: null };

  const selectedOptions = Array.from(options).filter((option) => {
    if (option.type === 'checkbox') return option.checked;
    if (option.type === 'radio') return option.checked;
    return false;
  });

  if (type === 'date') {
    const selected = selectedOptions[0];
    if (selected) {
      current.value = selected.value;
      current.label = selected.closest('label')?.textContent?.trim() || selected.value;
      if (selected.value === 'custom' && customRange) {
        customRange.classList.remove('hidden');
        const customLabel = formatCustomRange(customStart, customEnd);
        current.customLabel = customLabel || current.label;
      } else if (customRange) {
        customRange.classList.add('hidden');
      }
    }
  } else if (type === 'category') {
    const selected = selectedOptions[0];
    if (selected) {
      current.value = selected.value;
      current.label = selected.closest('label')?.textContent?.trim() || selected.value;
    }
  } else {
    current.value = selectedOptions.map((option) => collectOptionValue(option));
    current.label = Array.isArray(current.value) ? current.value.join(', ') : current.value;
  }

  state.pending = current;
  if (state.applyBtn) {
    const isValid = type !== 'date'
      || current.value !== 'custom'
      || Boolean(formatCustomRange(customStart, customEnd));
    state.applyBtn.disabled = !isValid;
  }
}

function bindEvents(state, allStates, callbacks) {
  const { trigger, panel, applyBtn, cancelBtn, options, customStart, customEnd } = state;

  trigger?.addEventListener('click', (event) => {
    event.preventDefault();
    if (panel?.classList.contains('hidden')) {
      openPanel(state, allStates);
    } else {
      closePanel(state);
    }
  });

  applyBtn?.addEventListener('click', () => {
    applySelection(state, callbacks);
    closePanel(state);
  });

  cancelBtn?.addEventListener('click', () => {
    cancelSelection(state);
  });

  if (options && options.length) {
    options.forEach((option) => {
      option.addEventListener('change', () => {
        handleOptionInput(state, callbacks);
      });
    });
  }

  const customInputs = [customStart, customEnd].filter(Boolean);
  customInputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (!state.pending || state.pending.value !== 'custom') {
        state.pending = {
          value: 'custom',
          label: DEFAULT_LABELS.date,
        };
      }
      state.pending.customLabel = formatCustomRange(customStart, customEnd) || DEFAULT_LABELS.date;
      if (state.applyBtn) {
        const hasRange = Boolean(formatCustomRange(customStart, customEnd));
        state.applyBtn.disabled = !hasRange;
      }
    });
  });
}

export function initFilter(config = {}) {
  const root = resolveRoot(config.root);
  const defaults = { ...DEFAULT_LABELS, ...(config.defaults || {}) };
  const callbacks = {
    onChange: config.onChange,
    onDateChange: config.onDateChange,
    onCategoryChange: config.onCategoryChange,
  };

  const filters = Array.from(root.querySelectorAll('.filter'));
  const states = filters.map((filterEl) => createFilterState(filterEl, defaults));
  states.forEach((state) => bindEvents(state, states, callbacks));

  function reset() {
    states.forEach((state) => {
      state.applied.value = null;
      state.applied.label = defaults[state.type] || '';
      if (state.labelEl && state.applied.label) {
        state.labelEl.textContent = state.applied.label;
      }
      if (state.options) {
        state.options.forEach((option) => {
          if (option.type === 'checkbox' || option.type === 'radio') {
            option.checked = false;
          }
        });
      }
      if (state.customRange) {
        state.customRange.classList.add('hidden');
      }
    });
  }

  function getState() {
    const snapshot = {};
    states.forEach((state) => {
      snapshot[state.type] = {
        value: state.applied.value,
        label: state.applied.label,
      };
    });
    return snapshot;
  }

  return {
    states,
    reset,
    getState,
  };
}

export default {
  initFilter,
};
