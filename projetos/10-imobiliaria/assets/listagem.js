/* Lar & Co. — listagem + filtros */
(function(){
  var DADOS = window.IMOVEIS || [];
  var state = { fin:"", q:"", tipo:"", bairro:"", quartos:0, preco:0, sort:"destaque" };

  // ícones
  var ic = {
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    bed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18V8h18v10M3 14h18M7 8V6h10v2"/></svg>',
    bath:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0"/></svg>',
    car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 13l2-5h14l2 5v5h-3v-2H6v2H3zM6 16h.01M18 16h.01"/></svg>',
    area:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v16H4zM4 9h5M15 4v5M4 15h5M15 15v5"/></svg>'
  };

  function brl(n){ return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}); }
  function fmtPreco(im){ return im.finalidade==='aluguel' ? brl(im.preco)+' <small>/mês</small>' : brl(im.preco); }

  // popula selects
  function uniq(key){ return DADOS.map(function(i){return i[key]}).filter(function(v,i,a){return a.indexOf(v)===i}).sort(); }
  function fillSelect(id,vals){
    var s=document.getElementById(id);
    vals.forEach(function(v){ var o=document.createElement('option'); o.value=v; o.textContent=v; s.appendChild(o); });
  }
  fillSelect('tipo', uniq('tipo'));
  fillSelect('bairro', uniq('bairro'));

  function precoThresholds(fin){
    if(fin==='aluguel') return [1500,2000,2500,3000,4000,5000];
    return [500000,800000,1000000,1500000,2000000,3000000];
  }
  function updatePrecoOptions(){
    var s=document.getElementById('preco'); var cur=s.value;
    s.innerHTML='<option value="0">Sem limite</option>';
    precoThresholds(state.fin).forEach(function(v){ var o=document.createElement('option'); o.value=v; o.textContent='Até '+brl(v); s.appendChild(o); });
    s.value = cur && Array.prototype.some.call(s.options,function(o){return o.value===cur}) ? cur : '0';
    state.preco = +s.value;
  }
  updatePrecoOptions();

  function cardHTML(im){
    return '<a class="card" href="imovel.html?id='+encodeURIComponent(im.id)+'">'+
      '<div class="ph"><div class="badges"><span class="badge fin">'+(im.finalidade==='venda'?'Venda':'Aluguel')+'</span>'+
      (im.destaque?'<span class="badge dest">Destaque</span>':'')+'</div>'+
      '<img src="'+im.fotos[0]+'" alt="'+im.titulo+'" loading="lazy" onerror="this.style.opacity=0"></div>'+
      '<div class="bd"><div class="preco">'+fmtPreco(im)+'</div><h3>'+im.titulo+'</h3>'+
      '<div class="loc">'+ic.pin+' '+im.bairro+' · '+im.cidade+'</div>'+
      '<div class="specs">'+
        '<span class="s">'+ic.bed+' '+im.quartos+' q</span>'+
        '<span class="s">'+ic.bath+' '+im.banheiros+'</span>'+
        '<span class="s">'+ic.car+' '+im.vagas+'</span>'+
        '<span class="s">'+ic.area+' '+im.area+'m²</span>'+
      '</div></div></a>';
  }

  function aplicar(){
    var r = DADOS.filter(function(im){
      if(state.fin && im.finalidade!==state.fin) return false;
      if(state.tipo && im.tipo!==state.tipo) return false;
      if(state.bairro && im.bairro!==state.bairro) return false;
      if(state.quartos && im.quartos < state.quartos) return false;
      if(state.preco && im.preco > state.preco) return false;
      if(state.q){
        var hay=(im.titulo+' '+im.bairro+' '+im.tipo+' '+im.resumo+' '+im.cidade).toLowerCase();
        if(hay.indexOf(state.q.toLowerCase())<0) return false;
      }
      return true;
    });
    r.sort(function(a,b){
      if(state.sort==='menor') return a.preco-b.preco;
      if(state.sort==='maior') return b.preco-a.preco;
      if(state.sort==='area') return b.area-a.area;
      return (b.destaque?1:0)-(a.destaque?1:0); // destaques primeiro
    });
    var grid=document.getElementById('grid');
    var count=document.getElementById('count');
    if(r.length===0){
      grid.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="big">🔎</div><h3>Nenhum imóvel encontrado</h3><p>Tente ajustar os filtros ou limpar a busca.</p></div>';
    } else {
      grid.innerHTML = r.map(cardHTML).join('');
    }
    count.textContent = r.length+(r.length===1?' imóvel':' imóveis');
  }

  // bind filtros
  function setFin(fin){
    state.fin=fin;
    Array.prototype.forEach.call(document.querySelectorAll('#finTabs button'),function(b){ b.classList.toggle('active', b.dataset.fin===fin); });
    updatePrecoOptions();
    aplicar();
  }
  document.querySelectorAll('#finTabs button').forEach(function(b){ b.addEventListener('click',function(){ setFin(b.dataset.fin); }); });
  document.getElementById('q').addEventListener('input',function(){ state.q=this.value; aplicar(); });
  document.getElementById('tipo').addEventListener('change',function(){ state.tipo=this.value; aplicar(); });
  document.getElementById('bairro').addEventListener('change',function(){ state.bairro=this.value; aplicar(); });
  document.getElementById('quartos').addEventListener('change',function(){ state.quartos=+this.value; aplicar(); });
  document.getElementById('preco').addEventListener('change',function(){ state.preco=+this.value; aplicar(); });
  document.getElementById('sort').addEventListener('change',function(){ state.sort=this.value; aplicar(); });

  // links Comprar/Alugar (nav + rodapé)
  document.querySelectorAll('[data-fin]').forEach(function(el){
    if(el.closest('#finTabs')) return;
    el.addEventListener('click',function(e){
      e.preventDefault(); setFin(el.dataset.fin);
      document.getElementById('imoveis').scrollIntoView({behavior:'smooth'});
      var menu=document.getElementById('menu'); menu&&menu.classList.remove('open');
    });
  });

  // menu mobile
  var burger=document.getElementById('burger'), menu=document.getElementById('menu');
  burger&&burger.addEventListener('click',function(){ menu.classList.toggle('open'); });

  // pré-filtro via URL (?fin=venda)
  var p=new URLSearchParams(location.search);
  if(p.get('fin')) setFin(p.get('fin')); else aplicar();
})();
