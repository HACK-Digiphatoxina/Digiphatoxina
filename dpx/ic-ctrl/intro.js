// intro.js
(() => {
  // blocca l’avvio della tua parte finché non diamo il via
  window.__holdCiStart = true;

  const LANG = { current: 'eng' }; // default inglese (come volevi)
  const TEXTS = {
    eng: {
      headline: "To continue you need to disable the pop-up blocker.",
      button:   "Got it",
      blocked:  "Pop-ups still blocked. Please disable the pop-up blocker and try again."
    },
    ita: {
      headline: "Per proseguire devi disattivare il blocco dei pop-up.",
      button:   "Ho capito",
      blocked:  "I pop-up risultano ancora bloccati. Disattiva il blocco e riprova."
    }
  };
  const t = k => (TEXTS[LANG.current] && TEXTS[LANG.current][k]) || TEXTS.eng[k];

  const HK = {
    enter:  "hk_animation/hk_enter.webm",
    hello:  "hk_animation/hk_hello.webm",
    exit:   "hk_animation/hk_exit.webm",
    png:    "hk_animation/hk_default.png",
    size:   240,
    pos:    { right: 0, bottom: 180 }
  };

  let root, vA, vB, active = 'A', standby;

  function getA(){ return active === 'A' ? vA : vB; }
  function getB(){ return active === 'A' ? vB : vA; }
  function show(video, on){ video.style.opacity = on ? '1' : '0'; video.style.zIndex = on ? '2' : '1'; }
  function hardHide(v){ try{ v.pause(); }catch{} try{ v.removeAttribute('src'); v.load(); }catch{} v.currentTime = 0; show(v,false); }
  function swap(){ const old=getA(), nw=getB(); show(nw,true); hardHide(old); active = (active==='A')?'B':'A'; }
  function loadOn(v,src){ return new Promise(res => {
    const ok = () => { v.removeEventListener('canplaythrough', ok); res(); };
    v.addEventListener('canplaythrough', ok, { once:true }); v.src = src; v.load();
  }); }

  function mountHK(){
    root = document.createElement('div');
    root.className = 'h-char h-noselect';
    Object.assign(root.style, {
      position:'fixed', right: HK.pos.right+'px', bottom: HK.pos.bottom+'px',
      width: HK.size+'px', zIndex: '2147483647', pointerEvents: 'auto'
    });

    vA = document.createElement('video');
    vB = document.createElement('video');
    [vA,vB].forEach(v=>{
      Object.assign(v.style, { position:'absolute', inset:'0', width:'100%', height:'auto', opacity:'0', zIndex:'1', pointerEvents:'none' });
      v.playsInline = true; v.muted = true; v.preload = 'auto';
    });
    vA.style.opacity = '1'; vA.style.zIndex = '2';
    root.appendChild(vA); root.appendChild(vB);

    standby = document.createElement('img');
    standby.src = HK.png; standby.alt = 'HK';
    Object.assign(standby.style, { position:'absolute', inset:'0', width:'100%', height:'auto', zIndex:'3', opacity:'0', transition:'opacity .08s linear', pointerEvents:'none' });
    root.appendChild(standby);

    // bolla
    const bubble = document.createElement('div');
    bubble.className = 'h-bubble';
    bubble.innerHTML = `
      <span class="h-bubble-text" id="hk_bubble_text"></span>
      <button type="button" class="h-btn" id="hk_btn"></button>
    `;
    bubble.style.bottom = '-35px';
    root.appendChild(bubble);

    document.body.appendChild(root);
    requestAnimationFrame(()=> root.classList.add('show'));

    return bubble;
  }

  function type(el, text, cps=24, done){
    const ms = Math.max(18, Math.round(1000/cps));
    el.textContent = ''; let i=0;
    (function tick(){ if (i<text.length){ el.textContent += text[i++]; setTimeout(tick, ms); } else { done&&done(); } })();
  }

  function primeAudio(){
    const a = document.getElementById('intro-audio');
    if (!a) return Promise.resolve();
    return a.play().then(()=>{ a.pause(); a.currentTime=0; }).catch(()=>{});
  }

  function popupsAllowedNow(){
    let w=null; try { w = window.open('', '', 'width=120,height=80'); } catch {}
    if (!w || w.closed) return false;
    try { w.close(); } catch {}
    return true;
  }

  async function play(src, { useStandby=true } = {}){
    const hidden = getB();
    hidden.loop=false;
    if (useStandby) standby.style.opacity = '1';
    await loadOn(hidden, src);
    try{ await hidden.play(); }catch{}
    await new Promise(r=>requestAnimationFrame(r));
    swap();
    const act = getA();
    if (useStandby) {
      const hide = () => { standby.style.opacity = '0'; act.removeEventListener('playing', hide); };
      act.addEventListener('playing', hide, { once:true });
      setTimeout(()=> standby.style.opacity='0', 150);
    }
    return act;
  }

  function initLangSwitch(){
    const sw = document.getElementById('lang-switch');
    if (!sw) return;
    sw.classList.add('show');
    sw.querySelectorAll('.lang').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const lang = btn.getAttribute('data-lang');
        if (!lang || lang === LANG.current) return;
        LANG.current = lang;
        sw.querySelectorAll('.lang').forEach(b=>{
          const on = b===btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        const btxt = document.getElementById('hk_bubble_text');
        const bb   = document.getElementById('hk_btn');
        if (btxt) btxt.textContent = t('headline');
        if (bb)   bb.textContent   = t('button');
      });
    });
  }

  async function runIntro(){
    initLangSwitch();
    const bubble = mountHK();
    const txtEl  = bubble.querySelector('#hk_bubble_text');
    const btn    = bubble.querySelector('#hk_btn');

    await play(HK.enter, { useStandby:false });
    getA().onended = async () => {
      try{ getA().pause(); }catch{}
      await play(HK.hello, { useStandby:true });
      bubble.classList.add('show');
      type(txtEl, t('headline'), 24, () => { btn.textContent = t('button'); btn.classList.add('show'); });

      btn.addEventListener('click', async () => {
        // sblocca audio
        await primeAudio();

        // (se vuoi riattivarlo) controllo reale pop-up:
        const CHECK = false; // ← metti true se vuoi obbligare l’utente
        if (CHECK && !popupsAllowedNow()) {
          txtEl.textContent = t('blocked');
          btn.classList.remove('show');
          setTimeout(()=>{ btn.classList.add('show'); btn.textContent = t('button'); }, 1200);
          return;
        }

        bubble.classList.add('hide');
        setTimeout(()=> bubble.remove(), 200);

        // exit e poi via libera
        try {
          const v = await play(HK.exit, { useStandby:true });
          v.onended = () => {
            try{ v.pause(); }catch{}
            try{ root.remove(); }catch{}
            window.__holdCiStart = false;
            document.dispatchEvent(new CustomEvent('intro:proceed'));
          };
        } catch {
          try{ root.remove(); }catch{}
          window.__holdCiStart = false;
          document.dispatchEvent(new CustomEvent('intro:proceed'));
        }
      }, { once:true });
    };
  }

  window.addEventListener('DOMContentLoaded', runIntro);
})();
