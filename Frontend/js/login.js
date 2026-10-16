/**
 * login.js — Lógica del módulo de Login
 * Inventarios Mahoraga · Frontend
 *
 * Funcionalidades:
 *  - Validación en tiempo real de campos (correo y contraseña)
 *  - Toggle de visibilidad de contraseña
 *  - Simulación de autenticación (mock) con spinner
 *  - Modal de recuperación de contraseña
 *  - Sistema de notificaciones toast
 */

(function () {
  'use strict';

  // =====================================================================
  //  ELEMENTOS DEL DOM
  // =====================================================================
  const loginForm          = document.getElementById('loginForm');
  const emailInput         = document.getElementById('loginEmail');
  const passwordInput      = document.getElementById('loginPassword');
  const fieldEmail         = document.getElementById('fieldEmail');
  const fieldPassword      = document.getElementById('fieldPassword');
  const togglePasswordBtn  = document.getElementById('togglePassword');
  const iconEyeOpen        = document.getElementById('iconEyeOpen');
  const iconEyeClosed      = document.getElementById('iconEyeClosed');
  const loginSubmitBtn     = document.getElementById('loginSubmitBtn');

  // Modal — Recuperar contraseña
  const forgotLink         = document.getElementById('forgotPasswordLink');
  const modalOverlay       = document.getElementById('forgotPasswordModal');
  const closeModalBtn      = document.getElementById('closeModal');
  const cancelModalBtn     = document.getElementById('cancelModal');
  const forgotForm         = document.getElementById('forgotForm');
  const recoverEmailInput  = document.getElementById('recoverEmail');
  const fieldRecoverEmail  = document.getElementById('fieldRecoverEmail');

  // Toast
  const toast              = document.getElementById('loginToast');
  const toastMessage       = document.getElementById('toastMessage');
  const toastClose         = document.getElementById('toastClose');

  // =====================================================================
  //  UTILIDADES
  // =====================================================================

  /** Valida formato de correo electrónico */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Marca un campo como erróneo */
  function setFieldError(field, show) {
    if (show) {
      field.classList.add('login-field--error');
    } else {
      field.classList.remove('login-field--error');
    }
  }

  /** Muestra un toast con tipo: 'success' | 'error' | 'warning' */
  function showToast(message, type) {
    // Limpiar clases previas
    toast.classList.remove('login-toast--success', 'login-toast--error', 'login-toast--warning', 'login-toast--visible');

    toastMessage.textContent = message;
    toast.classList.add('login-toast--' + type);

    // Forzar reflow para reiniciar la animación
    void toast.offsetWidth;
    toast.classList.add('login-toast--visible');

    // Auto-cerrar a los 4 segundos
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('login-toast--visible');
    }, 4000);
  }

  function hideToast() {
    toast.classList.remove('login-toast--visible');
    clearTimeout(toast._timer);
  }

  // =====================================================================
  //  TOGGLE VISIBILIDAD DE CONTRASEÑA
  // =====================================================================
  togglePasswordBtn.addEventListener('click', function () {
    var isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    iconEyeOpen.style.display   = isPassword ? 'none'  : 'block';
    iconEyeClosed.style.display = isPassword ? 'block' : 'none';
  });

  // =====================================================================
  //  VALIDACIÓN EN TIEMPO REAL
  // =====================================================================
  emailInput.addEventListener('blur', function () {
    setFieldError(fieldEmail, emailInput.value.trim() !== '' && !isValidEmail(emailInput.value.trim()));
  });

  emailInput.addEventListener('input', function () {
    if (fieldEmail.classList.contains('login-field--error') && isValidEmail(emailInput.value.trim())) {
      setFieldError(fieldEmail, false);
    }
  });

  passwordInput.addEventListener('blur', function () {
    setFieldError(fieldPassword, passwordInput.value.length > 0 && passwordInput.value.length < 6);
  });

  passwordInput.addEventListener('input', function () {
    if (fieldPassword.classList.contains('login-field--error') && passwordInput.value.length >= 6) {
      setFieldError(fieldPassword, false);
    }
  });

  // =====================================================================
  //  SUBMIT — INICIAR SESIÓN (SIMULACIÓN / MOCK)
  // =====================================================================
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var email    = emailInput.value.trim();
    var password = passwordInput.value;

    // Validar ambos campos
    var hasErrors = false;

    if (!email || !isValidEmail(email)) {
      setFieldError(fieldEmail, true);
      hasErrors = true;
    }

    if (!password || password.length < 6) {
      setFieldError(fieldPassword, true);
      hasErrors = true;
    }

    if (hasErrors) return;

    // Poner botón en estado de carga
    loginSubmitBtn.classList.add('login-btn-primary--loading');
    loginSubmitBtn.disabled = true;

    // Simular llamada al backend (1.5s)
    setTimeout(function () {
      loginSubmitBtn.classList.remove('login-btn-primary--loading');
      loginSubmitBtn.disabled = false;

      // Mock: credenciales válidas para demostración
      // admin@mahoraga.com / admin123
      if (email === 'admin@mahoraga.com' && password === 'admin123') {
        showToast('Sesión iniciada correctamente. Redirigiendo…', 'success');
        // Simular redirección
        setTimeout(function () {
          window.location.href = 'nuevo_producto.html';
        }, 1200);
      } else {
        showToast('Credenciales incorrectas. Verifica tu correo y contraseña.', 'error');
      }
    }, 1500);
  });

  // =====================================================================
  //  MODAL — RECUPERAR CONTRASEÑA
  // =====================================================================
  function openModal() {
    modalOverlay.classList.add('login-modal-overlay--visible');
    recoverEmailInput.value = emailInput.value.trim();
    recoverEmailInput.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('login-modal-overlay--visible');
    setFieldError(fieldRecoverEmail, false);
    document.body.style.overflow = '';
  }

  forgotLink.addEventListener('click', function (e) {
    e.preventDefault();
    openModal();
  });

  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('login-modal-overlay--visible')) {
      closeModal();
    }
  });

  // Cerrar al hacer clic fuera del modal
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Submit recuperación
  forgotForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = recoverEmailInput.value.trim();

    if (!email || !isValidEmail(email)) {
      setFieldError(fieldRecoverEmail, true);
      return;
    }

    setFieldError(fieldRecoverEmail, false);
    closeModal();
    showToast('Se han enviado las instrucciones a ' + email, 'success');
  });

  recoverEmailInput.addEventListener('input', function () {
    if (fieldRecoverEmail.classList.contains('login-field--error') && isValidEmail(recoverEmailInput.value.trim())) {
      setFieldError(fieldRecoverEmail, false);
    }
  });

  // =====================================================================
  //  TOAST — CERRAR MANUAL
  // =====================================================================
  toastClose.addEventListener('click', hideToast);

})();
