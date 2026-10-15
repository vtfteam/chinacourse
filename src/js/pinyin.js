// Pinyin: rozdělení na slabiky, určení tónu a obarvení podle tónu.

const TONE_MARKS = {
  a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ',
};
const MARKED = {};
for (const [base, marks] of Object.entries(TONE_MARKS)) {
  [...marks].forEach((m, i) => {
    MARKED[m] = { base, tone: i + 1 };
    MARKED[m.toUpperCase()] = { base: base.toUpperCase(), tone: i + 1 };
  });
}

// Slabika = (iniciála) + finála (+ r). Stačí na dělení skutečného pinyinu.
const SYLLABLE = /^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(iang|iong|uang|ang|eng|ing|ong|uai|iao|ian|uan|üan|ai|ei|ao|ou|an|en|in|un|ün|ia|ie|iu|ua|uo|ui|üe|ue|er|a|o|e|i|u|ü)$/;
const LETTER = /[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙ]/;

function stripTones(s) {
  return [...s].map((c) => (MARKED[c] ? MARKED[c].base : c)).join('');
}
const ZERO_INITIAL = /^(a|o|e|ai|ei|ao|ou|an|en|ang|eng|er)$/;
function isSyllable(base) {
  const core = base.length > 1 && base.endsWith('r') && base !== 'er' ? base.slice(0, -1) : base;
  const m = SYLLABLE.exec(core);
  if (!m) return false;
  return !!m[1] || ZERO_INITIAL.test(m[2]);
}

// Rozdělí slovo (např. „Zhōngguó“) na slabiky; null, když to nejde (třeba „Petr“).
function splitWord(word) {
  const base = stripTones(word.normalize('NFC')).toLowerCase();
  const n = base.length;
  const best = new Array(n + 1).fill(null);
  best[0] = [];
  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - 7); j < i; j++) {
      if (!best[j] || !isSyllable(base.slice(j, i))) continue;
      const cand = best[j].concat([[j, i]]);
      if (!best[i] || cand.length < best[i].length) best[i] = cand;
    }
  }
  if (!best[n]) return null;
  const chars = [...word.normalize('NFC')];
  return best[n].map(([a, b]) => {
    const text = chars.slice(a, b).join('');
    const marked = [...text].find((c) => MARKED[c]);
    return { text, tone: marked ? MARKED[marked].tone : 5 };
  });
}

// Pinyin → HTML se slabikami obarvenými podle tónu.
function pyHtml(py) {
  const out = [];
  let i = 0;
  const s = py.normalize('NFC');
  while (i < s.length) {
    if (LETTER.test(s[i])) {
      let j = i;
      while (j < s.length && LETTER.test(s[j])) j++;
      const word = s.slice(i, j);
      const parts = splitWord(word);
      if (parts) out.push(parts.map((p) => `<span class="t${p.tone}">${p.text}</span>`).join(''));
      else out.push(escapeHtml(word));
      i = j;
    } else {
      out.push(escapeHtml(s[i]));
      i++;
    }
  }
  return out.join('');
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const pyEl = (py, cls = '') => h('span', { class: `py ${cls}`.trim(), html: pyHtml(py) });

// Slabiky celého pinyinu (pro trenažér tónů).
function syllables(py) {
  const words = py.normalize('NFC').split(/[^a-zA-Züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+/i).filter(Boolean);
  const out = [];
  for (const w of words) {
    const parts = splitWord(w);
    if (!parts) return null;
    out.push(...parts);
  }
  return out;
}

// Nastaví slabice jiný tón. Značka jde na a/e, u „ou“ na o, jinak na poslední samohlásku.
function setTone(text, tone) {
  const plainText = stripTones(text);
  if (tone === 5) return plainText;
  const lower = plainText.toLowerCase();
  let idx = lower.search(/[ae]/);
  if (idx < 0) idx = lower.indexOf('ou');
  if (idx < 0) {
    for (let k = lower.length - 1; k >= 0; k--) {
      if ('iouü'.includes(lower[k])) { idx = k; break; }
    }
  }
  if (idx < 0) return plainText;
  const ch = plainText[idx];
  const marks = TONE_MARKS[ch.toLowerCase()];
  let m = marks[tone - 1];
  if (ch !== ch.toLowerCase()) m = m.toUpperCase();
  return plainText.slice(0, idx) + m + plainText.slice(idx + 1);
}

// Pro vyhledávání: bez tónů, mezer a velkých písmen.
const pyKey = (py) => stripTones(py.normalize('NFC')).toLowerCase().replace(/ü/g, 'v').replace(/[^a-zv]/g, '');
const czKey = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
