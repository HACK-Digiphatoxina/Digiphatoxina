/* ===== Riferimenti DOM ===== */
const mv        = document.getElementById('mv');                 // <model-viewer>
const noise     = document.getElementById('noise-canvas');       // canvas rumore
const vid       = document.getElementById('replacement-video');  // video full-screen
const vignette  = document.getElementById('vignette');
const img       = document.getElementById('end-image');          // pillola finale
const tip       = document.getElementById('tooltip');            // tooltip (se presente)
const pillInfo  = document.getElementById('pill-info');          // 3 colonne (contenuto caricato)

const ctx = noise.getContext ? noise.getContext('2d') : null;

/* ===== Parametri “artistici” ===== */
const HOLD_MS      = 1000;   // durata press&hold
const BLUR_MAX     = 10;     // px blur massimo
const SCALE_UP_MAX = 0.14;   // +14% scala
const AMP_MAX      = 12;     // px ampiezza shake

// Frequenze per lo shake (sinusoidi fluide)
const FREQ_X1 = 2 * Math.PI * 2.0;  // ~2 Hz
const FREQ_X2 = 2 * Math.PI * 3.7;
const PHI_X2  = 0.8;
const FREQ_Y1 = 2 * Math.PI * 2.4;
const FREQ_Y2 = 2 * Math.PI * 3.1;
const PHI_Y2  = 1.3;

/* ===== Colori + Noise target =====
   - Durante il video: colore da #f3f3f3 -> #2a2a2a con curva (gamma) anticipata
   - Noise: cresce con il video fino al livello della pillola
*/
const BG_START = { r: 243, g: 243, b: 243 };   // #f3f3f3
const BG_END   = { r:  42, g:  42, b:  42 };   // ~#2a2a2a
const PILL_BG  = { r:  17, g:  17, b:  17 };   // #111

const BG_NOISE_MAX_ALPHA = 0.12;  // livello massimo di noise (uguale alla pillola)

/* ===== Stato ===== */
let isHolding      = false;
let holdStart      = 0;
let rafId          = null;
let reverseRafId   = null;

let videoShown     = false;
let bottleRetired  = false;

let progress       = 0;      // 0..1 progressione effetti hold
let bgProgress     = 0;      // 0..1 progressione colore sfondo (video)

let videoTickId    = null;

/* ===== Noise ===== */
let bgNoiseAlpha   = 0;      // alpha “di background” guidata dal video (0..BG_NOISE_MAX_ALPHA)
let bgNoiseActive  = false;
let bgNoiseRaf     = null;

let pillNoiseActive = false;
let pillNoiseRaf    = null;
let NOISE_ALPHA_OVERRIDE = null; // se non null, forza alpha in drawNoise

/* ===== Loader contenuto esterno (pill-info.html) ===== */
let pillInfoLoaded  = false;
let pillInfoPromise = null;
function loadPillInfo() {
  if (pillInfoLoaded) return Promise.resolve();
  if (pillInfoPromise) return pillInfoPromise;

  pillInfoPromise = fetch('pill-info.html', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('pill-info fetch failed: ' + r.status); return r.text(); })
    .then(html => { if (pillInfo) pillInfo.innerHTML = html; pillInfoLoaded = true; })
    .catch(err => { console.warn(err); if (pillInfo && !pillInfo.innerHTML) pillInfo.innerHTML = '<div class="col"><p>Info non disponibili.</p></div>'; });

  return pillInfoPromise;
}

/* ===== Util ===== */
const clamp01  = x => Math.max(0, Math.min(1, x));
const easeInOut= t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
const lerp     = (a,b,t) => a + (b-a)*t;
const rgbToCss = ({r,g,b}) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/* Curva per scurire prima (gamma < 1, leggera spinta) */
function bgCurve(x){
  const gamma = 0.6;                      // <1 → scurisce prima
  const boosted = Math.pow(clamp01(x), gamma) * 1.05;
  return clamp01(boosted);
}

/* ===== Gestione sfondo (colore) ===== */
function setBackgroundFrom(t){
  t = clamp01(t);
  bgProgress = t;
  const col = { r: lerp(BG_START.r, BG_END.r, t),
                g: lerp(BG_START.g, BG_END.g, t),
                b: lerp(BG_START.b, BG_END.b, t) };
  const css = rgbToCss(col);
  document.body.style.backgroundColor = css;
  const cont = document.getElementById('viewer-container');
  if (cont) cont.style.backgroundColor = css;
}
setBackgroundFrom(0); // iniziale

/* ===== Noise canvas ===== */
function resizeCanvas(){
  if (!ctx) return;
  noise.width  = innerWidth;
  noise.height = innerHeight;
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

function drawNoise(alphaFrac){
  if (!ctx) return;
  const w = noise.width, h = noise.height;
  const img = ctx.createImageData(w, h);
  const buf = new Uint32Array(img.data.buffer);

  const alpha = Math.floor(255 * (
    NOISE_ALPHA_OVERRIDE != null ? NOISE_ALPHA_OVERRIDE : clamp01(alphaFrac)
  ));

  for (let i = 0; i < buf.length; i++){
    const v = Math.floor(Math.random() * 255);
    buf[i] = (alpha<<24)|(v<<16)|(v<<8)|v;
  }
  ctx.putImageData(img, 0, 0);
}

/* === Loop rumore di background (quando GLB è visibile) === */
function startBgNoiseLoop(){
  if (bgNoiseActive || bottleRetired) return;
  bgNoiseActive = true;

  function tick(ts){
    if (!bgNoiseActive || bottleRetired) { bgNoiseRaf = null; return; }

    // Alpha del rumore “da hold” (scala con progress) vs “di background” (scala con il video)
    const holdAlpha = progress * BG_NOISE_MAX_ALPHA;
    const alpha     = Math.max(holdAlpha, bgNoiseAlpha); // scegli il più forte

    // mostra/nascondi il layer a seconda della necessità
    noise.style.opacity = alpha > 0 ? 1 : 0;

    // aggiorna la texture a bassa frequenza (~9fps) per non pesare
    if (!tick.last || ts - tick.last > 110){
      NOISE_ALPHA_OVERRIDE = null;     // niente override: usa alpha calcolato
      drawNoise(alpha);
      tick.last = ts;
    }

    bgNoiseRaf = requestAnimationFrame(tick);
  }
  bgNoiseRaf = requestAnimationFrame(tick);
}
function stopBgNoiseLoop(){
  bgNoiseActive = false;
  if (bgNoiseRaf) cancelAnimationFrame(bgNoiseRaf);
  bgNoiseRaf = null;
  noise.style.opacity = 0;
}

/* ===== Applicatore effetti per un dato t in [0,1] (durante hold) ===== */
function applyEffects(t){
  const e     = easeInOut(t);
  const blur  = BLUR_MAX * e;
  const scale = 1 + SCALE_UP_MAX * e;
  const amp   = AMP_MAX * e;

  // shake fluido (tempo assoluto)
  const ts = performance.now() / 1000;
  const ox = amp * ( Math.sin(FREQ_X1 * ts) + 0.5 * Math.sin(FREQ_X2 * ts + PHI_X2) );
  const oy = amp * ( Math.cos(FREQ_Y1 * ts) + 0.5 * Math.sin(FREQ_Y2 * ts + PHI_Y2) );

  // modello
  mv.style.filter    = `blur(${blur.toFixed(2)}px)`;
  mv.style.opacity   = (1 - 0.5 * t).toFixed(2);
  mv.style.transform = `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
}

/* ===== Avanzamento durante l'hold ===== */
function updateHoldProgress(){
  if (!isHolding) return;

  const now = performance.now();
  const t   = clamp01((now - holdStart) / HOLD_MS);  // 0..1
  progress  = t;

  // applica effetti + assicura il loop del rumore di background
  applyEffects(t);
  startBgNoiseLoop();

  if (t >= 1 && !videoShown && !bottleRetired) {
    toVideoWhileHolding();
  }

  rafId = requestAnimationFrame(updateHoldProgress);
}

/* ===== Transizione inversa (rilascio) ===== */
function animateRelease(fromT){
  const start = performance.now();
  const dur   = HOLD_MS;

  function step(now){
    const u = clamp01((now - start) / dur);
    const t = fromT * (1 - easeInOut(u));     // decresce con lo stesso easing
    progress = t;
    applyEffects(t);

    // mantieni vivo il rumore di background anche tornando indietro
    startBgNoiseLoop();

    if (u < 1 && !isHolding) {
      reverseRafId = requestAnimationFrame(step);
    } else {
      // reset dei soli effetti sul modello (IL NOISE RESTA secondo bgNoiseAlpha)
      mv.style.filter    = 'none';
      mv.style.opacity   = '1';
      mv.style.transform = 'none';

      // forza un tick per disegnare il livello di noise corrente (se >0)
      if (bgNoiseAlpha > 0) {
        noise.style.opacity = 1;
        NOISE_ALPHA_OVERRIDE = null;
        drawNoise(bgNoiseAlpha);
      } else {
        noise.style.opacity = 0;
      }
      reverseRafId = null;
    }
  }
  reverseRafId = requestAnimationFrame(step);
}

/* ===== Press & Hold ===== */
function startPress(){
  if (bottleRetired || isHolding) return;
  if (reverseRafId) { cancelAnimationFrame(reverseRafId); reverseRafId = null; }

  isHolding = true;
  holdStart = performance.now();

  // assicura che il loop di background sia attivo
  startBgNoiseLoop();

  rafId = requestAnimationFrame(updateHoldProgress);
}

function endPress(){
  if (bottleRetired || !isHolding) return;
  isHolding = false;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  if (videoShown){
    pauseVideo(); // lo sfondo + noise restano al valore raggiunto
  }

  animateRelease(progress);
}

/* ===== Rotazione lenta del GLB ===== */
document.addEventListener('DOMContentLoaded', () => {
  mv.setAttribute('rotation-per-second', '4deg'); // regola a piacere
  loadPillInfo(); // prefetch facoltativo
});

/* ===== Tick del video → aggiorna sfondo + noise di background ===== */
function startVideoTick(){
  if (videoTickId) return;
  const tick = () => {
    if (!vid.paused && !vid.ended && vid.duration > 0){
      const raw    = clamp01(vid.currentTime / vid.duration);
      const mapped = bgCurve(raw);                 // scurisce prima
      setBackgroundFrom(mapped);                   // colore
      bgNoiseAlpha = BG_NOISE_MAX_ALPHA * mapped;  // noise cresce col video

      // se siamo in vista GLB (quando rilasci), serve il loop attivo per vedere il noise
      startBgNoiseLoop();

      videoTickId = requestAnimationFrame(tick);
    } else {
      videoTickId = null;
    }
  };
  videoTickId = requestAnimationFrame(tick);
}
function stopVideoTick(){
  if (videoTickId) cancelAnimationFrame(videoTickId);
  videoTickId = null;
}

/* ===== Transizioni video ===== */
function toVideoWhileHolding(){
  videoShown = true;

  // mostra video con fade-in
  vid.style.display = 'block';
  requestAnimationFrame(() => {
    vid.style.opacity = '1';
    vignette.style.opacity = '1';
    try { vid.play().then(startVideoTick).catch(()=>startVideoTick()); } catch(e){ startVideoTick(); }
  });

  // nascondi flacone (il noise di background può restare ma è sotto al video)
  mv.style.opacity = '0';
}

function pauseVideo(){
  // fade-out e ritorno al flacone; currentTime non si azzera
  mv.style.opacity = '1';

  vid.style.opacity = '0';
  vignette.style.opacity = '0';
  setTimeout(() => {
    vid.pause();
    vid.style.display = 'none';
    videoShown = false;
    stopVideoTick(); // colore + bgNoise restano ai valori raggiunti

    // appena torniamo al GLB, assicurati che il rumore di background sia visibile
    startBgNoiseLoop();
  }, 300);
}

/* ===== Noise persistente alla pillola (più forte) ===== */
function startPillNoise(){
  // disattiva il loop “soft” di background e forza livello alto fisso
  stopBgNoiseLoop();
  pillNoiseActive = true;
  NOISE_ALPHA_OVERRIDE = BG_NOISE_MAX_ALPHA; // livello forte (0.12)
  noise.style.opacity = 1;

  function tick(ts){
    if (!pillNoiseActive) { pillNoiseRaf = null; return; }
    if (!tick.last || ts - tick.last > 110){
      drawNoise(1); // alpha viene dal NOISE_ALPHA_OVERRIDE
      tick.last = ts;
    }
    pillNoiseRaf = requestAnimationFrame(tick);
  }
  pillNoiseRaf = requestAnimationFrame(tick);
}
function stopPillNoise(){
  pillNoiseActive = false;
  NOISE_ALPHA_OVERRIDE = null;
  if (pillNoiseRaf) cancelAnimationFrame(pillNoiseRaf);
  pillNoiseRaf = null;
}

/* ===== Fine video → mostra pillola, sfondo scuro + noise forte ===== */
function finishToPill(){
  bottleRetired = true;
  stopVideoTick();

  // sfondo finale scuro
  document.body.style.backgroundColor = rgbToCss(PILL_BG);
  const cont = document.getElementById('viewer-container');
  if (cont) cont.style.backgroundColor = rgbToCss(PILL_BG);

  // noise persistente forte
  startPillNoise();

  // UI switching
  vid.pause();
  vid.style.display = 'none';
  vid.style.opacity = '0';
  vignette.style.opacity = '0';

  mv.style.display = 'none';
  img.style.display = 'block';

  // carica/mostra le 3 colonne
  loadPillInfo().finally(() => { if (pillInfo) pillInfo.classList.add('show'); });
}

vid.addEventListener('ended', finishToPill);

/* ===== Skip segreto: premi H per saltare alla pillola ===== */
addEventListener('keydown', (e) => {
  if ((e.key || '').toLowerCase() === 'h'){
    e.preventDefault();
    finishToPill();
  }
});

/* ===== Pointer events ===== */
mv.addEventListener('pointerdown', startPress,   {passive:true});
addEventListener('pointerup',      endPress,     {passive:true});
addEventListener('pointercancel',  endPress,     {passive:true});
addEventListener('pointerleave',   endPress,     {passive:true});

/* Evita drag artefatti sul modello */
document.addEventListener('dragstart', e => { if (e.target === mv) e.preventDefault(); });

/* ===== Tooltip opzionale sulla pillola ===== */
if (tip) {
  img.addEventListener('pointerenter', (e) => {
    tip.style.left = `${e.clientX}px`;
    tip.style.top  = `${e.clientY - 30}px`;
    tip.textContent = 'Image-Conflict';
    tip.style.display = 'block';
    requestAnimationFrame(()=> tip.style.opacity = '1');
  });
  img.addEventListener('pointermove', (e) => {
    tip.style.left = `${e.clientX}px`;
    tip.style.top  = `${e.clientY - 30}px`;
  });
  ['pointerleave','pointerdown'].forEach(ev=>{
    img.addEventListener(ev, () => {
      tip.style.opacity = '0';
      setTimeout(()=> tip.style.display = 'none', 200);
    });
  });
}

/* ===== Click sulla pillola: vai alla pagina successiva (modifica URL se serve) ===== */
img.addEventListener('click', () => {
  window.location.href = '/imageconflict/secondpage.html';
});



/*-------------- CANCELLA da qui: pill-label wave -----------------*/

(function setupPillLabel(){
  // crea il nodo se non c'è
  let label = document.getElementById('pill-label');
  if (!label){
    label = document.createElement('div');
    label.id = 'pill-label';
    // importantissimo: inseriscilo DOPO #end-image così funziona il selettore ~
    document.body.appendChild(label);
  }

  // testo del caption
  const CAPTION_TEXT = 'Image-Conflict'; // cambia qui se vuoi

  // contenitore con classe .wave
  const wave = document.createElement('div');
  wave.className = 'wave';

  // spezza in lettere con delay progressivo via --i
  CAPTION_TEXT.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch;
    span.style.setProperty('--i', i);
    wave.appendChild(span);
  });

  label.innerHTML = '';
  label.appendChild(wave);
})();

/*-------------- CANCELLA fino a qui: pill-label wave -----------------*/