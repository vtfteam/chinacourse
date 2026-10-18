// Společné stavební prvky: text z učebnice, čtverce se znaky, křivky tónů.

// Bloky z Markdownu (odstavce, seznamy, tabulky, citace) → DOM.
function renderBlocks(blocks, opts = {}) {
  const frag = h('div', { class: opts.class || 'prose' });
  for (const b of blocks || []) frag.append(renderBlock(b));
  return makeSayable(frag);
}
function renderBlock(b) {
  if (b.t === 'p') return h('p', { html: b.html });
  if (b.t === 'list') return h(b.ordered ? 'ol' : 'ul', null, b.items.map((it) => h('li', { html: it.html })));
  if (b.t === 'quote') {
    const q = h('div', { class: 'quote' }, b.blocks.map(renderBlock));
    const zh = (b.blocks[0] && b.blocks[0].text) || '';
    if (hasHan(zh)) q.prepend(h('div', { class: 'row' }, sayBtn(zh.split('=')[0], { small: true })));
    return q;
  }
  if (b.t === 'table') return tableEl(b);
  return h('div');
}
function tableEl(b) {
  return h('div', { class: 'table-wrap' },
    h('table', null,
      h('thead', null, h('tr', null, b.head.map((c) => h('th', { html: c })))),
      h('tbody', null, b.rows.map((r) => h('tr', null, r.map((c) => h('td', { html: c })))))));
}

// Znaky v cvičných čtvercích 田字格.
function tzgRow(text, size) {
  const style = size ? `--s:${size}px` : null;
  return h('span', { class: 'tzg-row', 'aria-hidden': 'true' }, [...text].map((c) => h('span', { class: 'tzg', style }, c)));
}

// Křivka tónu podle Čaovy stupnice (5 = vysoko, 1 = nízko).
const CONTOURS = { 1: [5, 5], 2: [3, 5], 3: [2, 1, 4], 4: [5, 1], 5: null };
function contourSvg(tone) {
  const W = 64;
  const H = 44;
  const y = (lvl) => 4 + (5 - lvl) * 9;
  const levels = [1, 2, 3, 4, 5].map((l) => `<line class="lvl" x1="4" x2="${W - 4}" y1="${y(l)}" y2="${y(l)}"/>`).join('');
  const pts = CONTOURS[tone];
  let mark;
  if (!pts) mark = `<circle cx="${W / 2}" cy="${y(3)}" r="4.5"/>`;
  else {
    const d = pts.length === 3
      ? `M8 ${y(pts[0])} Q26 ${y(pts[1]) + 12} ${W - 8} ${y(pts[2])}`
      : `M8 ${y(pts[0])} L${W - 8} ${y(pts[1])}`;
    mark = `<path d="${d}"/>`;
  }
  return `<svg class="contour tc${tone}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tone === 5 ? 'neutrální tón' : `${tone}. tón`}">${levels}${mark}</svg>`;
}

// ---------- Psaní znaků (Hanzi Writer) ----------
const Writer = {
  dlg: null,
  writer: null,
  chars: [],
  index: 0,

  open(chars, start = 0) {
    this.chars = [...new Set([...chars].filter((c) => STROKES[c]))];
    if (!this.chars.length) { toast('Pro tenhle znak nemám data o tazích.'); return; }
    this.index = Math.max(0, this.chars.indexOf([...chars][start]));
    this.dlg = $('#writer');
    this.render();
    if (!this.dlg.open) this.dlg.showModal();
  },

  render() {
    const c = this.chars[this.index];
    const word = COURSE.vocab.find((v) => v.zh === c);
    const py = word ? word.py : COURSE.pinyin[c] || '';
    const status = h('p', { class: 'writer-status', 'aria-live': 'polite' }, 'Klepni na „Ukaž tahy“, nebo zkus znak napsat sám.');
    const target = h('div', { class: 'writer-target', id: 'writer-target' });
    const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Zavřít', html: ICONS.close, onclick: () => this.close() });
    const head = h('div', { class: 'dlg-head' },
      h('div', null, h('h2', { id: 'writer-title' }, 'Psaní znaku ', h('span', { class: 'zh' }, c)),
        h('div', { class: 'row' }, py ? pyEl(py) : null, word ? h('span', { class: 'muted' }, `· ${word.cz}`) : null)),
      close);
    const animate = h('button', { class: 'btn', type: 'button', onclick: () => this.animate(status) }, 'Ukaž tahy');
    const quiz = h('button', { class: 'btn btn-primary', type: 'button', onclick: () => this.quiz(status) }, h('span', { html: ICONS.brush, style: 'display:contents' }), 'Napiš sám');
    const picker = this.chars.length > 1
      ? h('div', { class: 'writer-chars', role: 'group', 'aria-label': 'Vyber znak' }, this.chars.map((ch, i) =>
        h('button', { type: 'button', 'aria-pressed': String(i === this.index), onclick: () => { this.index = i; this.render(); } }, ch)))
      : null;
    this.dlg.replaceChildren(head, h('div', { class: 'dlg-body' },
      h('div', { class: 'writer-box' }, target, status, h('div', { class: 'row' }, sayBtn(c), animate, quiz), picker)));
    this.mount(target, c, status);
  },

  mount(target, c, status) {
    this.writer = null;
    if (!window.HanziWriter) {
      target.append(h('span', { class: 'tzg', style: '--s:236px;border:0;background:transparent' }, c));
      status.textContent = 'Animace tahů potřebuje připojení k internetu (knihovna Hanzi Writer se nenačetla).';
      return;
    }
    const css = getComputedStyle(document.documentElement);
    const color = (name) => css.getPropertyValue(name).trim();
    this.writer = window.HanziWriter.create(target, c, {
      width: 236,
      height: 236,
      padding: 14,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 220,
      strokeColor: color('--ink'),
      outlineColor: color('--grid-faint'),
      highlightColor: color('--grid'),
      drawingColor: color('--seal'),
      drawingWidth: 18,
      charDataLoader: (ch, done) => done(STROKES[ch]),
    });
    this.writer.showCharacter();
  },

  animate(status) {
    if (!this.writer) return;
    const total = STROKES[this.chars[this.index]].strokes.length;
    status.textContent = `${plural(total, 'tah', 'tahy', 'tahů')}, sleduj pořadí.`;
    this.writer.hideCharacter();
    this.writer.animateCharacter();
  },

  quiz(status) {
    if (!this.writer) return;
    const total = STROKES[this.chars[this.index]].strokes.length;
    status.textContent = `Napiš znak tahem prstu nebo myší. Celkem ${plural(total, 'tah', 'tahy', 'tahů')}.`;
    this.writer.hideCharacter();
    this.writer.quiz({
      showHintAfterMisses: 2,
      onCorrectStroke: (d) => { status.textContent = `Tah ${d.strokeNum + 1} z ${total}: správně.`; },
      onMistake: (d) => { status.textContent = `Tah ${d.strokeNum + 1} z ${total}: zkus to znovu${d.mistakesOnStroke >= 2 ? ', nápověda svítí' : ''}.`; },
      onComplete: (d) => {
        status.textContent = d.totalMistakes ? `Hotovo! Chyb celkem: ${d.totalMistakes}.` : 'Hotovo bez chyby!';
      },
    });
  },

  close() {
    if (this.writer && this.writer.cancelQuiz) this.writer.cancelQuiz();
    this.dlg.close();
  },
};

// ---------- Nastavení ----------
const SettingsPanel = {
  open() {
    const dlg = $('#settings');
    const render = () => {
      const voices = Speech.voices;
      const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Zavřít', html: ICONS.close, onclick: () => dlg.close() });
      const check = (id, label, key, help) => h('div', { class: 'field' },
        h('label', { class: 'toggle', for: id },
          h('input', { type: 'checkbox', id, checked: settings[key], onchange: (e) => { settings[key] = e.target.checked; saveSettings(); } }),
          label),
        help ? h('span', { class: 'help' }, help) : null);
      const rates = [[0.6, 'Pomalu'], [0.85, 'Normálně'], [1, 'Rychle']];
      const rate = h('div', { class: 'seg', role: 'group', 'aria-label': 'Rychlost řeči' }, rates.map(([v, label]) =>
        h('button', { type: 'button', 'aria-pressed': String(settings.rate === v), onclick: () => { settings.rate = v; saveSettings(); render(); Speech.speak('你好，我叫王明。'); } }, label)));
      const voiceField = voices.length
        ? h('select', { id: 'voice-select', onchange: (e) => { settings.voice = e.target.value; saveSettings(); Speech.speak('认识你很高兴。'); } },
          h('option', { value: '' }, 'Automaticky'),
          voices.map((v) => h('option', { value: v.name, selected: settings.voice === v.name }, `${v.name} (${v.lang})`)))
        : h('span', { class: 'help' }, Speech.supported
          ? 'Čínský hlas zatím nevidím. Na telefonu ho přidáš v nastavení jazyka, na počítači pomůže Chrome nebo Edge.'
          : 'Tenhle prohlížeč neumí číst nahlas.');
      const reset = h('div', { class: 'row' });
      const askReset = () => {
        reset.replaceChildren(
          h('span', { class: 'help' }, 'Opravdu smazat všechen pokrok?'),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => { resetProgress(); dlg.close(); toast('Pokrok je smazaný.'); } }, 'Ano, smazat'),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => reset.replaceChildren(resetBtn) }, 'Ne'));
      };
      const resetBtn = h('button', { class: 'btn btn-small', type: 'button', onclick: askReset }, 'Smazat pokrok');
      reset.append(resetBtn);
      dlg.replaceChildren(
        h('div', { class: 'dlg-head' }, h('h2', { id: 'settings-title' }, 'Nastavení'), close),
        h('div', { class: 'dlg-body' },
          check('set-tones', 'Barevné tóny v pinyinu', 'tones', null),
          h('div', { class: 'legend', 'aria-hidden': 'true' },
            [1, 2, 3, 4, 5].map((t) => h('span', { style: `--c:var(--t${t})` }, t === 5 ? 'neutrální' : `${t}. tón`))),
          check('set-pinyin', 'Pinyin pod kartičkami ve cvičeních', 'pinyin', 'Když ho vypneš, skládáš věty jen podle znaků.'),
          h('div', { class: 'field' }, h('span', { class: 'label' }, 'Rychlost řeči'), rate),
          h('div', { class: 'field' }, h('label', { class: 'label', for: 'voice-select' }, 'Čínský hlas'), voiceField),
          h('div', { class: 'field' }, h('span', { class: 'label' }, 'Pokrok'), h('span', { class: 'help' }, Sync.status()), reset)));
    };
    render();
    dlg.showModal();
  },
};

function resetProgress() {
  const epoch = (progress.epoch || 0) + 1;
  progress = emptyProgress();
  progress.epoch = epoch;
  commit();
  route();
}
