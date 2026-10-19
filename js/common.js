/* Gedeelde hulpjes voor De avonturen van Bram */
(function () {
  "use strict";
  var B = (window.Bram = {});

  B.films = function () {
    return (window.BRAM_FILMS || []).filter(function (f) { return f && f.id && f.titel; });
  };
  B.isOnline = function (f) { return (f.status || "online") !== "binnenkort" && !!f.video; };

  /* "10:00" -> "10 min", "4:30" -> "4 min 30 s" */
  B.duurTekst = function (d) {
    if (!d) return "";
    var p = String(d).split(":").map(Number);
    var s = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0];
    if (isNaN(s)) return String(d);
    var m = Math.floor(s / 60), r = s % 60;
    return m + " min" + (r ? " " + r + " s" : "");
  };
  B.tijd = function (s) {
    s = Math.max(0, Math.round(s || 0));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };
  B.label = function (f) {
    var l = [];
    if (f.reeks) l.push(f.reeks);
    if (f.aflevering) l.push("Aflevering " + f.aflevering);
    return l.join(" · ");
  };

  /* Kleine helper om elementen te bouwen zonder innerHTML (veilig voor tekst) */
  B.el = function (tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") e.textContent = v;
      else if (k === "class") e.className = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  };
  B.speelIcoon = function () {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M6 3.5c0-1 1.1-1.6 2-1.1l13 8.3c.8.5.8 1.7 0 2.2L8 21.2c-.9.5-2-.1-2-1.1z");
    p.setAttribute("fill", "currentColor"); s.appendChild(p);
    return s;
  };

  /* Video-element met poster, bron en ondertitels */
  B.maakVideo = function (f, extra) {
    var v = B.el("video", Object.assign({ controls: true, preload: "metadata", playsinline: true, poster: f.poster || f.posterKlein,
      "aria-label": "Film: " + f.titel }, extra || {}));
    v.appendChild(B.el("source", { src: f.video, type: "video/mp4" }));
    (f.ondertitels || []).forEach(function (t, i) {
      if (t && t.bestand) v.appendChild(B.el("track", { kind: "subtitles", src: t.bestand, srclang: t.taal || "nl", label: t.label || "Nederlands", default: i === 0 }));
    });
    v.appendChild(document.createTextNode("Je browser kan deze film niet afspelen. "));
    v.appendChild(B.el("a", { href: f.video, text: "Download de film" }));
    return v;
  };

  /* Lichtbak (modal) speler */
  var dlg, vorigeFocus;
  B.speelInLichtbak = function (f) {
    if (!dlg) {
      dlg = B.el("dialog", { class: "lichtbak", "aria-labelledby": "lichtbak-titel" });
      dlg.addEventListener("close", function () {
        var v = dlg.querySelector("video"); if (v) { v.pause(); v.remove(); }
        if (vorigeFocus) vorigeFocus.focus();
      });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      document.body.appendChild(dlg);
    }
    vorigeFocus = document.activeElement;
    dlg.textContent = "";
    var sluit = B.el("button", { class: "knop", type: "button", "aria-label": "Sluit de film", onclick: function () { dlg.close(); } }, ["✕ Sluiten"]);
    dlg.appendChild(B.el("div", { class: "lichtbak__kop" }, [B.el("h2", { id: "lichtbak-titel", text: f.titel }), sluit]));
    var v = B.maakVideo(f, { autoplay: true });
    dlg.appendChild(v);
    dlg.appendChild(B.el("p", { class: "lichtbak__voet" }, [
      B.el("span", { text: [B.label(f), B.duurTekst(f.duur)].filter(Boolean).join(" · ") }),
      B.el("a", { href: "film.html?id=" + encodeURIComponent(f.id), text: "Meer over deze film →" })
    ]));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    var p = v.play && v.play(); if (p && p.catch) p.catch(function () {});
    v.focus();
  };

  /* Vallende blaadjes (alleen decoratie) */
  B.blaadjes = function (n) { return; /* uitgeschakeld: site is voor alle seizoenen */
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var box = B.el("div", { class: "blaadjes", "aria-hidden": "true" });
    for (var i = 0; i < (n || 9); i++) {
      var b = B.el("span", { class: "blad" });
      b.style.left = (Math.random() * 100).toFixed(1) + "vw";
      b.style.animationDuration = (11 + Math.random() * 12).toFixed(1) + "s";
      b.style.animationDelay = (-Math.random() * 20).toFixed(1) + "s";
      box.appendChild(b);
    }
    document.body.appendChild(box);
  };

  B.jaar = function () { var j = document.getElementById("jaar"); if (j) j.textContent = new Date().getFullYear(); };
})();
