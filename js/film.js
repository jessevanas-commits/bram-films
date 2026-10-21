/* Filmpagina: grote speler, verhaal, scènes (klik = spring naar dat moment) */
(function () {
  "use strict";
  var B = window.Bram, el = B.el;
  var id = new URLSearchParams(location.search).get("id");
  var alle = B.films();
  var f = alle.filter(function (x) { return x.id === id; })[0];
  var main = document.getElementById("inhoud");

  if (!f) {
    document.title = "Film niet gevonden – De avonturen van Bram";
    main.appendChild(el("div", { class: "leeg" }, [
      el("img", { src: "assets/figuren/moos.webp", alt: "" }),
      el("h1", { class: "film-titel", text: "Oei, die film vinden we niet" }),
      el("p", null, ["Misschien heeft Moos verkeerd gegraven. ", el("a", { href: "index.html", text: "Terug naar alle films" })])
    ]));
    B.jaar(); return;
  }

  document.title = f.titel + " – De avonturen van Bram";
  var md = document.querySelector('meta[name="description"]'); if (md && f.beschrijving) md.setAttribute("content", f.beschrijving);
  var online = B.isOnline(f), video = null;

  if (online) {
    video = B.maakVideo(f, { id: "speler" });
    main.appendChild(el("div", { class: "speler" }, [video]));
  } else {
    main.appendChild(el("div", { class: "speler kaart--binnenkort" }, [el("div", { class: "kaart__beeld" }, [
      el("img", { src: f.poster || f.posterKlein, alt: "Afbeelding bij " + f.titel }), el("span", { class: "stempel", text: "Binnenkort beschikbaar" })])]));
  }

  var meta = el("ul", { class: "meta", "aria-label": "Over deze film" });
  [B.label(f), f.duur ? "⏱ " + B.duurTekst(f.duur) : "", f.scenes && f.scenes.length ? f.scenes.length + " scènes" : "",
   f.leeftijd ? "Voor " + f.leeftijd : "", online ? "" : "Binnenkort beschikbaar: de stemmen worden nog ingesproken"].filter(Boolean).forEach(function (t) { meta.appendChild(el("li", { text: t })); });

  var links = el("div", null, [
    el("h1", { class: "film-titel", text: f.titel }), meta,
    el("p", { text: f.verhaal || f.beschrijving || "" }),
    f.boodschap ? el("p", { class: "boodschap" }, [el("strong", { text: "Wat leren we? " }), f.boodschap]) : null
  ]);

  var dl = el("dl");
  function rij(k, v) { if (v) { dl.appendChild(el("dt", { text: k })); dl.appendChild(el("dd", { text: v })); } }
  rij("Duur", f.duur ? B.duurTekst(f.duur) : "");
  rij("Reeks", f.reeks); rij("Aflevering", f.aflevering ? String(f.aflevering) : "");
  rij("Met", (f.personages || []).join(", "));
  (f.stemmen || []).forEach(function (s) { if (s && s.naam) rij("Stem " + (s.rol || ""), s.naam); });
  if ((f.ondertitels || []).length) rij("Ondertitels", f.ondertitels.map(function (t) { return t.label || t.taal; }).join(", "));
  var zij = el("aside", { class: "zijkaart", "aria-labelledby": "zij-titel" }, [el("h2", { id: "zij-titel", text: "Weetjes" }), dl]);
  main.appendChild(el("div", { class: "film-kop" }, [links, zij]));

  if (f.scenes && f.scenes.length) {
    var lijst = el("ol", { class: "scenes" });
    var knoppen = [];
    f.scenes.forEach(function (s) {
      var tijd = typeof s.start === "number" ? s.start : null;
      var inhoud = [
        s.beeld ? el("img", { src: s.beeld, alt: "", loading: "lazy", decoding: "async", width: 480, height: 270 }) : null,
        el("span", { class: "scene__nr", text: "Scène " + s.nummer + (tijd !== null ? " · " + B.tijd(tijd) : "") }),
        el("span", { class: "scene__titel", text: s.titel }),
        s.tekst ? el("span", { class: "scene__tekst", text: s.tekst }) : null
      ];
      var k = online && tijd !== null
        ? el("button", { class: "scene", type: "button", "aria-label": "Scène " + s.nummer + ": " + s.titel + ". Speel vanaf " + B.tijd(tijd),
            onclick: function () { video.currentTime = tijd; var p = video.play(); if (p && p.catch) p.catch(function () {}); video.scrollIntoView({ behavior: "smooth", block: "center" }); video.focus({ preventScroll: true }); } }, inhoud)
        : el("div", { class: "scene" }, inhoud);
      k._start = tijd; knoppen.push(k);
      lijst.appendChild(el("li", null, [k]));
    });
    main.appendChild(el("section", { "aria-labelledby": "scenes-titel" }, [el("h2", { class: "kop", id: "scenes-titel", text: "De scènes" }), lijst]));
    if (video) video.addEventListener("timeupdate", function () {
      var t = video.currentTime, actief = null;
      knoppen.forEach(function (k) { if (k._start !== null && t >= k._start) actief = k; });
      knoppen.forEach(function (k) { if (k === actief) k.setAttribute("aria-current", "true"); else k.removeAttribute("aria-current"); });
    });
  }

  var andere = alle.filter(function (x) { return x.id !== f.id; });
  if (andere.length) {
    var r = el("ul", { class: "raster" });
    andere.slice(0, 3).forEach(function (x) {
      r.appendChild(el("li", null, [el("article", { class: "kaart" }, [
        el("a", { class: "kaart__beeld", href: "film.html?id=" + encodeURIComponent(x.id), "aria-label": x.titel }, [el("img", { src: x.posterKlein || x.poster, alt: "", loading: "lazy" })]),
        el("h3", { class: "kaart__titel" }, [el("a", { href: "film.html?id=" + encodeURIComponent(x.id), text: x.titel })])])]));
    });
    main.appendChild(el("section", { "aria-labelledby": "meer-titel" }, [el("h2", { class: "kop", id: "meer-titel", text: "Nog meer van Bram" }), r]));
  }

  /* ?t=120 in de link = start op 2:00 */
  var t0 = parseFloat(new URLSearchParams(location.search).get("t"));
  if (video && t0 > 0) video.addEventListener("loadedmetadata", function () { video.currentTime = t0; }, { once: true });
  B.blaadjes(6);
  B.jaar();
})();
