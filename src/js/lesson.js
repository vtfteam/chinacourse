// Lekce: sedm kroků od dialogu po cvičení.

let leaveHandlers = [];
const onLeave = (fn) => leaveHandlers.push(fn);
function runLeave() {
  leaveHandlers.forEach((fn) => { try { fn(); } catch (e) { /* nic */ } });
  leaveHandlers = [];
}

function LessonView(n, slug) {
  const lesson = lessonByN(n);
  if (!lesson) return NotFoundView();
  let step = STEPS.find((s) => s.slug === slug);
  if (!step) {
    const last = progress.last && progress.last.n === n ? STEPS.find((s) => s.key === progress.last.step) : null;
    step = last || STEPS.find((s) => !isStepDone(n, s.key)) || STEPS[0];
  }
  setLast(n, step.key);
  const idx = STEPS.indexOf(step);

  const head = h('header', { class: 'lesson-head' },
    h('div', null,
      h('span', { class: 'eyebrow' }, `Lekce ${n} z ${LESSONS.length}`),
      h('h1', null, lesson.title),
      h('p', null, lesson.goal.map((g) => g.text).join(' '))),
    h('button', { class: 'tzg-row', type: 'button', style: 'border:0;background:none;padding:0;cursor:pointer', 'aria-label': `Přehrát ${lesson.key} ${lesson.keyPy}`, onclick: () => Speech.speak(lesson.key) },
      [...lesson.key].map((c) => h('span', { class: 'tzg' }, c))));

  const nav = h('nav', { class: 'steps', 'aria-label': 'Kroky lekce' }, STEPS.map((s, i) =>
    h('a', {
      href: `#l${n}-${s.slug}`,
      class: isStepDone(n, s.key) ? 'done' : null,
      'aria-current': s === step ? 'step' : null,
    }, h('span', { class: 'num', html: isStepDone(n, s.key) ? ICONS.check.replace('<svg', '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"') : String(i + 1) }), s.label)));

  const renderers = {
    dialog: renderDialog, vocab: renderVocab, grammar: renderGrammar, chars: renderChars,
    pron: renderPron, speak: renderSpeak, ex: renderExercises,
  };
  const body = renderers[step.key](lesson);

  const prev = idx > 0
    ? h('a', { class: 'btn', href: `#l${n}-${STEPS[idx - 1].slug}` }, h('span', { html: ICONS.arrowL, style: 'display:contents' }), STEPS[idx - 1].label)
    : n > 1 ? h('a', { class: 'btn', href: `#l${n - 1}-cviceni` }, h('span', { html: ICONS.arrowL, style: 'display:contents' }), `Lekce ${n - 1}`) : h('span');
  let next;
  if (step.key === 'ex') {
    next = n < LESSONS.length
      ? h('a', { class: 'btn btn-primary', href: `#l${n + 1}-dialog` }, `Lekce ${n + 1}: ${lessonByN(n + 1).title}`, h('span', { html: ICONS.arrowR, style: 'display:contents' }))
      : h('a', { class: 'btn btn-primary', href: '#prirucka' }, 'Příručka a co dál', h('span', { html: ICONS.arrowR, style: 'display:contents' }));
  } else {
    next = h('button', {
      class: 'btn btn-primary', type: 'button',
      onclick: () => { markStep(n, step.key); location.hash = `#l${n}-${STEPS[idx + 1].slug}`; },
    }, isStepDone(n, step.key) ? `Dál: ${STEPS[idx + 1].label}` : `Hotovo, dál: ${STEPS[idx + 1].label}`, h('span', { html: ICONS.arrowR, style: 'display:contents' }));
  }

  return h('div', null, head, nav, h('section', { 'aria-label': step.label }, body), h('div', { class: 'step-foot' }, prev, next));
}

const stepTitle = (title, ...extra) => h('div', { class: 'step-title' }, h('h2', null, title), extra);

// ---------- Dialog ----------
function renderDialog(lesson) {
  const d = lesson.steps.dialog;
  const roles = d.roles;
  const state = { role: null, playing: 0, explainAll: false };
  const wrap = h('div', { class: 'stack' });
  const list = h('div', { class: 'dialog' });
  const pitch = (who) => [1, 0.82, 1.18][Math.max(0, roles.indexOf(who))] || 1;

  const lineEls = [];
  const draw = () => {
    list.replaceChildren();
    lineEls.length = 0;
    d.lines.forEach((ln, i) => {
      if (ln.stage) { list.append(h('p', { class: 'stage', html: ln.stage })); lineEls.push(null); return; }
      const mine = state.role === ln.who;
      const el = h('div', { class: `line${mine ? ' mine' : ''}`, 'data-i': i },
        h('div', { class: 'who', 'data-r': roles.indexOf(ln.who) }, ln.who));
      const text = h('div', { style: 'min-width:0' },
        h('div', { class: 'zh' }, ln.zh),
        pyEl(ln.py, 'line-py'),
        h('div', { class: 'cz line-cz', html: ln.cz }),
        ln.ex ? explainToggle(ln.ex, state.explainAll) : null);
      if (mine) {
        const reveal = h('button', { class: 'btn btn-small', type: 'button' }, 'Řekl(a) jsem to, ukaž správně');
        const prompt = h('div', { class: 'mine-prompt' }, h('span', { class: 'eyebrow' }, 'Tvoje replika'), h('div', { class: 'cz', html: ln.cz }), reveal);
        reveal.addEventListener('click', () => {
          prompt.replaceWith(text);
          el.dataset.revealed = '1';
          Speech.speak(ln.zh, { pitch: pitch(ln.who) }).then(() => el.dispatchEvent(new Event('revealed')));
        });
        el.append(prompt, sayBtn(ln.zh, { pitch: pitch(ln.who) }));
      } else {
        el.append(text, sayBtn(ln.zh, { pitch: pitch(ln.who) }));
      }
      list.append(el);
      lineEls.push(el);
    });
  };

  const highlight = (i) => {
    lineEls.forEach((el, k) => el && el.classList.toggle('current', k === i));
    if (i >= 0 && lineEls[i]) lineEls[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  const stop = () => {
    state.playing++;
    Speech.stop();
    highlight(-1);
    playBtn.dataset.on = '';
    playBtn.textContent = state.role ? 'Spustit scénku' : 'Přehrát celý dialog';
  };
  onLeave(stop);

  const playAll = async () => {
    if (playBtn.dataset.on === '1') { stop(); return; }
    const token = ++state.playing;
    playBtn.dataset.on = '1';
    playBtn.textContent = 'Zastavit';
    for (let i = 0; i < d.lines.length; i++) {
      const ln = d.lines[i];
      if (ln.stage) continue;
      if (token !== state.playing) return;
      highlight(i);
      const el = lineEls[i];
      if (state.role === ln.who && el && el.dataset.revealed !== '1') {
        const btn = el.querySelector('.mine-prompt .btn');
        if (btn) btn.focus({ preventScroll: true });
        await new Promise((res) => el.addEventListener('revealed', res, { once: true }));
      } else {
        await Speech.speak(ln.zh, { pitch: pitch(ln.who) });
        await new Promise((res) => setTimeout(res, 350));
      }
    }
    if (token === state.playing) stop();
  };

  const playBtn = h('button', { class: 'btn btn-ink', type: 'button', onclick: playAll }, 'Přehrát celý dialog');
  const pyToggle = h('label', { class: 'toggle', for: 'dlg-py' }, h('input', { type: 'checkbox', id: 'dlg-py', checked: true, onchange: (e) => wrap.classList.toggle('hide-py', !e.target.checked) }), 'Pinyin');
  const czToggle = h('label', { class: 'toggle', for: 'dlg-cz' }, h('input', { type: 'checkbox', id: 'dlg-cz', checked: true, onchange: (e) => wrap.classList.toggle('hide-cz', !e.target.checked) }), 'Překlad');
  const explainAllToggle = h('label', { class: 'toggle', for: 'dlg-explain' }, h('input', {
    type: 'checkbox', id: 'dlg-explain',
    onchange: (e) => {
      state.explainAll = e.target.checked;
      $$('.explain-btn', list).forEach((b) => { if ((b.getAttribute('aria-expanded') === 'true') !== state.explainAll) b.click(); });
    },
  }), 'Rozbor u všech vět');
  const roleSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Hraj roli' },
    [null, ...roles].map((r) => h('button', {
      type: 'button',
      'aria-pressed': String(state.role === r),
      onclick: (e) => {
        state.role = r;
        stop();
        $$('button', roleSeg).forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
        playBtn.textContent = r ? 'Spustit scénku' : 'Přehrát celý dialog';
        draw();
      },
    }, r ? `Hraju: ${r}` : 'Jen poslouchám')));

  draw();
  appendAll(wrap,
    stepTitle(`Dialog: ${d.title}`),
    d.intro.length ? renderBlocks(d.intro) : null,
    h('div', { class: 'toolbar' }, playBtn, pyToggle, czToggle, explainAllToggle),
    h('div', { class: 'toolbar' }, h('span', { class: 'muted', style: 'font-size:var(--fs-s)' }, 'Scénka:'), roleSeg),
    list,
    d.notes.length ? renderBlocks(d.notes) : null,
    h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, 'Čti dialog nahlas, dokud ho nezvládneš zpaměti. Ve scénce si vyber roli: aplikace řekne repliky druhých a ty odpovídáš. Pod každou větou je rozbor: z jakých slov se skládá a jak je myšlená.'));
  return wrap;
}

// Tlačítko „Rozbor věty“ s rozbalovacím panelem.
function explainToggle(ex, open) {
  const panel = explainPanel(ex);
  panel.hidden = !open;
  const btn = h('button', { class: 'explain-btn', type: 'button', 'aria-expanded': String(!!open) }, 'Rozbor věty');
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(on));
    panel.hidden = !on;
  });
  return h('div', null, btn, panel);
}

function explainPanel(ex) {
  const words = ex.words.map((w) => {
    const sayable = hasHan(w.zh);
    return h(sayable ? 'button' : 'span', {
      class: `word${w.isNew ? ' is-new' : ''}`,
      type: sayable ? 'button' : null,
      title: sayable ? 'Detail slova' : null,
      onclick: sayable ? () => WordSheet.open(w) : null,
    },
    w.isNew ? h('span', { class: 'badge-new' }, 'nové') : null,
    h('span', { class: 'zh' }, w.zh),
    pyEl(w.py),
    h('span', { class: 'wcz' }, w.cz));
  });
  return h('div', { class: 'explain' },
    h('div', { class: 'words', role: 'list', 'aria-label': 'Slova ve větě' }, words),
    h('p', { class: 'lit' }, h('b', null, 'Doslova: '), ex.lit),
    makeSayable(h('p', { class: 'note' }, ex.note)));
}

// ---------- Slovíčka ----------
// Řádek slovíčka. open: klepnutí otevře detail slova; vpravo přehrání a „Umím“.
function vocabRow(v, opts = {}) {
  const cz = h('span', { class: 'cz', html: v.czHtml || escapeHtml(v.cz) });
  cz.addEventListener('click', (e) => {
    if (cz.closest('.hide-meaning')) { e.stopPropagation(); cz.classList.toggle('peek'); }
  });
  const row = h('div', { class: `vrow${opts.open ? ' vrow-open' : ''}` },
    h('span', { class: 'zh' }, v.zh),
    pyEl(v.py),
    h('span', null, cz, opts.tag ? h('a', { class: 'tag', href: `#l${v.l}-slovicka`, style: 'margin-left:8px' }, `L${v.l}`) : null),
    h('span', { class: 'vrow-actions' },
      sayBtn(v.zh),
      v.l ? knownBtn('w', cardKey(v), { word: v, label: v.zh, compact: true, onChange: opts.onKnownChange }) : null));
  if (opts.open) {
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', `${v.zh} ${v.py}: ${v.cz}. Otevřít detail slova`);
    const open = () => WordSheet.open(v);
    row.addEventListener('click', (e) => { if (!e.target.closest('button, a')) open(); });
    row.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); open(); } });
  }
  return row;
}

function renderVocab(lesson) {
  const s = lesson.steps.vocab;
  const words = COURSE.vocab.filter((v) => v.l === lesson.n);
  const list = h('div', { class: 'vocab sheet', style: 'padding-block:4px' }, words.map((v) => vocabRow(v, { open: true })));
  const hide = h('label', { class: 'toggle', for: 'vocab-hide' },
    h('input', { type: 'checkbox', id: 'vocab-hide', onchange: (e) => list.classList.toggle('hide-meaning', e.target.checked) }),
    'Zakrýt význam (klepnutím ho odkryješ)');
  const extras = (arr) => arr.map((x) => h('section', { class: 'stack' }, h('h3', { class: 'section-title' }, x.title), renderBlocks(x.blocks)));
  const newChars = h('section', { class: 'sheet stack' },
    h('div', { class: 'row', style: 'justify-content:space-between' },
      h('h2', null, 'Nové znaky v této lekci'),
      h('span', { class: 'muted' }, plural(lesson.newChars.length, 'znak', 'znaky', 'znaků'))),
    h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, 'Tyhle znaky se v kurzu objevují poprvé. Klepni na znak a uvidíš, z čeho se skládá a jak vznikl. Klepnutím na slovo otevřeš jeho znaky.'),
    h('div', { class: 'practice-chars' }, lesson.newChars.map((c) => charCell(c))));
  return h('div', { class: 'stack-l' },
    newChars,
    extras(s.before),
    h('section', { class: 'stack' },
      stepTitle('Slovíčka', h('span', { class: 'muted' }, plural(words.length, 'slovo', 'slova', 'slov'))),
      h('div', { class: 'toolbar' }, hide, h('a', { class: 'btn btn-small', href: `#karticky-l${lesson.n}` }, 'Procvičit v kartičkách')),
      list,
      s.notes.length ? renderBlocks(s.notes) : null),
    extras(s.after),
    QuickQuiz(words, lesson.n));
}

// Rychlý test: znak → význam, čtyři možnosti.
function QuickQuiz(words, n) {
  const box = h('section', { class: 'sheet stack' });
  const start = () => {
    const pool = shuffle(words).slice(0, Math.min(8, words.length));
    let i = 0;
    let score = 0;
    const ask = () => {
      if (i >= pool.length) {
        box.replaceChildren(
          h('h2', null, 'Rychlý test slovíček'),
          h('p', null, `Výsledek: ${score} z ${pool.length}. ${score === pool.length ? 'Výborně!' : 'Co nevíš, procvič v kartičkách.'}`),
          h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: start }, 'Znovu'), h('a', { class: 'btn', href: `#karticky-l${n}` }, 'Kartičky lekce')));
        return;
      }
      const w = pool[i];
      const others = shuffle(COURSE.vocab.filter((v) => v.cz !== w.cz && (v.l === n || words.length < 6))).slice(0, 3);
      const opts = shuffle([w, ...others]);
      let answered = false;
      const optionEls = opts.map((o) => h('button', {
        class: 'tile', type: 'button', style: 'font-size:var(--fs-s);font-weight:600;flex:1 1 40%',
        onclick: (e) => {
          if (answered) return;
          answered = true;
          const ok = o === w;
          if (ok) score++;
          e.currentTarget.classList.add(ok ? 'right' : 'wrong');
          optionEls[opts.indexOf(w)].classList.add('right');
          Speech.speak(w.zh);
          setTimeout(() => { i++; ask(); }, ok ? 900 : 1700);
        },
      }, o.cz));
      box.replaceChildren(
        h('div', { class: 'row', style: 'justify-content:space-between' }, h('h2', null, 'Rychlý test slovíček'), h('span', { class: 'score' }, `${i + 1} / ${pool.length}`)),
        h('div', { class: 'quiz-card', style: 'border:0;padding:8px' },
          tzgRow(w.zh.replace(/[^\p{Script=Han}]/gu, '').slice(0, 4), 72),
          h('div', { class: 'row' }, pyEl(w.py), sayBtn(w.zh, { small: true })),
          h('div', { class: 'options quiz-options' }, optionEls)));
    };
    ask();
  };
  box.append(
    h('h2', null, 'Rychlý test slovíček'),
    h('p', { class: 'muted' }, 'Osm otázek: uvidíš znak a vybereš, co znamená.'),
    h('div', null, h('button', { class: 'btn', type: 'button', onclick: start }, 'Spustit test')));
  return box;
}

// ---------- Gramatika ----------
function renderGrammar(lesson) {
  const g = lesson.steps.grammar;
  return h('div', { class: 'stack' },
    stepTitle('Gramatika', h('span', { class: 'muted' }, plural(g.points.length, 'vzorec', 'vzorce', 'vzorců'))),
    g.intro.length ? renderBlocks(g.intro) : null,
    h('div', { class: 'gpoints' }, g.points.map((p) =>
      h('article', { class: 'gpoint sheet' },
        h('span', { class: 'n' }, p.n),
        h('div', { style: 'min-width:0' }, h('h3', { html: p.title.replace(/\.$/, '') }), renderBlocks(p.blocks))))));
}

// ---------- Znaky ----------
function renderChars(lesson) {
  const c = lesson.steps.chars;
  const wrap = h('div', { class: 'stack-l' });
  const head = h('div', { class: 'stack' }, stepTitle(`Znaky: ${c.title}`));
  if (c.items.length) {
    head.append(h('div', { class: 'char-grid' }, c.items.map((it) => {
      const cell = charCell(it.zh, 84);
      return h('article', { class: 'char-card' },
        cell,
        h('div', { style: 'min-width:0' },
          h('div', { class: 'row' }, pyEl(it.py)),
          makeSayable(h('div', { class: 'parts', html: it.parts })),
          makeSayable(h('div', { class: 'memo', html: it.memo })),
          h('div', { class: 'row' }, sayBtn(it.zh, { small: true }),
            CHARS[it.zh] ? h('a', { class: 'btn btn-small', href: charHash(it.zh) }, 'Jak vznikl') : null,
            h('button', { class: 'btn btn-small', type: 'button', onclick: () => Writer.open(c.practice, c.practice.indexOf(it.zh)) }, 'Tahy'))));
    })));
  }
  if (c.blocks.length) appendAll(head, renderBlocks(c.blocks, { class: c.items.length ? 'prose callout' : 'prose' }));
  wrap.append(head);
  wrap.append(h('section', { class: 'stack' },
    h('h2', { class: 'section-title' }, 'Všechny nové znaky lekce'),
    h('p', { class: 'muted' }, 'U každého znaku najdeš, z jakých dílů se skládá, jakou roli díly hrají (význam, nebo zvuk) a jak znak vznikl.'),
    h('div', { class: 'char-grid-tiles' }, lesson.newChars.map(charTile))));
  const practice = c.practice.filter((ch) => STROKES[ch]);
  if (practice.length) {
    wrap.append(h('section', { class: 'sheet stack' },
      h('h2', null, 'Procvič psaní'),
      h('p', { class: 'muted' }, 'Vyber znak. Nejdřív se podívej na pořadí tahů, pak ho zkus napsat prstem nebo myší.'),
      h('div', { class: 'practice-chars' }, practice.map((ch, i) =>
        h('button', { class: 'tzg', type: 'button', 'aria-label': `Psát ${ch}`, onclick: () => Writer.open(practice, i) }, ch)))));
  }
  return wrap;
}

// ---------- Výslovnost ----------
function renderPron(lesson) {
  const p = lesson.steps.pron;
  return h('div', { class: 'stack' }, stepTitle(`Výslovnost: ${p.title}`), renderBlocks(p.blocks));
}

// ---------- Mluvení ----------
function renderSpeak(lesson) {
  const s = lesson.steps.speak;
  const items = [];
  for (const b of s.blocks) if (b.t === 'list') items.push(...b.items);
  return h('div', { class: 'stack' },
    stepTitle('Mluvení: řekni nahlas'),
    h('p', { class: 'muted' }, 'Přehraj si vzor, zopakuj ho nahlas a pak doplň vlastní slova. Na přesnosti tónů záleží víc než na rychlosti.'),
    h('div', { class: 'speak-list' }, items.map((it, i) =>
      h('div', { class: 'speak-item' },
        h('span', { class: 'n' }, i + 1),
        makeSayable(h('div', { class: 'text', html: it.html })),
        hasHan(it.text) ? sayBtn(it.text) : h('span')))));
}

function NotFoundView() {
  return h('div', { class: 'narrow stack' }, h('h1', null, 'Tahle stránka neexistuje'), h('p', null, h('a', { href: '#domu' }, 'Zpět na lekce')));
}
