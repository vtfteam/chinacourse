// Kartičky se slovíčky a opakováním s rozestupy (Leitnerovy krabičky).

const INTERVALS = [0, 1, 3, 7, 14, 30];
const MODES = [
  { key: 'zh', label: 'Znak → význam' },
  { key: 'cz', label: 'Význam → znak' },
  { key: 'audio', label: 'Poslech → význam' },
];

function CardsView(preset) {
  const wrap = h('div', { class: 'narrow stack-l' });
  const cfg = loadJSON('cinstina-krok-za-krokem/karticky', { lessons: [1], mode: 'zh' });
  if (preset) cfg.lessons = [preset];
  if (!cfg.lessons.length) cfg.lessons = [1];
  const saveCfg = () => saveJSON('cinstina-krok-za-krokem/karticky', cfg);

  const pool = () => COURSE.vocab.filter((v) => cfg.lessons.includes(v.l));
  const counts = (words) => {
    const now = today();
    const c = { fresh: 0, learning: 0, known: 0, due: 0 };
    for (const v of words) {
      const card = progress.cards[cardKey(v)];
      if (!card) c.fresh++;
      else {
        if (card.box >= 3) c.known++; else c.learning++;
        if (card.due <= now) c.due++;
      }
    }
    return c;
  };

  const setup = () => {
    const words = pool();
    const c = counts(words);
    const newToday = Math.min(10, c.fresh);
    const total = Math.min(20, c.due + newToday);
    const lessonChips = h('div', { class: 'row', role: 'group', 'aria-label': 'Lekce' }, LESSONS.map((l) =>
      h('button', {
        class: 'chip', type: 'button', 'aria-pressed': String(cfg.lessons.includes(l.n)), title: l.title,
        onclick: () => {
          const i = cfg.lessons.indexOf(l.n);
          if (i >= 0) { if (cfg.lessons.length > 1) cfg.lessons.splice(i, 1); } else cfg.lessons.push(l.n);
          cfg.lessons.sort((a, b) => a - b);
          saveCfg();
          setup();
        },
      }, `L${l.n}`)));
    const modeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Směr' }, MODES.map((m) =>
      h('button', { type: 'button', 'aria-pressed': String(cfg.mode === m.key), onclick: () => { cfg.mode = m.key; saveCfg(); setup(); } }, m.label)));
    const all = words.length || 1;
    const dist = h('div', { class: 'stack', style: 'gap:8px' },
      h('div', { class: 'boxes', role: 'img', 'aria-label': `Nová ${c.fresh}, učíš se ${c.learning}, umíš ${c.known}` },
        h('i', { style: `width:${(c.known / all) * 100}%;background:var(--grid)` }),
        h('i', { style: `width:${(c.learning / all) * 100}%;background:var(--t2)` }),
        h('i', { style: `width:${(c.fresh / all) * 100}%;background:transparent` })),
      h('div', { class: 'legend' },
        h('span', { style: '--c:var(--grid)' }, `umíš ${c.known}`),
        h('span', { style: '--c:var(--t2)' }, `učíš se ${c.learning}`),
        h('span', { style: '--c:var(--rule)' }, `nová ${c.fresh}`)));
    const startBtn = total
      ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => session(false) }, `Začít: ${plural(total, 'kartička', 'kartičky', 'kartiček')}`)
      : h('button', { class: 'btn btn-primary', type: 'button', onclick: () => session(true) }, 'Procvičit i tak');
    wrap.replaceChildren(
      h('header', { class: 'page-head' },
        h('span', { class: 'eyebrow' }, 'Opakování s rozestupy'),
        h('h1', null, 'Kartičky'),
        h('p', { class: 'lead' }, 'Co umíš, uvidíš znovu za pár dní. Co nevíš, vrátí se ještě dnes. Stačí pár minut denně.')),
      h('section', { class: 'sheet stack' },
        h('div', { class: 'field' }, h('span', { class: 'label', style: 'font-weight:700;font-size:var(--fs-s)' }, 'Slovíčka z lekcí'), lessonChips),
        h('div', { class: 'field' }, h('span', { class: 'label', style: 'font-weight:700;font-size:var(--fs-s)' }, 'Směr'), modeSeg),
        dist,
        h('p', { class: 'muted', style: 'font-size:var(--fs-s)' }, total
          ? [c.due ? `K opakování: ${plural(c.due, 'slovíčko', 'slovíčka', 'slovíček')}.` : '', newToday ? `Nová slovíčka: ${newToday}.` : ''].filter(Boolean).join(' ')
          : 'Pro dnešek máš z vybraných lekcí hotovo. Můžeš přidat další lekci, nebo si je projet znovu.'),
        h('div', null, startBtn)));
  };

  const session = (cram) => {
    const words = pool();
    const now = today();
    let queue;
    if (cram) queue = shuffle(words).slice(0, 15);
    else {
      const due = shuffle(words.filter((v) => progress.cards[cardKey(v)] && progress.cards[cardKey(v)].due <= now));
      const fresh = words.filter((v) => !progress.cards[cardKey(v)]).slice(0, 10);
      queue = [...due, ...fresh].slice(0, 20);
    }
    const total = queue.length;
    const stats = { good: 0, hard: 0, again: 0 };
    let current = null;
    let flipped = false;
    let doneCount = 0;
    const repeated = new Set();

    const rate = (grade) => {
      const key = cardKey(current);
      const card = progress.cards[key] || { box: 0, due: now };
      if (!cram || grade === 'again') {
        if (grade === 'again') { card.box = 1; card.due = now; }
        else if (grade === 'hard') { card.box = Math.max(1, card.box); card.due = now + 1; }
        else { card.box = Math.min(5, card.box + 1); card.due = now + INTERVALS[card.box]; }
        card.t = Date.now();
        progress.cards[key] = card;
        commit();
      }
      stats[grade]++;
      if (grade === 'again' && !repeated.has(key)) { repeated.add(key); queue.push(current); }
      else doneCount++;
      next();
    };

    const next = () => {
      current = queue.shift();
      flipped = false;
      if (!current) return finish();
      draw();
      if (cfg.mode === 'audio') Speech.speak(current.zh);
    };

    const flip = () => {
      if (flipped) return;
      flipped = true;
      draw();
      if (cfg.mode !== 'audio') Speech.speak(current.zh);
    };

    const face = () => {
      const v = current;
      const hanzi = [...v.zh].filter((c) => /\p{Script=Han}/u.test(c));
      const big = hanzi.length <= 4 && !/[…/]/.test(v.zh) ? tzgRow(v.zh, hanzi.length > 2 ? 80 : 104) : h('span', { class: 'zh', style: 'font-size:2.5rem' }, v.zh);
      const corner = h('span', { class: 'corner' }, `Lekce ${v.l}`);
      const back = [
        h('div', { class: 'row', style: 'justify-content:center' }, pyEl(v.py), sayBtn(v.zh, { small: true }), knownBtn('w', cardKey(v), { word: v, label: v.zh, compact: true })),
        h('div', { class: 'cz' }, v.cz),
        h('div', { class: 'row', style: 'justify-content:center;gap:4px' }, [...new Set(onlyHan(v.zh))].filter((c) => CHARS[c]).map((c) =>
          h('a', { class: 'btn btn-small', href: charHash(c), onclick: (e) => e.stopPropagation() }, h('span', { class: 'zh' }, c), ' jak vznikl')))];
      if (cfg.mode === 'zh') return [corner, big, ...(flipped ? back : [h('p', { class: 'hint' }, 'Co to znamená? Klepni pro otočení.')])];
      if (cfg.mode === 'cz') {
        return [corner, h('div', { class: 'big-cz' }, v.cz),
          ...(flipped ? [big, back[0]] : [h('p', { class: 'hint' }, 'Jak se to řekne čínsky? Řekni to nahlas a otoč.')])];
      }
      return [corner,
        flipped ? big : h('button', { class: 'say', type: 'button', style: 'width:84px;height:84px', 'aria-label': 'Přehrát znovu', html: ICONS.play.replace('<svg', '<svg style="width:34px;height:34px"'), onclick: (e) => { e.stopPropagation(); Speech.speak(v.zh); } }),
        ...(flipped ? back : [h('p', { class: 'hint' }, 'Co slyšíš? Klepni pro otočení.')])];
    };

    const draw = () => {
      const card = h('div', { class: 'flash', role: 'button', tabindex: '0', 'aria-label': flipped ? 'Kartička' : 'Otočit kartičku', onclick: flip }, face());
      const rateRow = flipped
        ? h('div', { class: 'rate' },
          h('button', { class: 'btn again', type: 'button', onclick: () => rate('again') }, 'Nevím', h('small', null, 'ještě dnes')),
          h('button', { class: 'btn', type: 'button', onclick: () => rate('hard') }, 'Skoro', h('small', null, 'zítra')),
          h('button', { class: 'btn good', type: 'button', onclick: () => rate('good') }, 'Umím',
            h('small', null, cram ? 'dál' : `za ${plural(INTERVALS[Math.min(5, ((progress.cards[cardKey(current)] || {}).box || 0) + 1)], 'den', 'dny', 'dní')}`)))
        : h('button', { class: 'btn btn-ink', type: 'button', onclick: flip }, 'Otočit');
      wrap.replaceChildren(h('div', { class: 'flash-wrap' },
        h('div', { class: 'progress-line' },
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => quit() }, 'Ukončit'),
          h('div', { class: 'bar' }, h('i', { style: `width:${(doneCount / total) * 100}%` })),
          h('span', null, `${doneCount} / ${total}`)),
        card, rateRow,
        h('p', { class: 'kbd' }, h('kbd', null, 'mezerník'), ' otočí, ', h('kbd', null, '1'), ' ', h('kbd', null, '2'), ' ', h('kbd', null, '3'), ' ohodnotí')));
      if (flipped) {
        const first = $('.rate .good', wrap);
        if (first) first.focus({ preventScroll: true });
      } else card.focus({ preventScroll: true });
    };

    const quit = () => {
      current = null;
      document.removeEventListener('keydown', onKey);
      setup();
    };

    const finish = () => {
      current = null;
      wrap.replaceChildren(h('div', { class: 'flash-wrap' },
        h('div', { class: 'flash', style: 'cursor:default' },
          tzgRow('完成', 72),
          h('div', { class: 'big-cz' }, 'Hotovo!'),
          pyEl('wánchéng'),
          h('p', { class: 'hint' }, `Umím ${stats.good} · skoro ${stats.hard} · nevím ${stats.again}`)),
        h('div', { class: 'row', style: 'justify-content:center' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => quit() }, 'Zpět na přehled'),
          h('a', { class: 'btn', href: '#domu' }, 'Na lekce'))));
    };

    const onKey = (e) => {
      if (!current || e.target.closest('input, textarea, select, dialog')) return;
      if ((e.key === ' ' || e.key === 'Enter') && !flipped) { e.preventDefault(); flip(); }
      else if (flipped && ['1', '2', '3'].includes(e.key)) rate(['again', 'hard', 'good'][Number(e.key) - 1]);
    };
    document.addEventListener('keydown', onKey);
    onLeave(() => document.removeEventListener('keydown', onKey));
    next();
  };

  setup();
  return wrap;
}
