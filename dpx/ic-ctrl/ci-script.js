(function () {
  const audio = document.getElementById('intro-audio');
  const titles = document.getElementById('titles');

  // ====== CONFIG ======
  const PERSISTENT_DEFAULT = true;
  let PERSISTENT = PERSISTENT_DEFAULT;

  // --- LANG SWITCH (helper fase 1) ---
  const _langSwitch = document.getElementById('lang-switch');
  function _showLangSwitch() {
    if (!_langSwitch) return;
    _langSwitch.style.display = 'flex';
    _langSwitch.classList.add('show');
  }
  function _hideLangSwitch() {
    if (!_langSwitch) return;
    _langSwitch.classList.remove('show');
    _langSwitch.style.display = 'none';
  }
  function _lockLangSwitch(lock) {
    if (!_langSwitch) return;
    const btns = _langSwitch.querySelectorAll('.lang');
    btns.forEach(b => {
      b.disabled = !!lock;
      b.style.pointerEvents = lock ? 'none' : '';
      b.style.opacity = lock ? '.5' : '';
    });
  }

  const MONITOR_MS = 900;
  const FINAL_INDEX = 10;                 // 0-based → #11
  const INTRO_GAP_MS = 5000;              // 5s tra batch
  const CLOSE_OTHERS_AFTER_11_MS = 8000;  // 8s prima di chiudere tutte tranne #11 e passare alla fase 2

  const popup = [
    { src: 'gif_lgm-30a/LGM-30A_1.webm', width: 250, height: 280, left: 130, top: 50, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_2.webm', width: 290, height: 220, left: 90, top: 310, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_3.webm', width: 380, height: 210, left: 100, top: 600, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_4.webm', width: 280, height: 300, left: 430, top: 20, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_5.webm', width: 400, height: 190, left: 360, top: 320, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_6.webm', width: 400, height: 240, left: 500, top: 650, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_7.webm', width: 400, height: 150, left: 900, top: 700, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_8.webm', width: 290, height: 300, left: 1170, top: 320, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_9.webm', width: 350, height: 330, left: 750, top: 140, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_10.webm', width: 250, height: 290, left: 1150, top: 35, scale: 0.85 },
    // lascia height: 10 come vuoi tu
    { src: 'gif_lgm-30a/LGM-30A_11.webm', width: 420, height: 10, left: 850, top: 20, scale: 0.85 }
  ];

  // ====== PRE-INTRO ASSISTANT ======
  (function () {
    const CHARACTER = {
      enter: "hk_animation/hk_enter.webm",
      hello: "hk_animation/hk_hello.webm",
      exit:  "hk_animation/hk_exit.webm",
      size: 240,
      pos: { right: 0, bottom: 180 },     // POS FISSA
      standbyPng: "hk_animation/hk_default.png"
    };

    const POPUP_CHECK_ENABLED = true;

    // lingue (default ENG)
    let currentLang = 'eng';
    const TEXTS = {
      eng: {
        headline: "To continue you need to disable the pop-up blocker.",
        button: "Got it",
        stillBlocked: "Pop-ups still blocked. Please disable the pop-up blocker and try again."
      },
      ita: {
        headline: "Per proseguire devi disattivare il blocco dei pop-up.",
        button: "Ho capito",
        stillBlocked: "I pop-up risultano ancora bloccati. Disattiva il blocco e riprova."
      }
    };
    function t(k) { return (TEXTS[currentLang] && TEXTS[currentLang][k]) || TEXTS.ita[k]; }

    // stato DOM
    let charEl = null, vA = null, vB = null, active = 'A', standbyImg = null, introBubbleEl = null;

    // video helpers
    function getActiveV() { return active === 'A' ? vA : vB; }
    function getHiddenV() { return active === 'A' ? vB : vA; }
    function setVisible(video, on) { if (!video) return; video.style.opacity = on ? '1' : '0'; video.style.zIndex = on ? '2' : '1'; }
    function hardHide(video) { if (!video) return; try { video.pause(); } catch { } try { video.removeAttribute('src'); video.load(); } catch { } video.currentTime = 0; setVisible(video, false); }
    function swapLayersNow() { const oldA = getActiveV(), newA = getHiddenV(); setVisible(newA, true); hardHide(oldA); active = (active === 'A') ? 'B' : 'A'; }
    function loadOn(video, src) { return new Promise(res => { const onReady = () => { video.removeEventListener('canplaythrough', onReady); res(); }; video.addEventListener('canplaythrough', onReady, { once: true }); video.src = src; video.load(); }); }
    function showStandby() { if (standbyImg) standbyImg.style.opacity = '1'; }
    function hideStandby() { if (standbyImg) standbyImg.style.opacity = '0'; }

    async function playInstant(src, { loop = false, useStandby = true } = {}) {
      const hidden = getHiddenV();
      hidden.loop = loop; hidden.muted = true; hidden.playsInline = true; hidden.preload = 'auto';
      hidden.style.willChange = 'opacity, transform';
      if (useStandby) showStandby();
      await loadOn(hidden, src);
      try { await hidden.play(); } catch { }
      await new Promise(r => requestAnimationFrame(r));
      swapLayersNow();
      const act = getActiveV(); getHiddenV().onended = null; act.onended = null;
      if (useStandby) {
        const hideNow = () => { hideStandby(); act.removeEventListener('playing', hideNow); };
        act.addEventListener('playing', hideNow, { once: true }); setTimeout(hideStandby, 150);
      }
      return act;
    }

    // MONTA PERSONAGGIO (FIX POS qui)
    function mountCharacter() {
      charEl = document.createElement('div');
      charEl.className = 'h-char h-noselect';
      // FIX POS: forzo tutto in px, annullo altri offset e trasformazioni
      Object.assign(charEl.style, {
        position: 'fixed',
        right: CHARACTER.pos.right + 'px',
        bottom: CHARACTER.pos.bottom + 'px',
        top: '',      // <— evita override accidentali
        left: '',
        transform: 'none',
        width: CHARACTER.size + 'px',
        zIndex: '2147483647',   // sempre davanti
        pointerEvents: 'auto'
      });

      // due layer video
      vA = document.createElement('video'); vB = document.createElement('video');
      [vA, vB].forEach(v => {
        Object.assign(v.style, {
          position: 'absolute', inset: '0', width: '100%', height: 'auto',
          zIndex: '1', opacity: '0', pointerEvents: 'none'
        });
        v.playsInline = true; v.preload = 'auto'; v.muted = true;
      });
      vA.style.zIndex = '2'; vA.style.opacity = '1';
      charEl.appendChild(vA); charEl.appendChild(vB);

      // PNG standby (copre micro-gap)
      standbyImg = document.createElement('img');
      standbyImg.src = CHARACTER.standbyPng; standbyImg.alt = 'HK';
      Object.assign(standbyImg.style, {
        position: 'absolute', inset: '0', width: '100%', height: 'auto',
        zIndex: '3', opacity: '0', transition: 'opacity 80ms linear', pointerEvents: 'none'
      });
      charEl.appendChild(standbyImg);

      // Nuvoletta (stesso stile fase 2) + FIX POS bubble
      introBubbleEl = document.createElement('div');
      introBubbleEl.className = 'h-bubble';
      introBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_bubble_text"></span><button type="button" class="h-btn" id="hk_btn"></button>`;
      charEl.appendChild(introBubbleEl);
      introBubbleEl.style.bottom = '20px'; // quota in px → visiva fissa

      document.body.appendChild(charEl);
      requestAnimationFrame(() => charEl.classList.add('show'));

      // RE-ASSERT posizione anche dopo un reflow/resize (difese extra)
      const reassert = () => {
        Object.assign(charEl.style, {
          right: CHARACTER.pos.right + 'px',
          bottom: CHARACTER.pos.bottom + 'px',
          top: '', left: '', transform: 'none'
        });
        if (introBubbleEl) introBubbleEl.style.bottom = '20px';
      };
      setTimeout(reassert, 0);
      window.addEventListener('resize', reassert);
    }

    function typeWriter(el, text, cps = 24, done) {
      const ms = Math.max(18, Math.round(1000 / cps));
      el.textContent = ''; let i = 0; (function tick() { if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, ms); } else { done && done(); } })();
    }

    // switch lingua (#lang-switch già nel DOM)
    function initLangSwitch() {
      const sw = document.getElementById('lang-switch');
      if (!sw) return;
      // all’inizio della fase 1: mostralo e bloccalo (sarà sbloccato a fine typewriter)
      _showLangSwitch();

      const btns = sw.querySelectorAll('.lang');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return; // se bloccato, ignora
          const lang = btn.getAttribute('data-lang');
          if (!lang || lang === currentLang) return;
          currentLang = lang;
          btns.forEach(b => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', String(isActive));
          });
          if (introBubbleEl) {
            const textEl = introBubbleEl.querySelector('#hk_bubble_text');
            const btnEl = introBubbleEl.querySelector('#hk_btn');
            textEl.textContent = t('headline');
            btnEl.textContent = t('button');
          }
        });
      });
    }

    // test pop-up blocker
    function popupsAllowedNow() {
      let w = null;
      try { w = window.open('', '', 'width=120,height=80'); } catch { }
      if (!w || w.closed) { return false; }
      try { w.close(); } catch { }
      return true;
    }

    // sblocca audio
    async function primeAudio(audioEl) {
      try { await audioEl.play(); audioEl.pause(); audioEl.currentTime = 0; } catch { }
    }

    // avvio
    async function runPreIntro({ onProceed }) {
      initLangSwitch();         // mostra le bandiere
      _lockLangSwitch(true);    // bloccale durante la scrittura

      mountCharacter();

      // enter → hello
      await playInstant(CHARACTER.enter, { loop: false, useStandby: false });
      getActiveV().onended = async () => {
        try { getActiveV().pause(); } catch { }
        await playInstant(CHARACTER.hello, { loop: false, useStandby: true });

        // bubble
        const textEl = introBubbleEl.querySelector('#hk_bubble_text');
        const btn = introBubbleEl.querySelector('#hk_btn');
        textEl.textContent = '';
        btn.textContent = t('button');
        introBubbleEl.classList.add('show');

        typeWriter(textEl, t('headline'), 24, () => {
          btn.classList.add('show');
          _lockLangSwitch(false); // a fine typing si possono cambiare lingua
        });

        btn.addEventListener('click', async () => {
          // sblocca audio
          const audioEl = document.getElementById('intro-audio');
          if (audioEl) await primeAudio(audioEl);

          // check pop-up (opzionale)
          if (POPUP_CHECK_ENABLED && !popupsAllowedNow()) {
            textEl.textContent = t('stillBlocked');
            btn.classList.remove('show');
            setTimeout(() => { btn.classList.add('show'); btn.textContent = t('button'); }, 1200);
            return;
          }

          // chiudi bubble
          introBubbleEl.classList.add('hide');
          setTimeout(() => { try { introBubbleEl.remove(); } catch { } }, 220);

          // EXIT → al termine sparisce tutto, nascondi bandiere, partono titoli+pop-up
          const act = await playInstant(CHARACTER.exit, { loop: false, useStandby: true });
          act.onended = () => {
            try { act.pause(); } catch { }
            try { charEl.remove(); } catch { }
            _hideLangSwitch();          // << nascondi bandiere finché non ricompare HK in fase 2
            if (typeof onProceed === 'function') onProceed();
          };
        }, { once: true });
      };
    }

    window.__preIntroAssistant = { start: runPreIntro };
  })();

  // ====== STATE POPUP ======
  const handles = new Array(popup.length).fill(null);
  const introduced = new Array(popup.length).fill(false);
  const introTimers = [];
  let monitorTimer = null;
  let restrictToIndex = null;
  let firstCloseCount = 0;
  let secondSpawned = false;
  let closeOthersTimer = null;

  // ---------- UTILS POPUP ----------
  function restartAudio() {
    try { audio.pause(); audio.currentTime = 0; audio.play().catch(() => { }); } catch { }
  }
  function fadeOutTitles() { titles.classList.add('fadeout'); }
  function showTitles() { titles.classList.remove('hidden'); void titles.offsetWidth; titles.classList.add('show'); }

  function featuresOf(cfg) {
    const { left, top, width, height } = cfg;
    return [
      `left=${left}`, `top=${top}`, `width=${width}`, `height=${height}`,
      'resizable=no', 'menubar=no', 'toolbar=no', 'location=no', 'status=no', 'scrollbars=no', 'popup=yes'
    ].join(',');
  }

  function htmlForMedia(srcWebm, scale, index) {
    const srcMp4 = srcWebm.replace(/\.webm$/i, '.mp4');
    const srcGif = srcWebm.replace(/\.(webm|mp4)$/i, '.gif');
    const safeTitle = (srcWebm.split('/').pop() || '').replace(/"/g, '&quot;');
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    html,body{height:100%;margin:0;background:#fff;display:grid;place-items:center;}
    video.media{max-width:${(scale ?? 0.7) * 100}%;max-height:${(scale ?? 0.7) * 100}%;display:block;object-fit:contain}
    img.media{max-width:90%;max-height:90%;display:block}
    body{overflow:hidden}
  </style>
</head>
<body>
  <video class="media" id="m" autoplay muted playsinline preload="auto" src="${srcWebm}"></video>
  <script>
    const v = document.getElementById('m');
    v.addEventListener('ended', () => {
      try{ v.pause(); if (!isNaN(v.duration)) v.currentTime = Math.max(0, v.duration - 0.001); }catch(e){}
    });
    const toGif = () => { document.body.innerHTML = '<img class="media" src="${srcGif}" alt="GIF fallback">'; };
    v.addEventListener('error', () => { try{ v.src = "${srcMp4}"; v.load(); v.play().catch(toGif); } catch(e){ toGif(); } }, { once:true });

    window.addEventListener('beforeunload', () => {
      try{ if (window.opener && window.opener.postMessage) { window.opener.postMessage({ type:'popupClosed', index:${index} }, '*'); } }catch(e){}
    });
  </script>
</body>
</html>`;
  }

  function openOne(index) {
    const cfg = popup[index];
    const name = `gif_${index + 1}`;
    const child = window.open('', name, featuresOf(cfg));
    if (!child || child.closed) return null;
    child.document.open();
    child.document.write(htmlForMedia(cfg.src, cfg.scale, index));
    child.document.close();
    handles[index] = child;
    return child;
  }

  function introduce(index, { restart = true } = {}) {
    if (introduced[index]) {
      if (!handles[index] || handles[index].closed) openOne(index);
      return;
    }
    openOne(index);
    introduced[index] = true;

    if (index !== FINAL_INDEX && restart) restartAudio();

    if (index === FINAL_INDEX) {
      if (closeOthersTimer) clearTimeout(closeOthersTimer);
      closeOthersTimer = setTimeout(() => {
        try { audio.pause(); audio.currentTime = 0; } catch { }
        for (let i = 0; i < popup.length; i++) {
          if (i !== FINAL_INDEX && handles[i] && !handles[i].closed) { try { handles[i].close(); } catch { } }
        }
        introTimers.forEach(id => clearTimeout(id));
        restrictToIndex = FINAL_INDEX;
        fadeOutTitles();

        // HANDOFF alla fase 2 (#11 ancora aperta)
        try {
          document.dispatchEvent(new CustomEvent("phase:assistant:start", {
            detail: { handle11: handles[FINAL_INDEX], position: { ...popup[FINAL_INDEX] } }
          }));
        } catch { }
      }, CLOSE_OTHERS_AFTER_11_MS);
    }
  }

  function startChainFromSecond() {
    const batches = [
      [2],        // #3
      [3, 4],     // #4 & #5
      [5, 6],     // #6 & #7
      [7, 8],     // #8 & #9
      [9, 10]     // #10 & #11
    ];
    batches.forEach((indices, batchIdx) => {
      const id = setTimeout(() => {
        if (restrictToIndex !== null) return;
        indices.forEach((i) => { introduce(i, { restart: true }); });
      }, (batchIdx + 1) * INTRO_GAP_MS);
      introTimers.push(id);
    });
  }

  function startMonitoring() {
    monitorTimer = setInterval(() => {
      for (let i = 0; i < popup.length; i++) {
        if (restrictToIndex !== null && i !== FINAL_INDEX) {
          if (handles[i] && !handles[i].closed) { try { handles[i].close(); } catch { } }
          continue;
        }
        if (PERSISTENT && introduced[i] && (!handles[i] || handles[i].closed)) {
          if (i === 0) firstCloseCount++;
          openOne(i);
          if (i >= 1 && i !== FINAL_INDEX) restartAudio();
          if (i === 0 && firstCloseCount >= 1 && !secondSpawned) {
            secondSpawned = true; introduce(1); startChainFromSecond();
          }
        }
      }
    }, MONITOR_MS);
  }

  // spegnimento definitivo (chiamato dalla Fase 2 quando premi "pulsantino")
  function disablePhase1Popups() {
    try { audio.pause(); audio.currentTime = 0; } catch { }
    PERSISTENT = false;
    introTimers.forEach(id => clearTimeout(id));
    if (monitorTimer) { clearInterval(monitorTimer); monitorTimer = null; }
    if (closeOthersTimer) { clearTimeout(closeOthersTimer); closeOthersTimer = null; }
    for (let i = 0; i < handles.length; i++) {
      if (handles[i] && !handles[i].closed) { try { handles[i].close(); } catch { } }
      handles[i] = null; introduced[i] = false;
    }
  }
  document.addEventListener('phase:popups:disable', disablePhase1Popups);

  // H+K skip
  let hkSkipTriggered = false;
  const keyState = { h: false, k: false };
  let hkComboTimer = null;
  const HK_COMBO_MS = 800;
  function resetHKComboTimer() { if (hkComboTimer) clearTimeout(hkComboTimer); hkComboTimer = setTimeout(() => { keyState.h = keyState.k = false; }, HK_COMBO_MS); }
  function triggerHKSkip() {
    if (hkSkipTriggered) return; hkSkipTriggered = true;
    disablePhase1Popups();
    titles && titles.classList.add('fadeout');
    _hideLangSwitch(); // assicurati che sparisca anche nello skip
    try { document.dispatchEvent(new CustomEvent("phase:assistant:start", { detail: { handle11: null, position: null } })); } catch { }
    keyState.h = keyState.k = false; if (hkComboTimer) { clearTimeout(hkComboTimer); hkComboTimer = null; }
  }
  function onKeyDown(e) {
    const k = (e.key || '').toLowerCase();
    if (k === 'h') keyState.h = true;
    if (k === 'k') keyState.k = true;
    if (keyState.h || keyState.k) resetHKComboTimer();
    if (keyState.h && keyState.k) { e.preventDefault(); triggerHKSkip(); }
  }
  function onKeyUp(e) {
    const k = (e.key || '').toLowerCase();
    if (k === 'h') keyState.h = false;
    if (k === 'k') keyState.k = false;
  }
  window.addEventListener('blur', () => { keyState.h = keyState.k = false; if (hkComboTimer) { clearTimeout(hkComboTimer); hkComboTimer = null; } });

  // ---------- AVVIO ----------
  window.addEventListener('DOMContentLoaded', () => {
    // NON nascondiamo subito: l’intro deve mostrarle; sarà la Fase 2 a ri-mostrare più avanti.
    // _hideLangSwitch();

    // pre-intro con HK → exit → poi titoli+popups
    window.__preIntroAssistant.start({
      onProceed: () => {
        // ora sì: titoli e sequenza
        showTitles();
        try { restartAudio(); } catch { }
        introduce(0, { restart: false });
        startMonitoring();
      }
    });

    // click sul titolo: porta in primo piano le finestre
    titles.addEventListener('click', () => {
      const openIndexes = [];
      for (let i = 0; i < handles.length; i++) {
        if (handles[i] && !handles[i].closed) openIndexes.push(i);
      }
      if (openIndexes.length === 0) return;
      openIndexes.forEach((i, k) => {
        setTimeout(() => { try { handles[i].focus(); } catch { } }, k * 40);
      });
      setTimeout(() => {
        if (handles[0] && !handles[0].closed) { try { handles[0].focus(); } catch { } }
      }, openIndexes.length * 40 + 20);
    });

    // attiva skip H+K
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });

})();
