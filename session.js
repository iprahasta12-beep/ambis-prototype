(function () {
  const STORAGE_KEYS = {
    name: 'ambis:user-name',
    brand: 'ambis:brand-name',
    legacyBrand: 'ambis:company-name',
  };

  function safeGet(key) {
    try {
      return localStorage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      /* Ignore storage errors */
    }
  }

  function redirectToLogin() {
    window.location.replace('index.html');
  }

  function computeInitials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  function updateNodeText(node, value) {
    if (!node) return;
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      node.value = value;
      return;
    }
    node.textContent = value;
  }

  function syncBrandWithAmbis(brandName) {
    if (!brandName) return;
    const ambis = window.AMBIS;
    if (!ambis) return;

    try {
      if (typeof ambis.setBrandName === 'function') {
        ambis.setBrandName(brandName);
      } else if (typeof ambis.updateBrandName === 'function') {
        ambis.updateBrandName(brandName);
      }
    } catch (error) {
      /* Ignore sync errors */
    }
  }

  function attachLogoutHandlers(clearSession) {
    document.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('[data-logout-button]') : null;
      if (!button) return;
      event.preventDefault();
      clearSession();
      redirectToLogin();
    });
  }

  function initialiseSession() {
    const storedName = safeGet(STORAGE_KEYS.name).trim();
    let storedBrand = safeGet(STORAGE_KEYS.brand).trim();
    if (!storedBrand) {
      storedBrand = safeGet(STORAGE_KEYS.legacyBrand).trim();
    }

    if (!storedName || !storedBrand) {
      redirectToLogin();
      return;
    }

    document.documentElement.dataset.ambisUserName = storedName;
    document.documentElement.dataset.ambisBrandName = storedBrand;

    const initials = computeInitials(storedName);

    function clearSession() {
      safeRemove(STORAGE_KEYS.name);
      safeRemove(STORAGE_KEYS.brand);
      safeRemove(STORAGE_KEYS.legacyBrand);
    }

    updateDisplays({ name: storedName, brand: storedBrand, initials });
    syncBrandWithAmbis(storedBrand);
    attachLogoutHandlers(clearSession);

    window.AMBIS_SESSION = {
      userName: storedName,
      brandName: storedBrand,
      initials,
      clear: clearSession,
    };
  }

  function updateDisplays({ name, brand, initials }) {
    const nameTargets = document.querySelectorAll('[data-user-name]');
    nameTargets.forEach((node) => updateNodeText(node, name));

    const brandTargets = document.querySelectorAll('[data-brand-name]');
    brandTargets.forEach((node) => updateNodeText(node, brand));

    const initialTargets = document.querySelectorAll('[data-user-initials]');
    initialTargets.forEach((node) => updateNodeText(node, initials));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseSession);
  } else {
    initialiseSession();
  }
})();
