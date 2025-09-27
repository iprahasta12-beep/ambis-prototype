const OVERLAY_ID = 'ambis-ui-overlay';

let cachedOverlay = null;
let cachedClickHandler = null;
let cachedOptions = null;

function resolveOverlayElement(existing) {
  if (existing) {
    cachedOverlay = existing;
    return existing;
  }

  if (cachedOverlay && cachedOverlay.isConnected) {
    return cachedOverlay;
  }

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.35)';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'opacity 200ms ease';
  overlay.style.zIndex = '40';
  overlay.setAttribute('aria-hidden', 'true');

  cachedOverlay = overlay;
  return overlay;
}

function cleanupOverlayClick() {
  if (!cachedOverlay || !cachedClickHandler) return;
  cachedOverlay.removeEventListener('click', cachedClickHandler);
  cachedClickHandler = null;
}

export function showOverlay(options = {}) {
  const {
    onClick = null,
    className = '',
    existing = null,
    root = document.body,
    zIndex = 40,
  } = options;

  const overlay = resolveOverlayElement(existing);
  cachedOptions = { root };

  if (!overlay.isConnected) {
    root.appendChild(overlay);
  }

  overlay.style.zIndex = String(zIndex);
  overlay.style.pointerEvents = 'auto';
  overlay.setAttribute('aria-hidden', 'false');

  if (className) {
    overlay.className = className;
  }

  if (onClick) {
    cleanupOverlayClick();
    cachedClickHandler = onClick;
    overlay.addEventListener('click', cachedClickHandler);
  }

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  return overlay;
}

export function hideOverlay() {
  if (!cachedOverlay) return;

  cleanupOverlayClick();

  cachedOverlay.style.opacity = '0';
  cachedOverlay.style.pointerEvents = 'none';
  cachedOverlay.setAttribute('aria-hidden', 'true');

  const overlay = cachedOverlay;
  const { root = document.body } = cachedOptions || {};
  cachedOptions = null;

  const removeOverlay = () => {
    overlay.removeEventListener('transitionend', removeOverlay);
    if (overlay.parentElement === root) {
      root.removeChild(overlay);
    }
  };

  overlay.addEventListener('transitionend', removeOverlay);
  setTimeout(removeOverlay, 220);
}

export function getOverlayElement() {
  return cachedOverlay;
}
