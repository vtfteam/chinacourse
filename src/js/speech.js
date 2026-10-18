// Výslovnost přes hlasovou syntézu prohlížeče (Web Speech API).

const Speech = {
  supported: typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined',
  voices: [],
  loaded: false,
  warned: false,
  listeners: new Set(),
  current: null,

  init() {
    if (!this.supported) return;
    const load = () => {
      const all = speechSynthesis.getVoices();
      this.voices = all.filter((v) => /^(zh|cmn)/i.test(v.lang) && !/HK|yue/i.test(v.lang));
      if (all.length) this.loaded = true;
      this.listeners.forEach((fn) => fn());
    };
    load();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', load);
    else speechSynthesis.onvoiceschanged = load;
  },

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },

  hasVoice() { return this.voices.length > 0; },

  voice() {
    if (settings.voice) {
      const v = this.voices.find((x) => x.name === settings.voice);
      if (v) return v;
    }
    const score = (v) => (/zh[-_]CN/i.test(v.lang) ? 2 : 0) + (v.localService ? 0 : 1);
    return this.voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  },

  stop() {
    if (!this.supported) return;
    speechSynthesis.cancel();
    if (this.current) this.current.done();
  },

  // Přečte čínský text. Vrací Promise, který se splní po dočtení.
  speak(text, opts = {}) {
    const clean = onlyHanText(text);
    if (!clean) return Promise.resolve();
    if (!this.supported) {
      this.warnOnce('Tenhle prohlížeč neumí číst nahlas. Zkus Chrome, Edge nebo Safari.');
      return Promise.resolve();
    }
    if (this.loaded && !this.hasVoice()) {
      this.warnOnce('V zařízení chybí čínský hlas. Přidej čínštinu v nastavení systému (Jazyk a řeč), nebo zkus Chrome.');
    }
    this.stop();
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'zh-CN';
      const v = this.voice();
      if (v) u.voice = v;
      u.rate = Math.max(0.3, Math.min(1.5, (settings.rate || 0.85) * (opts.rate || 1)));
      u.pitch = opts.pitch || 1;
      let finished = false;
      const job = {
        done: () => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          if (this.current === job) this.current = null;
          resolve();
        },
      };
      // Pojistka: některé prohlížeče občas nepošlou událost „end“.
      const timer = setTimeout(job.done, 2500 + clean.length * 600 / u.rate);
      u.onend = job.done;
      u.onerror = job.done;
      this.current = job;
      speechSynthesis.speak(u);
    });
  },

  warnOnce(msg) {
    if (this.warned) return;
    this.warned = true;
    toast(msg);
  },
};

// Z textu nechá čínské znaky a čínskou interpunkci (latinka by zněla divně).
function onlyHanText(text) {
  return (String(text).match(HAN_RUN) || []).join('，').replace(/…+/g, '').replace(/，{2,}/g, '，');
}

// Tlačítko s reproduktorem.
function sayBtn(text, opts = {}) {
  const btn = h('button', {
    type: 'button',
    class: `say ${opts.small ? 'say-sm' : ''}`,
    'aria-label': opts.label || `Přehrát: ${onlyHanText(text)}`,
    title: 'Přehrát',
    html: ICONS.play,
  });
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    btn.classList.add('playing');
    await Speech.speak(text, opts);
    btn.classList.remove('playing');
  });
  return btn;
}

// V daném prvku obalí souvislé úseky čínštiny, aby šly přehrát klepnutím.
function makeSayable(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!hasHan(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      if (node.parentElement.closest('.hz-say, button, .no-say, .tzg')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(HAN_RUN)) {
      if (m.index > last) frag.append(text.slice(last, m.index));
      frag.append(h('span', { class: 'hz-say zh', 'data-say': m[0], title: 'Klepni pro výslovnost' }, m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  }
  return root;
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-say]');
  if (!el) return;
  Speech.speak(el.getAttribute('data-say'));
});
