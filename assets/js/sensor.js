/* ==========================================================
   Sensor page interactions
   ========================================================== */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const cite = (...n) => `<sup class="cite">${n.map(k => `<a href="#ref-${k}">${k}</a>`).join(",")}</sup>`;

  /* ---------------- Signal chain ---------------- */
  (function flow() {
    const B = [
      ["Capillary blood", "glucose source", "#dc2626", "#lag"],
      ["Interstitial fluid", "5–10 min behind", "#0ea5e9", "#lag"],
      ["Enzyme electrode", "glucose → e⁻", "#ca8a04", "#chemistry"],
      ["Potentiostat", "current in nA", "#7c3aed", "#electrode"],
      ["Algorithm", "nA → mg/dL + trend", "#2563c9", "#signal"],
      ["Phone · pump", "alerts, insulin dosing", "#0f9d8a", "#accuracy"]
    ];
    let s = `<defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10z" style="fill:var(--ink-3)"/></marker></defs>`;
    B.forEach((b, i) => {
      const x = 8 + i * 166;
      s += `<g class="hotspot" data-go="${b[3]}" tabindex="0" role="link"><rect x="${x}" y="30" width="144" height="110" rx="14" style="fill:var(--surface);stroke:${b[2]}" stroke-width="2"/>
        <circle cx="${x + 72}" cy="62" r="16" style="fill:${b[2]}" opacity=".9"/><text x="${x + 72}" y="67" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" style="fill:#fff">${i + 1}</text>
        <text x="${x + 72}" y="100" text-anchor="middle" font-size="14.5" font-weight="700">${b[0]}</text>
        <text x="${x + 72}" y="121" text-anchor="middle" font-size="12" class="t3">${b[1]}</text></g>`;
      if (i < B.length - 1) s += `<line x1="${x + 146}" y1="85" x2="${x + 164}" y2="85" style="stroke:var(--ink-3)" stroke-width="2" marker-end="url(#fa)"/>`;
    });
    $("#flowSvg").innerHTML = s;
    $("#flowSvg").addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) document.querySelector(g.dataset.go).scrollIntoView({ behavior: "smooth" }); });
  })();

  /* ---------------- Anatomy ---------------- */
  const PARTS = {
    housing: ["Housing / transmitter", "Waterproof plastic shell holding the electronics. In current devices the sensor, electronics and battery form one disposable unit, replaced every 10–15 days."],
    chip: ["Potentiostat chip (ASIC)", "Holds the working electrode at a constant potential versus the reference, measures nanoamp currents, digitises them and runs the calibration and filtering algorithm."],
    battery: ["Battery", "A small coin cell that powers the potentiostat and radio for the whole wear period. Implanted sensors (Eversense) are instead powered wirelessly by the on-skin transmitter."],
    antenna: ["Bluetooth antenna", "Bluetooth Low Energy sends a reading every 1–5 min to a phone, receiver, smartwatch or insulin pump, which displays values, trend arrows and alarms."],
    adhesive: ["Adhesive patch", "Medical-grade adhesive keeps the device fixed so the filament does not move in the tissue (movement causes noise). Skin irritation is a common side effect."],
    filament: ["Sensor filament", "A thin, flexible wire or strip (well under 0.5 mm wide) that sits ≈ 5 mm deep in subcutaneous tissue. It carries the electrodes and their coatings."],
    re: ["Reference / counter electrode", "Silver/silver chloride (Ag/AgCl). Provides a stable reference potential; in two-electrode designs it also carries the return current."],
    we: ["Working electrode", "Platinum (or carbon/gold in mediated sensors) coated with immobilised glucose oxidase and stacked membranes. This is where glucose is converted into an electrical current.", "#electrode"],
    isf: ["Interstitial fluid (ISF)", "The fluid between cells. Glucose diffuses into it from capillaries, so ISF glucose closely follows blood glucose with a lag of about 5–10 minutes.", "#lag"],
    capillary: ["Capillary", "Blood vessels deliver glucose to the tissue. Fingerstick meters measure capillary blood directly; CGMs measure the ISF around them."],
    skin: ["Skin layers", "Epidermis (outer barrier) → dermis (nerves, capillaries) → subcutaneous fat. The filament tip sits in the subcutaneous layer, where there are fewer nerve endings."]
  };
  (function anatomy() {
    const svg = $("#anatomySvg");
    let s = `<defs><marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#d97706"/></marker></defs>`;
    // skin layers
    s += `<g class="hotspot" data-k="skin"><rect x="0" y="170" width="800" height="26" fill="#e7b392"/><rect x="0" y="196" width="800" height="84" fill="#f3c6b3"/><rect x="0" y="280" width="800" height="190" fill="#f8e3ad"/>`;
    const fat = [[60, 330], [120, 380], [70, 430], [180, 440], [250, 400], [520, 330], [580, 400], [660, 340], [720, 420], [640, 450], [480, 440], [760, 320], [300, 450]];
    fat.forEach(([x, y]) => { s += `<ellipse cx="${x}" cy="${y}" rx="30" ry="22" fill="#fbecc4" stroke="#e5c56f" stroke-width="1.5"/>`; });
    s += `<path d="M230,280 C238,212 272,212 280,280" fill="none" stroke="#dc2626" stroke-width="4"/><path d="M520,280 C528,214 562,214 570,280" fill="none" stroke="#dc2626" stroke-width="4"/></g>`;
    // capillary + glucose diffusing
    s += `<g class="hotspot" data-k="capillary"><path d="M190,345 C250,318 300,362 366,335" fill="none" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/><path d="M190,345 C250,318 300,362 366,335" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/></g>`;
    s += `<line x1="368" y1="336" x2="390" y2="340" stroke="#d97706" stroke-width="2" marker-end="url(#ga)"/><line x1="362" y1="326" x2="388" y2="316" stroke="#d97706" stroke-width="2" marker-end="url(#ga)"/>`;
    // ISF dots
    let isf = ""; for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = 18 + (i * 37 % 55); isf += `<circle cx="${(400 + Math.cos(a) * r).toFixed(1)}" cy="${(345 + Math.sin(a) * r * 0.9).toFixed(1)}" r="2.3" fill="#38bdf8" opacity=".75"/>`; }
    s += `<g class="hotspot" data-k="isf"><ellipse cx="400" cy="345" rx="78" ry="66" fill="#7dd3fc" opacity=".22"/>${isf}</g>`;
    // filament & electrodes
    s += `<g class="hotspot" data-k="filament"><rect x="396" y="150" width="8" height="242" rx="4" fill="#94a3b8"/></g>`;
    s += `<g class="hotspot" data-k="re"><rect x="394.5" y="288" width="11" height="24" rx="3" fill="#e2e8f0" stroke="#64748b"/></g>`;
    s += `<g class="hotspot" data-k="we"><rect x="394.5" y="328" width="11" height="50" rx="3" fill="#facc15" stroke="#a16207"/></g>`;
    // device
    s += `<g class="hotspot" data-k="adhesive"><rect x="170" y="161" width="460" height="9" rx="4" fill="#cbd5e1" stroke="#94a3b8"/></g>`;
    s += `<g class="hotspot" data-k="housing"><path d="M215,162 C215,95 585,95 585,162 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><rect x="285" y="146" width="230" height="8" rx="2" fill="#15803d"/></g>`;
    s += `<g class="hotspot" data-k="chip"><rect x="368" y="131" width="54" height="15" rx="2" fill="#1e293b"/><text x="395" y="142" text-anchor="middle" font-size="8" fill="#e2e8f0" style="fill:#e2e8f0">ASIC</text></g>`;
    s += `<g class="hotspot" data-k="battery"><rect x="440" y="125" width="62" height="21" rx="10" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><text x="471" y="139" text-anchor="middle" font-size="9" fill="#334155" style="fill:#334155">+ cell</text></g>`;
    s += `<g class="hotspot" data-k="antenna"><path d="M298,141 l6,-8 6,8 6,-8 6,8 6,-8 6,8 6,-8" fill="none" stroke="#d97706" stroke-width="2.5"/></g>`;
    // labels
    const L = (k, txt, x, y, px, py, anchor) => `<g class="hotspot" data-k="${k}"><line x1="${px}" y1="${py}" x2="${anchor === "end" ? x + 4 : x - 4}" y2="${y - 4}" style="stroke:${y > 165 ? "#44403c" : "var(--ink-3)"}" stroke-width="1"/><text x="${x}" y="${y}" text-anchor="${anchor}" font-size="13.5" font-weight="600" style="fill:${y > 165 ? "#1c1917" : "var(--ink)"}">${txt}</text></g>`;
    s += L("antenna", "Bluetooth antenna", 190, 70, 312, 136, "end");
    s += L("chip", "Potentiostat chip (ASIC)", 395, 34, 395, 130, "middle").replace(/x2="391"/, 'x2="395"').replace(/y2="30"/, 'y2="40"');
    s += L("battery", "Battery", 612, 70, 490, 124, "start");
    s += L("housing", "Housing / transmitter", 612, 108, 560, 134, "start");
    s += L("adhesive", "Adhesive patch", 160, 140, 190, 165, "end");
    s += `<g font-size="12" style="fill:#57534e"><text x="10" y="188" style="fill:#57534e">Epidermis</text><text x="10" y="244" style="fill:#57534e">Dermis</text><text x="10" y="300" style="fill:#57534e">Subcutaneous fat</text></g>`;
    s += L("capillary", "Capillary", 150, 390, 215, 340, "end");
    s += L("filament", "Sensor filament", 520, 236, 404, 236, "start");
    s += L("re", "Reference electrode (Ag/AgCl)", 520, 300, 406, 300, "start");
    s += L("we", "Working electrode (GOx + membranes)", 520, 350, 406, 352, "start");
    s += L("isf", "Interstitial fluid", 520, 412, 455, 385, "start");
    s += `<text x="10" y="462" font-size="11" style="fill:#78716c">Schematic — not to scale</text>`;
    svg.innerHTML = s;
    const show = k => {
      const p = PARTS[k];
      svg.querySelectorAll(".hotspot").forEach(g => g.classList.toggle("on", g.dataset.k === k));
      $("#anatomyInfo").innerHTML = `<h4>${p[0]}</h4><p>${p[1]}</p>${p[2] ? `<a href="${p[2]}">Explore this →</a>` : ""}`;
    };
    svg.addEventListener("click", e => { const g = e.target.closest("[data-k]"); if (g) show(g.dataset.k); });
    show("we");
  })();

  /* ---------------- Three-electrode cell ---------------- */
  $("#cellSvg").innerHTML = `
    <rect x="40" y="150" width="360" height="125" rx="14" fill="#7dd3fc" opacity=".25"/>
    <text x="388" y="268" text-anchor="end" font-size="11" class="t3">interstitial fluid</text>
    <rect x="110" y="10" width="220" height="74" rx="12" style="fill:var(--surface-2);stroke:#7c3aed" stroke-width="2"/>
    <text x="220" y="34" text-anchor="middle" font-weight="700" font-size="14">Potentiostat</text>
    <text x="220" y="54" text-anchor="middle" font-size="12" class="t2">holds E(WE vs. RE) = +0.6 V</text>
    <text x="220" y="72" text-anchor="middle" font-size="12" class="t2">measures current i (nA)</text>
    <line x1="330" y1="47" x2="420" y2="47" style="stroke:var(--ink-3)" stroke-width="2"/><text x="425" y="44" font-size="11" class="t3" text-anchor="end">→ ADC</text>
    <line x1="140" y1="84" x2="140" y2="135" style="stroke:var(--ink)" stroke-width="2"/>
    <line x1="220" y1="84" x2="220" y2="135" style="stroke:var(--ink)" stroke-width="2"/>
    <line x1="300" y1="84" x2="300" y2="135" style="stroke:var(--ink)" stroke-width="2"/>
    <circle cx="140" cy="108" r="11" style="fill:var(--surface);stroke:var(--ink)" stroke-width="2"/><text x="140" y="113" text-anchor="middle" font-size="12" font-weight="700">A</text>
    <circle cx="220" cy="108" r="11" style="fill:var(--surface);stroke:var(--ink)" stroke-width="2"/><text x="220" y="113" text-anchor="middle" font-size="12" font-weight="700">V</text>
    <rect x="132" y="135" width="16" height="100" rx="5" fill="#facc15" stroke="#a16207"/>
    <rect x="212" y="135" width="16" height="100" rx="5" fill="#e2e8f0" stroke="#64748b"/>
    <rect x="292" y="135" width="16" height="100" rx="5" fill="#94a3b8" stroke="#475569"/>
    <text x="140" y="252" text-anchor="middle" font-weight="700" font-size="13">WE</text>
    <text x="220" y="252" text-anchor="middle" font-weight="700" font-size="13">RE</text>
    <text x="300" y="252" text-anchor="middle" font-weight="700" font-size="13">CE</text>
    <text x="50" y="175" font-size="11.5" style="fill:#a16207">H₂O₂ → O₂</text><text x="50" y="191" font-size="11.5" style="fill:#a16207">+ 2H⁺ + 2e⁻</text>
    <path d="M152 200 v-40" stroke="#a16207" stroke-width="2" marker-end="url(#ea)" fill="none"/>
    <text x="158" y="192" font-size="11" style="fill:#a16207">e⁻</text>
    <text x="318" y="170" font-size="11.5" class="t2">O₂ + 4H⁺ + 4e⁻</text><text x="318" y="185" font-size="11.5" class="t2">→ 2H₂O</text>
    <defs><marker id="ea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#a16207"/></marker></defs>`;

  /* ---------------- Membrane particle simulation ---------------- */
  (function membrane() {
    const cv = $("#memCanvas"), ctx = cv.getContext("2d");
    const W = 640, H = 300;
    const LAYERS = [
      { k: "isf", x0: 0, x1: 220, name: "Interstitial fluid", col: "rgba(125,211,252,.18)", info: "Contains glucose (≈ 4–10 mM), dissolved O₂ (≈ 0.05–0.1 mM — far less!) and other small molecules such as paracetamol, ascorbate and urate." },
      { k: "out", x0: 220, x1: 245, name: "Biocompatible outer layer", col: "rgba(148,163,184,.35)", info: "Hydrophilic coating that reduces protein adsorption and inflammation (the foreign-body response), helping the sensor keep a stable sensitivity for days." },
      { k: "glm", x0: 245, x1: 305, name: "Glucose-limiting membrane", col: "rgba(59,130,246,.22)", info: "Polymer (e.g. polyurethane-based) that lets small, non-polar O₂ through easily but slows glucose. Result: O₂ is always in excess at the enzyme, so the signal rises linearly with glucose." },
      { k: "enz", x0: 305, x1: 430, name: "Enzyme layer (GOx)", col: "rgba(34,197,94,.18)", info: "Glucose oxidase cross-linked (e.g. with glutaraldehyde) into a gel. Converts glucose + O₂ → gluconolactone + H₂O₂." },
      { k: "irl", x0: 430, x1: 460, name: "Interference-rejection layer", col: "rgba(168,85,247,.25)", info: "Thin size- or charge-selective film (e.g. cellulose acetate, Nafion or an electropolymerised layer) that passes tiny H₂O₂ but blocks larger electroactive molecules." },
      { k: "pt", x0: 460, x1: 640, name: "Platinum working electrode (+0.6 V)", col: "rgba(250,204,21,.35)", info: "Oxidises H₂O₂ → O₂ + 2H⁺ + 2e⁻. Every glucose that reacts gives 2 electrons; anything else oxidised here adds a false signal." }
    ];
    const L = k => LAYERS.find(l => l.k === k);
    let parts = [], sparks = [], events = [], gox = [];
    for (let i = 0; i < 26; i++) gox.push([312 + Math.random() * 110, 12 + Math.random() * (H - 24)]);
    const st = { glc: 120, glm: true, irl: true, apap: false };
    const spawn = (type, x, y, vx) => parts.push({ type, x, y: y == null ? 10 + Math.random() * (H - 20) : y, vx: vx == null ? 1.8 : vx, age: 0 });
    function resize() { const dpr = window.devicePixelRatio || 1; cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); }
    new ResizeObserver(resize).observe(cv); resize();
    let visible = true; new IntersectionObserver(e => visible = e[0].isIntersecting).observe(cv);

    function step() {
      // sources
      if (Math.random() < st.glc / 400 * 0.22) spawn("glc", 2);
      if (Math.random() < 0.1) spawn("o2", 2);
      if (Math.random() < (st.apap ? 0.06 : 0.012)) spawn("int", 2);
      const enz = L("enz"), glm = L("glm"), irl = L("irl"), pt = L("pt");
      for (const p of parts) {
        p.age++;
        const inEnz = p.x > enz.x0 && p.x < enz.x1;
        const slow = (p.type === "glc" && inEnz) ? 0.35 : 1;
        const nx = p.x + (p.vx + (Math.random() - 0.5) * 2.2) * slow;
        p.y += (Math.random() - 0.5) * 3; if (p.y < 6) p.y = 6; if (p.y > H - 6) p.y = H - 6;
        // membrane crossings (moving right)
        if (p.x < glm.x0 && nx >= glm.x0 && st.glm) {
          const pass = p.type === "glc" ? 0.07 : p.type === "o2" ? 0.9 : 0.5;
          if (Math.random() > pass) { p.x = glm.x0 - 2; p.vx = -Math.abs(p.vx) * 0.5; p.bounced = true; continue; }
        }
        if (p.x < irl.x0 && nx >= irl.x0) {
          if (p.type === "glc") { p.x = irl.x0 - 2; continue; }
          if (p.type === "int" && st.irl) { p.x = irl.x0 - 2; p.vx = -Math.abs(p.vx); continue; }
        }
        p.x = nx;
        if (p.bounced && p.vx < 0 && p.age % 40 === 0) p.vx = 1.8;
        if (p.type === "o2" && p.x > pt.x0 - 2) { p.x = pt.x0 - 3; p.vx = -0.6; }
        if (p.type === "lac") p.vx = -0.8;
        if (p.type === "o2" && p.x > enz.x0 && p.vx < 0 && p.x < enz.x0 + 10) p.vx = 0.6;
      }
      // enzyme reaction: glucose + O2 -> lactone + H2O2
      const glcIn = parts.filter(p => p.type === "glc" && p.x > enz.x0 && p.x < enz.x1);
      const o2In = parts.filter(p => p.type === "o2" && p.x > enz.x0 && p.x < irl.x1);
      for (const g of glcIn) {
        if (!o2In.length) break;
        if (Math.random() < 0.12) {
          const o = o2In.pop(); o.dead = true; g.dead = true;
          spawn("h2o2", g.x, g.y, 1.4); spawn("lac", g.x, g.y, -0.8);
        }
      }
      // electrode
      for (const p of parts) {
        if (p.dead) continue;
        if ((p.type === "h2o2" || p.type === "int") && p.x >= pt.x0) {
          p.dead = true; events.push({ t: performance.now(), real: p.type === "h2o2" });
          sparks.push({ x: pt.x0 + 4, y: p.y, life: 18, col: p.type === "h2o2" ? "#facc15" : "#a855f7" });

        }
        if (p.x < -5 || (p.type === "lac" && p.x < enz.x0 - 40) || (p.x < enz.x0 && p.age > 420) || (p.type === "glc" && p.age > 600) || (p.type === "o2" && p.age > 480) || p.age > 900) p.dead = true;
      }
      parts = parts.filter(p => !p.dead);
      const now = performance.now(); events = events.filter(e => now - e.t < 4000);
    }
    function hex(x, y, r) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const dark = getComputedStyle(document.documentElement).colorScheme === "dark";
      LAYERS.forEach(l => { ctx.fillStyle = l.col; ctx.fillRect(l.x0, 0, l.x1 - l.x0, H); });
      if (!st.glm) { ctx.fillStyle = dark ? "rgba(14,19,32,.75)" : "rgba(255,255,255,.75)"; ctx.fillRect(245, 0, 60, H); }
      if (!st.irl) { ctx.fillStyle = dark ? "rgba(14,19,32,.75)" : "rgba(255,255,255,.75)"; ctx.fillRect(430, 0, 30, H); }
      // pt electrode gradient
      const g = ctx.createLinearGradient(460, 0, 640, 0); g.addColorStop(0, "#d4d4d8"); g.addColorStop(.4, "#f4f4f5"); g.addColorStop(1, "#a1a1aa");
      ctx.fillStyle = g; ctx.fillRect(460, 0, 180, H);
      ctx.fillStyle = "#3f3f46"; ctx.font = "600 13px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Pt electrode", 550, H / 2 - 8); ctx.font = "12px system-ui, sans-serif"; ctx.fillText("+0.6 V vs. Ag/AgCl", 550, H / 2 + 10);
      ctx.fillText("→ e⁻ to potentiostat", 550, H / 2 + 28);
      // layer titles
      ctx.font = "600 10.5px system-ui, sans-serif"; ctx.fillStyle = dark ? "#cbd5e1" : "#334155";
      ctx.fillText("Interstitial fluid", 110, 16); ctx.fillText("GOx enzyme layer", 367, 16);
      [["outer layer", 232.5], ["glucose-limiting membrane", 275], ["interference rejection", 445]].forEach(([t, x]) => {
        ctx.save(); ctx.translate(x + 4, 8); ctx.rotate(Math.PI / 2); ctx.textAlign = "left"; ctx.fillText(t, 0, 0); ctx.restore();
      });
      ctx.font = "700 11px system-ui, sans-serif"; ctx.fillStyle = "#dc2626";
      if (!st.glm) ctx.fillText("OFF", 275, H - 10);
      if (!st.irl) ctx.fillText("OFF", 445, H - 10);
      // GOx
      gox.forEach(([x, y]) => { ctx.fillStyle = "rgba(22,163,74,.55)"; ctx.beginPath(); ctx.ellipse(x, y, 6, 4.5, 0.6, 0, Math.PI * 2); ctx.fill(); });
      // particles
      for (const p of parts) {
        if (p.type === "glc") { hex(p.x, p.y, 4.5); ctx.fillStyle = "#f59e0b"; ctx.fill(); }
        else if (p.type === "o2") { ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(p.x - 2.2, p.y, 2.6, 0, 7); ctx.arc(p.x + 2.2, p.y, 2.6, 0, 7); ctx.fill(); }
        else if (p.type === "h2o2") { ctx.fillStyle = "#06b6d4"; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 7); ctx.fill(); }
        else if (p.type === "int") { ctx.fillStyle = "#a855f7"; ctx.beginPath(); ctx.moveTo(p.x, p.y - 5); ctx.lineTo(p.x + 5, p.y + 4); ctx.lineTo(p.x - 5, p.y + 4); ctx.closePath(); ctx.fill(); }
        else if (p.type === "lac") { hex(p.x, p.y, 3.5); ctx.fillStyle = "rgba(156,163,175,.8)"; ctx.fill(); }
      }
      sparks = sparks.filter(s => s.life-- > 0);
      for (const s of sparks) {
        ctx.strokeStyle = s.col; ctx.lineWidth = 2; ctx.globalAlpha = s.life / 18;
        ctx.beginPath(); ctx.arc(s.x, s.y, 8 - s.life / 3, 0, 7); ctx.stroke();
        ctx.fillStyle = s.col; ctx.font = "700 10px system-ui"; ctx.fillText("2e⁻", s.x + 22 - s.life / 2, s.y - 4); ctx.globalAlpha = 1;
      }
    }
    let lastRead = 0;
    function loop(t) {
      if (visible) { step(); draw(); }
      if (t - lastRead > 500) { lastRead = t; readout(); }
      requestAnimationFrame(loop);
    }
    function readout() {
      const real = events.filter(e => e.real).length / 4, fake = events.filter(e => !e.real).length / 4;
      const o2 = parts.filter(p => p.type === "o2" && p.x > 305 && p.x < 460).length;
      const gWait = parts.filter(p => p.type === "glc" && p.x > 305 && p.x < 430).length;
      const pct = real + fake ? Math.round(100 * fake / (real + fake)) : 0;
      $("#memReadout").innerHTML = `<div class="r"><span>Glucose signal</span><b>${(real * 2).toFixed(1)} e⁻/s</b></div>
        <div class="r"><span>False signal</span><b style="color:${pct > 10 ? "var(--bad)" : "inherit"}">${pct}%</b></div>
        <div class="r"><span>Enzyme layer</span><b style="font-size:1rem">${gWait} glc · ${o2} O₂</b></div>`;
    }
    cv.addEventListener("click", e => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
      const l = LAYERS.find(l => x >= l.x0 && x < l.x1); if (!l) return;
      $("#memInfo").innerHTML = `<h4>${l.name}</h4><p class="small" style="margin:0">${l.info}</p>`;
    });
    $("#memInfo").innerHTML = `<h4>Watch for:</h4><p class="small" style="margin:0">Turn off the <b>glucose-limiting membrane</b> and raise glucose: glucose piles up in the enzyme layer, O₂ runs out, and the signal stops rising. Turn off the <b>interference layer</b> with paracetamol: purple molecules reach the electrode and inflate the reading.</p>`;
    $("#memGlc").addEventListener("input", e => { st.glc = +e.target.value; $("#memGlcVal").textContent = st.glc + " mg/dL"; });
    $("#memGLM").addEventListener("change", e => st.glm = e.target.checked);
    $("#memIRL").addEventListener("change", e => st.irl = e.target.checked);
    $("#memAPAP").addEventListener("change", e => st.apap = e.target.checked);
    requestAnimationFrame(loop);
  })();

  /* ---------------- Enzyme cycle ---------------- */
  (function cycle() {
    const svg = $("#cycSvg");
    let mode = "o2", stepI = 0;
    const MODES = {
      o2: {
        right: ["O₂", "H₂O₂"], elec: ["Pt electrode", "+0.6 V vs. Ag/AgCl", "H₂O₂ → O₂", "+ 2H⁺ + 2e⁻"],
        steps: [
          ["Overview", "Glucose oxidase cycles between an oxidised form (FAD) and a reduced form (FADH₂). Use <b>Next step</b> to walk through one turn."],
          ["1 · Glucose is oxidised", "β-D-glucose binds GOx. FAD takes 2 H (2e⁻ + 2H⁺) from C1, leaving D-glucono-δ-lactone, which hydrolyses to gluconic acid."],
          ["2 · Oxygen regenerates the enzyme", "Dissolved O₂ accepts the 2 H from FADH₂, giving back FAD and producing hydrogen peroxide."],
          ["3 · The electrode reads H₂O₂", "H₂O₂ diffuses to the platinum electrode, held at +0.6 V, and is oxidised. The 2 electrons released per glucose flow as current."],
          ["Result", "Current ∝ rate of H₂O₂ production ∝ glucose concentration (when O₂ is in excess)."]
        ],
        eq: [["Enzyme (reductive half)", "β-D-glucose + GOx(FAD) <span class='arrow'>→</span> D-glucono-δ-lactone + GOx(FADH₂)"], ["Enzyme (oxidative half)", "GOx(FADH₂) + O₂ <span class='arrow'>→</span> GOx(FAD) + H₂O₂"], ["Hydrolysis", "D-glucono-δ-lactone + H₂O <span class='arrow'>→</span> D-gluconic acid"], ["Electrode (+0.6 V)", "H₂O₂ <span class='arrow'>→</span> O₂ + 2H⁺ + 2e⁻"]]
      },
      med: {
        right: ["2 Os³⁺", "2 Os²⁺"], elec: ["Carbon electrode", "low potential (~0 V)", "2 Os²⁺ → 2 Os³⁺", "+ 2e⁻"],
        steps: [
          ["Overview", "Here a <b>mediator</b> — osmium complexes tethered to a polymer that “wires” the enzyme to the electrode — replaces O₂ as the electron acceptor."],
          ["1 · Glucose is oxidised", "As before, β-D-glucose reduces FAD to FADH₂ and leaves as gluconolactone."],
          ["2 · The mediator regenerates the enzyme", "Two Os(III) centres each take one electron from FADH₂, becoming Os(II). No oxygen is needed."],
          ["3 · Electrons hop to the electrode", "Electrons hop between Os centres along the polymer to the electrode, which re-oxidises Os(II) at a low potential."],
          ["Result", "Signal is independent of tissue O₂, and the low potential avoids oxidising paracetamol, ascorbate and urate."]
        ],
        eq: [["Enzyme", "β-D-glucose + GOx(FAD) <span class='arrow'>→</span> gluconolactone + GOx(FADH₂)"], ["Mediator", "GOx(FADH₂) + 2 Os(III) <span class='arrow'>→</span> GOx(FAD) + 2 Os(II) + 2H⁺"], ["Electrode (low E)", "Os(II) <span class='arrow'>→</span> Os(III) + e⁻"]]
      }
    };
    function render() {
      const M = MODES[mode];
      const vis = s => (stepI === 0 || stepI === 4 || s.split(" ").includes(String(stepI))) ? 1 : 0.18;
      svg.innerHTML = `<defs><marker id="ca" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" style="fill:var(--accent)"/></marker>
        <marker id="cb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#a16207"/></marker></defs>
        <g opacity="${vis("1")}"><path d="M159.9,73.9 A95,95 0 0 0 159.9,246.1" fill="none" style="stroke:var(--accent)" stroke-width="4" marker-end="url(#ca)"/>
          <text x="6" y="118" font-size="14" font-weight="700" style="fill:#d97706">β-D-glucose</text><path d="M60,126 L102,140" style="stroke:#d97706" stroke-width="2" marker-end="url(#ca)" fill="none"/>
          <path d="M104,184 L62,202" style="stroke:var(--ink-3)" stroke-width="2" marker-end="url(#ca)" fill="none"/><text x="4" y="222" font-size="13" class="t2">gluconolactone</text></g>
        <g opacity="${vis("2")}"><path d="M240.1,246.1 A95,95 0 0 0 240.1,73.9" fill="none" style="stroke:var(--accent)" stroke-width="4" marker-end="url(#ca)"/>
          <text x="352" y="214" font-size="14" font-weight="700" style="fill:${mode === "o2" ? "#ef4444" : "#7c3aed"}">${M.right[0]}</text><path d="M350,206 L300,186" style="stroke:var(--ink-3)" stroke-width="2" marker-end="url(#ca)" fill="none"/>
          <path d="M298,134 L346,112" style="stroke:var(--ink-3)" stroke-width="2" marker-end="url(#ca)" fill="none"/><text x="350" y="108" font-size="14" font-weight="700" style="fill:${mode === "o2" ? "#06b6d4" : "#7c3aed"}">${M.right[1]}</text></g>
        <rect x="140" y="44" width="120" height="40" rx="10" style="fill:var(--surface);stroke:#16a34a" stroke-width="2.5"/><text x="200" y="69" text-anchor="middle" font-weight="700" font-size="14">GOx–FAD</text>
        <rect x="140" y="236" width="120" height="40" rx="10" style="fill:color-mix(in srgb, #16a34a 18%, var(--surface));stroke:#16a34a" stroke-width="2.5"/><text x="200" y="261" text-anchor="middle" font-weight="700" font-size="14">GOx–FADH₂</text>
        <text x="200" y="152" text-anchor="middle" font-size="12" class="t3">oxidised (top)</text><text x="200" y="170" text-anchor="middle" font-size="12" class="t3">reduced (bottom)</text>
        <g opacity="${vis("3")}">
          <path d="M${mode === "o2" ? 395 : 410},104 L452,104" stroke="#a16207" stroke-width="2.5" marker-end="url(#cb)" fill="none"/>
          <rect x="456" y="30" width="118" height="260" rx="10" fill="${mode === "o2" ? "#e4e4e7" : "#3f3f46"}" stroke="#71717a" stroke-width="2"/>
          <text x="515" y="56" text-anchor="middle" font-weight="700" font-size="13" fill="${mode === "o2" ? "#27272a" : "#fafafa"}" style="fill:${mode === "o2" ? "#27272a" : "#fafafa"}">${M.elec[0]}</text>
          <text x="515" y="74" text-anchor="middle" font-size="11" fill="${mode === "o2" ? "#52525b" : "#d4d4d8"}" style="fill:${mode === "o2" ? "#52525b" : "#d4d4d8"}">${M.elec[1]}</text>
          <text x="515" y="128" text-anchor="middle" font-size="12.5" font-weight="600" fill="${mode === "o2" ? "#27272a" : "#fafafa"}" style="fill:${mode === "o2" ? "#27272a" : "#fafafa"}">${M.elec[2]}</text>
          <text x="515" y="146" text-anchor="middle" font-size="12.5" font-weight="600" fill="${mode === "o2" ? "#27272a" : "#fafafa"}" style="fill:${mode === "o2" ? "#27272a" : "#fafafa"}">${M.elec[3]}</text>
          <path d="M515,170 L515,240" stroke="#ca8a04" stroke-width="3" marker-end="url(#cb)" fill="none"/>
          <text x="515" y="262" text-anchor="middle" font-size="13" font-weight="700" fill="#ca8a04" style="fill:#ca8a04">e⁻ → current</text>
        </g>`;
      const S = M.steps[stepI];
      $("#cycText").innerHTML = `<div class="small muted">Step ${stepI + 1} of ${M.steps.length}</div><h4 style="margin-top:4px">${S[0]}</h4><p class="small">${S[1]}${cite(mode === "o2" ? 2 : 1)}</p>`;
      $("#cycEq").innerHTML = M.eq.map(([l, e]) => `<div class="eq-label">${l}</div><div class="eq" style="font-size:.92rem">${e}</div>`).join("");
      $("#cycPrev").disabled = stepI === 0; $("#cycNext").disabled = stepI === M.steps.length - 1;
    }
    $("#cycNext").addEventListener("click", () => { stepI++; render(); });
    $("#cycPrev").addEventListener("click", () => { stepI--; render(); });
    $("#cycMode").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#cycMode button").forEach(x => x.classList.toggle("on", x === b)); mode = b.dataset.m; render(); });
    render();
  })();

  /* ---------------- Signal vs. glucose ---------------- */
  (function signal() {
    const svg = $("#sigChart");
    const X0 = 56, X1 = 540, Y0 = 280, Y1 = 20, GMAX = 400, YMAX = 4.6;
    const sx = g => X0 + (X1 - X0) * g / GMAX, sy = v => Y0 - (Y0 - Y1) * Math.min(v, YMAX) / YMAX;
    const Kg = 25, Ko = 0.3, O2N = 0.06, SCALE = 2500;
    const P = { mem: { pg: 0.01, po: 0.5 }, bare: { pg: 1, po: 1 } };
    const rate = (gMg, oFrac, m) => { const G = gMg / 18 * P[m].pg, O = O2N * oFrac * P[m].po; return 1 / (1 + Kg / G + Ko / O); };
    const ref = { mem: rate(100, 1, "mem"), bare: rate(100, 1, "bare") };
    let mode = "mem";
    function render() {
      const g = +$("#sigG").value, o = +$("#sigO").value / 100;
      $("#sigGVal").textContent = g + " mg/dL"; $("#sigOVal").textContent = Math.round(o * 100) + "%";
      let s = "";
      for (let v = 0; v <= 4; v++) s += `<line class="grid-l" x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${X0 - 8}" y="${sy(v) + 4}" text-anchor="end">${v}×</text>`;
      for (let x = 0; x <= GMAX; x += 100) s += `<text x="${sx(x)}" y="${Y0 + 18}" text-anchor="middle">${x}</text>`;
      s += `<line class="axis" x1="${X0}" x2="${X1}" y1="${Y0}" y2="${Y0}"/><line class="axis" x1="${X0}" x2="${X0}" y1="${Y0}" y2="${Y1}"/>`;
      s += `<text x="${(X0 + X1) / 2}" y="${Y0 + 36}" text-anchor="middle">glucose (mg/dL)</text><text transform="translate(14,${(Y0 + Y1) / 2}) rotate(-90)" text-anchor="middle">signal (× value at 100 mg/dL)</text>`;
      s += `<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(400)}" y2="${sy(4)}" stroke-dasharray="6 5" style="stroke:var(--ink-3)" stroke-width="1.5"/><text x="${sx(330)}" y="${sy(3.3) - 8}" class="t3" style="fill:var(--ink-3)">ideal (linear)</text>`;
      const curve = (m, oF, col, w, dash) => {
        let d = ""; for (let x = 2; x <= GMAX; x += 4) d += (d ? "L" : "M") + sx(x).toFixed(1) + "," + sy(rate(x, oF, m) / ref[m]).toFixed(1);
        return `<path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}" ${dash ? 'stroke-dasharray="3 4"' : ""} opacity="${m === mode ? 1 : 0.35}"/>`;
      };
      s += curve("mem", 1, "var(--accent)", 3) + curve("bare", 1, "var(--warn)", 3);
      if (o < 1) s += curve(mode, o, mode === "mem" ? "var(--accent)" : "var(--warn)", 2.5, true);
      const v = rate(g, o, mode) / ref[mode];
      s += `<line x1="${sx(g)}" x2="${sx(g)}" y1="${Y0}" y2="${sy(v)}" style="stroke:var(--ink-3)" stroke-dasharray="2 3"/><circle cx="${sx(g)}" cy="${sy(v)}" r="6" style="fill:var(--ink)"/>`;
      s += `<g font-size="12"><rect x="${X0 + 12}" y="${Y1 + 4}" width="14" height="4" style="fill:var(--accent)"/><text x="${X0 + 32}" y="${Y1 + 10}">with outer membrane</text>
        <rect x="${X0 + 12}" y="${Y1 + 22}" width="14" height="4" style="fill:var(--warn)"/><text x="${X0 + 32}" y="${Y1 + 28}">bare enzyme (O₂-limited)</text>
        ${o < 1 ? `<text x="${X0 + 12}" y="${Y1 + 46}" class="t3">dotted: low tissue O₂</text>` : ""}</g>`;
      svg.innerHTML = s;
      const nA = rate(g, o, mode) * SCALE, rep = 100 * v, err = (rep - g) / g * 100;
      $("#sigReadout").innerHTML = `<div class="r"><span>Current</span><b>${nA < 10 ? nA.toFixed(1) : nA.toFixed(0)} nA</b></div><div class="r"><span>Reported</span><b>${rep.toFixed(0)} mg/dL</b></div>
        <div class="r"><span>Error</span><b style="color:${Math.abs(err) > 15 ? "var(--bad)" : Math.abs(err) > 5 ? "var(--warn)" : "var(--good)"}">${err >= 0 ? "+" : ""}${err.toFixed(0)}%</b></div>`;
    }
    $("#sigG").addEventListener("input", render); $("#sigO").addEventListener("input", render);
    $("#sigMode").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#sigMode button").forEach(x => x.classList.toggle("on", x === b)); mode = b.dataset.m; render(); });
    render();
  })();

  /* ---------------- Blood vs. ISF lag ---------------- */
  (function lag() {
    const svg = $("#lagChart");
    const X0 = 50, X1 = 540, Y0 = 250, Y1 = 20, TMAX = 240, GMIN = 60, GMAX = 220;
    const sx = t => X0 + (X1 - X0) * t / TMAX, sy = g => Y0 - (Y0 - Y1) * (g - GMIN) / (GMAX - GMIN);
    const blood = t => { const u = (t - 30) / 40; let g = 95 + (u > 0 ? 95 * u * u * Math.exp(2 * (1 - u)) : 0); const w = (t - 150) / 25; if (w > 0) g -= 45 * w * w * Math.exp(2 * (1 - w)); return g; };
    function isfSeries(tau) {
      const dt = 0.25, out = []; let gi = blood(0);
      for (let t = 0; t <= TMAX + 1e-9; t += dt) { if (tau > 0) gi += dt / tau * (blood(t) - gi); else gi = blood(t); out.push([t, gi]); }
      return out;
    }
    const arrow = r => r > 3 ? "⇈" : r > 2 ? "↑" : r > 1 ? "↗" : r >= -1 ? "→" : r >= -2 ? "↘" : r >= -3 ? "↓" : "⇊";
    function render() {
      const tau = +$("#lagTau").value, T = +$("#lagT").value;
      $("#lagTauVal").textContent = tau + " min"; $("#lagTVal").textContent = T + " min";
      const S = isfSeries(tau), at = t => S[Math.min(S.length - 1, Math.round(t / 0.25))][1];
      let s = "";
      for (let g = 60; g <= 220; g += 40) s += `<line class="grid-l" x1="${X0}" x2="${X1}" y1="${sy(g)}" y2="${sy(g)}"/><text x="${X0 - 6}" y="${sy(g) + 4}" text-anchor="end">${g}</text>`;
      for (let t = 0; t <= TMAX; t += 60) s += `<text x="${sx(t)}" y="${Y0 + 16}" text-anchor="middle">${t}</text>`;
      s += `<rect x="${X0}" y="${sy(180)}" width="${X1 - X0}" height="${sy(70) - sy(180)}" fill="#16a34a" opacity=".07"/>`;
      s += `<line class="axis" x1="${X0}" x2="${X1}" y1="${Y0}" y2="${Y0}"/><line class="axis" x1="${X0}" x2="${X0}" y1="${Y0}" y2="${Y1}"/>`;
      s += `<text x="${(X0 + X1) / 2}" y="${Y0 + 34}" text-anchor="middle">time (min)</text><text transform="translate(13,${(Y0 + Y1) / 2}) rotate(-90)" text-anchor="middle">glucose (mg/dL)</text>`;
      s += `<text x="${sx(30)}" y="${Y0 + 16}" text-anchor="middle" class="t3">▲ meal</text><text x="${sx(150)}" y="${Y0 + 16}" text-anchor="middle" class="t3">▲ exercise</text>`;
      let d = ""; for (let t = 0; t <= TMAX; t += 1) d += (t ? "L" : "M") + sx(t).toFixed(1) + "," + sy(blood(t)).toFixed(1);
      s += `<path d="${d}" fill="none" stroke="#dc2626" stroke-width="3"/>`;
      let d2 = ""; S.forEach(([t, g], i) => { if (i % 4 === 0) d2 += (d2 ? "L" : "M") + sx(t).toFixed(1) + "," + sy(g).toFixed(1); });
      s += `<path d="${d2}" fill="none" stroke="#0ea5e9" stroke-width="2.5"/>`;
      for (let t = 0; t <= TMAX; t += 5) s += `<circle cx="${sx(t)}" cy="${sy(at(t))}" r="2.6" fill="#0369a1"/>`;
      s += `<line x1="${sx(T)}" x2="${sx(T)}" y1="${Y1}" y2="${Y0}" style="stroke:var(--ink)" stroke-dasharray="3 3"/><circle cx="${sx(T)}" cy="${sy(blood(T))}" r="6" fill="#dc2626"/><circle cx="${sx(T)}" cy="${sy(at(T))}" r="6" fill="#0ea5e9"/>`;
      s += `<g font-size="12"><rect x="${X0 + 12}" y="${Y1}" width="14" height="4" fill="#dc2626"/><text x="${X0 + 32}" y="${Y1 + 6}">blood glucose</text><rect x="${X0 + 12}" y="${Y1 + 18}" width="14" height="4" fill="#0ea5e9"/><text x="${X0 + 32}" y="${Y1 + 24}">ISF / CGM (dots = readings)</text></g>`;
      svg.innerHTML = s;
      const gb = blood(T), gi = at(T), r = (at(Math.min(TMAX, T + 2.5)) - at(Math.max(0, T - 2.5))) / 5;
      $("#lagReadout").innerHTML = `<div class="r"><span>Blood</span><b>${gb.toFixed(0)}</b></div><div class="r"><span>CGM</span><b>${gi.toFixed(0)} <span style="font-size:1.2rem">${arrow(r)}</span></b></div><div class="r"><span>Difference</span><b style="color:${Math.abs(gi - gb) > 15 ? "var(--bad)" : "inherit"}">${(gi - gb >= 0 ? "+" : "") + (gi - gb).toFixed(0)}</b></div>`;
    }
    $("#lagTau").addEventListener("input", render); $("#lagT").addEventListener("input", render);
    render();
  })();

  /* ---------------- MARD calculator ---------------- */
  (function mard() {
    const REF = [62, 95, 140, 185, 250, 320], DEF = [66, 90, 151, 176, 268, 301];
    const tbl = $("#mardTable");
    tbl.innerHTML = `<thead><tr><th>Reference (lab)</th><th>CGM reading</th><th>|ARD|</th></tr></thead><tbody>` +
      REF.map((r, i) => `<tr><td class="mono">${r}</td><td><input type="number" min="20" max="500" value="${DEF[i]}" data-i="${i}" style="width:90px" aria-label="CGM reading ${i + 1}"></td><td class="mono" id="ard${i}"></td></tr>`).join("") + `</tbody>`;
    function calc() {
      let sum = 0, n = 0;
      REF.forEach((r, i) => {
        const raw = tbl.querySelector(`[data-i="${i}"]`).value, c = +raw;
        if (raw === "" || !isFinite(c) || c < 20 || c > 500) { $("#ard" + i).textContent = "—"; return; } // blank or outside 20–500 mg/dL: skip
        const a = Math.abs(c - r) / r * 100; sum += a; n++; $("#ard" + i).textContent = a.toFixed(1) + "%";
      });
      if (!n) { $("#mardOut").textContent = "—"; $("#mardTxt").textContent = "Enter CGM readings between 20 and 500 mg/dL."; return; }
      const m = sum / n;
      $("#mardOut").textContent = m.toFixed(1) + "%";
      $("#mardTxt").textContent = m < 5 ? "Near-perfect — better than any current CGM achieves" : m < 10 ? "Excellent — typical of current iCGMs (≈ 8–10%)" : m < 15 ? "Acceptable — similar to earlier-generation CGMs" : "Poor — would not meet modern accuracy standards";
    }
    tbl.addEventListener("input", calc); calc();
  })();

  /* ---------------- Sensor generations ---------------- */
  const chips = arr => `<div class="flowchips">${arr.map((c, i) => (i ? `<span class="arr">→</span>` : "") + `<span class="fchip" style="--c:${c[1]}">${c[0]}</span>`).join("")}</div>`;
  const GEN = {
    g1: { t: "First generation: Oxygen as electron acceptor", flow: [["Glucose", "#f59e0b"], ["GOx (FAD)", "#16a34a"], ["O₂ → H₂O₂", "#06b6d4"], ["Pt electrode (+0.6 V)", "#a1a1aa"]],
      eq: ["Glucose + O₂ <span class='arrow'>—GOx→</span> gluconolactone + H₂O₂", "H₂O₂ <span class='arrow'>→</span> O₂ + 2H⁺ + 2e⁻"],
      pro: "Simple, well understood; GOx needs no added chemicals.", con: "Depends on tissue O₂ (oxygen deficit); high potential oxidises interferents — needs layered membranes.", ex: "Clark & Updike–Hicks electrodes; Dexcom and Medtronic CGMs.", ref: [6, 7, 2] },
    g2: { t: "Second generation: Artificial mediators", flow: [["Glucose", "#f59e0b"], ["GOx (FAD)", "#16a34a"], ["Mediator ox ⇄ red", "#7c3aed"], ["Electrode (low E)", "#a1a1aa"]],
      eq: ["GOx(FADH₂) + 2M<sub>ox</sub> <span class='arrow'>→</span> GOx(FAD) + 2M<sub>red</sub> + 2H⁺", "M<sub>red</sub> <span class='arrow'>→</span> M<sub>ox</sub> + e⁻"],
      pro: "Independent of O₂; works at low potential so fewer interferences.", con: "Mediator must not leach out (toxicity) — solved by tethering it to polymers (“wired enzyme”).", ex: "Ferrocene (1984); ferricyanide in test strips; osmium redox polymer in FreeStyle Libre.", ref: [8, 1] },
    g3: { t: "Third generation: Direct electron transfer", flow: [["Glucose", "#f59e0b"], ["Enzyme (FAD)", "#16a34a"], ["Nanostructured electrode", "#a1a1aa"]],
      eq: ["Enzyme(FADH₂) <span class='arrow'>→</span> Enzyme(FAD) + 2H⁺ + 2e⁻ (to electrode)"],
      pro: "Shortest electron path; no O₂ or mediator; low potential.", con: "In GOx the FAD is buried deep in the protein, so direct transfer is slow; needs nanomaterials (carbon nanotubes, graphene, gold nanoparticles) or engineered enzymes.", ex: "Mostly research; some FAD-dependent glucose dehydrogenase sensors.", ref: [2, 3] },
    g4: { t: "“Fourth generation”: Non-enzymatic", flow: [["Glucose", "#f59e0b"], ["Metal / metal-oxide surface (Pt, Au, Ni, Cu)", "#a1a1aa"]],
      eq: ["Ni(OH)₂ + OH⁻ <span class='arrow'>→</span> NiOOH + H₂O + e⁻", "2NiOOH + glucose <span class='arrow'>→</span> 2Ni(OH)₂ + gluconolactone"],
      pro: "No enzyme to degrade; potentially very long-lived and cheap.", con: "Poor selectivity; many need alkaline pH; surfaces are poisoned by chloride and proteins in body fluids.", ex: "Research sensors (nanostructured Ni, Cu, Pt alloys).", ref: [3] },
    opt: { t: "Optical: Fluorescent boronic-acid sensor", flow: [["Glucose", "#f59e0b"], ["Boronic-acid fluorophore", "#ec4899"], ["LED → fluorescence", "#22d3ee"], ["Photodiode", "#a1a1aa"]],
      eq: ["R–B(OH)₂ + glucose (cis-diol) <span class='arrow'>⇌</span> cyclic boronate ester + 2H₂O  → fluorescence ↑"],
      pro: "Reversible binding — nothing is consumed — so the implant can last up to a year.", con: "Requires a minor procedure to insert and remove; periodic fingerstick calibration; on-skin transmitter must be worn over it.", ex: "Eversense (implanted under the skin of the upper arm).", ref: [14] }
  };
  $("#genPanels").innerHTML = Object.entries(GEN).map(([k, g], i) => `
    <div class="tab-panel card" data-panel="gen:${k}" ${i ? "hidden" : ""}>
      <h4>${g.t}${cite(...g.ref)}</h4>
      ${chips(g.flow)}
      ${g.eq.map(e => `<div class="eq">${e}</div>`).join("")}
      <div class="grid g3" style="margin-top:10px">
        <div><div class="eq-label" style="color:var(--good)">Advantages</div><p class="small">${g.pro}</p></div>
        <div><div class="eq-label" style="color:var(--bad)">Limitations</div><p class="small">${g.con}</p></div>
        <div><div class="eq-label">Examples</div><p class="small">${g.ex}</p></div>
      </div>
    </div>`).join("");
})();
