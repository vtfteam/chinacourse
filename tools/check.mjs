// Kontrola dat: má každá lekce všechny části a jdou odpovědi složit z kartiček?
//   node tools/check.mjs

import { assembleCourse, strokeData } from './build.mjs';
import rozbor from '../content/rozbor.mjs';
import znaky from '../content/znaky.mjs';

const course = assembleCourse();
const problems = [];
const warn = [];
const han = (s) => (s.match(/[\p{Script=Han}〇]/gu) || []).join('');
const pyNorm = (s) => s.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
const usedRozbor = new Set();

for (const l of course.lessons) {
  const s = l.steps;
  for (const part of ['dialog', 'vocab', 'grammar', 'chars', 'pron', 'speak', 'ex']) {
    if (!s[part]) problems.push(`Lekce ${l.n}: chybí část „${part}“`);
  }
  if (s.dialog && !s.dialog.lines.length) problems.push(`Lekce ${l.n}: dialog nemá žádné repliky`);
  if (s.vocab && !s.vocab.entries.length) problems.push(`Lekce ${l.n}: prázdný slovníček`);
  if (!l.key) problems.push(`Lekce ${l.n}: chybí klíčové slovo v content/interaktivni.mjs`);

  // Rozbor vět: slova musí dát dohromady celou repliku, znaky i pinyin.
  for (const ln of s.dialog ? s.dialog.lines : []) {
    if (!ln.zh) continue;
    usedRozbor.add(ln.zh);
    if (!ln.ex) { problems.push(`Lekce ${l.n}: replika „${ln.zh}“ nemá rozbor v content/rozbor.mjs`); continue; }
    const zh = ln.ex.words.map((w) => w.zh).join('');
    if (han(zh) !== han(ln.zh)) problems.push(`Lekce ${l.n}: rozbor „${ln.zh}“ má znaky ${han(zh)}`);
    const py = ln.ex.words.map((w) => w.py).join('');
    if (pyNorm(py) !== pyNorm(ln.py)) problems.push(`Lekce ${l.n}: rozbor „${ln.zh}“ má pinyin ${pyNorm(py)}, replika ${pyNorm(ln.py)}`);
    for (const w of ln.ex.words) if (!w.zh || !w.py || !w.cz) problems.push(`Lekce ${l.n}: neúplné slovo „${w.zh}“ v rozboru „${ln.zh}“`);
    if (!ln.ex.lit || !ln.ex.note) problems.push(`Lekce ${l.n}: rozbor „${ln.zh}“ nemá doslovný překlad nebo vysvětlení`);
  }
  if (!l.exercises) warn.push(`Lekce ${l.n}: nemá interaktivní cvičení, zobrazí se text z učebnice`);
  if (!course.appendix.key[l.n]) warn.push(`Lekce ${l.n}: v příloze chybí klíč`);

  for (const set of l.exercises || []) {
    const where = `Lekce ${l.n}, cvičení ${set.id}`;
    if (set.type === 'build') {
      set.items.forEach((it, i) => {
        const tiles = set.keypad || [...it.tiles, ...(it.extra || [])];
        for (const t of tiles) if (!course.pinyin[t]) warn.push(`${where}.${i + 1}: kartička „${t}“ nemá pinyin`);
        for (const raw of it.answers) {
          const [zh, py] = raw.split('|').map((x) => x && x.trim());
          if (!py) problems.push(`${where}.${i + 1}: odpověď „${zh}“ nemá pinyin`);
          if (!canBuild(han(zh), tiles.map(han), !!set.keypad)) problems.push(`${where}.${i + 1}: „${zh}“ nejde složit z kartiček ${tiles.join(' ')}`);
        }
      });
    } else if (set.type === 'choice') {
      set.items.forEach((it, i) => {
        if (!set.options.includes(it.answer)) problems.push(`${where}.${i + 1}: správná odpověď „${it.answer}“ není mezi možnostmi`);
        const [full] = it.full.split('|');
        if (han(full) !== han(it.prompt.replace('___', it.answer))) problems.push(`${where}.${i + 1}: „${full.trim()}“ neodpovídá zadání`);
      });
    } else if (set.type === 'pick') {
      for (const c of set.answer) if (!set.chars.includes(c)) problems.push(`${where}: „${c}“ není mezi nabízenými znaky`);
    } else if (set.type === 'sort') {
      const keys = set.groups.map((g) => g.key);
      for (const it of set.items) if (!keys.includes(it.group)) problems.push(`${where}: neznámá skupina „${it.group}“`);
    }
  }
}

// Dá se cílový řetězec složit z kartiček (každá nejvýš jednou, u klávesnice libovolně)?
function canBuild(target, tiles, reuse, used = new Set()) {
  if (!target) return true;
  return tiles.some((t, i) => t && target.startsWith(t) && (reuse || !used.has(i)) &&
    canBuild(target.slice(t.length), tiles, reuse, reuse ? used : new Set([...used, i])));
}

for (const key of Object.keys(rozbor)) if (!usedRozbor.has(key)) warn.push(`Rozbor „${key}“ nepatří k žádné replice`);

// Znaky: každý znak ze slovníčků musí mít etymologii.
const TYPES = ['obrázek', 'ukazatel', 'spojení', 'zvuk', 'výpůjčka', 'zjednodušený'];
const ROLES = ['význam', 'zvuk', 'tvar'];
const vocabChars = new Set(course.vocab.flatMap((v) => [...han(v.zh)]));
for (const c of vocabChars) if (!znaky[c]) problems.push(`Znak ${c} nemá položku v content/znaky.mjs`);
for (const [c, z] of Object.entries(znaky)) {
  if (!TYPES.includes(z.typ)) problems.push(`Znak ${c}: neznámý typ „${z.typ}“`);
  if (!z.py || !z.cz) problems.push(`Znak ${c}: chybí pinyin nebo význam`);
  if (!z.pribeh) warn.push(`Znak ${c}: chybí příběh`);
  if (!Array.isArray(z.dily)) problems.push(`Znak ${c}: dily musí být pole`);
  for (const d of z.dily || []) {
    const [part, role, cz] = d.split('|');
    if (!part || !cz || !ROLES.includes(role)) problems.push(`Znak ${c}: špatně zapsaný díl „${d}“`);
  }
  if (!vocabChars.has(c) && !z.l) problems.push(`Znak ${c} není ve slovníčku, potřebuje lekci „l“`);
}

const strokes = strokeData(course);
const missing = [...new Set(course.vocab.flatMap((v) => [...han(v.zh)]))].filter((c) => !strokes[c]);
if (missing.length) warn.push(`Znaky bez dat o tazích: ${missing.join(' ')}`);

console.log(`${course.lessons.length} lekcí, ${course.vocab.length} slovíček, ${Object.keys(course.chars).length} znaků s etymologií, ${Object.keys(strokes).length} znaků s tahy`);
for (const w of warn) console.log(`upozornění: ${w}`);
for (const p of problems) console.log(`CHYBA: ${p}`);
if (problems.length) process.exit(1);
console.log('V pořádku.');
