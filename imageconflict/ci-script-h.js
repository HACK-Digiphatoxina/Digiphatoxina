// ===== FASE 2 - Hello Kitty (bubble fixed-size, typewriter, ehi loop, #11 change + wallpaper) =====
(function(){
  // ---------- CONFIG ----------
  const CHARACTER = {
    enter: "hk_animation/hk_enter.webm",   // entra e si blocca ultimo frame
    hello: "hk_animation/hk_hello.webm",   // “parla”
    ehi:   "hk_animation/hk_ehi.webm",     // loop dopo il click
    size:  240,
    pos:   { right: 24, bottom: 24 }
  };

  // Catalogo 21 pannelli (teniamo per step successivi / posizioni personalizzabili)
  const PANELS_21 = Array.from({length:21}, (_,k) => {
    const n = String(k+1).padStart(2,'0');
    return {
      id: `p${n}`,
      src: `hk_animation/panels/p${n}.jpg`,
      dist:`hk_animation/panels/p${n}_dist.jpg`,
      width: 520, height: 360, left: 860, top: 40
    };
  });
  function setPanelConfig(id, cfg){
    const p = PANELS_21.find(x => x.id === id);
    if (!p) return false; Object.assign(p, cfg || {}); return true;
  }
  function getPanelConfig(id){ return PANELS_21.find(x => x.id === id) || null; }
  window.__PANELS_21 = PANELS_21;
  window.__setPanelConfig = setPanelConfig;
  window.__getPanelConfig = getPanelConfig;

  // Immagine da mostrare nel popup #11 **dopo** il click sul pulsantino
  const PANEL11_ON_CLICK = {
    id: "p_start",
    src: "hk_animation/panels/start.jpg",
    width: 520, height: 360, left: 860, top: 40
  };

  const WALLPAPER_SRC = "hk_animation/hk_wallpaper.jpg";

  // ---------- STATE ----------
  let h11 = null;           // handle #11 passato dalla fase 1
  let charEl = null;        // wrapper del personaggio
  let bubbleEl = null;      // nuvoletta
  let v = null;             // <video> del personaggio
  let wallpaper = null;     // overlay per sfondo

  // ---------- UTILS ----------
  function freezeLastFrame(video){
    try{
      video.pause();
      if (!isNaN(video.duration)) {
        video.currentTime = Math.max(0, video.duration - 0.001);
      }
    }catch{}
  }

  function mountCharacter(){
    // contenitore
    charEl = document.createElement('div');
    charEl.className = 'h-char h-noselect';
    charEl.style.right  = CHARACTER.pos.right + 'px';
    charEl.style.bottom = CHARACTER.pos.bottom + 'px';
    charEl.style.width  = CHARACTER.size + 'px';

    // video
    v = document.createElement('video');
    v.autoplay = false; v.muted = true; v.playsInline = true; v.preload = 'auto';
    charEl.appendChild(v);

    // bubble
    bubbleEl = document.createElement('div');
    bubbleEl.className = 'h-bubble';
    // struttura bubble: testo (con caret) + pulsante
    bubbleEl.innerHTML = `
      <span class="h-bubble-text" id="hk_bubble_text"></span>
      <span class="h-type-caret" id="hk_caret"></span><br>
      <button type="button" class="h-btn" id="hk_btn">pulsantino</button>
    `;
    charEl.appendChild(bubbleEl);

    document.body.appendChild(charEl);
    requestAnimationFrame(()=> charEl.classList.add('show'));
  }

  function typeWriter(el, text, cps = 20, done){
    const msPerChar = Math.max(20, Math.round(1000 / cps)); // ~20 cps = non troppo veloce
    el.textContent = '';
    let i = 0;
    const tick = () => {
      if (i < text.length){
        el.textContent += text[i++];
        setTimeout(tick, msPerChar);
      } else if (typeof done === 'function'){
        done();
      }
    };
    tick();
  }

  function showBubbleWithTypewriter(){
    const txt = "Ciao! Sono Hello Kitty, felice di aiutarti! Pronta a proseguire? Premi questo pulsantino.";
    const textEl = bubbleEl.querySelector('#hk_bubble_text');
    bubbleEl.classList.add('show');
    typeWriter(textEl, txt, 18, () => { /* caret continua a lampeggiare */ });

    // click sul pulsante: cambia #11 e lo sfondo, chiudi bubble e passa a ehi loop
    const btn = bubbleEl.querySelector('#hk_btn');
    btn.addEventListener('click', onBubbleButtonClick, { once: true });
  }

  function hideBubble(){
    bubbleEl.classList.add('hide');
    setTimeout(()=> {
      try{ bubbleEl.remove(); }catch{}
    }, 220);
  }

  function onBubbleButtonClick(){
    // 1) Cambia l'immagine del popup #11
    if (h11 && !h11.closed){
      try{
        h11.document.open();
        h11.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
          <style>
            html,body{height:100%;margin:0;background:#fff;display:grid;place-items:center;}
            img{max-width:90%;max-height:90%;display:block}
          </style></head>
          <body><img src="${PANEL11_ON_CLICK.src}" alt="${PANEL11_ON_CLICK.id}"></body></html>`);
        h11.document.close();
      }catch{}
      try{ h11.resizeTo(PANEL11_ON_CLICK.width, PANEL11_ON_CLICK.height); }catch{}
      try{ h11.moveTo(PANEL11_ON_CLICK.left, PANEL11_ON_CLICK.top); }catch{}
    }

    // 2) Cambia lo sfondo (fade-in wallpaper)
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

    // 3) Chiudi la bubble e passa a animazione "ehi" in loop
    hideBubble();
    try{
      v.loop = true;
      v.src = CHARACTER.ehi;
      v.currentTime = 0;
      v.play().catch(()=>{});
    }catch{}
  }

  // Sequenza: enter → freeze → (dopo 1s) hello + bubble (typewriter)
  function playEnterThenTalk(){
    v.src = CHARACTER.enter;
    v.currentTime = 0;
    v.play().catch(()=>{});
    v.addEventListener('ended', () => {
      freezeLastFrame(v);
      // dopo 1 secondo “parla” e appare la nuvoletta con typewriter
      setTimeout(() => {
        v.src = CHARACTER.hello;
        v.loop = false;    // il focus è sulla nuvoletta
        v.play().catch(()=>{});
        showBubbleWithTypewriter();
      }, 1000);
    }, { once:true });
  }

  // ---------- ENTRYPOINT DELLA FASE 2 ----------
  function startPhase2(detail){
    // NON cambiamo l'immagine della #11 all'avvio
    h11 = detail?.handle11 || null;

    // monta personaggio
    mountCharacter();

    // sequenza video + bubble
    playEnterThenTalk();
  }

  // ---------- HOOK dalla fase 1 ----------
  document.addEventListener("phase:assistant:start", (e) => {
    startPhase2(e.detail || {});
  });

  // (debug)
  // window.__HK_start = startPhase2;
})();
