#!/bin/bash
set -e

REPO_URL="git@github.com:frochalabs/BolaoDaCopaAD.git"

# Subir Backend
echo "Subindo backend..."
cd /home/binhorocha/Desktop/copadomundoad/backend
git init
git add .
git commit -m "feat: initial commit for backend" || true
git branch -M backend
git remote add origin $REPO_URL || true
git push -u origin backend -f

# Subir Frontend
echo "Subindo frontend..."
cd /home/binhorocha/Desktop/copadomundoad/frontend
git init
git add .
git commit -m "feat: initial commit for frontend" || true
git branch -M frontend
git remote add origin $REPO_URL || true
git push -u origin frontend -f

# Subir N8N
echo "Subindo n8n..."
cd /home/binhorocha/Desktop/copadomundoad/n8n
git init
git add .
git commit -m "feat: initial commit for n8n" || true
git branch -M n8n
git remote add origin $REPO_URL || true
git push -u origin n8n -f

# Configurar branch main (vazia, apenas com README.md)
echo "Configurando branch main..."
cd /home/binhorocha/Desktop/copadomundoad
git init
git add README.md .gitignore
git commit -m "docs: create main branch with README" || true
git branch -M main
git remote add origin $REPO_URL || true
git push -u origin main -f

echo "Pronto! Todas as pastas foram enviadas para suas respectivas branches."
