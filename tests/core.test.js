import { test, eq, ok, throws, sameSet } from './testlib.js';
import { FULL_DECK, points, parseCards, parseCard as C, OBE, UNDE, multiplier, sortHand, cardShort } from '../src/core/cards.js';
import { legalMoves, winningIndex, trickPoints } from '../src/core/rules.js';
import { findWeis, compareWeis, resolveWeis, stoeckOwner } from '../src/core/weis.js';
import { createRound, chooseMode, playCard, currentLegalMoves, deal, firstAnsager, viewFor, PUSH } from '../src/core/round.js';
import { createGame, startRound, gameChoose, gamePlay } from '../src/core/game.js';
import { createRng } from '../src/core/rng.js';

const H = parseCards;
const HEART = 1, SPADE = 2, DIA = 0, CLUB = 3;

// ---------- Karten und Punkte ----------
test('Kartenpunkte: jede Spielart ergibt 152 (+5 letzter Stich = 157)', () => {
  for (const mode of [0, 1, 2, 3, OBE, UNDE]) {
    eq(FULL_DECK.reduce((s, c) => s + points(c, mode), 0), 152, `Spielart ${mode}`);
  }
});

test('Kartenpunkte Trumpf: Bauer 20, Nell 14; Nebenfarbe Bauer 2', () => {
  eq(points(C('♠B'), SPADE), 20);
  eq(points(C('♠9'), SPADE), 14);
  eq(points(C('♥B'), SPADE), 2);
  eq(points(C('♥9'), SPADE), 0);
});

test('Kartenpunkte Obenabe/Undeufe: 8 zählt 8, Undeufe 6 zählt 11, Ass 0', () => {
  eq(points(C('♥8'), OBE), 8);
  eq(points(C('♥A'), OBE), 11);
  eq(points(C('♥6'), UNDE), 11);
  eq(points(C('♥A'), UNDE), 0);
  eq(points(C('♥8'), UNDE), 8);
});

test('Multiplikator: rot ×1, schwarz ×2, Obe/Unde ×3, ausgeschaltet ×1', () => {
  eq([0, 1, 2, 3, OBE, UNDE].map((m) => multiplier(m)), [1, 1, 2, 2, 3, 3]);
  eq(multiplier(UNDE, false), 1);
});

test('Hand sortieren: Trumpf zuerst, innerhalb nach Zahl (Nell nicht nach Wert)', () => {
  const sorted = sortHand(H('♥A ♠6 ♠B ♠9 ♠A ♦K'), SPADE).map(cardShort);
  eq(sorted, ['♠A', '♠B', '♠9', '♠6', '♥A', '♦K']);
});

test('Hand sortieren: Farben abwechselnd schwarz und rot', () => {
  const hand = H('♦6 ♣7 ♥8 ♠9');
  eq(sortHand(hand).map(cardShort), ['♠9', '♥8', '♣7', '♦6']);
  eq(sortHand(hand, HEART).map(cardShort), ['♥8', '♠9', '♦6', '♣7']);
  eq(sortHand(hand, CLUB).map(cardShort), ['♣7', '♥8', '♠9', '♦6']);
  // nur drei Farben: rot-schwarz-rot statt zwei gleiche nebeneinander
  eq(sortHand(H('♦6 ♥8 ♠9')).map(cardShort), ['♥8', '♠9', '♦6']);
});

// ---------- Stich ----------
test('Stich: höchster Trumpf gewinnt, Bauer schlägt Nell', () => {
  eq(winningIndex(H('♥A ♠9 ♠B ♥K'), SPADE), 2);
  eq(winningIndex(H('♥A ♠6 ♥K ♦A'), SPADE), 1);
});

test('Stich: ohne Trumpf gewinnt höchste Karte der ausgespielten Farbe', () => {
  eq(winningIndex(H('♥10 ♦A ♥K ♥6'), HEART), 2); // Herz ist Trumpf -> ♥K höchster Trumpf
  eq(winningIndex(H('♥10 ♦A ♥K ♥6'), CLUB), 2);
  eq(winningIndex(H('♥10 ♦A ♥K ♥6'), OBE), 2);
});

test('Stich Undeufe: tiefste Karte der Farbe gewinnt, Abwurf zählt nicht', () => {
  eq(winningIndex(H('♥10 ♦6 ♥7 ♥K'), UNDE), 2);
});

test('Stichpunkte', () => {
  eq(trickPoints(H('♠B ♠9 ♥A ♥10'), SPADE), 55);
});

// ---------- Bedienen ----------
test('Obenabe: Farbe muss angegeben werden', () => {
  sameSet(legalMoves(H('♥6 ♥A ♠K'), H('♥K'), OBE), H('♥6 ♥A'));
  sameSet(legalMoves(H('♦6 ♠K'), H('♥K'), OBE), H('♦6 ♠K'));
});

test('Trumpf: Farbe angeben oder stechen erlaubt', () => {
  sameSet(legalMoves(H('♥6 ♠7 ♣K'), H('♥K'), SPADE), H('♥6 ♠7'));
});

test('Trumpf: Untertrumpfen verboten, wenn man die Farbe hat', () => {
  sameSet(legalMoves(H('♥6 ♠7 ♠B'), H('♥K ♠10'), SPADE), H('♥6 ♠B'));
});

test('Trumpf: Untertrumpfen verboten, wenn man andere Karten hat', () => {
  sameSet(legalMoves(H('♣K ♠6 ♠A'), H('♥K ♠10'), SPADE), H('♣K ♠A'));
});

test('Trumpf: nur tiefere Trümpfe in der Hand -> Untertrumpfen erlaubt', () => {
  sameSet(legalMoves(H('♠6 ♠7'), H('♥K ♠10'), SPADE), H('♠6 ♠7'));
});

test('Trumpf ausgespielt: Trumpf angeben (auch tiefer)', () => {
  sameSet(legalMoves(H('♠6 ♥A'), H('♠A'), SPADE), H('♠6'));
});

test('Trumpf ausgespielt: Bauer allein muss nicht gespielt werden', () => {
  sameSet(legalMoves(H('♠B ♥A ♦6'), H('♠A'), SPADE), H('♠B ♥A ♦6'));
  sameSet(legalMoves(H('♠B ♠6 ♥A'), H('♠A'), SPADE), H('♠B ♠6'));
});

test('Ausspieler darf alles spielen', () => {
  sameSet(legalMoves(H('♠B ♥A'), [], SPADE), H('♠B ♥A'));
});

// ---------- Weis ----------
test('Weis finden: Folgen und vier Gleiche', () => {
  const w = findWeis(H('♥6 ♥7 ♥8 ♥9 ♠K ♥K ♦K ♣K ♣A'));
  const seq = w.find((x) => x.type === 'seq');
  eq([seq.length, seq.points], [4, 50]);
  const quad = w.find((x) => x.type === 'quad');
  eq([quad.rank, quad.points], [7, 100]);
  eq(w.length, 2);
});

test('Weis: vier Bauern 200, vier Nell 150, vier 8er zählen nicht', () => {
  eq(findWeis(H('♥B ♠B ♦B ♣B')).map((w) => w.points), [200]);
  eq(findWeis(H('♥9 ♠9 ♦9 ♣9')).map((w) => w.points), [150]);
  eq(findWeis(H('♥8 ♠8 ♦8 ♣8')).length, 0);
});

test('Weis: Neunblatt = 300, Folge zählt nur als Ganzes', () => {
  const w = findWeis(H('♥6 ♥7 ♥8 ♥9 ♥10 ♥B ♥D ♥K ♥A'));
  eq(w.map((x) => x.points), [300]);
});

test('Weis vergleichen: Punkte, dann vier Gleiche vor Folge, dann Höhe, dann Trumpf', () => {
  const [s3low] = findWeis(H('♥6 ♥7 ♥8'));
  const [s3high] = findWeis(H('♠D ♠K ♠A'));
  const [s5] = findWeis(H('♦6 ♦7 ♦8 ♦9 ♦10'));
  const [q] = findWeis(H('♥A ♠A ♦A ♣A'));
  ok(compareWeis(s3high, s3low, HEART) > 0, 'höhere Folge gewinnt');
  ok(compareWeis(s3low, s3high, UNDE) > 0, 'Undeufe: tiefere Folge gewinnt');
  ok(compareWeis(q, s5, OBE) > 0, 'vier Gleiche vor Fünfblatt');
  const [a] = findWeis(H('♥7 ♥8 ♥9'));
  const [b] = findWeis(H('♠7 ♠8 ♠9'));
  ok(compareWeis(b, a, SPADE) > 0, 'gleiche Folge: Trumpffarbe gewinnt');
  eq(compareWeis(a, b, OBE), 0);
});

test('Weis auflösen: bestes Team erhält alle eigenen Weise, Gleichstand -> Vorhand', () => {
  const decl = [
    findWeis(H('♥6 ♥7 ♥8')), // 20
    findWeis(H('♠7 ♠8 ♠9')), // 20, höher
    findWeis(H('♦K ♦D ♦A')), // 20, am höchsten
    [],
  ];
  const res = resolveWeis(decl, OBE, 0);
  eq(res.team, 0);
  eq(res.points, [40, 0]);
  eq(res.shownSeats, [0, 2]);
  // Gleich gute Weise: wer zuerst spielt, gewinnt
  const tie = [findWeis(H('♥7 ♥8 ♥9')), findWeis(H('♠7 ♠8 ♠9')), [], []];
  eq(resolveWeis(tie, OBE, 1).team, 1);
  eq(resolveWeis(tie, OBE, 0).team, 0);
});

test('Stöck: König und Dame Trumpf in einer Hand, nicht bei Obenabe', () => {
  const hands = [H('♠K ♠D ♥6'), H('♥K ♥D'), [], []];
  eq(stoeckOwner(hands, SPADE), 0);
  eq(stoeckOwner(hands, HEART), 1);
  eq(stoeckOwner(hands, CLUB), -1);
  eq(stoeckOwner(hands, OBE), -1);
});

// ---------- Runde ----------
function randomRound(seed, mode = null) {
  const rng = createRng(seed);
  const hands = deal(rng);
  const r = createRound(hands, firstAnsager(hands));
  chooseMode(r, r.toAct, mode ?? rng.int(6));
  const events = [];
  while (r.phase === 'play') {
    const moves = currentLegalMoves(r);
    events.push(...playCard(r, r.toAct, moves[rng.int(moves.length)]));
  }
  return { r, events };
}

test('Runde: Zufallspartien erfüllen die Punkte-Invarianten', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const { r } = randomRound(seed);
    const total = r.cardPoints[0] + r.cardPoints[1];
    ok(total === 157 || total === 257, `Seed ${seed}: Total ${total}`);
    eq(r.tricks.length, 9);
    ok(r.hands.every((h) => h.length === 0));
    ok(r.weisPoints[0] === 0 || r.weisPoints[1] === 0, 'nur ein Team erhält Weis');
  }
});

test('Runde: Schieben -> Partnerin wählt, Ansager spielt aus, kein Zurückschieben', () => {
  const hands = deal(createRng(5));
  const r = createRound(hands, 3);
  chooseMode(r, 3, PUSH);
  eq(r.chooser, 1);
  throws(() => chooseMode(r, 1, PUSH));
  chooseMode(r, 1, OBE);
  eq(r.toAct, 3);
  eq(r.leader, 3);
});

test('Runde: falscher Spieler oder unerlaubte Karte wird abgelehnt', () => {
  const hands = [
    H('♥6 ♥7 ♥8 ♥9 ♥10 ♥B ♥D ♥K ♥A'),
    H('♠6 ♠7 ♠8 ♠9 ♠10 ♠B ♠D ♠K ♠A'),
    H('♦6 ♦7 ♦8 ♦9 ♦10 ♦B ♦D ♦K ♦A'),
    H('♣6 ♣7 ♣8 ♣9 ♣10 ♣B ♣D ♣K ♣A'),
  ];
  const r = createRound(hands, 0);
  chooseMode(r, 0, OBE);
  throws(() => playCard(r, 1, C('♠6')));
  playCard(r, 0, C('♥A'));
  throws(() => playCard(r, 1, C('♥6')), 'Karte nicht in der Hand');
});

test('Runde: Match = 257 Punkte, Neunblatt-Weis gezeigt', () => {
  const hands = [
    H('♥6 ♥7 ♥8 ♥9 ♥10 ♥B ♥D ♥K ♥A'),
    H('♠6 ♠7 ♠8 ♠9 ♠10 ♠B ♠D ♠K ♠A'),
    H('♦6 ♦7 ♦8 ♦9 ♦10 ♦B ♦D ♦K ♦A'),
    H('♣6 ♣7 ♣8 ♣9 ♣10 ♣B ♣D ♣K ♣A'),
  ];
  const r = createRound(hands, 0);
  chooseMode(r, 0, HEART);
  const events = [];
  while (r.phase === 'play') events.push(...playCard(r, r.toAct, currentLegalMoves(r)[0]));
  eq(r.cardPoints, [257, 0]);
  ok(events.some((e) => e.type === 'match' && e.team === 0));
  // Alle haben ein Neunblatt (300). Gleichstand -> Trumpffarbe Herz gewinnt.
  eq(r.weisResult.team, 0);
  eq(r.weisPoints, [600, 0]);
  eq(r.stoeckPoints, [20, 0]);
});

test('Runde: Stöck werden beim Spielen der zweiten Karte angesagt', () => {
  const hands = [
    H('♠K ♠D ♥6 ♥7 ♣9 ♣10 ♦6 ♦7 ♦8'),
    H('♠6 ♠7 ♠8 ♥8 ♥9 ♣6 ♣7 ♣8 ♦9'),
    H('♠9 ♠10 ♠B ♥10 ♥B ♣B ♣D ♦10 ♦B'),
    H('♠A ♥D ♥K ♥A ♣K ♣A ♦D ♦K ♦A'),
  ];
  const r = createRound(hands, 0);
  chooseMode(r, 0, SPADE);
  let ev = playCard(r, 0, C('♠K'));
  ok(!ev.some((e) => e.type === 'stoeck'));
  playCard(r, 1, C('♠6'));
  playCard(r, 2, C('♠B'));
  playCard(r, 3, C('♠A'));
  // Nord gewinnt mit dem Bauer und spielt aus
  eq(r.toAct, 2);
  playCard(r, 2, C('♠9'));
  playCard(r, 3, C('♥D')); // West hat kein Schaufel mehr
  ev = playCard(r, 0, C('♠D'));
  ok(ev.some((e) => e.type === 'stoeck' && e.team === 0));
  eq(r.stoeckPoints, [20, 0]);
});

test('Sicht eines Spielers enthält keine fremden Karten', () => {
  const { r } = randomRound(42);
  const v = viewFor(createRound(r.initialHands, 0), 1);
  eq(v.hand.length, 9);
  ok(!('hands' in v) && !('initialHands' in v) && !('declarations' in v));
});

// ---------- Partie ----------
test('Partie: Multiplikator wirkt auf alle Punkte, Bedanken beendet sofort', () => {
  const game = createGame({ target: 500 }, 99);
  let guard = 0;
  while (game.winner === null && guard++ < 50) {
    startRound(game);
    const r = game.round;
    gameChoose(game, r.toAct, OBE);
    while (r.phase === 'play') gamePlay(game, r.toAct, currentLegalMoves(r)[0]);
  }
  ok(game.winner !== null, 'Partie beendet');
  ok(game.scores[game.winner] >= 500);
  // Jede vollständige Runde mit Obenabe zählt dreifach: Total durch 3 teilbar
  for (const h of game.history.filter((x) => !x.aborted)) eq(h.multiplier, 3);
  ok(game.scores.every((s) => s % 3 === 0));
});

test('Partie: Ansager wechselt im Gegenuhrzeigersinn, erste Runde Ecke-7', () => {
  const game = createGame({}, 7);
  startRound(game);
  const first = game.ansager;
  ok(game.round.initialHands[first].includes(C('♦7')));
  const r = game.round;
  gameChoose(game, first, 0);
  while (r.phase === 'play') gamePlay(game, r.toAct, currentLegalMoves(r)[0]);
  startRound(game);
  eq(game.ansager, (first + 1) % 4);
});

test('Partie ist JSON-serialisierbar', () => {
  const game = createGame({}, 3);
  startRound(game);
  const copy = JSON.parse(JSON.stringify(game));
  eq(copy, game);
});
