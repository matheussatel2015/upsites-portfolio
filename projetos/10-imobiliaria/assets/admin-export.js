/* ============================================================
   Lar & Co. Imóveis — Admin Export Module
   ------------------------------------------------------------
   Task 8a: exportar imoveis.js + fotos-manifest.txt,
            exportar/importar backup JSON.
   Expõe window.AdminExport.mountToolbar(toolbarEl, opts).
   ============================================================ */
(function () {
  'use strict';

  /* ---- helper: download de Blob ---- */
  function downloadBlob(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /* ---- gerar texto do manifesto de fotos ---- */
  function buildFotosManifest(imoveis) {
    var lines = [];
    lines.push('# fotos-manifest.txt — caminhos esperados das fotos');
    lines.push('# Para publicar: copie cada arquivo para o caminho indicado.');
    lines.push('');
    imoveis.forEach(function (im) {
      if (!im.fotos || !im.fotos.length) return;
      lines.push('# ' + im.id + ' (' + im.titulo + ')');
      for (var n = 1; n <= im.fotos.length; n++) {
        lines.push('fotos/' + im.id + '/' + n + '.jpg');
      }
      lines.push('');
    });
    return lines.join('\n');
  }

  /* ---- handler: exportar imoveis.js + fotos-manifest.txt ---- */
  function handleExportData(opts) {
    if (!window.Store) {
      opts.toast('Store não disponível.', true);
      return;
    }
    try {
      var jsContent = window.Store.exportData();
      downloadBlob(jsContent, 'imoveis.js', 'text/javascript');

      var imoveis  = window.Store.getAll();
      var manifest = buildFotosManifest(imoveis);
      downloadBlob(manifest, 'fotos-manifest.txt', 'text/plain');

      opts.toast('imoveis.js e fotos-manifest.txt exportados.');
    } catch (e) {
      opts.toast('Erro na exportação: ' + e.message, true);
    }
  }

  /* ---- handler: exportar backup JSON ---- */
  function handleExportBackup(opts) {
    if (!window.Store) {
      opts.toast('Store não disponível.', true);
      return;
    }
    try {
      var json = window.Store.exportBackup();
      downloadBlob(json, 'larco-backup.json', 'application/json');
      opts.toast('Backup exportado.');
    } catch (e) {
      opts.toast('Erro ao exportar backup: ' + e.message, true);
    }
  }

  /* ---- handler: importar backup JSON ---- */
  function handleImportBackup(fileInput, opts) {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onerror = function () {
      opts.toast('Falha ao ler o arquivo.', true);
      fileInput.value = '';
    };
    reader.onload = function (evt) {
      try {
        window.Store.importBackup(evt.target.result);
        opts.toast('Backup importado.');
        opts.refresh();
      } catch (e) {
        opts.toast(e.message, true);
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  /* ---- mountToolbar: anexa botões de export ao elemento toolbar ---- */
  function mountToolbar(toolbarEl, opts) {
    if (!toolbarEl) return;

    /* --- Exportar imoveis.js --- */
    var btnExportData = document.createElement('button');
    btnExportData.type      = 'button';
    btnExportData.className = 'btn btn--ghost btn--sm';
    btnExportData.textContent = 'Exportar imoveis.js';
    btnExportData.addEventListener('click', function () {
      handleExportData(opts);
    });

    /* --- Exportar backup --- */
    var btnExportBackup = document.createElement('button');
    btnExportBackup.type      = 'button';
    btnExportBackup.className = 'btn btn--ghost btn--sm';
    btnExportBackup.textContent = 'Exportar backup';
    btnExportBackup.addEventListener('click', function () {
      handleExportBackup(opts);
    });

    /* --- Importar backup (dispara file input oculto) --- */
    var fileInput = document.createElement('input');
    fileInput.type   = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', function () {
      handleImportBackup(fileInput, opts);
    });

    var btnImportBackup = document.createElement('button');
    btnImportBackup.type      = 'button';
    btnImportBackup.className = 'btn btn--ghost btn--sm';
    btnImportBackup.textContent = 'Importar backup';
    btnImportBackup.addEventListener('click', function () {
      fileInput.click();
    });

    toolbarEl.appendChild(btnExportData);
    toolbarEl.appendChild(btnExportBackup);
    toolbarEl.appendChild(btnImportBackup);
    toolbarEl.appendChild(fileInput);
  }

  /* ---- API pública ---- */
  window.AdminExport = {
    mountToolbar:      mountToolbar,
    buildFotosManifest: buildFotosManifest,
  };
})();
