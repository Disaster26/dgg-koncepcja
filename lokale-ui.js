(function(){
  var L=window.LOKALE||[];
  var nf0=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:0});
  var nf2=new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2});
  var nf1=new Intl.NumberFormat('pl-PL',{minimumFractionDigits:1,maximumFractionDigits:1});
  function zl(v){return (Math.round(v)===v?nf0.format(v):nf2.format(v))+' zł'}
  function m2(v){return nf1.format(v)+' m²'}
  function bud(l){return 'A'+l.e}
  function lab(l){return bud(l)+'/'+l.n}
  function pietro(f){return f===0?'parter':String(f)}
  function pietroDl(f){return f===0?'parter':f+'. piętro'}
  function pok(k){return k+(k===1?' pokój':(k<5?' pokoje':' pokoi'))}
  var ST={w:['Wolne','wolne'],r:['Rezerwacja','rez.'],s:['Sprzedane','sprz.']};
  function stHtml(s){return '<span class="st st-'+s+'"><span class="st-l">'+ST[s][0]+'</span><span class="st-s">'+ST[s][1]+'</span></span>'}
  function zew(l){return l.og?'ogródek '+l.og.replace('.',',')+' m²':(l.bk?'balkon '+l.bk+' m²'+(l.tt?' + taras na dachu '+l.tt+' m²':''):'')}
  var ico='<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg>';

  // statystyki do tekstów
  var dost=L.filter(function(l){return l.s==='w'});
  var minC=Math.min.apply(null,dost.map(function(l){return l.c}));
  document.querySelectorAll('[data-ile-wolnych]').forEach(function(e){e.textContent=dost.length});
  document.querySelectorAll('[data-ile-rez]').forEach(function(e){e.textContent=L.filter(function(l){return l.s==='r'}).length});
  document.querySelectorAll('[data-cena-od]').forEach(function(e){e.textContent=zl(minC)});

  /* ---------- okno z rzutem ---------- */
  var dlg=document.getElementById('lokal');
  function openL(l){
    if(!dlg)return;
    var rooms=(l.r||[]).map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+' m²</dd>'}).join('');
    var z=zew(l);
    dlg.innerHTML='<div class="dl">'+
      '<div class="dl-rzut">'+(l.pdf?'<img src="img/rzuty/e'+l.e+'_'+l.n+'.jpg" alt="Rzut mieszkania '+lab(l)+'" width="1100" height="660">':'<p>Rzut do uzupełnienia</p>')+'</div>'+
      '<div class="dl-in">'+
        stHtml(l.s)+
        '<h3>Mieszkanie '+l.n+', budynek '+bud(l)+'</h3>'+
        '<p class="dl-meta">Etap '+l.e+' · '+pietroDl(l.f)+' · '+pok(l.k)+' · '+m2(l.m)+'</p>'+
        '<div class="dl-price">'+zl(l.c)+'</div>'+
        '<p class="dl-pm">'+nf0.format(l.cm)+' zł/m² · najniższa cena z ostatnich 30 dni: '+zl(l.lo)+'</p>'+
        (rooms?'<p class="dl-sub">Pomieszczenia</p><dl>'+rooms+(z?'<dt>'+z.split(' ')[0].replace(/^./,function(c){return c.toUpperCase()})+'</dt><dd>'+z.split(' ').slice(1).join(' ')+'</dd>':'')+'</dl>':'')+
        '<div class="dl-act">'+
          '<a class="btn" href="#kontakt" data-pyt="'+lab(l)+'">Zapytaj o to mieszkanie</a>'+
          '<a class="btn btn-line" href="tel:+48731518516">Zadzwoń: 731 518 516</a>'+
          (l.pdf?'<a class="link-more" href="'+l.pdf+'" target="_blank" rel="noopener">Rzut w PDF (z obecnej strony)</a>':'')+
        '</div>'+
        '<p class="dl-note">Aranżacja na rzucie jest przykładowa. Miejsce postojowe (35 000 zł) i komórka lokatorska (5 000 zł) są płatne dodatkowo.</p>'+
      '</div></div>'+
      '<button class="dl-close" type="button" aria-label="Zamknij"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="#231F20" stroke-width="2" stroke-linecap="round"/></svg></button>';
    dlg.querySelector('.dl-close').addEventListener('click',function(){dlg.close()});
    dlg.querySelector('[data-pyt]').addEventListener('click',function(e){
      e.preventDefault();dlg.close();
      if(window.ustawLokal)window.ustawLokal(this.getAttribute('data-pyt'));
      var k=document.getElementById('kontakt');if(k)k.scrollIntoView({behavior:'smooth'});
    });
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
    dlg.scrollTop=0;
  }
  if(dlg){dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()})}

  /* ---------- tabela ---------- */
  document.querySelectorAll('[data-lista]').forEach(function(box){
    var mode=box.getAttribute('data-lista'); // 'home' | 'pelna'
    var tbody=box.querySelector('tbody'),info=box.querySelector('[data-info]'),more=box.querySelector('[data-more]');
    var st={etap:0,pok:[],met:'',pie:'',sprz:false,sort:'c',dir:1};
    var q=new URLSearchParams(location.search);
    if(q.get('pokoje'))st.pok=q.get('pokoje').split(',').map(Number).filter(Boolean);
    if(q.get('etap'))st.etap=+q.get('etap')||0;
    if(q.get('metraz'))st.met=q.get('metraz');
    if(q.get('pietro'))st.pie=q.get('pietro');

    function sync(){
      box.querySelectorAll('[data-pok]').forEach(function(b){b.setAttribute('aria-pressed',st.pok.indexOf(+b.getAttribute('data-pok'))>-1?'true':'false')});
      box.querySelectorAll('[data-etap]').forEach(function(b){b.setAttribute('aria-selected',+b.getAttribute('data-etap')===st.etap?'true':'false')});
      var me=box.querySelector('[data-f="met"]');if(me)me.value=st.met;
      var pi=box.querySelector('[data-f="pie"]');if(pi)pi.value=st.pie;
      var sp=box.querySelector('[data-f="sprz"]');if(sp)sp.checked=st.sprz;
      box.querySelectorAll('th[data-sort]').forEach(function(th){
        if(th.getAttribute('data-sort')===st.sort)th.setAttribute('aria-sort',st.dir>0?'ascending':'descending');else th.removeAttribute('aria-sort');
      });
    }
    function match(l){
      if(st.etap&&l.e!==st.etap)return false;
      if(st.pok.length&&st.pok.indexOf(Math.min(l.k,4))<0)return false;
      if(st.met){var p=st.met.split('-'),a=+p[0],b=p[1]?+p[1]:1e9;if(l.m<a||l.m>=b)return false}
      if(st.pie!==''&&l.f!==+st.pie)return false;
      if(mode==='home'||!st.sprz){if(l.s==='s')return false}
      return true;
    }
    function render(){
      var rows=L.filter(match).sort(function(a,b){
        var x=a[st.sort],y=b[st.sort];
        if(st.sort==='n'){x=a.e*1000+a.n;y=b.e*1000+b.n}
        return (x-y)*st.dir||(a.c-b.c);
      });
      var all=rows.length,shown=mode==='home'?rows.slice(0,8):rows;
      tbody.innerHTML=shown.length?shown.map(function(l,i){
        var z=zew(l);
        return '<tr class="is-'+l.s+'" data-i="'+L.indexOf(l)+'"'+(l.s!=='s'?' tabindex="0" aria-label="Mieszkanie '+lab(l)+', '+pok(l.k)+', '+m2(l.m)+', '+zl(l.c)+'. Pokaż rzut"':'')+'>'+
          '<td class="t-nr"><b>'+lab(l)+'</b><small>etap '+l.e+'</small></td>'+
          '<td>'+pietro(l.f)+'</td>'+
          '<td>'+l.k+'</td>'+
          '<td>'+nf1.format(l.m)+'<span class="hl"> m²</span></td>'+
          '<td class="t-hide-m">'+(z||'<span style="color:var(--muted)">-</span>')+'</td>'+
          '<td class="t-cena"><span class="hl">'+zl(l.c)+'</span><span class="hs">'+nf0.format(Math.round(l.c))+' zł</span></td>'+
          '<td class="t-m2c">'+nf0.format(l.cm)+' zł</td>'+
          '<td>'+stHtml(l.s)+'</td>'+
          '<td class="t-go">'+(l.s!=='s'?'<span>Rzut'+ico+'</span>':'')+'</td>'+
        '</tr>';
      }).join(''):'<tr><td colspan="9" class="empty">Brak mieszkań dla wybranych filtrów. Zmień kryteria albo zadzwoń: 731 518 516, sprawdzimy kolejne etapy.</td></tr>';
      if(info){
        var w=rows.filter(function(l){return l.s==='w'}).length,r=rows.filter(function(l){return l.s==='r'}).length;
        info.innerHTML=mode==='home'?'<b>'+w+'</b> wolnych i <b>'+r+'</b> w rezerwacji'+(all>8?', pokazujemy 8 najtańszych':'')
          :'Znaleziono <b>'+all+'</b> '+(all===1?'mieszkanie':(all%10>=2&&all%10<=4&&(all%100<10||all%100>=20)?'mieszkania':'mieszkań'))+' (wolne: '+w+', rezerwacja: '+r+(st.sprz?', sprzedane: '+(all-w-r):'')+')';
      }
      if(more){var p=st.pok.length?'?pokoje='+st.pok.join(','):'';more.setAttribute('href','mieszkania.html'+p)}
      if(mode==='pelna'&&history.replaceState){
        var u=new URLSearchParams();if(st.pok.length)u.set('pokoje',st.pok.join(','));if(st.etap)u.set('etap',st.etap);if(st.met)u.set('metraz',st.met);if(st.pie!=='')u.set('pietro',st.pie);
        history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''));
      }
    }
    box.addEventListener('click',function(e){
      var b=e.target.closest('[data-pok]');
      if(b){var v=+b.getAttribute('data-pok'),i=st.pok.indexOf(v);if(i>-1)st.pok.splice(i,1);else st.pok.push(v);sync();render();return}
      var t=e.target.closest('[data-etap]');
      if(t){st.etap=+t.getAttribute('data-etap');sync();render();return}
      var s=e.target.closest('th[data-sort] button');
      if(s){var k=s.parentNode.getAttribute('data-sort');if(st.sort===k)st.dir=-st.dir;else{st.sort=k;st.dir=1}sync();render();return}
      var tr=e.target.closest('tbody tr[data-i]');
      if(tr&&!tr.classList.contains('is-s'))openL(L[+tr.getAttribute('data-i')]);
    });
    box.addEventListener('keydown',function(e){
      var tr=e.target.closest&&e.target.closest('tbody tr[data-i]');
      if(tr&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(!tr.classList.contains('is-s'))openL(L[+tr.getAttribute('data-i')])}
    });
    box.addEventListener('change',function(e){
      var f=e.target.getAttribute('data-f');
      if(f==='met')st.met=e.target.value;
      if(f==='pie')st.pie=e.target.value;
      if(f==='sprz')st.sprz=e.target.checked;
      render();
    });
    sync();render();
  });
})();
