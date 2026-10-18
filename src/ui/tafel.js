// Jasstafel mit Kreide: pro Team ein „Z“. Wie auf der klassischen Schiefertafel:
// oben je ein Strich für 100, auf der Diagonale je ein X für 50, unten je ein Strich für 20,
// der Rest (unter 20) wird als Zahl daneben geschrieben. Je fünf Striche werden gebündelt
// (vier senkrecht, der fünfte quer darüber).

export function scoreParts(score) {
  const twenties = Math.floor((score % 50) / 20);
  return {
    hundreds: Math.floor(score / 100),
    fifties: Math.floor((score % 100) / 50),
    twenties,
    rest: (score % 50) - twenties * 20,
  };
}

// kleine, wiederholbare „Handschrift“-Unregelmässigkeit
const jitter = (i, k = 1) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1) * 1.6;

function tally(count, x0, yLine, up, maxWidth) {
  if (!count) return '';
  const groups = Math.ceil(count / 5);
  const gap = Math.min(10, maxWidth / (count + groups * 0.9));
  let x = x0, out = '';
  for (let i = 0; i < count; i++) {
    const inGroup = i % 5;
    if (inGroup === 4) {
      // fünfter Strich quer über die vier vorherigen
      const xs = x - gap * 4 - 2, xe = x - gap + 2;
      const y1 = up ? yLine - 4 : yLine + 4, y2 = up ? yLine - 18 : yLine + 18;
      out += `<line x1="${xs}" y1="${y1}" x2="${xe}" y2="${y2}"/>`;
      x += gap * 0.9;
    } else {
      const j = jitter(i);
      out += up
        ? `<line x1="${x + j * 0.4}" y1="${yLine - 2}" x2="${x - j * 0.4}" y2="${yLine - 20 + j}"/>`
        : `<line x1="${x + j * 0.4}" y1="${yLine + 2}" x2="${x - j * 0.4}" y2="${yLine + 20 - j}"/>`;
      x += gap;
    }
  }
  return out;
}

export function zSVG(score) {
  const { hundreds, fifties, twenties, rest } = scoreParts(score);
  const W = 320, H = 132, top = 30, bottom = 104, left = 14, right = 300;
  let marks = '';
  marks += tally(hundreds, left + 8, top, true, right - left - 20);
  marks += tally(twenties, left + 8, bottom, false, 120);
  // Fünfziger als X auf der Diagonale
  for (let i = 0; i < fifties; i++) {
    const t = 0.42 + i * 0.16;
    const x = right - (right - left) * t, y = top + (bottom - top) * t;
    marks += `<line x1="${x - 7}" y1="${y - 7}" x2="${x + 7}" y2="${y + 7}"/><line x1="${x + 7}" y1="${y - 7}" x2="${x - 7}" y2="${y + 7}"/>`;
  }
  return `<svg class="zboard" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <g class="chalk">
      <path d="M${left} ${top} L${right} ${top + 1} L${left + 2} ${bottom} L${right} ${bottom - 1}" fill="none"/>
      ${marks}
    </g>
    ${rest ? `<text x="${right - 4}" y="${bottom - 12}" text-anchor="end" class="rest">${rest}</text>` : ''}
  </svg>`;
}

// Zwei Hälften (Wir / Gegner) mit Z, Summe und Ziel
export function tafelHalves(scores, target, names = ['Wir', 'Gegner']) {
  return [0, 1].map((t) => `
    <div class="half">
      <div class="who">${names[t]}</div>
      ${zSVG(scores[t])}
      <div class="sum">${scores[t]}</div>
    </div>`).join('<div class="chalk-line"></div>')
    + `<div class="goal">Ziel ${target} · es fehlen: Wir ${Math.max(0, target - scores[0])}, Gegner ${Math.max(0, target - scores[1])}</div>`;
}
