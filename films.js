/*
 * De avonturen van Bram – alle films en afleveringen staan in deze ene lijst.
 * Een nieuwe film toevoegen? Kopieer het sjabloon uit README.md,
 * plak het hieronder tussen de rechte haken [ ... ] en vergeet de komma niet.
 *
 * Velden:
 *   id          (verplicht) korte naam zonder spaties = mapnaam in films/<id>/
 *   titel       (verplicht)
 *   duur        "mm:ss", bv. "10:00"
 *   reeks       bv. "Bram – Seizoen 1" (wordt een filterknop)
 *   aflevering  nummer binnen de reeks
 *   status      "online" (standaard) of "binnenkort" (kaartje zonder speler)
 *   beschrijving korte tekst voor het kaartje
 *   verhaal     langere tekst voor de filmpagina (optioneel)
 *   video       pad naar het .mp4-bestand
 *   poster      pad naar de grote afbeelding (16:9)
 *   posterKlein pad naar een kleinere versie voor het kaartje (optioneel)
 *   ondertitels [{ taal: "nl", label: "Nederlands", bestand: "films/<id>/nl.vtt" }] (optioneel)
 *   stemmen     [{ rol: "Bram", naam: "..." }] (optioneel)
 *   scenes      [{ nummer, titel, start (seconden), tekst, beeld }] (optioneel)
 *   datum       "JJJJ-MM-DD" (optioneel, voor sorteren op nieuwste)
 */
window.BRAM_FILMS = [
  {
    id: "bram-en-de-reuzenpompoen",
    titel: "Bram en de Reuzenpompoen",
    duur: "10:00",
    reeks: "Bram – Seizoen 1",
    aflevering: 1,
    status: "online",
    datum: "2026-10-19",
    leeftijd: "5 tot 10 jaar",
    beschrijving:
      "Bram heeft de grootste pompoen van het Eikenbos gekweekt en wil hem helemaal alleen naar het Herfstfeest brengen. Maar Bolleke rolt de heuvel af…",
    verhaal:
      "Bram, een klein groen kikkertje, heeft de grootste pompoen van het Eikenbos gekweekt en wil hem helemaal alleen naar het Herfstfeest brengen. Hulp van zijn vriendinnetje Fien het uiltje en de verstrooide mol Moos slaat hij koppig af. Maar wanneer Bolleke de pompoen de heuvel af rolt en midden in de vijver belandt, moet Bram iets doen wat moeilijker is dan duwen of trekken: hulp vragen. Samen krijgen de drie vrienden Bolleke net op tijd op het dorpsplein, waar Bram ontdekt dat een prijs veel mooier is als je hem kunt delen.",
    boodschap: "Hulp vragen is niet zwak, maar slim, en samen kom je verder dan alleen.",
    personages: ["Bram", "Fien", "Moos", "Bolleke"],
    video: "films/bram-en-de-reuzenpompoen/film.mp4",
    poster: "films/bram-en-de-reuzenpompoen/poster.jpg",
    posterKlein: "films/bram-en-de-reuzenpompoen/poster-klein.webp",
    ondertitels: [],
    stemmen: [],
    scenes: [
      { nummer: 1, titel: "Een reuzenpompoen", start: 0,
        tekst: "Diep in het Eikenbos wordt Bram wakker naast zijn reuzenpompoen. Hij meet hem met gespreide armen: drie keer!" ,
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-01.webp" },
      { nummer: 2, titel: "Ik kan het alleen!", start: 70,
        tekst: "Fien het uiltje en Moos de mol willen helpen, maar Bram kruist zijn armen: dat kan hij helemaal alleen.",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-02.webp" },
      { nummer: 3, titel: "Duwen, trekken, springen", start: 165,
        tekst: "Duwen lukt niet, trekken ook niet… Tot Bram op de pompoen springt en die door het hekje het pad af rolt.",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-03.webp" },
      { nummer: 4, titel: "Bergaf!", start: 240,
        tekst: "De pompoen rolt steeds sneller, door de bladerhoop en over de molshopen, recht naar de vijver.",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-04.webp" },
      { nummer: 5, titel: "Midden in de vijver", start: 310,
        tekst: "Plons! Bolleke drijft weg. Op een waterlelieblad durft Bram eindelijk om hulp te vragen.",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-05.webp" },
      { nummer: 6, titel: "Eén, twee… trekken!", start: 415,
        tekst: "Fien trekt vliegend, Moos trekt op de oever en Bram duwt zwemmend. Samen krijgen ze Bolleke op het karretje.",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-06.webp" },
      { nummer: 7, titel: "Het Herfstfeest", start: 505,
        tekst: "Net op tijd op het dorpsplein. En wie is de jury? Moos! Maar wat doet Bram met de gouden medaille?",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-07.webp" },
      { nummer: 8, titel: "Een lantaarn in de nacht", start: 570,
        tekst: "Bolleke gloeit als lantaarn en de vrienden eten samen pompoensoep.",
        beeld: "films/bram-en-de-reuzenpompoen/scenes/scene-08.webp" }
    ]
  }
];
