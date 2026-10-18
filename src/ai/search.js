// Durchrechnen: jede erlaubte Karte wird in vielen vermuteten Verteilungen bis zum Rundenende
// gespielt – gegen Ende exakt mit Alpha-Beta-Suche, vorher mit den schnellen Regeln aus policy.js.
import { points, strength, suitOf } from '../core/cards.js';
import { legalMoves, winningIndex, MATCH_BONUS } from '../core/rules.js';
import { policyMove } from './policy.js';

// Spielzustand mit offenen Karten.
export function makeState(hands, view) {
  const tricksWon = [0, 0];
  for (const t of view.tricks) tricksWon[t.winner % 2]++;
  return {
    hands: hands.map((h) => h.slice()),
    trick: view.trick.slice(),
    leader: view.leader,
    mode: view.mode,
    pts: [0, 0],
    tricksWon,
    nTricks: view.tricks.length,
    chooserTeam: view.chooser % 2,
  };
}

export const seatToAct = (st) => (st.leader + st.trick.length) % 4;

// Karte spielen; gibt Rückgängig-Information zurück.
export function apply(st, c) {
  const seat = seatToAct(st);
  const hand = st.hands[seat];
  const idx = hand.indexOf(c);
  hand.splice(idx, 1);
  st.trick.push(c);
  if (st.trick.length < 4) return { seat, c, idx, done: null };
  const trick = st.trick;
  const winner = (st.leader + winningIndex(trick, st.mode)) % 4;
  let pts = 0;
  for (const x of trick) pts += points(x, st.mode);
  st.nTricks++;
  if (st.nTricks === 9) pts += 5;
  const team = winner % 2;
  st.pts[team] += pts;
  st.tricksWon[team]++;
  const undo = { seat, c, idx, done: { trick, leader: st.leader, team, pts } };
  st.trick = [];
  st.leader = winner;
  return undo;
}

export function undo(st, u) {
  if (u.done) {
    st.trick = u.done.trick;
    st.leader = u.done.leader;
    st.pts[u.done.team] -= u.done.pts;
    st.tricksWon[u.done.team]--;
    st.nTricks--;
  }
  st.trick.pop();
  st.hands[u.seat].splice(u.idx, 0, u.c);
}

// Bewertung am Rundenende aus Sicht von `team`: Punktedifferenz inkl. Matchbonus.
export function finalValue(st, team) {
  let v = st.pts[team] - st.pts[1 - team];
  if (st.tricksWon[team] === 9) v += MATCH_BONUS;
  else if (st.tricksWon[1 - team] === 9) v -= MATCH_BONUS;
  return v;
}

export function rollout(st, team) {
  const undos = [];
  while (st.nTricks < 9) undos.push(apply(st, policyMove(st)));
  const v = finalValue(st, team);
  for (let i = undos.length - 1; i >= 0; i--) undo(st, undos[i]);
  return v;
}

// Gleichwertige Karten zusammenfassen: liegt zwischen zwei Karten derselben Farbe keine
// andere noch vorhandene Karte und haben sie gleich viele Punkte, genügt eine davon.
function distinctMoves(st, moves) {
  if (moves.length <= 1) return moves;
  const mode = st.mode;
  const out = [];
  for (const c of moves) {
    const s = suitOf(c), str = strength(c, mode), pts = points(c, mode);
    // nächststärkere Karte dieser Farbe unter allen noch vorhandenen und im Stich liegenden Karten
    let next = -1, nextStr = 99;
    const consider = (x) => {
      if (((x / 9) | 0) !== s) return;
      const xs = strength(x, mode);
      if (xs > str && xs < nextStr) { nextStr = xs; next = x; }
    };
    for (let p = 0; p < 4; p++) for (const x of st.hands[p]) consider(x);
    for (const x of st.trick) consider(x);
    if (next >= 0 && moves.includes(next) && points(next, mode) === pts) continue;
    out.push(c);
  }
  return out;
}

let nodes = 0;
export const resetNodes = () => { nodes = 0; };
export const nodeCount = () => nodes;

export function alphabeta(st, team, alpha, beta) {
  nodes++;
  if (st.nTricks === 9) return finalValue(st, team);
  const seat = seatToAct(st);
  const moves = distinctMoves(st, legalMoves(st.hands[seat], st.trick, st.mode));
  // Zugsortierung: Regelzug zuerst
  const first = policyMove(st);
  const i0 = moves.indexOf(first);
  if (i0 > 0) { moves[i0] = moves[0]; moves[0] = first; }
  const max = seat % 2 === team;
  let best = max ? -1e9 : 1e9;
  for (const c of moves) {
    const u = apply(st, c);
    const v = alphabeta(st, team, alpha, beta);
    undo(st, u);
    if (max) {
      if (v > best) best = v;
      if (best > alpha) alpha = best;
    } else {
      if (v < best) best = v;
      if (best < beta) beta = best;
    }
    if (alpha >= beta) break;
  }
  return best;
}

// Wert eines Zuges in einem Zustand (aus Sicht von team).
export function moveValue(st, c, team, exact) {
  const u = apply(st, c);
  const v = exact ? alphabeta(st, team, -1e9, 1e9) : rollout(st, team);
  undo(st, u);
  return v;
}
