// pill-section.js
(function(){
  const NAME_OFFSET = { x: -270, y: -70 };
  const INFO_OFFSET = { x: 90, y: 10 };

  const NOISE_ALPHA = 0.12;
  const NOISE_FPS_MS = 110;

  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  function placeHover(e, hoverName, hoverInfo){
    const margin = 8;
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

  document.querySelectorAll('.pill-section').forEach(root=>{
    const noiseCanvas = root.querySelector('.noise-canvas');
    const pill        = root.querySelector('.pill-img');
    const langWrap    = document.getElementById('lang-switch');
    const hoverName   = root.querySelector('.hover-name');
    const hoverInfo   = root.querySelector('.hover-info');

    const banner      = root.querySelector('.side-banner');
    const bannerStack = banner?.querySelector('#banner-stack');
    const bannerText  = banner?.querySelector('.banner-text');
    const backBtn     = banner?.querySelector('.back-btn');
    const nextBtn     = banner?.querySelector('.next-btn');

    const bgAudio     = document.getElementById('bg-audio');

    const cfg = {
      targetUrl:      root.dataset.targetUrl || '#',
      backUrl:        '../eo-index.html',
      langDefault:    (root.dataset.langDefault || 'eng').toLowerCase(),
      pillSrc:        root.dataset.pillSrc || 'tablets_dh.png',
      nameEng:        root.dataset.hoverNameEng || 'dh-pill/dh_name_eng.png',
      infoEng:        root.dataset.hoverInfoEng || 'dh-pill/dh_info_eng.png',
      nameIta:        root.dataset.hoverNameIta || 'dh-pill/dh_name_ita.png',
      infoIta:        root.dataset.hoverInfoIta || 'dh-pill/dh_info_ita.png',
      btnEng:         'button_eng.png',
      btnIta:         'button_ita.png',
      btnNextEng:     'button_next_eng.png',
      btnNextIta:     'button_next_ita.png'
    };

    startNoiseLoop(noiseCanvas);

    let currentLang    = (cfg.langDefault === 'ita') ? 'ita' : 'eng';
    let pillHovering   = false;
    let hoverInfoTimer = null;

    pill.src = cfg.pillSrc;
    pill.classList.add('is-hidden');

    function applyBannerLang(){
      if (!banner) return;
      if (bannerText){
        const t = (currentLang==='eng')
          ? bannerText.dataset.textEng
          : bannerText.dataset.textIta;
        bannerText.textContent = t || '';
      }
      if (backBtn){
        backBtn.src = (currentLang==='eng') ? cfg.btnEng : cfg.btnIta;
        backBtn.alt = (currentLang==='eng') ? 'Back button' : 'Torna indietro';
      }
      if (nextBtn){
        nextBtn.src = (currentLang==='eng') ? cfg.btnNextEng : cfg.btnNextIta;
        nextBtn.alt = (currentLang==='eng') ? 'Next button' : 'Avanti';
      }
    }

    function updateLangUI(){
      if (langWrap){
        langWrap.querySelectorAll('.lang').forEach(btn=>{
          const pressed = btn.dataset.lang === currentLang;
          btn.classList.toggle('active', pressed);
          btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        });
      }
      applyBannerLang();
      if (pillHovering){
        const srcs = (currentLang==='eng')
          ? {name: cfg.nameEng, info: cfg.infoEng}
          : {name: cfg.nameIta, info: cfg.infoIta};
        hoverName.src = srcs.name;
        hoverInfo.src = srcs.info;
      }
    }

    updateLangUI();

    if (langWrap){
      langWrap.classList.add('show');
      langWrap.addEventListener('click', (e)=>{
        const btn = e.target.closest('.lang');
        if (!btn) return;
        currentLang = (btn.dataset.lang === 'ita') ? 'ita' : 'eng';
        updateLangUI();
      });
    }

    // Hover pillola
    pill.addEventListener('pointerenter', (e)=>{
      if (pill.classList.contains('is-hidden')) return;
      pillHovering = true;
      [hoverName, hoverInfo].forEach(el=>{
        el.style.display = 'block';
        el.style.opacity = '0';
      });
      const srcs = (currentLang==='eng')
        ? {name: cfg.nameEng, info: cfg.infoEng}
        : {name: cfg.nameIta, info: cfg.infoIta};
      hoverName.src = srcs.name;
      hoverInfo.src = srcs.info;

      placeHover(e, hoverName, hoverInfo);
      requestAnimationFrame(()=>{
        placeHover(e, hoverName, hoverInfo);
        hoverName.style.opacity = '1';
      });

      if (hoverInfoTimer) clearTimeout(hoverInfoTimer);
      hoverInfoTimer = setTimeout(()=>{
        if (pillHovering) hoverInfo.style.opacity = '1';
        hoverInfoTimer = null;
      }, 2000);
    });

    pill.addEventListener('pointermove', (e)=>{
      if (pill.classList.contains('is-hidden')) return;
      placeHover(e, hoverName, hoverInfo);
    });

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
        }, 360);
      });
    });

    pill.addEventListener('click', ()=>{
      if (pill.classList.contains('is-hidden')) return;
      window.location.href = new URL(cfg.targetUrl, window.location).href;
    });

    backBtn?.addEventListener('click', ()=>{
      window.location.href = new URL(cfg.backUrl, window.location).href;
    });

    // 🔊 Click su NEXT
    nextBtn?.addEventListener('click', ()=>{
      // Audio con fade-in volume
      if (bgAudio){
        bgAudio.volume = 0;
        const tryPlay = bgAudio.play();
        if (tryPlay && typeof tryPlay.catch === 'function'){
          tryPlay.catch(()=>{});
        }
        let v = 0;
        const fade = setInterval(()=>{
          v += 0.05;
          if (v >= 1){ v = 1; clearInterval(fade); }
          bgAudio.volume = v;
        }, 100); // in ~2s arriva a 1
      }

      // dissolvenza del blocco centrale
      if (bannerStack){
        bannerStack.classList.add('fade-out');
        bannerStack.addEventListener('transitionend', ()=>{
          bannerStack.classList.add('is-hidden');
        }, { once: true });
      }

      // aspetta 0.5s → mostra pillola
      setTimeout(()=>{
        if (pill.classList.contains('is-hidden')){
          pill.classList.remove('is-hidden');
        }
      }, 500);
    });
  });
})();
