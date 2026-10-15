// Slovník všech slov z kurzu s hledáním česky, pinyinem i znaky.

function DictionaryView() {
  const cfg = { q: '', lesson: 0 };
  const list = h('div', { class: 'sheet', style: 'padding-block:4px' });
  const count = h('p', { class: 'muted', 'aria-live': 'polite', style: 'font-size:var(--fs-s)' });
  const input = h('input', {
    class: 'search', id: 'dict-search', type: 'search', autocomplete: 'off',
    placeholder: 'Hledej: dobrý, hao, hǎo, 好…', 'aria-label': 'Hledat ve slovníku',
  });
  let open = null;

  const matches = (v) => {
    if (cfg.lesson && v.l !== cfg.lesson) return false;
    const q = cfg.q.trim();
    if (!q) return true;
    if (hasHan(q)) return v.zh.includes(onlyHan(q));
    const k = czKey(q);
    if (czKey(v.cz).includes(k)) return true;
    const pk = pyKey(q.replace(/[1-5]/g, ''));
    return !!pk && pyKey(v.py).includes(pk);
  };

  const draw = () => {
    const found = COURSE.vocab.filter(matches);
    count.textContent = `Zobrazeno ${found.length} z ${plural(COURSE.vocab.length, 'slova', 'slov', 'slov')}.`;
    if (!found.length) {
      list.replaceChildren(h('p', { class: 'muted', style: 'padding:16px 4px' }, 'Nic takového v kurzu není. Zkus jiné slovo nebo pinyin bez tónů.'));
      return;
    }
    list.replaceChildren(...found.map((v) => {
      const row = vocabRow(v, { tag: true });
      const detail = h('div', { class: 'detail' });
      const wrapRow = h('div', { class: 'dict-row' }, row);
      const chars = [...new Set(onlyHan(v.zh))].filter((c) => STROKES[c]);
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-expanded', 'false');
      const toggle = () => {
        if (open && open !== wrapRow) {
          open.querySelector('.detail')?.remove();
          open.querySelector('.vrow').setAttribute('aria-expanded', 'false');
        }
        if (wrapRow.contains(detail)) { detail.remove(); row.setAttribute('aria-expanded', 'false'); open = null; return; }
        detail.replaceChildren(
          chars.length ? h('div', { class: 'practice-chars' }, chars.map((c, i) =>
            h('button', { class: 'tzg', type: 'button', 'aria-label': `Tahy znaku ${c}`, onclick: () => Writer.open(chars, i) }, c))) : null,
          chars.length ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => Writer.open(chars, 0) }, 'Tahy a psaní') : null,
          h('a', { class: 'btn btn-small', href: `#l${v.l}-slovicka` }, `Lekce ${v.l}: ${lessonByN(v.l).title}`));
        wrapRow.append(detail);
        row.setAttribute('aria-expanded', 'true');
        open = wrapRow;
      };
      row.addEventListener('click', (e) => { if (!e.target.closest('button, a, .hz-say')) toggle(); });
      row.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); toggle(); } });
      return wrapRow;
    }));
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
  return h('div', { class: 'narrow stack' },
    h('header', { class: 'page-head' },
      h('span', { class: 'eyebrow' }, '词典 cídiǎn'),
      h('h1', null, 'Slovník'),
      h('p', { class: 'lead' }, 'Všechna slova z osmi lekcí. Klepni na řádek a uvidíš pořadí tahů každého znaku.')),
    input, chips, count, list);
}
