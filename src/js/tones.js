// Trenažér tónů: poslechni (nebo přečti) slovo a vyber správný pinyin.

const TONE_NAMES = { 1: '1. tón', 2: '2. tón', 3: '3. tón', 4: '4. tón', 5: 'neutrální' };

// Pinyin rozložený na slova a slabiky, aby šel znovu složit se změněným tónem.
function pyStructure(py) {
  const tokens = py.normalize('NFC').split(/(\s+)/);
  const sylls = [];
  const words = tokens.map((tok, wi) => {
    if (!tok.trim()) return null;
    const parts = splitWord(tok);
    if (!parts) return undefined;
    parts.forEach((p, pi) => sylls.push({ wi, pi, tone: p.tone }));
    return parts.map((p) => p.text);
  });
  if (words.includes(undefined)) return null;
  return { tokens, words, sylls };
}
function pyWithTone(struct, idx, tone) {
  const s = struct.sylls[idx];
  return struct.tokens.map((tok, wi) => {
    if (!struct.words[wi]) return tok;
    return struct.words[wi].map((text, pi) => (wi === s.wi && pi === s.pi ? setTone(text, tone) : text)).join('');
  }).join('');
}
function toneVariants(py) {
  const st = pyStructure(py);
  if (!st) return [];
  const out = new Set();
  st.sylls.forEach((s, i) => {
    for (const t of [1, 2, 3, 4]) if (t !== s.tone) out.add(pyWithTone(st, i, t));
  });
  out.delete(py);
  return [...out];
}

function tonePool(lessons, listening) {
  return COURSE.vocab.filter((v) => {
    if (!lessons.includes(v.l) || /[…/]/.test(v.zh) || v.py.includes('/')) return false;
    const syl = syllables(v.py);
    if (!syl || syl.length < 1 || syl.length > 2) return false;
    if (onlyHan(v.zh).length !== syl.length) return false;
    if (listening) {
      // Tónové změny (3+3, 一, 不) by sluch zmátly.
      if (/[一不]/.test(v.zh)) return false;
      if (syl.length === 2 && syl[0].tone === 3 && syl[1].tone === 3) return false;
    }
    return toneVariants(v.py).length >= 3;
  });
}

function TonesView() {
  const wrap = h('div', { class: 'narrow stack-l' });
  const cfg = loadJSON('cinstina-krok-za-krokem/tony', { mode: 'listen', lessons: LESSONS.map((l) => l.n) });
  const saveCfg = () => saveJSON('cinstina-krok-za-krokem/tony', cfg);
  const game = h('section', { class: 'stack' });

  const legend = h('div', { class: 'tone-cards' }, [['妈', 'mā', 'máma'], ['麻', 'má', 'konopí'], ['马', 'mǎ', 'kůň'], ['骂', 'mà', 'nadávat'], ['吗', 'ma', 'otázka']].map(([zh, py, cz], i) => {
    const tone = i + 1;
    return h('div', { class: 'tone-card' },
      h('span', { class: 'eyebrow', style: 'color:var(--ink-soft)' }, TONE_NAMES[tone]),
      h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: `mark tc${tone}` }, py), h('span', { html: contourSvg(tone) })),
      h('div', { class: 'ex' }, h('span', { class: 'zh' }, zh), h('span', { class: 'muted' }, cz), sayBtn(zh, { small: true })));
  }));

  const controls = () => {
    const modeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Režim' },
      [['listen', 'Poslouchej'], ['read', 'Čti znaky']].map(([k, label]) =>
        h('button', { type: 'button', 'aria-pressed': String(cfg.mode === k), onclick: () => { cfg.mode = k; saveCfg(); start(); } }, label)));
    const chips = h('div', { class: 'row', role: 'group', 'aria-label': 'Lekce' }, LESSONS.map((l) =>
      h('button', {
        class: 'chip', type: 'button', 'aria-pressed': String(cfg.lessons.includes(l.n)),
        onclick: () => {
          const i = cfg.lessons.indexOf(l.n);
          if (i >= 0) { if (cfg.lessons.length > 1) cfg.lessons.splice(i, 1); } else cfg.lessons.push(l.n);
          saveCfg();
          start();
        },
      }, `L${l.n}`)));
    return h('div', { class: 'sheet stack' },
      h('div', { class: 'toolbar', style: 'margin:0' }, modeSeg),
      h('div', { class: 'field' }, h('span', { style: 'font-weight:700;font-size:var(--fs-s)' }, 'Slova z lekcí'), chips),
      cfg.mode === 'listen' && Speech.loaded && !Speech.hasVoice()
        ? h('p', { class: 'help muted', style: 'font-size:var(--fs-s)' }, 'V zařízení nevidím čínský hlas, poslech nemusí fungovat. Zkus režim „Čti znaky“.')
        : null);
  };

  const start = () => {
    const listening = cfg.mode === 'listen';
    const pool = shuffle(tonePool(cfg.lessons, listening));
    const rounds = pool.slice(0, 10);
    let i = 0;
    let score = 0;
    let streak = 0;
    const ask = () => {
      if (i >= rounds.length) {
        game.replaceChildren(controls(), h('div', { class: 'quiz-card' },
          h('span', { class: 'eyebrow' }, 'Výsledek'),
          h('h2', { style: 'font-size:var(--fs-2xl)' }, `${score} z ${rounds.length}`),
          h('p', { class: 'muted' }, score === rounds.length ? 'Bez chyby. Tvoje ucho už tóny slyší.' : 'Tóny chtějí čas. Zkus další kolo, každé má jiná slova.'),
          h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Další kolo')));
        return;
      }
      const v = rounds[i];
      const options = shuffle([v.py, ...shuffle(toneVariants(v.py)).slice(0, 3)]);
      let answered = false;
      const reveal = h('div', { class: 'stack', style: 'align-items:center;gap:8px' });
      const optEls = options.map((o) => h('button', {
        class: 'tile no-tones', type: 'button',
        onclick: (e) => {
          if (answered) return;
          answered = true;
          const ok = o === v.py;
          if (ok) { score++; streak++; } else streak = 0;
          e.currentTarget.classList.add(ok ? 'right' : 'wrong');
          optEls[options.indexOf(v.py)].classList.add('right');
          optEls.forEach((b) => b.classList.remove('no-tones'));
          const syl = syllables(v.py);
          reveal.replaceChildren(
            listening ? tzgRow(v.zh, 72) : null,
            h('div', { class: 'row', style: 'justify-content:center' }, pyEl(v.py), h('span', { class: 'muted' }, `· ${v.cz}`)),
            h('div', { class: 'row', style: 'justify-content:center' }, syl.map((s) => h('span', { title: TONE_NAMES[s.tone], html: contourSvg(s.tone) }))),
            h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { i++; ask(); } }, i + 1 < rounds.length ? 'Další slovo' : 'Výsledek'));
          Speech.speak(v.zh);
          $('.btn-primary', reveal).focus({ preventScroll: true });
        },
      }, pyEl(o)));
      const cue = listening
        ? h('button', { class: 'say', type: 'button', style: 'width:88px;height:88px', 'aria-label': 'Přehrát slovo', html: ICONS.play.replace('<svg', '<svg style="width:36px;height:36px"'), onclick: () => Speech.speak(v.zh, { rate: 0.85 }) })
        : h('div', { class: 'stack', style: 'align-items:center;gap:6px' }, tzgRow(v.zh, 88), h('span', { class: 'muted' }, v.cz));
      game.replaceChildren(controls(), h('div', { class: 'quiz-card' },
        h('div', { class: 'progress-line', style: 'width:100%;max-width:420px' },
          h('div', { class: 'bar' }, h('i', { style: `width:${(i / rounds.length) * 100}%` })),
          h('span', null, `${i + 1} / ${rounds.length}`),
          streak >= 3 ? h('span', null, `série ${streak}`) : null),
        h('p', { class: 'muted' }, listening ? 'Poslechni si slovo a vyber pinyin se správnými tóny.' : 'Který pinyin má správné tóny?'),
        cue,
        h('div', { class: 'quiz-options' }, optEls),
        reveal));
      if (listening) setTimeout(() => Speech.speak(v.zh, { rate: 0.85 }), 250);
    };
    if (!rounds.length) {
      game.replaceChildren(controls(), h('p', { class: 'muted' }, 'Ve vybraných lekcích nejsou vhodná slova. Přidej další lekci.'));
      return;
    }
    if (listening) {
      // Poslech smí začít až po klepnutí (pravidlo prohlížečů pro zvuk).
      game.replaceChildren(controls(), h('div', { class: 'quiz-card' },
        h('p', null, `${plural(rounds.length, 'slovo', 'slova', 'slov')}. Uslyšíš slovo a vybereš správný pinyin.`),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: ask }, 'Začít poslech')));
    } else ask();
  };

  wrap.append(
    h('header', { class: 'page-head' },
      h('span', { class: 'eyebrow' }, 'Trenažér'),
      h('h1', null, 'Tóny'),
      h('p', { class: 'lead' }, 'Čtyři melodie a jedna lehká. Nejdřív si je poslechni na slabice ma, pak trénuj na slovech z kurzu.')),
    legend,
    game);
  start();
  onLeave(() => Speech.stop());
  return wrap;
}
