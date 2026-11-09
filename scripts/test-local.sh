#!/bin/bash
# Smart Invoice — Script de test et vérification d'intégrité local

echo "⚡ [Smart Invoice] Audit et vérification locale de l'application..."

REQUIRED_FILES=(
  "src/index.html"
  "src/css/styles.css"
  "src/js/app.js"
  "src/js/currencies.js"
  "src/js/payment-methods.js"
  "src/js/pdf-engine.js"
  "README.md"
  "LICENSE"
  ".gitignore"
  "docs/ARCHITECTURE.md"
  "docs/BUSINESS_MODEL.md"
  "docs/USER_GUIDE.md"
)

ALL_OK=true
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file : Présent"
  else
    echo "  ❌ $file : MANQUANT"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = true ]; then
  echo "🚀 Tous les fichiers critiques sont en place et prêts pour le déploiement !"
  exit 0
else
  echo "⚠️ Certains fichiers sont manquants."
  exit 1
fi
