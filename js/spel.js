/* Spel: "Vang de pompoenen" met Bram, Fien en Moos.
   Gewoon canvas + JavaScript, geen externe bibliotheken, werkt offline. */
(function () {
  "use strict";
  var kader = document.getElementById("spelkader");
  var canvas = document.getElementById("spelcanvas");
  if (!kader || !canvas || !canvas.getContext || !window.Path2D) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var $ = function (id) { return document.getElementById(id); };
  var schermStart = $("spel-start"), schermPauze = $("spel-pauze"), schermEinde = $("spel-einde");
  var elPunten = $("spel-punten"), elSec = $("spel-seconden"), elBalk = $("spel-tijdbalk"), elTijd = elSec.parentNode;
  var knopPauze = $("spel-pauzeknop"), knopGeluid = $("spel-geluidknop");
  var melding = $("spel-melding");

  var DUUR = 60;                         /* seconden per ronde */
  var STER2 = 40, STER3 = 80;            /* punten voor 2 en 3 sterren */
  var rustig = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  /* ---------- opslag ---------- */
  function lees(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schrijf(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privé-modus */ } }
  var beste = parseInt(lees("bramspel-beste"), 10) || 0;
  var stil = lees("bramspel-geluid") === "uit";

  /* ---------- afbeeldingen ---------- */
  function beeld(src) { var i = new Image(); i.decoding = "async"; i.src = src; i.onload = function () { if (staat !== "spelen") teken(0); }; return i; }
  var IMG = {
    bram: beeld("assets/spel/bram-blij.webp"),
    hap: beeld("assets/spel/bram-hap.webp"),
    oei: beeld("assets/spel/bram-oei.webp"),
    fien: beeld("assets/figuren/fien.webp"),
    fien2: beeld("assets/spel/fien-vleugel.webp"),
    moos: beeld("assets/spel/moos.webp"),
    bolleke: beeld("assets/figuren/bolleke.webp"),
    papier: beeld("assets/papier.png")
  };
  var ok = function (i) { return i && i.complete && i.naturalWidth > 0; };

  /* Gouden Bolleke: kleur de pompoen eenmalig goud */
  var goudBeeld = null;
  function maakGoud() {
    if (goudBeeld || !ok(IMG.bolleke)) return;
    var c = document.createElement("canvas"), w = 180, h = Math.round(180 * IMG.bolleke.naturalHeight / IMG.bolleke.naturalWidth);
    c.width = w; c.height = h;
    var g = c.getContext("2d"); g.drawImage(IMG.bolleke, 0, 0, w, h);
    try {
      var d = g.getImageData(0, 0, w, h), p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        var l = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255;
        if (l < .22) { p[i] = 90; p[i + 1] = 55; p[i + 2] = 10; continue; }
        var t = Math.pow(l, .75);
        p[i] = 150 + 105 * t; p[i + 1] = 95 + 140 * t; p[i + 2] = 10 + 110 * t * t;
      }
      g.putImageData(d, 0, 0);
    } catch (e) { /* file:// : gewoon de oranje pompoen met gouden gloed */ }
    goudBeeld = c;
  }
  IMG.bolleke.addEventListener("load", function () { maakGoud(); maakIcoontjes(); });

  /* ---------- tekenfuncties voor vallende dingen (middelpunt 0,0; straal r) ---------- */
  var LIJN = "#54381e";
  var BLAD = new Path2D("M20 2c3 6 9 7 14 6-2 5 0 9 4 12-5 2-7 6-6 11-5-2-9 0-12 5-3-5-7-7-12-5 1-5-1-9-6-11 4-3 6-7 4-12 5 1 11 0 14-6z");
  var BLADNERF = new Path2D("M20 10v28M20 22l-7-6M20 22l7-6M20 30l-6-3M20 30l6-3");
  var BLADKLEUR = ["#d9762b", "#c8452a", "#e3a32b", "#b8562a"];

  function lijn(r) { ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = LIJN; ctx.lineJoin = "round"; ctx.lineCap = "round"; }
  function ovaal(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }

  var VORM = {
    pompoen: function (r) {
      lijn(r);
      ctx.fillStyle = "#3f7a2a"; ctx.beginPath(); ctx.moveTo(-r * .1, -r * .55); ctx.quadraticCurveTo(-r * .05, -r * .95, r * .22, -r * 1.02);
      ctx.lineTo(r * .26, -r * .86); ctx.quadraticCurveTo(r * .1, -r * .78, r * .12, -r * .55); ctx.closePath(); ctx.fill(); ctx.stroke();
      ovaal(-r * .45, 0, r * .52, r * .66); ctx.fillStyle = "#e07024"; ctx.fill(); ctx.stroke();
      ovaal(r * .45, 0, r * .52, r * .66); ctx.fill(); ctx.stroke();
      ovaal(0, 0, r * .48, r * .7); ctx.fillStyle = "#f08a34"; ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(255,240,200,.6)"; ctx.lineWidth = r * .1;
      ctx.beginPath(); ctx.arc(-r * .1, -r * .05, r * .42, Math.PI * 1.1, Math.PI * 1.35); ctx.stroke();
    },
    appel: function (r) {
      lijn(r);
      ctx.beginPath(); ctx.moveTo(0, -r * .55); ctx.quadraticCurveTo(r * .05, -r * .85, r * .18, -r * 1); ctx.stroke();
      ctx.fillStyle = "#6c9a33"; ctx.beginPath(); ctx.ellipse(r * .34, -r * .82, r * .26, r * .12, -.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r * .5);
      ctx.bezierCurveTo(r * .5, -r * .95, r * 1.05, -r * .45, r * .88, r * .2);
      ctx.bezierCurveTo(r * .72, r * .8, r * .28, r * .95, 0, r * .78);
      ctx.bezierCurveTo(-r * .28, r * .95, -r * .72, r * .8, -r * .88, r * .2);
      ctx.bezierCurveTo(-r * 1.05, -r * .45, -r * .5, -r * .95, 0, -r * .5);
      ctx.fillStyle = "#d63a2c"; ctx.fill(); lijn(r); ctx.stroke();
      ctx.fillStyle = "rgba(255,235,220,.75)"; ovaal(-r * .42, -r * .2, r * .13, r * .22); ctx.fill();
    },
    blad: function (r, it) {
      ctx.save(); ctx.scale(r / 20, r / 20); ctx.translate(-20, -20);
      ctx.fillStyle = it ? it.kleur : BLADKLEUR[0]; ctx.fill(BLAD);
      ctx.lineWidth = 1.6; ctx.strokeStyle = "#7a3510"; ctx.lineJoin = "round"; ctx.stroke(BLAD); ctx.lineWidth = 1.2; ctx.stroke(BLADNERF);
      ctx.restore();
    },
    goud: function (r, it, tijd) {
      var t = tijd || 0;
      var gl = ctx.createRadialGradient(0, 0, r * .3, 0, 0, r * 1.5);
      gl.addColorStop(0, "rgba(255,230,110,.85)"); gl.addColorStop(1, "rgba(255,230,110,0)");
      ctx.fillStyle = gl; ovaal(0, 0, r * 1.5, r * 1.5); ctx.fill();
      maakGoud();
      if (goudBeeld) { var w = r * 2.2, h = w * goudBeeld.height / goudBeeld.width; ctx.drawImage(goudBeeld, -w / 2, -h / 2, w, h); }
      else { VORM.pompoen(r); }
      for (var i = 0; i < 4; i++) {           /* fonkeltjes */
        var a = t * 2 + i * Math.PI / 2, d = r * 1.15, s = r * (.16 + .08 * Math.sin(t * 6 + i));
        ster(Math.cos(a) * d, Math.sin(a) * d, s, "#fff6b0");
      }
    },
    peer: function (r, it, tijd) {
      var t = tijd || 0;
      lijn(r);
      ctx.beginPath(); ctx.moveTo(0, -r * .7); ctx.lineTo(-r * .05, -r * 1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r * .75);
      ctx.bezierCurveTo(r * .35, -r * .78, r * .38, -r * .3, r * .5, -r * .05);
      ctx.bezierCurveTo(r * .9, r * .45, r * .55, r * .95, 0, r * .92);
      ctx.bezierCurveTo(-r * .55, r * .95, -r * .9, r * .45, -r * .5, -r * .05);
      ctx.bezierCurveTo(-r * .38, -r * .3, -r * .35, -r * .78, 0, -r * .75);
      ctx.fillStyle = "#8f8a3c"; ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#5a4a22";
      ovaal(r * .2, r * .3, r * .22, r * .16); ctx.fill(); ovaal(-r * .25, r * .55, r * .14, r * .1); ctx.fill(); ovaal(-r * .12, -r * .25, r * .09, r * .07); ctx.fill();
      ctx.strokeStyle = "rgba(90,130,40,.85)"; ctx.lineWidth = r * .08;   /* stinklijntjes */
      for (var i = -1; i <= 1; i += 2) {
        ctx.beginPath(); var x0 = i * r * .75;
        for (var k = 0; k <= 6; k++) { var yy = -r * .2 - k * r * .14, xx = x0 + Math.sin(k * 1.4 + t * 5) * r * .1; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
      }
      var fx = Math.cos(t * 7) * r * .9, fy = -r * .9 + Math.sin(t * 9) * r * .3;   /* vliegje */
      ctx.fillStyle = "rgba(255,255,255,.85)"; ovaal(fx - r * .07, fy - r * .1, r * .08, r * .05); ctx.fill(); ovaal(fx + r * .07, fy - r * .1, r * .08, r * .05); ctx.fill();
      ctx.fillStyle = "#222"; ovaal(fx, fy, r * .08, r * .08); ctx.fill();
    },
    denappel: function (r) {
      lijn(r);
      ovaal(0, 0, r * .6, r * .9); ctx.fillStyle = "#7d4f26"; ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#9b6a37"; ctx.lineWidth = Math.max(1, r * .06);
      for (var rij = 0; rij < 5; rij++) {
        var y = -r * .62 + rij * r * .32, n = rij % 2 ? 3 : 2, bw = r * (rij === 0 || rij === 4 ? .32 : .4);
        for (var k = 0; k < n; k++) {
          var x = (k - (n - 1) / 2) * bw * .95;
          ctx.beginPath(); ctx.moveTo(x - bw / 2, y); ctx.quadraticCurveTo(x, y + r * .32, x + bw / 2, y); ctx.quadraticCurveTo(x, y + r * .1, x - bw / 2, y); ctx.fill(); ctx.stroke();
        }
      }
    }
  };
  var SOORT = {
    pompoen: { p: 3, goed: true, r: 30 }, appel: { p: 2, goed: true, r: 25 }, blad: { p: 1, goed: true, r: 24 },
    goud: { p: 10, goed: true, r: 34 }, peer: { p: -2, goed: false, r: 27 }, denappel: { p: -1, goed: false, r: 26 }
  };

  function ster(x, y, s, kleur) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? s * .45 : s; ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    ctx.closePath(); ctx.fillStyle = kleur; ctx.fill();
  }

  /* Icoontjes voor de schermen, getekend met dezelfde functies */
  function maakIcoontjes() {
    var cache = {};
    document.querySelectorAll("img[data-item]").forEach(function (img) {
      var s = img.getAttribute("data-item");
      if (!cache[s]) {
        var c = document.createElement("canvas"); c.width = c.height = 128;
        var oud = ctx; ctx = c.getContext("2d"); ctx.translate(64, 66);
        VORM[s](s === "goud" ? 34 : 44, { kleur: BLADKLEUR[0] }, .6);
        ctx = oud; cache[s] = c.toDataURL();
      }
      img.src = cache[s];
    });
  }

  /* ---------- geluid (WebAudio, zelf gemaakt) ---------- */
  var ac = null;
  function audio() {
    if (stil) return null;
    if (!ac) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { ac = new A(); } catch (e) { return null; } }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function toon(freq, start, duur, type, vol, glij) {
    var a = audio(); if (!a) return;
    var t = a.currentTime + (start || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (glij) o.frequency.exponentialRampToValueAtTime(glij, t + duur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .18, t + .015); g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + duur + .02);
  }
  var GELUID = {
    vang: function (p) { var f = [0, 520, 620, 740][p] || 600; toon(f, 0, .12, "triangle", .2); toon(f * 1.5, .06, .14, "triangle", .14); },
    goud: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { toon(f, i * .07, .22, "triangle", .16); }); },
    bah: function () { toon(220, 0, .3, "sawtooth", .07, 110); toon(180, .05, .3, "square", .04, 90); },
    start: function () { [392, 523, 659].forEach(function (f, i) { toon(f, i * .1, .18, "triangle", .16); }); },
    tik: function () { toon(880, 0, .05, "square", .05); },
    fien: function () { toon(1400, 0, .08, "sine", .08, 1900); toon(1500, .12, .08, "sine", .08, 2000); },
    moos: function () { toon(300, 0, .12, "triangle", .14, 520); },
    einde: function (n) {
      var m = [523, 659, 784, 1047];
      m.forEach(function (f, i) { toon(f, i * .14, .3, "triangle", .17); });
      if (n >= 2) toon(1319, .62, .45, "triangle", .15);
      if (n >= 3) { toon(1568, .8, .5, "triangle", .14); toon(2093, .95, .5, "sine", .1); }
    }
  };
  function speel(n, x) { if (!stil && GELUID[n]) try { GELUID[n](x); } catch (e) { /* geen geluid */ } }
  function toonGeluidKnop() {
    knopGeluid.setAttribute("aria-pressed", stil ? "true" : "false");
    knopGeluid.setAttribute("aria-label", stil ? "Geluid aan" : "Geluid uit");
    knopGeluid.title = stil ? "Geluid aan" : "Geluid uit";
  }
  knopGeluid.addEventListener("click", function () {
    stil = !stil; schrijf("bramspel-geluid", stil ? "uit" : "aan"); toonGeluidKnop();
    if (!stil) speel("vang", 2);
    if (staat === "spelen") kader.focus({ preventScroll: true });
  });

  /* ---------- maten ---------- */
  var W = 800, H = 500, schaal = 1, dpr = 1, grond = 440, achter = null;
  function maten() {
    var b = kader.getBoundingClientRect(); if (!b.width) return;
    var cw = b.width, ch = b.height;
    var oudW = W;
    W = Math.max(480, Math.min(800, cw)); H = W * ch / cw;
    schaal = cw / W; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    grond = H - Math.max(46, H * .1);
    bram.x = bram.x * W / oudW; bram.doel = null;
    bram.h = Math.min(H * .3, 172); bram.w = bram.h * 341 / 360;
    achter = null;
    if (staat !== "spelen") teken(0);
  }

  /* ---------- achtergrond (één keer tekenen) ---------- */
  function maakAchtergrond() {
    var c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height;
    var g = c.getContext("2d"), k = schaal * dpr; g.scale(k, k);
    var lucht = g.createLinearGradient(0, 0, 0, grond);
    lucht.addColorStop(0, "#f3d79c"); lucht.addColorStop(.55, "#f9e8c4"); lucht.addColorStop(1, "#fbf0d9");
    g.fillStyle = lucht; g.fillRect(0, 0, W, H);
    var zon = g.createRadialGradient(W * .82, H * .2, 5, W * .82, H * .2, H * .3);
    zon.addColorStop(0, "rgba(255,244,190,1)"); zon.addColorStop(.25, "rgba(255,226,140,.9)"); zon.addColorStop(1, "rgba(255,226,140,0)");
    g.fillStyle = zon; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,250,238,.75)";               /* wolkjes */
    [[.18, .17, 1], [.5, .1, .8], [.66, .3, .6]].forEach(function (w) {
      var x = W * w[0], y = H * w[1], s = 34 * w[2];
      [[0, 0, 1], [s * 1.1, -s * .3, 1.2], [s * 2.2, 0, .9], [s, s * .25, 1]].forEach(function (b) { g.beginPath(); g.ellipse(x + b[0], y + b[1], s * b[2], s * .65 * b[2], 0, 0, Math.PI * 2); g.fill(); });
    });
    function heuvel(y, amp, kleur, fase) {
      g.beginPath(); g.moveTo(0, H);
      for (var x = 0; x <= W; x += 10) g.lineTo(x, y + Math.sin(x / W * 5 + fase) * amp + Math.sin(x / W * 13 + fase * 2) * amp * .3);
      g.lineTo(W, H); g.closePath(); g.fillStyle = kleur; g.fill();
    }
    heuvel(grond - H * .3, H * .04, "#e2c98e", 1);
    heuvel(grond - H * .18, H * .035, "#cdb36c", 2.5);
    function boom(x, y, s, kleur) {
      g.fillStyle = "#6b4526"; g.fillRect(x - s * .08, y - s * .7, s * .16, s * .7);
      g.fillStyle = kleur; [[0, -s * .95, .48], [-s * .3, -s * .75, .36], [s * .3, -s * .75, .38]].forEach(function (b) { g.beginPath(); g.arc(x + b[0], y + b[1], s * b[2], 0, Math.PI * 2); g.fill(); });
      g.strokeStyle = "rgba(84,56,30,.35)"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y - s * .95, s * .48, Math.PI * 1.05, Math.PI * 1.9); g.stroke();
    }
    boom(W * .08, grond - H * .12, H * .26, "#d9762b");
    boom(W * .3, grond - H * .19, H * .16, "#c8452a");
    boom(W * .62, grond - H * .17, H * .18, "#e3a32b");
    boom(W * .93, grond - H * .1, H * .3, "#c25a26");
    heuvel(grond - H * .07, H * .015, "#a9b25c", 4);
    /* grond */
    g.fillStyle = "#c99f62"; g.fillRect(0, grond, W, H - grond);
    g.fillStyle = "#8bb04f"; g.beginPath(); g.moveTo(0, grond + 8);
    for (var x = 0; x <= W; x += 14) g.lineTo(x, grond - 4 + (x / 14 % 2 ? -5 : 3));
    g.lineTo(W, grond + 10); g.lineTo(0, grond + 10); g.closePath(); g.fill();
    g.fillStyle = "rgba(84,56,30,.18)"; for (var i = 0; i < 26; i++) { g.beginPath(); g.ellipse((i * 137) % W, grond + 18 + (i * 53) % Math.max(10, H - grond - 22), 6, 2.5, 0, 0, Math.PI * 2); g.fill(); }
    /* mollenhopen in de hoeken */
    [W * .07, W * .93].forEach(function (x) {
      g.fillStyle = "#7a5230"; g.beginPath(); g.ellipse(x, grond + 6, 62, 13, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#3a2614"; g.beginPath(); g.ellipse(x, grond + 6, 46, 8, 0, 0, Math.PI * 2); g.fill();
    });
    /* papiertextuur */
    if (ok(IMG.papier)) { g.globalAlpha = .45; g.globalCompositeOperation = "multiply"; g.fillStyle = g.createPattern(IMG.papier, "repeat"); g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; }
    achter = c;
  }

  /* ---------- spelstaat ---------- */
  var staat = "start";        /* start | spelen | pauze | einde */
  var bram = { x: 400, w: 163, h: 172, doel: null, v: 0, kantel: 0, bah: 0, plof: 0, hop: 0, mand: [] };
  var dingen = [], deeltjes = [], teksten = [];
  var fien = null, moos = null, ballon = null;
  var punten = 0, tijd = 0, volgende = 0, volgendeFien = 0, reeks = 0, laatsteTik = 99, bijnaGezegd = false, schud = 0;
  var toetsL = false, toetsR = false;

  function schermen() {
    schermStart.hidden = staat !== "start"; schermPauze.hidden = staat !== "pauze"; schermEinde.hidden = staat !== "einde";
    knopPauze.hidden = staat !== "spelen";
    kader.setAttribute("data-staat", staat);
  }
  function hud() {
    elPunten.textContent = punten;
    var rest = Math.max(0, DUUR - tijd);
    elSec.textContent = Math.ceil(rest);
    elBalk.style.transform = "scaleX(" + (rest / DUUR).toFixed(4) + ")";
    elTijd.classList.toggle("bijna", rest <= 10);
  }

  function start() {
    staat = "spelen"; punten = 0; tijd = 0; volgende = .8; volgendeFien = 7 + Math.random() * 3; reeks = 0; laatsteTik = 99; bijnaGezegd = false;
    dingen = []; deeltjes = []; teksten = []; fien = null; ballon = null; bram.mand = []; bram.bah = 0;
    bram.x = W / 2; bram.doel = null; bram.v = 0;
    moosZegt("Vang ze!");
    schermen(); hud(); speel("start");
    kader.focus({ preventScroll: true });
    vorige = performance.now(); lus();
  }
  function pauze() {
    if (staat !== "spelen") return;
    staat = "pauze"; toetsL = toetsR = false; schermen();
    $("spel-verderknop").focus({ preventScroll: true });
  }
  function verder() {
    if (staat !== "pauze") return;
    staat = "spelen"; schermen(); kader.focus({ preventScroll: true }); vorige = performance.now(); lus();
  }
  function einde() {
    staat = "einde"; toetsL = toetsR = false;
    var n = punten >= STER3 ? 3 : punten >= STER2 ? 2 : 1;
    var record = punten > beste;
    if (record) { beste = punten; schrijf("bramspel-beste", String(beste)); }
    $("spel-eindpunten").textContent = punten;
    var sterren = $("spel-sterren"); sterren.setAttribute("aria-label", n + (n === 1 ? " ster" : " sterren") + " van de 3");
    sterren.querySelectorAll("span").forEach(function (s, i) { s.className = ""; void s.offsetWidth; if (i < n) s.className = "aan"; });
    $("spel-lof").textContent = n === 3 ? "Super gedaan!" : n === 2 ? "Goed gedaan!" : "Goed geprobeerd!";
    $("spel-record").hidden = !(record && punten > 0);
    toonBeste();
    schermen(); speel("einde", n);
    melding.textContent = "Klaar! Je hebt " + punten + " punten en " + n + (n === 1 ? " ster." : " sterren.") + (record && punten > 0 ? " Nieuw record!" : "");
    $("spel-opnieuwknop").focus({ preventScroll: true });
    dingen = []; deeltjes = []; teksten = []; fien = null; moos = null; ballon = null; bram.bah = bram.plof = 0; bram.kantel = 0; bram.hop = 0;
    teken(0);
  }
  function toonBeste() { $("spel-beste").textContent = beste; document.querySelector(".spel__beste").hidden = beste <= 0; }

  /* ---------- figuren ---------- */
  function moosZegt(tekst) {
    var links = bram.x > W / 2;            /* Moos komt op aan de andere kant dan Bram */
    moos = { x: links ? W * .07 : W * .93, t: 0, duur: 2.2, tekst: tekst };
    speel("moos");
  }
  function bramZegt(tekst) { ballon = { tekst: tekst, t: 0, duur: 1 }; }

  function nieuwDing() {
    var p = Math.min(1, tijd / DUUR);
    var kans = .12 + .16 * p, s;
    var r = Math.random();
    if (r < kans) s = Math.random() < .55 ? "peer" : "denappel";
    else { r = Math.random(); s = r < .4 ? "blad" : r < .75 ? "appel" : "pompoen"; }
    var rad = SOORT[s].r * (H > W ? 1.05 : 1);
    var snel = (125 + 115 * p) * Math.sqrt(H / 500) * (.88 + Math.random() * .24);
    if (s === "blad") snel *= .8;
    var rand = Math.max(rad, bram.h * .3);
    voegToe(s, rand + Math.random() * (W - rand * 2), -rad, snel);
    volgende = (1.05 - .5 * p) * (.8 + Math.random() * .4);
  }
  function voegToe(s, x, y, snel) {
    dingen.push({ s: s, x: x, y: y, vy: snel, r: SOORT[s].r * (H > W ? 1.05 : 1), rot: Math.random() * 6, vr: (Math.random() - .5) * (s === "blad" ? 3 : 1.4),
      fase: Math.random() * 6, kleur: BLADKLEUR[Math.floor(Math.random() * BLADKLEUR.length)], land: -1 });
  }

  /* Bram draagt een mand op zijn hoofd: dat is de vangzone.
     In de tekening zit het midden van zijn hoofd op 60 % van de breedte, de voeten op 52 %. */
  var HOOFD_X = .6, VOET_X = .52, HOOFD_TOP = .03;
  function mand() {
    var h = bram.h * .19, w = bram.h * .62;
    var top = grond + 10 + bram.hop - bram.h * (1 - HOOFD_TOP) + bram.h * .035 - h;
    return { x: bram.x + Math.sin(bram.kantel) * bram.h * .9, top: top, w: w, h: h };
  }

  function vang(d) {
    var info = SOORT[d.s];
    if (info.goed) {
      punten += info.p; reeks++;
      bram.plof = .3; bram.mand.push(d.s === "goud" ? "pompoen" : d.s); if (bram.mand.length > 3) bram.mand.shift();
      speel(d.s === "goud" ? "goud" : "vang", info.p);
      if (d.s === "goud") { bramZegt("Joepie!"); schud = rustig.matches ? 0 : .3; }
      if (reeks > 0 && reeks % 6 === 0) moosZegt(["Super!", "Goed zo!", "Knap!", "Hup Bram!"][(reeks / 6 - 1) % 4]);
      spat(d.x, d.y, d.s === "goud" ? "#ffd84a" : d.s === "appel" ? "#e2483a" : d.s === "blad" ? d.kleur : "#f08a34", d.s === "goud" ? 18 : 9);
    } else {
      punten = Math.max(0, punten + info.p); reeks = 0;
      bram.bah = .8; speel("bah");
      bramZegt(d.s === "peer" ? "Bah!" : "Au!");
      schud = rustig.matches ? 0 : .18;
      spat(d.x, d.y, d.s === "peer" ? "#8f9a3c" : "#7d4f26", 8);
      for (var i = 0; i < (rustig.matches ? 2 : 5); i++)        /* groen stinkwolkje */
        deeltjes.push({ x: d.x + (Math.random() - .5) * 50, y: d.y + (Math.random() - .5) * 20, vx: (Math.random() - .5) * 30, vy: -30 - Math.random() * 30,
          t: 0, duur: .9, kleur: "rgba(140,170,60,.55)", r: 12 + Math.random() * 10, zweef: true });
    }
    teksten.push({ x: d.x, y: d.y - 10, t: 0, tekst: (info.p > 0 ? "+" : "") + info.p, goed: info.goed });
    elPunten.parentNode.classList.remove("plof"); void elPunten.offsetWidth; elPunten.parentNode.classList.add("plof");
  }
  function spat(x, y, kleur, n) {
    if (rustig.matches) n = Math.ceil(n / 3);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160;
      deeltjes.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: 0, duur: .5 + Math.random() * .3, kleur: kleur, r: 3 + Math.random() * 4 });
    }
  }

  /* ---------- bijwerken ---------- */
  function stap(dt) {
    tijd += dt;
    var rest = DUUR - tijd;
    if (rest <= 0) { tijd = DUUR; hud(); einde(); return; }
    if (rest <= 10 && !bijnaGezegd) { bijnaGezegd = true; moosZegt("Nog even!"); }
    if (rest <= 5 && Math.ceil(rest) !== laatsteTik) { laatsteTik = Math.ceil(rest); speel("tik"); }

    /* Bram bewegen */
    var oudX = bram.x, maxV = W * 1.5;
    if (toetsL || toetsR) {
      bram.doel = null;
      var richting = (toetsR ? 1 : 0) - (toetsL ? 1 : 0);
      bram.v += (richting * W * .9 - bram.v) * Math.min(1, dt * 10);
      bram.x += bram.v * dt;
    } else if (bram.doel !== null) {
      var dx = bram.doel - bram.x, stapje = Math.sign(dx) * Math.min(Math.abs(dx), maxV * dt, Math.abs(dx) * Math.min(1, dt * 18));
      bram.x += stapje; bram.v = 0;
    } else bram.v *= Math.max(0, 1 - dt * 12);
    var marge = bram.h * .36;
    bram.x = Math.max(marge, Math.min(W - marge, bram.x));
    var snelheid = (bram.x - oudX) / Math.max(dt, .001);
    bram.kantel += (Math.max(-1, Math.min(1, snelheid / (W * .9))) * .12 - bram.kantel) * Math.min(1, dt * 10);
    bram.hop = rustig.matches ? 0 : -Math.abs(Math.sin(tijd * 14)) * Math.min(1, Math.abs(snelheid) / 300) * 6;
    bram.bah = Math.max(0, bram.bah - dt); bram.plof = Math.max(0, bram.plof - dt);

    /* nieuwe dingen */
    volgende -= dt; if (volgende <= 0) nieuwDing();

    /* Fien vliegt voorbij en laat een gouden pompoen vallen */
    volgendeFien -= dt;
    if (!fien && volgendeFien <= 0 && rest > 4) {
      var naarRechts = Math.random() < .5, fw = Math.min(W * .17, 120);
      fien = { x: naarRechts ? -fw : W + fw, vx: (naarRechts ? 1 : -1) * W / 4.2, w: fw, laat: W * (.25 + Math.random() * .5), gelaten: false, t: 0 };
      speel("fien");
    }
    if (fien) {
      fien.t += dt; fien.x += fien.vx * dt;
      if (!fien.gelaten && (fien.vx > 0 ? fien.x >= fien.laat : fien.x <= fien.laat)) { fien.gelaten = true; voegToe("goud", fien.x, H * .24, 120 * Math.sqrt(H / 500)); }
      if (fien.x < -fien.w * 1.5 || fien.x > W + fien.w * 1.5) { fien = null; volgendeFien = 11 + Math.random() * 5; }
    }

    /* vallen + vangen */
    var m = mand(), halfW = m.w / 2;
    for (var i = dingen.length - 1; i >= 0; i--) {
      var d = dingen[i];
      if (d.land >= 0) { d.land += dt; if (d.land > .7) dingen.splice(i, 1); continue; }
      var vy = d.y;
      d.y += d.vy * dt; d.rot += d.vr * dt;
      if (d.s === "blad") d.x += Math.sin(tijd * 2.2 + d.fase) * 40 * dt;
      var lijnY = m.top + d.r * .2;
      if (vy < lijnY && d.y >= lijnY && Math.abs(d.x - m.x) < halfW + d.r * .45) { vang(d); dingen.splice(i, 1); continue; }
      if (d.y >= grond - d.r * .35) { d.y = grond - d.r * .35; d.land = 0; }
    }
    for (i = deeltjes.length - 1; i >= 0; i--) {
      var p = deeltjes[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (!p.zweef) p.vy += 500 * dt; else p.r += 14 * dt;
      if (p.t > p.duur) deeltjes.splice(i, 1);
    }
    for (i = teksten.length - 1; i >= 0; i--) { teksten[i].t += dt; teksten[i].y -= 50 * dt; if (teksten[i].t > .9) teksten.splice(i, 1); }
    if (moos) { moos.t += dt; if (moos.t > moos.duur) moos = null; }
    if (ballon) { ballon.t += dt; if (ballon.t > ballon.duur) ballon = null; }
    schud = Math.max(0, schud - dt);
    hud();
  }

  /* ---------- tekenen ---------- */
  function wolk(x, y, tekst, grootte, pijlX) {
    ctx.font = "700 " + grootte + "px Kalam, 'Comic Sans MS', cursive";
    var bw = ctx.measureText(tekst).width + grootte * 1.1, bh = grootte * 1.55;
    x = Math.max(bw / 2 + 6, Math.min(W - bw / 2 - 6, x));
    var l = x - bw / 2, t = y - bh, rr = bh * .45;
    ctx.beginPath();
    ctx.moveTo(l + rr, t); ctx.lineTo(l + bw - rr, t); ctx.quadraticCurveTo(l + bw, t, l + bw, t + rr); ctx.lineTo(l + bw, t + bh - rr); ctx.quadraticCurveTo(l + bw, t + bh, l + bw - rr, t + bh);
    var px = Math.max(l + rr, Math.min(l + bw - rr, pijlX));
    ctx.lineTo(px + 10, t + bh); ctx.lineTo(px, t + bh + 14); ctx.lineTo(px - 8, t + bh);
    ctx.lineTo(l + rr, t + bh); ctx.quadraticCurveTo(l, t + bh, l, t + bh - rr); ctx.lineTo(l, t + rr); ctx.quadraticCurveTo(l, t, l + rr, t); ctx.closePath();
    ctx.fillStyle = "#fffaf0"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = LIJN; ctx.stroke();
    ctx.fillStyle = LIJN; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(tekst, x, t + bh * .54);
  }

  function tekenMand(m) {
    var l = m.x - m.w / 2, t = m.top, w = m.w, h = m.h;
    /* wat er al in de mand zit */
    bram.mand.forEach(function (s, i) { ctx.save(); ctx.translate(m.x + (i - 1) * w * .26, t + 2); ctx.rotate((i - 1) * .3); VORM[s](SOORT[s].r * .62, { kleur: BLADKLEUR[i] }, tijd); ctx.restore(); });
    ctx.beginPath(); ctx.moveTo(l, t); ctx.lineTo(l + w, t); ctx.lineTo(l + w * .88, t + h); ctx.quadraticCurveTo(m.x, t + h * 1.18, l + w * .12, t + h); ctx.closePath();
    ctx.fillStyle = "#b9783a"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = LIJN; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.strokeStyle = "rgba(84,56,30,.45)"; ctx.lineWidth = 2;
    for (var k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(l, t + h * k / 3); ctx.lineTo(l + w, t + h * k / 3); ctx.stroke(); }
    for (k = 1; k < 7; k++) { ctx.beginPath(); ctx.moveTo(l + w * k / 7, t); ctx.lineTo(l + w * (k / 7 * .76 + .12), t + h * 1.1); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(m.x, t, w / 2 + 3, h * .16, 0, 0, Math.PI * 2); ctx.fillStyle = "#8f5a2a"; ctx.fill(); ctx.stroke();
  }

  function teken(t) {
    var k = schaal * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!achter || achter.width !== canvas.width) maakAchtergrond();
    ctx.drawImage(achter, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    if (schud > 0) ctx.translate((Math.random() - .5) * 8 * schud / .3, (Math.random() - .5) * 6 * schud / .3);

    var moosWolk = null;
    /* Moos uit zijn hoopje */
    if (moos && ok(IMG.moos)) {
      var mw = Math.min(W * .24, 150), mh = mw * IMG.moos.naturalHeight / IMG.moos.naturalWidth;
      var f = moos.t < .3 ? moos.t / .3 : moos.t > moos.duur - .3 ? (moos.duur - moos.t) / .3 : 1;
      if (rustig.matches) f = 1;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, grond + 8); ctx.clip();
      var my = grond + 8 - mh * (.15 + .85 * f);
      var spiegel = moos.x > W / 2 ? -1 : 1;
      ctx.translate(moos.x, my); ctx.scale(spiegel, 1); ctx.drawImage(IMG.moos, -mw / 2, 0, mw, mh); ctx.restore();
      if (f > .8) moosWolk = [moos.x + (moos.x > W / 2 ? -mw * .35 : mw * .35), my - 6, moos.tekst, 26, moos.x];
    }

    /* Fien */
    if (fien && ok(IMG.fien)) {
      var vleugel = !rustig.matches && Math.floor(fien.t / .16) % 2 === 1 && ok(IMG.fien2) ? IMG.fien2 : IMG.fien;
      var fh = fien.w * vleugel.naturalHeight / vleugel.naturalWidth;
      ctx.save(); ctx.translate(fien.x, H * .19 + (rustig.matches ? 0 : Math.sin(fien.t * 5) * 8)); ctx.scale(fien.vx > 0 ? 1 : -1, 1);
      ctx.drawImage(vleugel, -fien.w / 2, -fh / 2, fien.w, fh); ctx.restore();
    }

    /* Bram met de mand op zijn hoofd */
    var sprite = bram.bah > 0 && ok(IMG.oei) ? IMG.oei : bram.plof > 0 && ok(IMG.hap) ? IMG.hap : IMG.bram;
    var m = mand();
    if (ok(sprite)) {
      var knijp = bram.plof > .18 && !rustig.matches ? .05 : 0;
      var bw = bram.h * sprite.naturalWidth / sprite.naturalHeight;
      ctx.save(); ctx.translate(bram.x, grond + 10 + bram.hop);
      ctx.fillStyle = "rgba(60,40,20,.22)"; ctx.beginPath(); ctx.ellipse((VOET_X - HOOFD_X) * bw, -2, bw * .42, 7, 0, 0, Math.PI * 2); ctx.fill();
      var wiebel = bram.bah > 0 && !rustig.matches ? Math.sin(bram.bah * 38) * .09 * (bram.bah / .8) : 0;
      ctx.rotate(bram.kantel + wiebel); ctx.scale(1 + knijp, 1 - knijp);
      ctx.drawImage(sprite, -HOOFD_X * bw, -bram.h, bw, bram.h); ctx.restore();
    }
    tekenMand(m);

    /* vallende dingen */
    dingen.forEach(function (d) {
      ctx.save(); ctx.translate(d.x, d.y);
      if (d.land >= 0) ctx.globalAlpha = Math.max(0, 1 - d.land / .7);
      if (d.s !== "goud" && !rustig.matches) ctx.rotate(d.s === "blad" ? d.rot : Math.sin(d.rot) * .25);
      VORM[d.s](d.r, d, t); ctx.restore();
    });
    deeltjes.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.duur); ctx.fillStyle = p.kleur; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    teksten.forEach(function (x) {
      ctx.globalAlpha = Math.max(0, 1 - x.t / .9);
      ctx.font = "700 34px Kalam, 'Comic Sans MS', cursive"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 6; ctx.strokeStyle = "#fffaf0"; ctx.strokeText(x.tekst, x.x, x.y); ctx.fillStyle = x.goed ? "#466e28" : "#b8322a"; ctx.fillText(x.tekst, x.x, x.y);
    });
    ctx.globalAlpha = 1;
    if (moosWolk) wolk.apply(null, moosWolk);
    if (ballon) wolk(m.x, m.top - 22, ballon.tekst, 28, m.x);
  }

  /* ---------- lus ---------- */
  var vorige = 0, bezig = false;
  function lus() {
    if (bezig) return; bezig = true;
    requestAnimationFrame(function kader_(nu) {
      if (staat !== "spelen") { bezig = false; teken(tijd); return; }
      var dt = Math.min(.05, Math.max(0, (nu - vorige) / 1000)); vorige = nu;
      stap(dt);
      if (staat === "spelen") { teken(tijd); requestAnimationFrame(kader_); } else bezig = false;
    });
  }

  /* ---------- invoer ---------- */
  function wijzer(e) {
    if (staat !== "spelen") return;
    var b = canvas.getBoundingClientRect();
    bram.doel = (e.clientX - b.left) / schaal;
  }
  canvas.addEventListener("pointerdown", function (e) {
    if (staat !== "spelen") return;
    e.preventDefault(); kader.focus({ preventScroll: true });
    try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* oude browser */ }
    wijzer(e);
  });
  canvas.addEventListener("pointermove", wijzer);
  kader.addEventListener("keydown", function (e) {
    var k = e.key;
    if (staat === "spelen") {
      if (k === "ArrowLeft" || k === "a" || k === "A" || k === "q" || k === "Q") { toetsL = true; e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { toetsR = true; e.preventDefault(); }
      else if (k === "p" || k === "P" || k === "Escape") { pauze(); e.preventDefault(); }
      else if (k === " " && e.target === kader) e.preventDefault();
    } else if (staat === "pauze" && (k === "p" || k === "P")) { verder(); e.preventDefault(); }
  });
  kader.addEventListener("keyup", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A" || k === "q" || k === "Q") toetsL = false;
    if (k === "ArrowRight" || k === "d" || k === "D") toetsR = false;
  });
  kader.addEventListener("focusout", function (e) { if (!kader.contains(e.relatedTarget)) { toetsL = toetsR = false; } });
  kader.tabIndex = -1;

  $("spel-startknop").addEventListener("click", start);
  $("spel-opnieuwknop").addEventListener("click", start);
  $("spel-verderknop").addEventListener("click", verder);
  knopPauze.addEventListener("click", pauze);

  /* pauzeren als het tabblad verborgen is of het spel uit beeld scrolt */
  document.addEventListener("visibilitychange", function () { if (document.hidden) pauze(); });
  window.addEventListener("blur", function () { toetsL = toetsR = false; });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.intersectionRatio < .25) pauze(); }); }, { threshold: .25 }).observe(kader);
  }
  if ("ResizeObserver" in window) new ResizeObserver(function () { maten(); }).observe(kader);
  else window.addEventListener("resize", maten);

  /* ---------- begin ---------- */
  maakIcoontjes(); toonGeluidKnop(); toonBeste(); schermen(); maten(); hud();
  if (document.fonts && document.fonts.load) document.fonts.load("700 28px Kalam").then(function () { if (staat !== "spelen") teken(0); }, function () {});
})();
