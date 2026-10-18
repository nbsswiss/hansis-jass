// Gezeichnete Bildkarten (König, Dame/Ober, Bauer/Under) als SVG.
// Jede Figur ist wie bei echten Karten doppelköpfig: obere Hälfte + um 180° gedrehte Kopie.
// Koordinaten: viewBox 0 0 80 120, eine Hälfte zeichnet in y = 0..60.

const INK = '#2a2420';
const SKIN = '#f4d3b3';
const GOLD = '#e3b341';
const GOLD_DARK = '#b8862b';

// Gewandfarben je Farbe: [Hauptfarbe, Zweitfarbe]
const ROBES = {
  fr: [['#c8102e', '#1f3a93'], ['#b5122b', '#e3b341'], ['#1f3a93', '#c8102e'], ['#1e5e3f', '#c8102e']],
  de: [['#b8862b', '#1f3a93'], ['#b5122b', '#1e5e3f'], ['#2d2d2d', '#c8102e'], ['#7a4a1e', '#1e5e3f']],
};

const eyes = (y = 23) =>
  `<circle cx="36.6" cy="${y}" r="1.05" fill="${INK}"/><circle cx="43.4" cy="${y}" r="1.05" fill="${INK}"/>` +
  `<path d="M35 ${y - 2.6} q1.6 -1 3.2 0 M41.8 ${y - 2.6} q1.6 -1 3.2 0" stroke="${INK}" stroke-width=".55" fill="none"/>`;

const face = (cy = 25) =>
  `<ellipse cx="40" cy="${cy}" rx="8.6" ry="10.6" fill="${SKIN}" stroke="${INK}" stroke-width=".9"/>` +
  `<path d="M40 ${cy - 1} l-1.2 4.2 h2" stroke="${INK}" stroke-width=".55" fill="none"/>` +
  `<circle cx="34.5" cy="${cy + 3.2}" r="1.6" fill="#e9a08a" opacity=".55"/><circle cx="45.5" cy="${cy + 3.2}" r="1.6" fill="#e9a08a" opacity=".55"/>`;

const suitMark = (sym, x, y, size, color) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${sym}</text>`;

function king(main, second, sym, symColor) {
  return `
  <path d="M11 60 C12 46 20 40 29 38.5 L51 38.5 C60 40 68 46 69 60 Z" fill="${main}" stroke="${INK}" stroke-width="1"/>
  <path d="M30 38 L36 60 M50 38 L44 60" stroke="${GOLD}" stroke-width="2.2"/>
  <path d="M30 38 L36 60 M50 38 L44 60" stroke="${INK}" stroke-width=".4" fill="none"/>
  <path d="M22 40 C28 48 52 48 58 40 L53 37 L27 37 Z" fill="#fffaf0" stroke="${INK}" stroke-width=".8"/>
  <g fill="${INK}"><circle cx="30" cy="42" r=".8"/><circle cx="36" cy="44.2" r=".8"/><circle cx="44" cy="44.2" r=".8"/><circle cx="50" cy="42" r=".8"/></g>
  <path d="M30.5 18 C27 22 28 32 31 35 L33 26 Z M49.5 18 C53 22 52 32 49 35 L47 26 Z" fill="#ece7dc" stroke="${INK}" stroke-width=".7"/>
  ${face(25)}
  ${eyes(23)}
  <path d="M31.6 27 C31.5 38 36 43 40 43 C44 43 48.5 38 48.4 27 C46 32.5 34 32.5 31.6 27 Z" fill="#ece7dc" stroke="${INK}" stroke-width=".8"/>
  <path d="M34.6 29.6 Q40 27.4 45.4 29.6 Q40 31.6 34.6 29.6 Z" fill="#d9d2c3" stroke="${INK}" stroke-width=".5"/>
  <path d="M29 16 L28.6 5 L33.4 10.4 L36.6 2.6 L40 9.4 L43.4 2.6 L46.6 10.4 L51.4 5 L51 16 Z" fill="${GOLD}" stroke="${INK}" stroke-width=".9"/>
  <rect x="28.6" y="13.4" width="22.8" height="4.2" rx="1" fill="${GOLD_DARK}" stroke="${INK}" stroke-width=".8"/>
  <circle cx="34" cy="15.5" r="1.2" fill="${second}"/><circle cx="40" cy="15.5" r="1.4" fill="#c8102e"/><circle cx="46" cy="15.5" r="1.2" fill="${second}"/>
  <circle cx="36.6" cy="2.6" r="1" fill="${GOLD}" stroke="${INK}" stroke-width=".5"/><circle cx="43.4" cy="2.6" r="1" fill="${GOLD}" stroke="${INK}" stroke-width=".5"/>
  <line x1="63" y1="59" x2="65.5" y2="27" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="63" y1="59" x2="65.5" y2="27" stroke="${GOLD}" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="65.7" cy="25" r="3.2" fill="${GOLD}" stroke="${INK}" stroke-width=".8"/>
  <path d="M65.7 20.6 v-3 M64.2 19.1 h3" stroke="${INK}" stroke-width=".8"/>
  <path d="M58 52 c3 -3 6 -3 8 -1 c-1 3 -5 4 -8 1 Z" fill="${SKIN}" stroke="${INK}" stroke-width=".7"/>
  ${suitMark(sym, 21, 52, 9, symColor)}`;
}

function queen(main, second, sym, symColor) {
  return `
  <path d="M12 60 C13 47 21 41 30 39.5 L50 39.5 C59 41 67 47 68 60 Z" fill="${main}" stroke="${INK}" stroke-width="1"/>
  <path d="M29 39 C33 50 47 50 51 39" fill="${SKIN}" stroke="${INK}" stroke-width=".8"/>
  <path d="M27 39.5 C32 53 48 53 53 39.5" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <path d="M33 47.5 q7 4 14 0" fill="none" stroke="#fffaf0" stroke-width="1.4" stroke-dasharray="1.2 1.4"/>
  <circle cx="40" cy="50" r="1.8" fill="#c8102e" stroke="${INK}" stroke-width=".5"/>
  <path d="M30 14 C22 20 22 36 26 44 C28 38 30 34 31.5 30 Z M50 14 C58 20 58 36 54 44 C52 38 50 34 48.5 30 Z" fill="#b9772e" stroke="${INK}" stroke-width=".8"/>
  ${face(25)}
  ${eyes(23.4)}
  <path d="M37.4 30.6 q2.6 1.6 5.2 0" stroke="#b5122b" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M31 19 C33 12 47 12 49 19 C45 16 35 16 31 19 Z" fill="#b9772e" stroke="${INK}" stroke-width=".7"/>
  <path d="M32 13.6 L33 7.6 L36.4 11 L40 5.6 L43.6 11 L47 7.6 L48 13.6 Z" fill="${GOLD}" stroke="${INK}" stroke-width=".8"/>
  <circle cx="40" cy="9.6" r="1.1" fill="${second}"/>
  <path d="M28 14 C20 18 14 30 10 44" fill="none" stroke="${second}" stroke-width="1.6" opacity=".75"/>
  <line x1="63" y1="58" x2="61" y2="36" stroke="#2f6b3a" stroke-width="1.4"/>
  <path d="M61.6 44 c3 -1.5 5 -1 6 1 c-2.5 1.2 -4.5 1 -6 -1 Z" fill="#3c8a4a" stroke="${INK}" stroke-width=".5"/>
  <g transform="translate(60.6 33)">
    <circle r="2.4" cx="0" cy="-2.4" fill="#e04a5f" stroke="${INK}" stroke-width=".5"/>
    <circle r="2.4" cx="2.3" cy="-.7" fill="#e04a5f" stroke="${INK}" stroke-width=".5"/>
    <circle r="2.4" cx="1.4" cy="2" fill="#e04a5f" stroke="${INK}" stroke-width=".5"/>
    <circle r="2.4" cx="-1.4" cy="2" fill="#e04a5f" stroke="${INK}" stroke-width=".5"/>
    <circle r="2.4" cx="-2.3" cy="-.7" fill="#e04a5f" stroke="${INK}" stroke-width=".5"/>
    <circle r="1.5" fill="${GOLD}"/>
  </g>
  <path d="M57 53 c3 -3 6 -3 8 -1 c-1 3 -5 4 -8 1 Z" fill="${SKIN}" stroke="${INK}" stroke-width=".7"/>
  ${suitMark(sym, 21, 53, 9, symColor)}`;
}

function jack(main, second, sym, symColor) {
  return `
  <path d="M12 60 C13 47 21 41 30 39.5 L50 39.5 C59 41 67 47 68 60 Z" fill="${main}" stroke="${INK}" stroke-width="1"/>
  <path d="M20 44 L22 60 M29 40 L31 60 M40 41 L40 60 M51 40 L49 60 M60 44 L58 60" stroke="${second}" stroke-width="2.4"/>
  <path d="M29 39 C33 45 47 45 51 39 L49 37 L31 37 Z" fill="#fffaf0" stroke="${INK}" stroke-width=".8"/>
  <path d="M31.6 18 C29.5 22 30 28 31.6 31 L33 24 Z M48.4 18 C50.5 22 50 28 48.4 31 L47 24 Z" fill="#6b4423" stroke="${INK}" stroke-width=".7"/>
  ${face(25)}
  ${eyes(23.4)}
  <path d="M34.8 30 C37 28.2 39 28.8 40 29.6 C41 28.8 43 28.2 45.2 30 C43 30.6 41.4 30.4 40 30.2 C38.6 30.4 37 30.6 34.8 30 Z" fill="#6b4423" stroke="${INK}" stroke-width=".45"/>
  <path d="M27 17 C27 9 53 9 54 15 C50 17 32 19 27 17 Z" fill="${second}" stroke="${INK}" stroke-width=".9"/>
  <path d="M27 17 C33 19.6 48 18.6 54 15" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
  <path d="M49 12 C56 4 63 3 68 6 C62 7 56 10 51 14 Z" fill="#fffaf0" stroke="${INK}" stroke-width=".7"/>
  <path d="M52 12.4 C57 8 62 6.4 66 6.6" fill="none" stroke="${INK}" stroke-width=".4"/>
  <line x1="12" y1="59" x2="15.5" y2="18" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="12" y1="59" x2="15.5" y2="18" stroke="#9a6a3a" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M15.6 12 L18.4 22 L15.2 20.4 L12.6 22.6 Z" fill="#cfd6dd" stroke="${INK}" stroke-width=".7"/>
  <path d="M13.8 23.6 C9 22 8 27 10.2 29.6 C11 27 12.6 25.8 14.6 26 Z" fill="#cfd6dd" stroke="${INK}" stroke-width=".7"/>
  <path d="M10 50 c3 -3 6 -3 8 -1 c-1 3 -5 4 -8 1 Z" fill="${SKIN}" stroke="${INK}" stroke-width=".7"/>
  ${suitMark(sym, 60, 52, 9, symColor)}`;
}

// Ober (deutschschweizer Bild): Mann mit breitem Federhut und Umhang
function ober(main, second, sym, symColor) {
  return `
  <path d="M11 60 C12 46 20 40 29 38.5 L51 38.5 C60 40 68 46 69 60 Z" fill="${second}" stroke="${INK}" stroke-width="1"/>
  <path d="M28 38 C24 46 22 54 22 60 L58 60 C58 54 56 46 52 38 Z" fill="${main}" stroke="${INK}" stroke-width=".9"/>
  <path d="M30 38 C34 44 46 44 50 38 L48 36.4 L32 36.4 Z" fill="#fffaf0" stroke="${INK}" stroke-width=".8"/>
  <g fill="${GOLD}" stroke="${INK}" stroke-width=".4"><circle cx="40" cy="47" r="1.2"/><circle cx="40" cy="52" r="1.2"/><circle cx="40" cy="57" r="1.2"/></g>
  <path d="M31.6 18 C29.5 22 30 30 32 33 L33 24 Z M48.4 18 C50.5 22 50 30 48 33 L47 24 Z" fill="#3b2a1e" stroke="${INK}" stroke-width=".7"/>
  ${face(25)}
  ${eyes(23.4)}
  <path d="M34.5 29.8 C37 27.6 39 28.6 40 29.4 C41 28.6 43 27.6 45.5 29.8 C43 30.2 41 30.2 40 30 C39 30.2 37 30.2 34.5 29.8 Z" fill="#3b2a1e" stroke="${INK}" stroke-width=".45"/>
  <path d="M38.4 33.6 L40 37 L41.6 33.6 Z" fill="#3b2a1e"/>
  <ellipse cx="40" cy="15.6" rx="17" ry="3.6" fill="${main}" stroke="${INK}" stroke-width=".9"/>
  <path d="M30 15 C30 7 50 7 50 15 Z" fill="${main}" stroke="${INK}" stroke-width=".9"/>
  <path d="M30.4 13.4 C36 15 44 15 49.6 13.4" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <path d="M47 10 C52 1 61 0 66 4 C60 4.6 54 7.4 49.4 12.6 Z" fill="${GOLD}" stroke="${INK}" stroke-width=".7"/>
  <path d="M49.4 10.6 C54 5.6 59 3.4 64 3.8" fill="none" stroke="${INK}" stroke-width=".4"/>
  <path d="M60 51 c3 -3 6 -3 8 -1 c-1 3 -5 4 -8 1 Z" fill="${SKIN}" stroke="${INK}" stroke-width=".7"/>
  <line x1="66" y1="51" x2="70" y2="26" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="66" y1="51" x2="70" y2="26" stroke="#cfd6dd" stroke-width=".9" stroke-linecap="round"/>
  <path d="M62.4 49.4 h7.6" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round"/>
  ${suitMark(sym, 16, 52, 9, symColor)}`;
}

// rank: 5 = Bauer/Under, 6 = Dame/Ober, 7 = König
export function faceSVG(rank, suit, style, sym, symColor) {
  const [main, second] = ROBES[style === 'de' ? 'de' : 'fr'][suit];
  let draw;
  if (rank === 7) draw = king;
  else if (rank === 6) draw = style === 'de' ? ober : queen;
  else draw = jack;
  const half = draw(main, second, sym, symColor);
  return `<div class="court" style="--frame:${main}">
    <svg class="figure" viewBox="0 0 80 120" preserveAspectRatio="none" aria-hidden="true">
      <g>${half}</g>
      <g transform="rotate(180 40 60)">${half}</g>
    </svg></div>`;
}
