// Gezeichnete Bildkarten im Stil der Schweizer Jasskarten (französisches Bild):
// König mit Schwert und Reichsapfel, Dame mit Rose, Bauer mit Federbarett und Hellebarde.
// Doppelköpfig: obere Hälfte + um 180° gedrehte Kopie.
// Koordinaten: viewBox 0 0 100 150, eine Hälfte zeichnet in y = 0..75.
//
// Die Köpfe können durch Portrait-Fotos ersetzt werden (Einstellungen → Portraits):
// Der Kopf sitzt immer an derselben Stelle (Ellipse um 50/28) und wird in head() gezeichnet;
// mit Portrait entfallen gezeichnete Haare, Bart und Schnauz.

const INK = '#1c1a18';
const SKIN = '#f6d6b9';
const RED = '#e3342f';
const BLUE = '#2b6cc4';
const LIGHT = '#b9d3f0';
const YELLOW = '#f4c20d';
const GREEN = '#1f8a4c';
const WHITE = '#fffdf8';
const STEEL = '#c9d6e3';

// Farbvarianten je Farbe, damit sich die vier Könige (Damen, Bauern) unterscheiden
const PALETTES = [
  { cape: RED, coat: LIGHT, accent: YELLOW, trim: BLUE }, // ♦ / Schellen
  { cape: RED, coat: BLUE, accent: YELLOW, trim: GREEN }, // ♥ / Rosen
  { cape: BLUE, coat: LIGHT, accent: YELLOW, trim: RED }, // ♠ / Schilten
  { cape: GREEN, coat: LIGHT, accent: YELLOW, trim: RED }, // ♣ / Eicheln
];

const S = (w = 0.9) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"`;

// Portrait (Data-URL) der Figur, die gerade gezeichnet wird; null = gezeichneter Kopf.
let PORTRAIT = null;
let clipId = 0;
const noPortrait = (svg) => (PORTRAIT ? '' : svg);

function head({ hair = '#d8c39c', mouth = '#c8102e', cy = 28 } = {}) {
  if (PORTRAIT) {
    const id = `ph${++clipId}`;
    return `
  <clipPath id="${id}"><ellipse cx="50" cy="31" rx="15.6" ry="19.2"/></clipPath>
  <ellipse cx="50" cy="31" rx="15.6" ry="19.2" fill="${SKIN}"/>
  <image href="${PORTRAIT}" x="34.4" y="11.8" width="31.2" height="38.4" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
  <ellipse cx="50" cy="31" rx="15.6" ry="19.2" fill="none" ${S(1)}/>`;
  }
  return `
  <ellipse cx="50" cy="${cy}" rx="10.8" ry="13.2" fill="${SKIN}" ${S()}/>
  <path d="M42.6 ${cy - 4.6} q2.4 -1.6 4.8 0 M52.6 ${cy - 4.6} q2.4 -1.6 4.8 0" stroke="${hair}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <ellipse cx="45.2" cy="${cy - 1.6}" rx="1.5" ry="1.1" fill="${INK}"/>
  <ellipse cx="54.8" cy="${cy - 1.6}" rx="1.5" ry="1.1" fill="${INK}"/>
  <path d="M50.4 ${cy - 1.4} q-2.6 5.2 -.4 6.2 q1.2 .4 2 -.2" stroke="${INK}" stroke-width=".7" fill="none" stroke-linecap="round"/>
  <path d="M47.4 ${cy + 8} q2.6 1.4 5.2 0" stroke="${mouth}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
}

const hand = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3.4" fill="${SKIN}" ${S(0.7)}/>`;

function king(p, mark) {
  const hair = '#cdb48c';
  return `
  <path d="M11 75 C13 57 24 48 35 46 L65 46 C76 48 87 57 89 75 Z" fill="${p.cape}" ${S(1)}/>
  <path d="M11 75 C14 68 24 65 34 67 L34 75 Z M89 75 C86 68 76 65 66 67 L66 75 Z" fill="${p.trim}" ${S(0.8)}/>
  <path d="M36 46 L64 46 L61 75 L39 75 Z" fill="${p.coat}" ${S(0.9)}/>
  <path d="M38 64 h24 M38.6 69 h22.8" stroke="${RED}" stroke-width="1.4"/>
  ${noPortrait(`<path d="M33 17 C27 28 29 40 35 46 L65 46 C71 40 73 28 67 17 Z" fill="${hair}" ${S(0.8)}/>`)}
  <path d="M39 45 L50 51 L61 45 L59 41 L41 41 Z" fill="${WHITE}" ${S(0.8)}/>
  ${head({ hair: '#9b7d55' })}
  ${noPortrait(`<path d="M39 31 C39 45 44 50 50 50 C56 50 61 45 61 31 C57 37 43 37 39 31 Z" fill="${hair}" ${S(0.8)}/>
  <path d="M44.6 35.6 C47 34 49 34.6 50 35.4 C51 34.6 53 34 55.4 35.6 C53 36.6 51 36.4 50 36.2 C49 36.4 47 36.6 44.6 35.6 Z" fill="#9b7d55"/>`)}
  <path d="M38 47 Q50 64 62 47" fill="none" stroke="${WHITE}" stroke-width="1.8"/>
  <path d="M38 47 Q50 64 62 47" fill="none" stroke="${INK}" stroke-width=".4"/>
  <rect x="45" y="55" width="10" height="9" rx="1.5" fill="${YELLOW}" ${S(0.7)}/>
  ${mark(50, 59.5, 6)}
  <path d="M36 15 C36 3 64 3 64 15 Z" fill="${YELLOW}" ${S(0.9)}/>
  <rect x="32.5" y="12.6" width="35" height="5.6" rx="1" fill="${RED}" ${S(0.8)}/>
  <path d="M33.5 17.4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4" fill="none" stroke="${YELLOW}" stroke-width="1"/>
  <circle cx="32.6" cy="15.4" r="2.2" fill="${RED}" ${S(0.6)}/><circle cx="67.4" cy="15.4" r="2.2" fill="${RED}" ${S(0.6)}/>
  <circle cx="21" cy="60" r="9.5" fill="${LIGHT}" ${S(0.9)}/>
  <path d="M21 50.5 v19 M11.5 60 h19" stroke="${YELLOW}" stroke-width="3.2"/>
  <path d="M21 50.5 v19 M11.5 60 h19" stroke="${RED}" stroke-width=".9"/>
  <path d="M19.2 45 h3.6 v-3 h2.6 v-3.6 h-2.6 v-3 h-3.6 v3 h-2.6 v3.6 h2.6 Z" fill="${YELLOW}" ${S(0.6)}/>
  ${hand(22, 71)}
  <path d="M79.6 3 L82.4 9 L82.4 57 L76.8 57 L76.8 9 Z" fill="${STEEL}" ${S(0.8)}/>
  <path d="M79.6 9 v47" stroke="${INK}" stroke-width=".4"/>
  <rect x="71" y="57" width="17.2" height="3.4" rx="1.2" fill="${YELLOW}" ${S(0.7)}/>
  <rect x="77.6" y="60" width="4" height="8" fill="${YELLOW}" ${S(0.6)}/>
  ${hand(79.6, 67)}`;
}

function queen(p, mark) {
  const hair = '#d2c6ad';
  const curls = [[37.5, 22], [36.4, 29.5], [38, 37], [62.5, 22], [63.6, 29.5], [62, 37]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.3" fill="${hair}" ${S(0.6)}/><path d="M${x - 2} ${y} a2 2 0 1 1 2 2" fill="none" stroke="${INK}" stroke-width=".4"/>`).join('');
  return `
  <path d="M12 75 C14 58 25 49 36 47 L64 47 C75 49 86 58 88 75 Z" fill="${p.cape}" ${S(1)}/>
  <path d="M14 75 C16 63 23 57 31 57 L35 75 Z M86 75 C84 63 77 57 69 57 L65 75 Z" fill="${YELLOW}" ${S(0.8)}/>
  <path d="M18 75 C20 67 24 62 29 61 M82 75 C80 67 76 62 71 61" fill="none" stroke="${GREEN}" stroke-width="2"/>
  <path d="M34 50 L66 50 L64 75 L36 75 Z" fill="${p.coat === LIGHT ? BLUE : p.coat}" ${S(0.9)}/>
  <path d="M38 52 v23 M44 52 v23 M50 52 v23 M56 52 v23 M62 52 v23" stroke="${INK}" stroke-width=".35" opacity=".6"/>
  <path d="M36 47 C40 56 60 56 64 47 L60 43 L40 43 Z" fill="${SKIN}" ${S(0.8)}/>
  <path d="M35 52.6 l2.6 2.6 l2.6 -2.6 l2.6 2.6 l2.6 -2.6 l2.6 2.6 l2.6 -2.6 l2.6 2.6 l2.6 -2.6 l2.6 2.6 l2.6 -2.6 l2.6 2.6" fill="none" stroke="${WHITE}" stroke-width="2.2"/>
  <path d="M41 45 Q50 51 59 45" fill="none" stroke="${RED}" stroke-width="1.6" stroke-dasharray="1.4 1"/>
  ${curls}
  ${head({ hair: '#8a7a5c' })}
  <path d="M38.6 20 C40 11 60 11 61.4 20 C56 16 44 16 38.6 20 Z" fill="${hair}" ${S(0.7)}/>
  <path d="M41 12.6 L41.4 6 L45.6 9.4 L50 3.4 L54.4 9.4 L58.6 6 L59 12.6 Z" fill="${YELLOW}" ${S(0.8)}/>
  <circle cx="50" cy="2.6" r="1.6" fill="${YELLOW}" ${S(0.5)}/>
  <rect x="36" y="69.6" width="28" height="4.4" fill="${RED}" ${S(0.7)}/>
  <ellipse cx="50" cy="71.8" rx="3" ry="2.6" fill="${YELLOW}" ${S(0.6)}/>
  <path d="M77 54 L72 34" stroke="${GREEN}" stroke-width="1.6"/>
  <path d="M74.4 44 c4 -3 7 -2 8 1 c-3 2 -6 2 -8 -1 Z M73.6 40 c-4 -2.6 -7 -1.6 -7.6 1 c3 1.6 6 1.4 7.6 -1 Z" fill="${GREEN}" ${S(0.5)}/>
  <circle cx="71.4" cy="31" r="4.6" fill="${RED}" ${S(0.7)}/>
  <path d="M71.4 31 m-2.4 0 a2.4 2.4 0 1 1 2.4 2.4 a1.4 1.4 0 1 1 -1.2 -1.6" fill="none" stroke="${INK}" stroke-width=".5"/>
  ${hand(77.5, 56)}
  ${mark(24, 66, 7)}`;
}

function jack(p, mark) {
  const hair = '#e2c78f';
  return `
  <path d="M11 75 C13 57 24 48 35 46 L65 46 C76 48 87 57 89 75 Z" fill="${p.cape}" ${S(1)}/>
  <path d="M17 63 C24 53 33 48 40 48 L37 55 C31 56 25 61 21 68 Z" fill="${YELLOW}" ${S(0.8)}/>
  <path d="M83 63 C76 53 67 48 60 48 L63 55 C69 56 75 61 79 68 Z" fill="${YELLOW}" ${S(0.8)}/>
  <path d="M11 75 C14 69 21 66 29 68 L27 75 Z M89 75 C86 69 79 66 71 68 L73 75 Z" fill="${p.trim === GREEN ? BLUE : p.trim}" ${S(0.8)}/>
  <path d="M40 46 L60 46 L58 75 L42 75 Z" fill="${p.coat === BLUE ? LIGHT : p.coat}" ${S(0.9)}/>
  <rect x="48" y="51" width="4" height="24" fill="${YELLOW}" ${S(0.5)}/>
  ${noPortrait(`<path d="M34 19 C29 29 30 41 36 46 L41 31 Z M66 19 C71 29 70 41 64 46 L59 31 Z" fill="${hair}" ${S(0.8)}/>`)}
  <path d="M39 45 L50 50 L61 45 L59 41 L41 41 Z" fill="${WHITE}" ${S(0.8)}/>
  ${head({ hair: '#a8864e' })}
  ${noPortrait(`<path d="M43 34 C46 32 48.6 32.6 50 33.8 C51.4 32.6 54 32 57 34 C54 35.4 52 35.2 50 34.8 C48 35.2 46 35.4 43 34 Z" fill="${hair}" ${S(0.4)}/>
  <path d="M47.6 37.6 L50 45 L52.4 37.6 Z" fill="${hair}" ${S(0.4)}/>`)}
  <path d="M31 18 C28 7 67 4 71 13 C65 19 38 20 31 18 Z" fill="${BLUE}" ${S(0.9)}/>
  <path d="M32 17 C42 20.4 61 19.4 70 14" fill="none" stroke="${RED}" stroke-width="2.2"/>
  <path d="M64 12 C69 2 77 3 76 17 C73 10 69 9.6 64 12 Z" fill="${RED}" ${S(0.7)}/>
  <path d="M66 12 C70 6 74 6 75 13" fill="none" stroke="${YELLOW}" stroke-width="1.6"/>
  <path d="M80.6 72 V12" stroke="${INK}" stroke-width="3"/>
  <path d="M80.6 72 V12" stroke="${STEEL}" stroke-width="1.6"/>
  <path d="M80.6 2 L83.4 12 L77.8 12 Z" fill="${STEEL}" ${S(0.7)}/>
  <path d="M81 16 C90 12 93 25 88 31 C88 25 86 22.6 81 24 Z" fill="${LIGHT}" ${S(0.8)}/>
  <path d="M80.2 17 C74 15 72 22 74.6 26 C75.6 22.6 77.4 21.4 80.2 22 Z" fill="${LIGHT}" ${S(0.7)}/>
  ${mark(86, 23.6, 4)}
  ${hand(80.6, 56)}
  ${hand(44, 64)}`;
}

// Ober (deutschschweizer Bild, nach Foto): junger Mann mit Zipfelmütze, Pfeife mit Rauch,
// roter Weste, blauen Ärmeln und Stock
function ober(p, mark) {
  const hair = '#d9b25a';
  return `
  <path d="M14 75 C15 58 24 49 34 47 L66 47 C76 49 85 58 86 75 Z" fill="${BLUE}" ${S(1)}/>
  <path d="M34 47 L66 47 L64 75 L36 75 Z" fill="${RED}" ${S(0.9)}/>
  <path d="M38 50 v25 M44 50 v25 M50 50 v25 M56 50 v25 M62 50 v25" stroke="${INK}" stroke-width=".4" opacity=".55"/>
  <path d="M36 66 L64 66 L64 73 L36 73 Z" fill="${YELLOW}" ${S(0.7)}/>
  <path d="M38 69.5 l3 -2.4 l0 4.8 l3 -2.4 l3 -2.4 l0 4.8 l3 -2.4 l3 -2.4 l0 4.8 l3 -2.4 l3 -2.4 l0 4.8 l3 -2.4 l3 -2.4" fill="none" stroke="${INK}" stroke-width=".7"/>
  <path d="M42 46 L50 52 L58 46 L55 43 L45 43 Z" fill="${YELLOW}" ${S(0.7)}/>
  <path d="M52 50 l8 6 l-2 3 l-6 -5 Z" fill="${RED}" ${S(0.6)}/>
  ${noPortrait(`<path d="M37 20 C33 28 34 38 38 43 L42 30 Z M63 20 C67 28 66 38 62 43 L58 30 Z" fill="${hair}" ${S(0.7)}/>`)}
  ${head({ hair: '#8a6a2a' })}
  <path d="M35 21 C34 9 48 4 60 8 C70 11 72 18 70 22 Z" fill="${YELLOW}" ${S(0.9)}/>
  <path d="M36 15 C30 8 22 8 18 14 C22 13 27 14 31 18 Z" fill="${BLUE}" ${S(0.8)}/>
  <path d="M18 14 l-2 6 l3 -1 l1 4 l2 -6 Z" fill="${YELLOW}" ${S(0.6)}/>
  <rect x="34" y="18.5" width="36" height="6" rx="2" fill="${RED}" ${S(0.8)}/>
  <path d="M37 19 v5 M40 19 v5 M43 19 v5 M46 19 v5 M49 19 v5 M52 19 v5 M55 19 v5 M58 19 v5 M61 19 v5 M64 19 v5 M67 19 v5" stroke="${INK}" stroke-width=".5"/>
  <path d="M57 36 L76 46" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M74 44 l6 1 l-1 6 c-3 1 -5 -1 -5 -3 Z" fill="${YELLOW}" ${S(0.6)}/>
  <path d="M62 33 c4 -6 10 -4 10 -9 c4 0 7 -4 4 -8 c3 -3 -1 -7 -5 -5" fill="none" stroke="${INK}" stroke-width=".7"/>
  ${hand(74, 52)}
  <path d="M16 72 L84 46" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <path d="M16 72 L84 46" stroke="#f4f1e6" stroke-width="2.6" stroke-linecap="round"/>`;
}

// rank: 5 = Bauer/Under, 6 = Dame/Ober, 7 = König. mark(x, y, size) zeichnet das Farbzeichen.
// portrait: Data-URL eines Fotos für den Kopf oder null.
export function figureSVG(rank, suit, style, mark, portrait = null) {
  const p = PALETTES[suit];
  let draw;
  if (rank === 7) draw = king;
  else if (rank === 6) draw = style === 'de' ? ober : queen;
  else draw = jack;
  PORTRAIT = portrait;
  const top = draw(p, mark);
  const bottom = draw(p, mark); // eigene clipPath-IDs für die gedrehte Hälfte
  PORTRAIT = null;
  return `<svg class="figure" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
    <g>${top}</g><g transform="rotate(180 50 75)">${bottom}</g>
    <line x1="2" y1="75" x2="98" y2="75" stroke="${INK}" stroke-width="1"/>
  </svg>`;
}
