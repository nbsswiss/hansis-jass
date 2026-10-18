// Schnelle Spielregeln für das Durchspielen einer vermuteten Verteilung (alle Karten offen).
// Bewusst einfach und schnell: sie wird viele tausend Mal pro Entscheidung aufgerufen.
// Grundsätze aus docs/strategie.md: Bock spielen, Trumpf ziehen, schmieren, billig stechen,
// wenig zugeben.
import { suitOf, points, strength, power } from '../core/cards.js';
import { legalMoves, winningIndex } from '../core/rules.js';

// Wert einer Karte, wenn man sie für später behält.
export function keepValue(c, mode, st) {
  const s = (c / 9) | 0;
  if (mode < 4 && s === mode) return 5 + strength(c, mode) * 1.5;
  if (isBock(c, mode, st)) return points(c, mode) + 8;
  return 0;
}

// Ist c die stärkste noch vorhandene Karte ihrer Farbe (in allen Händen)?
export function isBock(c, mode, st) {
  const s = (c / 9) | 0, str = strength(c, mode);
  for (let p = 0; p < 4; p++) {
    for (const x of st.hands[p]) if (x !== c && ((x / 9) | 0) === s && strength(x, mode) > str) return false;
  }
  return true;
}

// Wer gewinnt den Stich, wenn die restlichen Spieler „gierig“ spielen?
// Gegner des aktuell Stechenden stechen mit der billigsten möglichen Karte.
function greedyWinnerTeam(st, trick, firstSeat) {
  const mode = st.mode;
  const t = trick.slice();
  const led = suitOf(t[0]);
  let wi = winningIndex(t, mode);
  let bestPow = power(t[wi], mode, led);
  for (let i = t.length; i < 4; i++) {
    const seat = (firstSeat + i) % 4;
    const winSeat = (firstSeat + wi) % 4;
    if (winSeat % 2 === seat % 2) { t.push(-1); continue; }
    let cheapest = -1, cheapPow = 999;
    for (const c of legalMoves(st.hands[seat], t.filter((x) => x >= 0), mode)) {
      const p = power(c, mode, led);
      if (p > bestPow && p < cheapPow) { cheapPow = p; cheapest = c; }
    }
    if (cheapest >= 0) { wi = i; bestPow = cheapPow; }
    t.push(-1);
  }
  return ((firstSeat + wi) % 4) % 2;
}

export function policyMove(st) {
  const seat = (st.leader + st.trick.length) % 4;
  const hand = st.hands[seat];
  const legal = legalMoves(hand, st.trick, st.mode);
  if (legal.length === 1) return legal[0];
  return st.trick.length === 0 ? chooseLead(st, seat, legal) : chooseFollow(st, seat, legal);
}

function chooseFollow(st, seat, legal) {
  const mode = st.mode;
  const myTeam = seat % 2;
  let trickPts = 0;
  for (const c of st.trick) trickPts += points(c, mode);
  if (st.nTricks === 8) trickPts += 5;
  let best = legal[0], bestScore = -1e9;
  for (const c of legal) {
    const t = st.trick.concat(c);
    // Hand ohne c für die Bewertung, ob nachfolgende Spieler stechen können
    const winTeam = t.length === 4 ? ((st.leader + winningIndex(t, mode)) % 4) % 2 : greedyWinnerTeam(st, t, st.leader);
    const gain = trickPts + points(c, mode);
    const score = (winTeam === myTeam ? gain : -gain) - keepValue(c, mode, st);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

function chooseLead(st, seat, legal) {
  const mode = st.mode;
  const myTeam = seat % 2;
  const partner = (seat + 2) % 4;
  const oppHaveTrump = mode < 4 && [1, 3].some((d) => st.hands[(seat + d) % 4].some((x) => suitOf(x) === mode));
  let best = legal[0], bestScore = -1e9;
  for (const c of legal) {
    const s = suitOf(c);
    const trump = mode < 4 && s === mode;
    let score = -keepValue(c, mode, st) - points(c, mode) * 0.5;
    if (isBock(c, mode, st)) {
      if (trump) {
        if (oppHaveTrump) score += 14 + (st.chooserTeam === myTeam ? 6 : 0);
      } else {
        const stab = mode < 4 && oppHaveTrump && [1, 3].some((d) => {
          const h = st.hands[(seat + d) % 4];
          return !h.some((x) => suitOf(x) === s) && h.some((x) => suitOf(x) === mode);
        });
        score += stab ? -6 : 12 + points(c, mode);
      }
    } else if (trump) {
      score += st.chooserTeam === myTeam && oppHaveTrump ? 4 : -6;
    } else {
      // Kleine Karte in eine Farbe, in der die Partnerin den Bock hat
      const pBock = st.hands[partner].some((x) => suitOf(x) === s && isBock(x, mode, st));
      if (pBock) score += 8;
    }
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}
