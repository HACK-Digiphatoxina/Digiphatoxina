(function () {
  const audio = document.getElementById('intro-audio');
  const titles = document.getElementById('titles');
  const popupNotice = document.getElementById('popupNotice');

  // ====== CONFIG ======
  const POPUPS = {
    persistent: true,          // riapre automaticamente le finestre chiuse
    reopenInterval: 1200,      // ms tra un controllo e l'altro
    keepOnlyIndexAfterAudio: 10 // tieni SOLO la #11 dopo l'audio (indice 10)
  };
  const defaultScale = 0.7;     // scala del media dentro la finestra (0–1)

  // ====== POSIZIONI/DIMENSIONI (puoi modificare) ======
  // Ora i src sono .webm (come hai convertito). Il codice farà fallback su .mp4 e .gif se servisse.
  const gifWindows = [
    { src: 'gif_lgm-30a/LGM-30A_9.webm',  width: 350, height: 330, left: 750,  top: 140, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_6.webm',  width: 400, height: 240, left: 500,  top: 650, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_3.webm',  width: 380, height: 210, left: 100,  top: 600, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_5.webm',  width: 400, height: 190, left: 360,  top: 320, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_2.webm',  width: 290, height: 220, left: 90,   top: 310, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_1.webm',  width: 250, height: 280, left: 130,  top: 50, scale: 0.85  },
    { src: 'gif_lgm-30a/LGM-30A_4.webm',  width: 280, height: 300, left: 430,  top: 20, scale: 0.85  },
    { src: 'gif_lgm-30a/LGM-30A_7.webm',  width: 400, height: 150, left: 900,  top: 700, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_8.webm',  width: 290, height: 300, left: 1170, top: 320, scale: 0.85 },
    { src: 'gif_lgm-30a/LGM-30A_10.webm', width: 250, height: 290, left: 1150, top: 35, scale: 0.85  },
    { src: 'gif_lgm-30a/LGM-30A_11.webm', width: 420, height: 10, left: 850,  top: 20, scale: 0.85 } // #11
  ];
  // Per scalare il media dentro la finestra: aggiungi `scale: 0.5` (o altro) su ciascun oggetto.

  // ====== STATE ======
  const openedWindows = [];
  const pendingTimers = []; // setTimeout ids per aperture ritardate
  let monitorTimer = null;
  let restrictToIndex = null; // quando impostato, solo quella finestra resta/apre

  // ---------- TITOLI ----------
  function showTitles() {
    titles.classList.remove('hidden');
    void titles.offsetWidth;   // forza reflow
    titles.classList.add('show');
  }
  function fadeOutTitles() { titles.classList.add('fadeout'); }

  window.addEventListener('DOMContentLoaded', async () => {
    showTitles();
    try {
      await audio.play();
      schedulePopups();
    } catch {
      // autoplay bloccato: la scritta diventa cliccabile
      titles.classList.add('clickable');
    }
  });

  titles.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); } catch {}
      schedulePopups(true);
      titles.classList.remove('clickable');
    }
  });

  // Alla fine: titoli out, tieni SOLO #11, cancella timer e chiudi il resto
  audio.addEventListener('ended', () => {
    fadeOutTitles();
    restrictToIndex = POPUPS.keepOnlyIndexAfterAudio; // 10

    // stoppa aperture in coda
    pendingTimers.forEach((tid, idx) => {
      if (idx !== restrictToIndex && tid) clearTimeout(tid);
    });

    // chiudi subito le finestre già aperte tranne quella da tenere
    openedWindows.forEach((w, idx) => {
      if (idx !== restrictToIndex && w && !w.closed) {
        try { w.close(); } catch {}
      }
    });
  });

  // ---------- APERTURA POPUP ----------
  function schedulePopups() {
    setTimeout(() => {
      const ok = openAllPopups(); // apertura progressiva
      if (!ok) {
        popupNotice.classList.remove('hidden');
        popupNotice.onclick = () => {
          popupNotice.classList.add('hidden');
          openAllPopups();
        };
      } else {
        popupNotice.classList.add('hidden');
      }
      if (POPUPS.persistent && !monitorTimer) startMonitoring();
    }, 2000);
  }

  // apre tutte con ritardo di 1s tra una e l'altra
  function openAllPopups() {
    gifWindows.forEach((cfg, idx) => {
      // se dobbiamo tenere solo una finestra, ignora le altre
      if (restrictToIndex !== null && idx !== restrictToIndex) {
        const w = openedWindows[idx];
        if (w && !w.closed) { try { w.close(); } catch {} }
        openedWindows[idx] = undefined;
        return;
      }

      const tid = setTimeout(() => {
        // guardia: se nel frattempo è stata imposta la modalità "solo #11", non aprire
        if (restrictToIndex !== null && idx !== restrictToIndex) return;
        const win = openOne(idx, cfg);
        if (win) openedWindows[idx] = win;
      }, idx * 1000); // 1s tra ciascuna finestra

      pendingTimers[idx] = tid;
    });

    // ritorno "ottimistico" perché le aperture sono async
    return true;
  }

  function openOne(idx, cfg) {
    const w = cfg.width ?? 320;
    const h = cfg.height ?? 240;
    const l = cfg.left ?? (50 + (idx % 5) * 340);
    const t = cfg.top  ?? (50 + Math.floor(idx / 5) * 260);
    const scale = cfg.scale ?? defaultScale;

    const features = [
      `left=${l}`, `top=${t}`, `width=${w}`, `height=${h}`,
      'resizable=no','menubar=no','toolbar=no','location=no',
      'status=no','scrollbars=no','popup=yes'
    ].join(',');

    const name = `gif_${idx+1}`;
    const child = window.open('', name, features);
    if (!child || child.closed) return null;

    const srcWebm = cfg.src;                                           // es. .../LGM-30A_1.webm
    const srcMp4  = cfg.src.replace(/\.webm$/i, '.mp4');               // fallback mp4
    const srcGif  = cfg.src.replace(/\.(webm|mp4)$/i, '.gif');         // fallback gif

    const safeTitle = (srcWebm.split('/').pop() || '').replace(/"/g,'&quot;');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    html,body{height:100%;margin:0;background:#fff;display:grid;place-items:center;}
    video.media{max-width:${scale*100}%;max-height:${scale*100}%;display:block;object-fit:contain}
    img.media{max-width:100%;max-height:100%;display:block}
    body{overflow:hidden}
  </style>
</head>
<body>
  <video class="media" id="m" autoplay muted playsinline preload="auto" src="${srcWebm}"></video>
  <script>
    const v = document.getElementById('m');

    // fine → fermo sull'ultimo frame
    v.addEventListener('ended', () => {
      try{
        v.pause();
        if (!isNaN(v.duration)) v.currentTime = Math.max(0, v.duration - 0.001);
      }catch(e){}
    });

    // se il WebM fallisce, prova MP4; se fallisce anche, passa a GIF
    const toGif = () => {
      document.body.innerHTML = '<img class="media" src="${srcGif}" alt="GIF fallback">';
    };

    v.addEventListener('error', () => {
      try{
        v.src = "${srcMp4}";
        v.load();
        v.play().catch(toGif);
      }catch(e){ toGif(); }
    }, { once:true });
  </script>
</body>
</html>`;

    child.document.open();
    child.document.write(html);
    child.document.close();

    return child;
  }

  // ---------- MONITOR & PERSISTENZA ----------
  function startMonitoring() {
    monitorTimer = setInterval(() => {
      gifWindows.forEach((cfg, idx) => {
        // se deve restare SOLO la #11, chiudi le altre e non riaprirle
        if (restrictToIndex !== null && idx !== restrictToIndex) {
          const w = openedWindows[idx];
          if (w && !w.closed) { try { w.close(); } catch {} }
          openedWindows[idx] = undefined;
          return;
        }
        // se manca o è stata chiusa, riapri
        const w = openedWindows[idx];
        if (!w || w.closed) {
          const nw = openOne(idx, cfg);
          if (nw) openedWindows[idx] = nw;
        }
      });
    }, POPUPS.reopenInterval);
  }
})();
