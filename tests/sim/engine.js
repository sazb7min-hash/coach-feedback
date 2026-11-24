/* Симулятор зіткнень — спільний рушій для сторінки вчителя та уроку.
   Світ у метрах: x — праворуч, y — вгору, початок у лівому нижньому куті.
   Тіла: кулі (circle) і ящики/машинки (box, без обертання). */
(function (global) {
  'use strict';
  const KIND = {
    ball:   { n: 'Куля',     shape: 'circle', m: 1,   r: 0.4, e: 1,   color: '#3aa0ff' },
    stone:  { n: 'Камінь',   shape: 'circle', m: 5,   r: 0.5, e: 0.4, color: '#8d8d8d' },
    puck:   { n: 'Шайба',    shape: 'circle', m: 0.2, r: 0.25, e: 0.9, color: '#14213d' },
    clay:   { n: 'Пластилін', shape: 'circle', m: 1,  r: 0.4, e: 0,   color: '#ff8a3d' },
    planet: { n: 'Планета',  shape: 'circle', m: 10,  r: 0.35, e: 0.6, color: '#3fae5a' },
    star:   { n: 'Зоря',     shape: 'circle', m: 2000, r: 0.8, e: 0.2, color: '#ffcf33' },
    box:    { n: 'Ящик',     shape: 'box',    m: 3,   w: 0.9, h: 0.9, e: 0.3, color: '#b07a45' },
    car:    { n: 'Машинка',  shape: 'box',    m: 2,   w: 1.6, h: 0.7, e: 0.2, color: '#ff6b4a' }
  };
  const COLORS = ['#3aa0ff', '#ff6b4a', '#ffcf33', '#3fae5a', '#9b6bff', '#ff5fa2', '#14b8a6', '#8d8d8d', '#b07a45', '#14213d'];
  let uid = 0;

  function Sim(canvas, opts) {
    opts = opts || {};
    this.cv = canvas; this.cx = canvas.getContext('2d');
    this.world = Object.assign({ w: 16, h: 9, g: 0, walls: true, drag: 0, mutual: false, G: 1 }, opts.world || {});
    this.view = Object.assign({ arrows: true, trails: false, labels: true, grid: true, edit: true, values: true }, opts.view || {});
    this.bodies = []; this.t = 0; this.running = false; this.speed = 1;
    this.sel = null; this.hist = []; this.events = []; this.contacts = new Set(); this.collisions = 0;
    this.listeners = {}; this.start = null; this.lastHist = -1;
    this._fit(); this._bind();
    const self = this;
    this._ro = new ResizeObserver(() => { self._fit(); self.draw(); }); this._ro.observe(canvas);
    this._raf = null; this._last = 0; this.visible = true;
    const loop = ts => { self._raf = requestAnimationFrame(loop); if (!self.visible) { self._last = ts; return; }
      const dt = Math.min(0.05, (ts - (self._last || ts)) / 1000); self._last = ts;
      if (self.running) self.advance(dt * self.speed);
      self.draw(); };
    this._raf = requestAnimationFrame(loop);
  }
  Sim.KIND = KIND;
  Sim.prototype.on = function (ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); return this; };
  Sim.prototype.emit = function (ev, a, b, c) { (this.listeners[ev] || []).forEach(f => f(a, b, c)); };

  /* ---------- тіла ---------- */
  Sim.prototype.add = function (o) {
    const k = KIND[o.kind || 'ball'] || KIND.ball;
    const b = Object.assign({ id: ++uid, kind: o.kind || 'ball', shape: k.shape, name: k.n, m: k.m, r: k.r, w: k.w, h: k.h, e: k.e, color: k.color,
      x: this.world.w / 2, y: this.world.h / 2, vx: 0, vy: 0, trail: [] }, o);
    if (b.id == null) b.id = ++uid;
    if (!o.color && !o.kind) b.color = COLORS[(this.bodies.length) % COLORS.length];
    if (b.shape === 'circle' && !b.r) b.r = 0.4;
    if (b.shape === 'box') { b.w = b.w || 1; b.h = b.h || 1; }
    this.bodies.push(b); this.emit('change'); return b;
  };
  Sim.prototype.remove = function (b) { this.bodies = this.bodies.filter(x => x !== b); if (this.sel === b) this.select(null); this.emit('change'); };
  Sim.prototype.clear = function () { this.bodies = []; this.select(null); this.resetClock(); this.emit('change'); };
  Sim.prototype.select = function (b) { this.sel = b; this.emit('select', b); };
  Sim.prototype.resetClock = function () { this.t = 0; this.hist = []; this.events = []; this.contacts.clear(); this.collisions = 0; this.lastHist = -1; this.bodies.forEach(b => b.trail = []); };
  /* запам'ятати початковий стан (для «Скинути») */
  Sim.prototype.save = function () { this.start = { world: Object.assign({}, this.world), bodies: this.bodies.map(b => Object.assign({}, b, { trail: [] })) }; };
  Sim.prototype.restore = function () {
    if (!this.start) return;
    const selId = this.sel && this.sel.id;
    this.world = Object.assign({}, this.start.world);
    this.bodies = this.start.bodies.map(b => Object.assign({}, b, { trail: [] }));
    this.running = false; this.resetClock(); this.select(this.bodies.find(b => b.id === selId) || null);
    this.emit('change'); this.emit('state');
  };
  Sim.prototype.play = function () { if (!this.running) { if (this.t === 0) this.save(); this.running = true; this.emit('state'); } };
  Sim.prototype.pause = function () { if (this.running) { this.running = false; this.emit('state'); } };
  Sim.prototype.toggle = function () { this.running ? this.pause() : this.play(); };
  Sim.prototype.load = function (scene) {
    this.running = false; this.bodies = []; this.sel = null;
    this.world = Object.assign({ w: 16, h: 9, g: 0, walls: true, drag: 0, mutual: false, G: 1 }, scene.world || {});
    (scene.bodies || []).forEach(o => this.add(o));
    this.resetClock(); this.save(); this._fit(); this.emit('select', null); this.emit('change'); this.emit('state');
  };

  /* ---------- фізика ---------- */
  Sim.prototype.advance = function (dt) {
    const sub = 8, h = dt / sub;
    for (let i = 0; i < sub; i++) this.step(h);
    if (this.t - this.lastHist >= 0.05) { this.lastHist = this.t; this._record(); }
    this.emit('tick');
  };
  Sim.prototype.step = function (h) {
    const W = this.world, B = this.bodies;
    // сили
    if (W.mutual) {
      for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
        const a = B[i], b = B[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.05, d = Math.sqrt(d2);
        const f = W.G * a.m * b.m / d2, fx = f * dx / d, fy = f * dy / d;
        a.vx += fx / a.m * h; a.vy += fy / a.m * h; b.vx -= fx / b.m * h; b.vy -= fy / b.m * h;
      }
    }
    B.forEach(b => {
      if (W.g) b.vy -= W.g * h;
      if (W.drag) { const k = Math.max(0, 1 - W.drag * h); b.vx *= k; b.vy *= k; }
      b.x += b.vx * h; b.y += b.vy * h;
    });
    this.t += h;
    // стінки
    if (W.walls) B.forEach(b => {
      const hx = b.shape === 'circle' ? b.r : b.w / 2, hy = b.shape === 'circle' ? b.r : b.h / 2;
      if (b.x - hx < 0) { b.x = hx; if (b.vx < 0) b.vx = -b.vx * b.e; }
      if (b.x + hx > W.w) { b.x = W.w - hx; if (b.vx > 0) b.vx = -b.vx * b.e; }
      if (b.y - hy < 0) { b.y = hy; if (b.vy < 0) { b.vy = -b.vy * b.e; if (Math.abs(b.vy) < 0.05) b.vy = 0; } }
      if (b.y + hy > W.h) { b.y = W.h - hy; if (b.vy > 0) b.vy = -b.vy * b.e; }
    });
    else this.bodies = B.filter(b => b.x > -W.w && b.x < 2 * W.w && b.y > -W.h && b.y < 2 * W.h);
    // зіткнення (кілька проходів — щоб «Колиска Ньютона» передавала удар ланцюжком)
    const now = new Set();
    for (let it = 0; it < 3; it++) {
      for (let i = 0; i < this.bodies.length; i++) for (let j = i + 1; j < this.bodies.length; j++) {
        const a = this.bodies[i], b = this.bodies[j], c = contact(a, b);
        if (!c) continue;
        const key = a.id + ':' + b.id; now.add(key);
        const rvx = b.vx - a.vx, rvy = b.vy - a.vy, vn = rvx * c.nx + rvy * c.ny;
        const ia = 1 / a.m, ib = 1 / b.m;
        if (vn < 0) {
          const e = Math.min(a.e, b.e);
          const before = this.events.length < 200 && !this.contacts.has(key) ? snap(a, b) : null;
          const j = -(1 + e) * vn / (ia + ib);
          a.vx -= j * c.nx * ia; a.vy -= j * c.ny * ia; b.vx += j * c.nx * ib; b.vy += j * c.ny * ib;
          if (before) { this.collisions++; const ev = { t: this.t, a: a.id, b: b.id, before: before, after: snap(a, b) }; this.events.push(ev); this.emit('collide', ev); }
        }
        const corr = Math.max(c.p - 0.001, 0) / (ia + ib) * 0.8;
        a.x -= c.nx * corr * ia; a.y -= c.ny * corr * ia; b.x += c.nx * corr * ib; b.y += c.ny * corr * ib;
      }
    }
    this.contacts = now;
  };
  function snap(a, b) { return { va: [a.vx, a.vy], vb: [b.vx, b.vy] }; }
  function contact(a, b) {
    if (a.shape === 'circle' && b.shape === 'circle') {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), r = a.r + b.r;
      if (d >= r) return null;
      return d > 1e-9 ? { nx: dx / d, ny: dy / d, p: r - d } : { nx: 1, ny: 0, p: r };
    }
    if (a.shape === 'box' && b.shape === 'box') {
      const ox = (a.w + b.w) / 2 - Math.abs(b.x - a.x), oy = (a.h + b.h) / 2 - Math.abs(b.y - a.y);
      if (ox <= 0 || oy <= 0) return null;
      return ox < oy ? { nx: Math.sign(b.x - a.x) || 1, ny: 0, p: ox } : { nx: 0, ny: Math.sign(b.y - a.y) || 1, p: oy };
    }
    const flip = a.shape === 'box', c = flip ? b : a, q = flip ? a : b; // c — куля, q — ящик
    const px = Math.max(q.x - q.w / 2, Math.min(c.x, q.x + q.w / 2)), py = Math.max(q.y - q.h / 2, Math.min(c.y, q.y + q.h / 2));
    let dx = px - c.x, dy = py - c.y, d = Math.hypot(dx, dy), res;
    if (d > 1e-9) { if (d >= c.r) return null; res = { nx: dx / d, ny: dy / d, p: c.r - d }; }
    else { // центр кулі всередині ящика
      const ox = q.w / 2 - Math.abs(c.x - q.x), oy = q.h / 2 - Math.abs(c.y - q.y);
      res = ox < oy ? { nx: Math.sign(q.x - c.x) || 1, ny: 0, p: ox + c.r } : { nx: 0, ny: Math.sign(q.y - c.y) || 1, p: oy + c.r };
    }
    if (flip) { res.nx = -res.nx; res.ny = -res.ny; }
    return res;
  }
  Sim.prototype._record = function () {
    const s = this.stats();
    this.hist.push({ t: this.t, v: this.bodies.map(b => ({ id: b.id, v: Math.hypot(b.vx, b.vy), vx: b.vx })), P: s.P, Px: s.Px, E: s.E });
    if (this.hist.length > 1200) this.hist.shift();
    if (this.view.trails) this.bodies.forEach(b => { b.trail.push([b.x, b.y]); if (b.trail.length > 300) b.trail.shift(); });
  };
  Sim.prototype.stats = function () {
    let Px = 0, Py = 0, E = 0;
    this.bodies.forEach(b => { Px += b.m * b.vx; Py += b.m * b.vy; E += 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy); });
    return { Px: Px, Py: Py, P: Math.hypot(Px, Py), E: E };
  };

  /* ---------- малювання ---------- */
  Sim.prototype._fit = function () {
    const r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(50, r.width), h = Math.max(50, r.height);
    this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    this.dpr = dpr; this.s = Math.min(w / this.world.w, h / this.world.h);
    this.ox = (w - this.world.w * this.s) / 2; this.oy = (h - this.world.h * this.s) / 2; this.cw = w; this.ch = h;
  };
  Sim.prototype.toPx = function (x, y) { return [this.ox + x * this.s, this.oy + (this.world.h - y) * this.s]; };
  Sim.prototype.toW = function (px, py) { return [(px - this.ox) / this.s, this.world.h - (py - this.oy) / this.s]; };
  Sim.prototype.draw = function () {
    const g = this.cx, s = this.s, W = this.world, v = this.view;
    if (Math.abs(this.s - Math.min(this.cw / W.w, this.ch / W.h)) > 1e-6) this._fit();
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.cw, this.ch);
    const [x0, y0] = this.toPx(0, W.h);
    g.fillStyle = W.mutual ? '#0e1630' : '#fffaf0'; g.fillRect(x0, y0, W.w * s, W.h * s);
    if (v.grid) {
      g.strokeStyle = W.mutual ? '#ffffff14' : '#14213d14'; g.lineWidth = 1; g.beginPath();
      for (let x = 0; x <= W.w; x++) { const p = this.toPx(x, 0); g.moveTo(p[0] + .5, y0); g.lineTo(p[0] + .5, y0 + W.h * s); }
      for (let y = 0; y <= W.h; y++) { const p = this.toPx(0, y); g.moveTo(x0, p[1] + .5); g.lineTo(x0 + W.w * s, p[1] + .5); }
      g.stroke();
      g.fillStyle = W.mutual ? '#ffffff55' : '#14213d66'; g.font = '600 11px Nunito, system-ui, sans-serif';
      for (let x = 0; x <= W.w; x += 2) { const p = this.toPx(x, 0); g.fillText(x + ' м', p[0] + 3, p[1] - 4); }
    }
    if (W.g) { g.fillStyle = '#7a5a3a'; g.fillRect(x0, y0 + W.h * s - 3, W.w * s, 3); }
    g.strokeStyle = W.walls ? '#14213d' : '#14213d55'; g.lineWidth = W.walls ? 3 : 1.5; if (!W.walls) g.setLineDash([6, 6]);
    g.strokeRect(x0, y0, W.w * s, W.h * s); g.setLineDash([]);
    // сліди
    if (v.trails) this.bodies.forEach(b => {
      if (b.trail.length < 2) return; g.strokeStyle = b.color + '88'; g.lineWidth = 2; g.beginPath();
      b.trail.forEach((p, i) => { const q = this.toPx(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke();
    });
    this.bodies.forEach(b => this._body(b));
    if (v.arrows) this.bodies.forEach(b => this._arrow(b));
    if (v.labels) this.bodies.forEach(b => this._label(b));
  };
  Sim.prototype._body = function (b) {
    const g = this.cx, s = this.s, [px, py] = this.toPx(b.x, b.y), on = b === this.sel;
    g.lineWidth = on ? 4 : 2.5; g.strokeStyle = on ? '#ff6b4a' : '#14213d';
    if (b.shape === 'circle') {
      const r = b.r * s;
      const gr = g.createRadialGradient(px - r * .35, py - r * .35, r * .1, px, py, r);
      gr.addColorStop(0, shadeHex(b.color, 60)); gr.addColorStop(1, b.color);
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); g.stroke();
      if (b.kind === 'planet') { g.strokeStyle = '#ffffffaa'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(px, py, r * 1.5, r * .45, -0.4, 0, Math.PI * 2); g.stroke(); }
      if (b.kind === 'star') { g.fillStyle = '#ffcf3333'; g.beginPath(); g.arc(px, py, r * 1.6, 0, Math.PI * 2); g.fill(); }
    } else {
      const w = b.w * s, h = b.h * s, x = px - w / 2, y = py - h / 2;
      g.fillStyle = b.color; rrect(g, x, y, w, h, b.kind === 'car' ? h * .3 : 4); g.fill(); g.stroke();
      if (b.kind === 'car') {
        g.fillStyle = '#d9f2ff'; rrect(g, x + w * .25, y + h * .12, w * .5, h * .35, 4); g.fill();
        g.fillStyle = '#14213d'; [x + w * .22, x + w * .78].forEach(cx => { g.beginPath(); g.arc(cx, y + h, h * .22, 0, Math.PI * 2); g.fill(); });
      } else if (b.kind === 'box') {
        g.strokeStyle = '#00000044'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + w - 4, y + h - 4); g.moveTo(x + w - 4, y + 4); g.lineTo(x + 4, y + h - 4); g.stroke();
      }
    }
  };
  Sim.prototype._arrow = function (b) {
    const sp = Math.hypot(b.vx, b.vy); if (sp < 0.02 && !(this.view.edit && !this.running && b === this.sel)) return;
    const g = this.cx, [px, py] = this.toPx(b.x, b.y), k = this.s * 0.35;
    const ex = px + b.vx * k, ey = py - b.vy * k;
    g.strokeStyle = '#d63c3c'; g.fillStyle = '#d63c3c'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(px, py); g.lineTo(ex, ey); g.stroke();
    if (sp > 0.02) { const a = Math.atan2(ey - py, ex - px); g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 11 * Math.cos(a - .45), ey - 11 * Math.sin(a - .45)); g.lineTo(ex - 11 * Math.cos(a + .45), ey - 11 * Math.sin(a + .45)); g.closePath(); g.fill(); }
    if (this.view.edit && !this.running && b === this.sel) { g.fillStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(ex, ey, 8, 0, Math.PI * 2); g.fill(); g.stroke(); }
  };
  Sim.prototype._label = function (b) {
    const g = this.cx, [px, py] = this.toPx(b.x, b.y), hy = (b.shape === 'circle' ? b.r : b.h / 2) * this.s;
    const sp = Math.hypot(b.vx, b.vy);
    const txt = this.view.values ? `${fmt(b.m)} кг · ${fmt(sp)} м/с` : b.name;
    g.font = '800 12px Nunito, system-ui, sans-serif'; g.textAlign = 'center';
    const tw = g.measureText(txt).width + 10, y = py - hy - 10;
    g.fillStyle = this.world.mutual ? '#ffffffdd' : '#ffffffcc'; rrect(g, px - tw / 2, y - 13, tw, 18, 9); g.fill();
    g.fillStyle = '#14213d'; g.fillText(txt, px, y); g.textAlign = 'start';
  };
  function rrect(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function shadeHex(hex, k) { const n = parseInt(hex.slice(1, 7), 16), c = v => Math.max(0, Math.min(255, v + k)) | 0; return `rgb(${c(n >> 16)},${c(n >> 8 & 255)},${c(n & 255)})`; }
  function fmt(x) { if (Math.abs(x) < 0.005) x = 0; const a = Math.abs(x); return a >= 100 ? Math.round(x) + '' : a >= 10 ? x.toFixed(1).replace('.', ',') : x.toFixed(2).replace('.', ','); }
  Sim.fmt = fmt;

  /* ---------- миша / дотик: вибір, перетягування, стрілка швидкості ---------- */
  Sim.prototype.hit = function (x, y) {
    for (let i = this.bodies.length - 1; i >= 0; i--) {
      const b = this.bodies[i];
      if (b.shape === 'circle' ? Math.hypot(x - b.x, y - b.y) <= b.r + 0.1 : Math.abs(x - b.x) <= b.w / 2 + 0.1 && Math.abs(y - b.y) <= b.h / 2 + 0.1) return b;
    }
    return null;
  };
  Sim.prototype._bind = function () {
    const cv = this.cv, self = this; let drag = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => {
      if (!self.view.edit) return;
      const [px, py] = pt(e), [x, y] = self.toW(px, py), b = self.sel;
      if (b && !self.running) { // ручка стрілки швидкості
        const k = self.s * 0.35, [bx, by] = self.toPx(b.x, b.y);
        if (Math.hypot(px - (bx + b.vx * k), py - (by - b.vy * k)) < 14) { drag = { mode: 'vel', b: b }; cv.setPointerCapture(e.pointerId); return; }
      }
      const h = self.hit(x, y);
      self.select(h);
      if (h && !self.running) { drag = { mode: 'move', b: h, dx: h.x - x, dy: h.y - y }; cv.setPointerCapture(e.pointerId); }
    });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      const [px, py] = pt(e), [x, y] = self.toW(px, py), b = drag.b, W = self.world;
      if (drag.mode === 'move') {
        const hx = b.shape === 'circle' ? b.r : b.w / 2, hy = b.shape === 'circle' ? b.r : b.h / 2;
        b.x = Math.max(hx, Math.min(W.w - hx, x + drag.dx)); b.y = Math.max(hy, Math.min(W.h - hy, y + drag.dy));
      } else {
        const k = 0.35, vx = (x - b.x) / k, vy = (y - b.y) / k, sp = Math.hypot(vx, vy), mx = 20;
        const f = sp > mx ? mx / sp : 1; b.vx = Math.round(vx * f * 10) / 10; b.vy = Math.round(vy * f * 10) / 10;
      }
      if (self.t === 0) self.save();
      self.emit('change');
    });
    const up = () => { if (drag) { drag = null; if (self.t === 0) self.save(); self.emit('change'); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  };

  /* ---------- графік ---------- */
  Sim.prototype.plot = function (canvas, mode) {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height);
    const H = this.hist, L = 34, B = 20, w = r.width - L - 8, h = r.height - B - 8;
    g.font = '600 11px Nunito, system-ui, sans-serif'; g.fillStyle = '#14213d99'; g.strokeStyle = '#14213d22'; g.lineWidth = 1;
    if (H.length < 2) { g.fillText('Графік з’явиться після запуску ▶', L, 20 + h / 2); return; }
    const t0 = H[0].t, t1 = H[H.length - 1].t || 1;
    let series = [];
    if (mode === 'P') series = [{ c: '#9b6bff', n: 'Імпульс', d: H.map(p => [p.t, p.P]) }];
    else if (mode === 'E') series = [{ c: '#ff6b4a', n: 'Енергія', d: H.map(p => [p.t, p.E]) }];
    else series = this.bodies.map(b => ({ c: b.color, n: b.name, d: H.map(p => { const q = p.v.find(x => x.id === b.id); return [p.t, q ? q.v : null]; }) }));
    let mx = 0; series.forEach(s => s.d.forEach(p => { if (p[1] != null) mx = Math.max(mx, p[1]); })); mx = mx * 1.15 || 1;
    for (let i = 0; i <= 4; i++) { const y = 8 + h - h * i / 4; g.beginPath(); g.moveTo(L, y + .5); g.lineTo(L + w, y + .5); g.stroke(); g.fillText(fmt(mx * i / 4), 2, y + 4); }
    g.fillText(fmt(t0) + ' с', L, r.height - 4); g.textAlign = 'right'; g.fillText(fmt(t1) + ' с', L + w, r.height - 4); g.textAlign = 'start';
    series.forEach(s => { g.strokeStyle = s.c; g.lineWidth = 2.5; g.beginPath(); let st = false;
      s.d.forEach(p => { if (p[1] == null) { st = false; return; } const x = L + (p[0] - t0) / Math.max(1e-6, t1 - t0) * w, y = 8 + h - p[1] / mx * h; st ? g.lineTo(x, y) : g.moveTo(x, y); st = true; }); g.stroke(); });
  };

  global.Sim = Sim;
})(window);

/* ---------- Готові сценарії ---------- */
(function (Sim) {
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  Sim.SCENES = [
    { id: 'lightheavy', n: 'Легка куля → важка', d: 'Куля 1 кг налітає на нерухомий камінь 10 кг. Що станеться з легкою кулею?',
      world: { g: 0, walls: true }, bodies: [{ kind: 'ball', name: 'Легка куля', m: 1, x: 3, y: 4.5, vx: 4, color: '#3aa0ff' }, { kind: 'stone', name: 'Важкий камінь', m: 10, r: 0.6, e: 1, x: 10, y: 4.5 }] },
    { id: 'equal', n: 'Однакові кулі', d: 'Пружний удар двох однакових куль: друга стоїть. Куди дінеться швидкість першої?',
      world: { g: 0, walls: true }, bodies: [{ kind: 'ball', name: 'Куля A', m: 1, x: 3, y: 4.5, vx: 3, color: '#3aa0ff' }, { kind: 'ball', name: 'Куля B', m: 1, x: 9, y: 4.5, color: '#ff6b4a' }] },
    { id: 'clay', n: 'Пластилін (непружний удар)', d: 'Пружність 0: після удару кулі рухаються разом.',
      world: { g: 0, walls: true }, bodies: [{ kind: 'clay', name: 'Пластилін A', m: 1, x: 3, y: 4.5, vx: 4 }, { kind: 'clay', name: 'Пластилін B', m: 1, x: 9, y: 4.5, color: '#ffcf33' }] },
    { id: 'billiard', n: 'Більярд', d: 'Біла куля розбиває піраміду з 10 куль. На столі є тертя.',
      world: { g: 0, walls: true, drag: 0.25 }, bodies: (function () {
        const a = [{ kind: 'ball', name: 'Біла', m: 0.17, r: 0.3, e: 0.95, x: 3, y: 4.52, vx: 9, color: '#f5f5f5' }], C = ['#ffcf33', '#3aa0ff', '#ff6b4a', '#9b6bff', '#ff8a3d', '#3fae5a', '#8a2f35', '#14213d', '#ffcf33', '#3aa0ff'];
        let k = 0; for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) a.push({ kind: 'ball', name: 'Куля ' + (k + 1), m: 0.17, r: 0.3, e: 0.95, x: 10.5 + row * 0.53, y: 4.5 + (i - row / 2) * 0.62, color: C[k++] });
        return a; })() },
    { id: 'cradle', n: 'Колиска Ньютона', d: 'Куля б’є в ряд однакових куль — і відлітає лише крайня.',
      world: { g: 0, walls: true }, bodies: [{ kind: 'ball', name: 'Куля 1', m: 1, x: 2.5, y: 4.5, vx: 3, color: '#ff6b4a' }].concat([0, 1, 2, 3, 4].map(i => ({ kind: 'ball', name: 'Куля ' + (i + 2), m: 1, x: 7 + i * 0.801, y: 4.5, color: '#3aa0ff' }))) },
    { id: 'cars', n: 'Лобове зіткнення машинок', d: 'Легка швидка машинка і важка повільна їдуть назустріч.',
      world: { g: 0, walls: true }, bodies: [{ kind: 'car', name: 'Легковик', m: 1.2, x: 3, y: 4.5, vx: 5, color: '#ff6b4a' }, { kind: 'car', name: 'Вантажівка', m: 3, w: 2.2, h: 0.9, x: 12.5, y: 4.5, vx: -2.5, color: '#3aa0ff' }] },
    { id: 'bounce', n: 'Падіння з відскоком', d: 'Сила тяжіння 9,8 м/с². У кожного тіла своя пружність.',
      world: { g: 9.8, walls: true }, bodies: [{ kind: 'ball', name: 'М’яч (0,9)', e: 0.9, x: 3, y: 8, color: '#3aa0ff' }, { kind: 'ball', name: 'Тенісний (0,7)', e: 0.7, r: 0.3, m: 0.06, x: 6.5, y: 8, color: '#c8e64b' }, { kind: 'clay', name: 'Пластилін (0)', x: 10, y: 8 }, { kind: 'box', name: 'Ящик (0,3)', x: 13, y: 8 }] },
    { id: 'planets', n: 'Планети навколо зорі', d: 'Тіла притягуються одне до одного (всесвітнє тяжіння). Без стін.',
      world: { g: 0, walls: false, mutual: true, G: 0.01 }, bodies: [{ kind: 'star', name: 'Зоря', x: 8, y: 4.5 }, { kind: 'planet', name: 'Планета 1', m: 10, x: 8, y: 8.5, vx: Math.sqrt(20 / 4) }, { kind: 'planet', name: 'Планета 2', m: 4, r: 0.25, x: 10.5, y: 4.5, vy: Math.sqrt(20 / 2.5), color: '#3aa0ff' }] },
    { id: 'gas', n: 'Газ у посудині', d: '30 молекул хаотично рухаються й зіштовхуються.',
      world: { g: 0, walls: true }, bodies: (function () { const r = rnd(7), a = []; for (let i = 0; i < 30; i++) { const ang = r() * Math.PI * 2, v = 1 + r() * 3; a.push({ kind: 'ball', name: 'Молекула ' + (i + 1), m: 0.1, r: 0.22, x: 1 + (i % 6) * 2.6 + r() * .5, y: 1 + Math.floor(i / 6) * 1.6 + r() * .4, vx: v * Math.cos(ang), vy: v * Math.sin(ang), color: i ? '#3aa0ff' : '#ff6b4a' }); } return a; })() },
    { id: 'empty', n: 'Порожня сцена', d: 'Додай власні об’єкти й налаштуй їх.', world: { g: 0, walls: true }, bodies: [] }
  ];
})(window.Sim);
