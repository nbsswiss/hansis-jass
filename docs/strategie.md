# Strategieregeln in Hansis Jass

Diese Regeln sind keine Spielregeln, sondern gutes Jassen. Die Computer-Spieler halten sich
daran, und sie lesen die Zeichen der Spielerin genauso, wie sie die eigenen geben.

Begriffe:

- **Bock**: die höchste noch nicht gespielte Karte einer Farbe (macht sicher den Stich,
  solange niemand sticht).
- **Anziehen / Verwerfen**: Zeichen an die Partnerin durch das erste Abwerfen.
- **Schmieren**: der Partnerin, die den Stich sicher macht, viele Punkte zugeben.
- **Trumpf ziehen**: Trumpf ausspielen, damit die Gegner ihre Trümpfe abgeben müssen.

## 1. Zeichen geben: Anziehen oder Verwerfen (Einstellung)

Vor der Partie wird abgemacht, welche Konvention gilt. Beide Teams spielen mit derselben.

### 1.1 Anziehen (Standard)

- Wer zum **ersten Mal in der Runde abwirft** (die ausgespielte Farbe nicht hat und nicht
  sticht), zeigt damit: **„Diese Farbe will ich.“**
- Man zieht mit einer **kleinen Karte** an (Trumpf/Obenabe: 6, 7, 8; Undeufe: Ass, König, Dame),
  idealerweise in der Farbe, in der man den Bock oder eine starke Folge hat.
- Die Partnerin spielt bei der nächsten Gelegenheit diese Farbe aus (mit einer kleinen Karte,
  damit die Anzieherin mit dem Bock übernehmen kann).

### 1.2 Verwerfen („Verrüehre“)

- Das **erste Abwerfen** zeigt: **„Diese Farbe will ich nicht – da habe ich nichts.“**
- Man verwirft die Farbe, in der man schwach ist und keinen Bock hat.
- Die Partnerin vermeidet diese Farbe und spielt eine der anderen Farben aus.

### 1.3 Was kein Zeichen ist

- **Schmieren** (eine Karte mit 10 oder mehr Punkten, wenn die Partnerin den Stich macht)
  ist kein Zeichen.
- Ein Stich mit Trumpf ist kein Zeichen.
- Nur das erste Abwerfen pro Spieler und Runde gilt als Zeichen.

## 2. Ansagen und Schieben

- **Trumpf** wählen mit Bauer und/oder Nell und mindestens drei Trümpfen, dazu Asse
  in den Nebenfarben. Bauer + Nell + Ass gelten als „drei sichere Stiche“.
- **Obenabe** mit mehreren Assen, idealerweise mit König dahinter (Ass-König = 2 Stiche),
  und langen Farben, die man von oben „durchziehen“ kann.
- **Undeufe** spiegelbildlich mit 6ern und 7ern.
- **Stöck und Weis** sind im Ansagewert mitzurechnen – mit Multiplikator besonders bei
  Obenabe/Undeufe (×3) und Schwarz (×2).
- **Schieben**, wenn keine Spielart klar gut ist. Wer schiebt, verrät: „Ich habe nichts
  Starkes.“ Die Partnerin muss dann wählen und weiss, dass von der Ansagerin wenig kommt.
- Nach dem Schieben wählt die Partnerin auch mit schwacher Hand die beste verfügbare Spielart.

## 3. Ausspielen

- **Das ansagende Team mit Trumpf zieht Trumpf**: Wer Bauer oder Nell hat und mehrere Trümpfe,
  spielt früh Trumpf, damit die Gegner ihre Nebenfarben nicht stechen können.
  Mit Bauer zuerst den Bauer, sonst eher klein anspielen und den Nell zurückhalten.
- **Die Gegenpartei spielt kein Trumpf an**, ausser sie will gezielt Trümpfe der Ansager ziehen
  (z. B. weil der eigene Partner die Nebenfarben hält).
- **Bock ausspielen**: Asse (Obenabe: Asse; Undeufe: 6er) und andere Böcke früh ausspielen,
  bevor sie gestochen werden.
- **Angezogene Farbe bedienen**: Hat die Partnerin angezogen, spielt man diese Farbe aus.
  Hat sie verworfen, meidet man die verworfene Farbe.
- **Farbe zurückspielen**: Hat die Partnerin eine Farbe ausgespielt und man kommt selbst
  ans Ausspielen, spielt man ihr diese Farbe zurück.
- Keine Zehner „blank“ ausspielen, wenn der Gegner das Ass noch hat.

## 4. Zugeben und Stechen

- **Schmieren**: Macht die Partnerin den Stich sicher, gibt man die punkteträchtigste Karte zu,
  die man nicht selbst für einen Stich braucht (10er, Ass ohne Bock-Wirkung; Obenabe/Undeufe: 8er).
- **Billig gewinnen**: Muss man einen Stich holen, nimmt man die tiefste Karte, die sicher gewinnt.
- **Nicht über die Partnerin stechen**, wenn sie den Stich sowieso macht.
- **Stechen** lohnt sich, wenn viele Punkte im Stich liegen oder der Stich das Spiel
  entscheidet (letzter Stich, Match verhindern).
- **Wenig zugeben**: Gewinnt der Gegner, gibt man die Karte mit den wenigsten Punkten zu
  und behält Böcke und Trümpfe.
- **Match verhindern**: Hat ein Team alle bisherigen Stiche gemacht, ist der nächste Stich
  für die Gegenpartei 100 Punkte wert.

## 5. Mitzählen und Schliessen

- Man merkt sich gespielte Karten (wer hat welche Farbe nicht mehr, wo sind die Trümpfe,
  welche Karte ist jetzt Bock).
- Wer eine Farbe nicht angibt, hat sie nicht mehr (Ausnahme: der Trumpf-Bauer kann
  zurückgehalten werden).
- Die Wahl der Ansagerin sagt etwas über ihre Hand (Trumpf gewählt → vermutlich Bauer/Nell;
  Obenabe → Asse; Undeufe → 6er; geschoben → schwache Hand).

## 6. Wie die Computer-Spieler denken

1. **Mitzählen** (`src/ai/knowledge.js`): gespielte Karten, Fehlfarben, gezeigte Weise,
   Zeichen (Anziehen/Verwerfen) und was die Ansage verrät.
2. **Hände vermuten** (`src/ai/sampler.js`): Viele mögliche Verteilungen der unbekannten Karten,
   passend zu allem Bekannten. Verteilungen, die zu Zeichen und Ansage passen, zählen mehr.
3. **Durchrechnen** (`src/ai/search.js`): Für jede erlaubte Karte wird die Runde in jeder
   vermuteten Verteilung zu Ende gespielt – gegen Ende exakt (Alpha-Beta-Suche),
   vorher mit schnellen Strategieregeln.
4. **Strategieregeln als Entscheid bei Gleichstand** (`src/ai/strategy.js`): Liegen mehrere
   Karten fast gleich gut, entscheidet die Strategie (richtig anziehen/verwerfen, angezogene
   Farbe spielen, Farbe zurückspielen, Gegenpartei spielt kein Trumpf an …).
5. **Ansagen** (`src/ai/bidding.js`): Jede Spielart wird über viele zufällige Verteilungen
   durchgespielt, mit Weis, Stöck und Multiplikator bewertet; schwache Hände werden geschoben.
