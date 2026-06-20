/* ============================================================
   Lar & Co. Imóveis — Admin JS
   ------------------------------------------------------------
   Task 5: login, sessão e logout.
   Tasks 6-8 ampliarão este módulo (dashboard, CRUD, fotos, export).
   ============================================================ */
(function () {
  'use strict';

  /* ---- constantes ---- */
  var CRED_USER = 'admin';
  var CRED_PASS = 'admin';
  var SESSION_KEY = 'larco_admin_session';

  /* ---- referências DOM (preenchidas em init, após DOMContentLoaded) ---- */
  var elLogin    = null;
  var elApp      = null;
  var elForm     = null;
  var elUser     = null;
  var elPass     = null;
  var elLoginErr = null;
  var elLogout   = null;

  /* ---- helpers de sessão ---- */
  function sessionStart() {
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  function sessionEnd() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function sessionActive() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  /* ---- alternância de telas ---- */
  function showApp() {
    elLogin.hidden = true;
    elApp.hidden   = false;
  }

  function showLogin() {
    elApp.hidden   = true;
    elLogin.hidden = false;
  }

  /* ---- login ---- */
  function handleLogin(e) {
    e.preventDefault();
    // Username is trimmed to ignore accidental leading/trailing spaces;
    // password is intentionally NOT trimmed — spaces are part of the secret.
    // NOTE: credential check is client-side only (demo purposes).
    //       A real application must authenticate server-side.
    var user = elUser.value.trim();
    var pass = elPass.value;

    if (user === CRED_USER && pass === CRED_PASS) {
      elLoginErr.hidden = true;
      sessionStart();
      showApp();
      // Tasks 6-8 inicializam o dashboard aqui via Admin.initDashboard()
    } else {
      elLoginErr.hidden = false;
      elPass.value = '';
      elPass.focus();
    }
  }

  /* ---- logout ---- */
  function handleLogout() {
    sessionEnd();
    showLogin();
    elUser.value = '';
    elPass.value = '';
    elLoginErr.hidden = true;
  }

  /* ---- inicialização ---- */
  function init() {
    /* Capture DOM elements here so this works regardless of script placement
       (not just when the script tag is at end of <body>). */
    elLogin    = document.getElementById('login');
    elApp      = document.getElementById('app');
    elForm     = document.getElementById('loginForm');
    elUser     = document.getElementById('user');
    elPass     = document.getElementById('pass');
    elLoginErr = document.getElementById('loginErr');
    elLogout   = document.getElementById('logout');

    elForm.addEventListener('submit', handleLogin);
    elLogout.addEventListener('click', handleLogout);

    if (sessionActive()) {
      showApp();
      // Tasks 6-8 inicializam o dashboard aqui via Admin.initDashboard()
    }
  }

  /* ---- API pública (extensível pelas tasks seguintes) ---- */
  var Admin = {
    showApp:    showApp,
    showLogin:  showLogin,
    SESSION_KEY: SESSION_KEY,
  };

  window.Admin = Admin;

  /* Run init immediately if the DOM is already ready, otherwise wait. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
