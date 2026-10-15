// Kontrola dat: má každá lekce všechny části a jdou odpovědi složit z kartiček?
//   node tools/check.mjs

import { assembleCourse, strokeData } from './build.mjs';

const course = assembleCourse();
const problems = [];
const warn = [];
const han = (s) => (s.match(/[\p{Script=Han}〇]/gu) || []).join('');

for (const l of course.lessons) {
  const s = l.steps;
  for (const part of ['dialog', 'vocab', 'grammar', 'chars', 'pron', 'speak', 'ex']) {
    if (!s[part]) problems.push(`Lekce ${l.n}: chybí část „${part}“`);
  }
  if (s.dialog && !s.dialog.lines.length) problems.push(`Lekce ${l.n}: dialog nemá žádné repliky`);
  if (s.vocab && !s.vocab.entries.length) problems.push(`Lekce ${l.n}: prázdný slovníček`);
  if (!l.key) problems.push(`Lekce ${l.n}: chybí klíčové slovo v content/interaktivni.mjs`);
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

const strokes = strokeData(course);
const missing = [...new Set(course.vocab.flatMap((v) => [...han(v.zh)]))].filter((c) => !strokes[c]);
if (missing.length) warn.push(`Znaky bez dat o tazích: ${missing.join(' ')}`);

console.log(`${course.lessons.length} lekcí, ${course.vocab.length} slovíček, ${Object.keys(strokes).length} znaků s tahy`);
for (const w of warn) console.log(`upozornění: ${w}`);
for (const p of problems) console.log(`CHYBA: ${p}`);
if (problems.length) process.exit(1);
console.log('V pořádku.');
