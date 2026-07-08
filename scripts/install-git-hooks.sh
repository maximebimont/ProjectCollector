#!/usr/bin/env bash
# A lancer une seule fois par clone du depot pour activer les hooks git
# versionnes dans scripts/git-hooks/ (ex: pre-push, garde-fou qualite
# SonarCloud). `.git/hooks/` n'etant pas versionne par git, on redirige
# core.hooksPath vers un dossier suivi par le depot plutot que de copier
# des fichiers a resynchroniser a chaque modification.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

chmod +x scripts/git-hooks/pre-push scripts/git-hooks/check-quality-thresholds.py

git config core.hooksPath scripts/git-hooks

echo "Hooks git installes (core.hooksPath = scripts/git-hooks)."
echo "Le hook pre-push verifie coverage/duplication/issues SonarCloud avant chaque push."
echo "Necessite SONAR_TOKEN dans .env (voir .env.example) ; sans lui, il est ignore avec un avertissement."
