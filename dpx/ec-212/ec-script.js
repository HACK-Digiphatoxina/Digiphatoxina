/* ========= LANG ========= */
const I18N = {
  en: {
    home: "Home", archive: "Archive", about: "About",
    login_h: "Login", user: "user", pass: "pass", signin: "Sign in (fake)",
    tags_h: "Tags", blogroll_h: "Blogroll", messages_h: "Messages",
    credits_h: "Credits", credits_txt: "2000s theme (mid-teal). Satirical project.",
    amplify: "Amplify (＋)",
    read_more: "Read more", open_page: "Open page →", watch_continue: "Watch & continue →",
    badge_post: "POST", badge_comment: "COMMENT", badge_video: "VIDEO"
  },
  it: {
    home: "Home", archive: "Archivio", about: "About",
    login_h: "Login", user: "utente", pass: "password", signin: "Accedi (finto)",
    tags_h: "Tag", blogroll_h: "Blogroll", messages_h: "Messaggi",
    credits_h: "Crediti", credits_txt: "Tema 2000s (teal medio). Progetto satirico.",
    amplify: "Amplifica (＋)",
    read_more: "Leggi tutto", open_page: "Apri pagina →", watch_continue: "Guarda & continua →",
    badge_post: "POST", badge_comment: "COMMENTO", badge_video: "VIDEO"
  }
};

let LANG = localStorage.getItem("lang") || "en";
document.documentElement.lang = LANG;

/* ========= FEED =========
   Nota: “purr-trance” ora è openPage + flagVideo (mostra badge VIDEO) e
   l’articolo contiene YouTube + GIF + pulsante per MP4 con redirect. */
const FEED = [
  {
    type: "post", allowInline:true,
    slug: "genesi-miao", date: "2006-06-28",
    title: "Genesi 1:1 — «Miao, fiat lux»",
    thumb: "assets/cat-creates-world.png",
    excerpt: "Cronache dalla Lettiera Antica: il primo suono dell’universo fu un miao a 432Hz.",
    html: `<p><img class="thumb" src="assets/cat-creates-world.png" alt="">
      Dal brivido del pelo nacquero le nebulose; dalla vibrazione della coda, la gravità.</p>`
  },
  {
    type: "post", allowInline:true,
    slug: "miracoli-luce", date: "2006-06-26",
    title: "Miracoli domestici: la luce si accende quando il gatto ti guarda",
    thumb: "assets/cat-light.jpg",
    excerpt: "Esperimenti double-blind. Percentuali schiaccianti riportate dalla community.",
    html: `<p><img class="thumb" src="assets/cat-light.jpg" alt="">
      Caso <em>double-blind</em>: umani bendati, interruttori ignoti. Il gatto guarda, la luce obbedisce.</p>`
  },

  // Pagina aperta con YT+GIF+CTA
  {
    type: "post", openPage:true, flagVideo:true,
    slug: "purr-trance", date: "2006-06-27",
    title: "Stato di trance indotto dalle fusa (Purr-432)",
    thumb: "assets/cat-aura.png",
    excerpt: "Registrazioni di fusa a 432Hz: rilassamento e connessione.",
    video: "assets/purr-trance.mp4", next: "#genesi-miao",
    articleHtml: renderPurrTranceArticle
  },

  // Pagine aperte
  {
    type: "post", openPage:true,
    slug: "ascii-bestario-felino", date: "2006-06-26",
    title: "ASCII Bestiary — 12 tiny cats",
    thumb: "assets/ascii-cat.png",
    excerpt: "Faccine =^..^= e micro-gatti riemersi da changelog e forum.",
    articleHtml: renderAsciiArticle
  },
  {
    type: "post", openPage:true,
    slug: "gatti-al-computer-21", date: "2006-06-22",
    title: "21 images: cats at computers",
    thumb: "assets/computer_cat.jpg",
    excerpt: "Dal data entry al code review passivo-aggressivo.",
    articleHtml: renderComputerCatsArticle
  },
  {
    type: "post", openPage:true,
    slug: "gatti-nel-codice", date: "2006-06-25",
    title: "Cats in Code — Easter eggs & Unicode",
    thumb: "assets/unicode-cat.png",
    excerpt: "Glifi 🐱, commenti `<!-- =^..^= -->`, rimandi preistorici.",
    articleHtml: renderCodeCatsArticle
  },

  // Messaggi (vanno nella box scrollabile a destra)
  {
    type: "comment", slug: "commento-invio", date: "2024-03-14",
    title: "«Sempre un attimo prima di premere Invio» — di Demon-cat",
    excerpt: "È lì quando arrivo al tasto ‘Invia’. Rileggo e cambio una frase. Sembra un controllo qualità."
  },
  {
    type: "comment", slug: "mouse-non-un-caso", date: "2024-01-18",
    title: "«Mouse? non è un caso» — di User1221",
    excerpt: "Lo strumento dell’informatica porta il nome della preda. Coincidenza o promemoria programmato?"
  },
  {
    type: "comment", slug: "commento-router", date: "2024-06-09",
    title: "«Il Whisker-Fi» — di Misty01",
    excerpt: "Due volte su tre, il Wi-Fi torna appena Whisker passa nel corridoio."
  },

  // Altri post (alcuni inline, molti no)
  {
    type: "post", allowInline:false,
    slug: "schrodinger-assurdo", date: "2006-06-24",
    title: "Teoria: il gatto di Schrödinger — lui sì, noi no",
    thumb: "assets/schrodinger-cat.jpg",
    excerpt: "Finché la scatola è chiusa, l’osservatore conta.",
    html: "<p>Il gatto non subisce la misura: la concede.</p>"
  },
  {
    type: "post", allowInline:true,
    slug: "sette-passaggi-ciotola", date: "2006-06-23",
    title: "Sette passaggi verso la ciotola (studio pilota)",
    thumb: "assets/bowl-ritual.jpg",
    excerpt: "37 tragitti divano→ciotola; mediana 7 svolte micro.",
    html: "<p>Ricorrenza come liturgia spaziale.</p>"
  },
  {
    type: "post", allowInline:false,
    slug: "luna-piena", date: "2006-06-21",
    title: "Gatti e luna piena: esiste davvero una connessione?",
    thumb: "assets/fullmoon-cat.jpg",
    excerpt: "Vocalizzi e perlustrazioni aumentano con la luna piena."
  }
];

/* ========= ABOUT (EN/IT) ========= */
const ABOUT = {
  en: `
    <div class="about">
      <h2>PurrNet</h2>
      <p>PurrNet is a deliberate echo chamber where the claim “cats are God” gets proven by repetition,
      memes and community “evidence”. Satire meets belief; ambiguity is the point.</p>
      <h3>Community policy</h3>
      <ul class="policy">
        <li>Respect humans & felines.</li><li>No woof-splaining.</li><li>Don’t feed trolls; do feed cats.</li>
        <li>CAPS only for MIAO.</li><li>Sources or silence.</li><li>Scratchy posts get removed.</li>
      </ul>
    </div>`,
  it: `
    <div class="about">
      <h2>PurrNet</h2>
      <p>PurrNet è una eco-chamber deliberata dove la frase “i gatti sono Dio” si conferma per reiterazione,
      meme ed “evidenze” della community. Satira e credenza si sfiorano.</p>
      <h3>Regole</h3>
      <ul class="policy">
        <li>Rispetta umani e felini.</li><li>Niente woof-splaining.</li><li>Non nutrire i troll; i gatti sì.</li>
        <li>CAPS solo per MIAO.</li><li>Fonti o silenzio.</li><li>I graffi escono dalla lettiera.</li>
      </ul>
    </div>`
};

/* ========= ELEMENTS / STATE ========= */
const content = document.getElementById('content');
const echoFill = document.getElementById('echoFill');
const echoCountEl = document.getElementById('echoCount');
const messagesBox = document.getElementById('messages');
let echoCount = Number(localStorage.getItem('echoCount') || 0);

/* ========= ROUTER ========= */
const params = new URLSearchParams(location.search);
const videoSrc = params.get('video');
const nextDest = params.get('next');
const articleSlug = params.get('article');
const showAbout = params.get('about') === '1';

initLang();
if (videoSrc) renderVideo(videoSrc, nextDest);
else if (articleSlug) renderArticle(articleSlug);
else if (showAbout) renderAbout();
else renderBlog();

/* Blinkie fallback (se la GIF non carica) */
setupBlinkie();

/* ========= BLOG ========= */
function renderBlog(){
  content.innerHTML = '';
  const days = [...new Set(FEED.map(p => p.date))].sort().reverse();
  days.forEach(day => {
    const d = el('div', {class:'day'}, [document.createTextNode(day)]);
    content.appendChild(d);
    FEED.filter(p=>p.date===day && p.type!=='comment')
        .forEach(post => content.appendChild(renderPost(post)));
  });

  // Messages: tutti i comment in box scrollabile "*user*: testo"
  if(messagesBox){
    messagesBox.innerHTML = '';
    FEED.filter(p=>p.type==='comment').forEach(c=>{
      const who = (c.title.split('— di ')[1]||'Anon').trim();
      const row = document.createElement('div'); row.className='msg';
      row.innerHTML = `<span class="who">${who}</span><span class="sep">:</span>${c.excerpt}`;
      messagesBox.appendChild(row);
    });
  }

  updateEchoUI();

  // Deleghe click
  content.addEventListener('click', (e)=>{
    const boost = e.target.closest('[data-boost]');
    if(boost){ bumpEcho(Number(boost.dataset.boost||1)); return; }

    const link = e.target.closest('a[data-kind]');
    if(!link) return; e.preventDefault();

    const slug = link.dataset.slug;
    const post = FEED.find(p=>p.slug===slug);
    if(!post) return;

    if(post.type === 'video'){
      const url = new URL(location.href);
      url.search = `?video=${encodeURIComponent(post.video)}&next=${encodeURIComponent(post.next||'./')}`;
      location.href = url.toString();
    } else if (post.openPage){
      goToArticle(slug);
    } else if (post.allowInline && post.html){
      openInlineArticle(post, link);
    } else {
      // non apribile: nudge eco
      bumpEcho(2);
      const old = link.textContent;
      link.textContent = '…';
      setTimeout(()=>{ link.textContent = old || getLabel('read_more'); }, 600);
    }
  });

  // Echo su prima visualizzazione post
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        bumpEcho(2);
        io.unobserve(en.target);
      }
    });
  },{threshold:.6});
  [...content.querySelectorAll('.post')].forEach(p=>io.observe(p));
}

function renderPost(p){
  const isVideoBadge = (p.type === 'video') || !!p.flagVideo;
  const box = el('article', {class:'post', id:p.slug}, [
    el('div', {class:'h'}, [
      el('a', {href:'#', class:'title read', 'data-kind': (p.type==='video'?'video':'open'), 'data-slug':p.slug}, [text(p.title)]),
      el('span', {class:'date'}, [text(p.date)])
    ]),
    el('p', {class:'ex'}, [
      p.thumb ? el('img', {class:'thumb', src:p.thumb, alt:''}) : null,
      text(p.excerpt + ' ')
    ]),
    el('div', {class:'meta'}, [
      isVideoBadge
        ? el('span', {class:'badge video'}, [text(getLabel('badge_video'))])
        : p.type==='comment'
          ? el('span', {class:'badge comment'}, [text(getLabel('badge_comment'))])
          : el('span', {class:'badge'}, [text(p.openPage?'OPEN':'POST')]),
      el('a', {
        href:'#', class:'read',
        'data-kind': (p.type==='video' ? 'video' : 'open'),
        'data-slug': p.slug
      }, [text(p.type==='video' ? getLabel('watch_continue')
         : (p.openPage ? getLabel('open_page') : getLabel('read_more')))])
    ])
  ]);
  return box;
}

function openInlineArticle(p, linkEl){
  const old = linkEl.closest('.post').querySelector('.article');
  if(old){ old.remove(); return; }
  bumpEcho(1);
  const htmlBlock = typeof p.html === 'function' ? p.html() : (p.html || '<p>—</p>');
  const panel = el('div', {class:'article'}, [
    el('h2', {}, [text(p.title)]),
    html(htmlBlock),
    el('a', {href:'#', class:'back'}, [text('← back')])
  ]);
  linkEl.closest('.post').appendChild(panel);
}

/* ========= ARTICLE PAGE ========= */
function goToArticle(slug){
  const url = new URL(location.href);
  url.search = `?article=${encodeURIComponent(slug)}`;
  location.href = url.toString();
}
function renderArticle(slug){
  const p = FEED.find(x=>x.slug===slug); if(!p){ renderBlog(); return; }
  const body = el('div', {class:'article wrap'}, [
    el('h2', {}, [text(p.title)]),
    html(typeof p.articleHtml === 'function' ? p.articleHtml() : (p.html || '')),
    el('p', {}, [el('a', {href:'./', class:'back'}, [text('← home')])])
  ]);
  content.replaceChildren(body);
  bumpEcho(2);

  // Pulsante “Watch & continue →” per Purr-432
  if (p.slug === 'purr-trance') {
    const btn = body.querySelector('#btnWatchContinue');
    if (btn && p.video) {
      btn.addEventListener('click', ()=>{
        const url = new URL(location.href);
        url.search = `?video=${encodeURIComponent(p.video)}&next=${encodeURIComponent(p.next||'./')}`;
        location.href = url.toString();
      });
    }
  }
}

/* === Special Article builders === */
function renderAsciiArticle(){
  return `
    <p>Copy &amp; paste tiny cats:</p>
    <pre>
=^..^=
(^･o･^)ﾉ”
/ᐠ .ᆽ . ᐟ\\ﾉ
ฅ^•ﻌ•^ฅ
(=ＴェＴ=)
(=^･ω･^=)
(=①ω①=)
(=｀ェ´=)
(=^-ω-^=)
(=^ ◡ ^=)
(=^･^=)
    </pre>
    <p>Developers hide feline tributes in code comments:
    <code>&lt;!-- =^..^= --&gt;</code>.</p>
  `;
}
function renderComputerCatsArticle(){
  let imgs = '';
  for(let i=1;i<=21;i++){
    const name = i===1 ? 'computer_cat.jpg' : `computer_cat_${i}.jpg`;
    imgs += `<img src="assets/${name}" alt="Cat at computer #${i}">`;
  }
  return `<div class="grid">${imgs}</div>`;
}
function renderCodeCatsArticle(){
  return `
    <p>Unicode cats: 🐱 😺 😼 😻 — and classic source glints like <code>/* =^..^= */</code>.</p>
    <p>See also: <a href="https://en.wikipedia.org/wiki/Cat_(Unicode)" target="_blank" rel="noopener">Unicode Cat</a>.</p>
  `;
}
function renderPurrTranceArticle(){
  const yt = `
    <div class="embed">
      <iframe
        src="https://www.youtube.com/embed/JLCRPmwNN4E?si=OSJegweNohy1DYak"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
    </div>`;
  const gif = `
    <img class="inline-gif"
         src="https://i.pinimg.com/originals/0c/bd/56/0cbd562df3a355edb3134d4cae3f462d.gif"
         alt="Cat trance GIF">`;
  const p = FEED.find(x => x.slug === 'purr-trance');
  const button = (p && p.video)
    ? `<p><button class="btn" id="btnWatchContinue">${getLabel('watch_continue')}</button></p>`
    : '';
  return `<p>Ascolta, respira, ripeti. Il purr a 432Hz allinea fibra e fede.</p>${yt}${gif}${button}`;
}

/* ========= VIDEO ========= */
function renderVideo(src, next){
  document.body.classList.add('video-mode');
  const wrap = el('div', {class:'video-wrap wrap'}, [
    el('div', {class:'video-head'}, [
      el('div', {}, [el('strong',{},[text('Special playback')]), text(' • some posts open videos')]),
      el('a', {href:'./', class:'read'}, [text('home')])
    ]),
    el('video', {id:'v', src:src, controls:true, autoplay:true}),
    el('div', {class:'tip'}, [text('At the end, you will be redirected to the next page.')])
  ]);
  content.replaceChildren(wrap);
  const v = wrap.querySelector('#v');
  v.addEventListener('ended', ()=>{
    location.href = next
      ? (/^https?:|\.html$/.test(next) ? next : `./${next}`)
      : './';
  });
  bumpEcho(4);
}

/* ========= ABOUT ========= */
function renderAbout(){
  const panel = el('div', {class:'about wrap'}, [html(ABOUT[LANG] || ABOUT.en), el('p',{},[el('a',{href:'./',class:'back'},[text('← home')])])]);
  content.replaceChildren(panel);
}

/* ========= Echo ========= */
function bumpEcho(n=1){
  echoCount = Math.max(0, echoCount + n);
  updateEchoUI();
  localStorage.setItem('echoCount', echoCount);
}
function updateEchoUI(){
  const pct = Math.max(6, Math.min(100, (echoCount/25)*100));
  if(echoFill) echoFill.style.width = pct + '%';
  if(echoCountEl) echoCountEl.textContent = echoCount;
}

/* ========= Lang UI ========= */
function initLang(){
  applyI18n();
  const btnEN = document.getElementById('btnEN');
  const btnIT = document.getElementById('btnIT');
  if(btnEN && btnIT){
    btnEN.setAttribute('aria-pressed', String(LANG==='en'));
    btnIT.setAttribute('aria-pressed', String(LANG==='it'));
    btnEN.addEventListener('click', ()=>setLang('en'));
    btnIT.addEventListener('click', ()=>setLang('it'));
  }
}
function setLang(l){
  LANG = l; localStorage.setItem('lang', l); document.documentElement.lang = l;
  const btnEN = document.getElementById('btnEN');
  const btnIT = document.getElementById('btnIT');
  if(btnEN && btnIT){
    btnEN.setAttribute('aria-pressed', String(l==='en'));
    btnIT.setAttribute('aria-pressed', String(l==='it'));
  }
  applyI18n();
}
function applyI18n(){
  const t = I18N[LANG]; if(!t) return;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t[el.getAttribute('data-i18n')] || el.textContent;
  });
  const navHome = document.getElementById('navHome');
  const navArchive = document.getElementById('navArchive');
  const navAbout = document.getElementById('navAbout');
  if(navHome) navHome.textContent = t.home;
  if(navArchive) navArchive.textContent = t.archive;
  if(navAbout) navAbout.textContent = t.about;
}
function getLabel(key){ return (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key; }

/* ========= Blinkie fallback (Tenor blocked/slow) ========= */
function setupBlinkie(){
  const img = document.getElementById('blinkieImg');
  const link = document.getElementById('blinkieLink');
  const fallback = document.getElementById('blinkieFallback');
  if(!img || !link || !fallback) return;

  const toVideo = link.getAttribute('href');
  fallback.addEventListener('click', ()=>{ location.href = toVideo; });

  let timedOut = false;
  const timer = setTimeout(()=>{
    if(img.naturalWidth === 0){ timedOut = true; fail(); }
  }, 4000);

  img.addEventListener('error', fail);
  img.addEventListener('load', ()=>{ if(!timedOut) clearTimeout(timer); });

  function fail(){
    link.style.display = 'none';
    fallback.style.display = 'inline-block';
  }
}

/* ========= Helpers ========= */
function el(tag, attrs={}, children=[]){
  const node = document.createElement(tag);
  for(const k in attrs){ if(attrs[k]!==null) node.setAttribute(k, attrs[k]); }
  (Array.isArray(children)?children:[children]).forEach(c=>{
    if(!c) return;
    if(typeof c==='string') node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  });
  return node;
}
function text(t){ return document.createTextNode(t); }
function html(h){ const d=document.createElement('div'); d.innerHTML=h; return d; }
