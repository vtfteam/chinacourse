// Slovník: všechna slova, všechny znaky a Můj slovník (co umím).

const DICT_TABS = [
  { key: 'slova', hash: '#slovnik', label: 'Slova' },
  { key: 'znaky', hash: '#slovnik-znaky', label: 'Znaky' },
  { key: 'moje', hash: '#slovnik-moje', label: 'Můj slovník' },
];

function DictionaryView(tab = 'slova') {
  const current = DICT_TABS.find((t) => t.key === tab) || DICT_TABS[0];
  const tabs = h('nav', { class: 'tabs', 'aria-label': 'Části slovníku' }, DICT_TABS.map((t) =>
    h('a', { href: t.hash, 'aria-current': t === current ? 'page' : null }, t.label)));
  const body = current.key === 'znaky' ? CharsTab() : current.key === 'moje' ? MineTab() : WordsTab();
  return h('div', { class: 'narrow stack' },
    h('header', { class: 'page-head', style: 'margin-bottom:8px' },
      h('span', { class: 'eyebrow' }, '词典 cídiǎn'),
      h('h1', null, 'Slovník'),
      h('p', { class: 'lead' }, 'Slova a znaky z osmi lekcí. U každého znaku najdeš, z čeho se skládá a jak vznikl.')),
    tabs, body);
}

// ---------- Slova ----------
function WordsTab() {
  const cfg = { q: '', lesson: 0 };
  const list = h('div', { class: 'sheet', style: 'padding-block:4px' });
  const count = h('p', { class: 'muted', 'aria-live': 'polite', style: 'font-size:var(--fs-s)' });
  const input = h('input', {
    class: 'search', id: 'dict-search', type: 'search', autocomplete: 'off',
    placeholder: 'Hledej: dobrý, hao, hǎo, 好…', 'aria-label': 'Hledat ve slovníku',
  });

  const matches = (v) => {
    if (cfg.lesson && v.l !== cfg.lesson) return false;
    const q = cfg.q.trim();
    if (!q) return true;
    if (hasHan(q)) return v.zh.includes(onlyHan(q));
    if (czKey(v.cz).includes(czKey(q))) return true;
    const pk = pyKey(q.replace(/[1-5]/g, ''));
    return !!pk && pyKey(v.py).includes(pk);
  };

  const draw = () => {
    const found = COURSE.vocab.filter(matches);
    count.textContent = `Zobrazeno ${found.length} z ${plural(COURSE.vocab.length, 'slova', 'slov', 'slov')}. Klepni na slovo a uvidíš jeho znaky.`;
    if (!found.length) {
      list.replaceChildren(h('p', { class: 'muted', style: 'padding:16px 4px' }, 'Nic takového v kurzu není. Zkus jiné slovo nebo pinyin bez tónů.'));
      return;
    }
    list.replaceChildren(...found.map((v) => vocabRow(v, { tag: true, open: true })));
  };

  input.addEventListener('input', () => { cfg.q = input.value; draw(); });
  const chips = h('div', { class: 'row', role: 'group', 'aria-label': 'Filtrovat podle lekce' },
    [0, ...LESSONS.map((l) => l.n)].map((n) => h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(cfg.lesson === n),
      onclick: (e) => {
        cfg.lesson = n;
        $$('.chip', chips).forEach((c) => c.setAttribute('aria-pressed', String(c === e.currentTarget)));
        draw();
      },
    }, n ? `L${n}` : 'Všechny lekce')));

  draw();
  return h('div', { class: 'stack' }, input, chips, count, list);
}

// ---------- Znaky ----------
function CharsTab() {
  const groups = LESSONS.map((l) => ({
    title: `Lekce ${l.n}: ${l.title}`,
    chars: CHAR_ORDER.filter((c) => !CHARS[c].dil && CHARS[c].first === l.n),
  })).filter((g) => g.chars.length);
  const parts = CHAR_ORDER.filter((c) => CHARS[c].dil);
  const counts = {};
  for (const c of CHAR_ORDER) if (!CHARS[c].dil) counts[CHARS[c].typ] = (counts[CHARS[c].typ] || 0) + 1;

  const types = h('section', { class: 'sheet stack' },
    h('h2', null, 'Jak znaky vznikají'),
    h('p', { class: 'muted' }, 'Každý znak patří k jednomu ze šesti typů. Když víš, jak znak vznikl, nepamatuješ si čáranice, ale příběh.'),
    h('div', { class: 'type-list' }, Object.entries(CHAR_TYPES).map(([k, t]) => h('div', { class: 'type-row' },
      typeChip(k),
      h('span', null, t.desc),
      h('span', { class: 'muted num' }, String(counts[k] || 0))))));

  return h('div', { class: 'stack-l' },
    types,
    groups.map((g) => h('section', { class: 'stack' },
      h('h2', { class: 'section-title' }, g.title),
      h('div', { class: 'char-grid-tiles' }, g.chars.map(charTile)))),
    h('section', { class: 'stack' },
      h('h2', { class: 'section-title' }, 'Základní díly (radikály)'),
      h('p', { class: 'muted' }, 'Kostky, ze kterých se skládají ostatní znaky. Když je poznáš, uhodneš u nového znaku, o čem asi je.'),
      h('div', { class: 'char-grid-tiles' }, parts.map(charTile))));
}

// ---------- Můj slovník ----------
function MineTab() {
  const wrap = h('div', { class: 'stack-l' });
  const draw = () => {
    const chars = CHAR_ORDER.filter((c) => !CHARS[c].dil && isKnownChar(c));
    const words = COURSE.vocab.filter(isKnownWord);
    const fromCards = words.filter((v) => !knownMark('w', cardKey(v))).length;
    const totalChars = CHAR_ORDER.filter((c) => !CHARS[c].dil).length;
    wrap.replaceChildren(
      h('div', { class: 'statline' },
        h('span', null, 'Znaky, které umíš ', h('b', null, `${chars.length} / ${totalChars}`)),
        h('span', null, 'Slova, která umíš ', h('b', null, `${words.length} / ${COURSE.vocab.length}`))),
      h('section', { class: 'stack' },
        h('h2', { class: 'section-title' }, 'Moje znaky'),
        chars.length
          ? h('div', { class: 'char-grid-tiles' }, chars.map(charTile))
          : h('p', { class: 'muted' }, 'Zatím žádné. Otevři znak (ve Slovníku na záložce Znaky nebo v lekci) a klepni na „Umím“.')),
      h('section', { class: 'stack' },
        h('h2', { class: 'section-title' }, 'Moje slova'),
        fromCards ? h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, `${plural(fromCards, 'slovo je', 'slova jsou', 'slov je')} tu z kartiček, kde patří mezi naučená. Tlačítkem ✓ je můžeš odebrat.`) : null,
        words.length
          ? h('div', { class: 'sheet', style: 'padding-block:4px' }, words.map((v) => vocabRow(v, { tag: true, open: true, onKnownChange: draw })))
          : h('p', { class: 'muted' }, 'Zatím žádná. U slova klepni na „+“, nebo ho v kartičkách několikrát označ „Umím“ a přidá se samo.')));
  };
  draw();
  return wrap;
}
