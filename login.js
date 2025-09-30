(function () {
  const REQUIRED_MESSAGE = 'Field ini wajib diisi';
  const INVALID_MESSAGE = 'Nama atau perusahaan tidak ditemukan';

  const allowedCredentials = [
    { name: 'Ramero Carlo', company: 'PT Sarana Pancing Indonesia' },
    { name: 'Nadia Putri', company: 'PT Sarana Pancing Indonesia' },
    { name: 'Samuel Tan', company: 'PT Sarana Pancing Indonesia' },
    { name: 'Amelia Hartono', company: 'PT Bank Amar Indonesia' },
  ];

  function normalise(value) {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function setFieldError(input, errorEl, message) {
    if (!errorEl || !input) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
      input.classList.remove('is-invalid');
      input.setAttribute('aria-invalid', 'false');
    }
  }

  function setLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent || 'Masuk';
      }
      button.textContent = 'Memproses...';
      button.disabled = true;
      button.classList.add('is-loading');
    } else {
      const original = button.dataset.originalText || 'Masuk';
      button.textContent = original;
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  }

  function storeLoginData(name, company) {
    try {
      if (name) localStorage.setItem('ambis:user-name', name);
      if (company) localStorage.setItem('ambis:company-name', company);
    } catch (error) {
      /* Ignore storage errors (e.g., private mode) */
    }

    if (window.AMBIS && typeof window.AMBIS.setBrandName === 'function') {
      try {
        window.AMBIS.setBrandName(company);
      } catch (error) {
        /* Ignore brand name sync errors */
      }
    }
  }

  function showFormError(errorEl, message) {
    if (!errorEl) return;
    errorEl.textContent = message || '';
    if (message) {
      errorEl.classList.add('is-visible');
    } else {
      errorEl.classList.remove('is-visible');
    }
  }

  function validateField(input, errorEl) {
    if (!input || !errorEl) return false;
    const value = input.value.trim();
    if (!value) {
      setFieldError(input, errorEl, REQUIRED_MESSAGE);
      return false;
    }
    setFieldError(input, errorEl, '');
    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const nameInput = form.querySelector('#inputNama');
    const companyInput = form.querySelector('#inputPerusahaan');
    const submitButton = form.querySelector('#loginButton');
    const formError = document.getElementById('formError');

    showFormError(formError, '');

    const isNameValid = validateField(nameInput, document.getElementById('errorNama'));
    const isCompanyValid = validateField(companyInput, document.getElementById('errorPerusahaan'));

    if (!isNameValid || !isCompanyValid) {
      return;
    }

    const nameValue = nameInput.value.trim();
    const companyValue = companyInput.value.trim();

    setLoading(submitButton, true);

    window.setTimeout(() => {
      const nameKey = normalise(nameValue);
      const companyKey = normalise(companyValue);
      const isAllowed = allowedCredentials.some((cred) => {
        return normalise(cred.name) === nameKey && normalise(cred.company) === companyKey;
      });

      if (isAllowed) {
        storeLoginData(nameValue, companyValue);
        window.location.href = 'dashboard.html';
        return;
      }

      setLoading(submitButton, false);
      showFormError(formError, INVALID_MESSAGE);
      companyInput.focus();
    }, 600);
  }

  function handleInput(event) {
    const input = event.target;
    const errorId = input.getAttribute('aria-describedby');
    if (!errorId) return;
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;

    if (input.value.trim()) {
      setFieldError(input, errorEl, '');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
    form.addEventListener('input', handleInput, true);
  });
})();
