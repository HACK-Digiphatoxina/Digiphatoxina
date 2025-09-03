// pill-section.js
(function(){
  // Offset delle immagini hover rispetto al cursore (come avevi)
  const NAME_OFFSET = { x: -270, y: -70 }; // sopra-destra
  const INFO_OFFSET = { x: 90, y: 10 }; // più a sinistra e sotto

  // Noise: stessa intensità e ritmo della tua sezione pillola
  const NOISE_ALPHA = 0.12; // intensità “forte” come finale
  const NOISE_FPS_MS = 110; // ~9 fps, leggero sulla CPU

  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  // Posizionamento con clamp ai bordi
  function placeHover(e, hoverName, hoverInfo){
    const margin = 8;

    // mostrare per misurare
    [hoverName, hoverInfo].forEach(el=>{
      if (el.style.display !== 'block'){ el.style.display='block'; el.style.opacity='0'; }
    });

    const rn = hoverName.getBoundingClientRect();
    const ri = hoverInfo.getBoundingClientRect();

    let nx = e.clientX + NAME_OFFSET.x;
    let ny = e.clientY + NAME_OFFSET.y;
    let ix = e.clientX + INFO_OFFSET.x;
    let iy = e.clientY + INFO_OFFSET.y;

    nx = clamp(nx, margin, innerWidth  - rn.width  - margin);
    ny = clamp(ny, margin, innerHeight - rn.height - margin);
    ix = clamp(ix, margin, innerWidth  - ri.width  - margin);
    iy = clamp(iy, margin, innerHeight - ri.height - margin);

    hoverName.style.left = `${nx}px`; hoverName.style.top  = `${ny}px`;
    hoverInfo.style.left = `${ix}px`; hoverInfo.style.top  = `${iy}px`;
  }

  // Noise helpers
  function resizeNoiseCanvas(canvas){
    canvas.width  = innerWidth;
    canvas.height = innerHeight;
  }
  function drawNoise(ctx, alphaFrac){
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const img = ctx.createImageData(w, h);
    const buf = new Uint32Array(img.data.buffer);
    const a = Math.floor(255 * alphaFrac);
    for (let i=0;i<buf.length;i++){
      const v = (Math.random()*255)|0;
      buf[i] = (a<<24)|(v<<16)|(v<<8)|v;
    }
    ctx.putImageData(img, 0, 0);
  }
  function startNoiseLoop(canvas){
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    resizeNoiseCanvas(canvas);
    let raf = null;
    function tick(ts){
      if (!tick.last || ts - tick.last > NOISE_FPS_MS){
        drawNoise(ctx, NOISE_ALPHA);
        tick.last = ts;
      }
      raf = requestAnimationFrame(tick);
    }
    addEventListener('resize', ()=> resizeNoiseCanvas(canvas));
    raf = requestAnimationFrame(tick);
    return ()=> cancelAnimationFrame(raf);
  }

  // Inizializza ogni componente .pill-section (puoi averne anche più di uno)
  document.querySelectorAll('.pill-section').forEach(root=>{
    const noiseCanvas = root.querySelector('.noise-canvas');
    const pill        = root.querySelector('.pill-img');
    // 🔹 lang switch ora via ID per combaciare con il CSS #lang-switch
    const langWrap    = document.getElementById('lang-switch');
    const hoverName   = root.querySelector('.hover-name');
    const hoverInfo   = root.querySelector('.hover-info');

    // Config da data-attributes
    const cfg = {
      targetUrl:      root.dataset.targetUrl || '#',
      langDefault:    (root.dataset.langDefault || 'eng').toLowerCase(), // 'eng' | 'ita'
      pillSrc:        root.dataset.pillSrc || 'tablets_dhc.png',
      nameEng:        root.dataset.hoverNameEng || 'dh-pill/dh_name_eng.png',
      infoEng:        root.dataset.hoverInfoEng || 'dh-pill/dh_info_eng.png',
      nameIta:        root.dataset.hoverNameIta || 'dh-pill/dh_name_ita.png',
      infoIta:        root.dataset.hoverInfoIta || 'dh-pill/dh_info_ita.png',
    };

    // Noise on (identico come intensità)
    startNoiseLoop(noiseCanvas);

    // Stato
    let currentLang    = (cfg.langDefault === 'ita') ? 'ita' : 'eng';
    let pillHovering   = false;
    let hoverInfoTimer = null;

    // Setup pillola
    pill.src = cfg.pillSrc;

    // Switch lingua UI
    function updateLangUI(){
      if (!langWrap) return;
      langWrap.querySelectorAll('.lang').forEach(btn=>{
        const pressed = btn.dataset.lang === currentLang;
        btn.classList.toggle('active', pressed);                    // 🔹 aggiunge/rimuove .active
        btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      });
    }
    updateLangUI();

    if (langWrap){
      // 🔹 mostra il lang switch (coerente col CSS #lang-switch.show)
      langWrap.classList.add('show');

      langWrap.addEventListener('click', (e)=>{
        const btn = e.target.closest('.lang');
        if (!btn) return;
        currentLang = (btn.dataset.lang === 'ita') ? 'ita' : 'eng';
        updateLangUI();
        // se l'utente è sopra la pillola, aggiorna subito le sorgenti
        if (pillHovering){
          const srcs = (currentLang==='eng')
            ? {name: cfg.nameEng, info: cfg.infoEng}
            : {name: cfg.nameIta, info: cfg.infoIta};
          hoverName.src = srcs.name;
          hoverInfo.src = srcs.info;
        }
      });
    }

    // Hover: prima NAME, poi INFO dopo 2s (con fade)
    pill.addEventListener('pointerenter', (e)=>{
      pillHovering = true;

      // prepara elementi
      [hoverName, hoverInfo].forEach(el=>{
        el.style.display = 'block';
        el.style.opacity = '0';
      });

      // set sorgenti per lingua corrente
      const srcs = (currentLang==='eng')
        ? {name: cfg.nameEng, info: cfg.infoEng}
        : {name: cfg.nameIta, info: cfg.infoIta};
      hoverName.src = srcs.name;
      hoverInfo.src = srcs.info;

      placeHover(e, hoverName, hoverInfo);

      // mostra SUBITO hover-name (fade definito nel CSS .35s)
      requestAnimationFrame(()=>{
        placeHover(e, hoverName, hoverInfo);
        hoverName.style.opacity = '1';
      });

      // programma hover-info dopo 2s
      if (hoverInfoTimer) clearTimeout(hoverInfoTimer);
      hoverInfoTimer = setTimeout(()=>{
        if (pillHovering) hoverInfo.style.opacity = '1';
        hoverInfoTimer = null;
      }, 2000);
    });

    pill.addEventListener('pointermove', (e)=> placeHover(e, hoverName, hoverInfo));

    ['pointerleave','pointerdown'].forEach(ev=>{
      pill.addEventListener(ev, ()=>{
        pillHovering = false;
        if (hoverInfoTimer){ clearTimeout(hoverInfoTimer); hoverInfoTimer = null; }

        hoverName.style.opacity = '0';
        hoverInfo.style.opacity = '0';
        setTimeout(()=>{
          if (!pillHovering){
            hoverName.style.display='none';
            hoverInfo.style.display='none';
          }
        }, 360); // leggermente oltre la transition (.35s)
      });
    });

    // Click → vai alla pagina (risolve bene i relativi)
    pill.addEventListener('click', ()=>{
      window.location.href = new URL(cfg.targetUrl, window.location).href;
    });
  });
})();
