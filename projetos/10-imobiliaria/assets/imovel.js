/* Lar & Co. — página de detalhe do imóvel */
(function(){
  var DADOS = window.IMOVEIS || [];
  var WA = "5541996739803";
  var app = document.getElementById('app');

  function brl(n){ return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}); }
  function fmtPreco(im){ return im.finalidade==='aluguel' ? brl(im.preco)+' <small>/mês</small>' : brl(im.preco); }
  var ic = {
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>'
  };

  var id = new URLSearchParams(location.search).get('id');
  var im = DADOS.filter(function(x){return x.id===id})[0];

  // menu mobile (sempre)
  var burger=document.getElementById('burger'), menu=document.getElementById('menu');
  burger&&burger.addEventListener('click',function(){ menu.classList.toggle('open'); });

  if(!im){
    app.innerHTML='<div class="notfound"><div class="big">🏚️</div><h1>Imóvel não encontrado</h1><p class="muted">O imóvel que você procura pode ter sido vendido ou removido.</p><p style="margin-top:20px"><a class="btn btn--emerald" href="index.html">Ver imóveis disponíveis</a></p></div>';
    return;
  }

  document.title = im.titulo + ' — Lar & Co. Imóveis';
  var fotos = im.fotos && im.fotos.length ? im.fotos : [];

  function specItem(v,k){ return '<div class="item"><span class="v">'+v+'</span><span class="k">'+k+'</span></div>'; }

  var specsHTML = ''+
    specItem(im.area+'m²','Área') +
    specItem(im.quartos,'Quartos') +
    (im.suites>0?specItem(im.suites,'Suítes'):'') +
    specItem(im.banheiros,'Banheiros') +
    specItem(im.vagas,'Vagas');

  var featsHTML = (im.caracteristicas||[]).map(function(c){ return '<li>'+ic.check+' '+c+'</li>'; }).join('');

  var taxas = [];
  if(im.condominio) taxas.push('Condomínio '+brl(im.condominio));
  if(im.iptu) taxas.push('IPTU '+brl(im.iptu));
  var taxasHTML = taxas.length ? '<div class="taxas">'+taxas.join(' · ')+'</div>' : '';

  var waMsg = encodeURIComponent('Olá! Tenho interesse no imóvel "'+im.titulo+'" ('+im.bairro+'). Poderia me passar mais informações?');

  var galHTML = '<div class="gallery">'+
    '<div class="main" id="galMain"><img id="galMainImg" src="'+(fotos[0]||'')+'" alt="'+im.titulo+'" onerror="this.style.opacity=0"></div>'+
    '<div class="side">'+
      '<div class="thumb"><img src="'+(fotos[1]||fotos[0]||'')+'" alt="" onerror="this.style.opacity=0"></div>'+
      '<div class="thumb"><img src="'+(fotos[2]||fotos[0]||'')+'" alt="" onerror="this.style.opacity=0"></div>'+
    '</div></div>';
  var thumbsHTML = fotos.length>1 ? '<div class="thumbs" id="thumbs">'+fotos.map(function(f,i){
      return '<button class="'+(i===0?'active':'')+'" data-i="'+i+'"><img src="'+f+'" alt="Foto '+(i+1)+'" onerror="this.style.opacity=0"></button>';
    }).join('')+'</div>' : '';

  app.innerHTML =
    '<div class="crumb"><a href="index.html">Imóveis</a> › <a href="index.html?fin='+im.finalidade+'">'+(im.finalidade==='venda'?'Comprar':'Alugar')+'</a> › '+im.bairro+'</div>'+
    galHTML + thumbsHTML +
    '<div class="detalhe-grid">'+
      '<div>'+
        '<div class="det-head"><div class="badges"><span class="badge fin">'+(im.finalidade==='venda'?'Venda':'Aluguel')+'</span>'+
          '<span class="badge">'+im.tipo+'</span>'+(im.destaque?'<span class="badge dest">Destaque</span>':'')+'</div>'+
          '<h1>'+im.titulo+'</h1>'+
          '<div class="loc">'+ic.pin+' '+im.bairro+' · '+im.cidade+'</div></div>'+
        '<div class="det-specs">'+specsHTML+'</div>'+
        '<div class="det-block"><h2>Sobre o imóvel</h2><p>'+im.descricao+'</p></div>'+
        (featsHTML?'<div class="det-block"><h2>Características</h2><ul class="feat-list">'+featsHTML+'</ul></div>':'')+
      '</div>'+
      '<aside>'+
        '<div class="contact-card">'+
          '<div class="preco">'+fmtPreco(im)+'</div>'+taxasHTML+
          '<a class="btn btn--wa btn--block" style="margin-bottom:10px" href="https://wa.me/'+WA+'?text='+waMsg+'" target="_blank" rel="noopener">Falar no WhatsApp</a>'+
          '<form id="lead" novalidate>'+
            '<div class="hp"><label>Não preencha<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'+
            '<div class="field"><label for="nome">Nome</label><input id="nome" type="text" required><span class="msg">Informe seu nome.</span></div>'+
            '<div class="field"><label for="tel">Telefone</label><input id="tel" type="tel" required placeholder="(00) 00000-0000"><span class="msg">Telefone inválido.</span></div>'+
            '<div class="field"><label for="msg">Mensagem</label><textarea id="msg" rows="3">Tenho interesse neste imóvel. Aguardo contato.</textarea></div>'+
            '<button type="submit" class="btn btn--emerald btn--block">Tenho interesse</button>'+
          '</form>'+
          '<div class="form-ok" id="ok">✓ Recebemos seu interesse! Um corretor entrará em contato em breve.</div>'+
        '</div>'+
      '</aside>'+
    '</div>'+
    '<div id="similar"></div>';

  // galeria: troca de imagem
  var mainImg=document.getElementById('galMainImg');
  var cur=0;
  function setMain(i){ cur=i; mainImg.src=fotos[i]; mainImg.style.opacity=1;
    var btns=document.querySelectorAll('#thumbs button'); btns.forEach(function(b){ b.classList.toggle('active', +b.dataset.i===i); }); }
  var thumbs=document.getElementById('thumbs');
  thumbs&&thumbs.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) setMain(+b.dataset.i); });
  document.querySelectorAll('.gallery .side .thumb').forEach(function(t,idx){ t.style.cursor='pointer'; t.addEventListener('click',function(){ setMain(Math.min(idx+1,fotos.length-1)); }); });

  // lightbox
  var lb=document.getElementById('lightbox'), lbImg=document.getElementById('lbImg');
  function openLb(){ lbImg.src=fotos[cur]; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
  function closeLb(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); }
  function step(d){ cur=(cur+d+fotos.length)%fotos.length; lbImg.src=fotos[cur]; setMain(cur); }
  document.getElementById('galMain').addEventListener('click',openLb);
  document.getElementById('lbClose').addEventListener('click',closeLb);
  document.getElementById('lbPrev').addEventListener('click',function(){step(-1)});
  document.getElementById('lbNext').addEventListener('click',function(){step(1)});
  lb.addEventListener('click',function(e){ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown',function(e){ if(!lb.classList.contains('open'))return; if(e.key==='Escape')closeLb(); if(e.key==='ArrowLeft')step(-1); if(e.key==='ArrowRight')step(1); });

  // máscara tel + form
  var tel=document.getElementById('tel');
  tel.addEventListener('input',function(){
    var v=this.value.replace(/\D/g,'').slice(0,11);
    if(v.length>6)v=v.replace(/(\d{2})(\d{5})(\d{0,4}).*/,'($1) $2-$3');
    else if(v.length>2)v=v.replace(/(\d{2})(\d{0,5})/,'($1) $2');
    else if(v.length>0)v=v.replace(/(\d{0,2})/,'($1');
    this.value=v;
  });
  var f=document.getElementById('lead');
  f.addEventListener('submit',function(e){
    e.preventDefault(); if(f.website.value) return; var ok=true;
    function chk(el,cond){ el.closest('.field').classList.toggle('err',!cond); if(!cond)ok=false; }
    chk(document.getElementById('nome'), document.getElementById('nome').value.trim().length>1);
    chk(tel, tel.value.replace(/\D/g,'').length>=10);
    if(ok){ f.style.display='none'; document.getElementById('ok').classList.add('show'); }
  });

  // imóveis semelhantes
  var sim = DADOS.filter(function(x){ return x.id!==im.id && x.finalidade===im.finalidade && (x.tipo===im.tipo || x.bairro===im.bairro); }).slice(0,3);
  if(sim.length){
    document.getElementById('similar').innerHTML = '<div class="similar"><h2>Imóveis semelhantes</h2><div class="grid">'+
      sim.map(function(s){
        return '<a class="card" href="imovel.html?id='+encodeURIComponent(s.id)+'">'+
          '<div class="ph"><div class="badges"><span class="badge fin">'+(s.finalidade==='venda'?'Venda':'Aluguel')+'</span></div>'+
          '<img src="'+s.fotos[0]+'" alt="'+s.titulo+'" loading="lazy" onerror="this.style.opacity=0"></div>'+
          '<div class="bd"><div class="preco">'+fmtPreco(s)+'</div><h3>'+s.titulo+'</h3>'+
          '<div class="loc">'+ic.pin+' '+s.bairro+'</div></div></a>';
      }).join('')+'</div></div>';
  }
})();
