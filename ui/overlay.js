const overlayRegistry = new Map();

function resolveContainer(container) {
  if (!container) {
    return document.body;
  }
  if (typeof container === 'string') {
    const el = document.querySelector(container);
    if (!el) {
      throw new Error(`Overlay container selector \"${container}\" did not match any element.`);
    }
    return el;
  }
  if (container instanceof Element) {
    return container;
  }
  throw new Error('Invalid container provided to overlay manager.');
}

function applyOverlayClasses(overlay, className, zIndex) {
  overlay.className = '';
  overlay.classList.add('ui-overlay');
  overlay.classList.add('pointer-events-none');
  overlay.classList.add('opacity-0');
  overlay.classList.add('transition-opacity');
  overlay.classList.add('duration-200');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
  overlay.style.zIndex = typeof zIndex === 'number' ? String(zIndex) : '40';
  overlay.style.pointerEvents = 'none';
  overlay.dataset.active = 'false';
  if (className) {
    className.split(/\s+/).filter(Boolean).forEach(cls => overlay.classList.add(cls));
  }
}

export function getOverlay(key, options = {}) {
  const {
    container,
    className,
    zIndex,
    clickHandler,
  } = options;
  const containerEl = resolveContainer(container);
  const overlayKey = key || containerEl;
  let entry = overlayRegistry.get(overlayKey);
  if (!entry) {
    const overlay = document.createElement('div');
    applyOverlayClasses(overlay, className, zIndex);
    overlay.addEventListener('click', (event) => {
      if (overlay.dataset.active !== 'true') return;
      if (typeof entry?.clickHandler === 'function') {
        entry.clickHandler(event);
      }
    });
    containerEl.style.position = containerEl.style.position || 'relative';
    containerEl.appendChild(overlay);
    entry = { overlay, container: containerEl, clickHandler: clickHandler || null };
    overlayRegistry.set(overlayKey, entry);
  } else if (typeof clickHandler === 'function') {
    entry.clickHandler = clickHandler;
  }
  return entry.overlay;
}

export function showOverlay(overlay) {
  if (!overlay) return;
  overlay.dataset.active = 'true';
  overlay.style.pointerEvents = 'auto';
  overlay.classList.add('opacity-100');
  overlay.classList.remove('opacity-0');
}

export function hideOverlay(overlay) {
  if (!overlay) return;
  overlay.dataset.active = 'false';
  overlay.style.pointerEvents = 'none';
  overlay.classList.remove('opacity-100');
  overlay.classList.add('opacity-0');
}

export function removeOverlay(key) {
  const entry = overlayRegistry.get(key);
  if (!entry) return;
  const { overlay, container } = entry;
  if (overlay && overlay.parentElement === container) {
    container.removeChild(overlay);
  }
  overlayRegistry.delete(key);
}

export default {
  getOverlay,
  showOverlay,
  hideOverlay,
  removeOverlay,
};
