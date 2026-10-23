(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* header shrink + progress bar + parallax */
  var header = $('.header'), bar = $('.progress'), px = $$('[data-parallax]'), ticking = false;
  function onScroll(){
    var y = window.scrollY || 0;
    if(header) header.classList.toggle('scrolled', y > 12);
    if(bar){var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';}
    if(!reduce) px.forEach(function(el){ var r = el.parentElement.getBoundingClientRect(); if(r.bottom > 0 && r.top < innerHeight){ el.style.transform = 'translate3d(0,' + (-r.top * 0.28).toFixed(1) + 'px,0)'; } });
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  /* mobile menu */
  var burger = $('.burger');
  if(burger){
    burger.addEventListener('click', function(){
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.mnav').setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && document.body.classList.contains('menu-open')) burger.click(); });
  }

  /* reveal on scroll: only elements below the fold start hidden */
  var reveals = $$('.reveal');
  if(!reduce && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(function(el){ if(el.getBoundingClientRect().top > innerHeight * 0.92){ el.classList.add('pre'); io.observe(el); } });
  }

  /* counters */
  function fmt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function countUp(el){
    var to = +el.getAttribute('data-count'), t0 = null, dur = 1600;
    function step(t){ if(!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if(p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if(!reduce && 'IntersectionObserver' in window){
    var co = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); co.unobserve(e.target); } }); }, {threshold:0.5});
    counters.forEach(function(el){ if(el.getBoundingClientRect().top > innerHeight * 0.9){ el.textContent = '0'; co.observe(el); } });
  }

  /* hero: slides + weight indicator */
  var slides = $$('.hero .slide'), dots = $$('.dots button'), cur = 0, timer = null;
  var valEl = $('.ind-digits .val'), leds = $$('.ind-leds span'), cells = $$('.ind-cells i'), lbl = $('.ind-scale');
  var loads = [
    {kg:48260, scale:'18.00 × 3.20 m'},
    {kg:31540, scale:'24.00 × 3.20 m'},
    {kg:12880, scale:'12.00 × 3.20 m'}
  ];
  function led(name, on){ leds.forEach(function(s){ if(s.getAttribute('data-led') === name) s.classList.toggle('lit', on); }); }
  var weighRun = 0;
  function weigh(i){
    if(!valEl) return;
    var run = ++weighRun, target = loads[i % loads.length];
    if(lbl) lbl.textContent = target.scale;
    if(reduce){ valEl.textContent = fmt(target.kg); led('estable', true); return; }
    led('estable', false); led('cero', true); valEl.textContent = '0';
    cells.forEach(function(c){ c.style.setProperty('--h', '6%'); });
    setTimeout(function(){
      if(run !== weighRun) return;
      led('cero', false);
      var t0 = null, dur = 2200;
      function step(t){
        if(run !== weighRun) return;
        if(!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 4);
        var wobble = p < 1 ? Math.sin(p * 22) * (1 - p) * 0.035 : 0;
        var v = Math.max(0, Math.round(target.kg * (e + wobble) / 10) * 10);
        valEl.textContent = fmt(v);
        cells.forEach(function(c, k){ c.style.setProperty('--h', Math.round((e * (55 + ((k * 37) % 40))) ) + '%'); });
        if(p < 1) requestAnimationFrame(step); else led('estable', true);
      }
      requestAnimationFrame(step);
    }, 500);
  }
  function show(i){
    if(!slides.length) return;
    cur = (i + slides.length) % slides.length;
    slides.forEach(function(s, k){ s.classList.toggle('on', k === cur); });
    dots.forEach(function(d, k){ d.classList.remove('on'); void d.offsetWidth; d.classList.toggle('on', k === cur); d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    weigh(cur);
  }
  function auto(){ clearInterval(timer); if(!reduce) timer = setInterval(function(){ show(cur + 1); }, 7000); }
  if(slides.length){
    dots.forEach(function(d, k){ d.addEventListener('click', function(){ show(k); auto(); }); });
    show(0); auto();
  }

  /* servicios sub-nav highlight */
  var subLinks = $$('.subnav a');
  if(subLinks.length && 'IntersectionObserver' in window){
    var so = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ subLinks.forEach(function(a){ var on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('on', on); if(on && a.scrollIntoView){ var w = a.parentElement; w.scrollTo({left: a.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth'}); } }); } });
    }, {rootMargin:'-45% 0px -50% 0px'});
    $$('.svc').forEach(function(s){ so.observe(s); });
  }

  /* proyectos: filter + lightbox */
  var gal = $('.gallery');
  if(gal){
    var items = $$('button', gal), fbtns = $$('.filters button');
    fbtns.forEach(function(b){
      b.addEventListener('click', function(){
        var f = b.getAttribute('data-f');
        fbtns.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function(it){
          var show = f === 'all' || it.getAttribute('data-cat') === f;
          if(show){ it.hidden = false; requestAnimationFrame(function(){ it.classList.remove('out'); }); }
          else { it.classList.add('out'); setTimeout(function(){ if(it.classList.contains('out')) it.hidden = true; }, reduce ? 0 : 340); }
        });
      });
    });
    var lb = $('.lb'), lbImg = $('.lb img'), lbCap = $('.lb-bar p'), lbCount = $('.lb-bar small'), idx = 0, lastFocus = null;
    function visible(){ return items.filter(function(it){ return !it.hidden && !it.classList.contains('out'); }); }
    function openLb(it){
      var list = visible(); idx = list.indexOf(it); if(idx < 0) idx = 0;
      lastFocus = document.activeElement; render(); lb.hidden = false;
      requestAnimationFrame(function(){ lb.classList.add('open'); }); $('.lb-close').focus();
      document.body.style.overflow = 'hidden';
    }
    function render(){
      var list = visible(), it = list[idx], img = $('img', it);
      lbImg.src = img.getAttribute('src'); lbImg.alt = img.alt;
      lbCap.textContent = it.getAttribute('data-title');
      lbCount.textContent = it.getAttribute('data-catname') + ' · ' + (idx + 1) + ' / ' + list.length;
    }
    function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function(){ lb.hidden = true; }, 300); if(lastFocus) lastFocus.focus(); }
    function move(d){ var n = visible().length; idx = (idx + d + n) % n; render(); }
    items.forEach(function(it){ it.addEventListener('click', function(){ openLb(it); }); });
    $('.lb-close').addEventListener('click', closeLb);
    $('.lb-prev').addEventListener('click', function(){ move(-1); });
    $('.lb-next').addEventListener('click', function(){ move(1); });
    lb.addEventListener('click', function(e){ if(e.target === lb || e.target.tagName === 'FIGURE') closeLb(); });
    document.addEventListener('keydown', function(e){
      if(lb.hidden) return;
      if(e.key === 'Escape') closeLb(); else if(e.key === 'ArrowRight') move(1); else if(e.key === 'ArrowLeft') move(-1);
    });
  }

  /* copy buttons */
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var txt = b.getAttribute('data-copy'), label = b.textContent;
      function ok(){ b.textContent = 'Copiado'; b.classList.add('done'); setTimeout(function(){ b.textContent = label; b.classList.remove('done'); }, 1600); }
      try{ navigator.clipboard.writeText(txt).then(ok, function(){ selectNear(b); }); }catch(err){ selectNear(b); }
    });
  });
  function selectNear(b){ var t = b.previousElementSibling; if(!t) return; var r = document.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  /* contact form -> WhatsApp message */
  var form = $('#cform');
  if(form){
    var fields = ['nombre','telefono','correo','mensaje'];
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var okAll = true;
      fields.forEach(function(id){
        var el = $('#' + id), wrap = el.closest('.field'), msg = $('.msg', wrap), v = el.value.trim(), err = '';
        if(id === 'correo'){ if(v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Revise el correo: falta @ o el dominio.'; }
        else if(id === 'telefono'){ if(!v) err = 'Indique un teléfono para devolverle la llamada.'; }
        else if(!v) err = id === 'nombre' ? 'Escriba su nombre.' : 'Cuéntenos qué necesita.';
        wrap.classList.toggle('err', !!err); msg.textContent = err; if(err && okAll){ okAll = false; el.focus(); }
      });
      if(!okAll) return;
      var g = function(id){ return $('#' + id).value.trim(); };
      var text = 'Hola JD Ingeniería & Proyectos, quisiera una cotización.\n\n' +
        'Nombre: ' + g('nombre') + '\n' + (g('empresa') ? 'Empresa: ' + g('empresa') + '\n' : '') +
        'Teléfono: ' + g('telefono') + '\n' + (g('correo') ? 'Correo: ' + g('correo') + '\n' : '') +
        'Servicio: ' + g('servicio') + '\n\n' + g('mensaje');
      var res = $('#cresult');
      $('#wa-link').href = 'https://wa.me/51963745670?text=' + encodeURIComponent(text);
      $('#copy-msg').setAttribute('data-copy', text);
      $('#msg-preview').textContent = text;
      res.hidden = false; res.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'nearest'});
    });
  }
})();
