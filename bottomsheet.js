import { showOverlay, hideOverlay } from './overlay.js';

const state = {
  container: null,
  sheet: null,
  options: null,
  closeButtons: [],
  escHandler: null,
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

  await closeBottomSheet();

  const {
    closeSelectors = ['[data-bottom-sheet-close]'],
    onOpen = null,
    onClose = null,
    focusTarget = null,
    closeOnOverlay = true,
    overlayClass = '',
    overlayRoot = document.body,
    useOverlay = true,
    animation = {},
  } = options;

  state.container = container;
  state.sheet = sheet;
  state.options = { onClose, focusTarget, animation, useOverlay };

  applyAnimation(sheet, animation);

  if (container) {
    container.classList.remove('hidden');
    container.setAttribute('aria-hidden', 'false');
    container.style.pointerEvents = 'auto';
  }

  if (useOverlay) {
    showOverlay({
      className: overlayClass,
      root: overlayRoot,
      onClick: closeOnOverlay ? () => closeBottomSheet() : null,
    });
  }

  state.closeButtons = addCloseHandlers(container || sheet, closeSelectors, closeBottomSheet);
  bindEscHandler();

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
}

export default {
  openBottomSheet,
  closeBottomSheet,
};
