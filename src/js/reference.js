// Příručka: přehled gramatiky, radikály, klíč ke cvičením a co dál.

function ReferenceView() {
  const ap = COURSE.appendix;
  const lessonLinks = (ns) => ns.map((n, i) => [i ? ', ' : '', h('a', { href: `#l${n}-gramatika` }, n)]);

  const grammar = h('section', { class: 'stack', id: 'gramatika' },
    h('h2', { class: 'section-title' }, ap.titles.A),
    renderBlocks(ap.grammar.intro),
    h('div', { class: 'table-wrap' }, makeSayable(h('table', null,
      h('thead', null, h('tr', null, h('th', null, 'Vzorec'), h('th', null, 'Příklad'), h('th', null, 'Lekce'))),
      h('tbody', null, ap.grammar.rows.map((r) => h('tr', null,
        h('td', { html: r.pattern }),
        h('td', { class: 'zh' }, r.example),
        h('td', null, lessonLinks(r.lessons)))))))));

  const radicals = h('section', { class: 'stack', id: 'radikaly' },
    h('h2', { class: 'section-title' }, ap.titles.B),
    renderBlocks(ap.radicals.intro),
    h('div', { class: 'rad-grid' }, ap.radicals.rows.map((r) => {
      const first = r.rad.split('/')[0].trim();
      return h('article', { class: 'rad-card' },
        STROKES[first]
          ? h('button', { class: 'tzg', type: 'button', 'aria-label': `Tahy radikálu ${first}`, onclick: () => Writer.open([first, ...r.chars], 0) }, r.rad.replace(/\s/g, ''))
          : h('span', { class: 'tzg' }, r.rad.replace(/\s/g, '')),
        h('div', { style: 'min-width:0' },
          h('b', null, r.meaning),
          makeSayable(h('div', { class: 'chars' }, r.chars.join(' '))),
          h('div', { class: 'lessons' }, 'Lekce ', r.lessons.map((n, i) => [i ? ', ' : '', h('a', { href: `#l${n}-znaky` }, n)]))));
    })));

  const key = h('section', { class: 'stack', id: 'klic' },
    h('h2', { class: 'section-title' }, ap.titles.C),
    h('p', { class: 'muted' }, 'Ve cvičeních v aplikaci se odpovědi kontrolují samy. Klíč se hodí, když cvičíš na papíře.'),
    LESSONS.map((l) => h('details', { class: 'key' },
      h('summary', null, `Lekce ${l.n}: ${l.title}`),
      makeSayable(h('div', { html: ap.key[l.n] || '' })))));

  const next = h('section', { class: 'stack', id: 'co-dal' },
    h('h2', { class: 'section-title' }, ap.titles.D),
    renderBlocks(ap.next));

  return h('div', { class: 'narrow stack-l' },
    h('header', { class: 'page-head' },
      h('span', { class: 'eyebrow' }, 'Přílohy'),
      h('h1', null, 'Příručka'),
      h('p', { class: 'lead' }, 'Všechno důležité z kurzu na jednom místě. Když si nevíš rady, začni tady.')),
    h('nav', { class: 'subnav', 'aria-label': 'Oddíly příručky' },
      [['gramatika', 'Gramatika'], ['radikaly', 'Radikály'], ['klic', 'Klíč ke cvičením'], ['co-dal', 'Co dál']].map(([id, label]) =>
        h('button', { class: 'chip', type: 'button', onclick: () => document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' }) }, label))),
    grammar, radicals, key, next);
}
