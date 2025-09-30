(function () {
  const DEFAULT_DURATION = 200;

  function schedule(callback, delay, state, key) {
    if (typeof callback !== 'function') {
      return null;
    }
    if (!delay || delay <= 0) {
      callback();
      return null;
    }
    const id = window.setTimeout(() => {
      if (state) {
        state[key] = null;
      }
      callback();
    }, delay);
    if (state) {
      state[key] = id;
    }
    return id;
  }

  function clearTimer(state, key) {
    if (!state || !state[key]) return;
    window.clearTimeout(state[key]);
    state[key] = null;
  }

  function resolveDuration(options, kind) {
    if (options == null) {
      return DEFAULT_DURATION;
    }
    if (kind === 'open' && typeof options.openDuration === 'number') {
      return options.openDuration;
    }
    if (kind === 'close' && typeof options.closeDuration === 'number') {
      return options.closeDuration;
    }
    if (typeof options.duration === 'number') {
      return options.duration;
    }
    return DEFAULT_DURATION;
  }

  function createController(config = {}) {
    const overlay = config.overlay;
    const sheet = config.sheet;
    if (!overlay || !sheet) {
      return null;
    }

    const state = config.state || {};
    if (state.overlay && state.overlay !== overlay) {
      state.overlay = overlay;
    } else if (!state.overlay) {
      state.overlay = overlay;
    }

    if (typeof state.hiddenClass !== 'string') {
      state.hiddenClass = config.hiddenClass || 'hidden';
    }
    if (typeof state.overlayVisibleClass !== 'string') {
      state.overlayVisibleClass = config.overlayVisibleClass || 'opacity-100';
    }
    if (typeof state.overlayHiddenClass !== 'string') {
      state.overlayHiddenClass = config.overlayHiddenClass || 'opacity-0';
    }
    if (!('activeSheet' in state)) {
      state.activeSheet = null;
    }
    state.openTimer = state.openTimer || null;
    state.closeTimer = state.closeTimer || null;

    const defaults = {
      sheetHiddenClass: config.sheetHiddenClass || 'translate-y-full',
      sheetVisibleClass: config.sheetVisibleClass || '',
      duration: typeof config.duration === 'number' ? config.duration : undefined,
      openDuration: typeof config.openDuration === 'number' ? config.openDuration : undefined,
      closeDuration: typeof config.closeDuration === 'number' ? config.closeDuration : undefined,
      onBeforeOpen: typeof config.onBeforeOpen === 'function' ? config.onBeforeOpen : null,
      onAfterOpen: typeof config.onAfterOpen === 'function' ? config.onAfterOpen : null,
      onBeforeClose: typeof config.onBeforeClose === 'function' ? config.onBeforeClose : null,
      onAfterClose: typeof config.onAfterClose === 'function' ? config.onAfterClose : null,
    };

    function clearTimers() {
      clearTimer(state, 'openTimer');
      clearTimer(state, 'closeTimer');
    }

    function applyOpenClasses(sheetEl, opts) {
      const overlayEl = state.overlay;
      overlayEl.classList.remove(state.overlayHiddenClass);
      overlayEl.classList.add(state.overlayVisibleClass);
      sheetEl.classList.remove(opts.sheetHiddenClass);
      if (opts.sheetVisibleClass) {
        sheetEl.classList.add(opts.sheetVisibleClass);
      }
      state.activeSheet = sheetEl;
    }

    function open(options = {}) {
      const opts = {
        ...defaults,
        ...options,
      };
      const overlayEl = state.overlay;
      if (!overlayEl) {
        return;
      }
      clearTimers();

      const hiddenClass = state.hiddenClass;
      const immediate = Boolean(opts.immediate);
      const sheetHiddenClass = opts.sheetHiddenClass || 'translate-y-full';
      const sheetVisibleClass = opts.sheetVisibleClass || '';

      opts.onBeforeOpen?.();

      overlayEl.classList.remove(hiddenClass);

      if (!immediate) {
        overlayEl.classList.remove(state.overlayVisibleClass);
        overlayEl.classList.add(state.overlayHiddenClass);
        sheet.classList.add(sheetHiddenClass);
      }

      if (state.activeSheet && state.activeSheet !== sheet) {
        state.activeSheet.classList.add(sheetHiddenClass);
        if (sheetVisibleClass) {
          state.activeSheet.classList.remove(sheetVisibleClass);
        }
      }

      const runOpen = () => applyOpenClasses(sheet, { sheetHiddenClass, sheetVisibleClass });

      if (immediate) {
        runOpen();
        opts.onAfterOpen?.();
      } else {
        window.requestAnimationFrame(runOpen);
        schedule(opts.onAfterOpen, resolveDuration(opts, 'open'), state, 'openTimer');
      }
      controller.isOpen = true;
    }

    function finalizeClose(sheetEl, opts) {
      if (state.activeSheet === sheetEl) {
        state.activeSheet = null;
      }
      if (!state.activeSheet) {
        state.overlay.classList.add(state.hiddenClass);
      }
      opts.onAfterClose?.();
    }

    function close(options = {}) {
      const opts = {
        ...defaults,
        ...options,
      };
      const overlayEl = state.overlay;
      if (!overlayEl) {
        return;
      }
      clearTimers();

      const sheetHiddenClass = opts.sheetHiddenClass || 'translate-y-full';
      const sheetVisibleClass = opts.sheetVisibleClass || '';
      const immediate = Boolean(opts.immediate);

      opts.onBeforeClose?.();

      if (sheetVisibleClass) {
        sheet.classList.remove(sheetVisibleClass);
      }
      sheet.classList.add(sheetHiddenClass);
      overlayEl.classList.remove(state.overlayVisibleClass);
      overlayEl.classList.add(state.overlayHiddenClass);

      if (immediate) {
        finalizeClose(sheet, opts);
      } else {
        schedule(() => finalizeClose(sheet, opts), resolveDuration(opts, 'close'), state, 'closeTimer');
      }
      controller.isOpen = false;
    }

    function toggle(options = {}) {
      if (controller.isOpen) {
        close(options);
      } else {
        open(options);
      }
    }

    const controller = {
      open,
      close,
      toggle,
      get overlay() {
        return state.overlay;
      },
      get sheet() {
        return sheet;
      },
      isOpen: false,
    };

    if (config.closeOnOverlayClick && state.overlay) {
      state.overlay.addEventListener('click', () => {
        close();
      });
    }

    return controller;
  }

  window.bottomSheetManager = {
    create: createController,
  };
})();
