/* ============================================================
   Lar & Co. Imóveis — Admin JS
   ------------------------------------------------------------
   Task 5: login, sessão e logout.
   Task 6a: dashboard — tabela, badges, busca, uso, restaurar/excluir.
   Tasks 7-8 ampliarão este módulo (form CRUD, fotos, export).
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
  var elView     = null;
  var elToast    = null;

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

  /* ---- toast ---- */
  var toastTimer = null;
  function toast(msg, isErr) {
    if (!elToast) return;
    elToast.textContent = msg;
    if (isErr) {
      elToast.classList.add('err');
    } else {
      elToast.classList.remove('err');
    }
    elToast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      elToast.hidden = true;
    }, 2500);
  }

  /* ---- formatação de preço BRL ---- */
  var brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });

  /* ---- computar status badge ---- */
  function computeStatus(item) {
    var seedList = (typeof window !== 'undefined' && window.IMOVEIS) ? window.IMOVEIS : [];
    var seedIds = seedList.map(function (s) { return s.id; });
    if (seedIds.indexOf(item.id) < 0) {
      return { label: 'Novo', cls: 'novo' };
    }
    var seedEntry = null;
    for (var i = 0; i < seedList.length; i++) {
      if (seedList[i].id === item.id) { seedEntry = seedList[i]; break; }
    }
    if (JSON.stringify(item) !== JSON.stringify(seedEntry)) {
      return { label: 'Editado', cls: 'editado' };
    }
    return { label: 'Seed', cls: 'seed' };
  }

  /* ---- exportar imoveis.js (stub — Task 8) ---- */
  function exportImoveis() {
    toast('Exportação chega na Task 8');
  }

  /* ---- renderForm stub — substituído na Task 7 ---- */
  function renderForm(im) {
    if (!elView) return;
    var titulo = im ? 'Editar imóvel' : 'Novo imóvel';
    elView.innerHTML =
      '<div class="form-head">' +
        '<h1>' + titulo + '</h1>' +
      '</div>' +
      '<div class="card">' +
        '<p style="color:var(--muted);margin-bottom:18px">O formulário completo será implementado na Task 7.</p>' +
        '<button class="btn btn--ghost btn--sm" id="btnVoltarForm">← Voltar</button>' +
      '</div>';
    document.getElementById('btnVoltarForm').addEventListener('click', renderDashboard);
  }

  /* ---- renderizar linha da tabela ---- */
  function buildRow(item) {
    var status = computeStatus(item);
    var thumbHtml;
    if (item.fotos && item.fotos.length) {
      thumbHtml = '<img class="thumb" src="' + item.fotos[0] + '" alt="" loading="lazy">';
    } else {
      thumbHtml = '<div class="thumb" aria-hidden="true" style="background:var(--surface-2);width:54px;height:40px;border-radius:8px;"></div>';
    }
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + thumbHtml + '</td>' +
      '<td><strong>' + escHtml(item.titulo) + '</strong></td>' +
      '<td><span class="badge fin">' + escHtml(item.finalidade) + '</span></td>' +
      '<td class="hide-sm">' + escHtml(item.tipo) + '</td>' +
      '<td class="hide-sm">' + escHtml(item.bairro) + '</td>' +
      '<td>' + brl.format(item.preco) + '</td>' +
      '<td><span class="badge ' + status.cls + '">' + status.label + '</span></td>' +
      '<td><div class="row-actions">' +
        '<button class="icon-btn" data-action="edit" data-id="' + escAttr(item.id) + '">✏ Editar</button>' +
        '<button class="icon-btn del" data-action="del" data-id="' + escAttr(item.id) + '">✕ Excluir</button>' +
      '</div></td>';
    return tr;
  }

  /* ---- escape helpers ---- */
  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escAttr(s) { return escHtml(s); }

  /* ---- filtrar e re-renderizar tbody ---- */
  function filterRows(tbody, items, query) {
    var q = (query || '').toLowerCase().trim();
    tbody.innerHTML = '';
    var filtered = items.filter(function (im) {
      if (!q) return true;
      return (im.titulo || '').toLowerCase().indexOf(q) >= 0 ||
             (im.bairro || '').toLowerCase().indexOf(q) >= 0 ||
             (im.tipo  || '').toLowerCase().indexOf(q) >= 0;
    });
    if (!filtered.length) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="8" style="text-align:center;padding:30px;color:var(--muted)">Nenhum imóvel encontrado.</td>';
      tbody.appendChild(tr);
    } else {
      filtered.forEach(function (item) {
        tbody.appendChild(buildRow(item));
      });
    }
  }

  /* ---- dashboard principal ---- */
  function renderDashboard() {
    if (!elView) return;

    var items = window.Store ? window.Store.getAll() : [];
    var usageInfo = window.Store ? window.Store.usage() : { bytes: 0, pct: 0 };

    /* -- empty state -- */
    if (!items.length) {
      elView.innerHTML =
        '<div class="dash-head"><h1>Imóveis</h1></div>' +
        '<div class="empty">' +
          '<div class="big">🏠</div>' +
          '<p>Nenhum imóvel cadastrado ainda.</p>' +
          '<br>' +
          '<button class="btn btn--emerald" id="btnNovoEmpty">+ Novo imóvel</button>' +
        '</div>';
      document.getElementById('btnNovoEmpty').addEventListener('click', function () { renderForm(); });
      return;
    }

    /* -- estrutura completa -- */
    elView.innerHTML =
      /* cabeçalho */
      '<div class="dash-head">' +
        '<div><h1>Imóveis</h1><div class="sub">' + items.length + ' imóve' + (items.length === 1 ? 'l' : 'is') + ' no catálogo</div></div>' +
      '</div>' +

      /* toolbar */
      '<div class="toolbar">' +
        '<div class="search"><input type="search" id="searchBox" placeholder="Buscar por título, bairro ou tipo…" autocomplete="off"></div>' +
        '<button class="btn btn--emerald btn--sm" id="btnNovo">+ Novo imóvel</button>' +
        '<button class="btn btn--ghost btn--sm" id="btnExport">Exportar imoveis.js</button>' +
        '<button class="btn btn--ghost btn--sm" id="btnRestore">Restaurar seed</button>' +
      '</div>' +

      /* barra de uso */
      '<div class="usage">' +
        '<div class="bar' + (usageInfo.pct >= 80 ? ' warn' : '') + '">' +
          '<span style="width:' + Math.min(usageInfo.pct, 100) + '%"></span>' +
        '</div>' +
        '<span>' + usageInfo.bytes.toLocaleString('pt-BR') + ' bytes usados (' + usageInfo.pct + '%)</span>' +
      '</div>' +

      /* tabela */
      '<div class="tablewrap">' +
        '<table class="imoveis">' +
          '<thead><tr>' +
            '<th>Foto</th>' +
            '<th>Título</th>' +
            '<th>Finalidade</th>' +
            '<th class="hide-sm">Tipo</th>' +
            '<th class="hide-sm">Bairro</th>' +
            '<th>Preço</th>' +
            '<th>Status</th>' +
            '<th>Ações</th>' +
          '</tr></thead>' +
          '<tbody id="imoveisTbody"></tbody>' +
        '</table>' +
      '</div>';

    var tbody = document.getElementById('imoveisTbody');
    filterRows(tbody, items, '');

    /* -- eventos -- */
    document.getElementById('btnNovo').addEventListener('click', function () { renderForm(); });

    document.getElementById('btnExport').addEventListener('click', exportImoveis);

    document.getElementById('btnRestore').addEventListener('click', function () {
      if (!window.Store) return;
      if (!window.Store.hasOverlay()) {
        toast('Nenhuma alteração local para restaurar.');
        return;
      }
      if (confirm('Restaurar o seed original? Todas as edições locais serão apagadas.')) {
        window.Store.resetOverlay();
        toast('Seed restaurado com sucesso.');
        renderDashboard();
      }
    });

    document.getElementById('searchBox').addEventListener('input', function (e) {
      filterRows(tbody, items, e.target.value);
    });

    /* delegação de eventos na tabela */
    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var id = btn.getAttribute('data-id');
      if (action === 'edit') {
        var item = window.Store ? window.Store.getById(id) : null;
        if (item) renderForm(item);
      } else if (action === 'del') {
        if (confirm('Excluir este imóvel? Esta ação não pode ser desfeita.')) {
          if (window.Store) window.Store.remove(id);
          toast('Imóvel removido.');
          renderDashboard();
        }
      }
    });
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
      renderDashboard();
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
    elView     = document.getElementById('view');
    elToast    = document.getElementById('toast');

    elForm.addEventListener('submit', handleLogin);
    elLogout.addEventListener('click', handleLogout);

    if (sessionActive()) {
      showApp();
      renderDashboard();
    }
  }

  /* ---- API pública (extensível pelas tasks seguintes) ---- */
  var Admin = {
    showApp:         showApp,
    showLogin:       showLogin,
    SESSION_KEY:     SESSION_KEY,
    renderDashboard: renderDashboard,
    renderForm:      renderForm,
    toast:           toast,
  };

  window.Admin = Admin;

  /* Run init immediately if the DOM is already ready, otherwise wait. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
