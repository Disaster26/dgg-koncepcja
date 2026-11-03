(function(){
  var b=document.getElementById('burger'),n=document.getElementById('nav');
  function close(){n.classList.remove('open');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Otwórz menu')}
  b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu')});
  n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  document.addEventListener('click',function(e){if(n.classList.contains('open')&&!n.contains(e.target)&&!b.contains(e.target))close()});

  // dolny pasek na telefonie: dopiero po przewinięciu za główny przycisk, chowany przy formularzu
  var mob=document.getElementById('mob'),cta=document.getElementById('heroCta'),kontakt=document.getElementById('kontakt');
  if(mob&&cta&&'IntersectionObserver' in window){
    document.body.classList.add('has-mob');
    var past=false,inK=false;
    function upd(){mob.classList.toggle('widac',past&&!inK)}
    new IntersectionObserver(function(e){past=!e[0].isIntersecting&&e[0].boundingClientRect.top<0;upd()}).observe(cta);
    if(kontakt)new IntersectionObserver(function(e){inK=e[0].isIntersecting;upd()},{threshold:.1}).observe(kontakt);
  }

  // formularz: lista wolnych mieszkań + komunikat podglądu
  var sel=document.getElementById('f-lokal');
  if(sel&&window.LOKALE){
    window.LOKALE.filter(function(l){return l.s!=='s'}).sort(function(a,b){return a.e-b.e||a.n-b.n}).forEach(function(l){
      var o=document.createElement('option');o.value='A'+l.e+'/'+l.n;
      o.textContent='A'+l.e+'/'+l.n+' · '+l.k+' pok. · '+String(l.m).replace('.',',')+' m²'+(l.s==='r'?' (rezerwacja)':'');
      sel.appendChild(o);
    });
    window.ustawLokal=function(v){sel.value=v;var t=document.getElementById('f-wiad');if(t&&!t.value)t.value='Proszę o informacje o mieszkaniu '+v+' i możliwym terminie oglądania.'};
    var q=new URLSearchParams(location.search).get('lokal');if(q)window.ustawLokal(q);
  }
  var f=document.getElementById('form'),m=document.getElementById('formMsg');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();m.hidden=false;m.scrollIntoView({block:'nearest',behavior:'smooth'})});
})();
