function sanitiseDigit(value) {
  return value.replace(/\D/g, '').slice(0, 1);
}

function focusNext(inputs, index) {
  if (index < inputs.length - 1) {
    inputs[index + 1].focus();
  }
}

function focusPrev(inputs, index) {
  if (index > 0) {
    inputs[index - 1].focus();
  }
}

export function initOtpFlow(config = {}) {
  const {
    inputs: rawInputs,
    startButton,
    resendButton,
    submitButton,
    timerElement,
    messageElement,
    errorElement,
    duration = 300,
    autoStart = false,
    onRequest,
    onValidate,
    onSuccess,
    onError,
    onExpire,
  } = config;

  const inputs = Array.from(rawInputs || []).filter((input) => input instanceof HTMLInputElement);
  if (!inputs.length) {
    throw new Error('initOtpFlow requires at least one OTP input.');
  }

  let timerId = null;
  let remaining = duration;
  let expectedCode = null;
  let active = false;

  function getValue() {
    return inputs.map((input) => input.value.trim()).join('');
  }

  function clearInputs() {
    inputs.forEach((input) => {
      input.value = '';
    });
    inputs[0]?.focus();
    updateSubmitState();
  }

  function setError(message) {
    if (!errorElement) return;
    errorElement.textContent = message || '';
    errorElement.classList.toggle('hidden', !message);
  }

  function clearError() {
    setError('');
  }

  function updateSubmitState() {
    if (!submitButton) return;
    const complete = inputs.every((input) => input.value.trim().length === 1);
    submitButton.disabled = !complete;
    submitButton.classList.toggle('is-disabled', !complete);
  }

  function updateTimerDisplay() {
    if (!timerElement) return;
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
  }

  function setMessage(text) {
    if (!messageElement) return;
    messageElement.textContent = text || '';
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function handleExpire() {
    active = false;
    stopTimer();
    if (resendButton) {
      resendButton.disabled = false;
      resendButton.classList.remove('hidden');
    }
    setMessage('Kode verifikasi kedaluwarsa. Kirim ulang untuk melanjutkan.');
    if (typeof onExpire === 'function') {
      onExpire();
    }
  }

  function tick() {
    if (remaining <= 0) {
      handleExpire();
      return;
    }
    remaining -= 1;
    updateTimerDisplay();
  }

  async function requestOtp({ restart = false } = {}) {
    clearError();
    if (typeof onRequest === 'function') {
      try {
        const result = await onRequest({ restart });
        if (typeof result === 'string') {
          expectedCode = result;
        } else if (result && typeof result.code === 'string') {
          expectedCode = result.code;
        }
      } catch (error) {
        setError(error?.message || 'Gagal meminta kode OTP.');
        if (typeof onError === 'function') {
          onError(error);
        }
        return;
      }
    }
  }

  async function start({ restart = false } = {}) {
    clearError();
    setMessage('Kode verifikasi telah dikirim ke perangkat Anda.');
    remaining = duration;
    updateTimerDisplay();
    stopTimer();
    await requestOtp({ restart });
    active = true;
    timerId = window.setInterval(tick, 1000);
    if (resendButton) {
      resendButton.disabled = true;
      resendButton.classList.add('hidden');
    }
    if (submitButton) {
      submitButton.disabled = true;
    }
    clearInputs();
    inputs[0]?.focus();
  }

  function validate() {
    clearError();
    const value = getValue();
    if (!active) {
      setError('Kode verifikasi belum diminta.');
      return false;
    }
    if (value.length !== inputs.length) {
      setError(`Kode verifikasi harus ${inputs.length} digit.`);
      return false;
    }
    if (typeof onValidate === 'function') {
      const result = onValidate(value, { expectedCode });
      if (result === false) {
        setError('Kode verifikasi salah.');
        if (typeof onError === 'function') onError(new Error('OTP invalid'));
        return false;
      }
    } else if (expectedCode && value !== expectedCode) {
      setError('Kode verifikasi salah.');
      if (typeof onError === 'function') onError(new Error('OTP invalid'));
      return false;
    }
    if (typeof onSuccess === 'function') {
      onSuccess(value);
    }
    stopTimer();
    active = false;
    return true;
  }

  inputs.forEach((input, index) => {
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('maxlength', '1');
    input.addEventListener('input', (event) => {
      const value = sanitiseDigit(event.target.value);
      event.target.value = value;
      if (value) {
        focusNext(inputs, index);
      }
      clearError();
      updateSubmitState();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value) {
        focusPrev(inputs, index);
      }
      if (event.key === 'ArrowLeft') {
        focusPrev(inputs, index);
        event.preventDefault();
      }
      if (event.key === 'ArrowRight') {
        focusNext(inputs, index);
        event.preventDefault();
      }
    });
  });

  if (startButton) {
    startButton.addEventListener('click', () => start({ restart: false }));
  }
  if (resendButton) {
    resendButton.addEventListener('click', () => start({ restart: true }));
  }
  if (submitButton) {
    submitButton.addEventListener('click', (event) => {
      if (!validate()) {
        event.preventDefault();
      }
    });
  }

  if (autoStart) {
    start({ restart: false });
  } else {
    updateSubmitState();
  }

  return {
    start: (opts) => start({ restart: false, ...(opts || {}) }),
    resend: () => start({ restart: true }),
    validate,
    clear: clearInputs,
    getValue,
    destroy: () => {
      stopTimer();
      inputs.forEach((input) => {
        input.replaceWith(input.cloneNode(true));
      });
    },
  };
}

export default {
  initOtpFlow,
};
