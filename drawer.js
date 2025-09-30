(function () {
  const registry = new WeakMap();

  function getDrawerElement(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      return document.getElementById(target) || null;
    }
    if (target instanceof Element) {
      return target;
    }
    return null;
  }

  function getState(drawer) {
    if (!registry.has(drawer)) {
      registry.set(drawer, {
        isOpen: drawer.classList.contains('open'),
        manageAria: drawer.hasAttribute('aria-hidden'),
        openListeners: new Set(),
        closeListeners: new Set(),
      });
    }
    return registry.get(drawer);
  }

  function runListeners(listeners, detail) {
    listeners.forEach((listener) => {
      try {
        listener(detail);
      } catch (err) {
        console.error('drawerManager listener error', err);
      }
    });
  }

  function updateAria(drawer, state, isOpen) {
    if (!state.manageAria) return;
    drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  function openDrawer(target, options = {}) {
    const drawer = getDrawerElement(target);
    if (!drawer) return false;
    const state = getState(drawer);
    if (!state.isOpen) {
      drawer.classList.add('open');
      state.isOpen = true;
      updateAria(drawer, state, true);
      if (typeof window.sidebarCollapseForDrawer === 'function') {
        window.sidebarCollapseForDrawer();
      }
      const detail = { drawer, trigger: options.trigger || null };
      runListeners(state.openListeners, detail);
      drawer.dispatchEvent(new CustomEvent('drawer:open', { detail }));
      return true;
    }
    return false;
  }

  function closeDrawer(target, options = {}) {
    const drawer = getDrawerElement(target);
    if (!drawer) return false;
    const state = getState(drawer);
    if (state.isOpen) {
      drawer.classList.remove('open');
      state.isOpen = false;
      updateAria(drawer, state, false);
      if (typeof window.sidebarRestoreForDrawer === 'function') {
        window.sidebarRestoreForDrawer();
      }
      const detail = { drawer, trigger: options.trigger || null };
      runListeners(state.closeListeners, detail);
      drawer.dispatchEvent(new CustomEvent('drawer:close', { detail }));
      return true;
    }
    return false;
  }

  function toggleDrawer(target, options = {}) {
    const drawer = getDrawerElement(target);
    if (!drawer) return false;
    const state = getState(drawer);
    return state.isOpen
      ? closeDrawer(drawer, options)
      : openDrawer(drawer, options);
  }

  function register(target, config = {}) {
    const drawer = getDrawerElement(target);
    if (!drawer) return null;
    const state = getState(drawer);
    if (typeof config.manageAria === 'boolean') {
      state.manageAria = config.manageAria;
    }
    if (typeof config.onOpen === 'function') {
      state.openListeners.add(config.onOpen);
    }
    if (typeof config.onClose === 'function') {
      state.closeListeners.add(config.onClose);
    }

    return {
      element: drawer,
      open: (opts) => openDrawer(drawer, opts),
      close: (opts) => closeDrawer(drawer, opts),
      toggle: (opts) => toggleDrawer(drawer, opts),
      isOpen: () => getState(drawer).isOpen,
      onOpen: (fn) => {
        if (typeof fn === 'function') state.openListeners.add(fn);
      },
      onClose: (fn) => {
        if (typeof fn === 'function') state.closeListeners.add(fn);
      },
      setAriaManaged: (value) => {
        state.manageAria = Boolean(value);
      },
    };
  }

  function isOpen(target) {
    const drawer = getDrawerElement(target);
    if (!drawer) return false;
    return getState(drawer).isOpen;
  }

  window.drawerManager = {
    register,
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
    isOpen,
  };
})();
