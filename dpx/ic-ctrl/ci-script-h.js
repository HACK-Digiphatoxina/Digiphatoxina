/* ===== FASE 2 - Hello Kitty ===== */
(function () {
  // ---------- CONFIG ----------
  const CHARACTER = {
    enter: "hk_animation/hk_enter.webm",
    hello: "hk_animation/hk_hello.webm",
    ehi:   "hk_animation/hk_clickplay.webm",
    standbySleep: "hk_animation/hk_standby_sleep.webm",
    glitch: "hk_animation/hk_glitch.webm",
    poses: [
      "hk_animation/hk_info_handup.webm",
      "hk_animation/hk_info_handdown.webm",
      "hk_animation/hk_info_lefthand.webm",
      "hk_animation/hk_info_thumb.webm",
      "hk_animation/hk_info_thumbstar.webm"
    ],
    size: 240,
    pos: { right: 0, bottom: 120 },
    standbyPng: "hk_animation/hk_default.png"
  };

  const IDLE_MS = 12000;
  const STANDBY_WINDOW_MS = 380;
  const GLITCH_WINDOW_MS  = 420;

  const MAX_IMAGES = 8;
  const IMAGE_SIZE = { w: 360, h: 250 };

  const WALLPAPER_SRC   = "hk_animation/hk_wallpaper.jpg";
  const IC_AUDIO_SRC    = "audio_ic.mp3"; // audio ON

  // Ritmo “caotico”
  const CASCADE_MS = 300;       // base tra un’apparizione e la successiva
  const CASCADE_JITTER = 100;   // ± jitter

  // Fine sequenza
  const POST_GLITCH_PAUSE  = 1800;
  const PILL_REDIRECT_URL  = "eo-pill/eo-pill.html";

  const PANELS_21 = [
    { id: 'ic_bbc',  src: 'hk_animation/panels/ic_bbc.png'  },
    { id: 'ic_nck',  src: 'hk_animation/panels/ic_nck.png'  },
    { id: 'ic_ytk',  src: 'hk_animation/panels/ic_ytk.png'  },
    { id: 'ic_tbsa', src: 'hk_animation/panels/ic_tbsa.png' },
    { id: 'ic_ja',   src: 'hk_animation/panels/ic_ja.png'   },
    { id: 'ic_omg',  src: 'hk_animation/panels/ic_omg.png'  },
    { id: 'ic_hbb',  src: 'hk_animation/panels/ic_hbb.png'  },
    { id: 'ic_jj',   src: 'hk_animation/panels/ic_jj.png'   },
    { id: 'ic_pp',   src: 'hk_animation/panels/ic_pp.png'   },
    { id: 'ic_abrc', src: 'hk_animation/panels/ic_abrc.png' },
    { id: 'ic_fifa', src: 'hk_animation/panels/ic_fifa.png' },
    { id: 'ic_nest', src: 'hk_animation/panels/ic_nest.png' },
    { id: 'ic_gyusa',src: 'hk_animation/panels/ic_gyusa.png'},
    { id: 'ic_tele', src: 'hk_animation/panels/ic_tele.png' },
    { id: 'ic_uber', src: 'hk_animation/panels/ic_uber.png' },
    { id: 'ic_enron',src: 'hk_animation/panels/ic_enron.png'},
    { id: 'ic_ther', src: 'hk_animation/panels/ic_ther.png' },
    { id: 'ic_oxfam',src: 'hk_animation/panels/ic_oxfam.png'},
    { id: 'ic_volk', src: 'hk_animation/panels/ic_volk.png' },
    { id: 'ic_bp',   src: 'hk_animation/panels/ic_bp.png'   },
    { id: 'ic_737',  src: 'hk_animation/panels/ic_737.png'  }
  ];

 // ====== LINGUE ======
  let currentLang = 'eng';
  const TEXTS = {
    eng: {
      intro: "So happy to see you again! Ready to continue? Press this little button.",
      button: "little button",
      ehi: "Pick one of these folders to continue. I’ll wait right here! (click a panel)"
    },
    ita: {
      intro: "Che gioia rivederti! Pronta a proseguire? Premi questo pulsantino.",
      button: "pulsantino",
      ehi: "Scegli una di queste cartelle per continuare. Ti aspetto qui! (clicca un pannello)"
    }
  };
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

  function tIntro()    { return (TEXTS[currentLang]?.intro)   || TEXTS.ita.intro; }
  function tBtn()      { return (TEXTS[currentLang]?.button)  || TEXTS.ita.button; }
  function tEhi()      { return (TEXTS[currentLang]?.ehi)     || TEXTS.ita.ehi; }
  function tCaption(id){ return (CAPTIONS[currentLang]?.[id]) || (CAPTIONS.ita?.[id]) || "…"; }

  // ---- LANG SWITCH ----
  let langLocked = false;
  function getLangSwitch() { return document.getElementById('lang-switch'); }
  function setLangSwitchVisible(show) {
    const sw = getLangSwitch(); if (!sw) return;
    sw.style.display = show ? 'flex' : 'none';
    if (show) sw.classList.add('show');
  }
  function lockLangSwitch(lock) {
    langLocked = !!lock;
    const sw = getLangSwitch(); if (!sw) return;
    sw.classList.toggle('locked', langLocked);
    sw.querySelectorAll('.lang').forEach(b => {
      b.disabled = langLocked;
      b.style.pointerEvents = langLocked ? 'none' : '';
      b.style.opacity = langLocked ? '.5' : '';
    });
  }
  function setLanguage(lang) {
    const sw = getLangSwitch();
    currentLang = (lang === 'ita' ? 'ita' : 'eng');
    if (sw) {
      sw.querySelectorAll('.lang').forEach(b => {
        const isActive = b.getAttribute('data-lang') === currentLang;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });
    }
  }
  function initLangSwitch() {
    const sw = getLangSwitch(); if (!sw) return;
    sw.classList.add('show');
    sw.querySelectorAll('.lang').forEach(btn => {
      btn.addEventListener('click', () => {
        if (langLocked) return;
        setLanguage(btn.getAttribute('data-lang') || 'eng');
        if (introBubbleEl) {
          const textEl = introBubbleEl.querySelector('#hk_bubble_text');
          const btnEl  = introBubbleEl.querySelector('#hk_btn');
          const newTxt = tIntro();
          btnEl.textContent = tBtn();
          applyBubbleFixedHeight(introBubbleEl, textEl, newTxt, { hasButton: true });
          textEl.textContent = newTxt;
        }
        if (infoBubbleEl) {
          const textEl = infoBubbleEl.querySelector('#hk_info_text');
          const pid = infoBubbleEl.dataset?.panelIdLive;
          if (pid) {
            const newTxt = tCaption(pid);
            applyBubbleFixedHeight(infoBubbleEl, textEl, newTxt, { hasButton: false });
            textEl.textContent = newTxt;
          }
        }
        if (ehiBubbleEl) {
          const textEl = ehiBubbleEl.querySelector('#hk_ehi_text');
          const newTxt = tEhi();
          applyBubbleFixedHeight(ehiBubbleEl, textEl, newTxt, { hasButton:false });
          textEl.textContent = newTxt;
        }
      });
    });
  }

  // z-index
  const Z = { wallpaper: 0, images: 10, bubbles: 20, character: 30 };

  // ---------- STATE ----------
  let h11Handle = null;
  let charEl = null, vA = null, vB = null, active = 'A', standbyImg = null;
  let introBubbleEl = null, infoBubbleEl = null, ehiBubbleEl = null, wallpaper = null;

  let sequence = []; let currentIndex = -1;
  const domImages = []; // <img> dei pannelli
  let infoCycleActive = false, typingDone = false, cooldownDone = false;
  let spawnAfterInfo = false;

  let idleTimer = null, standbyLooping = false, segmentLoopStopper = null;
  let glitching = false;

  let icAudio = null;
  let firstPanelClicked = false;

  // ---------- UTILS ----------
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
  function jittered(ms, j=250){ return ms + Math.floor((Math.random()*2-1)*j); }
  function once(el, ev){ return new Promise(res => el.addEventListener(ev, () => res(), { once:true })); }
  function onceAnyWithTimeout(el, events = ['playing'], timeoutMs = 1200){
    return new Promise(resolve => {
      let done = false;
      const finish = () => { if (done) return; done = true; clearTimeout(tid); events.forEach(ev => el.removeEventListener(ev, onEv)); resolve(); };
      const onEv = () => finish();
      events.forEach(ev => el.addEventListener(ev, onEv, { once:true }));
      const tid = setTimeout(finish, timeoutMs);
    });
  }

  function computeBottomOffset() {
    const h = window.innerHeight || 900;
    if (h <= 700) return 180;
    if (h <= 820) return 140;
    return CHARACTER.pos.bottom;
  }

  function freezeLastFrame(v) {
    try { v.pause(); if (!isNaN(v.duration)) v.currentTime = Math.max(0, v.duration - 0.001); } catch {}
  }
  function registerActivity() {
    if (!glitching) {
      resetIdleTimer();
      if (standbyLooping) { exitStandby(); }
    }
    if (icAudio && icAudio.paused) { try { icAudio.play(); } catch {} }
  }
  function resetIdleTimer() {
    if (glitching) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(enterStandby, IDLE_MS);
  }

  function getActiveV() { return active === 'A' ? vA : vB; }
  function getHiddenV(){ return active === 'A' ? vB : vA; }
  function setVisible(video,on){ if(!video) return; video.style.opacity = on?'1':'0'; video.style.zIndex = on?'2':'1'; }
  function hardHide(video){ if(!video) return; try{video.pause();}catch{} try{video.removeAttribute('src'); video.load();}catch{} video.currentTime=0; setVisible(video,false); }
  function swapLayersNow(){ const oldA=getActiveV(), newA=getHiddenV(); setVisible(newA,true); hardHide(oldA); active=(active==='A')?'B':'A'; }
  function loadOn(video,src){ return new Promise(res=>{ const onReady=()=>{ video.removeEventListener('canplaythrough',onReady); res(); }; video.addEventListener('canplaythrough',onReady,{once:true}); video.src=src; video.load(); }); }
  function showStandby(){ if(standbyImg) standbyImg.style.opacity='1'; }
  function hideStandby(){ if(standbyImg) standbyImg.style.opacity='0'; }

  function typeWriter(el, text, cps = 44, done) {
    const ms = Math.max(10, Math.round(1000 / cps));
    el.textContent = '';
    let i = 0, t = null, finished = false;
    const finish = () => { if (finished) return; finished = true; if (t) clearTimeout(t); el.textContent = text; done && done(); };
    const tick = () => { if (finished) return; if (i < text.length) { el.textContent += text[i++]; t = setTimeout(tick, ms); } else finish(); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !finished && i < text.length) finish(); }, { once:true });
    t = setTimeout(tick, ms);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      registerActivity();
      if (standbyLooping) {
        const act = getActiveV();
        startSegmentLoopMs(act, STANDBY_WINDOW_MS);
      }
    }
  });

  async function playInstant(src, { loop=false, startPercent=null, pauseAtStart=false, onEnded=null, useStandby=true } = {}) {
    const hidden = getHiddenV();
    hidden.loop = loop; hidden.muted = true; hidden.playsInline = true; hidden.preload = 'auto';
    hidden.style.willChange = 'opacity, transform';
    if (useStandby) showStandby();
    await loadOn(hidden, src);
    if (startPercent != null) { const d = hidden.duration || 0; if (d > 0) hidden.currentTime = d * startPercent; }
    if (!pauseAtStart) { try { await hidden.play(); } catch{} } else { hidden.pause(); }
    await new Promise(r => requestAnimationFrame(r));
    swapLayersNow();
    const act = getActiveV(); getHiddenV().onended = onEnded || null;
    if (useStandby) {
      if (!pauseAtStart) {
        const hideNow = () => { hideStandby(); act.removeEventListener('playing', hideNow); };
        act.addEventListener('playing', hideNow, { once: true });
        setTimeout(hideStandby, 150);
      } else { requestAnimationFrame(() => hideStandby()); }
    }
    return act;
  }

  function startSegmentLoopMs(video, windowMs) {
    stopSegmentLoop();
    standbyLooping = true;
    const d = video.duration || 0; if (!d) return;
    const center = d / 2;
    const halfWinSec = (windowMs / 1000) / 2;
    try { video.playbackRate = 0.65; } catch {}
    try { video.currentTime = Math.max(0, center - halfWinSec); } catch {}
    const handler = () => {
      const t = video.currentTime;
      if (t >= center + halfWinSec) {
        try { video.currentTime = Math.max(0, center - halfWinSec); } catch {}
      }
    };
    video.addEventListener('timeupdate', handler);
    const iv = setInterval(handler, 16);
    segmentLoopStopper = () => { video.removeEventListener('timeupdate', handler); clearInterval(iv); segmentLoopStopper = null; };
  }
  function stopSegmentLoop() {
    if (segmentLoopStopper) segmentLoopStopper();
    standbyLooping = false;
    try { getActiveV().playbackRate = 1.0; } catch {}
  }

  async function enterStandby() {
    if (glitching) return;
    const act = await playInstant(CHARACTER.standbySleep, { loop: false, useStandby: true });
    startSegmentLoopMs(act, STANDBY_WINDOW_MS);
  }
  async function exitStandby() {
    if (glitching) return;
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
    [vA, vB].forEach(v => {
      v.style.position = 'absolute';
      v.style.inset = '0';
      v.style.width = '100%';
      v.style.height = 'auto';
      v.style.zIndex = '1';
      v.style.opacity = '0';
      v.style.pointerEvents = 'none';
      v.playsInline = true; v.preload = 'auto'; v.muted = true;
    });
    vA.style.zIndex = '2'; vA.style.opacity = '1';
    charEl.appendChild(vA); charEl.appendChild(vB);

    standbyImg = document.createElement('img');
    standbyImg.src = CHARACTER.standbyPng; standbyImg.alt = 'HK';
    standbyImg.style.position = 'absolute';
    standbyImg.style.inset = '0';
    standbyImg.style.width = '100%';
    standbyImg.style.height = 'auto';
    standbyImg.style.zIndex = '3';
    standbyImg.style.opacity = '0';
    standbyImg.style.transition = 'opacity 80ms linear';
    charEl.appendChild(standbyImg);

    introBubbleEl = document.createElement('div');
    introBubbleEl.className = 'h-bubble';
    introBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_bubble_text"></span><button type="button" class="h-btn" id="hk_btn">pulsantino</button>`;
    charEl.appendChild(introBubbleEl);

    charEl.addEventListener('click', () => { registerActivity(); bringImagesToFront(); });

    document.body.appendChild(charEl);
    requestAnimationFrame(() => charEl.classList.add('show'));
    addEventListener('resize', () => {
      if (charEl) charEl.style.bottom = computeBottomOffset() + 'px';
      repositionAllShadows();
    });

    ensureWallpaper();
  }

  // --- bubble misuratore ---
  function createBubbleMeasurer() {
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.zIndex = '-1';
    probe.style.whiteSpace = 'pre-wrap';
    probe.style.letterSpacing = '.2px';
    probe.style.font = '300 13px/1.25 "Public Sans", sans-serif';
    probe.style.width = '200px';
    probe.style.boxSizing = 'content-box';
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

  // ====== OMBRE (sotto + sinistra) ======
  let SHADOW_UID = 1;
  function positionShadowsFor(img, sb, sl) {
    const w = IMAGE_SIZE.w, h = IMAGE_SIZE.h;
    const sw = Math.round(w * 0.65);
    const sh = 26;
    const left = parseInt(img.style.left, 10) || 0;
    const top  = parseInt(img.style.top, 10)  || 0;
    // Bottom
    sb.style.width  = sw + 'px';
    sb.style.left   = (left + Math.round((w - sw) / 2)) + 'px';
    sb.style.top    = (top + h - Math.round(sh/2)) + 'px';
    sb.style.height = sh + 'px';
    // Left
    sl.style.left   = left + 'px';
    sl.style.top    = (top + Math.round(h * 0.175)) + 'px';
    sl.style.height = Math.round(h * 0.65) + 'px';
  }
  function createShadowsFor(img) {
    const sid = String(SHADOW_UID++);
    const sb = document.createElement('div'); // bottom
    const sl = document.createElement('div'); // left
    sb.className = 'p2-shadow-b';
    sl.className = 'p2-shadow-l';
    sb.dataset.sid = sid; sl.dataset.sid = sid;
    img.dataset.sid = sid;
    document.body.appendChild(sb);
    document.body.appendChild(sl);
    positionShadowsFor(img, sb, sl);
    const zi = (parseInt(img.style.zIndex,10)||Z.images) - 1;
    sb.style.zIndex = String(zi);
    sl.style.zIndex = String(zi);
    requestAnimationFrame(()=> { sb.style.opacity = '1'; sl.style.opacity = '1'; });
  }
  function removeShadowsFor(img) {
    const sid = img.dataset.sid;
    if (!sid) return;
    document.querySelectorAll(`.p2-shadow-b[data-sid="${sid}"], .p2-shadow-l[data-sid="${sid}"]`)
      .forEach(el => { try { el.remove(); } catch {} });
  }
  function repositionAllShadows() {
    document.querySelectorAll('.p2-image').forEach(img => {
      const sid = img.dataset.sid; if (!sid) return;
      const sb = document.querySelector('.p2-shadow-b[data-sid="'+sid+'"]');
      const sl = document.querySelector('.p2-shadow-l[data-sid="'+sid+'"]');
      if (sb && sl) positionShadowsFor(img, sb, sl);
    });
  }

  // ====== SEQUENZA IMMAGINI ======
  function shuffle(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function buildSequence(){ sequence = shuffle(PANELS_21.slice()).slice(0, MAX_IMAGES); currentIndex = -1; }

  function bringImagesToFront() {
    const imgs = document.querySelectorAll('.p2-image');
    let z = Z.images;
    imgs.forEach(img => {
      img.style.zIndex = String(z++);
      const sid = img.dataset.sid;
      if (sid) {
        const sb = document.querySelector('.p2-shadow-b[data-sid="'+sid+'"]');
        const sl = document.querySelector('.p2-shadow-l[data-sid="'+sid+'"]');
        const zi = (parseInt(img.style.zIndex,10)||Z.images)-1;
        if (sb) sb.style.zIndex = String(zi);
        if (sl) sl.style.zIndex = String(zi);
      }
    });
  }

  // --------- OCCUPANCY MAP: riempi i “buchi” dello schermo ----------
  function getOccupiedRects({ includeImages = true, includeVideos = true } = {}) {
    const rects = [];
    if (includeImages) document.querySelectorAll('.p2-image').forEach(el => rects.push(el.getBoundingClientRect()));
    if (includeVideos) document.querySelectorAll('.p2-glitch').forEach(el => rects.push(el.getBoundingClientRect()));
    // Non evito il personaggio: possiamo stare dietro a HK
    return rects;
  }
  function rectsOverlap(a, b) {
    return !(a.left + a.width  <= b.left ||
             b.left + b.width  <= a.left ||
             a.top  + a.height <= b.top  ||
             b.top  + b.height <= a.top);
  }
  function placeInEmptySlot(w, h) {
    const margin = 12;
    const availW = Math.max(1, (window.innerWidth  || 1920) - w - margin);
    const availH = Math.max(1, (window.innerHeight || 1080) - h - margin);

    // Griglia densa: passo ~60% per riempire bene
    const stepX = Math.max(1, Math.floor(w * 0.6));
    const stepY = Math.max(1, Math.floor(h * 0.6));

    const occupied = getOccupiedRects();

    const candidates = [];
    for (let y = margin; y <= availH; y += stepY) {
      for (let x = margin; x <= availW; x += stepX) {
        const cand = { left: x, top: y, width: w, height: h };
        let ok = true;
        for (const r of occupied) { if (rectsOverlap(cand, r)) { ok = false; break; } }
        if (ok) candidates.push(cand);
      }
    }

    if (candidates.length) {
      const centerDist = c => {
        let minD = Infinity;
        const cx = c.left + c.width/2, cy = c.top + c.height/2;
        for (const r of occupied) {
          const rx = r.left + r.width/2, ry = r.top + r.height/2;
          const dx = cx - rx, dy = cy - ry; const d2 = dx*dx + dy*dy;
          if (d2 < minD) minD = d2;
        }
        return minD === Infinity ? 1e12 : minD;
      };
      candidates.sort((a,b)=> centerDist(b) - centerDist(a));
      return candidates[0];
    }

    // fallback random
    const left = Math.floor(margin + Math.random() * availW);
    const top  = Math.floor(margin + Math.random() * availH);
    return { left, top, width: w, height: h };
  }
  // Mantengo la firma usata altrove
  function placeNonOverlappingDom(w,h){ return placeInEmptySlot(w,h); }

  function getAvoidRects() {
    // Non evitiamo HK/bubbles per i WEBM “parata” (stanno dietro).
    const list = [];
    if (introBubbleEl) list.push(introBubbleEl.getBoundingClientRect());
    if (infoBubbleEl)  list.push(infoBubbleEl.getBoundingClientRect());
    if (ehiBubbleEl)   list.push(ehiBubbleEl.getBoundingClientRect());
    return list;
  }

  function spawnNextImage(){
    const nextIdx = currentIndex + 1;
    if (nextIdx >= sequence.length) return;

    const panel = sequence[nextIdx];
    if (!panel || !panel.src) { currentIndex++; setTimeout(spawnNextImage, 0); return; }

    const pos   = placeNonOverlappingDom(IMAGE_SIZE.w, IMAGE_SIZE.h);
    const img   = document.createElement('img');
    img.src  = panel.src; img.alt = panel.id; img.className = 'p2-image';
    img.style.position = 'fixed';
    img.style.left  = pos.left + 'px';
    img.style.top   = pos.top  + 'px';
    img.style.width = IMAGE_SIZE.w + 'px';
    img.style.height= 'auto';
    img.style.zIndex = String(Z.images);
    img.style.opacity = '0';
    img.style.transformOrigin = 'center center';
    img.dataset.seqIndex = String(nextIdx);
    img.dataset.panelId  = panel.id;

    document.body.appendChild(img);
    // Effetto “cartella che si apre”
    requestAnimationFrame(() => {
      img.classList.add('p2-image--appearing');
      img.style.opacity = '1';
      setTimeout(()=> img.classList.remove('p2-image--appearing'), 320);
    });

    createShadowsFor(img);

    img.addEventListener('click', () => {
      registerActivity();
      if (glitching) return; // durante glitch: ignora click
      const myIndex  = parseInt(img.dataset.seqIndex,10);
      const panelId  = img.dataset.panelId;

      if (ehiBubbleEl && !firstPanelClicked) { firstPanelClicked = true; hideEhiBubble(); }
      if (infoCycleActive || introBubbleEl) return;
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
    const btn    = introBubbleEl.querySelector('#hk_btn');
    btn.textContent = tBtn();

    applyBubbleFixedHeight(introBubbleEl, textEl, txt, { hasButton: true });
    introBubbleEl.classList.add('show');

    lockLangSwitch(true);
    typeWriter(textEl, txt, 44, () => {
      lockLangSwitch(false);
      btn.classList.add('show');
      btn.addEventListener('click', onIntroBtn, { once:true });
    });
  }
  function hideIntroBubble(){
    introBubbleEl.classList.add('hide');
    setTimeout(()=>{ try{ introBubbleEl.remove(); }catch{}; introBubbleEl=null; },180);
  }

  // ----- bubble INFO -----
  function showInfoBubbleFor(panelId){
    if (infoCycleActive) return;
    infoCycleActive = true; typingDone=false; cooldownDone=false;

    if (infoBubbleEl) { try{ infoBubbleEl.remove(); }catch{} }
    infoBubbleEl = document.createElement('div');
    infoBubbleEl.className = 'h-bubble h-bubble--info';
    infoBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_info_text"></span>`;
    infoBubbleEl.dataset.panelIdLive = panelId;
    charEl.appendChild(infoBubbleEl);
    requestAnimationFrame(()=> infoBubbleEl.classList.add('show'));

    const text = tCaption(panelId);
    const textEl = infoBubbleEl.querySelector('#hk_info_text');
    applyBubbleFixedHeight(infoBubbleEl, textEl, text, { hasButton:false });

    playPoseHalfInstant();

    lockLangSwitch(true);
    typeWriter(textEl, text, 50, () => {
      typingDone = true;
      setTimeout(()=>{ cooldownDone = true; tryFinishInfoCycle(); }, 1500);
    });
  }
  function hideInfoBubble(){
    if (!infoBubbleEl) return;
    infoBubbleEl.classList.add('hide');
    setTimeout(()=>{ try{ infoBubbleEl.remove(); }catch{}; infoBubbleEl=null; }, 180);
  }

  async function playPoseHalfInstant(){
    const src = pick(CHARACTER.poses);
    await playInstant(src, { loop:false, startPercent:0.5, pauseAtStart:true, useStandby:true });
  }

  async function tryFinishInfoCycle(){
    if (!(typingDone && cooldownDone)) return;
    const act = getActiveV();
    act.onended = ()=>{ freezeLastFrame(act); finalizeInfoCycle(); };
    try { await act.play(); } catch { finalizeInfoCycle(); }
  }

  function finalizeInfoCycle(){
    hideInfoBubble();
    infoCycleActive = false;
    lockLangSwitch(false);

    if (spawnAfterInfo) { spawnAfterInfo=false; spawnNextImage(); return; }
    if (currentIndex >= MAX_IMAGES - 1) { startGlitchFinale(); }
  }

  // Helper: PNG/JPG -> glitch-panels/<name>.webm
  function glitchSrcFromPanel(panelSrc){
    const base = (panelSrc.split('/').pop() || '').replace(/\.(png|jpg)(\?.*)?$/i, '');
    return `glitch-panels/${base}.webm`;
  }

  // ----- Finale glitch -----
  async function startGlitchFinale(){
    glitching = true;
    if (idleTimer){ clearTimeout(idleTimer); idleTimer=null; }
    stopSegmentLoop();

    // Personaggio in loop "glitch"
    const act = await playInstant(CHARACTER.glitch, { loop:true, useStandby:true });
    startSegmentLoopMs(act, GLITCH_WINDOW_MS);

    // 1) Sostituzione rapida dei PNG visibili con i rispettivi WEBM
    await replacePanelsSequentially();

    // 2) “Parata” dei restanti WEBM — prime 4 singole, poi a coppie, riempiendo i buchi
    await spawnRemainingWebmsSequentially();

    // 3) Uscita + redirect
    await fadeOutAllGlitchVideos();
    setTimeout(()=>{ try{ window.location.href = PILL_REDIRECT_URL; }catch{} }, POST_GLITCH_PAUSE);
  }

  async function replacePanelsSequentially(){
    const imgs = Array.from(domImages)
      .sort((a,b)=>(parseInt(a.style.zIndex||'10') - parseInt(b.style.zIndex||'10')));
    for (let i=0; i<imgs.length; i++) {
      await replaceOneImageWithWebm(imgs[i], { resolveOn: 'loadeddata' });
      await sleep(jittered(CASCADE_MS, CASCADE_JITTER));
    }
  }

  async function replaceOneImageWithWebm(img, { resolveOn = 'playing' } = {}){
    if (!img || !img.src) return;
    const webmSrc = glitchSrcFromPanel(img.src);

    // Mantieni la posizione del PNG, così la sostituzione è coerente
    const left = parseInt(img.style.left,10) || 0;
    const top  = parseInt(img.style.top,10)  || 0;
    const z    = (parseInt(img.style.zIndex,10)||Z.images) + 1;

    const v = document.createElement('video');
    v.className = 'p2-glitch';
    v.src = webmSrc;
    v.autoplay = true;
    v.loop = false;
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';

    v.style.left = left + 'px';
    v.style.top  = top  + 'px';
    v.style.width = IMAGE_SIZE.w + 'px';
    v.style.zIndex = String(z); // sopra l'immagine che sta svanendo
    v.style.opacity = '0';

    v.addEventListener('playing', () => {
      v.style.transition = 'opacity 80ms ease';
      v.style.opacity = '1';
    }, { once:true });

    v.addEventListener('ended', () => {
      try {
        if (!isNaN(v.duration)) {
          v.pause();
          v.currentTime = Math.max(0, v.duration - 0.001); // freeze ultimo frame
        }
      } catch {}
    });

    v.addEventListener('loadeddata', () => {
      const p = v.play();
      if (p && p.catch) p.catch(()=>{});
    }, { once:true });

    document.body.appendChild(v);

    // fade-out PNG + rimozione ombre
    img.style.transition = 'opacity 140ms ease';
    img.style.opacity = '0';
    removeShadowsFor(img);
    setTimeout(()=>{ try{ img.remove(); }catch{} }, 180);

    // NON bloccare la cascata: evento o timeout
    await onceAnyWithTimeout(v, ['playing','loadeddata','error','stalled','abort'], 1000);
  }

  async function spawnRemainingWebmsSequentially(){
    const usedIds = new Set(sequence.map(p => p.id));
    const remaining = PANELS_21.filter(p => !usedIds.has(p.id));
    shuffle(remaining);

    // Prime 4 una alla volta
    const firstSingles = remaining.splice(0, 4);
    for (const panel of firstSingles) {
      await spawnOneLooseWebm(panel, { resolveOn: 'loadeddata' });
      await sleep(jittered(CASCADE_MS, CASCADE_JITTER));
    }

    // Dal 5° al 21° a coppie
    for (let i = 0; i < remaining.length; i += 2) {
      const pA = remaining[i];
      const pB = remaining[i + 1];

      if (pA && pB) {
        await Promise.all([
          spawnOneLooseWebm(pA, { resolveOn: 'loadeddata' }),
          (async () => { await sleep(40 + Math.random()*60); await spawnOneLooseWebm(pB, { resolveOn: 'loadeddata' }); })()
        ]);
      } else if (pA) {
        await spawnOneLooseWebm(pA, { resolveOn: 'loadeddata' });
      }

      await sleep(jittered(CASCADE_MS, CASCADE_JITTER));
    }
  }

  async function spawnOneLooseWebm(panel, { resolveOn = 'playing' } = {}){
    const src = glitchSrcFromPanel(panel.src);
    const pos = placeInEmptySlot(IMAGE_SIZE.w, IMAGE_SIZE.h); // riempi i buchi

    const v = document.createElement('video');
    v.className = 'p2-glitch';
    v.src = src;
    v.autoplay = true;
    v.loop = false;
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';

    v.style.position = 'fixed';
    v.style.left = pos.left + 'px';
    v.style.top  = pos.top  + 'px';
    v.style.width = IMAGE_SIZE.w + 'px';
    v.style.zIndex = String(Z.character - 1); // dietro al personaggio
    v.style.opacity = '0';

    v.addEventListener('playing', () => {
      v.style.transition = 'opacity 80ms ease';
      v.style.opacity = '1';
    }, { once:true });

    v.addEventListener('ended', () => {
      try {
        if (!isNaN(v.duration)) {
          v.pause();
          v.currentTime = Math.max(0, v.duration - 0.001);
        }
      } catch {}
    });

    v.addEventListener('loadeddata', () => {
      const p = v.play();
      if (p && p.catch) p.catch(()=>{});
    }, { once:true });

    document.body.appendChild(v);

    // NON bloccare la cascata se qualcosa va storto
    await onceAnyWithTimeout(v, ['playing','loadeddata','error','stalled','abort'], 900);
  }

  async function fadeOutAllGlitchVideos(){
    const vids = Array.from(document.querySelectorAll('.p2-glitch'));
    await new Promise(res => {
      let left = vids.length;
      if (left === 0) return res();
      vids.forEach(v => {
        v.style.transition = 'opacity 320ms ease';
        v.style.opacity = '0';
        setTimeout(()=>{ try{ v.remove(); }catch{}; if (--left === 0) res(); }, 360);
      });
    });
  }

  // ----- Fumetto “ehi” persistente durante hk_clickplay.webm -----
  function showEhiBubble(){
    if (ehiBubbleEl) return;
    ehiBubbleEl = document.createElement('div');
    ehiBubbleEl.className = 'h-bubble h-bubble--ehi';
    ehiBubbleEl.innerHTML = `<span class="h-bubble-text" id="hk_ehi_text"></span>`;
    charEl.appendChild(ehiBubbleEl);

    const textEl = ehiBubbleEl.querySelector('#hk_ehi_text');
    const txt = tEhi();
    applyBubbleFixedHeight(ehiBubbleEl, textEl, txt, { hasButton:false });
    textEl.textContent = txt;

    requestAnimationFrame(()=> ehiBubbleEl.classList.add('show'));
  }
  function hideEhiBubble(){
    if (!ehiBubbleEl) return;
    ehiBubbleEl.classList.add('hide');
    setTimeout(()=>{ try{ ehiBubbleEl.remove(); }catch{}; ehiBubbleEl=null; }, 180);
  }

  // ----- INTRO BUTTON → wallpaper + ehi + prima immagine -----
  async function onIntroBtn(){
    const wp = ensureWallpaper();
    wp.style.backgroundImage = `url("${WALLPAPER_SRC}")`;
    requestAnimationFrame(()=> { wp.style.opacity = '1'; });

    try { document.dispatchEvent(new Event('phase:popups:disable')); } catch {}
    if (h11Handle && !h11Handle.closed) { try { h11Handle.close(); } catch {} }
    h11Handle = null;

    hideIntroBubble();

    await playInstant(CHARACTER.ehi, { loop:true, useStandby:true });
    showEhiBubble();
    firstPanelClicked = false;

    buildSequence();
    spawnNextImage();
    resetIdleTimer();
  }

  // ----- START -----
  async function startPhase2(detail){
    h11Handle = detail?.handle11 || null;
    document.addEventListener('click', registerActivity);
    ensureWallpaper();
    mountCharacter();
    initLangSwitch();

    setLangSwitchVisible(true);
    setLanguage('eng');
    lockLangSwitch(true);

    // AUDIO all'ingresso della Fase 2
    try {
      if (IC_AUDIO_SRC) {
        icAudio = new Audio(IC_AUDIO_SRC);
        icAudio.volume = 1.0;
        icAudio.loop = true;
        icAudio.play().catch(() => {
          const onFirstInteract = () => { icAudio.play().catch(()=>{}); document.removeEventListener('click', onFirstInteract); };
          document.addEventListener('click', onFirstInteract, { once:true });
        });
      }
    } catch {}

    await playInstant(CHARACTER.enter, { loop:false, useStandby:false });
    getActiveV().onended = async ()=>{
      freezeLastFrame(getActiveV());
      setTimeout(async ()=>{
        await playInstant(CHARACTER.hello, { loop:false, useStandby:true });
        showIntroBubble();
      }, 1000);
    };
  }

  document.addEventListener("phase:assistant:start", (e)=>{ startPhase2(e.detail || {}); });
})();
