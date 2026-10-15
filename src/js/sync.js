// Ukládání pokroku k účtu, když aplikace běží na claude.ai.
// Jinde (GitHub Pages, otevřený soubor) zůstává pokrok jen v prohlížeči.

const Sync = {
  ref: null,
  active: false,
  timer: 0,
  writing: false,
  pending: false,
  listeners: new Set(),

  status() {
    return this.active
      ? 'Pokrok se ukládá k tvému účtu, takže ho uvidíš i na dalších zařízeních.'
      : 'Pokrok se ukládá v tomhle prohlížeči.';
  },

  async init(onMerged) {
    const claude = window.claude;
    if (!claude || typeof claude.use !== 'function') return;
    try {
      const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      this.ref = db.doc(`data/users/${id}/pokrok`);
      const snap = await this.ref.get();
      const remote = snap.exists && snap.data() && snap.data().state ? normalizeProgress(JSON.parse(JSON.stringify(snap.data().state))) : null;
      this.active = true;
      if (remote) {
        const merged = mergeProgress(progress, remote);
        const changedLocal = JSON.stringify(merged) !== JSON.stringify(progress);
        const changedRemote = JSON.stringify(merged) !== JSON.stringify(remote);
        progress = merged;
        saveJSON(STORE_KEY, progress);
        if (changedLocal && onMerged) onMerged();
        if (changedRemote) this.schedule(0);
      } else if (progress.t) {
        this.schedule(0);
      }
      this.listeners.forEach((fn) => fn());
    } catch (e) {
      this.active = false;
    }
  },

  schedule(delay = 2500) {
    if (!this.active) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.push(), delay);
  },

  async push() {
    if (!this.active || !this.ref) return;
    if (this.writing) { this.pending = true; return; }
    this.writing = true;
    try {
      await this.ref.set({ state: JSON.parse(JSON.stringify(progress)), savedAt: Date.now() });
    } catch (e) {
      if (e && e.code === 'unavailable' && !this.retried) {
        this.retried = true;
        this.pending = true;
      } else {
        // Bez práva zápisu zůstane pokrok jen v prohlížeči.
        this.active = false;
        this.listeners.forEach((fn) => fn());
      }
    }
    this.writing = false;
    if (this.pending) { this.pending = false; this.schedule(500); }
  },
};
