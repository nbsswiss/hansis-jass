# Changelog – Hansis Jass

## 1.60 – 2026-10-18

- Deutschschweizer Karten neu nach Fotovorlage: gezeichnete Schellen (gelbe Kugeln mit
  rot-schwarzem Band), Rosen (gelbe Blüten mit rotem Kern), Schilten (schwarz-weisse Wappen,
  jedes anders) und Eicheln statt Emojis; Zahlen in den Ecken im feinen Rahmen; Banner als
  Fahne; Bildkarten mit „UNDER“, „OBER“, „KÖNIG“; Ober mit Zipfelmütze, Pfeife und Stock;
  Ass mit grossem Zeichen.

## 1.50 – 2026-10-18

- Zahlen 6–10 stehen in den vier Eckzeichen der Zahlenkarten (unten aufrecht lesbar).
- Deutschschweizer Kartenbild: Symbole hatten eine falsche Grösse – korrigiert.
- Jasstafel mit Kreide: kleine Schiefertafel oben links (antippen für die ganze Tafel),
  pro Team das „Z“ mit Strichen (100 oben, 50 als X auf der Diagonale, 20 unten, Rest als Zahl),
  Rundenliste; Rundenabrechnung und Partieende ebenfalls als Tafel.
- Jassteppich mit feinen Linien geviertelt; jeder legt seine Karte in sein Viertel
  (wie im Samschtig-Jass).

## 1.40 – 2026-10-18

- Der Bauer zeigt von Anfang an Hansis Portrait (Standard-Portrait, `assets/portraits/bauer.jpg`,
  ohne Foto-Metadaten). In den Einstellungen: eigenes Foto wählen, „Entfernen“ (dann der
  gezeichnete Kopf) oder „Standard“ (zurück zu Hansis Portrait); Schalter Ein/Aus bleibt.

## 1.31 – 2026-10-18

- Portraits sind standardmässig eingeschaltet (Schalter in den Einstellungen bleibt).

## 1.30 – 2026-10-18

- Portraits: In den Einstellungen kann für Bauer, Dame und König je ein Foto gewählt werden
  (Kamera oder Fotomediathek). Es ersetzt den gezeichneten Kopf auf allen vier Farben.
  Schalter „Portraits auf den Bildkarten“ Ein/Aus. Fotos bleiben nur auf dem Gerät.

## 1.20 – 2026-10-18

- Karten neu im Stil der Schweizer Jasskarten (nach Fotos): grosse Farbzeichen ohne
  Buchstaben, „10“ in den Eckzeichen der Zehn, Ass mit vier kleinen Eckzeichen,
  Bildkarten mit grossem Farbzeichen oben links und neu gezeichneten Figuren
  (König mit Schwert und Reichsapfel, Dame mit Rose, Bauer mit Federbarett und Hellebarde).
  Karten etwas grösser.
- Hand sortiert: Farben abwechselnd schwarz/rot, Trumpf zuerst; innerhalb der Farbe nach
  der Zahl (Bauer und Nell auch beim Trumpf an ihrem natürlichen Platz).
- Anzeige oben: „Trumpf ♥ Herz – gemacht von …“ (und wer geschoben hat); beim Spieler, der
  Trumpf gemacht hat, steht ein Trumpf-Abzeichen.
- Pfeile korrigiert: Obenabe ⬇︎, Undeufe ⬆︎.

## 1.11 – 2026-10-18

- Updates kommen sofort aufs iPad: Der Service Worker fragt immer beim Server nach
  (statt bis zu 10 Minuten alte Dateien aus dem Browser-Cache zu nehmen), die App sucht beim
  Start und beim Zurückkehren in den Vordergrund nach einer neuen Version und lädt sich
  dann einmal automatisch neu.

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
