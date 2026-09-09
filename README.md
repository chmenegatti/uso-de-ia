# Relatório de uso de IA — Plataforma Ascenty (TOTVS)

Site estático (GitHub Pages) com o relatório comparativo de uso de inteligência artificial na engenharia
da plataforma Ascenty: trabalho **com IA** (medido) versus **sem IA** (estimado), junho a setembro de 2026 (recorte a partir de 01/06; base de custo: dev sênior CLT R$ 12 mil/mês).

- `index.html` — relatório completo em 13 seções (formato 16:9, uma seção por slide).
- `assets/data.js` — dataset extraído da base `claude-mem` (`~/.claude-mem/claude-mem.db`), gerado por `scripts/extract.py`.
- `assets/content.js` — casos, comparação qualitativa, limites, recomendações e referências.
- `assets/app.js` — KPIs, gráficos SVG, modelo comparativo e calculadora de ROI.
- `assets/export.js` — exportação para Google Slides (`.pptx` com gráficos nativos via PptxGenJS).
- `assets/fonts/` — fonte institucional TOTVS (Light, Regular, SemiBold, Bold).

## Exportações

- **PDF**: botão "Exportar PDF" abre a impressão do navegador; escolha *Salvar como PDF*. Cada seção vira uma página 297 × 167 mm (16:9).
- **Google Slides**: botão "Exportar para Google Slides" gera `TOTVS-Ascenty-Uso-de-IA.pptx`. No Google Slides: *Arquivo › Importar slides › Upload*.

## Rodar localmente

```bash
python3 -m http.server 8765
# abrir http://localhost:8765
```

## Atualizar os dados

```bash
python3 scripts/extract.py   # reescreve assets/data.js a partir da base claude-mem
```

## Publicar no GitHub Pages

```bash
./deploy.sh <nome-do-repositorio> [public|private]
```

O script cria o repositório no GitHub (via `gh`), envia o conteúdo para a branch `main` e habilita o Pages
servindo a partir da raiz. Repositório privado com Pages exige plano GitHub Pro/Team.

## Identidade visual

Fonte TOTVS e paleta institucional (navy `#002233`, ciano `#00DBFF`). Paleta de gráficos validada para
daltonismo: teal `#0092AB`, violeta `#A44DFF`, âmbar `#C98500`, cinza de base `#B7C0C7`.
