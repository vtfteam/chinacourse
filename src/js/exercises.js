// Cvičení lekce s okamžitou kontrolou podle klíče.

const parseAnswer = (s) => {
  const [zh, py = ''] = s.split('|').map((x) => x.trim());
  return { zh, py };
};
const normZh = (s) => onlyHan(s);

function exerciseIds(lesson) {
  const ids = [];
  for (const set of lesson.exercises || []) {
    if (set.items && (set.type === 'build' || set.type === 'choice')) set.items.forEach((_, i) => ids.push(`l${lesson.n}:${set.id}:${i}`));
    else ids.push(`l${lesson.n}:${set.id}`);
  }
  return ids;
}

function recordResult(lesson, id, ok) {
  const prev = progress.ex[id];
  if (prev && prev.ok && !ok) return;
  progress.ex[id] = { ok, t: Date.now(), tries: ((prev && prev.tries) || 0) + 1 };
  const ids = exerciseIds(lesson);
  const all = ids.every((x) => progress.ex[x] && progress.ex[x].ok);
  if (all && !isStepDone(lesson.n, 'ex')) {
    progress.steps[stepId(lesson.n, 'ex')] = true;
    toast(`Cvičení lekce ${lesson.n} máš celé správně.`);
    const navItem = $$('.steps a')[STEPS.length - 1];
    if (navItem) navItem.classList.add('done');
  }
  commit();
}

function feedbackEl(ok, title, answer, note) {
  return h('div', { class: `feedback ${ok ? 'ok' : 'bad'}`, role: 'status' },
    h('span', { class: 'mark', 'aria-hidden': 'true' }, ok ? '✓' : '✗'),
    h('span', { class: 'title' }, title),
    answer ? h('div', { class: 'answer' }, h('span', { class: 'zh' }, answer.zh), answer.py ? pyEl(answer.py) : null, sayBtn(answer.zh, { small: true })) : null,
    note ? makeSayable(h('p', { class: 'note' }, note)) : null);
}

function renderExercises(lesson) {
  const wrap = h('div', { class: 'stack-l' });
  const key = COURSE.appendix.key[lesson.n];
  const ex = lesson.steps.ex;
  if (!lesson.exercises) {
    wrap.append(stepTitle(ex.title), renderBlocks(ex.blocks));
  } else {
    wrap.append(h('div', { class: 'stack' },
      stepTitle(ex.title),
      h('p', { class: 'muted' }, 'Skládej věty z kartiček, klepnutím kartičku vrátíš. Kontrola proběhne podle klíče z učebnice, a když je správných řešení víc, uzná všechna.')));
    for (const set of lesson.exercises) wrap.append(ExerciseSet(lesson, set));
  }
  if (key) {
    wrap.append(h('details', { class: 'key' },
      h('summary', null, 'Klíč z učebnice (pro kontrolu na papíře)'),
      makeSayable(h('div', { html: key }))));
  }
  return wrap;
}

function ExerciseSet(lesson, set) {
  const n = lesson.n;
  const score = h('span', { class: 'score' });
  const ids = set.items && (set.type === 'build' || set.type === 'choice')
    ? set.items.map((_, i) => `l${n}:${set.id}:${i}`)
    : [`l${n}:${set.id}`];
  const updateScore = () => {
    const ok = ids.filter((id) => progress.ex[id] && progress.ex[id].ok).length;
    score.textContent = `${ok} / ${ids.length}`;
    score.classList.toggle('full', ok === ids.length);
  };
  const onResult = (id, ok) => { recordResult(lesson, id, ok); updateScore(); };
  updateScore();

  let body;
  if (set.type === 'build') body = set.items.map((it, i) => BuildItem(set, it, ids[i], onResult));
  else if (set.type === 'choice') body = set.items.map((it, i) => ChoiceItem(set, it, ids[i], onResult));
  else if (set.type === 'pick') body = PickItem(set, ids[0], onResult);
  else if (set.type === 'sort') body = SortItem(set, ids[0], onResult);
  else if (set.type === 'write') body = WriteItem(set, ids[0], onResult);

  return h('section', { class: 'exset' },
    h('div', { class: 'exset-head' },
      makeSayable(h('h3', null, h('span', { class: 'id' }, `${set.id}.`), set.title)),
      set.type === 'write' ? null : score),
    body);
}

// ---------- Skládání věty ----------
function BuildItem(set, item, id, onResult) {
  const reuse = !!set.keypad;
  const tiles = reuse ? set.keypad : shuffle([...item.tiles, ...(item.extra || [])], hashStr(id));
  const answers = item.answers.map(parseAnswer);
  let chosen = [];
  let locked = false;
  let solvedText = '';

  const label = set.fix ? 'Oprav' : reuse ? 'Napiš' : hasHan(item.prompt) ? (item.prompt.includes(' / ') ? 'Seřaď' : 'Výchozí věta') : 'Přelož';
  const promptText = hasHan(item.prompt) && !item.prompt.includes(' / ')
    ? h('span', { class: `text zh hz-say${set.fix ? ' wrong' : ''}`, 'data-say': item.prompt }, item.prompt)
    : h('span', { class: `text${hasHan(item.prompt) ? ' zh' : ''}` }, item.prompt);
  const el = h('div', { class: 'item' });
  const slot = h('div', { class: 'slot', 'aria-label': 'Tvoje odpověď', role: 'group' });
  const bank = h('div', { class: 'bank', role: 'group', 'aria-label': 'Kartičky' });
  const fb = h('div', { 'aria-live': 'polite' });
  const checkBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zkontrolovat');
  const clearBtn = h('button', { class: 'btn', type: 'button' }, 'Smazat');
  const actions = h('div', { class: 'row' }, checkBtn, clearBtn);

  const tileBtn = (t, onclick, disabled) => h('button', { class: 'tile', type: 'button', disabled, onclick },
    h('span', { class: 'zh' }, t),
    COURSE.pinyin[t] ? h('span', { class: 'py' }, COURSE.pinyin[t]) : null);

  const draw = () => {
    slot.replaceChildren(...(chosen.length
      ? chosen.map((ti, k) => tileBtn(tiles[ti], () => { if (locked) return; chosen.splice(k, 1); fb.replaceChildren(); draw(); }))
      : locked && solvedText
        ? [h('span', { class: 'zh', style: 'font-size:1.375rem;padding:0 4px 4px' }, solvedText)]
        : [h('span', { class: 'placeholder' }, 'Klepej na kartičky dole a skládej odpověď.')]));
    bank.replaceChildren(...tiles.map((t, ti) => tileBtn(t, () => {
      if (locked) return;
      chosen.push(ti);
      fb.replaceChildren();
      draw();
    }, locked || (!reuse && chosen.includes(ti)))));
    bank.hidden = locked;
    checkBtn.disabled = locked;
    clearBtn.disabled = locked || !chosen.length;
  };

  const showSolved = (answer) => {
    locked = true;
    solvedText = answer.zh;
    el.classList.add('is-ok');
    const again = h('button', { class: 'btn btn-small', type: 'button', onclick: () => { locked = false; chosen = []; el.classList.remove('is-ok'); fb.replaceChildren(); actions.hidden = false; draw(); } }, 'Zkusit znovu');
    fb.replaceChildren(feedbackEl(true, 'Správně!', answer, item.note), h('div', { class: 'row', style: 'margin-top:8px' }, again));
    actions.hidden = true;
    draw();
  };

  checkBtn.addEventListener('click', () => {
    if (!chosen.length) { slot.classList.remove('shake'); void slot.offsetWidth; slot.classList.add('shake'); return; }
    const built = chosen.map((ti) => tiles[ti]).join('');
    const match = answers.find((a) => normZh(a.zh) === normZh(built));
    if (match) {
      onResult(id, true);
      Speech.speak(match.zh);
      showSolved(match);
    } else {
      onResult(id, false);
      const reveal = h('button', { class: 'btn btn-small', type: 'button', onclick: () => {
        fb.replaceChildren(feedbackEl(false, 'Řešení:', answers[0], item.note), h('p', { class: 'muted', style: 'font-size:var(--fs-s);margin-top:6px' }, 'Slož ho teď sám, ať si ho zapamatuješ.'));
      } }, 'Ukázat řešení');
      fb.replaceChildren(feedbackEl(false, 'Ještě ne. Zkus to znovu.', null, null), h('div', { class: 'row', style: 'margin-top:8px' }, reveal));
    }
  });
  clearBtn.addEventListener('click', () => { chosen = []; fb.replaceChildren(); draw(); });

  el.append(h('div', { class: 'prompt' }, h('span', { class: 'label' }, label), promptText), slot, bank, actions, fb);
  draw();
  const saved = progress.ex[id];
  if (saved && saved.ok) showSolved(answers[0]);
  return el;
}

// ---------- Doplňování ----------
function ChoiceItem(set, item, id, onResult) {
  const options = item.options || set.options;
  const full = parseAnswer(item.full);
  const [before, after] = item.prompt.split('___');
  const blank = h('span', { class: 'blank' }, '?');
  const fb = h('div', { 'aria-live': 'polite' });
  const el = h('div', { class: 'item' });
  let done = false;
  const optEls = options.map((o) => h('button', {
    class: 'tile', type: 'button', 'data-opt': o,
    onclick: (e) => {
      if (done) return;
      const ok = o === item.answer;
      onResult(id, ok);
      if (ok) {
        solve();
        Speech.speak(full.zh);
      } else {
        e.currentTarget.classList.add('wrong');
        fb.replaceChildren(feedbackEl(false, `${o} sem nepatří. Zkus to znovu.`, null, item.note));
      }
    },
  }, h('span', { class: 'zh' }, o), COURSE.pinyin[o] ? h('span', { class: 'py' }, COURSE.pinyin[o]) : null));
  const solve = () => {
    done = true;
    blank.textContent = item.answer;
    blank.classList.add('filled');
    el.classList.add('is-ok');
    optEls.forEach((b) => {
      const right = b.dataset.opt === item.answer;
      b.disabled = !right;
      b.classList.toggle('right', right);
      b.classList.remove('wrong');
    });
    fb.replaceChildren(feedbackEl(true, 'Správně!', full, item.note));
  };
  el.append(
    h('div', { class: 'prompt' }, h('span', { class: 'text zh' }, before, blank, after || '')),
    h('div', { class: 'options' }, optEls),
    fb);
  if (progress.ex[id] && progress.ex[id].ok) solve();
  return el;
}

// ---------- Výběr znaků s radikálem ----------
function PickItem(set, id, onResult) {
  const selected = new Set();
  const fb = h('div', { 'aria-live': 'polite' });
  const el = h('div', { class: 'item' });
  const cells = set.chars.map((c) => h('button', {
    class: 'tzg', type: 'button', 'aria-pressed': 'false', 'aria-label': c,
    onclick: (e) => {
      if (el.classList.contains('is-ok')) return;
      const b = e.currentTarget;
      if (selected.has(c)) selected.delete(c); else selected.add(c);
      b.setAttribute('aria-pressed', String(selected.has(c)));
      cells.forEach((x) => x.classList.remove('right', 'wrong'));
      fb.replaceChildren();
    },
  }, c));
  const check = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zkontrolovat');
  const showResult = (final) => {
    let ok = true;
    cells.forEach((b, i) => {
      const c = set.chars[i];
      const should = set.answer.includes(c);
      const has = selected.has(c);
      b.classList.toggle('right', has && should);
      b.classList.toggle('wrong', has !== should);
      if (has !== should) ok = false;
    });
    if (ok) {
      el.classList.add('is-ok');
      check.hidden = true;
      fb.replaceChildren(feedbackEl(true, `Správně: ${set.answer.join(', ')}.`, null, set.note));
    } else if (!final) {
      fb.replaceChildren(feedbackEl(false, 'Ještě ne. Červeně jsou znaky, které jsou označené špatně nebo chybí.', null, null));
    }
    return ok;
  };
  check.addEventListener('click', () => onResult(id, showResult(false)));
  el.append(h('div', { class: 'pick-grid', role: 'group', 'aria-label': 'Znaky' }, cells), h('div', { class: 'row' }, check), fb);
  if (progress.ex[id] && progress.ex[id].ok) {
    set.answer.forEach((c) => selected.add(c));
    cells.forEach((b, i) => b.setAttribute('aria-pressed', String(selected.has(set.chars[i]))));
    showResult(true);
  }
  return el;
}

// ---------- Třídění podle radikálu ----------
function SortItem(set, id, onResult) {
  const chosen = {};
  const fb = h('div', { 'aria-live': 'polite' });
  const el = h('div', { class: 'item' });
  const check = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, 'Zkontrolovat');
  const cards = set.items.map((it) => {
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': `Radikál znaku ${it.zh}` }, set.groups.map((g) =>
      h('button', {
        type: 'button', 'aria-pressed': 'false', title: g.label,
        onclick: (e) => {
          if (el.classList.contains('is-ok')) return;
          chosen[it.zh] = g.key;
          $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
          cards.forEach((c) => c.classList.remove('right', 'wrong'));
          check.disabled = Object.keys(chosen).length < set.items.length;
          fb.replaceChildren();
        },
      }, g.key)));
    return h('div', { class: 'sort-card' }, h('span', { class: 'tzg' }, it.zh), seg);
  });
  const showResult = () => {
    let ok = true;
    set.items.forEach((it, i) => {
      const good = chosen[it.zh] === it.group;
      cards[i].classList.toggle('right', good);
      cards[i].classList.toggle('wrong', !good);
      if (!good) ok = false;
    });
    if (ok) {
      el.classList.add('is-ok');
      check.hidden = true;
      fb.replaceChildren(feedbackEl(true, 'Správně roztříděno.', null,
        set.groups.map((g) => `${g.key} ${g.label}: ${set.items.filter((it) => it.group === g.key).map((it) => it.zh).join(', ')}`).join(' · ')));
    } else {
      fb.replaceChildren(feedbackEl(false, 'Některé znaky jsou ve špatné skupině (červeně).', null, null));
    }
    return ok;
  };
  check.addEventListener('click', () => onResult(id, showResult()));
  el.append(
    h('div', { class: 'legend' }, set.groups.map((g) => h('span', { style: '--c:var(--grid)' }, `${g.key} = ${g.label}`))),
    h('div', { class: 'sort-grid' }, cards), h('div', { class: 'row' }, check), fb);
  if (progress.ex[id] && progress.ex[id].ok) {
    set.items.forEach((it, i) => {
      chosen[it.zh] = it.group;
      $$('button', cards[i]).forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === it.group)));
    });
    showResult();
  }
  return el;
}

// ---------- Volné psaní ----------
function WriteItem(set, id, onResult) {
  const saved = progress.notes[id];
  const area = h('textarea', { id: `write-${id.replace(/:/g, '-')}`, 'aria-label': set.title, placeholder: '我叫……。我是……人。' });
  area.value = saved ? saved.text : '';
  const status = h('span', { class: 'muted', 'aria-live': 'polite', style: 'font-size:var(--fs-s)' }, saved ? 'Uloženo.' : '');
  const save = h('button', { class: 'btn btn-primary', type: 'button', onclick: () => {
    const text = area.value.trim();
    progress.notes[id] = { text, t: Date.now() };
    onResult(id, !!text);
    status.textContent = text ? 'Uloženo. Přečti si to nahlas.' : 'Prázdný text jsem neuložil.';
  } }, 'Uložit');
  const read = h('button', { class: 'btn', type: 'button', onclick: () => Speech.speak(area.value) }, 'Přečíst nahlas');
  return h('div', { class: 'item' },
    makeSayable(h('ul', { class: 'hints' }, set.hints.map((t) => h('li', null, t)))),
    h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, 'Piš čínskými znaky (s čínskou klávesnicí v telefonu nebo počítači), nebo pinyinem.'),
    area,
    h('div', { class: 'row' }, save, read, status),
    set.note ? h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, set.note) : null);
}
