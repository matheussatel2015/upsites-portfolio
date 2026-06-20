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

  /* ---- elementos DOM ---- */
  var elLogin    = document.getElementById('login');
  var elApp      = document.getElementById('app');
  var elForm     = document.getElementById('loginForm');
  var elUser     = document.getElementById('user');
  var elPass     = document.getElementById('pass');
  var elLoginErr = document.getElementById('loginErr');
  var elLogout   = document.getElementById('logout');

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

  init();
})();
