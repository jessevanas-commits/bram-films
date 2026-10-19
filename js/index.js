/* Overzichtspagina: kaartjes, filter op reeks, zoeken en sorteren */
(function () {
  "use strict";
  var B = window.Bram, el = B.el;
  var alle = B.films();
  var raster = document.getElementById("raster");
  var chips = document.getElementById("reeksen");
  var zoek = document.getElementById("zoek");
  var sorteer = document.getElementById("sorteer");
  var teller = document.getElementById("teller");
  var gekozenReeks = "";

  function kaart(f) {
    var online = B.isOnline(f);
    var img = el("img", { src: f.posterKlein || f.poster, alt: online ? "" : "Afbeelding bij " + f.titel, loading: "lazy", decoding: "async", width: 640, height: 360 });
    var beeld;
    if (online) {
      beeld = el("button", { class: "kaart__beeld", type: "button", "aria-label": "Speel " + f.titel + (f.duur ? " (" + B.duurTekst(f.duur) + ")" : ""),
        onclick: function () { B.speelInLichtbak(f); } }, [img, el("span", { class: "speelknop" }, [B.speelIcoon()])]);
    } else {
      beeld = el("div", { class: "kaart__beeld" }, [img, el("span", { class: "stempel", text: "Binnenkort" })]);
    }
    if (f.duur) beeld.appendChild(el("span", { class: "duur", "aria-hidden": "true", text: f.duur }));
    var pagina = "film.html?id=" + encodeURIComponent(f.id);
    var acties = el("div", { class: "kaart__acties" }, [
      online ? el("button", { class: "knop knop--oranje", type: "button", onclick: function () { B.speelInLichtbak(f); } }, [B.speelIcoon(), "Kijken"]) : null,
      el("a", { class: "knop", href: pagina }, [online ? "Meer info" : "Lees meer"])
    ]);
    acties.querySelectorAll("svg").forEach(function (s) { s.style.width = "1em"; s.style.height = "1em"; });
    return el("li", null, [el("article", { class: "kaart" + (online ? "" : " kaart--binnenkort") }, [
      beeld,
      B.label(f) ? el("p", { class: "label", text: B.label(f) }) : null,
      el("h3", { class: "kaart__titel" }, [el("a", { href: pagina, text: f.titel })]),
      el("p", { class: "kaart__tekst", text: f.beschrijving || "" }),
      acties
    ])]);
  }

  function reeksKnoppen() {
    var reeksen = [];
    alle.forEach(function (f) { if (f.reeks && reeksen.indexOf(f.reeks) < 0) reeksen.push(f.reeks); });
    if (reeksen.length < 1) { chips.closest("fieldset").hidden = true; return; }
    [""].concat(reeksen).forEach(function (r) {
      chips.appendChild(el("button", { class: "knop", type: "button", "aria-pressed": r === gekozenReeks ? "true" : "false", "data-reeks": r,
        onclick: function () { gekozenReeks = r; chips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-reeks") === r ? "true" : "false"); }); toon(); bewaar(); }
      }, [r || "Alle films"]));
    });
  }

  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  function toon() {
    var q = norm(zoek.value.trim());
    var lijst = alle.filter(function (f) {
      return (!gekozenReeks || f.reeks === gekozenReeks) && (!q || norm(f.titel).indexOf(q) >= 0);
    });
    var s = sorteer.value;
    lijst.sort(function (a, b) {
      if (s === "titel") return a.titel.localeCompare(b.titel, "nl");
      if (s === "nieuw") return String(b.datum || "").localeCompare(String(a.datum || ""));
      /* standaard: reeks, dan afleveringnummer, binnenkort achteraan */
      var oa = B.isOnline(a) ? 0 : 1, ob = B.isOnline(b) ? 0 : 1;
      if (oa !== ob) return oa - ob;
      var r = String(a.reeks || "").localeCompare(String(b.reeks || ""), "nl");
      return r || (a.aflevering || 0) - (b.aflevering || 0);
    });
    raster.textContent = "";
    lijst.forEach(function (f, i) { var li = kaart(f); if (i === 0) li.className = "uitgelicht"; raster.appendChild(li); });
    if (!lijst.length) {
      raster.appendChild(el("li", { class: "leeg" }, [el("img", { src: "assets/figuren/moos.webp", alt: "" }),
        "Oei, Moos heeft verkeerd gegraven: geen film gevonden. Probeer een ander woord!"]));
    }
    teller.textContent = lijst.length === 1 ? "1 film" : lijst.length + " films";
  }

  function bewaar() {
    var p = new URLSearchParams();
    if (gekozenReeks) p.set("reeks", gekozenReeks);
    if (zoek.value.trim()) p.set("zoek", zoek.value.trim());
    if (sorteer.value !== "volgorde") p.set("sorteer", sorteer.value);
    var u = location.pathname + (p.toString() ? "?" + p : "");
    try { history.replaceState(null, "", u); } catch (e) { /* file:// in sommige browsers */ }
  }

  var start = new URLSearchParams(location.search);
  gekozenReeks = start.get("reeks") || "";
  zoek.value = start.get("zoek") || "";
  if (start.get("sorteer")) sorteer.value = start.get("sorteer");

  reeksKnoppen();
  zoek.addEventListener("input", function () { toon(); bewaar(); });
  sorteer.addEventListener("change", function () { toon(); bewaar(); });
  document.getElementById("zoekform").addEventListener("submit", function (e) { e.preventDefault(); });
  toon();
  B.blaadjes(10);
  B.jaar();
})();
