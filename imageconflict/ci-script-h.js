// ===== FASE 2 - Hello Kitty (no gap video switching + gating, random #11, focus, wallpaper) =====
(function(){
  // ---------- CONFIG ----------
  const CHARACTER = {
    enter: "hk_animation/hk_enter.webm",
    hello: "hk_animation/hk_hello.webm",
    ehi:   "hk_animation/hk_ehi.webm",
    poses: [
      "hk_animation/hk_info_handup.webm",
      "hk_animation/hk_info_handdown.webm",
      "hk_animation/hk_info_lefthand.webm",
      "hk_animation/hk_info_thumb.webm",
      "hk_animation/hk_info_thumbstar.webm" // rara
    ],
    size:  240,
    pos:   { right: 24, bottom: 24 }
  };

  // pannelli
  const PANELS_21 = Array.from({length:21}, (_,k) => {
    const n = String(k+1).padStart(2,'0');
    return {
      id: `p${n}`,
      src: `hk_animation/panels/p${n}.jpg`,
      dist:`hk_animation/panels/p${n}_dist.jpg`,
      width: 520, height: 360, left: 860, top: 40
    };
  });
  const CAPTIONS = {};
  const CAPTION_FALLBACK = "Questa immagine racconta un dettaglio importante. Prontə a continuare?";
  const WALLPAPER_SRC = "hk_animation/hk_wallpaper.jpg";

  // ---------- STATE ----------
  let h11 = null, currentPanel = null;
  let charEl = null, vA = null, vB = null, active = 'A';
  let introBubbleEl = null, infoBubbleEl = null, wallpaper = null;

  // gating info cycle
  let infoCycleActive = false, typingDone=false, cooldownDone=false;

  // ---------- UTILS ----------
  const pick = (arr)=> arr[(Math.random()*arr.length)|0];
  const pickPanel = ()=> pick(PANELS_21);

  function getActiveV(){ return active === 'A' ? vA : vB; }
  function getHiddenV(){ return active === 'A' ? vB : vA; }
  function swapLayers(){
    // porta in primo piano il hidden che sta suonando
    if (active === 'A'){ vB.style.opacity = '1'; vA.style.opacity = '0'; active = 'B'; }
    else { vA.style.opacity = '1'; vB.style.opacity = '0'; active = 'A'; }
  }
  function freezeLastFrame(video){
    try{ video.pause(); if (!isNaN(video.duration)) video.currentTime = Math.max(0, video.duration - 0.001);}catch{}
  }
  function seekPercent(video, p){
    try{ const d = video.duration||0; if (d>0){ video.currentTime = d*p; } }catch{}
  }
  function loadOn(video, src){
    return new Promise(res=>{
      const onCan = ()=>{ video.removeEventListener('canplaythrough', onCan); res(); };
      video.addEventListener('canplaythrough', onCan, { once:true });
      video.src = src;
      video.load();
    });
  }
  async function playInstant(src, {loop=false, startPercent=null, pauseAtStart=false, onEnded=null}={}){
    const hidden = getHiddenV();
    hidden.loop = loop;
    hidden.muted = true;
    await loadOn(hidden, src);

    if (startPercent!=null) seekPercent(hidden, startPercent);
    if (!pauseAtStart){
      hidden.currentTime = hidden.currentTime || 0;
      try{ await hidden.play(); }catch{}
    }else{
      hidden.pause();
    }

    swapLayers(); // istantaneo: niente “vuoto”

    // rimuovi eventuali listener precedenti sull’attivo vecchio
    try{ getHiddenV().onended = null; }catch{}
    const act = getActiveV();
    act.onended = onEnded || null;
    return act;
  }

  function mountCharacter(){
    charEl = document.createElement('div');
    charEl.className = 'h-char h-noselect';
    charEl.style.right  = CHARACTER.pos.right + 'px';
    charEl.style.bottom = CHARACTER.pos.bottom + 'px';
    charEl.style.width  = CHARACTER.size + 'px';
    charEl.style.position = 'fixed';

    // due video sovrapposti per switch senza gap
    vA = document.createElement('video');
    vB = document.createElement('video');
    [vA, vB].forEach(v=>{
      v.style.position = 'absolute';
      v.style.inset = '0';
      v.style.width = '100%';
      v.style.height = 'auto';
      v.playsInline = true; v.preload = 'auto'; v.muted = true;
    });
    vA.style.opacity = '1'; vB.style.opacity = '0';
    charEl.appendChild(vA); charEl.appendChild(vB);

    // bubble intro (usa .h-bubble)
    introBubbleEl = document.createElement('div');
    introBubbleEl.className = 'h-bubble';
    introBubbleEl.innerHTML = `
      <span class="h-bubble-text" id="hk_bubble_text"></span>
      <span class="h-type-caret" id="hk_caret"></span><br>
      <button type="button" class="h-btn" id="hk_btn">pulsantino</button>
    `;
    charEl.appendChild(introBubbleEl);

    document.body.appendChild(charEl);
    requestAnimationFrame(()=> charEl.classList.add('show'));
  }

  function typeWriter(el, text, cps = 18, done){
    const msPerChar = Math.max(25, Math.round(1000 / cps));
    el.textContent = ''; let i = 0;
    (function tick(){
      if (i < text.length){ el.textContent += text[i++]; setTimeout(tick, msPerChar); }
      else { if (done) done(); }
    })();
  }

  // ---------- Intro bubble ----------
  function showIntroBubble(){
    const txt = "Ciao! Sono Hello Kitty, felice di aiutarti! Pronta a proseguire? Premi questo pulsantino.";
    const textEl = introBubbleEl.querySelector('#hk_bubble_text');
    const btn    = introBubbleEl.querySelector('#hk_btn');
    introBubbleEl.classList.add('show');
    typeWriter(textEl, txt, 18, () => {
      btn.classList.add('show');
      btn.addEventListener('click', onIntroBtn, { once:true });
    });
  }
  function hideIntroBubble(){
    introBubbleEl.classList.add('hide');
    setTimeout(()=>{ try{ introBubbleEl.remove(); }catch{}; introBubbleEl=null; },220);
  }

  async function onIntroBtn(){
    currentPanel = pickPanel();
    ensureWindow11Content(currentPanel, true);
    try{ h11 && h11.focus(); }catch{}

    // wallpaper
    if (!wallpaper){
      wallpaper = document.createElement('div');
      wallpaper.className = 'h-wallpaper';
      wallpaper.style.backgroundImage = `url("${WALLPAPER_SRC}")`;
      document.body.appendChild(wallpaper);
      requestAnimationFrame(()=> wallpaper.classList.add('show'));
    } else {
      wallpaper.style.backgroundImage = `url("${WALLPAPER_SRC}")`;
      wallpaper.classList.add('show');
    }

    hideIntroBubble();
    await playInstant(CHARACTER.ehi, { loop:true }); // passa a ehi senza stacco
  }

  // ---------- #11 writer + hooks ----------
  function ensureWindow11Content(panelCfg, attachClick){
    if (!h11 || h11.closed){
      h11 = window.open('', 'gif_11', [
        `left=${panelCfg.left}`, `top=${panelCfg.top}`,
        `width=${panelCfg.width}`, `height=${panelCfg.height}`,
        'resizable=no','menubar=no','toolbar=no','location=no',
        'status=no','scrollbars=no','popup=yes'
      ].join(','));
      if (!h11) return;
    } else {
      try{ h11.resizeTo(panelCfg.width, panelCfg.height);}catch{}
      try{ h11.moveTo(panelCfg.left, panelCfg.top);}catch{}
    }
    try{
      const clickScript = attachClick ? `
        document.addEventListener('click', () => {
          try{ window.opener && window.opener.postMessage({ type:'panelClickInfo', id:'${panelCfg.id}' }, '*'); }catch(e){}
        });` : ``;

      h11.document.open();
      h11.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
        <title>${panelCfg.id}</title>
        <style>
          html,body{height:100%;margin:0;background:#fff;display:grid;place-items:center;}
          img{max-width:90%;max-height:90%;display:block}
          body{overflow:hidden}
        </style></head>
        <body>
          <img src="${panelCfg.src}" alt="${panelCfg.id}">
          <script>
            ${clickScript}
            window.addEventListener('beforeunload', () => {
              try{ window.opener && window.opener.postMessage({ type:'popup11Closed' }, '*'); }catch(e){}
            });
          <\/script>
        </body></html>`);
      h11.document.close();
      try{ h11.focus(); }catch{}
    }catch{}
  }

  // ---------- Info bubble (stesso CSS .h-bubble) ----------
  function showInfoBubbleFor(panelId){
    if (infoCycleActive) return;
    infoCycleActive = true; typingDone=false; cooldownDone=false;

    if (infoBubbleEl) { try{ infoBubbleEl.remove(); }catch{} }
    infoBubbleEl = document.createElement('div');
    infoBubbleEl.className = 'h-bubble';
    infoBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_info_text"></span><span class="h-type-caret"></span>`;
    charEl.appendChild(infoBubbleEl);
    requestAnimationFrame(()=> infoBubbleEl.classList.add('show'));

    const text = CAPTIONS[panelId] || CAPTION_FALLBACK;
    const textEl = infoBubbleEl.querySelector('#hk_info_text');

    // posa a metà (precaricata e mostrata istantaneamente)
    playPoseHalfInstant();

    // typing → poi 2s → poi completa posa fino a fine (freeze)
    typeWriter(textEl, text, 18, () => {
      typingDone = true;
      setTimeout(()=>{ cooldownDone = true; tryFinishInfoCycle(); }, 2000);
    });
  }

  function hideInfoBubble(){
    if (!infoBubbleEl) return;
    infoBubbleEl.classList.add('hide');
    setTimeout(()=>{ try{ infoBubbleEl.remove(); }catch{}; infoBubbleEl=null; }, 220);
  }

  async function playPoseHalfInstant(){
    const pool = [CHARACTER.poses[0], CHARACTER.poses[1], CHARACTER.poses[2], CHARACTER.poses[3], CHARACTER.poses[4]];
    const src = pick(pool);
    await playInstant(src, { loop:false, startPercent:0.5, pauseAtStart:true });
    // adesso sul player attivo si vede la posa “a metà”, ferma, senza stacco
  }

  async function tryFinishInfoCycle(){
    if (!(typingDone && cooldownDone)) return;

    const act = getActiveV();
    act.onended = ()=> {
      freezeLastFrame(act);
      hideInfoBubble();
      infoCycleActive = false;
    };
    try{ await act.play(); }catch{}
  }

  // ---------- MESSAGGI DAI POPUP ----------
  window.addEventListener('message', (ev) => {
    const d = ev.data || {};
    if (d.type === 'popup11Closed') {
      if (currentPanel) ensureWindow11Content(currentPanel, true);
      return;
    }
    if (d.type === 'panelClickInfo') {
      if (infoCycleActive) return;
      try{ h11 && !h11.closed && h11.focus(); }catch{}
      showInfoBubbleFor(d.id);
      return;
    }
  });

  // fail-safe: #11 sempre viva
  setInterval(() => {
    if (!currentPanel) return;
    if (!h11 || h11.closed) ensureWindow11Content(currentPanel, true);
  }, 900);

  // ---------- Entrata HK ----------
  async function startPhase2(detail){
    h11 = detail?.handle11 || null;

    mountCharacter();

    // enter (no gap) → freeze → +1s hello → bubble intro
    await playInstant(CHARACTER.enter, { loop:false });
    getActiveV().onended = async ()=> {
      freezeLastFrame(getActiveV());
      setTimeout(async ()=>{
        await playInstant(CHARACTER.hello, { loop:false });
        showIntroBubble();
      }, 1000);
    };
  }

  document.addEventListener("phase:assistant:start", (e) => {
    startPhase2(e.detail || {});
  });
})();
