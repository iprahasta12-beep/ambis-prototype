(function () {
  const STORAGE_KEYS = {
    name: 'ambis:user-name',
    brand: 'ambis:brand-name',
    legacyBrand: 'ambis:company-name',
  };

  function normaliseInput(value) {
    return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  }

  function storeLoginData(name, company) {
    const normalisedName = normaliseInput(name);
    const normalisedCompany = normaliseInput(company);

    try {
      localStorage.setItem(STORAGE_KEYS.name, normalisedName);
      localStorage.setItem(STORAGE_KEYS.brand, normalisedCompany);
      localStorage.setItem(STORAGE_KEYS.legacyBrand, normalisedCompany);
    } catch (error) {
      /* Ignore storage errors (e.g., private mode) */
    }

    if (window.AMBIS && typeof window.AMBIS.setBrandName === 'function') {
      try {
        window.AMBIS.setBrandName(normalisedCompany);
      } catch (error) {
        /* Ignore brand name sync errors */
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const nameInput = form.querySelector('#inputNama');
    const companyInput = form.querySelector('#inputPerusahaan');

    const nameValue = nameInput ? nameInput.value : '';
    const companyValue = companyInput ? companyInput.value : '';

    storeLoginData(nameValue, companyValue);

    window.location.href = 'dashboard.html';
  }

  function initialise() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise);
  } else {
    initialise();
  }
})();
