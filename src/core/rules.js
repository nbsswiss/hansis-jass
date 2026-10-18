// Bedienregeln und Stichwertung (docs/regeln.md, Abschnitt 4 und 5).
import { suitOf, rankOf, power, points, RB } from './cards.js';

// Erlaubte Karten aus `hand`, wenn im Stich bereits `trick` (Karten in Spielreihenfolge) liegt.
export function legalMoves(hand, trick, mode) {
  if (trick.length === 0) return hand.slice();
  const led = suitOf(trick[0]);

  if (mode >= 4) {
    const follow = hand.filter((c) => suitOf(c) === led);
    return follow.length ? follow : hand.slice();
  }

  const trump = mode;
  if (led === trump) {
    const trumps = hand.filter((c) => suitOf(c) === trump);
    // Bauer-Ausnahme: ist der Bauer der einzige Trumpf, muss er nicht gespielt werden.
    if (trumps.length === 0 || (trumps.length === 1 && rankOf(trumps[0]) === RB)) return hand.slice();
    return trumps;
  }

  // Nicht-Trumpf ausgespielt: höchsten Trumpf im Stich bestimmen (für Untertrumpfverbot).
  let topTrump = -1;
  for (const c of trick) if (suitOf(c) === trump) topTrump = Math.max(topTrump, power(c, mode, led));
  const undertrump = (c) => suitOf(c) === trump && topTrump >= 0 && power(c, mode, led) < topTrump;

  const follow = hand.filter((c) => suitOf(c) === led);
  if (follow.length) {
    return hand.filter((c) => suitOf(c) === led || (suitOf(c) === trump && !undertrump(c)));
  }
  const allowed = hand.filter((c) => !undertrump(c));
  return allowed.length ? allowed : hand.slice();
}

export const isLegal = (c, hand, trick, mode) => legalMoves(hand, trick, mode).includes(c);

// Index (0..n-1) der aktuell stechenden Karte im (evtl. unvollständigen) Stich.
export function winningIndex(trick, mode) {
  const led = suitOf(trick[0]);
  let best = 0, bestPow = power(trick[0], mode, led);
  for (let i = 1; i < trick.length; i++) {
    const p = power(trick[i], mode, led);
    if (p > bestPow) { best = i; bestPow = p; }
  }
  return best;
}

export function trickPoints(trick, mode) {
  let sum = 0;
  for (const c of trick) sum += points(c, mode);
  return sum;
}

export const LAST_TRICK_BONUS = 5;
export const MATCH_BONUS = 100;
export const TOTAL_CARD_POINTS = 157;
export const teamOf = (seat) => seat % 2;
export const partnerOf = (seat) => (seat + 2) % 4;
export const nextSeat = (seat) => (seat + 1) % 4;
