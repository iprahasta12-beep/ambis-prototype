import { showOverlay, hideOverlay } from './overlay.js';

const DEFAULT_CLOSE_SELECTORS = ['[data-drawer-close]', '[data-close-drawer]'];
const OPEN_CLASS = 'open';

const state = {
  drawer: null,
  options: null,
  closeButtons: [],
  escHandler: null,
  overlayActive: false,
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

function setDrawerTitle(drawer, title, titleTarget) {
  if (!title) return;
  const titleEl = resolveElement(titleTarget, '[data-drawer-title]')
    || drawer.querySelector('[data-drawer-title]')
    || drawer.querySelector('#drawerTitle')
    || drawer.querySelector('h2, h1');
  if (titleEl) {
    titleEl.textContent = title;
  }
}

function setDrawerContent(drawer, content, contentTarget) {
  if (content == null) return;
  const contentEl = resolveElement(contentTarget, '[data-drawer-content]')
    || drawer.querySelector('[data-drawer-content]')
    || drawer.querySelector('#drawerContent');
  if (!contentEl) return;

  if (typeof content === 'string') {
    contentEl.innerHTML = content;
    return;
  }

  if (typeof content === 'function') {
    const result = content(contentEl);
    if (result instanceof Node) {
      contentEl.innerHTML = '';
      contentEl.appendChild(result);
    }
    return;
  }

  if (content instanceof Node) {
    contentEl.innerHTML = '';
    contentEl.appendChild(content);
  }
}

function bindCloseTriggers(drawer, selectors = DEFAULT_CLOSE_SELECTORS) {
  state.closeButtons = [];
  const unique = Array.from(new Set(selectors.filter(Boolean)));
  unique.forEach((selectorOrEl) => {
    let elements = [];
    if (typeof selectorOrEl === 'string') {
      elements = Array.from(drawer.querySelectorAll(selectorOrEl));
    } else if (selectorOrEl instanceof Element) {
      elements = [selectorOrEl];
    }

    elements.forEach((el) => {
      const handler = (event) => {
        event.preventDefault();
        closeDrawer();
      };
      el.addEventListener('click', handler);
      state.closeButtons.push({ el, handler });
    });
  });
}

function removeCloseTriggers() {
  state.closeButtons.forEach(({ el, handler }) => {
    el.removeEventListener('click', handler);
  });
  state.closeButtons = [];
}

function bindEscHandler(closeOnEsc) {
  if (!closeOnEsc) {
    state.escHandler = null;
    return;
  }

  state.escHandler = (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  };
  document.addEventListener('keydown', state.escHandler);
}

function removeEscHandler() {
  if (!state.escHandler) return;
  document.removeEventListener('keydown', state.escHandler);
  state.escHandler = null;
}

export function openDrawer(options = {}) {
  const drawer = resolveElement(options.drawer, '#drawer');
  if (!drawer) return null;

  closeDrawer();

  const {
    title = null,
    content = null,
    titleTarget = null,
    contentTarget = null,
    closeSelectors = DEFAULT_CLOSE_SELECTORS,
    onOpen = null,
    onClose = null,
    focusTarget = null,
    closeOnEsc = true,
    overlay = false,
    overlayClass = '',
    overlayRoot = document.body,
    closeOnOverlay = false,
  } = options;

  state.drawer = drawer;
  state.options = { onClose, focusTarget };
  state.overlayActive = Boolean(overlay);

  setDrawerTitle(drawer, title, titleTarget);
  setDrawerContent(drawer, content, contentTarget);
  bindCloseTriggers(drawer, closeSelectors);
  bindEscHandler(closeOnEsc);

  if (overlay) {
    showOverlay({
      className: overlayClass,
      root: overlayRoot,
      onClick: closeOnOverlay ? () => closeDrawer() : null,
    });
  }

  drawer.classList.add(OPEN_CLASS);
  drawer.setAttribute('aria-hidden', 'false');

  if (typeof onOpen === 'function') {
    onOpen({ drawer });
  }

  const focusEl = resolveElement(focusTarget, null);
  if (focusEl) {
    requestAnimationFrame(() => focusEl.focus());
  }

  return drawer;
}

export function closeDrawer() {
  const { drawer, overlayActive, options } = state;
  if (!drawer) return;

  drawer.classList.remove(OPEN_CLASS);
  drawer.setAttribute('aria-hidden', 'true');

  if (overlayActive) {
    hideOverlay();
  }

  removeCloseTriggers();
  removeEscHandler();

  const onClose = options?.onClose;
  if (typeof onClose === 'function') {
    onClose({ drawer });
  }

  state.drawer = null;
  state.options = null;
  state.overlayActive = false;
}

export default {
  openDrawer,
  closeDrawer,
};
