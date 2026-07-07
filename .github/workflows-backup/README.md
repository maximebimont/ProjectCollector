# Historique de la pipeline

Ce dossier conserve la toute premiere version de la pipeline CI/CD, avant sa refonte en workflows reutilisables modulaires (`.github/workflows/`).

## Pourquoi ce dossier existe

Ces fichiers ne sont **pas executes** par GitHub Actions : seuls les workflows places directement dans `.github/workflows/` sont declenches automatiquement. Ce dossier `.github/workflows-backup/` est donc totalement inerte, conserve uniquement comme trace de l'evolution du projet.

Il illustre la progression suivante :

- version initiale : un `main-pipeline.yml` monolithique qui appelait directement `build-docker-image.yml` et `build-unit-tests.yml`, sans separation claire entre build, tests, SAST, secrets et scan d'images ;
- version actuelle (`.github/workflows/`) : orchestrateur unique appelant des workflows reutilisables specialises (`backend-tests.yml`, `frontend-build.yml`, `code-quality-sast.yml`, `secret-scanning.yml`, `iac-dockerfile-scan.yml`, `docker-build.yml`), avec une gestion explicite du caractere bloquant ou non de chaque scan et une separation entre scans rapides (a chaque push) et scans lourds (planifies via `backend-security.yml`).

## Ce qu'il ne faut pas faire

- Ne pas deplacer ces fichiers dans `.github/workflows/` : ils redemarreraient des jobs redondants et desynchronises par rapport a la pipeline actuelle.
- Se referer a `.github/workflows/` et a `docs/security-and-devsecops.md` pour la pipeline reellement active.
