import { test, eq, ok } from './testlib.js';
import { parseCards as H, parseCard as C, suitOf, points, OBE, cardShort, multiplier } from '../src/core/cards.js';
import { createRound, chooseMode, playCard, viewFor, currentLegalMoves, deal, PUSH } from '../src/core/round.js';
import { legalMoves } from '../src/core/rules.js';
import { createRng } from '../src/core/rng.js';
import { buildKnowledge } from '../src/ai/knowledge.js';
import { sampleHands } from '../src/ai/sampler.js';
import { makeState, alphabeta, apply, undo, finalValue, seatToAct } from '../src/ai/search.js';
import { chooseCardAI, chooseModeForView } from '../src/ai/player.js';

const HEART = 1, SPADE = 2;
const FAST = { minSamples: 40, maxSamples: 40, timeMs: 0, seed: 7 };

function setup(hands, ansager, mode, plays = []) {
  const r = createRound(hands.map(H), ansager);
  chooseMode(r, ansager, mode);
  for (const p of plays) playCard(r, r.toAct, C(p));
  return r;
}

// Vier Hände, bei denen niemand eine Farbe ganz besitzt.
const DEAL_A = [
  '♥7 ♣10 ♣7 ♦6 ♦7 ♠6 ♠7 ♠8 ♣D', // Süd: kein Herz
  '♥6 ♥8 ♥9 ♦A ♦K ♠A ♠K ♣6 ♣8',
  '♥A ♥K ♥D ♥B ♦D ♦B ♠10 ♠9 ♣9',
  '♥10 ♦10 ♦9 ♦8 ♠B ♠D ♣A ♣K ♣B',
];

test('Mitzählen: Fehlfarbe und erstes Abwerfen als Zeichen', () => {
  const r = setup(DEAL_A, 2, OBE, ['♥A', '♥10', '♥7', '♥6']);
  // Süd hat noch keine Herz-Fehlfarbe (♥7 bedient). Nord gewinnt und spielt ♥K.
  playCard(r, 2, C('♥K'));
  playCard(r, 3, C('♣B')); // West hat kein Herz mehr -> Abwurf, Partnerin Ost gewinnt nicht
  const k = buildKnowledge(viewFor(r, 0));
  ok(k.voids[3][HEART], 'West hat kein Herz');
  eq(k.signals[3].suit, 3);
  ok(!k.voids[1][HEART]);
});

test('Hände vermuten: Fehlfarben und Kartenzahl werden eingehalten', () => {
  const r = setup(DEAL_A, 2, OBE, ['♥A', '♥10', '♥7', '♥6', '♥K', '♣B']);
  const v = viewFor(r, 0);
  const k = buildKnowledge(v);
  const rng = createRng(1);
  for (let i = 0; i < 200; i++) {
    const h = sampleHands(v, k, rng);
    eq(h.map((x) => x.length), v.handSizes);
    eq(h[0], v.hand);
    ok(!h[3].some((c) => suitOf(c) === HEART), 'West bekommt kein Herz');
    const all = new Set([...h.flat(), ...v.hand, ...k.played]);
    eq(all.size, 36);
  }
});

// Einfaches Minimax ohne Abkürzungen als Vergleich für die Alpha-Beta-Suche.
function minimax(st, team) {
  if (st.nTricks === 9) return finalValue(st, team);
  const seat = seatToAct(st);
  let best = seat % 2 === team ? -1e9 : 1e9;
  for (const c of legalMoves(st.hands[seat], st.trick, st.mode)) {
    const u = apply(st, c);
    const v = minimax(st, team);
    undo(st, u);
    best = seat % 2 === team ? Math.max(best, v) : Math.min(best, v);
  }
  return best;
}

test('Alpha-Beta-Suche liefert denselben Wert wie volles Minimax', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const rng = createRng(seed);
    const r = createRound(deal(rng), 0);
    chooseMode(r, 0, rng.int(6));
    // bis 3 Stiche vor Schluss zufällig spielen
    while (r.tricks.length < 6 || r.trick.length < (seed % 4)) {
      const m = currentLegalMoves(r);
      playCard(r, r.toAct, m[rng.int(m.length)]);
    }
    const v = viewFor(r, r.toAct);
    const st = makeState(r.hands, v);
    const team = r.toAct % 2;
    eq(alphabeta(st, team, -1e9, 1e9), minimax(st, team), `Seed ${seed}`);
  }
});

test('KI schmiert, wenn die Partnerin den Stich sicher macht', () => {
  // Nord spielt ♥A (Obenabe, sicherer Stich), West bedient, Süd hat kein Herz.
  const r = setup(DEAL_A, 2, OBE, ['♥A', '♥10', '♥7', '♥6', '♥K', '♣B']);
  // Stich 1 an Nord; Stich 2: Nord ♥K, West ♣B ... Süd ist dran
  eq(r.toAct, 0);
  const res = chooseCardAI(viewFor(r, 0), { convention: 'anziehen' }, FAST);
  ok(points(res.card, OBE) >= 8, `geschmiert wurde ${cardShort(res.card)}`);
  eq(res.reason, 'Schmieren');
});

test('KI gibt wenig zu, wenn der Gegner den Stich macht', () => {
  const hands = [
    '♥6 ♥10 ♣7 ♦6 ♦7 ♠6 ♠7 ♠8 ♣D',
    '♥A ♥8 ♥9 ♦A ♦K ♠A ♠K ♣6 ♣8',
    '♥7 ♥K ♥D ♥B ♦D ♦B ♠10 ♠9 ♣9',
    '♣10 ♦10 ♦9 ♦8 ♠B ♠D ♣A ♣K ♣B',
  ];
  // Ost spielt ♥A in Obenabe aus, Nord ♥7, West hat kein Herz (♣B), Süd muss Herz bedienen
  const r = setup(hands, 1, OBE, ['♥A', '♥7', '♣B']);
  const res = chooseCardAI(viewFor(r, 0), { convention: 'anziehen' }, FAST);
  eq(cardShort(res.card), '♥6');
});

test('KI zieht beim ersten Abwerfen die starke Farbe an (Konvention Anziehen)', () => {
  const hands = [
    '♠A ♠K ♠7 ♦6 ♦7 ♣6 ♣7 ♣8 ♦8',
    '♥A ♥K ♥D ♥8 ♦A ♠D ♠B ♣A ♣K',
    '♥B ♥10 ♥9 ♦K ♦D ♦B ♠10 ♠9 ♣10',
    '♥7 ♥6 ♦10 ♦9 ♠8 ♠6 ♣D ♣B ♣9',
  ];
  const r = setup(hands, 1, OBE, ['♥A', '♥10']);
  // Süd hat kein Herz: wirft ab. Anziehen -> kleine Schaufel (♠7)
  const anz = chooseCardAI(viewFor(r, 0), { convention: 'anziehen' }, FAST);
  eq(cardShort(anz.card), '♠7');
  eq(anz.reason, 'Anziehen ♠');
  const ver = chooseCardAI(viewFor(r, 0), { convention: 'verwerfen' }, FAST);
  ok(suitOf(ver.card) !== SPADE, `verworfen wurde ${cardShort(ver.card)}`);
});

test('KI spielt die angezogene Farbe der Partnerin', () => {
  const hands = [
    '♥A ♥K ♥D ♠6 ♦A ♣9 ♣10 ♦B ♦D',
    '♥6 ♥7 ♦10 ♠D ♠B ♣A ♣K ♣B ♦7',
    '♠A ♠K ♠7 ♦6 ♦9 ♣6 ♣7 ♣8 ♦8',
    '♥B ♥10 ♥9 ♥8 ♦K ♠10 ♠9 ♠8 ♣D',
  ];
  // Süd spielt ♥A (Obenabe); Ost bedient, Nord hat kein Herz und zieht ♠ an, West bedient
  const r = setup(hands, 0, OBE, ['♥A', '♥6', '♠7', '♥8']);
  eq(r.toAct, 0);
  const k = buildKnowledge(viewFor(r, 0));
  eq(k.signals[2].suit, SPADE);
  // Süd hat noch ♥K ♥D als Böcke; die Strategie verlangt trotzdem, dass die Farbe bald kommt.
  // Ohne die Herz-Böcke prüfen: Süd spielt sie zuerst ab, danach ♠6.
  const res = chooseCardAI(viewFor(r, 0), { convention: 'anziehen' }, FAST);
  ok(['♠6', '♥K'].includes(cardShort(res.card)), `gespielt ${cardShort(res.card)}`);
});

test('Ansage: starke Herzhand wählt Herz (ohne Multiplikator)', () => {
  const r = createRound([H('♥B ♥9 ♥A ♥K ♥10 ♠A ♦7 ♣A ♣7'), [], [], []], 0);
  eq(chooseModeForView(viewFor(r, 0), { multipliers: false }, { samples: 30, seed: 3 }).choice, HEART);
});

test('Ansage: Asse und Könige -> Obenabe', () => {
  const r = createRound([H('♥A ♥K ♠A ♠K ♦A ♦K ♣A ♣D ♥D'), [], [], []], 0);
  eq(chooseModeForView(viewFor(r, 0), { multipliers: true }, { samples: 30, seed: 3 }).choice, OBE);
});

test('Ansage: schwache Hand schiebt, nach dem Schieben wird gewählt', () => {
  const hand = H('♥7 ♥D ♠8 ♠B ♦9 ♦K ♣7 ♣10 ♣D');
  const r = createRound([hand, [], [], []], 0);
  eq(chooseModeForView(viewFor(r, 0), { multipliers: true }, { samples: 30, seed: 3 }).choice, PUSH);
  const r2 = createRound([[], [], hand, []], 0);
  chooseMode(r2, 0, PUSH);
  const res = chooseModeForView(viewFor(r2, 2), { multipliers: true }, { samples: 30, seed: 3 });
  ok(res.choice !== PUSH);
});

test('KI spielt nur erlaubte Karten und schlägt Zufallsspieler deutlich', () => {
  const rng = createRng(11);
  let ai = 0, rnd = 0;
  for (let i = 0; i < 4; i++) {
    const hands = deal(rng);
    for (const aiTeam of [0, 1]) {
      const r = createRound(hands, i % 4);
      while (r.phase === 'choose') {
        const seat = r.toAct;
        const choice = seat % 2 === aiTeam
          ? chooseModeForView(viewFor(r, seat), { multipliers: true, level: 'mittel' }, { seed: i }).choice
          : (r.pushed ? rng.int(6) : PUSH);
        chooseMode(r, seat, choice);
      }
      while (r.phase === 'play') {
        const seat = r.toAct;
        const legal = currentLegalMoves(r);
        const c = seat % 2 === aiTeam
          ? chooseCardAI(viewFor(r, seat), { level: 'mittel' }, { seed: i }).card
          : legal[rng.int(legal.length)];
        ok(legal.includes(c));
        playCard(r, seat, c);
      }
      const m = multiplier(r.mode);
      const score = (t) => (r.cardPoints[t] + r.weisPoints[t] + r.stoeckPoints[t]) * m;
      ai += score(aiTeam);
      rnd += score(1 - aiTeam);
    }
  }
  ok(ai > rnd * 1.3, `KI ${ai} gegen Zufall ${rnd}`);
});

test('KI übertrumpft den sicheren Nell der Partnerin nicht mit dem Bauer', () => {
  // Süd spielt Trumpf-Nell, Nord hat Bauer, 10, 7: der Nell macht den Stich sowieso.
  const hands = [
    '♥9 ♥D ♠A ♠K ♦7 ♦8 ♣6 ♣7 ♣10',
    '♥A ♥6 ♠D ♠7 ♦A ♦K ♣K ♣B ♣9',
    '♥B ♥10 ♥7 ♠10 ♠9 ♦D ♦B ♣A ♣8',
    '♥K ♥8 ♠B ♠8 ♠6 ♦10 ♦9 ♦6 ♣D',
  ];
  const r = setup(hands, 0, HEART, ['♥9', '♥6']);
  const res = chooseCardAI(viewFor(r, 2), { convention: 'anziehen' }, FAST);
  ok(cardShort(res.card) !== '♥B', 'Bauer nicht auf den Nell der Partnerin');
});

test('KI zieht Trumpf nicht mit der Trumpf-10, wenn der höhere Trumpf noch draussen ist', () => {
  const hands = [
    '♥10 ♥7 ♥6 ♠A ♠K ♦A ♦K ♣A ♣K',
    '♥A ♥8 ♠D ♠7 ♦D ♦B ♣D ♣B ♣9',
    '♥B ♥9 ♥D ♠10 ♠9 ♦10 ♦9 ♣10 ♣8',
    '♥K ♠B ♠8 ♠6 ♦8 ♦7 ♦6 ♣7 ♣6',
  ];
  const r = setup(hands, 0, HEART);
  const res = chooseCardAI(viewFor(r, 0), { convention: 'anziehen' }, FAST);
  ok(cardShort(res.card) !== '♥10', `ausgespielt ${cardShort(res.card)}`);
});
