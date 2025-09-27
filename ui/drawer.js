import { getOverlay, showOverlay, hideOverlay } from './overlay.js';

const defaultClasses = {
  open: ['open'],
  enter: ['opacity-100', 'translate-x-0'],
  exit: ['opacity-0', 'translate-x-4'],
};

let activeDrawer = null;

function ensureElement(target, fallbackSelector) {
  if (!target && !fallbackSelector) return null;
  if (target instanceof Element) return target;
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(`Drawer selector \"${target}\" did not match any element.`);
    }
    return el;
  }
  if (!target && fallbackSelector) {
    const el = fallbackSelector instanceof Element
      ? fallbackSelector
      : document.querySelector(fallbackSelector);
    if (!el) {
      throw new Error(`Drawer fallback selector \"${fallbackSelector}\" did not match any element.`);
    }
    return el;
  }
  return null;
}

function applyContent(target, content) {
  if (!target || content === undefined || content === null) return;
  if (typeof content === 'string') {
    target.innerHTML = content;
    return;
  }
  if (content instanceof Node) {
    target.innerHTML = '';
    target.appendChild(content);
    return;
  }
  if (typeof content === 'function') {
    const result = content(target);
    if (result !== undefined && result !== null) {
      applyContent(target, result);
    }
  }
}

function bindCloseHandlers(closeTargets, handler) {
  const listeners = [];
  const targets = Array.isArray(closeTargets) ? closeTargets : [closeTargets];
  targets.filter(Boolean).forEach((target) => {
    if (typeof target === 'string') {
      document.querySelectorAll(target).forEach((el) => {
        const listener = () => handler();
        el.addEventListener('click', listener);
        listeners.push({ el, listener });
      });
      return;
    }
    if (target instanceof Element) {
      const listener = () => handler();
      target.addEventListener('click', listener);
      listeners.push({ el: target, listener });
    }
  });
  return () => {
    listeners.forEach(({ el, listener }) => {
      el.removeEventListener('click', listener);
    });
  };
}

function resetListeners(state) {
  if (state?.unbindClose) {
    state.unbindClose();
    state.unbindClose = null;
  }
}

export function openDrawer(options = {}) {
  const {
    drawer,
    inner,
    title,
    titleElement,
    content,
    contentElement,
    closeSelectors = [],
    closeOnOverlay = true,
    overlayKey,
    overlayContainer,
    overlayClass,
    overlayZIndex = 40,
    onOpen,
    onClose,
    autoFocus,
    classes = {},
  } = options;

  const drawerEl = ensureElement(drawer, '#drawer');
  if (!drawerEl) {
    throw new Error('openDrawer requires a valid drawer element.');
  }
  const innerEl = ensureElement(inner, drawerEl.querySelector('[data-drawer-inner]') || '#drawerInner');
  const titleEl = ensureElement(titleElement, drawerEl.querySelector('[data-drawer-title]') || '#drawerTitle');
  const contentEl = ensureElement(contentElement, drawerEl.querySelector('[data-drawer-content]'));

  const mergedClasses = {
    open: classes.open || defaultClasses.open,
    enter: classes.enter || defaultClasses.enter,
    exit: classes.exit || defaultClasses.exit,
  };

  if (title !== undefined) {
    applyContent(titleEl, title);
  }
  if (content !== undefined) {
    applyContent(contentEl, content);
  }

  const overlay = closeOnOverlay
    ? getOverlay(overlayKey || drawerEl, {
        container: overlayContainer || drawerEl.parentElement || document.body,
        className: overlayClass,
        zIndex: overlayZIndex,
      })
    : null;

  const state = {
    drawerEl,
    innerEl,
    overlay,
    onClose,
    autoFocus,
    classes: mergedClasses,
  };

  resetListeners(activeDrawer);

  const closeHandler = () => closeDrawer();
  const unbindClose = bindCloseHandlers(closeSelectors, closeHandler);
  state.unbindClose = () => {
    if (unbindClose) unbindClose();
    if (overlay && closeOnOverlay) {
      overlay.removeEventListener('click', closeHandler);
    }
  };

  if (overlay && closeOnOverlay) {
    overlay.addEventListener('click', closeHandler);
  }

  drawerEl.classList.add(...mergedClasses.open);
  if (innerEl) {
    innerEl.classList.remove(...mergedClasses.exit);
    innerEl.classList.add(...mergedClasses.enter);
  }

  if (overlay) {
    showOverlay(overlay);
  }

  activeDrawer = state;

  if (typeof onOpen === 'function') {
    onOpen(state);
  }

  if (autoFocus instanceof Element) {
    autoFocus.focus();
  } else if (typeof autoFocus === 'string') {
    const focusTarget = drawerEl.querySelector(autoFocus);
    focusTarget?.focus();
  }

  return state;
}

export function closeDrawer() {
  if (!activeDrawer) return;
  const {
    drawerEl,
    innerEl,
    overlay,
    onClose,
    classes,
  } = activeDrawer;

  if (innerEl) {
    innerEl.classList.remove(...classes.enter);
    innerEl.classList.add(...classes.exit);
  }

  const finish = () => {
    drawerEl.classList.remove(...classes.open);
    if (overlay) hideOverlay(overlay);
    resetListeners(activeDrawer);
    if (typeof onClose === 'function') {
      onClose();
    }
    activeDrawer = null;
  };

  const duration = parseFloat(getComputedStyle(innerEl || drawerEl).transitionDuration || '0');
  const delay = Math.max(0, duration * 1000);
  window.setTimeout(finish, delay || 200);
}

export function isDrawerOpen() {
  return Boolean(activeDrawer);
}

export default {
  openDrawer,
  closeDrawer,
  isDrawerOpen,
};
