// ===== FASE 2 - Hello Kitty (8 immagini, sleep con micro-loop, finale glitch con loop centrale + gif swap + redirect) =====
(function () {
  // ---------- CONFIG ----------
  const CHARACTER = {
    enter: "hk_animation/hk_enter.webm",
    hello: "hk_animation/hk_hello.webm",
    ehi: "hk_animation/hk_ehi.webm",
    standbySleep: "hk_animation/hk_standby_sleep.webm",
    glitch: "hk_animation/hk_glitch.webm", // <-- finale
    poses: [
      "hk_animation/hk_info_handup.webm",
      "hk_animation/hk_info_handdown.webm",
      "hk_animation/hk_info_lefthand.webm",
      "hk_animation/hk_info_thumb.webm",
      "hk_animation/hk_info_thumbstar.webm" 
    ],
    size: 240,
    pos: { right: 0, bottom: 400 },
    standbyPng: "hk_animation/hk_default.png"
  };

  const IDLE_MS = 12000;            // inattività → sleep
  // Ampiezza dei segmenti loopati (ms)
  const STANDBY_WINDOW_MS = 120;    // sleep: 3–5 frame
  const GLITCH_WINDOW_MS = 420;    // glitch finale: più ampio

  const MAX_IMAGES = 8;             // 8 immagini (da 21)
  const IMAGE_SIZE = { w: 420, h: 290 };
  const WALLPAPER_SRC = "hk_animation/hk_wallpaper.jpg";

  // Dopo glitch: 8s GIF → hide, +2s → redirect
  const GIF_LIFETIME_MS = 8000;
  const POST_GIF_PAUSE_MS = 2000;
  const PILL_REDIRECT_URL = "eo-pill/eo-pill.html"; // <--- CAMBIA con la tua pillola .jpg

  const PANELS_21 = [
    { id: 'ic_bbc', src: 'hk_animation/panels/ic_bbc.jpg' },
    { id: 'ic_nck', src: 'hk_animation/panels/ic_nck.jpg' },
    { id: 'ic_ytk', src: 'hk_animation/panels/ic_ytk.jpg' },
    { id: 'ic_tbsa', src: 'hk_animation/panels/ic_tbsa.jpg' },
    { id: 'ic_ja', src: 'hk_animation/panels/ic_ja.jpg' },
    { id: 'ic_omg', src: 'hk_animation/panels/ic_omg.jpg' },
    { id: 'ic_hbb', src: 'hk_animation/panels/ic_hbb.jpg' },
    { id: 'ic_jj', src: 'hk_animation/panels/ic_jj.jpg' },
    { id: 'ic_pp', src: 'hk_animation/panels/ic_pp.jpg' },
    { id: 'ic_abrc', src: 'hk_animation/panels/ic_abrc.jpg' },
    { id: 'ic_fifa', src: 'hk_animation/panels/ic_fifa.jpg' },
    { id: 'ic_nest', src: 'hk_animation/panels/ic_nest.jpg' },
    { id: 'ic_gyusa', src: 'hk_animation/panels/ic_gyusa.jpg' },
    { id: 'ic_tele', src: 'hk_animation/panels/ic_tele.jpg' },
    { id: 'ic_uber', src: 'hk_animation/panels/ic_uber.jpg' },
    { id: 'ic_enron', src: 'hk_animation/panels/ic_enron.jpg' },
    { id: 'ic_ther', src: 'hk_animation/panels/ic_ther.jpg' },
    { id: 'ic_oxfam', src: 'hk_animation/panels/ic_oxfam.jpg' },
    { id: 'ic_volk', src: 'hk_animation/panels/ic_volk.jpg' },
    { id: 'ic_bp', src: 'hk_animation/panels/ic_bp.jpg' },
    { id: 'ic_737', src: 'hk_animation/panels/ic_737.jpg' }
  ];
  // ====== LINGUE ======
  let currentLang = 'eng'; // 🇬🇧 di default

  const TEXTS = {
    eng: {
      intro: "Hi! I’m Hello Kitty, happy to help! Ready to continue? Press this little button.",
      button: "pulsantino" // se vuoi tradurlo: "little button"
    },
    ita: {
      intro: "Ciao! Sono Hello Kitty, felice di aiutarti! Pronta a proseguire? Premi questo pulsantino.",
      button: "pulsantino"
    }
  };

  // didascalie per pannelli (21) — ENG + ITA
  const CAPTIONS = {
    eng: {
      ic_bbc: "Research once said the BBC was the voice of truth… at least until they handed the mic to Jimmy Savile 🎤. Moral of the story? Spotlight hides the shadows better than anything else.",
      ic_nck: "Nickelodeon, huh! They called it ‘children’s entertainment’—but the fun was only for the grown-ups. 👀 Off-screen scripts were filled with abuse. Wanna take a peek backstage? ☺️",
      ic_ytk: "Elsa singing, Peppa Pig dancing 🎶 So wholesome, right? Everything perfectly tailored for kids! Want me to share the secret playlist? 🧃✨",
      ic_tbsa: "Scout handbook: pitch tents, light fires, and… master the art of cover-ups! 📖🎀 Straight from your friendly kitten!",
      ic_ja: "Don’t let scandals ruin your brand: just wait 30 years and launch a new boyband! 🎶 Want me to pencil it into your calendar? 📘",
      ic_omg: "A wise man once said: it’s not catfishing, it’s just digital cosplay! 🐟 Need me to sketch it out for you with baby-pink ribbons? 🍼🎀",
      ic_hbb: "Moderators exist! …Somewhere. In theory. Maybe… still on vacation since 2009. 🌈",
      ic_jj: "Were you looking for stardust, or baby powder with a little something extra? Glitter’s free, coughing is included. 🌙🧸",
      ic_pp: "Wanna laugh? 😸 OxyContin was so strong it erased everything: pain, doubts… and entire communities. 🎉",
      ic_abrc: "Meow! 😸 Craving an exclusive look? Here’s the Limited Rights™ collection: more survival code than dress code! 👗🙃",
      ic_fifa: "Crowd chants do a perfect job of covering up odd numbers in the books! 💸 Want me to turn the accounts into a coloring chart? 💹",
      ic_nest: "Breaking news: social catastrophe? Nah—just another chance to launch a cheerful hashtag! 📱🌈",
      ic_gyusa: "You did so well speaking out. Your courage is beautiful! 🥇🌈 Now we can smile together… and quietly forget everything. 🔕",
      ic_tele: "I like to think friends really listen 👂… Want me to show you how to intercept a call? It’s easier than you think! ☺️",
      ic_uber: "How cute: a worker complains and the app just disconnects them—no questions asked! 🍿 Isn’t that little power button adorable? 📱",
      ic_enron: "Did you know Enron was voted “Most Innovative Company” 🏆 seven years in a row? (Even illusions require creativity!) 🎨",
      ic_ther: "Motivational tip: who needs clinical trials? Just believe really hard and lie with confidence! 🌟🧁",
      ic_oxfam: "Kawaii tip of the day 🍬: Care first, exploit later… or was it the other way around? 😅",
      ic_volk: "Hey! Looking for the German word for ‘scandal’? 📖 Maybe just ask Volkswagen—they’ve got more examples than you’ll ever need! 👀",
      ic_bp: "An environmental disaster is just another chance to add rainbows to corporate brochures! 🌈 As for the ocean… grab a bucket and spade! 🌊🐟",
      ic_737: "How sweet! A plane that flies itself ✈️… Oh wait—you meant a crash? Want me to turn it into a glittery greeting card? ✨💫"
    },
    ita: {
      ic_bbc: "Secondo le ricerche la BBC era la voce della verità.. o almeno finché non ha scelto di tenere il microfono a Jimmy Savile 🎤. Vuoi sapere la morale? Le luci della ribalta coprono molto bene le ombre.",
      ic_nck: "Nickelodeon eh! Dicevano ‘intrattenimento per bambini’ e invece a divertirsi erano solo gli adulti. 👀 Non a caso il copione fuori scena vantava solo episodi di abusi sessuali. Vuoi che ti mostri il ‘dietro le quinte’? ☺️",
      ic_ytk: "Elsa che canta, Peppa Pig che balla 🎶Che divertente… Tutto a misura di bambino! Vuoi che ti inoltri la playlist segreta?🧃✨",
      ic_tbsa: "Manuale degli scout: costruisci tende, accendi fuochi e… impara l’arte del cover-up! 📖🎀Parola di gattino!",
      ic_ja: "Non lasciare che gli scandali distruggano il tuo brand: aspetta 30 anni e lancia una nuova boyband! 🎶 Vuoi che te lo metta in agenda? 📘",
      ic_omg: "Un uomo saggio una volta disse: non è catfishing, è solo cosplay digitale! 🐟 Vuoi che te lo spieghi con un disegnino esplicativo? 🍼🎀",
      ic_hbb: "I moderatori esistono!...Da qualche parte. In teoria. Forse.. in ferie dal 2009. 🌈",
      ic_jj: "Stavi cercando polvere di stelle o talco per bambini con effetti aggiunti? il glitter è gratis, la tosse pure. 🌙🧸",
      ic_pp: "Vuoi ridere? 😸 L’OxyContin era così potente che faceva sparire tutto: il dolore, i dubbi… e intere comunità.🎉",
      ic_abrc: "Miao! 😸 Vuoi un look esclusivo? Ecco la collezione Diritti Limitati™: il dress code sembra più un codice di sopravvivenza! 👗🙃",
      ic_fifa: "I cori della folla coprono perfettamente i numeri strani nei conti! 💸Vuoi che ti trasformi il bilancio in un diagramma da colorare? 💹",
      ic_nest: "Breaking news: catastrofe sociale? Nah, è solo un’occasione per inaugurare un nuovo hashtag positivo! 📱🌈",
      ic_gyusa: "Hai fatto benissimo a dire tutto. Il tuo coraggio è splendido! 🥇🌈 Ora possiamo sorridere insieme e dimenticare tutto… 🔕",
      ic_tele: "Mi piace pensare che gli amici si ascoltino con attenzione 👂…Vuoi che ti spieghi come intercettare una conversazione? È più facile di quanto credi! ☺️",
      ic_uber: "Che bello: se un lavoratore si lamenta può essere disconnesso dall’app senza spiegazioni! 🍿 Non è adorabile questo pulsantino di potere? 📱",
      ic_enron: "Sapevi che Enron ha vinto premi per “azienda più innovativa”? 🏆 7 anni di fila! (Anche l'illusione richiede creatività!) 🎨",
      ic_ther: "Messaggio motivazionale: chi ha detto che servono prove cliniche? Basta crederci fortissimo e mentire con sicurezza! 🌟🧁",
      ic_oxfam: "Consiglio kawaii del giorno 🍬: Cura prima, abusa poi… o era il contrario? 😅",
      ic_volk: "Ehi! Sembra che tu stia cercando la traduzione di ‘scandalo’ in tedesco. 📖 Vuoi che chieda direttamente a Volkswagen? Forse hanno più esempi di quanti ne servano! 👀",
      ic_bp: "Un disastro ambientale è solo un’opportunità per mettere più arcobaleni nelle brochure aziendali! 🌈 Per quanto riguarda l’oceano… ti consiglio secchiello e paletta! 🌊🐟",
      ic_737: "Che carino! Un aereo che sa pilotarsi da solo ✈️... Sembra che tu stia parlando di un disastro aereo! Vuoi che ti aiuti a trasformarlo in un biglietto con i glitter? ✨💫"
    }
  };

  // helper traduzioni
  function tIntro() { return (TEXTS[currentLang]?.intro) || TEXTS.ita.intro; }
  function tBtn() { return (TEXTS[currentLang]?.button) || TEXTS.ita.button; }
  function tCaption(id) { return (CAPTIONS[currentLang]?.[id]) || (CAPTIONS.ita?.[id]) || "…"; }

  // UI switch bandierine
  function initLangSwitch() {
    const sw = document.getElementById('lang-switch');
    if (!sw) return;
    sw.classList.add('show');

    const btns = sw.querySelectorAll('.lang');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (!lang || lang === currentLang) return;
        currentLang = lang;

        // toggle stato visivo
        btns.forEach(b => {
          const isActive = b === btn;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        });

        // se la bolla intro è visibile → ricalcolo testo e altezza (no rifare typewriter per evitare “salti”)
        if (introBubbleEl) {
          const textEl = introBubbleEl.querySelector('#hk_bubble_text');
          const btnEl = introBubbleEl.querySelector('#hk_btn');
          const newTxt = tIntro();
          btnEl.textContent = tBtn();
          applyBubbleFixedHeight(introBubbleEl, textEl, newTxt, { hasButton: true });
          textEl.textContent = newTxt; // set diretto, senza riscrittura progressiva
        }

        // se la bolla info è visibile → aggiorno testo
        if (infoBubbleEl) {
          const textEl = infoBubbleEl.querySelector('#hk_info_text');
          const pid = infoBubbleEl.dataset?.panelIdLive; // lo settiamo sotto quando apriamo la bubble
          if (pid) {
            const newTxt = tCaption(pid);
            applyBubbleFixedHeight(infoBubbleEl, textEl, newTxt, { hasButton: false });
            textEl.textContent = newTxt;
          }
        }
      });
    });
  }

  // z-index
  const Z = { wallpaper: 0, images: 10, bubbles: 20, character: 30 };

  // ---------- STATE ----------
  let h11Handle = null; // da Fase 1
  let charEl = null, vA = null, vB = null, active = 'A', standbyImg = null;
  let introBubbleEl = null, infoBubbleEl = null, wallpaper = null;

  let sequence = [];           // pannelli pickati (8)
  let currentIndex = -1;       // indice dell’ultima immagine SPAWNATA
  const domImages = [];        // <img> persistenti

  let infoCycleActive = false, typingDone = false, cooldownDone = false;
  let spawnAfterInfo = false;    // true solo se la bubble riguarda l’ultima immagine apparsa

  // idle / glitch
  let idleTimer = null, standbyLooping = false, segmentLoopStopper = null;
  let glitching = false;       // <--- quando true: disabilita completamente lo sleep

  // ---------- UTILS ----------
  const pick = arr => arr[(Math.random() * arr.length) | 0];

  function computeBottomOffset() {
    const h = window.innerHeight || 900;
    if (h <= 700) return 180;
    if (h <= 820) return 140;
    return CHARACTER.pos.bottom;
  }

  function freezeLastFrame(v) { try { v.pause(); if (!isNaN(v.duration)) v.currentTime = Math.max(0, v.duration - 0.001); } catch { } }
  function registerActivity() {
    if (!glitching) {
      resetIdleTimer();
      if (standbyLooping) { exitStandby(); }
    }
  }
  function resetIdleTimer() {
    if (glitching) return; // niente idle dopo glitch
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(enterStandby, IDLE_MS);
  }

  // ---- doppio video + PNG standby ----
  function getActiveV() { return active === 'A' ? vA : vB; }
  function getHiddenV() { return active === 'A' ? vB : vA; }
  function setVisible(video, on) { if (!video) return; video.style.opacity = on ? '1' : '0'; video.style.zIndex = on ? '2' : '1'; }
  function hardHide(video) { if (!video) return; try { video.pause(); } catch { } try { video.removeAttribute('src'); video.load(); } catch { } video.currentTime = 0; setVisible(video, false); }
  function swapLayersNow() { const oldA = getActiveV(), newA = getHiddenV(); setVisible(newA, true); hardHide(oldA); active = (active === 'A') ? 'B' : 'A'; }
  function loadOn(video, src) { return new Promise(res => { const onReady = () => { video.removeEventListener('canplaythrough', onReady); res(); }; video.addEventListener('canplaythrough', onReady, { once: true }); video.src = src; video.load(); }); }
  function showStandby() { if (standbyImg) standbyImg.style.opacity = '1'; }
  function hideStandby() { if (standbyImg) standbyImg.style.opacity = '0'; }

  async function playInstant(src, { loop = false, startPercent = null, pauseAtStart = false, onEnded = null, useStandby = true } = {}) {
    const hidden = getHiddenV();
    hidden.loop = loop; hidden.muted = true; hidden.playsInline = true; hidden.preload = 'auto';
    hidden.style.willChange = 'opacity, transform';
    if (useStandby) showStandby();
    await loadOn(hidden, src);
    if (startPercent != null) { const d = hidden.duration || 0; if (d > 0) hidden.currentTime = d * startPercent; }
    if (!pauseAtStart) { try { await hidden.play(); } catch { } } else { hidden.pause(); }
    await new Promise(r => requestAnimationFrame(r));
    swapLayersNow();
    const act = getActiveV(); getHiddenV().onended = null; act.onended = onEnded || null;
    if (useStandby) {
      if (!pauseAtStart) {
        const hideNow = () => { hideStandby(); act.removeEventListener('playing', hideNow); };
        act.addEventListener('playing', hideNow, { once: true }); setTimeout(hideStandby, 150);
      } else { requestAnimationFrame(() => hideStandby()); }
    }
    return act;
  }

  // ---- loop di un segmento centrale (ampiezza in ms) ----
  function startSegmentLoopMs(video, windowMs) {
    stopSegmentLoop(); // pulizia se c'era un loop attivo
    standbyLooping = true;
    const d = video.duration || 0; if (!d) return;
    const center = d / 2;                     // secondi
    const halfWinSec = (windowMs / 1000) / 2; // metà finestra
    try { video.currentTime = Math.max(0, center - halfWinSec); } catch { }
    const handler = () => {
      const t = video.currentTime;
      if (t >= center + halfWinSec) {
        try { video.currentTime = Math.max(0, center - halfWinSec); } catch { }
      }
    };
    video.addEventListener('timeupdate', handler);
    const iv = setInterval(handler, 12);
    segmentLoopStopper = () => { video.removeEventListener('timeupdate', handler); clearInterval(iv); segmentLoopStopper = null; };
  }
  function stopSegmentLoop() { if (segmentLoopStopper) segmentLoopStopper(); standbyLooping = false; }

  async function enterStandby() {
    if (glitching) return; // disabilitato in glitch
    const act = await playInstant(CHARACTER.standbySleep, { loop: false, useStandby: true });
    startSegmentLoopMs(act, STANDBY_WINDOW_MS);
  }
  async function exitStandby() {
    if (glitching) return; // disabilitato in glitch
    const act = getActiveV();
    stopSegmentLoop();
    try { act.onended = () => { freezeLastFrame(act); showStandby(); }; await act.play(); }
    catch { showStandby(); }
  }

  // ---- personaggio + wallpaper ----
  function ensureWallpaper() {
    if (wallpaper) return wallpaper;
    const wp = document.createElement('div');
    wp.className = 'h-wallpaper';
    wp.style.position = 'fixed';
    wp.style.inset = '0';
    wp.style.backgroundPosition = 'center';
    wp.style.backgroundSize = 'cover';
    wp.style.backgroundRepeat = 'no-repeat';
    wp.style.opacity = '0';
    wp.style.transition = 'opacity 400ms ease';
    wp.style.pointerEvents = 'none';
    wp.style.zIndex = String(Z.wallpaper);
    document.body.appendChild(wp);
    wallpaper = wp;
    return wp;
  }

  function mountCharacter() {
    charEl = document.createElement('div');
    charEl.className = 'h-char h-noselect';
    charEl.style.right = CHARACTER.pos.right + 'px';
    charEl.style.bottom = computeBottomOffset() + 'px';
    charEl.style.width = CHARACTER.size + 'px';
    charEl.style.position = 'fixed';
    charEl.style.zIndex = String(Z.character);

    vA = document.createElement('video'); vB = document.createElement('video');
    [vA, vB].forEach(v => { v.style.position = 'absolute'; v.style.inset = '0'; v.style.width = '100%'; v.style.height = 'auto'; v.style.zIndex = '1'; v.style.opacity = '0'; v.style.pointerEvents = 'none'; v.playsInline = true; v.preload = 'auto'; v.muted = true; });
    vA.style.zIndex = '2'; vA.style.opacity = '1';
    charEl.appendChild(vA); charEl.appendChild(vB);

    standbyImg = document.createElement('img');
    standbyImg.src = CHARACTER.standbyPng; standbyImg.alt = 'HK';
    standbyImg.style.position = 'absolute'; standbyImg.style.inset = '0'; standbyImg.style.width = '100%'; standbyImg.style.height = 'auto';
    standbyImg.style.zIndex = '3'; standbyImg.style.opacity = '0'; standbyImg.style.transition = 'opacity 80ms linear';
    charEl.appendChild(standbyImg);

    introBubbleEl = document.createElement('div');
    introBubbleEl.className = 'h-bubble';
    introBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_bubble_text"></span><button type="button" class="h-btn" id="hk_btn">pulsantino</button>`;
    charEl.appendChild(introBubbleEl);

    charEl.addEventListener('click', () => { registerActivity(); bringImagesToFront(); });

    document.body.appendChild(charEl);
    requestAnimationFrame(() => charEl.classList.add('show'));
    addEventListener('resize', () => { if (charEl) charEl.style.bottom = computeBottomOffset() + 'px'; });

    ensureWallpaper();
  }

  function typeWriter(el, text, cps = 24, done) {
    const ms = Math.max(18, Math.round(1000 / cps));
    el.textContent = ''; let i = 0; (function tick() { if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, ms); } else { done && done(); } })();
  }

  // --- bubble sizing fisso (no “respiro” mentre scrive)
  function createBubbleMeasurer() {
    const probe = document.createElement('div');
    probe.style.position = 'absolute'; probe.style.visibility = 'hidden'; probe.style.pointerEvents = 'none'; probe.style.zIndex = '-1';
    probe.style.whiteSpace = 'pre-wrap'; probe.style.letterSpacing = '.2px'; probe.style.font = '300 13px/1.25 "Public Sans", sans-serif';
    probe.style.width = '200px'; probe.style.boxSizing = 'content-box';
    document.body.appendChild(probe);
    return function measure(text, { hasButton = false, bubblePaddingV = 14, minH = 72, maxH = 160 } = {}) {
      probe.textContent = text || '';
      const textH = probe.scrollHeight; const btnH = hasButton ? 28 : 0;
      const total = Math.ceil(textH + bubblePaddingV + btnH);
      return Math.max(minH, Math.min(maxH, total));
    };
  }
  const measureBubble = createBubbleMeasurer();
  function applyBubbleFixedHeight(bubbleEl, textEl, finalText, { hasButton = false } = {}) {
    const paddingV = 8 + 6;
    const finalH = measureBubble(finalText, { hasButton, bubblePaddingV: paddingV, minH: 72, maxH: 160 });
    bubbleEl.style.height = finalH + 'px';
    const reservedForBtn = hasButton ? 28 : 0;
    const maxTextH = Math.max(0, finalH - paddingV - reservedForBtn);
    textEl.style.maxHeight = maxTextH + 'px';
  }

  // ====== SEQUENZA IMMAGINI (8 pickate a caso) ======
  function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  function buildSequence() {
    sequence = shuffle(PANELS_21.slice()).slice(0, MAX_IMAGES);
    currentIndex = -1;
  }

  function bringImagesToFront() {
    const imgs = document.querySelectorAll('.p2-image');
    let z = Z.images; imgs.forEach(img => { img.style.zIndex = String(z++); });
  }

  function getAvoidRects() {
    const list = [];
    if (charEl) list.push(charEl.getBoundingClientRect());
    if (introBubbleEl) list.push(introBubbleEl.getBoundingClientRect());
    if (infoBubbleEl) list.push(infoBubbleEl.getBoundingClientRect());
    return list;
  }
  function rectsOverlap(a, b) { return !(a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top); }
  function placeNonOverlappingDom(w, h) {
    const avoid = getAvoidRects();
    const margin = 20;
    const maxW = (window.innerWidth) - w - margin;
    const maxH = (window.innerHeight) - h - margin;
    for (let t = 0; t < 120; t++) {
      let left = Math.floor(margin + Math.random() * Math.max(1, maxW));
      let top = Math.floor(margin + Math.random() * Math.max(1, maxH));
      // Evita l’angolo in basso a destra dove c’è il personaggio
      if (left > (window.innerWidth - w - 100) && top > (window.innerHeight - h - 140)) continue;
      const cand = { left, top, width: w, height: h };
      let ok = true; for (const r of avoid) { if (rectsOverlap(cand, r)) { ok = false; break; } }
      if (ok) return cand;
    }
    return { left: margin, top: margin, width: w, height: h };
  }

  function spawnNextImage() {
    if (currentIndex + 1 >= sequence.length) return;
    const panel = sequence[currentIndex + 1];
    const pos = placeNonOverlappingDom(IMAGE_SIZE.w, IMAGE_SIZE.h);
    const img = document.createElement('img');
    img.src = panel.src; img.alt = panel.id; img.className = 'p2-image';
    img.style.position = 'fixed'; img.style.left = pos.left + 'px'; img.style.top = pos.top + 'px';
    img.style.width = IMAGE_SIZE.w + 'px'; img.style.height = 'auto';
    img.style.zIndex = String(Z.images); img.style.boxShadow = '0 4px 14px rgba(0,0,0,.18)'; img.style.background = '#fff';
    img.style.transition = 'transform 180ms ease, opacity 180ms ease'; img.style.opacity = '0';
    img.dataset.seqIndex = String(currentIndex + 1); // indice che assumerà
    img.dataset.panelId = panel.id;

    document.body.appendChild(img);
    requestAnimationFrame(() => img.style.opacity = '1');

    img.addEventListener('click', () => {
      registerActivity();
      const myIndex = parseInt(img.dataset.seqIndex, 10);
      const panelId = img.dataset.panelId;
      if (infoCycleActive || introBubbleEl) return;
      // ultima immagine apparsa? allora dopo il testo spawniamo una nuova (se non siamo all’ultima della sequenza)
      spawnAfterInfo = (myIndex === currentIndex) && (currentIndex < MAX_IMAGES - 1);
      showInfoBubbleFor(panelId);
    });

    domImages.push(img);
    currentIndex++;
    bringImagesToFront();
  }

  // ----- bubble INTRO -----
  function showIntroBubble() {
    const txt = tIntro();
    const textEl = introBubbleEl.querySelector('#hk_bubble_text');
    const btn = introBubbleEl.querySelector('#hk_btn');
    btn.textContent = tBtn();

    applyBubbleFixedHeight(introBubbleEl, textEl, txt, { hasButton: true });
    introBubbleEl.classList.add('show');

    typeWriter(textEl, txt, 24, () => {
      btn.classList.add('show');
      btn.addEventListener('click', onIntroBtn, { once: true });
    });
  }

  function hideIntroBubble() { introBubbleEl.classList.add('hide'); setTimeout(() => { try { introBubbleEl.remove(); } catch { }; introBubbleEl = null; }, 220); }

  // ----- bubble INFO -----
  function showInfoBubbleFor(panelId) {
    if (infoCycleActive) return;
    infoCycleActive = true; typingDone = false; cooldownDone = false;

    if (infoBubbleEl) { try { infoBubbleEl.remove(); } catch { } }
    infoBubbleEl = document.createElement('div');
    infoBubbleEl.className = 'h-bubble h-bubble--info';
    infoBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_info_text"></span>`;
    infoBubbleEl.dataset.panelIdLive = panelId;
    charEl.appendChild(infoBubbleEl);
    requestAnimationFrame(() => infoBubbleEl.classList.add('show'));

    const text = tCaption(panelId);
    const textEl = infoBubbleEl.querySelector('#hk_info_text');
    applyBubbleFixedHeight(infoBubbleEl, textEl, text, { hasButton: false });

    // posa “a metà”
    playPoseHalfInstant();

    typeWriter(textEl, text, 26, () => {
      typingDone = true;
      setTimeout(() => { cooldownDone = true; tryFinishInfoCycle(); }, 2000);
    });
  }
  function hideInfoBubble() { if (!infoBubbleEl) return; infoBubbleEl.classList.add('hide'); setTimeout(() => { try { infoBubbleEl.remove(); } catch { }; infoBubbleEl = null; }, 220); }

  async function playPoseHalfInstant() {
    const src = pick(CHARACTER.poses);
    await playInstant(src, { loop: false, startPercent: 0.5, pauseAtStart: true, useStandby: true });
  }

  async function tryFinishInfoCycle() {
    if (!(typingDone && cooldownDone)) return;
    const act = getActiveV();
    act.onended = () => { freezeLastFrame(act); finalizeInfoCycle(); };
    try { await act.play(); } catch { finalizeInfoCycle(); }
  }

  function finalizeInfoCycle() {
    hideInfoBubble();
    infoCycleActive = false;

    // Se dobbiamo spawnare la prossima immagine → fallo
    if (spawnAfterInfo) {
      spawnAfterInfo = false;
      spawnNextImage();
      return;
    }

    // Se NON dobbiamo spawnare significa che abbiamo appena concluso l'ULTIMA immagine (indice == MAX_IMAGES-1)
    // → entra nel GLITCH finale
    if (currentIndex >= MAX_IMAGES - 1) {
      startGlitchFinale();
    }
  }

  // ----- Glitch finale: no idle, loop centrale + swap immagini → gif → fadeout → redirect -----
  async function startGlitchFinale() {
    glitching = true; // blocca per sempre lo sleep
    // stop e pulizia dei timer idle
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    stopSegmentLoop();

    // 1) Glitch con loop centrale più ampio
    const act = await playInstant(CHARACTER.glitch, { loop: false, useStandby: true });
    startSegmentLoopMs(act, GLITCH_WINDOW_MS); // loop permanente finché stiamo in pagina

    // 2) Converti tutte le immagini presenti in GIF (stesso nome, estensione .gif)
    const nowToGif = [];
    domImages.forEach(img => {
      if (!img || !img.src) return;
      const gifSrc = img.src.replace(/\.jpg(\?.*)?$/i, '.gif');
      if (gifSrc !== img.src) {
        // Precarica la gif per evitare flash
        const preload = new Image();
        preload.onload = () => { img.src = gifSrc; };
        preload.src = gifSrc;
        nowToGif.push(img);
      }
    });

    // 3) Dopo 8s: rimuovi tutte le GIF
    setTimeout(() => {
      domImages.forEach(img => {
        if (!img || !img.parentNode) return;
        img.style.transition = 'opacity 300ms ease';
        img.style.opacity = '0';
        setTimeout(() => { try { img.remove(); } catch { } }, 320);
      });

      // 4) Dopo altri 2s: redirect alla pillola
      setTimeout(() => {
        try { window.location.href = PILL_REDIRECT_URL; }
        catch { /* fallback: niente */ }
      }, POST_GIF_PAUSE_MS);

    }, GIF_LIFETIME_MS);
  }

  // ----- INTRO BUTTON → wallpaper + spegni popups + prima immagine -----
  async function onIntroBtn() {
    // 1) wallpaper
    const wp = ensureWallpaper();
    wp.style.backgroundImage = `url("${WALLPAPER_SRC}")`;
    requestAnimationFrame(() => { wp.classList.add('show'); wp.style.opacity = '1'; });

    // 2) disabilita fase 1 + chiudi #11
    try { document.dispatchEvent(new Event('phase:popups:disable')); } catch { }
    if (h11Handle && !h11Handle.closed) { try { h11Handle.close(); } catch { } }
    h11Handle = null;

    // 3) passa a “ehi” in loop
    hideIntroBubble();
    await playInstant(CHARACTER.ehi, { loop: true, useStandby: true });

    // 4) genera sequenza (8) e spawna la prima
    buildSequence();
    spawnNextImage();

    resetIdleTimer();
  }

  // ----- START -----
  async function startPhase2(detail) {
    h11Handle = detail?.handle11 || null;
    document.addEventListener('click', registerActivity);
    ensureWallpaper(); // crea subito il nodo
    mountCharacter();
    initLangSwitch();

    // ENTER (senza PNG) → freeze → +1s HELLO (con PNG) → intro bubble
    await playInstant(CHARACTER.enter, { loop: false, useStandby: false });
    getActiveV().onended = async () => {
      freezeLastFrame(getActiveV());
      setTimeout(async () => { await playInstant(CHARACTER.hello, { loop: false, useStandby: true }); showIntroBubble(); }, 1000);
    };
  }

  document.addEventListener("phase:assistant:start", (e) => { startPhase2(e.detail || {}); });
})();
