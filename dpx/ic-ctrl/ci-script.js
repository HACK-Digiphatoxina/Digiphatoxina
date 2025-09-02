(function () {
  const audio  = document.getElementById('intro-audio');
  const titles = document.getElementById('titles');

  // ====== CONFIG ======
  const PERSISTENT_DEFAULT = true;
  let   PERSISTENT = PERSISTENT_DEFAULT;

  const MONITOR_MS = 900;
  const FINAL_INDEX = 10;                 // 0-based → #11
  const INTRO_GAP_MS = 5000;              // 5s tra batch
  const CLOSE_OTHERS_AFTER_11_MS = 8000;  // 8s prima di chiudere tutte tranne #11 e passare alla fase 2

  const popup = [
    { src: 'gif_lgm-30a/LGM-30A_1.webm',  width: 250, height: 280, left: 130,  top:  50, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_2.webm',  width: 290, height: 220, left:  90,  top: 310, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_3.webm',  width: 380, height: 210, left: 100,  top: 600, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_4.webm',  width: 280, height: 300, left: 430,  top:  20, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_5.webm',  width: 400, height: 190, left: 360,  top: 320, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_6.webm',  width: 400, height: 240, left: 500,  top: 650, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_7.webm',  width: 400, height: 150, left: 900,  top: 700, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_8.webm',  width: 290, height: 300, left: 1170, top: 320, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_9.webm',  width: 350, height: 330, left: 750,  top: 140, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_10.webm', width: 250, height: 290, left: 1150, top:  35, scale: 0.85 },
    // LASCIA così (height: 10) come desideri tu
    { src: 'gif_lgm-30a/LGM-30A_11.webm', width: 420, height: 10, left: 850,  top:  20, scale: 0.85 }
  ];

  // ====== STATE ======
  const handles = new Array(popup.length).fill(null);
  const introduced = new Array(popup.length).fill(false);
  const introTimers = [];
  let monitorTimer = null;
  let restrictToIndex = null;
  let firstCloseCount = 0;
  let secondSpawned = false;
  let started = false;
  let closeOthersTimer = null;

  // --- H+K robusto ---
  let hkSkipTriggered = false;
  const keyState = { h:false, k:false };
  let hkComboTimer = null;
  const HK_COMBO_MS = 800;

  // ---------- UTILS ----------
  function restartAudio() {
    try { audio.pause(); audio.currentTime = 0; audio.play().catch(() => {}); } catch {}
  }
  function fadeOutTitles() { titles.classList.add('fadeout'); }
  function showTitles() { titles.classList.remove('hidden'); void titles.offsetWidth; titles.classList.add('show'); }

  function featuresOf(cfg) {
    const { left, top, width, height } = cfg;
    return [
      `left=${left}`, `top=${top}`, `width=${width}`, `height=${height}`,
      'resizable=no','menubar=no','toolbar=no','location=no','status=no','scrollbars=no','popup=yes'
    ].join(',');
  }

  function htmlForMedia(srcWebm, scale, index) {
    const srcMp4 = srcWebm.replace(/\.webm$/i, '.mp4');
    const srcGif = srcWebm.replace(/\.(webm|mp4)$/i, '.gif');
    const safeTitle = (srcWebm.split('/').pop() || '').replace(/"/g,'&quot;');
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    html,body{height:100%;margin:0;background:#fff;display:grid;place-items:center;}
    video.media{max-width:${(scale ?? 0.7)*100}%;max-height:${(scale ?? 0.7)*100}%;display:block;object-fit:contain}
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
    const name = `gif_${index+1}`;
    const child = window.open('', name, featuresOf(cfg));
    if (!child || child.closed) return null;
    child.document.open();
    child.document.write(htmlForMedia(cfg.src, cfg.scale, index));
    child.document.close();
    handles[index] = child;
    return child;
  }

  function introduce(index, {restart=true} = {}) {
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
        try { audio.pause(); audio.currentTime = 0; } catch {}
        for (let i = 0; i < popup.length; i++) {
          if (i !== FINAL_INDEX && handles[i] && !handles[i].closed) { try { handles[i].close(); } catch {} }
        }
        introTimers.forEach(id => clearTimeout(id));
        restrictToIndex = FINAL_INDEX;
        fadeOutTitles();

        // HANDOFF alla fase 2 (#11 ancora aperta, handle passato)
        try {
          document.dispatchEvent(new CustomEvent("phase:assistant:start", {
            detail: { handle11: handles[FINAL_INDEX], position: { ...popup[FINAL_INDEX] } }
          }));
        } catch {}
      }, CLOSE_OTHERS_AFTER_11_MS);
    }
  }

  function startChainFromSecond() {
    const batches = [
      [2],        // #3
      [3,4],      // #4 & #5
      [5,6],      // #6 & #7
      [7,8],      // #8 & #9
      [9,10]      // #10 & #11
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
          if (handles[i] && !handles[i].closed) { try { handles[i].close(); } catch {} }
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

  // Spegnimento definitivo (chiamato dalla Fase 2 quando premi "pulsantino")
  function disablePhase1Popups() {
    try { audio.pause(); audio.currentTime = 0; } catch {}
    PERSISTENT = false;
    introTimers.forEach(id => clearTimeout(id));
    if (monitorTimer) { clearInterval(monitorTimer); monitorTimer = null; }
    if (closeOthersTimer) { clearTimeout(closeOthersTimer); closeOthersTimer = null; }
    for (let i = 0; i < handles.length; i++) {
      if (handles[i] && !handles[i].closed) { try { handles[i].close(); } catch {} }
      handles[i] = null; introduced[i] = false;
    }
  }

  // Listener dall’altra fase
  document.addEventListener('phase:popups:disable', disablePhase1Popups);

  // H+K skip
  function resetHKComboTimer(){ if (hkComboTimer) clearTimeout(hkComboTimer); hkComboTimer = setTimeout(() => { keyState.h = keyState.k = false; }, HK_COMBO_MS); }
  function triggerHKSkip(){
    if (hkSkipTriggered) return; hkSkipTriggered = true;
    disablePhase1Popups();
    // UI
    titles && titles.classList.add('fadeout');
    // handoff fase 2 SENZA #11
    try { document.dispatchEvent(new CustomEvent("phase:assistant:start", { detail: { handle11: null, position: null } })); } catch {}
    keyState.h = keyState.k = false; if (hkComboTimer) { clearTimeout(hkComboTimer); hkComboTimer=null; }
  }
  function onKeyDown(e){
    const k = (e.key||'').toLowerCase();
    if (k==='h') keyState.h = true;
    if (k==='k') keyState.k = true;
    if (keyState.h || keyState.k) resetHKComboTimer();
    if (keyState.h && keyState.k) { e.preventDefault(); triggerHKSkip(); }
  }
  function onKeyUp(e){
    const k = (e.key||'').toLowerCase();
    if (k==='h') keyState.h = false;
    if (k==='k') keyState.k = false;
  }
  window.addEventListener('blur', () => { keyState.h = keyState.k = false; if (hkComboTimer) { clearTimeout(hkComboTimer); hkComboTimer=null; } });

  // AVVIO
  const startOnce = async () => {
    if (started) return; started = true;
    restartAudio(); introduce(0, { restart:false }); startMonitoring();
    document.removeEventListener('click', startOnce);
  };

  window.addEventListener('DOMContentLoaded', () => {
    showTitles();
    document.addEventListener('click', startOnce, { once: true });

    // porta in primo piano le finestre
    titles.addEventListener('click', () => {
      const openIndexes = [];
      for (let i = 0; i < handles.length; i++) {
        if (handles[i] && !handles[i].closed) openIndexes.push(i);
      }
      if (openIndexes.length === 0) return;
      openIndexes.forEach((i, k) => { setTimeout(() => { try { handles[i].focus(); } catch {} }, k * 40); });
      setTimeout(() => { if (handles[0] && !handles[0].closed) { try { handles[0].focus(); } catch {} } }, openIndexes.length * 40 + 20);
    });

    window.addEventListener('keydown', onKeyDown, { passive:false });
    window.addEventListener('keyup',   onKeyUp);
  });
})();
