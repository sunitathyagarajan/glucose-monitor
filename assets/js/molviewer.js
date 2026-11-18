/* ==========================================================
   Lightweight 3D molecule viewer (no dependencies)
   3D coordinates: PubChem computed conformers (CIDs listed below).
   ========================================================== */
(function () {
  "use strict";

  // atoms: [element, x, y, z] (Å) · bonds: [i, j, order] · carbons: atom index for C1..C6
  const MOLECULES = {
    "glucose-open": {
      title: "D-Glucose (open chain)",
      sub: "Aldehyde at C1 · aldohexose · PubChem CID 107526",
      carbons: [11, 9, 7, 6, 8, 10],
      highlight: 11,
      highlightNote: "C1 aldehyde (–CHO)",
      atoms: [["O",-0.018,-1.352,0.319],["O",-0.439,1.209,1.593],["O",2.250,1.331,-0.609],["O",-2.314,0.644,-1.487],["O",4.091,-0.603,0.077],["O",-3.066,-1.508,-0.114],["C",0.347,-0.092,-0.256],["C",-0.645,0.995,0.191],["C",1.817,0.165,0.107],["C",-2.133,0.733,-0.078],["C",2.760,-0.970,-0.277],["C",-2.650,-0.552,0.534],["H",0.259,-0.205,-1.343],["H",-0.368,1.930,-0.312],["H",1.934,0.378,1.175],["H",-2.743,1.555,0.311],["H",2.749,-1.146,-1.357],["H",2.514,-1.905,0.235],["H",0.154,-1.308,1.275],["H",-0.665,0.391,2.065],["H",-2.652,-0.585,1.637],["H",2.159,1.149,-1.560],["H",-3.272,0.614,-1.657],["H",4.113,-0.477,1.041]],
      bonds: [[0,6,1],[0,18,1],[1,7,1],[1,19,1],[2,8,1],[2,21,1],[3,9,1],[3,22,1],[4,10,1],[4,23,1],[5,11,2],[6,7,1],[6,8,1],[6,12,1],[7,9,1],[7,13,1],[8,10,1],[8,14,1],[9,11,1],[9,15,1],[10,16,1],[10,17,1],[11,20,1]]
    },
    "glucose-alpha": {
      title: "α-D-Glucopyranose",
      sub: "6-membered ring · C1–OH axial (trans to CH₂OH) · CID 79025",
      carbons: [10, 9, 7, 6, 8, 11],
      highlight: 10,
      highlightNote: "C1 anomeric carbon (hemiacetal)",
      atoms: [["O",-0.796,-1.083,-0.583],["O",-0.534,2.360,0.706],["O",2.102,1.845,-0.311],["O",2.840,-0.943,-0.066],["O",0.545,-2.035,1.125],["O",-3.432,-0.682,-0.042],["C",-0.213,1.244,-0.121],["C",1.228,0.828,0.184],["C",-1.191,0.090,0.138],["C",1.561,-0.495,-0.502],["C",0.501,-1.561,-0.220],["C",-2.610,0.431,-0.308],["H",-0.288,1.572,-1.166],["H",1.405,0.769,1.265],["H",-1.228,-0.151,1.208],["H",1.628,-0.324,-1.583],["H",0.706,-2.435,-0.846],["H",-2.655,0.635,-1.383],["H",-3.005,1.296,0.232],["H",0.002,3.114,0.408],["H",1.963,2.642,0.227],["H",2.787,-1.119,0.888],["H",0.771,-1.294,1.710],["H",-3.073,-1.441,-0.532]],
      bonds: [[0,8,1],[0,10,1],[1,6,1],[1,19,1],[2,7,1],[2,20,1],[3,9,1],[3,21,1],[4,10,1],[4,22,1],[5,11,1],[5,23,1],[6,7,1],[6,8,1],[6,12,1],[7,9,1],[7,13,1],[8,11,1],[8,14,1],[9,10,1],[9,15,1],[10,16,1],[11,17,1],[11,18,1]]
    },
    "glucose-beta": {
      title: "β-D-Glucopyranose",
      sub: "All –OH equatorial → most stable form · CID 64689",
      carbons: [10, 9, 7, 6, 8, 11],
      highlight: 10,
      highlightNote: "C1 anomeric carbon (hemiacetal)",
      atoms: [["O",-0.668,1.159,0.257],["O",-0.887,-2.448,-0.339],["O",1.862,-2.069,0.470],["O",2.861,0.541,-0.462],["O",1.122,2.655,0.257],["O",-3.374,0.972,-0.186],["C",-0.373,-1.247,0.230],["C",1.086,-1.071,-0.194],["C",-1.221,-0.062,-0.237],["C",1.608,0.315,0.184],["C",0.639,1.413,-0.253],["C",-2.655,-0.158,0.274],["H",-0.425,-1.352,1.321],["H",1.207,-1.249,-1.270],["H",-1.255,-0.010,-1.334],["H",1.795,0.360,1.264],["H",0.597,1.514,-1.344],["H",-2.692,-0.153,1.369],["H",-3.156,-1.058,-0.092],["H",-0.851,-2.361,-1.307],["H",1.497,-2.936,0.220],["H",2.716,0.499,-1.423],["H",1.488,2.503,1.145],["H",-2.919,1.765,0.144]],
      bonds: [[0,8,1],[0,10,1],[1,6,1],[1,19,1],[2,7,1],[2,20,1],[3,9,1],[3,21,1],[4,10,1],[4,22,1],[5,11,1],[5,23,1],[6,7,1],[6,8,1],[6,12,1],[7,9,1],[7,13,1],[8,11,1],[8,14,1],[9,10,1],[9,15,1],[10,16,1],[11,17,1],[11,18,1]]
    },
    "fructose-open": {
      title: "D-Fructose (open chain)",
      sub: "Ketone at C2 · ketohexose · CID 5984",
      carbons: [11, 10, 8, 6, 7, 9],
      highlight: 10,
      highlightNote: "C2 ketone (C=O)",
      atoms: [["O",-0.351,0.285,1.617],["O",-2.123,-0.097,-1.577],["O",0.400,-1.983,0.016],["O",-4.274,0.348,0.133],["O",2.792,-1.003,0.518],["O",3.835,1.352,-0.167],["C",-0.498,0.233,0.201],["C",-1.944,-0.155,-0.162],["C",0.598,-0.645,-0.422],["C",-2.964,0.783,0.482],["C",2.033,-0.242,-0.085],["C",2.495,1.123,-0.556],["H",-0.327,1.253,-0.167],["H",-2.160,-1.183,0.153],["H",0.513,-0.649,-1.514],["H",-2.892,0.776,1.573],["H",-2.844,1.808,0.115],["H",-0.772,1.103,1.932],["H",2.438,1.162,-1.647],["H",1.870,1.907,-0.123],["H",-1.924,0.810,-1.866],["H",0.409,-1.982,0.989],["H",-4.900,0.964,0.550],["H",3.854,1.394,0.805]],
      bonds: [[0,6,1],[0,17,1],[1,7,1],[1,20,1],[2,8,1],[2,21,1],[3,9,1],[3,22,1],[4,10,2],[5,11,1],[5,23,1],[6,7,1],[6,8,1],[6,12,1],[7,9,1],[7,13,1],[8,10,1],[8,14,1],[9,15,1],[9,16,1],[10,11,1],[11,18,1],[11,19,1]]
    },
    "fructose-beta": {
      title: "β-D-Fructofuranose",
      sub: "5-membered ring (as found in sucrose) · CID 439709",
      carbons: [10, 7, 6, 8, 9, 11],
      highlight: 7,
      highlightNote: "C2 anomeric carbon (hemiketal)",
      atoms: [["O",0.097,-0.985,-0.328],["O",-1.285,2.265,0.396],["O",-1.226,-0.249,1.466],["O",1.657,2.211,-0.558],["O",-2.598,-1.899,-0.303],["O",2.650,-2.108,-0.002],["C",-0.562,1.264,-0.292],["C",-1.011,-0.151,0.057],["C",0.897,1.219,0.107],["C",1.291,-0.176,-0.364],["C",-2.269,-0.575,-0.685],["C",2.360,-0.816,0.506],["H",-0.655,1.456,-1.369],["H",1.033,1.362,1.185],["H",1.631,-0.172,-1.407],["H",-2.127,-0.560,-1.770],["H",-3.118,0.064,-0.424],["H",2.019,-0.934,1.540],["H",3.281,-0.225,0.502],["H",-0.855,3.117,0.206],["H",-0.796,0.495,1.916],["H",1.527,2.107,-1.516],["H",-1.839,-2.466,-0.525],["H",1.822,-2.617,0.002]],
      bonds: [[0,7,1],[0,9,1],[1,6,1],[1,19,1],[2,7,1],[2,20,1],[3,8,1],[3,21,1],[4,10,1],[4,22,1],[5,11,1],[5,23,1],[6,7,1],[6,8,1],[6,12,1],[7,10,1],[8,9,1],[8,13,1],[9,11,1],[9,14,1],[10,15,1],[10,16,1],[11,17,1],[11,18,1]]
    }
  };

  const EL = {
    C: { color: [150, 156, 166], r: 0.34, vdw: 1.7 },
    O: { color: [235, 64, 52], r: 0.32, vdw: 1.52 },
    H: { color: [238, 240, 245], r: 0.2, vdw: 1.1 }
  };

  function mul(a, b) { // 3x3 row-major
    const r = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return r;
  }
  function rotX(t) { const c = Math.cos(t), s = Math.sin(t); return [1, 0, 0, 0, c, -s, 0, s, c]; }
  function rotY(t) { const c = Math.cos(t), s = Math.sin(t); return [c, 0, s, 0, 1, 0, -s, 0, c]; }

  class MolViewer {
    constructor(canvas, opts = {}) {
      this.cv = canvas; this.ctx = canvas.getContext("2d");
      this.R = mul(rotX(-0.35), rotY(0.4));
      this.zoom = 1; this.auto = true; this.showH = true; this.labels = true; this.space = false;
      this.onChange = opts.onChange || (() => {});
      this.pointers = new Map(); this.lastPinch = 0;
      this._bind(); this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      this._loop = this._loop.bind(this); requestAnimationFrame(this._loop);
    }
    load(key) {
      const m = MOLECULES[key]; if (!m) return;
      this.key = key; this.mol = m;
      let cx = 0, cy = 0, cz = 0;
      m.atoms.forEach(a => { cx += a[1]; cy += a[2]; cz += a[3]; });
      const n = m.atoms.length; cx /= n; cy /= n; cz /= n;
      this.atoms = m.atoms.map(a => ({ el: a[0], p: [a[1] - cx, a[2] - cy, a[3] - cz] }));
      this.cIndex = {}; m.carbons.forEach((ai, k) => { this.cIndex[ai] = k + 1; });
      this.onChange(m);
    }
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = this.cv.clientWidth, h = this.cv.clientHeight;
      this.cv.width = Math.max(1, w * dpr); this.cv.height = Math.max(1, h * dpr);
      this.dpr = dpr; this.W = w; this.H = h;
    }
    _bind() {
      const cv = this.cv;
      cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); this.pointers.set(e.pointerId, [e.clientX, e.clientY]); this.auto = false; this.onChange(this.mol, true); });
      cv.addEventListener("pointermove", e => {
        if (!this.pointers.has(e.pointerId)) return;
        const prev = this.pointers.get(e.pointerId); const cur = [e.clientX, e.clientY];
        if (this.pointers.size === 1) {
          const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
          this.R = mul(mul(rotY(dx * 0.01), rotX(dy * 0.01)), this.R);
        } else if (this.pointers.size === 2) {
          this.pointers.set(e.pointerId, cur);
          const [a, b] = [...this.pointers.values()];
          const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (this.lastPinch) this.zoom = Math.min(2.5, Math.max(0.5, this.zoom * d / this.lastPinch));
          this.lastPinch = d; return;
        }
        this.pointers.set(e.pointerId, cur);
      });
      const end = e => { this.pointers.delete(e.pointerId); this.lastPinch = 0; };
      cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
      cv.addEventListener("wheel", e => { e.preventDefault(); this.zoom = Math.min(2.5, Math.max(0.5, this.zoom * (e.deltaY < 0 ? 1.08 : 0.93))); }, { passive: false });
    }
    _loop() {
      if (this.auto && this.mol && this.visible !== false) this.R = mul(rotY(0.006), this.R);
      if (this.mol) this.draw();
      requestAnimationFrame(this._loop);
    }
    project(p) {
      const R = this.R;
      const x = R[0] * p[0] + R[1] * p[1] + R[2] * p[2];
      const y = R[3] * p[0] + R[4] * p[1] + R[5] * p[2];
      const z = R[6] * p[0] + R[7] * p[1] + R[8] * p[2];
      const scale = Math.min(this.W, this.H) / 10.5 * this.zoom;
      const persp = 12 / (12 - z);
      return { x: this.W / 2 + x * scale * persp, y: this.H / 2 - y * scale * persp, z, s: scale * persp };
    }
    draw() {
      const ctx = this.ctx, dpr = this.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.W, this.H);
      const P = this.atoms.map(a => this.project(a.p));
      const items = [];
      this.atoms.forEach((a, i) => { if (a.el !== "H" || this.showH) items.push({ t: "a", i, z: P[i].z }); });
      if (!this.space) this.mol.bonds.forEach(b => {
        const [i, j, o] = b;
        if (!this.showH && (this.atoms[i].el === "H" || this.atoms[j].el === "H")) return;
        items.push({ t: "b", i, j, o, z: (P[i].z + P[j].z) / 2 - 0.01 });
      });
      items.sort((a, b) => a.z - b.z);
      for (const it of items) {
        if (it.t === "b") this._bond(P[it.i], P[it.j], this.atoms[it.i].el, this.atoms[it.j].el, it.o);
        else this._atom(P[it.i], this.atoms[it.i].el, it.i);
      }
      if (this.labels) {
        ctx.font = "600 12px " + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        for (const k in this.cIndex) {
          const p = P[k]; const lbl = "C" + this.cIndex[k];
          const special = +k === this.mol.highlight;
          ctx.fillStyle = special ? "rgba(250,204,21,.95)" : "rgba(15,23,42,.78)";
          const w = 24, h = 17, ox = 0, oy = -(this.space ? 1.0 : 0.55) * p.s;
          ctx.beginPath(); ctx.roundRect(p.x + ox - w / 2, p.y + oy - h / 2, w, h, 5); ctx.fill();
          ctx.fillStyle = special ? "#111827" : "#e2e8f0"; ctx.fillText(lbl, p.x + ox, p.y + oy + 0.5);
        }
      }
    }
    _shade(c, f) { return `rgb(${Math.min(255, c[0] * f) | 0},${Math.min(255, c[1] * f) | 0},${Math.min(255, c[2] * f) | 0})`; }
    _atom(p, el, idx) {
      const ctx = this.ctx, e = EL[el] || EL.C;
      const r = (this.space ? e.vdw * 0.95 : e.r) * p.s;
      const depth = 0.75 + 0.25 * Math.max(-1, Math.min(1, p.z / 4));
      if (idx === this.mol.highlight) {
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.75 + 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250,204,21,.28)"; ctx.fill();
      }
      const g = ctx.createRadialGradient(p.x - r * .35, p.y - r * .35, r * .1, p.x, p.y, r);
      g.addColorStop(0, this._shade(e.color, 1.45 * depth)); g.addColorStop(.55, this._shade(e.color, depth)); g.addColorStop(1, this._shade(e.color, .45 * depth));
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    }
    _bond(a, b, ea, eb, order) {
      const ctx = this.ctx; const dx = b.x - a.x, dy = b.y - a.y; const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L; const w = 0.11 * (a.s + b.s) / 2;
      const offs = order === 2 ? [-w * 1.1, w * 1.1] : [0];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.lineCap = "round"; ctx.lineWidth = order === 2 ? w * 0.95 : w * 1.35;
      for (const o of offs) {
        ctx.strokeStyle = this._shade((EL[ea] || EL.C).color, .85);
        ctx.beginPath(); ctx.moveTo(a.x + nx * o, a.y + ny * o); ctx.lineTo(mx + nx * o, my + ny * o); ctx.stroke();
        ctx.strokeStyle = this._shade((EL[eb] || EL.C).color, .85);
        ctx.beginPath(); ctx.moveTo(mx + nx * o, my + ny * o); ctx.lineTo(b.x + nx * o, b.y + ny * o); ctx.stroke();
      }
    }
    reset() { this.R = mul(rotX(-0.35), rotY(0.4)); this.zoom = 1; }
  }

  window.MolViewer = MolViewer;
  window.MOLECULES = MOLECULES;
})();
