// Mitzählen: alles, was ein Spieler aus seiner Sicht über die Runde weiss
// (docs/strategie.md, Abschnitt 5 und 6). Verwendet nur öffentliche Informationen.
import { suitOf, rankOf, points, strength, RB, card, FULL_DECK } from '../core/cards.js';
import { winningIndex } from '../core/rules.js';

// Liefert alle Stiche (fertige + laufender) als Liste von { leader, plays: [{seat, card}] }.
export function allTricks(view) {
  const list = view.tricks.map((t) => ({ leader: t.leader, plays: t.cards.map((c, i) => ({ seat: (t.leader + i) % 4, card: c })) }));
  if (view.trick.length) {
    list.push({ leader: view.leader, plays: view.trick.map((c, i) => ({ seat: (view.leader + i) % 4, card: c })) });
  }
  return list;
}

export function buildKnowledge(view) {
  const mode = view.mode;
  const played = new Set();
  const playedBy = [[], [], [], []];
  const voids = [0, 1, 2, 3].map(() => [false, false, false, false]);
  const maybeBauerOnly = [false, false, false, false]; // Trumpf nicht angegeben, Bauer evtl. zurückgehalten
  const signals = [null, null, null, null];
  const firstLeads = [null, null, null, null]; // erste ausgespielte Farbe pro Sitz
  const discarded = [false, false, false, false];

  for (const t of allTricks(view)) {
    const led = suitOf(t.plays[0].card);
    const leadSeat = t.plays[0].seat;
    if (firstLeads[leadSeat] === null) firstLeads[leadSeat] = led;
    t.plays.forEach(({ seat, card: c }, i) => {
      played.add(c);
      playedBy[seat].push(c);
      if (i === 0) return;
      const s = suitOf(c);
      if (s === led) return;
      if (mode < 4 && led === mode) {
        voids[seat][led] = true;
        maybeBauerOnly[seat] = true;
      } else {
        voids[seat][led] = true;
      }
      // Abwurf (weder bedient noch gestochen) -> evtl. Zeichen
      if (mode < 4 && s === mode) return;
      if (discarded[seat]) return;
      const before = t.plays.slice(0, i).map((p) => p.card);
      const winnerSeat = t.plays[winningIndex(before, mode)].seat;
      const schmier = winnerSeat === (seat + 2) % 4 && points(c, mode) >= schmierMin(mode);
      if (schmier) return;
      discarded[seat] = true;
      signals[seat] = { suit: s, card: c };
    });
  }

  // Gezeigte Weis-Karten, die noch nicht gespielt sind, sind bekannt.
  const known = [[], [], [], []];
  for (const [s, cards] of Object.entries(view.shownWeis || {})) {
    for (const c of cards) if (!played.has(c) && !known[+s].includes(c)) known[+s].push(c);
  }
  known[view.seat] = view.hand.slice();

  return { mode, played, playedBy, voids, maybeBauerOnly, signals, firstLeads, known };
}

// Ab so vielen Punkten gilt eine zugegebene Karte als Schmieren (kein Zeichen).
export const schmierMin = (mode) => (mode < 4 ? 10 : 8);

// Höchste noch nicht gespielte Karte einer Farbe aus Sicht des Spielers (unabhängig vom Besitzer).
export function bockOf(suit, mode, played) {
  let best = -1, bestStr = -1;
  for (let r = 0; r < 9; r++) {
    const c = card(suit, r);
    if (played.has(c)) continue;
    const st = strength(c, mode);
    if (st > bestStr) { bestStr = st; best = c; }
  }
  return best;
}

export const unseenCards = (view, k) => FULL_DECK.filter((c) => !k.played.has(c) && !view.hand.includes(c));

// Bedeutung eines Zeichens unter der Konvention: 'want' oder 'avoid'.
export function signalMeaning(convention) {
  return convention === 'verwerfen' ? 'avoid' : 'want';
}

export const isTrumpBauer = (c, mode) => mode < 4 && suitOf(c) === mode && rankOf(c) === RB;
