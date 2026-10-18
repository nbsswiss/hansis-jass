// Darstellung einzelner Karten als DOM-Elemente (französisches oder deutschschweizer Bild).
import { suitOf, rankOf, RANK_LABELS, SUIT_SYMBOLS, cardName } from '../core/cards.js';
import { faceSVG } from './faces.js';

// Deutschschweizer Farben als Bildzeichen
const DE_SYMBOLS = ['🔔', '🌹', '🛡️', '🌰'];

export function suitSymbol(s, style) {
  return style === 'de' ? DE_SYMBOLS[s] : SUIT_SYMBOLS[s];
}

export function suitClass(s, style) {
  if (style === 'de') return ['gold', 'red', 'black', 'brown'][s];
  return s === 0 || s === 1 ? 'red' : 'black';
}

// Pip-Positionen [x%, y%] für 6 bis 10
const COL_L = 27, COL_C = 50, COL_R = 73;
const three = [18, 50, 82], four = [17, 39, 61, 83];
const side = (ys) => ys.flatMap((y) => [[COL_L, y], [COL_R, y]]);
const PIPS = {
  0: side(three),
  1: [...side(three), [COL_C, 34]],
  2: [...side(three), [COL_C, 34], [COL_C, 66]],
  3: [...side(four), [COL_C, 50]],
  4: [...side(four), [COL_C, 28], [COL_C, 72]],
};

export function cardElement(c, style = 'fr') {
  const s = suitOf(c), r = rankOf(c);
  const el = document.createElement('div');
  el.className = `card face ${suitClass(s, style)}${style === 'de' ? ' de' : ''}`;
  el.dataset.card = c;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', cardName(c, style));
  const sym = suitSymbol(s, style);
  const label = RANK_LABELS[style][r];
  const corner = (cls) => `<div class="corner ${cls}"><span class="rk">${label}</span><span class="st">${sym}</span></div>`;
  let center;
  if (r <= 4) {
    center = `<div class="pips">${PIPS[r].map(([x, y]) => `<span style="left:${x}%;top:${y}%"${y > 55 ? ' class="flip"' : ''}>${sym}</span>`).join('')}</div>`;
  } else if (r === 8) {
    center = `<div class="ace">${sym}</div>`;
  } else {
    const symColor = { red: '#c8102e', black: '#1d1d1f', gold: '#b8860b', brown: '#7a4a1e' }[suitClass(s, style)];
    center = faceSVG(r, s, style, sym, symColor);
  }
  el.innerHTML = corner('tl') + center + corner('br');
  return el;
}

export function backElement() {
  const el = document.createElement('div');
  el.className = 'card back';
  return el;
}
