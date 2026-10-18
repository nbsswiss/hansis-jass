// Weis und Stöck (docs/regeln.md, Abschnitt 6 und 7).
import { suitOf, rankOf, card, UNDE, R9, RB, RD, RK } from './cards.js';

const SEQ_POINTS = { 3: 20, 4: 50, 5: 100, 6: 150, 7: 200, 8: 250, 9: 300 };
const QUAD_POINTS = { [R9]: 150, [RB]: 200 }; // 10, D, K, A: 100; 6, 7, 8 zählen nicht
const QUAD_RANKS = [3, 4, 5, 6, 7, 8];

// Alle Weise einer Hand: Folgen (maximal lange) und vier Gleiche.
export function findWeis(hand) {
  const result = [];
  for (let s = 0; s < 4; s++) {
    const ranks = hand.filter((c) => suitOf(c) === s).map(rankOf).sort((a, b) => a - b);
    let start = 0;
    for (let i = 1; i <= ranks.length; i++) {
      if (i === ranks.length || ranks[i] !== ranks[i - 1] + 1) {
        const len = i - start;
        if (len >= 3) {
          const low = ranks[start], high = ranks[i - 1];
          const cards = [];
          for (let r = low; r <= high; r++) cards.push(card(s, r));
          result.push({ type: 'seq', suit: s, length: len, low, high, points: SEQ_POINTS[len], cards });
        }
        start = i;
      }
    }
  }
  for (const r of QUAD_RANKS) {
    const cards = [0, 1, 2, 3].map((s) => card(s, r));
    if (cards.every((c) => hand.includes(c))) {
      result.push({ type: 'quad', rank: r, points: QUAD_POINTS[r] ?? 100, cards });
    }
  }
  return result;
}

// Vergleich zweier Weise: > 0 wenn a besser, < 0 wenn b besser, 0 bei Gleichstand.
export function compareWeis(a, b, mode) {
  if (a.points !== b.points) return a.points - b.points;
  if (a.type !== b.type) return a.type === 'quad' ? 1 : -1;
  if (a.type === 'quad') return mode === UNDE ? b.rank - a.rank : a.rank - b.rank;
  if (a.length !== b.length) return a.length - b.length;
  const h = mode === UNDE ? b.low - a.low : a.high - b.high;
  if (h !== 0) return h;
  const ta = mode < 4 && a.suit === mode, tb = mode < 4 && b.suit === mode;
  if (ta !== tb) return ta ? 1 : -1;
  return 0;
}

export function bestWeis(list, mode) {
  let best = null;
  for (const w of list) if (!best || compareWeis(w, best, mode) > 0) best = w;
  return best;
}

export const weisTotal = (list) => list.reduce((s, w) => s + w.points, 0);

// declarations[seat] = Liste der Weise des Spielers. leader = Ausspieler des 1. Stichs.
// Ergebnis: Team mit dem höchsten Einzelweis erhält alle Weise beider Mitglieder.
export function resolveWeis(declarations, mode, leader) {
  let bestSeat = -1, best = null;
  for (let i = 0; i < 4; i++) {
    const seat = (leader + i) % 4;
    const w = bestWeis(declarations[seat] || [], mode);
    // Bei Gleichstand gewinnt, wer zuerst kommt -> nur bei echtem Vorsprung ersetzen.
    if (w && (!best || compareWeis(w, best, mode) > 0)) { best = w; bestSeat = seat; }
  }
  if (bestSeat < 0) return { team: null, bestSeat: -1, points: [0, 0], shownSeats: [] };
  const team = bestSeat % 2;
  const pts = [0, 0];
  pts[team] = weisTotal(declarations[team] || []) + weisTotal(declarations[team + 2] || []);
  const shownSeats = [team, team + 2].filter((s) => (declarations[s] || []).length > 0);
  return { team, bestSeat, points: pts, shownSeats };
}

export const STOECK_POINTS = 20;

// Sitz mit König und Dame der Trumpffarbe, sonst -1.
export function stoeckOwner(hands, mode) {
  if (mode >= 4) return -1;
  const k = card(mode, RK), d = card(mode, RD);
  for (let s = 0; s < 4; s++) if (hands[s].includes(k) && hands[s].includes(d)) return s;
  return -1;
}

export function weisLabel(w) {
  if (w.type === 'quad') {
    const names = { 3: 'Vier Nell', 4: 'Vier Zehner', 5: 'Vier Bauern', 6: 'Vier Damen', 7: 'Vier Könige', 8: 'Vier Asse' };
    return names[w.rank];
  }
  const names = { 3: 'Dreiblatt', 4: 'Vierblatt', 5: 'Fünfblatt', 6: 'Sechsblatt', 7: 'Siebenblatt', 8: 'Achtblatt', 9: 'Neunblatt' };
  return names[w.length];
}
