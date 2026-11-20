/* ==========================================================
   Main module interactions
   ========================================================== */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const cite = (...n) => `<sup class="cite">${n.map(k => `<a href="#ref-${k}">${k}</a>`).join(",")}</sup>`;

  /* ---------------------------------------------------------
     Sugar icons (schematic: hexagon = pyranose, pentagon = furanose)
     --------------------------------------------------------- */
  const UNIT = {
    G: { shape: "hex", color: "var(--glc)", name: "Glc" },
    Ga: { shape: "hex", color: "var(--gal)", name: "Gal" },
    F: { shape: "pent", color: "var(--fru)", name: "Fru" },
    R: { shape: "pent", color: "#9333ea", name: "Rib" }
  };
  function poly(cx, cy, r, n, rot) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n; pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1)); }
    return pts.join(" ");
  }
  function sugarIcon(spec, opts = {}) {
    const units = spec.u, gap = opts.gap || 44, r = opts.r || 13;
    const branchUp = spec.branch ? 26 : 0;
    const w = 20 + (units.length - 1) * gap + (spec.more ? 30 : 0) + 20, h = 44 + branchUp;
    const cy = 22 + branchUp;
    let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">`;
    units.forEach((u, i) => {
      const cx = 20 + i * gap;
      if (i > 0) {
        s += `<line x1="${cx - gap + r}" y1="${cy}" x2="${cx - r}" y2="${cy}" style="stroke:var(--ink-3)" stroke-width="2"/>`;
        if (spec.links && spec.links[i - 1] && opts.labels !== false) s += `<text x="${cx - gap / 2}" y="${cy - 5}" text-anchor="middle" font-size="8.5" style="fill:var(--ink-3)">${spec.links[i - 1]}</text>`;
      }
      const U = UNIT[u];
      const pts = U.shape === "hex" ? poly(cx, cy, r, 6, 0) : poly(cx, cy, r, 5, Math.PI);
      s += `<polygon points="${pts}" style="fill:color-mix(in srgb, ${U.color} 22%, transparent);stroke:${U.color}" stroke-width="2"/>`;
      if (spec.dot === i) s += `<circle cx="${cx + r}" cy="${cy}" r="3.6" style="fill:var(--bad)"/>`;
    });
    if (spec.branch) {
      const bx = 20 + 2 * gap;
      s += `<line x1="${bx}" y1="${cy - r}" x2="${bx}" y2="${cy - 26 + r - 4}" style="stroke:var(--ink-3)" stroke-width="2"/>`;
      s += `<polygon points="${poly(bx + 0, cy - 30, r * 0.8, 6, 0)}" style="fill:color-mix(in srgb, var(--glc) 22%, transparent);stroke:var(--glc)" stroke-width="2"/>`;
      if (opts.labels !== false) s += `<text x="${bx + 6}" y="${cy - 14}" font-size="8.5" style="fill:var(--ink-3)">α1→6</text>`;
    }
    if (spec.more) s += `<text x="${20 + (units.length - 1) * gap + 26}" y="${cy + 5}" font-size="16" style="fill:var(--ink-3)">…</text>`;
    return s + "</svg>";
  }
  $$(".sicon").forEach(el => {
    const parts = el.dataset.units.split(",");
    const more = parts[parts.length - 1] === "…"; if (more) parts.pop();
    el.innerHTML = sugarIcon({ u: parts, more, dot: parts.length === 1 ? 0 : -1 }, { labels: false });
    el.querySelector("svg").style.height = "50px";
  });

  /* ---------------------------------------------------------
     Sugar explorer
     --------------------------------------------------------- */
  const SUGARS = [
    { id: "glucose", name: "Glucose", size: "mono", red: true, kind: "Aldohexose", spec: { u: ["G"], dot: 0 }, found: "Blood sugar; fruit, honey", why: "Its ring is a hemiacetal: C1 opens to a free aldehyde (–CHO)." },
    { id: "fructose", name: "Fructose", size: "mono", red: true, kind: "Ketohexose", spec: { u: ["F"], dot: 0 }, found: "Fruit, honey, HFCS", why: "A ketone, but in hot alkali it isomerises (via an enediol) to aldoses that reduce Cu²⁺." },
    { id: "galactose", name: "Galactose", size: "mono", red: true, kind: "Aldohexose (C4 epimer of glucose)", spec: { u: ["Ga"], dot: 0 }, found: "Part of lactose (milk)", why: "Free hemiacetal C1, just like glucose." },
    { id: "ribose", name: "Ribose", size: "mono", red: true, kind: "Aldopentose", spec: { u: ["R"], dot: 0 }, found: "RNA, ATP, NADH", why: "Free hemiacetal C1 (furanose ring opens to –CHO)." },
    { id: "maltose", name: "Maltose", size: "di", red: true, kind: "Glc(α1→4)Glc", spec: { u: ["G", "G"], links: ["α1→4"], dot: 1 }, found: "Malt; product of starch digestion", why: "Only C1 of the first glucose is used in the bond; the second glucose keeps a free C1." },
    { id: "lactose", name: "Lactose", size: "di", red: true, kind: "Gal(β1→4)Glc", spec: { u: ["Ga", "G"], links: ["β1→4"], dot: 1 }, found: "Milk sugar", why: "The glucose unit’s C1 is free." },
    { id: "cellobiose", name: "Cellobiose", size: "di", red: true, kind: "Glc(β1→4)Glc", spec: { u: ["G", "G"], links: ["β1→4"], dot: 1 }, found: "Breakdown product of cellulose", why: "Like maltose, one glucose keeps a free C1." },
    { id: "sucrose", name: "Sucrose", size: "di", red: false, kind: "Glc(α1↔2β)Fru", spec: { u: ["G", "F"], links: ["α1↔2β"], dot: -1 }, found: "Table sugar (cane, beet)", why: "The bond joins glucose C1 to fructose C2 — both anomeric carbons are locked." },
    { id: "trehalose", name: "Trehalose", size: "di", red: false, kind: "Glc(α1↔1α)Glc", spec: { u: ["G", "G"], links: ["α1↔1α"], dot: -1 }, found: "Insects, fungi, tardigrades", why: "C1 of one glucose bonded to C1 of the other — no free anomeric carbon." },
    { id: "raffinose", name: "Raffinose", size: "oligo", red: false, kind: "Gal(α1→6)Glc(α1↔2β)Fru", spec: { u: ["Ga", "G", "F"], links: ["α1→6", "α1↔2β"], dot: -1 }, found: "Beans, cabbage", why: "Contains sucrose’s locked Glc–Fru bond; no free anomeric carbon." },
    { id: "starch", name: "Starch", size: "poly", red: false, kind: "Glc α1→4 chains (+ α1→6 branches)", spec: { u: ["G", "G", "G", "G"], links: ["α1→4", "α1→4", "α1→4"], dot: -1, more: true, branch: true }, found: "Plant energy store (rice, potato)", why: "Thousands of units but only one reducing end — too few to give a visible test." },
    { id: "glycogen", name: "Glycogen", size: "poly", red: false, kind: "Highly branched Glc α1→4 / α1→6", spec: { u: ["G", "G", "G", "G"], links: ["α1→4", "α1→4", "α1→4"], dot: -1, more: true, branch: true }, found: "Animal energy store (liver, muscle)", why: "One reducing end per huge molecule — practically non-reducing." },
    { id: "cellulose", name: "Cellulose", size: "poly", red: false, kind: "Glc β1→4, unbranched", spec: { u: ["G", "G", "G", "G"], links: ["β1→4", "β1→4", "β1→4"], dot: -1, more: true }, found: "Plant cell walls, cotton, paper", why: "Effectively non-reducing; β-links also make it indigestible to humans." }
  ];
  const sizeName = { mono: "Monosaccharide", di: "Disaccharide", oligo: "Oligosaccharide", poly: "Polysaccharide" };
  const grid = $("#sugarGrid"), detail = $("#sugarDetail");
  let fSize = "all", fRed = "all", quiz = false, score = { n: 0, ok: 0 }, answered = {};
  function pill(red) { return red ? `<span class="label-pill pill-red">Reducing</span>` : `<span class="label-pill pill-nonred">Non-reducing</span>`; }
  function renderSugars() {
    grid.innerHTML = SUGARS.map(s => `
      <button class="sugar-card ${answered[s.id] ? answered[s.id] : ""}" data-id="${s.id}" type="button">
        <div class="name">${s.name}</div><div class="sub">${s.kind}</div>
        ${sugarIcon(s.spec, { labels: false })}
        <div class="tags">${quiz ? `<span class="label-pill pill-neutral">${sizeName[s.size]}</span>` : `<span class="label-pill pill-neutral">${sizeName[s.size]}</span>${pill(s.red)}`}</div>
      </button>`).join("");
    applyFilter();
  }
  function applyFilter() {
    $$("#sugarGrid .sugar-card").forEach(c => {
      const s = SUGARS.find(x => x.id === c.dataset.id);
      const ok = (fSize === "all" || s.size === fSize) && (quiz || fRed === "all" || (fRed === "red") === s.red);
      c.classList.toggle("dim", !ok);
    });
  }
  function showSugar(s) {
    $$("#sugarGrid .sugar-card").forEach(c => c.classList.toggle("selected", c.dataset.id === s.id));
    const big = sugarIcon(s.spec, { gap: 56, r: 16 });
    if (quiz && !answered[s.id]) {
      detail.innerHTML = `<h4>${s.name}</h4><div class="small muted">${s.kind}</div><div style="margin:10px 0">${big}</div>
        <div class="quiz-q">Reducing or non-reducing?</div>
        <div class="btn-row"><button class="btn" data-ans="1">Reducing</button><button class="btn" data-ans="0">Non-reducing</button></div>`;
      detail.querySelectorAll("[data-ans]").forEach(b => b.addEventListener("click", () => {
        const right = (b.dataset.ans === "1") === s.red;
        answered[s.id] = right ? "right" : "wrong"; score.n++; if (right) score.ok++;
        $("#sugarScore").textContent = `Score: ${score.ok} / ${score.n}`;
        renderSugars(); showSugar(s);
        detail.insertAdjacentHTML("afterbegin", `<div class="quiz-fb" style="font-weight:700;color:${right ? "var(--good)" : "var(--bad)"}">${right ? "✓ Correct" : "✗ Not quite"}</div>`);
      }));
      return;
    }
    detail.innerHTML = `<h4>${s.name}</h4><div class="small muted">${sizeName[s.size]} · ${s.kind}</div>
      <div style="margin:10px 0">${big}</div>${pill(s.red)}
      <p class="small" style="margin-top:10px"><b>Why?</b> ${s.why}</p>
      <p class="small muted"><b>Found in:</b> ${s.found}</p>`;
  }
  grid.addEventListener("click", e => { const c = e.target.closest(".sugar-card"); if (c) showSugar(SUGARS.find(x => x.id === c.dataset.id)); });
  function segHandler(id, set) {
    $(id).addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$(id + " button").forEach(x => x.classList.toggle("on", x === b)); set(b.dataset.f); applyFilter();
    });
  }
  segHandler("#sugarFilterSize", v => fSize = v);
  segHandler("#sugarFilterRed", v => fRed = v);
  $("#sugarQuiz").addEventListener("change", e => {
    quiz = e.target.checked; answered = {}; score = { n: 0, ok: 0 };
    $("#sugarScore").textContent = quiz ? "Pick a card to answer." : "";
    $("#sugarFilterRed").style.opacity = quiz ? .4 : 1;
    detail.innerHTML = `<p class="muted small">${quiz ? "Click any card to test yourself." : "Click a sugar card to see its structure, linkage and why it is (or is not) reducing."}</p>`;
    renderSugars();
  });
  renderSugars();

  /* ---------------------------------------------------------
     Haworth & Fischer generators
     --------------------------------------------------------- */
  function haworth(anomer, opts = {}) {
    const P = { C5: [75, 70], O: [145, 70], C1: [180, 105], C2: [145, 135], C3: [75, 135], C4: [40, 105] };
    const ln = (a, b, w) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--ink)" stroke-width="${w}" stroke-linecap="round"/>`;
    let s = "";
    s += ln(P.C4, P.C5, 2) + ln(P.C5, P.O, 2) + ln(P.O, P.C1, 2);
    s += ln(P.C1, P.C2, 4.5) + ln(P.C2, P.C3, 6) + ln(P.C3, P.C4, 4.5);
    s += `<circle cx="${P.O[0]}" cy="${P.O[1]}" r="10" style="fill:var(--surface)"/><text x="${P.O[0]}" y="${P.O[1] + 5}" text-anchor="middle" font-weight="700" style="fill:#e11d48">O</text>`;
    const sub = (p, up, label, hl, len = 26) => {
      const y2 = up ? p[1] - len : p[1] + len;
      const col = hl ? "var(--accent)" : "var(--ink)";
      return `<line x1="${p[0]}" y1="${p[1]}" x2="${p[0]}" y2="${y2}" style="stroke:${col}" stroke-width="2"/>` +
        `<text x="${p[0]}" y="${up ? y2 - 4 : y2 + 13}" text-anchor="middle" font-size="13" font-weight="${hl ? 700 : 500}" style="fill:${col}">${label}</text>`;
    };
    s += sub(P.C5, true, "CH₂OH", false, 24);
    s += sub(P.C4, false, "HO", false);
    s += sub(P.C3, true, "OH", false, 20);
    s += sub(P.C2, false, "OH", false);
    s += sub(P.C1, anomer === "b", "OH", true);
    const num = (p, n, dx, dy) => `<text x="${p[0] + dx}" y="${p[1] + dy}" font-size="10" style="fill:var(--ink-3)">${n}</text>`;
    s += num(P.C1, 1, 6, 4) + num(P.C2, 2, 5, -6) + num(P.C3, 3, -12, -6) + num(P.C4, 4, -14, 4) + num(P.C5, 5, -14, -4);
    if (opts.wrapG) return `<g transform="${opts.wrapG}">${s}</g>`;
    return s;
  }
  $("#haworthA").innerHTML = haworth("a");
  $("#haworthB").innerHTML = haworth("b");

  function fischer(nodes, opts = {}) {
    const cx = 110, top = 34, step = 44;
    let s = "";
    const yOf = i => top + i * step;
    nodes.forEach((n, i) => {
      if (i < nodes.length - 1) {
        const y1 = yOf(i) + (n.g ? 10 : 0), y2 = yOf(i + 1) - (nodes[i + 1].g ? 14 : 0);
        if (nodes[i + 1].dbl) s += `<line x1="${cx - 3}" y1="${y1}" x2="${cx - 3}" y2="${y2}" class="ln" stroke-width="2"/><line x1="${cx + 3}" y1="${y1}" x2="${cx + 3}" y2="${y2}" class="ln" stroke-width="2"/>`;
        else s += `<line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}" class="ln" stroke-width="2"/>`;
      }
    });
    nodes.forEach((n, i) => {
      const y = yOf(i);
      if (n.hl) s += `<rect x="${cx - 60}" y="${y - 16}" width="120" height="30" rx="8" style="fill:color-mix(in srgb, var(--warn) 18%, transparent);stroke:var(--warn)" stroke-width="1.2"/>`;
      s += `<text x="22" y="${y + 4}" font-size="10.5" style="fill:var(--ink-3)">C${n.n}</text>`;
      if (n.g) s += `<text x="${cx}" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="600">${n.g}</text>`;
      else {
        s += `<line x1="${cx - 30}" y1="${y}" x2="${cx + 30}" y2="${y}" class="ln" stroke-width="2"/>`;
        s += `<text x="${cx - 34}" y="${y + 5}" text-anchor="end" font-size="14">${n.l}</text>`;
        s += `<text x="${cx + 34}" y="${y + 5}" font-size="14" ${n.hlr ? 'font-weight="700" style="fill:var(--accent-2)"' : ""}>${n.r}</text>`;
      }
    });
    return opts.dx != null ? `<g transform="translate(${opts.dx},${opts.dy || 0})" class="fis" ${opts.attr || ""}>${s}</g>` : s;
  }
  const TAIL = [{ l: "HO", r: "H", n: 3 }, { l: "H", r: "OH", n: 4 }, { l: "H", r: "OH", n: 5, hlr: 1 }, { g: "CH₂OH", n: 6 }];
  const GLC = [{ g: "CHO", n: 1, hl: 1 }, { l: "H", r: "OH", n: 2 }, ...TAIL];
  const FRU = [{ g: "CH₂OH", n: 1 }, { g: "C=O", n: 2, hl: 1 }, ...TAIL];
  $("#fischerGlc").innerHTML = fischer(GLC);
  $("#fischerFru").innerHTML = fischer(FRU);

  /* enediol stepper */
  const GLC_E = [{ g: "CHO", n: 1, hl: 1 }, { l: "H", r: "OH", n: 2, hl: 1 }, ...TAIL];
  const ENE = [{ g: "HC–OH", n: 1, hl: 1 }, { g: "C–OH", n: 2, hl: 1, dbl: 1 }, ...TAIL];
  const FRU_E = [{ g: "CH₂OH", n: 1, hl: 1 }, { g: "C=O", n: 2, hl: 1 }, ...TAIL];
  const eneSvg = $("#enediolSvg");
  eneSvg.innerHTML = fischer(GLC_E, { dx: 0, attr: 'data-s="0"' }) + fischer(ENE, { dx: 215, attr: 'data-s="1"' }) + fischer(FRU_E, { dx: 430, attr: 'data-s="2"' }) +
    `<g data-s="1" class="fis"><text x="212" y="80" text-anchor="middle" font-size="22" style="fill:var(--accent)">⇌</text><text x="212" y="100" text-anchor="middle" font-size="11" style="fill:var(--ink-3)">OH⁻</text></g>` +
    `<g data-s="2" class="fis"><text x="427" y="80" text-anchor="middle" font-size="22" style="fill:var(--accent)">⇌</text><text x="427" y="100" text-anchor="middle" font-size="11" style="fill:var(--ink-3)">OH⁻</text></g>` +
    `<text x="110" y="316" text-anchor="middle" font-weight="700" font-size="13">D-Glucose (aldose)</text>` +
    `<text x="325" y="316" text-anchor="middle" font-weight="700" font-size="13" class="fis" data-s="1">1,2-Enediol</text>` +
    `<text x="540" y="316" text-anchor="middle" font-weight="700" font-size="13" class="fis" data-s="2">D-Fructose (ketose)</text>`;
  const ENE_TXT = [
    `<b>Start: D-glucose.</b> The H on C2 sits next to the C=O, which makes it slightly acidic.`,
    `<b>Base removes the C2–H.</b> Electrons shift to make a <b>1,2-enediol</b>: a C1=C2 double bond with an –OH on each carbon. C2 is no longer chiral.`,
    `<b>Re-protonation at C1</b> puts the C=O on C2 → <b>D-fructose</b>. (Adding H back to C2 from the other face gives D-mannose, the C2 epimer.) This is the Lobry de Bruyn–van Ekenstein transformation.${cite(1, 2)}`,
    `<b>Why it matters:</b> in hot alkaline Benedict’s or Fehling’s reagent fructose isomerises this way, so it tests positive even though it is a ketose. Cells do the same reaction with an enzyme (phosphoglucose isomerase, glycolysis).`
  ];
  let eneStep = 0;
  function renderEne() {
    eneSvg.querySelectorAll("[data-s]").forEach(g => { g.style.transition = "opacity .5s"; g.style.opacity = +g.dataset.s <= Math.min(eneStep, 2) ? 1 : 0.12; });
    $("#eneText").innerHTML = `<div class="small muted">Step ${eneStep + 1} of ${ENE_TXT.length}</div><p>${ENE_TXT[eneStep]}</p>`;
    $("#enePrev").disabled = eneStep === 0; $("#eneNext").disabled = eneStep === ENE_TXT.length - 1;
  }
  $("#eneNext").addEventListener("click", () => { eneStep = Math.min(ENE_TXT.length - 1, eneStep + 1); renderEne(); });
  $("#enePrev").addEventListener("click", () => { eneStep = Math.max(0, eneStep - 1); renderEne(); });
  renderEne();

  /* ---------------------------------------------------------
     Zoom: starch → maltose → glucose
     --------------------------------------------------------- */
  (function zoom() {
    const svg = $("#zoomSvg");
    let starch = "";
    const pts = []; for (let i = 0; i < 9; i++) pts.push([30 + i * 45, 130 + 22 * Math.sin(i * 0.8)]);
    pts.forEach((p, i) => { if (i) starch += `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${p[0]}" y2="${p[1]}" style="stroke:var(--ink-3)" stroke-width="2"/>`; });
    // α1→6 branch: a vertical link from C6 (top) of chain unit 3 up to a side chain that runs parallel to the main chain
    const bx = pts[3][0], by = 74;
    const extra = [[bx, by], [bx - 45, by], [bx - 90, by]];
    starch += `<line x1="${bx}" y1="${pts[3][1]}" x2="${bx}" y2="${by}" style="stroke:var(--ink-3)" stroke-width="2"/>`;
    starch += `<line x1="${bx}" y1="${by}" x2="${bx - 90}" y2="${by}" style="stroke:var(--ink-3)" stroke-width="2"/>`;
    [...pts, ...extra].forEach(p => { starch += `<polygon points="${poly(p[0], p[1], 14, 6, 0)}" style="fill:color-mix(in srgb, var(--glc) 22%, var(--surface));stroke:var(--glc)" stroke-width="2"/>`; });
    starch += `<circle cx="${(pts[5][0] + pts[6][0]) / 2}" cy="${(pts[5][1] + pts[6][1]) / 2}" r="44" fill="none" style="stroke:var(--warn)" stroke-width="3"/><line x1="${(pts[5][0] + pts[6][0]) / 2 + 31}" y1="${(pts[5][1] + pts[6][1]) / 2 + 31}" x2="${(pts[5][0] + pts[6][0]) / 2 + 52}" y2="${(pts[5][1] + pts[6][1]) / 2 + 52}" style="stroke:var(--warn)" stroke-width="6" stroke-linecap="round"/>`;
    starch += `<text x="210" y="24" text-anchor="middle" font-weight="700">Starch (amylopectin)</text><text x="${bx - 8}" y="${(by + pts[3][1]) / 2 + 4}" text-anchor="end" font-size="11.5" font-weight="600" style="fill:var(--ink-2)">α1→6 branch</text>`;
    let malt = `<text x="210" y="24" text-anchor="middle" font-weight="700">Maltose</text>`;
    malt += `<polygon points="${poly(140, 120, 46, 6, 0)}" style="fill:color-mix(in srgb, var(--glc) 18%, var(--surface));stroke:var(--glc)" stroke-width="3"/>`;
    malt += `<polygon points="${poly(290, 120, 46, 6, 0)}" style="fill:color-mix(in srgb, var(--glc) 18%, var(--surface));stroke:var(--glc)" stroke-width="3"/>`;
    malt += `<line x1="186" y1="120" x2="203" y2="120" class="ln" stroke-width="3"/><line x1="227" y1="120" x2="244" y2="120" class="ln" stroke-width="3"/><text x="215" y="126" text-anchor="middle" font-weight="700" style="fill:#e11d48">O</text>`;
    malt += `<text x="215" y="102" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--ink-2)">α1→4</text><circle cx="336" cy="120" r="6" style="fill:var(--bad)"/><text x="336" y="196" text-anchor="middle" font-size="11" style="fill:var(--bad)">free C1 → reducing</text>`;
    malt += `<text x="140" y="125" text-anchor="middle" style="fill:var(--glc)" font-weight="700">Glc</text><text x="290" y="125" text-anchor="middle" style="fill:var(--glc)" font-weight="700">Glc</text>`;
    const glc = `<text x="210" y="24" text-anchor="middle" font-weight="700">α-D-Glucose</text>` + haworth("a", { wrapG: "translate(90,22)" });
    svg.innerHTML = `<g class="zs" data-z="0">${starch}</g><g class="zs" data-z="1">${malt}</g><g class="zs" data-z="2">${glc}</g>`;
    const TXT = [
      `<b>Starch</b>: thousands of glucose units in α1→4 chains with α1→6 branches. Broken down by <b>amylase</b> (saliva, pancreas).`,
      `<b>Maltose</b>: two glucose units joined α1→4 — still reducing, because the right-hand glucose has a free C1. Split by <b>maltase</b> in the small intestine.`,
      `<b>Glucose</b>: absorbed into the blood. It is the molecule the body regulates — and the one every test and sensor in this module detects.`
    ];
    const set = v => {
      svg.querySelectorAll(".zs").forEach(g => {
        const z = +g.dataset.z; g.style.transition = "opacity .5s, transform .5s"; g.style.transformOrigin = "210px 120px";
        g.style.opacity = z === v ? 1 : 0; g.style.transform = z < v ? "scale(2.2)" : z > v ? "scale(.5)" : "scale(1)";
      });
      $("#zoomText").innerHTML = `<p>${TXT[v]}</p>`;
    };
    $("#zoomRange").addEventListener("input", e => set(+e.target.value));
    set(0);
  })();

  /* ---------------------------------------------------------
     3D molecule viewer
     --------------------------------------------------------- */
  const viewer = new MolViewer($("#molCanvas"), {
    onChange: (m, userDrag) => {
      if (userDrag) { $("#molAuto").checked = false; return; }
      $("#molTitle").innerHTML = `${m.title}<span>${m.sub}</span>`;
      $("#molHlNote").textContent = m.highlightNote;
    }
  });
  viewer.load("glucose-open");
  $("#molSel").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#molSel button").forEach(x => x.classList.toggle("on", x === b)); viewer.load(b.dataset.m);
  });
  $("#molAuto").addEventListener("change", e => viewer.auto = e.target.checked);
  $("#molH").addEventListener("change", e => viewer.showH = e.target.checked);
  $("#molLbl").addEventListener("change", e => viewer.labels = e.target.checked);
  $("#molSpace").addEventListener("change", e => viewer.space = e.target.checked);
  $("#molReset").addEventListener("click", () => viewer.reset());
  new IntersectionObserver(en => { viewer.visible = en[0].isIntersecting; }).observe($("#molCanvas"));

  /* ---------------------------------------------------------
     Mutarotation
     --------------------------------------------------------- */
  (function mutarotation() {
    const svg = $("#mutChart"), A = 112.2, B = 18.7, XB = 0.636, K = 0.02, TMAX = 240;
    const X0 = 46, X1 = 405, Y0 = 195, Y1 = 15;
    const sx = t => X0 + (X1 - X0) * t / TMAX, sy = v => Y0 - (Y0 - Y1) * v / 120;
    let axes = "";
    for (let v = 0; v <= 120; v += 30) axes += `<line class="grid-l" x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${X0 - 6}" y="${sy(v) + 4}" text-anchor="end">${v}°</text>`;
    for (let t = 0; t <= TMAX; t += 60) axes += `<text x="${sx(t)}" y="${Y0 + 16}" text-anchor="middle">${t}</text>`;
    axes += `<line class="axis" x1="${X0}" x2="${X1}" y1="${Y0}" y2="${Y0}"/><line class="axis" x1="${X0}" x2="${X0}" y1="${Y0}" y2="${Y1}"/>`;
    axes += `<line x1="${X0}" x2="${X1}" y1="${sy(52.7)}" y2="${sy(52.7)}" stroke-dasharray="5 4" style="stroke:var(--accent-2)" stroke-width="1.5"/><text x="${X1}" y="${sy(52.7) - 5}" text-anchor="end" style="fill:var(--accent-2)">equilibrium +52.7°</text>`;
    axes += `<text x="${(X0 + X1) / 2}" y="${Y0 + 32}" text-anchor="middle">time (min)</text><text transform="translate(12,${(Y0 + Y1) / 2}) rotate(-90)" text-anchor="middle">specific rotation [α]D</text>`;
    svg.innerHTML = axes + `<path id="mutPa" fill="none" stroke-width="2.5" style="stroke:var(--accent)"/><path id="mutPb" fill="none" stroke-width="2.5" style="stroke:var(--warn)"/><circle id="mutDot" r="5" style="fill:var(--ink)" opacity="0"/>`;
    const xb = (x0, t) => XB + (x0 - XB) * Math.exp(-K * t);
    const rot = x => A * (1 - x) + B * x;
    let raf;
    function run(start) {
      cancelAnimationFrame(raf);
      const path = svg.querySelector(start === "a" ? "#mutPa" : "#mutPb"), x0 = start === "a" ? 0 : 1;
      const dot = svg.querySelector("#mutDot"); dot.setAttribute("opacity", 1);
      const t0 = performance.now();
      const frame = now => {
        const t = Math.min(TMAX, (now - t0) / 4000 * TMAX);
        let d = ""; for (let u = 0; u <= t; u += 2) d += (u ? "L" : "M") + sx(u).toFixed(1) + "," + sy(rot(xb(x0, u))).toFixed(1);
        path.setAttribute("d", d);
        const x = xb(x0, t), r = rot(x);
        dot.setAttribute("cx", sx(t)); dot.setAttribute("cy", sy(r));
        $("#mutReadout").innerHTML = `<div class="r"><span>Time</span><b>${t.toFixed(0)} min</b></div><div class="r"><span>[α]D</span><b>+${r.toFixed(1)}°</b></div><div class="r" style="flex:1;min-width:180px"><span>Composition</span>
          <div style="display:flex;height:18px;border-radius:6px;overflow:hidden;margin-top:6px"><div style="width:${(1 - x) * 100}%;background:var(--accent)"></div><div style="width:${x * 100}%;background:var(--warn)"></div></div>
          <div class="small" style="display:flex;justify-content:space-between"><span style="color:var(--accent)">α ${((1 - x) * 100).toFixed(0)}%</span><span style="color:var(--warn)">β ${(x * 100).toFixed(0)}%</span></div></div>`;
        if (t < TMAX) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    $("#mutA").addEventListener("click", () => run("a"));
    $("#mutB").addEventListener("click", () => run("b"));
    $("#mutReadout").innerHTML = `<div class="r"><span>Tip</span><b style="font-size:.95rem">Press a button ↑</b></div>`;
  })();

  /* ---------------------------------------------------------
     Virtual lab
     --------------------------------------------------------- */
  const SAMPLES = {
    glucose: { name: "Glucose", carb: 1, red: 1, mono: 1, keto: 0, glc: 1, starch: 0 },
    fructose: { name: "Fructose", carb: 1, red: 1, mono: 1, keto: 1, glc: 0, starch: 0 },
    lactose: { name: "Lactose", carb: 1, red: 1, mono: 0, keto: 0, glc: 0, starch: 0 },
    maltose: { name: "Maltose", carb: 1, red: 1, mono: 0, keto: 0, glc: 0, starch: 0 },
    sucrose: { name: "Sucrose", carb: 1, red: 0, mono: 0, keto: 1, glc: 0, starch: 0 },
    starch: { name: "Starch", carb: 1, red: 0, mono: 0, keto: 0, glc: 0, starch: 1 },
    water: { name: "Distilled water", carb: 0, red: 0, mono: 0, keto: 0, glc: 0, starch: 0 }
  };
  const TESTS = {
    benedict: {
      name: "Benedict’s", detects: "Reducing sugars", heat: true, ref: [6],
      reagent: { liq: "#3a78d6" },
      run: s => s.red ? { st: { liq: "#d0703a", ppt: "#9c3b1f" }, pos: 1, obs: "Blue → green → orange → <b>brick-red precipitate</b> (Cu₂O)." }
        : { st: { liq: "#3a78d6" }, pos: 0, obs: "Remains <b>clear blue</b>." },
      principle: "In mildly alkaline solution (Na₂CO₃), the open-chain aldehyde reduces blue Cu²⁺ (kept dissolved as a citrate complex) to insoluble red copper(I) oxide. The sugar is oxidised to a carboxylate.",
      reagentTxt: "CuSO₄ + sodium citrate + Na₂CO₃ (one stable solution)",
      proc: "5 mL reagent + 8 drops sample; boiling water bath 3–5 min.",
      swatches: [["#3a78d6", "Negative: blue"], ["#7cab3c", "Low: green"], ["#e3c22f", "Yellow"], ["#e98a2a", "Orange"], ["#b5401f", "High: brick red"]],
      eq: [["Overall", "R–CHO + 2Cu²⁺ + 5OH⁻ <span class='arrow'>→</span> R–COO⁻ + <b>Cu₂O↓</b> + 3H₂O"], ["For glucose", "C₅H₁₁O₅–CHO <span class='arrow'>→</span> C₅H₁₁O₅–COO⁻ (gluconate)"]]
    },
    fehling: {
      name: "Fehling’s", detects: "Reducing sugars", heat: true, ref: [5],
      reagent: { liq: "#1d4ed8" },
      run: s => s.red ? { st: { liq: "#c8643a", ppt: "#9a351c" }, pos: 1, obs: "Deep blue → <b>brick-red precipitate</b> (Cu₂O)." }
        : { st: { liq: "#1d4ed8" }, pos: 0, obs: "Remains <b>deep blue</b>." },
      principle: "Same redox reaction as Benedict’s but in strongly alkaline NaOH, with tartrate holding Cu²⁺ in solution. Mixed fresh because the alkaline copper–tartrate complex is unstable on storage.",
      reagentTxt: "Fehling A (CuSO₄) + Fehling B (potassium sodium tartrate + NaOH), mixed 1:1 just before use",
      proc: "2 mL mixed reagent + 2 mL sample; boil 2–5 min.",
      swatches: [["#1d4ed8", "Negative: deep blue"], ["#b5401f", "Positive: brick red ppt"]],
      eq: [["Overall", "R–CHO + 2Cu²⁺ (tartrate) + 5OH⁻ <span class='arrow'>→</span> R–COO⁻ + <b>Cu₂O↓</b> + 3H₂O"]]
    },
    tollens: {
      name: "Tollens’", detects: "Aldehydes / reducing sugars", heat: true, ref: [7],
      reagent: { liq: "#e6ebf2", a: .45 },
      run: s => s.red ? { st: { liq: "#cfd5dd", a: .5, mirror: true }, pos: 1, obs: "A <b>silver mirror</b> coats the inside of the tube." }
        : { st: { liq: "#e6ebf2", a: .45 }, pos: 0, obs: "Stays <b>colourless</b>; no mirror." },
      principle: "Diammine-silver(I) is reduced to metallic silver, which plates onto clean glass. Ketoses such as fructose also react because the alkaline medium isomerises them.",
      reagentTxt: "AgNO₃ + NaOH, then NH₃(aq) dropwise until the brown Ag₂O just dissolves",
      proc: "2 mL reagent + 1 mL sample; warm water bath (~60 °C) 5 min.",
      safety: "Prepare fresh and discard immediately after use — stored Tollens’ reagent can form explosive silver compounds.",
      swatches: [["#e6ebf2", "Negative: colourless"], ["linear-gradient(90deg,#6b7280,#f3f4f6,#9ca3af,#e5e7eb,#4b5563)", "Positive: silver mirror"]],
      eq: [["Reagent", "Ag⁺ + 2NH₃ <span class='arrow'>→</span> [Ag(NH₃)₂]⁺"], ["Test", "R–CHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ <span class='arrow'>→</span> R–COO⁻ + <b>2Ag↓</b> + 4NH₃ + 2H₂O"]]
    },
    barfoed: {
      name: "Barfoed’s", detects: "Monosaccharides vs. disaccharides", heat: true, ref: [8],
      reagent: { liq: "#7fb3e8" },
      run: s => s.mono ? { st: { liq: "#7fb3e8", ppt: "#a8401f", pptSize: .5 }, pos: 1, obs: "<b>Thin brick-red precipitate</b> at the bottom within 2 min." }
        : s.red ? { st: { liq: "#7fb3e8" }, pos: 0, obs: "<b>No precipitate in 2 min.</b> (A little may appear after ~10 min as the disaccharide slowly hydrolyses.)" }
          : { st: { liq: "#7fb3e8" }, pos: 0, obs: "Remains <b>blue</b>; no precipitate." },
      principle: "Copper(II) acetate in dilute acetic acid. In acid, Cu²⁺ is a weaker oxidant, so only strong reducers — monosaccharides — reduce it quickly. Timing is the key variable.",
      reagentTxt: "Copper(II) acetate in ~1% acetic acid",
      proc: "2 mL reagent + 1 mL sample; boiling water bath, observe at 2–3 min.",
      swatches: [["#7fb3e8", "Negative: blue"], ["#a8401f", "Positive: red ppt (≤2 min)"]],
      eq: [["Acidic medium", "R–CHO + 2Cu²⁺ + 2H₂O <span class='arrow'>→</span> R–COOH + <b>Cu₂O↓</b> + 4H⁺"]]
    },
    seliwanoff: {
      name: "Seliwanoff’s", detects: "Ketoses vs. aldoses", heat: true, ref: [9],
      reagent: { liq: "#f4efe6", a: .6 },
      run: s => s.keto ? { st: { liq: "#c2185b" }, pos: 1, obs: s.mono ? "<b>Cherry-red</b> colour within ~1 min." : "<b>Cherry-red</b> colour: hot HCl hydrolyses sucrose, releasing fructose." }
        : s.red ? { st: { liq: "#f6e3e8", a: .7 }, pos: 0, obs: "<b>No colour in 1 min.</b> Faint pink only after prolonged heating (aldoses dehydrate slowly)." }
          : { st: { liq: "#f4efe6", a: .6 }, pos: 0, obs: "<b>No colour change.</b>" },
      principle: "Hot HCl dehydrates ketohexoses to 5-hydroxymethylfurfural (HMF) much faster than aldohexoses. HMF condenses with resorcinol to a red product.",
      reagentTxt: "Resorcinol in 3–6 M HCl",
      proc: "3 mL reagent + 1 mL sample; boiling water bath, observe at 1 min.",
      swatches: [["#f4efe6", "Negative: colourless"], ["#f6e3e8", "Aldose (slow): faint pink"], ["#c2185b", "Ketose: cherry red"]],
      eq: [["Dehydration (fast for ketoses)", "C₆H₁₂O₆ <span class='arrow'>—HCl, Δ, −3H₂O→</span> 5-hydroxymethylfurfural"], ["Condensation", "HMF + resorcinol <span class='arrow'>→</span> cherry-red product"]]
    },
    molisch: {
      name: "Molisch’s", detects: "Any carbohydrate", heat: false, ref: [10],
      reagent: { liq: "#efe6d6", lower: "#d6d3cf" },
      run: s => s.carb ? { st: { liq: "#efe6d6", lower: "#d6d3cf", ring: "#6b21a8" }, pos: 1, obs: "<b>Purple ring</b> at the junction of the two layers." }
        : { st: { liq: "#efe6d6", lower: "#d6d3cf" }, pos: 0, obs: "<b>No ring.</b>" },
      principle: "Concentrated H₂SO₄ hydrolyses glycosidic bonds and dehydrates the sugars to furfural (pentoses) or HMF (hexoses), which condense with α-naphthol to a purple dye at the acid/water interface.",
      reagentTxt: "α-Naphthol in ethanol; then concentrated H₂SO₄ poured gently down the side",
      proc: "2 mL sample + 2 drops reagent; tilt and layer 2 mL conc. H₂SO₄ underneath. No heating.",
      safety: "Concentrated sulfuric acid: goggles and gloves; add acid slowly.",
      swatches: [["#efe6d6", "Negative: no ring"], ["#6b21a8", "Positive: purple ring"]],
      eq: [["Dehydration", "hexose <span class='arrow'>—conc. H₂SO₄, −3H₂O→</span> HMF; pentose → furfural"], ["Condensation", "HMF + 2 α-naphthol <span class='arrow'>→</span> purple product"]]
    },
    iodine: {
      name: "Iodine", detects: "Starch (polysaccharides)", heat: false, ref: [1],
      reagent: { liq: "#c98f2e" },
      run: s => s.starch ? { st: { liq: "#1e1b4b" }, pos: 1, obs: "<b>Blue-black</b> colour." }
        : { st: { liq: "#c98f2e" }, pos: 0, obs: "Stays <b>yellow-brown</b> (colour of iodine)." },
      principle: "Polyiodide ions (I₃⁻, I₅⁻) slot inside the helical coil of amylose, forming a charge-transfer complex that absorbs strongly → blue-black. Small sugars have no helix.",
      reagentTxt: "Iodine dissolved in potassium iodide (Lugol’s solution)",
      proc: "2 mL sample + 2 drops reagent. No heating (colour fades when hot, returns on cooling).",
      swatches: [["#c98f2e", "Negative: yellow-brown"], ["#1e1b4b", "Starch: blue-black"], ["#8b3a2b", "Glycogen: red-brown"]],
      eq: [["Complex", "I₂ + I⁻ <span class='arrow'>⇌</span> I₃⁻ ; I₃⁻ + amylose helix <span class='arrow'>→</span> blue-black complex"]]
    },
    godpod: {
      name: "GOD-POD (enzymatic)", detects: "Glucose only", heat: false, ref: [11, 12],
      reagent: { liq: "#f8eef1", a: .6 },
      run: s => s.glc ? { st: { liq: "#de3f78" }, pos: 1, obs: "<b>Pink-red</b> colour develops (quinoneimine dye); intensity ∝ glucose." }
        : { st: { liq: "#f8eef1", a: .6 }, pos: 0, obs: "<b>No colour.</b> Glucose oxidase ignores other sugars." },
      principle: "Glucose oxidase (GOD) oxidises β-D-glucose and makes H₂O₂. Peroxidase (POD) then uses H₂O₂ to couple 4-aminoantipyrine and phenol into a red dye (Trinder reaction). The same chemistry runs on Clinistix strips — and the first step powers modern sensors.",
      reagentTxt: "Glucose oxidase + peroxidase + 4-aminoantipyrine + phenol in buffer (pH ~7)",
      proc: "10 µL sample + 1 mL reagent; 37 °C for 10 min; read absorbance at ~505 nm.",
      swatches: [["#f8eef1", "Negative"], ["#f3a3bd", "Low"], ["#de3f78", "High"]],
      eq: [["Step 1 (GOD)", "β-D-glucose + O₂ <span class='arrow'>→</span> D-glucono-δ-lactone + <b>H₂O₂</b> (lactone + H₂O → gluconic acid)"], ["Step 2 (POD)", "2H₂O₂ + 4-aminoantipyrine + phenol <span class='arrow'>→</span> quinoneimine dye (red) + 4H₂O"]]
    }
  };

  function tubeMarkup(id) {
    let bubbles = ""; for (let i = 0; i < 9; i++) bubbles += `<circle cx="${34 + (i * 7) % 24}" cy="250" r="${1.5 + (i % 3)}" style="animation-delay:${(i * 0.13).toFixed(2)}s"/>`;
    return `<defs><clipPath id="clip-${id}"><path d="M30,20 L30,232 A16,16 0 0 0 62,232 L62,20 Z"/></clipPath>
      <linearGradient id="mir-${id}" x1="0" x2="1"><stop offset="0" stop-color="#4b5563"/><stop offset=".3" stop-color="#f3f4f6"/><stop offset=".55" stop-color="#9ca3af"/><stop offset=".8" stop-color="#e5e7eb"/><stop offset="1" stop-color="#374151"/></linearGradient></defs>
      <g class="flame"><rect x="36" y="284" width="20" height="16" rx="2" fill="#64748b"/><path d="M46 252 C36 266 38 282 46 284 C54 282 56 266 46 252Z" fill="#3b82f6" opacity=".85"/><path d="M46 262 C41 272 42 280 46 282 C50 280 51 272 46 262Z" fill="#93c5fd"/></g>
      <g clip-path="url(#clip-${id})">
        <rect class="liq" x="28" y="120" width="36" height="140"/>
        <rect class="lower" x="28" y="180" width="36" height="80" opacity="0"/>
        <rect class="ring" x="28" y="175" width="36" height="9" opacity="0"/>
        <ellipse class="ppt" cx="46" cy="250" rx="20" ry="22" opacity="0"/>
        <rect class="mirror" x="28" y="60" width="36" height="200" fill="url(#mir-${id})" opacity="0"/>
        <g class="bubbles">${bubbles}</g>
      </g>
      <path d="M27,14 L27,232 A19,19 0 0 0 65,232 L65,14" fill="none" style="stroke:var(--ink-3)" stroke-width="2.5"/>
      <ellipse cx="46" cy="14" rx="20" ry="4" fill="none" style="stroke:var(--ink-3)" stroke-width="2"/>
      <rect x="34" y="26" width="4" height="196" rx="2" fill="#fff" opacity=".35"/>
      <circle class="drop" cx="46" cy="-6" r="4.5" opacity="0"/>`;
  }
  function applyState(svg, st, sampleColor) {
    const liq = svg.querySelector(".liq"), lower = svg.querySelector(".lower"), ring = svg.querySelector(".ring"), ppt = svg.querySelector(".ppt"), mir = svg.querySelector(".mirror");
    liq.style.fill = st.liq; liq.style.opacity = st.a != null ? st.a : .88;
    lower.style.fill = st.lower || "transparent"; lower.style.opacity = st.lower ? .9 : 0;
    ring.style.fill = st.ring || "transparent"; ring.style.opacity = st.ring ? 1 : 0;
    ppt.style.fill = st.ppt || "transparent"; ppt.style.opacity = st.ppt ? 1 : 0;
    ppt.style.transform = st.ppt ? `scaleY(${st.pptSize || 1})` : "scaleY(0)";
    mir.style.opacity = st.mirror ? .95 : 0;
    if (sampleColor) svg.querySelector(".drop").style.fill = sampleColor;
  }
  ["tubeBlank", "tubeSample", "tubeBen"].forEach(id => { $("#" + id).innerHTML = tubeMarkup(id); });

  const testSel = $("#labTest"), sampSel = $("#labSample");
  testSel.innerHTML = Object.entries(TESTS).map(([k, t]) => `<option value="${k}">${t.name} — ${t.detects}</option>`).join("");
  sampSel.innerHTML = Object.entries(SAMPLES).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("") + `<option value="mystery">❓ Mystery sample</option>`;
  const mysteryKeys = ["glucose", "fructose", "lactose", "maltose", "sucrose", "starch"];
  let mystery = mysteryKeys[Math.floor(Math.random() * mysteryKeys.length)];
  $("#mysteryGuess").innerHTML = mysteryKeys.map(k => `<option value="${k}">${SAMPLES[k].name}</option>`).join("");
  let timers = [];
  function labReset() {
    timers.forEach(clearTimeout); timers = [];
    $("#labRun").disabled = false; // a cancelled run must not leave the button disabled
    const t = TESTS[testSel.value];
    ["#tubeBlank", "#tubeSample"].forEach(id => { const s = $(id); s.classList.remove("heating", "dropping"); applyState(s, t.reagent); });
    const isM = sampSel.value === "mystery";
    $("#sampleLabel").innerHTML = isM ? "Mystery<br><span class='muted'>reagent + ?</span>" : `${SAMPLES[sampSel.value].name}<br><span class="muted">reagent + sample</span>`;
    $("#mysteryBox").hidden = !isM;
    $("#labResult").innerHTML = `<span class="muted">${t.name} test · reagent: ${t.reagentTxt}. ${t.heat ? "Requires heating." : "No heating."} Press <b>Run test</b>.</span>`;
  }
  function labRun() {
    labReset();
    const tk = testSel.value, t = TESTS[tk], sk = sampSel.value === "mystery" ? mystery : sampSel.value, s = SAMPLES[sk];
    const out = t.run(s), tube = $("#tubeSample"), blank = $("#tubeBlank");
    $("#labRun").disabled = true;
    tube.classList.add("dropping");
    $("#labResult").innerHTML = `<span class="muted">Adding sample${t.heat ? " and heating…" : "…"}</span>`;
    const heatT = t.heat ? 1900 : 500;
    timers.push(setTimeout(() => { if (t.heat) { tube.classList.add("heating"); blank.classList.add("heating"); } }, 600));
    timers.push(setTimeout(() => { applyState(tube, out.st); }, 600 + heatT));
    timers.push(setTimeout(() => {
      tube.classList.remove("heating"); blank.classList.remove("heating"); $("#labRun").disabled = false;
      const who = sampSel.value === "mystery" ? "Mystery sample" : s.name;
      $("#labResult").innerHTML = `<div class="verdict ${out.pos ? "pos" : "neg"}">${out.pos ? "Positive" : "Negative"} — ${t.name} test · ${who}</div>
        <div>${out.obs}</div><div class="small muted" style="margin-top:4px">This test detects: ${t.detects}. <a href="#testTabs" data-goto="${tk}">See the chemistry ↓</a></div>`;
    }, 600 + heatT + 1500));
  }
  testSel.addEventListener("change", () => { labReset(); GM.showTab("test", testSel.value); });
  sampSel.addEventListener("change", labReset);
  $("#labRun").addEventListener("click", labRun);
  $("#labReset").addEventListener("click", labReset);
  $("#labResult").addEventListener("click", e => { const a = e.target.closest("[data-goto]"); if (a) GM.showTab("test", a.dataset.goto); });
  $("#mysteryCheck").addEventListener("click", () => {
    const g = $("#mysteryGuess").value, ok = g === mystery;
    $("#mysteryFb").innerHTML = ok ? `<b style="color:var(--good)">✓ Correct — it was ${SAMPLES[mystery].name}.</b>` : `<b style="color:var(--bad)">✗ Not ${SAMPLES[g].name}.</b> Try another test.`;
  });
  $("#mysteryNew").addEventListener("click", () => { mystery = mysteryKeys[Math.floor(Math.random() * mysteryKeys.length)]; $("#mysteryFb").textContent = "New mystery loaded."; labReset(); });

  // test detail tabs
  $("#testTabs").innerHTML = Object.entries(TESTS).map(([k, t], i) => `<button data-tab="${k}" class="${i ? "" : "on"}">${t.name}</button>`).join("");
  $("#testPanels").innerHTML = Object.entries(TESTS).map(([k, t], i) => `
    <div class="tab-panel card" data-panel="test:${k}" ${i ? "hidden" : ""}>
      <div class="grid g2">
        <div>
          <h4>${t.name} test <span class="label-pill pill-neutral" style="margin-left:6px">${t.detects}</span></h4>
          <p class="small">${t.principle}${cite(...t.ref)}</p>
          <p class="small"><b>Reagent:</b> ${t.reagentTxt}<br><b>Procedure:</b> ${t.proc}</p>
          ${t.safety ? `<div class="note">⚠ ${t.safety}</div>` : ""}
        </div>
        <div>
          <div class="eq-label" style="margin-top:0">Colour key</div>
          <div class="swatch-row">${t.swatches.map(([c, l]) => `<div class="swatch"><i style="background:${c}"></i>${l}</div>`).join("")}</div>
          ${t.eq.map(([l, e]) => `<div class="eq-label">${l}</div><div class="eq">${e}</div>`).join("")}
        </div>
      </div>
    </div>`).join("");

  // results matrix
  (function () {
    const sk = Object.keys(SAMPLES);
    let h = `<table><thead><tr><th>Test</th>${sk.map(k => `<th style="text-align:center">${SAMPLES[k].name.replace("Distilled ", "")}</th>`).join("")}</tr></thead><tbody>`;
    Object.entries(TESTS).forEach(([k, t]) => {
      h += `<tr><th>${t.name}</th>` + sk.map(s => {
        const o = t.run(SAMPLES[s]); const c = o.st.ring || o.st.ppt || (o.st.mirror ? "#9ca3af" : o.st.liq);
        return o.pos ? `<td class="pos"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:4px"></i>+</td>` : `<td class="neg">–</td>`;
      }).join("") + "</tr>";
    });
    $("#resultsMatrix").innerHTML = h + "</tbody></table>";
  })();
  labReset();

  // Benedict semi-quantitative
  (function () {
    const stops = [[0, [58, 120, 214]], [0.3, [79, 154, 138]], [0.75, [124, 171, 60]], [1.25, [227, 194, 47]], [1.75, [233, 138, 42]], [2.2, [181, 64, 31]]];
    const col = c => {
      for (let i = 1; i < stops.length; i++) if (c <= stops[i][0]) {
        const [a, ca] = stops[i - 1], [b, cb] = stops[i], f = (c - a) / (b - a);
        return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * f)).join(",")})`;
      }
      return "rgb(181,64,31)";
    };
    const grade = c => c < 0.1 ? ["Nil", "Blue"] : c < 0.5 ? ["Trace", "Green (no ppt)"] : c < 1 ? ["+", "Green ppt"] : c < 1.5 ? ["++", "Yellow"] : c < 2 ? ["+++", "Orange"] : ["++++", "Brick red"];
    const upd = () => {
      const c = +$("#benRange").value, k = col(c), g = grade(c);
      applyState($("#tubeBen"), { liq: k, ppt: c >= 0.5 ? k : null, pptSize: Math.min(1, 0.25 + (c - 0.5) / 2) });
      $("#tubeBen .ppt").style.filter = "brightness(.75)";
      $("#benVal").textContent = c.toFixed(2) + " g/dL"; $("#benGrade").textContent = g[0]; $("#benColor").textContent = g[1];
    };
    $("#benRange").addEventListener("input", upd); upd();
  })();

  /* ---------------------------------------------------------
     Timeline
     --------------------------------------------------------- */
  const ERAS = {
    obs: { name: "Observation", c: "#d97706" }, wet: { name: "Wet chemistry", c: "#9333ea" }, strip: { name: "Tablets & strips", c: "#e11d48" },
    meter: { name: "Meters & electrodes", c: "#2563c9" }, cgm: { name: "Continuous monitoring", c: "#0f9d8a" }, future: { name: "Emerging", c: "#64748b" }
  };
  const ICON = {
    obs: `<path d="M70 14 C50 44 40 60 40 74 a30 30 0 0 0 60 0 C100 60 90 44 70 14Z" fill="#fbbf24" stroke="#b45309" stroke-width="3"/><path d="M56 70 a14 14 0 0 0 10 16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`,
    wet: `<path d="M56 10 V82 a14 14 0 0 0 28 0 V10" fill="none" stroke="#64748b" stroke-width="3"/><rect x="58" y="46" width="24" height="50" rx="10" fill="#b5401f"/><rect x="58" y="46" width="24" height="16" fill="#3a78d6"/><path d="M50 10 H90" stroke="#64748b" stroke-width="3"/>`,
    strip: `<rect x="24" y="44" width="92" height="22" rx="4" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/><rect x="92" y="47" width="18" height="16" rx="2" fill="#de3f78"/><rect x="30" y="52" width="50" height="6" rx="3" fill="#cbd5e1"/>`,
    meter: `<rect x="40" y="8" width="60" height="94" rx="14" fill="#1e293b"/><rect x="48" y="18" width="44" height="34" rx="4" fill="#a7f3d0"/><text x="70" y="42" text-anchor="middle" font-family="Calibri, Carlito, sans-serif" font-size="16" font-weight="700" fill="#064e3b">112</text><circle cx="58" cy="72" r="6" fill="#475569"/><circle cx="82" cy="72" r="6" fill="#475569"/><rect x="62" y="96" width="16" height="14" fill="#e2e8f0"/>`,
    cgm: `<ellipse cx="54" cy="70" rx="38" ry="14" fill="#cbd5e1"/><ellipse cx="54" cy="64" rx="34" ry="12" fill="#fff" stroke="#94a3b8"/><circle cx="54" cy="64" r="5" fill="#0f9d8a"/><rect x="92" y="18" width="34" height="62" rx="6" fill="#1e293b"/><rect x="96" y="26" width="26" height="40" rx="2" fill="#e0f2fe"/><path d="M99 52 l6-8 5 5 8-12" stroke="#0f9d8a" stroke-width="2.5" fill="none"/><path d="M76 40 q8 -8 16 0" stroke="#0f9d8a" stroke-width="2.5" fill="none"/>`,
    future: `<circle cx="70" cy="55" r="30" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6 5"/><path d="M70 30 l5 17 17 5 -17 5 -5 17 -5 -17 -17 -5 17 -5z" fill="#64748b"/>`
  };
  const TL = [
    ["c. 500 BCE", "obs", "“Honey urine”", "Indian physicians (Sushruta, later Charaka) describe <i>madhumeha</i> — sweet urine that attracts ants.", [13]],
    ["1674", "obs", "Sweet as honey", "Thomas Willis notes that diabetic urine tastes remarkably sweet: tasting was the first glucose test.", [13]],
    ["1776", "obs", "Sugar is the cause", "Matthew Dobson evaporates diabetic urine and recovers a sugary residue; serum also tastes sweet — the first hint of high blood sugar.", [13]],
    ["1841", "wet", "Trommer’s test", "Copper(II) in alkali turns red with sugar in urine — the first copper reduction test.", [14]],
    ["1849", "wet", "Fehling’s solution", "Tartrate-stabilised Cu²⁺ makes the copper test quantitative by titration.", [5]],
    ["1909", "wet", "Benedict’s reagent", "Citrate/carbonate version: stable, milder, and semi-quantitative by colour. Used for urine testing for ~50 years.", [6]],
    ["1945", "strip", "Clinitest tablet", "Benedict’s chemistry in a self-heating tablet (NaOH generates the heat). Home urine testing becomes practical.", [14]],
    ["1956", "strip", "Clinistix", "First enzyme dip-strip: glucose oxidase + peroxidase + dye. Specific for glucose.", [12]],
    ["1962", "meter", "Enzyme electrode idea", "Leland Clark proposes trapping glucose oxidase on an oxygen electrode — the birth of the biosensor.", [16]],
    ["1965", "strip", "Dextrostix", "First strip for blood glucose; the colour was compared with a chart by eye.", [14]],
    ["1967", "meter", "First enzyme electrode", "Updike &amp; Hicks immobilise glucose oxidase in a gel on an O₂ electrode and coin the term “enzyme electrode”.", [17]],
    ["1970", "meter", "Reflectance meter", "The Ames Reflectance Meter reads Dextrostix colour with a light source and photocell — the first glucose meter.", [14]],
    ["1975", "meter", "Lab glucose analyser", "Yellow Springs Instrument launches the first commercial analyser based on Clark’s enzyme electrode.", [14, 15]],
    ["1984–87", "meter", "Mediators &amp; pen meters", "Ferrocene mediators (1984) enable the MediSense ExacTech (1987), the first electrochemical home meter.", [18, 14]],
    ["1999", "cgm", "First CGM", "MiniMed CGMS: a 3-day sensor whose data are downloaded later by the clinician (no live display).", [19]],
    ["2001", "cgm", "GlucoWatch", "A wrist device that drew fluid through skin by reverse iontophoresis; skin irritation limited use.", [19]],
    ["2006", "cgm", "Real-time CGM", "Dexcom STS shows live readings and alarms.", [19]],
    ["2014–17", "cgm", "Factory-calibrated CGM", "FreeStyle Libre: no fingerstick calibration; 14-day sensor in Europe (2014), 10-day in the US (2017), 14-day there from 2018.", [19]],
    ["2016", "cgm", "Hybrid closed loop", "MiniMed 670G: the CGM signal automatically adjusts an insulin pump.", [19]],
    ["2018", "cgm", "No calibration; implantable", "Dexcom G6 becomes the first iCGM, with no fingerstick calibration; Eversense is the first implanted, fluorescence-based CGM.", [19]],
    ["2022", "cgm", "Smaller, phone-direct", "Dexcom G7 and FreeStyle Libre 3: one-piece wearables that send readings straight to a smartphone.", [24]],
    ["2024", "cgm", "Over the counter", "FDA clears the first CGM sold without prescription (Dexcom Stelo); a one-year implantable (Eversense 365) follows.", [20, 24]],
    ["Next", "future", "Emerging", "Non-invasive optical sensing, microneedle patches, sweat/tear sensors, multi-analyte (glucose + ketone) sensors and fully automated insulin delivery.", [22]]
  ];
  $("#eraLegend").innerHTML = Object.values(ERAS).map(e => `<span><i style="background:${e.c}"></i>${e.name}</span>`).join("");
  $("#tlTrack").innerHTML = TL.map((e, i) => `<button class="tl-item" data-i="${i}" style="--era:${ERAS[e[1]].c}" type="button"><span class="yr">${e[0]}</span><span class="dot"></span><span class="lbl">${e[2]}</span></button>`).join("");
  function showTL(i) {
    const e = TL[i];
    $$(".tl-item").forEach(b => b.classList.toggle("on", +b.dataset.i === i));
    $("#tlDetail").innerHTML = `<div class="tl-detail"><svg viewBox="0 0 140 110" aria-hidden="true">${ICON[e[1]]}</svg>
      <div><div class="small" style="color:${ERAS[e[1]].c};font-weight:700">${e[0]} · ${ERAS[e[1]].name}</div><h4 style="margin:4px 0 6px">${e[2]}</h4><p class="small" style="margin:0">${e[3]}${cite(...e[4])}</p>
      <div class="btn-row" style="margin-top:10px"><button class="btn" data-tl="${i - 1}" ${i ? "" : "disabled"}>← Earlier</button><button class="btn" data-tl="${i + 1}" ${i < TL.length - 1 ? "" : "disabled"}>Later →</button></div></div></div>`;
  }
  $("#tlTrack").addEventListener("click", e => { const b = e.target.closest(".tl-item"); if (b) showTL(+b.dataset.i); });
  $("#tlDetail").addEventListener("click", e => {
    const b = e.target.closest("[data-tl]"); if (!b) return; const i = +b.dataset.tl; showTL(i);
    const el = $(`.tl-item[data-i="${i}"]`); el.parentElement.scrollTo({ left: el.offsetLeft - el.parentElement.clientWidth / 2 + 52, behavior: "smooth" });
  });
  showTL(5);

  /* ---------------------------------------------------------
     Quiz
     --------------------------------------------------------- */
  const QUIZ = [
    ["Which sugar is non-reducing?", ["Maltose", "Lactose", "Sucrose", "Fructose"], 2, "Sucrose’s α1↔2β bond uses both anomeric carbons, so no ring can open."],
    ["Fructose is a ketose, yet it gives a positive Benedict’s test because…", ["it contains an aldehyde at C1", "in hot alkali it isomerises via an enediol to aldoses", "Benedict’s reagent detects all carbohydrates", "it hydrolyses to glucose"], 1, "Base-catalysed enolisation (Lobry de Bruyn–van Ekenstein) converts it to glucose/mannose."],
    ["The brick-red precipitate in Benedict’s and Fehling’s tests is…", ["CuO", "Cu₂O", "Cu(OH)₂", "metallic Cu"], 1, "Cu²⁺ is reduced to Cu⁺, which precipitates as copper(I) oxide."],
    ["Which test is specific for glucose?", ["Molisch’s", "Barfoed’s", "Seliwanoff’s", "Glucose oxidase–peroxidase"], 3, "Glucose oxidase acts on β-D-glucose only; the other tests respond to classes of sugars."],
    ["α- and β-D-glucose differ in the configuration at…", ["C1", "C2", "C4", "C5"], 0, "C1 becomes the anomeric carbon when the ring forms."],
    ["Barfoed’s test separates monosaccharides from disaccharides because…", ["it uses Ag⁺", "acidic Cu²⁺ is a weaker oxidant, so only fast reducers react in 2 min", "disaccharides are not carbohydrates", "it detects ketones"], 1, "Timing matters: monosaccharides reduce acidic Cu²⁺ quickly; reducing disaccharides do so slowly."]
  ];
  $("#quiz").innerHTML = QUIZ.map((q, i) => `<div class="card"><div class="quiz-q">${i + 1}. ${q[0]}</div><div class="quiz-opts" data-q="${i}">${q[1].map((o, j) => `<button data-j="${j}" type="button">${o}</button>`).join("")}</div><div class="quiz-fb"></div></div>`).join("");
  $("#quiz").addEventListener("click", e => {
    const b = e.target.closest(".quiz-opts button"); if (!b) return;
    const box = b.parentElement, q = QUIZ[+box.dataset.q], j = +b.dataset.j;
    box.querySelectorAll("button").forEach(x => x.classList.remove("correct", "incorrect"));
    b.classList.add(j === q[2] ? "correct" : "incorrect");
    if (j !== q[2]) box.querySelectorAll("button")[q[2]].classList.add("correct");
    box.nextElementSibling.innerHTML = (j === q[2] ? "<b style='color:var(--good)'>Correct.</b> " : "<b style='color:var(--bad)'>Not quite.</b> ") + q[3];
  });
})();
