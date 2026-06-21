/* ============================================================
   Lar & Co. Imóveis — Store (fonte única da verdade)
   ------------------------------------------------------------
   Mescla o SEED versionado (window.IMOVEIS, vindo de data/imoveis.js)
   com um OVERLAY de edições salvo no localStorage. As páginas
   públicas e o admin leem tudo por aqui.

   Funciona no navegador (window.Store) e no Node (module.exports),
   para permitir testes da lógica pura com `node --test`.
   ============================================================ */
(function () {
  'use strict';

  var OVERLAY_KEY = 'larco_admin_overlay_v1';
  var QUOTA_BYTES = 5 * 1024 * 1024; // ~5 MB típico do localStorage

  // ---------------- helpers de ambiente ----------------
  function seed() {
    return (typeof window !== 'undefined' && window.IMOVEIS) ? window.IMOVEIS : [];
  }
  function ls() {
    return (typeof localStorage !== 'undefined') ? localStorage : null;
  }
  function emptyOverlay() {
    return { version: 1, updated: {}, created: [], deleted: [] };
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  // ---------------- lógica pura ----------------
  function slugify(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')   // não-alfanumérico vira hífen
      .replace(/^-+|-+$/g, '');      // tira hífens das pontas
  }

  function ensureUniqueId(base, existingIds) {
    var ex = existingIds || [];
    if (ex.indexOf(base) < 0) return base;
    var n = 2;
    while (ex.indexOf(base + '-' + n) >= 0) n++;
    return base + '-' + n;
  }

  function mergeData(seedList, overlay) {
    var o = overlay || emptyOverlay();
    var deleted = o.deleted || [];
    var updated = o.updated || {};
    var out = [];
    (seedList || []).forEach(function (im) {
      if (deleted.indexOf(im.id) >= 0) return;            // ocultar removidos
      out.push(updated[im.id] ? updated[im.id] : im);     // aplicar edições
    });
    (o.created || []).forEach(function (im) {
      if (deleted.indexOf(im.id) >= 0) return;
      out.push(im);
    });
    return out;
  }

  function serializeImoveisJs(list) {
    var header = '/* ============================================================\n' +
      '   Lar & Co. Imóveis — base de dados dos imóveis\n' +
      '   ------------------------------------------------------------\n' +
      '   Gerado pelo painel admin. Para publicar: substitua este arquivo,\n' +
      '   copie as fotos para fotos/<slug>/ e faça commit.\n' +
      '   ============================================================ */\n';
    return header + 'window.IMOVEIS = ' + JSON.stringify(list || [], null, 2) + ';\n';
  }

  var NUM_FIELDS = ['preco', 'condominio', 'iptu', 'quartos', 'suites', 'banheiros', 'vagas', 'area'];

  function validateImovel(im, existingIds) {
    im = im || {};
    var errors = {};
    if (!im.titulo || !String(im.titulo).trim()) errors.titulo = 'Informe o título.';
    if (im.finalidade !== 'venda' && im.finalidade !== 'aluguel') errors.finalidade = 'Selecione venda ou aluguel.';
    if (!im.tipo || !String(im.tipo).trim()) errors.tipo = 'Informe o tipo.';
    if (!im.bairro || !String(im.bairro).trim()) errors.bairro = 'Informe o bairro.';
    if (im.preco === undefined || im.preco === null || im.preco === '' || +im.preco < 0 || isNaN(+im.preco)) {
      errors.preco = 'Preço inválido.';
    }
    NUM_FIELDS.forEach(function (f) {
      if (f === 'preco') return;
      if (im[f] !== undefined && im[f] !== null && im[f] !== '' && (isNaN(+im[f]) || +im[f] < 0)) {
        errors[f] = 'Valor inválido.';
      }
    });
    if (im.id && (existingIds || []).indexOf(im.id) >= 0) errors.id = 'Já existe um imóvel com este id.';
    if (!im.fotos || !im.fotos.length) errors.fotos = 'Adicione ao menos uma foto.';
    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function validateBackup(obj) {
    return !!obj && obj.version === 1 &&
      typeof obj.updated === 'object' && obj.updated !== null && !Array.isArray(obj.updated) &&
      Array.isArray(obj.created) && Array.isArray(obj.deleted);
  }

  // ---------------- camada de storage ----------------
  function loadOverlay() {
    var store = ls();
    if (!store) return emptyOverlay();
    try {
      var raw = store.getItem(OVERLAY_KEY);
      if (!raw) return emptyOverlay();
      var o = JSON.parse(raw);
      return validateBackup(o) ? o : emptyOverlay();
    } catch (e) {
      return emptyOverlay(); // overlay corrompido → ignora, usa só o seed
    }
  }

  function saveOverlay(o) {
    var store = ls();
    if (!store) throw new Error('Armazenamento local indisponível.');
    try {
      store.setItem(OVERLAY_KEY, JSON.stringify(o)); // quota: setItem falha sem corromper o valor anterior
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
        throw new Error('Espaço do navegador esgotado. Remova fotos ou imóveis e tente de novo.');
      }
      throw e;
    }
  }

  function seedIds() { return seed().map(function (i) { return i.id; }); }

  function getAll() { return mergeData(seed(), loadOverlay()); }

  function getById(id) {
    var found = getAll().filter(function (i) { return i.id === id; })[0];
    return found || null;
  }

  function upsert(im) {
    var o = loadOverlay();
    var sIds = seedIds();
    // se estava marcado como removido, ressuscita
    o.deleted = (o.deleted || []).filter(function (d) { return d !== im.id; });
    if (sIds.indexOf(im.id) >= 0) {
      o.updated[im.id] = im;
    } else {
      var idx = o.created.findIndex(function (c) { return c.id === im.id; });
      if (idx >= 0) o.created[idx] = im; else o.created.push(im);
    }
    saveOverlay(o);
    return im;
  }

  function remove(id) {
    var o = loadOverlay();
    if (o.updated[id]) delete o.updated[id];
    var idx = o.created.findIndex(function (c) { return c.id === id; });
    if (idx >= 0) {
      o.created.splice(idx, 1); // item criado: some de vez
    } else if ((o.deleted || []).indexOf(id) < 0) {
      o.deleted.push(id); // item do seed: tombstone
    }
    saveOverlay(o);
  }

  function resetOverlay() {
    var store = ls();
    if (store) store.removeItem(OVERLAY_KEY);
  }

  function hasOverlay() {
    var o = loadOverlay();
    return Object.keys(o.updated || {}).length > 0 || (o.created || []).length > 0 || (o.deleted || []).length > 0;
  }

  function usage() {
    var store = ls();
    var raw = (store && store.getItem(OVERLAY_KEY)) || '';
    var bytes = raw.length;
    return { bytes: bytes, pct: Math.round((bytes / QUOTA_BYTES) * 1000) / 10 };
  }

  function exportData() { return serializeImoveisJs(getAll()); }

  function exportBackup() { return JSON.stringify(loadOverlay(), null, 2); }

  function importBackup(json) {
    var o = typeof json === 'string' ? JSON.parse(json) : json;
    if (!validateBackup(o)) throw new Error('Backup inválido.');
    saveOverlay(o);
    return true;
  }

  // ---------------- API pública ----------------
  var API = {
    // pura
    slugify: slugify,
    ensureUniqueId: ensureUniqueId,
    mergeData: mergeData,
    serializeImoveisJs: serializeImoveisJs,
    validateImovel: validateImovel,
    validateBackup: validateBackup,
    // storage / dados
    getAll: getAll,
    getById: getById,
    upsert: upsert,
    remove: remove,
    resetOverlay: resetOverlay,
    hasOverlay: hasOverlay,
    usage: usage,
    exportData: exportData,
    exportBackup: exportBackup,
    importBackup: importBackup,
    // util
    seedIds: seedIds,
    _OVERLAY_KEY: OVERLAY_KEY,
  };

  if (typeof window !== 'undefined') window.Store = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
