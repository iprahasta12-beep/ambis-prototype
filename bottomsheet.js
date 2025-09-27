const state = {
  container: null,
  sheet: null,
  overlay: null,
  options: null,
  closeButtons: [],
  escHandler: null,
  overlayClickHandler: null,
  sheetInitialStyles: null,
};

function toCssProperty(name) {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function setInlineStyle(element, property, value) {
  if (!element) return;
  if (typeof value === 'string' && value.length > 0) {
    element.style[property] = value;
  } else {
    element.style.removeProperty(toCssProperty(property));
  }
}

function rememberSheetStyles(sheet) {
  if (!sheet) return;
  state.sheetInitialStyles = {
    transition: sheet.style.transition || '',
    transitionDuration: sheet.style.transitionDuration || '',
    transform: sheet.style.transform || '',
    opacity: sheet.style.opacity || '',
    zIndex: sheet.style.zIndex || '',
  };
}

function restoreSheetStyles(sheet) {
  if (!sheet) return;
  const previous = state.sheetInitialStyles;
  if (previous) {
    setInlineStyle(sheet, 'transition', previous.transition);
    setInlineStyle(sheet, 'transitionDuration', previous.transitionDuration);
    setInlineStyle(sheet, 'transform', previous.transform);
    setInlineStyle(sheet, 'opacity', previous.opacity);
    setInlineStyle(sheet, 'zIndex', previous.zIndex);
  } else {
    setInlineStyle(sheet, 'transition', '');
    setInlineStyle(sheet, 'transitionDuration', '');
    setInlineStyle(sheet, 'transform', '');
    setInlineStyle(sheet, 'opacity', '');
    setInlineStyle(sheet, 'zIndex', '');
  }
  state.sheetInitialStyles = null;
}

function resolveElement(target, fallbackSelector) {
  if (!target && fallbackSelector) {
    return document.querySelector(fallbackSelector);
  }
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target || null;
}

function addCloseHandlers(container, selectors, closeFn) {
  const result = [];
  const unique = Array.from(new Set(selectors.filter(Boolean)));
  unique.forEach((selectorOrEl) => {
    let elements = [];
    if (typeof selectorOrEl === 'string') {
      elements = Array.from(container.querySelectorAll(selectorOrEl));
    } else if (selectorOrEl instanceof Element) {
      elements = [selectorOrEl];
    }
    elements.forEach((el) => {
      const handler = (event) => {
        event.preventDefault();
        closeFn();
      };
      el.addEventListener('click', handler);
      result.push({ el, handler });
    });
  });
  return result;
}

function removeCloseHandlers() {
  state.closeButtons.forEach(({ el, handler }) => {
    el.removeEventListener('click', handler);
  });
  state.closeButtons = [];
}

function bindEscHandler() {
  state.escHandler = (event) => {
    if (event.key === 'Escape') {
      closeBottomSheet();
    }
  };
  document.addEventListener('keydown', state.escHandler);
}

function removeEscHandler() {
  if (!state.escHandler) return;
  document.removeEventListener('keydown', state.escHandler);
  state.escHandler = null;
}

function ensureDrawerRoot(container, drawer) {
  if (!container || !drawer) return drawer || null;

  if (container.parentElement !== drawer) {
    drawer.appendChild(container);
  }

  return drawer;
}

function ensureOverlay(container, { className = '', zIndex = 60 } = {}) {
  if (!container) return null;

  let overlay = container.querySelector('[data-bottom-sheet-overlay]');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.dataset.bottomSheetOverlay = 'true';
    overlay.className =
      className && className.length > 0
        ? className
        : 'absolute inset-0 bg-slate-900/40 opacity-0 transition-opacity duration-200';
    overlay.style.pointerEvents = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    container.insertBefore(overlay, container.firstChild || null);
  } else if (typeof className === 'string' && className.length > 0) {
    overlay.className = className;
  }

  overlay.dataset.bottomSheetPrevZIndex = overlay.style.zIndex || '';
  overlay.style.zIndex = String(zIndex);

  return overlay;
}

function showOverlay(overlay, { closeOnOverlay = true } = {}) {
  if (!overlay) return;

  const hadHiddenClass = overlay.classList.contains('hidden');
  overlay.dataset.bottomSheetHiddenClass = hadHiddenClass ? '1' : '0';
  if (hadHiddenClass) {
    overlay.classList.remove('hidden');
  }

  const usesOpacityClass =
    overlay.classList.contains('opacity-0') || overlay.classList.contains('opacity-100');
  overlay.dataset.bottomSheetUsesOpacity = usesOpacityClass ? '1' : '0';
  overlay.dataset.bottomSheetPrevPointerEvents = overlay.style.pointerEvents || '';
  overlay.dataset.bottomSheetPrevOpacity = overlay.style.opacity || '';

  overlay.setAttribute('aria-hidden', 'false');
  setInlineStyle(overlay, 'pointerEvents', 'auto');

  if (usesOpacityClass) {
    overlay.classList.remove('opacity-100');
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-0');
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    });
  } else {
    setInlineStyle(overlay, 'opacity', '0');
    requestAnimationFrame(() => {
      setInlineStyle(overlay, 'opacity', '1');
    });
  }

  if (closeOnOverlay) {
    const handler = (event) => {
      if (event.target !== overlay) return;
      closeBottomSheet();
    };
    overlay.addEventListener('click', handler);
    state.overlayClickHandler = handler;
  }
}

function hideOverlay() {
  const { overlay, overlayClickHandler } = state;
  if (!overlay) return;

  if (overlayClickHandler) {
    overlay.removeEventListener('click', overlayClickHandler);
  }

  const usesOpacityClass = overlay.dataset.bottomSheetUsesOpacity === '1';
  const hadHiddenClass = overlay.dataset.bottomSheetHiddenClass === '1';
  const prevPointerEvents = overlay.dataset.bottomSheetPrevPointerEvents || '';
  const prevOpacity = overlay.dataset.bottomSheetPrevOpacity || '';
  const prevZIndex = overlay.dataset.bottomSheetPrevZIndex || '';

  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.pointerEvents = 'none';

  if (usesOpacityClass) {
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
  } else {
    setInlineStyle(overlay, 'opacity', '0');
  }

  state.overlayClickHandler = null;
  state.overlay = null;

  const duration = getTransitionDurationMs(overlay);

  const cleanup = () => {
    if (hadHiddenClass) {
      overlay.classList.add('hidden');
    }
    if (usesOpacityClass) {
      overlay.classList.remove('opacity-0');
    } else {
      setInlineStyle(overlay, 'opacity', prevOpacity);
    }
    setInlineStyle(overlay, 'pointerEvents', prevPointerEvents);
    setInlineStyle(overlay, 'zIndex', prevZIndex);
    overlay.dataset.bottomSheetHiddenClass = '';
    overlay.dataset.bottomSheetUsesOpacity = '';
    overlay.dataset.bottomSheetPrevPointerEvents = '';
    overlay.dataset.bottomSheetPrevOpacity = '';
    overlay.dataset.bottomSheetPrevZIndex = '';
  };

  if (duration > 0) {
    setTimeout(cleanup, duration + 50);
  } else {
    cleanup();
  }
}

function applyAnimation(sheet, { openDuration = 250, closeDuration = 200 } = {}) {
  rememberSheetStyles(sheet);
  sheet.style.transition = `transform ${openDuration}ms ease, opacity ${openDuration}ms ease`;
  sheet.style.transform = 'translateY(100%)';
  sheet.style.opacity = '0';
}

function playOpenAnimation(sheet, { openDuration = 250 } = {}) {
  sheet.style.transitionDuration = `${openDuration}ms`;
  requestAnimationFrame(() => {
    sheet.style.transform = 'translateY(0)';
    sheet.style.opacity = '1';
  });
}

function playCloseAnimation(sheet, { closeDuration = 200 } = {}) {
  return new Promise((resolve) => {
    sheet.style.transitionDuration = `${closeDuration}ms`;
    sheet.style.transform = 'translateY(100%)';
    sheet.style.opacity = '0';
    const handle = () => {
      sheet.removeEventListener('transitionend', handle);
      resolve();
    };
    sheet.addEventListener('transitionend', handle);
    setTimeout(handle, closeDuration + 50);
  });
}

export async function openBottomSheet(options = {}) {
  const sheet = resolveElement(options.sheet, '[data-bottom-sheet]');
  if (!sheet) return null;

  const container = resolveElement(options.container, sheet.parentElement);
  const drawerCandidate = resolveElement(
    options.drawerRoot ?? options.overlayRoot,
    container?.closest('#drawer')
  );

  await closeBottomSheet();

  const {
    closeSelectors = ['[data-bottom-sheet-close]'],
    onOpen = null,
    onClose = null,
    focusTarget = null,
    closeOnOverlay = true,
    overlayClass = '',
    zIndex = 60,
    useOverlay = true,
    animation = {},
  } = options;

  const drawerRoot = ensureDrawerRoot(container, drawerCandidate);

  state.container = container;
  state.sheet = sheet;
  state.options = { onClose, focusTarget, animation, useOverlay };

  if (container) {
    container.classList.remove('hidden');
    container.classList.remove('pointer-events-none');
    container.setAttribute('aria-hidden', 'false');
    container.style.pointerEvents = 'auto';
    container.style.zIndex = String(zIndex);
  }

  applyAnimation(sheet, animation);

  if (useOverlay) {
    const overlay = ensureOverlay(container || drawerRoot, { className: overlayClass, zIndex });
    state.overlay = overlay;
    showOverlay(overlay, { closeOnOverlay });
  }

  state.closeButtons = addCloseHandlers(container || sheet, closeSelectors, closeBottomSheet);
  bindEscHandler();

  sheet.style.zIndex = String(zIndex + 1);
  playOpenAnimation(sheet, animation);

  if (typeof onOpen === 'function') {
    onOpen({ sheet, container });
  }

  const focusEl = resolveElement(focusTarget, null);
  if (focusEl) {
    requestAnimationFrame(() => focusEl.focus());
  }

  return sheet;
}

export async function closeBottomSheet({ immediate = false } = {}) {
  const { container, sheet, options } = state;
  if (!sheet) return;

  removeCloseHandlers();
  removeEscHandler();

  if (immediate) {
    sheet.style.transitionDuration = '0ms';
    sheet.style.transform = 'translateY(100%)';
    sheet.style.opacity = '0';
  } else {
    await playCloseAnimation(sheet, options?.animation);
  }

  if (container) {
    container.setAttribute('aria-hidden', 'true');
    container.style.pointerEvents = 'none';
    container.classList.add('hidden');
    container.classList.add('pointer-events-none');
    container.style.zIndex = '';
  }

  if (sheet) {
    sheet.style.zIndex = '';
  }

  if (options?.useOverlay) {
    hideOverlay();
  }

  restoreSheetStyles(sheet);

  const onClose = options?.onClose;
  if (typeof onClose === 'function') {
    onClose({ sheet, container });
  }

  state.container = null;
  state.sheet = null;
  state.options = null;
  state.overlay = null;
  state.overlayClickHandler = null;
}

function getTransitionDurationMs(element) {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  const durations = style.transitionDuration.split(',');
  const delays = style.transitionDelay.split(',');
  const total = durations.map((duration, index) => {
    const delay = delays[index] || delays[delays.length - 1] || '0s';
    return parseTimeToMs(duration) + parseTimeToMs(delay);
  });
  return total.length ? Math.max(...total) : 0;
}

function parseTimeToMs(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return 0;
  const multiplier = trimmed.endsWith('ms') ? 1 : 1000;
  const numeric = parseFloat(trimmed);
  if (Number.isNaN(numeric)) return 0;
  return numeric * multiplier;
}

export default {
  openBottomSheet,
  closeBottomSheet,
};
