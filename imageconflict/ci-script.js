(function () {
  const audio  = document.getElementById('intro-audio');
  const titles = document.getElementById('titles');
  const notice = document.getElementById('popupNotice');

  // ====== CONFIG ======
  const PERSISTENT = true;          // riapre automaticamente le finestre chiuse
  const MONITOR_MS = 900;           // frequenza monitor
  const FINAL_INDEX = 10;           // zero-based: 10 = finestra #11
  const INTRO_GAP_MS = 5000;        // 5 secondi tra "batch" di nuove aperture

  // Posizioni/dimensioni dei popup (usa i tuoi valori)
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
    { src: 'gif_lgm-30a/LGM-30A_11.webm', width: 420, height: 300, left: 850,  top:  20, scale: 0.85 } // #11
  ];

  // ====== STATE ======
  const handles = new Array(popup.length).fill(null);     // window handles
  const introduced = new Array(popup.length).fill(false); // se una finestra è stata INTRODOTTA almeno una volta
  const introTimers = [];                                  // timer per le introduzioni programmate
  let monitorTimer = null;
  let restrictToIndex = null;                              // dopo #11, tieni solo lei
  let firstCloseCount = 0;                                 // contatore chiusure della #1
  let secondSpawned = false;                               // se abbiamo già introdotto la #2
  let started = false;                                     // avvio dopo primo click
  let startOnceRef = null;                                 // riferimento al listener iniziale
  let _hkSkipped = false;                                  // evita doppi skip

  // ---------- UTILS ----------
  function restartAudio() {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(() => {}); // se il browser blocca prima del primo gesto, ignoriamo
    } catch {}
  }

  function fadeOutTitles() { titles.classList.add('fadeout'); }
  function showTitles() {
    titles.classList.remove('hidden'); void titles.offsetWidth; titles.classList.add('show');
  }

  function featuresOf(cfg) {
    const { left, top, width, height } = cfg;
    return [
      `left=${left}`, `top=${top}`, `width=${width}`, `height=${height}`,
      'resizable=no','menubar=no','toolbar=no','location=no','status=no','scrollbars=no','popup=yes'
    ].join(',');
  }

  // child HTML con postMessage al close
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
      try{
        v.pause();
        if (!isNaN(v.duration)) v.currentTime = Math.max(0, v.duration - 0.001);
      }catch(e){}
    });
    const toGif = () => {
      document.body.innerHTML = '<img class="media" src="${srcGif}" alt="GIF fallback">';
    };
    v.addEventListener('error', () => {
      try{ v.src = "${srcMp4}"; v.load(); v.play().catch(toGif); }
      catch(e){ toGif(); }
    }, { once:true });

    // Avvisa il parent quando l'utente chiude la finestra (o si scarica)
    window.addEventListener('beforeunload', () => {
      try{
        if (window.opener && window.opener.postMessage) {
          window.opener.postMessage({ type:'popupClosed', index:${index} }, '*');
        }
      }catch(e){}
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

    // audio per ogni popup non finale (anche nelle coppie)
    if (index !== FINAL_INDEX && restart) {
      restartAudio();
    }

    // finale: #11 → chiudi il resto, ferma audio, handoff fase 2
    if (index === FINAL_INDEX) {
      try { audio.pause(); audio.currentTime = 0; } catch {}

      for (let i = 0; i < popup.length; i++) {
        if (i !== FINAL_INDEX && handles[i] && !handles[i].closed) {
          try { handles[i].close(); } catch {}
        }
      }
      introTimers.forEach(id => clearTimeout(id));

      restrictToIndex = FINAL_INDEX;
      fadeOutTitles();

      // HANDOFF alla seconda parte
      try {
        document.dispatchEvent(new CustomEvent("phase:assistant:start", {
          detail: {
            handle11: handles[FINAL_INDEX],
            position: { ...popup[FINAL_INDEX] }
          }
        }));
      } catch {}
    }
  }

  // --------- CATENA: 5s tra batch, dalla terza in poi coppie ---------
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
        if (restrictToIndex !== null) return; // se già finale, stop

        // apri tutte le finestre del batch
        indices.forEach((i) => {
          introduce(i, { restart: true }); // fa partire l'audio per ciascuna
        });

      }, (batchIdx + 1) * INTRO_GAP_MS); // 5s, 10s, 15s, 20s, 25s
      introTimers.push(id);
    });
  }

  // ---------- MONITOR ----------
  function startMonitoring() {
    monitorTimer = setInterval(() => {
      for (let i = 0; i < popup.length; i++) {
        // finale: tieni SOLO la #11
        if (restrictToIndex !== null && i !== FINAL_INDEX) {
          if (handles[i] && !handles[i].closed) { try { handles[i].close(); } catch {} }
          continue;
        }

        // persistenza: se introdotta ma assente/chiusa, riapri
        if (PERSISTENT && introduced[i] && (!handles[i] || handles[i].closed)) {
          if (i === 0) firstCloseCount++; // conteggio chiusure #1

          openOne(i);

          // ogni volta che RIAPRE un popup dal #2 in poi → audio
          if (i >= 1 && i !== FINAL_INDEX) {
            restartAudio();
          }

          // dopo 1 chiusura della #1 (alla sua RIAPERTURA) → introduce #2 e avvia catena
          if (i === 0 && firstCloseCount >= 1 && !secondSpawned) {
            secondSpawned = true;
            introduce(1);           // introduce #2 ora (fa partire audio)
            startChainFromSecond(); // poi #3 e coppie
          }
        }
      }
    }, MONITOR_MS);
  }

  // ---------- EVENTO: il child ci dice che è stato chiuso → audio subito ----------
  window.addEventListener('message', (ev) => {
    const d = ev.data || {};
    if (d && d.type === 'popupClosed') {
      const idx = +d.index;
      if (!Number.isNaN(idx) && idx >= 1 && idx !== FINAL_INDEX) {
        restartAudio();
      }
    }
  });

  // ---------- SKIP DIRETTO ALLA FASE 2 (H + K) ----------
  function skipToPhase2() {
    if (_hkSkipped) return;
    _hkSkipped = true;

    // segna come avviato e rimuovi il listener del primo click
    started = true;
    try { if (startOnceRef) document.removeEventListener('click', startOnceRef); } catch {}

    // ferma audio e timers della fase 1
    try { audio.pause(); audio.currentTime = 0; } catch {}
    introTimers.forEach(id => clearTimeout(id));
    if (monitorTimer) { clearInterval(monitorTimer); monitorTimer = null; }

    // apri/assicurati l'handle della #11
    if (!handles[FINAL_INDEX] || handles[FINAL_INDEX].closed) {
      openOne(FINAL_INDEX);
      introduced[FINAL_INDEX] = true;
    }

    // chiudi eventuali altre finestre già aperte
    for (let i = 0; i < popup.length; i++) {
      if (i !== FINAL_INDEX && handles[i] && !handles[i].closed) {
        try { handles[i].close(); } catch {}
      }
    }

    // stato "finale": resta solo la #11 e svanisci il titolo
    restrictToIndex = FINAL_INDEX;
    fadeOutTitles();

    // handoff verso la fase 2
    try {
      document.dispatchEvent(new CustomEvent("phase:assistant:start", {
        detail: {
          handle11: handles[FINAL_INDEX],
          position: { ...popup[FINAL_INDEX] }
        }
      }));
    } catch {}
  }

  // ---------- AVVIO ----------
  window.addEventListener('DOMContentLoaded', () => {
    showTitles();

    // Primo gesto dell'utente nel MAIN per avviare tutto:
    const startOnce = async () => {
      if (started) return;
      started = true;
      // 1) sblocca/avvia audio
      restartAudio();
      // 2) apri subito la #1 (senza riavviare di nuovo l'audio)
      introduce(0, { restart: false });
      // 3) avvia monitor
      startMonitoring();
      // rimuovi listener
      document.removeEventListener('click', startOnce);
    };
    startOnceRef = startOnce;
    document.addEventListener('click', startOnce, { once: true });

    // Click sul titolo: porta in primo piano TUTTE le finestre aperte,
    // poi rimetti #1 proprio davanti
    titles.addEventListener('click', () => {
      const openIndexes = [];
      for (let i = 0; i < handles.length; i++) {
        if (handles[i] && !handles[i].closed) openIndexes.push(i);
      }
      if (openIndexes.length === 0) return;

      openIndexes.forEach((i, k) => {
        setTimeout(() => {
          try { handles[i].focus(); } catch {}
        }, k * 40);
      });

      setTimeout(() => {
        if (handles[0] && !handles[0].closed) {
          try { handles[0].focus(); } catch {}
        }
      }, openIndexes.length * 40 + 20);
    });

    // Combinazione di tasti: H + K → skip diretto alla fase 2
    const pressedKeys = new Set();
    function onKeyDownHK(e){
      const k = (e.key || '').toLowerCase();
      if (k === 'h' || k === 'k') {
        pressedKeys.add(k);
        if (pressedKeys.has('h') && pressedKeys.has('k')) {
          e.preventDefault();
          skipToPhase2();
        }
      }
    }
    function onKeyUpHK(e){
      const k = (e.key || '').toLowerCase();
      pressedKeys.delete(k);
    }
    document.addEventListener('keydown', onKeyDownHK);
    document.addEventListener('keyup', onKeyUpHK);
  });
})();
