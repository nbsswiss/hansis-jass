// Computer-Spieler: wählt Spielart und Karten nur aus der eigenen Sicht (viewFor).
import { legalMoves } from '../core/rules.js';
import { createRng } from '../core/rng.js';
import { buildKnowledge } from './knowledge.js';
import { sampleHands, sampleWeight } from './sampler.js';
import { makeState, moveValue } from './search.js';
import { strategicBonus, explainMove } from './strategy.js';
import { chooseModeAI } from './bidding.js';

export const LEVELS = {
  // exactCards: ab so wenigen Restkarten (alle Hände) wird exakt gerechnet.
  stark: { minSamples: 30, maxSamples: 400, timeMs: 600, exactCards: 20, minExactSamples: 12, bidSamples: 60 },
  mittel: { minSamples: 6, maxSamples: 12, timeMs: 100, exactCards: 8, minExactSamples: 6, bidSamples: 12 },
};

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function chooseCardAI(view, settings, opts = {}) {
  const level = { ...LEVELS[settings.level || 'stark'], ...opts };
  const legal = legalMoves(view.hand, view.trick, view.mode);
  const k = buildKnowledge(view);
  const convention = settings.convention || 'anziehen';
  if (legal.length === 1) {
    return { card: legal[0], reason: explainMove(view, k, legal[0], convention), values: null };
  }
  const rng = createRng(opts.seed ?? ((Date.now() ^ view.hand.length * 7919) >>> 0));
  const team = view.seat % 2;
  const remaining = view.handSizes.reduce((a, b) => a + b, 0);
  const exact = remaining <= level.exactCards;
  const totals = new Map(legal.map((c) => [c, 0]));
  let weightSum = 0, n = 0;
  const t0 = now();
  const maxSamples = exact && remaining <= 8 ? Math.min(level.maxSamples, 40) : level.maxSamples;
  const minSamples = Math.min(maxSamples, exact ? level.minExactSamples : level.minSamples);
  while (n < maxSamples && (n < minSamples || now() - t0 < level.timeMs)) {
    const hands = sampleHands(view, k, rng);
    hands[view.seat] = view.hand.slice();
    const w = sampleWeight(view, k, hands, convention);
    const st = makeState(hands, view);
    for (const c of legal) totals.set(c, totals.get(c) + w * moveValue(st, c, team, exact));
    weightSum += w;
    n++;
  }
  let best = legal[0], bestScore = -1e9;
  const values = {};
  for (const c of legal) {
    const v = totals.get(c) / weightSum;
    const score = v + strategicBonus(view, k, c, convention);
    values[c] = { value: v, score };
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return { card: best, reason: explainMove(view, k, best, convention), values, samples: n, ms: Math.round(now() - t0) };
}

export function chooseModeForView(view, settings, opts = {}) {
  const level = LEVELS[settings.level || 'stark'];
  return chooseModeAI(view, settings, { samples: level.bidSamples, ...opts });
}

// Einheitlicher Einstieg für Worker und Tests.
export function decide(kind, view, settings, opts) {
  return kind === 'mode' ? chooseModeForView(view, settings, opts) : chooseCardAI(view, settings, opts);
}
