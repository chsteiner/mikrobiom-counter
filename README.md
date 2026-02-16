# Mikrobiom Counter

PWA zum Tracken der wöchentlichen Pflanzenvielfalt. Basierend auf dem [American Gut Project](https://pmc.ncbi.nlm.nih.gov/articles/PMC5954204/) (2018): 30+ verschiedene Pflanzen pro Woche führen zu einem signifikant diverseren Darmmikrobiom.

## Features

- **Spracheingabe** — Pflanzen per Stimme erfassen (Web Speech API, de-DE)
- **Manuelle Eingabe** — Search-as-you-type mit 284 deutschen Pflanzen in 10 Kategorien
- **Fuzzy Matching** — Erkennt Plurale, Umlaute, regionale Varianten (Paradeiser, Erdäpfel, ...)
- **Wöchentlicher Counter** — Fortschrittsring mit Zielfeier-Animation
- **Duplikat-Erkennung** — Bereits gezählte Pflanzen werden erkannt, Toast-Feedback
- **Wochen-Navigation** — Vergangene Wochen durchblättern in der Listenansicht
- **Streak-Tracking** — Aufeinanderfolgende Wochen mit 20+ Pflanzen
- **Neue-Pflanzen-Erkennung** — Markiert erstmals entdeckte Pflanzen
- **Statistik** — 8-Wochen-Verlauf, Durchschnitt, Streak
- **Daten-Export** — JSON und CSV (mit Duplikat-Schutz beim Import)
- **Update-Benachrichtigung** — PWA zeigt Banner bei verfügbaren Updates
- **Installierbar** — PWA mit Offline-Support (außer Voice Input)

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| UI | Svelte 5 |
| Build | Vite |
| Persistenz | Dexie.js (IndexedDB) |
| PWA | vite-plugin-pwa + Workbox |
| Sprache | TypeScript |

Kein Backend. Alle Daten bleiben lokal auf dem Gerät.

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server (HTTP)
```

### Handy testen (HTTPS für Mikrofon)

```bash
npm run build
npx vite preview --host
```

Öffne `https://<deine-ip>:4173/` in Chrome auf dem Handy (gleiches WLAN). Zertifikatswarnung akzeptieren.

### Produktion bauen

```bash
npm run build      # Output in dist/
```

## Pflanzen-Datenbank

284 Einträge in 10 Kategorien:

| Kategorie | Beispiele |
|-----------|-----------|
| Gemüse | Brokkoli, Karotte, Lotuswurzel, Bittermelone, ... |
| Obst | Apfel, Aronia, Kaktusfeige, ... |
| Pilze | Champignon, Shiitake, Pfifferling, Trüffel, ... |
| Nüsse | Walnuss, Cashew, Macadamia, ... |
| Samen | Chiasamen, Sesam, Alfalfa, ... |
| Hülsenfrüchte | Linsen, Kichererbsen, Johannisbrot, ... |
| Getreide | Hafer, Quinoa, Buchweizen, ... |
| Kräuter | Basilikum, Kamille, Gundermann, ... |
| Gewürze | Kurkuma, Kapern, Zimt, ... |
| Genussmittel | Kaffee, Kakao, Tee, Mate |

Jede Pflanze hat Aliase für Pluralformen, österreichische/schweizer Varianten und Speech-Recognition-Varianten.

## Einschränkungen

- **Voice Input braucht Internet** — Chrome sendet Audio an Google-Server. Offline → manuelle Eingabe.
- **Nur Chrome Android** — Safari iOS PWA unterstützt SpeechRecognition nicht.
- **Kein Cloud-Backup** — Daten nur lokal. Export-Funktion nutzen!
