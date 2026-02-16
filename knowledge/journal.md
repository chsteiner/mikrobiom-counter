# Journal

## Savepoints

| Hash | Beschreibung | Datum |
|------|-------------|-------|
| `ba1d71d` | MVP: Voice + Manual Input, 284 Pflanzen, 4 Views | 2026-02-16 |
| `4f3dcf9` | Prototype Polish: 13 TODO-Items (Bugs, UX, Performance) | 2026-02-16 |
| `76c6f25` | GitHub Pages Deployment via Actions | 2026-02-16 |
| `c33e6dd` | Adjektiv-Stripping (Tier 5 Matching) | 2026-02-16 |
| `9fcef2a` | PWA short_name fix | 2026-02-16 |

## Tester-Feedback

### Susi (2026-02-16)

- "Grüne Paprika" wurde nicht erkannt, nur "Paprika"
  - **Fix:** Tier 5 im plantMatcher: deutsche Lebensmittel-Adjektive werden vor dem Matching gestrippt
  - **Learning:** Speech Recognition liefert oft "grüne Paprika", "rote Linsen" etc. Adjektive müssen systematisch behandelt werden.

- PWA-Icon auf Android Home Screen zeigte "MikroCount" statt sinnvollem Namen
  - **Fix:** `short_name` in Manifest von "MikroCount" auf "30 Pflanzen" geändert
  - **Learning:** `short_name` im PWA-Manifest bestimmt den App-Namen auf dem Home Screen. Max. ~12 Zeichen sinnvoll.

### Chris (2026-02-16, Eigentest)

- "Salat" wurde nicht erkannt (nur Kopfsalat, Feldsalat etc.)
  - **Fix:** "Salat" als Alias für Kopfsalat hinzugefügt
  - **Learning:** Alltagssprache weicht von der Datenbankstruktur ab. Oberbegriffe als Alias für die häufigste Variante hinterlegen.

## Dead Ends

- **Dexie liveQuery + Svelte 5:** Bekannte Regression, liveQuery funktioniert nicht. Workaround: Promise-API + manuelle $state-Updates. Kein Fix in Sicht, wird für native App irrelevant.

## Offene Fragen

- Gewürzmischungen (Curry, Garam Masala, Za'atar): Zählen als 1 Pflanze oder als ihre Einzelbestandteile? Aktuell: als 1 Pflanze. Pragmatisch, aber nicht ganz korrekt.
- Sojasauce: Zählt das als Sojabohne? Ist ein fermentiertes Produkt. Aktuell nicht als expliziter Alias.
- Rauchsalz: Ist kein Pflanzenprodukt. Sollte aus der Liste entfernt werden.
