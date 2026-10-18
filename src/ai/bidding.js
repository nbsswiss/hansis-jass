// Ansagen (docs/strategie.md, Abschnitt 2): jede Spielart wird über viele zufällige Verteilungen
// durchgespielt und mit Kartenpunkten, Weis, Stöck und Multiplikator bewertet.
import { FULL_DECK, MODES, multiplier, card, RK, RD } from '../core/cards.js';
import { findWeis, resolveWeis } from '../core/weis.js';
import { rollout } from './search.js';
import { createRng } from '../core/rng.js';

// Unter diesem Wert (Punktedifferenz × Multiplikator) wird geschoben.
export const PUSH_THRESHOLD = 22;

export function evaluateModes(hand, seat, leader, settings, opts = {}) {
  const rng = createRng(opts.seed ?? 12345);
  const samples = opts.samples ?? 40;
  const team = seat % 2;
  const rest = FULL_DECK.filter((c) => !hand.includes(c));
  const sum = MODES.map(() => 0);
  const myWeis = findWeis(hand);
  for (let i = 0; i < samples; i++) {
    const deck = rng.shuffle(rest.slice());
    const hands = [];
    let p = 0;
    for (let s = 0; s < 4; s++) {
      if (s === seat) hands.push(hand.slice());
      else { hands.push(deck.slice(p, p + 9)); p += 9; }
    }
    const decl = hands.map((h, s) => (s === seat ? myWeis : findWeis(h)));
    for (const mode of MODES) {
      const st = {
        hands: hands.map((h) => h.slice()),
        trick: [], leader, mode, pts: [0, 0], tricksWon: [0, 0], nTricks: 0, chooserTeam: team,
      };
      let v = rollout(st, team);
      const w = resolveWeis(decl, mode, leader);
      v += w.points[team] - w.points[1 - team];
      // Stöck der anderen
      if (mode < 4) {
        const k = card(mode, RK), d = card(mode, RD);
        for (let s = 0; s < 4; s++) {
          if (s !== seat && hands[s].includes(k) && hands[s].includes(d)) v += s % 2 === team ? 20 : -20;
        }
      }
      sum[MODES.indexOf(mode)] += v;
    }
  }
  return MODES.map((mode, i) => {
    let diff = sum[i] / samples;
    if (mode < 4 && hand.includes(card(mode, RK)) && hand.includes(card(mode, RD))) diff += 20;
    return { mode, diff, value: diff * multiplier(mode, settings.multipliers) };
  });
}

// Entscheid: Spielart (0..5) oder 'push'.
export function chooseModeAI(view, settings, opts = {}) {
  const evals = evaluateModes(view.hand, view.seat, view.ansager, settings, opts);
  evals.sort((a, b) => b.value - a.value);
  const best = evals[0];
  const mayPush = !view.pushed;
  if (mayPush && best.value < (opts.pushThreshold ?? PUSH_THRESHOLD)) return { choice: 'push', evals };
  return { choice: best.mode, evals };
}
