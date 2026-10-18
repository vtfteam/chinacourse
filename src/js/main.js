// Směrování podle # v adrese a spuštění aplikace.

const VIEWS = {
  domu: HomeView,
  uvod: IntroView,
  slovnik: DictionaryView,
  karticky: () => CardsView(null),
  tony: TonesView,
  prirucka: ReferenceView,
};

let lastRoute = '';
function route() {
  const hash = decodeURIComponent(location.hash.slice(1)) || 'domu';
  const main = $('#view');
  runLeave();
  Speech.stop();

  let view;
  let nav = hash;
  let m;
  if ((m = /^l(\d+)(?:-([a-z]+))?$/.exec(hash))) {
    view = LessonView(Number(m[1]), m[2]);
    nav = 'domu';
  } else if ((m = /^karticky-l(\d+)$/.exec(hash))) {
    view = CardsView(Number(m[1]));
    nav = 'karticky';
  } else if (VIEWS[hash]) {
    view = VIEWS[hash]();
  } else {
    view = NotFoundView();
  }
  if (hash === 'uvod') nav = 'domu';

  main.replaceChildren(view);
  $$('.mainnav a').forEach((a) => {
    if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const sameLesson = /^l\d+/.test(hash) && hash.split('-')[0] === lastRoute.split('-')[0];
  if (sameLesson) {
    const steps = $('.steps', main);
    if (steps && steps.getBoundingClientRect().top < 0) steps.scrollIntoView({ block: 'start' });
  } else {
    window.scrollTo(0, 0);
  }
  if (lastRoute) main.focus({ preventScroll: true });
  lastRoute = hash;
}

function boot() {
  applySettings();
  Speech.init();
  $('#settings-open').addEventListener('click', () => SettingsPanel.open());
  $('#writer').addEventListener('close', () => { if (Writer.writer && Writer.writer.cancelQuiz) Writer.writer.cancelQuiz(); });
  for (const id of ['settings', 'writer']) {
    const dlg = document.getElementById(id);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }
  window.addEventListener('hashchange', route);
  route();
  Sync.init(() => {
    // Pokrok z jiného zařízení: přehled se překreslí hned, ostatní obrazovky při dalším přechodu.
    if (['', 'domu'].includes(location.hash.slice(1))) route();
  });
}

boot();
