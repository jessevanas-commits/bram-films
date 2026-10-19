# De avonturen van Bram

Een eenvoudige website (gewoon HTML, CSS en JavaScript, zonder installatie of build-stap) waarop alle films en afleveringen van Bram staan. Je hebt geen server of domein nodig om ze te bekijken.

## Lokaal testen

Er is nog geen domein of hosting. Dat kan later: je zet dan gewoon deze hele map online, zonder iets te veranderen.

**Snelst:** dubbelklik op `index.html`. De site opent in je browser (via `file://`) en de films spelen gewoon af.

**Met een kleine lokale server** (doorspoelen in de film werkt dan precies zoals op een echte website):

| Computer | Wat doe je? |
|---|---|
| Mac | Dubbelklik op `start-site.command`. Krijg je de eerste keer een waarschuwing? Klik dan met de rechtermuisknop op het bestand, kies **Open** en daarna nog eens **Open**. |
| Windows | Dubbelklik op `start-site.bat`. |
| Linux / Terminal | `./start-site.sh` |

De browser opent dan vanzelf op **http://localhost:8000**. Stoppen doe je met **Ctrl+C** of door het venster te sluiten.

Je hebt daarvoor Python 3 nodig. Op een Mac zit dat er meestal al op. Op Windows haal je het van python.org (vink daar *Add Python to PATH* aan).
De scripts gebruiken `serve.py`. Dat is hetzelfde als `python3 -m http.server 8000`, maar het kan ook doorspoelen in de video (Range-verzoeken). Zonder `serve.py` vallen de scripts terug op `python3 -m http.server 8000`.

## Wat zit waar?

```
bram-site/
├── index.html          overzicht met alle films (kaartjes, zoeken, filter op reeks)
├── film.html           filmpagina: film.html?id=<id>  (grote speler, verhaal, scènes)
├── films.js            ★ DE LIJST MET ALLE FILMS: hier voeg je nieuwe films toe
├── css/style.css       de stijl (potlood en waterverf op crèmekleurig papier)
├── js/common.js        gedeelde hulpjes (speler, lichtbak, blaadjes)
├── js/index.js         overzichtspagina
├── js/film.js          filmpagina
├── fonts/              het handgeschreven lettertype Kalam (OFL-licentie)
├── assets/             hoofdbeeld, papiertextuur, figuurtjes, icoontjes
├── films/
│   └── bram-en-de-reuzenpompoen/
│       ├── film.mp4          de film (H.264, 720p)
│       ├── poster.jpg        groot beeld 1280×720
│       ├── poster-klein.webp kaartje 640×360
│       └── scenes/scene-01.webp … scene-08.webp
├── serve.py            kleine lokale testserver
└── start-site.command / start-site.bat / start-site.sh
```

## Een nieuwe film toevoegen

1. Maak een nieuwe map `films/<id>/`, bijvoorbeeld `films/bram-en-de-sneeuwpop/`.
   Gebruik kleine letters en streepjes en geen spaties.
2. Zet in die map:
   * `film.mp4`: liefst H.264/AAC met *faststart*, zodat de film meteen begint. Met ffmpeg:
     `ffmpeg -i origineel.mov -c:v libx264 -crf 22 -preset slow -c:a aac -b:a 160k -movflags +faststart film.mp4`
   * `poster.jpg` (16:9, bv. 1280×720) en eventueel `poster-klein.webp` (640×360).
   * Optioneel: `nl.vtt` met ondertitels en `scenes/scene-01.webp`, … (480×270).
3. Open `films.js` en plak het sjabloon hieronder **binnen** de rechte haken `[ … ]`.
   Zet een komma tussen twee films.
4. Herlaad de pagina. Klaar!

### Sjabloon (kopiëren en plakken)

```js
  {
    id: "bram-en-de-sneeuwpop",            // = mapnaam in films/
    titel: "Bram en de Sneeuwpop",
    duur: "10:00",                          // minuten:seconden
    reeks: "Bram – Seizoen 1",              // wordt een filterknop
    aflevering: 2,
    status: "online",                       // of "binnenkort" (kaartje zonder speler)
    datum: "2026-12-01",                    // voor "Nieuwste eerst"
    leeftijd: "5 tot 10 jaar",
    beschrijving: "Korte tekst voor het kaartje (1 à 2 zinnen).",
    verhaal: "Langere tekst voor de filmpagina.",
    boodschap: "Wat leren we uit deze film?",
    personages: ["Bram", "Fien", "Moos"],
    video: "films/bram-en-de-sneeuwpop/film.mp4",
    poster: "films/bram-en-de-sneeuwpop/poster.jpg",
    posterKlein: "films/bram-en-de-sneeuwpop/poster-klein.webp",
    ondertitels: [
      // { taal: "nl", label: "Nederlands", bestand: "films/bram-en-de-sneeuwpop/nl.vtt" }
    ],
    stemmen: [
      // { rol: "Bram", naam: "Naam van de stemacteur" }
    ],
    scenes: [
      // { nummer: 1, titel: "Titel van de scène", start: 0, tekst: "Korte uitleg", beeld: "films/bram-en-de-sneeuwpop/scenes/scene-01.webp" }
    ]
  },
```

* **Binnenkort:** zet `status: "binnenkort"` en laat `video` weg. Het kaartje krijgt dan een stempel "Binnenkort" en er is nog geen speler.
* **Scènes:** `start` is het aantal seconden vanaf het begin (1:10 = 70). Als je op een scène klikt, springt de film naar dat moment.
* **Link naar een moment:** `film.html?id=bram-en-de-reuzenpompoen&t=310` start op 5:10.
* **Een nieuwe versie van een film?** Vervang gewoon `films/<id>/film.mp4` door het nieuwe bestand met dezelfde naam. Voor Bram en de Reuzenpompoen staat nu de 720p-versie (78 MB) in `films/bram-en-de-reuzenpompoen/film.mp4`.

### Scènebeeldjes maken met ffmpeg (optioneel)

```
ffmpeg -ss 25 -i film.mp4 -frames:v 1 -vf scale=480:-2 scenes/scene-01.webp
```

## Online zetten (later)

De map is volledig statisch. Ze werkt op elke gewone webhost en ook op gratis diensten zoals Netlify, Cloudflare Pages of GitHub Pages. Upload de hele map, zonder de map `_screenshots`. Grote videobestanden zet je op termijn beter bij een videodienst of CDN. Dan vul je in `films.js` gewoon die link in bij `video`.
