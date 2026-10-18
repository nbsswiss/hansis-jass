# Schieber-Regeln in Hansis Jass

Diese Datei ist die verbindliche Regelgrundlage der App. Wo es im Jass regionale
Varianten gibt, ist die gewählte Variante genannt; einstellbare Varianten sind mit
**(Einstellung)** markiert.

## 1. Karten und Spieler

- 36 Karten, 4 Farben zu je 9 Karten.
  Französisch (Standard): ♦ Ecke, ♥ Herz, ♠ Schaufel, ♣ Kreuz.
  Deutschschweizer Bild **(Einstellung)**: Schellen, Rosen, Schilten, Eicheln
  (gleiche Reihenfolge: ♦=Schellen, ♥=Rosen, ♠=Schilten, ♣=Eicheln).
- Werte je Farbe: 6, 7, 8, 9, 10 (Banner), Bauer (Under), Dame (Ober), König, Ass.
- 4 Spieler, je 2 bilden ein Team und sitzen sich gegenüber.
  In der App: Spielerin (Süd) + Partnerin (Nord) gegen Ost + West.
- Gespielt wird im **Gegenuhrzeigersinn**: Süd → Ost → Nord → West.
- Jeder Spieler erhält 9 Karten.

## 2. Ablauf einer Runde

1. Karten werden gemischt und verteilt (je 9).
2. **Ansagen**: Der Ansager wählt die Spielart: eine Trumpffarbe, Obenabe oder Undeufe –
   oder er **schiebt**.
3. **Schieben**: Schiebt der Ansager, muss seine Partnerin die Spielart bestimmen.
   Sie darf nicht zurückschieben.
4. **Ausspielen**: Den ersten Stich spielt immer der Ansager aus – auch wenn er geschoben hat.
5. Es werden 9 Stiche gespielt. Wer einen Stich gewinnt, spielt zum nächsten aus.
6. Am Ende werden die Punkte gezählt (Abschnitt 8).
7. Der nächste Spieler im Gegenuhrzeigersinn wird Ansager der nächsten Runde.

**Erste Runde einer Partie:** Ansager ist, wer die Ecke-7 (Schellen-7) hat.

## 3. Spielarten, Rangfolge und Kartenpunkte

### 3.1 Trumpf

Eine Farbe ist Trumpf. Trumpf sticht jede andere Farbe.

| Rang | Trumpffarbe | Punkte | Nicht-Trumpf | Punkte |
|---|---|---|---|---|
| 1 (höchste) | Bauer („Puur“) | 20 | Ass | 11 |
| 2 | Neun („Nell“) | 14 | König | 4 |
| 3 | Ass | 11 | Dame | 3 |
| 4 | König | 4 | Bauer | 2 |
| 5 | Dame | 3 | 10 | 10 |
| 6 | 10 | 10 | 9 | 0 |
| 7 | 8 | 0 | 8 | 0 |
| 8 | 7 | 0 | 7 | 0 |
| 9 (tiefste) | 6 | 0 | 6 | 0 |

Trumpffarbe 62 Punkte + drei Nebenfarben à 30 = 152 + 5 (letzter Stich) = **157**.

### 3.2 Obenabe

Kein Trumpf. In jeder Farbe gilt: Ass > König > Dame > Bauer > 10 > 9 > 8 > 7 > 6.
Punkte: Ass 11, König 4, Dame 3, Bauer 2, 10 10, **8 zählt 8**, 9/7/6 0.
Pro Farbe 38 Punkte → 152 + 5 = **157**.

### 3.3 Undeufe

Kein Trumpf, Rangfolge umgekehrt: 6 > 7 > 8 > 9 > 10 > Bauer > Dame > König > Ass.
Punkte: **6 zählt 11**, König 4, Dame 3, Bauer 2, 10 10, 8 zählt 8, Ass/9/7 0.
Pro Farbe 38 Punkte → 152 + 5 = **157**.

## 4. Bedienregeln (was darf ich spielen?)

Der Ausspieler darf jede Karte spielen.

### 4.1 Obenabe und Undeufe

- Wer die ausgespielte Farbe hat, muss sie angeben (bedienen).
- Wer sie nicht hat, darf eine beliebige Karte abwerfen.

### 4.2 Trumpfspiel

- **Farbe angeben:** Wer die ausgespielte Farbe hat, muss sie angeben – **oder** einen Trumpf
  spielen. Trumpf darf man immer spielen („stechen“), auch wenn man die Farbe hätte,
  ausser es wäre ein Untertrumpfen (siehe unten).
- **Trumpf ausgespielt:** Wer Trumpf hat, muss Trumpf angeben.
  **Ausnahme Bauer:** Ist der Trumpf-Bauer der einzige Trumpf in der Hand, muss er nicht
  gespielt werden; man darf dann eine beliebige Karte spielen.
- **Untertrumpfen verboten:** Liegt im Stich bereits ein Trumpf und wurde eine Nicht-Trumpffarbe
  ausgespielt, darf man keinen tieferen Trumpf darunter legen.
  Ausnahme: Man hat nur noch Trümpfe, die alle tiefer sind (und keine Karte der ausgespielten
  Farbe) – dann darf man untertrumpfen.
- Wer die ausgespielte Farbe nicht hat, darf sonst jede Karte spielen (abwerfen oder stechen).

## 5. Wer gewinnt den Stich?

- Trumpfspiel: Liegt mindestens ein Trumpf im Stich, gewinnt der höchste Trumpf.
  Sonst gewinnt die höchste Karte der ausgespielten Farbe.
- Obenabe: höchste Karte der ausgespielten Farbe.
- Undeufe: tiefste Karte der ausgespielten Farbe (6 ist die „höchste“).
- Abgeworfene Karten anderer Farben können nie stechen.

## 6. Weis

Weis sind Kartenkombinationen in der Hand, die Zusatzpunkte geben.

### 6.1 Arten und Werte

| Weis | Punkte |
|---|---|
| Dreiblatt (3 Karten in Folge, gleiche Farbe) | 20 |
| Vierblatt | 50 |
| Fünfblatt | 100 |
| Sechsblatt | 150 |
| Siebenblatt | 200 |
| Achtblatt | 250 |
| Neunblatt | 300 |
| Vier Gleiche: 10er, Damen, Könige oder Asse | 100 |
| Vier Neuner (Nell) | 150 |
| Vier Bauern | 200 |

- Die Folge richtet sich immer nach der natürlichen Reihenfolge 6-7-8-9-10-B-D-K-A,
  unabhängig von der Spielart. Vier 6er, 7er oder 8er zählen nicht.
- Eine Folge zählt nur als ganze (ein Sechsblatt ist nicht zwei Dreiblatt).
- Eine Karte darf gleichzeitig in einer Folge und in vier Gleichen vorkommen.
- Ein Spieler darf mehrere Weis haben (z. B. ein Dreiblatt und vier Könige).

### 6.2 Weisen und Vergleichen

- Jeder Spieler weist beim Ausspielen seiner ersten Karte (im 1. Stich).
  In der App weisen alle Spieler automatisch.
- Nach dem 1. Stich wird verglichen: **Nur das Team mit dem höchsten Einzelweis** erhält
  Weispunkte – dafür **alle** Weise beider Teammitglieder. Das andere Team erhält keine.
- Die Weis-Karten des gewinnenden Teams werden allen gezeigt.
- Reihenfolge beim Vergleich zweier Weise:
  1. mehr Punkte gewinnt;
  2. bei gleichen Punkten gewinnen vier Gleiche vor einer Folge;
  3. bei zwei Folgen gleicher Länge gewinnt die höhere Folge (höchste Karte;
     bei **Undeufe** gewinnt die tiefere Folge);
     bei vier Gleichen mit gleichem Wert gewinnt der höhere Rang
     (bei Undeufe der tiefere);
  4. bei gleich hohen Folgen gewinnt die Folge in der Trumpffarbe;
  5. sonst gewinnt, wer in der Spielreihenfolge (ab Ausspieler) zuerst kommt.

## 7. Stöck

- König und Dame der Trumpffarbe in derselben Hand = **Stöck = 20 Punkte**.
- Nur im Trumpfspiel (nicht bei Obenabe/Undeufe).
- Stöck zählen immer, unabhängig vom Weis-Vergleich. Sie werden beim Ausspielen der
  zweiten der beiden Karten angesagt (in der App automatisch).

## 8. Punktezählung einer Runde

- Kartenpunkte der gewonnenen Stiche (siehe Abschnitt 3).
- **Letzter Stich**: +5 Punkte. Total Kartenpunkte pro Runde: 157.
- **Match**: Gewinnt ein Team alle 9 Stiche, erhält es 157 + 100 = **257** Punkte.
  Das gilt auch, wenn das nicht ansagende Team alle Stiche macht (Kontermatch).
- Weis- und Stöckpunkte kommen dazu.

### 8.1 Multiplikator **(Einstellung, Standard: ein)**

„Rot einfach, Schwarz doppelt, Obenabe und Undeufe dreifach“:

| Spielart | Faktor |
|---|---|
| ♦ Ecke, ♥ Herz | ×1 |
| ♠ Schaufel, ♣ Kreuz | ×2 |
| Obenabe, Undeufe | ×3 |

Der Faktor gilt für **alle** Punkte der Runde: Stiche, letzter Stich, Match, Weis und Stöck.
Ist der Multiplikator ausgeschaltet, zählt alles einfach.

## 9. Ende der Partie

- Gespielt wird bis zu einer Zielpunktzahl **(Einstellung: 1000 / 1500 / 2500 / 3000 / 5000,
  Standard 2500)**.
- Die Partie endet sofort, wenn ein Team die Zielpunktzahl erreicht („bedanken“) –
  auch mitten in einer Runde.
- Reihenfolge der Wertung bei knappen Entscheidungen: **Stöck vor Weis vor Stich**.
  In der App: Stöck zählen im Moment, in dem die zweite Karte gespielt wird; Weis zählen nach
  dem 1. Stich vor dessen Kartenpunkten; danach jeder Stich in der Reihenfolge, in der er
  gemacht wird; der Matchbonus am Schluss. Wer die Zielpunktzahl zuerst erreicht, gewinnt.
