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

  /* ---- renderForm — formulário CRUD (Task 6b) ---- */
  function renderForm(im) {
    if (!elView) return;

    var isEdit = !!im;
    var headTxt = isEdit ? 'Editar imóvel' : 'Novo imóvel';

    /* tags (características) — lista em memória, sincronizada com o DOM */
    var tagsArr = (isEdit && im.caracteristicas) ? im.caracteristicas.slice() : [];

    /* ---- monta HTML ---- */
    elView.innerHTML =
      /* cabeçalho */
      '<div class="form-head">' +
        '<h1>' + headTxt + '</h1>' +
      '</div>' +

      /* ===== Identificação ===== */
      '<div class="card">' +
        '<h3>Identificação</h3>' +
        '<div class="grid2">' +
          '<div class="field" id="fld-titulo">' +
            '<label for="fi-titulo">Título</label>' +
            '<input type="text" id="fi-titulo" value="' + (isEdit ? escAttr(im.titulo) : '') + '" autocomplete="off">' +
            '<span class="msg" id="msg-titulo"></span>' +
          '</div>' +
          '<div class="field" id="fld-id">' +
            '<label for="fi-id">ID (slug)</label>' +
            '<input type="text" id="fi-id" value="' + (isEdit ? escAttr(im.id) : '') + '" autocomplete="off"' + (isEdit ? ' disabled' : '') + '>' +
            '<span class="msg" id="msg-id"></span>' +
          '</div>' +
        '</div>' +
        '<div class="grid3">' +
          '<div class="field" id="fld-finalidade">' +
            '<label for="fi-finalidade">Finalidade</label>' +
            '<select id="fi-finalidade">' +
              '<option value="venda"' + (!isEdit || im.finalidade === 'venda' ? ' selected' : '') + '>Venda</option>' +
              '<option value="aluguel"' + (isEdit && im.finalidade === 'aluguel' ? ' selected' : '') + '>Aluguel</option>' +
            '</select>' +
            '<span class="msg" id="msg-finalidade"></span>' +
          '</div>' +
          '<div class="field" id="fld-tipo">' +
            '<label for="fi-tipo">Tipo</label>' +
            '<input type="text" id="fi-tipo" value="' + (isEdit ? escAttr(im.tipo) : '') + '" autocomplete="off">' +
            '<span class="msg" id="msg-tipo"></span>' +
          '</div>' +
          '<div class="field" id="fld-bairro">' +
            '<label for="fi-bairro">Bairro</label>' +
            '<input type="text" id="fi-bairro" value="' + (isEdit ? escAttr(im.bairro) : '') + '" autocomplete="off">' +
            '<span class="msg" id="msg-bairro"></span>' +
          '</div>' +
        '</div>' +
        '<div class="grid2">' +
          '<div class="field" id="fld-cidade">' +
            '<label for="fi-cidade">Cidade</label>' +
            '<input type="text" id="fi-cidade" value="' + (isEdit ? escAttr(im.cidade) : '') + '" autocomplete="off">' +
            '<span class="msg" id="msg-cidade"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ===== Valores ===== */
      '<div class="card">' +
        '<h3>Valores</h3>' +
        '<div class="grid3">' +
          '<div class="field" id="fld-preco">' +
            '<label for="fi-preco">Preço (R$)</label>' +
            '<input type="number" id="fi-preco" min="0" step="1" value="' + (isEdit ? im.preco : '') + '">' +
            '<span class="msg" id="msg-preco"></span>' +
          '</div>' +
          '<div class="field" id="fld-condominio">' +
            '<label for="fi-condominio">Condomínio (R$)</label>' +
            '<input type="number" id="fi-condominio" min="0" step="1" value="' + (isEdit ? im.condominio : '') + '">' +
            '<span class="msg" id="msg-condominio"></span>' +
          '</div>' +
          '<div class="field" id="fld-iptu">' +
            '<label for="fi-iptu">IPTU (R$)</label>' +
            '<input type="number" id="fi-iptu" min="0" step="1" value="' + (isEdit ? im.iptu : '') + '">' +
            '<span class="msg" id="msg-iptu"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ===== Números ===== */
      '<div class="card">' +
        '<h3>Detalhes</h3>' +
        '<div class="grid3">' +
          '<div class="field" id="fld-quartos">' +
            '<label for="fi-quartos">Quartos</label>' +
            '<input type="number" id="fi-quartos" min="0" step="1" value="' + (isEdit ? im.quartos : '') + '">' +
            '<span class="msg" id="msg-quartos"></span>' +
          '</div>' +
          '<div class="field" id="fld-suites">' +
            '<label for="fi-suites">Suítes</label>' +
            '<input type="number" id="fi-suites" min="0" step="1" value="' + (isEdit ? im.suites : '') + '">' +
            '<span class="msg" id="msg-suites"></span>' +
          '</div>' +
          '<div class="field" id="fld-banheiros">' +
            '<label for="fi-banheiros">Banheiros</label>' +
            '<input type="number" id="fi-banheiros" min="0" step="1" value="' + (isEdit ? im.banheiros : '') + '">' +
            '<span class="msg" id="msg-banheiros"></span>' +
          '</div>' +
          '<div class="field" id="fld-vagas">' +
            '<label for="fi-vagas">Vagas</label>' +
            '<input type="number" id="fi-vagas" min="0" step="1" value="' + (isEdit ? im.vagas : '') + '">' +
            '<span class="msg" id="msg-vagas"></span>' +
          '</div>' +
          '<div class="field" id="fld-area">' +
            '<label for="fi-area">Área (m²)</label>' +
            '<input type="number" id="fi-area" min="0" step="1" value="' + (isEdit ? im.area : '') + '">' +
            '<span class="msg" id="msg-area"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ===== Destaque ===== */
      '<div class="card">' +
        '<h3>Destaque</h3>' +
        '<label class="check">' +
          '<input type="checkbox" id="fi-destaque"' + (isEdit && im.destaque ? ' checked' : '') + '>' +
          'Exibir como imóvel em destaque' +
        '</label>' +
      '</div>' +

      /* ===== Textos ===== */
      '<div class="card">' +
        '<h3>Textos</h3>' +
        '<div class="field" id="fld-resumo">' +
          '<label for="fi-resumo">Resumo</label>' +
          '<input type="text" id="fi-resumo" value="' + (isEdit ? escAttr(im.resumo) : '') + '" autocomplete="off">' +
          '<span class="msg" id="msg-resumo"></span>' +
        '</div>' +
        '<div class="field" id="fld-descricao">' +
          '<label for="fi-descricao">Descrição</label>' +
          '<textarea id="fi-descricao">' + (isEdit ? escHtml(im.descricao) : '') + '</textarea>' +
          '<span class="msg" id="msg-descricao"></span>' +
        '</div>' +
      '</div>' +

      /* ===== Características (tags) ===== */
      '<div class="card">' +
        '<h3>Características</h3>' +
        '<div class="field" id="fld-caracteristicas">' +
          '<div class="tags" id="tagsContainer"></div>' +
          '<div class="tag-add">' +
            '<input type="text" id="tagInput" placeholder="Nova característica…" autocomplete="off">' +
            '<button class="btn btn--ghost btn--sm" id="btnAddTag">Adicionar</button>' +
          '</div>' +
          '<span class="msg" id="msg-caracteristicas"></span>' +
        '</div>' +
      '</div>' +

      /* ===== Fotos — placeholder Task 7 ===== */
      '<div class="card">' +
        '<h3>Fotos</h3>' +
        '<!-- Task 7: upload de fotos -->' +
        '<p style="color:var(--muted);font-size:.88rem">O upload de fotos será implementado na Task 7.</p>' +
      '</div>' +

      /* ===== Ações ===== */
      '<div class="form-actions">' +
        '<button class="btn btn--ghost" id="btnCancelarForm">Cancelar</button>' +
        '<button class="btn btn--emerald" id="btnSalvarForm">Salvar imóvel</button>' +
      '</div>';

    /* ---- renderiza chips de tags ---- */
    function renderTags() {
      var container = document.getElementById('tagsContainer');
      if (!container) return;
      container.innerHTML = '';
      tagsArr.forEach(function (tag, idx) {
        var chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.innerHTML = escHtml(tag) + '<button type="button" aria-label="Remover ' + escAttr(tag) + '">✕</button>';
        chip.querySelector('button').addEventListener('click', function () {
          tagsArr.splice(idx, 1);
          renderTags();
        });
        container.appendChild(chip);
      });
    }
    renderTags();

    /* ---- auto-slug a partir do título (somente no modo CREATE) ---- */
    if (!isEdit) {
      document.getElementById('fi-titulo').addEventListener('input', function () {
        if (!window.Store) return;
        var slug = window.Store.slugify(this.value);
        var existingIds = window.Store.getAll().map(function (i) { return i.id; });
        var unique = window.Store.ensureUniqueId(slug, existingIds);
        document.getElementById('fi-id').value = unique;
      });
    }

    /* ---- Adicionar tag (botão + Enter) ---- */
    function addTag() {
      var inp = document.getElementById('tagInput');
      if (!inp) return;
      var val = inp.value.trim();
      if (!val) return;
      tagsArr.push(val);
      inp.value = '';
      renderTags();
    }
    document.getElementById('btnAddTag').addEventListener('click', addTag);
    document.getElementById('tagInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    });

    /* ---- Cancelar ---- */
    document.getElementById('btnCancelarForm').addEventListener('click', renderDashboard);

    /* ---- Salvar ---- */
    document.getElementById('btnSalvarForm').addEventListener('click', function () {
      /* 1. Coleta campos */
      var obj = {
        id:             document.getElementById('fi-id').value.trim(),
        titulo:         document.getElementById('fi-titulo').value.trim(),
        finalidade:     document.getElementById('fi-finalidade').value,
        tipo:           document.getElementById('fi-tipo').value.trim(),
        bairro:         document.getElementById('fi-bairro').value.trim(),
        cidade:         document.getElementById('fi-cidade').value.trim(),
        preco:          Number(document.getElementById('fi-preco').value),
        condominio:     Number(document.getElementById('fi-condominio').value),
        iptu:           Number(document.getElementById('fi-iptu').value),
        quartos:        Number(document.getElementById('fi-quartos').value),
        suites:         Number(document.getElementById('fi-suites').value),
        banheiros:      Number(document.getElementById('fi-banheiros').value),
        vagas:          Number(document.getElementById('fi-vagas').value),
        area:           Number(document.getElementById('fi-area').value),
        destaque:       document.getElementById('fi-destaque').checked,
        resumo:         document.getElementById('fi-resumo').value.trim(),
        descricao:      document.getElementById('fi-descricao').value.trim(),
        caracteristicas: tagsArr.slice(),
        fotos:          isEdit ? im.fotos.slice() : []
      };

      /* 2. Calcula existingIds — no edit remove o id atual para não auto-conflitar */
      var existingIds = window.Store ? window.Store.getAll().map(function (i) { return i.id; }) : [];
      if (isEdit) {
        existingIds = existingIds.filter(function (x) { return x !== im.id; });
      }

      /* 3. Valida */
      if (!window.Store) { toast('Store não disponível', true); return; }
      var result = window.Store.validateImovel(obj, existingIds);

      /* limpa erros anteriores */
      var fieldEls = elView.querySelectorAll('.field');
      for (var fi = 0; fi < fieldEls.length; fi++) {
        fieldEls[fi].classList.remove('err');
      }
      var msgEls = elView.querySelectorAll('.msg');
      for (var mi = 0; mi < msgEls.length; mi++) {
        msgEls[mi].textContent = '';
      }

      if (!result.ok) {
        var firstField = null;
        var errorKeys = Object.keys(result.errors);
        for (var ei = 0; ei < errorKeys.length; ei++) {
          var key = errorKeys[ei];
          var fldEl = document.getElementById('fld-' + key);
          var msgEl = document.getElementById('msg-' + key);
          if (fldEl) {
            fldEl.classList.add('err');
            if (!firstField) firstField = fldEl;
          }
          if (msgEl) {
            msgEl.textContent = result.errors[key];
          }
        }
        if (firstField) {
          var inp = firstField.querySelector('input, select, textarea');
          if (inp) inp.focus();
        }
        toast('Corrija os erros antes de salvar.', true);
        return;
      }

      /* 4. Persiste e volta ao dashboard */
      window.Store.upsert(obj);
      toast('Imóvel salvo');
      renderDashboard();
    });
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
