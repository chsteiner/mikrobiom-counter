# Pflanzendatenbank

## Überblick

| Kategorie | ID | Einträge | Beispiele |
|-----------|-----|---------|-----------|
| Gemüse | `gemuese` | 65 | Tomate, Karotte, Nori, Lotuswurzel |
| Obst | `obst` | 55 | Apfel, Avocado, Olive, Kaktusfeige |
| Nüsse | `nuesse` | 14 | Walnuss, Erdnuss, Tigernuss |
| Samen | `samen` | 16 | Sesam/Tahini, Chiasamen, Senfsaat |
| Hülsenfrüchte | `huelsenfruechte` | 19 | Linsen, Tofu/Sojabohne, Johannisbrot |
| Getreide | `getreide` | 27 | Hafer, Weizen/Pasta/Brot, Quinoa |
| Kräuter | `kraeuter` | 41 | Basilikum, Kamille, Brennnessel |
| Gewürze | `gewuerze` | 39 | Kurkuma, Zimt, Currypulver, Za'atar |
| Pilze | `pilze` | 10 | Champignon, Shiitake, Trüffel |
| Genussmittel | `genuss` | 4 | Kaffee, Kakao, Tee (Camellia), Mate |

**Gesamt:** 284 Pflanzen (Stand: plants.ts)

## Datenstruktur

```typescript
interface Plant {
  id: string;              // lowercase, keine Umlaute, Bindestriche statt Leerzeichen
  name: string;            // Anzeigename (Deutsch)
  category: PlantCategory; // Eine der 10 Kategorien
  aliases: string[];       // Alle alternativen Namen
}
```

## Alias-Typen

| Typ | Beispiel | Zweck |
|-----|----------|-------|
| Pluralform | Tomate/Tomaten | Grammatische Varianten |
| AT/CH-Variante | Paradeiser, Rüebli, Erdäpfel, Karfiol | Regionale Abdeckung |
| Umgangssprachlich | Knobi (Knoblauch), Knofel | Alltagssprache |
| Produktform | Tofu, Tempeh, Miso (= Sojabohne) | Verarbeitete Formen |
| Produktname | Tahini (= Sesam), Hummus (= Kichererbsen) | Handelsname |
| Kurzform | Salat (= Kopfsalat) | Häufige Abkürzung |
| Zubereitungsform | Popcorn, Polenta (= Mais) | Geläufige Gerichte |
| Speech-Typo | Brokoli, Zuccini | Häufige Fehlerkennungen |
| Fremdsprachlich | Courgette (= Zucchini), Cilantro (= Koriander) | Englische/franz. Namen |

## Suchindex (plantIndex.ts)

Für jeden Eintrag (Name + alle Aliase) wird ein SearchEntry gebaut:

```
normalized:  "grüner salat"          → lowercase, trim
deUmlauted:  "gruener salat"         → ä→ae, ö→oe, ü→ue, ß→ss
stemmed:     "gruen salat"           → deutsche Endungen entfernt
```

Stemming-Regeln (Reihenfolge wichtig):
1. `-chen` → entfernt (Diminutiv)
2. `-lein` → entfernt (Diminutiv)
3. `-nen` → `-n`
4. `-en` → entfernt
5. `-er` → entfernt
6. `-es` → entfernt
7. `-e` → entfernt
8. `-s` → entfernt
9. `-n` → entfernt

## Bekannte Probleme

### Doppelte Einträge / Überschneidungen

- `mais` (Gemüse) vs. `mais-getreide` (Getreide): Maiskolben als Gemüse, Maismehl/Popcorn als Getreide. Biologisch dieselbe Pflanze, aber zwei Einträge weil verschiedene Kategorien.
- `haferkleie` und `weizenkeime` haben eigene Einträge, obwohl sie Teile von Hafer/Weizen sind. Redundant.
- `vollkornreis` und `wildreis` sind separate Einträge neben `reis`. Wildreis ist biologisch eine andere Pflanze (Zizania), Vollkornreis nicht.
- `hanfsamen` und `hanfnuesse` sind dasselbe Produkt, zwei Einträge.
- `brunnenkresse` existiert doppelt: als Gemüse (`brunnenkresse`) und als Kraut (`brunnenkresse-kraut`).

### Fehlende Einträge

- Keine Rosine als eigenständiger Eintrag (Trockenfrüchte-Aliase fehlen teils)
- Sojasauce fehlt als Alias bei Sojabohnen (über matchPlant Tier 3 abgefangen via Prefix, aber nicht explizit)
- Vollkornpasta fehlt als Alias bei Weizen
- Kokosmilch als Alias bei Kokosnuss vorhanden, Kokosöl auch, aber: zählt Kokosöl? (Ist ein isoliertes Extrakt laut "Was zählt nicht?"-Regel)

### Grenzfälle in der Kategorisierung

- Erdnuss unter Nüsse (botanisch eine Hülsenfrucht)
- Rhabarber unter Obst (botanisch ein Gemüse)
- Kokosnuss unter Obst (botanisch eine Steinfrucht)
- Pilze sind keine Pflanzen (eigenes Biologisches Reich), werden aber allgemein mitgezählt
- Algen (Nori, Wakame, Kombu) unter Gemüse (sind weder Pflanzen noch Pilze)

### Alias-Lücken die bei Tests aufgefallen sind

- "Salat" wurde nicht erkannt (behoben: Alias für Kopfsalat)
- "Grüne Paprika" wurde nicht erkannt (behoben: Adjektiv-Stripping in plantMatcher Tier 5)

## Quelle der Einträge

Die initiale Liste wurde mit LLM-Unterstützung erstellt, basierend auf:
- Häufige Pflanzen in deutschsprachigen Supermärkten
- Österreichische und Schweizer Varianten
- Asiatische/internationale Pflanzen die in DE/AT/CH verbreitet sind
- Wildkräuter und Heilpflanzen die als Lebensmittel genutzt werden

Nicht systematisch abgeglichen mit einer Referenzdatenbank. Die Liste ist pragmatisch: was User wahrscheinlich einsprechen oder eintippen. Lücken werden über Tester-Feedback gefunden und gefüllt.

## Migration zur nativen App

Für die native Android-Version:
- Datenformat beibehalten (JSON-Array, gleiche Felder)
- Alias-Liste ist die wertvollste Arbeit, nicht die Pflanzennamen selbst
- Suchindex-Logik (Normalisierung, De-Umlaut, Stemming) ist sprachunabhängig wiederverwendbar
- Bekannte Probleme (Doppeleinträge, Kategorisierungsgrenzen) vor Migration bereinigen
