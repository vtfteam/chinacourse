// Data, stav a drobné pomůcky sdílené všemi obrazovkami.

const COURSE = JSON.parse(document.getElementById('course-data').textContent);
const STROKES = (() => {
  try { return JSON.parse(document.getElementById('stroke-data').textContent); } catch (e) { return {}; }
})();
const LESSONS = COURSE.lessons;
const lessonByN = (n) => LESSONS.find((l) => l.n === Number(n));

const STEPS = [
  { key: 'dialog', slug: 'dialog', label: 'Dialog' },
  { key: 'vocab', slug: 'slovicka', label: 'Slovíčka' },
  { key: 'grammar', slug: 'gramatika', label: 'Gramatika' },
  { key: 'chars', slug: 'znaky', label: 'Znaky' },
  { key: 'pron', slug: 'vyslovnost', label: 'Výslovnost' },
  { key: 'speak', slug: 'mluveni', label: 'Mluvení' },
  { key: 'ex', slug: 'cviceni', label: 'Cvičení' },
];

// ---------- DOM ----------
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z"/><path d="M15 8.5a5 5 0 0 1 0 7M17.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  brush: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4.5 19.5 9.5 10 19H5v-5l9.5-9.5Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.6 0 2.8-1.6 3.9-3.5M14 9.3C15 7.9 16 7 17 7h3M17 4l3 3-3 3M17 14l3 3-3 3"/></svg>',
};
const icon = (name) => h('span', { class: 'ic', html: ICONS[name], style: 'display:contents' });

// ---------- Úložiště ----------
const STORE_KEY = 'cinstina-krok-za-krokem/pokrok';
const SETTINGS_KEY = 'cinstina-krok-za-krokem/nastaveni';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* soukromé okno apod. */ }
}

const emptyProgress = () => ({ epoch: 0, t: 0, steps: {}, ex: {}, cards: {}, notes: {}, last: null });
let progress = normalizeProgress(loadJSON(STORE_KEY, null));
const settings = Object.assign({ pinyin: true, tones: true, rate: 0.85, voice: '' }, loadJSON(SETTINGS_KEY, {}));

function normalizeProgress(p) {
  const base = emptyProgress();
  if (!p || typeof p !== 'object') return base;
  for (const k of Object.keys(base)) if (p[k] != null) base[k] = p[k];
  return base;
}

// Spojí dva stavy (místní a uložený u účtu) tak, aby se nic neztratilo.
function mergeProgress(a, b) {
  if ((a.epoch || 0) !== (b.epoch || 0)) return (a.epoch || 0) > (b.epoch || 0) ? a : b;
  const pickNewer = (x, y) => (!x ? y : !y ? x : (x.t || 0) >= (y.t || 0) ? x : y);
  const out = emptyProgress();
  out.epoch = a.epoch || 0;
  out.t = Math.max(a.t || 0, b.t || 0);
  out.steps = Object.assign({}, a.steps, b.steps);
  for (const k of new Set([...Object.keys(a.ex), ...Object.keys(b.ex)])) {
    const x = a.ex[k];
    const y = b.ex[k];
    out.ex[k] = x && y && x.ok !== y.ok ? (x.ok ? x : y) : pickNewer(x, y);
  }
  for (const k of new Set([...Object.keys(a.cards), ...Object.keys(b.cards)])) out.cards[k] = pickNewer(a.cards[k], b.cards[k]);
  for (const k of new Set([...Object.keys(a.notes), ...Object.keys(b.notes)])) out.notes[k] = pickNewer(a.notes[k], b.notes[k]);
  out.last = (a.t || 0) >= (b.t || 0) ? a.last || b.last : b.last || a.last;
  return out;
}

function commit() {
  progress.t = Date.now();
  saveJSON(STORE_KEY, progress);
  if (typeof Sync !== 'undefined') Sync.schedule();
}
function saveSettings() {
  saveJSON(SETTINGS_KEY, settings);
  applySettings();
}
function applySettings() {
  const root = document.documentElement;
  root.classList.toggle('tones-on', !!settings.tones);
  root.classList.toggle('hide-tile-py', !settings.pinyin);
}

// ---------- Pokrok ----------
const stepId = (n, key) => `l${n}:${key}`;
const isStepDone = (n, key) => !!progress.steps[stepId(n, key)];
function markStep(n, key, done = true) {
  const id = stepId(n, key);
  if (!!progress.steps[id] === done) return;
  if (done) progress.steps[id] = true;
  else delete progress.steps[id];
  commit();
}
function lessonDone(n) {
  return STEPS.filter((s) => isStepDone(n, s.key)).length;
}
function setLast(n, step) {
  progress.last = { n, step };
  saveJSON(STORE_KEY, progress);
}

// ---------- Různé ----------
const DAY = 86400000;
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / DAY);

function shuffle(arr, seed) {
  const a = arr.slice();
  let s = seed == null ? Math.random() * 2 ** 31 : seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const hashStr = (s) => [...s].reduce((acc, c) => (acc * 31 + c.codePointAt(0)) % 2147483647, 7);

const HAN_RUN = /[\p{Script=Han}〇][\p{Script=Han}〇，。？！、：；…·（）《》“”]*/gu;
const hasHan = (s) => /\p{Script=Han}/u.test(s);
const onlyHan = (s) => (s.match(/[\p{Script=Han}〇]/gu) || []).join('');

let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function plural(n, one, few, many) {
  if (n === 1) return `${n} ${one}`;
  if (n >= 2 && n <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}
