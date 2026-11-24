/* «Подвір’я» — піксельна 2D-симуляція: земля, вода, трава, дерева, колоди й камені.
   Світ — сітка клітинок (1 клітинка = 1 піксель арту ≈ 10 см). y росте вниз. */
(function (global) {
  'use strict';
  const W = 160, H = 90;
  const AIR = 0, DIRT = 1, ROCK = 2, WATER = 3;
  const G = 80;                       // прискорення вільного падіння, клітинок/с²
  const ITEM = {
    log:    { n: 'Колода', r: 1.4, m: 4,   dens: 0.6, e: 0.15, len: 7 },
    stone:  { n: 'Камінь', r: 1.3, m: 6,   dens: 2.6, e: 0.25 },
    pebble: { n: 'Камінчик', r: 0.8, m: 1.5, dens: 2.6, e: 0.3 },
    branch: { n: 'Гілка',  r: 0.7, m: 0.6, dens: 0.5, e: 0.2, len: 5 },
    seed:   { n: 'Насінина', r: 0.6, m: 0.1, dens: 0.8, e: 0.2 }
  };
  const TREE_HP = a => a < 40 ? 1 : a < 120 ? 3 : 6;
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

  function Yard(canvas, opts) {
    opts = opts || {};
    this.cv = canvas; this.cx = canvas.getContext('2d');
    this.W = W; this.H = H;
    this.grid = new Uint8Array(W * H);
    this.grass = new Float32Array(W);  // висота трави 0…4
    this.sown = new Uint8Array(W);     // 1 — у стовпчику посіяна трава
    this.moist = new Float32Array(W);
    this.trees = []; this.items = []; this.fx = [];
    this.t = 0; this.day = 0.3; this.speed = 1; this.paused = false; this.rain = false;
    this.tool = 'hand'; this.readonly = !!opts.readonly; this.limits = null; // limits: {sapling, seeds, stone} у режимі учня
    this.listeners = {}; this.dirty = false;
    this.off = document.createElement('canvas'); this.off.width = W; this.off.height = H;
    this.ocx = this.off.getContext('2d'); this.img = this.ocx.createImageData(W, H);
    this.r = rng(opts.seed || 12345);
    this._fit(); this._bind();
    const self = this;
    this._ro = new ResizeObserver(() => self._fit()); this._ro.observe(canvas);
    let last = 0;
    const loop = ts => { requestAnimationFrame(loop); const dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts; self.frame(dt); };
    requestAnimationFrame(loop);
  }
  Yard.ITEM = ITEM; Yard.W = W; Yard.H = H;
  const P = Yard.prototype;
  P.on = function (e, f) { (this.listeners[e] = this.listeners[e] || []).push(f); return this; };
  P.emit = function (e, a) { (this.listeners[e] || []).forEach(f => f(a)); };
  P.at = function (x, y) { return x < 0 || x >= W || y < 0 || y >= H ? ROCK : this.grid[y * W + x]; };
  P.set = function (x, y, v) { if (x >= 0 && x < W && y >= 0 && y < H) this.grid[y * W + x] = v; };
  P.solid = function (x, y) { const c = this.at(x, y); return c === DIRT || c === ROCK; };
  P.surface = function (x) { for (let y = 0; y < H; y++) { const c = this.at(x, y); if (c === DIRT || c === ROCK) return y; } return H; };

  /* ---------- новий світ ---------- */
  P.generate = function (seed) {
    const r = rng(seed || 7); this.grid.fill(AIR); this.trees = []; this.items = [];
    const base = 62, h = [];
    for (let x = 0; x < W; x++) h[x] = Math.round(base + 3 * Math.sin(x / 17 + 1) + 2 * Math.sin(x / 7.3) + (r() - .5));
    for (let x = 104; x < 128; x++) { const k = Math.sin((x - 104) / 24 * Math.PI); h[x] += Math.round(k * 7); } // ставок
    for (let x = 0; x < W; x++) for (let y = h[x]; y < H; y++) this.set(x, y, y > H - 6 - (r() < .3 ? 1 : 0) ? ROCK : DIRT);
    const lvl = Math.max(h[103], h[128]) + 1; // вода не вища за береги ставка
    for (let x = 104; x < 128; x++) for (let y = lvl; y < h[x]; y++) if (this.at(x, y) === AIR) this.set(x, y, WATER);
    for (let x = 0; x < W; x++) { this.sown[x] = (x < 102 || x > 130) ? 1 : 0; this.grass[x] = this.sown[x] ? 2 + r() * 2 : 0; }
    [[22, 200], [44, 70], [70, 15], [140, 160]].forEach(([x, a]) => this.plant(x, a));
    [['stone', 32], ['pebble', 56], ['log', 84], ['stone', 92], ['branch', 60], ['log', 148]].forEach(([k, x]) => this.spawn(k, x, this.surface(x) - 3));
    this.t = 0; this.day = 0.3; this.dirty = true; this.emit('change');
  };
  P.plant = function (x, age) {
    x = Math.round(x);
    if (x < 3 || x > W - 4 || this.trees.length >= 30) return null;
    if (this.trees.some(t => Math.abs(t.x - x) < 5)) return null;
    const y = this.surface(x); if (y >= H || this.at(x, y) !== DIRT || this.at(x, y - 1) === WATER) return null;
    const t = { x: x, y: y, age: age || 0, hp: TREE_HP(age || 0), shake: 0, fall: 0, dir: 1 };
    this.trees.push(t); this.dirty = true; return t;
  };
  P.spawn = function (kind, x, y, vx, vy) {
    const k = ITEM[kind]; if (!k || this.items.length >= 80) return null;
    const it = { k: kind, x: x, y: y, vx: vx || 0, vy: vy || 0, a: 0, av: 0, r: k.r, m: k.m, rest: 0 };
    this.items.push(it); this.dirty = true; return it;
  };
  P.treeH = function (t) { return 3 + Math.min(1, t.age / 160) * 17; };

  /* ---------- кадр ---------- */
  P.frame = function (dt) {
    const run = !this.paused && this.speed > 0;
    if (run) {
      const sdt = dt * this.speed;
      const steps = Math.max(1, Math.round(this.speed));
      for (let i = 0; i < steps; i++) this.waterStep();
      this.grow(sdt);
      const sub = Math.min(40, Math.ceil(this.speed * 4));
      for (let i = 0; i < sub; i++) this.physics(sdt / sub);
      this.t += sdt; this.day = (this.day + sdt / 240) % 1;
    } else if (this.grab) this.physics(0);
    this.fx = this.fx.filter(f => (f.t -= dt) > 0);
    this.trees.forEach(t => { if (t.shake > 0) t.shake = Math.max(0, t.shake - dt * 4); });
    this.draw();
    if (run) this.emit('tick');
  };

  /* вода: клітинковий автомат */
  P.waterStep = function () {
    const g = this.grid, r = this.r, flip = (this._f = !this._f);
    if (this.rain && r() < 0.6) { const x = 1 + (r() * (W - 2) | 0); if (g[x] === AIR) g[x] = WATER; }
    for (let y = H - 2; y >= 0; y--) {
      for (let i = 0; i < W; i++) {
        const x = flip ? i : W - 1 - i, p = y * W + x;
        if (g[p] !== WATER) continue;
        if (g[p + W] === AIR) { g[p + W] = WATER; g[p] = AIR; continue; }
        const d = r() < .5 ? 1 : -1;
        for (const s of [d, -d]) {
          const nx = x + s; if (nx < 0 || nx >= W) continue;
          if (g[p + W + s] === AIR && g[p + s] === AIR) { g[p + W + s] = WATER; g[p] = AIR; break; }
        }
        if (g[p] !== WATER) continue;
        for (const s of [d, -d]) { // розтікання вбік
          const nx = x + s; if (nx < 0 || nx >= W) continue;
          if (g[p + s] === AIR) { g[p + s] = WATER; g[p] = AIR; break; }
        }
        if (g[p] === WATER && y > 0 && g[p - W] === AIR && r() < 0.00004) g[p] = AIR; // випаровування
      }
    }
  };

  /* ріст трави й дерев залежно від вологи */
  P.grow = function (dt) {
    this._mt = (this._mt || 0) - dt;
    if (this._mt <= 0) { this._mt = 0.5; this.calcMoist(); }
    for (let x = 0; x < W; x++) {
      const y = this.surface(x), ok = this.sown[x] && y < H && this.at(x, y) === DIRT && this.at(x, y - 1) === AIR;
      if (!ok) { this.grass[x] = Math.max(0, this.grass[x] - dt); continue; }
      const m = this.moist[x];
      this.grass[x] = Math.min(4, this.grass[x] + dt * 0.08 * Math.max(0.15, m));
    }
    for (const t of this.trees) {
      if (t.fall) continue;
      const below = this.at(t.x, t.y);
      if (below !== DIRT && below !== ROCK) { this.fell(t, 0); continue; }
      const m = (this.moist[t.x] + this.moist[Math.max(0, t.x - 2)] + this.moist[Math.min(W - 1, t.x + 2)]) / 3;
      const before = t.age; t.age = Math.min(400, t.age + dt * Math.max(0.1, m));
      if (TREE_HP(t.age) > TREE_HP(before)) t.hp += TREE_HP(t.age) - TREE_HP(before);
      if (t.age >= 160 && this.r() < dt * 0.004 * m) { // доросле дерево іноді скидає насінину
        const s = this.spawn('seed', t.x + (this.r() - .5) * 6, t.y - this.treeH(t) * .7, (this.r() - .5) * 18, -6);
      }
    }
    this.trees = this.trees.filter(t => !(t.fall && t.fall >= 1));
  };
  P.calcMoist = function () {
    const near = new Float32Array(W).fill(99);
    for (let x = 0; x < W; x++) { const sy = this.surface(x); for (let y = Math.max(0, sy - 12); y < Math.min(H, sy + 6); y++) if (this.at(x, y) === WATER) { near[x] = 0; break; } }
    for (let x = 1; x < W; x++) near[x] = Math.min(near[x], near[x - 1] + 1);
    for (let x = W - 2; x >= 0; x--) near[x] = Math.min(near[x], near[x + 1] + 1);
    for (let x = 0; x < W; x++) this.moist[x] = (this.rain ? 1.3 : 0.35) + Math.max(0, 1.2 - near[x] / 18);
  };

  /* дерево падає: колоди, гілки, насіння */
  P.fell = function (t, dir) {
    if (t.fall) return;
    t.fall = 0.001; t.dir = dir || (this.r() < .5 ? -1 : 1);
    const h = this.treeH(t), self = this, adult = t.age >= 120, young = t.age >= 40;
    setTimeout(() => {
      t.fall = 1;
      const n = adult ? 3 : young ? 1 : 0;
      for (let i = 0; i < n; i++) self.spawn('log', t.x + t.dir * (3 + i * 7), t.y - 3 - i * 2, t.dir * 6, -4);
      for (let i = 0; i < (adult ? 2 : young ? 1 : 0); i++) self.spawn('branch', t.x + t.dir * (h * .7 + i * 3), t.y - 4, t.dir * 8, -8);
      if (adult && self.r() < .7) self.spawn('seed', t.x + t.dir * h * .8, t.y - 4, t.dir * 10, -10);
      self.emit('felled', t); self.dirty = true;
    }, 650);
    this.dirty = true;
  };
  P.hitTree = function (t, dmg) {
    if (t.fall) return;
    t.hp -= dmg; t.shake = 1; this.fx.push({ x: t.x, y: t.y - 3, t: .4, k: 'chip' });
    if (t.hp <= 0) this.fell(t);
    this.dirty = true;
  };

  /* фізика предметів */
  P.physics = function (dt) {
    const its = this.items;
    for (const it of its) {
      const k = ITEM[it.k];
      if (it === this.grab) {
        const nvx = (this.ptr.x - it.x) * 18, nvy = (this.ptr.y - it.y) * 18;
        it.vx = nvx; it.vy = nvy; it.x += it.vx * Math.max(dt, 1 / 240); it.y += it.vy * Math.max(dt, 1 / 240); it.rest = 0; continue;
      }
      if (!dt) continue;
      const inW = this.at(Math.floor(it.x), Math.floor(it.y)) === WATER;
      let ay = G;
      if (inW) { ay = G * (1 - 1 / k.dens); const dr = Math.max(0, 1 - 3 * dt); it.vx *= dr; it.vy *= dr; it.av *= dr; }
      it.vy += ay * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.a += it.av * dt;
      this.collideTerrain(it, k);
      // удар по дереву
      const sp = Math.hypot(it.vx, it.vy);
      if (sp > 22) for (const t of this.trees) {
        if (t.fall || (it.cool && it.cool[t.x] > this.t)) continue;
        const h = this.treeH(t), tw = 1 + h / 9;
        if (Math.abs(it.x - t.x) < tw + it.r && it.y > t.y - h * .7 && it.y < t.y + 1) {
          this.hitTree(t, it.m * sp / 140);
          (it.cool = it.cool || {})[t.x] = this.t + 0.3;
          it.vx = -it.vx * 0.35; it.vy *= 0.5;
          this.emit('hit', { item: it, tree: t });
        }
      }
    }
    // зіткнення предметів між собою
    for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++) {
      const a = its[i], b = its[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), r = a.r + b.r;
      if (d >= r || d < 1e-6) continue;
      const nx = dx / d, ny = dy / d, ia = a === this.grab ? 0 : 1 / a.m, ib = b === this.grab ? 0 : 1 / b.m;
      if (!ia && !ib) continue;
      const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (vn < 0) { const e = Math.min(ITEM[a.k].e, ITEM[b.k].e), j2 = -(1 + e) * vn / (ia + ib); a.vx -= j2 * nx * ia; a.vy -= j2 * ny * ia; b.vx += j2 * nx * ib; b.vy += j2 * ny * ib; }
      const c = (r - d) / (ia + ib) * .8; a.x -= nx * c * ia; a.y -= ny * c * ia; b.x += nx * c * ib; b.y += ny * c * ib;
    }
    // насінина, що полежала на землі, проростає
    for (const it of its) if (it.k === 'seed' && dt) {
      if (Math.hypot(it.vx, it.vy) < 2) it.rest += dt; else it.rest = 0;
      if (it.rest > 6) { const t = this.plant(it.x, 0); it.dead = true; if (t) this.fx.push({ x: t.x, y: t.y - 2, t: .8, k: 'sprout' }); }
    }
    this.items = its.filter(it => !it.dead && it.x > -5 && it.x < W + 5 && it.y < H + 5);
  };
  P.collideTerrain = function (it, k) {
    const r = it.r, x0 = Math.floor(it.x - r), x1 = Math.floor(it.x + r), y0 = Math.floor(it.y - r), y1 = Math.floor(it.y + r);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      if (!this.solid(cx, cy)) continue;
      const px = Math.max(cx, Math.min(it.x, cx + 1)), py = Math.max(cy, Math.min(it.y, cy + 1));
      let dx = it.x - px, dy = it.y - py, d = Math.hypot(dx, dy);
      if (d >= r) continue;
      let nx, ny;
      if (d < 1e-6) { nx = 0; ny = -1; d = 0; } else { nx = dx / d; ny = dy / d; }
      it.x += nx * (r - d); it.y += ny * (r - d);
      const vn = it.vx * nx + it.vy * ny;
      if (vn < 0) {
        it.vx -= (1 + k.e) * vn * nx; it.vy -= (1 + k.e) * vn * ny;
        const tx = -ny, ty = nx, vt = it.vx * tx + it.vy * ty, f = 0.06;
        it.vx -= vt * f * tx; it.vy -= vt * f * ty; it.av = vt / r;
        if (Math.abs(it.vy) < 1.5 && ny < -0.5) it.vy = 0;
      }
    }
  };

  /* ---------- інструменти ---------- */
  P.cell = function (e) { const r = this.cv.getBoundingClientRect(); return { x: (e.clientX - r.left - this.ox) / this.s, y: (e.clientY - r.top - this.oy) / this.s }; };
  P.brush = function (p, fn, rad) { rad = rad || 1.6; for (let y = Math.floor(p.y - rad); y <= p.y + rad; y++) for (let x = Math.floor(p.x - rad); x <= p.x + rad; x++) if ((x + .5 - p.x) ** 2 + (y + .5 - p.y) ** 2 <= rad * rad) fn(x, y); };
  P.treeAt = function (p) {
    return this.trees.find(t => { if (t.fall) return false; const h = this.treeH(t); return Math.abs(p.x - t.x) < 2 + h * .25 && p.y > t.y - h - 2 && p.y < t.y + 1; });
  };
  P.itemAt = function (p) { let best = null, bd = 1e9; this.items.forEach(it => { const d = Math.hypot(it.x - p.x, it.y - p.y); if (d < it.r + 1.5 && d < bd) { bd = d; best = it; } }); return best; };
  P.use = function (p, first) {
    if (this.readonly) return;
    const tool = this.tool, L = this.limits, need = (k, n) => { if (!L) return true; if ((L[k] || 0) < (n || 1)) { this.emit('need', k); return false; } L[k] -= (n || 1); this.emit('inv', L); return true; };
    const solidBelow = y => y >= H - 6;
    if (tool === 'dig') this.brush(p, (x, y) => { const c = this.at(x, y); if (c === DIRT || c === WATER) { this.set(x, y, AIR); this.dirty = true; } });
    else if (tool === 'dirt') this.brush(p, (x, y) => { if (y > 4 && this.at(x, y) !== ROCK && this.at(x, y) !== DIRT && !this.items.some(it => Math.hypot(it.x - x - .5, it.y - y - .5) < it.r)) { this.set(x, y, DIRT); this.dirty = true; } });
    else if (tool === 'water') this.brush(p, (x, y) => { if (this.at(x, y) === AIR) { this.set(x, y, WATER); this.dirty = true; } }, 1.3);
    else if (tool === 'scythe') { for (let x = Math.floor(p.x - 2); x <= p.x + 2; x++) if (x >= 0 && x < W && this.grass[x] > 0.3) { this.grass[x] = 0; this.fx.push({ x: x, y: this.surface(x) - 1, t: .3, k: 'grass' }); this.dirty = true; this.emit('mow'); } }
    else if (tool === 'sow') { for (let x = Math.floor(p.x - 2); x <= p.x + 2; x++) if (x >= 0 && x < W && !this.sown[x]) { if (!need('seeds')) break; this.sown[x] = 1; this.dirty = true; } }
    else if (tool === 'axe' && first) { const t = this.treeAt(p); if (t) { this.hitTree(t, 1); this.emit('chop', t); } }
    else if (tool === 'plant' && first) { if (this.trees.some(t => Math.abs(t.x - Math.round(p.x)) < 5)) { this.emit('msg', 'Занадто близько до іншого дерева'); return; } const y = this.surface(Math.round(p.x)); if (this.at(Math.round(p.x), y) !== DIRT || this.at(Math.round(p.x), y - 1) === WATER) { this.emit('msg', 'Саджати можна лише в землю'); return; } if (!need('sapling')) return; this.plant(p.x, 0); this.fx.push({ x: p.x, y: y - 2, t: .8, k: 'sprout' }); }
    else if ((tool === 'stone' || tool === 'log') && first) { if (!need(tool)) return; this.spawn(tool, p.x, Math.min(p.y, this.surface(Math.round(p.x)) - 2)); }
  };
  P._bind = function () {
    const cv = this.cv, self = this; let down = false, last = null;
    this.ptr = { x: 0, y: 0 };
    cv.style.touchAction = 'none';
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('pointerdown', e => {
      const p = this.cell(e); this.ptr = p; down = true; last = p;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      if (this.readonly) return;
      if (this.tool === 'hand') { const it = this.itemAt(p); if (it) { this.grab = it; this.emit('grab', it); } return; }
      this.use(p, true);
    });
    cv.addEventListener('pointermove', e => {
      const p = this.cell(e); this.ptr = p; this.hover = p;
      if (!down || this.readonly || this.tool === 'hand') return;
      if (['dig', 'dirt', 'water', 'scythe', 'sow'].includes(this.tool)) {
        const n = Math.ceil(Math.hypot(p.x - last.x, p.y - last.y));
        for (let i = 1; i <= n; i++) this.use({ x: last.x + (p.x - last.x) * i / n, y: last.y + (p.y - last.y) * i / n }, false);
      }
      last = p;
    });
    const up = () => { down = false; if (this.grab) { const g = this.grab, sp = Math.hypot(g.vx, g.vy), mx = 140; if (sp > mx) { g.vx *= mx / sp; g.vy *= mx / sp; } this.emit('throw', { item: g, speed: Math.min(sp, mx) }); this.grab = null; this.dirty = true; } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { this.hover = null; });
  };

  /* ---------- малювання (піксель-арт) ---------- */
  P._fit = function () {
    const r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.max(1, Math.round(r.width * dpr)); this.cv.height = Math.max(1, Math.round(r.height * dpr)); this.dpr = dpr;
    this.s = Math.min(r.width / W, r.height / H); this.ox = (r.width - W * this.s) / 2; this.oy = (r.height - H * this.s) / 2; this.cw = r.width; this.ch = r.height;
  };
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) % 1000 / 1000; };
  P.light = function () { const d = this.day, s = Math.sin(d * Math.PI * 2); return Math.max(0.35, Math.min(1, 0.65 + s * 0.6)); };
  P.draw = function () {
    const g = this.cx, s = this.s, d = this.img.data, L = this.light(), grid = this.grid, tt = this.t;
    if (Math.abs(this.s - Math.min(this.cw / W, this.ch / H)) > 1e-6) this._fit();
    const skyT = mix([20, 28, 60], [124, 200, 245], L), skyB = mix([40, 50, 90], [217, 242, 255], L);
    for (let y = 0; y < H; y++) {
      const sky = mix(skyT, skyB, y / H);
      for (let x = 0; x < W; x++) {
        const c = grid[y * W + x], o = (y * W + x) * 4, n = hash(x, y);
        let col;
        if (c === AIR) col = sky;
        else if (c === DIRT) { const top = grid[(y - 1) * W + x] !== DIRT && y > 0; col = top && this.sown[x] ? [70 + n * 20, 120 + n * 25, 45] : (n < .08 ? [110, 80, 55] : [138 - n * 18, 90 - n * 12, 51 - n * 8]); if (y > 0 && grid[(y - 2) * W + x] === DIRT && n > .93) col = [150, 150, 140]; }
        else if (c === ROCK) col = [110 + n * 30, 110 + n * 30, 115 + n * 30];
        else { const deep = y > 0 && grid[(y - 1) * W + x] === WATER; col = deep ? [40, 110 + n * 10, 190] : [90, 170 + 20 * Math.sin(tt * 3 + x * .7), 235]; }
        col = c === AIR ? col : mix([10, 12, 25], col, 0.25 + 0.75 * L);
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    this.ocx.putImageData(this.img, 0, 0);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.imageSmoothingEnabled = false;
    g.fillStyle = '#14201a'; g.fillRect(0, 0, this.cw, this.ch);
    g.drawImage(this.off, this.ox, this.oy, W * s, H * s);
    g.save(); g.translate(this.ox, this.oy); g.scale(s, s);
    // сонце / місяць
    const ang = this.day * Math.PI * 2, sx = W / 2 - Math.cos(ang) * W * .45, sy = 40 - Math.sin(ang) * 34;
    if (Math.sin(ang) > -0.05) { g.fillStyle = '#ffe066'; g.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 5, 5); }
    else { const mx = Math.round(W / 2 + Math.cos(ang) * W * .45), my = Math.round(40 + Math.sin(ang) * 34); g.fillStyle = '#e8eefc'; g.fillRect(mx - 2, my - 1, 5, 3); g.fillRect(mx - 1, my - 2, 3, 5); g.fillStyle = '#c9d3ea'; g.fillRect(mx, my, 1, 1); }
    const dk = c => this.dark(c, L);
    // трава
    for (let x = 0; x < W; x++) {
      const h = this.grass[x]; if (h < .3) continue;
      const y = this.surface(x), m = this.moist[x] || .5, n = hash(x, 7);
      const col = m < .5 ? [150 + n * 30, 160, 60] : [60 + n * 30, 150 + n * 40, 50];
      g.fillStyle = dk(col); const hh = Math.max(1, Math.round(h * (0.7 + n * .5)));
      g.fillRect(x, y - hh, 1, hh);
    }
    // дерева
    this.trees.forEach(t => this.drawTree(g, t, dk));
    // предмети
    this.items.forEach(it => this.drawItem(g, it, dk));
    // ефекти
    this.fx.forEach(f => { g.fillStyle = f.k === 'grass' ? '#7ccf4a' : f.k === 'sprout' ? '#a6f06a' : '#d8b07a'; for (let i = 0; i < 4; i++) g.fillRect(Math.round(f.x + Math.sin(i * 2.1 + f.t * 9) * 2), Math.round(f.y - (0.5 - f.t) * 6 - i), 1, 1); });
    // курсор
    if (this.hover && !this.readonly) {
      const p = this.hover; g.strokeStyle = '#ffffffcc'; g.lineWidth = 1 / s * 2;
      if (['dig', 'dirt', 'water'].includes(this.tool)) { g.beginPath(); g.arc(p.x, p.y, 1.6, 0, Math.PI * 2); g.stroke(); }
      else if (this.tool === 'scythe' || this.tool === 'sow') g.strokeRect(Math.floor(p.x) - 2, this.surface(Math.max(0, Math.min(W - 1, Math.round(p.x)))) - 5, 5, 5);
      else if (this.tool === 'hand') { const it = this.itemAt(p); if (it) { g.beginPath(); g.arc(it.x, it.y, it.r + .8, 0, Math.PI * 2); g.stroke(); } }
      else if (this.tool === 'axe') { const t = this.treeAt(p); if (t) { const h = this.treeH(t); g.strokeRect(t.x - 2 - h * .25, t.y - h - 2, 4 + h * .5, h + 2); } }
    }
    g.restore();
  };
  P.dark = function (col, L) { const c = mix([10, 12, 25], col, 0.25 + 0.75 * L); return `rgb(${c[0]},${c[1]},${c[2]})`; };
  P.drawTree = function (g, t, dk) {
    const h = this.treeH(t), tw = Math.max(1, Math.round(1 + h / 9)), sh = t.shake ? Math.sin(t.shake * 30) * .6 : 0;
    g.save(); g.translate(t.x + .5 + sh, t.y);
    if (t.fall) { const k = Math.min(1, t.fall), ease = k * k; g.rotate(t.dir * ease * Math.PI / 2); if (t.fall < 1) t.fall = Math.min(.999, t.fall + 0.03); }
    g.fillStyle = dk([96, 64, 38]); g.fillRect(-tw / 2, -h * .62, tw, h * .62);
    g.fillStyle = dk([120, 82, 48]); g.fillRect(-tw / 2, -h * .62, 1, h * .62);
    const cr = Math.max(1.5, h * .32), cy = -h * .62 - cr * .55, leaf = t.age < 40 ? [120, 200, 80] : [62, 138, 46];
    const blob = (cx, cy2, rr, col) => { g.fillStyle = dk(col); for (let yy = -rr; yy <= rr; yy++) { const w = Math.round(Math.sqrt(Math.max(0, rr * rr - yy * yy))); g.fillRect(Math.round(cx - w), Math.round(cy2 + yy), w * 2 + 1, 1); } };
    blob(0, cy, cr, leaf);
    if (t.age >= 40) { blob(-cr * .7, cy + cr * .45, cr * .62, leaf); blob(cr * .7, cy + cr * .45, cr * .62, leaf); blob(-cr * .3, cy - cr * .3, cr * .45, [86, 168, 60]); }
    g.restore();
  };
  P.drawItem = function (g, it, dk) {
    g.save(); g.translate(it.x, it.y);
    if (it.k === 'log' || it.k === 'branch') {
      const k = ITEM[it.k], len = k.len, th = it.k === 'log' ? 2.6 : 1.1;
      g.rotate(it.k === 'log' ? Math.sin(it.a) * .15 : it.a);
      g.fillStyle = dk(it.k === 'log' ? [110, 72, 40] : [125, 90, 55]); g.fillRect(-len / 2, -th / 2, len, th);
      if (it.k === 'log') { g.fillStyle = dk([196, 150, 96]); g.fillRect(len / 2 - 1, -th / 2, 1, th); g.fillStyle = dk([80, 50, 28]); g.fillRect(-len / 2, -th / 2, len, .6); }
      else { g.fillStyle = dk([70, 140, 50]); g.fillRect(len / 2 - 1, -1.2, 1.2, 1); }
    } else if (it.k === 'seed') { g.fillStyle = dk([150, 100, 40]); g.fillRect(-.6, -.6, 1.2, 1.2); g.fillStyle = dk([110, 200, 80]); g.fillRect(-.2, -1.2, .5, .6); }
    else {
      const r = it.r; g.rotate(it.a);
      g.fillStyle = dk([128, 128, 132]); g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = r * (0.85 + hash(i, it.k.length) * .3); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
      g.fillStyle = dk([175, 175, 180]); g.fillRect(-r * .5, -r * .6, r * .5, r * .3);
    }
    g.restore();
  };

  /* ---------- збереження ---------- */
  P.serialize = function () {
    let rle = '', prev = -1, n = 0;
    for (let i = 0; i < this.grid.length; i++) { const c = this.grid[i]; if (c === prev) n++; else { if (n) rle += (n > 1 ? n : '') + 'adrw'[prev]; prev = c; n = 1; } }
    rle += (n > 1 ? n : '') + 'adrw'[prev];
    return JSON.stringify({ v: 1, g: rle, gr: Array.from(this.grass, v => Math.round(v * 10)).join(','), so: Array.from(this.sown).join(''),
      tr: this.trees.filter(t => !t.fall).map(t => [t.x, t.y, Math.round(t.age), Math.round(t.hp * 10) / 10]),
      it: this.items.filter(it => it !== this.grab).map(it => [it.k, Math.round(it.x * 10) / 10, Math.round(it.y * 10) / 10]),
      t: Math.round(this.t), d: Math.round(this.day * 1000) / 1000, rain: this.rain ? 1 : 0, at: Date.now() });
  };
  P.load = function (str, offlineGrow) {
    let o; try { o = JSON.parse(str); } catch (e) { return false; }
    if (!o || !o.g) return false;
    this.grid.fill(AIR); let i = 0;
    o.g.replace(/(\d*)([adrw])/g, (m, n, c) => { const k = n ? +n : 1, v = 'adrw'.indexOf(c); for (let j = 0; j < k && i < this.grid.length; j++) this.grid[i++] = v; return ''; });
    (o.gr || '').split(',').forEach((v, x) => { if (x < W) this.grass[x] = (+v || 0) / 10; });
    (o.so || '').split('').forEach((v, x) => { if (x < W) this.sown[x] = +v; });
    this.trees = (o.tr || []).map(a => ({ x: a[0], y: a[1], age: a[2], hp: a[3], shake: 0, fall: 0, dir: 1 }));
    this.items = []; (o.it || []).forEach(a => this.spawn(a[0], a[1], a[2]));
    this.t = o.t || 0; this.day = o.d || .3; this.rain = !!o.rain;
    if (offlineGrow && o.at) { // поки учня не було, сад ріс (не більше години)
      const sec = Math.min(3600, Math.max(0, (Date.now() - o.at) / 1000));
      if (sec > 30) { this.calcMoist(); const st = 20, n = Math.ceil(sec / st); for (let k = 0; k < n; k++) this.grow(Math.min(st, sec - k * st) * 0.5); this.grown = Math.round(sec / 60); }
    }
    this.dirty = false; this.emit('change'); return true;
  };
  global.Yard = Yard;
})(window);
