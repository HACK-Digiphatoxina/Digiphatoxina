/* ===== Riferimenti DOM ===== */
const mv        = document.getElementById('mv');
const noise     = document.getElementById('noise-canvas');
const vid       = document.getElementById('replacement-video');
const vignette  = document.getElementById('vignette');
const img       = document.getElementById('end-image');

/* Switch lingua + immagini hover */
const langSwitch  = document.getElementById('lang-switch');
const hoverName   = document.getElementById('hover-name');
const hoverInfo   = document.getElementById('hover-info');

const ctx = noise.getContext ? noise.getContext('2d') : null;

/* ===== Parametri “artistici” ===== */
const HOLD_MS      = 1000;
const BLUR_MAX     = 10;
const SCALE_UP_MAX = 0.14;
const AMP_MAX      = 12;

// Shake
const FREQ_X1 = 2 * Math.PI * 2.0;
const FREQ_X2 = 2 * Math.PI * 3.7;
const PHI_X2  = 0.8;
const FREQ_Y1 = 2 * Math.PI * 2.4;
const FREQ_Y2 = 2 * Math.PI * 3.1;
const PHI_Y2  = 1.3;

/* Colori + Noise target */
const BG_START = { r:243, g:243, b:243 };
const BG_END   = { r: 42, g: 42, b: 42 };
const PILL_BG  = { r: 17, g: 17, b: 17 };
const BG_NOISE_MAX_ALPHA = 0.12;

/* ===== Stato ===== */
let isHolding = false, holdStart = 0, rafId = null, reverseRafId = null;
let videoShown = false, bottleRetired = false;
let progress = 0, bgProgress = 0;
let videoTickId = null;

/* Noise */
let bgNoiseAlpha = 0;
let bgNoiseActive = false, bgNoiseRaf = null;
let pillNoiseActive = false, pillNoiseRaf = null;
let NOISE_ALPHA_OVERRIDE = null;

/* ===== Lingua & hover ===== */
let currentLang   = 'eng';     // DEFAULT INGLESE
let pillHovering  = false;
let hoverInfoTimer = null;     // timer per mostrare hover-info dopo 2s

// offset dal cursore
const NAME_OFFSET = { x: 80,  y: -80 }; // sopra-destra
const INFO_OFFSET = { x: -380, y: 10 }; // più a sinistra

/* ===== Util ===== */
const clamp01   = x => Math.max(0, Math.min(1, x));
const easeInOut = t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
const lerp      = (a,b,t) => a + (b-a)*t;
const rgbToCss  = ({r,g,b}) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/* Curva per scurire prima */
function bgCurve(x){ const g=0.6; const b=Math.pow(clamp01(x), g)*1.05; return clamp01(b); }

/* ===== Sfondo (colore) ===== */
function setBackgroundFrom(t){
  t = clamp01(t); bgProgress = t;
  const col = { r: lerp(BG_START.r, BG_END.r, t),
                g: lerp(BG_START.g, BG_END.g, t),
                b: lerp(BG_START.b, BG_END.b, t) };
  const css = rgbToCss(col);
  document.body.style.backgroundColor = css;
  const cont = document.getElementById('viewer-container');
  if (cont) cont.style.backgroundColor = css;
}
setBackgroundFrom(0);

/* ===== Noise canvas ===== */
function resizeCanvas(){ if(!ctx) return; noise.width=innerWidth; noise.height=innerHeight; }
resizeCanvas(); addEventListener('resize', resizeCanvas);

function drawNoise(alphaFrac){
  if (!ctx) return;
  const w=noise.width, h=noise.height;
  const img=ctx.createImageData(w,h);
  const buf=new Uint32Array(img.data.buffer);
  const a = Math.floor(255 * (NOISE_ALPHA_OVERRIDE != null ? NOISE_ALPHA_OVERRIDE : clamp01(alphaFrac)));
  for (let i=0;i<buf.length;i++){ const v=(Math.random()*255)|0; buf[i]=(a<<24)|(v<<16)|(v<<8)|v; }
  ctx.putImageData(img,0,0);
}

/* Background noise loop (vista GLB) */
function startBgNoiseLoop(){
  if (bgNoiseActive || bottleRetired) return;
  bgNoiseActive = true;
  function tick(ts){
    if (!bgNoiseActive || bottleRetired){ bgNoiseRaf=null; return; }
    const holdAlpha = progress * BG_NOISE_MAX_ALPHA;
    const alpha     = Math.max(holdAlpha, bgNoiseAlpha);
    noise.style.opacity = alpha > 0 ? 1 : 0;
    if (!tick.last || ts - tick.last > 110){ NOISE_ALPHA_OVERRIDE=null; drawNoise(alpha); tick.last=ts; }
    bgNoiseRaf = requestAnimationFrame(tick);
  }
  bgNoiseRaf = requestAnimationFrame(tick);
}
function stopBgNoiseLoop(){ bgNoiseActive=false; if(bgNoiseRaf) cancelAnimationFrame(bgNoiseRaf); bgNoiseRaf=null; noise.style.opacity=0; }

/* ===== Effetti hold ===== */
function applyEffects(t){
  const e=easeInOut(t);
  const blur=BLUR_MAX*e, scale=1+SCALE_UP_MAX*e, amp=AMP_MAX*e;
  const ts=performance.now()/1000;
  const ox=amp*(Math.sin(FREQ_X1*ts)+0.5*Math.sin(FREQ_X2*ts+PHI_X2));
  const oy=amp*(Math.cos(FREQ_Y1*ts)+0.5*Math.sin(FREQ_Y2*ts+PHI_Y2));
  mv.style.filter=`blur(${blur.toFixed(2)}px)`;
  mv.style.opacity=(1-0.5*t).toFixed(2);
  mv.style.transform=`translate3d(${ox.toFixed(2)}px,${oy.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
}

function updateHoldProgress(){
  if (!isHolding) return;
  const now=performance.now();
  const t=clamp01((now-holdStart)/HOLD_MS);
  progress=t; applyEffects(t); startBgNoiseLoop();
  if (t>=1 && !videoShown && !bottleRetired) toVideoWhileHolding();
  rafId=requestAnimationFrame(updateHoldProgress);
}

function animateRelease(fromT){
  const start=performance.now(), dur=HOLD_MS;
  function step(now){
    const u=clamp01((now-start)/dur); const t=fromT*(1-easeInOut(u));
    progress=t; applyEffects(t); startBgNoiseLoop();
    if (u<1 && !isHolding){ reverseRafId=requestAnimationFrame(step); }
    else {
      mv.style.filter='none'; mv.style.opacity='1'; mv.style.transform='none';
      if (bgNoiseAlpha>0){ noise.style.opacity=1; NOISE_ALPHA_OVERRIDE=null; drawNoise(bgNoiseAlpha); } else noise.style.opacity=0;
      reverseRafId=null;
    }
  }
  reverseRafId=requestAnimationFrame(step);
}

/* ===== Press & Hold ===== */
function startPress(){ if(bottleRetired||isHolding) return; if(reverseRafId){cancelAnimationFrame(reverseRafId);reverseRafId=null;}
  isHolding=true; holdStart=performance.now(); startBgNoiseLoop(); rafId=requestAnimationFrame(updateHoldProgress); }
function endPress(){ if(bottleRetired||!isHolding) return; isHolding=false; if(rafId) cancelAnimationFrame(rafId); rafId=null;
  if (videoShown) pauseVideo(); animateRelease(progress); }

/* ===== Rotazione lenta GLB ===== */
document.addEventListener('DOMContentLoaded', () => { mv.setAttribute('rotation-per-second','4deg'); });

/* ===== Video → aggiorna colore + noise ===== */
function startVideoTick(){
  if (videoTickId) return;
  const tick=()=>{ if(!vid.paused && !vid.ended && vid.duration>0){
      const raw=clamp01(vid.currentTime/vid.duration);
      const mapped=bgCurve(raw);
      setBackgroundFrom(mapped);
      bgNoiseAlpha = BG_NOISE_MAX_ALPHA * mapped;
      startBgNoiseLoop();
      videoTickId=requestAnimationFrame(tick);
    } else { videoTickId=null; } };
  videoTickId=requestAnimationFrame(tick);
}
function stopVideoTick(){ if(videoTickId) cancelAnimationFrame(videoTickId); videoTickId=null; }

/* ===== Transizioni video ===== */
function toVideoWhileHolding(){
  videoShown=true;
  vid.style.display='block';
  requestAnimationFrame(()=>{ vid.style.opacity='1'; vignette.style.opacity='1';
    try{ vid.play().then(startVideoTick).catch(()=>startVideoTick()); }catch(e){ startVideoTick(); }});
  mv.style.opacity='0';
}
function pauseVideo(){
  mv.style.opacity='1';
  vid.style.opacity='0'; vignette.style.opacity='0';
  setTimeout(()=>{ vid.pause(); vid.style.display='none'; videoShown=false; stopVideoTick(); startBgNoiseLoop(); },300);
}

/* ===== Noise forte alla pillola ===== */
function startPillNoise(){
  stopBgNoiseLoop();
  pillNoiseActive=true; NOISE_ALPHA_OVERRIDE=BG_NOISE_MAX_ALPHA; noise.style.opacity=1;
  function tick(ts){ if(!pillNoiseActive){pillNoiseRaf=null;return;}
    if(!tick.last || ts-tick.last>110){ drawNoise(1); tick.last=ts; }
    pillNoiseRaf=requestAnimationFrame(tick);
  }
  pillNoiseRaf=requestAnimationFrame(tick);
}
function stopPillNoise(){ pillNoiseActive=false; NOISE_ALPHA_OVERRIDE=null; if(pillNoiseRaf) cancelAnimationFrame(pillNoiseRaf); pillNoiseRaf=null; }

/* ===== Fine video → pillola visibile ===== */
function finishToPill(){
  bottleRetired=true; stopVideoTick();
  document.body.style.backgroundColor=rgbToCss(PILL_BG);
  const cont=document.getElementById('viewer-container'); if(cont) cont.style.backgroundColor=rgbToCss(PILL_BG);
  startPillNoise();
  vid.pause(); vid.style.display='none'; vid.style.opacity='0'; vignette.style.opacity='0';
  mv.style.display='none'; img.style.display='block';
  if (langSwitch) langSwitch.classList.add('show'); // mostra IT/EN solo con la pillola
}
vid.addEventListener('ended', finishToPill);

/* ===== Skip segreto: H ===== */
addEventListener('keydown', (e)=>{ if((e.key||'').toLowerCase()==='h'){ e.preventDefault(); finishToPill(); } });

/* ===== Pointer events ===== */
mv.addEventListener('pointerdown', startPress,   {passive:true});
addEventListener('pointerup',      endPress,     {passive:true});
addEventListener('pointercancel',  endPress,     {passive:true});
addEventListener('pointerleave',   endPress,     {passive:true});
document.addEventListener('dragstart', e => { if (e.target === mv) e.preventDefault(); });

/* ===================== HOVER IMMAGINI VINCOLATE AL CURSORE ===================== */

/* (Opzionale) cartella immagini hover */
const HOVER_PATH = "./";

/* Genera candidate in varie estensioni e con/senza suffisso lingua */
function getHoverCandidates(lang){
  const L = (lang === 'eng') ? 'eng' : 'ita';
  const exts = ['png','webp','jpg','jpeg'];
  const list = [];
  exts.forEach(ext => list.push({ name: `${HOVER_PATH}ic_name_${L}.${ext}`, info: `${HOVER_PATH}ic_info_${L}.${ext}` }));
  exts.forEach(ext => list.push({ name: `${HOVER_PATH}ic_name.${ext}`,     info: `${HOVER_PATH}ic_info.${ext}`     }));
  return list;
}

/* Preload immagine → {ok,src} */
function preload(src){
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res({ ok: true, src });
    im.onerror = () => res({ ok: false, src });
    im.src = src;
  });
}

/* Scegli la prima coppia realmente disponibile */
async function pickFirstWorkingPair(lang){
  const candidates = getHoverCandidates(lang);
  for (const pair of candidates){
    const [n,i] = await Promise.all([preload(pair.name), preload(pair.info)]);
    if (n.ok && i.ok) return pair;
  }
  return null;
}

/* Posizionamento (clamp ai bordi) */
function placeHover(e){
  const margin=8;

  [hoverName, hoverInfo].forEach(el=>{
    if (el.style.display!=='block'){ el.style.display='block'; el.style.opacity='0'; }
  });

  const rn=hoverName.getBoundingClientRect();
  const ri=hoverInfo.getBoundingClientRect();

  let nx = e.clientX + NAME_OFFSET.x;
  let ny = e.clientY + NAME_OFFSET.y;
  let ix = e.clientX + INFO_OFFSET.x;
  let iy = e.clientY + INFO_OFFSET.y;

  if (nx + rn.width  + margin > innerWidth)  nx = innerWidth  - rn.width  - margin;
  if (ny + rn.height + margin > innerHeight) ny = innerHeight - rn.height - margin;
  if (nx < margin) nx = margin;
  if (ny < margin) ny = margin;

  if (ix + ri.width  + margin > innerWidth)  ix = innerWidth  - ri.width  - margin;
  if (iy + ri.height + margin > innerHeight) iy = innerHeight - ri.height - margin;
  if (ix < margin) ix = margin;
  if (iy < margin) iy = margin;

  hoverName.style.left = `${nx}px`; hoverName.style.top  = `${ny}px`;
  hoverInfo.style.left = `${ix}px`; hoverInfo.style.top  = `${iy}px`;
}

/* Hover: prima NAME, poi INFO dopo 2s (se rimani) */
img.addEventListener('pointerenter', async (e)=>{
  pillHovering = true;

  // prepara
  [hoverName, hoverInfo].forEach(el=>{
    el.style.display = 'block';
    el.style.opacity = '0';
  });
  placeHover(e);

  const pair = await pickFirstWorkingPair(currentLang);
  if (!pillHovering) return; // se l'utente è già uscito

  if (pair){
    hoverName.src = pair.name;
    hoverInfo.src = pair.info;

    // mostra SUBITO hover-name (con fade: velocità definita nel CSS, es. .35s)
    requestAnimationFrame(()=>{
      placeHover(e);
      hoverName.style.opacity = '1';
    });

    // programma la comparsa di hover-info dopo 2s
    if (hoverInfoTimer) clearTimeout(hoverInfoTimer);
    hoverInfoTimer = setTimeout(()=>{
      if (pillHovering){
        hoverInfo.style.opacity = '1';
      }
      hoverInfoTimer = null;
    }, 1500); /* <-----------------------------------------------------------------------------*/

  } else {
    console.warn('[hover] Nessuna immagine trovata per lingua:', currentLang);
    hoverName.style.display = 'none';
    hoverInfo.style.display = 'none';
  }
});
img.addEventListener('pointermove', placeHover);
['pointerleave','pointerdown'].forEach(ev=>{
  img.addEventListener(ev, ()=>{
    pillHovering = false;

    // cancella ritardo di hover-info se attivo
    if (hoverInfoTimer){ clearTimeout(hoverInfoTimer); hoverInfoTimer = null; }

    // fade-out
    hoverName.style.opacity = '0';
    hoverInfo.style.opacity = '0';

    // nascondi dopo la dissolvenza (allinea con transition del CSS, es. .35s)
    setTimeout(()=>{
      if (!pillHovering){
        hoverName.style.display = 'none';
        hoverInfo.style.display = 'none';
      }
    }, 360);
  });
});

/* ===== Switch lingua (IT/EN) ===== */
function setLang(lang){
  currentLang = (lang === 'eng') ? 'eng' : 'ita';
  document.querySelectorAll('#lang-switch .lang').forEach(btn=>{
    const active = btn.dataset.lang === currentLang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  // se stiamo hoverando, aggiorna subito le sorgenti (mantiene stato opacità attuale)
  if (pillHovering){
    pickFirstWorkingPair(currentLang).then(pair=>{
      if (!pair) return;
      hoverName.src = pair.name;
      hoverInfo.src = pair.info;
    });
  }
}
if (langSwitch){
  langSwitch.addEventListener('click', (e)=>{
    const btn = e.target.closest('.lang');
    if (!btn) return;
    setLang(btn.dataset.lang);
  });
}
// imposta default inglese
setLang('eng');

/* ===== Click sulla pillola: vai alla pagina successiva ===== */
img.addEventListener('click', () => {
  window.location.href = 'imageconflict/ci-index.html';
});
