// Strategieregeln (docs/strategie.md): kleine Zuschläge in Punkten, die bei fast gleich guten
// Karten den Ausschlag geben, und eine kurze Begründung für den Tipp an die Spielerin.
import { suitOf, rankOf, points, strength, RA, R10, UNDE, SUIT_SYMBOLS } from '../core/cards.js';
import { winningIndex } from '../core/rules.js';
import { bockOf, signalMeaning, schmierMin } from './knowledge.js';

// Wie stark ist meine Hand in einer Farbe? (Bock oder zwei der drei höchsten offenen Karten)
export function suitStrength(view, k, s) {
  const mode = view.mode;
  const remaining = [];
  for (let r = 0; r < 9; r++) {
    const c = s * 9 + r;
    if (!k.played.has(c)) remaining.push(c);
  }
  remaining.sort((a, b) => strength(b, mode) - strength(a, mode));
  const mine = view.hand.filter((c) => suitOf(c) === s);
  if (!mine.length) return 0;
  let score = 0;
  if (mine.includes(remaining[0])) score += 2;
  if (remaining[1] !== undefined && mine.includes(remaining[1])) score += 1;
  if (remaining[2] !== undefined && mine.includes(remaining[2]) && mine.length >= 3) score += 0.5;
  return score;
}

function context(view, k, c) {
  const me = view.seat, partner = (me + 2) % 4, mode = view.mode;
  const leading = view.trick.length === 0;
  const led = leading ? -1 : suitOf(view.trick[0]);
  const s = suitOf(c);
  const trump = mode < 4 && s === mode;
  const discard = !leading && s !== led && !trump;
  const winnerSeat = leading ? -1 : (view.leader + winningIndex(view.trick, mode)) % 4;
  const partnerWinning = winnerSeat === partner;
  const schmier = discard && partnerWinning && points(c, mode) >= schmierMin(mode);
  const firstDiscard = discard && !schmier && !k.signals[me];
  return { me, partner, mode, leading, led, s, trump, discard, partnerWinning, schmier, firstDiscard };
}

export function strategicBonus(view, k, c, convention) {
  const x = context(view, k, c);
  const meaning = signalMeaning(convention);
  let b = 0;

  if (x.firstDiscard) {
    const st = suitStrength(view, k, x.s);
    const isBockCard = bockOf(x.s, x.mode, k.played) === c;
    const strongSuits = [0, 1, 2, 3].filter((s) => s !== x.mode && suitStrength(view, k, s) >= 2);
    if (meaning === 'want') {
      if (st >= 2 && !isBockCard && points(c, x.mode) < 10) b += 3;
      else if (strongSuits.length && st < 2) b -= 2;
    } else {
      if (st === 0) b += 3;
      else if (st >= 2) b -= 3;
    }
  }

  if (x.leading) {
    const psig = k.signals[x.partner];
    if (psig && psig.suit === x.s && !x.trump) {
      if (meaning === 'want') b += bockOf(x.s, x.mode, k.played) === c ? 2 : 3.5;
      else b -= 3;
    }
    for (const opp of [(x.me + 1) % 4, (x.me + 3) % 4]) {
      const sig = k.signals[opp];
      if (sig && sig.suit === x.s) b += meaning === 'want' ? -1.5 : 1;
    }
    if (x.trump) {
      const myTeamChose = view.chooser % 2 === x.me % 2;
      if (!myTeamChose) b -= 2.5;
      else if (view.tricks.length < 4) b += 1.5;
    }
    const pLead = k.firstLeads[x.partner];
    if (pLead !== null && pLead === x.s && !x.trump && !k.voids[x.partner][x.s]) b += 1.5;
    // Keinen Zehner blank ausspielen, wenn das Ass noch beim Gegner sein kann
    if (rankOf(c) === R10 && x.mode !== UNDE && !x.trump) {
      const ace = x.s * 9 + RA;
      if (!k.played.has(ace) && !view.hand.includes(ace)) b -= 2;
    }
  }
  return b;
}

// Kurze Begründung für eine Karte (für den Tipp in der Oberfläche).
export function explainMove(view, k, c, convention, style = 'fr') {
  const x = context(view, k, c);
  const sym = SUIT_SYMBOLS[x.s];
  const meaning = signalMeaning(convention);
  const isBockCard = bockOf(x.s, x.mode, k.played) === c;
  if (x.leading) {
    const psig = k.signals[x.partner];
    if (x.trump) return view.chooser % 2 === x.me % 2 ? 'Trumpf ziehen' : 'Trumpf anspielen';
    if (psig && psig.suit === x.s && meaning === 'want') return `Angezogene Farbe ${sym} spielen`;
    if (isBockCard) return 'Bock ausspielen';
    if (k.firstLeads[x.partner] === x.s) return `Farbe ${sym} zurückspielen`;
    return 'Klein ausspielen';
  }
  if (x.schmier) return 'Schmieren';
  if (x.firstDiscard) return meaning === 'want' ? `Anziehen ${sym}` : `Verwerfen ${sym}`;
  const t = view.trick.concat(c);
  const wins = winningIndex(t, x.mode) === t.length - 1;
  if (wins) return x.trump && x.led !== x.mode ? 'Stechen' : 'Stich übernehmen';
  if (x.partnerWinning) return 'Partnerin macht den Stich';
  return 'Wenig zugeben';
}
