// Hände vermuten: mögliche Verteilungen der unbekannten Karten, die zu allem Bekannten passen
// (Fehlfarben, gezeigte Weise). Weiche Hinweise (Ansage, Schieben, Zeichen) ergeben Gewichte.
import { suitOf, rankOf, RB, R9, R6, RA, OBE } from '../core/cards.js';
import { unseenCards, bockOf, signalMeaning } from './knowledge.js';

function canHold(k, seat, c) {
  const s = suitOf(c);
  if (!k.voids[seat][s]) return true;
  // Trumpf nicht angegeben: nur der Bauer kann noch da sein
  return k.mode < 4 && s === k.mode && rankOf(c) === RB && k.maybeBauerOnly[seat];
}

// Eine zufällige Verteilung; null, wenn sie nicht gelingt.
function tryDeal(view, k, rng, cards, ignoreVoids) {
  const me = view.seat;
  const hands = [[], [], [], []];
  const cap = view.handSizes.slice();
  for (let s = 0; s < 4; s++) {
    hands[s] = k.known[s].slice();
    cap[s] -= hands[s].length;
  }
  cap[me] = 0;
  const others = [0, 1, 2, 3].filter((s) => s !== me);
  // Am stärksten eingeschränkte Karten zuerst verteilen
  const elig = cards.map((c) => ({ c, seats: others.filter((s) => ignoreVoids || canHold(k, s, c)), r: rng() }));
  elig.sort((a, b) => a.seats.length - b.seats.length || a.r - b.r);
  for (const { c, seats } of elig) {
    let total = 0;
    for (const s of seats) total += cap[s];
    if (total === 0) return null;
    let x = rng() * total;
    let chosen = seats[seats.length - 1];
    for (const s of seats) {
      if (cap[s] === 0) continue;
      x -= cap[s];
      if (x < 0) { chosen = s; break; }
    }
    if (cap[chosen] === 0) return null;
    hands[chosen].push(c);
    cap[chosen]--;
  }
  return hands;
}

export function sampleHands(view, k, rng) {
  const known = new Set(k.known.flat());
  const cards = unseenCards(view, k).filter((c) => !known.has(c));
  for (let attempt = 0; attempt < 40; attempt++) {
    const h = tryDeal(view, k, rng, cards, false);
    if (h) return h;
  }
  return tryDeal(view, k, rng, cards, true);
}

// Gewicht einer Verteilung: wie gut passt sie zu Ansage, Schieben und Zeichen?
export function sampleWeight(view, k, hands, convention) {
  let w = 1;
  const mode = view.mode;
  const initial = (s) => hands[s].concat(k.playedBy[s]);
  const me = view.seat;

  // Was verrät die Wahl der Spielart?
  const chooser = view.chooser;
  if (chooser !== me && mode !== null) {
    const h = initial(chooser);
    const forced = view.pushed; // nach dem Schieben musste gewählt werden
    if (mode < 4) {
      const trumps = h.filter((c) => suitOf(c) === mode);
      const bauer = trumps.some((c) => rankOf(c) === RB);
      const nell = trumps.some((c) => rankOf(c) === R9);
      if (!bauer && !nell) w *= forced ? 0.6 : 0.3;
      if (trumps.length <= 2) w *= forced ? 0.7 : 0.4;
      else if (trumps.length >= 4) w *= 1.3;
    } else {
      const top = mode === OBE ? RA : R6;
      const n = h.filter((c) => rankOf(c) === top).length;
      if (n === 0) w *= forced ? 0.5 : 0.2;
      else if (n === 1) w *= forced ? 0.85 : 0.6;
      else if (n >= 3) w *= 1.3;
    }
  }
  // Wer geschoben hat, hatte keine sehr starke Trumpfhand.
  if (view.pushed && view.ansager !== me) {
    const h = initial(view.ansager);
    for (let s = 0; s < 4; s++) {
      const ranks = h.filter((c) => suitOf(c) === s).map(rankOf);
      if (ranks.includes(RB) && ranks.includes(R9) && ranks.length >= 4) { w *= 0.4; break; }
    }
  }

  // Zeichen (Anziehen / Verwerfen)
  if (mode !== null) {
    const meaning = signalMeaning(convention);
    for (let s = 0; s < 4; s++) {
      const sig = k.signals[s];
      if (!sig || s === me) continue;
      const bock = bockOf(sig.suit, mode, k.played);
      if (bock < 0) continue;
      const holdsBock = hands[s].includes(bock);
      if (meaning === 'want') w *= holdsBock ? 1.6 : 0.55;
      else w *= holdsBock ? 0.45 : 1.15;
    }
  }
  return w;
}
