// Vergleich von Spielstärken: Team 0 (Süd/Nord) gegen Team 1 (Ost/West), gleiche Karten mit
// vertauschten Sitzen, damit Kartenglück sich aufhebt.
// jsc -m scripts/bench.js -- <runden> <stärkeA> <stärkeB>
import { createRng } from '../src/core/rng.js';
import { deal, createRound, chooseMode, playCard, viewFor, currentLegalMoves } from '../src/core/round.js';
import { multiplier } from '../src/core/cards.js';
import { chooseCardAI, chooseModeForView } from '../src/ai/player.js';
import { policyMove } from '../src/ai/policy.js';

const out = typeof print === 'function' ? print : console.log;
const args = globalThis.scriptArgs ?? globalThis.arguments ?? process.argv.slice(2);
const N = +(args[0] || 10);
const A = args[1] || 'stark', B = args[2] || 'random';

// Stärke-Angabe: "stark", "mittel", "random" oder z. B. "mittel:push=10"
function act(spec, r, seat, rng) {
  const [level, opt] = spec.split(':');
  const extra = opt && opt.startsWith('push=') ? { pushThreshold: +opt.slice(5) } : {};
  const v = viewFor(r, seat);
  if (r.phase === 'choose') {
    if (level === 'random') return { mode: r.pushed ? rng.int(6) : 'push' };
    return { mode: chooseModeForView(v, { multipliers: true, level }, { seed: rng.int(1e9), ...extra }).choice };
  }
  if (level === 'random') { const m = currentLegalMoves(r); return { card: m[rng.int(m.length)] }; }
  return { card: chooseCardAI(v, { level, convention: 'anziehen' }, { seed: rng.int(1e9) }).card };
}

function playRound(hands, ansager, levels, rng) {
  const r = createRound(hands, ansager);
  while (r.phase === 'choose') chooseMode(r, r.toAct, act(levels[r.toAct % 2], r, r.toAct, rng).mode);
  while (r.phase === 'play') playCard(r, r.toAct, act(levels[r.toAct % 2], r, r.toAct, rng).card);
  const m = multiplier(r.mode);
  return [0, 1].map((t) => (r.cardPoints[t] + r.weisPoints[t] + r.stoeckPoints[t]) * m);
}

const rng = createRng(2024);
let a = 0, b = 0, t0 = Date.now();
for (let i = 0; i < N; i++) {
  const hands = deal(rng);
  const ans = i % 4;
  const s1 = playRound(hands, ans, [A, B], rng);
  const s2 = playRound(hands, ans, [B, A], rng);
  a += s1[0] + s2[1];
  b += s1[1] + s2[0];
}
out(`${A}: ${a}  ${B}: ${b}  Anteil ${A}: ${(100 * a / (a + b)).toFixed(1)}%  (${N} Kartenverteilungen, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
