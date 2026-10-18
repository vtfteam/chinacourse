// Sestaví aplikaci do jednoho HTML souboru: docs/index.html.
//
//   node tools/build.mjs                       → docs/index.html
//   node tools/build.mjs --artifact out.html   → navíc varianta pro claude.ai
//
// Varianta pro claude.ai nemá <!doctype>, <html>, <head> ani <body>,
// protože je při zveřejnění doplní platforma.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCourse, splitVocab } from './parse-md.mjs';
import { lessons as lessonMeta, exercises, extraPinyin } from '../content/interaktivni.mjs';
import rozbor from '../content/rozbor.mjs';
import znaky from '../content/znaky.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const JS_FILES = [
  'src/js/core.js',
  'src/js/pinyin.js',
  'src/js/speech.js',
  'src/js/sync.js',
  'src/js/widgets.js',
  'src/js/home.js',
  'src/js/lesson.js',
  'src/js/exercises.js',
  'src/js/cards.js',
  'src/js/tones.js',
  'src/js/characters.js',
  'src/js/dictionary.js',
  'src/js/reference.js',
  'src/js/main.js',
];

export function assembleCourse() {
  const course = buildCourse(read('content/ucebnice.md'));

  // Slovník celého kurzu: položky s lomítkem rozdělené na samostatná slova.
  const vocab = [];
  const seen = new Set();
  const pinyin = { ...extraPinyin };
  for (const lesson of course.lessons) {
    for (const entry of lesson.steps.vocab.entries) {
      const zhParts = entry.zh.split(' / ');
      const pyParts = entry.py.split(' / ');
      if (zhParts.length === pyParts.length) zhParts.forEach((z, i) => { pinyin[z.trim()] ??= pyParts[i].trim(); });
      for (const v of splitVocab(entry)) {
        const key = `${v.zh}|${v.py}`;
        if (seen.has(key)) continue;
        seen.add(key);
        vocab.push({ zh: v.zh, py: v.py, cz: v.cz, l: lesson.n });
      }
    }
    Object.assign(lesson, lessonMeta[lesson.n]);
    lesson.exercises = exercises[lesson.n] || null;
  }

  // Nové znaky lekce: ty, které se ve slovníčcích objevují poprvé.
  const seenChars = new Set();
  for (const lesson of course.lessons) {
    const words = vocab.filter((v) => v.l === lesson.n);
    lesson.newChars = [];
    for (const v of words) {
      for (const c of v.zh.match(/\p{Script=Han}/gu) || []) {
        if (!seenChars.has(c)) { seenChars.add(c); lesson.newChars.push(c); }
      }
    }
    // Rozbor vět dialogu; „nové“ = slovo ze slovníčku této lekce.
    const lessonWords = new Set(words.map((v) => v.zh.replace(/…/g, '')));
    for (const line of lesson.steps.dialog.lines) {
      const r = line.zh && rozbor[line.zh];
      if (!r) continue;
      line.ex = {
        words: r.w.map((s) => {
          const [zh, py, cz] = s.split('|');
          return { zh, py, cz, isNew: lessonWords.has(zh) };
        }),
        lit: r.lit,
        note: r.note,
      };
    }
  }
  course.vocab = vocab;
  course.pinyin = pinyin;

  // Znaky s etymologií: lekce prvního výskytu a rozložené díly.
  const firstLesson = {};
  for (const lesson of course.lessons) for (const c of lesson.newChars) firstLesson[c] ??= lesson.n;
  course.chars = {};
  for (const [c, z] of Object.entries(znaky)) {
    course.chars[c] = {
      py: z.py,
      cz: z.cz,
      typ: z.typ,
      dil: !!z.dil,
      first: firstLesson[c] || z.l || null,
      trad: z.trad || null,
      dily: z.dily.map((d) => {
        const [part, role, cz] = d.split('|');
        return { c: part, role, cz };
      }),
      pribeh: z.pribeh,
    };
  }
  return course;
}

// Data pro animace tahů (hanzi-writer-data) jen pro znaky z učebnice.
export function strokeData(course) {
  // Tahy pro znaky z textu učebnice a pro všechny znaky a díly s etymologií.
  const { chars: etymology, ...rest } = course;
  const chars = new Set([...JSON.stringify(rest).match(/\p{Script=Han}/gu), ...Object.keys(etymology || {})]);
  const data = {};
  for (const c of [...chars].sort()) {
    const file = join(root, 'node_modules/hanzi-writer-data', `${c}.json`);
    if (existsSync(file)) data[c] = JSON.parse(readFileSync(file, 'utf8'));
  }
  return data;
}

const jsonScript = (id, value) =>
  `<script type="application/json" id="${id}">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;

function build() {
  const course = assembleCourse();
  const strokes = strokeData(course);
  const css = read('src/styles.css');
  const js = JS_FILES.map((f) => `// ${f}\n${read(f)}`).join('\n');
  const page = read('src/index.html')
    .replace('/*STYLES*/', () => css)
    .replace('<!--DATA-->', () => [jsonScript('course-data', course), jsonScript('stroke-data', strokes)].join('\n'))
    .replace('/*SCRIPT*/', () => `(function () {\n'use strict';\n${js}\n})();`);

  const [head, body] = page.split('<!--BODY-->');
  const standalone = `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Interaktivní učebnice čínštiny pro české začátečníky: osm lekcí s dialogy, výslovností, kartičkami a cvičeními.">
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs/index.html'), standalone);
  console.log(`docs/index.html  ${(standalone.length / 1024).toFixed(0)} kB, ${Object.keys(strokes).length} znaků s tahy, ${course.vocab.length} slovíček`);

  const i = process.argv.indexOf('--artifact');
  if (i > 0 && process.argv[i + 1]) {
    writeFileSync(process.argv[i + 1], head.trim() + '\n' + body.trim() + '\n');
    console.log(`${process.argv[i + 1]}  (varianta pro claude.ai)`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
