# Changelog – Hansis Jass

## 1.10 – 2026-10-18

- Bildkarten mit gezeichneten Figuren statt Buchstaben: König, Dame, Bauer
  (deutschschweizer Bild: König, Ober, Under), doppelköpfig wie echte Jasskarten.
- Neuer Jassteppich: Filzstruktur, gepolsterter Lederrand mit Goldkante, Ziernaht
  und Emblem „Hansis Jass · Schieber“ in der Tischmitte.
- Einstellung „Jassteppich“: Grün, Blau, Bordeaux, Anthrazit.
- Fehler behoben: Karten mit eigener Grösse (z. B. „Letzter Stich“) hatten eine falsche Höhe.
- Kartengalerie zum Prüfen aller Karten: `tests/karten.html`.

## 1.00 – 2026-10-18

Erste Version.

- Regeln dokumentiert: `docs/regeln.md` (Schieber vollständig), `docs/strategie.md` (Strategieregeln).
- Spiellogik: Trumpf, Obenabe, Undeufe, Schieben, Bedienregeln inkl. Untertrumpfverbot und
  Bauer-Ausnahme, Weis mit Vergleich, Stöck, letzter Stich, Match, Multiplikator, Bedanken.
- Computer-Spieler: Mitzählen, Hände vermuten (inkl. Zeichen und Ansage), Durchrechnen vieler
  Verteilungen, exakte Suche in den letzten Stichen, Strategieregeln (Anziehen/Verwerfen,
  Schmieren, Trumpf ziehen, Farbe zurückspielen), Ansage mit Weis, Stöck und Multiplikator.
- Oberfläche fürs iPad (Querformat): Ansage-Dialog, Tipp-Funktion, Weis- und Stöck-Anzeige,
  letzter Stich, Rundenabrechnung, Einstellungen, Kurzregeln, Spielstand bleibt gespeichert.
- PWA: offline spielbar, als App auf dem Home-Bildschirm installierbar.
- Tests: 43 Tests (Regeln, Weis, Runde, Partie, KI).
