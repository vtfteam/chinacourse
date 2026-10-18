// Převod učebnice z Markdownu do datové struktury, kterou čte aplikace.
// Parser zná jen ty prvky, které učebnice používá: nadpisy, odstavce,
// seznamy, tabulky, citace, tučné písmo a kurzívu.

const HAN = /\p{Script=Han}/u;

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Řádkový Markdown → HTML.
export function inline(md) {
  let s = escapeHtml(md.trim());
  s = s.replace(/\\([_*|\\])/g, (_, c) => `&#${c.charCodeAt(0)};`);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

// Řádkový Markdown → prostý text.
export function plain(md) {
  return md.trim().replace(/\\([_*|\\])/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map((c) => c.trim());
}

// Rozdělí text na bloky: p, list, table, quote.
export function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      const head = splitRow(rows[0]);
      const body = rows.slice(2).map(splitRow);
      blocks.push({
        t: 'table',
        head: head.map(inline),
        headText: head.map(plain),
        rows: body.map((r) => r.map(inline)),
        rowsText: body.map((r) => r.map(plain)),
      });
      continue;
    }
    if (line.startsWith('>')) {
      const inner = [];
      while (i < lines.length && lines[i].startsWith('>')) inner.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ t: 'quote', blocks: parseBlocks(inner) });
      continue;
    }
    const ol = /^\d+\.\s+/;
    const ul = /^-\s+/;
    if (ol.test(line) || ul.test(line)) {
      const ordered = ol.test(line);
      const re = ordered ? ol : ul;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        const raw = lines[i++].replace(re, '');
        items.push({ html: inline(raw), text: plain(raw) });
      }
      blocks.push({ t: 'list', ordered, items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('|') &&
      !lines[i].startsWith('>') && !ol.test(lines[i]) && !ul.test(lines[i]) && !lines[i].startsWith('#')) {
      para.push(lines[i++].trim());
    }
    if (para.length) {
      const raw = para.join(' ');
      blocks.push({ t: 'p', html: inline(raw), text: plain(raw) });
    } else {
      i++;
    }
  }
  return blocks;
}

// Rozdělí dokument podle nadpisů # / ## / ###.
export function parseDocument(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const doc = { title: '', pre: [], sections: [] };
  let sec = null;
  let sub = null;
  let buf = [];
  const flush = () => {
    const blocks = parseBlocks(buf);
    buf = [];
    if (sub) sub.blocks.push(...blocks);
    else if (sec) sec.blocks.push(...blocks);
    else doc.pre.push(...blocks);
  };
  for (const line of lines) {
    const m = /^(#{1,3})\s+(.*)$/.exec(line);
    if (!m) { buf.push(line); continue; }
    flush();
    const level = m[1].length;
    const title = plain(m[2]);
    if (level === 1) doc.title = title;
    else if (level === 2) { sec = { title, blocks: [], subs: [] }; sub = null; doc.sections.push(sec); }
    else { sub = { title, blocks: [] }; sec.subs.push(sub); }
  }
  flush();
  return doc;
}

const hasHan = (s) => HAN.test(s);

// „好 hǎo“ → { zh: "好", py: "hǎo" }
function splitZhPy(text) {
  const m = /^(\S+)\s+(.+)$/.exec(text.trim());
  if (m && hasHan(m[1]) && !hasHan(m[2])) return { zh: m[1], py: m[2] };
  return { zh: text.trim(), py: '' };
}

// Položky slovníčku s lomítkem rozdělí na samostatné kartičky, když sedí počty.
export function splitVocab(entry) {
  const zh = entry.zh.split(' / ');
  const py = entry.py.split(' / ');
  const cz = entry.cz.split(' / ');
  if (zh.length > 1 && zh.length === py.length && zh.length === cz.length) {
    return zh.map((z, i) => ({ zh: z.trim(), py: py[i].trim(), cz: cz[i].trim() }));
  }
  return [entry];
}

function stepKind(title) {
  if (title.startsWith('Dialog')) return 'dialog';
  if (title.startsWith('Slovíčka')) return 'vocab';
  if (title.startsWith('Gramatika')) return 'grammar';
  if (title.startsWith('Znaky')) return 'chars';
  if (title.startsWith('Výslovnost')) return 'pron';
  if (title.startsWith('Mluvení')) return 'speak';
  if (title.startsWith('Cvičení')) return 'ex';
  return 'extra';
}

function afterColon(title) {
  const i = title.indexOf(':');
  return i >= 0 ? title.slice(i + 1).trim() : title;
}

function parseDialog(sub) {
  const out = { title: afterColon(sub.title), intro: [], lines: [], notes: [] };
  let seenTable = false;
  for (const b of sub.blocks) {
    if (b.t === 'table' && !seenTable) {
      seenTable = true;
      b.rowsText.forEach((r, i) => {
        const [who, zh, py, cz] = r;
        if (!who && !py) {
          out.lines.push({ stage: b.rows[i][1] || b.rows[i][3] });
        } else {
          out.lines.push({ who, zh, py, cz: b.rows[i][3] });
        }
      });
    } else if (seenTable) out.notes.push(b);
    else out.intro.push(b);
  }
  out.roles = [...new Set(out.lines.filter((l) => l.who).map((l) => l.who))];
  return out;
}

function parseVocab(sub) {
  const table = sub.blocks.find((b) => b.t === 'table');
  const entries = table.rowsText.map(([zh, py, cz], i) => ({ zh, py, cz, czHtml: table.rows[i][2] }));
  return { entries, notes: sub.blocks.filter((b) => b !== table) };
}

// Gramatiku rozdělí na body podle odstavců začínajících „**1. …**“.
function parseGrammar(sub) {
  const intro = [];
  const points = [];
  for (const b of sub.blocks) {
    const m = b.t === 'p' ? /^<strong>(\d+)\.\s*(.+?)<\/strong>\s*(.*)$/.exec(b.html) : null;
    if (m) {
      points.push({ n: Number(m[1]), title: m[2], blocks: m[3] ? [{ t: 'p', html: m[3] }] : [] });
    } else if (points.length) points[points.length - 1].blocks.push(b);
    else intro.push(b);
  }
  return { intro, points };
}

function parseChars(sub) {
  const out = { title: afterColon(sub.title), items: [], blocks: [] };
  for (const b of sub.blocks) {
    if (b.t === 'table' && b.headText[0] === 'Znak') {
      b.rowsText.forEach((r, i) => {
        const { zh, py } = splitZhPy(r[0]);
        out.items.push({ zh, py, parts: b.rows[i][1], memo: b.rows[i][2] });
      });
    } else out.blocks.push(b);
  }
  // Znaky k procvičení psaní: první sloupec tabulky, jinak všechny znaky v oddílu.
  const pool = out.items.length
    ? out.items.map((it) => it.zh)
    : [...new Set(JSON.stringify(sub.blocks).match(/\p{Script=Han}/gu) || [])];
  out.practice = [...new Set(pool.join('').match(/\p{Script=Han}/gu) || [])];
  return out;
}

function parseLesson(sec, n, title) {
  const goal = sec.blocks.filter((b) => b.t === 'p');
  const steps = {};
  const extrasBefore = [];
  const extrasAfter = [];
  for (const sub of sec.subs) {
    const kind = stepKind(sub.title);
    switch (kind) {
      case 'dialog': steps.dialog = parseDialog(sub); break;
      case 'vocab': steps.vocab = parseVocab(sub); break;
      case 'grammar': steps.grammar = parseGrammar(sub); break;
      case 'chars': steps.chars = parseChars(sub); break;
      case 'pron': steps.pron = { title: afterColon(sub.title), blocks: sub.blocks }; break;
      case 'speak': steps.speak = { blocks: sub.blocks }; break;
      case 'ex': steps.ex = { title: sub.title, blocks: sub.blocks }; break;
      default:
        (steps.vocab ? extrasAfter : extrasBefore).push({ title: sub.title, blocks: sub.blocks });
    }
  }
  if (steps.vocab) {
    steps.vocab.before = extrasBefore;
    steps.vocab.after = extrasAfter;
  }
  return { n, title, goal, steps };
}

function parseAppendix(sec) {
  const out = { grammar: null, radicals: null, key: {}, next: [], titles: {} };
  for (const sub of sec.subs) {
    const letter = sub.title[0];
    out.titles[letter] = sub.title.replace(/^[A-D]\.\s*/, '');
    if (letter === 'A') {
      const t = sub.blocks.find((b) => b.t === 'table');
      out.grammar = {
        intro: sub.blocks.filter((b) => b.t === 'p'),
        rows: t.rowsText.map((r, i) => ({ pattern: t.rows[i][0], example: r[1], lessons: r[2].split(',').map((x) => Number(x.trim())) })),
      };
    } else if (letter === 'B') {
      const t = sub.blocks.find((b) => b.t === 'table');
      out.radicals = {
        intro: sub.blocks.filter((b) => b.t === 'p'),
        rows: t.rowsText.map((r) => ({
          rad: r[0],
          meaning: r[1],
          chars: r[2].split(/\s+/).filter(Boolean),
          lessons: r[3].split(',').map((x) => Number(x.trim())),
        })),
      };
    } else if (letter === 'C') {
      for (const b of sub.blocks) {
        const m = b.t === 'p' ? /^<strong>Lekce (\d+)\.<\/strong>\s*(.*)$/.exec(b.html) : null;
        if (m) out.key[m[1]] = m[2].replace(/\s([A-D]):\s/g, '<br><b>$1:</b> ').replace(/^([A-D]):\s/, '<b>$1:</b> ');
      }
    } else if (letter === 'D') {
      out.next = sub.blocks;
    }
  }
  return out;
}

export function buildCourse(src) {
  const doc = parseDocument(src);
  const course = { title: doc.title, byline: doc.pre.map((b) => b.text).join(' '), intro: null, lessons: [], appendix: null };
  for (const sec of doc.sections) {
    const lm = /^Lekce (\d+):\s*(.+)$/.exec(sec.title);
    if (lm) course.lessons.push(parseLesson(sec, Number(lm[1]), lm[2]));
    else if (sec.title.startsWith('Úvod')) {
      course.intro = {
        title: afterColon(sec.title),
        blocks: sec.blocks,
        sections: sec.subs.map((s) => ({ title: s.title, blocks: s.blocks })),
      };
    } else if (sec.title.startsWith('Přílohy')) course.appendix = parseAppendix(sec);
  }
  return course;
}
