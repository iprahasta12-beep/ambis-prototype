import { getOverlay, showOverlay, hideOverlay } from './overlay.js';

const ACTIVE_CLASS = 'open';
const ENTER_CLASSES = ['translate-y-0'];
const EXIT_CLASSES = ['translate-y-full'];

let activeSheet = null;

function resolveSheet(target) {
  if (target instanceof Element) return target;
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(`Bottom sheet selector \"${target}\" did not match any element.`);
    }
    return el;
  }
  return null;
}

function bindCloseTargets(targets, handler) {
  if (!targets) return () => {};
  const list = Array.isArray(targets) ? targets : [targets];
  const bindings = [];
  list.filter(Boolean).forEach((target) => {
    if (typeof target === 'string') {
      document.querySelectorAll(target).forEach((el) => {
        const listener = () => handler();
        el.addEventListener('click', listener);
        bindings.push({ el, listener });
      });
      return;
    }
    if (target instanceof Element) {
      const listener = () => handler();
      target.addEventListener('click', listener);
      bindings.push({ el: target, listener });
    }
  });
  return () => {
    bindings.forEach(({ el, listener }) => el.removeEventListener('click', listener));
  };
}

export function openBottomSheet(options = {}) {
  const {
    sheet,
    overlayKey,
    overlayContainer,
    overlayClass,
    overlayZIndex = 50,
    closeSelectors,
    onOpen,
    onClose,
    trapFocus = false,
    initialFocus,
  } = options;

  const sheetEl = resolveSheet(sheet);
  if (!sheetEl) {
    throw new Error('openBottomSheet requires a valid sheet element.');
  }

  const overlay = getOverlay(overlayKey || sheetEl, {
    container: overlayContainer || sheetEl.parentElement || document.body,
    className: overlayClass,
    zIndex: overlayZIndex,
    clickHandler: () => closeBottomSheet(),
  });

  const previous = activeSheet;
  if (previous && previous.sheetEl !== sheetEl) {
    closeBottomSheet({ immediate: true });
  }

  const cleanup = bindCloseTargets(closeSelectors, () => closeBottomSheet());

  sheetEl.classList.add(ACTIVE_CLASS);
  sheetEl.classList.remove(...EXIT_CLASSES);
  sheetEl.classList.add(...ENTER_CLASSES);
  showOverlay(overlay);

  const state = {
    sheetEl,
    overlay,
    onClose,
    cleanup,
    trapFocus,
    initialFocus,
    focusTrapListeners: [],
  };

  if (trapFocus) {
    const focusHandler = (event) => {
      if (!sheetEl.contains(event.target)) {
        const focusable = sheetEl.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        if (first) first.focus();
      }
    };
    document.addEventListener('focusin', focusHandler);
    state.focusTrapListeners.push(['focusin', focusHandler]);
  }

  activeSheet = state;

  if (typeof onOpen === 'function') {
    onOpen(state);
  }

  if (initialFocus instanceof Element) {
    initialFocus.focus();
  } else if (typeof initialFocus === 'string') {
    sheetEl.querySelector(initialFocus)?.focus();
  }

  return state;
}

export function closeBottomSheet(options = {}) {
  if (!activeSheet) return;
  const { immediate = false } = options;
  const {
    sheetEl,
    overlay,
    onClose,
    cleanup,
    trapFocus,
    focusTrapListeners,
  } = activeSheet;

  const finish = () => {
    sheetEl.classList.remove(ACTIVE_CLASS, ...ENTER_CLASSES);
    sheetEl.classList.add(...EXIT_CLASSES);
    hideOverlay(overlay);
    cleanup?.();
    if (trapFocus) {
      focusTrapListeners.forEach(([event, handler]) => document.removeEventListener(event, handler));
    }
    if (typeof onClose === 'function') {
      onClose();
    }
    activeSheet = null;
  };

  if (immediate) {
    finish();
    return;
  }

  sheetEl.classList.remove(...ENTER_CLASSES);
  sheetEl.classList.add(...EXIT_CLASSES);
  hideOverlay(overlay);

  const duration = parseFloat(getComputedStyle(sheetEl).transitionDuration || '0');
  const delay = Math.max(0, duration * 1000);
  window.setTimeout(finish, delay || 200);
}

export function isBottomSheetOpen() {
  return Boolean(activeSheet);
}

export default {
  openBottomSheet,
  closeBottomSheet,
  isBottomSheetOpen,
};
