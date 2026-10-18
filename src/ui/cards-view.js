// Darstellung der Karten im Stil der Schweizer Jasskarten (Vorlage: Fotos der Spielerin):
// grosse Farbzeichen ohne Buchstaben, "10" in den Eckzeichen der Zehn, Ass mit vier kleinen
// Eckzeichen und grossem Zeichen in der Mitte, Bildkarten mit grossem Farbzeichen oben links.
// Alle Grössen hängen an --cw (Kartenbreite), font-size der Karte = --cw, Pips in em.
import { suitOf, rankOf, cardName } from '../core/cards.js';
import { figureSVG } from './faces.js';
import { deIcon, deShape, deCardInner, NUM_LAYOUT, corners, words } from './de-cards.js';

// Farbzeichen als SVG (viewBox 0 0 100 100), Spitze bzw. Stiel wie auf den Karten
const SHAPES = [
  // ♦ Ecke: Raute mit eingezogenen Seiten
  '<path d="M50 2 C58 22 72 38 94 50 C72 62 58 78 50 98 C42 78 28 62 6 50 C28 38 42 22 50 2 Z"/>',
  // ♥ Herz
  '<path d="M50 94 C22 71 4 53 4 31 C4 15 16 5 29 5 C39 5 46 11 50 21 C54 11 61 5 71 5 C84 5 96 15 96 31 C96 53 78 71 50 94 Z"/>',
  // ♠ Schaufel
  '<path d="M50 3 C76 26 95 42 95 62 C95 77 84 85 72 85 C62 85 55 80 52 72 C53 84 58 92 67 97 L33 97 C42 92 47 84 48 72 C45 80 38 85 28 85 C16 85 5 77 5 62 C5 42 24 26 50 3 Z"/>',
  // ♣ Kreuz
  '<circle cx="50" cy="27" r="21"/><circle cx="27.5" cy="55" r="21"/><circle cx="72.5" cy="55" r="21"/><path d="M42 40 H58 V62 H42 Z"/><path d="M50 50 C52 76 58 88 70 97 L30 97 C42 88 48 76 50 50 Z"/>',
];

// Portraits für die Bildkarten: { enabled, 5: dataUrl (Bauer), 6: (Dame), 7: (König) }.
// Fehlt ein Eintrag, gilt das Standard-Portrait (Bauer = Hansi); null = bewusst entfernt.
export const DEFAULT_PORTRAITS = { 5: new URL('../../assets/portraits/bauer.jpg', import.meta.url).href };
let portraits = { enabled: true };
export function setPortraits(p) { portraits = p || { enabled: true }; }
export function portraitImage(rank) {
  return rank in portraits ? portraits[rank] : DEFAULT_PORTRAITS[rank] || null;
}
const portraitFor = (rank) => (portraits.enabled ? portraitImage(rank) : null);

const COLORS = { red: '#e0202e', black: '#141414', gold: '#b8860b', brown: '#7a4a1e' };

export function suitClass(s, style) {
  if (style === 'de') return ['gold', 'red', 'black', 'brown'][s];
  return s === 0 || s === 1 ? 'red' : 'black';
}

export const suitColor = (s, style) => COLORS[suitClass(s, style)];

// Farbzeichen als SVG-Markup (für Knöpfe, Anzeigen und Pips)
export function suitIcon(s, style, cls = 'suit-icon') {
  if (style === 'de') return deIcon(s, cls);
  return `<svg class="${cls}" viewBox="0 0 100 100" fill="${suitColor(s, style)}" aria-hidden="true">${SHAPES[s]}</svg>`;
}

// Ein Pip: Mittelpunkt x/y in % der Karte, size in Kartenbreiten, rot = auf dem Kopf
function pip(s, style, x, y, size, rot = false, label = '') {
  const lbl = label ? `<b class="lbl">${label}</b>` : '';
  // font-size = Pip-Grösse: alles im Pip (Symbol, Zahl) rechnet in em relativ dazu
  return `<span class="pip${rot ? ' rot' : ''}" style="left:${x}%;top:${y}%;font-size:${size}em">${suitIcon(s, style, 'shape')}${lbl}</span>`;
}


export function cardElement(c, style = 'fr') {
  const s = suitOf(c), r = rankOf(c);
  const el = document.createElement('div');
  el.className = `card face s${s} ${suitClass(s, style)}${style === 'de' ? ' de' : ''}`;
  el.dataset.card = c;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', cardName(c, style));
  let html = '';
  if (style === 'de') {
    const mark = (x, y, size) => `<g transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})">${deShape(s, 0)}</g>`;
    el.innerHTML = deCardInner(s, r, () => figureSVG(r, s, style, mark, portraitFor(r)));
    return el;
  }
  // Französisches Bild im gleichen Eck-Layout wie die deutschen Karten:
  // Zahl bzw. Name in den Ecken innerhalb eines feinen Rahmens (spontan besser lesbar)
  const FR_WORDS = { 5: 'BAUER', 6: 'DAME', 7: 'KÖNIG', 8: 'ASS' };
  if (r <= 4) {
    const { size, pts } = NUM_LAYOUT[r];
    html = `<div class="frame de-frame"></div>${corners(String(r + 6))}`
      + pts.map(([x, y]) => pip(s, style, x, y, size, y > 50)).join('');
  } else if (r === 8) {
    html = `<div class="frame de-frame"></div>${words(FR_WORDS[8])}` + pip(s, style, 50, 50, 0.46);
  } else {
    const color = suitColor(s, style);
    const mark = (x, y, size) => `<g transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})" fill="${color}">${SHAPES[s]}</g>`;
    html = `<div class="frame de-frame"><div class="fig">${figureSVG(r, s, style, mark, portraitFor(r))}</div></div>`
      + words(FR_WORDS[r])
      + pip(s, style, 22, 23.5, 0.2) + pip(s, style, 83, 9.5, 0.1)
      + pip(s, style, 78, 76.5, 0.2, true) + pip(s, style, 17, 90.5, 0.1, true);
  }
  el.innerHTML = html;
  return el;
}

export function backElement() {
  const el = document.createElement('div');
  el.className = 'card back';
  return el;
}
