/* EO – Meme Playground (v5)
   - DORA resta nascosta fino a Start
   - Testo selezionabile senza script extra
*/

const audioBasePath = "./eo-audio/";

/* Inserisci qui la tua lista MEMES già usata in precedenza */
const MEMES = [
  // --- VIDEO / MP4 ---
  { src: "https://media.tenor.com/9qAbEfFruh0AAAPo/%E0%B8%88%E0%B8%B8%E0%B9%8A%E0%B8%9A.mp4", audios: ["smash-mouth-all-star.mp3"] },
  { src: "https://i.makeagif.com/media/9-30-2015/uuu0ti.mp4", audios: ["shrek.mp3"] },
  { src: "https://media.tenor.com/_Ksgzc71Fw0AAAPo/meme-goofy-face.mp4", audios: ["sus-piano.mp3"] },
  { src: "https://media.tenor.com/WbqG63TEEEcAAAPo/verbatim.mp4", audios: ["verbatim-xqc-meme.mp3"] },
  { src: "https://media.tenor.com/-yiWonLWmp4AAAPo/mad-somebodyholdme.mp4", audios: ["angry-roblox.mp3"] },
  { src: "https://media.tenor.com/Ty7NEik1U1cAAAPo/cat-meme.mp4", audios: ["avicii-wake-me-up.mp3"] },
  { src: "https://media.tenor.com/J3sih0hnKLwAAAPo/borzoi-siren.mp4", audios: ["danger-alarm-sound-effect-meme.mp3"] },
  { src: "https://media.tenor.com/wHs3JITWApsAAAPo/galaxy-brain-meme.mp4", audios: ["galaxy-meme.mp3"] },
  { src: "https://video.twimg.com/tweet_video/GrD_BeDW4AA7uhM.mp4", audios: ["absolute-cinema-meme.mp3"] },
  { src: "https://media.tenor.com/PBC98V2rjmUAAAPo/you-no-you.mp4", audios: ["spiderman-meme-song.mp3"] },
  { src: "https://media.tenor.com/haqt6SiJ2ywAAAPo/meow-meow-meow-meow-billie-eilish.mp4", audios: ["sad-meow-song.mp3"] },
  { src: "https://media.tenor.com/aSkdq3IU0g0AAAPo/laughing-cat.mp4", audios: ["cat-laugh-meme-1.mp3"] },
  { src: "https://media.tenor.com/TzaUHHp9un4AAAPo/huh-cat-roblox-huh.mp4", audios: ["huh-cat.mp3"] },
  { src: "https://media.tenor.com/QB21w9GkiOoAAAPo/spincat.mp4", audios: ["oiia-oiia-sound.mp3"] },
  { src: "https://media.tenor.com/9jLUbbzK03sAAAPo/john-pork-john-pork-call.mp4", audios: ["cat-iphone-ringtone.mp3"] },
  { src: "https://media.tenor.com/zBc1XhcbTSoAAAPo/nyan-cat-rainbow.mp4", audios: ["nyan-cat_1.mp3"] },
  { src: "https://media.tenor.com/PNmrRavjo40AAAPo/run.mp4", audios: ["vine-boom.mp3"] },
  { src: "https://media.tenor.com/gNToyJRX5ekAAAPo/nugget-chicken.mp4", audios: ["gedagedigedagedago.mp3"] },
  { src: "https://media.tenor.com/9niKyDAAqPoAAAPo/benjammins-holiday.mp4", audios: ["nothing-beats-a-jet2-holiday_IeBO1Mr.mp3"] },
  { src: "https://media.tenor.com/WarZqLGgTHoAAAPo/oh-no-cringe-cringe.mp4", audios: ["oh-no-cringe.mp3"] },
  { src: "https://media.tenor.com/aAPkGdhjJdMAAAPo/meow-magix.mp4", audios: ["dry-fart_3.mp3","wrong-answer-sound-effect.mp3","coche-claxon.mp3"] },
  { src: "https://media.tenor.com/xJQzFjwewOkAAAPo/cat-gato.mp4", audios: ["explosion-meme_dTCfAHs.mp3"] },
  { src: "https://media.tenor.com/jHvyFefhKmcAAAPo/mujikcboro-seriymujik.mp4", audios: ["sigma-boy-bass-boosted-caca.mp3"] },
  { src: "https://media.tenor.com/1mekY2yeGWkAAAPo/sigma.mp4", audios: ["sigmamy.mp3"] },
  { src: "https://media.tenor.com/-DYYuf5a7FUAAAPo/hamster-meme.mp4", audios: ["sad-hamster.mp3"] },
  { src: "https://media.tenor.com/QttOudwaS4kAAAPo/ohhp.mp4", audios: ["leonardo-di-caprio-assovio-apontando.mp3"] },
  { src: "https://media.tenor.com/FpHhGgR4zvgAAAPo/social-credit-credit.mp4", audios: ["social-credit_751J4TV.mp3"] },
  { src: "https://media.tenor.com/2Q2vioFDFEoAAAPo/plankton-plankton-meme.mp4", audios: ["plancton-meme.mp3"] },
  { src: "https://media.tenor.com/fWqq9QLFyJgAAAPo/okboomer-tamambuum%C4%B1r.mp4", audios: ["peter-kuli-jedwill-ok-boomer-official-music-video-mp3cut.mp3"] },
  { src: "https://media.tenor.com/1cyULmHwFyEAAAPo/hawk-tuah-hawktuah.mp4", audios: ["hawk-tuah_SRaUp2L.mp3"] },
  { src: "https://media.tenor.com/hIZ3rTWUGGoAAAPo/ahhh.mp4", audios: ["auughhh.mp3"] },
  { src: "https://media.tenor.com/T1zotsnaPJsAAAPo/bruh-meme.mp4", audios: ["bruh-sound-effect_WstdzdM.mp3"] },
  { src: "https://media.tenor.com/N4rXobIuGU4AAAPo/cat-meme.mp4", audios: ["classic_hurt.mp3"] },
  { src: "https://media.tenor.com/W779wwKlz9QAAAPo/dancing-rat-dance.mp4", audios: ["rat-dance-music.mp3"] },
  { src: "https://media.tenor.com/u8M7kk5ZXmwAAAPo/banana-cat-crying.mp4", audios: ["cry-banana-cat.mp3"] },
  { src: "https://media.tenor.com/_1hMqyFC4LEAAAPo/pop-cat.mp4", audios: ["cat-mouth-noise-192-kbps.mp3"] },
  { src: "https://media.tenor.com/bXjzL5fdskwAAAPo/mellstroy.mp4", audios: ["am-am-am-am-mellstroy.mp3"] },
  { src: "https://media.tenor.com/5T5HWThJYzIAAAPo/lie-meme.mp4", audios: ["wrong-answer-sound-effect (1).mp3"] },
  { src: "https://media.tenor.com/ivW-YU8YW0gAAAPo/fish-sleep.mp4", audios: ["snore-mimimimimimi.mp3"] },
  { src: "https://media.tenor.com/Cnwk6nqKB3QAAAPo/horse-interview.mp4", audios: ["cute-horse-interview.mp3"] },
  { src: "https://media.tenor.com/xE8pJUoGzUUAAAPo/chipmunk-dramatic.mp4", audios: ["dramatic.swf.mp3"] },
  { src: "https://media.tenor.com/lEcD0gtAP6UAAAPo/d9luxe-ants.mp4", audios: ["awkward-cricket-sound-effect.mp3"] },
  { src: "https://media.tenor.com/nhqXUHVKCJcAAAPo/puppyy3533amoung-us-puppyy-kitchen-pantry-amoung-us-impostor.mp4", audios: ["53b1bab6-a8c3-4a1a-82db-7110ce1c29ef_6KNDGWD.mp3"] },
  { src: "https://media.tenor.com/Zb1JNwThoDoAAAPo/gta-grand-theft-auto.mp4", audios: ["gta-san-andreas-mission-complete-sound-hq.mp3"] },
  { src: "https://media.tenor.com/0i0ZxbRgVyAAAAPo/meonly.mp4", audios: ["expedientes-secretos-x-musica22.mp3"] },
  { src: "https://media.tenor.com/K4xB25ACa5kAAAPo/ocean-ocean-meme.mp4", audios: ["ocean-meme.mp3"] },
  { src: "https://media.tenor.com/h4n_X-D1vCgAAAPo/bye.mp4", audios: ["ack.mp3"] },
  { src: "https://media.tenor.com/iS8_wMys4GwAAAPo/metal-pipe-gggg.mp4", audios: ["jixaw-metal-pipe-falling-sound.mp3"] },
  { src: "https://media.tenor.com/XHamsaug7KoAAAPo/das-war-ein-befehl-das-war-ein-befehl-cat.mp4", audios: ["das-war-ein-befehl_6M3MPtl.mp3"] },
  { src: "https://media.tenor.com/Qc7sPmCia6kAAAPo/cat-stare.mp4", audios: ["bombastic-side-eye.mp3"] },
  { src: "https://media.tenor.com/-ufrqpl5cp0AAAPo/test.mp4", audios: ["bailando-bailando.mp3"] },
  { src: "https://media.tenor.com/FetQ_KhWgd4AAAPo/chill-guy.mp4", audios: ["chill-guy-song.mp3"] },
  { src: "https://media.tenor.com/kbQv5cIBq8IAAAPo/the-office-steve-carell.mp4", audios: ["nooo-god-0.mp3"] },
  { src: "https://media.tenor.com/MYZgsN2TDJAAAAPo/this-is.mp4", audios: ["fine.mp3"] },
  { src: "https://media.tenor.com/DRcW0asAZnMAAAPo/technologiaaa-meme-arab.mp4", audios: ["technoloyia-technologia-tecnologia.mp3"] },
  { src: "https://media.tenor.com/ihqN6a3iiYEAAAPo/pikachu-shocked-face-stunned.mp4", audios: ["pikachu-pee.mp3"] },
  { src: "https://media.tenor.com/3qM9y_SPvJMAAAPo/nani-steve-harvey.mp4", audios: ["nani_hMQHlpR.mp3"] },
  { src: "https://media.tenor.com/8TpCHYs-9r4AAAPo/kid-interview.mp4", audios: ["ssstiktok_1617758649_1.mp3"] },
  { src: "https://media.tenor.com/MX6lVp7MXFoAAAPo/shaq.mp4", audios: ["uuuuuu.mp3"] },
  { src: "https://media.tenor.com/pCD2Rmf2SZQAAAPo/kim-kardashian-cry.mp4", audios: ["they-ask-you-how-you-feel.mp3"] },
  { src: "https://media.tenor.com/MPcUr_-fVakAAAPo/laugh-zach-galifianakis.mp4", audios: ["zach-galifianakis-laugh.mp3"] },

  // --- GIF/JPG/PNG ---
  { src: "https://i.pinimg.com/736x/9c/67/38/9c6738bf74f94adf5ed0f9e4170cbf2d.jpg", audios: ["let-me-know.mp3"] },
  { src: "https://static.wikitide.net/italianbrainrotwiki/2/2f/Nooo_La_Polizia.png", audios: ["noo-la-policia.mp3"] },
  { src: "https://media.tenor.com/BegUzq59qvQAAAAi/mini-impact-miniimpact.gif", audios: ["fairy-tail-wow-fairy-tail-wow.mp3"] },
  { src: "https://i.pinimg.com/originals/d5/1e/c9/d51ec9e1eb94636383c31cdfd549ec51.gif", audios: [] }, // nessun audio indicato
  { src: "https://media.tenor.com/gOTzyTGvt0wAAAAj/cat-wobble.gif", audios: ["wobbly-wiggly.mp3"] },
  { src: "https://media.tenor.com/dqaZmNuWIxwAAAAi/pogfish-oooo.gif", audios: ["gogogogogo.mp3"] },
  { src: "https://media.tenor.com/WZDGtj0jBDgAAAAi/mock-spongebob.gif", audios: ["spongebob-fail.mp3"] },
  { src: "https://media1.tenor.com/m/4na8hqTj6okAAAAC/spongebob-what.gif", audios: ["you-what.mp3"] },
  { src: "https://media1.tenor.com/m/9S9aYsgGYakAAAAC/fezzyka9.gif", audios: ["ary.mp3"] },
  { src: "https://media1.tenor.com/m/Q0vK2_i4zg8AAAAC/yo.gif", audios: ["boomer-extended.mp3"] },
  { src: "https://media1.tenor.com/m/wR5h6MBC3VsAAAAC/forabozo-mimimi.gif", audios: ["rich-laugh.MP3"] },
  { src: "https://media.tenor.com/am86MJSZVUwAAAAi/hehe.gif", audios: ["eheheh.mp3"] },
  { src: "https://hips.hearstapps.com/hmg-prod/images/2s9cjb-1548710537.jpg?crop=1xw:0.9523809523809523xh;center,top&resize=1200:", audios: ["is_sound.mp3"] },
  { src: "https://en.meming.world/images/en/1/1b/The_What%3F.jpg", audios: ["the_sound.mp3"] },
  { src: "https://media.tenor.com/b49RbivGBtMAAAPo/meh-goat.mp4", audios: ["meeeeee-mayimbu.mp3"] },
  { src: "https://i.pinimg.com/736x/6e/28/04/6e28044e354b92213dade3122048e93d.jpg", audios: ["diiiiiiiii.mp3"] },
  { src: "https://i.pinimg.com/originals/26/b9/66/26b9660514c1ff01beea3869562e6198.gif", audios: ["how-bout-i-sit-here-until-you-fall-asleep-mmmmmmmm-mp3cut.mp3"] },
];

let audioEnabled = false;

const $playground = document.getElementById("playground");
const $doraLayer  = document.getElementById("dora-layer");
const $dora       = document.getElementById("dora");
const $startBtn   = document.getElementById("start-btn");

const MEME_WIDTH_PX = (() => {
  const style = getComputedStyle(document.documentElement);
  const val = style.getPropertyValue("--meme-width").trim();
  return parseFloat(val.replace("px","")) || 220;
})();

/* ===== Distribuzione casuale (gaussiana) ===== */
function randGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clamp(x, min, max){ return Math.min(max, Math.max(min, x)); }
function randomPosWithin(containerW, containerH, elW, elH){
  const cx = containerW / 2, cy = containerH / 2;
  const sigmaX = containerW / 4.2, sigmaY = containerH / 4.2;
  let x = cx + randGaussian() * sigmaX - elW/2;
  let y = cy + randGaussian() * sigmaY - elH/2;
  x = clamp(x, 0, Math.max(0, containerW - elW));
  y = clamp(y, 0, Math.max(0, containerH - elH));
  return { x, y };
}
function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* ===== Drag & drop ===== */
function makeDraggable(el){
  let startX=0, startY=0, origX=0, origY=0, dragging=false;
  const onDown = (e) => {
    e.preventDefault();
    dragging = true;
    el.style.cursor = "grabbing";
    const p = getPointer(e);
    startX = p.x; startY = p.y; origX = el.offsetLeft; origY = el.offsetTop;
    el.setPointerCapture?.(e.pointerId || 0);
  };
  const onMove = (e) => {
    if(!dragging) return;
    const p = getPointer(e);
    const dx = p.x - startX, dy = p.y - startY;
    el.style.left = `${clamp(origX + dx, 0, window.innerWidth - el.offsetWidth)}px`;
    el.style.top  = `${clamp(origY + dy, 0, window.innerHeight - el.offsetHeight)}px`;
  };
  const onUp = (e) => {
    dragging = false;
    el.style.cursor = "grab";
    try { el.releasePointerCapture?.(e.pointerId || 0); } catch(_) {}
  };
  el.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}
function getPointer(e){
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

/* ===== Audio on hover (attivo dopo Start) ===== */
function bindHoverAudio(wrapper, audioList){
  if (!audioList || audioList.length === 0) return;
  const audioEl = new Audio();
  audioEl.preload = "none";
  audioEl.loop = true;
  let lastPick = null;

  const tryPlay = () => {
    if (!audioEnabled) return;
    let pick = pickRandom(audioList);
    if (audioList.length > 1) {
      let safety = 4;
      while (pick === lastPick && safety-- > 0) pick = pickRandom(audioList);
    }
    lastPick = pick;
    audioEl.src = audioBasePath + pick;
    audioEl.play().catch(() => {});
  };
  const stop = () => { audioEl.pause(); audioEl.currentTime = 0; };

  wrapper.addEventListener("mouseenter", () => { wrapper.classList.add("hovering"); tryPlay(); });
  wrapper.addEventListener("mouseleave", () => { wrapper.classList.remove("hovering"); stop(); });
}

/* ===== Crea meme ===== */
function createMemeElement(item){
  const w = document.createElement("div");
  w.className = "meme";

  const lower = item.src.toLowerCase();
  let el;
  if (lower.endsWith(".mp4")) {
    el = document.createElement("video");
    el.src = item.src;
    el.muted = true;
    el.loop = true;
    el.autoplay = true;
    el.playsInline = true;
  } else {
    el = document.createElement("img");
    el.src = item.src;
    el.alt = "meme";
    el.decoding = "async";
    el.loading = "eager";
  }

  w.appendChild(el);
  $playground.appendChild(w);

  const approxW = MEME_WIDTH_PX;
  const approxH = el.videoHeight ? (approxW * el.videoHeight / el.videoWidth) : approxW * 0.75;
  const place = () => {
    const { x, y } = randomPosWithin(window.innerWidth, window.innerHeight, w.offsetWidth || approxW, w.offsetHeight || approxH);
    w.style.left = `${x}px`; w.style.top  = `${y}px`;
  };
  if (el.tagName === "IMG") el.addEventListener("load", place);
  else if (el.tagName === "VIDEO") { (el.readyState >= 1) ? place() : el.addEventListener("loadedmetadata", place, { once: true }); }
  place();

  makeDraggable(w);
  bindHoverAudio(w, item.audios);
  return w;
}

/* ===== Init (dopo Start) ===== */
function init(){
  MEMES.forEach(createMemeElement);
  window.addEventListener("resize", () => {
    document.querySelectorAll(".meme").forEach(w => {
      const x = clamp(w.offsetLeft, 0, window.innerWidth - w.offsetWidth);
      const y = clamp(w.offsetTop, 0, window.innerHeight - w.offsetHeight);
      w.style.left = `${x}px`; w.style.top  = `${y}px`;
    });
  });
}

/* ===== Flusso ===== */
document.addEventListener("DOMContentLoaded", () => {
  $startBtn.addEventListener("click", () => {
    audioEnabled = true;
    $startBtn.classList.add("hidden");
    $doraLayer.classList.remove("hidden");
    $doraLayer.setAttribute("aria-hidden", "false");
    try { $dora.play().catch(()=>{}); } catch(e){}
    $playground.classList.remove("hidden");
    init();
  });
});