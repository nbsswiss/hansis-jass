# Hansis Jass

Schieber-Jass als Progressive Web App (PWA) fürs iPad – Querformat, Touch-Bedienung.
Eine Spielerin (Sitz Süd) spielt mit einer Computer-Partnerin (Nord) gegen zwei
Computer-Gegner (West, Ost). Die Computer-Spieler sollen **wirklich gut** spielen.

## Projektziel

1. Korrekte, vollständige Schieber-Regeln (siehe [docs/regeln.md](docs/regeln.md)).
2. Starke Computer-Spieler, die die Strategieregeln aus [docs/strategie.md](docs/strategie.md)
   beherrschen (Anziehen / Verwerfen, Schmieren, Bock, Trumpf ziehen …).
3. Angenehme iPad-Oberfläche: grosse Karten, klare Anzeige von Trumpf, Punkten und Weis,
   offline spielbar, Spielstand bleibt beim Schliessen erhalten.

## Arbeitsreihenfolge

Regeln dokumentieren → Spiellogik mit Tests → Computer-Spieler mit Tests → Oberfläche.
Regeländerungen zuerst in `docs/regeln.md`, dann im Code, dann in den Tests.

## Versionierung (verbindlich)

- Jede ausgelieferte Änderung bekommt eine neue Versionsnummer, beginnend mit **1.00**.
- Format `X.YY`: kleine Änderungen/Fehlerbehebungen +0.01 (1.00 → 1.01),
  grössere neue Funktionen +0.10 (1.07 → 1.10), grundlegender Umbau +1.00.
- Die Version steht an **einer** Stelle: `src/version.js`. Sie wird in der App (Menü)
  angezeigt und als Cache-Name im Service Worker (`sw.js`) verwendet – beide Stellen
  bei jeder Version nachführen (`sw.js` importiert die Version nicht, weil iOS dort
  keine Module erlaubt; deshalb dort `CACHE_VERSION` mitändern).
- Jede Version in `CHANGELOG.md` mit Datum und Stichworten eintragen.

## Technik

- Reines HTML/CSS/JavaScript (ES-Module), **kein Build-Schritt, keine Abhängigkeiten**.
  Die App muss direkt aus dem Ordner von einem statischen Webserver laufen.
- Struktur:
  - `src/core/` – Spiellogik ohne DOM (Karten, Regeln, Weis, Runde, Partie). Rein und testbar.
  - `src/ai/` – Computer-Spieler. Läuft im Web Worker (`src/ai/worker.js`).
  - `src/ui/` – Oberfläche (DOM, CSS, Animationen).
  - `tests/` – Tests mit eigener Mini-Testbibliothek (`tests/testlib.js`).
- Karten sind Zahlen 0–35: `farbe = Math.floor(k / 9)`, `wert = k % 9`
  (0=6, 1=7, 2=8, 3=9, 4=10, 5=Bauer/Under, 6=Dame/Ober, 7=König, 8=Ass).
- Sitze: 0=Süd (Spielerin), 1=Ost, 2=Nord (Partnerin), 3=West.
  Gespielt wird im Gegenuhrzeigersinn: 0 → 1 → 2 → 3. Teams: {0,2} und {1,3}.

## Regeln für den Code

- **Computer-Spieler schummeln nicht.** Sie bekommen nur die eigene Sicht
  (`round.viewFor(sitz)`): eigene Karten + öffentlich Bekanntes. Nie die ganze Runde übergeben.
- Zufall immer über einen übergebenen RNG (`src/core/rng.js`), damit Tests reproduzierbar sind.
- Spiellogik in `src/core` darf nichts von DOM, Worker oder `localStorage` wissen.
- Texte in der Oberfläche auf Deutsch (Schweizer Jass-Begriffe: Bauer, Nell, Stöck, Weis,
  Obenabe, Undeufe, Schieben, Match).
- Touch first: Trefferflächen mindestens 44 px, keine Hover-abhängigen Funktionen.

## Tests

```bash
./scripts/test.sh
```

Läuft mit `node`, falls installiert, sonst mit dem in macOS eingebauten JavaScriptCore (`jsc`).
Im Browser: `tests/test.html` über den lokalen Server öffnen.
Vor jeder neuen Version müssen alle Tests grün sein.

## Lokal starten

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen.

## Veröffentlichung

- Repository: https://github.com/nbsswiss/hansis-jass (öffentlich, Push per SSH)
- App: https://nbsswiss.github.io/hansis-jass/ (GitHub Pages, Branch `main`, Ordner `/`)
- Jeder Push auf `main` wird automatisch veröffentlicht. Vorher Tests laufen lassen,
  Version erhöhen und mit `git tag vX.YY` markieren.


## Portraits

- In den Einstellungen kann pro Figur (Bauer/Under, Dame/Ober, König) ein Foto gewählt werden;
  es ersetzt den gezeichneten Kopf auf allen vier Farben und lässt sich ein- und ausschalten.
- Fotos werden auf dem Gerät verkleinert und **nur lokal** gespeichert (localStorage
  `hansis-jass-portraits`). Keine Familienfotos ins Repository legen: es ist öffentlich.
