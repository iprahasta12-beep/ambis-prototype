const DEFAULT_DURATION = 30;
const DEFAULT_COUNTDOWN_MESSAGE = 'Sesi akan berakhir dalam';
const DEFAULT_EXPIRED_MESSAGE = 'Kode OTP kedaluwarsa. Silakan kirim ulang kode untuk melanjutkan.';

function resolveElement(target) {
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target || null;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function createOtpFlow(config = {}) {
  const {
    container = null,
    inputs: inputList = null,
    inputsSelector = '.otp-input',
    requestButton = null,
    resendButton = null,
    submitButton = null,
    countdownElement = null,
    countdownMessageElement = null,
    timerElement = null,
    errorElement = null,
    duration = DEFAULT_DURATION,
    countdownMessage = DEFAULT_COUNTDOWN_MESSAGE,
    expiredMessage = DEFAULT_EXPIRED_MESSAGE,
    autoSubmit = false,
    onRequest = null,
    onResend = null,
    onValidate = null,
    onSuccess = null,
    onError = null,
    onExpire = null,
    onChange = null,
  } = config;

  const scope = container ? resolveElement(container) : document;
  const inputs = Array.isArray(inputList) && inputList.length
    ? inputList.map(resolveElement)
    : Array.from(scope.querySelectorAll(inputsSelector));

  const requestBtn = resolveElement(requestButton);
  const resendBtn = resolveElement(resendButton);
  const submitBtn = resolveElement(submitButton);
  const countdownEl = resolveElement(countdownElement);
  const countdownMsgEl = resolveElement(countdownMessageElement);
  const timerEl = resolveElement(timerElement);
  const errorEl = resolveElement(errorElement);

  if (!inputs.length) {
    throw new Error('createOtpFlow requires at least one input element.');
  }

  let intervalId = null;
  let timeLeft = duration;
  let locked = false;
  let destroyed = false;

  const defaultCountdownMessage = countdownMsgEl?.textContent?.trim() || countdownMessage;

  function setTimerText(value) {
    if (timerEl) {
      timerEl.textContent = formatTime(value);
    }
  }

  function showCountdownMessage(message) {
    if (countdownEl) {
      countdownEl.classList.toggle('hidden', !message);
    }
    if (countdownMsgEl) {
      countdownMsgEl.textContent = message || '';
    }
  }

  function setError(message) {
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    } else {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  function setResendVisible(visible) {
    if (!resendBtn) return;
    resendBtn.classList.toggle('hidden', !visible);
    resendBtn.disabled = !visible;
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function expire() {
    stopTimer();
    showCountdownMessage(expiredMessage);
    if (timerEl) {
      timerEl.classList.add('hidden');
    }
    setResendVisible(true);
    locked = true;
    if (typeof onExpire === 'function') {
      onExpire();
    }
  }

  function startTimer() {
    stopTimer();
    locked = false;
    timeLeft = duration;
    setTimerText(timeLeft);
    if (timerEl) {
      timerEl.classList.remove('hidden');
    }
    showCountdownMessage(defaultCountdownMessage);
    setResendVisible(false);
    intervalId = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        expire();
        return;
      }
      setTimerText(timeLeft);
    }, 1000);
  }

  function clearInputs() {
    inputs.forEach((input) => {
      input.value = '';
    });
  }

  function focusFirstInput() {
    const first = inputs.find((input) => input && !input.disabled);
    if (first) {
      first.focus();
      first.select?.();
    }
  }

  function getValue() {
    return inputs.map((input) => (input.value || '').trim()).join('');
  }

  function updateSubmitState() {
    const value = getValue();
    const filled = value.length === inputs.length;
    if (submitBtn) {
      submitBtn.disabled = !filled;
    }
    if (typeof onChange === 'function') {
      onChange({ value, filled });
    }
    if (autoSubmit && filled) {
      submit();
    }
  }

  function handleInput(event) {
    const input = event.target;
    const value = input.value.replace(/\D+/g, '');
    input.value = value.slice(-1);

    const index = inputs.indexOf(input);
    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
      inputs[index + 1].select?.();
    }
    updateSubmitState();
  }

  function handleKeyDown(event) {
    const input = event.target;
    const index = inputs.indexOf(input);
    if (event.key === 'Backspace' && !input.value && index > 0) {
      inputs[index - 1].focus();
      inputs[index - 1].select?.();
    }
  }

  function attachInputHandlers() {
    inputs.forEach((input) => {
      input.addEventListener('input', handleInput);
      input.addEventListener('keydown', handleKeyDown);
      input.addEventListener('focus', () => input.select?.());
    });
  }

  function detachInputHandlers() {
    inputs.forEach((input) => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('keydown', handleKeyDown);
    });
  }

  async function requestOtp(triggerType) {
    if (locked) return;
    setError('');
    clearInputs();
    focusFirstInput();

    const handler = triggerType === 'resend' ? onResend : onRequest;
    if (typeof handler === 'function') {
      try {
        await handler();
      } catch (error) {
        setError(error?.message || 'Gagal meminta kode OTP.');
        return;
      }
    }

    startTimer();
  }

  async function submit() {
    if (locked) {
      setError(expiredMessage);
      if (typeof onError === 'function') {
        onError(new Error('expired'), getValue());
      }
      return false;
    }

    const value = getValue();
    if (value.length < inputs.length) {
      const error = new Error('Masukkan kode OTP lengkap.');
      setError(error.message);
      if (typeof onError === 'function') {
        onError(error, value);
      }
      return false;
    }

    if (typeof onValidate === 'function') {
      try {
        const result = await onValidate(value);
        if (result === false) {
          throw new Error('Kode OTP tidak valid.');
        }
        if (typeof onSuccess === 'function') {
          onSuccess(value, result);
        }
        return true;
      } catch (error) {
        setError(error?.message || 'Kode OTP tidak valid.');
        if (typeof onError === 'function') {
          onError(error, value);
        }
        return false;
      }
    }

    if (typeof onSuccess === 'function') {
      onSuccess(value);
    }
    return true;
  }

  function destroy() {
    destroyed = true;
    stopTimer();
    detachInputHandlers();
    requestBtn?.removeEventListener('click', requestClickHandler);
    resendBtn?.removeEventListener('click', resendClickHandler);
    submitBtn?.removeEventListener('click', submitClickHandler);
  }

  const requestClickHandler = (event) => {
    event.preventDefault();
    requestOtp('request');
  };
  const resendClickHandler = (event) => {
    event.preventDefault();
    requestOtp('resend');
  };
  const submitClickHandler = async (event) => {
    event.preventDefault();
    await submit();
  };

  attachInputHandlers();
  updateSubmitState();

  if (requestBtn) requestBtn.addEventListener('click', requestClickHandler);
  if (resendBtn) resendBtn.addEventListener('click', resendClickHandler);
  if (submitBtn) submitBtn.addEventListener('click', submitClickHandler);

  return {
    start: () => requestOtp('request'),
    resend: () => requestOtp('resend'),
    submit,
    stop: stopTimer,
    reset: () => {
      stopTimer();
      clearInputs();
      setError('');
      setResendVisible(false);
      if (timerEl) timerEl.classList.add('hidden');
      if (countdownEl) countdownEl.classList.add('hidden');
    },
    getValue,
    focus: focusFirstInput,
    setError,
    destroy,
    isDestroyed: () => destroyed,
  };
}

export default {
  createOtpFlow,
};
