// Úvodní obrazovka se seznamem lekcí a úvod „Jak tahle učebnice funguje“.

function nextStep() {
  const last = progress.last;
  if (last && lessonByN(last.n)) {
    const idx = STEPS.findIndex((s) => s.key === last.step);
    return { n: last.n, step: STEPS[Math.max(idx, 0)] };
  }
  for (const l of LESSONS) {
    const s = STEPS.find((st) => !isStepDone(l.n, st.key));
    if (s) return { n: l.n, step: s };
  }
  return null;
}

// „Po téhle lekci se umíš pozdravit…“ → „Umíš se pozdravit…“
function shortGoal(lesson) {
  const text = lesson.goal[0] ? lesson.goal[0].text : '';
  const rest = text.replace(/^Po téhle lekci /, '');
  if (rest === text) return text;
  const m = /^(se|si) (\S+)(.*)$/.exec(rest);
  const out = m ? `${m[2]} ${m[1]}${m[3]}` : rest;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function vocabStats() {
  const now = today();
  let learned = 0;
  let due = 0;
  for (const v of COURSE.vocab) {
    const c = progress.cards[`${v.zh}|${v.py}`];
    if (!c) continue;
    if (c.box >= 3) learned++;
    if (c.due <= now) due++;
  }
  return { learned, due, total: COURSE.vocab.length };
}

function HomeView() {
  const started = Object.keys(progress.steps).length > 0 || progress.last;
  const next = nextStep();
  const stats = vocabStats();
  const stepsDone = LESSONS.reduce((a, l) => a + lessonDone(l.n), 0);
  const lead = COURSE.intro.blocks[0] ? COURSE.intro.blocks[0].text : '';

  const cta = started && next
    ? h('a', { class: 'btn btn-primary', href: `#l${next.n}-${next.step.slug}` }, `Pokračovat: Lekce ${next.n}, ${next.step.label}`, h('span', { html: ICONS.arrowR, style: 'display:contents' }))
    : h('a', { class: 'btn btn-primary', href: '#l1-dialog' }, 'Začít lekcí 1', h('span', { html: ICONS.arrowR, style: 'display:contents' }));

  const heroArt = h('div', { class: 'hero-art' },
    h('div', { class: 'hero-py' }, pyEl('Zhōng'), pyEl('wén')),
    h('button', { class: 'tzg-row', type: 'button', style: 'border:0;background:none;padding:0;cursor:pointer', 'aria-label': 'Přehrát 中文 Zhōngwén', onclick: () => Speech.speak('中文') },
      h('span', { class: 'tzg' }, '中'), h('span', { class: 'tzg' }, '文')),
    h('p', { class: 'hero-caption' }, '中文 Zhōngwén, čínština. Klepni na znaky a uslyšíš je.'));

  const hero = h('section', { class: 'hero' },
    h('div', { class: 'stack' },
      h('span', { class: 'eyebrow' }, 'Učebnice pro české začátečníky · úroveň HSK 1'),
      h('h1', null, COURSE.title),
      h('p', { class: 'lead' }, lead),
      h('div', { class: 'row' }, cta, h('a', { class: 'btn', href: '#uvod' }, 'Jak učebnice funguje')),
      h('div', { class: 'statline' },
        h('span', null, 'Hotové kroky ', h('b', null, `${stepsDone} / ${LESSONS.length * STEPS.length}`)),
        h('span', null, 'Slovíčka, která umíš ', h('b', null, `${stats.learned} / ${stats.total}`)),
        h('span', null, 'K opakování dnes ', h('b', null, String(stats.due))))),
    heroArt);

  const cards = LESSONS.map((l) => {
    const done = lessonDone(l.n);
    return h('a', { class: 'lesson-card', href: `#l${l.n}` },
      tzgRow(l.key, 46),
      h('div', null,
        h('span', { class: 'eyebrow' }, `Lekce ${l.n}`),
        h('h3', null, l.title),
        h('p', null, shortGoal(l)),
        h('div', { class: 'meta' },
          h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': STEPS.length, 'aria-valuenow': done, 'aria-label': `Lekce ${l.n}: hotovo ${done} ze ${STEPS.length} kroků` },
            h('i', { style: `width:${(done / STEPS.length) * 100}%` })),
          h('span', null, done === STEPS.length ? 'Hotovo' : `${done}/${STEPS.length} kroků`))));
  });

  const introCard = h('a', { class: 'lesson-card intro-card', href: '#uvod' },
    tzgRow('妈麻马骂', 40),
    h('div', null,
      h('span', { class: 'eyebrow' }, 'Než začneš'),
      h('h3', null, 'Čínština v kostce'),
      h('p', null, 'Tóny, pinyin, jak se skládají znaky a pevný slovosled. Pět minut čtení, které ušetří hodiny.')),
    h('span', { class: 'btn btn-small' }, 'Přečíst úvod'));

  const tools = h('div', { class: 'tools-grid' },
    h('a', { class: 'tool-link', href: '#karticky' }, h('span', { class: 'hz' }, '卡片'), h('b', null, 'Kartičky'),
      h('span', null, stats.due ? `${plural(stats.due, 'slovíčko', 'slovíčka', 'slovíček')} k opakování` : 'Opakování s rozestupy')),
    h('a', { class: 'tool-link', href: '#tony' }, h('span', { class: 'hz' }, '声调'), h('b', null, 'Tóny'), h('span', null, 'Trénuj sluch na čtyři tóny')),
    h('a', { class: 'tool-link', href: '#slovnik' }, h('span', { class: 'hz' }, '词典'), h('b', null, 'Slovník'), h('span', null, `${stats.total} slov z kurzu`)),
    h('a', { class: 'tool-link', href: '#prirucka' }, h('span', { class: 'hz' }, '语法'), h('b', null, 'Příručka'), h('span', null, 'Gramatika, radikály, klíč')));

  return h('div', { class: 'stack-l' },
    hero,
    h('section', { class: 'stack', 'aria-labelledby': 'lessons-title' },
      h('h2', { class: 'section-title', id: 'lessons-title' }, 'Osm lekcí'),
      h('div', { class: 'lesson-grid' }, introCard, cards)),
    h('section', { class: 'stack', 'aria-labelledby': 'tools-title' },
      h('h2', { class: 'section-title', id: 'tools-title' }, 'Na procvičení'),
      tools));
}

function IntroView() {
  const intro = COURSE.intro;
  const sections = intro.sections.map((sec) => {
    const body = h('div', { class: 'stack' });
    for (const b of sec.blocks) {
      if (b.t === 'table' && b.headText[0] === 'Tón') body.append(toneCards(b));
      else body.append(renderBlocks([b]));
    }
    return h('section', { class: 'sheet stack' }, h('h2', { class: 'section-title' }, sec.title), body);
  });
  return h('div', { class: 'narrow stack-l' },
    h('header', { class: 'page-head' },
      h('span', { class: 'eyebrow' }, 'Úvod'),
      h('h1', null, `${COURSE.title}: ${intro.title}`),
      h('p', { class: 'lead' }, intro.blocks.map((b) => b.text).join(' ')),
      h('p', { class: 'muted' }, 'V aplikaci si každou čínskou větu přehraješ klepnutím, slovník ani překladač k tomu nepotřebuješ.')),
    sections,
    h('div', { class: 'row' }, h('a', { class: 'btn btn-primary', href: '#l1-dialog' }, 'Začít lekcí 1', h('span', { html: ICONS.arrowR, style: 'display:contents' }))));
}

// Tabulka tónů z úvodu jako pět karet s křivkou a přehráním.
function toneCards(table) {
  return h('div', { class: 'tone-cards' }, table.rowsText.map((r, i) => {
    const tone = i < 4 ? i + 1 : 5;
    const [, mark, desc, example] = r;
    const zh = onlyHan(example);
    return h('div', { class: 'tone-card' },
      h('span', { class: 'eyebrow', style: 'color:var(--ink-soft)' }, tone === 5 ? 'neutrální tón' : `${tone}. tón`),
      h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: `mark tc${tone}` }, mark), h('span', { html: contourSvg(tone) })),
      h('p', { class: 'desc' }, desc),
      h('div', { class: 'ex' }, h('span', { class: 'zh' }, zh), h('span', { class: 'muted' }, example.replace(zh, '').trim()), sayBtn(zh, { small: true })));
  }));
}
