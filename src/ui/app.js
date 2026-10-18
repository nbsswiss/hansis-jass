// Oberfläche und Spielablauf von Hansis Jass.
import { VERSION, APP_NAME } from '../version.js';
import { tafelHalves } from './tafel.js';
import { createGame, startRound, gameChoose, gamePlay, roundMultiplier, DEFAULT_SETTINGS } from '../core/game.js';
import { viewFor, currentLegalMoves, PUSH } from '../core/round.js';
import { OBE, UNDE, multiplier, modeName, sortHand, SUIT_NAMES } from '../core/cards.js';
import { cardElement, backElement, suitIcon, suitClass, setPortraits, portraitImage, DEFAULT_PORTRAITS } from './cards-view.js';

const NAMES = ['Du', 'Ruedi', 'Vreni', 'Heidi'];
const STORE_GAME = 'hansis-jass-game';
const STORE_SETTINGS = 'hansis-jass-settings';
const STORE_PORTRAITS = 'hansis-jass-portraits';
const SPEEDS = { langsam: 1.6, normal: 1, schnell: 0.5 };

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let settings = loadSettings();
let game = null;
let busy = false; // Animation läuft
let humanResolve = null; // wartet auf Karte oder Ansage der Spielerin
let lastShownTrick = null;

const pace = (ms) => ms * (SPEEDS[settings.speed] || 1);

// ---------------- Speicher ----------------
function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, level: 'stark', felt: 'gruen', ...JSON.parse(localStorage.getItem(STORE_SETTINGS) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS, level: 'stark', felt: 'gruen' };
  }
}
function saveSettings() {
  try { localStorage.setItem(STORE_SETTINGS, JSON.stringify(settings)); } catch { /* privat */ }
}
function saveGame() {
  try { localStorage.setItem(STORE_GAME, JSON.stringify(game)); } catch { /* privat */ }
}
function loadGame() {
  try {
    const g = JSON.parse(localStorage.getItem(STORE_GAME) || 'null');
    return g && g.settings ? g : null;
  } catch {
    return null;
  }
}

// ---------------- Computer-Spieler (Web Worker) ----------------
let worker = null, nextId = 1;
const pending = new Map();
let localDecide = null;
try {
  worker = new Worker(new URL('../ai/worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = (e) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id);
    if (e.data.error) p.reject(new Error(e.data.error)); else p.resolve(e.data.result);
  };
  worker.onerror = () => { worker = null; };
} catch {
  worker = null;
}

async function askAI(kind, view) {
  const aiSettings = { ...game.settings, level: settings.level, convention: game.settings.convention };
  if (worker) {
    try {
      return await new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, kind, view, settings: aiSettings });
      });
    } catch (err) {
      console.warn('Worker-Fehler, rechne lokal', err);
    }
  }
  if (!localDecide) localDecide = (await import('../ai/player.js')).decide;
  return localDecide(kind, view, aiSettings, {});
}

// ---------------- Darstellung ----------------
const style = () => game.settings.cardStyle;
const teamName = (t) => (t === 0 ? 'uns' : 'die Gegner');

// Obenabe = von oben nach unten (Pfeil nach unten), Undeufe = von unten nach oben (Pfeil nach oben)
function modeLabel(mode) {
  if (mode === OBE) return { sym: '<span class="arrow">⬇︎</span>', name: 'Obenabe', cls: 'black' };
  if (mode === UNDE) return { sym: '<span class="arrow">⬆︎</span>', name: 'Undeufe', cls: 'black' };
  return { sym: suitIcon(mode, style()), name: SUIT_NAMES[style()][mode], cls: suitClass(mode, style()) };
}

// Angezeigter Stand: läuft beim Darstellen der Ereignisse dem echten Stand hinterher,
// damit Punkte erst erscheinen, wenn Stich, Weis oder Stöck gezeigt werden.
let shownScores = null;

function renderScores() {
  const sc = shownScores || game.scores;
  for (const t of [0, 1]) {
    $(`score${t}`).textContent = sc[t];
    $(`bar${t}`).style.width = `${Math.min(100, (100 * sc[t]) / game.settings.target)}%`;
  }
  $('target').innerHTML = `Ziel<br><b>${game.settings.target}</b>`;
}

function renderModeInfo() {
  const r = game.round;
  const el = $('modeinfo');
  if (!r) { el.innerHTML = ''; return; }
  if (r.mode === null) {
    el.innerHTML = `<span class="who">Ansage: ${NAMES[r.toAct]}${r.pushed ? ' (geschoben)' : ''}</span>`;
    return;
  }
  const m = modeLabel(r.mode);
  const mult = roundMultiplier(game);
  const kind = r.mode < 4 ? 'Trumpf' : 'Gespielt wird';
  el.innerHTML = `<span class="mode-chip"><span class="kind">${kind}</span><span class="sym">${m.sym}</span>${m.name}${mult > 1 ? ` <span class="mult">×${mult}</span>` : ''}</span>
    <span class="who">gemacht von <b>${r.chooser === 0 ? 'dir' : NAMES[r.chooser]}</b>${r.pushed ? `<br>${r.ansager === 0 ? 'du hast' : `${NAMES[r.ansager]} hat`} geschoben` : ''}</span>`;
}

function renderSeats() {
  const r = game.round;
  for (const seat of [1, 2, 3]) {
    const el = $(`seat${seat}`);
    el.innerHTML = '';
    el.appendChild(playerLabel(seat));
    const backs = document.createElement('div');
    backs.className = 'backs';
    const n = r ? r.hands[seat].length : 0;
    for (let i = 0; i < n; i++) backs.appendChild(backElement());
    el.appendChild(backs);
  }
  const me = $('me-label');
  me.replaceWith(playerLabel(0, 'me-label'));
}

function playerLabel(seat, id) {
  const r = game.round;
  const el = document.createElement('div');
  el.className = `plabel team${seat % 2}`;
  if (id) el.id = id;
  if (r && r.phase !== 'done' && r.toAct === seat) el.classList.add('active');
  let badges = '';
  if (r && r.ansager === seat && (r.mode === null || r.pushed)) badges += `<span class="badge">${r.pushed ? 'geschoben' : 'Ansager'}</span>`;
  if (r && r.mode !== null && r.chooser === seat) {
    const m = modeLabel(r.mode);
    badges += `<span class="badge trumpf">${m.sym} ${r.mode < 4 ? 'Trumpf' : m.name}</span>`;
  }
  el.innerHTML = `<span class="dot"></span>${NAMES[seat]}${seat === 2 ? ' · Partnerin' : ''}${badges}`;
  return el;
}

function renderHand() {
  const r = game.round;
  const hand = $('hand');
  hand.innerHTML = '';
  if (!r) return;
  const cards = r.mode === null ? sortHand(r.hands[0]) : r.hands[0];
  const myTurn = r.phase === 'play' && r.toAct === 0 && humanResolve !== null;
  const legal = myTurn ? new Set(currentLegalMoves(r)) : null;
  hand.classList.toggle('my-turn', myTurn);
  for (const c of cards) {
    const el = cardElement(c, style());
    if (legal) el.classList.add(legal.has(c) ? 'legal' : 'illegal');
    hand.appendChild(el);
  }
  // Überlappung an Anzahl Karten anpassen
  const width = Math.min(window.innerWidth * 0.86, 1100);
  const cardW = parseFloat(getComputedStyle(hand.firstElementChild || hand).width) || 100;
  const n = cards.length;
  const step = n > 1 ? Math.min(cardW * 0.82, (width - cardW) / (n - 1)) : cardW;
  hand.style.setProperty('--overlap', `${step - cardW}px`);
}

function renderTrick() {
  const r = game.round;
  for (const slot of document.querySelectorAll('.slot')) slot.innerHTML = '';
  if (!r) return;
  r.trick.forEach((c, i) => {
    const seat = (r.leader + i) % 4;
    slotOf(seat).appendChild(cardElement(c, style()));
  });
}

function renderRoundPoints() {
  const r = game.round;
  const el = $('roundpts');
  if (!r || r.mode === null) { el.textContent = ''; return; }
  const won = [0, 1].map((t) => r.tricks.filter((x) => x.winner % 2 === t).length);
  el.innerHTML = `Diese Runde<br>Wir: ${r.cardPoints[0]} (${won[0]} Stiche)<br>Gegner: ${r.cardPoints[1]} (${won[1]} Stiche)`;
}

function renderAll() {
  renderScores();
  renderModeInfo();
  renderSeats();
  renderHand();
  renderTrick();
  renderRoundPoints();
  $('btn-last').disabled = !(game.round && game.round.tricks.length);
}

const slotOf = (seat) => document.querySelector(`.slot[data-seat="${seat}"]`);

function seatAnchor(seat) {
  if (seat === 0) return $('hand');
  return $(`seat${seat}`);
}

// Sprechblase bei einem Spieler
function bubble(seat, html, ms = 1800, cls = '') {
  const anchor = seatAnchor(seat).getBoundingClientRect();
  const b = document.createElement('div');
  b.className = `bubble ${cls}`;
  b.innerHTML = html;
  $('table').appendChild(b);
  const bw = b.offsetWidth, bh = b.offsetHeight;
  let x, y;
  if (seat === 0) { x = anchor.left + anchor.width / 2 - bw / 2; y = anchor.top - bh - 8; }
  else if (seat === 2) { x = anchor.right + 10; y = anchor.top + 4; }
  else if (seat === 1) { x = anchor.left - bw - 10; y = anchor.top + anchor.height / 2 - bh / 2; }
  else { x = anchor.right + 10; y = anchor.top + anchor.height / 2 - bh / 2; }
  b.style.left = `${Math.max(8, Math.min(window.innerWidth - bw - 8, x))}px`;
  b.style.top = `${Math.max(8, y)}px`;
  if (ms > 0) setTimeout(() => b.remove(), pace(ms));
  return b;
}

function banner(html, ms = 1800) {
  const el = $('banner');
  el.innerHTML = html;
  el.hidden = false;
  return new Promise((resolve) => setTimeout(() => { el.hidden = true; resolve(); }, pace(ms)));
}

// Karte vom Spieler in die Stichmitte fliegen lassen
async function animatePlay(seat, c, fromEl) {
  const slot = slotOf(seat);
  const el = cardElement(c, style());
  slot.appendChild(el);
  const to = slot.getBoundingClientRect();
  const fromRect = (fromEl || seatAnchor(seat)).getBoundingClientRect();
  const dx = fromRect.left + fromRect.width / 2 - (to.left + to.width / 2);
  const dy = fromRect.top + fromRect.height / 2 - (to.top + to.height / 2);
  const scale = fromEl ? fromRect.width / to.width : 0.5;
  await el.animate(
    [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: fromEl ? 1 : 0.3 }, { transform: 'none', opacity: 1 }],
    { duration: pace(320), easing: 'cubic-bezier(.2,.8,.3,1)' },
  ).finished.catch(() => {});
}

async function animateCollect(winner) {
  const target = seatAnchor(winner).getBoundingClientRect();
  const anims = [];
  for (const slot of document.querySelectorAll('.slot')) {
    const el = slot.firstElementChild;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const dx = target.left + target.width / 2 - (r.left + r.width / 2);
    const dy = target.top + target.height / 2 - (r.top + r.height / 2);
    anims.push(el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 }],
      { duration: pace(380), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {}));
  }
  await Promise.all(anims);
  for (const slot of document.querySelectorAll('.slot')) slot.innerHTML = '';
}

// ---------------- Ereignisse darstellen ----------------
async function present(events, fromEl, scoresBefore) {
  shownScores = scoresBefore ? scoresBefore.slice() : null;
  const mult = roundMultiplier(game);
  for (const ev of events) {
    if (shownScores && ['stoeck', 'weis', 'trick', 'match'].includes(ev.type)) shownScores[ev.team] += ev.points * mult;
    if (ev.type === 'gameEnd') shownScores = null;
    switch (ev.type) {
      case 'push':
        bubble(ev.seat, 'Schiebe!', 1500);
        renderModeInfo(); renderSeats();
        await sleep(pace(700));
        break;
      case 'mode': {
        const m = modeLabel(ev.mode);
        bubble(ev.seat, `${m.sym} ${m.name}`, 1600);
        renderAll();
        await sleep(pace(800));
        break;
      }
      case 'play':
        renderHand();
        renderSeats();
        await animatePlay(ev.seat, ev.card, ev.seat === 0 ? fromEl : null);
        break;
      case 'weisAnnounce':
        bubble(ev.seat, ev.weis.map((w) => `${w.label} <small>${w.points}</small>`).join(''), 2200);
        break;
      case 'stoeck':
        bubble(ev.seat, 'Stöck! <small>20</small>', 2000);
        renderScores();
        await sleep(pace(500));
        break;
      case 'weis': {
        for (const [seat, list] of Object.entries(ev.shown)) {
          const cards = [...new Set(list.flatMap((w) => w.cards))];
          const b = bubble(+seat, `${list.map((w) => w.label).join(' + ')}<div class="mini"></div>`, 3000);
          const mini = b.querySelector('.mini');
          for (const c of cards) mini.appendChild(cardElement(c, style()));
        }
        renderScores();
        await banner(`Weis für ${teamName(ev.team)}: ${ev.points}${mult > 1 ? ` × ${mult} = ${ev.points * mult}` : ''}`, 1900);
        break;
      }
      case 'trick':
        await sleep(pace(ev.winner === 0 ? 900 : 1000));
        lastShownTrick = ev;
        await animateCollect(ev.winner);
        renderScores(); renderRoundPoints(); renderSeats();
        $('btn-last').disabled = false;
        break;
      case 'match':
        await banner(`Match für ${teamName(ev.team)}! <small>+100 Bonus</small>`, 2200);
        break;
      case 'roundEnd':
        renderScores();
        break;
      case 'gameEnd':
        renderScores();
        break;
      default:
        break;
    }
  }
  shownScores = null;
  renderScores();
}

// ---------------- Eingaben der Spielerin ----------------
function waitForCard() {
  return new Promise((resolve) => {
    humanResolve = resolve;
    renderHand();
    renderSeats();
    $('btn-tip').hidden = false;
  });
}

$('hand').addEventListener('click', (e) => {
  const el = e.target.closest('.card');
  if (!el || !humanResolve || busy) return;
  const r = game.round;
  if (r.phase !== 'play' || r.toAct !== 0) return;
  const c = +el.dataset.card;
  if (!currentLegalMoves(r).includes(c)) {
    el.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 200 });
    return;
  }
  const resolve = humanResolve;
  humanResolve = null;
  hideTip();
  resolve({ card: c, el });
});

function waitForMode() {
  return new Promise((resolve) => {
    const r = game.round;
    const box = $('chooser');
    const opts = [0, 1, 2, 3, OBE, UNDE].map((m) => {
      const lab = modeLabel(m);
      const mult = multiplier(m, game.settings.multipliers);
      return `<button class="opt ${lab.cls}" data-mode="${m}"><span class="sym">${lab.sym}</span>${lab.name}${mult > 1 ? `<span class="x">×${mult}</span>` : ''}</button>`;
    }).join('');
    box.innerHTML = `<h2>${r.pushed ? `${NAMES[r.ansager]} hat geschoben – du bestimmst` : 'Du sagst an'}</h2>
      <div class="grid">${opts}</div>
      <div class="row">${r.pushed ? '' : '<button class="btn push" data-mode="push">Schieben</button>'}<button class="btn secondary" data-tip="1">Tipp</button></div>
      <div class="note"></div>`;
    box.hidden = false;
    box.onclick = async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.tip) {
        b.disabled = true;
        box.querySelector('.note').textContent = 'Ich überlege …';
        const res = await askAI('mode', viewFor(game.round, 0));
        b.disabled = false;
        box.querySelectorAll('.opt, .push').forEach((x) => x.classList.remove('hint'));
        const sel = box.querySelector(`[data-mode="${res.choice}"]`);
        if (sel) sel.classList.add('hint');
        box.querySelector('.note').textContent = res.choice === PUSH ? 'Tipp: Schieben' : `Tipp: ${modeName(res.choice, style())}`;
        return;
      }
      box.hidden = true;
      box.onclick = null;
      resolve(b.dataset.mode === 'push' ? PUSH : +b.dataset.mode);
    };
  });
}

// Tipp-Knopf während des Spiels
$('btn-tip').addEventListener('click', async () => {
  if (!humanResolve) return;
  const btn = $('btn-tip');
  btn.disabled = true;
  showTip('Ich überlege …');
  const res = await askAI('card', viewFor(game.round, 0));
  btn.disabled = false;
  if (!humanResolve) return;
  document.querySelectorAll('#hand .card').forEach((el) => el.classList.toggle('hint', +el.dataset.card === res.card));
  showTip(`Tipp: ${res.reason}`);
});

function showTip(text) { const t = $('tipbox'); t.textContent = text; t.hidden = false; }
function hideTip() {
  $('tipbox').hidden = true;
  $('btn-tip').hidden = true;
  document.querySelectorAll('#hand .card.hint').forEach((el) => el.classList.remove('hint'));
}

// ---------------- Spielablauf ----------------
async function aiTurn(seat, kind) {
  const b = bubble(seat, '…', 0, 'thinking');
  const t0 = performance.now();
  const view = viewFor(game.round, seat);
  const res = await askAI(kind, view);
  const minWait = pace(kind === 'mode' ? 900 : 550);
  const left = minWait - (performance.now() - t0);
  if (left > 0) await sleep(left);
  b.remove();
  return res;
}

async function loop() {
  for (;;) {
    if (game.winner !== null) { await showGameEnd(); return; }
    if (!game.round || game.round.phase === 'done') {
      if (game.round) await showRoundSummary();
      startRound(game);
      saveGame();
      renderAll();
      await banner(`Runde ${game.roundNo} · ${NAMES[game.ansager]} sagt an`, 1300);
      continue;
    }
    const r = game.round;
    const seat = r.toAct;
    busy = false;
    if (r.phase === 'choose') {
      renderAll();
      const choice = seat === 0 ? await waitForMode() : (await aiTurn(seat, 'mode')).choice;
      busy = true;
      const events = gameChoose(game, seat, choice);
      saveGame();
      await present(events);
    } else {
      let cardPlayed, fromEl = null;
      if (seat === 0) {
        const { card: c, el } = await waitForCard();
        cardPlayed = c;
        fromEl = el;
      } else {
        renderSeats();
        cardPlayed = (await aiTurn(seat, 'card')).card;
      }
      busy = true;
      // Ausgangsposition der Karte merken, bevor die Hand neu gezeichnet wird
      const fromRect = fromEl ? fromEl.getBoundingClientRect() : null;
      const ghost = fromRect ? { getBoundingClientRect: () => fromRect } : null;
      const before = game.scores.slice();
      const events = gamePlay(game, seat, cardPlayed);
      saveGame();
      await present(events, ghost, before);
    }
  }
}

// ---------------- Overlays ----------------
function overlay(html, cls = '') {
  const el = $('overlay');
  el.innerHTML = `<div class="panel ${cls}">${html}</div>`;
  el.hidden = false;
  return el;
}
const closeOverlay = () => { $('overlay').hidden = true; $('overlay').innerHTML = ''; };

function showRoundSummary() {
  const h = game.history[game.history.length - 1];
  if (!h || h.aborted) return Promise.resolve();
  const m = modeLabel(h.mode);
  const row = (label, a, b) => `<tr><td>${label}</td><td class="us">${a}</td><td class="them">${b}</td></tr>`;
  const t = h.teams;
  const html = `<h2>Runde ${game.roundNo}: ${m.name}${h.multiplier > 1 ? ` ×${h.multiplier}` : ''}</h2>
    <p class="muted">Angesagt von ${NAMES[h.chooser]}${h.pushed ? ' nach Schieben' : ''}${h.match ? ' · <b>Match!</b>' : ''}</p>
    <div class="tafel-grid"><div>
    <table>
      <tr><th></th><th>Wir</th><th>Gegner</th></tr>
      ${row('Stiche', t[0].tricks, t[1].tricks)}
      ${row('Kartenpunkte', t[0].cards, t[1].cards)}
      ${t[0].weis || t[1].weis ? row('Weis', t[0].weis, t[1].weis) : ''}
      ${t[0].stoeck || t[1].stoeck ? row('Stöck', t[0].stoeck, t[1].stoeck) : ''}
      ${h.multiplier > 1 ? row(`× ${h.multiplier}`, h.totals[0], h.totals[1]) : ''}
      <tr class="total"><td>Stand</td><td class="us">${game.scores[0]}</td><td class="them">${game.scores[1]}</td></tr>
    </table></div>
    <div class="halves">${tafelHalves(game.scores, game.settings.target)}</div></div>
    <div class="actions"><button class="btn chalk-btn" id="btn-next">Nächste Runde</button></div>`;
  const el = overlay(html, 'tafel');
  return new Promise((resolve) => {
    el.querySelector('#btn-next').onclick = () => { closeOverlay(); resolve(); };
  });
}

function showGameEnd() {
  const won = game.winner === 0;
  const el = overlay(`<h2>Partie beendet</h2>
    <div class="big-result">${won ? 'Gewonnen!' : 'Verloren'}</div>
    <div class="halves wide">${tafelHalves(game.scores, game.settings.target)}</div>
    <p class="muted">${game.history.length} Runden · Ziel ${game.settings.target}</p>
    <div class="actions"><button class="btn chalk-btn" id="btn-new">Neue Partie</button></div>`, 'tafel');
  return new Promise((resolve) => {
    el.querySelector('#btn-new').onclick = () => { closeOverlay(); newGame(); resolve(); };
  });
}

$('btn-last').addEventListener('click', () => {
  const r = game.round;
  const t = r && r.tricks.length ? r.tricks[r.tricks.length - 1] : null;
  if (!t) return;
  const el = overlay(`<h2>Letzter Stich</h2><div class="lasttrick"></div>
    <p class="muted">${NAMES[t.winner]} macht ${t.points} Punkte.</p>
    <div class="actions"><button class="btn" id="btn-close">Schliessen</button></div>`);
  const box = el.querySelector('.lasttrick');
  t.cards.forEach((c, i) => {
    const seat = (t.leader + i) % 4;
    const f = document.createElement('figure');
    if (seat === t.winner) f.className = 'win';
    f.appendChild(cardElement(c, style()));
    f.insertAdjacentHTML('beforeend', `<figcaption>${NAMES[seat]}</figcaption>`);
    box.appendChild(f);
  });
  el.querySelector('#btn-close').onclick = closeOverlay;
});

$('btn-menu').addEventListener('click', showMenu);
$('scores').addEventListener('click', showTafel);

// Die ganze Jasstafel: Z mit Strichen für beide Teams und alle bisherigen Runden
function showTafel() {
  const rows = game.history.filter((h) => !h.aborted).map((h, i) => {
    const m = modeLabel(h.mode);
    return `<tr><td>${i + 1}. ${m.name}${h.multiplier > 1 ? ` ×${h.multiplier}` : ''}${h.match ? ' · Match' : ''}</td><td class="us">${h.totals[0]}</td><td class="them">${h.totals[1]}</td></tr>`;
  }).join('');
  const el = overlay(`<h2>Jasstafel</h2>
    <div class="tafel-grid">
      <div class="halves">${tafelHalves(game.scores, game.settings.target)}</div>
      <div class="rounds">${rows ? `<table><tr><th>Runde</th><th>Wir</th><th>Gegner</th></tr>${rows}</table>` : '<p class="muted">Noch keine Runde gespielt.</p>'}</div>
    </div>
    <div class="actions"><button class="btn chalk-btn" id="btn-close">Schliessen</button></div>`, 'tafel');
  el.querySelector('#btn-close').onclick = closeOverlay;
}

function showMenu() {
  const el = overlay(`<h2>${APP_NAME}</h2>
    <div class="menu-list">
      <button class="btn secondary" data-a="resume">Weiterspielen</button>
      <button class="btn secondary" data-a="settings">Einstellungen</button>
      <button class="btn secondary" data-a="rules">Kurzregeln</button>
      <button class="btn secondary" data-a="new">Neue Partie</button>
    </div>
    <p class="muted">Version ${VERSION}</p>`);
  el.querySelector('.menu-list').onclick = (e) => {
    const a = e.target.closest('button')?.dataset.a;
    if (a === 'resume') closeOverlay();
    if (a === 'settings') showSettings();
    if (a === 'rules') showRules();
    if (a === 'new') {
      if (confirm('Laufende Partie abbrechen und neu beginnen?')) { closeOverlay(); newGame(); }
    }
  };
}

function seg(key, options, current) {
  return `<div class="seg" data-key="${key}">${options.map(([v, label]) => `<button data-v="${v}" class="${String(v) === String(current) ? 'on' : ''}">${label}</button>`).join('')}</div>`;
}

function showSettings() {
  const s = settings;
  const el = overlay(`<h2>Einstellungen</h2>
    <div class="setting"><span>Zielpunkte<span class="hint">ab nächster Partie</span></span>${seg('target', [[1000, '1000'], [1500, '1500'], [2500, '2500'], [3000, '3000'], [5000, '5000']], s.target)}</div>
    <div class="setting"><span>Multiplikator<span class="hint">rot ×1, schwarz ×2, Obe/Unde ×3 – ab nächster Partie</span></span>${seg('multipliers', [[true, 'Ein'], [false, 'Aus']], s.multipliers)}</div>
    <div class="setting"><span>Zeichen<span class="hint">Bedeutung des ersten Abwerfens</span></span>${seg('convention', [['anziehen', 'Anziehen'], ['verwerfen', 'Verwerfen']], s.convention)}</div>
    <div class="setting"><span>Kartenbild</span>${seg('cardStyle', [['fr', 'Französisch'], ['de', 'Deutsch']], s.cardStyle)}</div>
    <div class="setting"><span>Jassteppich</span>${seg('felt', [['gruen', 'Grün'], ['blau', 'Blau'], ['rot', 'Bordeaux'], ['schwarz', 'Anthrazit']], s.felt)}</div>
    <div class="setting"><span>Spielstärke</span>${seg('level', [['stark', 'Stark'], ['mittel', 'Mittel']], s.level)}</div>
    <div class="setting"><span>Tempo</span>${seg('speed', [['langsam', 'Langsam'], ['normal', 'Normal'], ['schnell', 'Schnell']], s.speed)}</div>
    <h3>Portraits</h3>
    <div class="setting"><span>Portraits auf den Bildkarten<span class="hint">Fotos bleiben nur auf diesem Gerät</span></span>${seg('portraitsOn', [[true, 'Ein'], [false, 'Aus']], portraits.enabled)}</div>
    ${portraitRows()}
    <div class="actions"><button class="btn" id="btn-close">Fertig</button></div>`);
  bindPortraitRows(el);
  el.querySelectorAll('.seg').forEach((g) => {
    g.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const key = g.dataset.key;
      let v = b.dataset.v;
      if (key === 'portraitsOn') {
        portraits.enabled = v === 'true';
        savePortraits();
        g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        return;
      }
      if (key === 'target') v = +v;
      if (key === 'multipliers') v = v === 'true';
      settings[key] = v;
      saveSettings();
      g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      // Sofort wirksam: Zeichen, Kartenbild, Tempo. Ziel und Multiplikator ab nächster Partie.
      if (key === 'felt') applyFelt();
      if (['convention', 'cardStyle', 'speed'].includes(key)) {
        game.settings[key] = v;
        saveGame();
        renderAll();
      }
    };
  });
  el.querySelector('#btn-close').onclick = closeOverlay;
}

// ---------------- Portraits ----------------
// Fotos werden verkleinert, auf das Seitenverhältnis des Kopfes zugeschnitten und nur lokal
// (localStorage) gespeichert. Sie gelten für alle vier Farben der jeweiligen Figur.
let portraits = loadPortraits();
setPortraits(portraits);

function loadPortraits() {
  try {
    return { enabled: true, ...JSON.parse(localStorage.getItem(STORE_PORTRAITS) || '{}') };
  } catch {
    return { enabled: true };
  }
}
function savePortraits() {
  try {
    localStorage.setItem(STORE_PORTRAITS, JSON.stringify(portraits));
  } catch {
    alert('Das Foto konnte nicht gespeichert werden (Speicher voll?).');
  }
  setPortraits(portraits);
  renderAll();
}

const FIGURES = () => (style() === 'de'
  ? [[5, 'Under'], [6, 'Ober'], [7, 'König']]
  : [[5, 'Bauer'], [6, 'Dame'], [7, 'König']]);

function portraitRows() {
  return FIGURES().map(([rank, name]) => {
    const img = portraitImage(rank);
    const isDefault = img && !(rank in portraits);
    const canRestore = DEFAULT_PORTRAITS[rank] && portraits[rank] !== undefined && portraits[rank] !== DEFAULT_PORTRAITS[rank];
    return `<div class="setting portrait-row"><span>${name}${isDefault ? '<span class="hint">Standard</span>' : ''}</span><div class="pr">
      ${img ? `<img class="pv" src="${img}" alt="">` : '<span class="pv empty">–</span>'}
      <label class="btn secondary small">Foto wählen<input type="file" accept="image/*" data-rank="${rank}" hidden></label>
      ${img ? `<button class="btn ghost small dark" data-remove="${rank}">Entfernen</button>` : ''}
      ${canRestore ? `<button class="btn ghost small dark" data-restore="${rank}">Standard</button>` : ''}
    </div></div>`;
  }).join('');
}

function bindPortraitRows(el) {
  el.querySelectorAll('input[type=file]').forEach((input) => {
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        portraits[input.dataset.rank] = await makePortrait(file);
        portraits.enabled = true;
        savePortraits();
      } catch (err) {
        alert('Dieses Bild konnte nicht gelesen werden.');
      }
      showSettings();
    };
  });
  el.querySelectorAll('[data-remove]').forEach((b) => {
    b.onclick = () => {
      // null merken, damit auch ein Standard-Portrait weg bleibt
      if (DEFAULT_PORTRAITS[b.dataset.remove]) portraits[b.dataset.remove] = null;
      else delete portraits[b.dataset.remove];
      savePortraits();
      showSettings();
    };
  });
  el.querySelectorAll('[data-restore]').forEach((b) => {
    b.onclick = () => {
      delete portraits[b.dataset.restore];
      savePortraits();
      showSettings();
    };
  });
}

async function makePortrait(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const W = 260, H = 320; // Seitenverhältnis der Kopf-Ellipse (15.6 : 19.2)
    let sw = img.naturalWidth * 0.88, sh = sw * H / W; // etwas enger aufs Gesicht
    if (sh > img.naturalHeight) { sh = img.naturalHeight; sw = sh * W / H; }
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) * 0.3; // Gesicht ist meist etwas oberhalb der Mitte
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function showRules() {
  const el = overlay(`<h2>Kurzregeln Schieber</h2><div class="rules">
    <p><b>Ansagen:</b> Wer an der Reihe ist, wählt Trumpf, Obenabe oder Undeufe – oder schiebt zur Partnerin, die dann wählen muss. Ausgespielt wird immer vom Ansager.</p>
    <p><b>Trumpf:</b> Bauer (20) &gt; Nell/9 (14) &gt; Ass &gt; König &gt; Dame &gt; 10 &gt; 8 &gt; 7 &gt; 6. Trumpf darf immer gespielt werden, aber nicht untertrumpft. Den Trumpf-Bauer muss man nie angeben.</p>
    <p><b>Obenabe:</b> Ass hoch, 8 zählt 8. <b>Undeufe:</b> 6 hoch und zählt 11, 8 zählt 8.</p>
    <p><b>Bedienen:</b> Farbe angeben, wenn möglich (im Trumpfspiel darf stattdessen gestochen werden).</p>
    <p><b>Weis:</b> Dreiblatt 20, Vierblatt 50, Fünfblatt 100 … Vier Gleiche 100, vier Nell 150, vier Bauern 200. Nur das Team mit dem höchsten Weis schreibt.</p>
    <p><b>Stöck:</b> König + Dame Trumpf = 20. <b>Letzter Stich:</b> +5. <b>Match:</b> alle Stiche = 257.</p>
    <p><b>Zeichen:</b> ${game.settings.convention === 'verwerfen' ? 'Verwerfen – das erste Abwerfen zeigt eine Farbe, die man <i>nicht</i> will.' : 'Anziehen – das erste Abwerfen (kleine Karte) zeigt die Farbe, die man will.'}</p>
    </div><div class="actions"><button class="btn" id="btn-close">Schliessen</button></div>`);
  el.querySelector('#btn-close').onclick = closeOverlay;
}

// ---------------- Start ----------------
// Neue Partie: speichern und neu laden – so bleibt kein alter Spielablauf hängen.
function newGame() {
  game = createGame({ ...settings });
  saveGame();
  location.reload();
}

async function runLoop() {
  try {
    await loop();
  } catch (err) {
    console.error(err);
    overlay(`<h2>Fehler</h2><p>${String(err.message || err)}</p><div class="actions"><button class="btn" onclick="location.reload()">Neu laden</button></div>`);
  }
}

// Updates: beim Start und jedes Mal, wenn die App wieder in den Vordergrund kommt, nach einer
// neuen Version fragen. Übernimmt ein neuer Service Worker, wird einmal neu geladen
// (der Spielstand ist nach jeder Aktion gespeichert).
function setupUpdates() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    const check = () => reg.update().catch(() => {});
    check();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  }).catch(() => {});
}

// Feine Linien, die den Teppich von den Ecken zur Mitte vierteln (Mitte = Stichmitte bei 45 %).
function drawQuarters() {
  const svg = $('quarters');
  const W = window.innerWidth, H = window.innerHeight;
  const cx = W / 2, cy = H * 0.45;
  const emblem = $('emblem').getBoundingClientRect();
  const stop = emblem.width * 0.47; // äusserer Kreis des Emblems
  const inset = 22;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let html = '';
  for (const [x, y] of [[inset, inset], [W - inset, inset], [W - inset, H - inset], [inset, H - inset]]) {
    const dx = cx - x, dy = cy - y, len = Math.hypot(dx, dy);
    const ex = cx - (dx / len) * stop, ey = cy - (dy / len) * stop;
    html += `<line class="shadow" x1="${x}" y1="${y + 1}" x2="${ex}" y2="${ey + 1}"/><line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}"/>`;
  }
  svg.innerHTML = html;
}

function applyFelt() {
  document.documentElement.dataset.felt = settings.felt || 'gruen';
}

function init() {
  applyFelt();
  const saved = loadGame();
  if (saved && saved.winner === null) {
    game = saved;
    game.settings.speed = settings.speed;
    game.settings.cardStyle = settings.cardStyle;
  } else {
    game = createGame({ ...settings });
  }
  renderAll();
  runLoop();
  drawQuarters();
  window.addEventListener('resize', () => { renderHand(); drawQuarters(); });
  setupUpdates();
}

init();
