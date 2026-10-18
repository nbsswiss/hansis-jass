// Eine Partie: mehrere Runden bis zur Zielpunktzahl (docs/regeln.md, Abschnitt 8 und 9).
// Der ganze Zustand ist reines JSON, damit er in localStorage gespeichert werden kann.
import { createRng } from './rng.js';
import { multiplier } from './cards.js';
import { deal, firstAnsager, createRound, chooseMode, playCard } from './round.js';

export const DEFAULT_SETTINGS = {
  target: 2500,
  multipliers: true,
  convention: 'anziehen', // oder 'verwerfen' (docs/strategie.md, Abschnitt 1)
  cardStyle: 'fr', // 'fr' = französisch, 'de' = deutschschweizer Bild
  speed: 'normal',
};

export function createGame(settings = {}, seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0) {
  return {
    settings: { ...DEFAULT_SETTINGS, ...settings },
    seed,
    scores: [0, 0],
    roundNo: 0,
    ansager: -1,
    round: null,
    history: [],
    winner: null,
  };
}

export function startRound(game) {
  if (game.winner !== null) throw new Error('Partie ist beendet');
  const hands = deal(createRng(game.seed + game.roundNo * 7919 + 1));
  game.ansager = game.roundNo === 0 ? firstAnsager(hands) : (game.ansager + 1) % 4;
  game.round = createRound(hands, game.ansager);
  game.roundNo += 1;
  return [{ type: 'roundStart', ansager: game.ansager, roundNo: game.roundNo }];
}

export const roundMultiplier = (game) =>
  game.round && game.round.mode !== null ? multiplier(game.round.mode, game.settings.multipliers) : 1;

export function gameChoose(game, seat, choice) {
  return chooseMode(game.round, seat, choice);
}

export function gamePlay(game, seat, c) {
  const events = playCard(game.round, seat, c);
  const mult = roundMultiplier(game);
  const out = [];
  for (const ev of events) {
    out.push(ev);
    let team = null, pts = 0;
    if (ev.type === 'stoeck' || ev.type === 'weis' || ev.type === 'trick' || ev.type === 'match') {
      team = ev.team;
      pts = ev.points * mult;
    }
    if (team !== null && game.winner === null) {
      game.scores[team] += pts;
      if (game.scores[team] >= game.settings.target) {
        game.winner = team;
        out.push({ type: 'gameEnd', winner: team, scores: game.scores.slice() });
      }
    }
    if (ev.type === 'roundEnd') {
      game.history.push({ ...ev.summary, multiplier: mult, totals: totalsOf(ev.summary, mult) });
    }
  }
  if (game.winner !== null && game.round.phase !== 'done') {
    game.round.phase = 'done';
    game.history.push({ aborted: true, mode: game.round.mode, multiplier: mult });
  }
  return out;
}

function totalsOf(summary, mult) {
  return summary.teams.map((t) => (t.cards + t.weis + t.stoeck) * mult);
}
