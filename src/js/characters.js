// Znaky: z čeho se skládají a jak vznikly. Detail znaku, detail slova a „Umím“.

const CHARS = COURSE.chars;
const CHAR_TYPES = {
  'obrázek': { label: 'Obrázek', desc: 'Vznikl z kresby toho, co znamená.' },
  'ukazatel': { label: 'Ukazatel', desc: 'Abstraktní značka: čárky, poloha, směr.' },
  'spojení': { label: 'Spojení významů', desc: 'Díly dohromady dávají nový význam.' },
  'zvuk': { label: 'Význam + zvuk', desc: 'Jeden díl napoví význam, druhý výslovnost. Takhle vzniká většina znaků.' },
  'výpůjčka': { label: 'Výpůjčka', desc: 'Původně znamenal něco jiného. Slovo si ho vypůjčilo, protože znělo podobně.' },
  'zjednodušený': { label: 'Zjednodušený', desc: 'Dnešní tvar vznikl zkrácením složitějšího tradičního znaku.' },
};
const ROLE_LABELS = { 'význam': 'význam', 'zvuk': 'zvuk', 'tvar': 'tvar' };

// Pořadí pro procházení: znaky podle lekce prvního výskytu, pak základní díly.
const CHAR_ORDER = (() => {
  const keys = Object.keys(CHARS);
  const pos = new Map();
  LESSONS.forEach((l) => l.newChars.forEach((c, i) => pos.set(c, l.n * 1000 + i)));
  const main = keys.filter((c) => !CHARS[c].dil).sort((a, b) =>
    (pos.get(a) ?? (CHARS[a].first || 9) * 1000 + 900 + keys.indexOf(a)) - (pos.get(b) ?? (CHARS[b].first || 9) * 1000 + 900 + keys.indexOf(b)));
  return [...main, ...keys.filter((c) => CHARS[c].dil)];
})();

// Ve kterých znacích se díl objevuje.
const USED_IN = (() => {
  const map = {};
  for (const c of CHAR_ORDER) {
    for (const d of CHARS[c].dily) {
      for (const part of new Set([d.c])) {
        (map[part] = map[part] || []);
        if (!map[part].includes(c)) map[part].push(c);
      }
    }
  }
  return map;
})();

const charHash = (c) => `#znak-${c.codePointAt(0).toString(16)}`;

// Čtverec se znakem: odkaz na detail, když ho máme, jinak jen znak.
function charCell(c, size) {
  const style = size ? `--s:${size}px` : null;
  if (CHARS[c]) return h('a', { class: 'tzg', href: charHash(c), style, 'aria-label': `Znak ${c}: ${CHARS[c].cz}` }, c);
  return h('span', { class: 'tzg', style }, c);
}

// Dlaždice znaku s pinyinem a významem (mřížky ve Slovníku a v lekci).
function charTile(c) {
  const z = CHARS[c];
  return h('a', { class: `char-tile${isKnownChar(c) ? ' is-known' : ''}`, href: charHash(c) },
    h('span', { class: 'tzg', 'aria-hidden': 'true' }, c),
    h('span', { class: 'meta' }, pyEl(z.py), h('span', { class: 'tcz' }, z.cz)),
    isKnownChar(c) ? h('span', { class: 'known-dot', title: 'Umím' }, '✓') : null);
}

const typeChip = (typ) => h('span', { class: `type-chip ty-${typ}` }, CHAR_TYPES[typ] ? CHAR_TYPES[typ].label : typ);

// Tlačítko „Umím“ pro slovo (kind 'w', key zh|py) nebo znak (kind 'c').
function knownBtn(kind, key, opts = {}) {
  const isOn = () => (kind === 'w' ? isKnownWord(opts.word) : isKnownChar(key));
  const btn = h('button', { class: `known-btn${opts.compact ? ' compact' : ''}`, type: 'button' });
  const paint = () => {
    const on = isOn();
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? 'Umím (klepnutím odebereš)' : 'Přidat do Mého slovníku';
    btn.setAttribute('aria-label', on ? `Umím ${opts.label || key}, odebrat` : `Umím ${opts.label || key}`);
    btn.innerHTML = opts.compact ? (on ? '✓' : '+') : (on ? '✓ Umím' : 'Umím');
  };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setKnown(kind, key, !isOn());
    paint();
    if (opts.onChange) opts.onChange();
  });
  paint();
  return btn;
}

// ---------- Detail znaku ----------
function CharView(hex) {
  const c = String.fromCodePoint(parseInt(hex, 16));
  const z = CHARS[c];
  if (!z) return NotFoundView();
  const idx = CHAR_ORDER.indexOf(c);
  const prev = CHAR_ORDER[idx - 1];
  const next = CHAR_ORDER[idx + 1];
  const words = COURSE.vocab.filter((v) => v.zh.includes(c));
  const usedIn = (USED_IN[c] || []).filter((x) => x !== c);
  const t = CHAR_TYPES[z.typ] || { label: z.typ, desc: '' };

  const hero = h('header', { class: 'char-hero' },
    h('button', { class: 'tzg', type: 'button', 'aria-label': `Přehrát ${c}`, onclick: () => Speech.speak(c) }, c),
    h('div', { class: 'stack', style: 'gap:10px;min-width:0' },
      h('span', { class: 'eyebrow' }, z.dil ? 'Základní díl znaků' : z.first ? `Znak z lekce ${z.first}` : 'Znak'),
      h('h1', null, pyEl(z.py, 'char-py'), h('span', { class: 'hero-cz' }, z.cz)),
      h('div', { class: 'row' }, typeChip(z.typ), h('span', { class: 'muted', style: 'font-size:var(--fs-s)' }, t.desc)),
      h('div', { class: 'row' },
        sayBtn(c),
        STROKES[c] ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => Writer.open([c], 0) }, 'Tahy a psaní') : null,
        z.dil ? null : knownBtn('c', c, { label: c }))));

  // Rovnice: díly → znak
  const formula = z.dily.length
    ? h('div', { class: 'formula', 'aria-label': `${z.dily.map((d) => d.c).join(' + ')} = ${c}` },
      z.dily.map((d, i) => [i ? h('span', { class: 'op' }, '+') : null, charCell(d.c, 56)]),
      h('span', { class: 'op' }, '='),
      h('span', { class: 'tzg', style: '--s:56px' }, c))
    : null;
  const parts = h('section', { class: 'sheet stack' },
    h('h2', null, 'Z čeho se skládá'),
    formula,
    z.dily.length
      ? h('div', { class: 'parts' }, z.dily.map((d) => h('div', { class: 'part' },
        charCell(d.c, 44),
        h('span', { class: `role-chip role-${d.role}` }, ROLE_LABELS[d.role] || d.role),
        makeSayable(h('span', { class: 'part-cz' }, d.cz)))))
      : h('p', { class: 'muted' }, 'Tenhle znak se dál nedělí na díly s vlastním významem. Je to základní kostka, ze které se skládají jiné znaky.'));

  const story = h('section', { class: 'sheet stack' },
    h('h2', null, 'Jak znak vznikl'),
    makeSayable(h('p', { class: 'story' }, z.pribeh)),
    z.trad ? h('div', { class: 'trad' },
      h('span', { class: 'tzg', style: '--s:56px' }, z.trad),
      h('p', { class: 'muted' }, 'Tradiční podoba. Takhle se znak píše na Tchaj-wanu, v Hongkongu a ve starších textech. V pevninské Číně se používá zjednodušený tvar.')) : null);

  const used = usedIn.length ? h('section', { class: 'stack' },
    h('h2', { class: 'section-title' }, z.dil ? 'Najdeš ho v těchto znacích' : 'Je dílem i v těchto znacích'),
    h('div', { class: 'char-grid-tiles' }, usedIn.map(charTile))) : null;

  const wordList = words.length ? h('section', { class: 'stack' },
    h('h2', { class: 'section-title' }, 'Slova z kurzu'),
    h('div', { class: 'sheet', style: 'padding-block:4px' }, words.map((v) => vocabRow(v, { tag: true })))) : null;

  const nav = h('nav', { class: 'step-foot', 'aria-label': 'Další znaky' },
    prev ? h('a', { class: 'btn', href: charHash(prev) }, h('span', { html: ICONS.arrowL, style: 'display:contents' }), h('span', { class: 'zh' }, prev)) : h('span'),
    h('a', { class: 'btn', href: '#slovnik-znaky' }, 'Všechny znaky'),
    next ? h('a', { class: 'btn', href: charHash(next) }, h('span', { class: 'zh' }, next), h('span', { html: ICONS.arrowR, style: 'display:contents' })) : h('span'));

  return appendAll(h('div', { class: 'narrow stack-l' }), hero, parts, story, used, wordList, nav);
}

// ---------- Detail slova (okno) ----------
const WordSheet = {
  open(word) {
    const v = COURSE.vocab.find((x) => x.zh === word.zh) || null;
    const dlg = $('#word');
    const chars = [...new Set(onlyHan(word.zh))];
    const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Zavřít', html: ICONS.close, onclick: () => dlg.close() });
    const meaning = v && v.cz !== word.cz ? h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, `Ve slovníku: ${v.cz}`) : null;
    dlg.replaceChildren(
      h('div', { class: 'dlg-head' },
        h('div', { style: 'min-width:0' },
          h('h2', { id: 'word-title', class: 'zh', style: 'font-size:2rem;font-family:var(--font-han)' }, word.zh),
          h('div', { class: 'row' }, pyEl(word.py), h('span', null, `· ${word.cz}`))),
        close),
      h('div', { class: 'dlg-body' },
        meaning,
        h('div', { class: 'row' },
          sayBtn(word.zh),
          v ? knownBtn('w', cardKey(v), { word: v, label: v.zh }) : null,
          v ? h('a', { class: 'btn btn-small', href: `#l${v.l}-slovicka`, onclick: () => dlg.close() }, `Lekce ${v.l}`) : null),
        chars.length ? h('div', { class: 'stack', style: 'gap:8px' },
          h('span', { class: 'eyebrow' }, chars.length > 1 ? 'Znaky ve slově' : 'Znak'),
          chars.map((c) => {
            const z = CHARS[c];
            if (!z) return h('div', { class: 'part' }, h('span', { class: 'tzg', style: '--s:44px' }, c), h('span', { class: 'muted' }, 'Pro tenhle znak zatím nemám rozbor.'));
            return h('a', { class: 'part part-link', href: charHash(c), onclick: () => dlg.close() },
              h('span', { class: 'tzg', style: '--s:44px' }, c),
              h('span', { style: 'min-width:0' },
                h('span', { class: 'row', style: 'gap:6px' }, pyEl(z.py), h('b', null, z.cz)),
                h('span', { class: 'muted', style: 'display:block;font-size:var(--fs-s)' },
                  z.dily.length ? z.dily.map((d) => `${d.c} ${d.cz}`).join(' + ') : CHAR_TYPES[z.typ].label)),
              h('span', { class: 'chev', 'aria-hidden': 'true' }, '›'));
          })) : null));
    if (!dlg.open) dlg.showModal();
    if (hasHan(word.zh)) Speech.speak(word.zh);
  },
};
