/* Exportação para Google Slides: gera um .pptx 16:9 com gráficos nativos (editáveis) via PptxGenJS
   e orienta a importação no Google Slides. */
(function () {
  'use strict';
  const D = window.REPORT_DATA, M = window.REPORT_MODEL;
  const btn = document.getElementById('btn-pptx'), modal = document.getElementById('modal'), status = document.getElementById('pptx-status');
  if (!btn) return;

  const NAVY = '002233', CYAN = '00DBFF', TEAL = '0092AB', TEALD = '007285', INK = '212529', INK2 = '4B5561', MUTED = '7B8590', BASE = 'B7C0C7', LINE = 'E3E7EA', PLANE = 'F5F7F8', WHITE = 'FFFFFF';
  const FONT = 'Arial';
  const fmt = new Intl.NumberFormat('pt-BR'), fmt1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const n = (v) => fmt.format(Math.round(v)), f1 = (v) => fmt1.format(v);
  const txt = (s) => document.getElementById(s) ? document.getElementById(s).textContent.trim() : '';

  function build() {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 pol
    pptx.author = 'César Oliveira · TOTVS'; pptx.company = 'TOTVS'; pptx.title = 'Uso de IA na plataforma Ascenty';
    const T = D.totals, central = M.model('central'), cons = M.model('conservative');
    let count = 0;

    function base(opts) {
      const s = pptx.addSlide(); count++;
      const dark = opts && opts.dark;
      s.background = { color: dark ? NAVY : WHITE };
      if (opts && opts.title) {
        s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.38, w: 0.5, h: 0.05, fill: { color: dark ? CYAN : TEAL }, line: { color: dark ? CYAN : TEAL } });
        s.addText(opts.title, { x: 0.5, y: 0.47, w: 9, h: 0.8, fontFace: FONT, fontSize: 19, bold: true, color: dark ? WHITE : NAVY, valign: 'top' });
        if (opts.lede) s.addText(opts.lede, { x: 0.5, y: 1.3, w: 8.8, h: 0.45, fontFace: FONT, fontSize: 10.5, color: dark ? 'CCE6EE' : INK2, valign: 'top' });
      }
      s.addText(`${count}`, { x: 9.2, y: 5.25, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 9, color: dark ? '80A0AD' : MUTED, align: 'right' });
      if (!(opts && opts.cover)) s.addText('TOTVS · Plataforma Ascenty · Uso de IA', { x: 0.5, y: 5.25, w: 5, h: 0.3, fontFace: FONT, fontSize: 9, color: dark ? '80A0AD' : MUTED });
      return s;
    }
    const bullets = (s, items, o) => s.addText(items.map((t) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: true } })),
      Object.assign({ fontFace: FONT, fontSize: 12, color: INK2, valign: 'top', paraSpaceAfter: 6 }, o));
    const kpi = (s, x, y, w, value, label) => {
      s.addText(value, { x, y, w, h: 0.6, fontFace: FONT, fontSize: 30, color: NAVY, valign: 'bottom' });
      s.addText(label, { x, y: y + 0.6, w, h: 0.5, fontFace: FONT, fontSize: 10.5, color: INK2, valign: 'top' });
    };
    const chartBase = { catAxisLabelFontFace: FONT, catAxisLabelFontSize: 10, catAxisLabelColor: INK2, valAxisLabelFontFace: FONT, valAxisLabelFontSize: 9, valAxisLabelColor: MUTED,
      valGridLine: { color: LINE, style: 'solid', size: 0.5 }, catGridLine: { style: 'none' }, dataLabelFontFace: FONT, dataLabelFontSize: 9, dataLabelColor: INK, showValue: true, barGapWidthPct: 60 };

    // 1. Capa
    {
      const s = base({ dark: true, cover: true });
      s.addText('TOTVS', { x: 0.5, y: 0.4, w: 3, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: WHITE });
      s.addText('Relatório para a diretoria', { x: 0.5, y: 1.1, w: 6, h: 0.4, fontFace: FONT, fontSize: 12, color: CYAN });
      s.addText([{ text: 'Inteligência artificial como par de engenharia na ', options: { bold: false } }, { text: 'plataforma Ascenty', options: { bold: true } }],
        { x: 0.5, y: 1.5, w: 8.5, h: 1.6, fontFace: FONT, fontSize: 34, color: WHITE, valign: 'top' });
      s.addText('Comparativo de trabalho com IA e sem IA · junho a setembro de 2026', { x: 0.5, y: 3.1, w: 8.5, h: 0.5, fontFace: FONT, fontSize: 14, color: 'CCE6EE' });
      s.addChart(pptx.charts.BAR, [{ name: 'Registros', labels: D.months.map((m) => M.MONTH_PT[m.month]), values: D.months.map((m) => m.obsAsc) }],
        { x: 0.5, y: 3.6, w: 9, h: 1.5, barDir: 'col', chartColors: [CYAN], valAxisHidden: true, valGridLine: { style: 'none' }, catAxisLabelColor: 'CCE6EE', catAxisLabelFontSize: 9, catAxisLabelFontFace: FONT, showValue: false, barGapWidthPct: 30, catAxisLineShow: false, valAxisLineShow: false });
      s.addText(`César Oliveira · Engenharia de Plataforma · ${txt('gen-date') || D.generatedAt}`, { x: 0.5, y: 5.25, w: 8, h: 0.3, fontFace: FONT, fontSize: 9, color: '80A0AD' });
    }
    // 2. Sumário executivo
    {
      const s = base({ title: `Em ${f1(T.periodMonths)} meses, a IA acompanhou ${f1(T.hoursAsc)} horas de engenharia e deixou rastro em ${n(T.projectsAsc)} repositórios`, lede: 'Números medidos na memória persistente das sessões (claude-mem), escopo Ascenty/TOTVS.' });
      kpi(s, 0.5, 1.8, 2.2, f1(T.hoursAsc) + ' h', 'horas ativas de trabalho com IA (medido)');
      kpi(s, 2.8, 1.8, 2.2, n(T.obsAsc), 'registros de trabalho capturados');
      kpi(s, 5.1, 1.8, 2.2, n(T.projectsAsc), 'repositórios/serviços tocados');
      kpi(s, 7.4, 1.8, 2.2, n(T.filesModAsc), 'arquivos criados ou alterados');
      bullets(s, [
        `Estimativa central: o mesmo trabalho sem IA levaria ${f1(central.withoutAI)} h. Diferença de ${f1(central.saved)} h (${f1(central.saved / 8)} dias úteis), fator ${f1(central.factor)}×. Cenário conservador: ${f1(cons.saved)} h.`,
        `${Math.round(100 * D.types.find((t) => t.type === 'discovery').count / T.obsAsc)}% do trabalho assistido foi leitura e descoberta de código, a fase mais cara para um engenheiro em uma base de ~200 microsserviços.`,
        `Além de velocidade: ${n(T.testObs)} registros ligados a testes, ${n(T.docsObs)} a documentação/planejamento e ${n(T.securityObs)} a segurança.`,
        'Recomendação: piloto estruturado com 3 a 5 engenheiros por 90 dias, baseline medido e guardrails de revisão humana.'
      ], { x: 0.5, y: 3.1, w: 9, h: 2 });
    }
    // 3. Metodologia
    {
      const s = base({ title: 'Como medimos: dados reais das sessões, sem autoavaliação', lede: 'Fonte: base claude-mem (viewer local). Cada ação relevante da IA vira um registro com tipo, arquivos e horário.' });
      bullets(s, [
        `Base completa: ${n(T.sessions)} sessões, ${n(T.prompts)} pedidos, ${n(T.obs)} registros entre ${T.firstAsc.split('-').reverse().join('/')} e ${T.lastAsc.split('-').reverse().join('/')}.`,
        `Escopo deste relatório: ${n(T.obsAsc)} registros (${Math.round(100 * T.obsAsc / T.obs)}% da base) em ${n(T.projectsAsc)} projetos Ascenty/TOTVS. Projetos pessoais e de estudo foram excluídos.`,
        'Horas ativas: soma dos intervalos entre registros consecutivos, com teto de 30 minutos de inatividade (método usado em análises de histórico git).',
        'Horas sem IA: horas medidas × fator por tipo de trabalho, calibrado em estudos públicos (GitHub/Microsoft 2023, McKinsey 2023, Google 2024, METR 2025).',
        'Tipos de trabalho: descoberta, funcionalidade, alteração, correção, refatoração e decisão, classificados automaticamente na captura.'
      ], { x: 0.5, y: 1.8, w: 9, h: 3.2 });
    }
    // 4. Linha do tempo
    {
      const s = base({ title: 'A adoção cresceu mês a mês e atingiu o pico em agosto', lede: 'Registros de trabalho e horas ativas com IA por mês, escopo Ascenty.' });
      s.addChart(pptx.charts.BAR, [{ name: 'Registros', labels: D.months.map((m) => M.MONTH_PT[m.month]), values: D.months.map((m) => m.obsAsc) }],
        Object.assign({ x: 0.5, y: 1.8, w: 4.4, h: 3.2, barDir: 'col', chartColors: [TEAL], showTitle: true, title: 'Registros de trabalho', titleFontSize: 11, titleFontFace: FONT, titleColor: NAVY }, chartBase));
      s.addChart(pptx.charts.BAR, [{ name: 'Horas', labels: D.months.map((m) => M.MONTH_PT[m.month]), values: D.months.map((m) => m.hoursAsc) }],
        Object.assign({ x: 5.1, y: 1.8, w: 4.4, h: 3.2, barDir: 'col', chartColors: [TEAL], showTitle: true, title: 'Horas ativas com IA', titleFontSize: 11, titleFontFace: FONT, titleColor: NAVY, dataLabelFormatCode: '0.0' }, chartBase));
    }
    // 5. Tipos
    {
      const ts = M.TYPE_ORDER.map((k) => D.types.find((t) => t.type === k)).sort((a, b) => b.count - a.count);
      const s = base({ title: 'Um terço do trabalho assistido foi ler e entender código existente', lede: 'Distribuição dos registros por tipo de trabalho.' });
      s.addChart(pptx.charts.BAR, [{ name: 'Registros', labels: ts.map((t) => M.TYPE_PT[t.type]), values: ts.map((t) => t.count) }],
        Object.assign({ x: 0.5, y: 1.8, w: 5.6, h: 3.2, barDir: 'bar', chartColors: [TEAL], catAxisOrientation: 'maxMin' }, chartBase));
      bullets(s, [
        'Descoberta lidera: onboarding em repositórios desconhecidos, mapeamento de fluxos AMQP entre serviços e leitura de SDKs de fornecedores.',
        'Alterações e funcionalidades somam quase metade: a IA escreve, mas sempre depois de ler.',
        'Decisões e planejamento: planos de execução, ADRs e backlogs Jira gerados a partir do código real.'
      ], { x: 6.3, y: 1.8, w: 3.3, h: 3.2, fontSize: 11 });
    }
    // 6. Projetos
    {
      const top = D.projects.slice(0, 10);
      const s = base({ title: 'Três frentes concentram o uso: migração Fortinet, api-nemesis e Citrix DaaS', lede: 'Horas ativas com IA por projeto (10 maiores).' });
      s.addChart(pptx.charts.BAR, [{ name: 'Horas', labels: top.map((p) => p.name), values: top.map((p) => p.hours) }],
        Object.assign({ x: 0.5, y: 1.8, w: 9, h: 3.3, barDir: 'bar', chartColors: [TEAL], catAxisOrientation: 'maxMin', dataLabelFormatCode: '0.0' }, chartBase));
    }
    // 7. Comparativo
    {
      const s = base({ title: `Com IA: ${f1(central.withAI)} h. Sem IA, estimativa central: ${f1(central.withoutAI)} h`, lede: 'Horas medidas com IA versus horas estimadas sem IA, por tipo de trabalho. Fatores por tipo na tabela.' });
      s.addChart(pptx.charts.BAR, [
        { name: 'Com IA (medido)', labels: central.rows.map((r) => r.label), values: central.rows.map((r) => +r.withAI.toFixed(1)) },
        { name: 'Sem IA (estimado, cenário central)', labels: central.rows.map((r) => r.label), values: central.rows.map((r) => +r.withoutAI.toFixed(1)) }
      ], Object.assign({ x: 0.5, y: 1.85, w: 5.7, h: 3.3, barDir: 'bar', chartColors: [TEAL, BASE], catAxisOrientation: 'maxMin', showLegend: true, legendPos: 'b', legendFontFace: FONT, legendFontSize: 9, legendColor: INK2, dataLabelFormatCode: '0.0', barGapWidthPct: 40 }, chartBase));
      const rows = [[{ text: 'Cenário', options: { bold: true, color: NAVY, fill: { color: PLANE } } }, { text: 'Sem IA', options: { bold: true, color: NAVY, fill: { color: PLANE } } }, { text: 'Diferença', options: { bold: true, color: NAVY, fill: { color: PLANE } } }, { text: 'Fator', options: { bold: true, color: NAVY, fill: { color: PLANE } } }],
        ['Conservador', f1(cons.withoutAI) + ' h', f1(cons.saved) + ' h (' + f1(cons.saved / 8) + ' dias)', f1(cons.factor) + '×'],
        ['Central', f1(central.withoutAI) + ' h', f1(central.saved) + ' h (' + f1(central.saved / 8) + ' dias)', f1(central.factor) + '×']];
      s.addTable(rows, { x: 6.4, y: 1.85, w: 3.2, colW: [1.0, 0.65, 1.0, 0.55], fontFace: FONT, fontSize: 8, color: INK2, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.35, valign: 'middle' });
      s.addText('Fatores por tipo (cons./central): descoberta 2,0/3,0 · correção 1,5/2,0 · funcionalidade e refatoração 1,4/1,8 · alteração 1,3/1,6 · decisão 1,2/1,5. Referências: Peng et al. 2023 (55,8% mais rápido), McKinsey 2023 (20 a 45%), Paradis et al./Google 2024 (~21%), METR 2025 (alerta: 19% mais lento em cenário específico).',
        { x: 6.4, y: 3.1, w: 3.2, h: 2.0, fontFace: FONT, fontSize: 8, color: MUTED, valign: 'top' });
    }
    // 8. Casos
    {
      const s = base({ title: 'O que foi entregue: seis frentes com resultado verificável', lede: 'Entregas registradas na memória das sessões, com contagem de registros e horas ativas.' });
      const cases = window.REPORT_CASES || [];
      const w = 2.95, gapx = 0.1;
      cases.slice(0, 6).forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3), x = 0.5 + col * (w + gapx), y = 1.8 + row * 1.7;
        s.addShape(pptx.shapes.RECTANGLE, { x, y, w, h: 1.62, fill: { color: PLANE }, line: { color: PLANE } });
        s.addText(c.title, { x: x + 0.12, y: y + 0.05, w: w - 0.24, h: 0.3, fontFace: FONT, fontSize: 9.5, bold: true, color: NAVY, valign: 'top' });
        s.addText(c.items.slice(0, 2).map((t) => ({ text: t, options: { bullet: { indent: 8 }, breakLine: true } })), { x: x + 0.12, y: y + 0.4, w: w - 0.24, h: 0.9, fontFace: FONT, fontSize: 7.5, color: INK2, valign: 'top', paraSpaceAfter: 2 });
        s.addText(c.facts, { x: x + 0.12, y: y + 1.33, w: w - 0.24, h: 0.25, fontFace: FONT, fontSize: 7.5, color: TEALD, bold: true, valign: 'bottom' });
      });
    }
    // 9. Qualidade
    {
      const s = base({ title: 'Ganho não é só velocidade: testes, documentação e segurança entraram no fluxo', lede: 'Comparação qualitativa entre o processo tradicional e o assistido, com evidências das sessões.' });
      const H = (t) => ({ text: t, options: { bold: true, color: NAVY, fill: { color: PLANE } } });
      const rows = [[H('Dimensão'), H('Sem IA'), H('Com IA (observado)')]].concat((window.REPORT_QUAL || []).map((r) => [{ text: r[0], options: { bold: true, color: NAVY } }, r[1], { text: r[2], options: { fill: { color: 'E6F6F9' } } }]));
      s.addTable(rows, { x: 0.5, y: 1.85, w: 9, colW: [1.8, 3.4, 3.8], fontFace: FONT, fontSize: 8, color: INK2, border: { type: 'solid', color: LINE, pt: 0.5 }, valign: 'top' });
    }
    // 10. ROI
    {
      const r = M.roiInputs();
      const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
      const s = base({ title: 'Custo do trabalho com IA e sem IA para um desenvolvedor sênior CLT', lede: `Premissas: salário ${brl.format(r.salary)}/mês, encargos e benefícios ${f1(r.charges)}× (${brl.format(r.salary * r.charges)}/mês), ${n(r.hoursMonth)} h/mês, custo da hora ${brl.format(r.rate)}, fator ${f1(r.factor)}×, ferramenta ${brl.format(r.tool)}/mês, período de ${f1(T.periodMonths)} meses. Ajustáveis na versão web.` });
      kpi(s, 0.5, 1.9, 2.2, brl.format(r.costWithout), `custo do trabalho sem IA (${f1(r.hoursWithout)} h estimadas)`);
      kpi(s, 2.8, 1.9, 2.2, brl.format(r.costWith), `custo com IA (${f1(T.hoursAsc)} h medidas + ferramenta ${brl.format(r.costTool)})`);
      kpi(s, 5.1, 1.9, 2.2, brl.format(r.saving), `economia líquida (${f1(r.saved)} h, ${f1(r.saved / 8)} dias úteis)`);
      kpi(s, 7.4, 1.9, 2.2, (r.ret === null ? '—' : f1(r.ret) + '×'), 'retorno sobre o custo da ferramenta');
      bullets(s, ['As horas liberadas viram trabalho que antes não cabia na agenda: testes, documentação, planos de migração e análise de risco.',
        'A conta considera um único engenheiro e não inclui redução de retrabalho nem ganhos em onboarding de novos integrantes.',
        'Todos os parâmetros são editáveis na versão web do relatório para simulação ao vivo na reunião.'], { x: 0.5, y: 3.3, w: 9, h: 1.8, fontSize: 11 });
    }
    // 11. Limites
    {
      const s = base({ title: 'Limites desta análise e cuidados recomendados', dark: true });
      bullets(s, (window.REPORT_LIMITS || []), { x: 0.5, y: 1.5, w: 9, h: 3.6, color: 'CCE6EE', fontSize: 11.5 });
    }
    // 12. Recomendações
    {
      const s = base({ title: 'Próximos passos propostos', dark: true });
      const recs = window.REPORT_RECS || [];
      recs.forEach((r, i) => {
        const col = i % 2, row = Math.floor(i / 2), x = 0.5 + col * 4.6, y = 1.5 + row * 1.2;
        s.addText(String(i + 1), { x, y, w: 0.5, h: 0.6, fontFace: FONT, fontSize: 26, color: CYAN });
        s.addText(r.title, { x: x + 0.55, y, w: 3.9, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, color: WHITE });
        s.addText(r.body, { x: x + 0.55, y: y + 0.35, w: 3.9, h: 0.8, fontFace: FONT, fontSize: 9.5, color: 'CCE6EE', valign: 'top' });
      });
    }
    // 13. Referências
    {
      const s = base({ title: 'Referências e fonte dos dados' });
      bullets(s, (window.REPORT_REFS || []), { x: 0.5, y: 1.5, w: 9, h: 3.6, fontSize: 10 });
    }
    return pptx;
  }

  async function run() {
    if (typeof PptxGenJS === 'undefined') { status.textContent = 'Biblioteca de exportação não carregou. Verifique a conexão e recarregue a página.'; return; }
    btn.disabled = true; status.textContent = 'Gerando apresentação…';
    try {
      const pptx = build();
      await pptx.writeFile({ fileName: 'TOTVS-Ascenty-Uso-de-IA.pptx' });
      status.textContent = '';
      modal.hidden = false;
      modal.querySelector('button, a').focus();
    } catch (e) {
      console.error(e); status.textContent = 'Falha ao gerar o arquivo: ' + e.message;
    } finally { btn.disabled = false; }
  }
  btn.addEventListener('click', run);
  window.REPORT_BUILD_PPTX = build; // exposto para testes automatizados
  modal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { modal.hidden = true; }));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.hidden = true; });
})();
