// Eine Runde (9 Stiche) als reiner Datenzustand. Alle Funktionen verändern das
// übergebene Objekt und geben Ereignisse für Oberfläche und Partie zurück.
// Regeln: docs/regeln.md, Abschnitte 2 bis 8.
import { FULL_DECK, sortHand, card, R7 } from './cards.js';
import { legalMoves, winningIndex, trickPoints, LAST_TRICK_BONUS, MATCH_BONUS } from './rules.js';
import { findWeis, resolveWeis, stoeckOwner, STOECK_POINTS, weisLabel } from './weis.js';

export const PUSH = 'push';

export function deal(rng) {
  const deck = rng.shuffle(FULL_DECK.slice());
  return [0, 1, 2, 3].map((s) => sortHand(deck.slice(s * 9, s * 9 + 9)));
}

// Sitz mit der Ecke-7 (♦7): Ansager der ersten Runde.
export const firstAnsager = (hands) => hands.findIndex((h) => h.includes(card(0, R7)));

export function createRound(hands, ansager) {
  return {
    hands: hands.map((h) => h.slice()),
    initialHands: hands.map((h) => h.slice()),
    ansager,
    chooser: ansager,
    pushed: false,
    mode: null,
    phase: 'choose',
    toAct: ansager,
    leader: ansager,
    trick: [],
    tricks: [],
    declarations: [[], [], [], []],
    announced: [null, null, null, null], // Weis-Ansage pro Sitz im 1. Stich
    weisResult: null,
    stoeckSeat: -1,
    stoeckAnnounced: false,
    cardPoints: [0, 0], // inkl. letzter Stich und Matchbonus, ohne Multiplikator
    weisPoints: [0, 0],
    stoeckPoints: [0, 0],
  };
}

export function chooseMode(round, seat, choice) {
  if (round.phase !== 'choose') throw new Error('Keine Ansage möglich');
  if (seat !== round.toAct) throw new Error('Nicht an der Reihe');
  if (choice === PUSH) {
    if (round.pushed) throw new Error('Zurückschieben ist nicht erlaubt');
    round.pushed = true;
    round.chooser = (round.ansager + 2) % 4;
    round.toAct = round.chooser;
    return [{ type: 'push', seat }];
  }
  if (!(choice >= 0 && choice <= 5)) throw new Error(`Unbekannte Spielart ${choice}`);
  round.mode = choice;
  round.phase = 'play';
  round.toAct = round.ansager;
  round.leader = round.ansager;
  round.hands = round.hands.map((h) => sortHand(h, choice));
  round.declarations = round.initialHands.map((h) => findWeis(h));
  round.stoeckSeat = stoeckOwner(round.initialHands, choice);
  return [{ type: 'mode', seat, mode: choice }];
}

export const currentLegalMoves = (round) => legalMoves(round.hands[round.toAct], round.trick, round.mode);

export function playCard(round, seat, c) {
  if (round.phase !== 'play') throw new Error('Es wird nicht gespielt');
  if (seat !== round.toAct) throw new Error('Nicht an der Reihe');
  const hand = round.hands[seat];
  if (!legalMoves(hand, round.trick, round.mode).includes(c)) throw new Error('Karte nicht erlaubt');

  const events = [];
  hand.splice(hand.indexOf(c), 1);
  round.trick.push(c);
  events.push({ type: 'play', seat, card: c });

  // Weis wird beim Ausspielen der ersten Karte angesagt.
  if (round.tricks.length === 0) {
    const decl = round.declarations[seat];
    round.announced[seat] = decl.map((w) => ({ label: weisLabel(w), points: w.points }));
    if (decl.length) events.push({ type: 'weisAnnounce', seat, weis: round.announced[seat] });
  }

  // Stöck beim Spielen der zweiten Karte (König oder Dame Trumpf).
  if (seat === round.stoeckSeat && !round.stoeckAnnounced) {
    const k = card(round.mode, 7), d = card(round.mode, 6);
    if ((c === k || c === d) && !hand.includes(k) && !hand.includes(d)) {
      round.stoeckAnnounced = true;
      round.stoeckPoints[seat % 2] += STOECK_POINTS;
      events.push({ type: 'stoeck', seat, team: seat % 2, points: STOECK_POINTS });
    }
  }

  if (round.trick.length < 4) {
    round.toAct = (seat + 1) % 4;
    return events;
  }

  // Stich komplett
  if (round.tricks.length === 0) {
    const res = resolveWeis(round.declarations, round.mode, round.leader);
    round.weisResult = res;
    round.weisPoints = res.points.slice();
    if (res.team !== null) {
      const shown = {};
      for (const s of res.shownSeats) shown[s] = round.declarations[s];
      events.push({ type: 'weis', team: res.team, points: res.points[res.team], shown, bestSeat: res.bestSeat });
    }
  }

  const winner = (round.leader + winningIndex(round.trick, round.mode)) % 4;
  const last = round.tricks.length === 8;
  const pts = trickPoints(round.trick, round.mode) + (last ? LAST_TRICK_BONUS : 0);
  round.tricks.push({ leader: round.leader, cards: round.trick.slice(), winner, points: pts });
  round.cardPoints[winner % 2] += pts;
  events.push({ type: 'trick', winner, team: winner % 2, points: pts, cards: round.trick.slice(), last });
  round.trick = [];
  round.leader = winner;
  round.toAct = winner;

  if (last) {
    const teams = round.tricks.map((t) => t.winner % 2);
    if (teams.every((t) => t === teams[0])) {
      round.cardPoints[teams[0]] += MATCH_BONUS;
      events.push({ type: 'match', team: teams[0], points: MATCH_BONUS });
    }
    round.phase = 'done';
    events.push({ type: 'roundEnd', summary: roundSummary(round) });
  }
  return events;
}

export function roundSummary(round) {
  const teams = [0, 1].map((t) => ({
    cards: round.cardPoints[t],
    weis: round.weisPoints[t],
    stoeck: round.stoeckPoints[t],
    tricks: round.tricks.filter((x) => x.winner % 2 === t).length,
  }));
  const match = round.tricks.length === 9 && teams.some((t) => t.tricks === 9);
  return { mode: round.mode, chooser: round.chooser, pushed: round.pushed, teams, match };
}

// Sicht eines Spielers: eigene Hand und alles, was am Tisch öffentlich ist.
// Computer-Spieler bekommen nur diese Sicht (siehe CLAUDE.md: keine Schummelei).
export function viewFor(round, seat) {
  const shownWeis = {};
  if (round.weisResult && round.weisResult.team !== null) {
    for (const s of round.weisResult.shownSeats) shownWeis[s] = [...new Set(round.declarations[s].map((w) => w.cards).flat())];
  }
  return {
    seat,
    hand: round.hands[seat].slice(),
    handSizes: round.hands.map((h) => h.length),
    ansager: round.ansager,
    chooser: round.chooser,
    pushed: round.pushed,
    mode: round.mode,
    phase: round.phase,
    toAct: round.toAct,
    leader: round.leader,
    trick: round.trick.slice(),
    tricks: round.tricks.map((t) => ({ leader: t.leader, cards: t.cards.slice(), winner: t.winner })),
    myWeis: round.mode === null ? findWeis(round.hands[seat]) : round.declarations[seat],
    shownWeis,
    stoeckSeat: round.stoeckAnnounced ? round.stoeckSeat : -1,
  };
}
