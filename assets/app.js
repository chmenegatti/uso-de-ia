/* Relatório de uso de IA — lógica da página: KPIs, gráficos SVG, modelo comparativo e calculadora de ROI. */
(function () {
  'use strict';
  const D = window.REPORT_DATA;
  const fmt = new Intl.NumberFormat('pt-BR');
  const fmt1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const n = (v) => fmt.format(Math.round(v));
  const h = (v) => fmt1.format(v) + ' h';
  const pct = (v) => fmt1.format(v * 100) + '%';

  const MONTH_PT = { '2026-03': 'mar', '2026-04': 'abr', '2026-05': 'mai', '2026-06': 'jun', '2026-07': 'jul', '2026-08': 'ago', '2026-09': 'set' };
  const TYPE_PT = {
    discovery: 'Descoberta e leitura de código',
    feature: 'Novas funcionalidades',
    change: 'Alterações e ajustes',
    bugfix: 'Correção de bugs',
    refactor: 'Refatoração',
    decision: 'Decisões e planejamento'
  };
  const TYPE_ORDER = ['discovery', 'change', 'feature', 'decision', 'bugfix', 'refactor'];

  /* Multiplicadores de esforço "sem IA" por tipo de trabalho (horas sem IA = horas com IA × fator).
     Conservador: limite inferior das referências públicas. Central: faixa média observada nas mesmas
     referências, ponderada pelo tipo de tarefa (leitura de código e geração mecânica ganham mais). */
  const MULT = {
    discovery: { conservative: 2.0, central: 3.0 },
    change:    { conservative: 1.3, central: 1.6 },
    feature:   { conservative: 1.4, central: 1.8 },
    decision:  { conservative: 1.2, central: 1.5 },
    bugfix:    { conservative: 1.5, central: 2.0 },
    refactor:  { conservative: 1.4, central: 1.8 }
  };
  const PERIOD_MONTHS = 6;

  const C = { teal: '#0092AB', tealDeep: '#007285', violet: '#A44DFF', amber: '#C98500', cyan: '#00DBFF', base: '#B7C0C7', navy: '#002233' };

  /* ---------- modelo ---------- */
  const typeHoursSum = D.types.reduce((s, t) => s + t.hours, 0);
  const scale = D.totals.hoursAsc / typeHoursSum;
  function model(scenario) {
    const rows = TYPE_ORDER.map((k) => {
      const t = D.types.find((x) => x.type === k);
      const withAI = t.hours * scale;
      const mult = MULT[k][scenario];
      return { type: k, label: TYPE_PT[k], count: t.count, withAI, withoutAI: withAI * mult, mult };
    });
    const withAI = rows.reduce((s, r) => s + r.withAI, 0);
    const withoutAI = rows.reduce((s, r) => s + r.withoutAI, 0);
    return { rows, withAI, withoutAI, saved: withoutAI - withAI, factor: withoutAI / withAI, savedPct: (withoutAI - withAI) / withoutAI };
  }
  window.REPORT_MODEL = { model, MULT, TYPE_PT, MONTH_PT, TYPE_ORDER, PERIOD_MONTHS, scale };

  /* ---------- KPIs ---------- */
  const T = D.totals;
  const kpi = {
    hoursAsc: h(T.hoursAsc), obsAsc: n(T.obsAsc), projectsAsc: n(T.projectsAsc), filesModAsc: n(T.filesModAsc),
    promptsAsc: n(T.promptsAsc), sessionsAsc: n(T.sessionsAsc), daysAsc: n(T.daysAsc), tokensAscM: fmt1.format(T.tokensAsc / 1e6) + ' M',
    obsAll: n(T.obs), sessionsAll: n(T.sessions), promptsAll: n(T.prompts), daysAll: n(T.daysAll),
    ascShare: pct(T.obsAsc / T.obs), otherShare: pct(1 - T.obsAsc / T.obs),
    testObs: n(T.testObs), securityObs: n(T.securityObs), docsObs: n(T.docsObs), summariesAsc: n(T.summariesAsc),
    bugfixAsc: n(D.types.find((t) => t.type === 'bugfix').count),
    discoveryShare: pct(D.types.find((t) => t.type === 'discovery').count / T.obsAsc),
    generatedAt: new Date(D.generatedAt + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  };
  const central = model('central'), cons = model('conservative');
  kpi.savedCentral = h(central.saved); kpi.savedCons = h(cons.saved);
  kpi.factorCentral = fmt1.format(central.factor) + '×'; kpi.factorCons = fmt1.format(cons.factor) + '×';
  kpi.savedDaysCentral = fmt1.format(central.saved / 8); kpi.savedDaysCons = fmt1.format(cons.saved / 8);
  kpi.withoutCentral = h(central.withoutAI); kpi.withoutCons = h(cons.withoutAI);
  kpi.savedPctCentral = pct(central.savedPct); kpi.savedPctCons = pct(cons.savedPct);
  document.querySelectorAll('[data-kpi]').forEach((el) => { const v = kpi[el.dataset.kpi]; if (v !== undefined) el.textContent = v; });

  /* ---------- tooltip ---------- */
  const tip = document.getElementById('tip');
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.classList.add('show');
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y - r.height - 12;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top < 8) top = y + 16;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  function hideTip() { tip.classList.remove('show'); }
  function bindHover(el, html, mark) {
    const on = (e) => { if (mark) mark.style.opacity = '.75'; showTip(html, e.clientX, e.clientY); };
    el.addEventListener('mousemove', on);
    el.addEventListener('mouseenter', on);
    el.addEventListener('mouseleave', () => { if (mark) mark.style.opacity = ''; hideTip(); });
    el.addEventListener('focus', () => { const r = el.getBoundingClientRect(); if (mark) mark.style.opacity = '.75'; showTip(html, r.left + r.width / 2, r.top); });
    el.addEventListener('blur', () => { if (mark) mark.style.opacity = ''; hideTip(); });
    el.setAttribute('tabindex', '0');
  }

  /* ---------- utilitários SVG ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, attrs) {
    const t = svgEl('text', Object.assign({ x, y }, attrs || {}), parent);
    t.textContent = str; return t;
  }
  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / p;
    const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return m * p;
  }
  /* Barra com topo arredondado (4px) e base reta. */
  function roundTopPath(x, y, w, hgt, r) {
    r = Math.min(r, w / 2, hgt);
    return `M${x},${y + hgt} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + hgt} Z`;
  }
  function roundEndPath(x, y, w, hgt, r) {
    r = Math.min(r, hgt / 2, w);
    return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + hgt - r} Q${x + w},${y + hgt} ${x + w - r},${y + hgt} H${x} Z`;
  }

  /* ---------- colunas (série temporal) ---------- */
  function columns(id, opt) {
    const el = document.getElementById(id); if (!el) return;
    const W = 720, Hh = opt.height || 300, pad = { l: 46, r: 12, t: 24, b: 34 };
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': opt.aria || '' }, el);
    const iw = W - pad.l - pad.r, ih = Hh - pad.t - pad.b;
    const max = niceMax(Math.max(...opt.values) * 1.08);
    const grid = svgEl('g', { class: 'grid' }, svg), axis = svgEl('g', { class: 'axis' }, svg);
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = (max / ticks) * i, y = pad.t + ih - (v / max) * ih;
      if (i > 0) svgEl('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y }, grid);
      text(axis, pad.l - 8, y + 4, opt.tick ? opt.tick(v) : n(v), { 'text-anchor': 'end' });
    }
    svgEl('line', { class: 'base', x1: pad.l, x2: W - pad.r, y1: pad.t + ih, y2: pad.t + ih }, svg);
    const band = iw / opt.values.length, bw = Math.min(opt.barW || 36, band * 0.6);
    const maxI = opt.values.indexOf(Math.max(...opt.values));
    opt.values.forEach((v, i) => {
      const x = pad.l + band * i + (band - bw) / 2, bh = (v / max) * ih, y = pad.t + ih - bh;
      const color = opt.colors ? opt.colors[i] : (opt.color || C.teal);
      const m = svgEl('path', { class: 'mark', d: roundTopPath(x, y, bw, bh, 4), fill: color }, svg);
      text(axis, x + bw / 2, Hh - 12, opt.labels[i], { 'text-anchor': 'middle' });
      if (i === maxI || i === opt.values.length - 1 || opt.labelAll) text(svg, x + bw / 2, y - 7, opt.fmt ? opt.fmt(v) : n(v), { class: 'lbl', 'text-anchor': 'middle' });
      const hit = svgEl('rect', { class: 'hit', x: pad.l + band * i, y: pad.t, width: band, height: ih }, svg);
      bindHover(hit, opt.tip ? opt.tip(i) : `<b>${opt.labels[i]}</b><br>${opt.fmt ? opt.fmt(v) : n(v)}`, m);
    });
  }

  /* ---------- barras horizontais ---------- */
  function barsH(id, opt) {
    const el = document.getElementById(id); if (!el) return;
    const rowH = opt.rowH || 30, labelW = opt.labelW || 200, W = 720, pad = { l: labelW, r: 70, t: 8, b: 8 };
    const Hh = pad.t + pad.b + rowH * opt.values.length;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': opt.aria || '' }, el);
    const iw = W - pad.l - pad.r, max = Math.max(...opt.values) * 1.02, bh = Math.min(20, rowH - 8);
    svgEl('line', { class: 'base', x1: pad.l, x2: pad.l, y1: pad.t, y2: Hh - pad.b }, svg);
    opt.values.forEach((v, i) => {
      const y = pad.t + rowH * i + (rowH - bh) / 2, w = Math.max(2, (v / max) * iw);
      const color = opt.colors ? opt.colors[i] : (opt.color || C.teal);
      const m = svgEl('path', { class: 'mark', d: roundEndPath(pad.l, y, w, bh, 4), fill: color }, svg);
      text(svg, pad.l - 10, y + bh / 2 + 4, opt.labels[i], { 'text-anchor': 'end', fill: '#212529' });
      text(svg, pad.l + w + 8, y + bh / 2 + 4, opt.fmt ? opt.fmt(v) : n(v), { class: 'lbl' });
      const hit = svgEl('rect', { class: 'hit', x: 0, y: pad.t + rowH * i, width: W, height: rowH }, svg);
      bindHover(hit, opt.tip ? opt.tip(i) : `<b>${opt.labels[i]}</b><br>${opt.fmt ? opt.fmt(v) : n(v)}`, m);
    });
  }

  /* ---------- barras agrupadas horizontais (com IA × sem IA) ---------- */
  function grouped(id, rows, opt) {
    const el = document.getElementById(id); if (!el) return; el.innerHTML = '';
    const rowH = 54, labelW = 210, W = 720, pad = { l: labelW, r: 80, t: 10, b: 30 };
    const Hh = pad.t + pad.b + rowH * rows.length;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': opt.aria || '' }, el);
    const iw = W - pad.l - pad.r, max = niceMax(Math.max(...rows.map((r) => r.withoutAI)) * 1.05), bh = 18, gap = 2;
    const grid = svgEl('g', { class: 'grid' }, svg), axis = svgEl('g', { class: 'axis' }, svg);
    for (let i = 1; i <= 4; i++) {
      const v = (max / 4) * i, x = pad.l + (v / max) * iw;
      svgEl('line', { x1: x, x2: x, y1: pad.t, y2: Hh - pad.b }, grid);
      text(axis, x, Hh - 10, fmt1.format(v) + ' h', { 'text-anchor': 'middle' });
    }
    svgEl('line', { class: 'base', x1: pad.l, x2: pad.l, y1: pad.t, y2: Hh - pad.b }, svg);
    rows.forEach((r, i) => {
      const y0 = pad.t + rowH * i + (rowH - (bh * 2 + gap)) / 2;
      const w1 = (r.withAI / max) * iw, w2 = (r.withoutAI / max) * iw;
      const m1 = svgEl('path', { class: 'mark', d: roundEndPath(pad.l, y0, w1, bh, 4), fill: C.teal }, svg);
      const m2 = svgEl('path', { class: 'mark', d: roundEndPath(pad.l, y0 + bh + gap, w2, bh, 4), fill: C.base }, svg);
      text(svg, pad.l - 10, y0 + bh + 4, r.label, { 'text-anchor': 'end', fill: '#212529' });
      text(svg, pad.l + w1 + 8, y0 + bh / 2 + 4, h(r.withAI), { class: 'lbl' });
      text(svg, pad.l + w2 + 8, y0 + bh + gap + bh / 2 + 4, h(r.withoutAI), { class: 'lbl', fill: '#4B5561' });
      const hit = svgEl('rect', { class: 'hit', x: 0, y: pad.t + rowH * i, width: W, height: rowH }, svg);
      bindHover(hit, `<b>${r.label}</b><br>Com IA (medido): ${h(r.withAI)}<br>Sem IA (estimado): ${h(r.withoutAI)}<br>Fator: ${fmt1.format(r.mult)}× · ${n(r.count)} registros`, null);
      hit.addEventListener('mouseenter', () => { m1.style.opacity = '.75'; m2.style.opacity = '.75'; });
      hit.addEventListener('mouseleave', () => { m1.style.opacity = ''; m2.style.opacity = ''; });
    });
  }

  /* ---------- tabelas (visão acessível) ---------- */
  function table(id, head, rows, numCols) {
    const el = document.getElementById(id); if (!el) return; el.innerHTML = '';
    const t = document.createElement('table'); t.className = 'data-table compact';
    const th = document.createElement('tr');
    head.forEach((x, i) => { const c = document.createElement('th'); c.textContent = x; if (numCols.includes(i)) c.className = 'num'; th.appendChild(c); });
    t.appendChild(th);
    rows.forEach((r) => { const tr = document.createElement('tr'); r.forEach((x, i) => { const c = document.createElement('td'); c.textContent = x; if (numCols.includes(i)) c.className = 'num'; tr.appendChild(c); }); t.appendChild(tr); });
    el.appendChild(t);
  }
  document.querySelectorAll('.toggle[data-target]').forEach((b) => {
    b.addEventListener('click', () => {
      const tgt = document.getElementById(b.dataset.target);
      tgt.hidden = !tgt.hidden;
      b.textContent = tgt.hidden ? 'Ver tabela' : 'Ocultar tabela';
    });
  });

  /* ---------- capa: atividade mensal ---------- */
  (function cover() {
    const el = document.getElementById('cover-chart'); if (!el) return;
    const W = 1200, Hh = 170, months = D.months, max = Math.max(...months.map((m) => m.obsAsc));
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${Hh}`, 'aria-hidden': 'true' }, el);
    const band = W / months.length, bw = band - 14;
    months.forEach((m, i) => {
      const bh = (m.obsAsc / max) * (Hh - 56), x = band * i + 7, y = Hh - 26 - bh;
      const p = svgEl('path', { class: 'mark', d: roundTopPath(x, y, bw, bh, 6), fill: C.cyan, opacity: i === months.length - 1 ? .55 : .95 }, svg);
      text(svg, x + bw / 2, Hh - 8, MONTH_PT[m.month] + '/26', { 'text-anchor': 'middle', fill: 'rgba(255,255,255,.7)', 'font-size': 13 });
      if (m.obsAsc === max) text(svg, x + bw / 2, y - 8, n(m.obsAsc) + ' registros', { 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 600 });
      bindHover(p, `<b>${MONTH_PT[m.month]}/2026</b><br>${n(m.obsAsc)} registros de trabalho<br>${h(m.hoursAsc)} ativas com IA · ${n(m.promptsAsc)} pedidos`, p);
    });
  })();

  /* ---------- linha do tempo ---------- */
  const mLabels = D.months.map((m) => MONTH_PT[m.month]);
  columns('chart-monthly', { labels: mLabels, values: D.months.map((m) => m.obsAsc), aria: 'Registros de trabalho por mês',
    tip: (i) => { const m = D.months[i]; return `<b>${MONTH_PT[m.month]}/2026</b><br>${n(m.obsAsc)} registros · ${n(m.promptsAsc)} pedidos<br>${n(m.daysAsc)} dias com atividade`; } });
  columns('chart-hours', { labels: mLabels, values: D.months.map((m) => m.hoursAsc), fmt: h, tick: (v) => fmt1.format(v), aria: 'Horas ativas com IA por mês',
    tip: (i) => { const m = D.months[i]; return `<b>${MONTH_PT[m.month]}/2026</b><br>${h(m.hoursAsc)} ativas com IA<br>${n(m.featureAsc)} funcionalidades · ${n(m.bugfixAsc)} correções`; } });
  table('table-monthly', ['Mês', 'Registros', 'Pedidos', 'Horas ativas', 'Dias ativos', 'Funcionalidades', 'Correções'],
    D.months.map((m) => [MONTH_PT[m.month] + '/2026', n(m.obsAsc), n(m.promptsAsc), fmt1.format(m.hoursAsc), n(m.daysAsc), n(m.featureAsc), n(m.bugfixAsc)]), [1, 2, 3, 4, 5, 6]);

  /* ---------- tipos de trabalho ---------- */
  const typesSorted = TYPE_ORDER.map((k) => D.types.find((t) => t.type === k)).sort((a, b) => b.count - a.count);
  barsH('chart-types', { labels: typesSorted.map((t) => TYPE_PT[t.type]), values: typesSorted.map((t) => t.count), rowH: 40, labelW: 230, aria: 'Registros por tipo de trabalho',
    tip: (i) => { const t = typesSorted[i]; return `<b>${TYPE_PT[t.type]}</b><br>${n(t.count)} registros (${pct(t.count / T.obsAsc)})<br>${h(t.hours * scale)} ativas`; } });
  table('table-types', ['Tipo de trabalho', 'Registros', 'Participação', 'Horas ativas'],
    typesSorted.map((t) => [TYPE_PT[t.type], n(t.count), pct(t.count / T.obsAsc), fmt1.format(t.hours * scale)]), [1, 2, 3]);

  /* ---------- projetos ---------- */
  const top = D.projects.slice(0, 12);
  barsH('chart-projects', { labels: top.map((p) => p.name), values: top.map((p) => p.hours), fmt: h, rowH: 30, labelW: 190,
    colors: top.map((p, i) => (i < 3 ? C.teal : C.base)), aria: 'Horas ativas com IA por projeto',
    tip: (i) => { const p = top[i]; return `<b>${p.name}</b><br>${h(p.hours)} ativas · ${n(p.obs)} registros<br>${n(p.feature)} funcionalidades · ${n(p.bugfix)} correções · ${n(p.files)} arquivos alterados`; } });
  table('table-projects', ['Projeto', 'Horas ativas', 'Registros', 'Funcionalidades', 'Correções', 'Arquivos alterados'],
    D.projects.slice(0, 20).map((p) => [p.name, fmt1.format(p.hours), n(p.obs), n(p.feature), n(p.bugfix), n(p.files)]), [1, 2, 3, 4, 5]);

  /* ---------- comparativo ---------- */
  let scenario = 'central';
  function renderCompare() {
    const m = model(scenario);
    grouped('chart-compare', m.rows, { aria: 'Horas com IA versus horas estimadas sem IA por tipo de trabalho' });
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('cmp-with', fmt1.format(m.withAI)); set('cmp-without', fmt1.format(m.withoutAI)); set('cmp-saved', fmt1.format(m.saved));
    set('cmp-factor', fmt1.format(m.factor) + '×'); set('cmp-days', fmt1.format(m.saved / 8)); set('cmp-pct', pct(m.savedPct));
    table('table-compare', ['Tipo de trabalho', 'Registros', 'Com IA (medido)', 'Fator', 'Sem IA (estimado)', 'Diferença'],
      m.rows.map((r) => [r.label, n(r.count), fmt1.format(r.withAI), fmt1.format(r.mult) + '×', fmt1.format(r.withoutAI), fmt1.format(r.withoutAI - r.withAI)]), [1, 2, 3, 4, 5]);
    document.querySelectorAll('.scenario button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scenario === scenario)));
    const f = document.getElementById('roi-factor'); if (f && !f.dataset.touched) { f.value = m.factor.toFixed(2); renderRoi(); }
  }
  document.querySelectorAll('.scenario button').forEach((b) => b.addEventListener('click', () => { scenario = b.dataset.scenario; renderCompare(); }));

  /* ---------- ROI ---------- */
  function renderRoi() {
    const rate = +document.getElementById('roi-rate').value, factor = +document.getElementById('roi-factor').value, tool = +document.getElementById('roi-tool').value;
    const saved = T.hoursAsc * (factor - 1), value = saved * rate, cost = tool * PERIOD_MONTHS;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('roi-rate-v', fmtBRL.format(rate) + '/h'); set('roi-factor-v', fmt1.format(factor) + '×'); set('roi-tool-v', fmtBRL.format(tool) + '/mês');
    set('roi-hours', fmt1.format(saved)); set('roi-days', fmt1.format(saved / 8)); set('roi-value', fmtBRL.format(value)); set('roi-cost', fmtBRL.format(cost));
    set('roi-return', cost > 0 ? fmt1.format(value / cost) + '×' : '—');
  }
  ['roi-rate', 'roi-factor', 'roi-tool'].forEach((id) => { const e = document.getElementById(id); if (e) e.addEventListener('input', () => { if (id === 'roi-factor') e.dataset.touched = '1'; renderRoi(); }); });
  renderCompare();

  /* ---------- escopo (barra) ---------- */
  (function scopeBar() {
    const a = document.getElementById('scope-asc'), o = document.getElementById('scope-other'); if (!a) return;
    const s = T.obsAsc / T.obs; a.style.width = (s * 100) + '%'; o.style.width = ((1 - s) * 100) + '%';
  })();

  /* ---------- numeração dos slides ---------- */
  const slides = document.querySelectorAll('.slide');
  slides.forEach((s, i) => { if (i === 0) return; const num = document.createElement('div'); num.className = 'slide-no'; num.textContent = `${i + 1} / ${slides.length}`; s.appendChild(num); });

  /* ---------- exportar PDF ---------- */
  const pdf = document.getElementById('btn-pdf');
  if (pdf) pdf.addEventListener('click', () => {
    document.querySelectorAll('.table-wrap').forEach((t) => { t.hidden = true; });
    window.print();
  });
})();
