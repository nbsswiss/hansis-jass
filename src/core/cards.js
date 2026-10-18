// Karten, Spielarten, Rangfolgen und Kartenpunkte (docs/regeln.md, Abschnitt 1 und 3).
//
// Karte = Zahl 0..35: farbe = Math.floor(k / 9), wert = k % 9.
// Werte: 0=6, 1=7, 2=8, 3=9, 4=10, 5=Bauer, 6=Dame, 7=König, 8=Ass.

export const SUITS = [0, 1, 2, 3]; // ♦ Ecke, ♥ Herz, ♠ Schaufel, ♣ Kreuz
export const R6 = 0, R7 = 1, R8 = 2, R9 = 3, R10 = 4, RB = 5, RD = 6, RK = 7, RA = 8;

// Spielarten: 0..3 = Trumpf in dieser Farbe, 4 = Obenabe, 5 = Undeufe.
export const OBE = 4;
export const UNDE = 5;
export const MODES = [0, 1, 2, 3, OBE, UNDE];

export const suitOf = (c) => (c / 9) | 0;
export const rankOf = (c) => c % 9;
export const card = (suit, rank) => suit * 9 + rank;
export const isTrumpMode = (mode) => mode < 4;
export const isTrump = (c, mode) => mode < 4 && suitOf(c) === mode;

export const FULL_DECK = Array.from({ length: 36 }, (_, i) => i);

// Kartenpunkte je Wert
const PTS_TRUMP = [0, 0, 0, 14, 10, 20, 3, 4, 11];
const PTS_PLAIN = [0, 0, 0, 0, 10, 2, 3, 4, 11];
const PTS_OBE = [0, 0, 8, 0, 10, 2, 3, 4, 11];
const PTS_UNDE = [11, 0, 8, 0, 10, 2, 3, 4, 0];

export function points(c, mode) {
  const r = c % 9;
  if (mode === OBE) return PTS_OBE[r];
  if (mode === UNDE) return PTS_UNDE[r];
  return ((c / 9) | 0) === mode ? PTS_TRUMP[r] : PTS_PLAIN[r];
}

// Rang innerhalb der Trumpffarbe: 6 < 7 < 8 < 10 < D < K < A < 9 (Nell) < B (Bauer)
const TRUMP_ORDER = [0, 1, 2, 7, 3, 8, 4, 5, 6];

// Stärke einer Karte innerhalb ihrer Farbe in der gegebenen Spielart (höher = stärker).
export function strength(c, mode) {
  const r = c % 9;
  if (mode === UNDE) return 8 - r;
  if (mode < 4 && ((c / 9) | 0) === mode) return TRUMP_ORDER[r];
  return r;
}

// Stichkraft einer Karte im Stich (0 = kann nicht gewinnen).
export function power(c, mode, ledSuit) {
  const s = (c / 9) | 0;
  if (mode < 4 && s === mode) return 100 + TRUMP_ORDER[c % 9];
  if (s === ledSuit) return 10 + strength(c, mode);
  return 0;
}

// Multiplikator der Spielart (docs/regeln.md 8.1)
export function multiplier(mode, enabled = true) {
  if (!enabled) return 1;
  if (mode === OBE || mode === UNDE) return 3;
  return mode >= 2 ? 2 : 1;
}

// ---- Namen für Anzeige ----
export const SUIT_SYMBOLS = ['♦', '♥', '♠', '♣'];
export const SUIT_NAMES = {
  fr: ['Ecke', 'Herz', 'Schaufel', 'Kreuz'],
  de: ['Schellen', 'Rosen', 'Schilten', 'Eicheln'],
};
export const RANK_LABELS = {
  fr: ['6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
  de: ['6', '7', '8', '9', 'Ba', 'U', 'O', 'K', 'A'],
};
export const RANK_NAMES = {
  fr: ['Sechs', 'Sieben', 'Acht', 'Neun', 'Zehn', 'Bauer', 'Dame', 'König', 'Ass'],
  de: ['Sechs', 'Sieben', 'Acht', 'Neun', 'Banner', 'Under', 'Ober', 'König', 'Ass'],
};

export function modeName(mode, style = 'fr') {
  if (mode === OBE) return 'Obenabe';
  if (mode === UNDE) return 'Undeufe';
  return SUIT_NAMES[style][mode];
}

export function cardName(c, style = 'fr') {
  return `${SUIT_NAMES[style][suitOf(c)]} ${RANK_NAMES[style][rankOf(c)]}`;
}

// Kurzschreibweise für Tests und Fehlersuche: "♥A", "♠10", "♦B"
export function cardShort(c) {
  return SUIT_SYMBOLS[suitOf(c)] + RANK_LABELS.fr[rankOf(c)];
}

// Umkehrung von cardShort, akzeptiert auch Buchstaben: "hA", "s10", "dB", "cK"
export function parseCard(text) {
  const t = text.trim();
  const sym = t[0];
  const suit = '♦♥♠♣'.indexOf(sym) >= 0 ? '♦♥♠♣'.indexOf(sym) : 'dhsc'.indexOf(sym.toLowerCase());
  const rank = RANK_LABELS.fr.indexOf(t.slice(1).toUpperCase());
  if (suit < 0 || rank < 0) throw new Error(`Unbekannte Karte: ${text}`);
  return card(suit, rank);
}

export const parseCards = (text) => text.trim().split(/\s+/).filter(Boolean).map(parseCard);

// Sortierung für die Hand (Wunsch der Spielerin):
// - Farben abwechselnd schwarz/rot (♠ ♥ ♣ ♦), Trumpf zuerst; fehlt eine Farbe, wird die
//   Reihenfolge so gewählt, dass möglichst oft schwarz und rot wechseln.
// - Innerhalb der Farbe immer nach der Zahl (A K D B 10 9 8 7 6), auch beim Trumpf:
//   Bauer und Nell bleiben an ihrem natürlichen Platz.
const SUIT_PREF = [2, 1, 3, 0]; // ♠ ♥ ♣ ♦
const isRed = (s) => s < 2;

function permutations(list) {
  if (list.length <= 1) return [list];
  return list.flatMap((x, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((p) => [x, ...p]));
}

export function suitOrder(cards, mode = null) {
  const present = SUIT_PREF.filter((s) => cards.some((c) => suitOf(c) === s));
  const trump = mode !== null && mode < 4 && present.includes(mode) ? mode : -1;
  let best = null, bestScore = -1;
  for (const p of permutations(present)) {
    if (trump >= 0 && p[0] !== trump) continue;
    let score = 0;
    for (let i = 1; i < p.length; i++) if (isRed(p[i]) !== isRed(p[i - 1])) score++;
    if (score > bestScore) { bestScore = score; best = p; } // erste beste = bevorzugte Reihenfolge
  }
  return best || [];
}

export function sortHand(cards, mode = null) {
  const order = suitOrder(cards, mode);
  return [...cards].sort((a, b) => {
    const sa = order.indexOf(suitOf(a)), sb = order.indexOf(suitOf(b));
    if (sa !== sb) return sa - sb;
    return rankOf(b) - rankOf(a);
  });
}
