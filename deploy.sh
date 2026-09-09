#!/usr/bin/env bash
# Publica este diretório como site do GitHub Pages.
# Uso: ./deploy.sh <repo> [public|private]
set -euo pipefail
REPO="${1:?informe o nome do repositório}"
VIS="${2:-private}"
cd "$(dirname "$0")"

if [ ! -d .git ]; then git init -q; fi
git add -A
git commit -qm "feat: relatório de uso de IA na plataforma Ascenty" || true
git branch -M main

if gh repo view "$REPO" >/dev/null 2>&1; then
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "$(gh repo view "$REPO" --json url -q .url).git"
  git push -u origin main
else
  gh repo create "$REPO" "--$VIS" --source=. --remote=origin --push
fi

OWNER_REPO="$(gh repo view "$REPO" --json nameWithOwner -q .nameWithOwner)"
# Habilita o Pages a partir da raiz da branch main (cria ou atualiza a configuração).
gh api -X POST "repos/$OWNER_REPO/pages" -f 'source[branch]=main' -f 'source[path]=/' >/dev/null 2>&1 \
  || gh api -X PUT "repos/$OWNER_REPO/pages" -f 'source[branch]=main' -f 'source[path]=/' >/dev/null 2>&1 \
  || true
echo "Pages: https://${OWNER_REPO%%/*}.github.io/${OWNER_REPO##*/}/"
