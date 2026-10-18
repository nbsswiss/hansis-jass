// Deutschschweizer Jasskarten (Vorlage: Fotos der Spielerin): Schellen, Rosen, Schilten, Eicheln.
// Farbzeichen als SVG (viewBox 0 0 100 100), Zahlen in den Ecken innerhalb eines feinen Rahmens,
// Bildkarten mit „UNDER“ / „OBER“ / „KÖNIG“, Banner (10) als Fahne.

const INK = '#141414';
const YELLOW = '#f5c518';
const RED = '#e3392c';
const GREEN = '#1f7a3d';
const S = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"`;

// Schelle: gelbe Kugel mit rot-schwarzem Band, Schlitz und Öse
function schelle() {
  return `
  <circle cx="50" cy="12" r="6.5" fill="none" stroke="${RED}" stroke-width="3.4"/>
  <circle cx="50" cy="12" r="6.5" fill="none" stroke="${INK}" stroke-width=".8"/>
  <circle cx="50" cy="55" r="40" fill="${YELLOW}" ${S(2.6)}/>
  <path d="M18 44 C22 30 34 20 46 18 M16 56 C16 40 26 26 40 20 M20 72 C14 60 14 44 22 32" stroke="${INK}" stroke-width="1.4" fill="none" opacity=".55"/>
  <g transform="rotate(-28 50 55)">
    <path d="M11 47 Q50 30 89 47 L89 59 Q50 42 11 59 Z" fill="${INK}"/>
    <path d="M11 51 Q50 34 89 51" stroke="${RED}" stroke-width="3" fill="none"/>
    <path d="M11 57 Q50 40 89 57" stroke="${RED}" stroke-width="2" fill="none"/>
  </g>
  <circle cx="62" cy="74" r="5.6" fill="${INK}"/>
  <path d="M63 74 c7 4 7 11 1 17" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
}

// Rose: acht gelbe Blütenblätter, schwarze Kelchblätter, roter Kern
function rose() {
  const star = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const r = i % 2 ? 36 : 48;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  const petals = Array.from({ length: 8 }, (_, i) =>
    `<ellipse cx="50" cy="25" rx="11.5" ry="17" fill="${YELLOW}" ${S(2)} transform="rotate(${i * 45} 50 50)"/>`
    + `<path d="M50 14 v14 M46 17 q4 6 0 12 M54 17 q-4 6 0 12" stroke="${INK}" stroke-width=".8" fill="none" transform="rotate(${i * 45} 50 50)" opacity=".7"/>`).join('');
  return `
  <polygon points="${star}" fill="${INK}"/>
  ${petals}
  <circle cx="50" cy="50" r="15" fill="${RED}" ${S(2)}/>
  <path d="M41 46 a10 10 0 0 1 12 -6 M42 51 a9 9 0 0 1 8 -8" stroke="${INK}" stroke-width="1" fill="none" opacity=".6"/>`;
}

// Schilt: schwarz-weisses Wappen, Muster je nach Variante
function schilt(v = 0) {
  const shape = 'M14 8 H86 V60 L50 95 L14 60 Z';
  const id = `sc${Math.random().toString(36).slice(2, 8)}`;
  const patterns = [
    // Schrägbalken mit Kreuz
    `<path d="M14 8 H50 L14 44 Z" fill="${INK}"/><path d="M36 95 L86 30 V60 Z M86 8 V20 L24 95 H14 V84 Z" fill="${INK}"/>
     <path d="M60 64 h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 Z" fill="#fff"/>`,
    // geviert
    `<rect x="14" y="8" width="36" height="30" fill="${INK}"/><rect x="50" y="38" width="36" height="60" fill="${INK}"/>
     <path d="M18 46 h28 M18 52 h28 M18 58 h28" stroke="${INK}" stroke-width="2"/><path d="M56 14 v20 M62 14 v20 M68 14 v20 M74 14 v20 M80 14 v20" stroke="${INK}" stroke-width="2"/>`,
    // Pfahl mit Wellenlinie
    `<rect x="14" y="8" width="72" height="90" fill="${INK}"/><path d="M42 8 C52 28 34 44 46 62 C54 74 44 86 50 95 L60 82 C54 70 64 58 56 46 C48 32 60 20 54 8 Z" fill="#fff"/>
     <path d="M20 40 h14 M20 48 h14" stroke="#fff" stroke-width="4"/>`,
    // Kreuz mit Scheibe
    `<rect x="14" y="8" width="72" height="90" fill="#fff"/><path d="M43 8 H57 V95 H43 Z M14 40 H86 V54 H14 Z" fill="${INK}"/>
     <circle cx="50" cy="47" r="10" fill="#fff" ${S(2)}/><path d="M20 14 l10 10 M30 14 l-10 10 M70 14 l10 10 M80 14 l-10 10" stroke="${INK}" stroke-width="3"/>`,
    // Balken gestreift
    `<path d="M14 8 H86 V30 H14 Z" fill="${INK}"/><path d="M18 36 h64 M18 41 h64" stroke="${INK}" stroke-width="2.4"/>
     <path d="M22 50 v40 M30 50 v40 M38 50 v40 M46 50 v40 M54 50 v40 M62 50 v40 M70 50 v40 M78 50 v40" stroke="${INK}" stroke-width="2"/>
     <path d="M50 12 c-6 4 -6 10 0 14 c6 -4 6 -10 0 -14 Z" fill="#fff"/>`,
  ];
  return `
  <clipPath id="${id}"><path d="${shape}"/></clipPath>
  <path d="${shape}" fill="#fff"/>
  <g clip-path="url(#${id})">${patterns[v % patterns.length]}</g>
  <path d="${shape}" fill="none" ${S(3)}/>`;
}

// Eichel: gelbe Frucht oben, grüner Becher mit Gitter unten, Stiel
function eichel() {
  const id = `ei${Math.random().toString(36).slice(2, 8)}`;
  return `
  <path d="M28 54 C26 26 36 6 50 6 C64 6 74 26 72 54 Z" fill="${YELLOW}" ${S(2.4)}/>
  <path d="M36 14 v38 M43 9 v43 M50 7 v45 M57 9 v43 M64 14 v38" stroke="${INK}" stroke-width="1" opacity=".55"/>
  <clipPath id="${id}"><path d="M22 54 H78 C80 72 68 84 50 84 C32 84 20 72 22 54 Z"/></clipPath>
  <path d="M22 54 H78 C80 72 68 84 50 84 C32 84 20 72 22 54 Z" fill="${GREEN}"/>
  <g clip-path="url(#${id})" stroke="${INK}" stroke-width="1.6">
    <path d="M10 50 L60 100 M22 50 L72 100 M34 50 L84 100 M46 50 L96 100 M-2 50 L48 100"/>
    <path d="M90 50 L40 100 M78 50 L28 100 M66 50 L16 100 M54 50 L4 100 M102 50 L52 100"/>
  </g>
  <path d="M22 54 H78 C80 72 68 84 50 84 C32 84 20 72 22 54 Z" fill="none" ${S(2.4)}/>
  <path d="M50 84 L50 97" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
}

export function deShape(s, variant = 0) {
  if (s === 0) return schelle();
  if (s === 1) return rose();
  if (s === 2) return schilt(variant);
  return eichel();
}

export const deIcon = (s, cls = 'suit-icon', variant = 0) =>
  `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${deShape(s, variant)}</svg>`;

// Pip einer deutschen Karte (ohne Zahl im Zeichen; Zahlen stehen in den Ecken)
function dePip(s, x, y, size, rot, variant) {
  return `<span class="pip${rot ? ' rot' : ''}" style="left:${x}%;top:${y}%;font-size:${size}em">${deIcon(s, 'shape', variant)}</span>`;
}

const L = 28, C = 50, R = 72;
const cols = (ys) => ys.flatMap((y) => [[L, y], [R, y]]);
// Pip-Anordnung der Zahlenkarten (auch für das französische Bild verwendet)
export const NUM_LAYOUT = {
  0: { size: 0.28, pts: cols([24, 50, 76]) },
  1: { size: 0.27, pts: [...cols([24, 50, 76]), [C, 37]] },
  2: { size: 0.26, pts: [...cols([24, 50, 76]), [C, 37], [C, 63]] },
  3: { size: 0.24, pts: [...cols([22, 40.6, 59.4, 78]), [C, 50]] },
  4: { size: 0.21, pts: [...cols([25, 41.7, 58.3, 75]), [C, 33.3], [C, 66.7]] },
};
const LAYOUT = NUM_LAYOUT;

export const corners = (text, cls = '') =>
  `<span class="dl tl ${cls}">${text}</span><span class="dl tr ${cls}">${text}</span>`
  + `<span class="dl bl ${cls}">${text}</span><span class="dl br ${cls}">${text}</span>`;

function banner(s) {
  return `<svg class="banner" viewBox="0 0 100 150" aria-hidden="true">
    <path d="M30 10 V142" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="30" cy="8" r="4" fill="${YELLOW}" ${S(1.4)}/>
    <path d="M31 18 C52 12 70 26 92 18 V92 C70 100 52 86 31 92 Z" fill="${s === 2 ? '#fff' : s === 1 ? '#fdf6dc' : '#fffbe8'}" ${S(2)}/>
    <path d="M31 18 C52 12 70 26 92 18 V30 C70 38 52 24 31 30 Z" fill="${RED}"/>
    <path d="M31 80 C52 74 70 88 92 80 V92 C70 100 52 86 31 92 Z" fill="${RED}"/>
    <g transform="translate(43 34) scale(.38)">${deShape(s, 3)}</g>
  </svg>`;
}

const FACE_LABEL = { 5: 'UNDER', 6: 'OBER', 7: 'KÖNIG', 8: 'ASS' };
export const words = (text) => `<span class="dw tl">${text}</span><span class="dw br">${text}</span>`;

// Inhalt einer deutschen Karte; figure(r) liefert das Figuren-SVG für Under/Ober/König.
export function deCardInner(s, r, figure) {
  if (r <= 3) {
    const { size, pts } = LAYOUT[r];
    return `<div class="frame de-frame"></div>${corners(String(r + 6))}`
      + pts.map(([x, y], i) => dePip(s, x, y, size, y > 50 && s !== 2 && s !== 3 ? true : false, i)).join('');
  }
  if (r === 4) return `<div class="frame de-frame"></div>${corners('10')}<div class="banner-wrap">${banner(s)}</div>`;
  if (r === 8) {
    return `<div class="frame de-frame"></div><span class="dw tl">ASS</span><span class="dw br">ASS</span>`
      + dePip(s, 50, 50, 0.6, false, 1);
  }
  return `<div class="frame de-frame"><div class="fig">${figure()}</div></div>`
    + `<span class="dw tl">${FACE_LABEL[r]}</span><span class="dw br">${FACE_LABEL[r]}</span>`
    + dePip(s, 24, 25, 0.24, false, 0) + dePip(s, 82, 9.5, 0.12, false, 1)
    + dePip(s, 76, 75, 0.24, true, 2) + dePip(s, 18, 90.5, 0.12, true, 3);
}
