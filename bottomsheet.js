const state = {
  container: null,
  sheet: null,
  overlay: null,
  options: null,
  closeButtons: [],
  escHandler: null,
  overlayClickHandler: null,
};

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
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.35)';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 200ms ease';
    overlay.setAttribute('aria-hidden', 'true');
    container.insertBefore(overlay, container.firstChild || null);
  }

  if (typeof className === 'string' && className.length > 0) {
    overlay.className = className;
  }
  overlay.style.zIndex = String(zIndex);

  return overlay;
}

function showOverlay(overlay, { closeOnOverlay = true } = {}) {
  if (!overlay) return;

  overlay.style.pointerEvents = 'auto';
  overlay.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

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

  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.setAttribute('aria-hidden', 'true');

  state.overlayClickHandler = null;
  state.overlay = null;
}

function applyAnimation(sheet, { openDuration = 250, closeDuration = 200 } = {}) {
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

export default {
  openBottomSheet,
  closeBottomSheet,
};
