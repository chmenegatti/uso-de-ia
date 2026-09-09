/* Conteúdo editorial do relatório (casos, comparação qualitativa, limites, recomendações, referências).
   Renderizado na página e reutilizado pela exportação para Google Slides. */
(function () {
  'use strict';
  window.REPORT_CASES = [
    { title: 'Migração Palo Alto para Fortinet físico', ctx: 'fortinet-migration · CLI de extração e transformação de regras', items: [
      'Extração de túneis VPN IPsec com geração de payload multiobjeto e rotas estáticas derivadas de vpn_address.',
      'Blocklist de VPNs validada contra a base de produção antes da migração.',
      'TUI interativa e documentação de ferramentas para o time operar sem depender do autor.'
    ], facts: '605 registros · 16,7 h · 169 funcionalidades · 84 arquivos', f: [['605', 'registros'], ['16,7 h', 'ativas'], ['84', 'arquivos']] },
    { title: 'api-nemesis: NAT e VPN multifornecedor', ctx: 'API central da plataforma · Gin + GORM', items: [
      'Estratégia de migração de NAT do Palo Alto para o firewall físico Fortinet, com preservação de source host em firewall virtual.',
      'Correção do erro EOF em upload para ESXi forçando HTTP/1.1 na negociação TLS.',
      'Nomenclatura sequencial de VPN Fortinet documentada e implementada.'
    ], facts: '301 registros · 10,9 h · 34 correções · 68 arquivos', f: [['301', 'registros'], ['10,9 h', 'ativas'], ['34', 'correções']] },
    { title: 'Citrix DaaS: especificação e backlog', ctx: 'Cone Norte · provisionamento de VDA', items: [
      'Especificação de provisionamento com 15 handlers do worker documentados e payload de referência.',
      'Épicos e histórias exportados em CSV pronto para importação no Jira.',
      'Questionário com o time Infra Core respondido e incorporado ao site de documentação.'
    ], facts: '383 registros · 9,6 h · 116 arquivos', f: [['383', 'registros'], ['9,6 h', 'ativas'], ['116', 'arquivos']] },
    { title: 'DHCP em NSX-T: plano de execução', ctx: 'nsxt-dhcp · IC-4784', items: [
      'Plano com 29 cards e 27,25 dias-pessoa estimados, arquitetura hexagonal e riscos mapeados, produzido em uma tarde.',
      'Decisão registrada: inserir DHCP no fim da cadeia AMQP (v1.6) para não renumerar mensagens em voo.',
      'Investigação de SNAT no Tier-1 com verificação do SDK go-nsxt sem alterações necessárias.'
    ], facts: '67 registros · 3,6 h · 27,25 dias-pessoa planejados', f: [['67', 'registros'], ['3,6 h', 'ativas'], ['29', 'cards']] },
    { title: 'Migração NSX-T para NetScaler', ctx: 'netscaler · balanceamento de carga', items: [
      'Plano de migração completo e backlog Jira com guia de implementação em nível de código.',
      'Especificação da biblioteca SDK NetScaler com quebra em cards.',
      'Template de especificação para migração da API NSX-T para VCF 9.1.'
    ], facts: '143 registros · 6,4 h · 57 arquivos', f: [['143', 'registros'], ['6,4 h', 'ativas'], ['57', 'arquivos']] },
    { title: 'Qualidade e segurança em SDKs', ctx: 'fortinet-sdk · unbound-golang · go-vrf · vmware-download', items: [
      'fortinet-sdk: 17 testes para System Zone, testes de paginação e Move(), especificação OpenAPI e plano de remediação de exposição de token.',
      'unbound-golang: 25 testes de filestore e correção de race condition no ciclo de vida do servidor gRPC.',
      'go-vrf: correção de path traversal em operações de arquivo; vmware-download: 12 testes de segurança do locator vSphere.'
    ], facts: '410 registros ligados a testes · 47 a segurança (escopo Ascenty)', f: [['410', 'testes'], ['47', 'segurança'], ['512', 'docs/planos']] }
  ];

  window.REPORT_QUAL = [
    ['Onboarding em repositório desconhecido', 'Horas lendo dezenas de arquivos para entender o padrão worker/REST e o fluxo AMQP entre serviços.', 'Mapeamento de 200 serviços e criação do CLAUDE.md da plataforma em uma sessão; padrão reaplicado em 15 repositórios.'],
    ['Consistência entre microsserviços', 'Copiar e colar entre N arquivos de configuração, com risco de divergência.', 'Mesmo padrão de create/rollback aplicado a 6 serviços da VPN Fortinet com 18 binding keys novas, JSON validado.'],
    ['Geração mecânica', 'DDL, payloads e casos de teste escritos à mão, sujeitos a erro de nomenclatura.', 'DDL de 11 tabelas via reflexão das regras do GORM; suítes de 12 a 25 testes entregues junto com o código.'],
    ['Planejamento e backlog', 'Plano e cards escritos depois de dias de levantamento.', 'Plano de 29 cards (27,25 dias-pessoa) e backlogs Jira em CSV gerados a partir do código real, em horas.'],
    ['Memória institucional', 'Conhecimento na cabeça de quem fez; perde-se na troca de pessoa.', '681 resumos de sessão com pedido, aprendizado, entregas e próximos passos, recuperáveis por busca.'],
    ['Análise de risco', 'Bloqueios descobertos na hora do deploy.', 'Bloqueios de produção apontados antes de codar (colisão de campos JSON, dependências de etcd, ordem da cadeia AMQP).'],
    ['Cobertura de testes', 'Frequentemente adiada por pressão de prazo.', 'Testes fazem parte da entrega: 410 registros ligados a testes no escopo Ascenty.']
  ];

  window.REPORT_LIMITS = [
    'Amostra de um único engenheiro sênior, que escolheu quando usar IA. Não é um experimento controlado; os ganhos podem variar por pessoa e por tipo de tarefa.',
    'As horas "sem IA" são estimadas por fatores calibrados em estudos públicos, não medidas. Por isso apresentamos dois cenários e deixamos os parâmetros editáveis.',
    'Horas ativas são um proxy calculado a partir dos horários dos registros (teto de 30 minutos de inatividade). Tendem a subestimar o tempo total de acompanhamento humano.',
    'O estudo METR (2025) mostrou desenvolvedores experientes 19% mais lentos com IA em repositórios que já dominavam. O ganho depende de onde a IA é aplicada: aqui, majoritariamente em descoberta, migração e geração mecânica.',
    'A IA não fez deploy nem validou em ambiente real. Decisões de design, revisão e publicação continuaram com o engenheiro.',
    'Governança de dados: código proprietário e configurações passam por um fornecedor externo. Política de uso, segregação de segredos e revisão de contratos são pré-requisitos para ampliar.'
  ];

  window.REPORT_RECS = [
    { title: 'Piloto estruturado de 90 dias', body: 'Três a cinco engenheiros, baseline medido antes (lead time, PRs, bugs em produção) e as mesmas métricas depois. Comparação real, não estimada.' },
    { title: 'Contexto padronizado por repositório', body: 'Estender o modelo de CLAUDE.md, já presente em 15 repositórios, para toda a plataforma. Convenções explícitas multiplicam o ganho em descoberta.' },
    { title: 'Guardrails desde o primeiro dia', body: 'Revisão humana obrigatória, testes como parte da entrega, sem deploy autônomo, política de dados e segredos fora do contexto da ferramenta.' },
    { title: 'Aplicar onde o ganho é maior', body: 'Migrações entre fornecedores, onboarding em código legado, suítes de teste, documentação e planos de execução. Evitar tarefas pequenas em código já dominado.' },
    { title: 'Medição contínua', body: 'Manter a memória persistente das sessões como fonte de auditoria e produzir este relatório trimestralmente, com o mesmo método.' }
  ];

  window.REPORT_REFS = [
    'Fonte primária: base claude-mem local (viewer em http://localhost:37777), tabelas de sessões, pedidos, registros e resumos. Extração em ' + (window.REPORT_DATA ? window.REPORT_DATA.generatedAt.split('-').reverse().join('/') : '') + '.',
    'Peng, S. et al. (2023). The Impact of AI on Developer Productivity: Evidence from GitHub Copilot. Experimento controlado: tarefa concluída 55,8% mais rápido. arXiv:2302.06590.',
    'McKinsey Digital (2023). Unleashing developer productivity with generative AI. Ganhos de 20% a 45% em tarefas de documentação, geração e refatoração.',
    'Paradis, E. et al. / Google (2024). How much does AI impact development speed? An enterprise-based randomized controlled trial. Cerca de 21% mais rápido. arXiv:2410.12944.',
    'METR (2025). Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity. Desenvolvedores experientes 19% mais lentos em repositórios familiares.',
    'DORA / Google Cloud (2024). Accelerate State of DevOps Report. Adoção de IA e efeitos em throughput e estabilidade de entrega.',
    'Identidade visual: fonte TOTVS e paleta institucional (totvs.com). Paleta de gráficos validada para daltonismo (teal #0092AB, violeta #A44DFF, âmbar #C98500).'
  ];

  /* ---------- renderização ---------- */
  const el = (id) => document.getElementById(id);
  const cases = el('cases');
  if (cases) window.REPORT_CASES.forEach((c) => {
    const a = document.createElement('article'); a.className = 'case';
    a.innerHTML = `<h3></h3><div class="ctx"></div><ul>${c.items.map(() => '<li></li>').join('')}</ul><div class="facts">${c.f.map(() => '<div><b></b><span></span></div>').join('')}</div>`;
    a.querySelector('h3').textContent = c.title; a.querySelector('.ctx').textContent = c.ctx;
    a.querySelectorAll('li').forEach((li, i) => { li.textContent = c.items[i]; });
    a.querySelectorAll('.facts div').forEach((d, i) => { d.querySelector('b').textContent = c.f[i][0]; d.querySelector('span').textContent = c.f[i][1]; });
    cases.appendChild(a);
  });
  const qual = el('qual-body');
  if (qual) window.REPORT_QUAL.forEach((r) => {
    const tr = document.createElement('tr');
    r.forEach((x, i) => { const td = document.createElement('td'); td.textContent = x; if (i === 2) td.className = 'with'; tr.appendChild(td); });
    qual.appendChild(tr);
  });
  const lim = el('limits');
  if (lim) window.REPORT_LIMITS.forEach((t, i) => {
    const d = document.createElement('div'); d.className = 'card';
    const p = document.createElement('p'); p.textContent = t; d.appendChild(p); lim.appendChild(d);
  });
  const recs = el('recs');
  if (recs) window.REPORT_RECS.forEach((r) => {
    const li = document.createElement('li'); li.innerHTML = '<h3></h3><p></p>';
    li.querySelector('h3').textContent = r.title; li.querySelector('p').textContent = r.body; recs.appendChild(li);
  });
  const refs = el('refs');
  if (refs) window.REPORT_REFS.forEach((t) => { const li = document.createElement('li'); li.textContent = t; refs.appendChild(li); });
})();
